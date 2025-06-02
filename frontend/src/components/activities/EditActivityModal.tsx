import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import { Activity } from '../../stores/useActivitiesStore';
import EditActivityForm from './EditActivityForm';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null; // Activity can be null if modal is prepared but no activity selected
  onSuccess?: () => void; // Optional: To refresh list or give feedback
}

const EditActivityModal: React.FC<EditActivityModalProps> = ({ isOpen, onClose, activity, onSuccess }) => {
  if (!activity) return null; // Don't render if no activity is provided

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Activity: {activity.subject}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}> {/* Add padding to bottom of modal body */}
          <EditActivityForm 
            activity={activity} 
            onClose={onClose} 
            onSuccess={onSuccess} 
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditActivityModal; 