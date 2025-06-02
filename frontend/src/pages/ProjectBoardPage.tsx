import React, { useEffect, useState } from 'react';
import { Box, Heading, Spinner, Text, VStack, Select, FormControl, FormLabel } from '@chakra-ui/react';
import { useParams } from 'react-router-dom'; // If we use a route param for workflow ID
import { useWFMWorkflowStore, WfmWorkflowWithDetails } from '../stores/useWFMWorkflowStore';
import ProjectBoard from '../components/projects/ProjectBoard'; // Uncommented

// Mock data for projects/work items until we have actual data
// This would eventually come from a new store/API for projects/work items
interface MockProject {
  id: string;
  name: string;
  currentStatusId: string; // Corresponds to WFMStatus.id, which links to a WFMWorkflowStep.status_id
  // Add other relevant project fields
}

const MOCK_PROJECTS: MockProject[] = [
  { id: 'proj-1', name: 'Project Alpha', currentStatusId: 'status-id-1' }, // Replace with actual status IDs from your test workflow
  { id: 'proj-2', name: 'Project Beta', currentStatusId: 'status-id-1' },
  { id: 'proj-3', name: 'Project Gamma', currentStatusId: 'status-id-2' },
  { id: 'proj-4', name: 'Project Delta', currentStatusId: 'status-id-3' },
];

const ProjectBoardPage: React.FC = () => {
  // Option 1: Get workflowId from route params (e.g., /project-board/:workflowId)
  // const { workflowId: routeWorkflowId } = useParams<{ workflowId: string }>(); 
  
  // Option 2: For now, allow selecting a workflow (or hardcode one for dev)
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const workflows = useWFMWorkflowStore((state) => state.workflows);
  const fetchWFMWorkflows = useWFMWorkflowStore((state) => state.fetchWFMWorkflows);
  const currentWorkflowWithDetails = useWFMWorkflowStore((state) => state.currentWorkflowWithDetails);
  const fetchWFMWorkflowWithDetails = useWFMWorkflowStore((state) => state.fetchWFMWorkflowWithDetails);
  const loadingWorkflows = useWFMWorkflowStore((state) => state.loading); // Generic loading, might need to differentiate
  const error = useWFMWorkflowStore((state) => state.error);

  useEffect(() => {
    fetchWFMWorkflows(false); // Fetch non-archived workflows for the selector
  }, [fetchWFMWorkflows]);

  useEffect(() => {
    if (selectedWorkflowId) {
      fetchWFMWorkflowWithDetails(selectedWorkflowId);
    }
  }, [selectedWorkflowId, fetchWFMWorkflowWithDetails]);

  // TODO: Replace with actual ProjectBoard component call
  const renderProjectBoard = (workflow: WfmWorkflowWithDetails, projects: MockProject[]) => {
    return (
      <Box p={5} borderWidth="1px" borderRadius="lg">
        <Heading size="md" mb={4}>Board for: {workflow.name}</Heading>
        <Text>Columns would be based on workflow steps: {workflow.steps.map(s => s.status.name).join(', ')}</Text>
        <Text mt={2}>Projects:</Text>
        <ul>
          {projects.map(p => (
            <li key={p.id}>{p.name} (Status ID: {p.currentStatusId})</li>
          ))}
        </ul>
        <Text mt={4} color="orange.500">Actual ProjectBoard component with drag-and-drop to be implemented here.</Text>
      </Box>
    );
  };

  return (
    <VStack spacing={4} align="stretch" p={8}>
      <Heading>Project Board</Heading>

      <FormControl>
        <FormLabel htmlFor="workflow-select">Select Workflow:</FormLabel>
        <Select 
          id="workflow-select"
          placeholder="Select a workflow to view its board"
          value={selectedWorkflowId || ''}
          onChange={(e) => setSelectedWorkflowId(e.target.value || null)}
          isDisabled={loadingWorkflows}
        >
          {workflows.map(wf => (
            <option key={wf.id} value={wf.id}>{wf.name}</option>
          ))}
        </Select>
      </FormControl>

      {loadingWorkflows && !currentWorkflowWithDetails && <Spinner />}
      {error && <Text color="red.500">Error: {error}</Text>}
      
      {currentWorkflowWithDetails && selectedWorkflowId ? (
        <ProjectBoard workflow={currentWorkflowWithDetails} projects={MOCK_PROJECTS} />
      ) : selectedWorkflowId ? (
        <Text>Loading workflow details...</Text>
      ) : (
        <Text>Please select a workflow to view the board.</Text>
      )}
    </VStack>
  );
};

export default ProjectBoardPage; 