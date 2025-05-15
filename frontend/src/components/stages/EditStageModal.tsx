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
  Select,
  useToast, 
  VStack 
} from '@chakra-ui/react';
import { useStagesStore, Stage } from '../../stores/useStagesStore';
import type { UpdateStageInput as GeneratedUpdateStageInput, StageType } from '../../generated/graphql/graphql';
import { StageType as StageTypeEnum } from '../../generated/graphql/graphql';

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
  const [stageType, setStageType] = useState<StageType>(StageTypeEnum.Open);
  const [isDealProbabilityDisabled, setIsDealProbabilityDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updateStage, stagesError } = useStagesStore(); 
  const toast = useToast();

  // Pre-fill form when stage prop changes
  useEffect(() => {
    if (stage) {
      setStageName(stage.name);
      setStageOrder(stage.order);
      // Convert decimal from DB (e.g., 0.6) to percentage for display (e.g., 60)
      if (stage.deal_probability !== null && stage.deal_probability !== undefined) {
        setDealProbability(Math.round(stage.deal_probability * 100));
      } else {
        setDealProbability('');
      }
      setStageType(stage.stage_type || StageTypeEnum.Open);
    } else {
        setStageName('');
        setStageOrder(0);
        setDealProbability('');
        setStageType(StageTypeEnum.Open);
    }
  }, [stage]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
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
      // When switching to OPEN, if the stage prop exists and has a deal_probability,
      // restore it. Otherwise, it might have been from WON/LOST or empty.
      if (stage && stage.stage_type === StageTypeEnum.Open && stage.deal_probability !== null && stage.deal_probability !== undefined) {
         setDealProbability(Math.round(stage.deal_probability * 100));
      } else if (stage && stage.stage_type !== StageTypeEnum.Open && stageType === StageTypeEnum.Open) {
         // If switching from WON/LOST to OPEN, and original wasn't OPEN, clear probability for user input
         setDealProbability('');
      }
      // If no specific logic to restore, it remains as is or as set by user/previous state.
    }
  }, [stageType, stage]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stage) {
        toast({ title: "No stage selected for editing.", status: 'error', duration: 3000, isClosable: true });
        return;
    }
    
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
    if (!isDealProbabilityDisabled && String(dealProbability).trim() !== '') {
        const parsedProb = parseFloat(String(dealProbability));
        if (isNaN(parsedProb) || parsedProb < 0 || parsedProb > 100) {
            toast({ title: "Deal probability must be between 0 and 100 (or empty).", status: 'warning', duration: 3000, isClosable: true });
            return;
        }
        probabilityNum = parsedProb;
    } else if (isDealProbabilityDisabled) {
        // If disabled, use the auto-set value (0 for LOST, 100 for WON)
        probabilityNum = stageType === StageTypeEnum.Won ? 100 : 0;
    }
    
    const updates: GeneratedUpdateStageInput = {};
    let hasChanges = false;

    if (stageName.trim() !== stage.name) {
        updates.name = stageName.trim();
        hasChanges = true;
    }
    if (orderNum !== stage.order) {
        updates.order = orderNum;
        hasChanges = true;
    }

    // Compare stageType
    if (stageType !== (stage.stage_type || StageTypeEnum.Open)) { // Compare with original or default
        updates.stage_type = stageType;
        hasChanges = true;
    }
    
    // Deal probability comparison and update
    // Ensure probabilityNum is set based on stageType if it was disabled
    if (stageType === StageTypeEnum.Won) probabilityNum = 100;
    else if (stageType === StageTypeEnum.Lost) probabilityNum = 0;
    // If not WON/LOST, probabilityNum is from user input or null if empty

    const originalProbabilityDecimal = stage.deal_probability ?? null;
    const newProbabilityDecimal = probabilityNum === null ? null : probabilityNum / 100;

    if (newProbabilityDecimal !== originalProbabilityDecimal) {
        updates.deal_probability = newProbabilityDecimal;
        hasChanges = true;
    }
    
    // If stage_type changed to WON or LOST, ensure deal_probability is updated accordingly,
    // even if it wasn't different from original (e.g. if original was OPEN with 0% prob and changed to LOST)
    if (updates.stage_type === StageTypeEnum.Won && updates.deal_probability !== 1.0) {
        updates.deal_probability = 1.0;
        hasChanges = true; // Ensure change is flagged
    }
    if (updates.stage_type === StageTypeEnum.Lost && updates.deal_probability !== 0.0) {
        updates.deal_probability = 0.0;
        hasChanges = true; // Ensure change is flagged
    }


    if (!hasChanges) {
         toast({ title: "No changes detected.", status: 'info', duration: 2000, isClosable: true });
         onClose(); 
         return;
    }
    
    setIsLoading(true);
    try {
      // Ensure stage_type is explicitly set in updates if it's part of the changes
      // The logic above already adds it to `updates` if changed.
      const updatedStage = await updateStage(stage.id, updates);
      
      if (updatedStage) {
        toast({ title: "Stage updated successfully.", status: 'success', duration: 3000, isClosable: true });
        if (onSuccess && updatedStage.id) {
            onSuccess(updatedStage.id);
        }
        onClose();
      } else {
        toast({ title: "Failed to update stage.", description: stagesError || "Please check console or try again.", status: 'error', duration: 5000, isClosable: true });
      }
    } catch (error: unknown) {
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
                    isDisabled={isDealProbabilityDisabled}
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
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditStageModal; 