import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Spinner,
  Text,
  VStack,
  useDisclosure, // For create modal later
  Table, // Add Table components
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Checkbox, // Import Checkbox
  HStack, // Import HStack
  IconButton, // Import IconButton
  Tag, // Import Tag
  Flex, // Import Flex (might not be needed)
  useToast, // Import useToast
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useAppStore, Activity } from '../stores/useAppStore'; // Keep Activity type
// import ActivityListItem from '../components/activities/ActivityListItem'; // REMOVE list item import
import CreateActivityForm from '../components/activities/CreateActivityForm'; // Import the form
import EmptyState from '../components/common/EmptyState'; // Import EmptyState
import ConfirmationDialog from '../components/common/ConfirmationDialog'; // Import ConfirmationDialog
import EditActivityModal from '../components/activities/EditActivityModal'; // Import Edit Modal
import { TimeIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'; // Import icons

// --- Helper Functions (copied from ActivityListItem) ---
const formatDateTime = (isoString: string | null | undefined): string => {
  if (!isoString) return 'No due date';
  try {
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch (e) {
    console.error('Error formatting date:', isoString, e);
    return 'Invalid date';
  }
};

const getActivityTypeColor = (type: string): string => {
    switch (type?.toUpperCase()) {
        case 'TASK': return 'blue';
        case 'MEETING': return 'purple';
        case 'CALL': return 'green';
        case 'EMAIL': return 'orange';
        case 'DEADLINE': return 'red';
        default: return 'gray';
    }
}

function ActivitiesPage() {
  // Store state and actions
  const activities = useAppStore((state) => state.activities);
  const loading = useAppStore((state) => state.activitiesLoading);
  const error = useAppStore((state) => state.activitiesError);
  const fetchActivities = useAppStore((state) => state.fetchActivities);
  const userPermissions = useAppStore((state) => state.userPermissions);
  const currentUserId = useAppStore((state) => state.session?.user.id);
  const updateActivity = useAppStore((state) => state.updateActivity);
  const deleteActivity = useAppStore((state) => state.deleteActivity);
  const activitiesError = useAppStore((state) => state.activitiesError); // Get specific error

  // Modal state
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  const [activityToDeleteId, setActivityToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  // Fetch activities on component mount
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Callback for successful creation
  const handleCreateSuccess = () => {};

  // --- Handlers from ActivityListItem (adapted) ---
  const handleToggleDone = async (activityId: string, currentStatus: boolean) => {
    const success = await updateActivity(activityId, { is_done: !currentStatus });
    if (!success) {
        toast({ title: 'Failed to update activity status', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleDeleteClick = (activityId: string) => {
    setActivityToDeleteId(activityId);
    onConfirmDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!activityToDeleteId) return;
    setIsDeleting(true);
    const success = await deleteActivity(activityToDeleteId);
    setIsDeleting(false);
    onConfirmDeleteClose();
    setActivityToDeleteId(null);

    if (success) {
         toast({ title: 'Activity deleted.', status: 'success', duration: 3000, isClosable: true });
    } else {
         toast({ title: 'Error deleting activity', description: activitiesError || 'Unknown error', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleEditClick = (activity: Activity) => {
    setActivityToEdit(activity);
    onEditOpen();
  };

  const handleEditClose = () => {
    onEditClose();
    setActivityToEdit(null);
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h2" size="lg">Activities</Heading>
        <Button 
          colorScheme="blue" 
          onClick={onCreateOpen}
          isDisabled={!userPermissions?.includes('activity:create')}
        >
          Add Activity
        </Button>
      </Box>

      {loading && <Spinner size="xl" />}
      {error && <Text color="red.500">Error loading activities: {error}</Text>}

      {!loading && !error && activities.length === 0 && (
          <EmptyState 
            icon={TimeIcon}
            title="No Activities Logged"
            message="Add tasks, calls, or meetings to keep track of interactions."
            actionButtonLabel="Add Activity"
            onActionButtonClick={onCreateOpen}
            isActionButtonDisabled={!userPermissions?.includes('activity:create')}
          />
      )}
      
      {!loading && !error && activities.length > 0 && (
        <TableContainer borderWidth="1px" borderRadius="lg">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr borderBottomWidth="1px" borderColor="gray.200">
                <Th px={2} width="1%"><span style={{ visibility: 'hidden' }}>Done</span></Th> {/* Checkbox col */} 
                <Th>Subject / Type</Th>
                <Th>Due Date</Th>
                <Th>Linked To</Th>
                <Th>Notes</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {activities.map(activity => {
                // Determine linked entity for display (copied from ActivityListItem)
                const linkedEntity = activity.deal 
                  ? `Deal: ${activity.deal.name}` 
                  : activity.person 
                  ? `Person: ${activity.person.first_name || ''} ${activity.person.last_name || ''}`.trim()
                  : activity.organization
                  ? `Org: ${activity.organization.name}`
                  : '-';

                const canUpdate = userPermissions?.includes('activity:update_any') || (userPermissions?.includes('activity:update_own') && activity.user_id === currentUserId);
                const canDelete = userPermissions?.includes('activity:delete_any') || (userPermissions?.includes('activity:delete_own') && activity.user_id === currentUserId);

                return (
                  <Tr key={activity.id} bg={activity.is_done ? 'gray.50' : 'white'} opacity={activity.is_done ? 0.6 : 1}>
                    <Td px={2}>
                      <Checkbox 
                        isChecked={activity.is_done} 
                        onChange={() => handleToggleDone(activity.id, activity.is_done)} 
                        aria-label="Mark activity as done"
                        isDisabled={!canUpdate}
                      />
                    </Td>
                    <Td>
                      <HStack align="baseline">
                        <Text fontWeight="medium">{activity.subject}</Text>
                        <Tag size="sm" colorScheme={getActivityTypeColor(activity.type)}>{activity.type || '-'}</Tag>
                      </HStack>
                    </Td>
                    <Td>{formatDateTime(activity.due_date)}</Td>
                    <Td fontSize="xs">{linkedEntity}</Td>
                    <Td fontSize="xs" maxW="200px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{activity.notes || '-'}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton
                          aria-label="Edit activity"
                          icon={<EditIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(activity)}
                          isDisabled={!canUpdate}
                        />
                        <IconButton
                          aria-label="Delete activity"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(activity.id)}
                          isDisabled={!canDelete}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* Modals */} 
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Activity</ModalHeader>
          <ModalCloseButton />
          <CreateActivityForm onClose={onCreateClose} onSuccess={handleCreateSuccess} /> 
        </ModalContent>
      </Modal>

      {activityToEdit && (
        <EditActivityModal 
          isOpen={isEditOpen} 
          onClose={handleEditClose} 
          activity={activityToEdit} 
        />
      )}

      <ConfirmationDialog 
        isOpen={isConfirmDeleteDialogOpen}
        onClose={onConfirmDeleteClose}
        onConfirm={handleConfirmDelete}
        headerText="Delete Activity"
        bodyText="Are you sure you want to delete this activity? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonColorScheme="red"
        isLoading={isDeleting}
      />
    </VStack>
  );
}

export default ActivitiesPage; 