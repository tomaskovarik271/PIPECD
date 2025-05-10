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
  VStack, // For layout
  FormErrorMessage,
  Alert, 
  AlertIcon,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { useAppStore } from '../stores/useAppStore'; // Import the store
import { usePeopleStore, Person } from '../stores/usePeopleStore'; // ADDED for people state + Person type
import { useDealsStore } from '../stores/useDealsStore'; // ADDED
import { DealInput } from '../generated/graphql/graphql'; // Removed Deal, Person, Stage

// Explicit Person type based on store data - REMOVED
// interface Person {
//   id: string;
//   first_name?: string | null;
//   last_name?: string | null;
//   email?: string | null;
//   // Add other fields if needed by component
// }

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealCreated: () => void; // Callback to refresh list
}

function CreateDealModal({ isOpen, onClose, onDealCreated }: CreateDealModalProps) {
  // Form State
  const [name, setName] = useState('');
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [amount, setAmount] = useState<string>(''); // Store as string for input
  const [personId, setPersonId] = useState<string>(''); // Renamed from contactId
  
  // Store State & Actions
  const pipelines = useAppStore((state) => state.pipelines);
  const stages = useAppStore((state) => state.stages);
  const fetchPipelines = useAppStore((state) => state.fetchPipelines);
  const fetchStages = useAppStore((state) => state.fetchStages);
  const pipelinesLoading = useAppStore((state) => state.pipelinesLoading);
  const pipelinesError = useAppStore((state) => state.pipelinesError);
  const stagesLoading = useAppStore((state) => state.stagesLoading);
  const stagesError = useAppStore((state) => state.stagesError);
  // const createDealAction = useAppStore((state) => state.createDeal); // REMOVED

  // ADDED: Deals state & actions from useDealsStore
  const { createDeal: createDealAction, dealsError, dealsLoading } = useDealsStore(); 

  // ADDED: People state from usePeopleStore
  const { people, fetchPeople, peopleLoading, peopleError } = usePeopleStore();

  // Component State
  const [isLoading, setIsLoading] = useState(false); // This local isLoading seems to shadow dealsLoading from store
  const [error, setError] = useState<string | null>(null); // This local error seems to shadow dealsError from store
  const toast = useToast(); // Initialize toast

  // Effect to fetch initial data (people & pipelines) when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form state when opening
      setName('');
      setSelectedPipelineId('');
      setSelectedStageId('');
      setAmount('');
      setPersonId('');
      setError(null);
      setIsLoading(false);
      
      // Fetch people and pipelines
      fetchPeople(); 
      fetchPipelines(); 
    }
  }, [isOpen, fetchPeople, fetchPipelines]);

  // Effect to fetch stages when a pipeline is selected
  useEffect(() => {
    if (selectedPipelineId) {
        setSelectedStageId(''); // Reset stage selection when pipeline changes
        fetchStages(selectedPipelineId);
    } else {
        // Clear stages if no pipeline is selected
        useAppStore.setState({ stages: [], stagesError: null, stagesLoading: false });
    }
  }, [selectedPipelineId, fetchStages]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
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
      // Prepare input for the store action, matching generated DealInput type
      const dealInput: DealInput = {
        name: name.trim(),
        stage_id: selectedStageId,
        amount: amount ? parseFloat(amount) : null,
        person_id: personId || null,
        // user_id will be set by the backend based on authenticated user
      };

      console.log('Calling createDealAction with input:', dealInput);

      // Use the store action
      const createdDeal = await createDealAction(dealInput);

      if (createdDeal) {
        console.log('Deal created via store action:', createdDeal);
        // Success
        toast({ // Use toast for success message
          title: "Deal Created",
          description: `Deal "${createdDeal.name}" created in stage "${createdDeal.stage.name}".`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onDealCreated(); // Trigger refresh on the parent page
        onClose();       // Close the modal
      } else {
        // Error is handled by the store action, potentially setting dealsError
        // We can pull the error from the store or use a generic message
        // const storeError = useAppStore.getState().dealsError; // REMOVED
        setError(dealsError || 'Failed to create deal. Please check store errors.'); // Use dealsError from useDealsStore
      }

    } catch (err: unknown) {
      // Catch unexpected errors during the action call itself (less likely)
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
          {error && ( // This will now show local error OR dealsError from store via setError
             <Alert status="error" mb={4} whiteSpace="pre-wrap"> {/* Allow wrapping for long errors */}
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
            <FormControl isRequired isInvalid={!name.trim() && error?.includes('name')}> {/* Basic error state check */}
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
                 {!pipelinesLoading && !pipelinesError && pipelines.map(pipeline => (
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
            isLoading={isLoading || dealsLoading} // Combine local submit loading with store loading
            leftIcon={(isLoading || dealsLoading) ? <Spinner size="sm" /> : undefined} // Show spinner if either is loading
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