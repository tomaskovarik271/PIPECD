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
import { useAppStore } from '../stores/useAppStore';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useDealsStore, Deal } from '../stores/useDealsStore';
import { usePipelinesStore, Pipeline } from '../stores/usePipelinesStore';
import { useStagesStore } from '../stores/useStagesStore';
import type { DealInput, Stage } from '../generated/graphql/graphql';
import { 
  CustomFieldDefinition, 
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
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [initialPipelineId, setInitialPipelineId] = useState<string | null>(null);
  const [initialStageId, setInitialStageId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [personId, setPersonId] = useState<string>(''); 
  const [dealSpecificProbability, setDealSpecificProbability] = useState<string>('');
  const [expectedCloseDate, setExpectedCloseDate] = useState<string>('');

  // Custom Fields State
  const [activeDealCustomFields, setActiveDealCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [customFieldFormValues, setCustomFieldFormValues] = useState<Record<string, any>>({});

  // Store State & Actions
  const { pipelines, fetchPipelines, pipelinesLoading, pipelinesError } = usePipelinesStore();

  // Stage related state from useStagesStore
  const {
    stages,
    fetchStages,
    stagesLoading,
    stagesError
  } = useStagesStore();

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

  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    if (isOpen) {
      fetchPeople(); 
      fetchPipelines();
      // Fetch active custom field definitions for Deals
      fetchCustomFieldDefinitions(CustomFieldEntityType.Deal, false); 
      // Clear stages using useStagesStore when modal opens, before potentially fetching new ones
      useStagesStore.setState({ stages: [], stagesError: null, stagesLoading: false });
    }
  }, [isOpen, fetchPeople, fetchPipelines, fetchCustomFieldDefinitions]); 

  useEffect(() => {
    if (deal) {
      console.log("[EditDealModal] Initializing form. Deal data:", JSON.stringify(deal, null, 2));
      console.log("[EditDealModal] Initializing form. Active Deal Custom Field Definitions:", JSON.stringify(activeDealCustomFields, null, 2));

      setName(deal.name || '');
      setAmount(deal.amount != null ? String(deal.amount) : '');
      setPersonId(deal.person_id || ''); 
      setDealSpecificProbability(
        deal.deal_specific_probability != null 
          ? String(Math.round(deal.deal_specific_probability * 100)) 
          : ''
      );
      setExpectedCloseDate(deal.expected_close_date ? new Date(deal.expected_close_date).toISOString().split('T')[0] : '');
      setError(null);
      setIsLoading(false);
      
      const pipelineIdFromDeal = deal.stage?.pipeline_id;
      const stageIdFromDeal = deal.stage_id || deal.stage?.id;
      
      setInitialPipelineId(pipelineIdFromDeal || null);
      setInitialStageId(stageIdFromDeal || null);
      setSelectedPipelineId(pipelineIdFromDeal || '');
      setSelectedStageId(''); 
      
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
        setSelectedPipelineId('');
        setSelectedStageId('');
        setInitialPipelineId(null);
        setInitialStageId(null);
        setDealSpecificProbability('');
        setExpectedCloseDate('');
        // Reset custom field form values if deal is null
        setCustomFieldFormValues({});
    }
  }, [deal, activeDealCustomFields]); // Depend on activeDealCustomFields to re-init if they load after deal

  useEffect(() => {
    // This effect is responsible for fetching stages for the pipeline
    // that is currently relevant to the modal. This could be the deal's initial pipeline
    // (via selectedPipelineId being set from `deal` prop) or a pipeline chosen by the user in the modal's dropdown.
    
    // `selectedPipelineId` is the primary driver here.
    // It's updated when `deal` changes (by the useEffect above) or when the user selects a new pipeline in this modal.
    if (selectedPipelineId) { 
        console.log(`[EditDealModal] Fetching stages for selected pipeline in modal: ${selectedPipelineId}. Deal ID: ${deal?.id}`);
        // Effect 1 (on isOpen) clears global stages. This call will populate them for the current pipeline context.
        fetchStages(selectedPipelineId);
    } else {
        // This case might occur if a deal has no pipeline and modal opens, or if somehow selection is cleared.
        console.log(`[EditDealModal] No selectedPipelineId for modal. Clearing stages in store.`);
        useStagesStore.setState({ stages: [], stagesError: null, stagesLoading: false });
    }
    // We depend on `selectedPipelineId` because if the user changes it in the modal, we need to refetch.
    // We depend on `deal` because if a new deal is passed in (even if `selectedPipelineId` happens to resolve to the same string value
    // as the previous deal), we still need this effect to run to ensure `fetchStages` is called for the new deal's context
    // after Effect 1 has cleared the stages.
    // `fetchStages` itself is a stable dependency.
  }, [selectedPipelineId, deal, fetchStages]); // Key: `deal` ensures re-run for new deal, `selectedPipelineId` for dropdown change

  useEffect(() => {
    console.log(`[EditDealModal] Effect 4 CHECK: initialStageId=${initialStageId}, initialPipelineId=${initialPipelineId}, selectedPipelineIdModal=${selectedPipelineId}, stages_length=${stages?.length}`);
    if (initialStageId && initialPipelineId && selectedPipelineId === initialPipelineId && Array.isArray(stages) && stages.length > 0) {
       console.log(`[EditDealModal] Effect 4: Conditions MET. Checking for stage existence. initialStageId=${initialStageId}`);
       const stageExists = stages.some((s: Stage) => s.id === initialStageId);
       console.log(`[EditDealModal] Effect 4: Stage ${initialStageId} exists in loaded stages: ${stageExists}`);
       if (stageExists) {
           console.log(`[EditDealModal] Effect 4: Setting selectedStageId to: ${initialStageId}`);
           setSelectedStageId(initialStageId);
           setInitialStageId(null); // Prevent re-running for this reason
       } else {
           console.warn(`[EditDealModal] Effect 4: Initial stage ID ${initialStageId} not found in loaded stages for pipeline ${initialPipelineId}. Current stages:`, stages);
           setInitialStageId(null); 
       }
    } else {
      console.log(`[EditDealModal] Effect 4: Conditions NOT MET or stages not loaded/empty.`);
    }
    // Keep `setSelectedStageId` out of deps as per React guidelines for setters if not strictly needed for logic re-evaluation based on its change
  }, [stages, initialStageId, initialPipelineId, selectedPipelineId]);

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
    if (!deal) return; 

    setIsLoading(true);
    setError(null);

    if (!name.trim()) {
      setError('Deal name is required.');
      setIsLoading(false);
      return;
    }
    if (!selectedPipelineId) {
        setError('Pipeline selection is required.');
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
        pipeline_id: selectedPipelineId,
        amount: amount ? parseFloat(amount) : undefined,
        person_id: personId || undefined,
        expected_close_date: expectedCloseDate ? new Date(expectedCloseDate).toISOString() : undefined,
      };

      const probPercent = parseFloat(dealSpecificProbability);
      if (!isNaN(probPercent) && probPercent >= 0 && probPercent <= 100) {
        dealInput.deal_specific_probability = probPercent / 100;
      } else if (dealSpecificProbability.trim() === '') {
        dealInput.deal_specific_probability = null;
      }

      // Prepare custom fields for submission
      const customFieldsToSubmit: CustomFieldValueInput[] = [];
      if (activeDealCustomFields.length > 0) {
        for (const def of activeDealCustomFields) {
          const rawValue = customFieldFormValues[def.fieldName];
          let valueToSet: CustomFieldValueInput | null = null;

          // Only include the field if it has a value or if it's required (even if empty, to allow backend validation)
          // Or if it's boolean (false is a valid value)
          // Or if it's a multi-select (empty array is a valid value to clear it)
          const isValueSet = rawValue !== undefined && rawValue !== null && rawValue !== '';
          const isMultiSelectWithValue = def.fieldType === CustomFieldType.MultiSelect && Array.isArray(rawValue);
          const isBoolean = def.fieldType === CustomFieldType.Boolean;

          if (isValueSet || isBoolean || isMultiSelectWithValue || def.isRequired) {
            valueToSet = { definitionId: def.id };
            switch (def.fieldType) {
              case CustomFieldType.Text:
                valueToSet.stringValue = String(rawValue || '');
                break;
              case CustomFieldType.Number:
                const num = parseFloat(String(rawValue));
                valueToSet.numberValue = !isNaN(num) ? num : null;
                // If required and empty/invalid, backend Zod schema should catch it if it expects a number.
                // Frontend could also add validation here.
                if (valueToSet.numberValue === null && String(rawValue).trim() !== '') {
                    // If it was not an empty string but failed to parse, treat as explicit null.
                    // Or, if required, this might be an error state to flag earlier.
                } else if (String(rawValue).trim() === '' && !def.isRequired) {
                    valueToSet = null; // Don't submit if optional and empty
                }
                break;
              case CustomFieldType.Date:
                valueToSet.dateValue = rawValue ? new Date(rawValue).toISOString() : null;
                 if (!rawValue && !def.isRequired) valueToSet = null;
                break;
              case CustomFieldType.Boolean:
                valueToSet.booleanValue = Boolean(rawValue || false);
                break;
              case CustomFieldType.Dropdown:
                valueToSet.stringValue = String(rawValue || '');
                 if (!rawValue && !def.isRequired) valueToSet = null; // Don't submit if optional and unselected
                break;
              case CustomFieldType.MultiSelect:
                valueToSet.selectedOptionValues = Array.isArray(rawValue) ? rawValue.map(String) : [];
                // For multi-select, an empty array is a valid value (means nothing selected)
                // So, we don't nullify `valueToSet` even if `rawValue` is empty array.
                break;
            }
          }
          if (valueToSet) {
            customFieldsToSubmit.push(valueToSet);
          }
        }
        dealInput.customFields = customFieldsToSubmit;
      } else {
        // If there are no active custom fields, ensure customFields is not part of payload 
        // or explicitly an empty array if the backend expects it for updates to clear all.
        // Based on current backend, sending undefined is fine (it won't try to update custom_field_values).
        // If we wanted to clear all CFs, we'd send `customFields: []`.
      }

      const updatedDeal = await updateDealAction(deal.id, dealInput);

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

  // Filter stages for the dropdown based on the locally selected pipeline in the modal
  const filteredStagesForModal = selectedPipelineId 
    ? stages.filter((stage: Stage) => stage.pipeline_id === selectedPipelineId)
    : []; // If no pipeline selected in modal, show no stages

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
            <FormControl isRequired isInvalid={!name.trim() && error?.includes('name')}>
              <FormLabel>Deal Name</FormLabel>
              <Input 
                placeholder='Enter deal name' 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {error?.toLowerCase().includes('name') && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            <FormControl isRequired isInvalid={!selectedPipelineId && error?.toLowerCase().includes('pipeline')}>
              <FormLabel>Pipeline</FormLabel>
              <Select 
                placeholder={pipelinesLoading ? 'Loading pipelines...' : 'Select pipeline'}
                value={selectedPipelineId}
                onChange={(e) => setSelectedPipelineId(e.target.value)}
                isDisabled={pipelinesLoading || !!pipelinesError}
              >
                 {!pipelinesLoading && !pipelinesError && Array.isArray(pipelines) && pipelines.map((pipeline: Pipeline) => (
                    <option key={pipeline.id} value={pipeline.id}>
                        {pipeline.name}
                    </option>
                ))}
              </Select>
              {pipelinesError && <FormErrorMessage>Error loading pipelines: {pipelinesError}</FormErrorMessage>}
              {!selectedPipelineId && error?.toLowerCase().includes('pipeline') && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            <FormControl isRequired isInvalid={!selectedStageId && error?.toLowerCase().includes('stage')}>
              <FormLabel>Stage</FormLabel>
              <Select 
                placeholder={stagesLoading ? 'Loading stages...' : (selectedPipelineId ? (filteredStagesForModal.length > 0 ? 'Select stage' : 'No stages for this pipeline') : 'Select pipeline first') }
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                isDisabled={!selectedPipelineId || stagesLoading || !!stagesError || filteredStagesForModal.length === 0}
              >
                 {!stagesLoading && !stagesError && filteredStagesForModal.map((stage: Stage) => (
                    <option key={stage.id} value={stage.id}>
                        {stage.name} (Order: {stage.order})
                    </option>
                ))}
              </Select>
              {stagesError && <FormErrorMessage>Error loading stages: {stagesError}</FormErrorMessage>}
              {!selectedPipelineId && stages.length === 0 && !stagesLoading && <FormErrorMessage>Select a pipeline to see stages.</FormErrorMessage>}
              {selectedPipelineId && !stagesLoading && !stagesError && filteredStagesForModal.length === 0 && <FormErrorMessage>This pipeline has no stages defined.</FormErrorMessage>}
              {!selectedStageId && error?.toLowerCase().includes('stage') && <FormErrorMessage>{error}</FormErrorMessage>}
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