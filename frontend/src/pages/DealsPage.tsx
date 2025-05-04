import { useEffect, useCallback, useState } from 'react';
import { gql } from 'graphql-request';
import {
  Box,
  Heading,
  Button,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  TableCaption, 
  TableContainer,
  useDisclosure,
  IconButton,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { gqlClient } from '../lib/graphqlClient';
import CreateDealModal from '../components/CreateDealModal';
import EditDealModal from '../components/EditDealModal';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useAppStore } from '../stores/useAppStore';

// Update the query to fetch person_id and nested person info
const GET_DEALS_QUERY = gql`
  query GetDeals {
    deals {
      id
      name
      stage
      amount
      created_at
      updated_at
      person_id # Renamed from contact_id
      person {    # Renamed from contact
        id
        first_name
        last_name
        email
      }
    }
  }
`;

// Update the Deal interface to include nested person and person_id
interface DealPerson { // Renamed from DealContact
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
}

interface Deal {
  id: string;
  name: string;
  stage: string;
  amount?: number | null;
  created_at: string;
  updated_at: string;
  person_id?: string | null; // Renamed from contact_id
  person?: DealPerson | null; // Renamed from contact
}

// Interface for the expected shape of the query result
interface GetDealsQueryResult {
  deals: Deal[];
}

// Define DELETE_DEAL_MUTATION
const DELETE_DEAL_MUTATION = gql`
  mutation DeleteDeal($id: ID!) {
    deleteDeal(id: $id)
  }
`;

// Interface for the expected shape of the delete mutation result
interface DeleteDealMutationResult {
  deleteDeal: boolean;
}

function DealsPage() {
  // --- State from Zustand Store ---
  const deals = useAppStore((state) => state.deals);
  const loading = useAppStore((state) => state.dealsLoading);
  const error = useAppStore((state) => state.dealsError);
  const fetchDeals = useAppStore((state) => state.fetchDeals);
  const deleteDealAction = useAppStore((state) => state.deleteDeal); // Renamed action accessor
  
  // --- Local UI State ---
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const toast = useToast();

  // Fetch deals on mount
  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleCreateDealClick = () => {
    onCreateModalOpen();
  };

  // Callback for modals: Refetch deals
  const handleDataChanged = useCallback(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleEditClick = (deal: Deal) => {
    setDealToEdit(deal);
    onEditModalOpen();
  };

  const handleDeleteClick = async (dealId: string) => {
    // Prevent double clicks
    if (isDeletingId === dealId) return;

    if (window.confirm('Are you sure you want to delete this deal?')) {
        setIsDeletingId(dealId); // Show spinner on this specific button
        const success = await deleteDealAction(dealId); // Call store action
        setIsDeletingId(null); // Hide spinner

        if (success) {
            toast({ title: 'Deal deleted.', status: 'success', duration: 3000, isClosable: true });
            // No need to call fetchDeals, store updates itself
        } else {
            // Error toast is shown based on dealsError state from the store
            // Optional: Show specific toast here if needed, but might be redundant
             toast({
                 title: 'Error Deleting Deal',
                 description: error || 'An unknown error occurred', // Display the store error
                 status: 'error',
                 duration: 5000,
                 isClosable: true,
             });
        }
    } else {
        console.log('Delete cancelled');
    }
  };

  // Helper function to format person name for display
  const formatPersonName = (person: DealPerson | null | undefined): string => { // Renamed from formatContactName
    if (!person) return '- '; // No person linked // Renamed variable
    return (
      person.last_name && person.first_name // Renamed variable
      ? `${person.last_name}, ${person.first_name}` // Renamed variable
      : person.first_name // Renamed variable
      ? person.first_name // Renamed variable
      : person.last_name // Renamed variable
      ? person.last_name // Renamed variable
      : person.email || 'Unnamed Person' // Renamed variable and text
    );
  };

  // Helper to format date string
  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString();
  }

   // Helper to format currency
   const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  return (
    <Box p={4}>
      <Heading as="h2" size="lg" mb={4}>
        Deals Management
      </Heading>

      <Button colorScheme="teal" onClick={handleCreateDealClick} mb={4}>
        Create New Deal
      </Button>

      {/* Loading state from store */}
      {loading && (
        <Box textAlign="center" mt={10}>
          <Spinner size="xl" />
          <Text mt={2}>Loading deals...</Text>
        </Box>
      )}

      {/* Error state from store */}
      {error && (
        <Alert status="error" mt={4} mb={4}> {/* Added mb={4} */}
          <AlertIcon />
          Error loading deals: {error}
        </Alert>
      )}

      {!loading && /* Removed !error check here, show table even if delete failed */ (
        <TableContainer>
          <Table variant='simple' size='sm'>
            <TableCaption>List of current deals</TableCaption>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Person</Th>
                <Th>Stage</Th>
                <Th isNumeric>Amount</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {deals.map((deal) => (
                <Tr key={deal.id}>
                  <Td>{deal.name}</Td>
                  <Td>{formatPersonName(deal.person)}</Td> 
                  <Td>{deal.stage}</Td>
                  <Td isNumeric>{formatCurrency(deal.amount)}</Td>
                  <Td>{formatDate(deal.created_at)}</Td>
                  <Td>
                    <HStack spacing={2}>
                        <IconButton
                            aria-label="Edit deal"
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => handleEditClick(deal)}
                            isDisabled={!!isDeletingId} // Disable if any delete is in progress
                        />
                        <IconButton
                            aria-label="Delete deal"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(deal.id)}
                            isLoading={isDeletingId === deal.id} // Show spinner only on this button
                            isDisabled={!!isDeletingId && isDeletingId !== deal.id} // Disable others during delete
                        />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* Render Modals */} 
      {isCreateModalOpen && (
          <CreateDealModal 
              isOpen={isCreateModalOpen} 
              onClose={onCreateModalClose} 
              onDealCreated={handleDataChanged}
          />
      )}
      {dealToEdit && (
          <EditDealModal 
              deal={dealToEdit}
              isOpen={isEditModalOpen} 
              onClose={() => {
                onEditModalClose();
                setDealToEdit(null);
              }}
              onDealUpdated={handleDataChanged}
          />
      )}

    </Box>
  );
}

export default DealsPage; 