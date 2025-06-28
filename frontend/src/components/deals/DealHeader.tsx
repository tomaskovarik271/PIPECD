import React, { useState, useMemo } from 'react';
import {
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Link,
  Tag,
  Progress,
  Box,
  Icon,
  Button,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { CheckIcon, TimeIcon, WarningIcon, CalendarIcon } from '@chakra-ui/icons';
import { Deal } from '../../stores/useDealsStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import NotificationCenter from '../notifications/NotificationCenter';
import { gql } from 'graphql-request';
import { gqlClient } from '../../lib/graphqlClient';

// Add GraphQL query for workflow steps
const GET_DEAL_WORKFLOW_STEPS = gql`
  query GetDealWorkflowSteps($dealId: ID!) {
    deal(id: $dealId) {
      id
      wfmProject {
        id
        workflow {
          id
          name
          steps {
            id
            stepOrder
            isInitialStep
            isFinalStep
            status {
              id
              name
              color
            }
          }
        }
      }
    }
  }
`;

interface WorkflowStep {
  id: string;
  stepOrder: number;
  isInitialStep: boolean;
  isFinalStep: boolean;
  status: {
    id: string;
    name: string;
    color: string;
  };
}

interface DealHeaderProps {
  deal: Deal;
  isEditing?: boolean;
  setIsEditing?: (editing: boolean) => void;
  dealActivities?: Array<{
    id: string;
    subject: string;
    due_date?: string | null;
    is_done: boolean;
    created_at: string;
  }>;
}

export const DealHeader: React.FC<DealHeaderProps> = ({ deal, isEditing: _isEditing, setIsEditing: _setIsEditing, dealActivities = [] }) => {
  const colors = useThemeColors();
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);
  
  // Fetch workflow steps when component mounts
  React.useEffect(() => {
    const fetchWorkflowSteps = async () => {
      if (!deal.wfm_project_id) {
        return;
      }
      
      setIsLoadingSteps(true);
      try {
        const response = await gqlClient.request(GET_DEAL_WORKFLOW_STEPS, {
          dealId: deal.id
        }) as any;
        
        if (response.deal?.wfmProject?.workflow?.steps) {
          const steps = response.deal.wfmProject.workflow.steps;
          // Sort by stepOrder to ensure correct sequence
          steps.sort((a: WorkflowStep, b: WorkflowStep) => a.stepOrder - b.stepOrder);
          setWorkflowSteps(steps);
        } else {
          setWorkflowSteps([]);
        }
      } catch (error) {
        console.error('[DealHeader] Error fetching workflow steps:', error);
        setWorkflowSteps([]);
      } finally {
        setIsLoadingSteps(false);
      }
    };

    fetchWorkflowSteps();
  }, [deal.id, deal.wfm_project_id]);

  // Calculate deal health metrics (memoized to prevent date object recreation)
  const getDealHealth = useMemo(() => {
    const now = Date.now(); // Use timestamp for better performance
    const updatedAt = new Date(deal.updated_at).getTime();
    const daysSinceUpdate = Math.ceil((now - updatedAt) / (1000 * 60 * 60 * 24));
    
    const hasRecentActivity = dealActivities.length > 0 && 
      Math.ceil((now - new Date(dealActivities[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) <= 7;
    
    const isPastDue = deal.expected_close_date && new Date(deal.expected_close_date).getTime() < now;
    
    if (deal.currentWfmStatus?.name === 'Won') return { status: 'Won', color: 'green', icon: CheckIcon };
    if (deal.currentWfmStatus?.name === 'Lost') return { status: 'Lost', color: 'red', icon: WarningIcon };
    if (isPastDue) return { status: 'Overdue', color: 'red', icon: WarningIcon };
    if (hasRecentActivity) return { status: 'Active', color: 'green', icon: CheckIcon };
    if (daysSinceUpdate > 14) return { status: 'Stale', color: 'orange', icon: TimeIcon };
    return { status: 'On Track', color: 'blue', icon: CheckIcon };
  }, [deal.updated_at, deal.expected_close_date, deal.currentWfmStatus?.name, dealActivities]);

  // Calculate pipeline progress based on actual WFM workflow steps
  const getPipelineProgress = () => {
    const currentStep = deal.currentWfmStep;
    
    // If we have real workflow steps, use them
    if (workflowSteps.length > 0 && currentStep) {
      const currentStepIndex = workflowSteps.findIndex(step => step.id === currentStep.id);
      
      if (currentStepIndex >= 0) {
        const stepNames = workflowSteps.map(step => step.status.name);
        const progress = workflowSteps.length > 1 
          ? (currentStepIndex / (workflowSteps.length - 1)) * 100 
          : 0;
        
        return {
          steps: stepNames,
          currentIndex: currentStepIndex,
          progress,
          currentStepName: currentStep.status?.name
        };
      }
    }
    
    // Fallback for when workflow steps aren't loaded yet or don't exist
    if (!currentStep) {
      return {
        steps: ['Not Started'],
        currentIndex: 0,
        progress: 0,
        currentStepName: 'Not Started'
      };
    }

    const currentStepName = currentStep.status?.name || 'Unknown';
    const stepOrder = currentStep.stepOrder || 0;
    
    // Create a simplified view showing the actual current step
    const steps = [];
    const currentIndex = 1; // Middle position
    
    if (stepOrder > 1) {
      steps.push('Previous Steps');
    }
    
    steps.push(currentStepName);
    
    if (!currentStep.isFinalStep) {
      steps.push('Next Steps');
    }
    
    // Calculate progress based on step order
    const estimatedTotalSteps = 5;
    const normalizedProgress = Math.min((stepOrder - 1) / (estimatedTotalSteps - 1), 1) * 100;
    
    return {
      steps,
      currentIndex: Math.max(0, steps.findIndex(step => step === currentStepName)),
      progress: normalizedProgress,
      currentStepName
    };
  };

  const dealHealth = getDealHealth;
  const pipelineProgress = getPipelineProgress();
  const nextSteps = dealActivities.filter(a => !a.is_done && a.due_date).slice(0, 2);

  return (
    <Box>
      <Flex 
        direction={{base: "column", md: "row"}}
        justifyContent="space-between" 
        alignItems={{base: "flex-start", md: "center"}} 
        pb={4} 
        borderBottomWidth="1px" 
        borderColor={colors.border.default}
        mb={4}
        gap={3}
      >
        <VStack align="start" spacing={2} flex={1}>
          <HStack spacing={1} color={colors.text.secondary} fontSize="sm">
            <Link as={RouterLink} to="/deals" color={colors.text.link} _hover={{textDecoration: 'underline'}}>
              Deals
            </Link>
            <Text>&gt;</Text>
            <Text 
              noOfLines={1} 
              maxW={{base: "200px", md: "300px"}} 
              title={deal.name} 
              color={colors.text.primary}
            >
              {deal.name}
            </Text>
          </HStack>
          
          <HStack align="center" spacing={3}>
            <Heading size="xl" color={colors.text.primary} noOfLines={1}>
              {deal.name}
            </Heading>
            {(deal as any).project_id && (
              <Tag 
                size="md" 
                variant="solid" 
                colorScheme="blue" 
                borderRadius="md" 
                px={3} 
                py={2}
                fontFamily="mono"
                fontWeight="bold"
                fontSize="sm"
              >
                #{(deal as any).project_id}
              </Tag>
            )}
          </HStack>

          <HStack spacing={3} mt={1} wrap="wrap">
            {/* Deal Health Indicator */}
            <HStack spacing={2}>
              <Icon as={dealHealth.icon} w={4} h={4} color={`${dealHealth.color}.500`} />
              <Tag 
                size="sm" 
                variant="subtle" 
                colorScheme={dealHealth.color} 
                borderRadius="full" 
                px={3} 
                py={1}
              >
                {dealHealth.status}
              </Tag>
            </HStack>

            {deal.currentWfmStep?.status?.name && (
              <Tag 
                size="sm" 
                variant="subtle" 
                colorScheme={deal.currentWfmStep.status.color?.toLowerCase() || 'gray'} 
                borderRadius="full" 
                px={3} 
                py={1}
              >
                {deal.currentWfmStep.status.name}
              </Tag>
            )}
            
            {deal.expected_close_date && (
              <Tag 
                size="sm" 
                variant="outline" 
                colorScheme={new Date(deal.expected_close_date) < new Date() ? 'red' : 'blue'} 
                borderRadius="full" 
                px={3} 
                py={1}
              >
                Close: {new Date(deal.expected_close_date).toLocaleDateString()}
              </Tag>
            )}
          </HStack>
        </VStack>

        {/* Right side actions */}
        <HStack spacing={3} mt={{base: 3, md: 0}} flexShrink={0}>
          {/* Notification Center */}
          <NotificationCenter position="header" showBadge={true} />

        {/* Calendar integration replaces activity buttons */}
        {nextSteps.length > 0 && (
            <VStack spacing={2} align="end">
            <Text fontSize="sm" color={colors.text.secondary} textAlign="right">
              Next: {nextSteps[0].subject}
            </Text>
          </VStack>
        )}
        </HStack>
      </Flex>

      {/* Pipeline Progress */}
      <Box mb={4}>
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
            Pipeline Progress
          </Text>
          <Text fontSize="sm" color={colors.text.secondary}>
            {Math.round(pipelineProgress.progress)}% Complete
          </Text>
        </HStack>
        
        <Progress 
          value={pipelineProgress.progress} 
          colorScheme="blue" 
          size="sm" 
          borderRadius="md"
          mb={2}
        />
        
        <HStack justify="space-between" spacing={1}>
          {pipelineProgress.steps.map((step, index) => (
            <VStack key={step} spacing={1} flex={1}>
              <Box 
                w={3} 
                h={3} 
                borderRadius="full" 
                bg={index <= pipelineProgress.currentIndex ? 'blue.500' : colors.bg.surface}
                border={index === pipelineProgress.currentIndex ? '2px solid' : '1px solid'}
                borderColor={index === pipelineProgress.currentIndex ? 'blue.400' : colors.border.default}
              />
              <Text 
                fontSize="xs" 
                color={index <= pipelineProgress.currentIndex ? colors.text.primary : colors.text.muted}
                textAlign="center"
                fontWeight={index === pipelineProgress.currentIndex ? 'medium' : 'normal'}
              >
                {step}
              </Text>
            </VStack>
          ))}
        </HStack>
      </Box>
    </Box>
  );
}; 