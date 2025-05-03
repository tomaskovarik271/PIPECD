import { gql, useQuery, useMutation } from '@apollo/client';
import React, { useState } from 'react'; // Import useState
import {
    Box,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Spinner,
    Alert,
    AlertIcon,
    Button,
    Flex,
    Spacer,
    useToast // Import useToast if needed for delete confirmation
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import CreateLeadModal from '../components/CreateLeadModal'; // Import the modal
import EditLeadModal from '../components/EditLeadModal'; // Import the Edit modal
import GenericDeleteConfirmationDialog from '../components/GenericDeleteConfirmationDialog'; // Import generic dialog

// Define the GraphQL query for fetching leads
const GET_LEADS = gql`
  query GetLeads {
    leads {
      id
      name
      email
      company_name
      status
      created_at
      updated_at
      phone
      source
      notes
    }
  }
`;

// Define DELETE_LEAD mutation
const DELETE_LEAD = gql`
  mutation DeleteLead($id: ID!) {
    deleteLead(id: $id)
  }
`;

// Define and EXPORT the expected shape of the data returned by the query
export interface Lead { // Export the interface
    id: string;
    name?: string | null;
    email?: string | null;
    company_name?: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    phone?: string | null; // Added phone
    source?: string | null; // Added source
    notes?: string | null; // Added notes
}

interface GetLeadsData {
    leads: Lead[];
}

interface LeadToDelete {
    id: string;
    name: string; // Store name for the dialog message
}

const LeadsPage: React.FC = () => {
    const { loading: queryLoading, error: queryError, data, refetch } = useQuery<GetLeadsData>(GET_LEADS);
    const toast = useToast();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false); // State for create modal
    const [isEditModalOpen, setEditModalOpen] = useState(false); // State for edit modal
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null); // State for selected lead
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<LeadToDelete | null>(null);

    // TODO: Add state and handlers for delete later
    // const toast = useToast(); // Initialize toast if needed

    // Delete mutation
    const [deleteLeadMutation, { loading: deleteLoading }] = useMutation(DELETE_LEAD, {
        onCompleted: () => {
            toast({ title: 'Lead deleted.', status: 'success', duration: 3000, isClosable: true });
            refetch();
            handleDeleteDialogClose();
        },
        onError: (err) => {
            console.error('Error deleting lead:', err);
            toast({ title: 'Error deleting lead.', description: err.message, status: 'error', duration: 5000, isClosable: true });
            handleDeleteDialogClose();
        },
    });

    if (queryLoading) {
        return <Spinner />;
    }

    if (queryError) {
        return (
            <Alert status="error">
                <AlertIcon />
                Error loading leads: {queryError.message}
            </Alert>
        );
    }

    const leads = data?.leads || [];

    const handleCreateModalClose = () => {
        setCreateModalOpen(false);
    };

    const handleLeadCreated = () => {
        refetch(); // Refetch leads after creation
    };

    const handleEdit = (lead: Lead) => {
        setSelectedLead(lead);
        setEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setEditModalOpen(false);
        setSelectedLead(null); // Clear selected lead on close
    };

    const handleLeadUpdated = () => {
        refetch();
    };

    // --- Delete Dialog Handlers ---
    const handleDeleteClick = (lead: Lead) => {
        setLeadToDelete({ id: lead.id, name: lead.name || 'this lead' }); // Store ID and name
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteDialogClose = () => {
        setIsDeleteDialogOpen(false);
        setLeadToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (leadToDelete) {
            deleteLeadMutation({ variables: { id: leadToDelete.id } });
        }
    };

    return (
        <Box p={5}>
             <Flex mb={5} alignItems="center">
                <Heading>Leads</Heading>
                <Spacer />
                <Button
                    leftIcon={<AddIcon />}
                    colorScheme="teal"
                    onClick={() => setCreateModalOpen(true)} // Open the modal on click
                >
                    Create Lead
                </Button>
            </Flex>

            <TableContainer>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Name</Th>
                            <Th>Company</Th>
                            <Th>Email</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th> 
                        </Tr>
                    </Thead>
                    <Tbody>
                        {leads.length > 0 
                          ? leads.map((lead) => (
                              <Tr key={lead.id}>
                                <Td>{lead.name || '-'}</Td>
                                <Td>{lead.company_name || '-'}</Td>
                                <Td>{lead.email || '-'}</Td>
                                <Td>{lead.status}</Td>
                                <Td>
                                    <Button size="sm" mr={2} leftIcon={<EditIcon />} onClick={() => handleEdit(lead)}>Edit</Button>
                                    <Button size="sm" colorScheme="red" leftIcon={<DeleteIcon />} onClick={() => handleDeleteClick(lead)}>Delete</Button>
                                </Td>
                              </Tr>
                            ))
                          : (
                              <Tr>
                                <Td colSpan={5} textAlign="center">No leads found.</Td>
                              </Tr>
                            )
                        }
                    </Tbody>
                </Table>
            </TableContainer>

            {/* Render the CreateLeadModal */}
            <CreateLeadModal 
                isOpen={isCreateModalOpen} 
                onClose={handleCreateModalClose} 
                onLeadCreated={handleLeadCreated} 
            />

            {/* Conditionally render EditLeadModal only when a lead is selected */}
            {selectedLead && (
                <EditLeadModal 
                    isOpen={isEditModalOpen} 
                    onClose={handleEditModalClose} 
                    lead={selectedLead} 
                    onLeadUpdated={handleLeadUpdated} 
                />
            )}

            <GenericDeleteConfirmationDialog 
                isOpen={isDeleteDialogOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleConfirmDelete}
                itemType="Lead"
                itemName={leadToDelete?.name || ''}
                isLoading={deleteLoading} 
            />

        </Box>
    );
};

export default LeadsPage; 