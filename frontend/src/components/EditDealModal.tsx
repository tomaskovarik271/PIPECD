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
import { gql } from 'graphql-request';
import { useAppStore, UpdateDealInput } from '../stores/useAppStore'; // Import store and input type

// Updated interface for the Deal data passed to the modal
interface DealToEdit {
  id: string;
  name: string;
  // stage: string; // Old
  stage: { id: string; name: string; pipeline_id: string; }; // Need pipeline_id here!
  stage_id?: string | null; // Keep existing stage_id if available
  amount?: number | null;
  person_id?: string | null;
}

// Add Pipeline/Stage types locally if needed (or rely on store types)
// interface Pipeline { id: string; name: string; }
// interface Stage { id: string; name: string; order: number; pipeline_id: string; }

interface EditDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealUpdated: () => void; // Callback to refresh list
  deal: DealToEdit | null; // The deal data to edit
}

// Explicit Person type (matching store)
interface Person {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

function EditDealModal({ isOpen, onClose, onDealUpdated, deal }: EditDealModalProps) {
  // Form state
  const [name, setName] = useState('');
  // const [stage, setStage] = useState(dealStages[0]); // REMOVED old stage
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [initialPipelineId, setInitialPipelineId] = useState<string | null>(null);
  const [initialStageId, setInitialStageId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [personId, setPersonId] = useState<string>(''); 

  // Store State & Actions (Selected individually)
  const people = useAppStore((state) => state.people);
  const pipelines = useAppStore((state) => state.pipelines);
  const stages = useAppStore((state) => state.stages);
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
      // Clear stages? Or wait for pipeline selection?
      useAppStore.setState({ stages: [], stagesError: null, stagesLoading: false });
    }
  }, [isOpen, fetchPeople, fetchPipelines]); 

  // Effect to update form state & initial IDs when the deal prop changes
  useEffect(() => {
    if (deal) {
      setName(deal.name || '');
      setAmount(deal.amount != null ? String(deal.amount) : '');
      setPersonId(deal.person_id || '');
      setError(null);
      setIsLoading(false);
      
      // Extract initial pipeline and stage IDs from the deal
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
      // Prepare input for the store action
      const updateInput: UpdateDealInput = {
        name: name.trim(),
        stage_id: selectedStageId,
        amount: amount ? parseFloat(amount) : null,
        person_id: personId || null,
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

    } catch (err: any) {
      // Catch unexpected errors during the action call itself
      console.error('Unexpected error during handleSubmit:', err);
      setError(err.message || 'An unexpected error occurred while updating deal.');
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
          {peopleError && ( // Use renamed state variable
             <Alert status="warning" mb={4}>
                <AlertIcon />
                {peopleError} {/* Use renamed state variable */}
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
                placeholder={pipelinesLoading ? 'Loading pipelines...' : 'Select pipeline'}
                value={selectedPipelineId}
                onChange={(e) => setSelectedPipelineId(e.target.value)}
                isDisabled={pipelinesLoading || !!pipelinesError}
              >
                 {!pipelinesLoading && !pipelinesError && pipelines.map(pipeline => (
                    <option key={pipeline.id} value={pipeline.id}>
                        {pipeline.name}
                    </option>
                ))}
              </Select>
              {pipelinesError && <FormErrorMessage>Error loading pipelines: {pipelinesError}</FormErrorMessage>}
              {!selectedPipelineId && error?.toLowerCase().includes('pipeline') && <FormErrorMessage>{error}</FormErrorMessage>} 
            </FormControl>

            {/* Stage Selection */} 
            <FormControl isRequired isInvalid={!selectedStageId && error?.toLowerCase().includes('stage')}> 
              <FormLabel>Stage</FormLabel>
              <Select 
                placeholder={stagesLoading ? 'Loading stages...' : (selectedPipelineId ? 'Select stage' : 'Select pipeline first') }
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
              {!selectedPipelineId && stages.length === 0 && <FormErrorMessage>Select a pipeline to see stages.</FormErrorMessage>}
              {!selectedStageId && error?.toLowerCase().includes('stage') && <FormErrorMessage>{error}</FormErrorMessage>} 
            </FormControl>

            <FormControl>
              <FormLabel>Amount</FormLabel>
              <NumberInput value={amount} onChange={(valueAsString) => setAmount(valueAsString)}>
                <NumberInputField placeholder='Enter amount (optional)' />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Link to Person (Optional)</FormLabel> {/* Renamed label */}
              <Select 
                placeholder={peopleLoading ? 'Loading people...' : 'Select person'} /* Renamed placeholder */
                value={personId} /* Use renamed state variable */
                onChange={(e) => setPersonId(e.target.value)} /* Use renamed state setter */
                isDisabled={peopleLoading || !!peopleError} /* Use renamed state variable */
              >
                 {/* Add an option for 'None' or empty selection */}
                 <option value="">-- None --</option>
                 {/* Iterate over people state */}
                 {!peopleLoading && !peopleError && (people as Person[]).map(person => ( // Cast to explicit Person type
                    <option key={person.id} value={person.id}>
                         {[person.first_name, person.last_name].filter(Boolean).join(' ') || person.email || `Person ID: ${person.id}`}
                    </option>
                ))}
              </Select>
            </FormControl>

             {/* Removed outdated TODO */}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button 
            colorScheme='teal' 
            mr={3} 
            type="submit" 
            isLoading={isLoading}
            leftIcon={isLoading ? <Spinner size="sm" /> : undefined}
          >
            Update Deal
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