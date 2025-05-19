import { useEffect, useCallback, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Button,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  IconButton,
  HStack,
  useToast,
  VStack,
  Flex,
  ButtonGroup,
} from '@chakra-ui/react';
import CreateDealModal from '../components/CreateDealModal';
import EditDealModal from '../components/EditDealModal';
import { EditIcon, DeleteIcon, ViewIcon, SettingsIcon } from '@chakra-ui/icons';
import { useAppStore } from '../stores/useAppStore';
import { useDealsStore, Deal } from '../stores/useDealsStore';
import { useViewPreferencesStore } from '../stores/useViewPreferencesStore';
import type { Person as GeneratedPerson, CustomFieldDefinition, CustomFieldValue, CustomFieldType as GQLCustomFieldType } from '../generated/graphql/graphql';
import { gqlClient } from '../lib/graphqlClient';
import { gql } from 'graphql-request';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import ListPageLayout from '../components/layout/ListPageLayout';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';
import ColumnSelector from '../components/common/ColumnSelector';
import EmptyState from '../components/common/EmptyState';
import DealsKanbanView from '../components/deals/DealsKanbanView';
import QuickFilterControls, { QuickFilter } from '../components/common/QuickFilterControls';
import type { StageType } from '../generated/graphql/graphql';

const isUrl = (str: string): boolean => {
  try {
    new URL(str);
    return str.startsWith('http://') || str.startsWith('https://');
  } catch (_) {
    return false;
  }
};

const GET_DEAL_CUSTOM_FIELD_DEFS_QUERY = gql`
  query GetDealCustomFieldDefinitions {
    customFieldDefinitions(entityType: DEAL, includeInactive: false) {
      id
      fieldName
      fieldLabel
      fieldType
      dropdownOptions { value label }
    }
  }
`;

