import React from 'react'; // Import React
import {
  Box,
  Text,
  HStack,
  Tag,
  IconButton,
  Checkbox,
  Flex,
  Spacer,
  useToast,
  useDisclosure, // Import useDisclosure hook
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
// import { useAppStore, Activity } from '../../stores/useAppStore'; // OLD IMPORT
import { useAppStore } from '../../stores/useAppStore'; // For userPermissions and currentUserId
import { useActivitiesStore, Activity } from '../../stores/useActivitiesStore'; // NEW IMPORT
import EditActivityModal from './EditActivityModal'; // Import the modal
import ConfirmationDialog from '../common/ConfirmationDialog'; // Import ConfirmationDialog

interface ActivityListItemProps {
  activity: Activity; // This Activity type will now come from useActivitiesStore
}

// Helper to format date/time nicely
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

// Helper to get tag color based on type
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

function ActivityListItem({ activity }: ActivityListItemProps) {
  // Select actions from the new useActivitiesStore
  const { updateActivity, deleteActivity, activitiesError } = useActivitiesStore(); 

  // Fetch permissions and user ID from useAppStore (to be refactored later with useAuthStore)
  const userPermissions = useAppStore((state) => state.userPermissions);
  const currentUserId = useAppStore((state) => state.session?.user.id);

  const toast = useToast();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [isDeletingViaDialog, setIsDeletingViaDialog] = React.useState(false);

  const handleToggleDone = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const is_done = e.target.checked;
    const success = await updateActivity(activity.id, { is_done });
    if (!success) {
        toast({ title: 'Failed to update activity status', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleDeleteClick = async () => {
    onConfirmDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    setIsDeletingViaDialog(true);
    const success = await deleteActivity(activity.id);
    setIsDeletingViaDialog(false);
    onConfirmDeleteClose();

    if (success) {
         toast({ title: 'Activity deleted.', status: 'success', duration: 3000, isClosable: true });
    } else {
         // Use activitiesError from useActivitiesStore
         toast({ title: 'Error deleting activity', description: activitiesError || 'Unknown error', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleEditClick = () => {
      onEditOpen();
  };

  // Determine linked entity for display
  const linkedEntity = activity.deal 
    ? `Deal: ${activity.deal.name}` 
    : activity.person 
    ? `Person: ${activity.person.first_name || ''} ${activity.person.last_name || ''}`.trim()
    : activity.organization
    ? `Org: ${activity.organization.name}`
    : 'No Link';

  return (
    <>
      <Flex 
          alignItems="center" 
          p={3} 
          borderWidth="1px" 
          borderRadius="md" 
          bg={activity.is_done ? 'gray.50' : 'white'}
          _hover={{ bg: activity.is_done ? 'gray.100' : 'gray.50' }}
      >
        <Checkbox 
          isChecked={activity.is_done} 
          onChange={handleToggleDone} 
          mr={4} 
          aria-label="Mark activity as done"
          isDisabled={ // New RBAC logic
            !(
              userPermissions?.includes('activity:update_any') ||
              (userPermissions?.includes('activity:update_own') && activity.user_id === currentUserId)
            )
          }
        />
        <Box flexGrow={1} opacity={activity.is_done ? 0.6 : 1}>
          <HStack mb={1}>
              <Tag size="sm" colorScheme={getActivityTypeColor(activity.type)}>{activity.type || '-'}</Tag>
              <Text fontWeight="medium">{activity.subject}</Text>
          </HStack>
          <Text fontSize="sm" color="gray.600">Due: {formatDateTime(activity.due_date)}</Text>
          <Text fontSize="xs" color="gray.500">Linked To: {linkedEntity}</Text>
          {activity.notes && <Text fontSize="xs" color="gray.500" mt={1}>Notes: {activity.notes}</Text>}
        </Box>
        <Spacer />
        <HStack spacing={1}>
          <IconButton
            aria-label="Edit activity"
            icon={<EditIcon />}
            size="sm"
            variant="ghost"
            onClick={handleEditClick}
            isDisabled={ // New RBAC logic
                !(
                  userPermissions?.includes('activity:update_any') ||
                  (userPermissions?.includes('activity:update_own') && activity.user_id === currentUserId)
                )
            }
          />
          <IconButton
            aria-label="Delete activity"
            icon={<DeleteIcon />}
            colorScheme="red"
            size="sm"
            variant="ghost"
            onClick={handleDeleteClick}
            isDisabled={ // New RBAC logic
                !(
                    userPermissions?.includes('activity:delete_any') ||
                    (userPermissions?.includes('activity:delete_own') && activity.user_id === currentUserId)
                )
            }
          />
        </HStack>
      </Flex>

      {/* Render the Edit Modal */}
      <EditActivityModal 
        isOpen={isEditOpen} 
        onClose={onEditClose} 
        activity={activity} 
      />

      {/* Confirmation Dialog for Deleting Activity */}
      <ConfirmationDialog 
        isOpen={isConfirmDeleteDialogOpen}
        onClose={onConfirmDeleteClose}
        onConfirm={handleConfirmDelete}
        headerText="Delete Activity"
        bodyText="Are you sure you want to delete this activity? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonColorScheme="red"
        isLoading={isDeletingViaDialog} // Use specific loading state for dialog
      />
    </>
  );
}

export default ActivityListItem; 