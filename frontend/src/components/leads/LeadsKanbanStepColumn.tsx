import React from 'react';
import { Box, Heading, Text, VStack, Flex } from '@chakra-ui/react';
import type { WfmWorkflowStep } from '../../generated/graphql/graphql';
import { Lead } from '../../stores/useLeadsStore';
import { Droppable, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import LeadCardKanban from './LeadCardKanban.tsx';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';

const formatCurrency = (value: number, currencyCode = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

interface LeadsKanbanStepColumnProps {
  step: WfmWorkflowStep;
  leads: Lead[];
  estimatedValueSum: number;
  index: number;
}

const LeadsKanbanStepColumn: React.FC<LeadsKanbanStepColumnProps> = React.memo(({ step, leads, estimatedValueSum, index }) => {
  const colors = useThemeColors();
  const styles = useThemeStyles();

  const stepDisplayName = 
    (step.metadata as any)?.stage_name || 
    step.status?.name || 
    `Step ${step.id.substring(0, 6)}...`;

  return (
    // @ts-ignore
    <Droppable droppableId={step.id}>
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
        const columnBg = snapshot.isDraggingOver 
          ? colors.component.kanban.cardHover
          : colors.component.kanban.column;

        return (
          <VStack 
            ref={provided.innerRef}
            {...provided.droppableProps}
            spacing={6} 
            align="stretch" 
            bg={columnBg}
            p={6} 
            borderRadius="xl" 
            borderWidth="1px"
            borderColor={colors.border.default}
            minH="600px"
            w="320px"
            m={2}
            boxShadow={snapshot.isDraggingOver ? `0 0 0 2px ${colors.interactive.default}` : 'sm'}
            flexShrink={0}
            maxHeight="calc(100vh - 250px)"
            overflowY="auto"
            sx={{
              '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-thumb': { background: colors.border.subtle, borderRadius: '8px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
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
                    size="md" 
                    color={colors.text.primary}
                    noOfLines={1} 
                    mb={1}
                  >
                    {stepDisplayName}
                  </Heading>
                  <Text fontSize="sm" color={colors.text.muted}>{leads.length} Leads</Text>
                </Box>
                <Box textAlign="right">
                  <Text 
                    fontSize="lg" 
                    fontWeight="semibold" 
                    color={colors.text.success}
                    noOfLines={1} 
                    title={formatCurrency(estimatedValueSum)}
                  >
                    {formatCurrency(estimatedValueSum)}
                  </Text>
                </Box>
              </Flex>
              <Box 
                height="1px" 
                bg={colors.border.default}
                width="100%" 
              />
            </Box>
            
            {/* Lead Cards */}
            <VStack spacing={4} align="stretch" flexGrow={1}>
              {leads.map((lead, idx) => (
                <LeadCardKanban 
                  key={lead.id} 
                  lead={lead} 
                  index={idx}
                />
              ))}
              {/* @ts-ignore */}
              {provided.placeholder as any}
              {leads.length === 0 && !snapshot.isDraggingOver && (
                <Text 
                  fontSize="sm" 
                  color={colors.text.muted}
                  textAlign="center" 
                  py={6}
                  px={2}
                >
                  Drag leads here.
                </Text>
              )}
            </VStack>
          </VStack>
        );
      }}
    </Droppable>
  );
});

LeadsKanbanStepColumn.displayName = 'LeadsKanbanStepColumn';

export default LeadsKanbanStepColumn; 