function DealsPage() {
  const { 
    deals, 
    dealsLoading, 
    dealsError, 
    fetchDeals, 
    deleteDeal: deleteDealAction,
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
  
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const toast = useToast();

  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [dealToDeleteId, setDealToDeleteId] = useState<string | null>(null);
  const { isOpen: isColumnSelectorOpen, onOpen: onColumnSelectorOpen, onClose: onColumnSelectorClose } = useDisclosure();

  const [dealCustomFieldDefinitions, setDealCustomFieldDefinitions] = useState<CustomFieldDefinition[]>([]);
  const [customFieldsLoading, setCustomFieldsLoading] = useState<boolean>(true);

  const [activeQuickFilterKey, setActiveQuickFilterKey] = useState<string | null>(null);

  // Define Quick Filters for Deals
  const availableQuickFilters = useMemo((): QuickFilter[] => [
    { key: 'all', label: 'All Deals' },
    { key: 'myOpen', label: 'My Open Deals' },
    { key: 'closingThisMonth', label: 'Closing This Month' },
  ], []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  useEffect(() => {
    const fetchCustomFieldDefs = async () => {
      setCustomFieldsLoading(true);
      try {
        const data = await gqlClient.request<{ customFieldDefinitions: CustomFieldDefinition[] }>(GET_DEAL_CUSTOM_FIELD_DEFS_QUERY);
        setDealCustomFieldDefinitions(data.customFieldDefinitions || []);
      } catch (error) {
        console.error("Error fetching deal custom field definitions:", error);
        toast({ title: 'Error loading custom field definitions', status: 'error', duration: 3000, isClosable: true });
      } finally {
        setCustomFieldsLoading(false);
      }
    };
    fetchCustomFieldDefs();
  }, [toast]);

  const handleCreateDealClick = () => onCreateModalOpen();
  const handleDataChanged = useCallback(() => fetchDeals(), [fetchDeals]);
  const handleEditClick = (deal: Deal) => { setDealToEdit(deal); onEditModalOpen(); };
  const handleDeleteClick = (dealId: string) => { setDealToDeleteId(dealId); onConfirmDeleteOpen(); };

  const handleConfirmDelete = async () => {
    if (!dealToDeleteId) return;
    setDeletingRowId(dealToDeleteId);
    const success = await deleteDealAction(dealToDeleteId);
    setDeletingRowId(null);
    onConfirmDeleteClose();
    setDealToDeleteId(null);
    if (success) toast({ title: 'Deal deleted.', status: 'success', duration: 3000, isClosable: true });
    else toast({ title: 'Error Deleting Deal', description: dealsError || 'An unknown error occurred', status: 'error', duration: 5000, isClosable: true });
  };

  const formatPersonName = (person: GeneratedPerson | null | undefined): string => {
    if (!person) return '-';
    return person.last_name && person.first_name ? `${person.last_name}, ${person.first_name}` : person.first_name || person.last_name || person.email || 'Unnamed Person';
  };
  const formatDate = (dateString: string | null | undefined) => dateString ? new Date(dateString).toLocaleDateString() : '-';
  const formatCurrency = (amount: number | null | undefined) => amount != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount) : '-';

  const TABLE_KEY = 'deals_list';

  const allAvailableColumns = useMemo((): ColumnDefinition<Deal>[] => {
    const standardColumns: ColumnDefinition<Deal>[] = [
      { key: 'name', header: 'Name', renderCell: (d) => d.name, isSortable: true },
      { key: 'person', header: 'Person', renderCell: (d) => formatPersonName(d.person as GeneratedPerson | null | undefined), isSortable: true, sortAccessor: (d) => formatPersonName(d.person as GeneratedPerson | null | undefined).toLowerCase() },
      { key: 'organization', header: 'Organization', renderCell: (d) => d.organization?.name || '-', isSortable: true, sortAccessor: (d) => d.organization?.name?.toLowerCase() },
      { key: 'stage', header: 'Stage / Pipeline', renderCell: (d) => (<VStack align="start" spacing={0}><Text fontWeight="medium">{d.stage?.name || '-'}</Text><Text fontSize="xs" color="gray.500">{d.stage?.pipeline?.name || 'N/A'}</Text></VStack>), isSortable: true, sortAccessor: (d) => d.stage?.name?.toLowerCase() ?? '' },
      { key: 'amount', header: 'Amount', renderCell: (d) => formatCurrency(d.amount), isSortable: true, isNumeric: true, sortAccessor: (d) => d.amount },
      { key: 'deal_specific_probability', header: 'Specific Prob. (%)', renderCell: (d) => d.deal_specific_probability != null ? `${Math.round(d.deal_specific_probability * 100)}%` : '-', isSortable: true, sortAccessor: (d) => d.deal_specific_probability },
      { key: 'weighted_amount', header: 'Weighted Amount', renderCell: (d) => formatCurrency(d.weighted_amount), isSortable: true, isNumeric: true, sortAccessor: (d) => d.weighted_amount },
      { key: 'expected_close_date', header: 'Expected Close', renderCell: (d) => formatDate(d.expected_close_date), isSortable: true, sortAccessor: (d) => d.expected_close_date ? new Date(d.expected_close_date).getTime() : 0 },
      { key: 'created_at', header: 'Created', renderCell: (d) => formatDate(d.created_at), isSortable: true, sortAccessor: (d) => d.created_at ? new Date(d.created_at).getTime() : 0 },
    ];

    const customFieldColumns: ColumnDefinition<Deal>[] = dealCustomFieldDefinitions.map(def => ({
      key: `cf_${def.fieldName}`,
      header: def.fieldLabel,
      isSortable: true, 
      sortAccessor: (deal: Deal) => {
        const cfValue = deal.customFieldValues?.find(cf => cf.definition.fieldName === def.fieldName);
        if (!cfValue) return '';
        switch (def.fieldType) {
          case 'TEXT': return cfValue.stringValue?.toLowerCase() || '';
          case 'NUMBER': return cfValue.numberValue || 0;
          case 'DATE': return cfValue.dateValue ? new Date(cfValue.dateValue).getTime() : 0;
          case 'BOOLEAN': return cfValue.booleanValue ? 'true' : 'false';
          default: return cfValue.stringValue?.toLowerCase() || '';
        }
      },
      renderCell: (deal: Deal) => {
        const cfValue = deal.customFieldValues?.find(cf => cf.definition.fieldName === def.fieldName);
        if (!cfValue) return '-';
        let displayValue: React.ReactNode = '-';
        const { stringValue, numberValue, booleanValue, dateValue, selectedOptionValues } = cfValue;

        switch (def.fieldType) {
          case 'TEXT': 
            displayValue = stringValue || '-'; 
            if (stringValue && isUrl(stringValue)) {
              displayValue = <a href={stringValue} target="_blank" rel="noopener noreferrer" style={{color: 'blue.500', textDecoration: 'underline'}}>{stringValue}</a>;
            }
            break;
          case 'NUMBER': displayValue = numberValue?.toString() ?? '-'; break;
          case 'DATE': displayValue = dateValue ? new Date(dateValue).toLocaleDateString() : '-'; break;
          case 'BOOLEAN': displayValue = booleanValue ? 'Yes' : 'No'; break;
          case 'DROPDOWN': 
            const optValD = stringValue; 
            const optD = def.dropdownOptions?.find(o => o.value === optValD); 
            displayValue = optD?.label || optValD || '-'; 
            break;
          case 'MULTI_SELECT': 
            const sVals = selectedOptionValues || []; 
            displayValue = sVals.map(v => def.dropdownOptions?.find(o => o.value === v)?.label || v).join(', ') || '-'; 
            break;
          default: displayValue = stringValue || '-';
        }
        return displayValue;
      },
    }));

    const actionsColumn: ColumnDefinition<Deal> = {
      key: 'actions',
      header: 'Actions',
      renderCell: (deal) => (
        <HStack spacing={2}>
          <IconButton as={Link} to={`/deals/${deal.id}`} aria-label="View deal" icon={<ViewIcon />} size="sm" variant="ghost" />
          <IconButton 
            aria-label="Edit deal" 
            icon={<EditIcon />} 
            size="sm" 
            variant="ghost" 
            onClick={() => handleEditClick(deal)} 
            isDisabled={
              !!deletingRowId ||
              !(userPermissions?.includes('deal:update_any') || (userPermissions?.includes('deal:update_own') && deal.user_id === currentUserId))
            } 
          />
          <IconButton 
            aria-label="Delete deal" 
            icon={<DeleteIcon />} 
            colorScheme="red" 
            size="sm" 
            variant="ghost" 
            onClick={() => handleDeleteClick(deal.id)} 
            isLoading={deletingRowId === deal.id}
            isDisabled={
              (!!deletingRowId && deletingRowId !== deal.id) ||
              !(userPermissions?.includes('deal:delete_any') || (userPermissions?.includes('deal:delete_own') && deal.user_id === currentUserId))
            } 
          />
        </HStack>
      ),
      isSortable: false,
    };
    return [...standardColumns, ...customFieldColumns, actionsColumn];
  }, [dealCustomFieldDefinitions, userPermissions, currentUserId, deletingRowId, handleEditClick, handleDeleteClick]);

  const defaultVisibleColumnKeys = useMemo(() => [
    'name', 'person', 'organization', 'stage', 'amount', 'expected_close_date', 'actions'
  ], []);

  useEffect(() => {
    if (allAvailableColumns.length > 0 && !customFieldsLoading) {
        initializeTable(TABLE_KEY, defaultVisibleColumnKeys);
    }
  }, [initializeTable, defaultVisibleColumnKeys, allAvailableColumns, customFieldsLoading]);

  const currentVisibleColumnKeys = tableColumnPreferences[TABLE_KEY]?.visibleColumnKeys || defaultVisibleColumnKeys;
  
  const visibleColumns = useMemo(() => {
    if (customFieldsLoading || allAvailableColumns.length === 0) return [];
    // Ensure that currentVisibleColumnKeys refers to existing columns in allAvailableColumns to prevent errors
    const availableKeysSet = new Set(allAvailableColumns.map(col => String(col.key)));
    const validVisibleKeys = currentVisibleColumnKeys.filter(key => availableKeysSet.has(key));
    
    const finalKeysToShow = validVisibleKeys.length > 0 
        ? validVisibleKeys 
        : defaultVisibleColumnKeys.filter(key => availableKeysSet.has(key));

    return allAvailableColumns.filter(col => finalKeysToShow.includes(String(col.key)));
  }, [allAvailableColumns, currentVisibleColumnKeys, customFieldsLoading, defaultVisibleColumnKeys]);

  const emptyStatePropsForLayout = { 
    icon: ViewIcon, // Consider a more specific icon for Deals
    title: "No Deals Found", 
    message: "Get started by creating your first deal or try a different filter.",
    // actionButtonLabel etc. are handled by ListPageLayout
  };
  
  const pageIsLoading = dealsLoading || customFieldsLoading;

  const displayedDeals = useMemo(() => {
    let filtered = deals;
    if (activeQuickFilterKey && activeQuickFilterKey !== 'all') {
      filtered = deals.filter(deal => {
        switch (activeQuickFilterKey) {
          case 'myOpen':
            return deal.user_id === currentUserId && deal.stage?.stage_type === 'OPEN' as StageType;
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
          <Button leftIcon={<SettingsIcon />} onClick={onColumnSelectorOpen} size="sm" variant="outline">
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
            icon={ViewIcon} 
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
      {dealsViewMode === 'table' ? listPageContent : kanbanPageContent}
      {/* Modals and Dialogs are siblings to the view content */}
      <CreateDealModal isOpen={isCreateModalOpen} onClose={onCreateModalClose} onDealCreated={handleDataChanged} />
      {isEditModalOpen && dealToEdit && <EditDealModal deal={dealToEdit} isOpen={isEditModalOpen} onClose={onEditModalClose} onDealUpdated={handleDataChanged} />}
      <ConfirmationDialog isOpen={isConfirmDeleteDialogOpen} onClose={onConfirmDeleteClose} onConfirm={handleConfirmDelete} headerText="Delete Deal" bodyText="Are you sure you want to delete this deal?" confirmButtonText="Delete" confirmButtonColorScheme="red" />
      
      {isColumnSelectorOpen && allAvailableColumns.length > 0 && dealsViewMode === 'table' && (
        <ColumnSelector<Deal>
          isOpen={isColumnSelectorOpen}
          onClose={onColumnSelectorClose}
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