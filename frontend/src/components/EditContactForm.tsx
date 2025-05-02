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
  Stack,
  Textarea,
  useToast,
} from '@chakra-ui/react';

// Define the mutation
const UPDATE_CONTACT_MUTATION = gql`
  mutation UpdateContact($id: ID!, $input: ContactInput!) {
    updateContact(id: $id, input: $input) {
      id # Request updated fields if needed
      updated_at
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

// Define the contact type passed in props
interface Contact {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
}

// Prop definition for the component
interface EditContactFormProps {
  contact: Contact; // The contact object to edit
  onClose: () => void;
  onSuccess: () => void;
}

function EditContactForm({ contact, onClose, onSuccess }: EditContactFormProps) {
  const [formData, setFormData] = useState<ContactInput>({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Pre-populate form data when contact prop changes
  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        notes: contact.notes,
      });
    }
  }, [contact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Add validation if needed (similar to create form)
    if (!formData.first_name && !formData.last_name && !formData.email) {
      toast({ title: 'Error', description: 'At least name or email required.', status: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      await gqlClient.request(UPDATE_CONTACT_MUTATION, {
        id: contact.id, // Pass the contact ID
        input: { // Pass only the fields that can be updated
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          company: formData.company || null,
          notes: formData.notes || null,
        },
      });

      toast({ title: 'Contact Updated', status: 'success' });
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error("Failed to update contact:", error);
      // Extract a user-friendly message from the GraphQL error response
      let errorMessage = 'An unexpected error occurred.';
      if (error.response?.errors?.[0]?.message) {
        errorMessage = error.response.errors[0].message;
        if (errorMessage.startsWith('[') && errorMessage.endsWith(']')) {
          try {
            const zodErrors = JSON.parse(errorMessage);
            if (Array.isArray(zodErrors) && zodErrors[0]?.message) {
              errorMessage = zodErrors[0].message;
            }
          } catch (parseError) {
            console.warn('Could not parse error message JSON:', parseError);
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({ 
        title: 'Update Failed', 
        description: errorMessage, // Use extracted message
        status: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        <Stack spacing={4}>
          {/* FormControls similar to CreateContactForm */}
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
          Save Changes
        </Button>
      </ModalFooter>
    </form>
  );
}

export default EditContactForm; 