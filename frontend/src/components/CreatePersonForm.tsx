import React, { useState, useEffect } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Stack,
  Alert,
  AlertIcon,
  FormErrorMessage,
  useToast,
  Text,
  Spinner,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import {
  PersonInput,
  CustomFieldValueInput,
  CustomFieldDefinition,
  CustomFieldEntityType,
} from '../generated/graphql/graphql';
import { usePeopleStore } from '../stores/usePeopleStore';
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';
import { CREATE_PERSON_ORGANIZATION_ROLE } from '../lib/graphql/personOrganizationRoleOperations';
import { CustomFieldRenderer } from './common/CustomFieldRenderer';
import { processCustomFieldsForSubmission } from '../lib/utils/customFieldProcessing';

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
    customFields: [],
  });

  // Separate state for organization selection
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('');

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
  
  // GraphQL mutation for creating organization role
  const [createPersonOrganizationRole] = useMutation(CREATE_PERSON_ORGANIZATION_ROLE);
  
  const allDefinitions = useCustomFieldDefinitionStore(state => state.definitions);
  const definitionsLoading = useCustomFieldDefinitionStore(state => state.loading);
  const fetchDefinitions = useCustomFieldDefinitionStore(state => state.fetchCustomFieldDefinitions);

  const [localError, setLocalError] = useState<string | null>(null);

  const personCustomFieldDefinitions = allDefinitions.filter(
    d => d.entityType === 'PERSON' && d.isActive
  );

  useEffect(() => {
    if (!orgLoading && (!organizations || organizations.length === 0)) {
      fetchOrganizations();
    }
    if (!definitionsLoading && !allDefinitions.some(d => d.entityType === 'PERSON')) {
      fetchDefinitions('PERSON' as CustomFieldEntityType);
    }
  }, [organizations, orgLoading, fetchOrganizations, definitionsLoading, allDefinitions, fetchDefinitions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrganizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOrganizationId(e.target.value);
  };

  const handleCustomFieldChange = (fieldName: string, value: string | number | boolean | string[] | null | undefined) => {
    setCustomFieldData(prev => ({
      ...prev,
      [fieldName]: value || '',
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

    // Process custom fields using utility function
    const processedCustomFields = processCustomFieldsForSubmission(
      personCustomFieldDefinitions,
      customFieldData
    );
      
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
      // Create person
      const createdPerson = await createPersonAction(mutationInput);
      if (!createdPerson) {
        setLocalError(peopleError || 'Failed to create person. Please try again.');
        setIsLoading(false);
        return;
      }

      // Create organization role if organization is selected
      if (selectedOrganizationId && createdPerson) {
        try {
          await createPersonOrganizationRole({
            variables: {
              personId: createdPerson.id,
              input: {
                organization_id: selectedOrganizationId,
                role_title: 'Contact', // Default role title
                is_primary: false, // Don't automatically make it primary
                status: 'active'
              }
            }
          });
        } catch (roleError) {
          console.error('Error creating organization role:', roleError);
          // Person was created successfully, just show a warning about the role
          toast({
            title: 'Person created with warning',
            description: 'Person was created but organization role could not be set. You can add it manually.',
            status: 'warning',
            duration: 5000,
          });
        }
      }

      toast({ 
        title: 'Person Created', 
        description: 'Person has been created successfully.',
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
                value={selectedOrganizationId}
                onChange={handleOrganizationChange}
                placeholder="Select organization (optional)"
                isDisabled={orgLoading || !organizations || organizations.length === 0}
              >
                {organizations && organizations.map((org: Organization) => (
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
          {personCustomFieldDefinitions.length > 0 && (
            <>
              <Text fontSize="lg" fontWeight="semibold" color="gray.700" mt={6}>Custom Fields</Text>
              {personCustomFieldDefinitions.map((definition: CustomFieldDefinition) => (
                <CustomFieldRenderer
                  key={definition.id}
                  definition={definition}
                  value={customFieldData[definition.fieldName]}
                  onChange={(value) => handleCustomFieldChange(definition.fieldName, value)}
                  isRequired={definition.isRequired}
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
          Save Person
        </Button>
      </ModalFooter>
    </form>
  );
}

export default CreatePersonForm; 