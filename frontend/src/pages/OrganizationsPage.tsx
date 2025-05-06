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
import { EditIcon, DeleteIcon, LockIcon } from '@chakra-ui/icons';
import { useAppStore } from '../stores/useAppStore'; // Import store
import ConfirmationDialog from '../components/common/ConfirmationDialog'; // Import ConfirmationDialog
import EmptyState from '../components/common/EmptyState'; // Import EmptyState
import ListPageLayout from '../components/layout/ListPageLayout'; // Import layout
import SortableTable, { ColumnDefinition } from '../components/common/SortableTable'; // Import table

// REMOVED: GET_ORGANIZATIONS_QUERY (in store)

// --- Type Definition (Keep for component use) ---
interface Organization {
  id: string;
  name: string;
  address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

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
  const organizations = useAppStore((state) => state.organizations);
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
  const [orgToEdit, setOrgToEdit] = useState<Organization | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // For button spinner
  const [orgToDeleteId, setOrgToDeleteId] = useState<string | null>(null);
  const toast = useToast();

  // --- Fetching Logic ---
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

  // Define props for EmptyState
  const emptyStateProps = {
    icon: LockIcon,
    title: "No Organizations Found",
    message: "Add organizations to group your contacts and deals."
  };

  return (
    <ListPageLayout
      title="Organizations"
      newButtonLabel="New Organization"
      onNewButtonClick={handleCreateOrgClick}
      isNewButtonDisabled={!userPermissions?.includes('organization:create')}
      isLoading={loading}
      error={error}
      isEmpty={organizations.length === 0}
      emptyStateProps={emptyStateProps}
    >
      <SortableTable<Organization>
        data={organizations}
        columns={columns}
        initialSortKey="name"
      />
      
      {/* Render Modals */} 
      {isCreateModalOpen && (
      <CreateOrganizationModal 
        isOpen={isCreateModalOpen} 
        onClose={onCreateModalClose} 
            onOrganizationCreated={handleDataChanged}
      />
      )}

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

      {/* Confirmation Dialog for Deleting Organization */}
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

    </ListPageLayout>
  );
}

export default OrganizationsPage; 