import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Spinner,
  Text,
  VStack,
  useDisclosure, // For create modal later
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
  Alert, AlertIcon // Added Alert & AlertIcon
} from '@chakra-ui/react';
import { useAppStore } from '../stores/useAppStore'; // For userPermissions and currentUserId
import { useActivitiesStore, Activity } from '../stores/useActivitiesStore'; // NEW IMPORT
import CreateActivityForm from '../components/activities/CreateActivityForm'; // Import the form
import EmptyState from '../components/common/EmptyState'; // Import EmptyState
import ConfirmationDialog from '../components/common/ConfirmationDialog'; // Import ConfirmationDialog
import EditActivityModal from '../components/activities/EditActivityModal'; // Import Edit Modal
import { TimeIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'; // Removed ViewIcon
import ListPageLayout from '../components/layout/ListPageLayout'; // Import layout
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable'; // Import table

// Extend Activity type to potentially include full linked objects if needed for sorting
// (Assuming they are fetched with the activity)
// interface ActivityWithLinks extends Activity {
// deal?: Deal | null;
// person?: Person | null;
// organization?: Organization | null;
// }

// Define sortable keys
// type ActivitySortKeys = 'subject' | 'type' | 'due_date' | 'linked_to' | 'notes' | 'is_done';

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

  if (activitiesLoading) {
    return (
      <Flex justify="center" align="center" minH="calc(100vh - 200px)">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (activitiesError && !activities.length) {
    return (
      <ListPageLayout 
        title="Activities" 
        onNewButtonClick={onCreateOpen} 
        newButtonLabel="New Activity"
        isNewButtonDisabled={!userPermissions?.includes('activity:create')}
        isLoading={activitiesLoading} // Pass loading state
        error={activitiesError} // Pass error state
        isEmpty={true} // Explicitly set isEmpty
        emptyStateProps={emptyStateProps} // Pass empty state props
      >
        {/* Children can be empty or an Alert, ListPageLayout handles error display */}
        <Alert status="error" mt={4}>
            <AlertIcon />
            Error fetching activities: {activitiesError}
        </Alert>
      </ListPageLayout>
    );
  }

  return (
    <ListPageLayout 
        title="Activities" 
        onNewButtonClick={onCreateOpen}
        newButtonLabel="New Activity"
        isNewButtonDisabled={!userPermissions?.includes('activity:create')}
        isLoading={activitiesLoading}
        error={activitiesError} // Pass error here too for consistency, ListPageLayout might only show one error source.
        isEmpty={activities.length === 0}
        emptyStateProps={emptyStateProps}
    >
      {/* Display a less intrusive error if activities are present but an error occurred (e.g. during update/delete) */}
      {/* This specific error display might be redundant if ListPageLayout handles its 'error' prop well enough */}
      {/* For now, keeping it if it provides different context than the main error prop */}
      {activitiesError && activities.length > 0 && (
           <Alert status="warning" mt={4} mb={4}>
               <AlertIcon />
               {activitiesError} 
           </Alert>
      )}
      {/* SortableTable now explicitly typed */}
      <SortableTable<Activity> columns={columns} data={activities} initialSortKey="due_date" initialSortDirection="ascending" />

      {/* Modals remain the same */}
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
        bodyText={`Are you sure you want to delete activity: ${activityToDeleteId ? activities.find(a=>a.id === activityToDeleteId)?.subject : 'this activity'}? This action cannot be undone.`}
        confirmButtonText="Delete"
        confirmButtonColorScheme="red"
        isLoading={isDeleting}
      />
    </ListPageLayout>
  );
}

export default ActivitiesPage; 