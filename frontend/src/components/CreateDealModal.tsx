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
} from '@chakra-ui/react';
import { useAppStore } from '../stores/useAppStore';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useDealsStore } from '../stores/useDealsStore';
import { usePipelinesStore, Pipeline } from '../stores/usePipelinesStore';
import { useStagesStore, Stage } from '../stores/useStagesStore';
import { DealInput } from '../generated/graphql/graphql';

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
  

  const { pipelines, fetchPipelines, pipelinesLoading, pipelinesError } = usePipelinesStore();

  const { 
    stages,
    fetchStages,
    stagesLoading,
    stagesError
  } = useStagesStore();

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
      setIsLoading(false);
      
      fetchPeople(); 
      fetchPipelines(); 
    }
  }, [isOpen, fetchPeople, fetchPipelines]);

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
      };

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
          description: `Deal "${createdDeal.name}" created${stageOfCreatedDeal ? ` in stage "${stageOfCreatedDeal.name}"` : ''}.`,
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
              <NumberInput value={amount} onChange={(valueAsString) => setAmount(valueAsString)}>
                <NumberInputField placeholder='Enter amount (optional)' />
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