import React, { useState, useEffect, useRef } from 'react';
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
  VStack,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { usePipelinesStore, Pipeline, PipelineInput } from '../../stores/usePipelinesStore';

interface EditPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipeline: Pipeline | null;
  onSuccess?: (updatedPipelineId: string) => void; 
}

const EditPipelineModal: React.FC<EditPipelineModalProps> = ({ isOpen, onClose, pipeline, onSuccess }) => {
  const [pipelineName, setPipelineName] = useState('');
  const initialFieldRef = useRef(null);
  const {
    updatePipeline,
    pipelinesLoading,
    pipelinesError
  } = usePipelinesStore();
  const toast = useToast();

  useEffect(() => {
    if (pipeline) {
      setPipelineName(pipeline.name);
    } else {
      setPipelineName('');
    }
  }, [pipeline]);

  useEffect(() => {
    if (!isOpen) {
      setPipelineName('');
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
    if (pipelineName.trim() === pipeline.name) {
         toast({ title: "No changes detected.", status: 'info', duration: 2000, isClosable: true });
      onClose();
         return;
    }
    
    const pipelineInput: PipelineInput = { name: pipelineName.trim() };
      const updatedPipeline = await updatePipeline(pipeline.id, pipelineInput);
    
      if (updatedPipeline) {
        toast({ title: "Pipeline updated successfully.", status: 'success', duration: 3000, isClosable: true });
        onSuccess?.(updatedPipeline.id);
      onClose();
      } else {
      toast({ 
        title: "Failed to update pipeline.", 
        description: pipelinesError || "An unexpected error occurred. Please try again.", 
        status: 'error', 
        duration: 5000, 
        isClosable: true 
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered initialFocusRef={initialFieldRef}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Edit Pipeline</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {pipelinesError && (
              <Alert status="error" mb={3}>
                <AlertIcon />
                {pipelinesError}
              </Alert>
            )}
            <FormControl isRequired>
              <FormLabel>Pipeline Name</FormLabel>
              <Input 
                ref={initialFieldRef}
                placeholder="e.g., Sales Pipeline Q3"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant='ghost' mr={3} onClick={onClose} isDisabled={pipelinesLoading}>
            Cancel
          </Button>
          <Button type="submit" colorScheme="blue" isLoading={pipelinesLoading}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditPipelineModal; 