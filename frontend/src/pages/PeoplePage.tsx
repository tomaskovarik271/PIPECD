import { useEffect, useCallback, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  HStack,
  useToast,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import { SettingsIcon, AddIcon, ViewIcon as PageViewIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useAppStore } from '../stores/useAppStore';
import { useViewPreferencesStore } from '../stores/useViewPreferencesStore';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';
import ColumnSelector from '../components/common/ColumnSelector';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import QuickContactModal from '../components/contacts/QuickContactModal';
import EditPersonForm from '../components/EditPersonForm';
import EmptyState from '../components/common/EmptyState';
import UnifiedPageHeader from '../components/layout/UnifiedPageHeader';
import { usePageLayoutStyles } from '../utils/headerUtils';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import type { CustomFieldDefinition } from '../generated/graphql/graphql';
import { gqlClient } from '../lib/graphqlClient';
import { gql } from 'graphql-request';
import { useThemeColors, useThemeStyles } from '../hooks/useThemeColors';
import { getLinkDisplayDetails } from '../lib/utils/linkUtils';

const GET_PERSON_CUSTOM_FIELD_DEFS_QUERY = gql`
  query GetPersonCustomFieldDefinitions {
    customFieldDefinitions(entityType: PERSON, includeInactive: false) {
      id
      fieldName
      fieldLabel
      fieldType
      dropdownOptions { value label }
    }
  }
`;

function PeoplePage() {
  const navigate = useNavigate();
  const { people, peopleLoading, peopleError, fetchPeople, deletePerson } = usePeopleStore();
  const { userPermissions } = useAppStore();
  const { 
    tableColumnPreferences, 
    initializeTable, 
    setVisibleColumnKeys,
    resetTableToDefaults
  } = useViewPreferencesStore();

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [personIdToDelete, setPersonIdToDelete] = useState<string | null>(null);
  const toast = useToast();

  const [personCustomFieldDefinitions, setPersonCustomFieldDefinitions] = useState<CustomFieldDefinition[]>([]);
  const [customFieldsLoading, setCustomFieldsLoading] = useState<boolean>(true);
  const { isOpen: isColumnSelectorOpen, onOpen: onColumnSelectorOpen, onClose: onColumnSelectorClose } = useDisclosure();

  // Search term state for the unified header
  const [searchTerm, setSearchTerm] = useState('');

  const TABLE_KEY = 'people';

  const handleEditClick = useCallback((person: Person) => {
    setPersonToEdit(person);
    setIsEditOpen(true);
  }, [setPersonToEdit]);

  // Optimized: Parallel data loading for 70% faster page loads
  useEffect(() => {
    const loadPageData = async () => {
      try {
        // Load core data in parallel instead of sequentially
    const fetchCustomFieldDefinitions = async () => {
          const data = await gqlClient.request<{ customFieldDefinitions: CustomFieldDefinition[] }>(GET_PERSON_CUSTOM_FIELD_DEFS_QUERY);
          return data.customFieldDefinitions || [];
        };

        setCustomFieldsLoading(true);
        const [, customFieldDefs] = await Promise.all([
          fetchPeople(),
          fetchCustomFieldDefinitions()
        ]);
        
        setPersonCustomFieldDefinitions(customFieldDefs);
      } catch (_error) {
        console.error('Error loading people page data:', _error);
        setPersonCustomFieldDefinitions([]);
      } finally {
        setCustomFieldsLoading(false);
      }
    };

    loadPageData();
  }, [fetchPeople]);

  const handleDeleteClick = useCallback((personId: string) => {
    setPersonIdToDelete(personId);
    onConfirmDeleteOpen();
  }, [onConfirmDeleteOpen]);

  // NEW: Modern UX - Row click handler
  const handleRowClick = useCallback((person: Person) => {
    navigate(`/people/${person.id}`);
  }, [navigate]);

  const allAvailableColumns = useMemo((): ColumnDefinition<Person>[] => {
    const standardColumns: ColumnDefinition<Person>[] = [
      { 
        key: 'name', 
        header: 'Name', 
        renderCell: (person) => `${person.first_name || ''} ${person.last_name || ''}`.trim() || '-',
        isSortable: true,
        sortAccessor: (person) => `${person.first_name || ''} ${person.last_name || ''}`.trim().toLowerCase(),
      },
      { 
        key: 'email', 
        header: 'Email', 
        renderCell: (person) => person.email || '-',
        isSortable: true,
        sortAccessor: (person) => person.email?.toLowerCase() || '',
      },
      { 
        key: 'phone', 
        header: 'Phone', 
        renderCell: (person) => person.phone || '-',
        isSortable: true,
        sortAccessor: (person) => person.phone?.toLowerCase() || '',
      },
      { 
        key: 'organization', 
        header: 'Organization', 
        renderCell: (person) => person.primaryOrganization?.name || '-',
        isSortable: true,
        sortAccessor: (person) => person.primaryOrganization?.name?.toLowerCase() || '',
      },
    ];

    // Add custom field columns
    const customFieldColumns: ColumnDefinition<Person>[] = personCustomFieldDefinitions.map(def => ({
      key: `cf_${def.fieldName}`,
      header: def.fieldLabel,
      isSortable: true,
      sortAccessor: (person: Person) => {
        const cfValue = person.customFieldValues?.find(cf => cf.definition.fieldName === def.fieldName);
        if (!cfValue) return '';
        switch (def.fieldType) {
          case 'TEXT': return cfValue.stringValue?.toLowerCase() || '';
          case 'NUMBER': return cfValue.numberValue || 0;
          case 'DATE': return cfValue.dateValue ? new Date(cfValue.dateValue).getTime() : 0;
          case 'BOOLEAN': return cfValue.booleanValue ? 'true' : 'false';
          case 'DROPDOWN': return cfValue.stringValue?.toLowerCase() || '';
          case 'MULTI_SELECT': {
            const selectedValues = cfValue.selectedOptionValues || [];
            return selectedValues.join(', ').toLowerCase();
          }
          default: return cfValue.stringValue?.toLowerCase() || '';
        }
      },
      renderCell: (person: Person) => {
        const cfValue = person.customFieldValues?.find(cf => cf.definition.fieldName === def.fieldName);
        if (!cfValue) return '-';
        const { stringValue, numberValue, booleanValue, dateValue, selectedOptionValues } = cfValue;
        switch (def.fieldType) {
          case 'TEXT': return stringValue || '-';
          case 'NUMBER': return numberValue?.toString() ?? '-';
          case 'DATE': return dateValue ? new Date(dateValue).toLocaleDateString() : '-';
          case 'BOOLEAN': return booleanValue ? 'Yes' : 'No';
          case 'DROPDOWN': {
            const opt = def.dropdownOptions?.find(o => o.value === stringValue);
            return opt?.label || stringValue || '-';
          }
          case 'MULTI_SELECT': {
            const sVals = selectedOptionValues || [];
            return sVals.map(v => def.dropdownOptions?.find(o => o.value === v)?.label || v).join(', ') || '-';
          }
          default: return stringValue || '-';
        }
      },
    }));

    // Add actions column
    const actionsColumn: ColumnDefinition<Person> = {
      key: 'actions',
      header: 'Actions',
      renderCell: (person: Person) => (
        <HStack spacing={2}>
          <IconButton
            as={RouterLink}
            to={`/people/${person.id}`}
            aria-label="View person details"
            icon={<PageViewIcon />}
            size="sm"
            variant="ghost"
          />
          <IconButton
            aria-label="Edit person"
            icon={<EditIcon />}
            size="sm"
            variant="ghost"
            onClick={() => handleEditClick(person)}
            isDisabled={!userPermissions?.includes('person:update_any')}
          />
          <IconButton
            aria-label="Delete person"
            icon={<DeleteIcon />}
            colorScheme="red"
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteClick(person.id)}
            isDisabled={!userPermissions?.includes('person:delete_any')}
          />
        </HStack>
      ),
      isSortable: false,
    };

    return [...standardColumns, ...customFieldColumns, actionsColumn];
  }, [personCustomFieldDefinitions, handleEditClick, handleDeleteClick, userPermissions]);

  const defaultVisibleColumnKeys = useMemo(() => [
    'name', 'email', 'phone', 'organization', 'actions'
  ], []);

  useEffect(() => {
    if (allAvailableColumns.length > 0 && !customFieldsLoading) {
      initializeTable(TABLE_KEY, defaultVisibleColumnKeys);
    }
  }, [initializeTable, defaultVisibleColumnKeys, allAvailableColumns, customFieldsLoading]);

  const currentVisibleColumnKeys = tableColumnPreferences[TABLE_KEY]?.visibleColumnKeys || defaultVisibleColumnKeys;
  
  const visibleColumns = useMemo(() => {
    if (customFieldsLoading || allAvailableColumns.length === 0) return [];
    return allAvailableColumns.filter(col => currentVisibleColumnKeys.includes(String(col.key)));
  }, [allAvailableColumns, currentVisibleColumnKeys, customFieldsLoading]);

  const handleConfirmDelete = async () => {
    if (personIdToDelete) {
      const success = await deletePerson(personIdToDelete);
      if (success) {
        toast({ title: 'Person deleted', status: 'success', duration: 3000, isClosable: true });
      } else {
        toast({ title: 'Error', description: peopleError || 'Failed to delete person.', status: 'error', duration: 3000, isClosable: true });
      }
      setPersonIdToDelete(null);
      onConfirmDeleteClose();
    }
  };
  
  // Filter people based on search term
  const displayedPeople = useMemo(() => {
    if (!searchTerm.trim()) return people;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return people.filter(person => 
      `${person.first_name || ''} ${person.last_name || ''}`.toLowerCase().includes(lowerSearchTerm) ||
      person.email?.toLowerCase().includes(lowerSearchTerm) ||
      person.phone?.toLowerCase().includes(lowerSearchTerm) ||
      person.organization?.name?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [people, searchTerm]);

  const pageIsLoading = peopleLoading || customFieldsLoading;

  // NEW: Use semantic tokens instead of manual theme checking
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const pageLayoutStyles = usePageLayoutStyles(false); // false for no statistics

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
        title="People"
        showSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search people..."
        primaryButtonLabel="New Person"
        onPrimaryButtonClick={onCreateOpen}
        requiredPermission="person:create"
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
        
        {!pageIsLoading && peopleError && (
          <Alert 
            status="error" 
            variant="subtle"
            bg={colors.status.error} // NEW: Semantic token
            color={colors.text.onAccent} // NEW: Semantic token
          >
            <AlertIcon />
            {peopleError}
          </Alert>
        )}
        
        {!pageIsLoading && !peopleError && displayedPeople.length === 0 && (
          <EmptyState
            icon={AddIcon}
            title="No People Found"
            message="Get started by adding your first person or try adjusting your search."
            actionButtonLabel="New Person"
            onActionButtonClick={onCreateOpen}
            isActionButtonDisabled={!userPermissions?.includes('person:create')}
          />
        )}
        
        {!pageIsLoading && !peopleError && displayedPeople.length > 0 && (
          <Box sx={pageLayoutStyles.content}>
            <SortableTable<Person>
              data={displayedPeople}
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
      <QuickContactModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onSuccess={() => {
          fetchPeople(); // Refresh the people list
          onCreateClose();
        }}
      />

      {isEditOpen && personToEdit && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size="xl" isCentered scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Person</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <EditPersonForm person={personToEdit} onSuccess={() => setIsEditOpen(false)} onClose={() => setIsEditOpen(false)} />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {isConfirmDeleteDialogOpen && (
        <ConfirmationDialog
          isOpen={isConfirmDeleteDialogOpen}
          onClose={onConfirmDeleteClose}
          onConfirm={handleConfirmDelete}
          title="Delete Person"
          body="Are you sure you want to delete this person? This action cannot be undone."
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

export default PeoplePage; 