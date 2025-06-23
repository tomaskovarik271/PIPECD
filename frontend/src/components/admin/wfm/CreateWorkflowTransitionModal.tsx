import React, { useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useWFMWorkflowStore } from '../../../stores/useWFMWorkflowStore';
import { WfmWorkflowStep } from '../../../generated/graphql/graphql';

// Zod schema for validation
const transitionSchema = z.object({
  fromStepId: z.string().min(1, 'From Step is required'),
  toStepId: z.string().min(1, 'To Step is required'),
  name: z.string().optional(),
}).refine(data => data.fromStepId !== data.toStepId, {
  message: 'From Step and To Step cannot be the same',
  path: ['toStepId'], // Attach error to toStepId field for better UX
});

type TransitionFormData = z.infer<typeof transitionSchema>;

interface CreateWorkflowTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId: string;
  steps: WfmWorkflowStep[]; // Available steps for dropdowns
}

const CreateWorkflowTransitionModal: React.FC<CreateWorkflowTransitionModalProps> = ({
  isOpen,
  onClose,
  workflowId,
  steps,
}) => {
  const toast = useToast();
  const createWorkflowTransition = useWFMWorkflowStore((state) => state.createWorkflowTransition);
  const isSubmitting = useWFMWorkflowStore((state) => state.submitting); // Assuming a generic submitting state

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TransitionFormData>({
    resolver: zodResolver(transitionSchema),
    defaultValues: {
      fromStepId: '',
      toStepId: '',
      name: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        fromStepId: '',
        toStepId: '',
        name: '',
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: TransitionFormData) => {
    try {
      await createWorkflowTransition(
        workflowId,
        data.fromStepId,
        data.toStepId,
        data.name || undefined
      );
      toast({
        title: 'Transition Created',
        description: `Transition from "${steps.find(s => s.id === data.fromStepId)?.status.name}" to "${steps.find(s => s.id === data.toStepId)?.status.name}" added.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (e: unknown) {
      toast({
        title: 'Error Creating Transition',
        description: e instanceof Error ? e.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Helper to get step display name (e.g., from metadata or status)
  const getStepDisplayName = (step: WfmWorkflowStep): string => {
    if (step.metadata && typeof step.metadata === 'object' && 'name' in step.metadata && step.metadata.name) {
      return String(step.metadata.name);
    }
    return step.status?.name || 'Unknown Step'; // Fallback to status name
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Add New Transition</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.fromStepId} isRequired>
              <FormLabel htmlFor="fromStepId">From Step</FormLabel>
              <Controller
                name="fromStepId"
                control={control}
                render={({ field }) => (
                  <Select placeholder="Select from step" {...field}>
                    {steps.map((step) => (
                      <option key={step.id} value={step.id}>
                        {step.stepOrder}. {getStepDisplayName(step)} (Status: {step.status.name})
                      </option>
                    ))}
                  </Select>
                )}
              />
              <FormErrorMessage>{errors.fromStepId?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.toStepId} isRequired>
              <FormLabel htmlFor="toStepId">To Step</FormLabel>
              <Controller
                name="toStepId"
                control={control}
                render={({ field }) => (
                  <Select placeholder="Select to step" {...field}>
                    {steps.map((step) => (
                      <option key={step.id} value={step.id}>
                        {step.stepOrder}. {getStepDisplayName(step)} (Status: {step.status.name})
                      </option>
                    ))}
                  </Select>
                )}
              />
              <FormErrorMessage>{errors.toStepId?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.name}>
              <FormLabel htmlFor="name">Transition Name (Optional)</FormLabel>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} placeholder="E.g., Approve, Escalate" />}
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost" isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button colorScheme="blue" type="submit" isLoading={isSubmitting} isDisabled={isSubmitting}>
            Add Transition
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateWorkflowTransitionModal; 