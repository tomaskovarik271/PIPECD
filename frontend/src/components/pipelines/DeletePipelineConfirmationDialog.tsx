import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertDialog, 
  AlertDialogBody, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogContent, 
  AlertDialogOverlay, 
  Button, 
  useToast 
} from '@chakra-ui/react';
import { useAppStore, Pipeline } from '../../stores/useAppStore';

interface DeletePipelineConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pipeline: Pipeline | null; // Pipeline to delete
  onSuccess?: () => void;
}

const DeletePipelineConfirmationDialog: React.FC<DeletePipelineConfirmationDialogProps> = 
  ({ isOpen, onClose, pipeline, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const deletePipeline = useAppStore((state) => state.deletePipeline);
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null); // Ref for the cancel button

  const handleDelete = async () => {
    if (!pipeline) {
      toast({ title: "No pipeline selected for deletion.", status: 'error', duration: 3000, isClosable: true });
      return;
    }
    setIsLoading(true);
    try {
      const success = await deletePipeline(pipeline.id);
      if (success) {
        toast({ title: `Pipeline "${pipeline.name}" deleted successfully.`, status: 'success', duration: 3000, isClosable: true });
        onSuccess?.();
        onClose(); // Close dialog
      } else {
        // Error handled in store, but provide fallback
        toast({ title: "Failed to delete pipeline.", description: "Check console or try again. Ensure pipeline is empty if required.", status: 'error', duration: 5000, isClosable: true });
      }
    } catch (error: unknown) {
        console.error("Error in delete pipeline dialog submit:", error);
        let message = "Could not delete pipeline.";
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

   // Reset loading state when closed
   useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
    }
  }, [isOpen]);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef} // Focus cancel button on open
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            Delete Pipeline
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete the pipeline &ldquo;<strong>{pipeline?.name || 'this pipeline'}</strong>&rdquo;? 
            <br />
            This action cannot be undone. Any stages within this pipeline will also be deleted.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} isDisabled={isLoading}>
              Cancel
            </Button>
            <Button colorScheme='red' onClick={handleDelete} ml={3} isLoading={isLoading}>
              Delete Pipeline
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeletePipelineConfirmationDialog; 