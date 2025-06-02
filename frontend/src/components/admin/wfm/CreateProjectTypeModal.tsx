import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import ProjectTypeForm, { ProjectTypeFormData } from './ProjectTypeForm';
import type { CreateWfmProjectTypeInput } from '../../../generated/graphql/graphql';

interface CreateProjectTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWfmProjectTypeInput) => Promise<void>;
  isSubmitting: boolean;
}

const CreateProjectTypeModal: React.FC<CreateProjectTypeModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const handleFormSubmit = async (data: ProjectTypeFormData) => {
    // The form data directly matches CreateWfmProjectTypeInput, but ensure correct handling of optional fields
    const submissionData: CreateWfmProjectTypeInput = {
      name: data.name,
      description: data.description || null,
      iconName: data.iconName || null,
      defaultWorkflowId: data.defaultWorkflowId || null,
      // isArchived is not part of creation, defaults to false in DB
    };
    await onSubmit(submissionData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Project Type</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <ProjectTypeForm 
            onSubmit={handleFormSubmit} 
            onCancel={onClose} 
            isSubmitting={isSubmitting} 
          />
        </ModalBody>
        {/* Footer is handled by the ProjectTypeForm */}
      </ModalContent>
    </Modal>
  );
};

export default CreateProjectTypeModal; 