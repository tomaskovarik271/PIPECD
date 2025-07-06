import React, { useState, useEffect, useMemo } from 'react';
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
  AlertTitle,
  Spinner,
  useToast,
  Box,
  Text,
  HStack,
  Select
} from '@chakra-ui/react';
import { FiUser } from 'react-icons/fi';
import { useOrganizationsStore } from '../stores/useOrganizationsStore';
import { useOptimizedCustomFields } from '../hooks/useOptimizedCustomFields';
import { CustomFieldRenderer } from './common/CustomFieldRenderer';
import { 
  initializeCustomFieldValues,
  processCustomFieldsForSubmission 
} from '../lib/utils/customFieldProcessing';
import type { OrganizationInput, User } from '../generated/graphql/graphql';
import { CustomFieldEntityType } from '../generated/graphql/graphql';
import { useQuery, gql } from '@apollo/client';
import { useDebounce } from '../lib/utils/useDebounce';
import { duplicateDetectionService, type SimilarOrganizationResult } from '../lib/services/duplicateDetectionService';

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
  const [accountManagerId, setAccountManagerId] = useState('');
  const [customFieldData, setCustomFieldData] = useState<Record<string, string | number | boolean | string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Duplicate detection state
  const [duplicates, setDuplicates] = useState<SimilarOrganizationResult[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  
  const toast = useToast();

  // Store hooks
  const { 
    createOrganization: createOrganizationAction, 
    organizationsError: storeError, 
  } = useOrganizationsStore();

  // Get assignable users for account manager selection
  const GET_ASSIGNABLE_USERS_QUERY = gql`
    query GetAssignableUsersForCreateOrg {
      assignableUsers {
        id
        display_name
        email
        avatar_url
      }
    }
  `;
  
  const { data: usersData, loading: usersLoading } = useQuery(GET_ASSIGNABLE_USERS_QUERY);

  // Use optimized custom fields hook
  const {
    loading: definitionsLoading,
    error: definitionStoreError,
    getDefinitionsForEntity
  } = useOptimizedCustomFields({ 
    entityTypes: useMemo(() => ['ORGANIZATION' as CustomFieldEntityType], []) 
  });

  // Get active organization custom field definitions
  const organizationCustomFieldDefinitions = useMemo(() => {
    return getDefinitionsForEntity('ORGANIZATION' as CustomFieldEntityType)
      .filter(def => def.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [getDefinitionsForEntity]);

  // Debounced duplicate checking
  const debouncedDuplicateCheck = useDebounce(async (organizationName: string) => {
    if (organizationName.length < 3) {
      setDuplicates([]);
      setShowDuplicates(false);
      return;
    }

    setIsCheckingDuplicates(true);
    try {
      const similar = await duplicateDetectionService.findSimilarOrganizations(organizationName);
      setDuplicates(similar);
      setShowDuplicates(similar.length > 0);
    } catch (error) {
      console.error('Error checking duplicates:', error);
    } finally {
      setIsCheckingDuplicates(false);
    }
  }, 500);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form
      setName('');
      setAddress('');
      setNotes('');
      setAccountManagerId('');
      setLocalError(null);
      setIsLoading(false);
      
      // Reset duplicate detection
      setDuplicates([]);
      setShowDuplicates(false);
      setIsCheckingDuplicates(false);

      // Initialize custom fields
      const initialCustomData = initializeCustomFieldValues(organizationCustomFieldDefinitions);
      setCustomFieldData(initialCustomData);
    }
  }, [isOpen, organizationCustomFieldDefinitions]);

  // Run duplicate check when name changes
  useEffect(() => {
    debouncedDuplicateCheck(name);
  }, [name, debouncedDuplicateCheck]);

  const handleCustomFieldChange = (fieldName: string, value: string | number | boolean | string[]) => {
    setCustomFieldData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSelectExisting = (organization: SimilarOrganizationResult) => {
    // Close modal and notify parent that an existing organization was selected
    toast({
      title: 'Existing Organization Selected',
      description: `Selected existing organization: ${organization.name}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    onClose();
    onOrganizationCreated(); // Refresh the list
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
        account_manager_id: accountManagerId || undefined,
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
        <ModalHeader>Create Organization</ModalHeader>
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
              <HStack>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter organization name" 
                />
                {isCheckingDuplicates && <Spinner size="sm" />}
              </HStack>
              {!!localError && localError.includes('name') && <FormErrorMessage>{localError}</FormErrorMessage>}
            </FormControl>

            {/* Duplicate Suggestions */}
            {showDuplicates && (
              <Alert status="info" size="sm" borderRadius="md">
                <AlertIcon />
                <Box flex={1}>
                  <AlertTitle fontSize="sm">Similar organizations found:</AlertTitle>
                  <VStack align="start" mt={2} spacing={1}>
                    {duplicates.map(org => (
                      <Button
                        key={org.id}
                        variant="ghost"
                        size="xs"
                        leftIcon={<FiUser />}
                        onClick={() => handleSelectExisting(org)}
                        color="blue.600"
                        _hover={{ bg: 'blue.50' }}
                      >
                        {org.suggestion}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setShowDuplicates(false)}
                      color="gray.600"
                      _hover={{ bg: 'gray.50' }}
                    >
                      Create new organization anyway
                    </Button>
                  </VStack>
                </Box>
              </Alert>
            )}

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

            <FormControl>
              <FormLabel>Account Manager</FormLabel>
              <Select 
                placeholder="Select account manager (optional)"
                value={accountManagerId}
                onChange={(e) => setAccountManagerId(e.target.value)}
                isDisabled={usersLoading}
              >
                {usersData?.assignableUsers?.map((user: User) => (
                  <option key={user.id} value={user.id}>
                    {user.display_name || user.email}
                  </option>
                ))}
              </Select>
              {usersLoading && <Text fontSize="sm" color="gray.500">Loading users...</Text>}
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