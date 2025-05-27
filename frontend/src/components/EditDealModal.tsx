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
  Textarea,
  CheckboxGroup,
  Checkbox,
  Switch,
  Box,
  Text,
  useToast
} from '@chakra-ui/react';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useDealsStore, Deal } from '../stores/useDealsStore';
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore';
import type { 
  CustomFieldDefinition, 
  DealUpdateInput
} from '../generated/graphql/graphql';
import { 
  CustomFieldEntityType,
  CustomFieldType,
  CustomFieldValueInput,
} from '../generated/graphql/graphql';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';
import { useUserListStore, UserListItem } from '../stores/useUserListStore';
import { useAppStore } from '../stores/useAppStore';

interface EditDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealUpdated: () => void;
  deal: Deal | null;
}

function EditDealModal({ isOpen, onClose, onDealUpdated, deal }: EditDealModalProps) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [personId, setPersonId] = useState<string>('');
  const [organizationId, setOrganizationId] = useState<string>('');
  const [dealSpecificProbability, setDealSpecificProbability] = useState<string>('');
  const [expectedCloseDate, setExpectedCloseDate] = useState<string>('');
  const [assignedToUserId, setAssignedToUserId] = useState<string | null>(null);

  // Custom Fields State
  const [activeDealCustomFields, setActiveDealCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [customFieldFormValues, setCustomFieldFormValues] = useState<Record<string, any>>({});

  // Deals state & actions from useDealsStore
  const { updateDeal: updateDealAction, dealsError, dealsLoading } = useDealsStore();

  // Custom Field Definitions store
  const { 
    definitions: customFieldDefinitions,
    fetchCustomFieldDefinitions, 
    loading: customFieldDefinitionsLoading,
    error: customFieldDefinitionsError
  } = useCustomFieldDefinitionStore();

  // People state from usePeopleStore
  const { people, fetchPeople, peopleLoading, peopleError } = usePeopleStore();
  const { organizations, fetchOrganizations, organizationsLoading, organizationsError } = useOrganizationsStore();

  const { users: allUsersFromStore, loading: userListLoading, error: userListError, fetchUsers: fetchUserList, hasFetched: userListHasFetched } = useUserListStore();
  const { session, userPermissions } = useAppStore();
  const currentUserId = session?.user?.id;
  const isAdmin = userPermissions?.includes('deal:assign_any');
  const canAssignOwn = userPermissions?.includes('deal:assign_own');

  // Determine if the "Assign To" dropdown should be disabled
  let isAssignToDisabled = true; 
  if (userListLoading) { // Always disable if user list is loading
    isAssignToDisabled = true;
  } else if (isAdmin) {
    isAssignToDisabled = false;
  } else if (canAssignOwn && deal && currentUserId) {
    const isCreator = deal.user_id === currentUserId;
    const isCurrentAssignee = deal.assigned_to_user_id === currentUserId;
    if (isCreator || isCurrentAssignee || !deal.assigned_to_user_id) {
      isAssignToDisabled = false;
    }
  }

  // Determine the list of users that can be assigned based on permissions
  const assignableUsers = useMemo(() => {
    if (userListLoading || !currentUserId || !allUsersFromStore) return [];
    if (isAdmin) {
      return allUsersFromStore; // Admins can see everyone
    }
    // If the dropdown is not disabled for a non-admin, it implies they have deal:assign_own
    // and are in a context where they can change assignment (creator, current assignee, or unassigned deal).
    // In this specific context with deal:assign_own, they should be able to assign to themselves or unassign.
    // The backend (reassign_deal RPC) will enforce the detailed rules for non-admin reassignments.
    // For the UI, providing all users when the field is enabled for a non-admin is simpler and relies on backend for enforcement.
    // The key is that isAssignToDisabled gatekeeps *when* they can even make a change.
    // If we restrict to only self + unassigned, it might be too limiting if business rule allows them to pick others when they are creator/assignee.
    // The existing isAssignToDisabled logic is quite permissive for when a non-admin can open the dropdown.
    // For now, let's assume if it's enabled, they see all users, and backend handles the actual assignment logic.
    // A stricter approach would be to filter to self if !isAdmin && canAssignOwn && !isAssignToDisabled
    return allUsersFromStore; 

  }, [allUsersFromStore, userListLoading, isAdmin, currentUserId]);

  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 

  const dataLoading = peopleLoading || organizationsLoading || customFieldDefinitionsLoading || userListLoading;
  
  useEffect(() => {
    if (isOpen) {
      fetchPeople();
      fetchOrganizations();
      fetchCustomFieldDefinitions(CustomFieldEntityType.Deal, false);
      if (!userListHasFetched) fetchUserList();
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, fetchPeople, fetchOrganizations, fetchCustomFieldDefinitions, fetchUserList, userListHasFetched]);

  useEffect(() => {
    if (deal) {
      // console.log("[EditDealModal] Initializing form. Deal data:", JSON.stringify(deal, null, 2));
      // console.log("[EditDealModal] Initializing form. Active Deal Custom Field Definitions:", JSON.stringify(activeDealCustomFields, null, 2));

      setName(deal.name || '');
      setAmount(deal.amount != null ? String(deal.amount) : '');
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
      
      // Initialize custom field form values
      if (activeDealCustomFields.length > 0) {
        const initialCfValues: Record<string, any> = {};
        activeDealCustomFields.forEach(def => {
          const cfValueFromDeal = deal.customFieldValues?.find(
            cfv => cfv.definition.id === def.id
          );
          // console.log(`[EditDealModal] For def ${def.fieldName} (ID: ${def.id}), found cfValueFromDeal:`, JSON.stringify(cfValueFromDeal, null, 2));

          if (cfValueFromDeal) {
            switch (def.fieldType) {
              case CustomFieldType.Text:
              case CustomFieldType.Dropdown: 
                initialCfValues[def.fieldName] = cfValueFromDeal.stringValue || '';
                break;
              case CustomFieldType.Number:
                initialCfValues[def.fieldName] = cfValueFromDeal.numberValue !== null && cfValueFromDeal.numberValue !== undefined 
                  ? cfValueFromDeal.numberValue 
                  : '';
                break;
              case CustomFieldType.Boolean:
                initialCfValues[def.fieldName] = cfValueFromDeal.booleanValue ?? false;
                break;
              case CustomFieldType.Date:
                initialCfValues[def.fieldName] = cfValueFromDeal.dateValue 
                  ? new Date(cfValueFromDeal.dateValue).toISOString().split('T')[0] // Format to YYYY-MM-DD
                  : '';
                break;
              case CustomFieldType.MultiSelect:
                initialCfValues[def.fieldName] = cfValueFromDeal.selectedOptionValues || [];
                break;
              default:
                initialCfValues[def.fieldName] = '';
            }
          } else {
            // Default empty values if not found on deal
            switch (def.fieldType) {
              case CustomFieldType.Boolean:
                initialCfValues[def.fieldName] = false;
                break;
              case CustomFieldType.MultiSelect:
                initialCfValues[def.fieldName] = [];
                break;
              case CustomFieldType.Number:
                 initialCfValues[def.fieldName] = ''; // Or null / undefined, to be handled by NumberInput
                 break;
              default:
                initialCfValues[def.fieldName] = '';
            }
          }
        });
        setCustomFieldFormValues(initialCfValues);
      } else {
        // No active custom fields, reset form values
        setCustomFieldFormValues({});
      }
      
    } else {
        setName('');
        setAmount('');
        setPersonId('');
        setOrganizationId('');
        setDealSpecificProbability('');
        setExpectedCloseDate('');
        setAssignedToUserId(null);
        // Reset custom field form values if deal is null
        setCustomFieldFormValues({});
    }
  }, [deal, activeDealCustomFields]); // Depend on activeDealCustomFields to re-init if they load after deal

  // Effect to filter and set activeDealCustomFields once definitions are loaded from store
  useEffect(() => {
    if (customFieldDefinitions && customFieldDefinitions.length > 0) {
      const activeDefsForDeal = customFieldDefinitions.filter(
        def => def.entityType === CustomFieldEntityType.Deal && def.isActive
      );
      setActiveDealCustomFields(activeDefsForDeal);
    } else {
      setActiveDealCustomFields([]);
    }
  }, [customFieldDefinitions]);

  // Helper function to render custom field inputs
  const renderCustomField = (def: CustomFieldDefinition) => {
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
            newValue = (e.target as HTMLInputElement).value; 
        }
        setCustomFieldFormValues(prev => ({ ...prev, [fieldName]: newValue }));
      },
      // isDisabled can be added here if needed, e.g. based on field definition properties
    };

    const dropdownOptions = def.dropdownOptions?.map(opt => ({ value: opt.value, label: opt.label })) || [];

    switch (def.fieldType) {
      case CustomFieldType.Text:
        return (
          <FormControl key={def.id} mb={4}>
            <FormLabel htmlFor={fieldName}>{def.fieldLabel || fieldName}</FormLabel>
            <Textarea id={fieldName} {...commonProps} />
          </FormControl>
        );
      case CustomFieldType.Number:
        return (
          <FormControl key={def.id} mb={4}>
            <FormLabel htmlFor={fieldName}>{def.fieldLabel || fieldName}</FormLabel>
            <NumberInput 
              id={fieldName} 
              value={commonProps.value} 
              onChange={(valueAsString, _valueAsNumber) => 
                commonProps.onChange({ target: { value: valueAsString } } as React.ChangeEvent<HTMLInputElement>)
              }
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        );
      case CustomFieldType.Boolean:
        return (
          <FormControl key={def.id} display="flex" alignItems="center" mb={4}>
            <FormLabel htmlFor={fieldName} mb="0">{def.fieldLabel || fieldName}</FormLabel>
            <Switch id={fieldName} isChecked={commonProps.value} onChange={(e) => commonProps.onChange(e.target.checked)} />
          </FormControl>
        );
      case CustomFieldType.Date:
        return (
          <FormControl key={def.id} mb={4}>
            <FormLabel htmlFor={fieldName}>{def.fieldLabel || fieldName}</FormLabel>
            <Input type="date" id={fieldName} {...commonProps} />
          </FormControl>
        );
      case CustomFieldType.Dropdown:
        return (
          <FormControl key={def.id} mb={4}>
            <FormLabel htmlFor={fieldName}>{def.fieldLabel || fieldName}</FormLabel>
            <Select placeholder={`Select ${def.fieldLabel || fieldName}`} id={fieldName} {...commonProps}>
              {dropdownOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </FormControl>
        );
      case CustomFieldType.MultiSelect:
        return (
          <FormControl key={def.id} mb={4}>
            <FormLabel>{def.fieldLabel || fieldName}</FormLabel>
            <CheckboxGroup 
              value={commonProps.value || []} 
              onChange={(values) => commonProps.onChange(values as string[])}
            >
              <VStack spacing={2} alignItems="flex-start">
                {dropdownOptions.map(option => (
                  <Checkbox key={option.value} value={option.value}>{option.label}</Checkbox>
                ))}
              </VStack>
            </CheckboxGroup>
          </FormControl>
        );
      default:
        return null;
    }
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
      // Construct DealUpdateInput
      const dealUpdateData: Partial<DealUpdateInput> = {
        name: name.trim(),
        amount: amount ? parseFloat(amount) : undefined,
        person_id: personId || undefined,
        organization_id: organizationId || undefined,
        expected_close_date: expectedCloseDate || undefined,
        assignedToUserId: assignedToUserId,
      };

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
      
      // Custom fields processing (assuming this part is correct as per previous state)
      const mappedCustomFieldValues: CustomFieldValueInput[] = activeDealCustomFields
        .filter(def => customFieldFormValues[def.fieldName] !== undefined && customFieldFormValues[def.fieldName] !== null && customFieldFormValues[def.fieldName] !== '') 
        .map(def => {
          const formValue = customFieldFormValues[def.fieldName];
          let valueInput: CustomFieldValueInput = { definitionId: def.id };
          switch (def.fieldType) {
            case CustomFieldType.Text: valueInput.stringValue = String(formValue); break;
            case CustomFieldType.Number: valueInput.numberValue = (formValue !== '' && formValue !== null && formValue !== undefined) ? parseFloat(String(formValue)) : undefined; break;
            case CustomFieldType.Boolean: valueInput.booleanValue = Boolean(formValue); break;
            case CustomFieldType.Date: valueInput.dateValue = (formValue !== '' && formValue !== null && formValue !== undefined) ? new Date(formValue).toISOString() : undefined; break;
            case CustomFieldType.Dropdown: 
              if (formValue !== '' && formValue !== null && formValue !== undefined) { valueInput.selectedOptionValues = [String(formValue)]; } else { valueInput.selectedOptionValues = undefined; } break;
            case CustomFieldType.MultiSelect: valueInput.selectedOptionValues = Array.isArray(formValue) ? formValue.map(String) : undefined; break;
          }
          return valueInput;
        });
      const finalCustomFieldValuesInput = mappedCustomFieldValues.filter(cf => 
        cf.stringValue !== undefined || cf.numberValue !== undefined || cf.booleanValue !== undefined || cf.dateValue !== undefined || cf.selectedOptionValues !== undefined
      );
      if (finalCustomFieldValuesInput.length > 0) {
        dealUpdateData.customFields = finalCustomFieldValuesInput;
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
            onDealUpdated(); // Refresh list to reflect lost access
            onClose(); // Close modal as the specific error is about lost access, not a modal-level failure
          } else {
            // For other errors, keep modal open with the error displayed.
            // A toast might be redundant here if the Alert in modal body shows the error.
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
      // toast({ title: 'Error', description: message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null; // Don't render if not open. Important to keep this before the main return.

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
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

              {/* Assigned To User Selector */}
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
                    
                    {!userListLoading && !userListError && assignableUsers && assignableUsers.length > 0 && assignableUsers.map((user: UserListItem) => (
                        <option key={user.id} value={user.id}>
                            {user.display_name || user.email}
                        </option>
                    ))}
                  </Select>
                  {isAssignToDisabled && !userListLoading && deal && allUsersFromStore && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {assignedToUserId ? allUsersFromStore.find((u: UserListItem) => u.id === assignedToUserId)?.display_name || allUsersFromStore.find((u: UserListItem) => u.id === assignedToUserId)?.email || 'Unassigned' : 'Unassigned'}
                    </Text>
                  )}
              </FormControl>

              <FormControl>
                <FormLabel>Amount</FormLabel>
                <NumberInput value={amount} onChange={(valueString) => setAmount(valueString)} precision={2}>
                  <NumberInputField />
                </NumberInput>
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
              {customFieldDefinitionsLoading && <Spinner />}
              {customFieldDefinitionsError && <Alert status="error"><AlertIcon />Error loading custom fields.</Alert>}
              
              {!customFieldDefinitionsLoading && !customFieldDefinitionsError && activeDealCustomFields.length > 0 && (
                <Box my={4} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
                  <Text fontSize="lg" fontWeight="semibold" mb={3}>Custom Fields</Text>
                  {activeDealCustomFields.map((def) => renderCustomField(def))}
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