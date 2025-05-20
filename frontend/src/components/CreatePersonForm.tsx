import { useState, useEffect } from 'react';
import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  ModalBody,
  ModalFooter,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Spinner,
  Stack,
  Textarea,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import type {
  PersonInput,
  CustomFieldValueInput,
  CustomFieldDefinition,
  CustomFieldEntityType,
  CustomFieldType as GQLCustomFieldType, // Renamed to avoid conflict
} from '../generated/graphql/graphql';
import { usePeopleStore } from '../stores/usePeopleStore';
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';

interface CreatePersonFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreatePersonForm({ onClose, onSuccess }: CreatePersonFormProps) {
  const [formData, setFormData] = useState<PersonInput>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    notes: '',
    organization_id: null,
    customFields: [], // Initialize customFields
  });
  const [customFieldData, setCustomFieldData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    organizations,
    organizationsLoading: orgLoading,
    organizationsError: orgError,
    fetchOrganizations,
  } = useOrganizationsStore();

  const { createPerson: createPersonAction, peopleError } = usePeopleStore();
  
  // Correctly select state and actions from useCustomFieldDefinitionStore
  const allDefinitions = useCustomFieldDefinitionStore(state => state.definitions);
  const definitionsLoading = useCustomFieldDefinitionStore(state => state.loading);
  const definitionsError = useCustomFieldDefinitionStore(state => state.error);
  const fetchDefinitions = useCustomFieldDefinitionStore(state => state.fetchCustomFieldDefinitions);

  const [localError, setLocalError] = useState<string | null>(null);

  const personCustomFieldDefinitions = allDefinitions.filter(
    d => d.entityType === 'PERSON' && d.isActive
  );

  useEffect(() => {
    if (!orgLoading && (!organizations || organizations.length === 0)) {
      fetchOrganizations();
    }
    // Fetch custom field definitions for Person if not already loaded
    if (!definitionsLoading && !allDefinitions.some(d => d.entityType === 'PERSON')) {
      fetchDefinitions('PERSON' as CustomFieldEntityType);
    }
  }, [organizations, orgLoading, fetchOrganizations, definitionsLoading, allDefinitions, fetchDefinitions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'organization_id' && value === '') {
      setFormData(prev => ({ ...prev, [name]: null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomFieldChange = (fieldName: string, value: any, type: GQLCustomFieldType) => {
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
          // Check for required fields if value is not provided
          if (def.isRequired) {
            setLocalError((prev) => (prev ? prev + `\n` : ``) + `Field '${def.fieldLabel}' is required.`);
          }
          return null; // No value or empty value
        }

        const cfInput: CustomFieldValueInput = { definitionId: def.id };
        switch (def.fieldType) {
          case 'TEXT':
            cfInput.stringValue = String(rawValue);
            break;
          case 'NUMBER': {
            const num = parseFloat(rawValue);
            if (!isNaN(num)) cfInput.numberValue = num;
            else setLocalError((prev) => (prev ? prev + `\n` : ``) + `Invalid number for '${def.fieldLabel}'.`);
            break;
          }
          case 'BOOLEAN':
            cfInput.booleanValue = Boolean(rawValue);
            break;
          case 'DATE':
            cfInput.dateValue = rawValue; // Assuming YYYY-MM-DD string
            break;
          case 'DROPDOWN':
            cfInput.selectedOptionValues = [String(rawValue)];
            break;
          case 'MULTI_SELECT': // TODO: Handle multi-select properly
            cfInput.selectedOptionValues = Array.isArray(rawValue) ? rawValue.map(String) : (rawValue ? [String(rawValue)] : []);
            break;
        }
        return cfInput;
      })
      .filter(Boolean) as CustomFieldValueInput[];
      
    if (localError) { // if errors were set during custom field processing
        setIsLoading(false);
        return;
    }

    const mutationInput: PersonInput = {
      first_name: formData.first_name || null,
      last_name: formData.last_name || null,
      email: formData.email || null,
      phone: formData.phone || null,
      notes: formData.notes || null,
      organization_id: formData.organization_id || null,
      customFields: processedCustomFields.length > 0 ? processedCustomFields : null,
    };

    try {
      const createdPerson = await createPersonAction(mutationInput);
      if (createdPerson) {
        toast({ title: 'Person Created', status: 'success', duration: 3000, isClosable: true });
        onSuccess();
        onClose();
      } else {
        setLocalError(peopleError || 'Failed to create person. Please try again.');
      }
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
            <FormLabel>Organization</FormLabel>
            {orgLoading && <Spinner size="sm" />}
            {orgError && <Alert status="error" size="sm"><AlertIcon />{orgError}</Alert>}
            {!orgLoading && !orgError && (
              <Select
                name="organization_id"
                value={formData.organization_id || ''}
                onChange={handleChange}
                placeholder="Select organization (optional)"
                isDisabled={orgLoading || !organizations || organizations.length === 0}
              >
                {organizations && organizations.map((org: Organization) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </Select>
            )}
            {(!orgLoading && (orgError || (!organizations || organizations.length === 0))) &&
              <FormErrorMessage>
                {orgError ? "Could not load organizations." : "No organizations found. Create one first."}
              </FormErrorMessage>}
          </FormControl>
          <FormControl>
            <FormLabel>Notes</FormLabel>
            <Textarea name="notes" value={formData.notes || ''} onChange={handleChange} />
          </FormControl>

          {/* Custom Fields Section */}
          {definitionsLoading && <Spinner />}
          {definitionsError && <Alert status="error"><AlertIcon />Error loading custom fields: {definitionsError}</Alert>}
          {personCustomFieldDefinitions.map((def: CustomFieldDefinition) => (
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
                  onChange={(valueString) => handleCustomFieldChange(def.fieldName, valueString, def.fieldType)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              )}
              {def.fieldType === 'BOOLEAN' && (
                <Checkbox
                  isChecked={customFieldData[def.fieldName] || false}
                  onChange={(e) => handleCustomFieldChange(def.fieldName, e, def.fieldType)}
                >
                  Enabled
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
                  placeholder={`Select ${def.fieldLabel}`}
                  value={customFieldData[def.fieldName] || ''}
                  onChange={(e) => handleCustomFieldChange(def.fieldName, e.target.value, def.fieldType)}
                >
                  {def.dropdownOptions?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              )}
              {/* TODO: Implement proper MULTI_SELECT component */}
              {def.fieldType === 'MULTI_SELECT' && (
                 <Textarea // Placeholder for MULTI_SELECT
                  placeholder={`Enter values for ${def.fieldLabel}, comma-separated`}
                  value={customFieldData[def.fieldName] || ''} // Assuming storing as comma-separated string for now
                  onChange={(e) => handleCustomFieldChange(def.fieldName, e.target.value.split(',').map(s => s.trim()), def.fieldType)}
                />
              )}
              {localError && def.isRequired && (customFieldData[def.fieldName] === undefined || customFieldData[def.fieldName] === null || customFieldData[def.fieldName] === '') && 
                <FormErrorMessage>{`Field '${def.fieldLabel}' is required.`}</FormErrorMessage>}
            </FormControl>
          ))}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" mr={3} onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button colorScheme="blue" type="submit" isLoading={isLoading}>
          Save Person
        </Button>
      </ModalFooter>
    </form>
  );
}

export default CreatePersonForm; 