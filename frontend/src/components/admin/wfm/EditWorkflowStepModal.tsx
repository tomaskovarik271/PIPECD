import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useToast,
} from '@chakra-ui/react';
import WorkflowStepForm, { WorkflowStepFormData } from './WorkflowStepForm';
import { useWFMWorkflowStore } from '../../../stores/useWFMWorkflowStore';
import { WfmWorkflowStep, UpdateWfmWorkflowStepInput } from '../../../generated/graphql/graphql';

interface EditWorkflowStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId: string; // Needed for refetching after update
  step: WfmWorkflowStep;
}

const EditWorkflowStepModal: React.FC<EditWorkflowStepModalProps> = ({
  isOpen,
  onClose,
  workflowId,
  step,
}) => {
  const toast = useToast();
  const updateWorkflowStep = useWFMWorkflowStore((state) => state.updateWorkflowStep);
  const isSubmitting = useWFMWorkflowStore((state) => state.submitting);

  const handleSubmit = async (data: WorkflowStepFormData) => {
    try {
      const input: UpdateWfmWorkflowStepInput & { name?: string; description?: string } = {
        statusId: data.statusId,
        isInitialStep: data.isInitialStep,
        isFinalStep: data.isFinalStep,
        metadata: {
          ...(step.metadata || {}),
          name: data.name,
          description: data.description,
        },
      };

      await updateWorkflowStep(step.id, input);
      
      toast({
        title: 'Workflow Step Updated',
        description: `Step "${data.name}" has been successfully updated.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error Updating Step',
        description: error.message || 'Could not update the workflow step.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Extract name and description from metadata for defaultValues
  const defaultName = typeof step.metadata === 'object' && step.metadata !== null && 'name' in step.metadata ? String(step.metadata.name) : '';
  const defaultDescription = typeof step.metadata === 'object' && step.metadata !== null && 'description' in step.metadata ? String(step.metadata.description) : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Workflow Step</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <WorkflowStepForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            defaultValues={{
              name: defaultName,
              description: defaultDescription,
              statusId: step.status.id, // Assuming step.status is populated
              isInitialStep: step.isInitialStep,
              isFinalStep: step.isFinalStep,
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditWorkflowStepModal; 