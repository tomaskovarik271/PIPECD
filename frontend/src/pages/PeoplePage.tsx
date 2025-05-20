import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  HStack,
  IconButton,
  Spinner,
  Box,
  Button
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SettingsIcon } from '@chakra-ui/icons';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useAppStore } from '../stores/useAppStore';
import { useViewPreferencesStore } from '../stores/useViewPreferencesStore';
import type { CustomFieldDefinition, CustomFieldValue, CustomFieldEntityType, CustomFieldType as GQLCustomFieldType } from '../generated/graphql/graphql';
import { gqlClient } from '../lib/graphqlClient';
import { gql } from 'graphql-request';

import CreatePersonForm from '../components/CreatePersonForm';
import EditPersonForm from '../components/EditPersonForm';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import ListPageLayout from '../components/layout/ListPageLayout';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';
import ColumnSelector from '../components/common/ColumnSelector';
import QuickFilterControls, { QuickFilter } from '../components/common/QuickFilterControls';

const isUrl = (str: string): boolean => {
  try {
    new URL(str);
    return str.startsWith('http://') || str.startsWith('https://');
  } catch (_) {
    return false;
  }
};

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
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [personIdToDelete, setPersonIdToDelete] = useState<string | null>(null);
  const toast = useToast();

  const [personCustomFieldDefinitions, setPersonCustomFieldDefinitions] = useState<CustomFieldDefinition[]>([]);
  const [customFieldsLoading, setCustomFieldsLoading] = useState<boolean>(true);
  const { isOpen: isColumnSelectorOpen, onOpen: onColumnSelectorOpen, onClose: onColumnSelectorClose } = useDisclosure();

  const [activeQuickFilterKey, setActiveQuickFilterKey] = useState<string | null>(null);

  // Define Quick Filters for People
  const availableQuickFilters = useMemo((): QuickFilter[] => [
    { key: 'all', label: 'All People' },
    { key: 'noOrg', label: 'Without Organization' },
    { key: 'withEmail', label: 'With Email' },
    { key: 'noPhone', label: 'Without Phone' },
  ], []);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  useEffect(() => {
    const fetchCustomFieldDefs = async () => {
      setCustomFieldsLoading(true);
      try {
        const data = await gqlClient.request<{ customFieldDefinitions: CustomFieldDefinition[] }>(GET_PERSON_CUSTOM_FIELD_DEFS_QUERY);
        setPersonCustomFieldDefinitions(data.customFieldDefinitions || []);
      } catch (error) {
        console.error("Error fetching person custom field definitions:", error);
        toast({ title: 'Error loading custom field definitions', status: 'error', duration: 3000 });
      } finally {
        setCustomFieldsLoading(false);
      }
    };
    fetchCustomFieldDefs();
  }, [toast]);

  const TABLE_KEY = 'people_list';

  const allAvailableColumns = useMemo((): ColumnDefinition<Person>[] => {
    const standardColumns: ColumnDefinition<Person>[] = [
      { 
        key: 'name', 
        header: 'Name', 
        renderCell: (person) => `${person.first_name || ''} ${person.last_name || ''}`.trim() || '-', 
        isSortable: true, 
        sortAccessor: (p) => `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase().trim()
      },
      { 
        key: 'email', 
        header: 'Email', 
        renderCell: (person) => person.email || '-', 
        isSortable: true, 
        sortAccessor: (p) => p.email?.toLowerCase() 
      },
      { 
        key: 'phone', 
        header: 'Phone', 
        renderCell: (person) => person.phone || '-', 
        isSortable: false 
      },
      { 
        key: 'organization', 
        header: 'Organization', 
        renderCell: (person) => person.organization?.name || '-', 
        isSortable: true, 
        sortAccessor: (p) => p.organization?.name?.toLowerCase() 
      },
      {
        key: 'created_at',
        header: 'Created At',
        renderCell: (person) => person.created_at ? new Date(person.created_at).toLocaleDateString() : '-',
        isSortable: true,
        sortAccessor: (p) => p.created_at ? new Date(p.created_at).getTime() : 0,
      },
    ];

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
          default: return cfValue.stringValue?.toLowerCase() || '';
        }
      },
      renderCell: (person: Person) => {
        const cfValue = person.customFieldValues?.find(cf => cf.definition.fieldName === def.fieldName);
        if (!cfValue) return '-';

        let displayValue: React.ReactNode = '-';
        switch (def.fieldType) {
          case 'TEXT':
            displayValue = cfValue.stringValue || '-';
            if (cfValue.stringValue && isUrl(cfValue.stringValue)) {
              displayValue = <a href={cfValue.stringValue} target="_blank" rel="noopener noreferrer" style={{color: 'blue.500', textDecoration: 'underline'}}>{cfValue.stringValue}</a>;
            }
            break;
          case 'NUMBER':
            displayValue = cfValue.numberValue?.toString() ?? '-';
            break;
          case 'DATE':
            displayValue = cfValue.dateValue ? new Date(cfValue.dateValue).toLocaleDateString() : '-';
            break;
          case 'BOOLEAN':
            displayValue = cfValue.booleanValue ? 'Yes' : 'No';
            break;
          case 'DROPDOWN':
            const selectedOptVal = cfValue.stringValue;
            const selectedOpt = def.dropdownOptions?.find(opt => opt.value === selectedOptVal);
            displayValue = selectedOpt?.label || selectedOptVal || '-';
            break;
          case 'MULTI_SELECT':
            const selectedVals = cfValue.selectedOptionValues || [];
            displayValue = selectedVals.map(val => def.dropdownOptions?.find(opt => opt.value === val)?.label || val).join(', ') || '-';
            break;
          default:
            displayValue = cfValue.stringValue || '-';
        }
        return displayValue;
      },
    }));

    const actionsColumn: ColumnDefinition<Person> = {
      key: 'actions',
      header: 'Actions',
      renderCell: (person) => (
        <HStack spacing={2}>
          <IconButton 
            icon={<EditIcon />} 
            aria-label="Edit person" 
            size="sm" 
            onClick={() => handleEditClick(person)} 
            isDisabled={!userPermissions?.includes('person:update_any') && !userPermissions?.includes('person:update_own')} 
          />
          <IconButton 
            icon={<DeleteIcon />} 
            aria-label="Delete person" 
            size="sm" 
            variant="ghost"
            colorScheme="red" 
            onClick={() => handleDeleteClick(person.id)} 
            isDisabled={!userPermissions?.includes('person:delete_any') && !userPermissions?.includes('person:delete_own')} 
          />
        </HStack>
      ),
      isSortable: false,
    };
    
    return [...standardColumns, ...customFieldColumns, actionsColumn];
  }, [personCustomFieldDefinitions, userPermissions]);

  const defaultVisibleColumnKeys = useMemo(() => [
    'name', 
    'email', 
    'phone', 
    'organization',
    'actions'
  ], []);

  useEffect(() => {
    if (allAvailableColumns.length > 0) {
        initializeTable(TABLE_KEY, defaultVisibleColumnKeys);
    }
  }, [initializeTable, defaultVisibleColumnKeys, allAvailableColumns]);

  const currentVisibleColumnKeys = tableColumnPreferences[TABLE_KEY]?.visibleColumnKeys || defaultVisibleColumnKeys;
  
  const visibleColumns = useMemo(() => {
    if (customFieldsLoading || allAvailableColumns.length === 0) return [];
    return allAvailableColumns.filter(col => currentVisibleColumnKeys.includes(String(col.key)));
  }, [allAvailableColumns, currentVisibleColumnKeys, customFieldsLoading]);

  const handleEditClick = (person: Person) => {
    setPersonToEdit(person);
    onEditOpen();
  };

  const handleDeleteClick = (personId: string) => {
    setPersonIdToDelete(personId);
    onConfirmDeleteOpen();
  };

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
  
  const displayedPeople = useMemo(() => {
    if (!activeQuickFilterKey || activeQuickFilterKey === 'all') {
      return people;
    }
    return people.filter(person => {
      // eslint-disable-next-line no-case-declarations
      switch (activeQuickFilterKey) {
        case 'noOrg': {
          return !person.organization_id && !person.organization;
        }
        case 'withEmail': {
          return !!person.email;
        }
        case 'noPhone': {
          return !person.phone;
        }
        default: {
          return true;
        }
      }
    });
  }, [people, activeQuickFilterKey]);

  const pageIsLoading = peopleLoading || customFieldsLoading;

  return (
    <>
    <ListPageLayout
      title="People"
      newButtonLabel="New Person"
      onNewButtonClick={onCreateOpen}
      isNewButtonDisabled={!userPermissions?.includes('person:create')}
      isLoading={pageIsLoading}
      error={peopleError}
      isEmpty={!pageIsLoading && displayedPeople.length === 0 && !peopleError}
      emptyStateProps={{
        icon: AddIcon,
        title: "No People Found",
        message: "Get started by adding your first person or try a different filter.",
      }}
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
      {!pageIsLoading && !peopleError && displayedPeople.length > 0 && (
        <SortableTable<Person>
          data={displayedPeople}
          columns={visibleColumns}
          initialSortKey="name"
          initialSortDirection="ascending"
        />
      )}
      {(pageIsLoading || customFieldsLoading) && <Spinner />}
    </ListPageLayout>

    {isCreateOpen && (
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl" isCentered scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Person</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <CreatePersonForm onSuccess={onCreateClose} onClose={onCreateClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    )}

    {isEditOpen && personToEdit && (
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl" isCentered scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Person</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <EditPersonForm person={personToEdit} onSuccess={onEditClose} onClose={onEditClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    )}

    <ConfirmationDialog
      isOpen={isConfirmDeleteDialogOpen}
      onClose={onConfirmDeleteClose}
      onConfirm={handleConfirmDelete}
      headerText="Delete Person"
      bodyText={"Are you sure you want to delete this person? This action cannot be undone."}
      confirmButtonText="Delete"
      confirmButtonColorScheme="red"
    />
      
    {isColumnSelectorOpen && (
      <ColumnSelector<Person>
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

export default PeoplePage; 