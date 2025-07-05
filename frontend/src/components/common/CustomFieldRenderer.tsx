import React, { useCallback, useMemo } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Textarea,
  Switch,
  CheckboxGroup,
  Checkbox,
  VStack,
  Text,
} from '@chakra-ui/react';
import type { CustomFieldDefinition, CustomFieldType } from '../../generated/graphql/graphql';
import { UserMultiSelectField } from './UserMultiSelectField';

type CustomFieldValue = string | number | boolean | string[] | null | undefined;

interface CustomFieldRendererProps {
  definition: CustomFieldDefinition;
  value: CustomFieldValue;
  onChange: (value: CustomFieldValue) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
}

export const CustomFieldRenderer: React.FC<CustomFieldRendererProps> = React.memo(({
  definition,
  value,
  onChange,
  isRequired = false,
  isDisabled = false,
}) => {
  const fieldName = useMemo(() => definition.fieldName, [definition.fieldName]);
  const fieldLabel = useMemo(() => definition.fieldLabel || definition.fieldName, [definition.fieldLabel, definition.fieldName]);
  const dropdownOptions = useMemo(() => definition.dropdownOptions || [], [definition.dropdownOptions]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleNumberChange = useCallback((valueAsString: string) => {
    onChange(valueAsString);
  }, [onChange]);

  const handleSwitchChange = useCallback((checked: boolean) => {
    onChange(checked);
  }, [onChange]);

  const handleCheckboxGroupChange = useCallback((values: string[]) => {
    onChange(values);
  }, [onChange]);

  const renderFieldInput = () => {
    switch (definition.fieldType) {
      case 'TEXT' as CustomFieldType:
        return (
          <Textarea
            id={fieldName}
            value={typeof value === 'string' ? value : ''}
            onChange={handleInputChange}
            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
            isDisabled={isDisabled}
          />
        );

      case 'NUMBER' as CustomFieldType:
        return (
          <NumberInput
            id={fieldName}
            value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
            onChange={handleNumberChange}
            precision={2}
            isDisabled={isDisabled}
          >
            <NumberInputField placeholder={`Enter ${fieldLabel.toLowerCase()}`} />
          </NumberInput>
        );

      case 'BOOLEAN' as CustomFieldType:
        return (
          <Switch
            id={fieldName}
            isChecked={Boolean(value)}
            onChange={(e) => handleSwitchChange(e.target.checked)}
            isDisabled={isDisabled}
          />
        );

      case 'DATE' as CustomFieldType:
        return (
          <Input
            type="date"
            id={fieldName}
            value={typeof value === 'string' ? value : ''}
            onChange={handleInputChange}
            isDisabled={isDisabled}
          />
        );

      case 'DROPDOWN' as CustomFieldType:
        return (
          <Select
            id={fieldName}
            placeholder={`Select ${fieldLabel.toLowerCase()}...`}
            value={typeof value === 'string' ? value : ''}
            onChange={handleInputChange}
            isDisabled={isDisabled}
          >
            {dropdownOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case 'MULTI_SELECT' as CustomFieldType:
        return (
          <CheckboxGroup
            value={Array.isArray(value) ? value : []}
            onChange={handleCheckboxGroupChange}
            isDisabled={isDisabled}
          >
            <VStack spacing={2} alignItems="flex-start">
              {dropdownOptions.map((option) => (
                <Checkbox
                  key={option.value}
                  value={option.value}
                  isDisabled={isDisabled}
                >
                  {option.label}
                </Checkbox>
              ))}
            </VStack>
          </CheckboxGroup>
        );

      case 'USER_MULTISELECT' as CustomFieldType:
        return (
          <UserMultiSelectField
            value={Array.isArray(value) ? value : []}
            onChange={onChange}
            isDisabled={isDisabled}
            placeholder={`Select ${fieldLabel.toLowerCase()}...`}
          />
        );

      default:
        return (
          <Text fontSize="sm" color="red.500">
            Unsupported custom field type: {definition.fieldType}
          </Text>
        );
    }
  };

  return (
    <FormControl 
      key={definition.id} 
      isRequired={isRequired}
      mb={4}
      {...(definition.fieldType === 'BOOLEAN' ? { display: 'flex', alignItems: 'center' } : {})}
    >
      <FormLabel 
        htmlFor={fieldName}
        {...(definition.fieldType === 'BOOLEAN' ? { mb: '0' } : {})}
      >
        {fieldLabel}
        {isRequired && '*'}
      </FormLabel>
      {renderFieldInput()}
    </FormControl>
  );
}); 