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
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast, 
  VStack,
  FormErrorMessage,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  HStack,
} from '@chakra-ui/react';
import { useAppStore, CreateStageInput } from '../stores/useAppStore';

interface CreateStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineId: string; // Pipeline to add the stage to
  onSuccess?: (newStageId: string) => void; // Optional callback
}

const CreateStageModal: React.FC<CreateStageModalProps> = ({ 
    isOpen, 
    onClose, 
    pipelineId,
    onSuccess 
}) => {
  const createStage = useAppStore((state) => state.createStage);
  // Determine next default order based on existing stages
  const nextOrder = useAppStore((state) => 
     state.stages.filter(s => s.pipeline_id === pipelineId).reduce((max, s) => Math.max(max, s.order), -1) + 1
  );
  
  const [stageName, setStageName] = useState('');
  const [order, setOrder] = useState<number>(nextOrder);
  const [dealProbability, setDealProbability] = useState<number | undefined>(undefined); // Start as undefined for placeholder

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Reset state when modal opens or pipeline changes
  useEffect(() => {
    if (isOpen) {
        setStageName('');
        setOrder(nextOrder); // Recalculate order when opening
        setDealProbability(undefined); // Reset probability
        setError(null);
        setIsSubmitting(false);
    }
  }, [isOpen, nextOrder]); // Rerun if modal opens or default order changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageName.trim()) {
        setError("Stage name cannot be empty.");
        return;
    }
    if (order < 0) {
        setError("Order must be a non-negative number.");
        return;
    }
     if (dealProbability !== undefined && (dealProbability < 0 || dealProbability > 100)) {
        setError("Deal probability must be between 0 and 100.");
        return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    const input: CreateStageInput = {
        name: stageName.trim(),
        order: order,
        pipeline_id: pipelineId,
        deal_probability: dealProbability === undefined ? null : dealProbability, // Send null if unset
    };
    
    try {
        const newStage = await createStage(input);
        if (newStage) {
            toast({
                title: 'Stage Created',
                description: `Stage "${newStage.name}" created successfully.`, 
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            onSuccess?.(newStage.id); // Call success callback
            onClose(); // Close modal
        } else {
            // Error from store
            const creationError = useAppStore.getState().stagesError;
            setError(creationError || 'Failed to create stage. Unknown error.');
        }
    } catch (err: any) { 
      console.error("Unexpected error during stage creation:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
      setter(value);
      if (error) {
          setError(null); // Clear error on any input change
      }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Create New Stage</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!!error && error.toLowerCase().includes('name')}> 
              <FormLabel htmlFor="stageName">Stage Name</FormLabel>
              <Input
                id="stageName"
                placeholder="e.g., Qualified Lead"
                value={stageName}
                onChange={(e) => handleInputChange(setStageName, e.target.value)}
                autoFocus
              />
              {error && error.toLowerCase().includes('name') && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            <FormControl isRequired isInvalid={!!error && error.toLowerCase().includes('order')}> 
              <FormLabel htmlFor="order">Order</FormLabel>
              <NumberInput
                 id="order"
                 value={order}
                 onChange={(_, valueAsNumber) => handleInputChange(setOrder, isNaN(valueAsNumber) ? 0 : valueAsNumber)}
                 min={0}
               >
                 <NumberInputField />
                 <NumberInputStepper>
                   <NumberIncrementStepper />
                   <NumberDecrementStepper />
                 </NumberInputStepper>
               </NumberInput>
              {error && error.toLowerCase().includes('order') && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isInvalid={!!error && error.toLowerCase().includes('probability')}> 
              <FormLabel htmlFor="dealProbability">Deal Probability (%) (Optional)</FormLabel>
               <HStack>
                 <Slider 
                   aria-label='deal-probability-slider' 
                   value={dealProbability ?? 0} // Use 0 for slider if undefined
                   min={0}
                   max={100}
                   step={5}
                   onChange={(val) => handleInputChange(setDealProbability, val)}
                   flex="1"
                 >
                   <SliderTrack>
                     <SliderFilledTrack />
                   </SliderTrack>
                   <SliderThumb />
                 </Slider>
                 <Input 
                   type="number" 
                   value={dealProbability === undefined ? '' : dealProbability} // Show empty if undefined
                   onChange={(e) => handleInputChange(setDealProbability, e.target.value === '' ? undefined : Number(e.target.value))}
                   placeholder="--"
                   width="80px" 
                   min={0} 
                   max={100}
                 />
               </HStack>
               <Text fontSize="xs" color="gray.500" mt={1}>Likelihood of winning a deal from this stage.</Text>
               {/* Button to clear probability */} 
               {dealProbability !== undefined && (
                   <Button size="xs" variant="link" mt={1} onClick={() => handleInputChange(setDealProbability, undefined)}>
                       Clear Probability
                   </Button>
               )}
               {error && error.toLowerCase().includes('probability') && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button 
             colorScheme="blue" 
             mr={3} 
             type="submit" 
             isLoading={isSubmitting} 
             isDisabled={!stageName.trim() || order < 0}
           > 
            Create Stage
          </Button>
          <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateStageModal; 