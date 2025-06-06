import React, { useEffect, useMemo } from 'react';
import { 
  Box, 
  Heading, 
  Spinner, 
  Alert, 
  AlertIcon, 
  VStack, 
  Text, 
  Flex, 
  useToast, 
  useColorModeValue, 
  useTheme,
  Badge,
  HStack,
  Icon
} from '@chakra-ui/react';
import { 
  HardHat, 
  Building2, 
  Wrench, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp
} from 'lucide-react';
import { useDealsStore, Deal } from '../../stores/useDealsStore';
import { useWFMWorkflowStore, WfmWorkflowWithDetails } from '../../stores/useWFMWorkflowStore';
import { useWFMConfigStore } from '../../stores/useWFMConfigStore';
import type { WfmWorkflowStep } from '../../generated/graphql/graphql';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import ConstructionPhaseColumn from './ConstructionPhaseColumn';
import { useThemeStore } from '../../stores/useThemeStore';

interface ConstructionProjectsDashboardProps {
  deals: Deal[];
}

// Construction phase mapping for different workflow steps
const getConstructionPhaseInfo = (stepName: string, stepOrder: number) => {
  const lowerStepName = stepName.toLowerCase();
  
  if (lowerStepName.includes('lead') || lowerStepName.includes('initial') || stepOrder === 1) {
    return {
      icon: HardHat,
      color: 'blue',
      description: 'Planning & Permits',
      emoji: '📋'
    };
  } else if (lowerStepName.includes('qualification') || lowerStepName.includes('qualify')) {
    return {
      icon: Building2,
      color: 'orange',
      description: 'Foundation & Groundwork',
      emoji: '🏗️'
    };
  } else if (lowerStepName.includes('proposal') || lowerStepName.includes('develop')) {
    return {
      icon: Wrench,
      color: 'purple',
      description: 'Framework & Structure',
      emoji: '🔧'
    };
  } else if (lowerStepName.includes('negotiation') || lowerStepName.includes('review')) {
    return {
      icon: Clock,
      color: 'yellow',
      description: 'Interior & Systems',
      emoji: '⚡'
    };
  } else if (lowerStepName.includes('won') || lowerStepName.includes('closed won')) {
    return {
      icon: CheckCircle,
      color: 'green',
      description: 'Grand Opening!',
      emoji: '🎉'
    };
  } else if (lowerStepName.includes('lost') || lowerStepName.includes('closed lost')) {
    return {
      icon: XCircle,
      color: 'red',
      description: 'Project Cancelled',
      emoji: '❌'
    };
  } else {
    return {
      icon: TrendingUp,
      color: 'gray',
      description: 'In Progress',
      emoji: '🚧'
    };
  }
};

