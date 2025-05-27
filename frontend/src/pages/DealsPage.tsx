import { useEffect, useCallback, useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  HStack,
  useToast,
  VStack,
  Flex,
  ButtonGroup,
  Link,
  Icon,
} from '@chakra-ui/react';
import CreateDealModal from '../components/CreateDealModal';
import EditDealModal from '../components/EditDealModal';
import { SettingsIcon, LinkIcon, ViewIcon as PageViewIcon } from '@chakra-ui/icons';
import { useAppStore } from '../stores/useAppStore';
import { useDealsStore, Deal } from '../stores/useDealsStore';
import { useViewPreferencesStore } from '../stores/useViewPreferencesStore';
import type { Person as GeneratedPerson, CustomFieldDefinition, CustomFieldValue, CustomFieldType as GQLCustomFieldType, StageType } from '../generated/graphql/graphql';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import ListPageLayout from '../components/layout/ListPageLayout';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';
import ColumnSelector from '../components/common/ColumnSelector';
import EmptyState from '../components/common/EmptyState';
import DealsKanbanView from '../components/deals/DealsKanbanView';
import QuickFilterControls, { QuickFilter } from '../components/common/QuickFilterControls';
import { getLinkDisplayDetails, LinkDisplayDetails } from '../lib/utils/linkUtils';

// Import the new hooks
import { useDealsPageModals } from '../hooks/useDealsPageModals';
import { useDealDataManagement } from '../hooks/useDealDataManagement';

// Import the new view components
import DealsTableView from '../components/deals/DealsTableView';
import DealsKanbanPageView from '../components/deals/DealsKanbanPageView';

// Import the new hook for columns
import { useDealsTableColumns } from '../hooks/useDealsTableColumns.tsx';

