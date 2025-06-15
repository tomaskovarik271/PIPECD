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
  useToast,
  Text,
  Box,
} from '@chakra-ui/react';
import { usePeopleStore } from '../stores/usePeopleStore';
import { useDealsStore, DealInput } from '../stores/useDealsStore';
import { useWFMProjectTypeStore, WfmProjectType } from '../stores/useWFMProjectTypeStore';
import { useOrganizationsStore } from '../stores/useOrganizationsStore';
import { useUserListStore } from '../stores/useUserListStore';
import { useOptimizedCustomFields } from '../hooks/useOptimizedCustomFields';
import { CustomFieldRenderer } from './common/CustomFieldRenderer';
import { 
  initializeCustomFieldValues,
  processCustomFieldsForSubmission 
} from '../lib/utils/customFieldProcessing';
import { CustomFieldEntityType } from '../generated/graphql/graphql';
import { DealAmountInput } from './currency/CurrencyInput';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealCreated: () => void;
}

// Default "Sales Deal" Project Type Name - could be moved to a config
const DEFAULT_SALES_PROJECT_TYPE_NAME = "Sales Deal";

function CreateDealModal({ isOpen, onClose, onDealCreated }: CreateDealModalProps) {
  // Form state
  const [name, setName] = useState('');
  const [selectedWFMProjectTypeId, setSelectedWFMProjectTypeId] = useState<string>('');
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
  const { 
    projectTypes, 
    fetchWFMProjectTypes, 
    loading: wfmProjectTypesLoading, 
    error: wfmProjectTypesError 
  } = useWFMProjectTypeStore();

  const { createDeal: createDealAction, dealsError, dealsLoading } = useDealsStore(); 
  const { people, fetchPeople, peopleLoading, peopleError } = usePeopleStore();
  const { organizations, fetchOrganizations, organizationsLoading, organizationsError } = useOrganizationsStore();
  const { 
    users: userList, 
    loading: userListLoading, 
    error: userListError, 
    fetchUsers: fetchUserList, 
    hasFetched: userListHasFetched 
  } = useUserListStore();

  // Use optimized custom fields hook
  const { 
    loading: customFieldsLoading, 
    error: customFieldsError,
    getDefinitionsForEntity 
  } = useOptimizedCustomFields({ 
    entityTypes: useMemo(() => ['DEAL' as CustomFieldEntityType], []) 
  });

  const toast = useToast();

  // Get active deal custom field definitions
  const activeDealCustomFields = useMemo(() => {
    return getDefinitionsForEntity('DEAL' as CustomFieldEntityType).filter(def => def.isActive);
  }, [getDefinitionsForEntity]);

  const dataLoading = peopleLoading || organizationsLoading || customFieldsLoading || wfmProjectTypesLoading || userListLoading;

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form
      setName('');
      setSelectedWFMProjectTypeId('');
      setAmount(0);
      setCurrency('EUR');
      setPersonId('');
      setOrganizationId('');
      setError(null);
      setDealSpecificProbability('');
      setExpectedCloseDate('');
      setAssignedToUserId(null);
      setIsLoading(false);

      // Fetch data
      fetchPeople(); 
      fetchOrganizations();
      fetchWFMProjectTypes({ isArchived: false });
      if (!userListHasFetched) fetchUserList();

      // Initialize custom fields
      const initialCustomValues = initializeCustomFieldValues(activeDealCustomFields);
      setCustomFieldFormValues(initialCustomValues);
    }
  }, [isOpen, fetchPeople, fetchOrganizations, fetchWFMProjectTypes, fetchUserList, userListHasFetched, activeDealCustomFields]);

  // Auto-select default project type
  useEffect(() => {
    if (projectTypes.length > 0 && !selectedWFMProjectTypeId) {
      const salesDealType = projectTypes.find(pt => pt.name === DEFAULT_SALES_PROJECT_TYPE_NAME);
      if (salesDealType) {
        setSelectedWFMProjectTypeId(salesDealType.id);
      } else if (projectTypes.length === 1) {
        setSelectedWFMProjectTypeId(projectTypes[0].id);
      }
    }
  }, [projectTypes, selectedWFMProjectTypeId]);

  const handleCustomFieldChange = (fieldName: string, value: string | number | boolean | string[]) => {
    setCustomFieldFormValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name.trim()) {
      setError('Deal name is required.');
      setIsLoading(false);
      return;
    }
    if (!selectedWFMProjectTypeId) {
      setError('WFM Project Type selection is required.');
      setIsLoading(false);
      return;
    }

    try {
      const dealInput: DealInput = {
        name: name.trim(),
        wfmProjectTypeId: selectedWFMProjectTypeId,
        amount: amount || null,
        currency: currency,
        person_id: personId || null,
        organization_id: organizationId || null,
        expected_close_date: expectedCloseDate ? new Date(expectedCloseDate).toISOString() : null,
        assignedToUserId: assignedToUserId,
      };

      // Handle probability
      const probPercent = parseFloat(dealSpecificProbability);
      if (!isNaN(probPercent) && probPercent >= 0 && probPercent <= 100) {
        dealInput.deal_specific_probability = probPercent / 100;
      } else if (dealSpecificProbability.trim() !== '') {
        setError('Deal Specific Probability must be a number between 0 and 100.');
        setIsLoading(false);
        return;
      }
      
      // Process custom fields using utility
      const processedCustomFields = processCustomFieldsForSubmission(
        activeDealCustomFields,
        customFieldFormValues
      );
      dealInput.customFields = processedCustomFields;

      const createdDeal = await createDealAction(dealInput);

      if (createdDeal) {
        toast({ 
          title: 'Deal Created', 
          description: 'The new deal has been successfully created.', 
          status: 'success', 
          duration: 3000, 
          isClosable: true 
        });
        onDealCreated();
        onClose();
      } else {
        setError(dealsError || 'Failed to create deal. Unknown error.');
      }
    } catch (e: unknown) {
      console.error("Error submitting deal:", e);
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Create New Deal</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {dataLoading && <Spinner />}
          {error && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}
          {dealsError && <Alert status="error" mb={4}><AlertIcon />{dealsError}</Alert>}
          {userListError && <Alert status="error" mb={4}><AlertIcon />User List: {userListError}</Alert>}
          
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!!error && error.includes('Deal name')}>
              <FormLabel>Deal Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter deal name" />
              {!!error && error.includes('Deal name') && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            <FormControl isRequired isInvalid={!!error && error.includes('WFM Project Type')} style={{ display: 'none' }}>
              <FormLabel>WFM Project Type</FormLabel>
              <Select 
                placeholder="Select WFM Project Type..."
                value={selectedWFMProjectTypeId}
                onChange={(e) => setSelectedWFMProjectTypeId(e.target.value)}
                isDisabled={wfmProjectTypesLoading || projectTypes.length === 0}
              >
                {projectTypes.map((pt: WfmProjectType) => (
                  <option key={pt.id} value={pt.id}>{pt.name}</option>
                ))}
              </Select>
              {wfmProjectTypesLoading && <Spinner size="sm" />}
              {wfmProjectTypesError && <Text color="red.500" fontSize="sm">Error: {wfmProjectTypesError}</Text>}
              {!!error && error.includes('WFM Project Type') && <FormErrorMessage>{error}</FormErrorMessage>}
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

            <FormControl>
              <FormLabel>Expected Close Date</FormLabel>
              <Input type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} />
            </FormControl>

            <FormControl isInvalid={!!error && error.includes('Probability')}>
              <FormLabel>Deal Specific Probability (%)</FormLabel>
              <NumberInput 
                min={0} 
                max={100} 
                value={dealSpecificProbability} 
                onChange={(valueString) => setDealSpecificProbability(valueString)}
                precision={2}
              >
                <NumberInputField placeholder="Enter probability (0-100, optional)" />
              </NumberInput>
              {!!error && error.includes('Probability') && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel>Person</FormLabel>
              <Select placeholder="Select person (optional)" value={personId} onChange={(e) => setPersonId(e.target.value)} isDisabled={peopleLoading}>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {[person.first_name, person.last_name].filter(Boolean).join(' ') || person.email}
                  </option>
                ))}
              </Select>
              {peopleLoading && <Spinner size="sm" />}
              {peopleError && <Text color="red.500" fontSize="sm">Error: {peopleError}</Text>}
            </FormControl>

            <FormControl>
              <FormLabel>Organization</FormLabel>
              <Select placeholder="Select organization (optional)" value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} isDisabled={organizationsLoading}>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </Select>
              {organizationsLoading && <Spinner size="sm" />}
              {organizationsError && <Text color="red.500" fontSize="sm">Error: {organizationsError}</Text>}
            </FormControl>
            
            <FormControl id="assignedToUserId">
              <FormLabel>Assign To</FormLabel>
              <Select 
                placeholder="Unassigned"
                value={assignedToUserId || ''}
                onChange={(e) => setAssignedToUserId(e.target.value || null)}
                isDisabled={userListLoading}
              >
                {userListError && <option value="">Error loading users</option>}
                {userListLoading && <option value="">Loading users...</option>}
                {!userListLoading && !userListError && userList.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.display_name || user.email}
                  </option>
                ))}
              </Select>
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
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost" isDisabled={isLoading || dealsLoading}>Cancel</Button>
          <Button colorScheme="blue" type="submit" isLoading={isLoading || dealsLoading} isDisabled={dataLoading}>
            Create Deal
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateDealModal; 