import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  IconButton,
  useDisclosure, // For modals
  useToast,
  Tag,
  Flex
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useWFMStatusStore } from '../../stores/useWFMStatusStore';
import { WfmStatus } from '../../generated/graphql/graphql';
import CreateStatusModal from '../../components/admin/wfm/CreateStatusModal';
import EditStatusModal from '../../components/admin/wfm/EditStatusModal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

const WFMStatusesPage: React.FC = () => {
  const {
    statuses,
    loading,
    error,
    fetchWFMStatuses,
    deleteWFMStatus, // Import from store
  } = useWFMStatusStore();

  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const [statusToEdit, setStatusToEdit] = useState<WfmStatus | null>(null);

  const { isOpen: isConfirmDeleteOpen, onOpen: onConfirmDeleteOpen, onClose: onConfirmDeleteClose } = useDisclosure();
  const [statusToDelete, setStatusToDelete] = useState<WfmStatus | null>(null); // Store the whole status object for name in dialog
  const toast = useToast();

  useEffect(() => {
    fetchWFMStatuses();
  }, [fetchWFMStatuses]);

  const handleAddNewStatus = () => {
    setStatusToEdit(null); // Ensure edit state is clear for create
    onCreateModalOpen();
  };

  const handleEditStatus = (status: WfmStatus) => {
    setStatusToEdit(status);
    onEditModalOpen();
  };

  const handleDeleteStatusClick = (status: WfmStatus) => {
    setStatusToDelete(status);
    onConfirmDeleteOpen();
  };

  const confirmDeleteAction = async () => {
    if (statusToDelete) {
      const success = await deleteWFMStatus(statusToDelete.id);
      if (success) {
        toast({ title: 'Status deleted', description: `Status "${statusToDelete.name}" was successfully deleted.`, status: 'success', duration: 3000 });
        // fetchWFMStatuses(); // Store already updates the list optimistically or based on its own logic
      } else {
        // Error should be caught by the store and reflected in the 'error' state variable from the store
        // The store itself logs the error to console.
        toast({ title: 'Error deleting status', description: useWFMStatusStore.getState().error || 'An unknown error occurred.', status: 'error', duration: 5000 });
      }
      onConfirmDeleteClose();
      setStatusToDelete(null);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="xl">
          Manage WFM Statuses
        </Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAddNewStatus}>
          New Status
        </Button>
      </Flex>
      <Text mb={4}>
        Define and manage global statuses for all workflows.
      </Text>

      {loading && statuses.length === 0 && (
        <Flex justifyContent="center" my={8}>
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
        </Flex>
      )}

      {error && (
        <Alert status="error" my={4}>
          <AlertIcon />
          <AlertTitle>Error communicating with server!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && statuses.length === 0 && (
         <Box textAlign="center" p={10} borderWidth="1px" borderRadius="lg" shadow="sm">
            <Heading as="h3" size="md" mb={2}>No WFM Statuses Found</Heading>
            <Text mb={4}>Get started by creating your first WFM status.</Text>
            <Button colorScheme="blue" onClick={handleAddNewStatus}>Create First Status</Button>
        </Box>
      )}

      {statuses.length > 0 && (
        <Box borderWidth="1px" borderRadius="lg" shadow="sm" overflowX="auto">
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Color</Th>
                <Th>Archived</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {statuses.map((status) => (
                <Tr key={status.id}>
                  <Td>{status.name}</Td>
                  <Td whiteSpace="normal" wordBreak="break-word">{status.description}</Td>
                  <Td>
                    {status.color && (
                      <HStack spacing={2}>
                        <Box w="20px" h="20px" bg={status.color} borderRadius="sm" borderWidth="1px" borderColor="gray.300" />
                        <Text>{status.color}</Text>
                      </HStack>
                    )}
                  </Td>
                  <Td>
                    <Tag colorScheme={status.isArchived ? 'red' : 'green'}>
                      {status.isArchived ? 'Yes' : 'No'}
                    </Tag>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton 
                        aria-label="Edit status" 
                        icon={<EditIcon />} 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditStatus(status)}
                        isDisabled={loading}
                      />
                      <IconButton 
                        aria-label="Delete status" 
                        icon={<DeleteIcon />} 
                        size="sm" 
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteStatusClick(status)}
                        isDisabled={loading}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <CreateStatusModal 
        isOpen={isCreateModalOpen} 
        onClose={onCreateModalClose} 
        onStatusCreated={() => fetchWFMStatuses()} 
      />
      
      {statusToEdit && (
        <EditStatusModal 
            isOpen={isEditModalOpen} 
            onClose={onEditModalClose} 
            statusToEdit={statusToEdit} 
            onStatusUpdated={() => fetchWFMStatuses()} 
        />
      )}

      {statusToDelete && (
        <ConfirmationDialog 
            isOpen={isConfirmDeleteOpen} 
            onClose={onConfirmDeleteClose} 
            onConfirm={confirmDeleteAction} 
            title="Delete Status"
            body={`Are you sure you want to delete the status "${statusToDelete.name}"? This action cannot be undone.`}
            confirmButtonText="Delete"
            confirmButtonColor="red"
        />
      )}

    </Container>
  );
};

export default WFMStatusesPage; 