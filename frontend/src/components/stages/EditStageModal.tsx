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
  VStack 
} from '@chakra-ui/react';
import { useAppStore, Stage } from '../../stores/useAppStore'; // Import Stage 
import type { UpdateStageInput as GeneratedUpdateStageInput } from '../../generated/graphql/graphql'; // Corrected import

interface EditStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: Stage | null; // Stage to edit
  onSuccess?: (updatedStageId: string) => void; 
}

const EditStageModal: React.FC<EditStageModalProps> = ({ isOpen, onClose, stage, onSuccess }) => {
  const [stageName, setStageName] = useState('');
  const [stageOrder, setStageOrder] = useState<number | string>(0);
  const [dealProbability, setDealProbability] = useState<number | string>('');
  const [isLoading, setIsLoading] = useState(false);
  const updateStage = useAppStore((state) => state.updateStage);
  const toast = useToast();

  // Pre-fill form when stage prop changes
  useEffect(() => {
    if (stage) {
      setStageName(stage.name);
      setStageOrder(stage.order);
      setDealProbability(stage.deal_probability ?? ''); // Use empty string if null/undefined
    } else {
        // Clear form if no stage is provided (shouldn't happen if used correctly)
        setStageName('');
        setStageOrder(0);
        setDealProbability('');
    }
  }, [stage]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
        setIsLoading(false);
        // Optionally reset fields here too, though pre-fill handles opening
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stage) {
        toast({ title: "No stage selected for editing.", status: 'error', duration: 3000, isClosable: true });
        return;
    }
    
    // Validation
    if (!stageName.trim()) {
      toast({ title: "Stage name cannot be empty.", status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    const orderNum = parseInt(String(stageOrder), 10);
    if (isNaN(orderNum) || orderNum < 0) {
         toast({ title: "Order must be a non-negative number.", status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    let probabilityNum: number | null = null;
    if (String(dealProbability).trim() !== '') {
        probabilityNum = parseFloat(String(dealProbability));
        if (isNaN(probabilityNum) || probabilityNum < 0 || probabilityNum > 100) { // Assuming 0-100
            toast({ title: "Deal probability must be between 0 and 100 (or empty).", status: 'warning', duration: 3000, isClosable: true });
            return;
        }
    }
    
    // Construct update payload - only include changed fields
    const updates: GeneratedUpdateStageInput = {}; // Use the aliased import
    let hasChanges = false;
    if (stageName.trim() !== stage.name) {
        updates.name = stageName.trim();
        hasChanges = true;
    }
    if (orderNum !== stage.order) {
        updates.order = orderNum;
        hasChanges = true;
    }
    // Check probability change carefully (null vs. number)
    const originalProbabilityDecimal = stage.deal_probability ?? null;
    const newProbabilityDecimal = probabilityNum === null ? null : probabilityNum / 100; // Convert new value
    if (newProbabilityDecimal !== originalProbabilityDecimal) {
        updates.deal_probability = newProbabilityDecimal;
        hasChanges = true;
    }

    if (!hasChanges) {
         toast({ title: "No changes detected.", status: 'info', duration: 2000, isClosable: true });
         onClose(); 
         return;
    }
    
    setIsLoading(true);
    try {
      const updatedStage = await updateStage(stage.id, updates);
      
      if (updatedStage) {
        toast({ title: "Stage updated successfully.", status: 'success', duration: 3000, isClosable: true });
        onSuccess?.(updatedStage.id);
        onClose(); // Close modal
      } else {
        toast({ title: "Failed to update stage.", description: "Please check console or try again.", status: 'error', duration: 5000, isClosable: true });
      }
    } catch (error: unknown) { // Changed from any to unknown
        console.error("Error in edit stage modal submit:", error);
        let message = "Could not update stage.";
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
        toast({ title: "An error occurred.", description: message, status: 'error', duration: 5000, isClosable: true });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Edit Stage</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Stage Name</FormLabel>
              <Input 
                placeholder="e.g., Qualification"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                autoFocus // eslint-disable-line jsx-a11y/no-autofocus
              />
            </FormControl>
            
            <FormControl isRequired>
                <FormLabel>Order</FormLabel>
                <NumberInput 
                    min={0} 
                    value={stageOrder} 
                    onChange={(valueAsString, valueAsNumber) => setStageOrder(isNaN(valueAsNumber) ? valueAsString : valueAsNumber)} 
                >
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
            </FormControl>
            
            <FormControl>
                <FormLabel>Deal Probability (%)</FormLabel>
                <NumberInput 
                    min={0} 
                    max={100} 
                    value={dealProbability} 
                    onChange={(valueAsString, valueAsNumber) => setDealProbability(isNaN(valueAsNumber) ? valueAsString : valueAsNumber)} 
                    allowMouseWheel
                >
                    <NumberInputField placeholder="Optional (e.g., 50)" />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
            </FormControl>

          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant='ghost' mr={3} onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" colorScheme="blue" isLoading={isLoading}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditStageModal; 