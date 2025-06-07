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
} from '@chakra-ui/react';
import { Deal } from '../../stores/useDealsStore';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { Link as RouterLink } from 'react-router-dom';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';
import { TimeIcon, ExternalLinkIcon, EditIcon, ViewIcon as EyeIcon } from '@chakra-ui/icons';
import { differenceInDays, formatDistanceToNowStrict, isPast, format } from 'date-fns';

interface DealCardKanbanProps {
  deal: Deal;
  index: number;
}

const DealCardKanban: React.FC<DealCardKanbanProps> = React.memo(({ deal, index }) => {
  const colors = useThemeColors();
  const styles = useThemeStyles();

  const placeholderTags = [deal.currentWfmStep?.status?.name].filter(Boolean) as string[];
  if (deal.amount && deal.amount > 50000) placeholderTags.push('High Value');

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
  let dueDateStatus = "";
  let dueDateColor = colors.text.muted;
  if (expectedCloseDate) {
    if (isPast(expectedCloseDate)) {
      dueDateStatus = `${formatDistanceToNowStrict(expectedCloseDate, { addSuffix: true })} overdue`;
      dueDateColor = colors.text.error;
    } else {
      dueDateStatus = `Due in ${formatDistanceToNowStrict(expectedCloseDate)}`;
    }
  }

  const baseStyle = {
    bg: colors.bg.elevated,
    p: 5,
    borderRadius: "lg",
    borderWidth: "1px",
    borderColor: colors.border.default,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    _hover: {
      transform: "translateY(-4px) scale(1.02)",
      boxShadow: `
        0 20px 25px -5px rgba(59, 130, 246, 0.15),
        0 10px 10px -5px rgba(59, 130, 246, 0.1),
        0 0 20px rgba(59, 130, 246, 0.2),
        0 0 40px rgba(59, 130, 246, 0.1)
      `,
      borderColor: 'rgba(59, 130, 246, 0.5)',
      bg: colors.bg.elevated,
      filter: 'brightness(1.05)'
    }
  };

  const draggingStyle = {
    ...baseStyle,
    borderColor: 'rgba(59, 130, 246, 0.8)',
    boxShadow: `
      0 25px 50px -12px rgba(59, 130, 246, 0.25),
      0 15px 15px -5px rgba(59, 130, 246, 0.15),
      0 0 30px rgba(59, 130, 246, 0.3),
      0 0 60px rgba(59, 130, 246, 0.15)
    `,
    transform: 'translateY(-6px) rotate(2deg) scale(1.05)',
    filter: 'brightness(1.1)',
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
          mb={4}
          {...(snapshot.isDragging ? draggingStyle : baseStyle)}
          position="relative"
        >
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between" mb={2}>
              <VStack align="start" spacing={0.5}>
                <RouterLink to={`/deals/${deal.id}`} style={{ textDecoration: 'none' }}>
                  <Text 
                    fontWeight="bold" 
                    color={colors.text.primary}
                    _hover={{ color: colors.text.link }}
                    fontSize="md"
                    lineHeight="1.3"
                  >
                    {deal.name}
                  </Text>
                </RouterLink>
                <Text fontSize="sm" color={colors.text.muted}>
                  {deal.organization?.name || '-'}
                </Text>
                {(deal as any).project_id && (
                  <Text 
                    fontSize="xs" 
                    color={colors.text.link}
                    fontFamily="mono"
                    fontWeight="medium"
                    bg={colors.bg.input}
                    px={2}
                    py={1}
                    borderRadius="md"
                    display="inline-block"
                  >
                    #{(deal as any).project_id}
                  </Text>
                )}
              </VStack>
              <Text fontSize="lg" fontWeight="bold" color={colors.text.success}>
                {deal.amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits:0, maximumFractionDigits:0 }).format(deal.amount) : '-'}
              </Text>
            </HStack>

            <Box mb={2}>
              <Progress 
                value={probabilityValue}
                size="sm" 
                colorScheme="blue" 
                bg={colors.bg.input}
                borderRadius="full"
              />
              <Text fontSize="xs" color={colors.text.link} mt={1} textAlign="right">
                {probabilityValue.toFixed(0)}% probability
              </Text>
            </Box>

            <HStack justify="space-between" borderTopWidth="1px" borderColor={colors.border.default} pt={2} mt="auto">
              <HStack spacing={2}>
                <Tooltip 
                  label={deal.assignedToUser?.display_name || deal.assignedToUser?.email || 'Unassigned'} 
                  aria-label="Assigned user"
                  placement="top"
                >
                  <Avatar 
                    size="sm"
                    name={deal.assignedToUser?.display_name || deal.assignedToUser?.email || 'Unassigned'} 
                    src={deal.assignedToUser?.avatar_url || undefined}
                    bg={deal.assignedToUser ? colors.interactive.default : colors.bg.input}
                    color={deal.assignedToUser ? colors.text.onAccent : colors.text.muted}
                    borderWidth="2px"
                    borderColor={deal.assignedToUser ? colors.border.accent : colors.border.default}
                    cursor="pointer"
                    _hover={{ 
                      transform: 'scale(1.05)',
                      borderColor: colors.interactive.hover 
                    }}
                    transition="all 0.2s ease-in-out"
                  />
                </Tooltip>
                {deal.assignedToUser && (
                  <Text fontSize="xs" color={colors.text.secondary} noOfLines={1} maxW="80px">
                    {deal.assignedToUser.display_name || deal.assignedToUser.email}
                  </Text>
                )}
                {!deal.assignedToUser && (
                  <Text fontSize="xs" color={colors.text.muted} fontStyle="italic">
                    Unassigned
                  </Text>
                )}
              </HStack>
              <Text fontSize="xs" color={dueDateColor} textAlign="right" maxW="100px" noOfLines={1}>
                {expectedCloseDate ? dueDateStatus : 'No due date'}
              </Text>
            </HStack>
          </VStack>
        </Box>
      )}
    </Draggable>
  );
});

DealCardKanban.displayName = 'DealCardKanban';
export default DealCardKanban; 