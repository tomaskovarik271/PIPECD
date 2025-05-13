import React, { useEffect, useState } from 'react';
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
  // Add any other necessary Chakra UI imports here
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { usePeopleStore, Person } from '../stores/usePeopleStore'; // Use Person from usePeopleStore
import { useAppStore } from '../stores/useAppStore'; // For userPermissions
import CreatePersonForm from '../components/CreatePersonForm';
import EditPersonForm from '../components/EditPersonForm';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import ListPageLayout from '../components/layout/ListPageLayout';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';

function PeoplePage() {
  // --- State from Zustand Stores ---
  const { people, peopleLoading: loading, peopleError, fetchPeople, deletePerson } = usePeopleStore();
  const { userPermissions } = useAppStore(); // Only for permissions

  // --- Local UI State ---
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null); // Use Person from store
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [personIdToDelete, setPersonIdToDelete] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    console.log('[PeoplePage] isCreateOpen changed to:', isCreateOpen);
  }, [isCreateOpen]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const handleEditClick = (person: Person) => { // Use Person from store
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

  const columns: ColumnDefinition<Person>[] = [
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
            colorScheme="red" 
            onClick={() => handleDeleteClick(person.id)} 
            isDisabled={!userPermissions?.includes('person:delete_any') && !userPermissions?.includes('person:delete_own')} 
          />
        </HStack>
      ),
      isSortable: false,
    },
  ];
  
  const emptyStatePropsForPage = {
    title: "No People Found",
    message: "Get started by creating a new person.",
    icon: AddIcon, 
  };

  return (
    <>
      <ListPageLayout
        title="People"
        newButtonLabel="New Person"
        onNewButtonClick={onCreateOpen}
        isNewButtonDisabled={!userPermissions?.includes('person:create')}
        isLoading={loading}
        error={peopleError}
        isEmpty={!loading && people.length === 0}
        emptyStateProps={emptyStatePropsForPage}
      >
        {!loading && !peopleError && people.length > 0 && (
          <SortableTable data={people} columns={columns} initialSortKey="name" />
        )}
      </ListPageLayout>

      {isCreateOpen && (
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl" isCentered>
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
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl" isCentered>
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
        bodyText="Are you sure you want to delete this person? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonColorScheme="red"
      />
    </>
  );
}

export default PeoplePage; 