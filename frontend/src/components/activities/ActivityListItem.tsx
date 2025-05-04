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
import { useAppStore, Activity } from '../../stores/useAppStore'; // Import Activity type and store
import EditActivityModal from './EditActivityModal'; // Import the modal

interface ActivityListItemProps {
  activity: Activity;
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
  // Select actions individually to prevent re-renders caused by shallow comparison
  const updateActivity = useAppStore((state) => state.updateActivity);
  const deleteActivity = useAppStore((state) => state.deleteActivity);

  const toast = useToast();
  // Add loading state if needed for async actions (mark done, delete)
  // const [isDeleting, setIsDeleting] = useState(false);
  // const [isTogglingDone, setIsTogglingDone] = useState(false);

  // State for the Edit modal
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  const handleToggleDone = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const is_done = e.target.checked;
    // setIsTogglingDone(true);
    const success = await updateActivity(activity.id, { is_done });
    // setIsTogglingDone(false);
    if (!success) {
        toast({ title: 'Failed to update activity status', status: 'error', duration: 3000, isClosable: true });
        // Revert checkbox? Needs more complex state handling or rely on fetch refresh
    }
  };

  const handleDeleteClick = async () => {
     if (window.confirm('Are you sure you want to delete this activity?')) {
        // setIsDeleting(true);
        const success = await deleteActivity(activity.id);
        // setIsDeleting(false); // No need to set false if component unmounts on success
        if (success) {
             toast({ title: 'Activity deleted.', status: 'success', duration: 3000, isClosable: true });
        } else {
             // Store handles error state, show toast
             toast({ title: 'Error deleting activity', status: 'error', duration: 3000, isClosable: true });
        }
     }
  };

  const handleEditClick = () => {
      onEditOpen(); // Open the modal
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
          // isDisabled={isTogglingDone || isDeleting} 
          aria-label="Mark activity as done"
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
            // isDisabled={isDeleting || isTogglingDone}
          />
          <IconButton
            aria-label="Delete activity"
            icon={<DeleteIcon />}
            colorScheme="red"
            size="sm"
            variant="ghost"
            onClick={handleDeleteClick}
            // isLoading={isDeleting}
            // isDisabled={isTogglingDone}
          />
        </HStack>
      </Flex>

      {/* Render the Edit Modal */}
      <EditActivityModal 
        isOpen={isEditOpen} 
        onClose={onEditClose} 
        activity={activity} 
      />
    </>
  );
}

export default ActivityListItem; 