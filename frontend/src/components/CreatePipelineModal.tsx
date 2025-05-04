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
  VStack,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useAppStore } from '../stores/useAppStore';

interface CreatePipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newPipelineId: string) => void; // Optional callback on success
}

const CreatePipelineModal: React.FC<CreatePipelineModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const createPipeline = useAppStore((state) => state.createPipeline);
  const [pipelineName, setPipelineName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelineName.trim()) {
        setError("Pipeline name cannot be empty.");
        return;
    }
    setIsSubmitting(true);
    setError(null);
    
    try {
        const newPipeline = await createPipeline(pipelineName);
        if (newPipeline) {
            toast({
                title: 'Pipeline Created',
                description: `Pipeline "${newPipeline.name}" was successfully created.`, // Use returned name
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            setPipelineName(''); // Clear form
            onSuccess?.(newPipeline.id); // Call success callback
            onClose(); // Close modal
        } else {
            // Error message should be set in the store, display it
             // Re-fetch error from store in case it was updated
            const creationError = useAppStore.getState().pipelinesError;
            setError(creationError || 'Failed to create pipeline. Unknown error.');
        }
    } catch (err: any) { // Catch any unexpected errors from the action itself
      console.error("Unexpected error during pipeline creation:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsSubmitting(false);
    }
  };

  // Clear error when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPipelineName(e.target.value);
      if (error) {
          setError(null);
      }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Create New Pipeline</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!!error}> 
              <FormLabel htmlFor="pipelineName">Pipeline Name</FormLabel>
              <Input
                id="pipelineName"
                placeholder="e.g., Sales Pipeline Q3"
                value={pipelineName}
                onChange={handleInputChange}
                autoFocus
              />
               {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button 
             colorScheme="blue" 
             mr={3} 
             type="submit" 
             isLoading={isSubmitting} 
             isDisabled={!pipelineName.trim()}
           > 
            Create
          </Button>
          <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreatePipelineModal; 