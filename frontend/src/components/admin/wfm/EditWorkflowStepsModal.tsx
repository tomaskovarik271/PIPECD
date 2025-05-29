import React, { useEffect, useState, useRef } from 'react';
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
  Spinner,
  Text,
  VStack,
  Box,
  Heading,
  Divider,
  useDisclosure,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useWFMWorkflowStore } from '../../../stores/useWFMWorkflowStore';
import { useWorkflowStepOrder } from '../../../hooks/useWorkflowStepOrder';
import { WorkflowStepsTable } from './WorkflowStepsTable';
import { WorkflowTransitionsTable } from './WorkflowTransitionsTable';
import CreateWorkflowStepModal from './CreateWorkflowStepModal';
import EditWorkflowStepModal from './EditWorkflowStepModal';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import { WfmWorkflowStep, WfmWorkflowTransition } from '../../../generated/graphql/graphql';
import CreateWorkflowTransitionModal from './CreateWorkflowTransitionModal';
import EditWorkflowTransitionModal from './EditWorkflowTransitionModal';

interface EditWorkflowStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId: string | null;
}

const EditWorkflowStepsModal: React.FC<EditWorkflowStepsModalProps> = ({
  isOpen,
  onClose,
  workflowId,
}) => {
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Store hooks
  const { 
    currentWorkflowWithDetails,
    fetchWFMWorkflowWithDetails,
    loading,
    error,
    submitting,
    removeWorkflowStep,
    deleteWorkflowTransition,
    clearError
  } = useWFMWorkflowStore();

  // Custom hook for step order management
  const {
    localSteps,
    orderChanged,
    moveStep,
    saveOrder,
    isSubmitting: orderSubmitting
  } = useWorkflowStepOrder({
    workflowId,
    originalSteps: currentWorkflowWithDetails?.steps || []
  });

  // Modal state management
  const {
    isOpen: isCreateStepOpen,
    onOpen: onCreateStepOpen,
    onClose: onCreateStepClose,
  } = useDisclosure();
  const {
    isOpen: isEditStepOpen,
    onOpen: onEditStepOpen,
    onClose: onEditStepClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteStepOpen,
    onOpen: onDeleteStepOpen,
    onClose: onDeleteStepClose,
  } = useDisclosure();
  const {
    isOpen: isCreateTransitionOpen,
    onOpen: onCreateTransitionOpen,
    onClose: onCreateTransitionClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteTransitionOpen,
    onOpen: onDeleteTransitionOpen,
    onClose: onDeleteTransitionClose,
  } = useDisclosure();
  const {
    isOpen: isEditTransitionOpen,
    onOpen: onEditTransitionOpen,
    onClose: onEditTransitionClose,
  } = useDisclosure();

  // Selected items state
  const [selectedStep, setSelectedStep] = useState<WfmWorkflowStep | null>(null);
  const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(null);
  const [selectedTransitionForEdit, setSelectedTransitionForEdit] = useState<WfmWorkflowTransition | null>(null);

  // Effects
  useEffect(() => {
    if (workflowId && isOpen) {
      fetchWFMWorkflowWithDetails(workflowId);
    }
  }, [workflowId, isOpen, fetchWFMWorkflowWithDetails]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading workflow details',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      clearError();
    }
  }, [error, toast, clearError]);

  // Event handlers
  const handleEditStep = (step: WfmWorkflowStep) => {
    setSelectedStep(step);
    onEditStepOpen();
  };

  const handleDeleteStepPrompt = (step: WfmWorkflowStep) => {
    setSelectedStep(step);
    onDeleteStepOpen();
  };

  const handleConfirmDeleteStep = async () => {
    if (selectedStep && workflowId) {
      try {
        await removeWorkflowStep(selectedStep.id, workflowId);
        toast({ 
          title: 'Step Deleted', 
          status: 'success', 
          duration: 3000, 
          isClosable: true 
        });
        onDeleteStepClose();
        setSelectedStep(null);
      } catch (e: any) {
        toast({ 
          title: 'Error Deleting Step', 
          description: e.message, 
          status: 'error', 
          duration: 5000, 
          isClosable: true 
        });
      }
    }
  };

  const handleDeleteTransitionPrompt = (transitionId: string) => {
    setSelectedTransitionId(transitionId);
    onDeleteTransitionOpen();
  };

  const handleConfirmDeleteTransition = async () => {
    if (selectedTransitionId) {
      try {
        await deleteWorkflowTransition(selectedTransitionId);
        toast({
          title: 'Transition Deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onDeleteTransitionClose();
        setSelectedTransitionId(null);
      } catch (e: any) {
        toast({
          title: 'Error Deleting Transition',
          description: e.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleEditTransition = (transition: WfmWorkflowTransition) => {
    setSelectedTransitionForEdit(transition);
    onEditTransitionOpen();
  };

  const handleSaveOrder = async () => {
    await saveOrder();
  };

  if (!workflowId) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Edit Workflow Steps & Transitions for: {
            currentWorkflowWithDetails?.name || <Spinner size="sm" />
          }
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {loading && !currentWorkflowWithDetails ? (
            <Flex justify="center" align="center" minH="200px">
              <Spinner size="xl" />
            </Flex>
          ) : !currentWorkflowWithDetails ? (
            <Text>Workflow details could not be loaded.</Text>
          ) : (
            <VStack spacing={6} align="stretch">
              {/* Steps Section */}
              <Box>
                <Flex mb={4} align="center">
                  <Heading size="md">Steps</Heading>
                  <Spacer />
                  <Button 
                    leftIcon={<AddIcon />} 
                    colorScheme="green" 
                    onClick={onCreateStepOpen}
                    isLoading={submitting}
                  >
                    Add New Step
                  </Button>
                </Flex>
                
                <WorkflowStepsTable
                  steps={localSteps}
                  onEditStep={handleEditStep}
                  onDeleteStep={handleDeleteStepPrompt}
                  onMoveStep={moveStep}
                  submitting={submitting || orderSubmitting}
                  selectedStepId={selectedStep?.id}
                />

                {orderChanged && (
                  <Flex justify="flex-end" mt={4}>
                    <Button 
                      colorScheme="blue" 
                      onClick={handleSaveOrder}
                      isLoading={orderSubmitting} 
                    >
                      Save Step Order
                    </Button>
                  </Flex>
                )}
              </Box>

              <Divider />

              {/* Transitions Section */}
              <Box>
                <Flex mb={4} align="center">
                  <Heading size="md">Transitions</Heading>
                  <Spacer />
                  <Button 
                    leftIcon={<AddIcon />} 
                    colorScheme="teal"
                    onClick={onCreateTransitionOpen}
                  >
                    Add Transition
                  </Button>
                </Flex>
                
                <WorkflowTransitionsTable
                  transitions={currentWorkflowWithDetails.transitions || []}
                  onEditTransition={handleEditTransition}
                  onDeleteTransition={handleDeleteTransitionPrompt}
                  submitting={submitting}
                />
              </Box>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>

      {/* Child Modals */}
      {workflowId && (
        <CreateWorkflowStepModal 
          isOpen={isCreateStepOpen} 
          onClose={onCreateStepClose} 
          workflowId={workflowId} 
        />
      )}

      {workflowId && selectedStep && (
        <EditWorkflowStepModal 
          isOpen={isEditStepOpen} 
          onClose={() => { 
            onEditStepClose(); 
            setSelectedStep(null); 
          }} 
          workflowId={workflowId} 
          step={selectedStep} 
        />
      )}

      {workflowId && localSteps.length > 0 && (
        <CreateWorkflowTransitionModal
          isOpen={isCreateTransitionOpen}
          onClose={onCreateTransitionClose}
          workflowId={workflowId}
          steps={localSteps}
        />
      )}

      {selectedStep && (
        <ConfirmationDialog
          isOpen={isDeleteStepOpen}
          onClose={() => { 
            onDeleteStepClose(); 
            setSelectedStep(null); 
          }}
          onConfirm={handleConfirmDeleteStep}
          title={`Delete Step`}
          body={`Are you sure you want to delete this step? This action cannot be undone and might affect transitions.`}
          confirmButtonText="Delete Step"
          confirmButtonColor="red"
          isConfirmLoading={submitting}
          leastDestructiveRef={cancelRef}
        />
      )}

      {selectedTransitionId && (
        <ConfirmationDialog
          isOpen={isDeleteTransitionOpen}
          onClose={() => { 
            onDeleteTransitionClose(); 
            setSelectedTransitionId(null); 
          }}
          onConfirm={handleConfirmDeleteTransition}
          title={`Delete Transition`}
          body={`Are you sure you want to delete this transition? This action cannot be undone.`}
          confirmButtonText="Delete Transition"
          confirmButtonColor="red"
          isConfirmLoading={submitting}
          leastDestructiveRef={cancelRef}
        />
      )}

      {selectedTransitionForEdit && (
        <EditWorkflowTransitionModal
          isOpen={isEditTransitionOpen}
          onClose={() => {
            onEditTransitionClose();
            setSelectedTransitionForEdit(null);
          }}
          transition={selectedTransitionForEdit}
        />
      )}
    </Modal>
  );
};

export default EditWorkflowStepsModal; 