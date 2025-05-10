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
import { useAppStore, Pipeline } from '../stores/useAppStore';

interface DeletePipelineConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pipeline: Pipeline | null; 
  onSuccess: () => void;
}

function DeletePipelineConfirmationDialog({ 
    isOpen, 
    onClose, 
    pipeline, 
    onSuccess 
}: DeletePipelineConfirmationDialogProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const deletePipeline = useAppStore((state) => state.deletePipeline);
  const [isLoading, setIsLoading] = React.useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    if (!pipeline) return;
    setIsLoading(true);
    const success = await deletePipeline(pipeline.id);
    setIsLoading(false);

    if (success) {
        toast({ 
            title: 'Pipeline Deleted',
            description: `Pipeline "${pipeline.name}" and its stages were deleted.`, 
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
        onSuccess();
        onClose();
    } else {
        const deleteError = useAppStore.getState().pipelinesError;
        toast({ 
            title: 'Deletion Failed', 
            description: deleteError || 'Could not delete pipeline.',
            status: 'error',
            duration: 5000,
            isClosable: true, 
        });
    }
  };

  if (!pipeline) return null;

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
            Delete Pipeline
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete the pipeline &ldquo;{pipeline.name}&rdquo;? 
            All stages within this pipeline will also be deleted. Deals in those stages will have their stage unset.
            This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={isLoading}>
              Delete Pipeline
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

export default DeletePipelineConfirmationDialog; 