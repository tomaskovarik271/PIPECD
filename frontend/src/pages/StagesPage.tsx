import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useAppStore, Stage } from '../stores/useAppStore';
import { Box, Heading, Button, Text, Spinner, Alert, AlertIcon, VStack, HStack, useDisclosure, IconButton } from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import CreateStageModal from '../components/CreateStageModal';
import EditStageModal from '../components/EditStageModal';
import DeleteStageConfirmationDialog from '../components/DeleteStageConfirmationDialog';

// TODO: Add Create/Edit Stage Modals later

const StagesPage: React.FC = () => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const [stageToEdit, setStageToEdit] = useState<Stage | null>(null);
  const [stageToDelete, setStageToDelete] = useState<Stage | null>(null);

  const stages = useAppStore((state) => state.stages);
  const fetchStages = useAppStore((state) => state.fetchStages);
  const stagesLoading = useAppStore((state) => state.stagesLoading);
  const stagesError = useAppStore((state) => state.stagesError);
  const pipeline = useAppStore((state) => 
    state.pipelines.find(p => p.id === pipelineId)
  );
  const fetchPipelines = useAppStore((state) => state.fetchPipelines);
  const pipelinesLoading = useAppStore((state) => state.pipelinesLoading);

  useEffect(() => {
    if (pipelineId) {
        // Fetch stages for this specific pipeline
        fetchStages(pipelineId);
    } 
    // Fetch pipelines if the specific one isn't found (e.g., direct navigation)
    if (!pipeline && !pipelinesLoading) {
        fetchPipelines();
    }
  }, [pipelineId, fetchStages, pipeline, pipelinesLoading, fetchPipelines]);

  const handleAddStage = () => {
    onCreateOpen(); // Open the create modal
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
     // Optionally refetch stages here if needed, though store should update
     // if (pipelineId) fetchStages(pipelineId);
  }

  if (pipelinesLoading) {
    return <Spinner />;
  }

  if (!pipeline) {
     return (
        <Box p={4}>
             <Alert status="error">
                <AlertIcon />
                Pipeline not found.
             </Alert>
             <Button as={RouterLink} to="/pipelines" mt={4}>Back to Pipelines</Button>
        </Box>
     );
  }

  return (
    <Box p={4}>
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
            <Heading size="lg">Stages for Pipeline: {pipeline?.name || 'Loading...'}</Heading>
             <Button colorScheme="blue" leftIcon={<AddIcon boxSize={3} />} onClick={handleAddStage}>
                Add Stage
             </Button>
        </HStack>
        
        <Text>Manage the stages within the "{pipeline.name}" pipeline.</Text>

        {stagesLoading && <Spinner />}
        {stagesError && (
            <Alert status="error">
                <AlertIcon />
                Error loading stages: {stagesError}
            </Alert>
        )}

        {!stagesLoading && !stagesError && (
             stages.length === 0 ? (
                <Text>No stages found in this pipeline. Add one to get started!</Text>
             ) : (
                <VStack align="stretch" spacing={3} borderWidth="1px" borderRadius="md" p={4}>
                    {stages.map((stage) => (
                        <HStack key={stage.id} justify="space-between" p={2} _hover={{ bg: 'gray.50' }}>
                            <Box>
                               <Text fontWeight="medium">{stage.name}</Text>
                               <Text fontSize="sm" color="gray.500">Order: {stage.order} {stage.deal_probability ? ` | Probability: ${stage.deal_probability}%` : ''}</Text>
                            </Box>
                            <HStack>
                                <IconButton
                                    aria-label="Edit stage"
                                    icon={<EditIcon />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditStage(stage)}
                                />
                                <IconButton
                                    aria-label="Delete stage"
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleDeleteStage(stage)}
                                />
                            </HStack>
                        </HStack>
                    ))}
                </VStack>
             )
        )}
         <Button as={RouterLink} to="/pipelines" mt={4} variant="outline">Back to Pipelines</Button>
      </VStack>

      {/* Render the Create Stage Modal */}
      {pipelineId && (
         <CreateStageModal 
            isOpen={isCreateOpen} 
            onClose={onCreateClose} 
            pipelineId={pipelineId} 
            onSuccess={handleSuccess}
         />
      )}

      {/* Render the Edit Stage Modal */}
      <EditStageModal 
         isOpen={isEditOpen}
         onClose={() => {
            onEditClose();
            setStageToEdit(null); // Clear selection on close
         }}
         stage={stageToEdit}
         onSuccess={handleSuccess}
      />

      {/* Render the Delete Stage Confirmation */} 
       <DeleteStageConfirmationDialog 
         isOpen={isDeleteOpen}
         onClose={() => {
            onDeleteClose();
            setStageToDelete(null); // Clear selection on close
         }}
         stage={stageToDelete}
         onSuccess={handleSuccess}
      />

    </Box>
  );
};

export default StagesPage; 