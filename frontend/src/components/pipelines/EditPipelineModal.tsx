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
  useToast, 
  VStack 
} from '@chakra-ui/react';
import { useAppStore, Pipeline } from '../../stores/useAppStore'; // Assuming Pipeline type is exported

interface EditPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipeline: Pipeline | null; // Pipeline to edit
  onSuccess?: (updatedPipelineId: string) => void; 
}

const EditPipelineModal: React.FC<EditPipelineModalProps> = ({ isOpen, onClose, pipeline, onSuccess }) => {
  const [pipelineName, setPipelineName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const updatePipeline = useAppStore((state) => state.updatePipeline);
  const toast = useToast();

  // Pre-fill form when pipeline prop changes
  useEffect(() => {
    if (pipeline) {
      setPipelineName(pipeline.name);
    } else {
        setPipelineName(''); // Clear if no pipeline
    }
  }, [pipeline]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setPipelineName('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pipeline) {
        toast({ title: "No pipeline selected for editing.", status: 'error', duration: 3000, isClosable: true });
        return;
    }
    if (!pipelineName.trim()) {
      toast({ title: "Pipeline name cannot be empty.", status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    
    // Check if the name actually changed
    if (pipelineName.trim() === pipeline.name) {
         toast({ title: "No changes detected.", status: 'info', duration: 2000, isClosable: true });
         onClose(); // Close without submitting if no change
         return;
    }
    
    setIsLoading(true);
    try {
      // Explicitly define the input type to match the expected store signature
      const pipelineInput: { name: string } = { name: pipelineName.trim() };
      const updatedPipeline = await updatePipeline(pipeline.id, pipelineInput);
      if (updatedPipeline) {
        toast({ title: "Pipeline updated successfully.", status: 'success', duration: 3000, isClosable: true });
        onSuccess?.(updatedPipeline.id);
        onClose(); // Close modal
      } else {
        toast({ title: "Failed to update pipeline.", description: "Please check console or try again.", status: 'error', duration: 5000, isClosable: true });
      }
    } catch (error: unknown) {
        console.error("Error in edit pipeline modal submit:", error);
        let message = "Could not update pipeline.";
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
        <ModalHeader>Edit Pipeline</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Pipeline Name</FormLabel>
              <Input 
                placeholder="e.g., Sales Pipeline Q3"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                autoFocus // eslint-disable-line jsx-a11y/no-autofocus
              />
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

export default EditPipelineModal; 