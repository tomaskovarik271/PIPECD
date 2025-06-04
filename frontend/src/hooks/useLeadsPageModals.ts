import { useState, useCallback } from 'react';
import type { Lead } from '../stores/useLeadsStore';

interface UseLeadsPageModalsReturn {
  // Create Modal
  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;

  // Edit Modal
  isEditModalOpen: boolean;
  leadToEdit: Lead | null;
  openEditModal: (lead: Lead) => void;
  closeEditModal: () => void;

  // Delete Confirmation
  isConfirmDeleteDialogOpen: boolean;
  openConfirmDeleteModal: () => void;
  closeConfirmDeleteModal: () => void;

  // Column Selector
  isColumnSelectorOpen: boolean;
  openColumnSelectorModal: () => void;
  closeColumnSelectorModal: () => void;
}

export function useLeadsPageModals(): UseLeadsPageModalsReturn {
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  
  // Delete Confirmation State
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  
  // Column Selector State
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);

  // Create Modal Actions
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  // Edit Modal Actions
  const openEditModal = useCallback((lead: Lead) => {
    setLeadToEdit(lead);
    setIsEditModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setLeadToEdit(null);
  }, []);

  // Delete Confirmation Actions
  const openConfirmDeleteModal = useCallback(() => {
    setIsConfirmDeleteDialogOpen(true);
  }, []);

  const closeConfirmDeleteModal = useCallback(() => {
    setIsConfirmDeleteDialogOpen(false);
  }, []);

  // Column Selector Actions
  const openColumnSelectorModal = useCallback(() => {
    setIsColumnSelectorOpen(true);
  }, []);

  const closeColumnSelectorModal = useCallback(() => {
    setIsColumnSelectorOpen(false);
  }, []);

  return {
    // Create Modal
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,

    // Edit Modal
    isEditModalOpen,
    leadToEdit,
    openEditModal,
    closeEditModal,

    // Delete Confirmation
    isConfirmDeleteDialogOpen,
    openConfirmDeleteModal,
    closeConfirmDeleteModal,

    // Column Selector
    isColumnSelectorOpen,
    openColumnSelectorModal,
    closeColumnSelectorModal,
  };
} 