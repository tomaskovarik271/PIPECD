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
import { useAppStore } from '../stores/useAppStore'; // updateDealAction expects generated DealInput
import type { Deal, DealInput } from '../generated/graphql/graphql'; // Import generated types, removed GeneratedPerson, Pipeline, Stage

// Updated interface for the Deal data passed to the modal - REMOVED
// interface DealToEdit {
//   id: string;
//   name: string;
//   stage: { id: string; name: string; pipeline_id: string; }; 
//   stage_id?: string | null; 
//   amount?: number | null;
//   person_id?: string | null;
// }

// Add Pipeline/Stage types locally if needed (or rely on store types) - REMOVED (using imports)
// interface Pipeline { id: string; name: string; }
// interface Stage { id: string; name: string; order: number; pipeline_id: string; }

interface EditDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealUpdated: () => void; // Callback to refresh list
  deal: Deal | null; // Use generated Deal type for the deal data to edit
}

// Explicit Person type (matching store) - REMOVED
// interface Person {
//   id: string;
//   first_name?: string | null;
//   last_name?: string | null;
//   email?: string | null;
// }

function EditDealModal({ isOpen, onClose, onDealUpdated, deal }: EditDealModalProps) {
  // Form state
  const [name, setName] = useState('');
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [initialPipelineId, setInitialPipelineId] = useState<string | null>(null);
  const [initialStageId, setInitialStageId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [personId, setPersonId] = useState<string>(''); 

  // Store State & Actions (Selected individually)
  const people = useAppStore((state) => state.people); // Already GeneratedPerson[]
  const pipelines = useAppStore((state) => state.pipelines); // Already GeneratedPipeline[]
  const stages = useAppStore((state) => state.stages); // Already GeneratedStage[]
  const fetchPeople = useAppStore((state) => state.fetchPeople);
  const fetchPipelines = useAppStore((state) => state.fetchPipelines);
  const fetchStages = useAppStore((state) => state.fetchStages);
  const peopleLoading = useAppStore((state) => state.peopleLoading);
  const peopleError = useAppStore((state) => state.peopleError);
  const pipelinesLoading = useAppStore((state) => state.pipelinesLoading);
  const pipelinesError = useAppStore((state) => state.pipelinesError);
  const stagesLoading = useAppStore((state) => state.stagesLoading);
  const stagesError = useAppStore((state) => state.stagesError);
  const updateDealAction = useAppStore((state) => state.updateDeal); // Use store action

  // Component State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to fetch people & pipelines when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPeople(); 
      fetchPipelines();
      // Clear stages initially, will be repopulated by other effects
      useAppStore.setState({ stages: [], stagesError: null, stagesLoading: false });
    }
  }, [isOpen, fetchPeople, fetchPipelines]); 

  // Effect to update form state & initial IDs when the deal prop changes
  useEffect(() => {
    if (deal) {
      setName(deal.name || '');
      setAmount(deal.amount != null ? String(deal.amount) : '');
      setPersonId(deal.person_id || ''); // deal.person_id is from generated Deal type
      setError(null);
      setIsLoading(false);
      
      // Extract initial pipeline and stage IDs from the deal (deal.stage is GeneratedStage)
      const pipelineIdFromDeal = deal.stage?.pipeline_id;
      const stageIdFromDeal = deal.stage_id || deal.stage?.id;
      
      setInitialPipelineId(pipelineIdFromDeal || null);
      setInitialStageId(stageIdFromDeal || null);
      setSelectedPipelineId(pipelineIdFromDeal || '');
      // Stage will be set by the next effect after stages load
      setSelectedStageId(''); // Reset stage initially
      
    } else {
        // Reset form if deal becomes null (e.g., modal closes)
        setName('');
        setAmount('');
        setPersonId('');
        setSelectedPipelineId('');
        setSelectedStageId('');
        setInitialPipelineId(null);
        setInitialStageId(null);
    }
  }, [deal]);

  // Effect to fetch stages when a pipeline is selected OR initial pipeline ID is set
  useEffect(() => {
    const targetPipelineId = selectedPipelineId || initialPipelineId;
    if (targetPipelineId) {
        fetchStages(targetPipelineId);
    } else {
        useAppStore.setState({ stages: [], stagesError: null, stagesLoading: false });
    }
  }, [selectedPipelineId, initialPipelineId, fetchStages]);

  // Effect to set the initial stage once stages have loaded for the initial pipeline
  useEffect(() => {
    if (initialStageId && initialPipelineId && selectedPipelineId === initialPipelineId && stages.length > 0) {
       // Check if initial stage exists in the loaded stages
       const stageExists = stages.some(s => s.id === initialStageId);
       if (stageExists) {
           setSelectedStageId(initialStageId);
           setInitialStageId(null); // Prevent re-setting if stages reload
       } else {
           console.warn(`Initial stage ID ${initialStageId} not found in loaded stages for pipeline ${initialPipelineId}`);
           // Optionally clear selection or show an error
           // setSelectedStageId(''); 
           setInitialStageId(null); // Still mark as processed
       }
    }
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
      // Prepare input for the store action, using generated DealInput
      const updateInput: DealInput = {
        name: name.trim(),
        stage_id: selectedStageId,
        amount: amount ? parseFloat(amount) : null,
        person_id: personId || null,
        // user_id is not part of DealInput for updates, it's set by backend or immutable here
      };

      console.log('Calling updateDealAction with ID:', deal.id, 'Input:', updateInput);

      // Call the store action
      const updatedDeal = await updateDealAction(deal.id, updateInput);

      if (updatedDeal) {
          console.log('Deal updated via store action:', updatedDeal);
          // Success
          onDealUpdated(); // Trigger refresh
          onClose();       // Close modal
      } else {
          // Error is handled by the store action, potentially setting dealsError
          const storeError = useAppStore.getState().dealsError;
          setError(storeError || 'Failed to update deal. Please check store errors.');
      }

    } catch (err: unknown) {
      // Catch unexpected errors during the action call itself
      console.error('Unexpected error during handleSubmit:', err);
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

  // Render null if the modal shouldn't be open or no deal is provided
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
            {/* Form Controls similar to CreateDealModal, but using state initialized by useEffect */}
            <FormControl isRequired isInvalid={!name.trim() && error?.includes('name')}>
              <FormLabel>Deal Name</FormLabel>
              <Input 
                placeholder='Enter deal name' 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {error?.toLowerCase().includes('name') && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            {/* Pipeline Selection */} 
            <FormControl isRequired isInvalid={!selectedPipelineId && error?.toLowerCase().includes('pipeline')}> 
              <FormLabel>Pipeline</FormLabel>
              <Select 
                placeholder={pipelinesLoading ? 'Loading pipelines...' : (pipelines.length > 0 ? 'Select pipeline' : 'No pipelines available')}
                value={selectedPipelineId}
                onChange={(e) => setSelectedPipelineId(e.target.value)}
                isDisabled={pipelinesLoading || !!pipelinesError || pipelines.length === 0}
              >
                 {!pipelinesLoading && !pipelinesError && pipelines.map(pipeline => (
                    <option key={pipeline.id} value={pipeline.id}>
                        {pipeline.name}
                    </option>
                ))}
              </Select>
              {pipelinesError && <FormErrorMessage>Error loading pipelines: {pipelinesError}</FormErrorMessage>}
              {pipelines.length === 0 && !pipelinesLoading && <FormErrorMessage>No pipelines found. Please create one first.</FormErrorMessage>}
            </FormControl>

            {/* Stage Selection */} 
            <FormControl isRequired isInvalid={!selectedStageId && error?.toLowerCase().includes('stage')}> 
              <FormLabel>Stage</FormLabel>
              <Select 
                placeholder={stagesLoading ? 'Loading stages...' : (selectedPipelineId && stages.length > 0 ? 'Select stage' : (selectedPipelineId ? 'No stages in pipeline' : 'Select pipeline first'))}
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                isDisabled={!selectedPipelineId || stagesLoading || !!stagesError || stages.length === 0}
              >
                 {!stagesLoading && !stagesError && stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                        {stage.name} (Order: {stage.order})
                    </option>
                ))}
              </Select>
              {stagesError && <FormErrorMessage>Error loading stages: {stagesError}</FormErrorMessage>}
              {selectedPipelineId && stages.length === 0 && !stagesLoading && <FormErrorMessage>No stages found for this pipeline.</FormErrorMessage>}
            </FormControl>

            {/* Amount */} 
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <NumberInput value={amount} onChange={(valueAsString) => setAmount(valueAsString)}>
                <NumberInputField placeholder='Enter amount (optional)' />
              </NumberInput>
            </FormControl>

            {/* Person Selection */} 
            <FormControl>
              <FormLabel>Link to Person (Optional)</FormLabel>
              <Select 
                placeholder={peopleLoading ? 'Loading people...' : (people.length > 0 ? 'Select person' : 'No people available')}
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                isDisabled={peopleLoading || !!peopleError || people.length === 0}
              >
                {/* people array is already GeneratedPerson[] from the store */}
                 {!peopleLoading && !peopleError && people.map(person => (
                    <option key={person.id} value={person.id}>
                        {[person.first_name, person.last_name].filter(Boolean).join(' ') || person.email || `Person ID: ${person.id}`}
                    </option>
                ))}
              </Select>
              {people.length === 0 && !peopleLoading && <FormErrorMessage>No people found. Please create one first.</FormErrorMessage>}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button 
            colorScheme="blue" 
            mr={3} 
            type="submit" 
            isLoading={isLoading} 
            leftIcon={isLoading ? <Spinner size="sm" /> : undefined}
          >
            Save Changes
          </Button>
          <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditDealModal; 