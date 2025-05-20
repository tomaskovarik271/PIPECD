import { Box, VStack, Avatar, Text, Heading, Spinner } from '@chakra-ui/react';
import type { User } from '../../generated/graphql/graphql'; // Corrected path

interface ProfileViewProps {
  user: Partial<User> | null | undefined;
  isLoading?: boolean;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, isLoading }) => {
  if (isLoading) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Spinner size="xl" />
        <Text mt={4}>Loading Profile...</Text>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Heading as="h2" size="xl" mt={6} mb={2}>
          Profile Not Found
        </Heading>
        <Text color={'gray.500'}>
          We couldn&apos;t find your profile information.
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="center" py={6}>
      <Avatar size="2xl" name={user.display_name || user.email || 'User'} src={user.avatar_url || undefined} />
      <Heading as="h1" size="xl">
        {user.display_name || 'User Profile'}
      </Heading>
      <Text fontSize="lg" color="gray.600">
        {user.email}
      </Text>
      {/* Add more profile details here if needed in the future */}
    </VStack>
  );
};

export default ProfileView; 