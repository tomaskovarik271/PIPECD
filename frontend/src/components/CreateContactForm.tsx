import { useState } from 'react';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  ModalBody,
  ModalFooter,
  Stack,
  Textarea,
  useToast, // For showing success/error messages
} from '@chakra-ui/react'; // Assuming Chakra UI is installed as per ADR

// Define the mutation
const CREATE_CONTACT_MUTATION = gql`
  mutation CreateContact($input: ContactInput!) {
    createContact(input: $input) {
      id
      first_name
      last_name
      email
    }
  }
`;

// Define the input type (mirroring GraphQL schema)
interface ContactInput {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
}

// Prop definition for the component
interface CreateContactFormProps {
  onClose: () => void; // Function to close the modal
  onSuccess: () => void; // Function to call after successful creation (e.g., refresh list)
}

function CreateContactForm({ onClose, onSuccess }: CreateContactFormProps) {
  const [formData, setFormData] = useState<ContactInput>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple validation (can be expanded)
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

    try {
      await gqlClient.request(CREATE_CONTACT_MUTATION, {
        input: {
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          company: formData.company || null,
          notes: formData.notes || null,
        },
      });

      toast({
        title: 'Contact Created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess(); // Call the success callback (e.g., refetch contacts)
      onClose(); // Close the modal

    } catch (error: any) {
      console.error("Failed to create contact:", error);
      // Extract a user-friendly message from the GraphQL error response
      let errorMessage = 'An unexpected error occurred.';
      if (error.response?.errors?.[0]?.message) {
        // Attempt to use the message from the first GraphQL error
        errorMessage = error.response.errors[0].message;
        // If it looks like stringified JSON from Zod, try to parse and format
        if (errorMessage.startsWith('[') && errorMessage.endsWith(']')) {
          try {
            const zodErrors = JSON.parse(errorMessage);
            if (Array.isArray(zodErrors) && zodErrors[0]?.message) {
              // Use the message from the first Zod issue
              errorMessage = zodErrors[0].message;
            }
          } catch (parseError) {
            // Ignore if parsing fails, stick with the raw stringified JSON
            console.warn('Could not parse error message JSON:', parseError);
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Creation Failed',
        description: errorMessage, // Use the extracted message
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
            <FormLabel>Company</FormLabel>
            <Input name="company" value={formData.company || ''} onChange={handleChange} />
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
          Save Contact
        </Button>
      </ModalFooter>
    </form>
  );
}

export default CreateContactForm; 