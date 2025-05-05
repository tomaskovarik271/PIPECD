import { useEffect, useState, useCallback } from 'react';
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
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import CreatePersonForm from '../components/CreatePersonForm';
import EditPersonForm from '../components/EditPersonForm';
// import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'; // Using inline confirmation for now
import { useAppStore, Person } from '../stores/useAppStore'; // Import store and Person type

// REMOVED: GET_PEOPLE_QUERY (now in store)

// --- Type definitions (Keep for component use) ---
// interface Organization { ... } // Defined elsewhere if needed
// interface Person { ... } // Defined in store
// --- End Type definitions ---

function PeoplePage() {
  // --- State from Zustand Store ---
  const people = useAppStore((state) => state.people);
  const loading = useAppStore((state) => state.peopleLoading);
  const error = useAppStore((state) => state.peopleError);
  const fetchPeople = useAppStore((state) => state.fetchPeople);
  const deletePersonAction = useAppStore((state) => state.deletePerson);
  // Fetch permissions
  const userPermissions = useAppStore((state) => state.userPermissions);

  // --- Local UI State ---
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  // const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  // const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // For button spinner
  const toast = useToast();

  // Fetch people on mount
  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  // Callback for modals to refresh data
  const handleDataChanged = useCallback(() => {
    fetchPeople();
  }, [fetchPeople]);

  const handleEditClick = (person: Person) => {
    setPersonToEdit(person);
    onEditOpen();
  };

  const handleDeleteClick = async (personId: string) => {
    if (isDeletingId === personId) return; // Prevent double clicks

    if (window.confirm('Are you sure you want to delete this person? Related deals might be affected.')) {
        setIsDeletingId(personId); // Show spinner on button
        const success = await deletePersonAction(personId);
        setIsDeletingId(null); // Hide spinner

        if (success) {
            toast({ title: 'Person deleted.', status: 'success', duration: 3000, isClosable: true });
        } else {
            // Error state is managed by the store, show toast here
            toast({
                title: 'Error Deleting Person',
                description: error || 'An unknown error occurred', // Display store error
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h2" size="lg">People</Heading>
        <Button 
            colorScheme="blue" 
            onClick={onCreateOpen}
            isDisabled={!userPermissions?.includes('person:create')}
        >
          Add Person
        </Button>
      </Box>

      {loading && <Spinner size="xl" />}
      {error && <Text color="red.500">Error loading people: {error}</Text>}

      {!loading && (
        <Box borderWidth="1px" borderRadius="lg" p={4}>
          {people.length === 0 ? (
            <Text>No people found.</Text>
          ) : (
            <List spacing={3}>
              {people.map(person => (
                <ListItem key={person.id} borderWidth="1px" borderRadius="md" p={3} display="flex" alignItems="center">
                  <Box flexGrow={1}>
                    <Text fontWeight="bold">
                      {person.first_name} {person.last_name}
                      ({person.organization?.name || 'No organization'})
                    </Text>
                    <Text fontSize="sm">{person.email || '-'} | {person.phone || '-'}</Text>
                  </Box>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Edit person"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => handleEditClick(person)}
                      isDisabled={!!isDeletingId || !userPermissions?.includes('person:update_any')}
                    />
                    <IconButton
                      aria-label="Delete person"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleDeleteClick(person.id)}
                      isLoading={isDeletingId === person.id}
                      isDisabled={!!isDeletingId && isDeletingId !== person.id || !userPermissions?.includes('person:delete_any')}
                    />
                  </HStack>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}

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

      {/* REMOVED DeleteConfirmationDialog - using window.confirm for simplicity */}
      {/* {personToDelete && (...) } */}
    </VStack>
  );
}

export default PeoplePage; 