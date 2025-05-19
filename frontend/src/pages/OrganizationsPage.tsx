import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Heading,
  Button,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  HStack,
  useToast,
  useDisclosure,
  VStack,
  Flex,
} from '@chakra-ui/react';
import CreateOrganizationModal from '../components/CreateOrganizationModal';
import EditOrganizationModal from '../components/EditOrganizationModal';
import { EditIcon, DeleteIcon, ViewIcon, SettingsIcon } from '@chakra-ui/icons';
import { useAppStore } from '../stores/useAppStore';
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore';
import { useViewPreferencesStore } from '../stores/useViewPreferencesStore';
import type { CustomFieldDefinition, CustomFieldValue, CustomFieldType as GQLCustomFieldType } from '../generated/graphql/graphql';
import { gqlClient } from '../lib/graphqlClient';
import { gql } from 'graphql-request';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import ListPageLayout from '../components/layout/ListPageLayout';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';
import ColumnSelector from '../components/common/ColumnSelector';
import QuickFilterControls, { QuickFilter } from '../components/common/QuickFilterControls';

// Helper to check if a string is a URL (basic version)
const isUrl = (str: string): boolean => {
  try {
    new URL(str);
    return str.startsWith('http://') || str.startsWith('https://');
  } catch (_) {
    return false;
  }
};

const GET_ORG_CUSTOM_FIELD_DEFS_QUERY = gql`
  query GetOrganizationCustomFieldDefinitions {
    customFieldDefinitions(entityType: ORGANIZATION, includeInactive: false) {
      id
      fieldName
      fieldLabel
      fieldType
      dropdownOptions { value label }
    }
  }
`;

