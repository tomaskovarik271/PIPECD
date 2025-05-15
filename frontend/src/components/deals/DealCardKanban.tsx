import React from 'react';
import { Box, Text, VStack, Heading, Tooltip } from '@chakra-ui/react';
import { Deal } from '../../stores/useDealsStore';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd'; // Import Draggable & its types
import { Link as RouterLink } from 'react-router-dom'; // Import Link

interface DealCardKanbanProps {
  deal: Deal;
  index: number; // Required by react-beautiful-dnd for Draggable
}

const DealCardKanban: React.FC<DealCardKanbanProps> = ({ deal, index }) => {
  // Function to calculate effective probability for display (can be expanded)
  const getEffectiveProbabilityDisplay = () => {
    let probability = deal.deal_specific_probability;
    let source = 'deal';
    if (probability == null && deal.stage?.deal_probability != null) {
      probability = deal.stage.deal_probability;
      source = 'stage';
    }
    if (probability == null) return 'N/A';
    return `${Math.round(probability * 100)}% (${source})`;
  };

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => ( // Add types to provided and snapshot
        <Box
          ref={provided.innerRef} // Connect ref
          {...provided.draggableProps} // Spread draggable props
          {...provided.dragHandleProps} // Spread drag handle props
          p={3}
          bg={snapshot.isDragging ? 'green.50' : 'white'} // Change bg based on dragging state
          borderRadius="md"
          boxShadow={snapshot.isDragging ? "xl" : "sm"} // Enhance shadow when dragging
          borderWidth="1px"
          borderColor="gray.200"
          style={{ 
            ...provided.draggableProps.style, // Important for D&D positioning
            // userSelect: "none", // Prevent text selection during drag (optional)
          }}
          mb={3} // Margin between cards
        >
          <VStack align="stretch" spacing={1}>
            <Tooltip label={deal.name} placement="top" openDelay={500}>
                <RouterLink to={`/deals/${deal.id}`} style={{ textDecoration: 'none', display: 'block', color: 'inherit' }}>
                    <Heading size="xs" isTruncated _hover={{ textDecoration: 'underline' }}>{deal.name}</Heading>
                </RouterLink>
            </Tooltip>
            <Text fontSize="sm" color="gray.700">
              {deal.amount ? 
                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.amount) 
                : 'No amount'}
            </Text>
            {deal.person && (
              <Text fontSize="xs" color="gray.500" isTruncated>
                Person: {deal.person.first_name || ''} {deal.person.last_name || ''}
              </Text>
            )}
            {deal.organization && (
              <Text fontSize="xs" color="gray.500" isTruncated>
                Org: {deal.organization.name}
              </Text>
            )}
            <Text fontSize="xs" color="purple.600">
                Prob: {getEffectiveProbabilityDisplay()}
            </Text>
            {/* Add more compact deal info as needed */}
          </VStack>
        </Box>
      )}
    </Draggable>
  );
};

export default DealCardKanban; 