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
import { useThemeStore } from '../../stores/useThemeStore'; // Import useThemeStore

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

  // Get current theme
  const currentThemeName = useThemeStore((state) => state.currentTheme);
  const isModernTheme = currentThemeName === 'modern';

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
        <Heading as="h1" size="xl" color={isModernTheme ? "white" : undefined}>
          Manage WFM Statuses
        </Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAddNewStatus}>
          New Status
        </Button>
      </Flex>
      <Text mb={4} color={isModernTheme ? "gray.300" : undefined}>
        Define and manage global statuses for all workflows.
      </Text>

      {loading && statuses.length === 0 && (
        <Flex justifyContent="center" my={8}>
          <Spinner thickness="4px" speed="0.65s" emptyColor={isModernTheme ? "gray.700" : "gray.200"} color="blue.500" size="xl" />
        </Flex>
      )}

      {error && (
        <Alert status="error" my={4} variant={isModernTheme ? "subtle" : "solid"} bg={isModernTheme ? "red.900" : undefined} borderRadius={isModernTheme ? "lg" : undefined}>
          <AlertIcon color={isModernTheme ? "red.300" : undefined}/>
          <AlertTitle color={isModernTheme ? "white" : undefined}>Error communicating with server!</AlertTitle>
          <AlertDescription color={isModernTheme ? "gray.200" : undefined}>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && statuses.length === 0 && (
         <Box textAlign="center" p={10} borderWidth="1px" borderRadius="lg" bg={isModernTheme ? "gray.800" : undefined} borderColor={isModernTheme ? "gray.600" : "gray.200"} shadow="sm">
            <Heading as="h3" size="md" mb={2} color={isModernTheme ? "white" : undefined}>No WFM Statuses Found</Heading>
            <Text mb={4} color={isModernTheme ? "gray.300" : undefined}>Get started by creating your first WFM status.</Text>
            <Button colorScheme="blue" onClick={handleAddNewStatus}>Create First Status</Button>
        </Box>
      )}

      {statuses.length > 0 && (
        <Box 
          borderWidth="1px" 
          borderRadius="xl" 
          shadow="sm" 
          overflowX="auto"
          bg={isModernTheme ? "gray.800" : undefined}
          borderColor={isModernTheme ? "gray.700" : "gray.200"} // Use gray.700 for a less prominent container border
          p={isModernTheme ? 6 : 0} // Add padding for modern theme container
        >
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th color={isModernTheme ? "gray.300" : undefined} borderColor={isModernTheme ? "gray.600" : undefined} fontWeight={isModernTheme ? "semibold" : undefined} textTransform={isModernTheme ? "uppercase" : undefined} fontSize={isModernTheme ? "xs" : undefined}>Name</Th>
                <Th color={isModernTheme ? "gray.300" : undefined} borderColor={isModernTheme ? "gray.600" : undefined} fontWeight={isModernTheme ? "semibold" : undefined} textTransform={isModernTheme ? "uppercase" : undefined} fontSize={isModernTheme ? "xs" : undefined}>Description</Th>
                <Th color={isModernTheme ? "gray.300" : undefined} borderColor={isModernTheme ? "gray.600" : undefined} fontWeight={isModernTheme ? "semibold" : undefined} textTransform={isModernTheme ? "uppercase" : undefined} fontSize={isModernTheme ? "xs" : undefined}>Color</Th>
                <Th color={isModernTheme ? "gray.300" : undefined} borderColor={isModernTheme ? "gray.600" : undefined} fontWeight={isModernTheme ? "semibold" : undefined} textTransform={isModernTheme ? "uppercase" : undefined} fontSize={isModernTheme ? "xs" : undefined}>Archived</Th>
                <Th color={isModernTheme ? "gray.300" : undefined} borderColor={isModernTheme ? "gray.600" : undefined} fontWeight={isModernTheme ? "semibold" : undefined} textTransform={isModernTheme ? "uppercase" : undefined} fontSize={isModernTheme ? "xs" : undefined}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {statuses.map((status) => (
                <Tr key={status.id} _hover={isModernTheme ? { bg: "gray.700" } : {}}>
                  <Td color={isModernTheme ? "white" : undefined} borderColor={isModernTheme ? "gray.600" : undefined}>{status.name}</Td>
                  <Td whiteSpace="normal" wordBreak="break-word" color={isModernTheme ? "gray.300" : undefined} borderColor={isModernTheme ? "gray.600" : undefined}>{status.description}</Td>
                  <Td borderColor={isModernTheme ? "gray.600" : undefined}>
                    {status.color && (
                      <HStack spacing={2}>
                        <Box w="20px" h="20px" bg={status.color} borderRadius="sm" borderWidth="1px" borderColor={isModernTheme ? "gray.500" : "gray.300"} />
                        <Text color={isModernTheme ? "gray.300" : undefined}>{status.color}</Text>
                      </HStack>
                    )}
                  </Td>
                  <Td borderColor={isModernTheme ? "gray.600" : undefined}>
                    <Tag colorScheme={status.isArchived ? 'red' : 'green'} variant={isModernTheme ? "subtle" : "solid"} bg={isModernTheme && status.isArchived ? "red.900" : isModernTheme && !status.isArchived ? "green.900" : undefined } color={isModernTheme && status.isArchived ? "red.300" : isModernTheme && !status.isArchived ? "green.300" : undefined }>
                      {status.isArchived ? 'Yes' : 'No'}
                    </Tag>
                  </Td>
                  <Td borderColor={isModernTheme ? "gray.600" : undefined}>
                    <HStack spacing={2}>
                      <IconButton 
                        aria-label="Edit status" 
                        icon={<EditIcon />} 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditStatus(status)}
                        isDisabled={loading}
                        color={isModernTheme ? "gray.300" : undefined}
                        _hover={isModernTheme ? {bg: "gray.600", color: "white"} : {}}
                      />
                      <IconButton 
                        aria-label="Delete status" 
                        icon={<DeleteIcon />} 
                        size="sm" 
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteStatusClick(status)}
                        isDisabled={loading}
                        color={isModernTheme ? "red.400" : undefined} // Explicit color for modern
                        _hover={isModernTheme ? {bg: "red.800", color: "red.200"} : {}} // Darker red bg on hover for modern
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