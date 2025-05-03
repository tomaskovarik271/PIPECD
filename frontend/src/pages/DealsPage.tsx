import { useState, useEffect, useCallback } from 'react';
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
import EditDealModal from '../components/EditDealModal'; // Import EditDealModal
// Import icons
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

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
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const toast = useToast();

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gqlClient.request<GetDealsQueryResult>(GET_DEALS_QUERY);
      setDeals(data.deals || []);
    } catch (err: any) {
      console.error("Error fetching deals:", err);
      const gqlError = err.response?.errors?.[0]?.message;
      setError(gqlError || err.message || 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleCreateDealClick = () => {
    onCreateModalOpen();
  };

  const handleDealCreated = () => {
    fetchDeals();
  };

  const handleEditClick = (deal: Deal) => {
    setDealToEdit(deal);
    onEditModalOpen();
  };

  const handleDealUpdated = () => {
    fetchDeals();
  };

  const handleDeleteClick = async (dealId: string) => {
    // Check if already deleting this item
    if (isDeleting === dealId) return;

    setDeleteError(null); // Clear previous delete errors
    
    if (window.confirm('Are you sure you want to delete this deal?')) {
        setIsDeleting(dealId); // Set loading state for this specific item
        try {
            const variables = { id: dealId };
            const result = await gqlClient.request<DeleteDealMutationResult>(
                DELETE_DEAL_MUTATION, 
                variables
            );

            if (result.deleteDeal) {
                toast({
                    title: 'Deal deleted.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                fetchDeals(); // Refresh the list
            } else {
                 // Should ideally not happen if mutation throws error on failure
                 throw new Error('Delete operation returned false.');
            }

        } catch (err: any) {
            console.error('Error deleting deal:', err);
            const gqlError = err.response?.errors?.[0]?.message;
            const errorMsg = gqlError || err.message || 'Failed to delete deal';
            setDeleteError(errorMsg); // Set general delete error state
            toast({
                title: 'Error deleting deal',
                description: errorMsg,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
             setIsDeleting(null); // Clear loading state regardless of success/failure
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

      {loading && (
        <Box textAlign="center" mt={10}>
          <Spinner size="xl" />
          <Text mt={2}>Loading deals...</Text>
        </Box>
      )}

      {error && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          Error loading deals: {error}
        </Alert>
      )}

      {/* Display general delete error if any */}
       {deleteError && !loading && (
         <Alert status="error" mt={4} mb={4}>
           <AlertIcon />
           {deleteError}
         </Alert>
       )}

      {!loading && !error && (
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
              {deals.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center">No deals found.</Td>
                </Tr>
              ) : (
                deals.map((deal) => (
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
                          colorScheme="yellow"
                          onClick={() => handleEditClick(deal)}
                          isDisabled={isDeleting === deal.id}
                        />
                        <IconButton
                          aria-label="Delete deal"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDeleteClick(deal.id)}
                          isLoading={isDeleting === deal.id}
                          isDisabled={!!isDeleting && isDeleting !== deal.id}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <CreateDealModal 
        isOpen={isCreateModalOpen} 
        onClose={onCreateModalClose} 
        onDealCreated={handleDealCreated}
      />

      <EditDealModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
            onEditModalClose();
            setDealToEdit(null);
        }} 
        onDealUpdated={handleDealUpdated}
        deal={dealToEdit}
      />
    </Box>
  );
}

export default DealsPage; 