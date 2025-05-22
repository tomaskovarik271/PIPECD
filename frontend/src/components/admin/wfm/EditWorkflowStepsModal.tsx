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
  HStack,
  IconButton,
  Box,
  Heading,
  Divider,
  useDisclosure,
  Badge,
  Flex,
  Spacer,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import { useWFMWorkflowStore, WfmWorkflowWithDetails } from '../../../stores/useWFMWorkflowStore';
import CreateWorkflowStepModal from './CreateWorkflowStepModal'; // To be created or imported
import EditWorkflowStepModal from './EditWorkflowStepModal'; // To be created or imported
import ConfirmationDialog from '../../common/ConfirmationDialog'; // For deleting steps
import { WfmWorkflowStep, WfmWorkflowTransition } from '../../../generated/graphql/graphql';
import CreateWorkflowTransitionModal from './CreateWorkflowTransitionModal'; // To be created or imported
import EditWorkflowTransitionModal from './EditWorkflowTransitionModal'; // Import the new modal

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
  const currentWorkflowWithDetails = useWFMWorkflowStore((state) => state.currentWorkflowWithDetails);
  const fetchWFMWorkflowWithDetails = useWFMWorkflowStore((state) => state.fetchWFMWorkflowWithDetails);
  const loading = useWFMWorkflowStore((state) => state.loading);
  const error = useWFMWorkflowStore((state) => state.error);
  const submitting = useWFMWorkflowStore((state) => state.submitting);
  const removeWorkflowStep = useWFMWorkflowStore((state) => state.removeWorkflowStep);
  const updateWorkflowStepsOrder = useWFMWorkflowStore((state) => state.updateWorkflowStepsOrder);
  const clearError = useWFMWorkflowStore((state) => state.clearError);
  const deleteWorkflowTransition = useWFMWorkflowStore((state) => state.deleteWorkflowTransition); // Added store action

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
  } = useDisclosure(); // Disclosure for Create Transition Modal
  const {
    isOpen: isDeleteTransitionOpen,
    onOpen: onDeleteTransitionOpen,
    onClose: onDeleteTransitionClose,
  } = useDisclosure(); // Disclosure for Delete Transition Confirmation
  const {
    isOpen: isEditTransitionOpen,
    onOpen: onEditTransitionOpen,
    onClose: onEditTransitionClose,
  } = useDisclosure(); // Disclosure for Edit Transition Modal

  const [selectedStep, setSelectedStep] = useState<WfmWorkflowStep | null>(null);
  const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(null); // For deleting transitions
  const [selectedTransitionForEdit, setSelectedTransitionForEdit] = useState<WfmWorkflowTransition | null>(null); // For editing transition
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Local state for managing step order before saving
  const [localSteps, setLocalSteps] = useState<WfmWorkflowStep[]>([]);
  const [orderChanged, setOrderChanged] = useState(false);

  useEffect(() => {
    if (workflowId && isOpen) {
      fetchWFMWorkflowWithDetails(workflowId);
    }
  }, [workflowId, isOpen, fetchWFMWorkflowWithDetails]);

  useEffect(() => {
    if (currentWorkflowWithDetails && currentWorkflowWithDetails.steps) {
      // Initialize localSteps when workflow details are loaded or changed
      const sortedSteps = [...currentWorkflowWithDetails.steps].sort((a, b) => a.stepOrder - b.stepOrder);
      setLocalSteps(sortedSteps);
      setOrderChanged(false); // Reset changed flag
    } else {
      setLocalSteps([]);
      setOrderChanged(false);
    }
  }, [currentWorkflowWithDetails]);

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
        toast({ title: 'Step Deleted', status: 'success', duration: 3000, isClosable: true });
        onDeleteStepClose();
        setSelectedStep(null);
      } catch (e: any) {
        toast({ title: 'Error Deleting Step', description: e.message, status: 'error', duration: 5000, isClosable: true });
      }
    }
  };

  const handleDeleteTransitionPrompt = (transitionId: string) => {
    setSelectedTransitionId(transitionId);
    onDeleteTransitionOpen();
  };

  const handleConfirmDeleteTransition = async () => {
    if (selectedTransitionId && workflowId) {
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

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...localSteps];
    const stepToMove = newSteps[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= newSteps.length) return; // Should be prevented by button disable logic

    newSteps[index] = newSteps[swapIndex];
    newSteps[swapIndex] = stepToMove;

    setLocalSteps(newSteps);
    setOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    if (!workflowId || !orderChanged) return;

    const orderedStepIds = localSteps.map(step => step.id);
    try {
      const updatedWorkflow = await updateWorkflowStepsOrder(workflowId, orderedStepIds);
      if (updatedWorkflow) {
        toast({ title: 'Step order saved', status: 'success', duration: 3000, isClosable: true });
        setOrderChanged(false); // Reset changed flag after successful save
        // localSteps will be updated by the useEffect watching currentWorkflowWithDetails
      } else {
        // This case should ideally be handled by an error being thrown by the store action
        toast({ title: 'Failed to save order', description: 'No data returned.', status: 'warning', duration: 5000, isClosable: true });
      }
    } catch (e: any) {
      toast({ title: 'Error Saving Order', description: e.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  const getStepName = (step: WfmWorkflowStep): string => {
    if (step.metadata && typeof step.metadata === 'object' && 'name' in step.metadata) {
      return String(step.metadata.name);
    }
    return `Step ${step.stepOrder}`;
  };

  const getStepDescription = (step: WfmWorkflowStep): string | null => {
    if (step.metadata && typeof step.metadata === 'object' && 'description' in step.metadata) {
      return String(step.metadata.description);
    }
    return null;
  };

  if (!workflowId) return null; // Should not happen if modal is opened with a workflowId

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
              <Box>
                <Flex mb={4} align="center">
                  <Heading size="md">Steps</Heading>
                  <Spacer />
                  <Button 
                    leftIcon={<AddIcon />} 
                    colorScheme="green" 
                    onClick={onCreateStepOpen}
                    isLoading={submitting} // Consider if submitting is generic or specific to step creation
                  >
                    Add New Step
                  </Button>
                </Flex>
                {localSteps.length > 0 ? (
                  <Box borderWidth="1px" borderRadius="md" overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
                        <Tr>
                          <Th>Order</Th>
                          <Th>Name</Th>
                          <Th>Status</Th>
                          <Th>Initial/Final</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {localSteps.map((step, index) => (
                          <Tr key={step.id}>
                            <Td textAlign="center">
                              <HStack spacing={1}>
                                <Tooltip label="Move Up"><IconButton size="xs" variant="ghost" icon={<ArrowUpIcon />} aria-label="Move Up" isDisabled={index === 0 || submitting} onClick={() => moveStep(index, 'up')} /></Tooltip>
                                <Badge colorScheme="gray">{index + 1}</Badge>
                                <Tooltip label="Move Down"><IconButton size="xs" variant="ghost" icon={<ArrowDownIcon />} aria-label="Move Down" isDisabled={index === localSteps.length - 1 || submitting} onClick={() => moveStep(index, 'down')} /></Tooltip>
                              </HStack>
                            </Td>
                            <Td>
                              <Text fontWeight="medium">{getStepName(step)}</Text>
                              {getStepDescription(step) && (
                                <Text fontSize="xs" color="gray.500">{getStepDescription(step)}</Text>
                              )}
                            </Td>
                            <Td>
                              <Tag colorScheme={step.status.color || 'gray'} size="sm">
                                {step.status.name}
                              </Tag>
                            </Td>
                            <Td>
                              {step.isInitialStep && <Badge colorScheme="cyan" mr={1}>Initial</Badge>}
                              {step.isFinalStep && <Badge colorScheme="purple">Final</Badge>}
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                <Tooltip label="Edit Step"><IconButton icon={<EditIcon />} size="sm" variant="ghost" onClick={() => handleEditStep(step)} isLoading={submitting && selectedStep?.id === step.id} isDisabled={submitting} aria-label={`Edit step ${getStepName(step)}`}/></Tooltip>
                                <Tooltip label="Delete Step (Not Implemented)"><IconButton icon={<DeleteIcon />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDeleteStepPrompt(step)} isLoading={submitting && selectedStep?.id === step.id} isDisabled={submitting} aria-label={`Delete step ${getStepName(step)}`}/></Tooltip>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                ) : (
                  <Text color="gray.500" fontStyle="italic">No steps defined for this workflow yet.</Text>
                )}
              </Box>

              {orderChanged && (
                <Flex justify="flex-end" mt={4}>
                  <Button 
                    colorScheme="blue" 
                    onClick={handleSaveOrder}
                    isLoading={submitting} 
                  >
                    Save Step Order
                  </Button>
                </Flex>
              )}

              <Divider />

              <Box>
                <Flex mb={4} align="center">
                  <Heading size="md">Transitions</Heading>
                  <Spacer />
                  <Button 
                    leftIcon={<AddIcon />} 
                    colorScheme="teal" // Changed color for distinction
                    onClick={onCreateTransitionOpen}
                    // isLoading={submitting} // Which submitting state?
                  >
                    Add Transition
                  </Button>
                </Flex>
                {currentWorkflowWithDetails.transitions && currentWorkflowWithDetails.transitions.length > 0 ? (
                   <Box borderWidth="1px" borderRadius="md" overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
                        <Tr>
                          <Th>Name</Th>
                          <Th>From Step</Th>
                          <Th>To Step</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {currentWorkflowWithDetails.transitions.map((transition) => (
                          <Tr key={transition.id}>
                            <Td>{transition.name || <Text fontStyle="italic" color="gray.400">Unnamed Transition</Text>}</Td>
                            <Td>{getStepName(transition.fromStep)} ({transition.fromStep.status.name})</Td>
                            <Td>{getStepName(transition.toStep)} ({transition.toStep.status.name})</Td>
                            <Td>
                              <Tooltip label="Edit Transition Name">
                                <IconButton 
                                  icon={<EditIcon />} 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleEditTransition(transition)} 
                                  aria-label={`Edit transition ${transition.name || 'unnamed'}`}
                                  isDisabled={submitting} 
                                />
                              </Tooltip>
                              <Tooltip label="Delete Transition">
                                <IconButton 
                                  icon={<DeleteIcon />} 
                                  size="sm" 
                                  variant="ghost" 
                                  colorScheme="red" 
                                  onClick={() => handleDeleteTransitionPrompt(transition.id)} 
                                  aria-label={`Delete transition ${transition.name || 'unnamed'}`}
                                  isDisabled={submitting} // Assuming a generic submitting state for now
                                />
                              </Tooltip>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                   </Box>
                ) : (
                  <Text color="gray.500" fontStyle="italic">No transitions defined for this workflow yet.</Text>
                )}
              </Box>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>

      {workflowId && (
        <CreateWorkflowStepModal 
          isOpen={isCreateStepOpen} 
          onClose={() => { 
            onCreateStepClose(); 
            // fetchWFMWorkflowWithDetails(workflowId); // store action already refetches
          }} 
          workflowId={workflowId} 
        />
      )}

      {workflowId && selectedStep && (
        <EditWorkflowStepModal 
          isOpen={isEditStepOpen} 
          onClose={() => { 
            onEditStepClose(); 
            setSelectedStep(null); 
            // fetchWFMWorkflowWithDetails(workflowId); // store action already refetches
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
          steps={localSteps} // Pass available steps
        />
      )}

      {selectedStep && (
        <ConfirmationDialog
          isOpen={isDeleteStepOpen}
          onClose={() => { onDeleteStepClose(); setSelectedStep(null); }}
          onConfirm={handleConfirmDeleteStep}
          title={`Delete Step: ${getStepName(selectedStep)}`}
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
          onClose={() => { onDeleteTransitionClose(); setSelectedTransitionId(null); }}
          onConfirm={handleConfirmDeleteTransition}
          title={`Delete Transition`}
          body={`Are you sure you want to delete this transition? This action cannot be undone.`}
          confirmButtonText="Delete Transition"
          confirmButtonColor="red"
          isConfirmLoading={submitting} // Assuming a generic submitting state
          leastDestructiveRef={cancelRef} // Can share cancelRef or have a new one
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