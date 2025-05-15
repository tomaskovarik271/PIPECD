import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Spinner,
  Text,
  VStack,
  useDisclosure,
  Checkbox,
  HStack,
  IconButton,
  Tag,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Alert, AlertIcon
} from '@chakra-ui/react';
import { useAppStore } from '../stores/useAppStore';
import { useActivitiesStore, Activity } from '../stores/useActivitiesStore';
import CreateActivityForm from '../components/activities/CreateActivityForm';
import EmptyState from '../components/common/EmptyState';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import EditActivityModal from '../components/activities/EditActivityModal';
import { TimeIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import ListPageLayout from '../components/layout/ListPageLayout';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';

// --- Helper Functions (copied from ActivityListItem) ---
const formatDateTime = (isoString: string | null | undefined): string => {
  if (!isoString) return '-'; // Display hyphen for empty dates
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
  // Store state and actions from useActivitiesStore
  const {
    activities,
    activitiesLoading,
    activitiesError,
    fetchActivities,
    updateActivity,
    deleteActivity,
  } = useActivitiesStore();

  // Auth related state from useAppStore (to be refactored to useAuthStore later)
  const userPermissions = useAppStore((state) => state.userPermissions);
  const currentUserId = useAppStore((state) => state.session?.user.id);

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

  const handleCreateSuccess = () => {
    // The store should update the list, so potentially just close modal or show toast
    // fetchActivities(); // Re-fetch if optimistic updates aren't fully covering linked data or complex sorts
    onCreateClose(); // Assuming CreateActivityForm is in a modal handled by isCreateOpen
  };

  const handleToggleDone = async (activityId: string, currentStatus: boolean) => {
    const success = await updateActivity(activityId, { is_done: !currentStatus });
    if (!success) {
        toast({ title: 'Failed to update activity status', description: activitiesError || 'Unknown error', status: 'error', duration: 3000, isClosable: true });
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

  const handleEditClick = (activityItem: Activity) => { // Renamed to activityItem to avoid conflict
    setActivityToEdit(activityItem);
    onEditOpen();
  };

  const handleEditClose = () => {
    onEditClose();
    setActivityToEdit(null);
  };

  // Define Columns for SortableTable
  const columns: ColumnDefinition<Activity>[] = [
    {
      key: 'is_done',
      header: '', // No text header for checkbox
      renderCell: (activityItem) => {
          const canUpdate = userPermissions?.includes('activity:update_any') || (userPermissions?.includes('activity:update_own') && activityItem.user_id === currentUserId);
          return (
            <Checkbox 
                isChecked={activityItem.is_done} 
                onChange={() => handleToggleDone(activityItem.id, activityItem.is_done)} 
                aria-label="Mark activity as done"
                isDisabled={!canUpdate}
                px={2} // Add padding directly to checkbox cell
            />
          );
      },
      isSortable: true,
      sortAccessor: (activityItem) => activityItem.is_done, // Sort by boolean
    },
    {
      key: 'subject',
      header: 'Subject / Type',
      renderCell: (activityItem) => (
        <HStack align="baseline">
          <Text fontWeight="medium">{activityItem.subject}</Text>
          <Tag size="sm" colorScheme={getActivityTypeColor(activityItem.type)}>{activityItem.type || '-'}</Tag>
        </HStack>
      ),
      isSortable: true,
      sortAccessor: (activityItem) => activityItem.subject?.toLowerCase() ?? '',
    },
    {
      key: 'due_date',
      header: 'Due Date',
      renderCell: (activityItem) => formatDateTime(activityItem.due_date),
      isSortable: true,
      sortAccessor: (activityItem) => activityItem.due_date ? new Date(activityItem.due_date) : null, // Sort by Date or null
    },
    {
      key: 'linked_to',
      header: 'Linked To',
      renderCell: (activityItem) => {
          const linkedEntity = activityItem.deal 
            ? `Deal: ${activityItem.deal.name}` 
            : activityItem.person 
            ? `Person: ${activityItem.person.first_name || ''} ${activityItem.person.last_name || ''}`.trim()
            : activityItem.organization
            ? `Org: ${activityItem.organization.name}`
            : '-';
          return <Text fontSize="xs">{linkedEntity}</Text>;
      },
      isSortable: true,
      sortAccessor: (activityItem) => { // Custom accessor for linked entity string
          if (activityItem.deal) return `deal: ${activityItem.deal.name?.toLowerCase() ?? ''}`;
          if (activityItem.person) return `person: ${activityItem.person.first_name?.toLowerCase() ?? ''} ${activityItem.person.last_name?.toLowerCase() ?? ''}`.trim();
          if (activityItem.organization) return `organization: ${activityItem.organization.name?.toLowerCase() ?? ''}`;
          return '';
      },
    },
    {
      key: 'notes',
      header: 'Notes',
      renderCell: (activityItem) => (
          <Text fontSize="xs" maxW="200px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
              {activityItem.notes || '-'}
          </Text>
      ),
      isSortable: true,
      sortAccessor: (activityItem) => activityItem.notes?.toLowerCase() ?? '',
    },
    {
      key: 'actions',
      header: 'Actions',
      renderCell: (activityItem) => {
          const canUpdate = userPermissions?.includes('activity:update_any') || (userPermissions?.includes('activity:update_own') && activityItem.user_id === currentUserId);
          const canDelete = userPermissions?.includes('activity:delete_any') || (userPermissions?.includes('activity:delete_own') && activityItem.user_id === currentUserId);
          return (
            <HStack spacing={1}>
              <IconButton
                aria-label="Edit activity"
                icon={<EditIcon />}
                size="sm"
                variant="ghost"
                onClick={() => handleEditClick(activityItem)}
                isDisabled={!canUpdate}
              />
              <IconButton
                aria-label="Delete activity"
                icon={<DeleteIcon />}
                colorScheme="red"
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteClick(activityItem.id)}
                isDisabled={!canDelete}
              />
            </HStack>
          );
      },
      isSortable: false,
    },
  ];

  // Define props for EmptyState
  const emptyStateProps = {
    icon: TimeIcon,
    title: "No Activities Logged",
    message: "Add tasks, calls, or meetings to keep track of interactions."
  };

  // Loading state is handled before the main layout
  if (activitiesLoading) {
    return (
      <Flex justify="center" align="center" minH="calc(100vh - 200px)">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // Error state when no activities are loaded yet (this might need adjustment based on full file content)
  // This specific conditional rendering of ListPageLayout for error might be part of what gets simplified
  // if the main ListPageLayout is always rendered.
  if (activitiesError && !activities.length && !activitiesLoading) { // Added !activitiesLoading here
    return (
      <ListPageLayout 
        title="Activities" 
        newButtonLabel="New Activity"
        onNewButtonClick={onCreateOpen} // This should trigger the modal
        isNewButtonDisabled={!userPermissions?.includes('activity:create')}
        isLoading={false} // Explicitly false as we are in error state
        error={activitiesError}
        isEmpty={true} // True because of error and no activities
        emptyStateProps={emptyStateProps} // Use the defined emptyStateProps
      >
         <></>{/* Provide empty fragment as children to satisfy prop type */}
      </ListPageLayout>
    );
  }

  return (
    <>
    <ListPageLayout 
        title="Activities" 
        newButtonLabel="New Activity"
        onNewButtonClick={onCreateOpen}
        isNewButtonDisabled={!userPermissions?.includes('activity:create')}
        isLoading={activitiesLoading} // Use the actual loading state here
        error={activitiesError} // Pass the error state
        isEmpty={!activitiesLoading && activities.length === 0 && !activitiesError} // Correct isEmpty condition
        emptyStateProps={emptyStateProps}
    >
        {/* Children of ListPageLayout: Table should be here, rendered if not empty by ListPageLayout */}
        {!activitiesLoading && !activitiesError && activities.length > 0 && (
            <SortableTable<Activity>
                data={activities}
                columns={columns}
                initialSortKey="due_date" // Or any other sensible default
                initialSortDirection="ascending" // Corrected value
            />
        )}
        {/* The Create Activity Modal is NO LONGER HERE */}
      </ListPageLayout>

      {/* Create Activity Modal - Rendered as a SIBLING to ListPageLayout */}
      {isCreateOpen && (
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Log New Activity</ModalHeader>
          <ModalCloseButton />
            {/* ModalBody and CreateActivityForm would be here */}
            {/* Assuming CreateActivityForm takes onSuccess and onClose similar to People */}
            <CreateActivityForm onSuccess={handleCreateSuccess} onClose={onCreateClose} />
        </ModalContent>
      </Modal>
      )}

      {/* Edit Activity Modal (if it exists and is structured similarly) */}
      {activityToEdit && isEditOpen && (
        <EditActivityModal 
            activity={activityToEdit}
          isOpen={isEditOpen} 
            onClose={handleEditClose} // Use the specific close handler for edit
            // onUpdated might be a prop if EditActivityModal handles its own data saving and re-fetch call
        />
      )}

      {/* Confirmation Dialog for Delete */}
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
    </>
  );
}

export default ActivitiesPage; 