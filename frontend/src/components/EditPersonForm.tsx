import React, { useState, useEffect, useMemo } from 'react';
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
  Stack,
  Textarea,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore';
import type {
  PersonInput,
  CustomFieldValueInput,
  CustomFieldDefinition,
  CustomFieldEntityType,
  CustomFieldType as GQLCustomFieldType,
} from '../generated/graphql/graphql';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';

interface EditPersonFormProps {
  person: Person;
  onClose: () => void;
  onSuccess: () => void;
}

const EditPersonForm: React.FC<EditPersonFormProps> = ({ person, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<PersonInput>({
    first_name: person.first_name,
    last_name: person.last_name,
    email: person.email,
    phone: person.phone,
    notes: person.notes,
    organization_id: person.organization_id,
    customFields: [],
  });
  const [customFieldData, setCustomFieldData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const { 
    organizations, 
    organizationsLoading: orgLoading, 
    organizationsError: orgError,
    fetchOrganizations 
  } = useOrganizationsStore();

  const { updatePerson: updatePersonAction, peopleError } = usePeopleStore();
  
  const allDefinitions = useCustomFieldDefinitionStore(state => state.definitions);
  const definitionsLoading = useCustomFieldDefinitionStore(state => state.loading);
  const definitionsError = useCustomFieldDefinitionStore(state => state.error);
  const fetchDefinitions = useCustomFieldDefinitionStore(state => state.fetchCustomFieldDefinitions);
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [hasAttemptedPersonDefinitionsFetch, setHasAttemptedPersonDefinitionsFetch] = useState(false);

  // Memoize personCustomFieldDefinitions
  const personCustomFieldDefinitions = useMemo(() => {
    console.log("[EditPersonForm] Recalculating personCustomFieldDefinitions via useMemo.");
    return allDefinitions.filter(
      d => d.entityType === 'PERSON' && d.isActive
    );
  }, [allDefinitions]); // Dependency is allDefinitions from the store

  useEffect(() => {
    if (Array.isArray(organizations) && !organizations.length && !orgLoading) {
      fetchOrganizations();
    }
    if (!definitionsLoading && !definitionsError && !hasAttemptedPersonDefinitionsFetch && !allDefinitions.some(d => d.entityType === 'PERSON')) {
      console.log("[EditPersonForm] Attempting to fetch PERSON definitions.");
      fetchDefinitions('PERSON' as CustomFieldEntityType).finally(() => {
        setHasAttemptedPersonDefinitionsFetch(true);
      });
    }
  }, [organizations, orgLoading, fetchOrganizations, definitionsLoading, definitionsError, allDefinitions, fetchDefinitions, hasAttemptedPersonDefinitionsFetch]);

  useEffect(() => {
    setFormData({
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email,
      phone: person.phone,
      notes: person.notes,
      organization_id: person.organization_id,
      customFields: [],
    });
    setLocalError(null);

    console.log('[EditPersonForm] useEffect for customFieldData triggered.');
    console.log('[EditPersonForm] person.id:', person.id);
    console.log('[EditPersonForm] person.customFieldValues:', JSON.stringify(person.customFieldValues, null, 2));
    console.log('[EditPersonForm] personCustomFieldDefinitions:', JSON.stringify(personCustomFieldDefinitions, null, 2));
    console.log('[EditPersonForm] definitionsLoading:', definitionsLoading);
    console.log('[EditPersonForm] hasAttemptedPersonDefinitionsFetch:', hasAttemptedPersonDefinitionsFetch);
    console.log('[EditPersonForm] Calculated personCustomFieldDefinitions length:', personCustomFieldDefinitions.length);

    // Condition to populate customFieldData:
    // 1. Definitions are not currently loading.
    // 2. EITHER a fetch for definitions has been attempted OR person-specific definitions are already available.
    // 3. The person object has custom field values.
    // 4. There are applicable custom field definitions to map against.
    const canPopulate = 
      !definitionsLoading && 
      (hasAttemptedPersonDefinitionsFetch || personCustomFieldDefinitions.length > 0) && 
      person.customFieldValues && 
      person.customFieldValues.length > 0 &&
      personCustomFieldDefinitions && // Ensure this isn't prematurely empty if hasAttempted is false but defs are there
      personCustomFieldDefinitions.length > 0;

    if (canPopulate) {
      console.log('[EditPersonForm] Conditions met to populate customFieldData.');
      const initialCustomData: Record<string, any> = {};
      person.customFieldValues.forEach(cfv => {
        const def = personCustomFieldDefinitions.find(d => d.id === cfv.definition?.id);
        if (def) {
          console.log(`[EditPersonForm] Found matching definition: ID=${def.id}, fieldName=${def.fieldName}, fieldType=${def.fieldType}`);
          let value: any;
          switch (def.fieldType) {
            case 'TEXT': value = cfv.stringValue; break;
            case 'NUMBER': value = cfv.numberValue; break;
            case 'BOOLEAN': value = cfv.booleanValue; break;
            case 'DATE': value = cfv.dateValue; break;
            case 'DROPDOWN': value = cfv.selectedOptionValues?.[0]; break;
            case 'MULTI_SELECT': value = cfv.selectedOptionValues; break;
            default: value = null;
          }
          if (value !== undefined && value !== null) {
            initialCustomData[def.fieldName] = value;
          }
        } else {
          console.warn(`[EditPersonForm] No matching active definition found in personCustomFieldDefinitions for cfv.definition.id: ${cfv.definition?.id}`);
        }
      });
      console.log('[EditPersonForm] Final initialCustomData to be set:', initialCustomData);
      setCustomFieldData(initialCustomData);
    } else {
      console.warn('[EditPersonForm] Conditions NOT met to populate customFieldData. Clearing. Details:',
        {
          definitionsLoading,
          hasAttemptedPersonDefinitionsFetch,
          personCustomFieldValuesCount: person.customFieldValues?.length,
          personCustomFieldDefinitionsCount: personCustomFieldDefinitions?.length
        }
      );
      setCustomFieldData({}); 
    }
  }, [person, person.customFieldValues, personCustomFieldDefinitions, definitionsLoading, hasAttemptedPersonDefinitionsFetch]);

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
      setLocalError('Must have first name, last name, or email.');
      setIsLoading(false);
      return;
    }

    let accumulatedCustomFieldErrors = '';

    const processedCustomFields: CustomFieldValueInput[] = personCustomFieldDefinitions
      .map(def => {
        let fieldHasError = false;
        const rawValue = customFieldData[def.fieldName];
        
        if (rawValue === undefined && rawValue === null && !def.isRequired) return null;

        if (def.isRequired && (rawValue === undefined || rawValue === null || String(rawValue).trim() === '')) {
            accumulatedCustomFieldErrors += `Field '${def.fieldLabel}' is required.\n`;
            fieldHasError = true;
        }
        
        const cfInput: CustomFieldValueInput = { definitionId: def.id };

        if (fieldHasError) return null;

        if (rawValue === null || rawValue === '') {
            switch (def.fieldType) {
                case 'TEXT': cfInput.stringValue = null; break;
                case 'NUMBER': cfInput.numberValue = null; break;
                case 'BOOLEAN': cfInput.booleanValue = false; break;
                case 'DATE': cfInput.dateValue = null; break;
                case 'DROPDOWN': cfInput.selectedOptionValues = null; break;
                case 'MULTI_SELECT': cfInput.selectedOptionValues = null; break;
            }
        } else if (rawValue !== undefined) {
            switch (def.fieldType) {
                case 'TEXT': cfInput.stringValue = String(rawValue); break;
                case 'NUMBER': {
                    const num = parseFloat(String(rawValue));
                    if (!isNaN(num)) {
                        cfInput.numberValue = num;
                    } else {
                        accumulatedCustomFieldErrors += `Invalid number for '${def.fieldLabel}'.\n`;
                        fieldHasError = true;
                    }
                    break;
                }
                case 'BOOLEAN': cfInput.booleanValue = Boolean(rawValue); break;
                case 'DATE': cfInput.dateValue = rawValue; break;
                case 'DROPDOWN': cfInput.selectedOptionValues = [String(rawValue)]; break;
                case 'MULTI_SELECT': 
                    cfInput.selectedOptionValues = Array.isArray(rawValue) ? rawValue.map(String) : (rawValue ? [String(rawValue)] : []);
                    break;
            }
        }
        
        if (fieldHasError) return null;
        
        return cfInput;
      })
      .filter(Boolean) as CustomFieldValueInput[];

    if (accumulatedCustomFieldErrors) {
        setLocalError(accumulatedCustomFieldErrors.trim());
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
      customFields: processedCustomFields,
    };

    try {
      const updatedPerson = await updatePersonAction(person.id, mutationInput);

      if (updatedPerson) {
        toast({
          title: 'Person Updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onSuccess();
        onClose();
      } else {
        setLocalError(peopleError || 'Failed to update person. Please try again.');
        toast({ title: 'Error', description: peopleError || 'Failed to update person.', status: 'error', duration: 5000, isClosable: true });
      }

    } catch (error: unknown) {
      console.error(`Failed to update person ${person.id}:`, error);
      let message = 'An unexpected error occurred.';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
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
            {orgError && (
                <Alert status="error" size="sm">
                    <AlertIcon />
                    {orgError}
                </Alert>
            )}
            {!orgLoading && !orgError && (
                <Select 
                    name="organization_id" 
                    value={formData.organization_id || ''} 
                    onChange={handleChange}
                    placeholder="Select organization (optional)"
                    isDisabled={!Array.isArray(organizations) || organizations.length === 0}
                >
                    {Array.isArray(organizations) && organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                </Select>
            )}
            {Array.isArray(organizations) && organizations.length === 0 && !orgLoading && <FormErrorMessage>No organizations found. Create one first.</FormErrorMessage>}
          </FormControl>
          
          <FormControl>
            <FormLabel>Notes</FormLabel>
            <Textarea name="notes" value={formData.notes || ''} onChange={handleChange} />
          </FormControl>

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
              {def.fieldType === 'MULTI_SELECT' && (
                 <Textarea
                  placeholder={`Enter values for ${def.fieldLabel}, comma-separated`}
                  value={Array.isArray(customFieldData[def.fieldName]) ? customFieldData[def.fieldName].join(', ') : (customFieldData[def.fieldName] || '')} 
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
          Update Person
        </Button>
      </ModalFooter>
    </form>
  );
}

export default EditPersonForm; 