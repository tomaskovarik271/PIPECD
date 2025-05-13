import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { usePipelinesStore, Pipeline } from '../stores/usePipelinesStore';
import { useStagesStore, Stage } from '../stores/useStagesStore';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  HStack, 
  VStack, 
  Spinner, 
  Alert, 
  AlertIcon,
  List, 
  ListItem,
  IconButton,
  Link,
  Flex,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ArrowBackIcon, DragHandleIcon } from '@chakra-ui/icons';

// Import the stage modal components
import CreateStageModal from '../components/stages/CreateStageModal';
import EditStageModal from '../components/stages/EditStageModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import EmptyState from '../components/common/EmptyState';

// TODO: Import/create Modals for Create/Edit/Delete Stages later

const StagesPage: React.FC = () => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  
  // Add this state to track fetch attempts per pipeline
  const [initialFetchAttemptedForPipeline, setInitialFetchAttemptedForPipeline] = useState<Record<string, boolean>>({});
  
  // Select state slices from Zustand
  const { 
    stages,
    fetchStages,
    stagesLoading,
    stagesError,
    deleteStage: deleteStageAction
  } = useStagesStore();

  const userPermissions = useAppStore((state) => state.userPermissions);

  // Get pipelines state from usePipelinesStore
  const { 
    pipelines, 
    fetchPipelines: fetchPipelinesFromStore,
    pipelinesLoading: pipelinesLoadingFromStore,
    selectedPipelineId: selectedPipelineIdFromStore
  } = usePipelinesStore();
  
  const currentPipeline = pipelines.find(p => p.id === pipelineId);

  // State for modals
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [stageToEdit, setStageToEdit] = useState<Stage | null>(null);
  const [stageToDelete, setStageToDelete] = useState<Stage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (pipelines.length === 0 && !pipelinesLoadingFromStore && pipelineId) {
        fetchPipelinesFromStore(); 
    }

    if (pipelineId && !stagesLoading) {
      // Check if fetch has been attempted for the current pipelineId
      // Simplified: always attempt fetch if pipelineId is present and not currently loading stages
      // More sophisticated logic might be needed if fetchStages itself sets stagesError and we need to distinguish
      // fetch errors from action errors more granularly for display.
      // For now, the store's stagesError will reflect the latest error (fetch or action).
      fetchStages(pipelineId);
    }
    // Intentionally simplified dependencies for refetch on pipelineId change.
    // Consider adding initialFetchAttemptedForPipeline if you want to prevent refetching on every render.
  }, [pipelineId, fetchPipelinesFromStore]); // Removed some dependencies to make it simpler for now

  // --- Modal Handlers ---
  const handleAddStage = () => {
    onCreateOpen();
  };

  const handleEditStage = (stage: Stage) => {
    setStageToEdit(stage);
    onEditOpen();
  };

  const handleDeleteStage = (stage: Stage) => {
    setStageToDelete(stage);
    onDeleteOpen();
  };
  
  const handleSuccess = () => {
    console.log('Stage action successful');
    // Store handles state updates, no refetch needed here typically
  };
  
  const handleEditClose = () => {
      onEditClose();
      setStageToEdit(null);
  };

  const handleDeleteClose = () => {
      onDeleteClose();
      setStageToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!stageToDelete) return;

    setIsDeleting(true);
    // We use a local variable for the error from this specific delete action
    let deleteError: string | null = null; 
    try {
      const success = await deleteStageAction(stageToDelete.id);
      if (success) {
        toast({ title: 'Stage deleted.', status: 'success', duration: 3000, isClosable: true });
      } else {
        // If deleteStageAction returns false, it implies it caught an error and set stagesError in the store
        deleteError = useStagesStore.getState().stagesError || 'Failed to delete stage';
      }
    } catch (e) {
      // If deleteStageAction itself throws (less likely if it catches internally)
      deleteError = (e instanceof Error) ? e.message : String(e);
    } finally {
      setIsDeleting(false);
      onDeleteClose();
      setStageToDelete(null);
      if (deleteError) {
        toast({ title: 'Error Deleting Stage', description: deleteError, status: 'error', duration: 5000, isClosable: true });
      }
    }
  };

  return (
    <VStack spacing={4} align="stretch">
       <Link as={RouterLink} to="/pipelines" mb={4} display="inline-block">
         <ArrowBackIcon mr={1} /> Back to Pipelines
       </Link>
      <Heading size="lg" mb={2}>
        Stages for Pipeline: {currentPipeline ? currentPipeline.name : (pipelineId ? `(${pipelineId.substring(0, 8)}...)` : 'Loading...')}
      </Heading>
      
      {/* Display global stagesError if present (could be from fetch or last action) */}
      {/* This provides general feedback. Specific action errors are also handled by toasts in modals/handlers. */}
      {stagesError && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {stagesError} {/* Display the error from the store */}
        </Alert>
      )}

      {pipelineId && (
        <Button 
          onClick={handleAddStage} 
          colorScheme="blue"
          alignSelf="flex-start"
          mb={4}
          isDisabled={!userPermissions?.includes('stage:create')}
        >
          New Stage
        </Button>
      )}

      {/* Show spinner only if loading and no stages are displayed yet */}
      {stagesLoading && stages.filter((s: Stage) => s.pipeline_id === pipelineId).length === 0 && (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" />
        </Flex>
      )}

      {!pipelineId && !stagesLoading && ( // If no pipelineId is in the URL
          <Alert status="warning" mb={4}>
            <AlertIcon />
            No Pipeline ID found in URL. Please select a pipeline.
          </Alert>
      )}

      {/* Render stages list if pipelineId exists. 
          The list visibility is no longer strictly tied to !stagesError.
          If stagesError is from a fetch, stages array would likely be empty.
          If stagesError is from an action (like create), stages array still holds existing data.
      */}
      {pipelineId && (
        // Filter stages for the current pipeline from the store's potentially mixed list
        stages.filter((s: Stage) => s.pipeline_id === pipelineId).length === 0 && !stagesLoading ? (
          // Show EmptyState only if, after filtering, there are no stages for THIS pipeline, AND not currently loading.
          // And no critical fetch error prevented any stage loading (the Alert above would show stagesError).
          <EmptyState 
            icon={DragHandleIcon}
            title="No Stages in this Pipeline"
            message="Add stages to define the steps in your sales process for this pipeline."
            actionButtonLabel="Add Stage"
            onActionButtonClick={handleAddStage}
            isActionButtonDisabled={!userPermissions?.includes('stage:create')}
          />
        ) : (
          <List spacing={3}>
            {stages.filter((s: Stage) => s.pipeline_id === pipelineId).map((stage: Stage) => (
              <ListItem 
                key={stage.id} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg="white" 
                shadow="sm"
                _hover={{ shadow: 'md' }}
              >
                <Flex justify="space-between" align="center">
                  <Box flexGrow={1} mr={4}>
                    <Heading size="sm">{stage.name}</Heading>
                    <Text fontSize="sm" color="gray.500">
                      Order: {stage.order}
                      {stage.deal_probability !== null && stage.deal_probability !== undefined && 
                        // Multiply by 100 and format as percentage
                        ` | Probability: ${Math.round(stage.deal_probability * 100)}%` 
                      }
                    </Text>
                  </Box>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Edit stage"
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditStage(stage)}
                      isDisabled={!userPermissions?.includes('stage:update_any')}
                    />
                    <IconButton
                      aria-label="Delete stage"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeleteStage(stage)}
                      isDisabled={!userPermissions?.includes('stage:delete_any')}
                    />
                  </HStack>
                </Flex>
              </ListItem>
            ))}
          </List>
        )
      )}
      
      {pipelineId && (
        <CreateStageModal 
          isOpen={isCreateOpen} 
          onClose={onCreateClose} 
          pipelineId={pipelineId} 
          onSuccess={handleSuccess} // onSuccess might trigger a toast or a silent success log
        />
      )}
      
      <EditStageModal 
        isOpen={isEditOpen} 
        onClose={handleEditClose} 
        stage={stageToEdit} 
        onSuccess={handleSuccess} 
      />
      
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={handleDeleteClose}
        onConfirm={handleConfirmDelete}
        headerText="Delete Stage"
        bodyText={`Are you sure you want to delete the stage "${stageToDelete?.name}"? All deals in this stage will be affected. This action cannot be undone.`}
        confirmButtonText="Delete"
        confirmButtonColorScheme="red"
        isLoading={isDeleting}
      />
    </VStack>
  );
};

export default StagesPage; 