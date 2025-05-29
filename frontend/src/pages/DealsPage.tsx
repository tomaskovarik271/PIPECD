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
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import CreateDealModal from '../components/CreateDealModal';
import EditDealModal from '../components/EditDealModal';
import { SettingsIcon, LinkIcon, ViewIcon as PageViewIcon, SearchIcon, AddIcon } from '@chakra-ui/icons';
import { useAppStore } from '../stores/useAppStore';
import { useDealsStore, Deal } from '../stores/useDealsStore';
import { useViewPreferencesStore } from '../stores/useViewPreferencesStore';
import type { Person as GeneratedPerson, CustomFieldDefinition, CustomFieldValue, CustomFieldType as GQLCustomFieldType, StageType } from '../generated/graphql/graphql';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';
import ColumnSelector from '../components/common/ColumnSelector';
import EmptyState from '../components/common/EmptyState';
import DealsKanbanPageLayout from '../components/deals/DealsKanbanPageLayout';
import QuickFilterControls, { QuickFilter } from '../components/common/QuickFilterControls';
import { getLinkDisplayDetails, LinkDisplayDetails } from '../lib/utils/linkUtils';

import { useDealsPageModals } from '../hooks/useDealsPageModals';
import { useDealDataManagement } from '../hooks/useDealDataManagement';

import { useDealsTableColumns } from '../hooks/useDealsTableColumns.tsx';

import { useUserListStore, UserListItem } from '../stores/useUserListStore';
import { useFilteredDeals } from '../hooks/useFilteredDeals';
import { useThemeStore } from '../stores/useThemeStore';

