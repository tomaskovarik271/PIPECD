import React from 'react';
import { Box, Heading, Text, VStack, Flex } from '@chakra-ui/react';
import type { WfmWorkflowStep } from '../../generated/graphql/graphql';
import { Deal } from '../../stores/useDealsStore';
import { Droppable, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import DealCardKanban from './DealCardKanban';
import DealCardKanbanCompact from './DealCardKanbanCompact';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';
import { useAppStore } from '../../stores/useAppStore';
import { CurrencyFormatter } from '../../../../lib/utils/currencyFormatter';

// REMOVED: Duplicate wrapper function - using CurrencyFormatter.format directly

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

const formatColumnTotal = (deals: Deal[], displayMode: 'mixed' | 'converted', baseCurrency: string) => {
  if (displayMode === 'converted') {
    // Convert all amounts to base currency
    const totalInBaseCurrency = deals.reduce((sum, deal) => {
      const amount = deal.weighted_amount || 0;
      const currency = deal.currency || 'USD';
      return sum + convertAmount(amount, currency, baseCurrency);
    }, 0);
    
    return CurrencyFormatter.format(totalInBaseCurrency, baseCurrency, { precision: 0 });
  } else {
    // Mixed currency display
    const currencyGroups = deals.reduce((acc, deal) => {
      const currency = deal.currency || 'USD';
      const amount = deal.weighted_amount || 0;
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      acc[currency] += amount;
      return acc;
    }, {} as Record<string, number>);

    const currencies = Object.keys(currencyGroups);
    
    if (currencies.length <= 1) {
      const currency = currencies[0] || 'USD';
      return CurrencyFormatter.format(currencyGroups[currency] || 0, currency, { precision: 0 });
    }
    
    const sortedCurrencies = currencies.sort((a, b) => currencyGroups[b] - currencyGroups[a]);
    const primaryCurrency = sortedCurrencies[0];
    const primaryAmount = currencyGroups[primaryCurrency];
    
    return `${CurrencyFormatter.format(primaryAmount, primaryCurrency, { precision: 0 })} +${currencies.length - 1}`;
  }
};

interface KanbanStepColumnProps {
  step: WfmWorkflowStep;
  deals: Deal[];
  weightedAmountSum: number;
  index: number;
  isCompact?: boolean;
}

const KanbanStepColumn: React.FC<KanbanStepColumnProps> = React.memo(({ step, deals, weightedAmountSum: _weightedAmountSum, index: _index, isCompact = false }) => {
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const { currencyDisplayMode, baseCurrencyForConversion } = useAppStore();

  const stepDisplayName = 
    (step.metadata as any)?.name || 
    step.status?.name || 
    `Step ${step.id.substring(0, 6)}...`;

  const formattedTotal = formatColumnTotal(deals, currencyDisplayMode, baseCurrencyForConversion);

  return (
    // @ts-ignore
    <Droppable droppableId={step.id} type="DEAL">
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
        const columnBg = snapshot.isDraggingOver 
          ? colors.component.kanban.cardHover
          : colors.component.kanban.column;

        return (
          <VStack 
            ref={provided.innerRef}
            {...provided.droppableProps}
            spacing={isCompact ? 4 : 6} 
            align="stretch" 
            bg={columnBg}
            p={isCompact ? 4 : 6} 
            borderRadius="xl" 
            borderWidth="1px"
            borderColor={colors.component.kanban.cardBorder}
            minH={isCompact ? "500px" : "600px"}
            w={isCompact ? "260px" : "320px"}
            m={isCompact ? 1.5 : 2}
            boxShadow={snapshot.isDraggingOver ? 'forgeFire' : 'steelPlate'}
            flexShrink={0}
            maxHeight="calc(100vh - 250px)"
            overflowY="auto"
            position="relative"
            transition="all 0.3s ease"
            _before={snapshot.isDraggingOver ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: "xl",
              background: 'linear-gradient(180deg, transparent 0%, rgba(255, 170, 0, 0.05) 50%, transparent 100%)',
              pointerEvents: 'none',
            } : undefined}
            sx={{
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': { 
                background: 'linear-gradient(180deg, #4A4A4A 0%, #3E3E3E 100%)',
                borderRadius: '8px',
                border: '1px solid rgba(58, 58, 58, 0.5)',
              },
              '&::-webkit-scrollbar-track': { 
                background: 'rgba(28, 28, 28, 0.3)',
                borderRadius: '8px',
              },
            }}
          >
            <Box 
              position="sticky" 
              top={0} 
              zIndex={1} 
              bg={columnBg} 
              pt={0} 
              px={0} 
              pb={2}
            >
              <Flex alignItems="center" justifyContent="space-between" mb={2}>
                <Box flexGrow={1}>
                  <Heading 
                    size={isCompact ? "sm" : "md"} 
                    color={colors.text.primary}
                    mb={1}
                    lineHeight="1.3"
                  >
                    {stepDisplayName}
                  </Heading>
                  <Text fontSize={isCompact ? "xs" : "sm"} color={colors.text.muted}>{deals.length} Deals</Text>
                </Box>
                <Box textAlign="right">
                  <Text 
                    fontSize={isCompact ? "md" : "lg"} 
                    fontWeight="semibold" 
                    color={colors.text.success}
                    noOfLines={1} 
                    title={formattedTotal}
                  >
                    {formattedTotal}
                  </Text>
                </Box>
              </Flex>
              <Box 
                height="1px" 
                bg={colors.border.default}
                width="100%" 
              />
            </Box>
            
            {/* Deal Cards */}
            <VStack spacing={isCompact ? 2 : 4} align="stretch" flexGrow={1}>
              {deals.map((deal, idx) => 
                isCompact ? (
                  <DealCardKanbanCompact 
                    key={deal.id} 
                    deal={deal} 
                    index={idx}
                  />
                ) : (
                  <DealCardKanban 
                    key={deal.id} 
                    deal={deal} 
                    index={idx}
                  />
                )
              )}
              {/* @ts-ignore */}
              {provided.placeholder as any}
              {deals.length === 0 && !snapshot.isDraggingOver && (
                <Text 
                  fontSize="sm" 
                  color={colors.text.muted}
                  textAlign="center" 
                  py={6}
                  px={2}
                >
                  Drag deals here.
                </Text>
              )}
            </VStack>
          </VStack>
        );
      }}
    </Droppable>
  );
});

KanbanStepColumn.displayName = 'KanbanStepColumn';
export default KanbanStepColumn; 