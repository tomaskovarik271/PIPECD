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
import { useAppStore, Stage } from '../../stores/useAppStore';

interface DeleteStageConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stage: Stage | null; // Stage to delete
  onSuccess?: () => void;
}

const DeleteStageConfirmationDialog: React.FC<DeleteStageConfirmationDialogProps> = 
  ({ isOpen, onClose, stage, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const deleteStage = useAppStore((state) => state.deleteStage);
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleDelete = async () => {
    if (!stage) {
      toast({ title: "No stage selected for deletion.", status: 'error', duration: 3000, isClosable: true });
      return;
    }
    setIsLoading(true);
    try {
      const success = await deleteStage(stage.id);
      if (success) {
        toast({ title: `Stage "${stage.name}" deleted successfully.`, status: 'success', duration: 3000, isClosable: true });
        onSuccess?.();
        onClose(); // Close dialog
      } else {
        // Error handled in store, fallback
        toast({ title: "Failed to delete stage.", description: "Check console or try again.", status: 'error', duration: 5000, isClosable: true });
      }
    } catch (error: unknown) {
        console.error("Error in delete stage dialog submit:", error);
        let message = "Could not delete stage.";
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
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            Delete Stage
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete the stage &ldquo;<strong>{stage?.name || 'this stage'}</strong>&rdquo;?
            <br />
            Deals in this stage will have their stage cleared. This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} isDisabled={isLoading}>
              Cancel
            </Button>
            <Button colorScheme='red' onClick={handleDelete} ml={3} isLoading={isLoading}>
              Delete Stage
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteStageConfirmationDialog; 