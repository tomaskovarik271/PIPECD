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
  IconButton,
  HStack,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import { gqlClient } from '../lib/graphqlClient';
import CreateOrganizationModal from '../components/CreateOrganizationModal';
import EditOrganizationModal from '../components/EditOrganizationModal';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'; // Assuming reuse

// GraphQL Query to fetch organizations
const GET_ORGANIZATIONS_QUERY = gql`
  query GetOrganizations {
    organizations {
      id
      name
      address
      notes
      created_at
      updated_at
      # Add other fields if needed, e.g., user_id
    }
  }
`;

// Interface for Organization data
interface Organization {
  id: string;
  name: string;
  address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // user_id: string; // Uncomment if needed
}

// Interface for the query result
interface GetOrganizationsQueryResult {
  organizations: Organization[];
}

// Define DELETE_ORGANIZATION_MUTATION
const DELETE_ORGANIZATION_MUTATION = gql`
  mutation DeleteOrganization($id: ID!) {
    deleteOrganization(id: $id)
  }
`;

// Interface for the delete mutation result
interface DeleteOrganizationMutationResult {
  deleteOrganization: boolean;
}

function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const [orgToEdit, setOrgToEdit] = useState<Organization | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const toast = useToast();

  // --- Fetching Logic ---
  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gqlClient.request<GetOrganizationsQueryResult>(GET_ORGANIZATIONS_QUERY);
      setOrganizations(data.organizations || []);
    } catch (err: any) {
      console.error("Error fetching organizations:", err);
      const gqlError = err.response?.errors?.[0]?.message;
      setError(gqlError || err.message || 'Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // --- Handlers ---
  const handleCreateOrgClick = () => {
    onCreateModalOpen();
  };

  const handleOrgCreated = () => {
    fetchOrganizations(); // Refresh list after creation
  };

  const handleEditClick = (org: Organization) => {
    setOrgToEdit(org);
    onEditModalOpen();
  };

  const handleOrgUpdated = () => {
    fetchOrganizations(); // Refresh list after update
  };

  const handleDeleteClick = async (orgId: string) => {
    // console.log("Delete Organization clicked - Not implemented yet", orgId); // Remove log
    // Check if already deleting this item
    if (isDeleting === orgId) return;

    setDeleteError(null); // Clear previous delete errors

    if (window.confirm('Are you sure you want to delete this organization? Note: Associated people will not be deleted.')) {
        setIsDeleting(orgId); // Set loading state for this specific item
        try {
            const variables = { id: orgId };
            const result = await gqlClient.request<DeleteOrganizationMutationResult>(
                DELETE_ORGANIZATION_MUTATION, 
                variables
            );

            if (result.deleteOrganization) {
                toast({
                    title: 'Organization deleted.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                fetchOrganizations(); // Refresh the list
            } else {
                 // Should ideally not happen if mutation throws error on failure
                 throw new Error('Delete operation returned false.');
            }

        } catch (err: any) {
            console.error('Error deleting organization:', err);
            const gqlError = err.response?.errors?.[0]?.message;
            const errorMsg = gqlError || err.message || 'Failed to delete organization';
            setDeleteError(errorMsg); // Set general delete error state
            toast({
                title: 'Error deleting organization',
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

      <Button colorScheme="teal" onClick={handleCreateOrgClick} mb={4}>
        Create New Organization
      </Button>

      {loading && (
        <Box textAlign="center" mt={10}>
          <Spinner size="xl" />
          <Text mt={2}>Loading organizations...</Text>
        </Box>
      )}

      {error && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          Error loading organizations: {error}
        </Alert>
      )}
      
      {deleteError && !loading && (
        <Alert status="error" mt={4} mb={4}>
           <AlertIcon />
           {deleteError}
         </Alert>
       )}

      {!loading && !error && (
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
                    <Td maxW="200px" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">{org.notes || '-'}</Td> {/* Truncate notes */}
                    <Td>{formatDate(org.created_at)}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Edit organization"
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="yellow"
                          onClick={() => handleEditClick(org)}
                          isDisabled={isDeleting === org.id} // Disable if this item is being deleted
                        />
                        <IconButton
                          aria-label="Delete organization"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDeleteClick(org.id)}
                          isLoading={isDeleting === org.id} // Show spinner for this item
                          isDisabled={!!isDeleting && isDeleting !== org.id} // Disable if another item is being deleted
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

      <CreateOrganizationModal 
        isOpen={isCreateModalOpen} 
        onClose={onCreateModalClose} 
        onOrganizationCreated={handleOrgCreated} 
      />
      <EditOrganizationModal 
        isOpen={isEditModalOpen} 
        onClose={() => { onEditModalClose(); setOrgToEdit(null); }}
        onOrganizationUpdated={handleOrgUpdated} 
        organization={orgToEdit}
      />
    </Box>
  );
}

export default OrganizationsPage; 