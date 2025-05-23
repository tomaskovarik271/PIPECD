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
  Textarea,
  CheckboxGroup,
  Checkbox,
  Switch,
} from '@chakra-ui/react';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useDealsStore, Deal } from '../stores/useDealsStore';
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore';
import type { 
  CustomFieldDefinition, 
  DealUpdateInput,
} from '../generated/graphql/graphql';
import { 
  CustomFieldEntityType,
  CustomFieldType,
  CustomFieldValueInput,
} from '../generated/graphql/graphql';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';

interface EditDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealUpdated: () => void;
  deal: Deal | null;
}

function EditDealModal({ isOpen, onClose, onDealUpdated, deal }: EditDealModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [personId, setPersonId] = useState<string>('');
  const [organizationId, setOrganizationId] = useState<string>('');
  const [dealSpecificProbability, setDealSpecificProbability] = useState<string>('');
  const [expectedCloseDate, setExpectedCloseDate] = useState<string>('');

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

  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    if (isOpen) {
      fetchPeople();
      fetchOrganizations();
      fetchCustomFieldDefinitions(CustomFieldEntityType.Deal, false);
    }
  }, [isOpen, fetchPeople, fetchOrganizations, fetchCustomFieldDefinitions]);

  useEffect(() => {
    if (deal) {
      console.log("[EditDealModal] Initializing form. Deal data:", JSON.stringify(deal, null, 2));
      console.log("[EditDealModal] Initializing form. Active Deal Custom Field Definitions:", JSON.stringify(activeDealCustomFields, null, 2));

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
      setError(null);
      setIsLoading(false);
      
      // Initialize custom field form values
      if (activeDealCustomFields.length > 0) {
        const initialCfValues: Record<string, any> = {};
        activeDealCustomFields.forEach(def => {
          const cfValueFromDeal = deal.customFieldValues?.find(
            cfv => cfv.definition.id === def.id
          );
          console.log(`[EditDealModal] For def ${def.fieldName} (ID: ${def.id}), found cfValueFromDeal:`, JSON.stringify(cfValueFromDeal, null, 2));

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
        deal_specific_probability: dealSpecificProbability ? parseFloat(dealSpecificProbability) / 100 : undefined,
      };

      // Prepare custom fields
      const mappedCustomFieldValues: CustomFieldValueInput[] = activeDealCustomFields
        // Initial filter: only process fields that have *some* value in the form.
        // This avoids sending fields that were never touched or were cleared to empty string if empty string means "no value".
        // However, for booleans (false) or numbers (0), this filter might be too aggressive if '' is a valid state before converting to boolean/number.
        // Consider if `customFieldFormValues[def.fieldName] !== undefined && customFieldFormValues[def.fieldName] !== null` is sufficient here.
        .filter(def => customFieldFormValues[def.fieldName] !== undefined && customFieldFormValues[def.fieldName] !== null && customFieldFormValues[def.fieldName] !== '') 
        .map(def => {
          const formValue = customFieldFormValues[def.fieldName];
          let valueInput: CustomFieldValueInput = { definitionId: def.id };

          switch (def.fieldType) {
            case CustomFieldType.Text:
              valueInput.stringValue = String(formValue);
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
              if (formValue !== '' && formValue !== null && formValue !== undefined) {
                valueInput.selectedOptionValues = [String(formValue)];
              } else {
                valueInput.selectedOptionValues = undefined; 
              }
              break;
            case CustomFieldType.MultiSelect:
              valueInput.selectedOptionValues = Array.isArray(formValue) ? formValue.map(String) : undefined;
              break;
          }
          return valueInput;
        }); // Corrected: .map() ends here

      // Second filter: only include custom fields that have an actual value property set (e.g. stringValue is not undefined)
      const finalCustomFieldValuesInput = mappedCustomFieldValues.filter(cf => 
        cf.stringValue !== undefined || 
        cf.numberValue !== undefined || 
        cf.booleanValue !== undefined || 
        cf.dateValue !== undefined || 
        cf.selectedOptionValues !== undefined
      );

      if (finalCustomFieldValuesInput.length > 0) {
        dealUpdateData.customFields = finalCustomFieldValuesInput;
      }

      const updatedDeal = await updateDealAction(deal.id, dealUpdateData);

      if (updatedDeal) {
          onDealUpdated(); 
          onClose();       
      } else {
          setError(dealsError || 'Failed to update deal. Please check store errors.');
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

  if (!isOpen || !deal) {
      return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Edit Deal: {deal.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {error && (
             <Alert status="error" mb={4} whiteSpace="pre-wrap">
                <AlertIcon />
                {error}
            </Alert>
          )}
          {peopleError && ( 
             <Alert status="warning" mb={4}>
                <AlertIcon />
                {peopleError} 
            </Alert>
          )}
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!name}>
              <FormLabel>Deal Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
              {!name && <FormErrorMessage>Name is required.</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel>Amount</FormLabel>
              <NumberInput 
                value={amount}
                onChange={(valueString) => setAmount(valueString)} 
                precision={2} 
              >
                <NumberInputField placeholder='Enter deal amount' />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Deal Specific Probability (%)</FormLabel>
              <NumberInput
                min={0}
                max={100}
                value={dealSpecificProbability}
                onChange={(valueString) => setDealSpecificProbability(valueString)}
                allowMouseWheel
              >
                <NumberInputField placeholder="Optional (e.g., 75)" />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Link to Organization (Optional)</FormLabel>
                <Select 
                  placeholder={organizationsLoading ? 'Loading organizations...' : 'Select organization'}
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  isDisabled={organizationsLoading || !!organizationsError}
                >
                 {!organizationsLoading && !organizationsError && Array.isArray(organizations) && organizations.map((org: Organization) => (
                      <option key={org.id} value={org.id}>
                        {org.name || `Org ID: ${org.id}`}
                      </option>
                  ))}
                </Select>
                {organizationsError && <FormErrorMessage>Error loading organizations: {organizationsError}</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel>Link to Person (Optional)</FormLabel>
                <Select 
                placeholder={peopleLoading ? 'Loading people...' : 'Select person'}
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                isDisabled={peopleLoading || !!peopleError}
                >
                 {!peopleLoading && !peopleError && Array.isArray(people) && people.map((person: Person) => (
                      <option key={person.id} value={person.id}>
                        {[person.first_name, person.last_name].filter(Boolean).join(' ') || person.email || `Person ID: ${person.id}`}
                      </option>
                  ))}
                </Select>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel htmlFor='expected_close_date'>Expected Close Date</FormLabel>
              <Input 
                id='expected_close_date'
                type='date' 
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
              />
            </FormControl>

            {/* Custom Fields Section */}
            {customFieldDefinitionsLoading && <Spinner size="md" />}
            {customFieldDefinitionsError && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                Error loading custom field definitions: {customFieldDefinitionsError}
              </Alert>
            )}
            {activeDealCustomFields.map((def: CustomFieldDefinition) => (
              <FormControl key={def.id} isRequired={def.isRequired} mb={4}>
                <FormLabel htmlFor={def.fieldName}>{def.fieldLabel}</FormLabel>
                {def.fieldType === CustomFieldType.Text && (
                  <Input
                    id={def.fieldName}
                    value={customFieldFormValues[def.fieldName] || ''}
                    onChange={(e) =>
                      setCustomFieldFormValues(prev => ({
                        ...prev,
                        [def.fieldName]: e.target.value,
                      }))
                    }
                    placeholder={def.fieldLabel}
                  />
                )}
                {def.fieldType === CustomFieldType.Number && (
                  <NumberInput
                    id={def.fieldName}
                    value={customFieldFormValues[def.fieldName] || ''}
                    onChange={(valueString) =>
                      setCustomFieldFormValues(prev => ({
                        ...prev,
                        [def.fieldName]: valueString, // Store as string, will be parsed on submit
                      }))
                    }
                    precision={2} // Example precision, adjust as needed
                  >
                    <NumberInputField placeholder={def.fieldLabel} />
                  </NumberInput>
                )}
                {def.fieldType === CustomFieldType.Date && (
                  <Input
                    type="date"
                    id={def.fieldName}
                    value={customFieldFormValues[def.fieldName] || ''}
                    onChange={(e) =>
                      setCustomFieldFormValues(prev => ({
                        ...prev,
                        [def.fieldName]: e.target.value,
                      }))
                    }
                  />
                )}
                {def.fieldType === CustomFieldType.Boolean && (
                  <Switch
                    id={def.fieldName}
                    isChecked={customFieldFormValues[def.fieldName] || false}
                    onChange={(e) =>
                      setCustomFieldFormValues(prev => ({
                        ...prev,
                        [def.fieldName]: e.target.checked,
                      }))
                    }
                  />
                )}
                {def.fieldType === CustomFieldType.Dropdown && def.dropdownOptions && (
                  <Select
                    id={def.fieldName}
                    placeholder={`Select ${def.fieldLabel}`}
                    value={customFieldFormValues[def.fieldName] || ''}
                    onChange={(e) =>
                      setCustomFieldFormValues(prev => ({
                        ...prev,
                        [def.fieldName]: e.target.value,
                      }))
                    }
                  >
                    {def.dropdownOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                )}
                {def.fieldType === CustomFieldType.MultiSelect && def.dropdownOptions && (
                  <CheckboxGroup
                    value={customFieldFormValues[def.fieldName] || []}
                    onChange={(values) =>
                      setCustomFieldFormValues(prev => ({
                        ...prev,
                        [def.fieldName]: values,
                      }))
                    }
                  >
                    <VStack spacing={2} alignItems="flex-start">
                      {def.dropdownOptions.map(option => (
                        <Checkbox key={option.value} value={option.value}>
                          {option.label}
                        </Checkbox>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                )}
                {/* TODO: Add FormErrorMessage for custom field validation if needed */}
              </FormControl>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button 
            colorScheme='blue' 
            mr={3} 
            type="submit" 
            isLoading={isLoading || dealsLoading} 
            leftIcon={(isLoading || dealsLoading) ? <Spinner size="sm" /> : undefined}
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
          <Button variant='ghost' onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditDealModal; 