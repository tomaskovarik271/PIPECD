import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  VStack,
  Switch,
  // FormHelperText,
} from '@chakra-ui/react';
import type { WfmWorkflow, CreateWfmWorkflowInput, UpdateWfmWorkflowInput } from '../../../generated/graphql/graphql';

const workflowSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().nullable(),
  isArchived: z.boolean().optional(),
});

export type WorkflowFormData = z.infer<typeof workflowSchema>;

interface WorkflowFormProps {
  onSubmit: (data: WorkflowFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: WfmWorkflow | null;
  isSubmitting: boolean;
}

const WorkflowForm: React.FC<WorkflowFormProps> = ({ onSubmit, onCancel, initialData, isSubmitting }) => {
  const { 
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      isArchived: initialData?.isArchived || false,
    },
  });

  const handleFormSubmit = async (data: WorkflowFormData) => {
    await onSubmit(data); 
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel htmlFor="name">Workflow Name</FormLabel>
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input {...field} id="name" placeholder="e.g., Standard Deal Process" />}
          />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel htmlFor="description">Description</FormLabel>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="description"
                placeholder="A brief description of what this workflow is for."
                value={field.value || ''} 
              />
            )}
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        {initialData && (
            <FormControl display="flex" alignItems="center" isInvalid={!!errors.isArchived}>
                <FormLabel htmlFor="isArchived" mb="0">
                    Archived
                </FormLabel>
                <Controller
                    name="isArchived"
                    control={control}
                    render={({ field }) => (
                        <Switch 
                            id="isArchived" 
                            isChecked={field.value} 
                            onChange={field.onChange} 
                        />
                    )}
                />
                 <FormErrorMessage>{errors.isArchived?.message}</FormErrorMessage>
            </FormControl>
        )}

        <VStack spacing={2} direction="row" justify="flex-end" mt={4}>
          <Button onClick={onCancel} variant="ghost" isDisabled={isSubmitting}>Cancel</Button>
          <Button 
            type="submit" 
            colorScheme="teal" 
            isLoading={isSubmitting} 
            isDisabled={!isDirty && !!initialData} 
          >
            {initialData ? 'Save Changes' : 'Create Workflow'}
          </Button>
        </VStack>
      </VStack>
    </form>
  );
};

export default WorkflowForm; 