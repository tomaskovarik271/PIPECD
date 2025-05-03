import { useEffect, useState, useCallback } from 'react';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
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
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import CreatePersonForm from '../components/CreatePersonForm';
import EditPersonForm from '../components/EditPersonForm';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

// Define the query to fetch people and their organization
const GET_PEOPLE_QUERY = gql`
  query GetPeople {
    people {
      id
      first_name
      last_name
      email
      phone
      notes
      created_at
      updated_at
      organization_id # Keep if needed by edit form
      organization {  # Fetch nested organization
          id
          name
      }
    }
  }
`;

// Define the shape of Organization (nested)
interface Organization {
    id: string;
    name: string;
}

// Define the expected shape of a Person (formerly Contact)
interface Person {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  // company?: string | null; // Removed, using organization now
  notes?: string | null;
  created_at: string;
  updated_at: string;
  organization_id?: string | null; // Keep if needed by edit form
  organization?: Organization | null; // Nested organization data
}

function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gqlClient.request<{ people: Person[] }>(GET_PEOPLE_QUERY);
      setPeople(data.people || []);
    } catch (err: any) {
      console.error("Error fetching people:", err);
      const gqlError = err.response?.errors?.[0]?.message;
      setError(gqlError || err.message || "Failed to load people.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const handleCreateSuccess = () => {
    fetchPeople();
    onCreateClose();
  };

  const handleEditClick = (person: Person) => {
    setPersonToEdit(person);
    onEditOpen();
  };

  const handleEditSuccess = () => {
    fetchPeople();
    onEditClose();
    setPersonToEdit(null);
  };

  const handleDeleteClick = (person: Person) => {
    setPersonToDelete(person);
    onDeleteOpen();
  };

  const handleDeleteSuccess = () => {
    fetchPeople();
    onDeleteClose();
    setPersonToDelete(null);
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h2" size="lg">People</Heading>
        <Button colorScheme="blue" onClick={onCreateOpen}>
          Add Person
        </Button>
      </Box>

      {loading && <Spinner size="xl" />}
      {error && <Text color="red.500">{error}</Text>}

      {!loading && !error && (
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
                    </Text>
                    <Text fontSize="sm">{person.email || 'No email'}</Text>
                    <Text fontSize="sm">{person.phone || 'No phone'}</Text>
                    <Text fontSize="sm">{person.organization?.name || 'No organization'}</Text>
                  </Box>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Edit person"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => handleEditClick(person)}
                    />
                    <IconButton
                      aria-label="Delete person"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleDeleteClick(person)}
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
          <CreatePersonForm onClose={onCreateClose} onSuccess={handleCreateSuccess} />
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
              onSuccess={handleEditSuccess} 
            />
          </ModalContent>
        </Modal>
      )}

      {personToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteOpen}
          onClose={() => { setPersonToDelete(null); onDeleteClose(); }}
          person={personToDelete}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </VStack>
  );
}

export default PeoplePage; 