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
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useCustomFieldDefinitionStore } from '../../../stores/useCustomFieldDefinitionStore';
import { CustomFieldEntityType, CustomFieldDefinition } from '../../../generated/graphql/graphql';
import { useCustomFieldDefinitionActions } from '../../../hooks/useCustomFieldDefinitionActions';
import { CustomFieldDefinitionsTable } from './CustomFieldDefinitionsTable';
import { DefinitionActionConfirmDialog } from './DefinitionActionConfirmDialog';
import CustomFieldDefinitionForm from './CustomFieldDefinitionForm';

const CustomFieldDefinitionList: React.FC = () => {
  const [selectedEntityType, setSelectedEntityType] = React.useState<CustomFieldEntityType>(
    'DEAL'
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();

  const { definitions, loading, error, fetchCustomFieldDefinitions } = useCustomFieldDefinitionStore();

  const {
    isSubmitting,
    currentDefinitionToEdit,
    actionToConfirm,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleFormSubmit,
    handleDeactivate,
    handleReactivate,
    confirmAction,
    clearActionToConfirm,
  } = useCustomFieldDefinitionActions(selectedEntityType);

  React.useEffect(() => {
    fetchCustomFieldDefinitions(selectedEntityType, true);
  }, [selectedEntityType, fetchCustomFieldDefinitions]);

  const handleEntityTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEntityType(event.target.value as CustomFieldEntityType);
  };

  const handleCreateClick = () => {
    handleOpenCreateModal();
    onOpen();
  };

  const handleEditClick = (definition: CustomFieldDefinition) => {
    handleOpenEditModal(definition);
    onOpen();
  };

  const handleFormSubmitWrapper = async (submissionInput: CustomFieldDefinition) => {
    const success = await handleFormSubmit(submissionInput);
    if (success) {
      onClose();
    }
  };

  const handleConfirmDialogAction = (id: string, label: string, type: 'deactivate' | 'reactivate') => {
    if (type === 'deactivate') {
      handleDeactivate(id, label);
    } else {
      handleReactivate(id, label);
    }
    onAlertOpen();
  };

  const handleConfirmAction = async () => {
    await confirmAction();
    onAlertClose();
  };

  const handleCancelAction = () => {
    clearActionToConfirm();
    onAlertClose();
  };

  const getEntityTypeName = (entityType: CustomFieldEntityType): string => {
    switch (entityType) {
      case 'DEAL': return 'Deals';
      case 'PERSON': return 'People';
      case 'ORGANIZATION': return 'Organizations';
      case 'LEAD': return 'Leads';
      default: return '';
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
            <option value="DEAL">Deals</option>
            <option value="PERSON">People</option>
            <option value="ORGANIZATION">Organizations</option>
            <option value="LEAD">Leads</option>
          </Select>
        </HStack>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          onClick={handleCreateClick} 
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
        <CustomFieldDefinitionsTable
          definitions={definitions}
          onEdit={handleEditClick}
          onDeactivate={(id, label) => handleConfirmDialogAction(id, label, 'deactivate')}
          onReactivate={(id, label) => handleConfirmDialogAction(id, label, 'reactivate')}
          isSubmitting={isSubmitting}
          entityTypeName={getEntityTypeName(selectedEntityType)}
        />
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentDefinitionToEdit ? 'Edit Custom Field Definition' : 'Add New Custom Field Definition'}
          </ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />
          <ModalBody pb={6}>
            <CustomFieldDefinitionForm 
              entityType={selectedEntityType} 
              onSubmit={handleFormSubmitWrapper} 
              isSubmitting={isSubmitting}
              initialValues={currentDefinitionToEdit ? 
                { 
                  ...currentDefinitionToEdit, 
                  dropdownOptions: currentDefinitionToEdit.dropdownOptions?.map(opt => ({ 
                    value: opt.value, 
                    label: opt.label 
                  })) 
                }
                : { entityType: selectedEntityType } 
              }
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <DefinitionActionConfirmDialog
        isOpen={isAlertOpen}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        actionToConfirm={actionToConfirm}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
};

export default CustomFieldDefinitionList; 