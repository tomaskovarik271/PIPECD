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
  Select, // Added Select
  useToast, 
  VStack 
} from '@chakra-ui/react';
import { useStagesStore } from '../../stores/useStagesStore';
import type { CreateStageInput as GeneratedCreateStageInput, StageType } from '../../generated/graphql/graphql';
import { StageType as StageTypeEnum } from '../../generated/graphql/graphql';

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
  const [stageType, setStageType] = useState<StageType>(StageTypeEnum.Open); // Added stageType state, ensure it uses the enum
  const [isDealProbabilityDisabled, setIsDealProbabilityDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createStage, stagesError } = useStagesStore();
  const toast = useToast();

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
        setStageName('');
        setStageOrder(0); // Reset to default
        setDealProbability('');
        setStageType(StageTypeEnum.Open); // Reset stageType
        setIsDealProbabilityDisabled(false); // Reset disabled state
        setIsLoading(false);
    }
  }, [isOpen]);

  // New useEffect to handle deal probability based on stageType
  useEffect(() => {
    if (stageType === StageTypeEnum.Won) {
      setDealProbability(100);
      setIsDealProbabilityDisabled(true);
    } else if (stageType === StageTypeEnum.Lost) {
      setDealProbability(0);
      setIsDealProbabilityDisabled(true);
    } else { // StageTypeEnum.Open or any other
      setIsDealProbabilityDisabled(false);
      // Optionally, you could reset dealProbability to '' if coming from WON/LOST
      // if it was previously auto-set, or leave it as is for user to modify.
      // For now, just enabling is fine.
    }
  }, [stageType]);

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
    
    // Probability validation starts here, moved outside the orderNum validation block
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
        const input: GeneratedCreateStageInput = {
            pipeline_id: pipelineId,
            name: stageName.trim(),
            order: orderNum,
            // Convert percentage (0-100 or null) to decimal (0-1 or null)
            deal_probability: probabilityNum === null ? null : probabilityNum / 100, 
            stage_type: stageType, // Added stage_type to input
        };
        
      const newStage = await createStage(input);
      
      if (newStage) {
        toast({ title: "Stage created successfully.", status: 'success', duration: 3000, isClosable: true });
        onSuccess?.(newStage.id);
        onClose(); // Close modal
      } else {
        toast({ title: "Failed to create stage.", description: stagesError || "Please check console or try again.", status: 'error', duration: 5000, isClosable: true });
      }
    } catch (error: unknown) {
        console.error("Error in create stage modal submit:", error);
        let message = "Could not create stage.";
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
                    isDisabled={isDealProbabilityDisabled} // Bind to disabled state
                >
                    <NumberInputField placeholder="Optional (e.g., 50)" />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Stage Type</FormLabel>
              <Select 
                value={stageType} 
                onChange={(e) => setStageType(e.target.value as StageType)}
              >
                <option value={StageTypeEnum.Open}>Open</option>
                <option value={StageTypeEnum.Won}>Won</option>
                <option value={StageTypeEnum.Lost}>Lost</option>
              </Select>
            </FormControl>

          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant='ghost' mr={3} onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" colorScheme="blue" isLoading={isLoading}>
            Create Stage
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateStageModal; 