import React from 'react';
import { Box, Heading, Text, VStack, Flex, Card, CardHeader, HStack, Badge, Tooltip } from '@chakra-ui/react';
import type { WfmWorkflowStep } from '../../generated/graphql/graphql';
import { Lead } from '../../stores/useLeadsStore';
import { Droppable, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import LeadCardKanban from './LeadCardKanban.tsx';
import LeadCardKanbanCompact from './LeadCardKanbanCompact.tsx';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';
import { CurrencyFormatter } from '../../lib/utils/currencyFormatter';

interface LeadsKanbanStepColumnProps {
  step: WfmWorkflowStep;
  leads: Lead[];
  estimatedValueSum: number;
  index: number;
  isCompact?: boolean;
}

const LeadsKanbanStepColumn: React.FC<LeadsKanbanStepColumnProps> = React.memo(({ step, leads, estimatedValueSum, index, isCompact = false }) => {
  const colors = useThemeColors();
  const styles = useThemeStyles();

  const stepDisplayName = 
    (step.metadata as any)?.stage_name || 
    step.status?.name || 
    `Step ${step.id.substring(0, 6)}...`;

  const totalValueFormatted = CurrencyFormatter.format(estimatedValueSum, 'USD', { precision: 0 });

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
            spacing={isCompact ? 4 : 6} 
            align="stretch" 
            bg={columnBg}
            p={isCompact ? 4 : 6} 
            borderRadius="xl" 
            borderWidth="1px"
            borderColor={colors.border.default}
            minH={isCompact ? "500px" : "600px"}
            w={isCompact ? "260px" : "320px"}
            m={isCompact ? 1.5 : 2}
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
                    size={isCompact ? "sm" : "md"} 
                    color={colors.text.primary}
                    noOfLines={1} 
                    mb={1}
                  >
                    {stepDisplayName}
                  </Heading>
                  <Text fontSize={isCompact ? "xs" : "sm"} color={colors.text.muted}>{leads.length} Leads</Text>
                </Box>
                <Box textAlign="right">
                  <Tooltip 
                    label={`Total estimated value in ${stepDisplayName} stage`} 
                    placement="top"
                  >
                    <Text 
                      fontSize={isCompact ? "md" : "lg"} 
                      fontWeight="semibold" 
                      color={colors.text.success}
                      noOfLines={1} 
                      title={totalValueFormatted}
                    >
                      {totalValueFormatted}
                    </Text>
                  </Tooltip>
                </Box>
              </Flex>
              <Box 
                height="1px" 
                bg={colors.border.default}
                width="100%" 
              />
            </Box>
            
            {/* Lead Cards */}
            <VStack spacing={isCompact ? 2 : 4} align="stretch" flexGrow={1}>
              {leads.map((lead, idx) => 
                isCompact ? (
                  <LeadCardKanbanCompact 
                    key={lead.id} 
                    lead={lead} 
                    index={idx}
                  />
                ) : (
                  <LeadCardKanban 
                    key={lead.id} 
                    lead={lead} 
                    index={idx}
                  />
                )
              )}
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