import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
} from '@chakra-ui/react';
import WorkflowForm, { WorkflowFormData } from './WorkflowForm';
import { useWFMWorkflowStore, WFMWorkflowState } from '../../../stores/useWFMWorkflowStore';
import type { CreateWfmWorkflowInput } from '../../../generated/graphql/graphql';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({ isOpen, onClose }) => {
  const createWFMWorkflow = useWFMWorkflowStore((state: WFMWorkflowState) => state.createWFMWorkflow);
  const fetchWFMWorkflows = useWFMWorkflowStore((state: WFMWorkflowState) => state.fetchWFMWorkflows);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (data: WorkflowFormData) => {
    setIsSubmitting(true);
    const input: CreateWfmWorkflowInput = {
      name: data.name,
      description: data.description?.trim() === '' ? null : data.description,
      // isArchived is not part of CreateWfmWorkflowInput, defaults to false on backend
    };

    try {
      const newWorkflow = await createWFMWorkflow(input);
      if (newWorkflow) {
        toast({
          title: 'Workflow Created',
          description: `Workflow "${newWorkflow.name}" has been successfully created.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchWFMWorkflows(); // Refresh the list
        onClose(); // Close modal on success
      } else {
        // Error toast is handled by the store if createWFMWorkflow returns null due to API error
      }
    } catch (error) { 
      // This catch is more for unexpected errors during the handleSubmit process itself,
      // though store errors should be primary.
      console.error("Error in handleSubmit for CreateWorkflowModal:", error);
      toast({
        title: 'Creation Failed',
        description: 'An unexpected error occurred while creating the workflow.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New WFM Workflow</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <WorkflowForm 
            onSubmit={handleSubmit} 
            onCancel={onClose} 
            isSubmitting={isSubmitting} 
          />
        </ModalBody>
        {/* Footer is usually handled by the form component itself for save/cancel buttons */}
      </ModalContent>
    </Modal>
  );
};

export default CreateWorkflowModal; 