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
import { useAppStore, Person } from '../stores/useAppStore';

// Update prop definition
interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null; // Changed from contact
  onSuccess: () => void;
}

function DeleteConfirmationDialog({ isOpen, onClose, person, onSuccess }: DeleteConfirmationDialogProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const toast = useToast();
  const deletePersonAction = useAppStore((state) => state.deletePerson); // Get action from store
  const peopleError = useAppStore((state) => state.peopleError); // Get error state from store

  const handleDelete = async () => {
    if (!person) return; // Check for person
    setIsLoading(true);
    try {
      // Use the updated mutation and person ID
      const success = await deletePersonAction(person.id); // USE STORE ACTION

      if (success) {
        toast({ 
          title: 'Person Deleted', // Updated title
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onSuccess();
        onClose();
      } else {
        // If deletePersonAction returns false, an error occurred and is in the store
        toast({
          title: 'Deletion Failed',
          description: peopleError || 'Could not delete person.', // Use error from store
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: unknown) {
      console.error("Failed to delete person (component catch):", error);
      // Extract more specific error message if available
      let errorMessage = 'An unexpected error occurred.';
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       if (error instanceof Error && (error as any).response?.errors?.[0]?.message) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         errorMessage = (error as any).response.errors[0].message;
       } else if (error instanceof Error) {
         errorMessage = error.message;
       } else if (typeof error === 'string') {
         errorMessage = error;
       }
      toast({ 
        title: 'Deletion Failed', 
        description: errorMessage, 
        status: 'error',
        duration: 5000,
        isClosable: true, 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!person) return null; // Don't render if no person selected

  // Construct name for display, handling potential nulls
  const personName = [
      person.first_name,
      person.last_name
  ].filter(Boolean).join(' ') || 'this person';

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Person
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete {personName}? 
            This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={isLoading}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

export default DeleteConfirmationDialog; 