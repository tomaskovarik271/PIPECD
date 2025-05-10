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
  VStack,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useAppStore, Pipeline } from '../stores/useAppStore';
import type { PipelineInput } from '../generated/graphql/graphql';

interface EditPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipeline: Pipeline | null;
  onSuccess?: (updatedPipelineId: string) => void;
}

const EditPipelineModal: React.FC<EditPipelineModalProps> = ({ 
    isOpen, 
    onClose, 
    pipeline, 
    onSuccess 
}) => {
  const updatePipeline = useAppStore((state) => state.updatePipeline);
  const [pipelineName, setPipelineName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Initialize form state
  useEffect(() => {
    if (isOpen && pipeline) {
      setPipelineName(pipeline.name || '');
      setError(null);
      setIsSubmitting(false);
    } else if (!isOpen) {
      setPipelineName(''); 
      setError(null);
    }
  }, [isOpen, pipeline]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipeline) return;

    if (!pipelineName.trim()) {
      setError("Pipeline name cannot be empty.");
      return;
    }

    if (pipelineName.trim() === pipeline.name) {
        setError("No changes detected in name.");
        return; // Don't submit if name hasn't changed
    }

    setIsSubmitting(true);
    setError(null);

    const input: PipelineInput = {
      name: pipelineName.trim(),
    };

    try {
      const updatedPipeline = await updatePipeline(pipeline.id, input);
      if (updatedPipeline) {
        toast({
          title: 'Pipeline Updated',
          description: `Pipeline "${updatedPipeline.name}" updated successfully.`, 
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onSuccess?.(updatedPipeline.id);
        onClose();
      } else {
        const updateError = useAppStore.getState().pipelinesError;
        setError(updateError || 'Failed to update pipeline. Unknown error.');
      }
    } catch (err: unknown) {
      console.error("Unexpected error during pipeline update:", err);
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

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPipelineName(e.target.value);
      if (error) {
          setError(null); 
      }
  }

  if (!isOpen || !pipeline) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Edit Pipeline: {pipeline.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!!error}> 
              <FormLabel htmlFor="pipelineName">Pipeline Name</FormLabel>
              <Input
                id="pipelineName"
                placeholder="Enter pipeline name"
                value={pipelineName}
                onChange={handleInputChange}
                autoFocus // eslint-disable-line jsx-a11y/no-autofocus
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
             isDisabled={!pipelineName.trim() || pipelineName.trim() === pipeline.name}
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

export default EditPipelineModal; 