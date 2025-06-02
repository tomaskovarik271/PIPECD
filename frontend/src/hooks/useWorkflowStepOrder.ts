import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { WfmWorkflowStep } from '../generated/graphql/graphql';
import { useWFMWorkflowStore } from '../stores/useWFMWorkflowStore';

interface UseWorkflowStepOrderOptions {
  workflowId: string | null;
  originalSteps: WfmWorkflowStep[];
}

export const useWorkflowStepOrder = ({ workflowId, originalSteps }: UseWorkflowStepOrderOptions) => {
  const [localSteps, setLocalSteps] = useState<WfmWorkflowStep[]>([]);
  const [orderChanged, setOrderChanged] = useState(false);
  
  const toast = useToast();
  const { updateWorkflowStepsOrder, submitting } = useWFMWorkflowStore();

  // Initialize localSteps when originalSteps change
  useEffect(() => {
    if (originalSteps && originalSteps.length > 0) {
      const sortedSteps = [...originalSteps].sort((a, b) => a.stepOrder - b.stepOrder);
      setLocalSteps(sortedSteps);
      setOrderChanged(false);
    } else {
      setLocalSteps([]);
      setOrderChanged(false);
    }
  }, [originalSteps]);

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...localSteps];
    const stepToMove = newSteps[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= newSteps.length) return;

    newSteps[index] = newSteps[swapIndex];
    newSteps[swapIndex] = stepToMove;

    setLocalSteps(newSteps);
    setOrderChanged(true);
  };

  const saveOrder = async () => {
    if (!workflowId || !orderChanged) return false;

    const orderedStepIds = localSteps.map(step => step.id);
    try {
      const updatedWorkflow = await updateWorkflowStepsOrder(workflowId, orderedStepIds);
      if (updatedWorkflow) {
        toast({ 
          title: 'Step order saved', 
          status: 'success', 
          duration: 3000, 
          isClosable: true 
        });
        setOrderChanged(false);
        return true;
      } else {
        toast({ 
          title: 'Failed to save order', 
          description: 'No data returned.', 
          status: 'warning', 
          duration: 5000, 
          isClosable: true 
        });
        return false;
      }
    } catch (e: any) {
      toast({ 
        title: 'Error Saving Order', 
        description: e.message, 
        status: 'error', 
        duration: 5000, 
        isClosable: true 
      });
      return false;
    }
  };

  const resetOrder = () => {
    if (originalSteps && originalSteps.length > 0) {
      const sortedSteps = [...originalSteps].sort((a, b) => a.stepOrder - b.stepOrder);
      setLocalSteps(sortedSteps);
      setOrderChanged(false);
    }
  };

  return {
    localSteps,
    orderChanged,
    moveStep,
    saveOrder,
    resetOrder,
    isSubmitting: submitting,
  };
}; 