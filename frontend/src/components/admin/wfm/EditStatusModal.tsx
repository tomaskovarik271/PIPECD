import React, { useState, useEffect } from 'react';
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
import { WfmStatus, UpdateWfmStatusInput } from '../../../generated/graphql/graphql';

interface EditStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusToEdit: WfmStatus | null;
  onStatusUpdated: () => void; // To refresh the list
}

const EditStatusModal: React.FC<EditStatusModalProps> = ({
  isOpen,
  onClose,
  statusToEdit,
  onStatusUpdated,
}) => {
  const { updateWFMStatus } = useWFMStatusStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Effect to reset form state or other logic when statusToEdit changes or modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false); // Reset submitting state when modal closes
    }
    // If using react-hook-form directly here, could reset(statusToEdit) when it changes and isOpen.
    // However, StatusForm handles its own defaultValues based on initialValues prop.
  }, [isOpen, statusToEdit]);

  if (!statusToEdit) return null; // Should not happen if opened correctly

  const handleSubmit = async (values: StatusFormValues) => {
    setIsSubmitting(true);
    const input: UpdateWfmStatusInput = {
      name: values.name,
      description: values.description || null,
      color: values.color || null,
      isArchived: values.isArchived, // isArchived comes from the form values
    };

    const updatedStatus = await updateWFMStatus(statusToEdit.id, input);
    setIsSubmitting(false);

    if (updatedStatus) {
      toast({
        title: 'Status updated.',
        description: `Successfully updated status "${updatedStatus.name}".`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onStatusUpdated();
      onClose();
    } else {
      // Error handled by store
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit WFM Status: {statusToEdit.name}</ModalHeader>
        <ModalCloseButton isDisabled={isSubmitting} />
        <ModalBody pb={6}>
          <StatusForm
            onSubmit={handleSubmit}
            initialValues={statusToEdit} // Pass the full status object here
            isSubmitting={isSubmitting}
            onCancel={onClose}
          />
        </ModalBody>
        {/* Footer is handled by StatusForm */}
      </ModalContent>
    </Modal>
  );
};

export default EditStatusModal; 