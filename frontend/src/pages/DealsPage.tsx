import { useEffect, useCallback, useState, useMemo } from 'react';
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
  TableContainer,
  useDisclosure,
  IconButton,
  HStack,
  useToast,
  VStack,
  Flex,
} from '@chakra-ui/react';
import CreateDealModal from '../components/CreateDealModal';
import EditDealModal from '../components/EditDealModal';
import { EditIcon, DeleteIcon, ViewIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { useAppStore } from '../stores/useAppStore';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import EmptyState from '../components/common/EmptyState';

// Keep Deal/DealPerson types for component use
interface DealPerson {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
}

// Add nested Stage type for Deal (matching store definition)
interface DealStage { 
    id: string;
    name: string;
    pipeline_id: string;
    pipeline?: { name: string };
}

// Update local Deal interface
interface Deal {
  id: string;
  name: string;
  stage: DealStage;
  stage_id?: string | null;
  amount?: number | null;
  created_at: string;
  updated_at: string;
  person_id?: string | null;
  person?: DealPerson | null;
  user_id?: string | null;
}

// Define sortable keys
type DealSortKeys = 'name' | 'person' | 'stage' | 'amount' | 'created_at';

// Define sort config type
interface SortConfig {
    key: DealSortKeys;
    direction: 'ascending' | 'descending';
}

function DealsPage() {
  // --- State from Zustand Store ---
  const deals = useAppStore((state) => state.deals);
  const loading = useAppStore((state) => state.dealsLoading);
  const error = useAppStore((state) => state.dealsError);
  const fetchDeals = useAppStore((state) => state.fetchDeals);
  const deleteDealAction = useAppStore((state) => state.deleteDeal);
  // Fetch permissions
  const userPermissions = useAppStore((state) => state.userPermissions);
  // Fetch current user ID
  const currentUserId = useAppStore((state) => state.session?.user.id);
  
  // --- Local UI State ---
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const toast = useToast();

  // For Confirmation Dialog
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [dealToDeleteId, setDealToDeleteId] = useState<string | null>(null);

  // --- Sorting State ---
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });

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
    // Prevent double clicks - this logic might be less relevant with a modal
    // if (isDeletingId === dealId) return; 
    
    setDealToDeleteId(dealId); // Set the ID for confirmation
    onConfirmDeleteOpen(); // Open the confirmation dialog
  };

  const handleConfirmDelete = async () => {
    if (!dealToDeleteId) return;

    setIsDeletingId(dealToDeleteId); // Show spinner on original button (optional, or handle within dialog)
    const success = await deleteDealAction(dealToDeleteId); // Call store action
    setIsDeletingId(null); // Hide spinner
    onConfirmDeleteClose(); // Close the dialog
    setDealToDeleteId(null); // Reset the ID

    if (success) {
        toast({ title: 'Deal deleted.', status: 'success', duration: 3000, isClosable: true });
            } else {
            toast({
            title: 'Error Deleting Deal',
            // Error is managed by the store, useAppStore.dealsError
            description: error || 'An unknown error occurred', 
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
    }
  };

  // --- Sorting Logic ---
  const requestSort = (key: DealSortKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedDeals = useMemo(() => {
    let sortableDeals = [...deals];
    sortableDeals.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Access nested properties for sorting
      switch (sortConfig.key) {
        case 'person':
          aValue = formatPersonName(a.person).toLowerCase();
          bValue = formatPersonName(b.person).toLowerCase();
          break;
        case 'stage':
          aValue = a.stage?.name?.toLowerCase() ?? '';
          bValue = b.stage?.name?.toLowerCase() ?? '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'amount':
          aValue = a.amount ?? -Infinity; // Treat null amounts as lowest value for ascending
          bValue = b.amount ?? -Infinity;
          break;
        default: // 'name'
          aValue = a[sortConfig.key]?.toLowerCase() ?? '';
          bValue = b[sortConfig.key]?.toLowerCase() ?? '';
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
    }
      return 0;
    });
    return sortableDeals;
  }, [deals, sortConfig]);

  // Helper function to format person name for display
  const formatPersonName = (person: DealPerson | null | undefined): string => {
    if (!person) return '- ';
    return (
      person.last_name && person.first_name
      ? `${person.last_name}, ${person.first_name}`
      : person.first_name
      ? person.first_name
      : person.last_name
      ? person.last_name
      : person.email || 'Unnamed Person'
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

  // Helper to render sort icons
  const renderSortIcon = (columnKey: DealSortKeys) => {
      if (sortConfig.key !== columnKey) return null;
      return sortConfig.direction === 'ascending' ? 
             <TriangleUpIcon aria-label="sorted ascending" ml={1} w={3} h={3} /> : 
             <TriangleDownIcon aria-label="sorted descending" ml={1} w={3} h={3} />;
  };

  return (
    <VStack spacing={4} align="stretch">
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h2" size="lg">
          Deals
        </Heading>
        <Button 
          colorScheme="blue"
          onClick={handleCreateDealClick} 
          isDisabled={!userPermissions?.includes('deal:create')}
        >
          New Deal
        </Button>
      </Flex>

      {/* Loading state from store */}
      {loading && (
        <Box textAlign="center" mt={10}>
          <Spinner size="xl" />
          <Text mt={2}>Loading deals...</Text>
        </Box>
      )}

      {/* Error state from store */}
      {error && (
        <Alert status="error" mt={4} mb={4}>
          <AlertIcon />
          Error loading deals: {error}
        </Alert>
      )}

      {!loading && deals.length === 0 && (
          <EmptyState 
            icon={ViewIcon}
            title="No Deals Yet"
            message="Get started by creating your first deal."
            actionButtonLabel="Create New Deal"
            onActionButtonClick={handleCreateDealClick}
            isActionButtonDisabled={!userPermissions?.includes('deal:create')}
          />
       )}

      {!loading && deals.length > 0 && (
        <TableContainer width="100%" borderWidth="1px" borderRadius="lg">
          <Table variant='simple' size='sm' width="100%">
            {/* <TableCaption>List of current deals</TableCaption> */}
            <Thead>
              <Tr borderBottomWidth="1px" borderColor="gray.200">
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('name')}>
                  Name {renderSortIcon('name')}
                </Th>
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('person')}>
                  Person {renderSortIcon('person')}
                </Th>
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('stage')}>
                  Stage {renderSortIcon('stage')}
                </Th>
                <Th isNumeric cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('amount')}>
                  Amount {renderSortIcon('amount')}
                </Th>
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('created_at')}>
                  Created {renderSortIcon('created_at')}
                </Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedDeals.map((deal) => (
                  <Tr key={deal.id} bg="white">
                    <Td>{deal.name}</Td>
                    <Td>{formatPersonName(deal.person)}</Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{deal.stage?.name || '-'}</Text>
                        <Text fontSize="xs" color="gray.500">{deal.stage?.pipeline?.name || 'Pipeline N/A'}</Text>
                      </VStack>
                    </Td>
                    <Td isNumeric>{formatCurrency(deal.amount)}</Td>
                    <Td>{formatDate(deal.created_at)}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Edit deal"
                          icon={<EditIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(deal)}
                          isDisabled={
                            !!isDeletingId || // Still disable if any delete is in progress
                            !(
                              userPermissions?.includes('deal:update_any') || // Enable if has _any perm
                              (userPermissions?.includes('deal:update_own') && deal.user_id === currentUserId) // OR (has _own perm AND is owner)
                            )
                          }
                        />
                        <IconButton
                          aria-label="Delete deal"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(deal.id)}
                          isLoading={isDeletingId === deal.id}
                          isDisabled={
                            (!!isDeletingId && isDeletingId !== deal.id) || // New RBAC logic
                            !(
                              userPermissions?.includes('deal:delete_any') || // Enable if has _any perm
                              (userPermissions?.includes('deal:delete_own') && deal.user_id === currentUserId) // OR (has _own perm AND is owner)
                            )
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

      {/* Confirmation Dialog for Deleting Deals */}
      <ConfirmationDialog 
        isOpen={isConfirmDeleteDialogOpen}
        onClose={onConfirmDeleteClose}
        onConfirm={handleConfirmDelete}
        headerText="Delete Deal"
        bodyText="Are you sure you want to delete this deal? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonColorScheme="red"
        isLoading={!!isDeletingId} // Pass loading state to dialog's confirm button
      />

    </VStack>
  );
}

export default DealsPage; 