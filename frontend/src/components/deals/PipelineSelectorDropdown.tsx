import React, { useEffect } from 'react';
import { Select, FormControl, FormLabel, Spinner, Alert, AlertIcon, Box, Text } from '@chakra-ui/react';
import { usePipelinesStore, Pipeline } from '../../stores/usePipelinesStore';
import { useDealsStore } from '../../stores/useDealsStore';

interface PipelineSelectorDropdownProps {
  // Props can be added here if needed in the future, e.g., for styling or specific behavior
}

const PipelineSelectorDropdown: React.FC<PipelineSelectorDropdownProps> = () => {
  const { pipelines, pipelinesLoading, pipelinesError, fetchPipelines } = usePipelinesStore();
  const { selectedKanbanPipelineId, setSelectedKanbanPipelineId } = useDealsStore();

  useEffect(() => {
    // Fetch pipelines if not already loaded or if there was an error previously
    if ((!pipelines || pipelines.length === 0) && !pipelinesLoading) {
      fetchPipelines();
    }
  }, [fetchPipelines, pipelines, pipelinesLoading]);

  useEffect(() => {
    // If no pipeline is selected and pipelines are loaded, select the first one by default
    if (!selectedKanbanPipelineId && pipelines && pipelines.length > 0) {
      setSelectedKanbanPipelineId(pipelines[0].id);
    }
  }, [selectedKanbanPipelineId, pipelines, setSelectedKanbanPipelineId]);

  const handlePipelineChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const pipelineId = event.target.value;
    setSelectedKanbanPipelineId(pipelineId || null); // Set to null if "Select a pipeline" is chosen
  };

  if (pipelinesLoading && (!pipelines || pipelines.length === 0)) {
    return (
      <Box display="flex" alignItems="center">
        <Spinner size="sm" mr={2} />
        <Text fontSize="sm">Loading pipelines...</Text>
      </Box>
    );
  }

  if (pipelinesError) {
    return (
      <Alert status="error" variant="subtle" borderRadius="md">
        <AlertIcon />
        <Text fontSize="sm"isTruncated>Error loading pipelines: {pipelinesError}</Text>
      </Alert>
    );
  }

  if (!pipelines || pipelines.length === 0) {
    return <Text fontSize="sm" color="gray.500">No pipelines available.</Text>;
  }

  return (
    <FormControl id="pipeline-selector">
      <FormLabel srOnly>Select Pipeline</FormLabel> {/* Screen reader only label */}
      <Select
        placeholder="Select a pipeline"
        value={selectedKanbanPipelineId || ''}
        onChange={handlePipelineChange}
        isDisabled={pipelinesLoading || !!pipelinesError}
        size="sm"
        maxWidth="300px" // Example styling, adjust as needed
      >
        {pipelines.map((pipeline: Pipeline) => (
          <option key={pipeline.id} value={pipeline.id}>
            {pipeline.name}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default PipelineSelectorDropdown; 