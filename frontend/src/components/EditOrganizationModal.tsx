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
import { useOrganizationsStore, Organization, OrganizationInput } from '../stores/useOrganizationsStore';

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrganizationUpdated: () => void;
  organization: Organization | null;
}

function EditOrganizationModal({ isOpen, onClose, onOrganizationUpdated, organization }: EditOrganizationModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    updateOrganization: updateOrganizationAction, 
    organizationsError: storeError, 
    organizationsLoading: storeLoading 
  } = useOrganizationsStore();

  useEffect(() => {
    if (organization) {
      setName(organization.name || '');
      setAddress(organization.address || '');
      setNotes(organization.notes || '');
      setError(null);
      setIsLoading(false);
    } else {
        setName('');
        setAddress('');
        setNotes('');
    }
  }, [organization]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!organization) return;

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

      const updatedOrg = await updateOrganizationAction(organization.id, input);
      
      if (updatedOrg) {
        console.log('Organization updated:', updatedOrg);

        onOrganizationUpdated();
        onClose();
      } else {
        setError(storeError || 'Failed to update organization.');
      }

    } catch (err: unknown) {
      console.error('Error updating organization (component catch):', err);
      let message = 'Failed to update organization';
      if (err instanceof Error) {
        const gqlError = (err as any).response?.errors?.[0]?.message;
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
            isLoading={isLoading || storeLoading}
            leftIcon={(isLoading || storeLoading) ? <Spinner size="sm" /> : undefined}
          >
            Save Changes
          </Button>
          <Button variant='ghost' onClick={onClose} isDisabled={isLoading || storeLoading}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditOrganizationModal; 