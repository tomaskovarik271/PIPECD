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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import CreatePersonForm from '../components/CreatePersonForm';
import EditPersonForm from '../components/EditPersonForm';
import ConfirmationDialog from '../components/common/ConfirmationDialog'; // Import ConfirmationDialog
import { useAppStore, Person, Organization } from '../stores/useAppStore'; // Import store and Person type

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
  const people = useAppStore((state) => state.people as PersonWithOrg[]);
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

  // --- Sorting State ---
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });

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

  // --- Sorting Logic ---
  const requestSort = (key: PersonSortKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const formatPersonNameForSort = (person: PersonWithOrg): string => {
    return `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim().toLowerCase();
  };

  const sortedPeople = useMemo(() => {
    let sortablePeople = [...people];
    sortablePeople.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortConfig.key) {
        case 'name':
          aValue = formatPersonNameForSort(a);
          bValue = formatPersonNameForSort(b);
          break;
        case 'organization':
          aValue = a.organization?.name?.toLowerCase() ?? '';
          bValue = b.organization?.name?.toLowerCase() ?? '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() ?? '';
          bValue = b.email?.toLowerCase() ?? '';
          break;
        case 'phone':
          aValue = a.phone ?? ''; // Phone numbers might sort better as strings
          bValue = b.phone ?? '';
          break;
        default:
          return 0; // Should not happen
      }

      // Always use localeCompare for strings
      return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
    return sortablePeople;
  }, [people, sortConfig]);

  // Helper to render sort icons
  const renderSortIcon = (columnKey: PersonSortKeys) => {
      if (sortConfig.key !== columnKey) return null;
      return sortConfig.direction === 'ascending' ? 
             <TriangleUpIcon aria-label="sorted ascending" ml={1} w={3} h={3} /> : 
             <TriangleDownIcon aria-label="sorted descending" ml={1} w={3} h={3} />;
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h2" size="lg">People</Heading>
        <Button 
            colorScheme="blue" 
            onClick={onCreateOpen}
            isDisabled={!userPermissions?.includes('person:create')}
        >
          New Person
        </Button>
      </Box>

      {loading && <Spinner size="xl" />}
      {peopleError && <Text color="red.500">Error loading people: {peopleError}</Text>}

      {!loading && people.length > 0 && (
        <TableContainer borderWidth="1px" borderRadius="lg" width="100%">
          <Table variant="simple" size="sm" width="100%">
            <Thead>
              <Tr borderBottomWidth="1px" borderColor="gray.200">
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('name')}>
                  Name {renderSortIcon('name')}
                </Th>
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('organization')}>
                  Organization {renderSortIcon('organization')}
                </Th>
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('email')}>
                  Email {renderSortIcon('email')}
                </Th>
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('phone')}>
                  Phone {renderSortIcon('phone')}
                </Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedPeople.map(person => (
                <Tr key={person.id} bg="white">
                  <Td>
                    <Text fontWeight="bold">
                      {person.first_name} {person.last_name}
                    </Text>
                  </Td>
                  <Td>{person.organization?.name || '-'}</Td>
                  <Td>{person.email || '-'}</Td>
                  <Td>{person.phone || '-'}</Td>
                  <Td>
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
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
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
    </VStack>
  );
}

export default PeoplePage; 