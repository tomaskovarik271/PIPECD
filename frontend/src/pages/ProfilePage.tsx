import { useState, useEffect, useCallback } from 'react';
import { Box, Heading, Button, VStack, useToast, Spinner, Text, Flex, IconButton, HStack } from '@chakra-ui/react';
import { EditIcon, CloseIcon } from '@chakra-ui/icons';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import type { User } from '../generated/graphql/graphql';
import ProfileView from '../components/profile/ProfileView';
import ProfileEditForm from '../components/profile/ProfileEditForm';
// NotificationPreferences removed - using Google Calendar integration instead

// Define the query string directly for graphql-request
const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      email
      display_name
      avatar_url
    }
  }
`;

const ProfilePage: React.FC = () => {
  // console.log('[ProfilePage] Component rendering/rerendering'); // LIFECYCLE LOG
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();

  // Replace useQuery with useState and useEffect for graphql-request
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    // console.log('[ProfilePage] fetchProfile called'); // FETCH LOG
    setError(null);
    try {
      const response = await gqlClient.request<{ me: User | null }>(GET_ME_QUERY);
      setUser(response.me);
    } catch (err: unknown) {
      console.error('Error fetching profile:', err);
      let errorMessage = 'Could not load your profile data.';
      if (isGraphQLErrorWithMessage(err)) {
        errorMessage = err.response!.errors[0].message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(new Error(errorMessage)); // Store an Error object
      toast({
        title: 'Error Loading Profile',
        description: errorMessage,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial fetch of profile
  useEffect(() => {
    // console.log('[ProfilePage] useEffect for fetchProfile triggered (dependency array: [])'); // EFFECT LOG
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateSuccess = (updatedUser: User) => {
    setIsEditing(false);
    setUser(updatedUser); // Update local state with the new user data
    // If ProfileEditForm also uses graphql-request, this is fine.
    // If it were using Apollo, it might update cache, but here we manually set user.
    // console.log('Profile updated successfully in page:', updatedUser);
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  if (error && !user) { // Show error only if there's no data to potentially display
    return (
      <Box textAlign="center" py={10} px={6}>
        <Heading as="h2" size="xl" mt={6} mb={2} color="red.500">
          Error Loading Profile
        </Heading>
        <Text color={'gray.500'}>
          {error.message || 'We encountered an issue loading your profile. Please try again later.'}
        </Text>
      </Box>
    );
  }
  
  // If loading and no data yet, show global spinner. If loading but data exists (e.g. refetching), ProfileView can show its own spinner.
  if (loading && !user) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={6} maxWidth="container.md" mx="auto">
      <VStack spacing={6} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="xl">
            My Profile
          </Heading>
          
          <HStack spacing={3}>
            {user && !isEditing && (
              <IconButton
                aria-label="Edit Profile"
                icon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                variant="ghost"
              />
            )}
            {isEditing && (
               <IconButton
                aria-label="Cancel Edit"
                icon={<CloseIcon />}
                onClick={() => setIsEditing(false)}
                variant="ghost"
              />
            )}
          </HStack>
        </Flex>

        {isEditing && user ? (
          <ProfileEditForm
            user={user}
            onUpdateSuccess={handleUpdateSuccess}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <ProfileView user={user} isLoading={loading} />
            
            {/* Activity Reminder Preferences removed - using Google Calendar integration instead */}
          </>
        )}
      </VStack>
    </Box>
  );
};

export default ProfilePage; 