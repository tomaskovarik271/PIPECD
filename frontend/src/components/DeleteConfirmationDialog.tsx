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
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';

// Define the mutation
const DELETE_CONTACT_MUTATION = gql`
  mutation DeleteContact($id: ID!) {
    deleteContact(id: $id)
  }
`;

// Define the contact type prop
interface Contact {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
}

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onSuccess: () => void;
}

function DeleteConfirmationDialog({ isOpen, onClose, contact, onSuccess }: DeleteConfirmationDialogProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    if (!contact) return;
    setIsLoading(true);
    try {
      await gqlClient.request(DELETE_CONTACT_MUTATION, { id: contact.id });
      toast({ title: 'Contact Deleted', status: 'success' });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to delete contact:", error);
      toast({ title: 'Deletion Failed', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!contact) return null; // Don't render if no contact selected

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Contact
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete {contact.first_name} {contact.last_name}? 
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