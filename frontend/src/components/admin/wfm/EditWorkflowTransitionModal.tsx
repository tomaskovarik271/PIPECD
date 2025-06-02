import React, { useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useWFMWorkflowStore } from '../../../stores/useWFMWorkflowStore';
import { WfmWorkflowTransition, UpdateWfmWorkflowTransitionInput } from '../../../generated/graphql/graphql';

// Zod schema for validation
const transitionNameSchema = z.object({
  name: z.string().trim().optional(), // Name is optional for a transition
});

export type EditTransitionFormData = z.infer<typeof transitionNameSchema>;

interface EditWorkflowTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transition: WfmWorkflowTransition | null; // The transition to edit
}

const EditWorkflowTransitionModal: React.FC<EditWorkflowTransitionModalProps> = ({
  isOpen,
  onClose,
  transition,
}) => {
  const toast = useToast();
  const updateWorkflowTransition = useWFMWorkflowStore((state) => state.updateWorkflowTransition);
  const isSubmitting = useWFMWorkflowStore((state) => state.submitting); // Assuming a generic submitting state

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditTransitionFormData>({
    resolver: zodResolver(transitionNameSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (transition) {
      reset({ name: transition.name || '' });
    } else {
      reset({ name: '' }); // Reset if no transition (e.g., modal closed and reopened without selection)
    }
  }, [transition, reset, isOpen]); // Depend on isOpen to reset when modal reopens

  const onSubmit = async (data: EditTransitionFormData) => {
    if (!transition) {
      toast({
        title: 'Error',
        description: 'No transition selected for editing.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const input: UpdateWfmWorkflowTransitionInput = {
      name: data.name || null, // Ensure null if empty, as GQL expects String or null
    };

    try {
      await updateWorkflowTransition(transition.id, input);
      toast({
        title: 'Transition Updated',
        description: 'The transition name has been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error: any) {
      console.error('Failed to update transition:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not update the transition name.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Edit Transition Name</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel htmlFor="name">Transition Name</FormLabel>
              <Input
                id="name"
                placeholder="Enter transition name (e.g., Approve, Reject)"
                {...register('name')}
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            isDisabled={!isDirty} // Disable if form hasn't changed
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditWorkflowTransitionModal; 