function DealsPage() {
  const { 
    deals, 
    dealsLoading, 
    dealsError, 
    fetchDeals, 
    deleteDeal: deleteDealActionFromStore, // Renamed for clarity
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
  
  // Use the new hooks
  const {
    isCreateModalOpen, openCreateModal, closeCreateModal,
    isEditModalOpen, openEditModal, closeEditModal, dealToEdit,
    isConfirmDeleteDialogOpen, openConfirmDeleteModal, closeConfirmDeleteModal,
    isColumnSelectorOpen, openColumnSelectorModal, closeColumnSelectorModal
  } = useDealsPageModals();

  const toast = useToast(); // Keep toast here if page-level notifications are still needed, or move if fully handled by hooks

  // dealToDeleteId for connecting modal open action with data management hook
  const [dealIdPendingConfirmation, setDealIdPendingConfirmation] = useState<string | null>(null);

  const {
    dealCustomFieldDefinitions,
    customFieldsLoading,
    confirmDeleteHandler, // This is the async function that performs delete
    isDeletingDeal,       // Boolean indicating if delete is in progress
    dealToDeleteId: activeDeletingDealId, // ID of deal being processed by confirmDeleteHandler
    clearDealToDeleteId
  } = useDealDataManagement({ deleteDealActionFromStore, initialDealsError: dealsError });

  // Local state for quick filters remains for now
  const [activeQuickFilterKey, setActiveQuickFilterKey] = useState<string | null>(null);

  const availableQuickFilters = useMemo((): QuickFilter[] => [
    { key: 'all', label: 'All Deals' },
    { key: 'myOpen', label: 'My Open Deals' },
    { key: 'closingThisMonth', label: 'Closing This Month' },
  ], []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleCreateDealClick = () => openCreateModal();
  const handleDataChanged = useCallback(() => fetchDeals(), [fetchDeals]);
  
  const handleEditClick = (deal: Deal) => openEditModal(deal);
  
  const handleDeleteClick = (dealId: string) => {
    setDealIdPendingConfirmation(dealId); // Set the ID that we intend to delete
    openConfirmDeleteModal();      // Open the confirmation dialog
  };

  // handleConfirmDelete is now mostly within useDealDataManagement
  // The page component orchestrates opening the dialog and then calling the handler
  const onConfirmActualDelete = async () => {
    if (dealIdPendingConfirmation) {
      await confirmDeleteHandler(dealIdPendingConfirmation);
      closeConfirmDeleteModal();
      clearDealToDeleteId(); // Clear ID in the data management hook
      setDealIdPendingConfirmation(null); // Clear our temporary pending ID
    }
  };

  const onCancelDelete = () => {
    closeConfirmDeleteModal();
    clearDealToDeleteId(); // Clear ID in the data management hook if it was set
    setDealIdPendingConfirmation(null); // Ensure this uses the correct setter
  }

  const TABLE_KEY = 'deals_list';

  // Get columns from the new hook
  const { standardColumns, actionsColumn: actionsColumnFromHook, customFieldColumns: customFieldColumnsFromHook } = useDealsTableColumns({
    dealCustomFieldDefinitions,
    handleEditClick, // Pass the function
    handleDeleteClick, // Pass the function
    userPermissions,
    currentUserId,
    activeDeletingDealId,
  });

  const allAvailableColumns = useMemo((): ColumnDefinition<Deal>[] => {
    // customFieldColumns definition is now removed from here.
    const columnsToUse: ColumnDefinition<Deal>[] = [];
    if (standardColumns) columnsToUse.push(...standardColumns);
    if (customFieldColumnsFromHook) columnsToUse.push(...customFieldColumnsFromHook);
    if (actionsColumnFromHook) {
      columnsToUse.push(actionsColumnFromHook);
    }
    return columnsToUse;
  }, [standardColumns, customFieldColumnsFromHook, actionsColumnFromHook]);

  const defaultVisibleColumnKeys = useMemo(() => [
    'name', 'person', 'organization', 'assignedToUser', 'stage', 'amount', 'expected_close_date', 'actions'
  ], []);

  useEffect(() => {
    if (allAvailableColumns.length > 0 && !customFieldsLoading) {
        initializeTable(TABLE_KEY, defaultVisibleColumnKeys);
    }
  }, [initializeTable, defaultVisibleColumnKeys, allAvailableColumns, customFieldsLoading]);

  const currentVisibleColumnKeys = tableColumnPreferences[TABLE_KEY]?.visibleColumnKeys || defaultVisibleColumnKeys;
  
  const visibleColumns = useMemo(() => {
    if (customFieldsLoading || !allAvailableColumns || allAvailableColumns.length === 0) return [];
    const availableKeysSet = new Set(allAvailableColumns.map(col => String(col.key)));
    const validVisibleKeys = currentVisibleColumnKeys.filter(key => availableKeysSet.has(key));
    
    const finalKeysToShow = validVisibleKeys.length > 0 
        ? validVisibleKeys 
        : defaultVisibleColumnKeys.filter(key => availableKeysSet.has(key));

    return allAvailableColumns.filter(col => finalKeysToShow.includes(String(col.key)));
  }, [allAvailableColumns, currentVisibleColumnKeys, customFieldsLoading, defaultVisibleColumnKeys]);

  const emptyStatePropsForLayout = { 
    icon: PageViewIcon, 
    title: "No Deals Found", 
    message: "Get started by creating your first deal or try a different filter.",
  };
  
  const pageIsLoading = dealsLoading || customFieldsLoading;

  const displayedDeals = useMemo(() => {
    let filtered = deals;
    if (activeQuickFilterKey && activeQuickFilterKey !== 'all') {
      filtered = deals.filter(deal => {
        switch (activeQuickFilterKey) {
          case 'myOpen':
            return deal.user_id === currentUserId && deal.currentWfmStep && !deal.currentWfmStep.isFinalStep;
          case 'closingThisMonth': {
            if (!deal.expected_close_date) return false;
            const closeDate = new Date(deal.expected_close_date);
            const today = new Date();
            return closeDate.getFullYear() === today.getFullYear() && closeDate.getMonth() === today.getMonth();
          }
          default:
            return true;
        }
      });
    }
    return filtered;
  }, [deals, activeQuickFilterKey, currentUserId]);

  // For List View
  const listPageContent = (
    <ListPageLayout
      title="Deals"
      newButtonLabel="New Deal"
      onNewButtonClick={handleCreateDealClick}
      isNewButtonDisabled={!userPermissions?.includes('deal:create')}
      isLoading={pageIsLoading}
      error={dealsError}
      isEmpty={!pageIsLoading && !dealsError && displayedDeals.length === 0}
      emptyStateProps={emptyStatePropsForLayout} // Use the simplified props
      customControls={
        <HStack spacing={2} my={2}>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button onClick={() => setDealsViewMode('table')} isActive={dealsViewMode === 'table'}>Table</Button>
            <Button onClick={() => setDealsViewMode('kanban')} isActive={dealsViewMode === 'kanban'}>Kanban</Button>
          </ButtonGroup>
          <QuickFilterControls
            availableFilters={availableQuickFilters}
            activeFilterKey={activeQuickFilterKey}
            onSelectFilter={setActiveQuickFilterKey}
          />
          <Button leftIcon={<SettingsIcon />} onClick={openColumnSelectorModal} size="sm" variant="outline">
            Columns
          </Button>
        </HStack>
      }
    >
      {!pageIsLoading && !dealsError && displayedDeals.length > 0 && (
        <SortableTable<Deal> 
          data={displayedDeals} 
          columns={visibleColumns} 
          initialSortKey="expected_close_date" 
          initialSortDirection="ascending" 
        />
      )}
    </ListPageLayout>
  );

  // For Kanban View
  const kanbanPageContent = (
    <VStack spacing={4} align="stretch" w="100%">
      <Flex justifyContent="space-between" alignItems="center" mb={0} mt={2} px={6}>
        <Heading as="h2" size="lg">
          Deals
        </Heading>
        <HStack spacing={2}>
         <ButtonGroup size="sm" isAttached variant="outline">
            <Button onClick={() => setDealsViewMode('table')} isActive={dealsViewMode === 'table'}>Table</Button>
            <Button onClick={() => setDealsViewMode('kanban')} isActive={dealsViewMode === 'kanban'}>Kanban</Button>
          </ButtonGroup>
          <QuickFilterControls
            availableFilters={availableQuickFilters}
            activeFilterKey={activeQuickFilterKey}
            onSelectFilter={setActiveQuickFilterKey}
          />
          <Button 
            colorScheme="blue"
            onClick={handleCreateDealClick}
            isDisabled={!userPermissions?.includes('deal:create')}
            size="md"
          >
            New Deal
          </Button>
        </HStack>
      </Flex>
      {pageIsLoading && (
        <Flex justify="center" align="center" minH="200px"><Spinner size="xl" /></Flex>
      )}
      {!pageIsLoading && dealsError && (
        <Alert status="error" mx={6}><AlertIcon />{dealsError}</Alert>
      )}
      {!pageIsLoading && !dealsError && displayedDeals.length === 0 && (
        <Box mx={6}>
          <EmptyState 
            icon={PageViewIcon} 
            title="No Deals Found" 
            message="Get started by creating your first deal or try a different filter." 
            actionButtonLabel="New Deal"
            onActionButtonClick={handleCreateDealClick}
            isActionButtonDisabled={!userPermissions?.includes('deal:create')}
          />
        </Box>
      )}
      {!pageIsLoading && !dealsError && displayedDeals.length > 0 && (
        <DealsKanbanView />
      )}
    </VStack>
  );

  return (
    <Box w="100%">
      {dealsViewMode === 'table' ? (
        <DealsTableView
          deals={displayedDeals}
          columns={visibleColumns}
          isLoading={pageIsLoading}
          error={dealsError}
          onNewButtonClick={handleCreateDealClick}
          userPermissions={userPermissions}
          emptyStateProps={emptyStatePropsForLayout}
          onOpenColumnSelector={openColumnSelectorModal}
          dealsViewMode={dealsViewMode}
          onSetDealsViewMode={setDealsViewMode}
          availableQuickFilters={availableQuickFilters}
          activeQuickFilterKey={activeQuickFilterKey}
          onSelectQuickFilter={setActiveQuickFilterKey}
        />
      ) : (
        <DealsKanbanPageView
          deals={displayedDeals}
          isLoading={pageIsLoading}
          error={dealsError}
          onNewButtonClick={handleCreateDealClick}
          userPermissions={userPermissions}
          dealsViewMode={dealsViewMode}
          onSetDealsViewMode={setDealsViewMode}
          availableQuickFilters={availableQuickFilters}
          activeQuickFilterKey={activeQuickFilterKey}
          onSelectQuickFilter={setActiveQuickFilterKey}
        />
      )}
      {/* Modals and Dialogs are siblings to the view content */}
      <CreateDealModal isOpen={isCreateModalOpen} onClose={closeCreateModal} onDealCreated={handleDataChanged} />
      {isEditModalOpen && dealToEdit && <EditDealModal deal={dealToEdit} isOpen={isEditModalOpen} onClose={closeEditModal} onDealUpdated={handleDataChanged} />}
      <ConfirmationDialog 
        isOpen={isConfirmDeleteDialogOpen} 
        onClose={onCancelDelete}
        onConfirm={onConfirmActualDelete}
        title="Delete Deal"
        body="Are you sure you want to delete this deal?"
        confirmButtonText="Delete" 
        confirmButtonColor="red" 
        isConfirmLoading={isDeletingDeal}
      />
      
      {isColumnSelectorOpen && allAvailableColumns.length > 0 && dealsViewMode === 'table' && (
        <ColumnSelector<Deal>
          isOpen={isColumnSelectorOpen}
          onClose={closeColumnSelectorModal}
          allAvailableColumns={allAvailableColumns}
          currentVisibleColumnKeys={currentVisibleColumnKeys}
          defaultVisibleColumnKeys={defaultVisibleColumnKeys}
          onApply={(newKeys) => setVisibleColumnKeys(TABLE_KEY, newKeys)}
          onReset={() => resetTableToDefaults(TABLE_KEY, defaultVisibleColumnKeys)}
        />
      )}
    </Box>
  );
}

export default DealsPage; 