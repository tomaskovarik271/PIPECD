import React, { useState, useEffect } from 'react';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  ModalBody,
  ModalFooter,
  Select,
  Stack,
  Textarea,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  NumberInput,
  NumberInputField,
  Checkbox,
} from '@chakra-ui/react';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';
import type {
  PersonInput,
  CustomFieldValueInput,
  CustomFieldEntityType,
  CustomFieldType as GQLCustomFieldType,
} from '../generated/graphql/graphql';

interface EditPersonFormProps {
  person: Person;
  onClose: () => void;
  onSuccess: () => void;
}

const EditPersonForm: React.FC<EditPersonFormProps> = ({ person, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: person.first_name,
    last_name: person.last_name,
    email: person.email,
    phone: person.phone,
    notes: person.notes,
    customFields: [],
  });
  const [customFieldData, setCustomFieldData] = useState<Record<string, string | number | boolean | string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const { updatePerson: updatePersonAction, peopleError } = usePeopleStore();
  
  const allDefinitions = useCustomFieldDefinitionStore(state => state.definitions);
  const definitionsLoading = useCustomFieldDefinitionStore(state => state.loading);
  const _definitionsError = useCustomFieldDefinitionStore(state => state.error);
  const fetchDefinitions = useCustomFieldDefinitionStore(state => state.fetchCustomFieldDefinitions);
  
  const [localError, setLocalError] = useState<string | null>(null);

  const personCustomFieldDefinitions = allDefinitions.filter(
    d => d.entityType === 'PERSON' && d.isActive
  );

  useEffect(() => {
    if (!definitionsLoading && !allDefinitions.some(d => d.entityType === 'PERSON')) {
      fetchDefinitions('PERSON' as CustomFieldEntityType);
    }
  }, [definitionsLoading, allDefinitions, fetchDefinitions]);

  // Initialize custom field data from person
  useEffect(() => {
    if (person.customFieldValues && personCustomFieldDefinitions.length > 0) {
      const initializedData: Record<string, string | number | boolean | string[]> = {};
      
      personCustomFieldDefinitions.forEach(def => {
        const existingValue = person.customFieldValues?.find(cfv => cfv.definition.id === def.id);
        
        if (existingValue) {
          switch (def.fieldType) {
            case 'TEXT':
              initializedData[def.fieldName] = existingValue.stringValue || '';
              break;
            case 'NUMBER':
              initializedData[def.fieldName] = existingValue.numberValue !== null && existingValue.numberValue !== undefined 
                ? existingValue.numberValue 
                : '';
              break;
            case 'BOOLEAN':
              initializedData[def.fieldName] = existingValue.booleanValue ?? false;
              break;
            case 'DATE':
              initializedData[def.fieldName] = existingValue.dateValue 
                ? new Date(existingValue.dateValue).toISOString().split('T')[0]
                : '';
              break;
            case 'MULTI_SELECT':
              initializedData[def.fieldName] = existingValue.selectedOptionValues || [];
              break;
            case 'DROPDOWN':
              initializedData[def.fieldName] = existingValue.stringValue || 
                (existingValue.selectedOptionValues && existingValue.selectedOptionValues.length > 0 
                  ? existingValue.selectedOptionValues[0] 
                  : '');
              break;
            default:
              initializedData[def.fieldName] = '';
          }
        } else {
          // Default values if not found
          switch (def.fieldType) {
            case 'BOOLEAN':
              initializedData[def.fieldName] = false;
              break;
            case 'MULTI_SELECT':
              initializedData[def.fieldName] = [];
              break;
            default:
              initializedData[def.fieldName] = '';
          }
        }
      });
      
      setCustomFieldData(initializedData);
    }
  }, [person.customFieldValues, personCustomFieldDefinitions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (fieldName: string, value: string | React.ChangeEvent<HTMLInputElement>, type: GQLCustomFieldType) => {
    setCustomFieldData(prev => ({
      ...prev,
      [fieldName]: type === 'BOOLEAN' ? (value as React.ChangeEvent<HTMLInputElement>).target.checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    if (!formData.first_name && !formData.last_name && !formData.email) {
      setLocalError('Please provide at least a first name, last name, or email.');
      setIsLoading(false);
      return;
    }

    const processedCustomFields: CustomFieldValueInput[] = personCustomFieldDefinitions
      .map(def => {
        const rawValue = customFieldData[def.fieldName];
        if (rawValue === undefined || rawValue === null || rawValue === '') {
          if (def.isRequired) {
            setLocalError((prev) => (prev ? prev + `\n` : ``) + `Field '${def.fieldLabel}' is required.`);
          }
          return null;
        }

        const cfInput: CustomFieldValueInput = { definitionId: def.id };
        switch (def.fieldType) {
          case 'TEXT':
            cfInput.stringValue = String(rawValue);
            break;
          case 'NUMBER':
            const num = parseFloat(rawValue);
            if (!isNaN(num)) cfInput.numberValue = num;
            else setLocalError((prev) => (prev ? prev + `\n` : ``) + `Invalid number for '${def.fieldLabel}'.`);
            break;
          case 'BOOLEAN':
            cfInput.booleanValue = Boolean(rawValue);
            break;
          case 'DATE':
            cfInput.dateValue = rawValue;
            break;
          case 'DROPDOWN':
            cfInput.selectedOptionValues = [String(rawValue)];
            break;
          case 'MULTI_SELECT':
            cfInput.selectedOptionValues = Array.isArray(rawValue) ? rawValue.map(String) : (rawValue ? [String(rawValue)] : []);
            break;
        }
        return cfInput;
      })
      .filter(Boolean) as CustomFieldValueInput[];
      
    if (localError) {
        setIsLoading(false);
        return;
    }

    const mutationInput: PersonInput = {
      first_name: formData.first_name || null,
      last_name: formData.last_name || null,
      email: formData.email || null,
      phone: formData.phone || null,
      notes: formData.notes || null,
      customFields: processedCustomFields.length > 0 ? processedCustomFields : null,
    };

    try {
      // Update person
      const updatedPerson = await updatePersonAction(person.id, mutationInput);
      if (!updatedPerson) {
        setLocalError(peopleError || 'Failed to update person. Please try again.');
        setIsLoading(false);
        return;
      }

      toast({ 
        title: 'Person Updated', 
        description: 'Person has been updated successfully.',
        status: 'success', 
        duration: 3000, 
        isClosable: true 
      });
      
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Unexpected error during handleSubmit:", error);
      let message = 'An unexpected error occurred.';
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      setLocalError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        {(localError || peopleError) && (
          <Alert status="error" mb={4} whiteSpace="pre-wrap">
            <AlertIcon />
            {localError || peopleError}
          </Alert>
        )}
        
        <Stack spacing={4}>
          {/* Basic Person Information */}
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">Person Information</Text>
          
          <FormControl isInvalid={!!localError && (!formData.first_name && !formData.last_name && !formData.email)}>
            <FormLabel>First Name</FormLabel>
            <Input name="first_name" value={formData.first_name || ''} onChange={handleChange} />
          </FormControl>
          
          <FormControl isInvalid={!!localError && (!formData.first_name && !formData.last_name && !formData.email)}>
            <FormLabel>Last Name</FormLabel>
            <Input name="last_name" value={formData.last_name || ''} onChange={handleChange} />
          </FormControl>
          
          <FormControl isInvalid={!!localError && (!formData.first_name && !formData.last_name && !formData.email)}>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
            {!!localError && (!formData.first_name && !formData.last_name && !formData.email) && <FormErrorMessage>{localError}</FormErrorMessage>}
          </FormControl>
          
          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} />
          </FormControl>
          
          <FormControl>
            <FormLabel>Notes</FormLabel>
            <Textarea name="notes" value={formData.notes || ''} onChange={handleChange} />
          </FormControl>

          {/* Custom Fields */}
          {personCustomFieldDefinitions.length > 0 && (
            <>
              <Text fontSize="lg" fontWeight="semibold" color="gray.700" mt={6}>Custom Fields</Text>
              {personCustomFieldDefinitions.map((def) => (
                <FormControl key={def.id} isRequired={def.isRequired}>
                  <FormLabel>{def.fieldLabel}</FormLabel>
                  {def.fieldType === 'TEXT' && (
                    <Input
                      value={customFieldData[def.fieldName] || ''}
                      onChange={(e) => handleCustomFieldChange(def.fieldName, e.target.value, def.fieldType)}
                    />
                  )}
                  {def.fieldType === 'NUMBER' && (
                    <NumberInput
                      value={customFieldData[def.fieldName] || ''}
                      onChange={(value) => handleCustomFieldChange(def.fieldName, value, def.fieldType)}
                    >
                      <NumberInputField />
                    </NumberInput>
                  )}
                  {def.fieldType === 'BOOLEAN' && (
                    <Checkbox
                      isChecked={customFieldData[def.fieldName] || false}
                      onChange={(e) => handleCustomFieldChange(def.fieldName, e, def.fieldType)}
                    >
                      {def.fieldLabel}
                    </Checkbox>
                  )}
                  {def.fieldType === 'DATE' && (
                    <Input
                      type="date"
                      value={customFieldData[def.fieldName] || ''}
                      onChange={(e) => handleCustomFieldChange(def.fieldName, e.target.value, def.fieldType)}
                    />
                  )}
                  {def.fieldType === 'DROPDOWN' && (
                    <Select
                      placeholder={`Select ${def.fieldLabel.toLowerCase()}...`}
                      value={customFieldData[def.fieldName] || ''}
                      onChange={(e) => handleCustomFieldChange(def.fieldName, e.target.value, def.fieldType)}
                    >
                      {def.dropdownOptions?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  )}
                  {def.fieldType === 'MULTI_SELECT' && (
                    <div>
                      {def.dropdownOptions?.map((option) => (
                        <Checkbox
                          key={option.value}
                          isChecked={(customFieldData[def.fieldName] || []).includes(option.value)}
                          onChange={(e) => {
                            const currentValues = customFieldData[def.fieldName] || [];
                            const newValues = e.target.checked
                              ? [...currentValues, option.value]
                              : currentValues.filter((v: string) => v !== option.value);
                            handleCustomFieldChange(def.fieldName, newValues, def.fieldType);
                          }}
                        >
                          {option.label}
                        </Checkbox>
                      ))}
                    </div>
                  )}
                </FormControl>
              ))}
            </>
          )}
        </Stack>
      </ModalBody>
      
      <ModalFooter>
        <Button variant="ghost" mr={3} onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button colorScheme="blue" type="submit" isLoading={isLoading}>
          Update Person
        </Button>
      </ModalFooter>
    </form>
  );
};

export default EditPersonForm; 