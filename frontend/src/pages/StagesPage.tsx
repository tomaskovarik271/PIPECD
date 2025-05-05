import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useAppStore, Stage } from '../stores/useAppStore';
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
  useDisclosure
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';

// Import the stage modal components
import CreateStageModal from '../components/stages/CreateStageModal';
import EditStageModal from '../components/stages/EditStageModal';
import DeleteStageConfirmationDialog from '../components/stages/DeleteStageConfirmationDialog';

// TODO: Import/create Modals for Create/Edit/Delete Stages later

const StagesPage: React.FC = () => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  
  // Select state slices from Zustand
  const stages = useAppStore((state) => state.stages);
  const fetchStages = useAppStore((state) => state.fetchStages);
  const stagesLoading = useAppStore((state) => state.stagesLoading);
  const stagesError = useAppStore((state) => state.stagesError);
  const selectedPipelineId = useAppStore((state) => state.selectedPipelineId);
  // Fetch permissions
  const userPermissions = useAppStore((state) => state.userPermissions);
  // Also get pipeline name for context (assuming pipelines are already fetched)
  const pipeline = useAppStore((state) => 
    state.pipelines.find(p => p.id === pipelineId)
  );

  // State for modals
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [stageToEdit, setStageToEdit] = useState<Stage | null>(null);
  const [stageToDelete, setStageToDelete] = useState<Stage | null>(null);

  useEffect(() => {
    if (pipelineId) {
      // Fetch stages only if the pipelineId is available and different from the currently selected one
      // or if stages haven't been loaded for this pipeline yet.
      if (pipelineId !== selectedPipelineId || stages.length === 0) {
          fetchStages(pipelineId);
      } 
      // Note: If pipelines haven't loaded yet, the pipeline name might not appear initially.
      // Consider fetching the specific pipeline if not found in the store list for robustness.
    }
  }, [pipelineId, fetchStages, selectedPipelineId, stages.length]); // Add dependencies

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

  return (
    <Box p={4}>
       <Link as={RouterLink} to="/pipelines" mb={4} display="inline-block">
         <ArrowBackIcon mr={1} /> Back to Pipelines
       </Link>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="lg">
          Stages for Pipeline: {pipeline ? pipeline.name : (pipelineId ? `(${pipelineId.substring(0, 8)}...)` : 'Loading...')}
        </Heading>
        {/* Only show Add Stage button if pipelineId is valid and user has permission */}
        {pipelineId && (
          <Button 
            onClick={handleAddStage} 
            colorScheme="teal" 
            leftIcon={<AddIcon boxSize={3} />}
            isDisabled={!userPermissions?.includes('stage:create')}
          >
            Add Stage
          </Button>
        )}
      </Flex>

      {stagesLoading && (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" />
        </Flex>
      )}

      {stagesError && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          Error fetching stages: {stagesError}
        </Alert>
      )}

      {!pipelineId && !stagesLoading && (
          <Alert status="warning" mb={4}>
            <AlertIcon />
            No Pipeline ID found in URL.
          </Alert>
      )}

      {!stagesLoading && !stagesError && pipelineId && (
        <VStack spacing={4} align="stretch">
          {stages.length === 0 ? (
            <Text>No stages found for this pipeline. Create one to get started!</Text>
          ) : (
             // TODO: Implement drag-and-drop reordering later if desired
            <List spacing={3}>
              {stages.map((stage) => (
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
          )}
        </VStack>
      )}
      
      {/* Render Stage Modals */} 
      {pipelineId && (
        <CreateStageModal 
          isOpen={isCreateOpen} 
          onClose={onCreateClose} 
          pipelineId={pipelineId} 
          onSuccess={handleSuccess} 
        />
      )}
      
      <EditStageModal 
        isOpen={isEditOpen} 
        onClose={handleEditClose} 
        stage={stageToEdit} 
        onSuccess={handleSuccess} 
      />
      
      <DeleteStageConfirmationDialog 
        isOpen={isDeleteOpen} 
        onClose={handleDeleteClose} 
        stage={stageToDelete} 
        onSuccess={handleSuccess} 
      />

    </Box>
  );
};

export default StagesPage; 