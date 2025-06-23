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
  NumberInput,
  NumberInputField,
  Select,
  VStack,
  FormErrorMessage,
  Alert, 
  AlertIcon,
  Spinner,
  Box,
  Text,
  useToast
} from '@chakra-ui/react';
import { usePeopleStore } from '../stores/usePeopleStore';
import { useDealsStore, Deal } from '../stores/useDealsStore';
import { useOrganizationsStore } from '../stores/useOrganizationsStore';

import { useUserAssignment } from '../hooks/useUserAssignment';
import { useOptimizedCustomFields } from '../hooks/useOptimizedCustomFields';
import { CustomFieldRenderer } from './common/CustomFieldRenderer';
import { 
  initializeCustomFieldValuesFromEntity, 
  processCustomFieldsForSubmission 
} from '../lib/utils/customFieldProcessing';
import type { 
  DealUpdateInput,
  CustomFieldEntityType
} from '../generated/graphql/graphql';
import { DealAmountInput } from './currency/CurrencyInput';

interface EditDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealUpdated: () => void;
  deal: Deal | null;
}

function EditDealModal({ isOpen, onClose, onDealUpdated, deal }: EditDealModalProps) {
  const toast = useToast();
  
  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('EUR');
  const [personId, setPersonId] = useState<string>('');
  const [organizationId, setOrganizationId] = useState<string>('');
  const [dealSpecificProbability, setDealSpecificProbability] = useState<string>('');
  const [expectedCloseDate, setExpectedCloseDate] = useState<string>('');
  const [assignedToUserId, setAssignedToUserId] = useState<string | null>(null);
  const [customFieldFormValues, setCustomFieldFormValues] = useState<Record<string, string | number | boolean | string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store hooks
  const { updateDeal: updateDealAction, dealsError, dealsLoading } = useDealsStore();
  const { people, fetchPeople, peopleLoading, peopleError } = usePeopleStore();
  const { organizations, fetchOrganizations, organizationsLoading, organizationsError } = useOrganizationsStore();
  
  // Use optimized custom fields hook
  const { 
    loading: customFieldsLoading, 
    error: customFieldsError,
    getDefinitionsForEntity 
  } = useOptimizedCustomFields({ 
    entityTypes: useMemo(() => ['DEAL' as CustomFieldEntityType], []) 
  });

  // Use user assignment hook
  const { 
    assignableUsers, 
    isAssignToDisabled, 
    userListLoading, 
    userListError 
  } = useUserAssignment({ deal });

  // Get active deal custom field definitions
  const activeDealCustomFields = useMemo(() => {
    return getDefinitionsForEntity('DEAL' as CustomFieldEntityType).filter(def => def.isActive);
  }, [getDefinitionsForEntity]);

  const dataLoading = peopleLoading || organizationsLoading || customFieldsLoading || userListLoading;

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPeople();
      fetchOrganizations();
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, fetchPeople, fetchOrganizations]);

  // Initialize form data when deal or custom fields change
  useEffect(() => {
    if (deal) {
      setName(deal.name || '');
      setAmount(deal.amount || 0);
      setCurrency(deal.currency || 'EUR');
      setPersonId(deal.person_id || ''); 
      setOrganizationId(deal.organization_id || deal.organization?.id || '');
      setDealSpecificProbability(
        deal.deal_specific_probability != null 
          ? String(Math.round(deal.deal_specific_probability * 100)) 
          : ''
      );
      setExpectedCloseDate(deal.expected_close_date ? new Date(deal.expected_close_date).toISOString().split('T')[0] : '');
      setAssignedToUserId(deal.assigned_to_user_id || null);
      setError(null);
      setIsLoading(false);
      
      // Initialize custom field values if definitions are available
      if (activeDealCustomFields.length > 0) {
        const initialCustomValues = initializeCustomFieldValuesFromEntity(
          activeDealCustomFields,
          deal.customFieldValues || []
        );
        setCustomFieldFormValues(initialCustomValues);
      } else {
        setCustomFieldFormValues({});
      }
    } else {
      // Reset form if no deal
      setName('');
      setAmount(0);
      setCurrency('EUR');
      setPersonId('');
      setOrganizationId('');
      setDealSpecificProbability('');
      setExpectedCloseDate('');
      setAssignedToUserId(null);
      setCustomFieldFormValues({});
    }
  }, [deal, activeDealCustomFields]);

  const handleCustomFieldChange = (fieldName: string, value: string | number | boolean | string[]) => {
    setCustomFieldFormValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!deal || !deal.id) {
      setError('No deal selected or deal ID is missing.');
      setIsLoading(false);
      return;
    }
    if (!name.trim()) {
      setError('Deal name is required.');
      setIsLoading(false);
      return;
    }

    try {
      // Construct basic deal update data
      const dealUpdateData: Partial<DealUpdateInput> = {
        name: name.trim(),
        amount: amount || undefined,
        currency: currency,
        person_id: personId || undefined,
        organization_id: organizationId || undefined,
        expected_close_date: expectedCloseDate || undefined,
        assignedToUserId: assignedToUserId,
      };

      // Handle probability
      const probPercent = parseFloat(dealSpecificProbability);
      if (dealSpecificProbability.trim() === '') {
        dealUpdateData.deal_specific_probability = null;
      } else if (!isNaN(probPercent) && probPercent >= 0 && probPercent <= 100) {
        dealUpdateData.deal_specific_probability = probPercent / 100;
      } else {
        setError('Deal Specific Probability must be a number between 0 and 100, or empty.');
        setIsLoading(false);
        return;
      }
      
      // Process custom fields using utility
      const processedCustomFields = processCustomFieldsForSubmission(
        activeDealCustomFields,
        customFieldFormValues
      );
      if (processedCustomFields.length > 0) {
        dealUpdateData.customFields = processedCustomFields;
      }

      const result = await updateDealAction(deal.id, dealUpdateData);

      if (result.deal) {
        toast({
          title: 'Deal Updated',
          description: `Deal "${result.deal.name}" has been successfully updated.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onDealUpdated(); 
        onClose();       
      } else {
        const errorMessage = result.error || 'Failed to update deal. An unknown error occurred.';
        setError(errorMessage);

        if (errorMessage === 'Deal information could not be retrieved after update. You may no longer have access.') {
          onDealUpdated();
          onClose();
        }
      }

    } catch (err: unknown) {
      let message = 'An unexpected error occurred while updating deal.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Edit Deal: {deal?.name || 'Loading...'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {dataLoading && !deal && <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />}
          {error && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}
          {dealsError && <Alert status="error" mb={4}><AlertIcon />{dealsError}</Alert>}
          {userListError && <Alert status="error" mb={4}><AlertIcon />User List: {userListError}</Alert>}
          
          {!deal && !dataLoading && !error && <Alert status="warning"><AlertIcon/>No deal data found or an error occurred before loading.</Alert>}

          {deal && (
            <VStack spacing={4} align="stretch">
              <FormControl isRequired isInvalid={!!error && name.trim() === ''}>
                <FormLabel>Deal Name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
                {!!error && name.trim() === '' && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>

              <FormControl>
                <FormLabel htmlFor='assignedToUserId'>Assign To</FormLabel>
                <Select 
                  id='assignedToUserId'
                  placeholder="Unassigned"
                  value={assignedToUserId || ''}
                  onChange={(e) => setAssignedToUserId(e.target.value || null)}
                  isDisabled={isAssignToDisabled}
                >
                  {userListError && <option value="">Error loading users</option>}
                  {userListLoading && <option value="">Loading users...</option>}
                  
                  {!userListLoading && !userListError && assignableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || user.email}
                    </option>
                  ))}
                </Select>
                {isAssignToDisabled && !userListLoading && deal && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {assignedToUserId 
                      ? assignableUsers.find(u => u.id === assignedToUserId)?.display_name || 
                        assignableUsers.find(u => u.id === assignedToUserId)?.email || 'Unassigned'
                      : 'Unassigned'
                    }
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Amount</FormLabel>
                <DealAmountInput
                  amount={amount}
                  currency={currency}
                  onAmountChange={setAmount}
                  onCurrencyChange={setCurrency}
                />
              </FormControl>

              <FormControl isInvalid={!!error && error.includes('Probability')}>
                <FormLabel>Deal Specific Probability (%)</FormLabel>
                <NumberInput 
                  min={0} max={100} precision={2}
                  value={dealSpecificProbability} 
                  onChange={(valueString) => setDealSpecificProbability(valueString)}
                  allowMouseWheel
                >
                  <NumberInputField />
                </NumberInput>
                {!!error && error.includes('Probability') && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>

              <FormControl>
                <FormLabel>Expected Close Date</FormLabel>
                <Input type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} />
              </FormControl>

              <FormControl>
                <FormLabel>Person</FormLabel>
                <Select placeholder="Select person" value={personId} onChange={(e) => setPersonId(e.target.value)} isDisabled={peopleLoading}>
                  {people.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </Select>
                {peopleError && <Alert status="error" mt={2}><AlertIcon />{peopleError}</Alert>}
              </FormControl>

              <FormControl>
                <FormLabel>Organization</FormLabel>
                <Select placeholder="Select organization" value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} isDisabled={organizationsLoading}>
                  {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
                </Select>
                {organizationsError && <Alert status="error" mt={2}><AlertIcon />{organizationsError}</Alert>}
              </FormControl>
              
              {/* Custom Fields Section */}
              {customFieldsLoading && <Spinner />}
              {customFieldsError && <Alert status="error"><AlertIcon />Error loading custom fields: {customFieldsError}</Alert>}
              
              {!customFieldsLoading && !customFieldsError && activeDealCustomFields.length > 0 && (
                <Box my={4} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
                  <Text fontSize="lg" fontWeight="semibold" mb={3}>Custom Fields</Text>
                  {activeDealCustomFields.map((def) => (
                    <CustomFieldRenderer
                      key={def.id}
                      definition={def}
                      value={customFieldFormValues[def.fieldName]}
                      onChange={(value) => handleCustomFieldChange(def.fieldName, value)}
                      isRequired={def.isRequired}
                    />
                  ))}
                </Box>
              )}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost" isDisabled={isLoading || dealsLoading}>Cancel</Button>
          <Button colorScheme="blue" type="submit" isLoading={isLoading || dealsLoading} isDisabled={dataLoading || !deal}>
            Update Deal
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditDealModal; 