import React, { useState } from 'react';
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
import { usePipelinesStore } from '../../stores/usePipelinesStore';

interface CreatePipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Optional: Callback on successful creation
  onSuccess?: (newPipelineId: string) => void; 
}

const CreatePipelineModal: React.FC<CreatePipelineModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pipelineName, setPipelineName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createPipeline, pipelinesError } = usePipelinesStore();
  const toast = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pipelineName.trim()) {
      toast({ title: "Pipeline name cannot be empty.", status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setIsLoading(true);
    try {
      const newPipeline = await createPipeline({ name: pipelineName.trim() } as { name: string });
      if (newPipeline) {
        toast({ title: "Pipeline created successfully.", status: 'success', duration: 3000, isClosable: true });
        setPipelineName(''); // Reset form
        onSuccess?.(newPipeline.id);
        onClose(); // Close modal
      } else {
        toast({ title: "Failed to create pipeline.", description: pipelinesError || "Please check console or try again.", status: 'error', duration: 5000, isClosable: true });
      }
    } catch (error: unknown) {
        // This catch might be redundant if store handles all errors, but keep for safety
        console.error("Error in create pipeline modal submit:", error);
        let message = "Could not create pipeline.";
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

  // Reset name when modal is opened/closed
  React.useEffect(() => {
    if (!isOpen) {
        setPipelineName('');
        setIsLoading(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Create New Pipeline</ModalHeader>
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
            Create Pipeline
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreatePipelineModal; 