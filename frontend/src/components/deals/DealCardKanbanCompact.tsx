import React from 'react';
import {
  Box,
  Text,
  HStack,
  Tooltip,
  Progress,
  Avatar,
  Flex,
} from '@chakra-ui/react';
import { Deal } from '../../stores/useDealsStore';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { Link as RouterLink } from 'react-router-dom';
import { useThemeColors } from '../../hooks/useThemeColors';
import { formatDistanceToNowStrict, isPast } from 'date-fns';

interface DealCardKanbanCompactProps {
  deal: Deal;
  index: number;
}

const DealCardKanbanCompact: React.FC<DealCardKanbanCompactProps> = React.memo(({ deal, index }) => {
  const colors = useThemeColors();

  const getEffectiveProbability = () => {
    if (deal.deal_specific_probability != null) return deal.deal_specific_probability;
    if (deal.currentWfmStep?.metadata && typeof deal.currentWfmStep.metadata === 'object' && 'deal_probability' in deal.currentWfmStep.metadata) {
      const stepProbability = (deal.currentWfmStep.metadata as { deal_probability?: number }).deal_probability;
      if (stepProbability != null) return stepProbability;
    }
    return 0;
  };
  const probabilityValue = getEffectiveProbability() * 100;

  const expectedCloseDate = deal.expected_close_date ? new Date(deal.expected_close_date) : null;
  let dueDateColor = colors.text.muted;
  if (expectedCloseDate && isPast(expectedCloseDate)) {
    dueDateColor = colors.text.error;
  }

  const baseStyle = {
    bg: colors.bg.elevated,
    p: 3, // Reduced from 5 to 3
    borderRadius: "md", // Reduced from lg to md
    borderWidth: "1px",
    borderColor: colors.border.default,
    transition: "all 0.2s ease", // Faster transition
    _hover: {
      transform: "translateY(-2px)", // Reduced from -4px
      boxShadow: `0 8px 15px -3px rgba(59, 130, 246, 0.1)`, // Smaller shadow
      borderColor: 'rgba(59, 130, 246, 0.3)',
      bg: colors.bg.elevated,
    }
  };

  const draggingStyle = {
    ...baseStyle,
    borderColor: 'rgba(59, 130, 246, 0.6)',
    boxShadow: `0 15px 25px -5px rgba(59, 130, 246, 0.15)`,
    transform: 'translateY(-3px) rotate(1deg)',
    bg: colors.bg.elevated,
  };

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          mb={2} // Reduced from 4 to 2
          {...(snapshot.isDragging ? draggingStyle : baseStyle)}
        >
          {/* Header Row: Name + Amount */}
          <HStack justify="space-between" mb={2}>
            <RouterLink to={`/deals/${deal.id}`} style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
              <Text 
                fontWeight="semibold" 
                color={colors.text.primary}
                _hover={{ color: colors.text.link }}
                fontSize="sm"
                noOfLines={1}
              >
                {deal.name}
              </Text>
            </RouterLink>
            <Text fontSize="sm" fontWeight="bold" color={colors.text.success} ml={2}>
              {deal.amount ? new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD', 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0,
                notation: deal.amount >= 1000000 ? 'compact' : 'standard' // Use compact notation for large numbers
              }).format(deal.amount) : '-'}
            </Text>
          </HStack>

          {/* Organization + Project ID */}
          <HStack justify="space-between" mb={2}>
            <Text fontSize="xs" color={colors.text.muted} noOfLines={1} flex={1} minWidth={0}>
              {deal.organization?.name || 'No org'}
            </Text>
            {(deal as any).project_id && (
              <Text 
                fontSize="xs" 
                color={colors.text.link}
                fontFamily="mono"
                fontWeight="medium"
                bg={colors.bg.input}
                px={1.5}
                py={0.5}
                borderRadius="sm"
              >
                #{(deal as any).project_id}
              </Text>
            )}
          </HStack>

          {/* Progress Bar */}
          <Progress 
            value={probabilityValue}
            size="xs" // Smaller than sm
            colorScheme="blue" 
            bg={colors.bg.input}
            borderRadius="full"
            mb={2}
          />

          {/* Footer Row: User + Due Date */}
          <HStack justify="space-between" align="center">
            <HStack spacing={1}>
              <Tooltip 
                label={deal.assignedToUser?.display_name || deal.assignedToUser?.email || 'Unassigned'} 
                aria-label="Assigned user"
                placement="top"
              >
                <Avatar 
                  size="xs" // Smaller avatar
                  name={deal.assignedToUser?.display_name || deal.assignedToUser?.email || 'U'} 
                  src={deal.assignedToUser?.avatar_url || undefined}
                  bg={deal.assignedToUser ? colors.interactive.default : colors.bg.input}
                  color={deal.assignedToUser ? colors.text.onAccent : colors.text.muted}
                />
              </Tooltip>
              <Text fontSize="xs" color={colors.text.secondary} noOfLines={1} maxW="60px">
                {deal.assignedToUser?.display_name || deal.assignedToUser?.email || 'Unassigned'}
              </Text>
            </HStack>
            
            <Flex direction="column" align="end" minWidth={0}>
              <Text fontSize="xs" color={colors.text.link} fontWeight="medium" noOfLines={1}>
                {probabilityValue.toFixed(0)}%
              </Text>
              {expectedCloseDate && (
                <Text fontSize="xs" color={dueDateColor} noOfLines={1}>
                  {isPast(expectedCloseDate) ? 'Overdue' : formatDistanceToNowStrict(expectedCloseDate)}
                </Text>
              )}
            </Flex>
          </HStack>
        </Box>
      )}
    </Draggable>
  );
});

DealCardKanbanCompact.displayName = 'DealCardKanbanCompact';

export default DealCardKanbanCompact; 