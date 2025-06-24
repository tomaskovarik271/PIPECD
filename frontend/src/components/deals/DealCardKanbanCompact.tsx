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
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../../hooks/useThemeColors';
import { formatDistanceToNowStrict, isPast } from 'date-fns';
import { useAppStore } from '../../stores/useAppStore';
// Activity indicators removed - using Google Calendar integration instead

// Extended Deal type that includes project_id which may be present on some deals
interface DealWithProjectId extends Deal {
  project_id?: string | number;
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
      maximumFractionDigits: 0,
      notation: convertedAmount >= 1000000 ? 'compact' : 'standard'
    }).format(convertedAmount);
  } else {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: originalCurrency, 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0,
      notation: deal.amount >= 1000000 ? 'compact' : 'standard'
    }).format(deal.amount);
  }
};

interface DealCardKanbanCompactProps {
  deal: DealWithProjectId;
  index: number;
}

const DealCardKanbanCompact: React.FC<DealCardKanbanCompactProps> = React.memo(({ deal, index }) => {
  const colors = useThemeColors();
  const { currencyDisplayMode, baseCurrencyForConversion } = useAppStore();
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if it's a drag event
    if (e.defaultPrevented) return;
    
    navigate(`/deals/${deal.id}`);
  };

  // Analyze activities for indicators
  // Activity indicators removed - using Google Calendar integration instead

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

  // Enhanced styling based on activity urgency - just a little more
  const hasOverdueActivities = activityIndicators.overdueCount > 0;
  const hasDueTodayActivities = activityIndicators.dueTodayCount > 0;
  
  let borderLeftColor = "transparent";
  let borderLeftWidth = "1px";
  let boxShadowHint = "";
  
  if (hasOverdueActivities) {
    borderLeftColor = "red.400";
    borderLeftWidth = "2px";
    boxShadowHint = "0 0 0 1px rgba(239, 68, 68, 0.1)";
  } else if (hasDueTodayActivities) {
    borderLeftColor = "orange.400";
    borderLeftWidth = "2px";
    boxShadowHint = "0 0 0 1px rgba(251, 146, 60, 0.1)";
  }

  const baseStyle = {
    bg: colors.bg.elevated,
    p: 3,
    borderRadius: "md",
    borderWidth: "1px",
    borderColor: colors.border.default,
    borderLeftWidth: borderLeftWidth,
    borderLeftColor: borderLeftColor,
    boxShadow: boxShadowHint || undefined,
    transition: "all 0.2s ease",
    cursor: "pointer",
    _hover: {
      transform: "translateY(-2px)",
      boxShadow: `0 8px 15px -3px rgba(59, 130, 246, 0.1)`,
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
          onClick={handleCardClick}
          {...(snapshot.isDragging ? draggingStyle : baseStyle)}
        >
          {/* Header Row: Name + Activity Indicators + Amount */}
          <HStack justify="space-between" mb={2} align="center">
            <HStack spacing={2} flex={1} minWidth={0}>
              <Text 
                fontWeight="semibold" 
                color={colors.text.primary}
                fontSize="sm"
                noOfLines={1}
                flex={1}
                minWidth={0}
              >
                {deal.name}
              </Text>
              <ActivityIndicator indicators={activityIndicators} variant="compact" />
            </HStack>
            <Text fontSize="sm" fontWeight="bold" color={colors.text.success} ml={2} flexShrink={0}>
              {formatDealAmount(deal, currencyDisplayMode, baseCurrencyForConversion)}
            </Text>
          </HStack>

          {/* Organization + Project ID */}
          <HStack justify="space-between" mb={2}>
            <Text fontSize="xs" color={colors.text.muted} noOfLines={1} flex={1} minWidth={0}>
              {deal.organization?.name || 'No org'}
            </Text>
            {deal.project_id && (
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
                #{deal.project_id}
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