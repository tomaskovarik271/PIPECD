import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useAppStore, Stage } from '../stores/useAppStore'; // Import Stage type

interface DeleteStageConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stage: Stage | null; // Stage to delete
  onSuccess: () => void;
}

function DeleteStageConfirmationDialog({ 
    isOpen, 
    onClose, 
    stage, 
    onSuccess 
}: DeleteStageConfirmationDialogProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const deleteStage = useAppStore((state) => state.deleteStage);
  const [isLoading, setIsLoading] = React.useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    if (!stage) return;
    setIsLoading(true);
    const success = await deleteStage(stage.id);
    setIsLoading(false);

    if (success) {
        toast({ 
            title: 'Stage Deleted',
            description: `Stage "${stage.name}" was deleted.`, 
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
        onSuccess(); // Callback (might not be needed if store handles list update)
        onClose();
    } else {
        // Error should be reflected in store state, potentially show generic toast
        const deleteError = useAppStore.getState().stagesError;
        toast({ 
            title: 'Deletion Failed', 
            description: deleteError || 'Could not delete stage. Check if it contains deals.',
            status: 'error',
            duration: 5000,
            isClosable: true, 
        });
    }
  };

  if (!stage) return null;

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Stage
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete the stage "{stage.name}"? 
            Deals currently in this stage will have their stage unset.
            This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={isLoading}>
              Delete Stage
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

export default DeleteStageConfirmationDialog; 