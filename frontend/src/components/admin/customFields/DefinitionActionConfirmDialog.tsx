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

interface ActionToConfirm {
  id: string;
  type: 'deactivate' | 'reactivate';
  label: string;
}

interface DefinitionActionConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionToConfirm: ActionToConfirm | null;
  isSubmitting?: boolean;
}

export const DefinitionActionConfirmDialog: React.FC<DefinitionActionConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  actionToConfirm,
  isSubmitting = false,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  if (!actionToConfirm) return null;

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
            {actionToConfirm.type === 'deactivate' ? 'Deactivate' : 'Reactivate'} Definition
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to {actionToConfirm.type} the custom field definition "{actionToConfirm.label}"?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button 
              ref={cancelRef} 
              onClick={onClose} 
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              colorScheme={actionToConfirm.type === 'deactivate' ? 'red' : 'green'} 
              onClick={onConfirm} 
              ml={3}
              isLoading={isSubmitting}
            >
              {actionToConfirm.type === 'deactivate' ? 'Deactivate' : 'Reactivate'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}; 