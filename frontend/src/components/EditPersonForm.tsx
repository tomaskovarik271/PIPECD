import React, { useState, useEffect } from 'react';
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
  FormErrorMessage // Added for form validation display
} from '@chakra-ui/react';
import { useAppStore } from '../stores/useAppStore'; // Import store
import { usePeopleStore, Person } from '../stores/usePeopleStore'; // ADDED for people actions/error and Person type
import { useOrganizationsStore } from '../stores/useOrganizationsStore'; // CORRECTED PATH
import type { /* Organization, REMOVED */ PersonInput } from '../generated/graphql/graphql'; // Keep other types

// Define the mutation for updating a Person - REMOVED (Handled by store action)
// const UPDATE_PERSON_MUTATION = gql` ... `;

// Re-use Organization query from CreatePersonForm - REMOVED (Handled by store)
// const GET_ORGANIZATIONS_QUERY = gql` ... `;

// Define the input type (Person) - REMOVED (Using generated PersonInput)
// interface PersonInput { ... }

// Shape of the Person data passed in as a prop - REMOVED (Using generated Person)
// interface Person { ... }

// Type for Organization list items - REMOVED (Using generated Organization)
// interface OrganizationListItem { ... }

// Prop definition for the component
interface EditPersonFormProps {
  person: Person; // Use Person type from usePeopleStore
  onClose: () => void;
  onSuccess: () => void;
}

const EditPersonForm: React.FC<EditPersonFormProps> = ({ person, onClose, onSuccess }) => {
  // Initialize form state with the passed person data, using generated PersonInput
  const [formData, setFormData] = useState<PersonInput>({
    first_name: person.first_name,
    last_name: person.last_name,
    email: person.email,
    phone: person.phone,
    notes: person.notes,
    organization_id: person.organization_id,
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Get organizations and related state from the store
  // const organizations = useAppStore((state) => state.organizations); // REMOVE
  // const orgLoading = useAppStore((state) => state.organizationsLoading); // REMOVE
  // const orgError = useAppStore((state) => state.organizationsError); // REMOVE
  // const fetchOrganizations = useAppStore((state) => state.fetchOrganizations); // REMOVE
  const { 
    organizations, 
    organizationsLoading: orgLoading, // alias to keep variable name consistent 
    organizationsError: orgError, // alias
    fetchOrganizations 
  } = useOrganizationsStore(); // USE THIS

  // People actions/error from usePeopleStore
  const { updatePerson: updatePersonAction, peopleError } = usePeopleStore(); // ADDED
  
  const [localError, setLocalError] = useState<string | null>(null); // For form validation errors

  // Fetch organizations if not already loaded
  useEffect(() => {
    // Add Array.isArray check for safety, though store should init with []
    if (Array.isArray(organizations) && !organizations.length && !orgLoading) {
      fetchOrganizations();
    }
  }, [organizations, orgLoading, fetchOrganizations]);

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
      setLocalError(null); // Clear errors when person changes
      setIsLoading(false); // Reset loading state
  }, [person]);

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
    setLocalError(null); // Clear local errors
    // useAppStore.setState({ peopleError: null }); // Clear global error before attempt if it was set there

    // Basic validation
    if (!formData.first_name && !formData.last_name && !formData.email) {
      setLocalError('Must have first name, last name, or email.');
      setIsLoading(false);
      return;
    }

    // Prepare input using generated PersonInput type
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
        // Use peopleError from usePeopleStore for the error message
        setLocalError(peopleError || 'Failed to update person. Please try again.');
        toast({ title: 'Error', description: peopleError || 'Failed to update person.', status: 'error', duration: 5000, isClosable: true });
      }

    } catch (error: unknown) {
      // Catch unexpected errors during the action call itself
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
        {/* Display local form error or store error */} 
        {(localError || peopleError) && (
             <Alert status="error" mb={4} whiteSpace="pre-wrap">
                <AlertIcon />
                {localError || peopleError}
            </Alert>
          )}
        <Stack spacing={4}>
          {/* Standard Person Fields */}
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
                    isDisabled={!Array.isArray(organizations) || organizations.length === 0}
                >
                    {/* organizations from store is already GeneratedOrganization[] */} 
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