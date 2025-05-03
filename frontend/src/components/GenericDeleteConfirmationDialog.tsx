import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';

interface GenericDeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // Callback to trigger deletion in parent
  itemType: string; // e.g., "Lead", "Person", "Organization"
  itemName: string; // e.g., Lead name, Person name
  isLoading: boolean; // Loading state controlled by parent
}

const GenericDeleteConfirmationDialog: React.FC<GenericDeleteConfirmationDialogProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    itemType,
    itemName,
    isLoading 
}) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Display name safely
  const displayItemName = itemName || `this ${itemType.toLowerCase()}`;

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered // Center the dialog
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete {itemType}
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete <strong>{displayItemName}</strong>? 
            This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            {/* Call the onConfirm prop passed from the parent */}
            <Button colorScheme="red" onClick={onConfirm} ml={3} isLoading={isLoading}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

export default GenericDeleteConfirmationDialog; 