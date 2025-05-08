import { useEffect, useCallback, useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Button,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  IconButton,
  HStack,
  useToast,
  VStack,
  Flex,
} from '@chakra-ui/react';
import CreateDealModal from '../components/CreateDealModal';
import EditDealModal from '../components/EditDealModal';
import { EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { useAppStore } from '../stores/useAppStore';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import ListPageLayout from '../components/layout/ListPageLayout';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';
import EmptyState from '../components/common/EmptyState';
import type { Deal, Person as GeneratedPerson, Stage as GeneratedStage } from '../generated/graphql/graphql'; // Import generated types

// Keep Deal/DealPerson types for component use - REMOVED
// interface DealPerson {
//     id: string;
//     first_name?: string | null;
//     last_name?: string | null;
//     email?: string | null;
// }

// Add nested Stage type for Deal (matching store definition) - REMOVED
// interface DealStage { 
//     id: string;
//     name: string;
//     pipeline_id: string;
//     pipeline?: { name: string };
// }

// Update local Deal interface - REMOVED
// interface Deal {
//   id: string;
//   name: string;
//   stage: DealStage;
//   stage_id?: string | null;
//   amount?: number | null;
//   created_at: string;
//   updated_at: string;
//   person_id?: string | null;
//   person?: DealPerson | null;
//   user_id?: string | null;
// }

function DealsPage() {
  // --- State from Zustand Store ---
  const deals = useAppStore((state) => state.deals); // deals is already using generated Deal from store
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
  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null); // Uses generated Deal from store
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const toast = useToast();

  // For Confirmation Dialog
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [dealToDeleteId, setDealToDeleteId] = useState<string | null>(null);

  // DEBUG: Log when isCreateModalOpen changes
  useEffect(() => {
    console.log('[DealsPage] isCreateModalOpen changed to:', isCreateModalOpen);
  }, [isCreateModalOpen]);

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

  const handleEditClick = (deal: Deal) => { // Uses generated Deal from store
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

  // Helper function to format person name for display
  const formatPersonName = (person: GeneratedPerson | null | undefined): string => { // Use GeneratedPerson
    if (!person) return '-'; // Return hyphen for display
    return (
      person.last_name && person.first_name
      ? `${person.last_name}, ${person.first_name}`
      : person.first_name
      ? person.first_name
      : person.last_name
      ? person.last_name
      // : person.email || 'Unnamed Person' // Generated Person might not have email directly if not queried, check schema/query for Deal.person
      // Assuming GET_DEALS_QUERY fetches person { id first_name last_name email }, so email should be available.
      : person.email || 'Unnamed Person' 
    );
  };

  // Helper to format date string
  const formatDate = (dateString: string) => {
    try { return new Date(dateString).toLocaleDateString(); } 
    catch (e) { return 'Invalid Date'; }
  }

   // Helper to format currency
   const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  // Define Columns for SortableTable
  const columns: ColumnDefinition<Deal>[] = [ // Uses generated Deal from store
    {
      key: 'name',
      header: 'Name',
      renderCell: (deal) => deal.name,
      isSortable: true,
    },
    {
      key: 'person',
      header: 'Person',
      renderCell: (deal) => formatPersonName(deal.person as GeneratedPerson | null | undefined), // Cast deal.person if its type is broader
      isSortable: true,
      // Provide accessor for sorting based on formatted name
      sortAccessor: (deal) => formatPersonName(deal.person as GeneratedPerson | null | undefined).toLowerCase(),
    },
    {
      key: 'stage',
      header: 'Stage',
      renderCell: (deal) => (
        <VStack align="start" spacing={0}>
          {/* Assuming deal.stage is of type GeneratedStage | null | undefined */}
          <Text fontWeight="medium">{deal.stage?.name || '-'}</Text>
          {/* Assuming deal.stage.pipeline is available and correctly typed by codegen based on GET_DEALS_QUERY */}
          <Text fontSize="xs" color="gray.500">{deal.stage?.pipeline?.name || 'Pipeline N/A'}</Text>
        </VStack>
      ),
      isSortable: true,
      sortAccessor: (deal) => deal.stage?.name?.toLowerCase() ?? '',
    },
    {
      key: 'amount',
      header: 'Amount',
      renderCell: (deal) => formatCurrency(deal.amount),
      isSortable: true,
      isNumeric: true,
      sortAccessor: (deal) => deal.amount, // Sort by raw amount
    },
    {
      key: 'created_at',
      header: 'Created',
      renderCell: (deal) => formatDate(deal.created_at),
      isSortable: true,
      sortAccessor: (deal) => new Date(deal.created_at), // Sort by Date object
    },
    {
      key: 'actions',
      header: 'Actions',
      renderCell: (deal) => (
        <HStack spacing={2}>
          <IconButton
            aria-label="Edit deal"
            icon={<EditIcon />}
            size="sm"
            variant="ghost"
            onClick={() => handleEditClick(deal)}
            isDisabled={
              !!isDeletingId ||
              !(
                userPermissions?.includes('deal:update_any') ||
                (userPermissions?.includes('deal:update_own') && deal.user_id === currentUserId)
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
              (!!isDeletingId && isDeletingId !== deal.id) ||
              !(
                userPermissions?.includes('deal:delete_any') ||
                (userPermissions?.includes('deal:delete_own') && deal.user_id === currentUserId)
              )
            }
          />
        </HStack>
      ),
      isSortable: false,
    },
  ];

  // Define props for EmptyState used within ListPageLayout
  const emptyStateProps = {
    icon: ViewIcon,
    title: "No Deals Yet",
    message: "Get started by creating your first deal."
  };

  // Conditional rendering for loading and error states
  if (loading) {
    return (
      <Flex justify="center" align="center" minH="calc(100vh - 200px)">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" m={4}>
        <AlertIcon />
        Error fetching deals: {error}
      </Alert>
    );
  }

  return (
    <Box p={6}> {/* Add padding similar to ListPageLayout content area if needed */}
      {/* Render modals first, so they are in the DOM tree */}
      <CreateDealModal 
        isOpen={isCreateModalOpen} 
        onClose={onCreateModalClose} 
        onDealCreated={handleDataChanged}
      />
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
      <ConfirmationDialog 
        isOpen={isConfirmDeleteDialogOpen}
        onClose={onConfirmDeleteClose}
        onConfirm={handleConfirmDelete}
        headerText="Delete Deal"
        bodyText="Are you sure you want to delete this deal? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonColorScheme="red"
        isLoading={!!isDeletingId}
      />

      {/* Logic to switch between EmptyState and ListPageLayout with Table */}
      {deals.length === 0 ? (
        <VStack spacing={4} align="stretch">
          <Flex justifyContent="space-between" alignItems="center" mb={4}> {/* Mimic ListPageLayout header */}
            <Heading as="h2" size="lg">Deals</Heading>
            <Button 
              colorScheme="blue"
              onClick={handleCreateDealClick}
              isDisabled={!userPermissions?.includes('deal:create')}
            >
              New Deal
            </Button>
          </Flex>
          <EmptyState 
            icon={emptyStateProps.icon}
            title={emptyStateProps.title}
            message={emptyStateProps.message}
            actionButtonLabel="New Deal"
            onActionButtonClick={handleCreateDealClick}
            isActionButtonDisabled={!userPermissions?.includes('deal:create')}
          />
        </VStack>
      ) : (
        <ListPageLayout
          title="Deals"
          newButtonLabel="New Deal"
          onNewButtonClick={handleCreateDealClick}
          isNewButtonDisabled={!userPermissions?.includes('deal:create')}
          isLoading={loading}
          error={error}
          isEmpty={false}
          emptyStateProps={emptyStateProps}
        >
          <SortableTable<Deal>
            data={deals}
            columns={columns}
            initialSortKey="name"
          />
        </ListPageLayout>
      )}
    </Box>
  );
}

export default DealsPage; 