import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  FormErrorMessage,
  Alert, 
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import { useAppStore, Organization, OrganizationInput } from '../stores/useAppStore';

// Interface for the Organization data passed to the modal
// interface OrganizationToEdit {
//   id: string;
//   name: string;
//   address?: string | null;
//   notes?: string | null;
//   // Add other fields if needed
// }

// Define GraphQL Mutation for updating an organization
// const UPDATE_ORGANIZATION_MUTATION = gql`
//   mutation UpdateOrganization($id: ID!, $input: OrganizationInput!) {
//     updateOrganization(id: $id, input: $input) {
//       id # Request fields needed after update
//       name
//       address
//       notes
//       updated_at # Get updated timestamp
//     }
//   }
// `;

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrganizationUpdated: () => void; // Callback to refresh list
  organization: Organization | null; // Use imported Organization type
}

function EditOrganizationModal({ isOpen, onClose, onOrganizationUpdated, organization }: EditOrganizationModalProps) {
  // Form state, initialized from the organization prop
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateOrganizationAction = useAppStore((state) => state.updateOrganization);
  const storeError = useAppStore((state) => state.organizationsError); // For potential errors from the store action

  // Effect to update form state when the organization prop changes
  useEffect(() => {
    if (organization) {
      setName(organization.name || '');
      setAddress(organization.address || '');
      setNotes(organization.notes || '');
      setError(null); // Clear previous errors when opening with new data
      setIsLoading(false); // Reset loading state
    } else {
        // Reset form if organization becomes null (e.g., modal closes unexpectedly)
        setName('');
        setAddress('');
        setNotes('');
    }
  }, [organization]); // Runs when the organization prop changes

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!organization) return; // Should not happen if modal is open with data

    setIsLoading(true);
    setError(null);

    if (!name.trim()) {
      setError('Organization name is required.');
      setIsLoading(false);
      return;
    }

    try {
      const input: OrganizationInput = {
        name: name.trim(),
        address: address.trim() || null,
        notes: notes.trim() || null,
      };

      console.log('Submitting update input:', input);

      // Call the update mutation - OLD WAY
      // const result = await gqlClient.request(UPDATE_ORGANIZATION_MUTATION, variables);
      const updatedOrg = await updateOrganizationAction(organization.id, input); // USE STORE ACTION
      
      if (updatedOrg) { // Check if store action was successful
        console.log('Organization updated:', updatedOrg);

        // Success
        onOrganizationUpdated(); // Trigger refresh
        onClose();               // Close modal
      } else {
        // Error is likely in storeError now
        setError(storeError || 'Failed to update organization.');
      }

    } catch (err: unknown) { // Changed from any to unknown
      console.error('Error updating organization (component catch):', err);
      let message = 'Failed to update organization';
      if (err instanceof Error) {
        // Check for GraphQL-like error structure on the Error object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gqlError = (err as any).response?.errors?.[0]?.message;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validationError = (err as any).response?.errors?.[0]?.extensions?.originalError?.message;
        message = validationError || gqlError || err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Render null if the modal shouldn't be open or no organization is provided
  if (!isOpen || !organization) {
      return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Edit Organization: {organization.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {error && (
             <Alert status="error" mb={4} whiteSpace="pre-wrap">
                <AlertIcon />
                {error}
            </Alert>
          )}
          <VStack spacing={4}>
            {/* Form Controls using state initialized by useEffect */}
            <FormControl isRequired isInvalid={!name.trim() && error?.includes('name')}>
              <FormLabel>Organization Name</FormLabel>
              <Input 
                placeholder='Enter organization name' 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {!name.trim() && error?.includes('name') && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input 
                placeholder='Enter address (optional)' 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea
                placeholder='Enter notes (optional)' 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </FormControl>

          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button 
            colorScheme='blue'
            mr={3} 
            type="submit" 
            isLoading={isLoading}
            leftIcon={isLoading ? <Spinner size="sm" /> : undefined}
          >
            Save Changes
          </Button>
          <Button variant='ghost' onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditOrganizationModal; 