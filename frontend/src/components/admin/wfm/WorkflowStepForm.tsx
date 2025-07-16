import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Select,
  Textarea,
  FormErrorMessage,
  Checkbox,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Text,
} from '@chakra-ui/react';
import { useWFMStatusStore } from '../../../stores/useWFMStatusStore';
import { useWFMOutcomes } from '../../../hooks/useWFMOutcomes';
import { WfmStatus } from '../../../generated/graphql/graphql';

const workflowStepSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  statusId: z.string().min(1, 'Status is required'),
  isInitialStep: z.boolean().optional(),
  isFinalStep: z.boolean().optional(),
  deal_probability: z.number().min(0, 'Min 0').max(1, 'Max 1').optional().nullable(),
  outcome_type: z.string().optional().nullable(), // Could use z.enum(OUTCOME_TYPES) if strict typing is desired and empty string is not a valid DB value.
});

export type WorkflowStepFormData = z.infer<typeof workflowStepSchema>;

interface WorkflowStepFormProps {
  onSubmit: (data: WorkflowStepFormData) => void;
  defaultValues?: Partial<WorkflowStepFormData>;
  isSubmitting: boolean;
  isSalesContext?: boolean;
  workflowId?: string;
}

const WorkflowStepForm: React.FC<WorkflowStepFormProps> = ({
  onSubmit,
  defaultValues,
  isSubmitting,
  isSalesContext = false,
  workflowId,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch: _watch
  } = useForm<WorkflowStepFormData>({
    resolver: zodResolver(workflowStepSchema),
    defaultValues: {
      name: '',
      description: '',
      statusId: '',
      isInitialStep: false,
      isFinalStep: false,
      deal_probability: null,
      outcome_type: '',
      ...defaultValues,
    },
  });

  const statuses = useWFMStatusStore((state) => state.statuses);
  const fetchWFMStatuses = useWFMStatusStore((state) => state.fetchWFMStatuses);
  const isLoadingStatuses = useWFMStatusStore((state) => state.loading);
  
  // Get dynamic outcome types from WFM Outcome Engine
  const { outcomeTypes, loading: loadingOutcomes } = useWFMOutcomes(workflowId);

  useEffect(() => {
    fetchWFMStatuses();
  }, [fetchWFMStatuses]);

  useEffect(() => {
    reset({
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      statusId: defaultValues?.statusId || '',
      isInitialStep: defaultValues?.isInitialStep || false,
      isFinalStep: defaultValues?.isFinalStep || false,
      deal_probability: defaultValues?.deal_probability !== undefined ? defaultValues.deal_probability : null,
      outcome_type: defaultValues?.outcome_type || '',
    });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.name}>
          <FormLabel htmlFor="name">Name (Stored in Metadata)</FormLabel>
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input {...field} id="name" />}
          />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel htmlFor="description">Description (Stored in Metadata, Optional)</FormLabel>
          <Controller
            name="description"
            control={control}
            render={({ field }) => <Textarea {...field} id="description" />}
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.statusId}>
          <FormLabel htmlFor="statusId">Status</FormLabel>
          <Controller
            name="statusId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                id="statusId"
                placeholder="Select status"
                isDisabled={isLoadingStatuses}
              >
                {statuses.map((status: WfmStatus) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </Select>
            )}
          />
          <FormErrorMessage>{errors.statusId?.message}</FormErrorMessage>
        </FormControl>

        {isSalesContext && (
          <Box borderLeftWidth="4px" borderColor="blue.500" pl={4} py={2} mt={2} mb={2}>
            <Text fontSize="sm" color="gray.500" mb={3}>Sales-specific configuration (stored in metadata):</Text>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.deal_probability}>
                <FormLabel htmlFor="deal_probability">Deal Probability (0.0 to 1.0)</FormLabel>
                <Controller
                  name="deal_probability"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      onChange={(valueAsString, valueAsNumber) => field.onChange(valueAsNumber)}
                      value={field.value ?? ''}
                      precision={2} step={0.01} min={0} max={1}
                    >
                      <NumberInputField id="deal_probability" placeholder="e.g., 0.75 for 75%" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
                <FormErrorMessage>{errors.deal_probability?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.outcome_type}>
                <FormLabel htmlFor="outcome_type">Outcome Type</FormLabel>
                <Controller
                  name="outcome_type"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      {...field} 
                      value={field.value ?? ''} 
                      id="outcome_type" 
                      placeholder="Select outcome type (optional)"
                      isDisabled={loadingOutcomes}
                    >
                      {outcomeTypes.map((type: unknown) => {
                        const typeStr = String(type);
                        return (
                          <option key={typeStr} value={typeStr}>{typeStr || '(Clear Selection)'}</option>
                        );
                      })}
                    </Select>
                  )}
                />
                <FormErrorMessage>{errors.outcome_type?.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </Box>
        )}

        <HStack spacing={10} w="full" justifyContent="flex-start" alignItems="center" pt={2}>
          <Controller
            name="isInitialStep"
            control={control}
            render={({ field }) => (
              <Checkbox
                isChecked={field.value ?? false}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              >
                Is Initial Step?
              </Checkbox>
            )}
          />
          <Controller
            name="isFinalStep"
            control={control}
            render={({ field }) => (
              <Checkbox
                isChecked={field.value ?? false}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              >
                Is Final Step?
              </Checkbox>
            )}
          />
        </HStack>

        <Button
          mt={6}
          colorScheme="blue"
          isLoading={isSubmitting}
          type="submit"
          alignSelf="flex-end"
        >
          {defaultValues?.name || defaultValues?.statusId ? 'Save Changes' : 'Create Step'}
        </Button>
      </VStack>
    </form>
  );
};

export default WorkflowStepForm; 