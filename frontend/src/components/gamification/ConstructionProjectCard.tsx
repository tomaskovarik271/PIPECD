import React from 'react';
import {
  Box,
  Text,
  VStack,
  Heading,
  Tooltip,
  Badge,
  Icon,
  HStack,
  Flex,
  Spacer,
  Progress,
  Avatar,
  Tag,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  User, 
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Deal } from '../../stores/useDealsStore';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { Link as RouterLink } from 'react-router-dom';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';
import { differenceInDays, formatDistanceToNowStrict, isPast, format } from 'date-fns';

interface ConstructionProjectCardProps {
  project: Deal;
  index: number;
  phaseColor: string;
}

// Construction project type mapping
const getProjectType = (projectName: string, amount?: number | null) => {
  const name = projectName.toLowerCase();
  
  if (name.includes('platform') || name.includes('system') || name.includes('digital')) {
    return { type: 'Digital Infrastructure', emoji: '💻', icon: Building2 };
  } else if (name.includes('sustainability') || name.includes('green') || name.includes('environmental')) {
    return { type: 'Green Building', emoji: '🌱', icon: Zap };
  } else if (name.includes('transformation') || name.includes('upgrade') || name.includes('modernization')) {
    return { type: 'Renovation Project', emoji: '🔧', icon: CheckCircle };
  } else if (amount && amount > 1000000) {
    return { type: 'Mega Project', emoji: '🏗️', icon: Building2 };
  } else {
    return { type: 'Standard Build', emoji: '🏢', icon: Building2 };
  }
};