function DealsPage() {
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
  
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  
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

  const [activeQuickFilterKey, setActiveQuickFilterKey] = useState<string | null>(null);

  const availableQuickFilters = useMemo((): QuickFilter[] => [
    { key: 'all', label: 'All Deals' },
    { key: 'myOpen', label: 'My Open Deals' },
    { key: 'closingThisMonth', label: 'Closing This Month' },
  ], []);

  const { users: userList, loading: usersLoading, error: usersError, fetchUsers, hasFetched: hasFetchedUsers } = useUserListStore();
  const [selectedAssignedUserId, setSelectedAssignedUserId] = useState<string | null>(null);

  // Search term state for table view header
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('[DealsPage] isCreateModalOpen changed to:', isCreateModalOpen);
  }, [isCreateModalOpen]);

  useEffect(() => {
    if (!hasFetchedUsers) {
      fetchUsers();
    }
  }, [fetchUsers, hasFetchedUsers]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleCreateDealClick = () => openCreateModal();
  const handleDataChanged = useCallback(() => fetchDeals(), [fetchDeals]);
  
  const handleEditClick = (deal: Deal) => openEditModal(deal);
  
  const handleDeleteClick = (dealId: string) => {
    setDealIdPendingConfirmation(dealId);
    openConfirmDeleteModal();
  };

  const onConfirmActualDelete = async () => {
    if (dealIdPendingConfirmation) {
      await confirmDeleteHandler(dealIdPendingConfirmation);
      closeConfirmDeleteModal();
      clearDealToDeleteId(); 
      setDealIdPendingConfirmation(null);
    }
  };

  const onCancelDelete = () => {
    closeConfirmDeleteModal();
    clearDealToDeleteId(); 
    setDealIdPendingConfirmation(null);
  }

  const TABLE_KEY = 'deals_list';

  const { standardColumns, actionsColumn: actionsColumnFromHook, customFieldColumns: customFieldColumnsFromHook } = useDealsTableColumns({
    dealCustomFieldDefinitions,
    handleEditClick,
    handleDeleteClick,
    userPermissions,
    currentUserId,
    activeDeletingDealId,
  });

  const allAvailableColumns = useMemo((): ColumnDefinition<Deal>[] => {
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

  const currentTableVisibleColumnKeys = tableColumnPreferences[TABLE_KEY]?.visibleColumnKeys || defaultVisibleColumnKeys;
  
  const visibleColumns = useMemo(() => {
    if (customFieldsLoading || !allAvailableColumns || allAvailableColumns.length === 0) return [];
    const availableKeysSet = new Set(allAvailableColumns.map(col => String(col.key)));
    const validVisibleKeys = currentTableVisibleColumnKeys.filter(key => availableKeysSet.has(key));
    
    const finalKeysToShow = validVisibleKeys.length > 0 
        ? validVisibleKeys 
        : defaultVisibleColumnKeys.filter(key => availableKeysSet.has(key));

    return allAvailableColumns.filter(col => finalKeysToShow.includes(String(col.key)));
  }, [allAvailableColumns, currentTableVisibleColumnKeys, customFieldsLoading, defaultVisibleColumnKeys]);
  
  const pageIsLoading = dealsLoading || customFieldsLoading;

  const displayedDeals = useFilteredDeals({
    deals,
    activeQuickFilterKey,
    currentUserId,
    selectedAssignedUserId,
    searchTerm,
  });
  
  // Modern Theme specific constants from DealsKanbanPageLayout
  const { currentTheme: currentThemeName } = useThemeStore();
  const isModernTheme = currentThemeName === 'modern';

  // Calculate sidebar width based on theme and collapsed state
  const modernThemeSidebarWidth = isSidebarCollapsed ? "70px" : "280px";
  const otherThemeSidebarWidth = isSidebarCollapsed ? "70px" : "200px";
  const actualSidebarWidth = isModernTheme ? modernThemeSidebarWidth : otherThemeSidebarWidth;

  const modernPageHeaderHeight = "auto";
  const modernHeaderPaddingY = "24px";
  const modernHeaderPaddingX = "32px";
  const modernButtonHeight = "40px";
  const modernButtonSize = "md";

  // Calculate totalValue and averageDealSize for StatGroup (as in DealsKanbanPageLayout)
  const totalValue = useMemo(() => displayedDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0), [displayedDeals]);
  const averageDealSize = useMemo(() => displayedDeals.length > 0 ? totalValue / displayedDeals.length : 0, [totalValue, displayedDeals.length]);

  // Determine actual header height for padding content below
  // This is a rough estimate, might need refinement based on StatGroup visibility
  const calculatedHeaderHeight = isModernTheme ? '150px' : '72px'; 

  if (dealsViewMode === 'kanban') {
    return (
      <DealsKanbanPageLayout
        displayedDeals={displayedDeals}
        pageIsLoading={pageIsLoading}
        dealsError={dealsError}
        handleCreateDealClick={handleCreateDealClick}
        activeQuickFilterKey={activeQuickFilterKey}
        setActiveQuickFilterKey={setActiveQuickFilterKey}
        availableQuickFilters={availableQuickFilters}
        selectedAssignedUserId={selectedAssignedUserId}
        setSelectedAssignedUserId={setSelectedAssignedUserId}
        userList={userList}
        usersLoading={usersLoading}
        userPermissions={userPermissions}
        dealsViewMode={dealsViewMode}
        setDealsViewMode={setDealsViewMode}
      />
    );
  }

  // TABLE VIEW
  return (
    <VStack spacing={0} align="stretch" w="100%" h="100%" bg={isModernTheme ? 'gray.900' : undefined}>
      {/* Fixed Header for Table View - Mirrored from DealsKanbanPageLayout */}
      <Flex
        direction={isModernTheme ? "column" : "row"}
        alignItems={isModernTheme ? "stretch" : "center"}
        justifyContent="space-between"
        py={isModernTheme ? modernHeaderPaddingY : 4}
        px={isModernTheme ? modernHeaderPaddingX : 6}
        bg={isModernTheme ? 'background.content' : { base: 'gray.50', _dark: 'gray.900' }}
        position="fixed"
        top="0"
        left={actualSidebarWidth}
        width={`calc(100% - ${actualSidebarWidth})`}
        minH={isModernTheme ? modernPageHeaderHeight : "72px"}
        zIndex="sticky"
        transition="left 0.2s ease-in-out, width 0.2s ease-in-out, background 0.2s ease-in-out"
        borderBottomWidth={isModernTheme ? "1px" : "1px"} 
        borderColor={isModernTheme ? 'border.default' : { base: 'gray.200', _dark: 'gray.700' }}
      >
        <Flex justifyContent="space-between" alignItems="center" mb={isModernTheme ? 4 : 0}>
          <Heading as="h2" size={isModernTheme ? "xl" : "lg"} color={isModernTheme ? 'text.default' : undefined}>
            Deals
          </Heading>
          <HStack spacing={isModernTheme ? 3 : 2}>
            {isModernTheme && ( // Search bar always shown in modern table view header
              <InputGroup size={modernButtonSize} maxW="220px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color={"gray.400"} />
                </InputLeftElement>
                <Input 
                  type="search" 
                  placeholder="Search deals..." 
                  borderRadius="md"
                  bg={"gray.700"}
                  color={"white"}
                  borderColor={"gray.500"}
                  height={modernButtonHeight}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  _placeholder={{ color: "gray.400" }}
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                />
              </InputGroup>
            )}
            <Select
              placeholder="Assigned User"
              size={isModernTheme ? modernButtonSize : "sm"}
              height={isModernTheme ? modernButtonHeight : undefined}
              value={selectedAssignedUserId || ''}
              onChange={(e) => setSelectedAssignedUserId(e.target.value || null)}
              isDisabled={usersLoading}
              minW={isModernTheme ? "160px" : "180px"}
              borderRadius="md"
              bg={isModernTheme ? "gray.700" : undefined}
              color={isModernTheme ? "white" : undefined}
              borderColor={isModernTheme ? "gray.500" : undefined}
              iconColor={isModernTheme ? "gray.400" : undefined}
              _focus={{
                borderColor: isModernTheme ? "blue.400" : undefined,
                boxShadow: isModernTheme ? "0 0 0 1px #3182ce" : undefined
              }}
            >
              <option value="">All Users</option>
              <option value="unassigned">Unassigned</option>
              {userList.map(user => (
                <option key={user.id} value={user.id}>
                  {user.display_name || user.email}
                </option>
              ))}
            </Select>

            <ButtonGroup size={isModernTheme ? modernButtonSize : "sm"} isAttached variant="outline">
              <Button 
                onClick={() => setDealsViewMode('table')} 
                isActive={true}
                height={isModernTheme ? modernButtonHeight : undefined}
                bg={isModernTheme ? "blue.600" : undefined}
                color={isModernTheme ? "white" : undefined}
                borderColor={isModernTheme ? "gray.500" : undefined}
                _hover={isModernTheme ? { bg: "gray.600", borderColor: "gray.400" } : {}}
                _active={isModernTheme ? { bg: "blue.700" } : {}}
              >
                Table
              </Button>
              <Button 
                onClick={() => setDealsViewMode('kanban')} 
                isActive={false}
                height={isModernTheme ? modernButtonHeight : undefined}
                bg={isModernTheme ? "gray.700" : undefined}
                color={isModernTheme ? "white" : undefined}
                borderColor={isModernTheme ? "gray.500" : undefined}
                _hover={isModernTheme ? { bg: "gray.600", borderColor: "gray.400" } : {}}
                _active={isModernTheme ? { bg: "blue.700" } : {}}
              >
                Kanban
              </Button>
            </ButtonGroup>

            <QuickFilterControls
              availableFilters={availableQuickFilters}
              activeFilterKey={activeQuickFilterKey}
              onSelectFilter={setActiveQuickFilterKey}
              isModernTheme={isModernTheme}
              buttonProps={isModernTheme ? {
                bg: "gray.700", color: "white", borderColor: "gray.500",
                size: modernButtonSize, height: modernButtonHeight,
                _hover: { bg: "gray.600", borderColor: "gray.400" },
                _active: { bg: "blue.600", borderColor: "blue.500" }
              } : {}}
            />
             <Button 
                leftIcon={<SettingsIcon />} 
                onClick={openColumnSelectorModal} 
                size={isModernTheme ? modernButtonSize : "sm"}
                height={isModernTheme ? modernButtonHeight : undefined}
                variant={isModernTheme ? "outline" : "outline"}
                bg={isModernTheme ? "gray.700" : undefined}
                color={isModernTheme ? "white" : undefined}
                borderColor={isModernTheme ? "gray.500" : undefined}
                _hover={isModernTheme ? { bg: "gray.600", borderColor: "gray.400" } : {}}
                minW={isModernTheme ? "auto" : undefined}
                px={isModernTheme ? 4 : undefined}
            >
                Columns
            </Button>
            <Button
              colorScheme={isModernTheme ? "brand" : "blue"}
              onClick={handleCreateDealClick}
              isDisabled={!userPermissions?.includes('deal:create')}
              size={isModernTheme ? modernButtonSize : "md"}
              height={isModernTheme ? modernButtonHeight : undefined}
              minW={isModernTheme ? "120px" : undefined}
              leftIcon={isModernTheme ? <AddIcon /> : undefined}
            >
              New Deal
            </Button>
          </HStack>
        </Flex>
        {isModernTheme && ( // StatGroup for modern theme table view
          <StatGroup mt={2} borderTopWidth="1px" borderColor="border.divider" pt={3}>
            <Stat>
              <StatLabel color="gray.300" fontWeight="medium">Total Value</StatLabel>
              <StatNumber fontSize="lg" color="white">${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="gray.300" fontWeight="medium">Avg. Deal Size</StatLabel>
              <StatNumber fontSize="lg" color="white">${averageDealSize.toLocaleString('en-US', { maximumFractionDigits: 0 })}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="gray.300" fontWeight="medium">Win Rate</StatLabel>
              <StatNumber fontSize="lg" color="white">--%</StatNumber> {/* Placeholder */}
            </Stat>
             <Stat>
              <StatLabel color="gray.300" fontWeight="medium">Open Deals</StatLabel>
              <StatNumber fontSize="lg" color="white">{displayedDeals.length}</StatNumber>
            </Stat>
          </StatGroup>
        )}
      </Flex>

      {/* Main Content Area for Table View */}
      <Box
        flexGrow={1}
        overflowY="auto"
        h="100%" // Ensure it takes available height
        pt={`calc(${calculatedHeaderHeight} + ${isModernTheme ? modernHeaderPaddingY : '1rem'})`} // Padding to account for fixed header
        px={isModernTheme ? modernHeaderPaddingX : 6}
        bg={isModernTheme ? 'gray.900' : undefined} // Match overall page background
      >
        {pageIsLoading && (
          <Flex justify="center" align="center" minH="300px" w="100%"><Spinner size="xl" color={isModernTheme ? 'white' : undefined} /></Flex>
        )}
        {!pageIsLoading && dealsError && (
          <Alert status="error" variant={isModernTheme ? "solidSubtle" : "subtle"} m={4}><AlertIcon />{dealsError}</Alert>
        )}
        {!pageIsLoading && !dealsError && displayedDeals.length === 0 && (
          <Box m={isModernTheme ? 0 : 4}> {/* No extra margin for modern theme as parent Box has padding */}
            <EmptyState
              icon={PageViewIcon}
              title="No Deals Found"
              message="Get started by creating your first deal or try a different filter."
              actionButtonLabel="New Deal"
              onActionButtonClick={handleCreateDealClick}
              isActionButtonDisabled={!userPermissions?.includes('deal:create')}
              isModernTheme={isModernTheme}
            />
          </Box>
        )}
        {!pageIsLoading && !dealsError && displayedDeals.length > 0 && (
          <Box 
            bg={isModernTheme ? 'gray.800' : undefined} 
            borderRadius={isModernTheme ? 'xl' : undefined}
            p={isModernTheme ? 6 : 0} // Padding inside the table's card-like container
          >
            <SortableTable<Deal> 
              data={displayedDeals} 
              columns={visibleColumns} 
              initialSortKey="expected_close_date" 
              initialSortDirection="ascending" 
            />
          </Box>
        )}
      </Box>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateDealModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onDealCreated={handleDataChanged}
        />
      )}
      {dealToEdit && isEditModalOpen && (
        <EditDealModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          deal={dealToEdit}
          onDealUpdated={handleDataChanged}
        />
      )}
      {isConfirmDeleteDialogOpen && (
        <ConfirmationDialog
          isOpen={isConfirmDeleteDialogOpen}
          onClose={onCancelDelete}
          onConfirm={onConfirmActualDelete}
          title="Delete Deal"
          body="Are you sure you want to delete this deal? This action cannot be undone."
          confirmButtonText="Delete"
          confirmButtonColor="red"
          isConfirmLoading={isDeletingDeal}
        />
      )}
      {isColumnSelectorOpen && (
        <ColumnSelector<Deal>
          isOpen={isColumnSelectorOpen}
          onClose={closeColumnSelectorModal}
          allAvailableColumns={allAvailableColumns}
          currentVisibleColumnKeys={currentTableVisibleColumnKeys}
          onApply={(newVisibleKeys: string[]) => {
            setVisibleColumnKeys(TABLE_KEY, newVisibleKeys);
            closeColumnSelectorModal();
          }}
          onReset={() => {
            resetTableToDefaults(TABLE_KEY, defaultVisibleColumnKeys);
          }}
          defaultVisibleColumnKeys={defaultVisibleColumnKeys}
        />
      )}
    </VStack>
  );
}

export default DealsPage; 