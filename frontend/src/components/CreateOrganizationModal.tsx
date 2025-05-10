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
  useToast
} from '@chakra-ui/react';
import { useOrganizationsStore } from '../stores/useOrganizationsStore';
import type { OrganizationInput } from '../generated/graphql/graphql';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrganizationCreated: () => void;
}

function CreateOrganizationModal({ isOpen, onClose, onOrganizationCreated }: CreateOrganizationModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const toast = useToast();

  const { 
    createOrganization: createOrganizationAction, 
    organizationsError: storeError, 
    organizationsLoading: storeLoading 
  } = useOrganizationsStore();

  useEffect(() => {
    if (isOpen) {
      setName('');
      setAddress('');
      setNotes('');
      setLocalError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    if (!name.trim()) {
        setLocalError('Organization name is required.');
        setIsLoading(false);
        return;
    }

    try {
        const input: OrganizationInput = {
            name: name.trim(),
            address: address.trim() || null,
            notes: notes.trim() || null,
        };

        console.log('Submitting input:', input);

        const createdOrg = await createOrganizationAction(input);
        
        if (createdOrg) {
            console.log('Organization created:', createdOrg);
            toast({ 
                title: 'Organization Created', 
                status: 'success', 
                duration: 3000, 
                isClosable: true 
            });
            onOrganizationCreated();
            onClose();
        } else {
             setLocalError(storeError || 'Failed to create organization.');
        }

    } catch (err: unknown) {
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