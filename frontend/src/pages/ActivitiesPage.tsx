import { useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Spinner,
  Text,
  VStack,
  useDisclosure, // For create modal later
  List, // Import List
  // ListItem, // No longer needed directly
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useAppStore } from '../stores/useAppStore';
import ActivityListItem from '../components/activities/ActivityListItem'; // Import the list item
import CreateActivityForm from '../components/activities/CreateActivityForm'; // Import the form

// TODO: Import CreateActivityForm/Modal when created

function ActivitiesPage() {
  // Store state and actions
  const activities = useAppStore((state) => state.activities);
  const loading = useAppStore((state) => state.activitiesLoading);
  const error = useAppStore((state) => state.activitiesError);
  const fetchActivities = useAppStore((state) => state.fetchActivities);
  // Fetch permissions
  const userPermissions = useAppStore((state) => state.userPermissions);

  // Modal state (for create form later)
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();

  // Fetch activities on component mount
  useEffect(() => {
    fetchActivities(); // Fetch all activities initially (no filter)
  }, [fetchActivities]);

  // Callback for successful creation to refresh list
  const handleCreateSuccess = () => {
    // No need to manually call fetchActivities if the createActivity action updates the store correctly
    // fetchActivities(); 
    // Optionally show a success message here if not handled by the form
  };

  // TODO: Add handlers for create, edit, delete

  return (
    <VStack spacing={4} align="stretch">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h2" size="lg">Activities</Heading>
        <Button 
          colorScheme="blue" 
          onClick={onCreateOpen}
          isDisabled={!userPermissions?.includes('activity:create')} // Add permission check
        >
          Add Activity
        </Button>
      </Box>

      {loading && <Spinner size="xl" />}
      {error && <Text color="red.500">Error loading activities: {error}</Text>}

      {!loading && !error && (
        <Box borderWidth="1px" borderRadius="lg" p={0}> {/* Remove padding from Box, add to List */}
          {activities.length === 0 ? (
            <Text p={4}>No activities found.</Text> // Add padding back here
          ) : (
            // Render List with ActivityListItem components
            <List spacing={0} p={0}> {/* Adjust spacing and padding as needed */}
              {activities.map(activity => (
                <ActivityListItem key={activity.id} activity={activity} />
              ))}
            </List>
          )}
        </Box>
      )}

      {/* Add Create Activity Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl"> {/* Optional: Adjust size */}
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Activity</ModalHeader>
          <ModalCloseButton />
          {/* Pass onClose and onSuccess */}
          <CreateActivityForm onClose={onCreateClose} onSuccess={handleCreateSuccess} /> 
        </ModalContent>
      </Modal>
    </VStack>
  );
}

export default ActivitiesPage; 