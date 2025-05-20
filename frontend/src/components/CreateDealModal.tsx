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
} from '@chakra-ui/react';
import { useAppStore } from '../stores/useAppStore';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useDealsStore } from '../stores/useDealsStore';
import { usePipelinesStore, Pipeline } from '../stores/usePipelinesStore';
import { useStagesStore, Stage } from '../stores/useStagesStore';
import { DealInput, CustomFieldType } from '../generated/graphql/graphql';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';
import { CustomFieldEntityType, CustomFieldDefinition as GraphQLCustomFieldDefinition, CustomFieldValueInput } from '../generated/graphql/graphql';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealCreated: () => void;
}

function CreateDealModal({ isOpen, onClose, onDealCreated }: CreateDealModalProps) {
  const [name, setName] = useState('');
  const [localSelectedPipelineId, setLocalSelectedPipelineId] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [personId, setPersonId] = useState<string>('');
  const [dealSpecificProbability, setDealSpecificProbability] = useState<string>('');
  const [expectedCloseDate, setExpectedCloseDate] = useState<string>('');
  
  // State for Custom Fields
  const [customFieldFormValues, setCustomFieldFormValues] = useState<Record<string, any>>({});
  const [activeDealCustomFields, setActiveDealCustomFields] = useState<GraphQLCustomFieldDefinition[]>([]);

  const { pipelines, fetchPipelines, pipelinesLoading, pipelinesError } = usePipelinesStore();

  const { 
    stages,
    fetchStages,
    stagesLoading,
    stagesError
  } = useStagesStore();

  // Custom Field Definitions Store
  const { 
    definitions: allCustomFieldDefs, 
    fetchCustomFieldDefinitions: fetchDefinitions, 
    loading: customFieldsLoading, 
    error: customFieldsError 
  } = useCustomFieldDefinitionStore();

  const { createDeal: createDealAction, dealsError, dealsLoading } = useDealsStore(); 

  const { people, fetchPeople, peopleLoading, peopleError } = usePeopleStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setName('');
      setLocalSelectedPipelineId('');
      setSelectedStageId('');
      setAmount('');
      setPersonId('');
      setError(null);
      setDealSpecificProbability('');
      setExpectedCloseDate('');
      setIsLoading(false);
      
      // Reset custom field states
      setCustomFieldFormValues({});
      setActiveDealCustomFields([]); // Clear previous active fields

      fetchPeople(); 
      fetchPipelines(); 
      // Fetch active custom field definitions for Deals
      fetchDefinitions(CustomFieldEntityType.Deal, false);
    }
  }, [isOpen, fetchPeople, fetchPipelines, fetchDefinitions]);

  useEffect(() => {
    // Update activeDealCustomFields when definitions are fetched from the store
    // We filter here to ensure we only use DEAL definitions and they are active (though fetchDefinitions should handle active state)
    const activeDealDefs = allCustomFieldDefs.filter(
      def => def.entityType === CustomFieldEntityType.Deal && def.isActive
    );
    setActiveDealCustomFields(activeDealDefs);
  }, [allCustomFieldDefs]);

  useEffect(() => {
    // Initialize customFieldFormValues with default values when activeDealCustomFields are loaded
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

  useEffect(() => {
    if (localSelectedPipelineId) {
        setSelectedStageId('');
        fetchStages(localSelectedPipelineId);
    } else {
        useStagesStore.setState({ stages: [], stagesError: null, stagesLoading: false });
    }
  }, [localSelectedPipelineId, fetchStages]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name.trim()) {
        setError('Deal name is required.');
        setIsLoading(false);
        return;
    }
    if (!selectedStageId) {
        setError('Stage selection is required.');
        setIsLoading(false);
        return;
    }

    try {
      const dealInput: DealInput = {
        name: name.trim(),
        stage_id: selectedStageId,
        pipeline_id: localSelectedPipelineId,
        amount: amount ? parseFloat(amount) : null,
        person_id: personId || null,
        expected_close_date: expectedCloseDate ? new Date(expectedCloseDate).toISOString() : null,
        // customFields: [] // Initialize customFields array - will be populated below
      };

      // Populate customFields for submission
      const customFieldsSubmission: CustomFieldValueInput[] = activeDealCustomFields
        .map(def => {
          const rawValue = customFieldFormValues[def.fieldName];
          
          const valueInputPayload: Omit<CustomFieldValueInput, 'definitionId'> = {};

          // Skip if the rawValue is undefined or null, unless it's a boolean (which defaults to false)
          // or an empty array for multi-select (which is a valid empty state).
          // For empty strings in required text fields, validation should catch it, but we might send it.
          if (rawValue === undefined || rawValue === null) {
            if (def.fieldType === CustomFieldType.Boolean) {
              // Booleans always have a value (true/false)
              valueInputPayload.booleanValue = false; // Default to false if null/undefined somehow
            } else if (def.fieldType === CustomFieldType.MultiSelect && Array.isArray(rawValue) && rawValue.length === 0) {
              valueInputPayload.selectedOptionValues = []; // Send empty array for multi-select
            } else if (def.isRequired) {
              // A required field is null/undefined and not a boolean/empty multi-select - this is a validation issue
              // For now, we'll let it pass and backend validation or GraphQL type system might catch it if we send nothing.
              // Or, we could return null here to not send this field value at all if it's truly empty for a required field.
              // Let's try to send what we have, or nothing if truly empty and not boolean/multi-select.
               if (rawValue === undefined || rawValue === null) return null; // Skip if no value for non-boolean/non-multiselect
            } else {
                 // Optional field with no value
                 return null; 
            }
          }

          switch (def.fieldType) {
            case CustomFieldType.Text:
              valueInputPayload.stringValue = String(rawValue);
              break;
            case CustomFieldType.Dropdown: // Single select dropdown
              valueInputPayload.stringValue = String(rawValue);
              break;
            case CustomFieldType.Number: {
              const num = parseFloat(String(rawValue));
              if (!isNaN(num)) {
                valueInputPayload.numberValue = num;
              } else if (String(rawValue).trim() === '' && !def.isRequired) {
                // Optional number field, cleared by user, send nothing for this value part
              } else if (def.isRequired || String(rawValue).trim() !== '') {
                // Required number or optional with invalid data - this is a validation issue.
                // For now, don't set numberValue if invalid to let GraphQL validation catch missing required or wrong type.
                // Or, set an error and prevent submission. For now, we omit if invalid.
                 console.warn(`Invalid number for required field ${def.fieldName}: ${rawValue}`);
                 return null; // Don't submit this custom field if number is invalid
              }
              break;
            }
            case CustomFieldType.Boolean:
              valueInputPayload.booleanValue = Boolean(rawValue);
              break;
            case CustomFieldType.Date:
              // Ensure YYYY-MM-DD format if that's what your DateTime scalar expects for date-only
              valueInputPayload.dateValue = String(rawValue); 
              break;
            case CustomFieldType.MultiSelect:
              if (Array.isArray(rawValue)) {
                valueInputPayload.selectedOptionValues = rawValue.map(String);
              }
              break;
            default:
              console.warn(`Unhandled custom field type: ${def.fieldType} for field ${def.fieldName}`);
              return null; // Skip unhandled types
          }
          
          // Only return an entry if at least one value field was set in valueInputPayload
          if (Object.keys(valueInputPayload).length > 0) {
            return { definitionId: def.id, ...valueInputPayload };
          }
          return null; // If no value field was set (e.g. optional empty number)
        })
        .filter(cf => cf !== null) as CustomFieldValueInput[]; // Filter out any nulls from map
      
      dealInput.customFields = customFieldsSubmission;

      const probPercent = parseFloat(dealSpecificProbability);
      if (!isNaN(probPercent) && probPercent >= 0 && probPercent <= 100) {
        dealInput.deal_specific_probability = probPercent / 100;
      } else if (dealSpecificProbability.trim() === '') {
        dealInput.deal_specific_probability = null;
      }

      console.log('Calling createDealAction with input:', dealInput);

      const createdDeal = await createDealAction(dealInput);

      if (createdDeal) {
        const stageOfCreatedDeal = stages.find(s => s.id === createdDeal.stage_id);

        console.log('Deal created via store action:', createdDeal);
        toast({
          title: "Deal Created",
          description: `Deal &quot;${createdDeal.name}&quot; created${stageOfCreatedDeal ? ` in stage &quot;${stageOfCreatedDeal.name}&quot;` : ''}.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onDealCreated();
        onClose();
      } else {
        setError(dealsError || 'Failed to create deal. Please check store errors.');
      }

    } catch (err: unknown) {
      console.error('Unexpected error during handleSubmit:', err);
      let message = 'An unexpected error occurred.';
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Create New Deal</ModalHeader>
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
            <FormControl isRequired isInvalid={!name.trim() && error?.includes('name')}>
              <FormLabel>Deal Name</FormLabel>
              <Input 
                placeholder='Enter deal name' 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {error?.toLowerCase().includes('name') && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            {/* Custom Fields Rendering */}
            {customFieldsLoading && <Spinner label="Loading custom fields..." />}
            {customFieldsError && <Alert status="error" mb={4}><AlertIcon />Error loading custom fields: {customFieldsError}</Alert>}
            
            {activeDealCustomFields.map((def) => (
              <FormControl key={def.fieldName} isRequired={def.isRequired} mb={4}>
                <FormLabel htmlFor={def.fieldName}>{def.fieldLabel}</FormLabel>
                {(() => {
                  switch (def.fieldType) {
                    case CustomFieldType.Text:
                      return (
                        <Input
                          id={def.fieldName}
                          placeholder={def.fieldLabel}
                          value={customFieldFormValues[def.fieldName] || ''}
                          onChange={(e) => setCustomFieldFormValues(prev => ({ ...prev, [def.fieldName]: e.target.value }))}
                        />
                      );
                    case CustomFieldType.Number:
                      return (
                        <NumberInput
                          id={def.fieldName}
                          value={customFieldFormValues[def.fieldName] || ''}
                          onChange={(valueString) => setCustomFieldFormValues(prev => ({ ...prev, [def.fieldName]: valueString }))}
                          allowMouseWheel
                        >
                          <NumberInputField placeholder={def.fieldLabel} />
                        </NumberInput>
                      );
                    case CustomFieldType.Date:
                      return (
                        <Input
                          id={def.fieldName}
                          type="date"
                          value={customFieldFormValues[def.fieldName] || ''}
                          onChange={(e) => setCustomFieldFormValues(prev => ({ ...prev, [def.fieldName]: e.target.value }))}
                        />
                      );
                    case CustomFieldType.Boolean:
                      return (
                        <Switch
                          id={def.fieldName}
                          isChecked={customFieldFormValues[def.fieldName] || false}
                          onChange={(e) => setCustomFieldFormValues(prev => ({ ...prev, [def.fieldName]: e.target.checked }))}
                        />
                      );
                    case CustomFieldType.Dropdown:
                      return (
                        <Select
                          id={def.fieldName}
                          placeholder={`Select ${def.fieldLabel}...`}
                          value={customFieldFormValues[def.fieldName] || ''}
                          onChange={(e) => setCustomFieldFormValues(prev => ({ ...prev, [def.fieldName]: e.target.value }))}
                        >
                          {def.dropdownOptions?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </Select>
                      );
                    case CustomFieldType.MultiSelect:
                      return (
                        <CheckboxGroup 
                          value={customFieldFormValues[def.fieldName] || []} 
                          onChange={(values) => setCustomFieldFormValues(prev => ({ ...prev, [def.fieldName]: values }))}
                        >
                          <Stack direction="column">
                            {def.dropdownOptions?.map(opt => (
                              <Checkbox key={opt.value} value={opt.value}>{opt.label}</Checkbox>
                            ))}
                          </Stack>
                        </CheckboxGroup>
                      );
                    default:
                      return <Text color="red">Unsupported field type: {def.fieldType}</Text>;
                  }
                })()}
                {def.isRequired && 
                  (!customFieldFormValues[def.fieldName] || 
                    (Array.isArray(customFieldFormValues[def.fieldName]) && customFieldFormValues[def.fieldName].length === 0) ||
                    (typeof customFieldFormValues[def.fieldName] === 'string' && customFieldFormValues[def.fieldName].trim() === '')
                  ) && (
                  <Text fontSize="sm" color="red.500" mt={1}>This field is required.</Text>
                )}
              </FormControl>
            ))}

            <FormControl isRequired isInvalid={!localSelectedPipelineId && error?.toLowerCase().includes('pipeline')}>
              <FormLabel>Pipeline</FormLabel>
              <Select 
                placeholder={pipelinesLoading ? 'Loading pipelines...' : 'Select pipeline'}
                value={localSelectedPipelineId}
                onChange={(e) => setLocalSelectedPipelineId(e.target.value)}
                isDisabled={pipelinesLoading || !!pipelinesError}
              >
                 {!pipelinesLoading && !pipelinesError && pipelines.map((pipeline: Pipeline) => (
                    <option key={pipeline.id} value={pipeline.id}>
                        {pipeline.name}
                    </option>
                ))}
              </Select>
              {pipelinesError && <FormErrorMessage>Error loading pipelines: {pipelinesError}</FormErrorMessage>}
              {!localSelectedPipelineId && error?.toLowerCase().includes('pipeline') && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            <FormControl isRequired isInvalid={!selectedStageId && error?.toLowerCase().includes('stage')}>
              <FormLabel>Stage</FormLabel>
              <Select 
                placeholder={stagesLoading ? 'Loading stages...' : (localSelectedPipelineId ? 'Select stage' : 'Select pipeline first') }
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                isDisabled={!localSelectedPipelineId || stagesLoading || !!stagesError || stages.length === 0}
              >
                 {!stagesLoading && !stagesError && stages.map((stage: Stage) => (
                    <option key={stage.id} value={stage.id}>
                        {stage.name} (Order: {stage.order})
                    </option>
                ))}
              </Select>
              {stagesError && <FormErrorMessage>Error loading stages: {stagesError}</FormErrorMessage>}
              {!localSelectedPipelineId && stages.length === 0 && !stagesLoading && <FormErrorMessage>Select a pipeline to see stages.</FormErrorMessage>}
              {!selectedStageId && error?.toLowerCase().includes('stage') && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel>Amount</FormLabel>
              <NumberInput value={amount} onChange={(valueString) => setAmount(valueString)} precision={2}>
                <NumberInputField id='amount' placeholder='e.g., 5000.00' />
              </NumberInput>
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
              <FormLabel>Link to Person (Optional)</FormLabel>
              <Select 
                placeholder={peopleLoading ? 'Loading people...' : 'Select person'}
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                isDisabled={peopleLoading || !!peopleError}
              >
                 {!peopleLoading && !peopleError && people.map((person: Person) => (
                    <option key={person.id} value={person.id}>
                        {[person.first_name, person.last_name].filter(Boolean).join(' ') || person.email || `Person ID: ${person.id}`}
                    </option>
                ))}
              </Select>
            </FormControl>

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
            Save Deal
          </Button>
          <Button variant='ghost' onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateDealModal; 