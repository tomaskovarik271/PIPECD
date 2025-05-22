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
} from '@chakra-ui/react';
import { useWFMStatusStore } from '../../../stores/useWFMStatusStore';
import { WfmStatus, WfmWorkflowStep } from '../../../generated/graphql/graphql';

const workflowStepSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  statusId: z.string().min(1, 'Status is required'),
  isInitialStep: z.boolean().optional(),
  isFinalStep: z.boolean().optional(),
});

export type WorkflowStepFormData = z.infer<typeof workflowStepSchema>;

interface WorkflowStepFormProps {
  onSubmit: (data: WorkflowStepFormData) => void;
  defaultValues?: Partial<WorkflowStepFormData>;
  isSubmitting: boolean;
}

const WorkflowStepForm: React.FC<WorkflowStepFormProps> = ({
  onSubmit,
  defaultValues,
  isSubmitting,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WorkflowStepFormData>({
    resolver: zodResolver(workflowStepSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      statusId: defaultValues?.statusId || '',
      isInitialStep: defaultValues?.isInitialStep || false,
      isFinalStep: defaultValues?.isFinalStep || false,
    },
  });

  const statuses = useWFMStatusStore((state) => state.statuses);
  const fetchWFMStatuses = useWFMStatusStore((state) => state.fetchWFMStatuses);
  const isLoadingStatuses = useWFMStatusStore((state) => state.loading);

  useEffect(() => {
    fetchWFMStatuses();
  }, [fetchWFMStatuses]);

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name || '',
        description: defaultValues.description || '',
        statusId: defaultValues.statusId || '',
        isInitialStep: defaultValues.isInitialStep || false,
        isFinalStep: defaultValues.isFinalStep || false,
      });
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.name}>
          <FormLabel htmlFor="name">Name</FormLabel>
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input {...field} id="name" />}
          />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel htmlFor="description">Description (Optional)</FormLabel>
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

        <HStack spacing={10} w="full" justifyContent="flex-start" alignItems="center" pt={2}>
          <Controller
            name="isInitialStep"
            control={control}
            render={({ field }) => (
              <Checkbox 
                isChecked={field.value} 
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
                isChecked={field.value} 
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
          mt={4}
          colorScheme="blue"
          isLoading={isSubmitting}
          type="submit"
          alignSelf="flex-end"
        >
          {defaultValues?.name ? 'Save Changes' : 'Create Step'}
        </Button>
      </VStack>
    </form>
  );
};

export default WorkflowStepForm; 