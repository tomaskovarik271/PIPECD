import { useEffect, useState, useCallback, useMemo } from 'react';
// import { gql } from 'graphql-request'; // No longer needed
// import { gqlClient } from '../lib/graphqlClient'; // No longer needed
import {
  Button,
  Box,
  Heading,
  List, ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Spinner,
  Text,
  useDisclosure,
  VStack,
  HStack,
  IconButton,
  useToast, // Import useToast
  // Removed Table components
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon /* Removed sort icons */ } from '@chakra-ui/icons';
import CreatePersonForm from '../components/CreatePersonForm';
import EditPersonForm from '../components/EditPersonForm';
import ConfirmationDialog from '../components/common/ConfirmationDialog'; // Import ConfirmationDialog
import { useAppStore, Person, Organization } from '../stores/useAppStore'; // Import store and Person type
import ListPageLayout from '../components/layout/ListPageLayout'; // Import layout
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable'; // Import table

// REMOVED: GET_PEOPLE_QUERY (now in store)

// --- Type definitions (Keep for component use) ---
// interface Organization { ... } // Defined elsewhere if needed
// interface Person { ... } // Defined in store
// --- End Type definitions ---

// Define Person including nested Organization for sorting
interface PersonWithOrg extends Person {
  organization?: Organization | null;
}

// Define sortable keys
type PersonSortKeys = 'name' | 'organization' | 'email' | 'phone';

// Define sort config type
interface SortConfig {
    key: PersonSortKeys;
    direction: 'ascending' | 'descending';
}

function PeoplePage() {
  // --- State from Zustand Store ---
  const people = useAppStore((state) => state.people as Person[]); // Use base Person type
  const loading = useAppStore((state) => state.peopleLoading);
  const peopleError = useAppStore((state) => state.peopleError); // Get specific error
  const fetchPeople = useAppStore((state) => state.fetchPeople);
  const deletePersonAction = useAppStore((state) => state.deletePerson);
  // Fetch permissions
  const userPermissions = useAppStore((state) => state.userPermissions);

  // --- Local UI State ---
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure(); // For Confirmation Dialog
  const [personToDeleteId, setPersonToDeleteId] = useState<string | null>(null); // For Confirmation Dialog
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // For button spinner (can be same as loading state for dialog)
  const toast = useToast();

  // --- Fetching & Data Handling ---
  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const handleDataChanged = useCallback(() => {
    fetchPeople();
  }, [fetchPeople]);

  const handleEditClick = (person: Person) => {
    setPersonToEdit(person);
    onEditOpen();
  };

  const handleDeleteClick = async (personId: string) => {
    // Open confirmation dialog instead of window.confirm
    setPersonToDeleteId(personId);
    onConfirmDeleteOpen();
  };

  // Add handler for the confirmation dialog
  const handleConfirmDelete = async () => {
    if (!personToDeleteId) return;

    setIsDeletingId(personToDeleteId); // Set loading state for the dialog button
    const success = await deletePersonAction(personToDeleteId);
    setIsDeletingId(null); // Clear loading state
    onConfirmDeleteClose(); // Close the dialog
    setPersonToDeleteId(null); // Reset the ID

    if (success) {
        toast({ title: 'Person deleted.', status: 'success', duration: 3000, isClosable: true });
    } else {
        // Error state is managed by the store, show toast here
        toast({
            title: 'Error Deleting Person',
            description: peopleError || 'An unknown error occurred', // Display specific store error
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
    }
  };

  // Define Columns for SortableTable
  const columns: ColumnDefinition<Person>[] = [
    {
      key: 'name',
      header: 'Name',
      renderCell: (person) => (
        <Text fontWeight="bold">
          {person.first_name} {person.last_name}
        </Text>
      ),
      isSortable: true,
      sortAccessor: (person) => `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim().toLowerCase(),
    },
    {
      key: 'organization',
      header: 'Organization',
      renderCell: (person) => person.organization?.name || '-',
      isSortable: true,
      sortAccessor: (person) => person.organization?.name?.toLowerCase() ?? '',
    },
    {
      key: 'email',
      header: 'Email',
      renderCell: (person) => person.email || '-',
      isSortable: true,
      sortAccessor: (person) => person.email?.toLowerCase() ?? '',
    },
    {
      key: 'phone',
      header: 'Phone',
      renderCell: (person) => person.phone || '-',
      isSortable: true,
      sortAccessor: (person) => person.phone ?? '',
    },
    {
      key: 'actions',
      header: 'Actions',
      renderCell: (person) => (
        <HStack spacing={2}>
          <IconButton
            aria-label="Edit person"
            icon={<EditIcon />}
            size="sm"
            variant="ghost"
            onClick={() => handleEditClick(person)}
            isDisabled={!!isDeletingId || !userPermissions?.includes('person:update_any')}
          />
          <IconButton
            aria-label="Delete person"
            icon={<DeleteIcon />}
            colorScheme="red"
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteClick(person.id)}
            isLoading={isDeletingId === person.id}
            isDisabled={
              (!!isDeletingId && isDeletingId !== person.id) ||
              !userPermissions?.includes('person:delete_any')
            }
          />
        </HStack>
      ),
      isSortable: false,
    },
  ];

  // Define props for EmptyState
  const emptyStateProps = {
    icon: EditIcon, // Placeholder, maybe change?
    title: "No People Added",
    message: "Add people to track your contacts."
  };

  return (
    <ListPageLayout
      title="People"
      newButtonLabel="New Person"
      onNewButtonClick={onCreateOpen}
      isNewButtonDisabled={!userPermissions?.includes('person:create')}
      isLoading={loading}
      error={peopleError}
      isEmpty={people.length === 0}
      emptyStateProps={emptyStateProps}
    >
      <SortableTable<Person>
        data={people}
        columns={columns}
        initialSortKey="name"
      />

      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Person</ModalHeader>
          <ModalCloseButton />
          <CreatePersonForm onClose={onCreateClose} onSuccess={handleDataChanged} />
        </ModalContent>
      </Modal>

      {personToEdit && (
        <Modal isOpen={isEditOpen} onClose={() => { setPersonToEdit(null); onEditClose(); }}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Person</ModalHeader>
            <ModalCloseButton onClick={() => { setPersonToEdit(null); onEditClose(); }} />
            <EditPersonForm 
              person={personToEdit}
              onClose={() => { setPersonToEdit(null); onEditClose(); }} 
              onSuccess={() => { handleDataChanged(); onEditClose(); setPersonToEdit(null); }} // Chain callbacks
            />
          </ModalContent>
        </Modal>
      )}

      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={onConfirmDeleteClose}
        onConfirm={handleConfirmDelete}
        headerText="Delete Person"
        bodyText="Are you sure you want to delete this person? Related deals might be affected. This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonColorScheme="red"
        isLoading={!!isDeletingId}
      />
    </ListPageLayout>
  );
}

export default PeoplePage; 