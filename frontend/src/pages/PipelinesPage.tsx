import React, { useEffect, useState } from 'react';
import { useAppStore, Pipeline } from '../stores/useAppStore';
import { useDisclosure, Button, IconButton, HStack, Box, Text } from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import CreatePipelineModal from '../components/CreatePipelineModal';
import EditPipelineModal from '../components/EditPipelineModal';
import DeletePipelineConfirmationDialog from '../components/DeletePipelineConfirmationDialog';
import { useNavigate } from 'react-router-dom';

const PipelinesPage: React.FC = () => {
  // Select state slices individually to prevent unnecessary re-renders
  const pipelines = useAppStore((state) => state.pipelines);
  const fetchPipelines = useAppStore((state) => state.fetchPipelines);
  const pipelinesLoading = useAppStore((state) => state.pipelinesLoading);
  const pipelinesError = useAppStore((state) => state.pipelinesError);

  const navigate = useNavigate();

  // Disclosure hooks for the modals
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // State for tracking pipeline being edited/deleted
  const [pipelineToEdit, setPipelineToEdit] = useState<Pipeline | null>(null);
  const [pipelineToDelete, setPipelineToDelete] = useState<Pipeline | null>(null);

  useEffect(() => {
    // Fetch pipelines when the component mounts
    fetchPipelines();
  }, [fetchPipelines]);

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

  // Optional success callback
  const handleSuccess = () => {
    // fetchPipelines(); // Store should update list automatically
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Pipelines</h1>
        <Button onClick={onCreateOpen} colorScheme="blue" leftIcon={<AddIcon boxSize={3} />}>
          Add Pipeline
        </Button>
      </div>

      {pipelinesLoading && <p>Loading pipelines...</p>}
      {pipelinesError && <p className="text-red-500">Error: {pipelinesError}</p>}

      {!pipelinesLoading && !pipelinesError && (
        <div>
          {pipelines.length === 0 ? (
            <p>No pipelines found. Create one to get started!</p>
          ) : (
            <ul className="space-y-2">
              {/* TODO: Use a Card or Table component later */}
              {pipelines.map((pipeline) => (
                <li key={pipeline.id} className="p-4 border rounded shadow-sm bg-white flex justify-between items-center">
                  <Box flexGrow={1} mr={4}>
                    <Text fontWeight="medium">{pipeline.name}</Text>
                    {/* Could add stage count or other info here later */}
                  </Box>
                  <HStack spacing={2}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/pipelines/${pipeline.id}/stages`)} 
                    >
                      View Stages
                    </Button>
                    <IconButton
                      aria-label="Edit pipeline"
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditPipeline(pipeline)}
                    />
                    <IconButton
                      aria-label="Delete pipeline"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeletePipeline(pipeline)}
                    />
                  </HStack>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <CreatePipelineModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onSuccess={handleSuccess}
      />

      {/* Render Edit Modal */}
      <EditPipelineModal
        isOpen={isEditOpen}
        onClose={() => {
          onEditClose();
          setPipelineToEdit(null);
        }}
        pipeline={pipelineToEdit}
        onSuccess={handleSuccess}
      />
      
      {/* Render Delete Dialog */}
      <DeletePipelineConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          onDeleteClose();
          setPipelineToDelete(null);
        }}
        pipeline={pipelineToDelete}
        onSuccess={handleSuccess}
      />

    </div>
  );
};

export default PipelinesPage; 