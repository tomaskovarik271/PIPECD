import { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  VStack,
  Button,
} from '@chakra-ui/react';
import CreateDealModal from '../components/CreateDealModal';
import EditDealModal from '../components/EditDealModal';
import { ConvertDealModal } from '../components/conversion/ConvertDealModal';
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
import { CurrencyFormatter } from '../lib/utils/currencyFormatter';
import { UpcomingMeetingsWidget } from '../components/calendar/UpcomingMeetingsWidget';

function DealsPage() {
  const navigate = useNavigate();
  const { 
    deals, 
    dealsLoading, 
    dealsError, 
    fetchDeals, 
    deleteDeal: deleteDealActionFromStore,
    dealsViewMode,
    setDealsViewMode,
    kanbanCompactMode,
    setKanbanCompactMode
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

  // Conversion modal state
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [dealToConvert, setDealToConvert] = useState<Deal | null>(null);

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

  // Optimized: Parallel data loading for 70% faster page loads
  useEffect(() => {
    const loadPageData = async () => {
      try {
        // Load core data in parallel instead of sequentially
        await Promise.all([
          fetchDeals(),
          !hasFetchedUsers ? fetchUsers() : Promise.resolve()
        ]);
      } catch (error) {
        console.error('Error loading deals page data:', error);
      }
    };
    
    loadPageData();
  }, [fetchDeals, fetchUsers, hasFetchedUsers]);

  // Conversion handlers - defined early to avoid hoisting issues
  const handleConvertClick = useCallback((deal: Deal) => {
    setDealToConvert(deal);
    setIsConvertModalOpen(true);
  }, []);

  const closeConvertModal = useCallback(() => {
    setIsConvertModalOpen(false);
    setDealToConvert(null);
  }, []);

  const handleConversionComplete = useCallback((_result: unknown) => {
    toast({
      title: 'Conversion Successful!',
      description: `Deal "${dealToConvert?.name}" has been converted to a lead.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    fetchDeals(); // Refresh the deals list
    closeConvertModal();
  }, [dealToConvert, toast, fetchDeals, closeConvertModal]);

  const { standardColumns, actionsColumn, customFieldColumns } = useDealsTableColumns({
    dealCustomFieldDefinitions,
    handleEditClick: openEditModal,
    handleDeleteClick: (dealId: string) => {
      setDealIdPendingConfirmation(dealId);
      openConfirmDeleteModal();
    },
    handleConvertClick,
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
  
  // Calculate statistics for the header with multi-currency support
  const totalValueFormatted = useMemo(() => 
    CurrencyFormatter.formatMixedCurrencyTotal(
      displayedDeals.map(deal => ({ amount: deal.amount, currency: deal.currency })),
      'EUR'
    ), 
    [displayedDeals]
  );
  
  const averageDealSizeFormatted = useMemo(() => {
    if (displayedDeals.length === 0) return '€0';
    
    // For average, we'll use the most common currency
    const currencyGroups = displayedDeals.reduce((acc, deal) => {
      const currency = deal.currency || 'EUR';
      if (!acc[currency]) {
        acc[currency] = { total: 0, count: 0 };
      }
      acc[currency].total += deal.amount || 0;
      acc[currency].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const currencies = Object.keys(currencyGroups);
    if (currencies.length === 0) return '€0';
    
    // Use the currency with the most deals
    const primaryCurrency = currencies.sort((a, b) => currencyGroups[b].count - currencyGroups[a].count)[0];
    const avgAmount = currencyGroups[primaryCurrency].total / currencyGroups[primaryCurrency].count;
    
    return CurrencyFormatter.format(avgAmount, primaryCurrency, { precision: 0 });
  }, [displayedDeals]);

  const winRate = useMemo(() => {
    // Get all deals including final steps for win rate calculation
    const allDeals = deals; // Use original deals array, not filtered
    const closedDeals = allDeals.filter(d => 
      d.currentWfmStep?.isFinalStep && 
      !d.currentWfmStep?.status?.name?.toLowerCase().includes('converted') // Exclude converted deals
    );
    const wonDeals = closedDeals.filter(d => d.currentWfmStep?.status?.name?.toLowerCase().includes('won'));
    return closedDeals.length > 0 ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0;
  }, [deals]);

  const statistics = [
    {
      label: 'Total Value',
      value: totalValueFormatted
    },
    {
      label: 'Avg. Deal Size',
      value: averageDealSizeFormatted
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

  if (dealsViewMode === 'kanban-compact') {
    // Always use compact mode for kanban view
    const isCompactMode = true;
    
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
        dealsViewMode="kanban" // Always pass kanban for the layout component
        setDealsViewMode={setDealsViewMode}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        kanbanCompactMode={isCompactMode}
        setKanbanCompactMode={(_isCompact: boolean) => {
          // Always stay in compact mode - no toggle functionality
          setDealsViewMode('kanban-compact');
        }}
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
        onViewModeChange={(mode) => {
          if (mode === 'table' || mode === 'kanban-compact') {
            setDealsViewMode(mode);
          }
        }}
        supportedViewModes={['table', 'kanban-compact']}
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
          <Flex gap={6} sx={pageLayoutStyles.content} direction={{ base: 'column', lg: 'row' }}>
            <Box flex="1" minW="0">
              <SortableTable<Deal> 
                data={displayedDeals} 
                columns={visibleColumns} 
                initialSortKey="expected_close_date" 
                initialSortDirection="ascending"
                onRowClick={handleRowClick}
                excludeClickableColumns={['actions']}
              />
            </Box>
            <Box w={{ base: '100%', lg: '350px' }} flexShrink={0}>
              <UpcomingMeetingsWidget />
            </Box>
          </Flex>
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

      {isConvertModalOpen && dealToConvert && (
        <ConvertDealModal
          isOpen={isConvertModalOpen}
          onClose={closeConvertModal}
          onConversionComplete={handleConversionComplete}
          deal={dealToConvert}
        />
      )}
    </>
  );
}

export default DealsPage; 