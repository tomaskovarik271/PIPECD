import { useState, useEffect } from 'react';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
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
  AlertIcon
} from '@chakra-ui/react';

// Define the mutation for updating a Person
const UPDATE_PERSON_MUTATION = gql`
  mutation UpdatePerson($id: ID!, $input: PersonInput!) {
    updatePerson(id: $id, input: $input) {
      id # Request fields needed to update the list or confirm success
      first_name
      last_name
      email
      organization_id
    }
  }
`;

// Re-use Organization query from CreatePersonForm
const GET_ORGANIZATIONS_QUERY = gql`
  query GetOrganizations {
    organizations {
      id
      name
    }
  }
`;

// Define the input type (Person)
interface PersonInput {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  organization_id?: string | null; 
}

// Shape of the Person data passed in as a prop
interface Person {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  organization_id?: string | null;
}

// Type for Organization list items
interface OrganizationListItem {
    id: string;
    name: string;
}

// Prop definition for the component
interface EditPersonFormProps {
  person: Person; // Changed from contact
  onClose: () => void;
  onSuccess: () => void;
}

function EditPersonForm({ person, onClose, onSuccess }: EditPersonFormProps) {
  // Initialize form state with the passed person data
  const [formData, setFormData] = useState<PersonInput>({
    first_name: person.first_name,
    last_name: person.last_name,
    email: person.email,
    phone: person.phone,
    notes: person.notes,
    organization_id: person.organization_id,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState<string | null>(null);
  const toast = useToast();

  // Fetch organizations
  useEffect(() => {
    setOrgLoading(true);
    setOrgError(null);
    gqlClient.request<{ organizations: OrganizationListItem[] }>(GET_ORGANIZATIONS_QUERY)
      .then(data => {
        setOrganizations(data.organizations || []);
      })
      .catch(err => {
        console.error("Failed to fetch organizations:", err);
        setOrgError("Failed to load organizations list.");
      })
      .finally(() => {
        setOrgLoading(false);
      });
  }, []);

  // Update form state if the person prop changes (e.g., opening modal for different person)
  useEffect(() => {
      setFormData({
        first_name: person.first_name,
        last_name: person.last_name,
        email: person.email,
        phone: person.phone,
        notes: person.notes,
        organization_id: person.organization_id,
      });
  }, [person]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!formData.first_name && !formData.last_name && !formData.email) {
      toast({ title: 'Error', description: 'Must have first name, last name, or email.', status: 'error' });
      setIsLoading(false);
      return;
    }

    // Prepare input, handle null conversion
    const mutationInput: PersonInput = {
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          notes: formData.notes || null,
        organization_id: formData.organization_id || null,
    };

    try {
      await gqlClient.request(UPDATE_PERSON_MUTATION, {
        id: person.id, // Pass the ID of the person to update
        input: mutationInput, 
      });

      toast({
        title: 'Person Updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error("Failed to update person:", error);
      let errorMessage = 'An unexpected error occurred.';
      if (error.response?.errors?.[0]?.message) {
        errorMessage = error.response.errors[0].message;
         if (errorMessage.startsWith('Validation Error: ')) {
           errorMessage = errorMessage.substring('Validation Error: '.length);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({ title: 'Update Failed', description: errorMessage, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        <Stack spacing={4}>
          {/* Standard Person Fields */}
          <FormControl>
            <FormLabel>First Name</FormLabel>
            <Input name="first_name" value={formData.first_name || ''} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Last Name</FormLabel>
            <Input name="last_name" value={formData.last_name || ''} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} />
          </FormControl>
          
          {/* Organization Dropdown */}
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
                >
                    {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                </Select>
            )}
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
          Update Person
        </Button>
      </ModalFooter>
    </form>
  );
}

export default EditPersonForm; 