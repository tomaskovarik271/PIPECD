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
  useToast // Added for success message
} from '@chakra-ui/react';
// import { gql } from 'graphql-request'; // No longer needed
// import { gqlClient } from '../lib/graphqlClient'; // No longer needed
import { useOrganizationsStore } from '../stores/useOrganizationsStore'; // ADDED
import type { OrganizationInput } from '../generated/graphql/graphql'; // Import generated type

// Define GraphQL Mutation for creating an organization - REMOVED (Handled by store action)
// const CREATE_ORGANIZATION_MUTATION = gql` ... `;

// Define the expected shape of the mutation result - REMOVED (Handled by store action)
// interface CreateOrganizationMutationResult { ... }

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
  const [localError, setLocalError] = useState<string | null>(null); // For local validation
  const toast = useToast();

  // Get store action and error state from useOrganizationsStore
  const { 
    createOrganization: createOrganizationAction, 
    organizationsError: storeError, 
    organizationsLoading: storeLoading 
  } = useOrganizationsStore();

  // Effect to reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setAddress('');
      setNotes('');
      setLocalError(null);
      // Optionally reset store error? Maybe not here, let action handle it.
      // useAppStore.setState({ organizationsError: null });
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    // Basic validation
    if (!name.trim()) {
        setLocalError('Organization name is required.');
        setIsLoading(false);
        return;
    }

    try {
        // Prepare input using generated type
        const input: OrganizationInput = {
            name: name.trim(),
            address: address.trim() || null, // Send null if empty
            notes: notes.trim() || null,     // Send null if empty
        };

        console.log('Submitting input:', input);

        // Call the store action
        const createdOrg = await createOrganizationAction(input);
        
        if (createdOrg) {
            console.log('Organization created:', createdOrg);
            toast({ 
                title: 'Organization Created', 
                status: 'success', 
                duration: 3000, 
                isClosable: true 
            });
            // Success
            onOrganizationCreated(); // Trigger refresh on the parent page
            onClose();             // Close the modal
        } else {
            // Error should be in storeError
             setLocalError(storeError || 'Failed to create organization.');
        }

    } catch (err: unknown) {
      // Catch unexpected errors during the action call itself
      console.error('Error creating organization:', err);
      let message = 'An unexpected error occurred.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setLocalError(message);
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
          {/* Display local or store error */} 
          {(localError || storeError) && (
             <Alert status="error" mb={4} whiteSpace="pre-wrap">
                <AlertIcon />
                {localError || storeError}
            </Alert>
          )}
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!!localError && localError.includes('name')}>
              <FormLabel>Organization Name</FormLabel>
              <Input 
                placeholder='Enter organization name' 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {!!localError && localError.includes('name') && <FormErrorMessage>{localError}</FormErrorMessage>}
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
            isLoading={isLoading || storeLoading}
            leftIcon={(isLoading || storeLoading) ? <Spinner size="sm" /> : undefined}
          >
            Save Organization
          </Button>
          <Button variant='ghost' onClick={onClose} isDisabled={isLoading || storeLoading}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateOrganizationModal; 