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
import type { WfmProjectType, UpdateWfmProjectTypeInput } from '../../../generated/graphql/graphql';

interface EditProjectTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateWfmProjectTypeInput) => Promise<void>;
  projectType: WfmProjectType | null;
  isSubmitting: boolean;
}

const EditProjectTypeModal: React.FC<EditProjectTypeModalProps> = ({ isOpen, onClose, onSubmit, projectType, isSubmitting }) => {
  if (!projectType) return null;

  const handleFormSubmit = async (data: ProjectTypeFormData) => {
    const submissionData: UpdateWfmProjectTypeInput = {
      name: data.name,
      description: data.description || null,
      iconName: data.iconName || null,
      defaultWorkflowId: data.defaultWorkflowId || null,
      isArchived: data.isArchived === undefined ? projectType.isArchived : data.isArchived, // Preserve existing if undefined
    };
    await onSubmit(projectType.id, submissionData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Project Type: {projectType.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <ProjectTypeForm 
            onSubmit={handleFormSubmit} 
            onCancel={onClose} 
            initialData={projectType}
            isSubmitting={isSubmitting}
          />
        </ModalBody>
        {/* Footer is handled by the ProjectTypeForm */}
      </ModalContent>
    </Modal>
  );
};

export default EditProjectTypeModal; 