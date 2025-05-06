import { useEffect, useState, useMemo } from 'react';
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
import { useAppStore, Activity, Deal, Person, Organization } from '../stores/useAppStore'; // Keep types
// import ActivityListItem from '../components/activities/ActivityListItem'; // REMOVE list item import
import CreateActivityForm from '../components/activities/CreateActivityForm'; // Import the form
import EmptyState from '../components/common/EmptyState'; // Import EmptyState
import ConfirmationDialog from '../components/common/ConfirmationDialog'; // Import ConfirmationDialog
import EditActivityModal from '../components/activities/EditActivityModal'; // Import Edit Modal
import { TimeIcon, EditIcon, DeleteIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'; // Import icons

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

// Helper to get sortable string for linked entities
const getLinkedEntitySortString = (activity: ActivityWithLinks): string => {
    if (activity.deal) return `deal: ${activity.deal.name?.toLowerCase() ?? ''}`;
    if (activity.person) return `person: ${activity.person.first_name?.toLowerCase() ?? ''} ${activity.person.last_name?.toLowerCase() ?? ''}`.trim();
    if (activity.organization) return `organization: ${activity.organization.name?.toLowerCase() ?? ''}`;
    return ''; // No link
};

function ActivitiesPage() {
  // Store state and actions
  const activities = useAppStore((state) => state.activities as ActivityWithLinks[]);
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

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'due_date', direction: 'ascending' });

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

  // --- Sorting Logic ---
  const requestSort = (key: ActivitySortKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedActivities = useMemo(() => {
    let sortableActivities = [...activities];
    sortableActivities.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch(sortConfig.key) {
            case 'subject':
            case 'type':
            case 'notes':
                aValue = a[sortConfig.key]?.toLowerCase() ?? '';
                bValue = b[sortConfig.key]?.toLowerCase() ?? '';
                break;
            case 'due_date':
                // Handle null dates - sort them to the end when ascending
                aValue = a.due_date ? new Date(a.due_date).getTime() : Infinity;
                bValue = b.due_date ? new Date(b.due_date).getTime() : Infinity;
                if (sortConfig.direction === 'descending') {
                    // Treat nulls as earliest for descending
                    aValue = a.due_date ? new Date(a.due_date).getTime() : -Infinity;
                    bValue = b.due_date ? new Date(b.due_date).getTime() : -Infinity;
                }
                break;
            case 'linked_to':
                aValue = getLinkedEntitySortString(a);
                bValue = getLinkedEntitySortString(b);
                break;
            case 'is_done': // Boolean sort (false before true)
                aValue = a.is_done ? 1 : 0;
                bValue = b.is_done ? 1 : 0;
                break;
            default:
                return 0;
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });
    return sortableActivities;
  }, [activities, sortConfig]);

  // Helper to render sort icons
  const renderSortIcon = (columnKey: ActivitySortKeys) => {
      if (sortConfig.key !== columnKey) return null;
      return sortConfig.direction === 'ascending' ? 
             <TriangleUpIcon aria-label="sorted ascending" ml={1} w={3} h={3} /> : 
             <TriangleDownIcon aria-label="sorted descending" ml={1} w={3} h={3} />;
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h2" size="lg">Activities</Heading>
        <Button 
          colorScheme="blue" 
          onClick={onCreateOpen}
          isDisabled={!userPermissions?.includes('activity:create')}
        >
          New Activity
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
        <TableContainer borderWidth="1px" borderRadius="lg" width="100%">
          <Table variant="simple" size="sm" width="100%">
            <Thead>
              <Tr borderBottomWidth="1px" borderColor="gray.200">
                <Th px={2} width="1%" cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('is_done')}>
                    {renderSortIcon('is_done')}
                </Th>
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('subject')}>
                  Subject / Type {renderSortIcon('subject')}
                </Th>
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('due_date')}>
                  Due Date {renderSortIcon('due_date')}
                </Th>
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('linked_to')}>
                  Linked To {renderSortIcon('linked_to')}
                </Th>
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('notes')}>
                  Notes {renderSortIcon('notes')}
                </Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedActivities.map(activity => {
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