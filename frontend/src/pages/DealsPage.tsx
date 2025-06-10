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
import CreateDealModal from '../components/CreateDealModal';
import EditDealModal from '../components/EditDealModal';
import { SettingsIcon, ViewIcon as PageViewIcon } from '@chakra-ui/icons';
import { useAppStore } from '../stores/useAppStore';
import { useDealsStore, Deal } from '../stores/useDealsStore';
import { useViewPreferencesStore } from '../stores/useViewPreferencesStore';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';
import ColumnSelector from '../components/common/ColumnSelector';
import EmptyState from '../components/common/EmptyState';
import DealsKanbanPageLayout from '../components/deals/DealsKanbanPageLayout';
import UnifiedPageHeader from '../components/layout/UnifiedPageHeader';

import { useDealsPageModals } from '../hooks/useDealsPageModals';
import { useDealDataManagement } from '../hooks/useDealDataManagement';

import { useDealsTableColumns } from '../hooks/useDealsTableColumns.tsx';

import { useUserListStore } from '../stores/useUserListStore';
import { useFilteredDeals } from '../hooks/useFilteredDeals';
import { useThemeColors, useThemeStyles } from '../hooks/useThemeColors';
import { usePageLayoutStyles } from '../utils/headerUtils';
import { CustomFieldEntityType } from '../generated/graphql/graphql';

