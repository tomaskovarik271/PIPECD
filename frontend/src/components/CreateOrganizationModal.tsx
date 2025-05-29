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
  useToast,
  Box,
  Text
} from '@chakra-ui/react';
import { useOrganizationsStore } from '../stores/useOrganizationsStore';
import { useOptimizedCustomFields } from '../hooks/useOptimizedCustomFields';
import { CustomFieldRenderer } from './common/CustomFieldRenderer';
import { 
  initializeCustomFieldValues,
  processCustomFieldsForSubmission 
} from '../lib/utils/customFieldProcessing';
import type { OrganizationInput } from '../generated/graphql/graphql';
import { CustomFieldEntityType } from '../generated/graphql/graphql';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrganizationCreated: () => void;
}

function CreateOrganizationModal({ isOpen, onClose, onOrganizationCreated }: CreateOrganizationModalProps) {
  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [customFieldData, setCustomFieldData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const toast = useToast();

  // Store hooks
  const { 
    createOrganization: createOrganizationAction, 
    organizationsError: storeError, 
  } = useOrganizationsStore();

  // Use optimized custom fields hook
  const {
    loading: definitionsLoading,
    error: definitionStoreError,
    getDefinitionsForEntity
  } = useOptimizedCustomFields({ 
    entityTypes: ['ORGANIZATION' as CustomFieldEntityType] 
  });

  // Get active organization custom field definitions
  const organizationCustomFieldDefinitions = getDefinitionsForEntity('ORGANIZATION' as CustomFieldEntityType)
    .filter(def => def.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form
      setName('');
      setAddress('');
      setNotes('');
      setLocalError(null);
      setIsLoading(false);

      // Initialize custom fields
      const initialCustomData = initializeCustomFieldValues(organizationCustomFieldDefinitions);
      setCustomFieldData(initialCustomData);
    }
  }, [isOpen, organizationCustomFieldDefinitions]);

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFieldData(prev => ({ ...prev, [fieldName]: value }));
  };

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
      const organizationData: OrganizationInput = {
        name: name.trim(),
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      // Process custom fields using utility
      const processedCustomFields = processCustomFieldsForSubmission(
        organizationCustomFieldDefinitions,
        customFieldData
      );
      if (processedCustomFields.length > 0) {
        organizationData.customFields = processedCustomFields;
      }

      const result = await createOrganizationAction(organizationData);

      if (result) {
        toast({
          title: 'Organization Created',
          description: `Organization "${result.name}" has been successfully created.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onOrganizationCreated();
        onClose();
      } else {
        const errorMessage = storeError || 'Failed to create organization. An unknown error occurred.';
        setLocalError(errorMessage);
      }
    } catch (error: unknown) {
      let message = 'An unexpected error occurred while creating organization.';
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Create New Organization</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {(localError || storeError || definitionStoreError) && (
             <Alert status="error" mb={4} whiteSpace="pre-wrap" borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                    {localError && <Text>{localError}</Text>}
                    {storeError && <Text mt={localError ? 1 : 0}>Store Error: {storeError}</Text>}
                    {definitionStoreError && <Text mt={(localError || storeError) ? 1 : 0}>Definition Store Error: {definitionStoreError}</Text>}
                </Box>
            </Alert>
          )}

          <VStack spacing={4} align="stretch">
            <FormControl isRequired isInvalid={!!localError && localError.includes('name')}>
              <FormLabel>Organization Name</FormLabel>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter organization name" 
              />
              {!!localError && localError.includes('name') && <FormErrorMessage>{localError}</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel>Address</FormLabel>
              <Textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="Enter organization address (optional)"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Enter any notes about the organization (optional)"
              />
            </FormControl>

            {/* Custom Fields Section */}
            {definitionsLoading && <Spinner />}
            {definitionStoreError && <Alert status="error"><AlertIcon />Error loading custom fields: {definitionStoreError}</Alert>}
            
            {!definitionsLoading && !definitionStoreError && organizationCustomFieldDefinitions.length > 0 && (
              <Box my={4} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
                <Text fontSize="lg" fontWeight="semibold" mb={3}>Custom Fields</Text>
                {organizationCustomFieldDefinitions.map((def) => (
                  <CustomFieldRenderer
                    key={def.id}
                    definition={def}
                    value={customFieldData[def.fieldName]}
                    onChange={(value) => handleCustomFieldChange(def.fieldName, value)}
                    isRequired={def.isRequired}
                  />
                ))}
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost" isDisabled={isLoading}>Cancel</Button>
          <Button 
            colorScheme="blue" 
            type="submit" 
            isLoading={isLoading} 
            isDisabled={definitionsLoading}
          >
            Create Organization
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateOrganizationModal; 