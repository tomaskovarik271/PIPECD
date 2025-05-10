import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import EditActivityForm from './EditActivityForm';
import { Activity } from '../../stores/useAppStore';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null; // Activity to edit, null if none selected
  onSuccess?: () => void; // Add onSuccess prop
}

function EditActivityModal({ isOpen, onClose, activity, onSuccess }: EditActivityModalProps) {
  if (!activity) return null; // Don't render modal if no activity is selected

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Activity</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {/* Pass the activity, onClose, and onSuccess handler to the form */}
          <EditActivityForm activity={activity} onClose={onClose} onSuccess={onSuccess} />
        </ModalBody>
        {/* Footer can be removed if submit is handled solely within the form */}
        {/* <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  );
}

export default EditActivityModal; 