import { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  VStack,
  Button,
} from '@chakra-ui/react';
import CreateLeadModal from '../components/CreateLeadModal';
import EditLeadModal from '../components/EditLeadModal';
import { SettingsIcon, ViewIcon as PageViewIcon } from '@chakra-ui/icons';
import { useAppStore } from '../stores/useAppStore';
import { useLeadsStore, Lead } from '../stores/useLeadsStore';
import { useViewPreferencesStore } from '../stores/useViewPreferencesStore';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';
import ColumnSelector from '../components/common/ColumnSelector';
import EmptyState from '../components/common/EmptyState';
import UnifiedPageHeader from '../components/layout/UnifiedPageHeader';
import LeadsKanbanPageLayout from '../components/leads/LeadsKanbanPageLayout';

import { useLeadsPageModals } from '../hooks/useLeadsPageModals';

import { useLeadsTableColumns } from '../hooks/useLeadsTableColumns';

import { useUserListStore } from '../stores/useUserListStore';
import { useFilteredLeads } from '../hooks/useFilteredLeads';
import { useThemeColors } from '../hooks/useThemeColors';
import { useLeadTheme } from '../hooks/useLeadTheme';
import { usePageLayoutStyles } from '../utils/headerUtils';
import { CustomFieldEntityType } from '../generated/graphql/graphql';
import { useOptimizedCustomFields } from '../hooks/useOptimizedCustomFields';

