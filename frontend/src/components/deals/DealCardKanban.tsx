import React from 'react';
import { Box, Text, VStack, Heading, Tooltip, useColorModeValue, useTheme } from '@chakra-ui/react';
import { Deal } from '../../stores/useDealsStore';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd'; // Import Draggable & its types
import { Link as RouterLink } from 'react-router-dom'; // Import Link
import { useThemeStore } from '../../stores/useThemeStore'; // Import theme store

interface DealCardKanbanProps {
  deal: Deal;
  index: number; // Required by react-beautiful-dnd for Draggable
}

const DealCardKanban: React.FC<DealCardKanbanProps> = ({ deal, index }) => {
  const { currentTheme } = useThemeStore();
  const theme = useTheme();

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

  // Default Theme-aware colors
  const defaultCardBgBase = useColorModeValue('white', 'gray.800');
  const defaultCardBgDragging = useColorModeValue('green.50', 'green.800');
  const defaultCardBorderColor = useColorModeValue('gray.200', 'gray.600');
  const defaultAmountTextColor = useColorModeValue('gray.700', 'gray.200');
  const defaultSecondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const defaultProbabilityTextColor = useColorModeValue('purple.600', 'purple.300');

  // Warhol-specific dark theme colors
  const warholCardBgBase = theme.colors.gray[900]; // black
  const warholCardBgDragging = theme.colors.blue[800]; // dark popBlue
  const warholCardBorderColor = theme.colors.yellow[500]; // popYellow
  const warholAmountTextColor = theme.colors.gray[50];
  const warholSecondaryTextColor = theme.colors.gray[100];
  const warholProbabilityTextColor = theme.colors.green[500]; // popGreen
  const warholHeadingColor = theme.colors.gray[50];

  const cardBgBase = currentTheme === 'andyWarhol' ? warholCardBgBase : defaultCardBgBase;
  const cardBgDragging = currentTheme === 'andyWarhol' ? warholCardBgDragging : defaultCardBgDragging;
  const cardBorderColor = currentTheme === 'andyWarhol' ? warholCardBorderColor : defaultCardBorderColor;
  const amountTextColor = currentTheme === 'andyWarhol' ? warholAmountTextColor : defaultAmountTextColor;
  const secondaryTextColor = currentTheme === 'andyWarhol' ? warholSecondaryTextColor : defaultSecondaryTextColor;
  const probabilityTextColor = currentTheme === 'andyWarhol' ? warholProbabilityTextColor : defaultProbabilityTextColor;
  
  // Call useColorModeValue at the top level for headingColor
  const defaultHeadingColor = useColorModeValue(theme.colors.gray[900], theme.colors.gray[50]);
  const headingColor = currentTheme === 'andyWarhol' ? warholHeadingColor : defaultHeadingColor;

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => ( // Add types to provided and snapshot
        <Box
          ref={provided.innerRef} // Connect ref
          {...provided.draggableProps} // Spread draggable props
          {...provided.dragHandleProps} // Spread drag handle props
          p={3}
          bg={snapshot.isDragging ? cardBgDragging : cardBgBase} // Change bg based on dragging state
          borderRadius="md"
          boxShadow={snapshot.isDragging ? "xl" : "sm"} // Enhance shadow when dragging
          borderWidth="1px"
          borderColor={cardBorderColor}
          style={{ 
            ...provided.draggableProps.style, // Important for D&D positioning
            // userSelect: "none", // Prevent text selection during drag (optional)
          }}
          mb={3} // Margin between cards
        >
          <VStack align="stretch" spacing={1}>
            <Tooltip label={deal.name} placement="top" openDelay={500}>
                <RouterLink to={`/deals/${deal.id}`} style={{ textDecoration: 'none', display: 'block', color: 'inherit' }}>
                    <Heading size="xs" isTruncated _hover={{ textDecoration: 'underline' }} color={headingColor}>{deal.name}</Heading>
                </RouterLink>
            </Tooltip>
            <Text fontSize="sm" color={amountTextColor}>
              {deal.amount ? 
                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.amount) 
                : 'No amount'}
            </Text>
            {deal.person && (
              <Text fontSize="xs" color={secondaryTextColor} isTruncated>
                Person: {deal.person.first_name || ''} {deal.person.last_name || ''}
              </Text>
            )}
            {deal.organization && (
              <Text fontSize="xs" color={secondaryTextColor} isTruncated>
                Org: {deal.organization.name}
              </Text>
            )}
            <Text fontSize="xs" color={probabilityTextColor}>
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