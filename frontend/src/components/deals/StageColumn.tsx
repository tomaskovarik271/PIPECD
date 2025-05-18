import React from 'react';
import { Box, Heading, Text, VStack, useColorModeValue, useTheme } from '@chakra-ui/react';
import { Stage } from '../../stores/useStagesStore'; // Assuming Stage type is exported from useStagesStore
import { Deal } from '../../stores/useDealsStore';    // Assuming Deal type is exported from useDealsStore
import { Droppable, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd'; // Import Droppable & its types
import DealCardKanban from './DealCardKanban'; // Import the new DealCardKanban component
import { useThemeStore } from '../../stores/useThemeStore'; // Import theme store

interface StageColumnProps {
  stage: Stage;
  deals: Deal[];
  index: number; // Added index prop for Droppable keying or other uses
}

const StageColumn: React.FC<StageColumnProps> = ({ stage, deals, index }) => {
  const { currentTheme } = useThemeStore();
  const theme = useTheme();

  const defaultScrollbarThumbBg = useColorModeValue('gray.300', 'gray.500');
  const defaultScrollbarTrackBg = useColorModeValue('gray.100', 'gray.600');
  const defaultPlaceholderTextColor = useColorModeValue('gray.400', 'gray.500');
  const defaultColumnBgBase = useColorModeValue('gray.100', 'gray.700');
  const defaultColumnBgHover = useColorModeValue('blue.50', 'blue.800');

  // Warhol-specific dark theme colors
  const warholScrollbarThumbBg = theme.colors.pink[500]; // popPink.500
  const warholScrollbarTrackBg = theme.colors.gray[800]; // darkGray from Warhol theme
  const warholPlaceholderTextColor = theme.colors.gray[200]; // light gray for text
  const warholColumnBgBase = theme.colors.gray[800]; // darkGray (main card bg for Warhol dark)
  const warholColumnBgHover = theme.colors.gray[700]; // slightly lighter dark gray

  const scrollbarThumbBg = currentTheme === 'andyWarhol' ? warholScrollbarThumbBg : defaultScrollbarThumbBg;
  const scrollbarTrackBg = currentTheme === 'andyWarhol' ? warholScrollbarTrackBg : defaultScrollbarTrackBg;
  const placeholderTextColor = currentTheme === 'andyWarhol' ? warholPlaceholderTextColor : defaultPlaceholderTextColor;
  const columnBgBase = currentTheme === 'andyWarhol' ? warholColumnBgBase : defaultColumnBgBase;
  const columnBgHover = currentTheme === 'andyWarhol' ? warholColumnBgHover : defaultColumnBgHover;
  
  const columnHeaderText = useColorModeValue(
    theme.colors.gray[900], // Default light mode: black
    currentTheme === 'andyWarhol' ? theme.colors.yellow[500] : theme.colors.gray[50] // Warhol dark: popYellow, Default dark: white
  );

  return (
    // @ts-ignore TS2786: 'Droppable' cannot be used as a JSX component.
    <Droppable droppableId={stage.id} type="DEAL">
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
        const currentColumnBg = snapshot.isDraggingOver ? columnBgHover : columnBgBase;
        return (
          <Box
            {...provided.droppableProps}
            ref={provided.innerRef}
            minWidth="300px"
            maxWidth="350px"
            p={4}
            m={2} // Added margin for spacing between columns
            bg={currentColumnBg} // Applied theme-aware background
            borderRadius="md"
            boxShadow="sm"
            flexShrink={0} // Prevent columns from shrinking too much
            height="fit-content" // Ensure column height adjusts to content or a max-height
            maxHeight="calc(100vh - 250px)" // Example max height, adjust as needed
            overflowY="auto" // Allow vertical scrolling for deals within a column
            sx={{ // Renamed from css to sx for consistency with Chakra props
                '&::-webkit-scrollbar': {
                    width: '8px', // Slightly wider for pop effect
                },
                '&::-webkit-scrollbar-thumb': {
                    background: scrollbarThumbBg, 
                    borderRadius: '8px',
                    border: currentTheme === 'andyWarhol' ? `2px solid ${theme.colors.black}` : 'none', // Black border for Warhol thumb
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
              color={columnHeaderText} // Apply dynamic header text color
              borderColor={currentTheme === 'andyWarhol' ? theme.colors.yellow[500] : useColorModeValue('gray.200', 'gray.600')} // Warhol: Yellow border
            >
              {stage.name} ({deals.length})
            </Heading>
            <VStack spacing={3} align="stretch" /* minHeight for VStack might not be needed if Box has maxHeight */ >
              {deals.map((deal, idx) => (
                <DealCardKanban 
                  key={deal.id} 
                  deal={deal} 
                  index={idx} // Use idx from map for Draggable index
                />
              ))}
              // @ts-ignore TS2322: react-beautiful-dnd placeholder type issue
              {provided.placeholder}
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
};

export default StageColumn; 