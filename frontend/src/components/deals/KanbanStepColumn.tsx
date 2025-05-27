import React from 'react';
import { Box, Heading, Text, VStack, useColorModeValue, useTheme } from '@chakra-ui/react';
// import { Stage } from '../../stores/useStagesStore'; // Remove old Stage type
import type { WfmWorkflowStep } from '../../generated/graphql/graphql'; // Import WFMWorkflowStep
import { Deal } from '../../stores/useDealsStore';
import { Droppable, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import DealCardKanban from './DealCardKanban';
import { useThemeStore } from '../../stores/useThemeStore';

interface KanbanStepColumnProps { // Renamed interface
  // stage: Stage; // Replace with WfmWorkflowStep
  step: WfmWorkflowStep; // New prop for WFM step
  deals: Deal[];
  index: number;
}

// Wrap component with React.memo
const KanbanStepColumn: React.FC<KanbanStepColumnProps> = React.memo(({ step, deals, index }) => {
  const { currentTheme } = useThemeStore();
  const theme = useTheme();

  const defaultScrollbarThumbBg = useColorModeValue('gray.300', 'gray.500');
  const defaultScrollbarTrackBg = useColorModeValue('gray.100', 'gray.600');
  const defaultPlaceholderTextColor = useColorModeValue('gray.400', 'gray.500');
  const defaultColumnBgBase = useColorModeValue('gray.100', 'gray.700');
  const defaultColumnBgHover = useColorModeValue('blue.50', 'blue.800');

  const warholScrollbarThumbBg = theme.colors.pink?.[500] ?? defaultScrollbarThumbBg;
  const warholScrollbarTrackBg = theme.colors.gray?.[800] ?? defaultScrollbarTrackBg;
  const warholPlaceholderTextColor = theme.colors.gray?.[200] ?? defaultPlaceholderTextColor;
  const warholColumnBgBase = theme.colors.gray?.[800] ?? defaultColumnBgBase;
  const warholColumnBgHover = theme.colors.gray?.[700] ?? defaultColumnBgHover;

  const scrollbarThumbBg = currentTheme === 'andyWarhol' ? warholScrollbarThumbBg : defaultScrollbarThumbBg;
  const scrollbarTrackBg = currentTheme === 'andyWarhol' ? warholScrollbarTrackBg : defaultScrollbarTrackBg;
  const placeholderTextColor = currentTheme === 'andyWarhol' ? warholPlaceholderTextColor : defaultPlaceholderTextColor;
  const columnBgBase = currentTheme === 'andyWarhol' ? warholColumnBgBase : defaultColumnBgBase;
  const columnBgHover = currentTheme === 'andyWarhol' ? warholColumnBgHover : defaultColumnBgHover;
  
  const columnHeaderText = useColorModeValue(
    theme.colors.gray?.[900] ?? '#1A202C', // Default light mode: black (with fallback)
    currentTheme === 'andyWarhol' ? (theme.colors.yellow?.[500] ?? '#ECC94B') : (theme.colors.gray?.[50] ?? '#F7FAFC') // Warhol dark: popYellow, Default dark: white (with fallbacks)
  );
  
  // Determine the display name for the step
  // Prioritize metadata.name, then status.name, then step.id as fallback
  const stepDisplayName = 
    (step.metadata as any)?.name || 
    step.status?.name || 
    `Step ${step.id.substring(0, 6)}...`;

  return (
    // @ts-ignore TS2786: 'Droppable' cannot be used as a JSX component. TODO: Investigate if @hello-pangea/dnd types are correctly installed/imported
    <Droppable droppableId={step.id} type="DEAL"> 
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
        const currentColumnBg = snapshot.isDraggingOver ? columnBgHover : columnBgBase;
        return (
          <Box
            {...provided.droppableProps}
            ref={provided.innerRef}
            minWidth="300px"
            maxWidth="350px"
            p={4}
            m={2}
            bg={currentColumnBg}
            borderRadius="md"
            boxShadow="sm"
            flexShrink={0}
            height="fit-content"
            maxHeight="calc(100vh - 250px)"
            overflowY="auto"
            sx={{
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: scrollbarThumbBg, 
                    borderRadius: '8px',
                    border: currentTheme === 'andyWarhol' ? `2px solid ${theme.colors.black ?? 'black'}` : 'none',
                },
                '&::-webkit-scrollbar-track': {
                    background: scrollbarTrackBg, 
                },
            }}
          >
            <Heading 
              size="sm" 
              mb={3} 
              borderBottomWidth="1px" 
              pb={2} 
              position="sticky" 
              top={0} 
              bg={currentColumnBg} 
              zIndex={1}
              color={columnHeaderText}
              borderColor={currentTheme === 'andyWarhol' ? (theme.colors.yellow?.[500] ?? '#ECC94B') : useColorModeValue('gray.200', 'gray.600')}
            >
              {stepDisplayName} ({deals.length})
            </Heading>
            <VStack spacing={3} align="stretch">
              {deals.map((deal, idx) => (
                <DealCardKanban 
                  key={deal.id} 
                  deal={deal} 
                  index={idx}
                />
              ))}
              {/* @ts-ignore TS2786: 'Droppable' cannot be used as a JSX component. TODO: Investigate if @hello-pangea/dnd types are correctly installed/imported - Already present */}
              {/* Placeholder type issue with dnd library and ReactNode/bigint compatibility is acknowledged */}
              {provided.placeholder as any} 
              {deals.length === 0 && !snapshot.isDraggingOver && (
                  <Text fontSize="sm" color={placeholderTextColor} textAlign="center" mt={4} p={2}>
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

// Add display name for better debugging with React.memo
KanbanStepColumn.displayName = 'KanbanStepColumn';

export default KanbanStepColumn; // Renamed export 