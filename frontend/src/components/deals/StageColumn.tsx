import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { Stage } from '../../stores/useStagesStore'; // Assuming Stage type is exported from useStagesStore
import { Deal } from '../../stores/useDealsStore';    // Assuming Deal type is exported from useDealsStore
import { Droppable, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd'; // Import Droppable & its types
import DealCardKanban from './DealCardKanban'; // Import the new DealCardKanban component

interface StageColumnProps {
  stage: Stage;
  deals: Deal[];
  index: number; // Added index prop for Droppable keying or other uses
}

const StageColumn: React.FC<StageColumnProps> = ({ stage, deals, index }) => {
  return (
    <Droppable droppableId={stage.id} type="DEAL">
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
        <Box
          {...provided.droppableProps}
          ref={provided.innerRef}
          minWidth="300px"
          maxWidth="350px"
          p={4}
          m={2} // Added margin for spacing between columns
          bg={snapshot.isDraggingOver ? 'blue.50' : 'gray.100'} // Change bg based on dragging over
          borderRadius="md"
          boxShadow="sm"
          flexShrink={0} // Prevent columns from shrinking too much
          height="fit-content" // Ensure column height adjusts to content or a max-height
          maxHeight="calc(100vh - 250px)" // Example max height, adjust as needed
          overflowY="auto" // Allow vertical scrolling for deals within a column
          css={{ // Custom scrollbar styling (optional)
              '&::-webkit-scrollbar': {
                  width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                  background: 'gray.300',
                  borderRadius: '6px',
              },
              '&::-webkit-scrollbar-track': {
                  background: 'gray.100',
              },
          }}
        >
          <Heading size="sm" mb={3} borderBottomWidth="1px" pb={2} position="sticky" top={0} bg={snapshot.isDraggingOver ? 'blue.50' : 'gray.100'} zIndex={1}>
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
            {provided.placeholder} 
            {deals.length === 0 && !snapshot.isDraggingOver && (
                <Text fontSize="sm" color="gray.400" textAlign="center" mt={4} p={2}>
                    Drag deals here or create new ones.
                </Text>
            )}
          </VStack>
        </Box>
      )}
    </Droppable>
  );
};

export default StageColumn; 