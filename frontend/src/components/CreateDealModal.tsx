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
  NumberInput,
  NumberInputField,
  Select,
  VStack,
  FormErrorMessage,
  Alert, 
  AlertIcon,
  Spinner,
  useToast,
  Switch,
  Textarea,
  CheckboxGroup,
  Checkbox,
  Stack,
  Text,
  Box,
} from '@chakra-ui/react';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useDealsStore, DealInput, Maybe } from '../stores/useDealsStore';
import { useWFMProjectTypeStore, WfmProjectType } from '../stores/useWFMProjectTypeStore';
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore';
import { CustomFieldType } from '../generated/graphql/graphql';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';
import { CustomFieldEntityType, CustomFieldDefinition as GraphQLCustomFieldDefinition, CustomFieldValueInput } from '../generated/graphql/graphql';
import { useUserListStore, UserListItem } from '../stores/useUserListStore';
import { useAppStore } from '../stores/useAppStore';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealCreated: () => void;
}

// Default "Sales Deal" Project Type Name - could be moved to a config
const DEFAULT_SALES_PROJECT_TYPE_NAME = "Sales Deal";

function CreateDealModal({ isOpen, onClose, onDealCreated }: CreateDealModalProps) {
  const [name, setName] = useState('');
  const [selectedWFMProjectTypeId, setSelectedWFMProjectTypeId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [personId, setPersonId] = useState<string>('');
  const [organizationId, setOrganizationId] = useState<string>('');
  const [dealSpecificProbability, setDealSpecificProbability] = useState<string>('');
  const [expectedCloseDate, setExpectedCloseDate] = useState<string>('');
  const [assignedToUserId, setAssignedToUserId] = useState<string | null>(null);
  
  const [customFieldFormValues, setCustomFieldFormValues] = useState<Record<string, any>>({});
  const [activeDealCustomFields, setActiveDealCustomFields] = useState<GraphQLCustomFieldDefinition[]>([]);

  const { 
    projectTypes, 
    fetchWFMProjectTypes, 
    loading: wfmProjectTypesLoading, 
    error: wfmProjectTypesError 
  } = useWFMProjectTypeStore();

  const { 
    definitions: allCustomFieldDefs, 
    fetchCustomFieldDefinitions: fetchDefinitions, 
    loading: customFieldsLoading, 
    error: customFieldsError 
  } = useCustomFieldDefinitionStore();

  const { createDeal: createDealAction, dealsError, dealsLoading } = useDealsStore(); 
  const { people, fetchPeople, peopleLoading, peopleError } = usePeopleStore();
  const { organizations, fetchOrganizations, organizationsLoading, organizationsError } = useOrganizationsStore();
  const { users: userList, loading: userListLoading, error: userListError, fetchUsers: fetchUserList, hasFetched: userListHasFetched } = useUserListStore();
  const { session, userPermissions } = useAppStore();
  const currentUserId = session?.user?.id;
  const isAdmin = userPermissions?.includes('deal:assign_any');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setName('');
      setSelectedWFMProjectTypeId('');
      setAmount('');
      setPersonId('');
      setOrganizationId('');
      setError(null);
      setDealSpecificProbability('');
      setExpectedCloseDate('');
      setAssignedToUserId(null);
      setIsLoading(false);
      setCustomFieldFormValues({});
      setActiveDealCustomFields([]);

      fetchPeople(); 
      fetchOrganizations();
      fetchDefinitions(CustomFieldEntityType.Deal, false);
      fetchWFMProjectTypes({ isArchived: false });
      if (!userListHasFetched) fetchUserList();
    }
  }, [isOpen, fetchPeople, fetchOrganizations, fetchDefinitions, fetchWFMProjectTypes, fetchUserList, userListHasFetched]);

  useEffect(() => {
    // Auto-select "Sales Deal" project type if available
    if (projectTypes.length > 0 && !selectedWFMProjectTypeId) {
      const salesDealType = projectTypes.find(pt => pt.name === DEFAULT_SALES_PROJECT_TYPE_NAME);
      if (salesDealType) {
        setSelectedWFMProjectTypeId(salesDealType.id);
      } else if (projectTypes.length === 1) {
        // If only one project type exists, select it by default
        setSelectedWFMProjectTypeId(projectTypes[0].id);
      }
    }
  }, [projectTypes, selectedWFMProjectTypeId]);

  useEffect(() => {
    const activeDealDefs = allCustomFieldDefs.filter(
      def => def.entityType === CustomFieldEntityType.Deal && def.isActive
    );
    setActiveDealCustomFields(activeDealDefs);
  }, [allCustomFieldDefs]);

  useEffect(() => {
    const initialCustomValues: Record<string, any> = {};
    activeDealCustomFields.forEach(def => {
      if (def.fieldType === CustomFieldType.Boolean) {
        initialCustomValues[def.fieldName] = false;
      } else if (def.fieldType === CustomFieldType.MultiSelect) {
        initialCustomValues[def.fieldName] = [];
      } else {
        initialCustomValues[def.fieldName] = '';
      }
    });
    setCustomFieldFormValues(initialCustomValues);
  }, [activeDealCustomFields]);

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
        amount: amount ? parseFloat(amount) : null,
        person_id: personId || null,
        organization_id: organizationId || null,
        expected_close_date: expectedCloseDate ? new Date(expectedCloseDate).toISOString() : null,
        assignedToUserId: assignedToUserId,
      };
      
      const customFieldsSubmission: CustomFieldValueInput[] = activeDealCustomFields
        .map(def => {
          const formValue = customFieldFormValues[def.fieldName];
          const valueInput: CustomFieldValueInput = { definitionId: def.id };

          switch (def.fieldType) {
            case CustomFieldType.Text:
              valueInput.stringValue = formValue ? String(formValue) : undefined;
              break;
            case CustomFieldType.Number:
              valueInput.numberValue = (formValue !== '' && formValue !== null && formValue !== undefined) ? parseFloat(String(formValue)) : undefined;
              break;
            case CustomFieldType.Boolean:
              valueInput.booleanValue = Boolean(formValue);
              break;
            case CustomFieldType.Date:
              valueInput.dateValue = (formValue !== '' && formValue !== null && formValue !== undefined) ? new Date(formValue).toISOString() : undefined;
              break;
            case CustomFieldType.Dropdown:
                valueInput.selectedOptionValues = (formValue !== '' && formValue !== null && formValue !== undefined) ? [String(formValue)] : undefined;
                break;
            case CustomFieldType.MultiSelect:
              valueInput.selectedOptionValues = Array.isArray(formValue) && formValue.length > 0 ? formValue.map(String) : undefined;
              break;
          }
          // Only return if some value is actually set, to avoid sending empty value objects
          if (Object.keys(valueInput).length > 1) { // definitionId is always there
            return valueInput as CustomFieldValueInput;
          }
          return null;
        })
        .filter(cf => cf !== null) as CustomFieldValueInput[];
      
      dealInput.customFields = customFieldsSubmission;

      const probPercent = parseFloat(dealSpecificProbability);
      if (!isNaN(probPercent) && probPercent >= 0 && probPercent <= 100) {
        dealInput.deal_specific_probability = probPercent / 100;
      } else if (dealSpecificProbability.trim() !== '') {
        setError('Deal Specific Probability must be a number between 0 and 100.');
        setIsLoading(false);
        return;
      }
      
      // console.log("Submitting DealInput:", JSON.stringify(dealInput, null, 2));
      const createdDeal = await createDealAction(dealInput);

      if (createdDeal) {
        toast({ title: 'Deal Created', description: 'The new deal has been successfully created.', status: 'success', duration: 3000, isClosable: true });
        onDealCreated();
        onClose();
      } else {
        setError(dealsError || 'Failed to create deal. Unknown error.');
      }
    } catch (e: any) {
      console.error("Error submitting deal:", e);
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const dataLoading = peopleLoading || organizationsLoading || customFieldsLoading || wfmProjectTypesLoading || userListLoading;

  // Render Custom Field
  const renderCustomField = (def: GraphQLCustomFieldDefinition) => {
    const fieldName = def.fieldName;
    const commonProps = {
      value: customFieldFormValues[fieldName],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | string[] | boolean) => {
        let newValue: any;
        if (typeof e === 'boolean') { // For Switch
            newValue = e;
        } else if (Array.isArray(e)) { // For CheckboxGroup (MultiSelect)
            newValue = e;
        } else { // For Input, Select, Textarea
            newValue = e.target.value;
        }
        setCustomFieldFormValues(prev => ({ ...prev, [fieldName]: newValue }));
      },
    };

    switch (def.fieldType) {
      case CustomFieldType.Text:
        return <Input placeholder={def.fieldLabel || def.fieldName} {...commonProps} />;
      case CustomFieldType.Number:
        return (
          <NumberInput precision={2} value={String(commonProps.value)} onChange={(valueString) => commonProps.onChange({ target: { value: valueString } } as any)}>
            <NumberInputField placeholder={def.fieldLabel || def.fieldName} />
          </NumberInput>
        );
      case CustomFieldType.Boolean:
        return (
          <Switch 
            isChecked={Boolean(commonProps.value)} 
            onChange={(e) => commonProps.onChange(e.target.checked)} 
          />
        );
      case CustomFieldType.Date:
        return <Input type="date" placeholder={def.fieldLabel || def.fieldName} {...commonProps} />;
      case CustomFieldType.Dropdown: // Single Select Dropdown
        return (
          <Select placeholder={`Select ${def.fieldLabel || def.fieldName}...`} {...commonProps}>
            {def.dropdownOptions?.map((opt: {label: string, value: string}) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
        );
      case CustomFieldType.MultiSelect: // Checkbox Group
        return (
          <CheckboxGroup 
            value={commonProps.value || []} 
            onChange={(values) => commonProps.onChange(values as string[])}
          >
            <Stack direction="column">
              {def.dropdownOptions?.map((opt: {label: string, value: string}) => <Checkbox key={opt.value} value={opt.value}>{opt.label}</Checkbox>)}
            </Stack>
          </CheckboxGroup>
        );
      default:
        return <Text fontSize="sm" color="red.500">Unsupported custom field type: {def.fieldType}</Text>;
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

            <FormControl isRequired isInvalid={!!error && error.includes('WFM Project Type')}>
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

            {/* Amount */}
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <NumberInput value={amount} onChange={(valueString) => setAmount(valueString)} precision={2}>
                <NumberInputField placeholder="Enter deal amount (optional)" />
              </NumberInput>
            </FormControl>

            {/* Expected Close Date */}
            <FormControl>
              <FormLabel>Expected Close Date</FormLabel>
              <Input type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} />
            </FormControl>

            {/* Deal Specific Probability */}
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

            {/* Person Selector */}
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

            {/* Organization Selector */}
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
            
            {/* Assigned To User Selector */}
            <FormControl id="assignedToUserId">
              <FormLabel>Assign To</FormLabel>
              <Select 
                placeholder="Unassigned"
                value={assignedToUserId || ''}
                onChange={(e) => setAssignedToUserId(e.target.value || null)}
                isDisabled={userListLoading} // Only disable if users are loading
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
            
            {/* Divider or Heading for Custom Fields */}
            {activeDealCustomFields.length > 0 && (
                <Text fontWeight="bold" mt={6} mb={2} alignSelf="flex-start">Custom Fields</Text>
            )}

            {/* Custom Fields */}
            {customFieldsLoading && <Spinner />}
            {customFieldsError && <Alert status="error"><AlertIcon />Error loading custom fields: {customFieldsError}</Alert>}
            {!customFieldsLoading && !customFieldsError && activeDealCustomFields.map(def => (
              <FormControl key={def.id} isRequired={def.isRequired}>
                <FormLabel>{def.fieldName}{def.isRequired ? '*' : ''}</FormLabel>
                {renderCustomField(def)}
                {/* TODO: Add FormErrorMessage for custom field validation */}
              </FormControl>
            ))}

            {error && (
              <Alert status="error" mt={4}>
                <AlertIcon />
                {error}
              </Alert>
            )}
            {dealsError && !error && ( // Show dealsError from store if no local form error
                 <Alert status="error" mt={4}>
                    <AlertIcon />
                    {dealsError}
                </Alert>
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