function DealsPage() {
  const navigate = useNavigate();
  const { 
    deals, 
    dealsLoading, 
    dealsError, 
    fetchDeals, 
    deleteDeal: deleteDealActionFromStore,
    dealsViewMode,
    setDealsViewMode
  } = useDealsStore();
  
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
    isEditModalOpen, openEditModal, closeEditModal, dealToEdit,
    isConfirmDeleteDialogOpen, openConfirmDeleteModal, closeConfirmDeleteModal,
    isColumnSelectorOpen, openColumnSelectorModal, closeColumnSelectorModal
  } = useDealsPageModals();

  const toast = useToast();

  const [dealIdPendingConfirmation, setDealIdPendingConfirmation] = useState<string | null>(null);

  const {
    dealCustomFieldDefinitions,
    customFieldsLoading,
    confirmDeleteHandler,
    isDeletingDeal,
    dealToDeleteId: activeDeletingDealId,
    clearDealToDeleteId
  } = useDealDataManagement({ deleteDealActionFromStore, initialDealsError: dealsError });

  const { users: userList, loading: usersLoading, error: usersError, fetchUsers, hasFetched: hasFetchedUsers } = useUserListStore();
  const [selectedAssignedUserIds, setSelectedAssignedUserIds] = useState<string[]>([]);

  // Search term state for the unified header
  const [searchTerm, setSearchTerm] = useState('');

  // NEW: Use semantic tokens instead of manual theme checking
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const pageLayoutStyles = usePageLayoutStyles(true); // true for statistics

  const TABLE_KEY = 'deals';

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  useEffect(() => {
    if (!hasFetchedUsers) {
      fetchUsers();
    }
  }, [fetchUsers, hasFetchedUsers]);

  const { standardColumns, actionsColumn, customFieldColumns } = useDealsTableColumns({
    dealCustomFieldDefinitions,
    handleEditClick: openEditModal,
    handleDeleteClick: (dealId: string) => {
      setDealIdPendingConfirmation(dealId);
      openConfirmDeleteModal();
    },
    userPermissions,
    currentUserId,
    activeDeletingDealId,
  });

  const allAvailableColumns = useMemo((): ColumnDefinition<Deal>[] => {
    const columnsToUse: ColumnDefinition<Deal>[] = [];
    if (standardColumns) columnsToUse.push(...standardColumns);
    if (customFieldColumns) columnsToUse.push(...customFieldColumns);
    if (actionsColumn) {
      columnsToUse.push(actionsColumn);
    }
    return columnsToUse;
  }, [standardColumns, customFieldColumns, actionsColumn]);

  const defaultVisibleColumnKeys = useMemo(() => [
    'name', 'project_id', 'person', 'organization', 'assignedToUser', 'stage', 'amount', 'expected_close_date', 'actions'
  ], []);

  useEffect(() => {
    if (allAvailableColumns.length > 0 && !customFieldsLoading) {
        initializeTable(TABLE_KEY, defaultVisibleColumnKeys);
    }
  }, [initializeTable, defaultVisibleColumnKeys, allAvailableColumns, customFieldsLoading]);

  const currentTableVisibleColumnKeys = tableColumnPreferences[TABLE_KEY]?.visibleColumnKeys || defaultVisibleColumnKeys;
  
  const visibleColumns = useMemo(() => {
    if (customFieldsLoading || !allAvailableColumns || allAvailableColumns.length === 0) return [];
    const availableKeysSet = new Set(allAvailableColumns.map((col: ColumnDefinition<Deal>) => String(col.key)));
    const validVisibleKeys = currentTableVisibleColumnKeys.filter((key: string) => availableKeysSet.has(key));
    
    const finalKeysToShow = validVisibleKeys.length > 0 
        ? validVisibleKeys 
        : defaultVisibleColumnKeys.filter((key: string) => availableKeysSet.has(key));

    return allAvailableColumns.filter((col: ColumnDefinition<Deal>) => finalKeysToShow.includes(String(col.key)));
  }, [allAvailableColumns, currentTableVisibleColumnKeys, customFieldsLoading, defaultVisibleColumnKeys]);
  
  const pageIsLoading = dealsLoading || customFieldsLoading;

  const displayedDeals = useFilteredDeals({
    deals,
    activeQuickFilterKey: null, // No more quick filters
    currentUserId,
    selectedAssignedUserIds,
    searchTerm,
  });
  
  // Calculate statistics for the header
  const totalValue = useMemo(() => displayedDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0), [displayedDeals]);
  const averageDealSize = useMemo(() => displayedDeals.length > 0 ? totalValue / displayedDeals.length : 0, [totalValue, displayedDeals.length]);
  const winRate = useMemo(() => {
    const closedDeals = displayedDeals.filter(d => d.currentWfmStep?.isFinalStep);
    const wonDeals = closedDeals.filter(d => d.currentWfmStep?.status?.name?.toLowerCase().includes('won')); // Fix: use status name instead of isWon
    return closedDeals.length > 0 ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0;
  }, [displayedDeals]);

  const statistics = [
    {
      label: 'Total Value',
      value: totalValue,
      formatter: (value: number | string) => new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      }).format(Number(value))
    },
    {
      label: 'Avg. Deal Size',
      value: averageDealSize,
      formatter: (value: number | string) => new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      }).format(Math.round(Number(value)))
    },
    {
      label: 'Win Rate',
      value: `${winRate}%`
    },
    {
      label: 'Open Deals',
      value: displayedDeals.filter(d => !d.currentWfmStep?.isFinalStep).length
    }
  ];

  const handleCreateDealClick = useCallback(() => {
    openCreateModal();
  }, [openCreateModal]);

  // NEW: Modern UX - Row click handler
  const handleRowClick = useCallback((deal: Deal) => {
    navigate(`/deals/${deal.id}`);
  }, [navigate]);

  // Secondary actions (column selector)
  const secondaryActions = dealsViewMode === 'table' ? (
    <Button 
      leftIcon={<SettingsIcon />} 
      onClick={openColumnSelectorModal}
      size="md"
      height="40px"
      minW="110px"
      {...styles.button.secondary}
    >
      Columns
    </Button>
  ) : null;

  if (dealsViewMode === 'kanban') {
    return (
      <>
      <DealsKanbanPageLayout
        displayedDeals={displayedDeals}
        pageIsLoading={pageIsLoading}
        dealsError={dealsError}
        handleCreateDealClick={handleCreateDealClick}
          activeQuickFilterKey={null} // No more quick filters
          setActiveQuickFilterKey={() => {}} // No-op function
          availableQuickFilters={[]} // Empty array
          selectedAssignedUserIds={selectedAssignedUserIds}
          setSelectedAssignedUserIds={setSelectedAssignedUserIds}
        userList={userList}
        usersLoading={usersLoading}
          userPermissions={userPermissions || []}
        dealsViewMode={dealsViewMode}
        setDealsViewMode={setDealsViewMode}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Modals - moved here so they work in kanban view too */}
        {isCreateModalOpen && (
          <CreateDealModal
            isOpen={isCreateModalOpen}
            onClose={closeCreateModal}
            onDealCreated={() => {
              closeCreateModal();
              fetchDeals();
              toast({ title: 'Deal created successfully', status: 'success', duration: 3000, isClosable: true });
            }}
          />
        )}

        {isEditModalOpen && dealToEdit && (
          <EditDealModal
            isOpen={isEditModalOpen}
            onClose={closeEditModal}
            deal={dealToEdit}
            onDealUpdated={() => {
              closeEditModal();
              fetchDeals();
              toast({ title: 'Deal updated successfully', status: 'success', duration: 3000, isClosable: true });
            }}
          />
        )}

        {isConfirmDeleteDialogOpen && dealIdPendingConfirmation && (
          <ConfirmationDialog
            isOpen={isConfirmDeleteDialogOpen}
            onClose={closeConfirmDeleteModal}
            title="Delete Deal"
            body="Are you sure you want to delete this deal? This action cannot be undone."
            confirmButtonText="Delete"
            confirmButtonColor="red"
            onConfirm={() => confirmDeleteHandler(dealIdPendingConfirmation)}
            isConfirmLoading={isDeletingDeal}
          />
        )}
      </>
    );
  }

  return (
    <>
      <UnifiedPageHeader
        title="Deals"
        showSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search deals..."
        primaryButtonLabel="New Deal"
        onPrimaryButtonClick={handleCreateDealClick}
        requiredPermission="deal:create"
        userPermissions={userPermissions || []}
        showViewModeSwitch={true}
        viewMode={dealsViewMode}
        onViewModeChange={setDealsViewMode}
        secondaryActions={secondaryActions}
        statistics={statistics}
      />

      <Box sx={pageLayoutStyles.container}>
        {pageIsLoading && (
          <VStack justify="center" align="center" minH="300px" w="100%">
            <Spinner 
              size="xl" 
              color={colors.interactive.default}
            />
          </VStack>
        )}
        
        {!pageIsLoading && dealsError && (
          <Alert 
            status="error" 
            variant="subtle"
            bg={colors.status.error}
            color={colors.text.onAccent}
          >
            <AlertIcon />
            {dealsError}
          </Alert>
        )}
        
        {!pageIsLoading && !dealsError && displayedDeals.length === 0 && (
            <EmptyState
              icon={PageViewIcon}
              title="No Deals Found"
              message="Get started by creating your first deal or try adjusting your search."
              actionButtonLabel="New Deal"
              onActionButtonClick={handleCreateDealClick}
              isActionButtonDisabled={!userPermissions?.includes('deal:create')}
            />
        )}
        
        {!pageIsLoading && !dealsError && displayedDeals.length > 0 && (
          <Box sx={pageLayoutStyles.content}>
            <SortableTable<Deal> 
              data={displayedDeals} 
              columns={visibleColumns} 
              initialSortKey="expected_close_date" 
              initialSortDirection="ascending"
              onRowClick={handleRowClick}
              excludeClickableColumns={['actions']}
            />
          </Box>
        )}
      </Box>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateDealModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onDealCreated={() => {
            closeCreateModal();
            fetchDeals();
            toast({ title: 'Deal created successfully', status: 'success', duration: 3000, isClosable: true });
          }}
        />
      )}

      {isEditModalOpen && dealToEdit && (
        <EditDealModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          deal={dealToEdit}
          onDealUpdated={() => {
            closeEditModal();
            fetchDeals();
            toast({ title: 'Deal updated successfully', status: 'success', duration: 3000, isClosable: true });
          }}
        />
      )}

      {isConfirmDeleteDialogOpen && dealIdPendingConfirmation && (
        <ConfirmationDialog
          isOpen={isConfirmDeleteDialogOpen}
          onClose={closeConfirmDeleteModal}
          title="Delete Deal"
          body="Are you sure you want to delete this deal? This action cannot be undone."
          confirmButtonText="Delete"
          confirmButtonColor="red"
          onConfirm={() => confirmDeleteHandler(dealIdPendingConfirmation)}
          isConfirmLoading={isDeletingDeal}
        />
      )}

      {isColumnSelectorOpen && (
        <ColumnSelector
          isOpen={isColumnSelectorOpen}
          onClose={closeColumnSelectorModal}
          allAvailableColumns={allAvailableColumns}
          currentVisibleColumnKeys={currentTableVisibleColumnKeys}
          defaultVisibleColumnKeys={defaultVisibleColumnKeys}
          onApply={(newVisibleKeys: string[]) => {
            setVisibleColumnKeys(TABLE_KEY, newVisibleKeys);
            closeColumnSelectorModal();
          }}
          onReset={() => resetTableToDefaults(TABLE_KEY, defaultVisibleColumnKeys)}
        />
      )}
    </>
  );
}

export default DealsPage; 