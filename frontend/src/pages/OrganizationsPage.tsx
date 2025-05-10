import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Heading,
  Button,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  HStack,
  useToast,
  useDisclosure,
  VStack,
  Flex,
} from '@chakra-ui/react';
import CreateOrganizationModal from '../components/CreateOrganizationModal';
import EditOrganizationModal from '../components/EditOrganizationModal';
import { EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { useAppStore } from '../stores/useAppStore';
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import EmptyState from '../components/common/EmptyState';
import ListPageLayout from '../components/layout/ListPageLayout';
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable';

function OrganizationsPage() {
  const { organizations, organizationsLoading: loading, organizationsError: error, fetchOrganizations, deleteOrganization: deleteOrganizationAction } = useOrganizationsStore();
  
  const userPermissions = useAppStore((state) => state.userPermissions);

  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [orgToEdit, setOrgToEdit] = useState<Organization | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [orgToDeleteId, setOrgToDeleteId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    console.log('[OrganizationsPage] isCreateModalOpen changed to:', isCreateModalOpen);
  }, [isCreateModalOpen]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleCreateOrgClick = () => {
    onCreateModalOpen();
  };

  const handleDataChanged = useCallback(() => {
    fetchOrganizations(); 
  }, [fetchOrganizations]);

  const handleEditClick = (org: Organization) => {
    setOrgToEdit(org);
    onEditModalOpen();
  };

  const handleDeleteClick = async (orgId: string) => {
    setOrgToDeleteId(orgId);
    onConfirmDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!orgToDeleteId) return;

    setIsDeletingId(orgToDeleteId);
    const success = await deleteOrganizationAction(orgToDeleteId);
    setIsDeletingId(null);
    onConfirmDeleteClose();
    setOrgToDeleteId(null);

    if (success) {
        toast({ title: 'Organization deleted.', status: 'success', duration: 3000, isClosable: true });
    } else {
        toast({
            title: 'Error Deleting Organization',
            description: error || 'An unknown error occurred',
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
    }
  };

  const formatDate = (dateString: string) => {
    try { return new Date(dateString).toLocaleDateString(); } 
    catch (e) { return 'Invalid Date'; }
  }

  const columns: ColumnDefinition<Organization>[] = [
    {
      key: 'name',
      header: 'Name',
      renderCell: (org) => org.name,
      isSortable: true,
    },
    {
      key: 'address',
      header: 'Address',
      renderCell: (org) => org.address || '-',
      isSortable: true,
      sortAccessor: (org) => org.address?.toLowerCase() ?? '',
    },
    {
      key: 'notes',
      header: 'Notes',
      renderCell: (org) => (
          <Text maxW="200px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
              {org.notes || '-'}
          </Text>
      ),
      isSortable: true,
      sortAccessor: (org) => org.notes?.toLowerCase() ?? '',
    },
    {
      key: 'created_at',
      header: 'Created',
      renderCell: (org) => formatDate(org.created_at),
      isSortable: true,
      sortAccessor: (org) => new Date(org.created_at),
    },
    {
      key: 'actions',
      header: 'Actions',
      renderCell: (org) => (
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit organization"
              icon={<EditIcon />}
              size="sm"
              variant="ghost"
              onClick={() => handleEditClick(org)}
              isDisabled={!!isDeletingId || !userPermissions?.includes('organization:update_any')}
            />
            <IconButton
              aria-label="Delete organization"
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => handleDeleteClick(org.id)}
              isLoading={isDeletingId === org.id}
              isDisabled={!!isDeletingId && isDeletingId !== org.id || !userPermissions?.includes('organization:delete_any')}
            />
          </HStack>
      ),
      isSortable: false,
    },
  ];

  const emptyStatePropsForPage = {
    icon: ViewIcon,
    title: "No Organizations Yet",
    message: "Get started by adding your first organization."
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
        Error fetching organizations: {error}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <CreateOrganizationModal 
        isOpen={isCreateModalOpen} 
        onClose={onCreateModalClose} 
        onOrganizationCreated={handleDataChanged}
      />

      {orgToEdit && (
      <EditOrganizationModal 
        organization={orgToEdit} 
        isOpen={isEditModalOpen} 
        onClose={() => { 
            onEditModalClose(); 
            setOrgToEdit(null); 
        }} 
        onOrganizationUpdated={() => {
            handleDataChanged(); 
            onEditModalClose(); 
            setOrgToEdit(null); 
        }} 
      />
      )}

      <ConfirmationDialog 
        isOpen={isConfirmDeleteDialogOpen}
        onClose={onConfirmDeleteClose}
        onConfirm={handleConfirmDelete}
        headerText="Delete Organization"
        bodyText="Are you sure you want to delete this organization? Associated people will have their organization link removed. This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonColorScheme="red"
        isLoading={!!isDeletingId}
      />

      {organizations.length === 0 ? (
        <VStack spacing={4} align="stretch">
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading as="h2" size="lg">Organizations</Heading>
            <Button 
              colorScheme="blue"
              onClick={handleCreateOrgClick}
              isDisabled={!userPermissions?.includes('organization:create')}
            >
              New Organization
            </Button>
          </Flex>
          <EmptyState 
            icon={emptyStatePropsForPage.icon}
            title={emptyStatePropsForPage.title}
            message={emptyStatePropsForPage.message}
            actionButtonLabel="New Organization"
            onActionButtonClick={handleCreateOrgClick}
            isActionButtonDisabled={!userPermissions?.includes('organization:create')}
          />
        </VStack>
      ) : (
        <ListPageLayout
          title="Organizations"
          newButtonLabel="New Organization"
          onNewButtonClick={handleCreateOrgClick}
          isNewButtonDisabled={!userPermissions?.includes('organization:create')}
          isLoading={loading}
          error={error}
          isEmpty={false}
          emptyStateProps={emptyStatePropsForPage}
        >
          <SortableTable<Organization>
            data={organizations}
            columns={columns}
            initialSortKey="name"
          />
        </ListPageLayout>
      )}
    </Box>
  );
}

export default OrganizationsPage; 