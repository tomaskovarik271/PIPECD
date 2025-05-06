import { useEffect, useState, useMemo } from 'react';
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
} from '@chakra-ui/react';
import { useAppStore, Activity, Deal, Person, Organization } from '../stores/useAppStore'; // Keep types
// import ActivityListItem from '../components/activities/ActivityListItem'; // REMOVE list item import
import CreateActivityForm from '../components/activities/CreateActivityForm'; // Import the form
import EmptyState from '../components/common/EmptyState'; // Import EmptyState
import ConfirmationDialog from '../components/common/ConfirmationDialog'; // Import ConfirmationDialog
import EditActivityModal from '../components/activities/EditActivityModal'; // Import Edit Modal
import { TimeIcon, EditIcon, DeleteIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'; // Import icons
import ListPageLayout from '../components/layout/ListPageLayout'; // Import layout
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable'; // Import table

// Extend Activity type to potentially include full linked objects if needed for sorting
// (Assuming they are fetched with the activity)
interface ActivityWithLinks extends Activity {
    deal?: Deal | null;
    person?: Person | null;
    organization?: Organization | null;
}

// Define sortable keys
type ActivitySortKeys = 'subject' | 'type' | 'due_date' | 'linked_to' | 'notes' | 'is_done';

// Define sort config type
interface SortConfig {
    key: ActivitySortKeys;
    direction: 'ascending' | 'descending';
}

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

// Helper to get sortable string for linked entities
const getLinkedEntitySortString = (activity: ActivityWithLinks): string => {
    if (activity.deal) return `deal: ${activity.deal.name?.toLowerCase() ?? ''}`;
    if (activity.person) return `person: ${activity.person.first_name?.toLowerCase() ?? ''} ${activity.person.last_name?.toLowerCase() ?? ''}`.trim();
    if (activity.organization) return `organization: ${activity.organization.name?.toLowerCase() ?? ''}`;
    return ''; // No link
};

function ActivitiesPage() {
  // Store state and actions
  const activities = useAppStore((state) => state.activities as Activity[]);
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

  // Define Columns for SortableTable
  const columns: ColumnDefinition<Activity>[] = [
    {
      key: 'is_done',
      header: '', // No text header for checkbox
      renderCell: (activity) => {
          const canUpdate = userPermissions?.includes('activity:update_any') || (userPermissions?.includes('activity:update_own') && activity.user_id === currentUserId);
          return (
            <Checkbox 
                isChecked={activity.is_done} 
                onChange={() => handleToggleDone(activity.id, activity.is_done)} 
                aria-label="Mark activity as done"
                isDisabled={!canUpdate}
                px={2} // Add padding directly to checkbox cell
            />
          );
      },
      isSortable: true,
      sortAccessor: (activity) => activity.is_done, // Sort by boolean
    },
    {
      key: 'subject',
      header: 'Subject / Type',
      renderCell: (activity) => (
        <HStack align="baseline">
          <Text fontWeight="medium">{activity.subject}</Text>
          <Tag size="sm" colorScheme={getActivityTypeColor(activity.type)}>{activity.type || '-'}</Tag>
        </HStack>
      ),
      isSortable: true,
      sortAccessor: (activity) => activity.subject?.toLowerCase() ?? '',
    },
    {
      key: 'due_date',
      header: 'Due Date',
      renderCell: (activity) => formatDateTime(activity.due_date),
      isSortable: true,
      sortAccessor: (activity) => activity.due_date ? new Date(activity.due_date) : null, // Sort by Date or null
    },
    {
      key: 'linked_to',
      header: 'Linked To',
      renderCell: (activity) => {
          const linkedEntity = activity.deal 
            ? `Deal: ${activity.deal.name}` 
            : activity.person 
            ? `Person: ${activity.person.first_name || ''} ${activity.person.last_name || ''}`.trim()
            : activity.organization
            ? `Org: ${activity.organization.name}`
            : '-';
          return <Text fontSize="xs">{linkedEntity}</Text>;
      },
      isSortable: true,
      sortAccessor: (activity) => { // Custom accessor for linked entity string
          if (activity.deal) return `deal: ${activity.deal.name?.toLowerCase() ?? ''}`;
          if (activity.person) return `person: ${activity.person.first_name?.toLowerCase() ?? ''} ${activity.person.last_name?.toLowerCase() ?? ''}`.trim();
          if (activity.organization) return `organization: ${activity.organization.name?.toLowerCase() ?? ''}`;
          return '';
      },
    },
    {
      key: 'notes',
      header: 'Notes',
      renderCell: (activity) => (
          <Text fontSize="xs" maxW="200px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
              {activity.notes || '-'}
          </Text>
      ),
      isSortable: true,
      sortAccessor: (activity) => activity.notes?.toLowerCase() ?? '',
    },
    {
      key: 'actions',
      header: 'Actions',
      renderCell: (activity) => {
          const canUpdate = userPermissions?.includes('activity:update_any') || (userPermissions?.includes('activity:update_own') && activity.user_id === currentUserId);
          const canDelete = userPermissions?.includes('activity:delete_any') || (userPermissions?.includes('activity:delete_own') && activity.user_id === currentUserId);
          return (
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

  return (
    <ListPageLayout
      title="Activities"
      newButtonLabel="New Activity"
      onNewButtonClick={onCreateOpen}
      isNewButtonDisabled={!userPermissions?.includes('activity:create')}
      isLoading={loading}
      error={error}
      isEmpty={activities.length === 0}
      emptyStateProps={emptyStateProps}
    >
      <SortableTable<Activity>
        data={activities}
        columns={columns}
        initialSortKey="due_date" // Default sort by due date
        initialSortDirection="ascending"
      />

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
    </ListPageLayout>
  );
}

export default ActivitiesPage; 