import { useEffect, useState, useCallback } from 'react';
// import { gql } from 'graphql-request'; // No longer needed
// import { gqlClient } from '../lib/graphqlClient'; // No longer needed
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
} from '@chakra-ui/react';
import CreateOrganizationModal from '../components/CreateOrganizationModal';
import EditOrganizationModal from '../components/EditOrganizationModal';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useAppStore } from '../stores/useAppStore'; // Import store

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
  const [orgToEdit, setOrgToEdit] = useState<Organization | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // For button spinner
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
    if (isDeletingId === orgId) return; // Prevent double clicks

    if (window.confirm('Are you sure you want to delete this organization? Associated people will have their organization link removed.')) {
        setIsDeletingId(orgId); // Show spinner
        const success = await deleteOrganizationAction(orgId);
        setIsDeletingId(null); // Hide spinner

        if (success) {
            toast({ title: 'Organization deleted.', status: 'success', duration: 3000, isClosable: true });
            } else {
            toast({
                title: 'Error Deleting Organization',
                description: error || 'An unknown error occurred', // Display store error
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    }
  };

  // --- Helper Functions ---
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }

  // --- Render Logic ---
  return (
    <Box p={4}>
      <Heading as="h2" size="lg" mb={4}>
        Organizations Management
      </Heading>

      <Button 
        colorScheme="teal" 
        onClick={handleCreateOrgClick} 
        mb={4}
        isDisabled={!userPermissions?.includes('organization:create')} // Add permission check
      >
        Create New Organization
      </Button>

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

      {!loading && (
        <TableContainer>
          <Table variant='simple' size='sm'>
            <TableCaption>List of organizations</TableCaption>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Address</Th>
                <Th>Notes</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {organizations.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center">No organizations found.</Td>
                </Tr>
              ) : (
                organizations.map((org) => (
                  <Tr key={org.id}>
                    <Td>{org.name}</Td>
                    <Td>{org.address || '-'}</Td>
                    <Td maxW="200px" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">{org.notes || '-'}</Td>
                    <Td>{formatDate(org.created_at)}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Edit organization"
                          icon={<EditIcon />}
                          size="sm"
                          // colorScheme="yellow" // Removed color scheme for consistency
                          onClick={() => handleEditClick(org)}
                          isDisabled={!!isDeletingId || !userPermissions?.includes('organization:update_any')} // Disable if any delete is in progress or lacking perm
                        />
                        <IconButton
                          aria-label="Delete organization"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDeleteClick(org.id)}
                          isLoading={isDeletingId === org.id} // Show spinner for this item
                          isDisabled={!!isDeletingId && isDeletingId !== org.id || !userPermissions?.includes('organization:delete_any')} // Disable if another item is being deleted or lacking perm
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

    </Box>
  );
}

export default OrganizationsPage; 