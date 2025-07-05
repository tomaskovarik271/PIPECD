import React, { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Checkbox,
  VStack,
  Text,
  SimpleGrid,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  CustomFieldDefinitionInput,
  CustomFieldEntityType,
  CustomFieldOptionInput,
  CustomFieldType,
} from '../../../generated/graphql/graphql';

export interface CustomFieldDefinitionFormValues extends Omit<CustomFieldDefinitionInput, 'dropdownOptions' | 'entityType'> {
  entityType: CustomFieldEntityType;
  dropdownOptions?: CustomFieldOptionInput[];
}

interface CustomFieldDefinitionFormProps {
  onSubmit: (values: CustomFieldDefinitionInput) => Promise<void>;
  initialValues?: Partial<CustomFieldDefinitionFormValues>;
  entityType: CustomFieldEntityType;
  isSubmitting: boolean;
}

const CustomFieldDefinitionForm: React.FC<CustomFieldDefinitionFormProps> = ({
  onSubmit,
  initialValues,
  entityType,
  isSubmitting,
}) => {
  const {
    handleSubmit,
    register,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CustomFieldDefinitionFormValues>({
    defaultValues: {
      ...initialValues,
      entityType: entityType,
      isRequired: initialValues?.isRequired ?? false,
      displayOrder: initialValues?.displayOrder ?? 0,
      fieldType: initialValues?.fieldType || CustomFieldType.Text,
      dropdownOptions: initialValues?.dropdownOptions || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dropdownOptions",
  });

  const isEditMode = !!initialValues?.fieldName;

  useEffect(() => {
    const defaultVals = {
      ...initialValues,
      entityType: entityType,
      isRequired: initialValues?.isRequired ?? false,
      displayOrder: initialValues?.displayOrder ?? 0,
      fieldType: initialValues?.fieldType || CustomFieldType.Text,
      dropdownOptions: initialValues?.dropdownOptions || [],
    };
    reset(defaultVals);
  }, [initialValues, entityType, reset]);

  const fieldTypeWatch = watch('fieldType');

  const onFormSubmit = (values: CustomFieldDefinitionFormValues) => {
    const submissionValues: CustomFieldDefinitionInput = {
      entityType: entityType,
      fieldName: values.fieldName,
      fieldLabel: values.fieldLabel,
      fieldType: values.fieldType,
      isRequired: values.isRequired,
      displayOrder: values.displayOrder,
      dropdownOptions: (values.fieldType === 'DROPDOWN' || values.fieldType === 'MULTI_SELECT') && values.dropdownOptions && values.dropdownOptions.length > 0 
        ? values.dropdownOptions 
        : null,
    };
    return onSubmit(submissionValues);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.fieldLabel} isRequired>
          <FormLabel htmlFor="fieldLabel">Field Label</FormLabel>
          <Input
            id="fieldLabel"
            {...register('fieldLabel', { required: 'Field Label is required' })}
          />
          <FormErrorMessage>{errors.fieldLabel?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.fieldName} isRequired>
          <FormLabel htmlFor="fieldName">Field Name (Internal)</FormLabel>
          <Input
            id="fieldName"
            {...register('fieldName', {
              required: 'Field Name is required',
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Field Name can only contain letters, numbers, and underscores.',
              },
            })}
            placeholder="e.g., contact_source or deal_priority"
            isDisabled={isEditMode}
          />
          <FormErrorMessage>{errors.fieldName?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.fieldType} isRequired>
          <FormLabel htmlFor="fieldType">Field Type</FormLabel>
          <Controller
            name="fieldType"
            control={control}
            rules={{ required: 'Field Type is required' }}
            defaultValue={CustomFieldType.Text}
            render={({ field }) => (
              <Select {...field} id="fieldType" isDisabled={isEditMode}>
                {['TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'DROPDOWN', 'MULTI_SELECT', 'USER_MULTISELECT', 'TEXT_AREA'].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            )}
          />
          <FormErrorMessage>{errors.fieldType?.message}</FormErrorMessage>
        </FormControl>

        {(fieldTypeWatch === 'DROPDOWN' || fieldTypeWatch === 'MULTI_SELECT') && (
          <Box borderWidth="1px" borderRadius="md" p={4}>
            <HStack justifyContent="space-between" mb={2}>
                <FormLabel mb={0}>Dropdown Options</FormLabel>
                <Button leftIcon={<AddIcon />} size="sm" onClick={() => append({ value: '', label: '' })}>
                    Add Option
                </Button>
            </HStack>
            {fields.map((item, index) => (
              <SimpleGrid columns={3} spacing={2} key={item.id} mb={2} alignItems="center">
                <FormControl isInvalid={!!errors.dropdownOptions?.[index]?.value}>
                  <Input
                    {...register(`dropdownOptions.${index}.value` as const, { required: 'Value is required' })}
                    placeholder="Option Value"
                    defaultValue={item.value} 
                  />
                  <FormErrorMessage>{errors.dropdownOptions?.[index]?.value?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.dropdownOptions?.[index]?.label}>
                  <Input
                    {...register(`dropdownOptions.${index}.label` as const, { required: 'Label is required' })}
                    placeholder="Option Label"
                    defaultValue={item.label}
                  />
                  <FormErrorMessage>{errors.dropdownOptions?.[index]?.label?.message}</FormErrorMessage>
                </FormControl>
                <IconButton
                  aria-label="Remove option"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => remove(index)}
                />
              </SimpleGrid>
            ))}
            {fields.length === 0 && <Text fontSize="sm" color="gray.500">No options defined. Click "Add Option".</Text>}
          </Box>
        )}

        <FormControl isInvalid={!!errors.displayOrder}>
          <FormLabel htmlFor="displayOrder">Display Order</FormLabel>
          <Controller
            name="displayOrder"
            control={control}
            defaultValue={0}
            render={({ field }) => (
              <Input 
                {...field} 
                id="displayOrder" 
                type="number" 
                value={field.value ?? ''}
                onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} 
              />
            )}
          />
          <FormErrorMessage>{errors.displayOrder?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.isRequired}>
          <Checkbox id="isRequired" {...register('isRequired')}>
            Is Required?
          </Checkbox>
          <FormErrorMessage>{errors.isRequired?.message}</FormErrorMessage>
        </FormControl>

        <Button mt={4} colorScheme="blue" isLoading={isSubmitting} type="submit">
          {initialValues?.fieldName ? 'Update Definition' : 'Create Definition'}
        </Button>
      </VStack>
    </form>
  );
};

export default CustomFieldDefinitionForm; 