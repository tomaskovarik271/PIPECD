import React from 'react';
import {
  Box,
  Text,
  VStack,
  Tooltip,
  HStack,
  Progress,
  Avatar,
  Tag,
} from '@chakra-ui/react';
import { Deal } from '../../stores/useDealsStore';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../../hooks/useThemeColors';
import { TimeIcon, ExternalLinkIcon, EditIcon, ViewIcon as EyeIcon, WarningIcon } from '@chakra-ui/icons';
import { differenceInDays, formatDistanceToNowStrict, isPast, format } from 'date-fns';
import { useAppStore } from '../../stores/useAppStore';
import { FiClock, FiAlertTriangle } from 'react-icons/fi';
import { ConsolidatedCardIndicators } from './ConsolidatedCardIndicators';
// Activity indicators removed - using Google Calendar integration instead

interface DealCardKanbanProps {
  deal: Deal;
  index: number;
  taskIndicators?: { dealId: string; tasksDueToday: number; tasksOverdue: number; totalActiveTasks: number; };
}

// Simple exchange rates for demo (in production, this would come from the database)
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  'USD': { 'EUR': 0.85, 'GBP': 0.75, 'CHF': 0.92, 'USD': 1.0 },
  'EUR': { 'USD': 1.18, 'GBP': 0.88, 'CHF': 1.08, 'EUR': 1.0 },
  'GBP': { 'USD': 1.33, 'EUR': 1.14, 'CHF': 1.23, 'GBP': 1.0 },
  'CHF': { 'USD': 1.09, 'EUR': 0.93, 'GBP': 0.81, 'CHF': 1.0 },
};

const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  const rate = EXCHANGE_RATES[fromCurrency]?.[toCurrency] || 1;
  return amount * rate;
};

const formatDealAmount = (deal: Deal, displayMode: 'mixed' | 'converted', baseCurrency: string) => {
  if (!deal.amount) return '-';
  
  const originalCurrency = deal.currency || 'USD';
  
  if (displayMode === 'converted' && originalCurrency !== baseCurrency) {
    const convertedAmount = convertAmount(deal.amount, originalCurrency, baseCurrency);
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: baseCurrency, 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(convertedAmount);
  } else {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: originalCurrency, 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(deal.amount);
  }
};

const DealCardKanban: React.FC<DealCardKanbanProps> = React.memo(({ deal, index, taskIndicators }) => {
  const colors = useThemeColors();
  const { currencyDisplayMode, baseCurrencyForConversion } = useAppStore();
  const navigate = useNavigate();

  // Analyze activities for indicators
  // Activity indicators removed - using Google Calendar integration instead

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

  // Enhanced styling based on activity urgency - just a little more
  // Activity status indicators removed - using Google Calendar integration instead
  
  // Activity-based styling removed - using Google Calendar integration instead
  let borderLeftColor = "transparent";
  let borderLeftWidth = "1px";
  let boxShadowHint = "";

  const baseStyle = {
    bg: colors.component.kanban.card,
    p: 5,
    borderRadius: "lg",
    borderWidth: "1px",
    borderColor: colors.component.kanban.cardBorder,
    borderLeftWidth: borderLeftWidth,
    borderLeftColor: borderLeftColor,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: boxShadowHint,
    position: 'relative',
    cursor: "pointer",
    _before: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: "lg",
      background: 'transparent',
      transition: 'all 0.3s ease',
    },
    _hover: {
      transform: "translateY(-4px) scale(1.02)",
      boxShadow: 'industrial3d',
      borderColor: colors.component.kanban.cardBorder,
      bg: colors.component.kanban.cardHover,
      filter: 'brightness(1.05)',
      _before: {
        background: 'linear-gradient(45deg, transparent 30%, rgba(255, 170, 0, 0.05) 50%, transparent 70%)',
      },
    }
  };

  const draggingStyle = {
    ...baseStyle,
    borderColor: colors.component.kanban.cardBorder,
    boxShadow: 'forgeFire',
    transform: 'translateY(-6px) rotate(2deg) scale(1.05)',
    filter: 'brightness(1.1)',
    bg: colors.component.kanban.cardHover,
    _before: {
      background: 'linear-gradient(45deg, transparent 20%, rgba(255, 170, 0, 0.1) 50%, transparent 80%)',
    },
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when dragging
    if (e.defaultPrevented) return;
    navigate(`/deals/${deal.id}`);
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
          onClick={handleCardClick}
        >
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between" mb={2}>
              <VStack align="start" spacing={0.5}>
                  <Text 
                    fontWeight="bold" 
                    color={colors.text.primary}
                    fontSize="md"
                    lineHeight="1.3"
                    noOfLines={2}
                  >
                    {deal.name}
                  </Text>
                <Text fontSize="sm" color={colors.text.muted}>
                  {deal.organization?.name || '-'}
                </Text>
                <Box mt={2}>
                  <ConsolidatedCardIndicators 
                    deal={deal}
                    taskIndicators={taskIndicators}
                    maxVisibleIndicators={3}
                    showProjectId={true}
                  />
                </Box>
              </VStack>
              <Text fontSize="lg" fontWeight="bold" color={colors.text.success}>
                {formatDealAmount(deal, currencyDisplayMode, baseCurrencyForConversion)}
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