const ConstructionProjectsDashboard: React.FC<ConstructionProjectsDashboardProps> = ({ deals }) => {
  const {
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

  const { 
    salesDealWorkflowId, 
    isLoadingSalesDealWorkflowId, 
    errorLoadingSalesDealWorkflowId 
  } = useWFMConfigStore();

  const toast = useToast();
  const { currentTheme } = useThemeStore();
  const theme = useTheme();

  // Theme-aware styling for construction dashboard
  const dashboardBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (!hasInitiallyFetchedDeals && !dealsLoading && !dealsError) {
      fetchDeals();
    }
  }, [hasInitiallyFetchedDeals, dealsLoading, dealsError, fetchDeals]);

  useEffect(() => {
    if (salesDealWorkflowId && 
        (!currentWorkflowWithDetails || currentWorkflowWithDetails.id !== salesDealWorkflowId) && 
        !wfmWorkflowLoading && !wfmWorkflowError) {
      fetchWFMWorkflowWithDetails(salesDealWorkflowId);
    }
  }, [salesDealWorkflowId, fetchWFMWorkflowWithDetails, currentWorkflowWithDetails, wfmWorkflowLoading, wfmWorkflowError]);

  const workflowStepsForConstruction: WfmWorkflowStep[] = useMemo(() => {
    return currentWorkflowWithDetails?.steps?.slice().sort((a, b) => a.stepOrder - b.stepOrder) || [];
  }, [currentWorkflowWithDetails]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }
    
    const projectId = draggableId;
    const targetPhaseId = destination.droppableId;

    try {
      const updatedProject = await updateDealWFMProgress(projectId, targetPhaseId);
      
      if (updatedProject) {
        toast({ 
          title: '🏗️ Construction Phase Updated', 
          description: `Project moved to next construction phase successfully!`, 
          status: 'success', 
          duration: 3000, 
          isClosable: true 
        });
      } else {
        throw new Error('Construction phase update failed.');
      }

    } catch (error: any) {
      let displayMessage = 'Could not update construction phase.';
      if (error.response && error.response.errors && error.response.errors[0] && error.response.errors[0].message) {
        displayMessage = error.response.errors[0].message;
      } else if (error.message) {
        displayMessage = error.message;
      }

      toast({
        title: '⚠️ Construction Update Failed',
        description: displayMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const projectsByPhase = useMemo(() => {
    const grouped = workflowStepsForConstruction.reduce((acc, step) => {
      acc[step.id] = deals.filter(deal => deal.currentWfmStep?.id === step.id); 
      if(acc[step.id]) {
        acc[step.id].sort((a,b) => (a.name || '').localeCompare(b.name || '')); 
      }
      return acc;
    }, {} as Record<string, Deal[]>);
    return grouped;
  }, [workflowStepsForConstruction, deals]);

  // Calculate construction budget by phase
  const budgetByPhase = useMemo(() => {
    const budgets: Record<string, number> = {};
    for (const step of workflowStepsForConstruction) {
      const phaseProjects = projectsByPhase[step.id] || [];
      budgets[step.id] = phaseProjects.reduce((sum, project) => sum + (project.weighted_amount || 0), 0);
    }
    return budgets;
  }, [workflowStepsForConstruction, projectsByPhase]);

  // City stats calculation
  const cityStats = useMemo(() => {
    const totalProjects = deals.length;
    const totalBudget = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const activeProjects = deals.filter(deal => {
      const stepName = deal.currentWfmStep?.status?.name?.toLowerCase() || '';
      return !stepName.includes('won') && !stepName.includes('lost');
    }).length;
    const completedProjects = deals.filter(deal => {
      const stepName = deal.currentWfmStep?.status?.name?.toLowerCase() || '';
      return stepName.includes('won');
    }).length;

    return { totalProjects, totalBudget, activeProjects, completedProjects };
  }, [deals]);

  // Loading and error states
  if (isLoadingSalesDealWorkflowId || dealsLoading || wfmWorkflowLoading) {
    return (
      <Flex justify="center" align="center" minH="calc(100vh - 200px)" bg={dashboardBg}>
        <VStack spacing={4}>
          <Icon as={HardHat} boxSize={8} color="blue.500" />
          <Spinner size="xl" color="blue.500" />
          <Text>Loading construction projects...</Text>
        </VStack>
      </Flex>
    );
  }

  if (errorLoadingSalesDealWorkflowId || dealsError || wfmWorkflowError) {
    return (
      <Alert status="error" m={4}>
        <AlertIcon />
        Error loading construction workflow: {errorLoadingSalesDealWorkflowId || dealsError || wfmWorkflowError}
      </Alert>
    );
  }
  
  if (!salesDealWorkflowId || !currentWorkflowWithDetails || workflowStepsForConstruction.length === 0) {
     return (
      <Box p={5} borderWidth="1px" borderRadius="md" textAlign="center" m={4} bg={cardBg}>
        <Icon as={Building2} boxSize={12} color="gray.400" mb={4} />
        <Heading size="md" mb={2}>Construction Workflow Not Configured</Heading>
        <Text mt={4}>
          The construction project workflow is not available. 
          Please configure the Sales Deal workflow in the admin section to start building your Pipeline City!
        </Text>
      </Box>
    );
  }
  
  return (
    <Box bg={dashboardBg} minH="100vh">
      <VStack spacing={6} align="stretch" p={6}>
        {/* City Header */}
        <Box bg={cardBg} borderRadius="xl" p={6} boxShadow="sm">
          <HStack spacing={8} justify="space-between" wrap="wrap">
            <VStack align="start" spacing={2}>
              <HStack>
                <Icon as={Building2} boxSize={8} color="blue.500" />
                <Heading size="lg" color="blue.600">
                  🏗️ Pipeline City Construction Hub
                </Heading>
              </HStack>
              <Text color="gray.600" fontSize="lg">
                Managing {cityStats.totalProjects} construction projects across your business district
              </Text>
            </VStack>

            {/* City Stats */}
            <HStack spacing={6} wrap="wrap">
              <VStack spacing={1} align="center">
                <Badge colorScheme="blue" fontSize="lg" px={3} py={1}>
                  {cityStats.activeProjects}
                </Badge>
                <Text fontSize="sm" color="gray.600">Active Projects</Text>
              </VStack>
              <VStack spacing={1} align="center">
                <Badge colorScheme="green" fontSize="lg" px={3} py={1}>
                  {cityStats.completedProjects}
                </Badge>
                <Text fontSize="sm" color="gray.600">Completed</Text>
              </VStack>
              <VStack spacing={1} align="center">
                <Badge colorScheme="purple" fontSize="lg" px={3} py={1}>
                  ${(cityStats.totalBudget / 1000000).toFixed(1)}M
                </Badge>
                <Text fontSize="sm" color="gray.600">Total Budget</Text>
              </VStack>
            </HStack>
          </HStack>
        </Box>

        {/* Construction Phases Header */}
        <Heading size="md" textAlign="center" color="gray.700">
          Construction Phases Overview
        </Heading>

        {/* Construction Phases Kanban */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Box 
            p={4} 
            overflowX="auto"
            width="100%"
            sx={{
              '&::-webkit-scrollbar': { height: '12px' },
              '&::-webkit-scrollbar-thumb': { 
                background: 'linear-gradient(90deg, #3182ce, #63b3ed)', 
                borderRadius: '12px' 
              },
              '&::-webkit-scrollbar-track': { background: 'gray.100' },
            }}
          >
            {workflowStepsForConstruction.length === 0 && (
              <Text textAlign="center" p={4}>No construction phases defined.</Text>
            )}
            <Flex 
              direction="row" 
              gap={4}
              minWidth="max-content"
            >
              {workflowStepsForConstruction.map((step: WfmWorkflowStep, index: number) => {
                const stepDisplayName = (step.metadata as any)?.name || step.status?.name || `Phase ${index + 1}`;
                const phaseInfo = getConstructionPhaseInfo(stepDisplayName, step.stepOrder);
                
                return (
                  <ConstructionPhaseColumn
                    key={step.id} 
                    step={step}
                    projects={projectsByPhase[step.id] || []} 
                    totalBudget={budgetByPhase[step.id] || 0}
                    phaseInfo={phaseInfo}
                    index={index}
                  />
                );
              })}
            </Flex>
          </Box>
        </DragDropContext>
      </VStack>
    </Box>
  );
};

export default ConstructionProjectsDashboard; 