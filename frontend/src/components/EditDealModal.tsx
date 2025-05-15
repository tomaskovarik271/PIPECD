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
} from '@chakra-ui/react';
import { useAppStore } from '../stores/useAppStore';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useDealsStore, Deal } from '../stores/useDealsStore';
import { usePipelinesStore, Pipeline } from '../stores/usePipelinesStore';
import { useStagesStore } from '../stores/useStagesStore';
import type { DealInput, Stage } from '../generated/graphql/graphql';

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

  // People state from usePeopleStore
  const { people, fetchPeople, peopleLoading, peopleError } = usePeopleStore();

  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    if (isOpen) {
      fetchPeople(); 
      fetchPipelines();
      // Clear stages using useStagesStore when modal opens, before potentially fetching new ones
      useStagesStore.setState({ stages: [], stagesError: null, stagesLoading: false });
    }
  }, [isOpen, fetchPeople, fetchPipelines]); 

  useEffect(() => {
    if (deal) {
      setName(deal.name || '');
      setAmount(deal.amount != null ? String(deal.amount) : '');
      setPersonId(deal.person_id || ''); 
      setDealSpecificProbability(
        deal.deal_specific_probability != null 
          ? String(Math.round(deal.deal_specific_probability * 100)) 
          : ''
      );
      setError(null);
      setIsLoading(false);
      
      const pipelineIdFromDeal = deal.stage?.pipeline_id;
      const stageIdFromDeal = deal.stage_id || deal.stage?.id;
      
      setInitialPipelineId(pipelineIdFromDeal || null);
      setInitialStageId(stageIdFromDeal || null);
      setSelectedPipelineId(pipelineIdFromDeal || '');
      setSelectedStageId(''); 
      
    } else {
        setName('');
        setAmount('');
        setPersonId('');
        setSelectedPipelineId('');
        setSelectedStageId('');
        setInitialPipelineId(null);
        setInitialStageId(null);
        setDealSpecificProbability('');
    }
  }, [deal]);

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
      const updateInput: DealInput = {
        name: name.trim(),
        stage_id: selectedStageId,
        pipeline_id: selectedPipelineId,
        amount: amount ? parseFloat(amount) : null,
        person_id: personId || null,
      };

      const probPercent = parseFloat(dealSpecificProbability);
      if (!isNaN(probPercent) && probPercent >= 0 && probPercent <= 100) {
        updateInput.deal_specific_probability = probPercent / 100;
      } else if (dealSpecificProbability.trim() === '') {
        updateInput.deal_specific_probability = null;
      }

      const updatedDeal = await updateDealAction(deal.id, updateInput);

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