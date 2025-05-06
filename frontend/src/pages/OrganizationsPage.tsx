import { useEffect, useState, useCallback, useMemo } from 'react';
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
  IconButton,
  HStack,
  useToast,
  useDisclosure,
  VStack,
  Flex,
} from '@chakra-ui/react';
import CreateOrganizationModal from '../components/CreateOrganizationModal';
import EditOrganizationModal from '../components/EditOrganizationModal';
import { EditIcon, DeleteIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { useAppStore } from '../stores/useAppStore'; // Import store
import ConfirmationDialog from '../components/common/ConfirmationDialog'; // Import ConfirmationDialog
import EmptyState from '../components/common/EmptyState'; // Import EmptyState
import { LockIcon } from '@chakra-ui/icons'; // Placeholder icon

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

  // --- Sorting State ---
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });

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

  // --- Sorting Logic ---
  const requestSort = (key: OrgSortKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedOrganizations = useMemo(() => {
    let sortableOrgs = [...organizations];
    sortableOrgs.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'name':
        case 'address':
        case 'notes':
          aValue = a[sortConfig.key]?.toLowerCase() ?? '';
          bValue = b[sortConfig.key]?.toLowerCase() ?? '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableOrgs;
  }, [organizations, sortConfig]);

  // --- Helper Functions ---
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }

  // Helper to render sort icons
  const renderSortIcon = (columnKey: OrgSortKeys) => {
      if (sortConfig.key !== columnKey) return null;
      return sortConfig.direction === 'ascending' ? 
             <TriangleUpIcon aria-label="sorted ascending" ml={1} w={3} h={3} /> : 
             <TriangleDownIcon aria-label="sorted descending" ml={1} w={3} h={3} />;
  };

  // --- Render Logic ---
  return (
    <VStack spacing={4} align="stretch">
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h2" size="lg">
          Organizations
        </Heading>
        <Button 
          colorScheme="blue"
          onClick={handleCreateOrgClick} 
          isDisabled={!userPermissions?.includes('organization:create')}
        >
          New Organization
        </Button>
      </Flex>

      {/* Loading state from store */}
      {loading && (
        <Box textAlign="center" mt={10}>
          <Spinner size="xl" />
          <Text mt={2}>Loading organizations...</Text>
        </Box>
      )}

      {/* Error state from store */}
      {error && (
        <Alert status="error" mt={4} mb={4}>
          <AlertIcon />
          Error loading organizations: {error}
        </Alert>
      )}
      
      {/* REMOVED: deleteError state */}

      {!loading && organizations.length === 0 && (
        <EmptyState 
          icon={LockIcon}
          title="No Organizations Found"
          message="Add organizations to group your contacts and deals."
          actionButtonLabel="Create New Organization"
          onActionButtonClick={handleCreateOrgClick}
          isActionButtonDisabled={!userPermissions?.includes('organization:create')}
        />
      )}

      {!loading && organizations.length > 0 && (
        <TableContainer width="100%" borderWidth="1px" borderRadius="lg">
          <Table variant='simple' size='sm' width="100%">
            <Thead>
              <Tr borderBottomWidth="1px" borderColor="gray.200">
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('name')}>
                  Name {renderSortIcon('name')}
                </Th>
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('address')}>
                  Address {renderSortIcon('address')}
                </Th>
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('notes')}>
                  Notes {renderSortIcon('notes')}
                </Th>
                <Th cursor="pointer" _hover={{ bg: 'gray.100' }} onClick={() => requestSort('created_at')}>
                  Created {renderSortIcon('created_at')}
                </Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedOrganizations.map((org) => (
                <Tr key={org.id} bg="white">
                  <Td>{org.name}</Td>
                  <Td>{org.address || '-'}</Td>
                  <Td maxW="200px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{org.notes || '-'}</Td>
                  <Td>{formatDate(org.created_at)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit organization"
                        icon={<EditIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClick(org)}
                        isDisabled={!!isDeletingId || !userPermissions?.includes('organization:update_any')} // Disable if any delete is in progress or lacking perm
                      />
                      <IconButton
                        aria-label="Delete organization"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeleteClick(org.id)}
                        isLoading={isDeletingId === org.id} // Show spinner for this item
                        isDisabled={!!isDeletingId && isDeletingId !== org.id || !userPermissions?.includes('organization:delete_any')} // Disable if another item is being deleted or lacking perm
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

    </VStack>
  );
}

export default OrganizationsPage; 