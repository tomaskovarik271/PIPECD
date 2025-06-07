import React from 'react';
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
  Divider,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { CheckIcon, TimeIcon, WarningIcon, CalendarIcon } from '@chakra-ui/icons';
import { Deal } from '../../stores/useDealsStore';
import { useThemeColors } from '../../hooks/useThemeColors';

interface DealHeaderProps {
  deal: Deal;
  onCreateActivity?: () => void;
  dealActivities?: Array<{
    id: string;
    subject: string;
    due_date?: string | null;
    is_done: boolean;
    created_at: string;
  }>;
}

export const DealHeader: React.FC<DealHeaderProps> = ({ deal, onCreateActivity, dealActivities = [] }) => {
  const colors = useThemeColors();
  
  // Calculate deal health metrics
  const getDealHealth = () => {
    const daysSinceUpdate = Math.ceil((new Date().getTime() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    const hasRecentActivity = dealActivities.length > 0 && Math.ceil((new Date().getTime() - new Date(dealActivities[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) <= 7;
    const isPastDue = deal.expected_close_date && new Date(deal.expected_close_date) < new Date();
    
    if (deal.currentWfmStatus?.name === 'Won') return { status: 'Won', color: 'green', icon: CheckIcon };
    if (deal.currentWfmStatus?.name === 'Lost') return { status: 'Lost', color: 'red', icon: WarningIcon };
    if (isPastDue) return { status: 'Overdue', color: 'red', icon: WarningIcon };
    if (hasRecentActivity) return { status: 'Active', color: 'green', icon: CheckIcon };
    if (daysSinceUpdate > 14) return { status: 'Stale', color: 'orange', icon: TimeIcon };
    return { status: 'On Track', color: 'blue', icon: CheckIcon };
  };

  // Calculate pipeline progress (mock data - you'd replace with real pipeline steps)
  const getPipelineProgress = () => {
    const steps = ['Prospect', 'Qualification', 'Proposal', 'Negotiation', 'Closed'];
    const currentStepName = deal.currentWfmStep?.status?.name || 'Prospect';
    
    let currentIndex = 0;
    if (currentStepName.includes('Qualif')) currentIndex = 1;
    else if (currentStepName.includes('Proposal')) currentIndex = 2;
    else if (currentStepName.includes('Negotiat')) currentIndex = 3;
    else if (currentStepName.includes('Won') || currentStepName.includes('Lost')) currentIndex = 4;
    
    return {
      steps,
      currentIndex,
      progress: (currentIndex / (steps.length - 1)) * 100
    };
  };

  const dealHealth = getDealHealth();
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

        {/* Quick Actions */}
        <VStack spacing={2} align="end" mt={{base: 3, md: 0}} flexShrink={0}>
          {nextSteps.length > 0 && (
            <Text fontSize="sm" color={colors.text.secondary} textAlign="right">
              Next: {nextSteps[0].subject}
            </Text>
          )}
          {onCreateActivity && (
            <Button 
              size="sm" 
              colorScheme="blue" 
              leftIcon={<CalendarIcon />}
              onClick={onCreateActivity}
            >
              Add Activity
            </Button>
          )}
        </VStack>
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