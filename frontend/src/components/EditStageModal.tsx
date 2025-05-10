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
  HStack,
  Text,
} from '@chakra-ui/react';
import { useAppStore, Stage } from '../stores/useAppStore';
import type { UpdateStageInput } from '../generated/graphql/graphql';

interface EditStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: Stage | null; // Stage data to edit
  onSuccess?: (updatedStageId: string) => void; // Optional callback
}

const EditStageModal: React.FC<EditStageModalProps> = ({ 
    isOpen, 
    onClose, 
    stage,
    onSuccess 
}) => {
  const updateStage = useAppStore((state) => state.updateStage);
  
  const [stageName, setStageName] = useState('');
  const [order, setOrder] = useState<number>(0);
  const [dealProbability, setDealProbability] = useState<number | undefined>(undefined);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Initialize form state when modal opens or stage data changes
  useEffect(() => {
    if (isOpen && stage) {
        setStageName(stage.name || '');
        setOrder(stage.order ?? 0);
        setDealProbability(stage.deal_probability === null ? undefined : stage.deal_probability);
        setError(null);
        setIsSubmitting(false);
    } else if (!isOpen) {
        // Optionally reset when closing, though it resets on open anyway
        setStageName('');
        setOrder(0);
        setDealProbability(undefined);
        setError(null);
    }
  }, [isOpen, stage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stage) return; // Should not happen if modal is open

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
    
    const input: UpdateStageInput = {
        // Only include fields that have actually changed?
        // Or just send all editable fields? Let's send all for simplicity.
        name: stageName.trim(),
        order: order,
        deal_probability: dealProbability === undefined ? null : dealProbability,
    };
    
    // Filter out fields that haven't changed compared to the original stage
    const changes: UpdateStageInput = {};
    if (input.name !== stage.name) changes.name = input.name;
    if (input.order !== stage.order) changes.order = input.order;
    const currentProb = stage.deal_probability === null ? undefined : stage.deal_probability;
    if ((input.deal_probability === null ? undefined : input.deal_probability) !== currentProb) changes.deal_probability = input.deal_probability;

    if (Object.keys(changes).length === 0) {
        setError("No changes detected.");
        setIsSubmitting(false);
        return;
    }

    try {
        const updatedStage = await updateStage(stage.id, changes); // Send only changes
        if (updatedStage) {
            toast({
                title: 'Stage Updated',
                description: `Stage "${updatedStage.name}" updated successfully.`, 
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            onSuccess?.(updatedStage.id); 
            onClose(); // Close modal
        } else {
            const updateError = useAppStore.getState().stagesError;
            setError(updateError || 'Failed to update stage. Unknown error.');
        }
    } catch (err: unknown) {
      console.error("Unexpected error during stage update:", err);
      let message = 'An unexpected error occurred.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
    } finally {
        setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
      setter(value);
      if (error) {
          setError(null); 
      }
  }
  
  // Don't render if closed or no stage data
  if (!isOpen || !stage) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Edit Stage: {stage.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
             {/* Form Controls copied from CreateStageModal, check props/values */} 
             <FormControl isRequired isInvalid={!!error && error.toLowerCase().includes('name')}> 
              <FormLabel htmlFor="stageName">Stage Name</FormLabel>
              <Input
                id="stageName"
                placeholder="e.g., Qualified Lead"
                value={stageName}
                onChange={(e) => handleInputChange(setStageName, e.target.value)}
                autoFocus // eslint-disable-line jsx-a11y/no-autofocus
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
                   value={dealProbability ?? 0} 
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
                   value={dealProbability === undefined ? '' : dealProbability} 
                   onChange={(e) => handleInputChange(setDealProbability, e.target.value === '' ? undefined : Number(e.target.value))}
                   placeholder="--"
                   width="80px" 
                   min={0} 
                   max={100}
                 />
               </HStack>
               <Text fontSize="xs" color="gray.500" mt={1}>Likelihood of winning a deal from this stage.</Text>
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
            Save Changes
          </Button>
          <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditStageModal; 