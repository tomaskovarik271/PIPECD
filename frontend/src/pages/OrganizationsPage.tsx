import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  HStack,
  useToast,
  VStack,
  IconButton,
  Text,
  Link,
  Icon,
  useDisclosure,
} from '@chakra-ui/react';
import { SettingsIcon, AddIcon, ViewIcon as PageViewIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore';
import { useAppStore } from '../stores/useAppStore';
import { useViewPreferencesStore } from '../stores/useViewPreferencesStore';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';
import ColumnSelector from '../components/common/ColumnSelector';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import CreateOrganizationModal from '../components/CreateOrganizationModal';
import EditOrganizationModal from '../components/EditOrganizationModal';
import EmptyState from '../components/common/EmptyState';
import UnifiedPageHeader from '../components/layout/UnifiedPageHeader';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getLinkDisplayDetails } from '../lib/utils/linkUtils';
import { CustomFieldDefinition as GQLCustomFieldDefinition } from '../generated/graphql/graphql';
import { CustomFieldEntityType } from '../generated/graphql/graphql';
import { useThemeColors, useThemeStyles } from '../hooks/useThemeColors';
import { usePageLayoutStyles } from '../utils/headerUtils';

function OrganizationsPage() {
  const navigate = useNavigate();
  const { organizations, organizationsLoading, organizationsError, fetchOrganizations, deleteOrganization } = useOrganizationsStore();
  const { userPermissions } = useAppStore();
  const { 
    tableColumnPreferences, 
    initializeTable, 
    setVisibleColumnKeys,
    resetTableToDefaults
  } = useViewPreferencesStore();

  const { definitions: customFieldDefinitions, fetchCustomFieldDefinitions } = useCustomFieldDefinitionStore();

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [organizationToEdit, setOrganizationToEdit] = useState<Organization | null>(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [organizationIdToDelete, setOrganizationIdToDelete] = useState<string | null>(null);
  const { isOpen: isColumnSelectorOpen, onOpen: onColumnSelectorOpen, onClose: onColumnSelectorClose } = useDisclosure();
  const toast = useToast();

  // Search term state for the unified header
  const [searchTerm, setSearchTerm] = useState('');

  // NEW: Use semantic tokens instead of manual theme checking
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const pageLayoutStyles = usePageLayoutStyles(false); // false for no statistics

  const TABLE_KEY = 'organizations';

  const handleEditClick = useCallback((organization: Organization) => {
    setOrganizationToEdit(organization);
    onEditOpen();
  }, [onEditOpen]);

  const handleDeleteClick = useCallback((organizationId: string) => {
    setOrganizationIdToDelete(organizationId);
    onConfirmDeleteOpen();
  }, [onConfirmDeleteOpen]);

  // NEW: Modern UX - Row click handler
  const handleRowClick = useCallback((organization: Organization) => {
    navigate(`/organizations/${organization.id}`);
  }, [navigate]);

  useEffect(() => {
    fetchOrganizations();
    fetchCustomFieldDefinitions(CustomFieldEntityType.Organization);
  }, [fetchOrganizations, fetchCustomFieldDefinitions]);

  // Get organization-specific custom field definitions
  const organizationCustomFieldDefinitions = useMemo(() => {
    return customFieldDefinitions.filter((def: GQLCustomFieldDefinition) => def.entityType === CustomFieldEntityType.Organization);
  }, [customFieldDefinitions]);

  // Memoize custom field value renderer to prevent expensive re-calculations
  const renderCustomFieldValue = useCallback((cfValue: any, def: GQLCustomFieldDefinition) => {
    if (!cfValue) return '-';
    
    const { stringValue, numberValue, booleanValue, dateValue, selectedOptionValues } = cfValue;
    switch (def.fieldType) {
      case 'TEXT': {
        const linkDetails = getLinkDisplayDetails(stringValue);
        if (linkDetails.isUrl && linkDetails.fullUrl) {
          return (
            <Link href={linkDetails.fullUrl} isExternal color="blue.500" textDecoration="underline" display="inline-flex" alignItems="center">
              {linkDetails.icon && <Icon as={linkDetails.icon} mr={1.5} />}
              <Text as="span" style={!linkDetails.isKnownService ? { display: 'inline-block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : {}}>
                {linkDetails.displayText}
              </Text>
            </Link>
          );
        } else { 
          return stringValue || '-'; 
        }
      }
      case 'NUMBER': 
        return numberValue?.toString() ?? '-'; 
      case 'DATE': 
        return dateValue ? new Date(dateValue).toLocaleDateString() : '-'; 
      case 'BOOLEAN': 
        return booleanValue ? 'Yes' : 'No'; 
      case 'DROPDOWN': {
        // Handle both stringValue (correct format) and selectedOptionValues (backward compatibility)
        const optVal = stringValue || (selectedOptionValues && selectedOptionValues.length > 0 ? selectedOptionValues[0] : null);
        const opt = def.dropdownOptions?.find(o => o.value === optVal);
        return opt ? opt.label : (optVal || '-');
      }
      case 'MULTI_SELECT': {
        if (!selectedOptionValues || selectedOptionValues.length === 0) return '-';
        const labels = selectedOptionValues
          .map((val: string) => def.dropdownOptions?.find(o => o.value === val)?.label || val)
          .filter(Boolean)
          .join(', ');
        return labels || '-';
      }
      default: 
        return stringValue || '-';
    }
  }, []);

  // Memoize custom field sort accessor to prevent expensive re-calculations
  const getCustomFieldSortAccessor = useCallback((def: GQLCustomFieldDefinition) => {
    return (org: Organization) => {
      const cfValue = org.customFieldValues?.find(cf => cf.definition.fieldName === def.fieldName);
      if (!cfValue) return '';
      switch (def.fieldType) {
        case 'TEXT': return cfValue.stringValue?.toLowerCase() || '';
        case 'NUMBER': return cfValue.numberValue || 0;
        case 'DATE': return cfValue.dateValue ? new Date(cfValue.dateValue).getTime() : 0;
        case 'BOOLEAN': return cfValue.booleanValue ? 'true' : 'false';
        default: return cfValue.stringValue?.toLowerCase() || '';
      }
    };
  }, []);

  const allAvailableColumns = useMemo((): ColumnDefinition<Organization>[] => {
    const standardColumns: ColumnDefinition<Organization>[] = [
      {
        key: 'name',
        header: 'Name',
        renderCell: (org) => (
          <Text as={RouterLink} to={`/organizations/${org.id}`} color="blue.500" fontWeight="medium" _hover={{ textDecoration: 'underline' }}>
            {org.name}
          </Text>
        ),
        isSortable: true,
        sortAccessor: (org) => org.name?.toLowerCase() || '',
      },
      {
        key: 'address',
        header: 'Address',
        renderCell: (org) => org.address || '-',
        isSortable: true,
        sortAccessor: (org) => org.address?.toLowerCase() || '',
      },
      {
        key: 'notes',
        header: 'Notes',
        renderCell: (org) => org.notes ? (
          <Text noOfLines={2} maxW="200px" title={org.notes}>
            {org.notes}
          </Text>
        ) : '-',
        isSortable: true,
        sortAccessor: (org) => org.notes?.toLowerCase() || '',
      },
      {
        key: 'created_at',
        header: 'Created',
        renderCell: (org) => org.created_at ? new Date(org.created_at).toLocaleDateString() : '-',
        isSortable: true,
        sortAccessor: (org) => org.created_at ? new Date(org.created_at).getTime() : 0,
      },
    ];

    // Add custom field columns
    const customFieldColumns: ColumnDefinition<Organization>[] = organizationCustomFieldDefinitions.map(def => ({
      key: `cf_${def.fieldName}`,
      header: def.fieldLabel,
      isSortable: true,
      sortAccessor: getCustomFieldSortAccessor(def),
      renderCell: (org: Organization) => {
        const cfValue = org.customFieldValues?.find(cf => cf.definition.fieldName === def.fieldName);
        return renderCustomFieldValue(cfValue, def);
      }
    }));

    const actionsColumn: ColumnDefinition<Organization> = {
      key: 'actions',
      header: 'Actions',
      renderCell: (organization) => (
        <HStack spacing={1}>
          <IconButton
            as={RouterLink}
            to={`/organizations/${organization.id}`}
            aria-label="View organization details"
            icon={<PageViewIcon />}
            size="sm"
            variant="ghost"
          />
          <IconButton
            aria-label="Edit organization"
            icon={<EditIcon />}
            size="sm"
            variant="ghost"
            onClick={() => handleEditClick(organization)}
            isDisabled={!userPermissions?.includes('organization:update_any')}
          />
          <IconButton
            aria-label="Delete organization"
            icon={<DeleteIcon />}
            colorScheme="red"
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteClick(organization.id)}
            isDisabled={!userPermissions?.includes('organization:delete_any')}
          />
        </HStack>
      ),
      isSortable: false,
    };

    return [...standardColumns, ...customFieldColumns, actionsColumn];
  }, [handleEditClick, handleDeleteClick, userPermissions, organizationCustomFieldDefinitions, renderCustomFieldValue, getCustomFieldSortAccessor]);

  const defaultVisibleColumnKeys = useMemo(() => [
    'name', 'address', 'notes', 'created_at', 'actions'
  ], []);

  useEffect(() => {
    if (allAvailableColumns.length > 0) {
      initializeTable(TABLE_KEY, defaultVisibleColumnKeys);
    }
  }, [initializeTable, defaultVisibleColumnKeys, allAvailableColumns]);

  const currentVisibleColumnKeys = tableColumnPreferences[TABLE_KEY]?.visibleColumnKeys || defaultVisibleColumnKeys;
  
  const visibleColumns = useMemo(() => {
    if (allAvailableColumns.length === 0) return [];
    return allAvailableColumns.filter(col => currentVisibleColumnKeys.includes(String(col.key)));
  }, [allAvailableColumns, currentVisibleColumnKeys]);

  const handleConfirmDelete = async () => {
    if (organizationIdToDelete) {
      const success = await deleteOrganization(organizationIdToDelete);
      if (success) {
        toast({ title: 'Organization deleted', status: 'success', duration: 3000, isClosable: true });
      } else {
        toast({ title: 'Error', description: organizationsError || 'Failed to delete organization.', status: 'error', duration: 3000, isClosable: true });
      }
      setOrganizationIdToDelete(null);
      onConfirmDeleteClose();
    }
  };
  
  // Filter organizations based on search term - optimized
  const displayedOrganizations = useMemo(() => {
    if (!searchTerm.trim()) return organizations;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return organizations.filter(org => {
      // Early returns for performance
      if (org.name?.toLowerCase().includes(lowerSearchTerm)) return true;
      if (org.address?.toLowerCase().includes(lowerSearchTerm)) return true;
      if (org.notes?.toLowerCase().includes(lowerSearchTerm)) return true;
      return false;
    });
  }, [organizations, searchTerm]);

  const pageIsLoading = organizationsLoading;

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

  return (
    <>
      <UnifiedPageHeader
        title="Organizations"
        showSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search organizations..."
        primaryButtonLabel="New Organization"
        onPrimaryButtonClick={onCreateOpen}
        requiredPermission="organization:create"
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
        
        {!pageIsLoading && organizationsError && (
          <Alert 
            status="error" 
            variant="subtle"
            bg={colors.status.error} // NEW: Semantic token
            color={colors.text.onAccent} // NEW: Semantic token
          >
            <AlertIcon />
            {organizationsError}
          </Alert>
        )}
        
        {!pageIsLoading && !organizationsError && displayedOrganizations.length === 0 && (
            <EmptyState
              icon={AddIcon}
              title="No Organizations Found"
              message="Get started by adding your first organization or try adjusting your search."
              actionButtonLabel="New Organization"
              onActionButtonClick={onCreateOpen}
              isActionButtonDisabled={!userPermissions?.includes('organization:create')}
              // REMOVED: isModernTheme prop - EmptyState should use semantic tokens
            />
        )}
        
        {!pageIsLoading && !organizationsError && displayedOrganizations.length > 0 && (
          <Box sx={pageLayoutStyles.content}>
            <SortableTable<Organization>
              data={displayedOrganizations}
              columns={visibleColumns}
              initialSortKey="name"
              initialSortDirection="ascending"
              onRowClick={handleRowClick}
              excludeClickableColumns={['actions']}
            />
          </Box>
        )}
      </Box>

      {/* Modals */}
      {isCreateOpen && (
        <CreateOrganizationModal
          isOpen={isCreateOpen}
          onClose={onCreateClose}
          onOrganizationCreated={() => {
            onCreateClose();
            fetchOrganizations();
            toast({ title: 'Organization created successfully', status: 'success', duration: 3000, isClosable: true });
          }}
        />
      )}

      {isEditOpen && organizationToEdit && (
        <EditOrganizationModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          organization={organizationToEdit}
          onOrganizationUpdated={() => {
            onEditClose();
            fetchOrganizations();
            toast({ title: 'Organization updated successfully', status: 'success', duration: 3000, isClosable: true });
          }}
        />
      )}

      {isConfirmDeleteDialogOpen && (
        <ConfirmationDialog
          isOpen={isConfirmDeleteDialogOpen}
          onClose={onConfirmDeleteClose}
          onConfirm={handleConfirmDelete}
          title="Delete Organization"
          body="Are you sure you want to delete this organization? This action cannot be undone."
          confirmButtonText="Delete"
          confirmButtonColor="red"
        />
      )}

      {isColumnSelectorOpen && (
        <ColumnSelector
          isOpen={isColumnSelectorOpen}
          onClose={onColumnSelectorClose}
          allAvailableColumns={allAvailableColumns}
          currentVisibleColumnKeys={currentVisibleColumnKeys}
          defaultVisibleColumnKeys={defaultVisibleColumnKeys}
          onApply={(newVisibleKeys: string[]) => {
            setVisibleColumnKeys(TABLE_KEY, newVisibleKeys);
            onColumnSelectorClose();
          }}
          onReset={() => resetTableToDefaults(TABLE_KEY, defaultVisibleColumnKeys)}
        />
      )}
    </>
  );
}

export default OrganizationsPage; 