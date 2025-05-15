import React, { useEffect } from 'react';
import { Box, Heading, Spinner, Alert, AlertIcon, VStack, Text, Flex, useToast } from '@chakra-ui/react';
import { useDealsStore, Deal } from '../../stores/useDealsStore';
import { useStagesStore, Stage } from '../../stores/useStagesStore';
import PipelineSelectorDropdown from './PipelineSelectorDropdown';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import StageColumn from './StageColumn';

const DealsKanbanView: React.FC = () => {
  const {
    selectedKanbanPipelineId,
    deals,
    dealsLoading,
    dealsError,
    fetchDeals,
    updateDeal,
    hasInitiallyFetchedDeals,
  } = useDealsStore();
  const { stages, stagesLoading, stagesError, fetchStages, hasInitiallyFetchedStages } = useStagesStore();
  const toast = useToast();

  useEffect(() => {
    if (!hasInitiallyFetchedDeals && !dealsLoading && !dealsError) {
      fetchDeals();
    }
  }, [hasInitiallyFetchedDeals, dealsLoading, dealsError, fetchDeals]);

  useEffect(() => {
    console.log(`[DealsKanbanView] STAGE EFFECT CHECK: selectedKanbanPipelineId: ${selectedKanbanPipelineId}, hasInitiallyFetchedStages: ${hasInitiallyFetchedStages}, stagesLoading: ${stagesLoading}, stagesError: ${stagesError}`);
    if (selectedKanbanPipelineId) {
      console.log(`[DealsKanbanView] STAGE EFFECT CHECK: Pipeline ID is present.`);
      
      // Check if stages for the current selectedKanbanPipelineId are already present in the store
      const stagesForThisPipelineExist = stages.some(s => s.pipeline_id === selectedKanbanPipelineId);

      // Fetch if not loading, no error, AND (EITHER hasInitiallyFetchedStages is false OR stages for this specific pipeline don't exist yet)
      // This covers the case where hasInitiallyFetchedStages might be true globally, but the current pipeline's stages were cleared/not loaded.
      if (!stagesLoading && !stagesError && (!hasInitiallyFetchedStages || !stagesForThisPipelineExist) ) {
        console.log(`[DealsKanbanView] STAGE EFFECT CHECK: Conditions met (hasInitFetched: ${hasInitiallyFetchedStages}, stagesForThisPipelineExist: ${stagesForThisPipelineExist}). CALLING fetchStages.`);
        fetchStages(selectedKanbanPipelineId);
      } else {
        if (stagesLoading) console.log(`[DealsKanbanView] STAGE EFFECT CHECK: Stages loading IS present. Aborting.`);
        else if (stagesError) console.log(`[DealsKanbanView] STAGE EFFECT CHECK: Stages error IS present. Aborting.`);
        else console.log(`[DealsKanbanView] STAGE EFFECT CHECK: Stages already fetched/present for this context (hasInitFetched: ${hasInitiallyFetchedStages}, stagesForThisPipelineExist: ${stagesForThisPipelineExist}). Aborting.`);
      }
    } else {
      console.log(`[DealsKanbanView] STAGE EFFECT CHECK: Pipeline ID is NOT present. Aborting.`);
    }
  }, [selectedKanbanPipelineId, fetchStages, stagesLoading, stagesError, hasInitiallyFetchedStages, stages]);

  const currentPipelineStages = selectedKanbanPipelineId
    ? stages.filter((stage: Stage) => stage.pipeline_id === selectedKanbanPipelineId).sort((a, b) => a.order - b.order)
    : [];

  console.log(`[DealsKanbanView] RENDER: selectedKanbanPipelineId: ${selectedKanbanPipelineId}, stagesLoading: ${stagesLoading}, stagesError: ${stagesError}, num currentPipelineStages: ${currentPipelineStages.length}, currentPipelineStages:`, currentPipelineStages, "all stages from store:", stages);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStageId = source.droppableId;
    const destinationStageId = destination.droppableId;
    const dealId = draggableId;

    console.log(`Optimistically moving deal ${dealId} from stage ${sourceStageId} to ${destinationStageId}`);

    try {
      const dealToUpdate = deals.find(d => d.id === dealId);
      if (!dealToUpdate) throw new Error('Deal not found for update');
      if (!dealToUpdate.name) throw new Error('Deal name is missing and is required for update.');

      // Find the destination stage to get its pipeline_id
      const destinationStage = stages.find(s => s.id === destinationStageId);
      if (!destinationStage) throw new Error('Destination stage not found');
      if (!destinationStage.pipeline_id) throw new Error('Destination stage is missing pipeline_id');

      const updateInput = { 
        name: dealToUpdate.name, // Existing name
        stage_id: destinationStageId, // New stage_id
        pipeline_id: destinationStage.pipeline_id, // Pipeline_id from the destination stage
        // If other fields like 'amount' are also non-nullable in GraphQL DealInput,
        // they need to be included from dealToUpdate as well.
        // For now, addressing only the reported missing fields.
      }; 
      
      const updatedDeal = await updateDeal(dealId, updateInput);

      if (updatedDeal) {
        toast({ title: 'Deal stage updated', status: 'success', duration: 2000, isClosable: true });
      } else {
        throw new Error('Update operation failed to return deal.');
      }
    } catch (error: any) {
      toast({
        title: 'Error updating deal stage',
        description: error.message || 'Could not update deal stage.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const dealsByStage = currentPipelineStages.reduce((acc, stage) => {
    acc[stage.id] = deals.filter(deal => deal.stage_id === stage.id);
    acc[stage.id].sort((a,b) => a.name.localeCompare(b.name)); 
    return acc;
  }, {} as Record<string, Deal[]>);

  if (!selectedKanbanPipelineId && !stagesLoading && !dealsLoading) {
    return (
      <Box p={5} borderWidth="1px" borderRadius="md" textAlign="center">
        <PipelineSelectorDropdown />
        <Text mt={4}>Please select a pipeline to view the Kanban board.</Text>
      </Box>
    );
  }
  
  return (
    <VStack spacing={4} align="stretch">
      <Box mb={4}>
        <PipelineSelectorDropdown />
      </Box>

      {(stagesLoading || dealsLoading) && <Flex justify="center"><Spinner /></Flex>}
      {stagesError && <Alert status="error"><AlertIcon />Error loading stages: {stagesError}</Alert>}
      {dealsError && !dealsLoading && <Alert status="error"><AlertIcon />Error loading deals: {dealsError}</Alert>}

      <DragDropContext onDragEnd={onDragEnd}>
        {!stagesLoading && !stagesError && selectedKanbanPipelineId && (
          <Box 
              p={2} 
              overflowX="auto"
              css={{
                  '&::-webkit-scrollbar': {
                      height: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                      background: 'gray.300',
                      borderRadius: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                      background: 'gray.100',
                  },
              }}
          >
              {currentPipelineStages.length === 0 && !stagesLoading && (
                  <Text textAlign="center" p={4}>This pipeline has no stages.</Text>
              )}
              <Flex direction="row" gap={0}>
                  {currentPipelineStages.map((stage: Stage, index: number) => (
                    <StageColumn 
                      key={stage.id} 
                      stage={stage} 
                      deals={dealsByStage[stage.id] || []} 
                      index={index}
                    />
                  ))}
              </Flex>
          </Box>
        )}
      </DragDropContext>
    </VStack>
  );
};

export default DealsKanbanView; 