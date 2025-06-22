import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  VStack,
  HStack,
  Checkbox,
  // Consider a color picker component later if desired
} from '@chakra-ui/react';
import { CreateWfmStatusInput, WfmStatus } from '../../../generated/graphql/graphql';

// The form can handle data for both creating and updating.
// For updates, 'isArchived' might be included.
export interface StatusFormValues extends Omit<CreateWfmStatusInput, 'name'> { // Omit name to redefine it as non-optional for the form itself
  name: string; // Name is always required for the form
  isArchived?: boolean; // Only for update scenarios
}

interface StatusFormProps {
  onSubmit: (values: StatusFormValues) => Promise<void>;
  initialValues?: Partial<WfmStatus>; // WfmStatus has all fields, including id, createdAt etc.
  isSubmitting: boolean;
  onCancel?: () => void;
}

const StatusForm: React.FC<StatusFormProps> = ({
  onSubmit,
  initialValues,
  isSubmitting,
  onCancel,
}) => {
  const isEditMode = !!initialValues?.id;

  const { handleSubmit, register, control, formState: { errors } } = useForm<StatusFormValues>({
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      color: initialValues?.color || '',
      isArchived: initialValues?.isArchived || false,
    },
  });

  const handleFormSubmit = (values: StatusFormValues) => {
    // Prepare data for either CreateWfmStatusInput or UpdateWfmStatusInput
    // The parent modal/component will handle calling the correct store action.
    return onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} id="wfm-status-form">
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel htmlFor="name">Status Name</FormLabel>
          <Input
            id="name"
            {...register('name', { required: 'Status Name is required' })}
          />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel htmlFor="description">Description</FormLabel>
          <Textarea
            id="description"
            {...register('description')}
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.color}>
          <FormLabel htmlFor="color">Color</FormLabel>
          <Input
            id="color"
            type="text" // Could be type="color" for a basic picker, or use a Chakra color picker extension
            {...register('color')}
            placeholder="e.g., #FF0000 or red.500"
          />
          <FormErrorMessage>{errors.color?.message}</FormErrorMessage>
        </FormControl>

        {isEditMode && (
          <FormControl isInvalid={!!errors.isArchived}>
            <Controller
              name="isArchived"
              control={control}
              render={({ field }) => (
                <Checkbox id="isArchived" isChecked={field.value} onChange={field.onChange}>
                  Is Archived
                </Checkbox>
              )}
            />
            <FormErrorMessage>{errors.isArchived?.message}</FormErrorMessage>
          </FormControl>
        )}

        <HStack justifyContent="flex-end" spacing={3} mt={4}>
          {onCancel && (
            <Button onClick={onCancel} isDisabled={isSubmitting} variant="ghost">
              Cancel
            </Button>
          )}
          <Button colorScheme="blue" isLoading={isSubmitting} type="submit">
            {isEditMode ? 'Save Changes' : 'Create Status'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

export default StatusForm; 