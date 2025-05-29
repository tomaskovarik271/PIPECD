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
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors'; // NEW: Use semantic tokens

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

  // NEW: Use semantic tokens for automatic theme adaptation
  const colors = useThemeColors();
  const styles = useThemeStyles();

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
        <Heading as="h1" size="xl" color={colors.text.primary}>
          Manage WFM Statuses
        </Heading>
        <Button 
          leftIcon={<AddIcon />} 
          onClick={handleAddNewStatus}
          {...styles.button.primary}
        >
          New Status
        </Button>
      </Flex>
      <Text mb={4} color={colors.text.secondary}>
        Define and manage global statuses for all workflows.
      </Text>

      {loading && statuses.length === 0 && (
        <Flex justifyContent="center" my={8}>
          <Spinner 
            thickness="4px" 
            speed="0.65s" 
            emptyColor={colors.bg.input}
            color={colors.interactive.default}
            size="xl" 
          />
        </Flex>
      )}

      {error && (
        <Alert 
          status="error" 
          my={4} 
          variant="subtle"
          bg={colors.status.error}
          borderRadius="lg"
        >
          <AlertIcon />
          <AlertTitle color={colors.text.onAccent}>Error communicating with server!</AlertTitle>
          <AlertDescription color={colors.text.onAccent}>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && statuses.length === 0 && (
         <Box 
           textAlign="center" 
           p={10} 
           borderWidth="1px" 
           borderRadius="lg" 
           bg={colors.bg.surface}
           borderColor={colors.border.default}
           shadow="sm"
         >
            <Heading as="h3" size="md" mb={2} color={colors.text.primary}>
              No WFM Statuses Found
            </Heading>
            <Text mb={4} color={colors.text.secondary}>
              Get started by creating your first WFM status.
            </Text>
            <Button 
              onClick={handleAddNewStatus}
              {...styles.button.primary}
            >
              Create First Status
            </Button>
        </Box>
      )}

      {statuses.length > 0 && (
        <Box 
          borderWidth="1px" 
          borderRadius="xl" 
          shadow="sm" 
          overflowX="auto"
          bg={colors.bg.surface}
          borderColor={colors.border.default}
          p={6}
        >
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th 
                  color={colors.text.secondary}
                  borderColor={colors.border.default}
                  fontWeight="semibold" 
                  textTransform="uppercase" 
                  fontSize="xs"
                >
                  Name
                </Th>
                <Th 
                  color={colors.text.secondary}
                  borderColor={colors.border.default}
                  fontWeight="semibold" 
                  textTransform="uppercase" 
                  fontSize="xs"
                >
                  Description
                </Th>
                <Th 
                  color={colors.text.secondary}
                  borderColor={colors.border.default}
                  fontWeight="semibold" 
                  textTransform="uppercase" 
                  fontSize="xs"
                >
                  Color
                </Th>
                <Th 
                  color={colors.text.secondary}
                  borderColor={colors.border.default}
                  fontWeight="semibold" 
                  textTransform="uppercase" 
                  fontSize="xs"
                >
                  Archived
                </Th>
                <Th 
                  color={colors.text.secondary}
                  borderColor={colors.border.default}
                  fontWeight="semibold" 
                  textTransform="uppercase" 
                  fontSize="xs"
                >
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {statuses.map((status) => (
                <Tr key={status.id} _hover={{ bg: colors.component.table.rowHover }}>
                  <Td 
                    color={colors.text.primary}
                    borderColor={colors.border.default}
                  >
                    {status.name}
                  </Td>
                  <Td 
                    whiteSpace="normal" 
                    wordBreak="break-word" 
                    color={colors.text.secondary}
                    borderColor={colors.border.default}
                  >
                    {status.description}
                  </Td>
                  <Td borderColor={colors.border.default}>
                    {status.color && (
                      <HStack spacing={2}>
                        <Box 
                          w="20px" 
                          h="20px" 
                          bg={status.color} 
                          borderRadius="sm" 
                          borderWidth="1px" 
                          borderColor={colors.border.subtle}
                        />
                        <Text color={colors.text.secondary}>{status.color}</Text>
                      </HStack>
                    )}
                  </Td>
                  <Td borderColor={colors.border.default}>
                    <Tag 
                      size="sm"
                      variant="subtle"
                      bg={status.isArchived ? colors.bg.surface : colors.bg.surface}
                      color={status.isArchived ? colors.text.error : colors.text.success}
                      borderWidth="1px"
                      borderColor={status.isArchived ? colors.border.default : colors.border.default}
                    >
                      {status.isArchived ? 'Yes' : 'No'}
                    </Tag>
                  </Td>
                  <Td borderColor={colors.border.default}>
                    <HStack spacing={2}>
                      <IconButton 
                        aria-label="Edit status" 
                        icon={<EditIcon />} 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditStatus(status)}
                        isDisabled={loading}
                        color={colors.text.secondary}
                        _hover={{ bg: colors.component.button.ghostHover, color: colors.text.primary }}
                      />
                      <IconButton 
                        aria-label="Delete status" 
                        icon={<DeleteIcon />} 
                        size="sm" 
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteStatusClick(status)}
                        isDisabled={loading}
                        color={colors.text.error}
                        _hover={{ bg: colors.status.error, color: colors.text.onAccent }}
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