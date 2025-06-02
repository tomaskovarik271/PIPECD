import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';
import {
  CustomFieldDefinition,
  CustomFieldDefinitionInput,
  CustomFieldEntityType,
} from '../generated/graphql/graphql';

interface ActionToConfirm {
  id: string;
  type: 'deactivate' | 'reactivate';
  label: string;
}

export const useCustomFieldDefinitionActions = (selectedEntityType: CustomFieldEntityType) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDefinitionToEdit, setCurrentDefinitionToEdit] = useState<CustomFieldDefinition | null>(null);
  const [actionToConfirm, setActionToConfirm] = useState<ActionToConfirm | null>(null);
  
  const toast = useToast();
  
  const {
    fetchCustomFieldDefinitions,
    createCustomFieldDefinition,
    updateCustomFieldDefinition,
    deactivateCustomFieldDefinition,
    reactivateCustomFieldDefinition,
  } = useCustomFieldDefinitionStore();

  const handleOpenCreateModal = useCallback(() => {
    setCurrentDefinitionToEdit(null);
  }, []);

  const handleOpenEditModal = useCallback((definition: CustomFieldDefinition) => {
    setCurrentDefinitionToEdit(definition);
  }, []);

  const handleFormSubmit = useCallback(async (submissionInput: CustomFieldDefinitionInput) => {
    setIsSubmitting(true);
    try {
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
        setCurrentDefinitionToEdit(null);
        return true; // Success
      } else {
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
      return false; // Failure
    } finally {
      setIsSubmitting(false);
      setCurrentDefinitionToEdit(null);
      fetchCustomFieldDefinitions(selectedEntityType, true);
    }
  }, [currentDefinitionToEdit, selectedEntityType, updateCustomFieldDefinition, createCustomFieldDefinition, toast, fetchCustomFieldDefinitions]);

  const handleDeactivate = useCallback((id: string, label: string) => {
    setActionToConfirm({ id, type: 'deactivate', label });
  }, []);

  const handleReactivate = useCallback((id: string, label: string) => {
    setActionToConfirm({ id, type: 'reactivate', label });
  }, []);

  const confirmAction = useCallback(async () => {
    if (!actionToConfirm) return;

    const { id, type, label } = actionToConfirm;
    setIsSubmitting(true);
    
    try {
      let result: CustomFieldDefinition | null = null;
      let successMessage = '';
      let errorMessage = '';

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
      setActionToConfirm(null);
    }
  }, [actionToConfirm, deactivateCustomFieldDefinition, reactivateCustomFieldDefinition, toast]);

  const clearActionToConfirm = useCallback(() => {
    setActionToConfirm(null);
  }, []);

  return {
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
  };
}; 