const ConstructionProjectCard: React.FC<ConstructionProjectCardProps> = React.memo(({ 
  project, 
  index, 
  phaseColor 
}) => {
  const colors = useThemeColors();
  const styles = useThemeStyles();

  // Construction-themed styling
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue(`${phaseColor}.200`, `${phaseColor}.600`);
  const textColor = useColorModeValue('gray.700', 'gray.200');
  
  const projectType = getProjectType(project.name, project.amount);

  const getEffectiveProbability = () => {
    if (project.deal_specific_probability != null) return project.deal_specific_probability;
    if (project.currentWfmStep?.metadata && typeof project.currentWfmStep.metadata === 'object' && 'deal_probability' in project.currentWfmStep.metadata) {
      const stepProbability = (project.currentWfmStep.metadata as { deal_probability?: number }).deal_probability;
      if (stepProbability != null) return stepProbability;
    }
    return 0;
  };
  
  const completionProgress = getEffectiveProbability() * 100;

  const expectedCompletionDate = project.expected_close_date ? new Date(project.expected_close_date) : null;
  let scheduleStatus = "";
  let scheduleColor = colors.text.muted;
  let scheduleIcon = Calendar;
  
  if (expectedCompletionDate) {
    if (isPast(expectedCompletionDate)) {
      scheduleStatus = `${formatDistanceToNowStrict(expectedCompletionDate, { addSuffix: true })} behind`;
      scheduleColor = colors.text.error;
      scheduleIcon = AlertTriangle;
    } else {
      scheduleStatus = `Due in ${formatDistanceToNowStrict(expectedCompletionDate)}`;
      scheduleIcon = Clock;
    }
  }

  const baseStyle = {
    bg: cardBg,
    p: 4,
    borderRadius: "lg",
    borderWidth: "2px",
    borderColor: borderColor,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative" as const,
    _hover: {
      transform: "translateY(-2px) scale(1.01)",
      boxShadow: `
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 5px 10px -5px rgba(0, 0, 0, 0.05),
        0 0 0 1px ${useColorModeValue(`var(--chakra-colors-${phaseColor}-300)`, `var(--chakra-colors-${phaseColor}-400)`)}
      `,
      borderColor: `${phaseColor}.400`,
      bg: useColorModeValue(`${phaseColor}.25`, `${phaseColor}.900`),
    }
  };

  const draggingStyle = {
    ...baseStyle,
    borderColor: `${phaseColor}.500`,
    boxShadow: `
      0 20px 40px -12px rgba(0, 0, 0, 0.25),
      0 8px 16px -4px rgba(0, 0, 0, 0.1),
      0 0 0 2px var(--chakra-colors-${phaseColor}-400)
    `,
    transform: 'translateY(-4px) rotate(1deg) scale(1.03)',
    bg: useColorModeValue(`${phaseColor}.50`, `${phaseColor}.800`),
    zIndex: 1000,
  };

  return (
    <Draggable draggableId={project.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          {...(snapshot.isDragging ? draggingStyle : baseStyle)}
        >
          <VStack align="stretch" spacing={3}>
            {/* Project Header */}
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={1} flex={1}>
                {/* Project Type Badge */}
                <HStack spacing={2}>
                  <Badge 
                    colorScheme={phaseColor} 
                    variant="subtle" 
                    fontSize="xs"
                    borderRadius="full"
                    px={2}
                  >
                    <HStack spacing={1}>
                      <Text>{projectType.emoji}</Text>
                      <Text>{projectType.type}</Text>
                    </HStack>
                  </Badge>
                </HStack>
                
                {/* Project Name */}
                <RouterLink to={`/deals/${project.id}`} style={{ textDecoration: 'none' }}>
                  <Text 
                    fontWeight="bold" 
                    color={textColor}
                    _hover={{ color: `${phaseColor}.600` }}
                    fontSize="sm"
                    lineHeight="1.3"
                    noOfLines={2}
                  >
                    {project.name}
                  </Text>
                </RouterLink>
                
                {/* Client Organization */}
                <HStack spacing={1}>
                  <Icon as={Building2} boxSize={3} color={`${phaseColor}.500`} />
                  <Text fontSize="xs" color={colors.text.muted} noOfLines={1}>
                    {project.organization?.name || 'No Client'}
                  </Text>
                </HStack>
              </VStack>

              {/* Project Budget */}
              <VStack align="end" spacing={0}>
                <HStack spacing={1}>
                  <Icon as={DollarSign} boxSize={3} color="green.500" />
                  <Text fontSize="sm" fontWeight="bold" color="green.600">
                    {project.amount ? 
                      project.amount >= 1000000 
                        ? `$${(project.amount / 1000000).toFixed(1)}M`
                        : project.amount >= 1000
                        ? `$${(project.amount / 1000).toFixed(0)}K`
                        : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits:0, maximumFractionDigits:0 }).format(project.amount)
                      : 'TBD'
                    }
                  </Text>
                </HStack>
                <Text fontSize="xs" color={colors.text.muted}>Budget</Text>
              </VStack>
            </HStack>

            {/* Construction Progress */}
            <Box>
              <Flex justify="space-between" align="center" mb={1}>
                <Text fontSize="xs" color={`${phaseColor}.600`} fontWeight="medium">
                  Construction Progress
                </Text>
                <Text fontSize="xs" color={`${phaseColor}.600`} fontWeight="bold">
                  {completionProgress.toFixed(0)}%
                </Text>
              </Flex>
              <Progress 
                value={completionProgress}
                size="sm" 
                colorScheme={phaseColor}
                bg={useColorModeValue(`${phaseColor}.100`, `${phaseColor}.900`)}
                borderRadius="full"
              />
            </Box>

            {/* Project Footer */}
            <HStack justify="space-between" align="center" pt={2}>
              {/* Project Manager */}
              <HStack spacing={2}>
                <Tooltip 
                  label={`Project Manager: ${project.assignedToUser?.display_name || project.assignedToUser?.email || 'Unassigned'}`} 
                  aria-label="Project manager"
                  placement="top"
                >
                  <Avatar 
                    size="sm"
                    name={project.assignedToUser?.display_name || project.assignedToUser?.email || 'PM'} 
                    src={project.assignedToUser?.avatar_url || undefined}
                    bg={project.assignedToUser ? `${phaseColor}.500` : 'gray.400'}
                    color="white"
                    borderWidth="2px"
                    borderColor={project.assignedToUser ? `${phaseColor}.300` : 'gray.300'}
                    cursor="pointer"
                    _hover={{ 
                      transform: 'scale(1.05)',
                      borderColor: `${phaseColor}.400`
                    }}
                    transition="all 0.2s ease-in-out"
                  />
                </Tooltip>
                {!project.assignedToUser && (
                  <Text fontSize="xs" color={colors.text.muted} fontStyle="italic">
                    No PM
                  </Text>
                )}
              </HStack>

              {/* Schedule Status */}
              <HStack spacing={1}>
                <Icon as={scheduleIcon} boxSize={3} color={scheduleColor} />
                <Text fontSize="xs" color={scheduleColor} textAlign="right" noOfLines={1} maxW="100px">
                  {expectedCompletionDate ? scheduleStatus : 'No deadline'}
                </Text>
              </HStack>
            </HStack>
          </VStack>

          {/* Construction Phase Indicator */}
          <Box
            position="absolute"
            top={2}
            right={2}
            bg={`${phaseColor}.500`}
            borderRadius="full"
            p={1}
            boxSize={6}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={projectType.icon} boxSize={3} color="white" />
          </Box>
        </Box>
      )}
    </Draggable>
  );
});

ConstructionProjectCard.displayName = 'ConstructionProjectCard';
export default ConstructionProjectCard; 