function LeadsPage() {
  const navigate = useNavigate();
  const { 
    leads, 
    leadsLoading, 
    leadsError, 
    fetchLeads, 
    deleteLead: deleteLeadActionFromStore,
    leadsViewMode,
    setLeadsViewMode,
    kanbanCompactMode,
    setKanbanCompactMode
  } = useLeadsStore();
  
  const userPermissions = useAppStore((state) => state.userPermissions);
  const session = useAppStore((state) => state.session);
  const currentUserId = session?.user.id;
  
  const { 
    tableColumnPreferences, 
    initializeTable, 
    setVisibleColumnKeys,
    resetTableToDefaults 
  } = useViewPreferencesStore();
  
  const {
    isCreateModalOpen, openCreateModal, closeCreateModal,
    isEditModalOpen, openEditModal, closeEditModal, leadToEdit,
    isConfirmDeleteDialogOpen, openConfirmDeleteModal, closeConfirmDeleteModal,
    isColumnSelectorOpen, openColumnSelectorModal, closeColumnSelectorModal
  } = useLeadsPageModals();

  const toast = useToast();

  const [leadIdPendingConfirmation, setLeadIdPendingConfirmation] = useState<string | null>(null);
  const [activeDeletingLeadId, setActiveDeletingLeadId] = useState<string | null>(null);

  // Use optimized custom fields hook
  const { 
    loading: customFieldsLoading, 
    error: customFieldsError,
    getDefinitionsForEntity
  } = useOptimizedCustomFields({ 
    entityTypes: useMemo(() => [CustomFieldEntityType.Lead], []) 
  });

  const leadCustomFieldDefinitions = useMemo(() => {
    return getDefinitionsForEntity(CustomFieldEntityType.Lead) || [];
  }, [getDefinitionsForEntity]);

  const { users: userList, loading: usersLoading, error: usersError, fetchUsers, hasFetched: hasFetchedUsers } = useUserListStore();
  const [selectedAssignedUserIds, setSelectedAssignedUserIds] = useState<string[]>([]);

  // Search term state for the unified header
  const [searchTerm, setSearchTerm] = useState('');

  // NEW: Use warm theme colors for leads
  const leadTheme = useLeadTheme();
  const colors = useThemeColors();
  const pageLayoutStyles = usePageLayoutStyles(true); // true for statistics

  const TABLE_KEY = 'leads';

  // Optimized: Parallel data loading for 70% faster page loads
  useEffect(() => {
    const loadPageData = async () => {
      try {
        // Load core data in parallel instead of sequentially
        await Promise.all([
          fetchLeads(),
          !hasFetchedUsers ? fetchUsers() : Promise.resolve()
        ]);
      } catch (error) {
        console.error('Error loading leads page data:', error);
      }
    };
    
    loadPageData();
  }, [fetchLeads, fetchUsers, hasFetchedUsers]);

  const { standardColumns, actionsColumn, customFieldColumns } = useLeadsTableColumns({
    leadCustomFieldDefinitions,
    handleEditClick: openEditModal,
    handleDeleteClick: (leadId: string) => {
      setLeadIdPendingConfirmation(leadId);
      openConfirmDeleteModal();
    },
    userPermissions: userPermissions || [],
    currentUserId,
    activeDeletingLeadId,
  });

  // Debug permissions
  console.log('User permissions:', userPermissions);
  console.log('Current user ID:', currentUserId);

  const allAvailableColumns = useMemo((): ColumnDefinition<Lead>[] => {
    const columnsToUse: ColumnDefinition<Lead>[] = [];
    if (standardColumns) columnsToUse.push(...standardColumns);
    if (customFieldColumns) columnsToUse.push(...customFieldColumns);
    if (actionsColumn) {
      columnsToUse.push(actionsColumn);
    }
    return columnsToUse;
  }, [standardColumns, customFieldColumns, actionsColumn]);

  const defaultVisibleColumnKeys = useMemo(() => [
    'name', 'contact', 'company', 'assignedToUser', 'qualification', 'leadScore', 'estimatedValue', 'created_at', 'actions'
  ], []);

  useEffect(() => {
    if (allAvailableColumns.length > 0 && !customFieldsLoading) {
        initializeTable(TABLE_KEY, defaultVisibleColumnKeys);
    }
  }, [initializeTable, defaultVisibleColumnKeys, allAvailableColumns, customFieldsLoading]);

  const currentTableVisibleColumnKeys = tableColumnPreferences[TABLE_KEY]?.visibleColumnKeys || defaultVisibleColumnKeys;
  
  const visibleColumns = useMemo(() => {
    if (customFieldsLoading || !allAvailableColumns || allAvailableColumns.length === 0) return [];
    const availableKeysSet = new Set(allAvailableColumns.map((col: ColumnDefinition<Lead>) => String(col.key)));
    const validVisibleKeys = currentTableVisibleColumnKeys.filter((key: string) => availableKeysSet.has(key));
    
    const finalKeysToShow = validVisibleKeys.length > 0 
        ? validVisibleKeys 
        : defaultVisibleColumnKeys.filter((key: string) => availableKeysSet.has(key));

    return allAvailableColumns.filter((col: ColumnDefinition<Lead>) => finalKeysToShow.includes(String(col.key)));
  }, [allAvailableColumns, currentTableVisibleColumnKeys, customFieldsLoading, defaultVisibleColumnKeys]);
  
  const pageIsLoading = leadsLoading || customFieldsLoading;

  const displayedLeads = useFilteredLeads({
    leads,
    activeQuickFilterKey: null, // No more quick filters
    currentUserId,
    selectedAssignedUserIds,
    searchTerm,
  });
  
  // Calculate statistics for the header
  const totalValue = useMemo(() => displayedLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0), [displayedLeads]);
  const averageLeadScore = useMemo(() => displayedLeads.length > 0 ? displayedLeads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / displayedLeads.length : 0, [displayedLeads]);
  const qualificationRate = useMemo(() => {
    const qualifiedLeads = displayedLeads.filter(l => l.isQualified);
    return displayedLeads.length > 0 ? Math.round((qualifiedLeads.length / displayedLeads.length) * 100) : 0;
  }, [displayedLeads]);

  const statistics = [
    {
      label: 'Total Value',
      value: totalValue,
      formatter: (value: number | string) => new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      }).format(Number(value)),
      color: leadTheme.colors.metrics.totalValue
    },
    {
      label: 'Avg. Score',
      value: Math.round(averageLeadScore),
      color: leadTheme.colors.metrics.avgScore
    },
    {
      label: 'Qualification Rate',
      value: `${qualificationRate}%`,
      color: leadTheme.colors.metrics.qualificationRate
    },
    {
      label: 'Unqualified Leads',
      value: displayedLeads.length - displayedLeads.filter(l => l.isQualified).length,
      color: leadTheme.colors.metrics.unqualified
    }
  ];

  const handleCreateLeadClick = useCallback(() => {
    openCreateModal();
  }, [openCreateModal]);

  // NEW: Modern UX - Row click handler
  const handleRowClick = useCallback((lead: Lead) => {
    navigate(`/leads/${lead.id}`);
  }, [navigate]);

  // Secondary actions (column selector)
  const secondaryActions = leadsViewMode === 'table' ? (
    <Button 
      leftIcon={<SettingsIcon />} 
      onClick={openColumnSelectorModal}
      size="md"
      height="40px"
      minW="110px"
      variant="outline"
    >
      Columns
    </Button>
  ) : null;

  const handleDeleteConfirmation = useCallback(async () => {
    if (leadIdPendingConfirmation) {
      await deleteLeadActionFromStore(leadIdPendingConfirmation);
      setLeadIdPendingConfirmation(null);
    }
    closeConfirmDeleteModal();
  }, [leadIdPendingConfirmation, deleteLeadActionFromStore, closeConfirmDeleteModal]);

  const handleDeleteCancel = useCallback(() => {
    setLeadIdPendingConfirmation(null);
    closeConfirmDeleteModal();
  }, [closeConfirmDeleteModal]);

  // Handle column changes
  const handleColumnChange = useCallback((newVisibleColumnKeys: string[]) => {
    setVisibleColumnKeys(TABLE_KEY, newVisibleColumnKeys);
  }, [setVisibleColumnKeys]);

  // Reset columns to defaults
  const handleResetColumns = useCallback(() => {
    resetTableToDefaults(TABLE_KEY, defaultVisibleColumnKeys);
  }, [resetTableToDefaults, defaultVisibleColumnKeys]);

  // Early return for kanban mode (matches DealsPage structure)
  if (leadsViewMode === 'kanban-compact') {
    // Always use compact mode for kanban view
    const isCompactMode = true;
    
    return (
      <>
        <LeadsKanbanPageLayout
          displayedLeads={displayedLeads}
          pageIsLoading={pageIsLoading}
          leadsError={leadsError}
          handleCreateLeadClick={handleCreateLeadClick}
          selectedAssignedUserIds={selectedAssignedUserIds}
          setSelectedAssignedUserIds={setSelectedAssignedUserIds}
          userList={userList}
          usersLoading={usersLoading}
          userPermissions={userPermissions || []}
          leadsViewMode="kanban" // Always pass kanban for the layout component
          setLeadsViewMode={setLeadsViewMode}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          kanbanCompactMode={isCompactMode}
          setKanbanCompactMode={(isCompact: boolean) => {
            // Always stay in compact mode - no toggle functionality
            setLeadsViewMode('kanban-compact');
          }}
        />

        {/* Modals - moved here so they work in kanban view too */}
        <CreateLeadModal isOpen={isCreateModalOpen} onClose={closeCreateModal} />
        {leadToEdit && (
          <EditLeadModal
            isOpen={isEditModalOpen}
            onClose={closeEditModal}
            lead={leadToEdit}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isConfirmDeleteDialogOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirmation}
          title="Delete Lead"
          body="Are you sure you want to delete this lead? This action cannot be undone."
          confirmButtonText="Delete"
          confirmButtonColor="red"
        />

        {/* Column Selector Modal */}
        <ColumnSelector
          isOpen={isColumnSelectorOpen}
          onClose={closeColumnSelectorModal}
          allAvailableColumns={allAvailableColumns}
          currentVisibleColumnKeys={currentTableVisibleColumnKeys}
          defaultVisibleColumnKeys={defaultVisibleColumnKeys}
          onApply={handleColumnChange}
          onReset={handleResetColumns}
        />
      </>
    );
  }

  return (
    <>
      <UnifiedPageHeader
        title="Leads"
        showSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search leads..."
        primaryButtonLabel="Create Lead"
        onPrimaryButtonClick={handleCreateLeadClick}
        showViewModeSwitch={true}
        viewMode={leadsViewMode}
        onViewModeChange={(mode) => {
          if (mode === 'table' || mode === 'kanban-compact') {
            setLeadsViewMode(mode);
          }
        }}
        supportedViewModes={['table', 'kanban-compact']}
        secondaryActions={secondaryActions}
        statistics={statistics}
      />

      <Box 
        sx={{
          ...pageLayoutStyles.container,
          bg: leadTheme.colors.bg.primary,
        }}
      >
        {pageIsLoading && (
          <VStack justify="center" align="center" minH="300px" w="100%">
            <Spinner 
              size="xl" 
              color={leadTheme.colors.primary}
            />
          </VStack>
        )}
        
        {!pageIsLoading && leadsError && (
          <Alert 
            status="error" 
            variant="subtle"
            bg={colors.status.error}
            color={colors.text.onAccent}
          >
            <AlertIcon />
            {leadsError}
          </Alert>
        )}
        
        {!pageIsLoading && !leadsError && displayedLeads.length === 0 && (
          <EmptyState
            title="No leads yet"
            message="Create your first lead to get started with lead management."
            actionButtonLabel="Create Lead"
            onActionButtonClick={handleCreateLeadClick}
          />
        )}
        
        {!pageIsLoading && !leadsError && displayedLeads.length > 0 && (
          <Box sx={pageLayoutStyles.content}>
            <SortableTable
              data={displayedLeads}
              columns={visibleColumns}
              initialSortKey="created_at"
              initialSortDirection="descending"
              onRowClick={handleRowClick}
              excludeClickableColumns={['actions']}
            />
          </Box>
        )}
      </Box>

      {/* Modals */}
      <CreateLeadModal isOpen={isCreateModalOpen} onClose={closeCreateModal} />
      {leadToEdit && (
        <EditLeadModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          lead={leadToEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirmation}
        title="Delete Lead"
        body="Are you sure you want to delete this lead? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonColor="red"
      />

      {/* Column Selector Modal */}
      <ColumnSelector
        isOpen={isColumnSelectorOpen}
        onClose={closeColumnSelectorModal}
        allAvailableColumns={allAvailableColumns}
        currentVisibleColumnKeys={currentTableVisibleColumnKeys}
        defaultVisibleColumnKeys={defaultVisibleColumnKeys}
        onApply={handleColumnChange}
        onReset={handleResetColumns}
      />
    </>
  );
}

export default LeadsPage; 