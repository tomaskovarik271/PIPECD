import React, { useEffect, useState } from 'react';
import { useAppStore, Pipeline } from '../stores/useAppStore';
import { 
  Box, 
  Heading, 
  Button, 
  HStack, 
  VStack, 
  Spinner, 
  Alert, 
  AlertIcon,
  List, 
  ListItem,
  IconButton,
  useDisclosure,
  Flex,
  useToast
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon, CopyIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

// Import the modal components
import CreatePipelineModal from '../components/pipelines/CreatePipelineModal';
import EditPipelineModal from '../components/pipelines/EditPipelineModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import EmptyState from '../components/common/EmptyState';

const PipelinesPage: React.FC = () => {
  // Select state slices
  const pipelines = useAppStore((state) => state.pipelines);
  const fetchPipelines = useAppStore((state) => state.fetchPipelines);
  const pipelinesLoading = useAppStore((state) => state.pipelinesLoading);
  const pipelinesError = useAppStore((state) => state.pipelinesError);
  // Fetch permissions
  const userPermissions = useAppStore((state) => state.userPermissions);
  
  // Disclosure hooks for the modals
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // State for tracking pipeline being edited/deleted
  const [pipelineToEdit, setPipelineToEdit] = useState<Pipeline | null>(null);
  const [pipelineToDelete, setPipelineToDelete] = useState<Pipeline | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const deletePipelineAction = useAppStore((state) => state.deletePipeline);
  const toast = useToast();

  useEffect(() => {
    // Fetch pipelines when the component mounts
    fetchPipelines();
  }, [fetchPipelines]);

  const handleViewStages = (pipelineId: string) => {
    navigate(`/pipelines/${pipelineId}/stages`);
  };
  
  // --- Modal Handlers ---
  const handleAddPipeline = () => {
    onCreateOpen();
  };

  const handleEditPipeline = (pipeline: Pipeline) => {
    setPipelineToEdit(pipeline);
    onEditOpen();
  };

  const handleDeletePipeline = (pipeline: Pipeline) => {
    setPipelineToDelete(pipeline);
    onDeleteOpen();
  };

  // Success callback (optional - store handles state update)
  const handleSuccess = () => {
    console.log('Pipeline action successful');
    // fetchPipelines(); // Re-fetching is usually not needed due to store updates
  };

  const handleConfirmDelete = async () => {
    if (!pipelineToDelete) return;

    setIsDeleting(true);
    const success = await deletePipelineAction(pipelineToDelete.id);
    setIsDeleting(false);
    onDeleteClose(); // Close the dialog
    setPipelineToDelete(null); // Clear selection

    if (success) {
      toast({ title: 'Pipeline deleted.', status: 'success', duration: 3000, isClosable: true });
      handleSuccess(); // Call original success handler if needed
    } else {
      // Assuming deletePipelineAction sets an error state in the store
      const errorMsg = useAppStore.getState().pipelinesError || 'Failed to delete pipeline';
      toast({ title: 'Error Deleting Pipeline', description: errorMsg, status: 'error', duration: 5000, isClosable: true });
    }
  };
  
  const handleEditClose = () => {
      onEditClose();
      setPipelineToEdit(null); // Clear selection on close
  };

  const handleDeleteClose = () => {
      onDeleteClose();
      setPipelineToDelete(null); // Clear selection on close
  };

  return (
    <VStack spacing={4} align="stretch">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="lg">Pipelines</Heading>
        <Button 
            onClick={handleAddPipeline} 
            colorScheme="blue"
            leftIcon={<AddIcon boxSize={3} />}
            isDisabled={!userPermissions?.includes('pipeline:create')}
        >
          Add Pipeline
        </Button>
      </Flex>

      {pipelinesLoading && (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" />
        </Flex>
      )}

      {pipelinesError && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          Error fetching pipelines: {pipelinesError}
        </Alert>
      )}

      {!pipelinesLoading && !pipelinesError && (
        <VStack spacing={4} align="stretch">
          {pipelines.length === 0 ? (
            <EmptyState 
              icon={CopyIcon}
              title="No Pipelines Created"
              message="Create pipelines to visualize and manage your sales processes."
              actionButtonLabel="Add Pipeline"
              onActionButtonClick={handleAddPipeline}
              isActionButtonDisabled={!userPermissions?.includes('pipeline:create')}
            />
          ) : (
            <List spacing={3}>
              {pipelines.map((pipeline) => (
                <ListItem 
                  key={pipeline.id} 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="md" 
                  bg="white" 
                  shadow="sm"
                  _hover={{ shadow: 'md' }}
                >
                  <Flex justify="space-between" align="center">
                    <Box flexGrow={1} mr={4}>
                      <Heading size="md">{pipeline.name}</Heading>
                      {/* Can add more details here later, like stage count */}
                    </Box>
                    <HStack spacing={2}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        leftIcon={<ViewIcon />}
                        onClick={() => handleViewStages(pipeline.id)} 
                      >
                        View Stages
                      </Button>
                      <IconButton
                        aria-label="Edit pipeline"
                        icon={<EditIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPipeline(pipeline)}
                        isDisabled={!userPermissions?.includes('pipeline:update_any')}
                      />
                      <IconButton
                        aria-label="Delete pipeline"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeletePipeline(pipeline)}
                        isDisabled={!userPermissions?.includes('pipeline:delete_any')}
                      />
                    </HStack>
                  </Flex>
                </ListItem>
              ))}
            </List>
          )}
        </VStack>
      )}

      {/* Render Modals */} 
      <CreatePipelineModal 
        isOpen={isCreateOpen} 
        onClose={onCreateClose} 
        onSuccess={handleSuccess} 
      />
      
      <EditPipelineModal 
        isOpen={isEditOpen} 
        onClose={handleEditClose} // Use custom close handler to clear state
        pipeline={pipelineToEdit} 
        onSuccess={handleSuccess} 
      />
      
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={handleDeleteClose} // Keep custom close to clear state
        onConfirm={handleConfirmDelete}
        headerText="Delete Pipeline"
        bodyText={`Are you sure you want to delete the pipeline "${pipelineToDelete?.name}"? All associated stages and deals within those stages will also be affected. This action cannot be undone.`}
        confirmButtonText="Delete"
        confirmButtonColorScheme="red"
        isLoading={isDeleting}
      />

    </VStack>
  );
};

export default PipelinesPage; 