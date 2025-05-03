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
import { gql } from '@apollo/client';
import { gqlClient } from '../lib/graphqlClient';

// Define the mutation for deleting a Person
const DELETE_PERSON_MUTATION = gql`
  mutation DeletePerson($id: ID!) {
    deletePerson(id: $id)
  }
`;

// Define the Person type prop (matching the one used in PeoplePage/EditPersonForm)
interface Person {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  // Add other fields if needed for display, but only id, first/last name used here
}

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

  const handleDelete = async () => {
    if (!person) return; // Check for person
    setIsLoading(true);
    try {
      // Use the updated mutation and person ID
      await gqlClient.request(DELETE_PERSON_MUTATION, { id: person.id });
      toast({ 
        title: 'Person Deleted', // Updated title
        status: 'success',
        duration: 3000,
        isClosable: true,
       });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to delete person:", error);
      // Extract more specific error message if available
      let errorMessage = 'An unexpected error occurred.';
       if (error.response?.errors?.[0]?.message) {
         errorMessage = error.response.errors[0].message;
       } else if (error.message) {
         errorMessage = error.message;
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