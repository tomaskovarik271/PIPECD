import { useState, useEffect } from 'react';
// import { gql } from '@apollo/client'; // No longer needed
// import { gqlClient } from '../lib/graphqlClient'; // No longer needed
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
import { useAppStore } from '../stores/useAppStore'; // Import store
import type { PersonInput } from '../generated/graphql/graphql'; // Import generated types, removed Organization

// Define the mutation for creating a Person - REMOVED (Handled by store action)
// const CREATE_PERSON_MUTATION = gql` ... `;

// Define the query to fetch organizations for the dropdown - REMOVED (Handled by store/page)
// const GET_ORGANIZATIONS_QUERY = gql` ... `;

// Define the input type (Person) - REMOVED (Using generated PersonInput)
// interface PersonInput { ... }

// Define the type for the Organization query result - REMOVED (Using generated Organization)
// interface OrganizationListItem { ... }

// Prop definition for the component
interface CreatePersonFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreatePersonForm({ onClose, onSuccess }: CreatePersonFormProps) {
  // Use generated PersonInput for formData state
  const [formData, setFormData] = useState<PersonInput>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    notes: '',
    organization_id: null, // Use null for optional ID
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Get organizations and related state from the store
  const organizations = useAppStore((state) => state.organizations);
  const orgLoading = useAppStore((state) => state.organizationsLoading);
  const orgError = useAppStore((state) => state.organizationsError);
  const fetchOrganizations = useAppStore((state) => state.fetchOrganizations);
  // Get the create action from the store
  const createPersonAction = useAppStore((state) => state.createPerson);
  // Get specific person error state from store
  const personError = useAppStore((state) => state.peopleError); 
  const [localError, setLocalError] = useState<string | null>(null); // For form validation errors

  // Fetch organizations if not already loaded (e.g., if accessed directly)
  useEffect(() => {
    // Simple check, might need refinement based on how orgs are loaded globally
    if (!organizations.length && !orgLoading) {
      fetchOrganizations(); 
    }
  }, [organizations, orgLoading, fetchOrganizations]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Handle optional organization_id: set to null if empty string selected
    if (name === 'organization_id' && value === '') {
        setFormData(prev => ({ ...prev, [name]: null }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null); // Clear local form errors
    // Reset store error for this action specifically?
    // useAppStore.setState({ peopleError: null }); // Optional: Reset store error before action

    // Basic validation
    if (!formData.first_name && !formData.last_name && !formData.email) {
      setLocalError('Please provide at least a first name, last name, or email.');
      setIsLoading(false);
      return;
    }

    // Prepare input, ensuring empty strings become null (already handled by generated type structure and handleChange)
    const mutationInput: PersonInput = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        notes: formData.notes || null,
        organization_id: formData.organization_id || null,
    };

    try {
      // Call the store action
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
        // Error should be set in the store's peopleError state by the action
        // Display the store error
        setLocalError(useAppStore.getState().peopleError || 'Failed to create person. Please try again.');
      }
    } catch (error: unknown) {
      // Catch unexpected errors during the action call itself
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
        {/* Display local form error or store error */} 
        {(localError || personError) && (
             <Alert status="error" mb={4} whiteSpace="pre-wrap">
                <AlertIcon />
                {localError || personError}
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
                    value={formData.organization_id || ''} // Handle null value for placeholder
                    onChange={handleChange}
                    placeholder="Select organization (optional)"
                    isDisabled={organizations.length === 0}
                >
                    {/* organizations from store is already GeneratedOrganization[] */} 
                    {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                </Select>
            )}
            {organizations.length === 0 && !orgLoading && <FormErrorMessage>No organizations found. Create one first.</FormErrorMessage>}
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