import React from 'react';
import { Box, Heading, Text, VStack, Flex, Spacer } from '@chakra-ui/react';
import type { WfmWorkflowStep } from '../../generated/graphql/graphql';
import { Deal } from '../../stores/useDealsStore';
import { Droppable, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import DealCardKanban from './DealCardKanban';
import { useThemeStore } from '../../stores/useThemeStore';

const formatCurrency = (value: number, currencyCode = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

interface KanbanStepColumnProps {
  step: WfmWorkflowStep;
  deals: Deal[];
  weightedAmountSum: number;
  index: number;
}

const KanbanStepColumn: React.FC<KanbanStepColumnProps> = React.memo(({ step, deals, weightedAmountSum, index }) => {
  const { currentTheme: currentThemeName } = useThemeStore();
  const isModernTheme = currentThemeName === 'modern';

  const stepDisplayName = 
    (step.metadata as any)?.name || 
    step.status?.name || 
    `Step ${step.id.substring(0, 6)}...`;

  const totalDealValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);

  if (isModernTheme) {
    return (
      // @ts-ignore
      <Droppable droppableId={step.id} type="DEAL">
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
          const columnBg = snapshot.isDraggingOver ? 'gray.750' : 'gray.800';

          return (
            <VStack 
              ref={provided.innerRef}
              {...provided.droppableProps}
              spacing={6} 
              align="stretch" 
              bg={columnBg} 
              p={6} 
              borderRadius="xl" 
              minH="600px"
              w="320px" // FIXED WIDTH PER COLUMN
              m={2} // Keep consistent margin from previous logic
              boxShadow={snapshot.isDraggingOver ? '0 0 0 2px var(--chakra-colors-blue-400)' : 'none'} // Highlight when dragging over
              flexShrink={0}
              maxHeight="calc(100vh - 250px)" // Keep max height for scroll, adjust if header changes
              overflowY="auto"
              sx={{
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-thumb': { background: 'gray.600', borderRadius: '8px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
              }}
            >
              <Box position="sticky" top={0} zIndex={1} bg={columnBg} pt={0} px={0} pb={2}> {/* Sticky header container to match column bg */}
                <Text fontSize="lg" fontWeight="bold" color="white" mb={1}> {/* Adjusted mb based on visual */}
                  {stepDisplayName}
                </Text>
                <Text fontSize="sm" color="gray.300">
                  {formatCurrency(totalDealValue)} - {deals.length} deals
                </Text>
              </Box>
              
              {/* Deal Cards */}
              <VStack spacing={4} align="stretch" flexGrow={1} >
                {deals.map((deal, idx) => (
                  <DealCardKanban 
                    key={deal.id} 
                    deal={deal} 
                    index={idx}
                  />
                ))}
                {/* @ts-ignore */}
                {provided.placeholder as any}
                {deals.length === 0 && !snapshot.isDraggingOver && (
                    <Text 
                      fontSize="sm" 
                      color='gray.500' 
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
  }

  // Fallback for other themes (existing layout)
  return (
    // @ts-ignore
    <Droppable droppableId={step.id} type="DEAL">
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
        const columnBgOldTheme = snapshot.isDraggingOver 
          ? 'blue.50' 
          : 'gray.100';
        const darkColumnBgOldTheme = snapshot.isDraggingOver 
          ? 'blue.800' 
          : 'gray.700'; // Example dark mode for old themes

        // Use currentThemeName from the hook, which is already available
        const shouldUseDarkBg = currentThemeName === 'industrialMetal';

        return (
          <Box
            {...provided.droppableProps}
            ref={provided.innerRef}
            minWidth={isModernTheme ? "320px" : "300px"} // old values
            maxWidth={isModernTheme ? "320px" : "350px"} // old values
            p={isModernTheme ? 0 : 4} // old values
            m={2} // Consistent margin
            bg={shouldUseDarkBg ? darkColumnBgOldTheme : columnBgOldTheme} 
            borderRadius={isModernTheme ? 'lg' : 'md'} // old values
            boxShadow={isModernTheme ? 'none' : 'sm'} // old values
            flexShrink={0}
            height="fit-content"
            maxHeight="calc(100vh - 250px)"
            overflowY="auto"
            sx={{
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-thumb': { background: 'gray.300', borderRadius: '8px' },
                '&::-webkit-scrollbar-track': { background: 'gray.100' },
                _dark: {
                  '&::-webkit-scrollbar-thumb': { background: 'gray.600' },
                  '&::-webkit-scrollbar-track': { background: 'gray.800' },
                }
            }}
          >
            <Flex
              alignItems="center"
              position="sticky"
              top={0}
              zIndex={1}
              px={isModernTheme ? '20px' : undefined} // old values
              pt={isModernTheme ? '20px' : undefined} // old values
              pb={isModernTheme ? '16px' : 2} // old values
              mb={isModernTheme ? 0 : 3} // old values
              borderBottomWidth= "1px" 
              borderColor={isModernTheme ? "border.light" : "gray.200"} // old values
              bg={shouldUseDarkBg ? darkColumnBgOldTheme : columnBgOldTheme} 
              borderTopRadius={isModernTheme ? 'lg' : undefined} // old values
            >
              <Box flexGrow={1}>
                <Heading 
                    size={isModernTheme ? "md" : "sm"} 
                    color={isModernTheme ? "text.default" : undefined} 
                    noOfLines={1} 
                    mb={isModernTheme ? 1 : 0}
                >
                  {stepDisplayName}
                </Heading>
                {isModernTheme && <Text fontSize="sm" color="text.muted">{deals.length} Deals</Text>} {/* This was for modern, might remove if covered by new header */}
              </Box>
              <Spacer />
              <Box textAlign="right">
                <Text 
                    fontSize={isModernTheme ? "lg" : "sm"} 
                    fontWeight={isModernTheme ? "semibold" : "bold"} 
                    color={isModernTheme ? "text.default" : undefined} 
                    noOfLines={1} 
                    title={formatCurrency(weightedAmountSum)}
                >
                  {formatCurrency(weightedAmountSum)}
                </Text>
                {!isModernTheme && <Text fontSize="xs">{deals.length} deals</Text>}
              </Box>
            </Flex>
            <VStack 
                spacing={isModernTheme ? '12px' : 3}  
                align="stretch" 
                p={isModernTheme ? '20px' : 0} // old values
                pt={isModernTheme ? 0 : undefined} // old values
            >
              {deals.map((deal, idx) => (
                <DealCardKanban 
                  key={deal.id} 
                  deal={deal} 
                  index={idx}
                />
              ))}
              {/* @ts-ignore */}
              {provided.placeholder as any}
              {deals.length === 0 && !snapshot.isDraggingOver && (
                  <Text 
                    fontSize="sm" 
                    color={isModernTheme ? "text.muted" : 'gray.400'} 
                    textAlign="center" 
                    py={isModernTheme ? 6 : 4} 
                    px={2}
                  >
                      Drag deals here or create new ones.
                  </Text>
              )}
            </VStack>
          </Box>
        );
      }}
    </Droppable>
  );
});

KanbanStepColumn.displayName = 'KanbanStepColumn';
export default KanbanStepColumn; 