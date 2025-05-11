import { useEffect, useCallback, useState } from 'react';
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
import { useDealsStore, Deal } from '../stores/useDealsStore';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import ListPageLayout from '../components/layout/ListPageLayout';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';
import EmptyState from '../components/common/EmptyState';
import type { Person as GeneratedPerson } from '../generated/graphql/graphql';

function DealsPage() {
  const { deals, dealsLoading: loading, dealsError: error, fetchDeals, deleteDeal: deleteDealAction } = useDealsStore();
  
  const userPermissions = useAppStore((state) => state.userPermissions);
  const currentUserId = useAppStore((state) => state.session?.user.id);
  
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const toast = useToast();

  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [dealToDeleteId, setDealToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    console.log('[DealsPage] isCreateModalOpen changed to:', isCreateModalOpen);
  }, [isCreateModalOpen]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleCreateDealClick = () => {
    onCreateModalOpen();
  };

  const handleDataChanged = useCallback(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleEditClick = (deal: Deal) => {
    setDealToEdit(deal);
    onEditModalOpen();
  };

  const handleDeleteClick = async (dealId: string) => {
    setDealToDeleteId(dealId);
    onConfirmDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!dealToDeleteId) return;

    setIsDeletingId(dealToDeleteId);
    const success = await deleteDealAction(dealToDeleteId);
    setIsDeletingId(null);
    onConfirmDeleteClose();
    setDealToDeleteId(null);

    if (success) {
        toast({ title: 'Deal deleted.', status: 'success', duration: 3000, isClosable: true });
            } else {
            toast({
            title: 'Error Deleting Deal',
            description: error || 'An unknown error occurred', 
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
    }
  };

  const formatPersonName = (person: GeneratedPerson | null | undefined): string => {
    if (!person) return '-';
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

  const formatDate = (dateString: string) => {
    try { return new Date(dateString).toLocaleDateString(); } 
    catch (e) { return 'Invalid Date'; }
  }

   const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  const columns: ColumnDefinition<Deal>[] = [
    {
      key: 'name',
      header: 'Name',
      renderCell: (deal) => deal.name,
      isSortable: true,
    },
    {
      key: 'person',
      header: 'Person',
      renderCell: (deal) => formatPersonName(deal.person as GeneratedPerson | null | undefined),
      isSortable: true,
      sortAccessor: (deal) => formatPersonName(deal.person as GeneratedPerson | null | undefined).toLowerCase(),
    },
    {
      key: 'stage',
      header: 'Stage',
      renderCell: (deal) => (
        <VStack align="start" spacing={0}>
          <Text fontWeight="medium">{deal.stage?.name || '-'}</Text>
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
      sortAccessor: (deal) => deal.amount,
    },
    {
      key: 'created_at',
      header: 'Created',
      renderCell: (deal) => formatDate(deal.created_at),
      isSortable: true,
      sortAccessor: (deal) => new Date(deal.created_at),
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

  const emptyStateProps = {
    icon: ViewIcon,
    title: "No Deals Yet",
    message: "Get started by creating your first deal."
  };

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
    <Box p={6}>
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

      {deals.length === 0 ? (
        <VStack spacing={4} align="stretch">
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
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