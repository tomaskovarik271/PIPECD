import React, { useEffect, useMemo } from 'react';
import { Box, Heading, Spinner, Alert, AlertIcon, VStack, Text, Flex, useToast } from '@chakra-ui/react';
import { useLeadsStore, Lead } from '../../stores/useLeadsStore';
import { useWFMWorkflowStore } from '../../stores/useWFMWorkflowStore';
import { useWFMConfigStore } from '../../stores/useWFMConfigStore';
import type { WfmWorkflowStep } from '../../generated/graphql/graphql';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import LeadsKanbanStepColumn from './LeadsKanbanStepColumn';

interface LeadsKanbanViewProps {
  leads: Lead[]; // Receive filtered leads as prop
}

const LeadsKanbanView: React.FC<LeadsKanbanViewProps> = ({ leads }) => {
  const {
    leadsLoading,
    leadsError,
    fetchLeads,
    updateLeadWFMProgress,
    hasInitiallyFetchedLeads,
  } = useLeadsStore();

  const { 
    currentWorkflowWithDetails, 
    fetchWFMWorkflowWithDetails,
    loading: wfmWorkflowLoading,
    error: wfmWorkflowError 
  } = useWFMWorkflowStore();

  // Get lead qualification workflow ID from the config store
  const { 
    leadQualificationWorkflowId, 
    isLoadingLeadQualificationWorkflowId, 
    errorLoadingLeadQualificationWorkflowId,
    fetchLeadQualificationWorkflowId
  } = useWFMConfigStore();

  const toast = useToast();

  useEffect(() => {
    if (!hasInitiallyFetchedLeads && !leadsLoading && !leadsError) {
      fetchLeads();
    }
  }, [hasInitiallyFetchedLeads, leadsLoading, leadsError, fetchLeads]);

  useEffect(() => {
    // Fetch the Lead Qualification workflow ID if not already loaded
    if (!leadQualificationWorkflowId && !isLoadingLeadQualificationWorkflowId && !errorLoadingLeadQualificationWorkflowId) {
      fetchLeadQualificationWorkflowId();
    }
  }, [leadQualificationWorkflowId, isLoadingLeadQualificationWorkflowId, errorLoadingLeadQualificationWorkflowId, fetchLeadQualificationWorkflowId]);

  useEffect(() => {
    // Fetch the Lead Qualification workflow if the ID is available AND 
    // either no workflow is loaded OR the wrong workflow is loaded
    if (leadQualificationWorkflowId && 
        (!currentWorkflowWithDetails || currentWorkflowWithDetails.id !== leadQualificationWorkflowId) && 
        !wfmWorkflowLoading && !wfmWorkflowError) {
      fetchWFMWorkflowWithDetails(leadQualificationWorkflowId);
    }
  }, [leadQualificationWorkflowId, fetchWFMWorkflowWithDetails, currentWorkflowWithDetails, wfmWorkflowLoading, wfmWorkflowError]);

  useEffect(() => {
    if (leads && leads.length > 0) {
      console.log('[LeadsKanbanView] Leads from store (FULL SAMPLE):', leads.map(l => ({ 
        id: l.id, 
        name: l.name, 
        wfm_project_id: l.wfm_project_id,
        currentWfmStep: l.currentWfmStep ? { 
          id: l.currentWfmStep.id, 
          stepOrder: l.currentWfmStep.stepOrder,
          metadata: l.currentWfmStep.metadata,
          status: l.currentWfmStep.status ? { 
            id: l.currentWfmStep.status.id, 
            name: l.currentWfmStep.status.name 
          } : null
        } : null,
        currentWfmStatus: l.currentWfmStatus ? { 
          id: l.currentWfmStatus.id, 
          name: l.currentWfmStatus.name 
        } : null 
      })));
    } else {
      console.log('[LeadsKanbanView] No leads in store or leads array is empty.');
    }
  }, [leads]);

  const workflowStepsForKanban: WfmWorkflowStep[] = useMemo(() => {
    return currentWorkflowWithDetails?.steps?.slice().sort((a, b) => a.stepOrder - b.stepOrder) || [];
  }, [currentWorkflowWithDetails]);

  useEffect(() => {
    console.log('[LeadsKanbanView] Current Workflow with Details (after memo):', currentWorkflowWithDetails);
    console.log('[LeadsKanbanView] Workflow Steps for Kanban (after memo):', workflowStepsForKanban);
  }, [currentWorkflowWithDetails, workflowStepsForKanban]);

  // Drag and drop handler
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const leadId = draggableId;
    const targetWfmWorkflowStepId = destination.droppableId;

    try {
      const updatedLead = await updateLeadWFMProgress(leadId, targetWfmWorkflowStepId);
      if (updatedLead) {
        toast({
          title: 'Lead Updated',
          description: 'Lead workflow progress updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Update Failed',
          description: 'Failed to update lead workflow progress.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating lead workflow progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead workflow progress.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const leadsByWfmStep = useMemo(() => {
    console.log('[LeadsKanbanView] Recalculating leadsByWfmStep. Leads count:', leads.length, 'Workflow steps count:', workflowStepsForKanban.length);
    const grouped = workflowStepsForKanban.reduce((acc, step) => {
      acc[step.id] = leads.filter(lead => lead.currentWfmStep?.id === step.id); 
      if(acc[step.id]) {
        acc[step.id].sort((a,b) => (a.name || '').localeCompare(b.name || '')); 
      }
      return acc;
    }, {} as Record<string, Lead[]>);
    console.log('[LeadsKanbanView] Grouped leadsByWfmStep:', grouped);
    return grouped;
  }, [workflowStepsForKanban, leads]);

  // Calculate estimated value sum for each step
  const estimatedValueByStepId = useMemo(() => {
    const sums: Record<string, number> = {};
    for (const step of workflowStepsForKanban) {
      const stepLeads = leadsByWfmStep[step.id] || [];
      sums[step.id] = stepLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
    }
    return sums;
  }, [workflowStepsForKanban, leadsByWfmStep]);

  // Loading and error states
  if (isLoadingLeadQualificationWorkflowId || leadsLoading || wfmWorkflowLoading) {
    return <Flex justify="center" align="center" minH="calc(100vh - 200px)"><Spinner size="xl" /></Flex>;
  }

  if (errorLoadingLeadQualificationWorkflowId) {
    return <Alert status="error" m={4}><AlertIcon />Error loading Lead Qualification Workflow configuration: {errorLoadingLeadQualificationWorkflowId}</Alert>;
  }

  if (leadsError) {
    return <Alert status="error" m={4}><AlertIcon />Error loading leads: {leadsError}</Alert>;
  }
  if (wfmWorkflowError) {
    return <Alert status="error" m={4}><AlertIcon />Error loading Sales Deal Workflow details: {wfmWorkflowError}</Alert>;
  }
  
  if (!leadQualificationWorkflowId || !currentWorkflowWithDetails || workflowStepsForKanban.length === 0) {
     return (
      <Box p={5} borderWidth="1px" borderRadius="md" textAlign="center" m={4}>
        <Heading size="md" mb={2}>Lead Qualification Workflow Not Configured</Heading>
        <Text mt={4}>
          The Lead Qualification workflow is not available, not found by its expected name ("Lead Qualification"), 
          has no default workflow ID set, or has no steps defined. 
          Please check WFM Project Type and Workflow configuration in the admin section.
        </Text>
        <Text fontSize="sm" color="gray.500" mt={2}>Attempted to load workflow ID: {leadQualificationWorkflowId || 'Not yet loaded or found'}</Text>
      </Box>
    );
  }
  
  return (
    <VStack spacing={4} align="stretch" p={4}>
      <Heading size="md" mt={6} mb={2} textAlign="center">
        {currentWorkflowWithDetails?.name || 'Lead Qualification Kanban'}
      </Heading>

      <DragDropContext onDragEnd={onDragEnd}>
          <Box 
              p={2} 
              overflowX="auto"
              width="100%"
              sx={{
                  '&::-webkit-scrollbar': {
                      height: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                      background: 'gray.300', 
                      borderRadius: '8px',
                      border: 'none',
                  },
                  '&::-webkit-scrollbar-track': {
                      background: 'gray.100', 
                  },
              }}
          >
              {workflowStepsForKanban.length === 0 && (
                  <Text textAlign="center" p={4}>This workflow has no steps defined.</Text>
              )}
              <Flex 
                direction="row" 
                gap={0}
                minWidth="max-content"
              >
                  {workflowStepsForKanban.map((step: WfmWorkflowStep, index: number) => (
                    <LeadsKanbanStepColumn
                      key={step.id} 
                      step={step}
                      leads={leadsByWfmStep[step.id] || []} 
                      estimatedValueSum={estimatedValueByStepId[step.id] || 0}
                      index={index}
                    />
                  ))}
              </Flex>
          </Box>
      </DragDropContext>
    </VStack>
  );
};

export default LeadsKanbanView; 