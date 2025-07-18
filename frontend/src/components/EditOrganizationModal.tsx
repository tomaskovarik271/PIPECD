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
  Spinner,
  useToast,
  Box,
  Text,
  Select
} from '@chakra-ui/react';
import { useOrganizationsStore, Organization, OrganizationInput } from '../stores/useOrganizationsStore';
import { useOptimizedCustomFields } from '../hooks/useOptimizedCustomFields';
import { CustomFieldRenderer } from './common/CustomFieldRenderer';
import { 
  initializeCustomFieldValuesFromEntity,
  processCustomFieldsForSubmission 
} from '../lib/utils/customFieldProcessing';
import { CustomFieldEntityType } from '../generated/graphql/graphql';
import { useQuery, gql } from '@apollo/client';
import { UserListItem } from '../stores/useUserListStore';

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrganizationUpdated: () => void;
  organization: Organization | null;
}

function EditOrganizationModal({ isOpen, onClose, onOrganizationUpdated, organization }: EditOrganizationModalProps) {
  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [accountManagerId, setAccountManagerId] = useState('');
  const [customFieldData, setCustomFieldData] = useState<Record<string, string | number | boolean | string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();

  // Store hooks
  const { 
    updateOrganization: updateOrganizationAction, 
    organizationsError: storeError, 
  } = useOrganizationsStore();

  // Get assignable users for account manager selection
  const GET_ASSIGNABLE_USERS_QUERY = gql`
    query GetAssignableUsersForEditOrg {
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

  // Initialize form when modal opens or organization changes
  useEffect(() => {
    if (isOpen && organization) {
      setName(organization.name || '');
      setAddress(organization.address || '');
      setNotes(organization.notes || '');
      // Use accountManager.id if available, otherwise fall back to account_manager_id
      setAccountManagerId(
        (organization as Organization & { accountManager?: { id: string }; account_manager_id?: string }).accountManager?.id || 
        (organization as Organization & { accountManager?: { id: string }; account_manager_id?: string }).account_manager_id || 
        ''
      );
      setError(null);
      setIsLoading(false);

      // Initialize custom fields from existing values
      const initialCustomData = initializeCustomFieldValuesFromEntity(
        organizationCustomFieldDefinitions,
        organization.customFieldValues || []
      );
      setCustomFieldData(initialCustomData);
    } else if (!isOpen) {
      // Reset when modal closes
      setName('');
      setAddress('');
      setNotes('');
      setAccountManagerId('');
      setCustomFieldData({});
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, organization, organizationCustomFieldDefinitions]);

  const handleCustomFieldChange = (fieldName: string, value: string | number | boolean | string[]) => {
    setCustomFieldData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!organization || !organization.id) {
      setError('No organization selected or organization ID is missing.');
      setIsLoading(false);
      return;
    }
    if (!name.trim()) {
      setError('Organization name is required.');
      setIsLoading(false);
      return;
    }

    try {
      const organizationInput: OrganizationInput = {
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
        organizationInput.customFields = processedCustomFields;
      }

      const result = await updateOrganizationAction(organization.id, organizationInput);

      if (result) {
        toast({
          title: 'Organization Updated',
          description: `Organization "${result.name}" has been successfully updated.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onOrganizationUpdated();
        onClose();
      } else {
        const errorMessage = storeError || 'Failed to update organization. An unknown error occurred.';
        setError(errorMessage);
      }
    } catch (error: unknown) {
      let message = 'An unexpected error occurred while updating organization.';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Edit Organization: {organization?.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {(error || storeError || definitionStoreError) && (
             <Alert status="error" mb={4} whiteSpace="pre-wrap" borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                    {error && <Text>{error}</Text>}
                    {storeError && <Text mt={error ? 1 : 0}>Store Error: {storeError}</Text>}
                    {definitionStoreError && <Text mt={(error || storeError) ? 1 : 0}>Definition Error: {definitionStoreError}</Text>}
                </Box>
            </Alert>
          )}

          <VStack spacing={4} align="stretch">
            <FormControl isRequired isInvalid={!!error && error.includes('name')}>
              <FormLabel>Organization Name</FormLabel>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter organization name" 
              />
              {!!error && error.includes('name') && <FormErrorMessage>{error}</FormErrorMessage>}
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

            <FormControl>
              <FormLabel>Account Manager</FormLabel>
              <Select 
                placeholder="Select account manager (optional)"
                value={accountManagerId}
                onChange={(e) => setAccountManagerId(e.target.value)}
                isDisabled={usersLoading}
              >
                {usersData?.assignableUsers?.map((user: UserListItem) => (
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
            isDisabled={definitionsLoading || !organization}
          >
            Update Organization
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditOrganizationModal; 