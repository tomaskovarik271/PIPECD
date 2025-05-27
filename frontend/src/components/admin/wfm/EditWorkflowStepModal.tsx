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
  const currentWorkflowWithDetails = useWFMWorkflowStore((state) => state.currentWorkflowWithDetails);

  // Determine if this is a sales context. This is a simplified check.
  // A more robust check might involve looking at the project type associated with the workflow.
  const isSalesContext = !!currentWorkflowWithDetails?.name?.toLowerCase().includes('sales');

  const handleSubmit = async (data: WorkflowStepFormData) => {
    try {
      // Base metadata from existing step or empty object
      const baseMetadata = typeof step.metadata === 'object' && step.metadata !== null ? { ...step.metadata } : {};

      // Prepare metadata, always including name and description
      let metadataUpdate: any = {
        ...baseMetadata,
        name: data.name,
        description: data.description,
      };

      // If in sales context, add/update sales-specific fields
      if (isSalesContext) {
        // Set to null if undefined or explicitly null from form (NumberInput can yield null)
        metadataUpdate.deal_probability = data.deal_probability !== undefined ? data.deal_probability : null;
        // Set to null if empty string or explicitly null from form (Select can yield '' for cleared)
        metadataUpdate.outcome_type = data.outcome_type !== undefined && data.outcome_type !== '' ? data.outcome_type : null;
      } else {
        // If not sales context, ensure these fields are not accidentally carried over or set
        // (though WorkflowStepForm won't render them, defensive removal from metadata if they somehow exist)
        delete metadataUpdate.deal_probability;
        delete metadataUpdate.outcome_type;
      }
      
      const input: UpdateWfmWorkflowStepInput = {
        statusId: data.statusId,
        isInitialStep: data.isInitialStep,
        isFinalStep: data.isFinalStep,
        metadata: metadataUpdate,
      };

      await updateWorkflowStep(step.id, input);
      
      toast({
        title: 'Workflow Step Updated',
        description: `Step "${data.name || 'Unnamed'}" has been successfully updated.`,
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

  // Prepare defaultValues for the form, including parsing metadata
  const metadata = typeof step.metadata === 'object' && step.metadata !== null ? step.metadata : {};
  const defaultName = 'name' in metadata ? String(metadata.name) : '';
  const defaultDescription = 'description' in metadata ? String(metadata.description) : '';
  const defaultDealProbability = isSalesContext && 'deal_probability' in metadata && typeof metadata.deal_probability === 'number' 
    ? metadata.deal_probability 
    : null;
  const defaultOutcomeType = isSalesContext && 'outcome_type' in metadata && typeof metadata.outcome_type === 'string' 
    ? metadata.outcome_type 
    : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Workflow Step {defaultName ? `- ${defaultName}` : ''}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <WorkflowStepForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isSalesContext={isSalesContext} // Pass the context
            defaultValues={{
              name: defaultName,
              description: defaultDescription,
              statusId: step.status?.id || '', // Ensure statusId is a string
              isInitialStep: step.isInitialStep,
              isFinalStep: step.isFinalStep,
              deal_probability: defaultDealProbability,
              outcome_type: defaultOutcomeType,
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditWorkflowStepModal; 