function OrganizationsPage() {
  const { organizations, organizationsLoading, organizationsError, fetchOrganizations, deleteOrganization: deleteOrganizationAction } = useOrganizationsStore();
  const userPermissions = useAppStore((state) => state.userPermissions);
  const { 
    tableColumnPreferences, 
    initializeTable, 
    setVisibleColumnKeys,
    resetTableToDefaults 
  } = useViewPreferencesStore();

  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const { isOpen: isColumnSelectorOpen, onOpen: onColumnSelectorOpen, onClose: onColumnSelectorClose } = useDisclosure();
  
  const [orgToEdit, setOrgToEdit] = useState<Organization | null>(null);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [orgToDeleteId, setOrgToDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const [orgCustomFieldDefinitions, setOrgCustomFieldDefinitions] = useState<CustomFieldDefinition[]>([]);
  const [customFieldsLoading, setCustomFieldsLoading] = useState<boolean>(true);

  const [activeQuickFilterKey, setActiveQuickFilterKey] = useState<string | null>(null);

  // Define Quick Filters for Organizations
  const availableQuickFilters = useMemo((): QuickFilter[] => [
    { key: 'all', label: 'All Organizations' },
    { key: 'recent', label: 'Recently Added' }, // Last 7 days, client-side
    { key: 'noPeople', label: 'Without People' },
    { key: 'noDeals', label: 'Without Deals' },
  ], []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    const fetchCustomFieldDefs = async () => {
      setCustomFieldsLoading(true);
      try {
        const data = await gqlClient.request<{ customFieldDefinitions: CustomFieldDefinition[] }>(GET_ORG_CUSTOM_FIELD_DEFS_QUERY);
        setOrgCustomFieldDefinitions(data.customFieldDefinitions || []);
      } catch (error) {
        console.error("Error fetching organization custom field definitions:", error);
        toast({ title: 'Error loading custom field definitions', status: 'error', duration: 3000, isClosable: true });
      } finally {
        setCustomFieldsLoading(false);
      }
    };
    fetchCustomFieldDefs();
  }, [toast]);

  const handleCreateOrgClick = () => onCreateModalOpen();
  const handleDataChanged = useCallback(() => fetchOrganizations(), [fetchOrganizations]);

  const handleEditClick = (org: Organization) => { setOrgToEdit(org); onEditModalOpen(); };
  const handleDeleteClick = (orgId: string) => { setOrgToDeleteId(orgId); onConfirmDeleteOpen(); };

  const handleConfirmDelete = async () => {
    if (!orgToDeleteId) return;
    setDeletingRowId(orgToDeleteId);
    const success = await deleteOrganizationAction(orgToDeleteId);
    setDeletingRowId(null);
    onConfirmDeleteClose();
    if (success) {
      toast({ title: 'Organization deleted.', status: 'success', duration: 3000, isClosable: true });
      setOrgToDeleteId(null);
    } else {
      toast({ title: 'Error Deleting Organization', description: organizationsError || 'An unknown error occurred', status: 'error', duration: 5000, isClosable: true });
    }
  };

  const formatDate = (dateString: string | null | undefined) => dateString ? new Date(dateString).toLocaleDateString() : '-';

  const TABLE_KEY = 'organizations_list';

  const allAvailableColumns = useMemo((): ColumnDefinition<Organization>[] => {
    const standardColumns: ColumnDefinition<Organization>[] = [
      { key: 'name', header: 'Name', renderCell: (org) => org.name, isSortable: true },
      { key: 'address', header: 'Address', renderCell: (org) => org.address || '-', isSortable: true, sortAccessor: (org) => org.address?.toLowerCase() ?? '' },
      { key: 'notes', header: 'Notes', renderCell: (org) => (<Text maxW="200px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{org.notes || '-'}</Text>), isSortable: true, sortAccessor: (org) => org.notes?.toLowerCase() ?? '' },
      { key: 'created_at', header: 'Created', renderCell: (org) => formatDate(org.created_at), isSortable: true, sortAccessor: (org) => org.created_at ? new Date(org.created_at).getTime() : 0 },
    ];

    const customFieldColumns: ColumnDefinition<Organization>[] = orgCustomFieldDefinitions.map(def => ({
      key: `cf_${def.fieldName}`,
      header: def.fieldLabel,
      isSortable: true,
      sortAccessor: (org: Organization) => {
        const cfValue = org.customFieldValues?.find(cf => cf.definition.fieldName === def.fieldName);
        if (!cfValue) return '';
        switch (def.fieldType) {
          case 'TEXT': return cfValue.stringValue?.toLowerCase() || '';
          case 'NUMBER': return cfValue.numberValue || 0;
          case 'DATE': return cfValue.dateValue ? new Date(cfValue.dateValue).getTime() : 0;
          case 'BOOLEAN': return cfValue.booleanValue ? 'true' : 'false';
          default: return cfValue.stringValue?.toLowerCase() || '';
        }
      },
      renderCell: (org: Organization) => {
        const cfValue = org.customFieldValues?.find(cf => cf.definition.fieldName === def.fieldName);
        if (!cfValue) return '-';
        let displayValue: React.ReactNode = '-';
        const { stringValue, numberValue, booleanValue, dateValue, selectedOptionValues } = cfValue;
        switch (def.fieldType) {
          case 'TEXT': displayValue = stringValue || '-'; if (stringValue && isUrl(stringValue)) displayValue = <a href={stringValue} target="_blank" rel="noopener noreferrer" style={{color: 'blue.500', textDecoration: 'underline'}}>{stringValue}</a>; break;
          case 'NUMBER': displayValue = numberValue?.toString() ?? '-'; break;
          case 'DATE': displayValue = dateValue ? new Date(dateValue).toLocaleDateString() : '-'; break;
          case 'BOOLEAN': displayValue = booleanValue ? 'Yes' : 'No'; break;
          case 'DROPDOWN': const optVal = stringValue; const opt = def.dropdownOptions?.find(o => o.value === optVal); displayValue = opt?.label || optVal || '-'; break;
          case 'MULTI_SELECT': const selVals = selectedOptionValues || []; displayValue = selVals.map(v => def.dropdownOptions?.find(o => o.value === v)?.label || v).join(', ') || '-'; break;
          default: displayValue = stringValue || '-';
        }
        return displayValue;
      },
    }));

    const actionsColumn: ColumnDefinition<Organization> = {
      key: 'actions',
      header: 'Actions',
      renderCell: (org) => (
        <HStack spacing={2}>
          <IconButton aria-label="Edit organization" icon={<EditIcon />} size="sm" variant="ghost" onClick={() => handleEditClick(org)} isDisabled={!!deletingRowId || !userPermissions?.includes('organization:update_any')} />
          <IconButton aria-label="Delete organization" icon={<DeleteIcon />} size="sm" colorScheme="red" variant="ghost" onClick={() => handleDeleteClick(org.id)} isLoading={deletingRowId === org.id} isDisabled={(!!deletingRowId && deletingRowId !== org.id) || !userPermissions?.includes('organization:delete_any')} />
        </HStack>
      ),
      isSortable: false,
    };
    return [...standardColumns, ...customFieldColumns, actionsColumn];
  }, [orgCustomFieldDefinitions, userPermissions, deletingRowId, handleEditClick, handleDeleteClick]);

  const defaultVisibleColumnKeys = useMemo(() => [
    'name', 'address', 'notes', 'created_at', 'actions'
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
    
    // If, after filtering, no valid keys remain (e.g., due to custom fields loading/unloading),
    // fall back to default keys that are currently available.
    const finalKeysToShow = validVisibleKeys.length > 0 
        ? validVisibleKeys 
        : defaultVisibleColumnKeys.filter(key => availableKeysSet.has(key));

    return allAvailableColumns.filter(col => finalKeysToShow.includes(String(col.key)));
  }, [allAvailableColumns, currentVisibleColumnKeys, customFieldsLoading, defaultVisibleColumnKeys]);

  const displayedOrganizations = useMemo(() => {
    let filteredOrgs = organizations;
    if (activeQuickFilterKey && activeQuickFilterKey !== 'all') {
      filteredOrgs = organizations.filter(org => {
        switch (activeQuickFilterKey) {
          case 'recent':
            if (!org.created_at) return false;
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return new Date(org.created_at) > sevenDaysAgo;
          case 'noPeople':
            return !org.people || org.people.length === 0;
          case 'noDeals':
            return !org.deals || org.deals.length === 0;
          default:
            return true;
        }
      });
    }
    return filteredOrgs;
  }, [organizations, activeQuickFilterKey]);

  const emptyStatePropsForLayout = {
    icon: ViewIcon, // Or a more specific icon for Organizations
    title: "No Organizations Found",
    message: "Get started by adding your first organization or try a different filter.",
    // actionButtonLabel, onActionButtonClick, isActionButtonDisabled are handled by ListPageLayout directly
  };
  
  const pageIsLoading = organizationsLoading || customFieldsLoading;

  return (
    <ListPageLayout
      title="Organizations"
      newButtonLabel="New Organization"
      onNewButtonClick={handleCreateOrgClick}
      isNewButtonDisabled={!userPermissions?.includes('organization:create')}
      isLoading={pageIsLoading}
      error={organizationsError}
      isEmpty={!pageIsLoading && !organizationsError && displayedOrganizations.length === 0}
      emptyStateProps={emptyStatePropsForLayout} // Use the simplified props
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
      {!pageIsLoading && !organizationsError && displayedOrganizations.length > 0 && (
        <SortableTable<Organization> 
          data={displayedOrganizations} 
          columns={visibleColumns} 
          initialSortKey="name" 
          initialSortDirection="ascending" // Added to match other tables
        />
      )}

      <CreateOrganizationModal isOpen={isCreateModalOpen} onClose={onCreateModalClose} onOrganizationCreated={handleDataChanged} />
      {orgToEdit && (
        <EditOrganizationModal 
          organization={orgToEdit} 
          isOpen={isEditModalOpen} 
          onClose={() => { onEditModalClose(); setOrgToEdit(null); }} 
          onOrganizationUpdated={() => { handleDataChanged(); onEditModalClose(); setOrgToEdit(null); }} 
        />
      )}
      <ConfirmationDialog 
        isOpen={isConfirmDeleteDialogOpen}
        onClose={onConfirmDeleteClose}
        onConfirm={handleConfirmDelete}
        headerText="Delete Organization"
        bodyText="Are you sure you want to delete this organization? Associated people will have their organization link removed. This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonColorScheme="red"
        isLoading={!!deletingRowId}
      />
      {isColumnSelectorOpen && allAvailableColumns.length > 0 && (
        <ColumnSelector<Organization>
          isOpen={isColumnSelectorOpen}
          onClose={onColumnSelectorClose}
          allAvailableColumns={allAvailableColumns}
          currentVisibleColumnKeys={currentVisibleColumnKeys}
          defaultVisibleColumnKeys={defaultVisibleColumnKeys}
          onApply={(newKeys) => setVisibleColumnKeys(TABLE_KEY, newKeys)}
          onReset={() => resetTableToDefaults(TABLE_KEY, defaultVisibleColumnKeys)}
        />
      )}
    </ListPageLayout>
  );
}

export default OrganizationsPage; 