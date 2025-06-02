import React from 'react';
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

interface CustomFieldRendererProps {
  definition: CustomFieldDefinition;
  value: any;
  onChange: (value: any) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
}

export const CustomFieldRenderer: React.FC<CustomFieldRendererProps> = ({
  definition,
  value,
  onChange,
  isRequired = false,
  isDisabled = false,
}) => {
  const fieldName = definition.fieldName;
  const fieldLabel = definition.fieldLabel || definition.fieldName;
  const dropdownOptions = definition.dropdownOptions || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleNumberChange = (valueAsString: string) => {
    onChange(valueAsString);
  };

  const handleSwitchChange = (checked: boolean) => {
    onChange(checked);
  };

  const handleCheckboxGroupChange = (values: string[]) => {
    onChange(values);
  };

  const renderFieldInput = () => {
    switch (definition.fieldType) {
      case 'TEXT' as CustomFieldType:
        return (
          <Textarea
            id={fieldName}
            value={value || ''}
            onChange={handleInputChange}
            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
            isDisabled={isDisabled}
          />
        );

      case 'NUMBER' as CustomFieldType:
        return (
          <NumberInput
            id={fieldName}
            value={value || ''}
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
            value={value || ''}
            onChange={handleInputChange}
            isDisabled={isDisabled}
          />
        );

      case 'DROPDOWN' as CustomFieldType:
        return (
          <Select
            id={fieldName}
            placeholder={`Select ${fieldLabel.toLowerCase()}...`}
            value={value || ''}
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
            value={value || []}
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
}; 