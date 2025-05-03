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

// Define the mutation for creating a Person
const CREATE_PERSON_MUTATION = gql`
  mutation CreatePerson($input: PersonInput!) {
    createPerson(input: $input) {
      id
      first_name
      last_name
      email
      organization_id
    }
  }
`;

// Define the query to fetch organizations for the dropdown
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

// Define the type for the Organization query result
interface OrganizationListItem {
    id: string;
    name: string;
}

// Prop definition for the component
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
    organization_id: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState<string | null>(null);
  const toast = useToast();

  // Fetch organizations on component mount
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation (already present)
    if (!formData.first_name && !formData.last_name && !formData.email) {
      toast({
        title: 'Error',
        description: 'Please provide at least a first name, last name, or email.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    // Prepare input, ensuring empty string for org becomes null
    const mutationInput: PersonInput = {
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          notes: formData.notes || null,
        organization_id: formData.organization_id || null,
    };

    try {
      await gqlClient.request(CREATE_PERSON_MUTATION, {
        input: mutationInput,
      });

      toast({
        title: 'Person Created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error("Failed to create person:", error);
      let errorMessage = 'An unexpected error occurred.';
      if (error.response?.errors?.[0]?.message) {
        errorMessage = error.response.errors[0].message;
        // Attempt to parse Zod errors (already present)
         if (errorMessage.startsWith('Validation Error: ')) {
           errorMessage = errorMessage.substring('Validation Error: '.length);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Creation Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        <Stack spacing={4}>
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
          Save Person
        </Button>
      </ModalFooter>
    </form>
  );
}

export default CreatePersonForm; 