import { useState } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import type { Deal } from '../stores/useDealsStore'; // Assuming Deal type is from here for dealToEdit

export interface DealsPageModalStatesAndHandlers {
  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  isEditModalOpen: boolean;
  openEditModal: (deal: Deal) => void;
  closeEditModal: () => void;
  dealToEdit: Deal | null;
  isConfirmDeleteDialogOpen: boolean;
  openConfirmDeleteModal: () => void;
  closeConfirmDeleteModal: () => void;
  isColumnSelectorOpen: boolean;
  openColumnSelectorModal: () => void;
  closeColumnSelectorModal: () => void;
}

export const useDealsPageModals = (): DealsPageModalStatesAndHandlers => {
  const { isOpen: isCreateModalOpen, onOpen: internalOpenCreateModal, onClose: closeCreateModal } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: internalOpenEditModal, onClose: internalCloseEditModal } = useDisclosure();
  const { isOpen: isConfirmDeleteDialogOpen, onOpen: internalOpenConfirmDeleteModal, onClose: closeConfirmDeleteModal } = useDisclosure();
  const { isOpen: isColumnSelectorOpen, onOpen: openColumnSelectorModal, onClose: closeColumnSelectorModal } = useDisclosure();

  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);

  const openCreateModal = () => internalOpenCreateModal();

  const openEditModal = (deal: Deal) => {
    setDealToEdit(deal);
    internalOpenEditModal();
  };

  const closeEditModal = () => {
    internalCloseEditModal();
    setDealToEdit(null); // Clear dealToEdit when modal closes
  };

  const openConfirmDeleteModal = () => {
    internalOpenConfirmDeleteModal();
  };

  // closeConfirmDeleteModal already clears dealToDeleteId implicitly if needed by the component calling it
  // or it can be cleared after the delete action is confirmed/cancelled in the main page component.
  // For now, the hook itself doesn't auto-clear dealToDeleteId on close, 
  // as the ID might still be needed briefly by the confirmation logic.

  return {
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    isEditModalOpen,
    openEditModal,
    closeEditModal,
    dealToEdit,
    isConfirmDeleteDialogOpen,
    openConfirmDeleteModal,
    closeConfirmDeleteModal,
    isColumnSelectorOpen,
    openColumnSelectorModal,
    closeColumnSelectorModal,
  };
}; 