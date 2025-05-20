import React, { useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
  HStack,
  Tag,
  IconButton,
  Flex,
  useToast,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useActivitiesStore, ActivityWithDetails } from '../stores/useActivitiesStore';

const ActivityDetailPage: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const { 
    currentActivity, 
    currentActivityLoading,
    currentActivityError,
    fetchActivityById,
  } = useActivitiesStore(); 

  const toast = useToast();
  
  useEffect(() => {
    if (activityId) {
      fetchActivityById(activityId); 
    }
    // Optional: Clear currentActivity on unmount or if activityId changes
    return () => {
      // Consider if this is the desired behavior, it might cause refetch on back navigation
      // useActivitiesStore.setState({ currentActivity: null, currentActivityError: null, currentActivityLoading: false });
    };
  }, [activityId, fetchActivityById]);

  if (currentActivityLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" minHeight="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (currentActivityError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error Loading Activity</AlertTitle>
        <AlertDescription>{currentActivityError}</AlertDescription>
      </Alert>
    );
  }

  if (!currentActivity) {
    // This condition might be hit briefly even if loading is false and no error, if activity is null initially
    // Or if fetch returns null for a valid ID not found by RLS/DB query without throwing specific error
    return (
      <Alert status="info">
        <AlertIcon />
        Activity not found or you may not have permission to view it.
      </Alert>
    );
  }

  // Destructure directly from currentActivity for cleaner JSX
  const { type, subject, due_date, is_done, notes, created_at, updated_at, user, deal, person, organization } = currentActivity;

  return (
    <Box p={5}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <HStack spacing={3}>
          <IconButton
            as={RouterLink}
            to={deal?.id ? `/deals/${deal.id}` : '/deals'} // Use destructured deal
            aria-label="Back"
            icon={<ArrowBackIcon />}
            variant="outline"
          />
          <Heading size="lg">Activity: {subject || 'Details'}</Heading>
        </HStack>
        <HStack spacing={3}>
          {/* TODO: Implement Edit/Delete Modals and functionality */}
          <Button leftIcon={<EditIcon />} colorScheme="blue" variant="outline" isDisabled>Edit</Button>
          <Button leftIcon={<DeleteIcon />} colorScheme="red" variant="outline" isDisabled>Delete</Button>
        </HStack>
      </Flex>

      <VStack spacing={4} align="stretch" borderWidth="1px" borderRadius="lg" p={5} shadow="sm">
        <Heading size="md" mb={2}>Subject: {subject || 'N/A'}</Heading>
        
        <HStack>
          <Text fontWeight="bold">Status:</Text>
          <Tag colorScheme={is_done ? 'green' : 'orange'}>
            {is_done ? 'Completed' : 'Open'}
          </Tag>
        </HStack>

        <HStack>
          <Text fontWeight="bold">Type:</Text>
          <Text>{type || 'N/A'}</Text>
        </HStack>

        <HStack>
          <Text fontWeight="bold">Due Date:</Text>
          <Text>{due_date ? new Date(due_date).toLocaleDateString() : 'N/A'}</Text>
        </HStack>
        
        {notes && (
          <Box>
            <Text fontWeight="bold" mb={1}>Notes:</Text>
            <Text whiteSpace="pre-wrap" bg={useColorModeValue('gray.50', 'gray.700')} p={3} borderRadius="md">{notes}</Text>
          </Box>
        )}

        <Heading size="sm" mt={4} mb={2}>Linked Items</Heading>
        {deal?.id && deal.name &&(
          <Text><strong>Deal:</strong> <RouterLink to={`/deals/${deal.id}`}><Link colorScheme="blue">{deal.name}</Link></RouterLink></Text>
        )}
        {person?.id && (
          <Text><strong>Person:</strong> {person.first_name} {person.last_name || ''}
            {/* <RouterLink to={`/people/${person.id}`}> ... </RouterLink> */}
          </Text>
        )}
        {organization?.id && (
          <Text><strong>Organization:</strong> {organization.name}
            {/* <RouterLink to={`/organizations/${organization.id}`}> ... </RouterLink> */}
          </Text>
        )}
        {!deal?.id && !person?.id && !organization?.id && (
          <Text>No items linked to this activity.</Text>
        )}

        <Heading size="sm" mt={4} mb={2}>Other Information</Heading>
        <Text><strong>Assigned to:</strong> {user?.display_name || ''} ({user?.email || 'N/A'})</Text>
        <Text><strong>Created:</strong> {created_at ? new Date(created_at).toLocaleString() : 'N/A'}</Text>
        <Text><strong>Last Updated:</strong> {updated_at ? new Date(updated_at).toLocaleString() : 'N/A'}</Text>

      </VStack>
    </Box>
  );
};

export default ActivityDetailPage; 