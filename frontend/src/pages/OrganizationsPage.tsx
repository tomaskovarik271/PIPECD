import { useEffect, useState, useCallback, useMemo } from 'react';
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
import { EditIcon, DeleteIcon, LockIcon, ViewIcon } from '@chakra-ui/icons';
import { useAppStore } from '../stores/useAppStore'; // Import store
import type { Organization as GeneratedOrganization } from '../generated/graphql/graphql'; // Import generated type
import ConfirmationDialog from '../components/common/ConfirmationDialog'; // Import ConfirmationDialog
import EmptyState from '../components/common/EmptyState'; // Import EmptyState
import ListPageLayout from '../components/layout/ListPageLayout'; // Import layout
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable'; // Import table

// REMOVED: GET_ORGANIZATIONS_QUERY (in store)

// --- Type Definition (Keep for component use) - REMOVED
// interface Organization {
//   id: string;
//   name: string;
//   address?: string | null;
//   notes?: string | null;
//   created_at: string;
//   updated_at: string;
// }

// Define sortable keys
type OrgSortKeys = 'name' | 'address' | 'notes' | 'created_at';

// Define sort config type
interface SortConfig {
    key: OrgSortKeys;
    direction: 'ascending' | 'descending';
}
// --- End Type Definition ---

// REMOVED: GetOrganizationsQueryResult (in store)
// REMOVED: DELETE_ORGANIZATION_MUTATION and result type (in store)

function OrganizationsPage() {
  // --- State from Zustand Store ---
  const organizations = useAppStore((state) => state.organizations); // Already uses GeneratedOrganization[]
  const loading = useAppStore((state) => state.organizationsLoading);
  const error = useAppStore((state) => state.organizationsError);
  const fetchOrganizations = useAppStore((state) => state.fetchOrganizations);
  const deleteOrganizationAction = useAppStore((state) => state.deleteOrganization);
  // Fetch permissions
  const userPermissions = useAppStore((state) => state.userPermissions);

  // --- Local UI State ---
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [orgToEdit, setOrgToEdit] = useState<GeneratedOrganization | null>(null); // Use generated type
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // For button spinner
  const [orgToDeleteId, setOrgToDeleteId] = useState<string | null>(null);
  const toast = useToast();

  // --- Fetching Logic ---
  useEffect(() => {
    console.log('[OrganizationsPage] isCreateModalOpen changed to:', isCreateModalOpen);
  }, [isCreateModalOpen]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // --- Handlers ---
  const handleCreateOrgClick = () => {
    onCreateModalOpen();
  };

  // Callback for modals to refresh data
  const handleDataChanged = useCallback(() => {
    fetchOrganizations(); 
  }, [fetchOrganizations]);

  const handleEditClick = (org: GeneratedOrganization) => { // Use generated type
    setOrgToEdit(org);
    onEditModalOpen();
  };

  const handleDeleteClick = async (orgId: string) => {
    setOrgToDeleteId(orgId);
    onConfirmDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!orgToDeleteId) return;

    setIsDeletingId(orgToDeleteId); // Show spinner
    const success = await deleteOrganizationAction(orgToDeleteId);
    setIsDeletingId(null); // Hide spinner
    onConfirmDeleteClose();
    setOrgToDeleteId(null);

    if (success) {
        toast({ title: 'Organization deleted.', status: 'success', duration: 3000, isClosable: true });
    } else {
        toast({
            title: 'Error Deleting Organization',
            description: error || 'An unknown error occurred', // Use organizationsError
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
    }
  };

  // --- Helper Functions ---
  const formatDate = (dateString: string) => {
    try { return new Date(dateString).toLocaleDateString(); } 
    catch (e) { return 'Invalid Date'; }
  }

  // Define Columns for SortableTable
  const columns: ColumnDefinition<GeneratedOrganization>[] = [ // Use generated type
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

  // Define props for EmptyState
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
    <Box p={6}> {/* Main page container with padding */}
      {/* Modals rendered at the top level */}
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

      {/* Conditional content: Empty state or ListPageLayout with table */}
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
          isLoading={loading} // Will be false here
          error={error}       // Will be null here
          isEmpty={false}     // Explicitly false
          emptyStateProps={emptyStatePropsForPage} // Passed but not used if not empty
        >
          <SortableTable<GeneratedOrganization>
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