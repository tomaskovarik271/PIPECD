import React, { useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Select, Checkbox, VStack, useToast, FormErrorMessage, HStack,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useWFMStatusStore } from '../../../stores/useWFMStatusStore';
import { useWFMWorkflowStore } from '../../../stores/useWFMWorkflowStore';
import type { WfmStatus, CreateWfmWorkflowStepInput } from '../../../generated/graphql/graphql';

interface CreateWorkflowStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId: string;
  // currentStepsCount: number; // To suggest next stepOrder
}

// Yup validation schema
const schema = yup.object().shape({
  statusId: yup.string().required('Status is required'),
  stepOrder: yup.number().integer('Step order must be an integer').positive('Step order must be positive').required('Step order is required'),
  isInitialStep: yup.boolean().default(false),
  isFinalStep: yup.boolean().default(false),
  name: yup.string().trim().optional().default(''),
  description: yup.string().trim().optional().default(''),
});

// Form data type based on schema
interface IFormInputs {
  statusId: string;
  stepOrder: number;
  isInitialStep: boolean;
  isFinalStep: boolean;
  name: string;
  description: string;
}

const CreateWorkflowStepModal: React.FC<CreateWorkflowStepModalProps> = ({ isOpen, onClose, workflowId }) => {
  const toast = useToast();
  const {
    statuses: availableStatuses,
    fetchWFMStatuses,
    loading: _statusesLoading,
    error: statusesError,
  } = useWFMStatusStore();
  
  const {
    addStepToWorkflow, // Using the new method name from your store
    submitting: isSubmitting,
    // error: workflowError, // Handled by the main page error toast
    // clearError: clearWorkflowError // To clear errors before new submission
  } = useWFMWorkflowStore();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      statusId: '',
      stepOrder: undefined, // Or a sensible default like 1, but undefined encourages input
      isInitialStep: false,
      isFinalStep: false,
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchWFMStatuses(false);
      reset({
        statusId: '',
        stepOrder: undefined, // Reset stepOrder
        isInitialStep: false,
        isFinalStep: false,
        name: '',
        description: '',
      });
    }
  }, [isOpen, fetchWFMStatuses, reset]);

  const onSubmit = async (data: IFormInputs) => {
    // clearWorkflowError(); // Clear previous errors from the store
    const inputForStore: CreateWfmWorkflowStepInput = {
      workflowId: workflowId, // workflowId is already available in the component
      statusId: data.statusId,
      stepOrder: data.stepOrder,
      isInitialStep: data.isInitialStep,
      isFinalStep: data.isFinalStep,
      // Optional fields from IFormInputs that are also optional in CreateWfmWorkflowStepInput
      // No, CreateWfmWorkflowStepInput expects name and description directly if they are part of it.
      // Let's assume CreateWfmWorkflowStepInput has name and description as optional strings.
      // The current generated type CreateWfmWorkflowStepInput does not include name/description fields for the step itself, only for metadata.
      // It seems name/description for a step (distinct from status name) should go into metadata.
      // For now, I will assume `name` and `description` from the form are intended for the step's own optional `name` and `description` fields if they were to exist directly on the step,
      // or should be structured into the `metadata` field.
      // Based on previous ADR and schema, step name/description are not direct properties, they are in metadata.
      // The GraphQL input CreateWfmWorkflowStepInput might have direct name/description, or expect them in metadata.
      // The current `inputForStore` type derivation was: Omit<CreateWfmWorkflowStepInput, 'workflowId' | 'stepOrder'> & Partial<Pick<CreateWfmWorkflowStepInput, 'stepOrder'>> & { name?: string; description?: string; }
      // This implies name/description were being added ad-hoc. Let's put them in metadata if that's the design.
      // CreateWfmWorkflowStepInput has: id, workflowId, statusId, stepOrder, isInitialStep, isFinalStep, metadata
      // So name and description from the form need to go into metadata.
      metadata: {
        name: data.name, // User-defined name for the step in this workflow context
        description: data.description, // User-defined description
      }
    };

    try {
      const newStep = await addStepToWorkflow(workflowId, inputForStore);
      if (newStep) {
        toast({ title: 'Step created', description: `Step using status "${availableStatuses.find(s => s.id === data.statusId)?.name || data.statusId}" added.`, status: 'success', duration: 3000 });
        onClose(); // Close modal on success
      } else {
        // Error message is set in the store, WFMWorkflowsPage will toast it.
        // toast({ title: 'Failed to create step', description: useWFMWorkflowStore.getState().error || 'An unknown error occurred', status: 'error', duration: 5000 });
      }
    } catch {
      // This catch is if the store action itself throws before setting the store error.
      // Typically, the store action handles setting its own error state.
      // Error is already set in the store and toasted by WFMWorkflowsPage
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Add New Step to Workflow</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.statusId} isRequired>
              <FormLabel htmlFor="statusId">Status</FormLabel>
              <Controller
                name="statusId"
                control={control}
                render={({ field }) => (
                  <Select 
                    placeholder="Select a status" 
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  >
                    {availableStatuses.map((status: WfmStatus) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {statusesError && <FormErrorMessage>Failed to load statuses: {statusesError}</FormErrorMessage>}
              <FormErrorMessage>{errors.statusId?.message}</FormErrorMessage>
            </FormControl>

            {/* Optional: User-defined name for the step specific to this workflow */}
            <FormControl isInvalid={!!errors.name}>
              <FormLabel htmlFor="name">Step Name (Optional)</FormLabel>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} placeholder="E.g., Initial Client Outreach" />}
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            {/* Optional: User-defined description for the step */}
            <FormControl isInvalid={!!errors.description}>
              <FormLabel htmlFor="description">Step Description (Optional)</FormLabel>
              <Controller
                name="description"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Describe this step's purpose in the workflow" />}
              />
              <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
            </FormControl>
            
            {/* Step Order - could be manual or auto-assigned */}
            <FormControl isInvalid={!!errors.stepOrder} isRequired>
              <FormLabel htmlFor="stepOrder">Step Order</FormLabel>
              <Controller
                name="stepOrder"
                control={control}
                render={({ field }) => <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} />}
              />
              <FormErrorMessage>{errors.stepOrder?.message}</FormErrorMessage>
            </FormControl>

            <HStack spacing={10} w="full" justifyContent="flex-start" alignItems="center" pt={2}>
                <Controller
                    name="isInitialStep"
                    control={control}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Checkbox 
                        onChange={onChange} 
                        onBlur={onBlur} 
                        isChecked={value} 
                        ref={ref}
                    >
                        Is Initial Step?
                    </Checkbox>
                    )}
                />
                <Controller
                    name="isFinalStep"
                    control={control}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Checkbox 
                        onChange={onChange} 
                        onBlur={onBlur} 
                        isChecked={value} 
                        ref={ref}
                    >
                        Is Final Step?
                    </Checkbox>
                    )}
                />
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost" isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button colorScheme="blue" type="submit" isLoading={isSubmitting} isDisabled={isSubmitting}>
            Add Step
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateWorkflowStepModal; 