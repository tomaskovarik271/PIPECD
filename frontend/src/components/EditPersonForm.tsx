import React, { useState, useEffect, useMemo } from 'react';
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
} from '@chakra-ui/react';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useOrganizationsStore } from '../stores/useOrganizationsStore';
import type {
  PersonInput,
  CustomFieldValueInput,
  CustomFieldEntityType,
} from '../generated/graphql/graphql';
import { useOptimizedCustomFields } from '../hooks/useOptimizedCustomFields';
import { CustomFieldRenderer } from './common/CustomFieldRenderer';
import { 
  initializeCustomFieldValuesFromEntity,
  processCustomFieldsForSubmission
} from '../lib/utils/customFieldProcessing';

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
  
  const [localError, setLocalError] = useState<string | null>(null);

  // Use optimized custom fields hook
  const { 
    definitions, 
    loading: definitionsLoading, 
    error: definitionsError,
    getDefinitionsForEntity
  } = useOptimizedCustomFields({ entityTypes: useMemo(() => ['PERSON' as CustomFieldEntityType], []) });

  const personCustomFieldDefinitions = getDefinitionsForEntity('PERSON' as CustomFieldEntityType);

  useEffect(() => {
    if (Array.isArray(organizations) && !organizations.length && !orgLoading) {
      fetchOrganizations();
    }
  }, [organizations, orgLoading, fetchOrganizations]);

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

    // Initialize custom field data using shared utility
    if (person && person.customFieldValues && personCustomFieldDefinitions.length > 0 && !definitionsLoading) {
      const initialCustomData = initializeCustomFieldValuesFromEntity(
        personCustomFieldDefinitions,
        person.customFieldValues
      );
      setCustomFieldData(initialCustomData);
    } else {
      setCustomFieldData({});
    }
  }, [person, person.customFieldValues, personCustomFieldDefinitions, definitionsLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'organization_id' && value === '') {
        setFormData(prev => ({ ...prev, [name]: null }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFieldData(prev => ({
      ...prev,
      [fieldName]: value,
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

    // Process custom fields using shared utility
    try {
      const processedCustomFields = processCustomFieldsForSubmission(
        personCustomFieldDefinitions,
        customFieldData
      );

      const mutationInput: PersonInput = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        notes: formData.notes || null,
        organization_id: formData.organization_id || null,
        customFields: processedCustomFields,
      };

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
        toast({ 
          title: 'Error', 
          description: peopleError || 'Failed to update person.', 
          status: 'error', 
          duration: 5000, 
          isClosable: true 
        });
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
      toast({ 
        title: 'Error', 
        description: message, 
        status: 'error', 
        duration: 5000, 
        isClosable: true 
      });
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

          {/* Custom Fields Section */}
          {definitionsLoading && <Spinner />}
          {definitionsError && (
            <Alert status="error">
              <AlertIcon />
              Error loading custom fields: {definitionsError}
            </Alert>
          )}
          
          {!definitionsLoading && !definitionsError && personCustomFieldDefinitions.length > 0 && (
            <>
              {personCustomFieldDefinitions.map((def) => (
                <CustomFieldRenderer
                  key={def.id}
                  definition={def}
                  value={customFieldData[def.fieldName]}
                  onChange={(value) => handleCustomFieldChange(def.fieldName, value)}
                  isRequired={def.isRequired}
                />
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
}

export default EditPersonForm; 