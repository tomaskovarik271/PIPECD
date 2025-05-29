import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Spinner,
  Text,
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
  VStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useAppStore } from '../stores/useAppStore';
import { useActivitiesStore, Activity } from '../stores/useActivitiesStore';
import { useViewPreferencesStore } from '../stores/useViewPreferencesStore';
import CreateActivityForm from '../components/activities/CreateActivityForm';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import EditActivityModal from '../components/activities/EditActivityModal';
import { TimeIcon, EditIcon, DeleteIcon, SettingsIcon, ViewIcon } from '@chakra-ui/icons';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';
import ColumnSelector from '../components/common/ColumnSelector';
import EmptyState from '../components/common/EmptyState';
import UnifiedPageHeader from '../components/layout/UnifiedPageHeader';
import { usePageLayoutStyles } from '../utils/headerUtils';
import { Link as RouterLink } from 'react-router-dom';
import { useThemeColors, useThemeStyles } from '../hooks/useThemeColors';
import { useOrganizationsStore } from '../stores/useOrganizationsStore';
import { usePeopleStore } from '../stores/usePeopleStore';
import { useDealsStore } from '../stores/useDealsStore';

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

  // Search term state for unified header
  const [searchTerm, setSearchTerm] = useState('');

  // NEW: Use semantic tokens instead of manual theme checking
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const pageLayoutStyles = usePageLayoutStyles(false); // false for no statistics

  // Fetch activities on component mount
  useEffect(() => {
    fetchActivities(); // Remove quick filter dependency, just fetch all activities
  }, [fetchActivities]);

  // Filter activities based on search term
  const displayedActivities = useMemo(() => {
    if (!searchTerm.trim()) return activities;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return activities.filter(activity => 
      activity.subject?.toLowerCase().includes(lowerSearchTerm) ||
      activity.notes?.toLowerCase().includes(lowerSearchTerm) ||
      activity.type?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [activities, searchTerm]);

  const handleCreateSuccess = () => {
    onCreateClose();
    toast({ title: 'Activity created successfully', status: 'success', duration: 3000, isClosable: true });
  };

  const handleToggleDone = useCallback(async (activityId: string, currentStatus: boolean) => {
    const success = await updateActivity(activityId, { is_done: !currentStatus });
    if (!success) {
        toast({ title: 'Failed to update activity status', description: activitiesError || 'Unknown error', status: 'error', duration: 3000, isClosable: true });
    }
  }, [updateActivity, activitiesError, toast]);

  const handleDeleteClick = useCallback((activityId: string) => {
    setActivityToDeleteId(activityId);
    onConfirmDeleteOpen();
  }, [onConfirmDeleteOpen]);

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

  const handleEditClick = useCallback((activityItem: Activity) => {
    setActivityToEdit(activityItem);
    onEditOpen();
  }, [onEditOpen]);

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
        sortAccessor: (activityItem) => activityItem.subject || '',
      },
      {
        key: 'due_date',
        header: 'Due Date',
        renderCell: (activityItem) => activityItem.due_date ? formatDateTime(activityItem.due_date) : '-',
        isSortable: true,
        sortAccessor: (activityItem) => activityItem.due_date ? new Date(activityItem.due_date).getTime() : 0,
      },
      {
        key: 'linked_to',
        header: 'Related To',
        renderCell: (activityItem) => {
          if (activityItem.person) {
            return (
              <Text as={RouterLink} to={`/people/${activityItem.person.id}`} color="blue.500" textDecoration="underline">
                {activityItem.person.first_name} {activityItem.person.last_name}
              </Text>
            );
          } else if (activityItem.organization) {
            return (
              <Text as={RouterLink} to={`/organizations/${activityItem.organization.id}`} color="blue.500" textDecoration="underline">
                {activityItem.organization.name}
              </Text>
            );
          } else if (activityItem.deal) {
            return (
              <Text as={RouterLink} to={`/deals/${activityItem.deal.id}`} color="blue.500" textDecoration="underline">
                {activityItem.deal.name}
              </Text>
            );
          }
          return '-';
        },
        isSortable: true,
        sortAccessor: (activityItem) => {
          if (activityItem.person) {
            return `${activityItem.person.first_name || ''} ${activityItem.person.last_name || ''}`.trim().toLowerCase();
          } else if (activityItem.organization) {
            return activityItem.organization.name?.toLowerCase() || '';
          } else if (activityItem.deal) {
            return activityItem.deal.name?.toLowerCase() || '';
          }
          return '';
        },
      },
      {
        key: 'notes',
        header: 'Notes',
        renderCell: (activityItem) => activityItem.notes ? (
          <Text noOfLines={2} maxW="200px" title={activityItem.notes}>
            {activityItem.notes}
          </Text>
        ) : '-',
        isSortable: true,
        sortAccessor: (activityItem) => activityItem.notes?.toLowerCase() || '',
      },
      {
        key: 'created_at',
        header: 'Created',
        renderCell: (activityItem) => formatDateTime(activityItem.created_at),
        isSortable: true,
        sortAccessor: (activityItem) => activityItem.created_at ? new Date(activityItem.created_at).getTime() : 0,
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

  // Secondary actions (column selector) - NEW: Using semantic tokens
  const secondaryActions = (
    <Button 
      leftIcon={<SettingsIcon />} 
      onClick={onColumnSelectorOpen}
      size="md"
      height="40px"
      minW="110px"
      {...styles.button.secondary} // NEW: Theme-aware styles
    >
      Columns
    </Button>
  );

  const pageIsLoading = activitiesLoading;

  return (
    <>
      <UnifiedPageHeader
        title="Activities"
        showSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search activities..."
        primaryButtonLabel="New Activity"
        onPrimaryButtonClick={onCreateOpen}
        requiredPermission="activity:create"
        userPermissions={userPermissions || []} // Fix: handle null userPermissions
        secondaryActions={secondaryActions}
      />

      <Box sx={pageLayoutStyles.container}>
        {pageIsLoading && (
          <VStack justify="center" align="center" minH="300px" w="100%">
            <Spinner 
              size="xl" 
              color={colors.interactive.default} // NEW: Semantic token
            />
          </VStack>
        )}
        
        {!pageIsLoading && activitiesError && (
          <Alert 
            status="error" 
            variant="subtle"
            bg={colors.status.error} // NEW: Semantic token
            color={colors.text.onAccent} // NEW: Semantic token
          >
            <AlertIcon />
            {activitiesError}
          </Alert>
        )}
        
        {!pageIsLoading && !activitiesError && displayedActivities.length === 0 && (
          <EmptyState
            icon={TimeIcon}
            title="No Activities Found"
            message="Get started by creating your first activity or try adjusting your search."
            actionButtonLabel="New Activity"
            onActionButtonClick={onCreateOpen}
            isActionButtonDisabled={!userPermissions?.includes('activity:create')}
          />
        )}
        
        {!pageIsLoading && !activitiesError && displayedActivities.length > 0 && (
          <Box sx={pageLayoutStyles.content}>
            <SortableTable<Activity>
              data={displayedActivities}
              columns={visibleColumns}
              initialSortKey="due_date"
              initialSortDirection="ascending"
            />
          </Box>
        )}
      </Box>

    {/* Modals */}
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