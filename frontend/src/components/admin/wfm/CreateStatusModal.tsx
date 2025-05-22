import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useToast,
} from '@chakra-ui/react';
import StatusForm, { StatusFormValues } from './StatusForm';
import { useWFMStatusStore } from '../../../stores/useWFMStatusStore';
import { CreateWfmStatusInput } from '../../../generated/graphql/graphql';

interface CreateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusCreated: () => void; // To refresh the list
}

const CreateStatusModal: React.FC<CreateStatusModalProps> = ({
  isOpen,
  onClose,
  onStatusCreated,
}) => {
  const { createWFMStatus } = useWFMStatusStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (values: StatusFormValues) => {
    setIsSubmitting(true);
    const input: CreateWfmStatusInput = {
      name: values.name,
      description: values.description || null, // Ensure null if empty
      color: values.color || null, // Ensure null if empty
    };

    const newStatus = await createWFMStatus(input);
    setIsSubmitting(false);

    if (newStatus) {
      toast({
        title: 'Status created.',
        description: `Successfully created status "${newStatus.name}".`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onStatusCreated(); // Call callback to refresh list or perform other actions
      onClose(); // Close modal on success
    } else {
      // Error toast is handled by the store, but you could add a specific one here if needed
      // For example, if the store sets an error message, you might display it.
      // toast({ title: 'Creation failed', description: useWFMStatusStore.getState().error, status: 'error' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New WFM Status</ModalHeader>
        <ModalCloseButton isDisabled={isSubmitting} />
        <ModalBody pb={6}>
          <StatusForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
            onCancel={onClose} 
          />
        </ModalBody>
        {/* Footer is handled by the StatusForm now */}
        {/* <ModalFooter>
          <Button onClick={onClose} mr={3} isDisabled={isSubmitting}>Cancel</Button>
          <Button colorScheme="blue" form="wfm-status-form" type="submit" isLoading={isSubmitting}>
            Create Status
          </Button>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  );
};

export default CreateStatusModal; 