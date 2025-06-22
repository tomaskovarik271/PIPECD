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
import type { WfmWorkflow, UpdateWfmWorkflowInput } from '../../../generated/graphql/graphql';

interface EditWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: WfmWorkflow | null;
}

const EditWorkflowModal: React.FC<EditWorkflowModalProps> = ({ isOpen, onClose, workflow }) => {
  const updateWFMWorkflow = useWFMWorkflowStore((state: WFMWorkflowState) => state.updateWFMWorkflow);
  const fetchWFMWorkflows = useWFMWorkflowStore((state: WFMWorkflowState) => state.fetchWFMWorkflows);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (data: WorkflowFormData) => {
    if (!workflow) return;

    setIsSubmitting(true);
    const inputForUpdate: Omit<UpdateWfmWorkflowInput, 'id'> = {
      name: data.name,
      description: data.description?.trim() === '' ? null : data.description,
      isArchived: data.isArchived === undefined ? workflow.isArchived : data.isArchived,
    };

    try {
      const updatedWorkflow = await updateWFMWorkflow(workflow.id, inputForUpdate);
      if (updatedWorkflow) {
        toast({
          title: 'Workflow Updated',
          description: `Workflow "${updatedWorkflow.name}" has been successfully updated.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchWFMWorkflows(); // Refresh the list
        onClose(); // Close modal on success
      } else {
        // Error toast is handled by the store
      }
    } catch (error) {
      console.error("Error in handleSubmit for EditWorkflowModal:", error);
      toast({
        title: 'Update Failed',
        description: 'An unexpected error occurred while updating the workflow.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setIsSubmitting(false);
  };

  if (!workflow) return null; // Or some placeholder/error if workflow is unexpectedly null when open

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit WFM Workflow: {workflow.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <WorkflowForm 
            onSubmit={handleSubmit} 
            onCancel={onClose} 
            initialData={workflow} 
            isSubmitting={isSubmitting} 
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditWorkflowModal; 