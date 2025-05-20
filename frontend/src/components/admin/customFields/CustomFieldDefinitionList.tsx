import React from 'react';
import {
  Box,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Flex,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  IconButton,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, NotAllowedIcon, AddIcon } from '@chakra-ui/icons';
import { useCustomFieldDefinitionStore } from '../../../stores/useCustomFieldDefinitionStore';
import {
  CustomFieldEntityType,
  CustomFieldDefinition,
  CustomFieldDefinitionInput,
} from '../../../generated/graphql/graphql';
import CustomFieldDefinitionForm from './CustomFieldDefinitionForm';

const CustomFieldDefinitionList: React.FC = () => {
  const {
    definitions,
    loading,
    error,
    fetchCustomFieldDefinitions,
    createCustomFieldDefinition,
    updateCustomFieldDefinition, // For edit later
    deactivateCustomFieldDefinition,
    reactivateCustomFieldDefinition,
  } = useCustomFieldDefinitionStore();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const toast = useToast();

  // TODO: Add state for currentDefinitionToEdit: CustomFieldDefinition | null
  const [currentDefinitionToEdit, setCurrentDefinitionToEdit] = React.useState<CustomFieldDefinition | null>(null);
  
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const [actionToConfirm, setActionToConfirm] = React.useState<{ id: string; type: 'deactivate' | 'reactivate'; label: string} | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const [selectedEntityType, setSelectedEntityType] = React.useState<CustomFieldEntityType>(
    CustomFieldEntityType.Deal
  );

  React.useEffect(() => {
    fetchCustomFieldDefinitions(selectedEntityType, true);
  }, [selectedEntityType, fetchCustomFieldDefinitions]);

  const handleEntityTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEntityType(event.target.value as CustomFieldEntityType);
  };

  const handleOpenCreateModal = () => {
    // TODO: Set currentDefinitionToEdit(null) for create mode
    setCurrentDefinitionToEdit(null);
    onOpen();
  };

  const handleOpenEditModal = (definition: CustomFieldDefinition) => {
    setCurrentDefinitionToEdit(definition);
    onOpen();
  };

  const handleFormSubmit = async (submissionInput: CustomFieldDefinitionInput) => {
    setIsSubmitting(true);
    try {
      // console.log('Submitting Custom Field Definition:', submissionInput, 'Edit Mode:', !!currentDefinitionToEdit); 

      let result: CustomFieldDefinition | null = null;
      if (currentDefinitionToEdit && currentDefinitionToEdit.id) {
        result = await updateCustomFieldDefinition(currentDefinitionToEdit.id, submissionInput);
        if (result) {
          toast({
            title: 'Custom Field Definition Updated',
            description: `Successfully updated field: ${result.fieldLabel}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        result = await createCustomFieldDefinition(submissionInput);
        if (result) {
          toast({
            title: 'Custom Field Definition Created',
            description: `Successfully created field: ${result.fieldLabel}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      }

      if (result) {
        onClose(); // Close modal on success
        setCurrentDefinitionToEdit(null); // Reset edit state
      } else {
        // Error might be in storeError, or result is null without throwing
        throw new Error(useCustomFieldDefinitionStore.getState().error || 
          (currentDefinitionToEdit ? 'Failed to update definition.' : 'Failed to create definition.')
        );
      }
    } catch (err: any) {
      toast({
        title: currentDefinitionToEdit ? 'Error Updating Definition' : 'Error Creating Definition',
        description: err.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      onClose(); // Ensure modal always closes
      setCurrentDefinitionToEdit(null); // Also ensure edit state is reset
      fetchCustomFieldDefinitions(selectedEntityType, true); // Refetch definitions
    }
  };

  const handleDeactivate = async (id: string, label: string) => {
    setActionToConfirm({ id, type: 'deactivate', label });
    onAlertOpen();
  };

  const handleReactivate = async (id: string, label: string) => {
    setActionToConfirm({ id, type: 'reactivate', label });
    onAlertOpen();
  };
  
  const confirmAction = async () => {
    if (!actionToConfirm) return;

    const { id, type, label } = actionToConfirm;
    setIsSubmitting(true); 
    let result: CustomFieldDefinition | null = null;
    let successMessage = '';
    let errorMessage = '';

    try {
      if (type === 'deactivate') {
        result = await deactivateCustomFieldDefinition(id);
        successMessage = `Successfully deactivated ${label}`;
        errorMessage = 'Failed to deactivate definition.';
      } else {
        result = await reactivateCustomFieldDefinition(id);
        successMessage = `Successfully reactivated ${label}`;
        errorMessage = 'Failed to reactivate definition.';
      }

      if (result) {
        toast({
          title: `Definition ${type === 'deactivate' ? 'Deactivated' : 'Reactivated'}`,
          description: successMessage,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(useCustomFieldDefinitionStore.getState().error || errorMessage);
      }
    } catch (err: any) {
      toast({
        title: `Error ${type === 'deactivate' ? 'Deactivating' : 'Reactivating'} Definition`,
        description: err.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      onAlertClose();
      setActionToConfirm(null);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={6} shadow="sm">
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <HStack spacing={3} alignItems="center">
            <Text fontSize="xl" fontWeight="semibold">
            Custom Field Definitions for:
            </Text>
            <Select 
                value={selectedEntityType} 
                onChange={handleEntityTypeChange} 
                width="200px"
                isDisabled={loading || isSubmitting}
            >
                <option value={CustomFieldEntityType.Deal}>Deals</option>
                <option value={CustomFieldEntityType.Person}>People</option>
                <option value={CustomFieldEntityType.Organization}>Organizations</option>
            </Select>
        </HStack>
        <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={handleOpenCreateModal} 
            ml="auto"
            isDisabled={loading || isSubmitting}
        >
          Add New Definition
        </Button>
      </Flex>

      {loading && (
        <Flex justifyContent="center" my={8}>
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
        </Flex>
      )}

      {error && (
        <Alert status="error" my={4}>
          <AlertIcon />
          <AlertTitle>Error loading definitions!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Label</Th>
              <Th>Name (Internal)</Th>
              <Th>Type</Th>
              <Th>Required</Th>
              <Th>Status</Th>
              <Th>Order</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {definitions.length === 0 && (
              <Tr>
                <Td colSpan={6} textAlign="center">No custom field definitions found for {selectedEntityType.toLowerCase()}.</Td>
              </Tr>
            )}
            {definitions.map((def: CustomFieldDefinition) => (
              <Tr key={def.id}>
                <Td>{def.fieldLabel}</Td>
                <Td><code>{def.fieldName}</code></Td>
                <Td>{def.fieldType}</Td>
                <Td>{def.isRequired ? 'Yes' : 'No'}</Td>
                <Td>
                  <Tag colorScheme={def.isActive ? 'green' : 'red'}>
                    {def.isActive ? 'Active' : 'Inactive'}
                  </Tag>
                </Td>
                <Td>{def.displayOrder}</Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton 
                      aria-label="Edit definition" 
                      icon={<EditIcon />} 
                      size="sm" 
                      onClick={() => handleOpenEditModal(def)}
                      isDisabled={isSubmitting}
                    />
                    {def.isActive ? (
                      <IconButton 
                        aria-label="Deactivate definition" 
                        icon={<NotAllowedIcon />} 
                        size="sm" 
                        colorScheme="red"
                        onClick={() => handleDeactivate(def.id, def.fieldLabel)}
                        isDisabled={isSubmitting}
                      />
                    ) : (
                      <IconButton 
                        aria-label="Reactivate definition" 
                        icon={<CheckIcon />} 
                        size="sm" 
                        colorScheme="green"
                        onClick={() => handleReactivate(def.id, def.fieldLabel)}
                        isDisabled={isSubmitting}
                      />
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          {/* TODO: Change header based on edit mode */}
          <ModalHeader>{currentDefinitionToEdit ? 'Edit Custom Field Definition' : 'Add New Custom Field Definition'}</ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />
          <ModalBody pb={6}>
            <CustomFieldDefinitionForm 
              entityType={selectedEntityType} 
              onSubmit={handleFormSubmit} 
              isSubmitting={isSubmitting}
              initialValues={currentDefinitionToEdit ? 
                { 
                  ...currentDefinitionToEdit, 
                  // Ensure dropdownOptions is in the format expected by the form if it exists
                  dropdownOptions: currentDefinitionToEdit.dropdownOptions?.map(opt => ({ value: opt.value, label: opt.label })) 
                }
                : { entityType: selectedEntityType } 
              }
              // onCancel={onClose}
            />
          </ModalBody>
          {/* ModalFooter can be removed if form has its own submit/cancel buttons */}
          {/* <ModalFooter>
            <Button onClick={onClose} mr={3} isDisabled={isSubmitting}>Cancel</Button>
            <Button colorScheme="blue" form="custom-field-form" type="submit" isLoading={isSubmitting}>
              Save Definition
            </Button>
          </ModalFooter> */}
        </ModalContent>
      </Modal>

      {actionToConfirm && (
        <AlertDialog
          isOpen={isAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            onAlertClose();
            setActionToConfirm(null);
          }}
          isCentered
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                {actionToConfirm.type === 'deactivate' ? 'Deactivate' : 'Reactivate'} Definition
              </AlertDialogHeader>

              <AlertDialogBody>
                {'Are you sure you want to '}{actionToConfirm.type}{' the custom field definition '}{actionToConfirm.label}{'?'}
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => {
                  onAlertClose();
                  setActionToConfirm(null);
                }} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button 
                  colorScheme={actionToConfirm.type === 'deactivate' ? 'red' : 'green'} 
                  onClick={confirmAction} 
                  ml={3}
                  isLoading={isSubmitting}
                >
                  {actionToConfirm.type === 'deactivate' ? 'Deactivate' : 'Reactivate'}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      )}

    </Box>
  );
};

export default CustomFieldDefinitionList; 