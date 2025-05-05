import React, { useEffect, useState } from 'react';
import { useAppStore, Pipeline } from '../stores/useAppStore';
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
  useDisclosure,
  Flex
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

// Import the modal components
import CreatePipelineModal from '../components/pipelines/CreatePipelineModal';
import EditPipelineModal from '../components/pipelines/EditPipelineModal';
import DeletePipelineConfirmationDialog from '../components/pipelines/DeletePipelineConfirmationDialog';

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

  const navigate = useNavigate();

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
  
  const handleEditClose = () => {
      onEditClose();
      setPipelineToEdit(null); // Clear selection on close
  };

  const handleDeleteClose = () => {
      onDeleteClose();
      setPipelineToDelete(null); // Clear selection on close
  };

  return (
    <Box p={4}>
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
            <Text>No pipelines found. Create one to get started!</Text>
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
      
      <DeletePipelineConfirmationDialog 
        isOpen={isDeleteOpen} 
        onClose={handleDeleteClose} // Use custom close handler to clear state
        pipeline={pipelineToDelete} 
        onSuccess={handleSuccess} 
      />

    </Box>
  );
};

export default PipelinesPage; 