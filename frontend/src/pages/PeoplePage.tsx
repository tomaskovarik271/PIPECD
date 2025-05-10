import { useEffect, useState, useCallback } from 'react';
// import { gql } from 'graphql-request'; // No longer needed
// import { gqlClient } from '../lib/graphqlClient'; // No longer needed
import {
  Button,
  Box,
  Heading,
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
  Flex, // Added Flex
  Alert, AlertIcon // Added Alert & AlertIcon
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons'; // Added ViewIcon for potential EmptyState
import CreatePersonForm from '../components/CreatePersonForm';
import EditPersonForm from '../components/EditPersonForm';
import ConfirmationDialog from '../components/common/ConfirmationDialog'; // Import ConfirmationDialog
import { useAppStore } from '../stores/useAppStore'; // Import store
import type { Person as GeneratedPerson } from '../generated/graphql/graphql'; // Removed GeneratedOrganization
import ListPageLayout from '../components/layout/ListPageLayout'; // Import layout
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable'; // Import table
import EmptyState from '../components/common/EmptyState'; // Import EmptyState

// REMOVED: GET_PEOPLE_QUERY (now in store)

// --- Type definitions (Keep for component use) ---
// interface Organization { ... } // Defined elsewhere if needed - REMOVED
// interface Person { ... } // Defined in store - REMOVED
// --- End Type definitions ---

// Define Person including nested Organization for sorting - REMOVED (GeneratedPerson includes organization)
// interface PersonWithOrg extends Person {
//   organization?: Organization | null;
// }

// Define sortable keys - REMOVED PersonSortKeys
// type PersonSortKeys = 'name' | 'organization' | 'email' | 'phone';

function PeoplePage() {
  // --- State from Zustand Store ---
  const people = useAppStore((state) => state.people); // Removed cast, state.people is already GeneratedPerson[]
  const loading = useAppStore((state) => state.peopleLoading);
  const peopleError = useAppStore((state) => state.peopleError); // Get specific error
  const fetchPeople = useAppStore((state) => state.fetchPeople);
  const deletePersonAction = useAppStore((state) => state.deletePerson);
  // Fetch permissions
  const userPermissions = useAppStore((state) => state.userPermissions);

  // --- Local UI State ---
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [personToEdit, setPersonToEdit] = useState<GeneratedPerson | null>(null); // Use GeneratedPerson
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure(); // For Confirmation Dialog
  const [personToDeleteId, setPersonToDeleteId] = useState<string | null>(null); // For Confirmation Dialog
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // For button spinner (can be same as loading state for dialog)
  const toast = useToast();

  // --- Fetching & Data Handling ---
  useEffect(() => {
    console.log('[PeoplePage] isCreateOpen changed to:', isCreateOpen);
  }, [isCreateOpen]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const handleDataChanged = useCallback(() => {
    fetchPeople();
  }, [fetchPeople]);

  const handleEditClick = (person: GeneratedPerson) => { // Use GeneratedPerson
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
  const columns: ColumnDefinition<GeneratedPerson>[] = [ // Use GeneratedPerson
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
      renderCell: (person) => person.organization?.name || '-', // Access nested org name
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
  const emptyStatePropsForPage = {
    icon: ViewIcon, // Example icon, change as needed
    title: "No People Yet",
    message: "Get started by adding a new person."
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="calc(100vh - 200px)">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (peopleError) {
    return (
      <Alert status="error" m={4}>
        <AlertIcon />
        Error fetching people: {peopleError}
      </Alert>
    );
  }

  return (
    <Box p={6}> {/* Main page container with padding */}
      {/* Modals rendered at the top level of the page component */}
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

      {/* Conditional content: Empty state or ListPageLayout with table */}
      {people.length === 0 ? (
        <VStack spacing={4} align="stretch">
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading as="h2" size="lg">People</Heading>
            <Button 
              colorScheme="blue"
              onClick={onCreateOpen} // Changed from handleCreateDealClick
              isDisabled={!userPermissions?.includes('person:create')}
            >
              New Person
            </Button>
          </Flex>
          <EmptyState 
            icon={emptyStatePropsForPage.icon}
            title={emptyStatePropsForPage.title}
            message={emptyStatePropsForPage.message}
            actionButtonLabel="New Person"
            onActionButtonClick={onCreateOpen} // Changed from handleCreateDealClick
            isActionButtonDisabled={!userPermissions?.includes('person:create')}
          />
        </VStack>
      ) : (
        <ListPageLayout
          title="People"
          newButtonLabel="New Person"
          onNewButtonClick={onCreateOpen} // Changed from handleCreateDealClick
          isNewButtonDisabled={!userPermissions?.includes('person:create')}
          isLoading={loading} // Will be false here
          error={peopleError} // Will be null here
          isEmpty={false} // Explicitly false
          emptyStateProps={emptyStatePropsForPage}
        >
          <SortableTable<GeneratedPerson>
            data={people}
            columns={columns}
            initialSortKey="name"
          />
        </ListPageLayout>
      )}
    </Box>
  );
}

export default PeoplePage; 