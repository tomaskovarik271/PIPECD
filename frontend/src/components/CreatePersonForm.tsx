import { useState, useEffect } from 'react';
import {
  Button,
  FormControl,
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
  FormErrorMessage
} from '@chakra-ui/react';
import type { PersonInput } from '../generated/graphql/graphql';
import { usePeopleStore } from '../stores/usePeopleStore';
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore';

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
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const { 
    organizations, 
    organizationsLoading: orgLoading, 
    organizationsError: orgError, 
    fetchOrganizations 
  } = useOrganizationsStore();
  
  const { createPerson: createPersonAction, peopleError } = usePeopleStore(); 

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch organizations if the list is empty and not already loading.
    // This ensures the dropdown is populated.
    if (!orgLoading && (!organizations || organizations.length === 0)) {
      fetchOrganizations(); 
    }
  }, [organizations, orgLoading, fetchOrganizations]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'organization_id' && value === '') {
        setFormData(prev => ({ ...prev, [name]: null }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
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

    const mutationInput: PersonInput = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        notes: formData.notes || null,
        organization_id: formData.organization_id || null,
    };

    try {
      const createdPerson = await createPersonAction(mutationInput);

      if (createdPerson) {
        toast({
          title: 'Person Created',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onSuccess();
        onClose();
      } else {
        // Use peopleError from the store if available, otherwise a generic message.
        setLocalError(peopleError || 'Failed to create person. Please try again.');
      }
    } catch (error: unknown) {
      console.error("Unexpected error during handleSubmit:", error);
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
        {/* Display localError first if it exists, then fallback to peopleError */}
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
            {/* Ensure FormErrorMessage is shown only when the specific validation fails */}
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
                    // Disable if no orgs or if orgs are present but empty (e.g. after a filter with no results in future)
                    isDisabled={orgLoading || !organizations || organizations.length === 0}
                >
                    {/* Ensure organizations is not null before mapping */}
                    {organizations && organizations.map((org: Organization) => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                </Select>
            )}
            {/* Show message if explicitly no orgs and not loading, or if there was an error fetching them */}
            {(!orgLoading && (orgError || (!organizations || organizations.length === 0))) && 
              <FormErrorMessage>
                {orgError ? "Could not load organizations." : "No organizations found. Create one first."}
              </FormErrorMessage>
            }
          </FormControl>
          <FormControl>
            <FormLabel>Notes</FormLabel>
            <Textarea name="notes" value={formData.notes || ''} onChange={handleChange} />
          </FormControl>
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