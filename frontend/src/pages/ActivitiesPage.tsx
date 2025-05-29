import { useEffect, useState, useMemo } from 'react';
import {
  Button,
  Spinner,
  Text,
  Flex,
  useDisclosure,
  Checkbox,
  HStack,
  IconButton,
  Tag,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useAppStore } from '../stores/useAppStore';
import { useActivitiesStore, Activity } from '../stores/useActivitiesStore';
import { useViewPreferencesStore } from '../stores/useViewPreferencesStore';
import CreateActivityForm from '../components/activities/CreateActivityForm';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import EditActivityModal from '../components/activities/EditActivityModal';
import { TimeIcon, EditIcon, DeleteIcon, SettingsIcon, ViewIcon } from '@chakra-ui/icons';
import ListPageLayout from '../components/layout/ListPageLayout';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';
import ColumnSelector from '../components/common/ColumnSelector';
import QuickFilterControls, { QuickFilter } from '../components/common/QuickFilterControls';
import type { ActivityFilterInput } from '../generated/graphql/graphql';
import { Link as RouterLink } from 'react-router-dom';

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
  const session = useAppStore((state) => state.session);
  const currentUserId = session?.user.id;

  // Modal state
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const { isOpen: isColumnSelectorOpen, onOpen: onColumnSelectorOpen, onClose: onColumnSelectorClose } = useDisclosure();
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  const [activityToDeleteId, setActivityToDeleteId] = useState<string | null>(null);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const toast = useToast();

  const { 
    tableColumnPreferences, 
    initializeTable, 
    setVisibleColumnKeys,
    resetTableToDefaults 
  } = useViewPreferencesStore();

  const [activeQuickFilterKey, setActiveQuickFilterKey] = useState<string | null>(null);

  // Define Quick Filters for Activities
  const availableQuickFilters = useMemo((): QuickFilter[] => [
    { key: 'all', label: 'All Activities' },
    { key: 'myOpen', label: 'My Open' }, // Will fetch {isDone: false} and then filter by user_id client-side
    { key: 'allDone', label: 'All Done' }, // Will fetch {isDone: true}
  ], []);

  // Fetch activities on component mount and when activeQuickFilterKey changes
  useEffect(() => {
    let filterCriteria: ActivityFilterInput | undefined = undefined;
    // For 'myOpen', we fetch all open activities and then filter client-side by user.
    // For 'allDone', we fetch based on isDone.
    // For 'all', filterCriteria remains undefined.
    if (activeQuickFilterKey) {
      switch (activeQuickFilterKey) {
        case 'myOpen':
          filterCriteria = { isDone: false }; // Corrected field name
          break;
        case 'allDone':
          filterCriteria = { isDone: true }; // Corrected field name
          break;
      }
    }
    fetchActivities(filterCriteria);
  }, [fetchActivities, activeQuickFilterKey]); // currentUserId is not a direct dep for fetch, but for displayedActivities

  const displayedActivities = useMemo(() => {
    if (activeQuickFilterKey === 'myOpen' && currentUserId) {
      // Ensure we only show activities for the current user that are also not done.
      // The fetchActivities call for 'myOpen' already filters by isDone: false.
      return activities.filter(act => act.user_id === currentUserId);
    }
    // For 'all' and 'allDone', the fetched data from useActivitiesStore is already correctly filtered by backend (or not filtered for 'all').
    return activities;
  }, [activities, activeQuickFilterKey, currentUserId]);

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
    setDeletingRowId(activityToDeleteId);
    const success = await deleteActivity(activityToDeleteId);
    setDeletingRowId(null);
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

  const TABLE_KEY = 'activities_list';

  const allAvailableColumns = useMemo((): ColumnDefinition<Activity>[] => {
    const standardColumns: ColumnDefinition<Activity>[] = [
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
        key: 'created_at',
        header: 'Created',
        renderCell: (activityItem) => formatDateTime(activityItem.created_at),
        isSortable: true,
        sortAccessor: (activityItem) => activityItem.created_at ? new Date(activityItem.created_at).getTime() : 0,
      },
      {
        key: 'updated_at',
        header: 'Updated',
        renderCell: (activityItem) => formatDateTime(activityItem.updated_at),
        isSortable: true,
        sortAccessor: (activityItem) => activityItem.updated_at ? new Date(activityItem.updated_at).getTime() : 0,
      },
    ];

    const actionsColumn: ColumnDefinition<Activity> = {
      key: 'actions',
      header: 'Actions',
      renderCell: (activityItem) => {
          const canUpdate = userPermissions?.includes('activity:update_any') || (userPermissions?.includes('activity:update_own') && activityItem.user_id === currentUserId);
          const canDelete = userPermissions?.includes('activity:delete_any') || (userPermissions?.includes('activity:delete_own') && activityItem.user_id === currentUserId);
          return (
            <HStack spacing={1}>
              <IconButton
                as={RouterLink}
                to={`/activities/${activityItem.id}`}
                aria-label="View activity details"
                icon={<ViewIcon />}
                size="sm"
                variant="ghost"
              />
              <IconButton
                aria-label="Edit activity"
                icon={<EditIcon />}
                size="sm"
                variant="ghost"
                onClick={() => handleEditClick(activityItem)}
                isDisabled={!canUpdate || !!deletingRowId}
              />
              <IconButton
                aria-label="Delete activity"
                icon={<DeleteIcon />}
                colorScheme="red"
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteClick(activityItem.id)}
                isDisabled={!canDelete || (!!deletingRowId && deletingRowId !== activityItem.id)}
                isLoading={deletingRowId === activityItem.id}
              />
            </HStack>
          );
      },
      isSortable: false,
    };
    return [...standardColumns, actionsColumn];
  }, [userPermissions, currentUserId, deletingRowId, handleToggleDone, handleEditClick, handleDeleteClick]);

  const defaultVisibleColumnKeys = useMemo(() => [
    'is_done', 'subject', 'due_date', 'linked_to', 'notes', 'created_at', 'actions'
  ], []);

  useEffect(() => {
    if (allAvailableColumns.length > 0) {
        initializeTable(TABLE_KEY, defaultVisibleColumnKeys);
    }
  }, [initializeTable, defaultVisibleColumnKeys, allAvailableColumns]);

  const currentVisibleColumnKeys = useMemo(() => {
    const preferredKeys = tableColumnPreferences[TABLE_KEY]?.visibleColumnKeys;
    const availableKeysSet = new Set(allAvailableColumns.map(col => col.key));
    if (preferredKeys) {
      const filteredPreferredKeys = preferredKeys.filter(key => availableKeysSet.has(key));
      return filteredPreferredKeys.length > 0 ? filteredPreferredKeys : defaultVisibleColumnKeys.filter(key => availableKeysSet.has(key));
    }
    return defaultVisibleColumnKeys.filter(key => availableKeysSet.has(key));
  }, [tableColumnPreferences, TABLE_KEY, defaultVisibleColumnKeys, allAvailableColumns]);

  const visibleColumns = useMemo(() => {
    if (allAvailableColumns.length === 0) return [];
    return allAvailableColumns.filter(col => currentVisibleColumnKeys.includes(String(col.key)));
  }, [allAvailableColumns, currentVisibleColumnKeys]);

  // Define props for EmptyState
  const emptyStateProps = {
    icon: TimeIcon,
    title: "No Activities Logged",
    message: "Add tasks, calls, or meetings to keep track of interactions.",
    actionButtonLabel: "New Activity",
    onActionButtonClick: onCreateOpen,
    isActionButtonDisabled: !userPermissions?.includes('activity:create')
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

  const emptyStatePropsForPage = {
    icon: TimeIcon,
    title: "No Activities Yet",
    message: "Get started by creating your first activity or task.",
    actionButtonLabel: "New Activity",
    onActionButtonClick: onCreateOpen,
    isActionButtonDisabled: !userPermissions?.includes('activity:create_any') && !userPermissions?.includes('activity:create_own')
  };
  
  const pageIsLoading = activitiesLoading;

  return (
    <>
    <ListPageLayout 
        title="Activities" 
        newButtonLabel="New Activity"
        onNewButtonClick={onCreateOpen}
        isNewButtonDisabled={!userPermissions?.includes('activity:create')}
        isLoading={pageIsLoading}
        error={activitiesError}
        isEmpty={!pageIsLoading && displayedActivities.length === 0 && !activitiesError}
        emptyStateProps={emptyStatePropsForPage}
        customControls={ 
          <HStack spacing={4} my={2}>
            <QuickFilterControls 
              availableFilters={availableQuickFilters}
              activeFilterKey={activeQuickFilterKey}
              onSelectFilter={setActiveQuickFilterKey}
            />
            <Button leftIcon={<SettingsIcon />} onClick={onColumnSelectorOpen} size="sm" variant="outline">
              Columns
            </Button>
          </HStack>
        }
    >
        {!pageIsLoading && !activitiesError && displayedActivities.length > 0 && (
            <SortableTable<Activity>
                data={displayedActivities}
                columns={visibleColumns}
                initialSortKey="due_date"
                initialSortDirection="ascending"
            />
        )}
    </ListPageLayout>

    {isCreateOpen && (
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Log New Activity</ModalHeader>
          <ModalCloseButton />
            <CreateActivityForm onSuccess={handleCreateSuccess} onClose={onCreateClose} />
        </ModalContent>
      </Modal>
    )}

    {activityToEdit && isEditOpen && (
        <EditActivityModal 
            activity={activityToEdit}
          isOpen={isEditOpen} 
            onClose={handleEditClose}
        />
    )}

    <ConfirmationDialog 
        isOpen={isConfirmDeleteDialogOpen}
        onClose={onConfirmDeleteClose}
        onConfirm={handleConfirmDelete}
        title="Delete Activity"
        body="Are you sure you want to delete this activity? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonColor="red"
        isConfirmLoading={!!deletingRowId}
    />

    {isColumnSelectorOpen && allAvailableColumns.length > 0 && (
        <ColumnSelector<Activity>
          isOpen={isColumnSelectorOpen}
          onClose={onColumnSelectorClose}
          allAvailableColumns={allAvailableColumns}
          currentVisibleColumnKeys={currentVisibleColumnKeys}
          defaultVisibleColumnKeys={defaultVisibleColumnKeys}
          onApply={(newKeys) => setVisibleColumnKeys(TABLE_KEY, newKeys)}
          onReset={() => resetTableToDefaults(TABLE_KEY, defaultVisibleColumnKeys)}
        />
    )}
    </>
  );
}

export default ActivitiesPage; 