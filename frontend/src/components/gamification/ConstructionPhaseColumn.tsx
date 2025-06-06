import React from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  Flex, 
  Badge,
  Icon,
  HStack,
  useColorModeValue
} from '@chakra-ui/react';
import type { WfmWorkflowStep } from '../../generated/graphql/graphql';
import { Deal } from '../../stores/useDealsStore';
import { Droppable, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import ConstructionProjectCard from './ConstructionProjectCard';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';

const formatCurrency = (value: number, currencyCode = 'USD') => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currencyCode, 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }).format(value);
};

interface PhaseInfo {
  icon: any;
  color: string;
  description: string;
  emoji: string;
}

interface ConstructionPhaseColumnProps {
  step: WfmWorkflowStep;
  projects: Deal[];
  totalBudget: number;
  phaseInfo: PhaseInfo;
  index: number;
}

const ConstructionPhaseColumn: React.FC<ConstructionPhaseColumnProps> = React.memo(({ 
  step, 
  projects, 
  totalBudget, 
  phaseInfo,
  index 
}) => {
  const colors = useThemeColors();
  const styles = useThemeStyles();

  // Override colors for construction theme
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue(`${phaseInfo.color}.50`, `${phaseInfo.color}.900`);
  const headerText = useColorModeValue(`${phaseInfo.color}.700`, `${phaseInfo.color}.200`);

  const stepDisplayName = 
    (step.metadata as any)?.name || 
    step.status?.name || 
    `Phase ${step.id.substring(0, 6)}...`;

  const totalProjectValue = projects.reduce((sum, project) => sum + (project.amount || 0), 0);

  // Get progress percentage based on phase type
  const getProgressPercentage = () => {
    const stepName = stepDisplayName.toLowerCase();
    if (stepName.includes('won')) return 100;
    if (stepName.includes('negotiation') || stepName.includes('review')) return 80;
    if (stepName.includes('proposal')) return 60;
    if (stepName.includes('qualification')) return 40;
    if (stepName.includes('lead') || stepName.includes('initial')) return 20;
    return 0;
  };

  const progressPercentage = getProgressPercentage();

  return (
    <Droppable droppableId={step.id} type="CONSTRUCTION_PROJECT">
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
        const columnBg = snapshot.isDraggingOver 
          ? useColorModeValue(`${phaseInfo.color}.100`, `${phaseInfo.color}.800`)
          : cardBg;

        return (
          <VStack 
            ref={provided.innerRef}
            {...provided.droppableProps}
            spacing={4} 
            align="stretch" 
            bg={columnBg}
            p={4} 
            borderRadius="xl" 
            borderWidth="2px"
            borderColor={snapshot.isDraggingOver ? `${phaseInfo.color}.300` : borderColor}
            minH="600px"
            w="340px"
            m={2}
            boxShadow={snapshot.isDraggingOver ? `0 0 0 3px ${phaseInfo.color}.200` : 'md'}
            flexShrink={0}
            maxHeight="calc(100vh - 250px)"
            overflowY="auto"
            transition="all 0.2s ease"
            sx={{
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': { 
                background: `${phaseInfo.color}.400`, 
                borderRadius: '6px' 
              },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
            }}
          >
            {/* Phase Header */}
            <Box 
              position="sticky" 
              top={0} 
              zIndex={1} 
              bg={headerBg} 
              borderRadius="lg"
              p={4}
              border="1px solid"
              borderColor={`${phaseInfo.color}.200`}
            >
              <VStack spacing={3} align="stretch">
                {/* Phase Icon & Title */}
                <HStack justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Box
                      bg={`${phaseInfo.color}.500`}
                      borderRadius="full"
                      p={2}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={phaseInfo.icon} boxSize={5} color="white" />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Heading size="sm" color={headerText} lineHeight="1.2">
                        {stepDisplayName}
                      </Heading>
                      <Text fontSize="xs" color={`${phaseInfo.color}.600`} fontWeight="medium">
                        {phaseInfo.description}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontSize="2xl">{phaseInfo.emoji}</Text>
                </HStack>

                {/* Progress Bar */}
                <Box>
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontSize="xs" color={`${phaseInfo.color}.600`} fontWeight="medium">
                      Phase Progress
                    </Text>
                    <Text fontSize="xs" color={`${phaseInfo.color}.600`} fontWeight="bold">
                      {progressPercentage}%
                    </Text>
                  </Flex>
                  <Box
                    bg={`${phaseInfo.color}.200`}
                    borderRadius="full"
                    h="3px"
                    overflow="hidden"
                  >
                    <Box
                      bg={`${phaseInfo.color}.500`}
                      h="100%"
                      w={`${progressPercentage}%`}
                      borderRadius="full"
                      transition="width 0.3s ease"
                    />
                  </Box>
                </Box>

                {/* Stats */}
                <HStack justify="space-between" wrap="wrap">
                  <VStack spacing={0} align="start">
                    <Text fontSize="xs" color={`${phaseInfo.color}.600`}>Projects</Text>
                    <Badge colorScheme={phaseInfo.color} variant="solid" fontSize="sm">
                      {projects.length}
                    </Badge>
                  </VStack>
                  <VStack spacing={0} align="end">
                    <Text fontSize="xs" color={`${phaseInfo.color}.600`}>Budget</Text>
                    <Text 
                      fontSize="sm" 
                      fontWeight="bold" 
                      color={headerText}
                      title={formatCurrency(totalBudget)}
                    >
                      {totalBudget >= 1000000 
                        ? `$${(totalBudget / 1000000).toFixed(1)}M`
                        : totalBudget >= 1000
                        ? `$${(totalBudget / 1000).toFixed(0)}K`
                        : formatCurrency(totalBudget)
                      }
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </Box>
            
            {/* Construction Projects */}
            <VStack spacing={3} align="stretch" flexGrow={1}>
              {projects.map((project, idx) => (
                <ConstructionProjectCard 
                  key={project.id} 
                  project={project} 
                  index={idx}
                  phaseColor={phaseInfo.color}
                />
              ))}
              {provided.placeholder}
              {projects.length === 0 && !snapshot.isDraggingOver && (
                <VStack 
                  spacing={3}
                  align="center"
                  justify="center"
                  py={8}
                  px={4}
                  border="2px dashed"
                  borderColor={`${phaseInfo.color}.300`}
                  borderRadius="lg"
                  bg={`${phaseInfo.color}.50`}
                  minH="120px"
                >
                  <Icon as={phaseInfo.icon} boxSize={8} color={`${phaseInfo.color}.400`} />
                  <Text 
                    fontSize="sm" 
                    color={`${phaseInfo.color}.600`}
                    textAlign="center"
                    fontWeight="medium"
                  >
                    Drag construction projects here to begin {phaseInfo.description.toLowerCase()}
                  </Text>
                </VStack>
              )}
            </VStack>
          </VStack>
        );
      }}
    </Droppable>
  );
});

ConstructionPhaseColumn.displayName = 'ConstructionPhaseColumn';
export default ConstructionPhaseColumn; 