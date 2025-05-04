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
  NumberInput, // Use NumberInput for order and probability
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast, 
  VStack 
} from '@chakra-ui/react';
import { useAppStore, CreateStageInput } from '../../stores/useAppStore';

interface CreateStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineId: string; // Required to link the stage
  // Optional: Callback on successful creation
  onSuccess?: (newStageId: string) => void; 
}

const CreateStageModal: React.FC<CreateStageModalProps> = ({ isOpen, onClose, pipelineId, onSuccess }) => {
  const [stageName, setStageName] = useState('');
  const [stageOrder, setStageOrder] = useState<number | string>(0); // Store as number or string for NumberInput
  const [dealProbability, setDealProbability] = useState<number | string>(''); // Optional, use empty string for placeholder
  const [isLoading, setIsLoading] = useState(false);
  const createStage = useAppStore((state) => state.createStage);
  const toast = useToast();

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
        setStageName('');
        setStageOrder(0); // Reset to default
        setDealProbability('');
        setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
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
        const parsedProb = parseFloat(String(dealProbability)); // Use temporary variable
        if (isNaN(parsedProb) || parsedProb < 0 || parsedProb > 100) { 
            toast({ title: "Deal probability must be between 0 and 100 (or empty).", status: 'warning', duration: 3000, isClosable: true });
            return;
        }
        probabilityNum = parsedProb; // Assign if valid
    }
    
    setIsLoading(true);
    try {
        const input: CreateStageInput = {
            pipeline_id: pipelineId,
            name: stageName.trim(),
            order: orderNum,
            // Convert percentage (0-100 or null) to decimal (0-1 or null)
            deal_probability: probabilityNum === null ? null : probabilityNum / 100, 
        };
        
      const newStage = await createStage(input);
      
      if (newStage) {
        toast({ title: "Stage created successfully.", status: 'success', duration: 3000, isClosable: true });
        onSuccess?.(newStage.id);
        onClose(); // Close modal
      } else {
        toast({ title: "Failed to create stage.", description: "Please check console or try again.", status: 'error', duration: 5000, isClosable: true });
      }
    } catch (error: any) {
        console.error("Error in create stage modal submit:", error);
        toast({ title: "An error occurred.", description: error.message || "Could not create stage.", status: 'error', duration: 5000, isClosable: true });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Create New Stage</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Stage Name</FormLabel>
              <Input 
                placeholder="e.g., Qualification"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                autoFocus
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
          <Button type="submit" colorScheme="teal" isLoading={isLoading}>
            Create Stage
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateStageModal; 