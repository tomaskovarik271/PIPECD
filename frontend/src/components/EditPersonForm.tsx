import React, { useState, useEffect, useMemo, useRef } from 'react';
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

  // Custom fields hook
  const {
    definitions,
    loading: customFieldsLoading,
    error: customFieldsError,
    getDefinitionsForEntity,
    refetch: refetchCustomFields
  } = useOptimizedCustomFields({ entityTypes: ['PERSON' as CustomFieldEntityType] });
  
  const customFieldDefinitions = useMemo(() => 
    getDefinitionsForEntity('PERSON' as CustomFieldEntityType), 
    [getDefinitionsForEntity]
  );

  const hasFetchedOrgs = useRef(false);

  useEffect(() => {
    if (!orgLoading && (!organizations || organizations.length === 0) && !hasFetchedOrgs.current) {
      hasFetchedOrgs.current = true;
      fetchOrganizations();
    }
  }, [orgLoading, organizations]);

  // Initialize custom field data from person
  useEffect(() => {
    if (person.customFieldValues && customFieldDefinitions.length > 0) {
      const initializedData = initializeCustomFieldValuesFromEntity(
        customFieldDefinitions,
        person.customFieldValues
      );
      setCustomFieldData(initializedData);
    }
  }, [person.customFieldValues, customFieldDefinitions]);

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
      setLocalError('Please provide at least a first name, last name, or email.');
      setIsLoading(false);
      return;
    }

    try {
      // Process custom fields
      const processedCustomFields = processCustomFieldsForSubmission(
        customFieldDefinitions,
        customFieldData
      );

      const mutationInput: PersonInput = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        notes: formData.notes || null,
        organization_id: formData.organization_id || null,
        customFields: processedCustomFields.length > 0 ? processedCustomFields : null,
      };

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
                {organizations && organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </Select>
            )}
          </FormControl>
          
          <FormControl>
            <FormLabel>Notes</FormLabel>
            <Textarea name="notes" value={formData.notes || ''} onChange={handleChange} />
          </FormControl>

          {/* Custom Fields */}
          {customFieldsLoading && <Spinner />}
          {customFieldsError && (
            <Alert status="error">
              <AlertIcon />
              Error loading custom fields: {customFieldsError}
            </Alert>
          )}
          {!customFieldsLoading && !customFieldsError && customFieldDefinitions.length > 0 && (
            <>
              <Text fontSize="lg" fontWeight="semibold" color="gray.700" mt={6}>Custom Fields</Text>
              {customFieldDefinitions.map((def) => (
                <CustomFieldRenderer
                  key={def.id}
                  definition={def}
                  value={customFieldData[def.fieldName]}
                  onChange={(value) => handleCustomFieldChange(def.fieldName, value)}
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
};

export default EditPersonForm; 