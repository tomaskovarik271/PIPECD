import React, { useEffect } from 'react';
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
  Select,
  FormHelperText,
  Spinner,
  Text,
} from '@chakra-ui/react';
import type { WfmProjectType, WfmWorkflow, CreateWfmProjectTypeInput, UpdateWfmProjectTypeInput } from '../../../generated/graphql/graphql';
import { useWFMProjectTypeStore } from '../../../stores/useWFMProjectTypeStore'; // To fetch available workflows

const projectTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().nullable(),
  iconName: z.string().max(50, 'Icon name must be 50 characters or less').optional().nullable(),
  defaultWorkflowId: z.string().uuid('Invalid workflow ID').optional().nullable(),
  isArchived: z.boolean().optional(),
});

export type ProjectTypeFormData = z.infer<typeof projectTypeSchema>;

interface ProjectTypeFormProps {
  onSubmit: (data: ProjectTypeFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: WfmProjectType | null;
  isSubmitting: boolean;
}

const ProjectTypeForm: React.FC<ProjectTypeFormProps> = ({ onSubmit, onCancel, initialData, isSubmitting }) => {
  const availableWorkflows = useWFMProjectTypeStore((state) => state.availableWorkflows);
  const loadingWorkflows = useWFMProjectTypeStore((state) => state.loadingWorkflows);
  const fetchAvailableWorkflows = useWFMProjectTypeStore((state) => state.fetchAvailableWorkflows);

  useEffect(() => {
    if (availableWorkflows.length === 0) {
      fetchAvailableWorkflows();
    }
  }, [fetchAvailableWorkflows, availableWorkflows.length]);

  const { 
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm<ProjectTypeFormData>({
    resolver: zodResolver(projectTypeSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      iconName: initialData?.iconName || '',
      defaultWorkflowId: initialData?.defaultWorkflow?.id || null,
      isArchived: initialData?.isArchived || false,
    },
  });

  const watchedWorkflowId = watch('defaultWorkflowId');

  const handleFormSubmit = async (data: ProjectTypeFormData) => {
    const submissionData = {
        ...data,
        // Ensure empty strings for optional fields become null for the backend if not provided
        description: data.description?.trim() === '' ? null : data.description,
        iconName: data.iconName?.trim() === '' ? null : data.iconName,
        defaultWorkflowId: data.defaultWorkflowId === '' || data.defaultWorkflowId === 'none' ? null : data.defaultWorkflowId,
    };
    await onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel htmlFor="name">Project Type Name</FormLabel>
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input {...field} id="name" placeholder="e.g., Software Development, Marketing Campaign" />}
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
                placeholder="A brief description of this project type."
                value={field.value || ''}
              />
            )}
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.iconName}>
          <FormLabel htmlFor="iconName">Icon Name</FormLabel>
          <Controller
            name="iconName"
            control={control}
            render={({ field }) => <Input {...field} id="iconName" placeholder="e.g., FaProjectDiagram (from react-icons)" value={field.value || ''} />}
          />
          <FormHelperText>Enter a valid react-icons (FontAwesome - Fa) icon name, or leave blank. E.g., 'FaBeer'.</FormHelperText>
          <FormErrorMessage>{errors.iconName?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.defaultWorkflowId}>
          <FormLabel htmlFor="defaultWorkflowId">Default Workflow</FormLabel>
          {loadingWorkflows ? (
            <Spinner size="sm" />
          ) : availableWorkflows.length === 0 ? (
            <Text color="gray.500">No active workflows available. Create one first.</Text>
          ) : (
            <Controller
              name="defaultWorkflowId"
              control={control}
              render={({ field }) => (
                <Select {...field} id="defaultWorkflowId" placeholder="Select a default workflow (optional)" value={field.value || ''}>
                  <option value="none">None</option> {/* Explicit None option */}
                  {availableWorkflows.map((wf) => (
                    <option key={wf.id} value={wf.id}>
                      {wf.name}
                    </option>
                  ))}
                </Select>
              )}
            />
          )}
          <FormErrorMessage>{errors.defaultWorkflowId?.message}</FormErrorMessage>
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
            colorScheme="blue" 
            isLoading={isSubmitting} 
            isDisabled={(!isDirty && !!initialData) || loadingWorkflows} // Disable if not dirty on edit, or if workflows are loading
          >
            {initialData ? 'Save Changes' : 'Create Project Type'}
          </Button>
        </VStack>
      </VStack>
    </form>
  );
};

export default ProjectTypeForm; 