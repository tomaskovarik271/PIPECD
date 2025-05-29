import React, { useEffect, useMemo } from 'react';
import { Box, Heading, Spinner, Alert, AlertIcon, VStack, Text, Flex, useToast, useColorModeValue, useTheme } from '@chakra-ui/react';
import { useDealsStore, Deal } from '../../stores/useDealsStore';
import { useWFMWorkflowStore, WfmWorkflowWithDetails } from '../../stores/useWFMWorkflowStore';
import { useWFMConfigStore } from '../../stores/useWFMConfigStore';
import type { WfmWorkflowStep } from '../../generated/graphql/graphql';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import KanbanStepColumn from './KanbanStepColumn';
import { useThemeStore } from '../../stores/useThemeStore';

// const SALES_DEAL_WORKFLOW_ID = 'your-sales-deal-workflow-id-here'; // Remove hardcoded ID

const DealsKanbanView: React.FC = () => {
  const {
    deals,
    dealsLoading,
    dealsError,
    fetchDeals,
    updateDealWFMProgress,
    hasInitiallyFetchedDeals,
  } = useDealsStore();

  const { 
    currentWorkflowWithDetails, 
    fetchWFMWorkflowWithDetails,
    loading: wfmWorkflowLoading,
    error: wfmWorkflowError 
  } = useWFMWorkflowStore();

  // Get sales deal workflow ID from the config store
  const { 
    salesDealWorkflowId, 
    isLoadingSalesDealWorkflowId, 
    errorLoadingSalesDealWorkflowId 
  } = useWFMConfigStore();

  const toast = useToast();
  const { currentTheme } = useThemeStore();
  const theme = useTheme();

  // Theme-aware scrollbar colors for the main Kanban container
  const kanbanScrollbarThumbBg = useColorModeValue('gray.300', 'gray.500');
  const kanbanScrollbarTrackBg = useColorModeValue('gray.100', 'gray.600');

  useEffect(() => {
    if (!hasInitiallyFetchedDeals && !dealsLoading && !dealsError) {
      fetchDeals();
    }
  }, [hasInitiallyFetchedDeals, dealsLoading, dealsError, fetchDeals]);

  useEffect(() => {
    // Fetch the Sales Deal workflow if the ID is available
    if (salesDealWorkflowId && !currentWorkflowWithDetails && !wfmWorkflowLoading && !wfmWorkflowError) {
      // console.log('[DealsKanbanView] salesDealWorkflowId found:', salesDealWorkflowId, "Fetching workflow details...");
      fetchWFMWorkflowWithDetails(salesDealWorkflowId);
    }
  }, [salesDealWorkflowId, fetchWFMWorkflowWithDetails, currentWorkflowWithDetails, wfmWorkflowLoading, wfmWorkflowError]);
  
  // useEffect(() => {
  //   if (deals && deals.length > 0) {
  //     console.log('[DealsKanbanView] Deals from store (FULL SAMPLE):', deals.map(d => ({ 
  //       id: d.id, 
  //       name: d.name, 
  //       wfm_project_id: d.wfm_project_id,
  //       currentWfmStep: d.currentWfmStep ? { 
  //         id: d.currentWfmStep.id, 
  //         stepOrder: d.currentWfmStep.stepOrder,
  //         metadata: d.currentWfmStep.metadata,
  //         status: d.currentWfmStep.status ? { 
  //           id: d.currentWfmStep.status.id, 
  //           name: d.currentWfmStep.status.name 
  //         } : null
  //       } : null,
  //       currentWfmStatus: d.currentWfmStatus ? { 
  //         id: d.currentWfmStatus.id, 
  //         name: d.currentWfmStatus.name 
  //       } : null 
  //     })));
  //   } else {
  //     console.log('[DealsKanbanView] No deals in store or deals array is empty.');
  //   }
  // }, [deals]);

  const workflowStepsForKanban: WfmWorkflowStep[] = useMemo(() => {
    return currentWorkflowWithDetails?.steps?.slice().sort((a, b) => a.stepOrder - b.stepOrder) || [];
  }, [currentWorkflowWithDetails]);

  // useEffect(() => {
  //   console.log('[DealsKanbanView] Current Workflow with Details (after memo):', currentWorkflowWithDetails);
  //   console.log('[DealsKanbanView] Workflow Steps for Kanban (after memo):', workflowStepsForKanban);
  // }, [currentWorkflowWithDetails, workflowStepsForKanban]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }
    
    const dealId = draggableId;
    const targetWfmWorkflowStepId = destination.droppableId;

    // console.log(`Optimistically moving deal ${dealId} to WFM step ${targetWfmWorkflowStepId}`);

    try {
      const updatedDeal = await updateDealWFMProgress(dealId, targetWfmWorkflowStepId);
      
      if (updatedDeal) {
        toast({ title: 'Deal WFM step updated', description: `Deal moved successfully.`, status: 'success', duration: 3000, isClosable: true });
      } else {
        // This case should ideally not be reached if the store throws an error on failure.
        // If it is reached, it implies updateDealWFMProgress returned null without throwing an error.
        throw new Error('Update operation failed silently or did not return an updated deal.');
      }

    } catch (error: any) {
      let displayMessage = 'Could not update deal WFM step.';
      // Check for GraphQL error structure from graphql-request client
      if (error.response && error.response.errors && error.response.errors[0] && error.response.errors[0].message) {
        displayMessage = error.response.errors[0].message;
      } else if (error.message) {
        displayMessage = error.message;
      }
      // Log the full error for debugging, but show cleaner message to user
      // console.error('[DealsKanbanView.onDragEnd] Error caught:', JSON.stringify(error, null, 2)); 

      toast({
        title: 'Error updating deal WFM step',
        description: displayMessage,
        status: 'error',
        duration: 5000, // Longer duration for more detailed errors
        isClosable: true,
      });
    }
  };
  
  const dealsByWfmStep = useMemo(() => {
    // console.log('[DealsKanbanView] Recalculating dealsByWfmStep. Deals count:', deals.length, 'Workflow steps count:', workflowStepsForKanban.length);
    const grouped = workflowStepsForKanban.reduce((acc, step) => {
      acc[step.id] = deals.filter(deal => deal.currentWfmStep?.id === step.id); 
      if(acc[step.id]) {
        acc[step.id].sort((a,b) => (a.name || '').localeCompare(b.name || '')); 
      }
      return acc;
    }, {} as Record<string, Deal[]>);
    // console.log('[DealsKanbanView] Grouped dealsByWfmStep:', grouped);
    return grouped;
  }, [workflowStepsForKanban, deals]);

  // Calculate weighted amount sum for each step
  const weightedAmountByStepId = useMemo(() => {
    const sums: Record<string, number> = {};
    for (const step of workflowStepsForKanban) {
      const stepDeals = dealsByWfmStep[step.id] || [];
      sums[step.id] = stepDeals.reduce((sum, deal) => sum + (deal.weighted_amount || 0), 0);
    }
    return sums;
  }, [workflowStepsForKanban, dealsByWfmStep]);

  // Loading and error states
  if (isLoadingSalesDealWorkflowId || dealsLoading || wfmWorkflowLoading) { // Added isLoadingSalesDealWorkflowId
    return <Flex justify="center" align="center" minH="calc(100vh - 200px)"><Spinner size="xl" /></Flex>;
  }

  if (errorLoadingSalesDealWorkflowId) { // Added error check for config ID
    return <Alert status="error" m={4}><AlertIcon />Error loading Sales Deal Workflow configuration: {errorLoadingSalesDealWorkflowId}</Alert>;
  }

  if (dealsError) {
    return <Alert status="error" m={4}><AlertIcon />Error loading deals: {dealsError}</Alert>;
  }
  if (wfmWorkflowError) {
    return <Alert status="error" m={4}><AlertIcon />Error loading Sales Deal Workflow details: {wfmWorkflowError}</Alert>;
  }
  
  if (!salesDealWorkflowId || !currentWorkflowWithDetails || workflowStepsForKanban.length === 0) {
     return (
      <Box p={5} borderWidth="1px" borderRadius="md" textAlign="center" m={4}>
        <Heading size="md" mb={2}>Sales Workflow Not Configured</Heading>
        <Text mt={4}>
          The Sales Deal workflow is not available, not found by its expected name ("Sales Deal"), 
          has no default workflow ID set, or has no steps defined. 
          Please check WFM Project Type and Workflow configuration in the admin section.
        </Text>
        <Text fontSize="sm" color="gray.500" mt={2}>Attempted to load workflow ID: {salesDealWorkflowId || 'Not yet loaded or found'}</Text>
      </Box>
    );
  }
  
  return (
    <VStack spacing={4} align="stretch" p={4}>
      <Heading size="md" mt={6} mb={2} textAlign="center">
        {currentWorkflowWithDetails?.name || 'Sales Kanban'}
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
                      background: kanbanScrollbarThumbBg, 
                      borderRadius: '8px',
                      border: 'none',
                  },
                  '&::-webkit-scrollbar-track': {
                      background: kanbanScrollbarTrackBg, 
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
                    <KanbanStepColumn
                      key={step.id} 
                      step={step}
                      deals={dealsByWfmStep[step.id] || []} 
                      weightedAmountSum={weightedAmountByStepId[step.id] || 0}
                      index={index}
                    />
                  ))}
              </Flex>
          </Box>
      </DragDropContext>
    </VStack>
  );
};

export default DealsKanbanView; 