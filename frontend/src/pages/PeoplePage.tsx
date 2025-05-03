import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  Button,
  Box,
  Heading,
  Spinner,
  Text,
  useDisclosure,
  Flex,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  IconButton,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import CreatePersonForm from '../components/CreatePersonForm';
import EditPersonForm from '../components/EditPersonForm';
import GenericDeleteConfirmationDialog from '../components/GenericDeleteConfirmationDialog';

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

const DELETE_PERSON_MUTATION = gql`
  mutation DeletePerson($id: ID!) {
    deletePerson(id: $id)
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

interface GetPeopleData { // Define the query result type
    people: Person[];
}

// Define type for item to delete (similar to LeadsPage)
interface PersonToDelete {
    id: string;
    name: string;
}

function PeoplePage() {
  const { loading, error, data, refetch } = useQuery<GetPeopleData>(GET_PEOPLE_QUERY);
  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<PersonToDelete | null>(null);

  // Define helper function before usage
  const formatName = (person: Person): string => {
    return [person.first_name, person.last_name].filter(Boolean).join(' ') || 'this person'; 
  };

  const [deletePerson, { loading: deleteLoading }] = useMutation(DELETE_PERSON_MUTATION, {
      onCompleted: () => {
          toast({ title: 'Person deleted.', status: 'success', duration: 3000, isClosable: true });
          refetch();
          handleDeleteDialogClose();
      },
      onError: (err) => {
          console.error('Error deleting person:', err);
          toast({ title: 'Error deleting person.', description: err.message, status: 'error', duration: 5000, isClosable: true });
          handleDeleteDialogClose();
      },
  });

  const handleCreateSuccess = () => {
    refetch();
    onCreateClose();
  };

  const handleEditClick = (person: Person) => {
    setPersonToEdit(person);
    onEditOpen();
  };

  const handleEditSuccess = () => {
    refetch();
    onEditClose();
    setPersonToEdit(null);
  };

  const handleDeleteClick = (person: Person) => {
    setPersonToDelete({ id: person.id, name: formatName(person) });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setPersonToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (personToDelete) {
      deletePerson({ variables: { id: personToDelete.id } });
    }
  };

  const people = data?.people || [];

  return (
    <Box p={5}>
      <Flex mb={5} alignItems="center">
        <Heading as="h2" size="lg">People</Heading>
        <Spacer />
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onCreateOpen}>
          Add Person
        </Button>
      </Flex>

      {loading && <Spinner size="xl" />}
      {error && <Text color="red.500">Error loading people: {error.message}</Text>}

      {!loading && !error && (
        <TableContainer borderWidth="1px" borderRadius="lg">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Organization</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {people.length > 0 ? (
                people.map(person => (
                  <Tr key={person.id}>
                    <Td>{formatName(person)}</Td>
                    <Td>{person.email || '-'}</Td>
                    <Td>{person.phone || '-'}</Td>
                    <Td>{person.organization?.name || '-'}</Td>
                    <Td>
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
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={5} textAlign="center">No people found.</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
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

      <GenericDeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
        itemType="Person"
        itemName={personToDelete?.name || ''}
        isLoading={deleteLoading}
      />
    </Box>
  );
}

export default PeoplePage; 