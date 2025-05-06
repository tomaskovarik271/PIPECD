import React, { useRef } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // Consider making async if needed by caller
  headerText: string;
  bodyText: string;
  confirmButtonText?: string;
  confirmButtonColorScheme?: string;
  cancelButtonText?: string;
  isLoading?: boolean;
}

function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  headerText,
  bodyText,
  confirmButtonText = 'Confirm',
  confirmButtonColorScheme = 'red',
  cancelButtonText = 'Cancel',
  isLoading = false,
}: ConfirmationDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef} // Focuses cancel button by default
      onClose={onClose}
      isCentered // Center the dialog
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {headerText}
          </AlertDialogHeader>

          <AlertDialogBody>
            {bodyText}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} isDisabled={isLoading}>
              {cancelButtonText}
            </Button>
            <Button 
              colorScheme={confirmButtonColorScheme} 
              onClick={onConfirm} 
              ml={3}
              isLoading={isLoading}
            >
              {confirmButtonText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

export default ConfirmationDialog; 