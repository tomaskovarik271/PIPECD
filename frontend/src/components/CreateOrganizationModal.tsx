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
  Textarea, // Use Textarea for notes
  VStack,
  FormErrorMessage,
  Alert, 
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';

// Define GraphQL Mutation for creating an organization
const CREATE_ORGANIZATION_MUTATION = gql`
  mutation CreateOrganization($input: OrganizationInput!) {
    createOrganization(input: $input) {
      id # Request fields needed after creation
      name
      address
      notes
      created_at
      updated_at
    }
  }
`;

// Define the expected shape of the mutation result
interface CreateOrganizationMutationResult {
    createOrganization: {
        id: string;
        // Include other fields returned by mutation if needed
    };
}

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrganizationCreated: () => void; // Callback to refresh list
}

function CreateOrganizationModal({ isOpen, onClose, onOrganizationCreated }: CreateOrganizationModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setAddress('');
      setNotes('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!name.trim()) {
        setError('Organization name is required.');
        setIsLoading(false);
        return;
    }

    try {
        const variables = {
            input: {
                name: name.trim(),
                address: address.trim() || null, // Send null if empty
                notes: notes.trim() || null,     // Send null if empty
            },
        };

        console.log('Submitting variables:', variables);

        // Call the mutation using gqlClient
        const result = await gqlClient.request<CreateOrganizationMutationResult>(
            CREATE_ORGANIZATION_MUTATION, 
            variables
        );
        console.log('Organization created:', result);

        // Success
        onOrganizationCreated(); // Trigger refresh on the parent page
        onClose();             // Close the modal

    } catch (err: any) {
      console.error('Error creating organization:', err);
      const gqlError = err.response?.errors?.[0]?.message;
      const validationError = err.response?.errors?.[0]?.extensions?.originalError?.message;
      setError(validationError || gqlError || err.message || 'Failed to create organization');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Create New Organization</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {error && (
             <Alert status="error" mb={4} whiteSpace="pre-wrap">
                <AlertIcon />
                {error}
            </Alert>
          )}
          <VStack spacing={4}>
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
            Save Organization
          </Button>
          <Button variant='ghost' onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateOrganizationModal; 