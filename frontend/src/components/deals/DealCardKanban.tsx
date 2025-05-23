import React from 'react';
import { Box, Text, VStack, Heading, Tooltip, useColorModeValue, useTheme, Badge, Icon, HStack, Flex } from '@chakra-ui/react';
import { Deal } from '../../stores/useDealsStore';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd'; // Import Draggable & its types
import { Link as RouterLink } from 'react-router-dom'; // Import Link
import { useThemeStore } from '../../stores/useThemeStore'; // Import theme store
import { TimeIcon, CheckCircleIcon } from '@chakra-ui/icons'; // Added icons
import { ActivityType } from '../../generated/graphql/graphql'; // Import ActivityType enum if needed for specific icons

interface DealCardKanbanProps {
  deal: Deal;
  index: number; // Required by react-beautiful-dnd for Draggable
}

const DealCardKanban: React.FC<DealCardKanbanProps> = ({ deal, index }) => {
  const { currentTheme } = useThemeStore();
  const theme = useTheme();

  // Function to calculate effective probability for display
  const getEffectiveProbabilityDisplay = () => {
    let probability = deal.deal_specific_probability;
    let source = 'manual'; // Or 'override' if it's a direct setting

    if (probability == null) {
      // Check WFM step metadata for probability
      // Ensure currentWfmStep and its metadata exist, and metadata is an object
      if (deal.currentWfmStep && 
          deal.currentWfmStep.metadata && 
          typeof deal.currentWfmStep.metadata === 'object' && 
          'deal_probability' in deal.currentWfmStep.metadata) {
        // Assuming deal_probability in metadata is a number (0 to 1)
        const stepProbability = (deal.currentWfmStep.metadata as { deal_probability?: number }).deal_probability;
        if (stepProbability != null) {
          probability = stepProbability;
          source = 'step';
        }
      }
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
  const activityIconColor = useColorModeValue('gray.600', 'gray.300');
  const warholActivityIconColor = theme.colors.cyan[400]; // Example for Warhol
  const finalActivityIconColor = currentTheme === 'andyWarhol' ? warholActivityIconColor : activityIconColor;

  const cardBgBase = currentTheme === 'andyWarhol' ? warholCardBgBase : defaultCardBgBase;
  const cardBgDragging = currentTheme === 'andyWarhol' ? warholCardBgDragging : defaultCardBgDragging;
  const cardBorderColor = currentTheme === 'andyWarhol' ? warholCardBorderColor : defaultCardBorderColor;
  const amountTextColor = currentTheme === 'andyWarhol' ? warholAmountTextColor : defaultAmountTextColor;
  const secondaryTextColor = currentTheme === 'andyWarhol' ? warholSecondaryTextColor : defaultSecondaryTextColor;
  const probabilityTextColor = currentTheme === 'andyWarhol' ? warholProbabilityTextColor : defaultProbabilityTextColor;
  const headingColor = currentTheme === 'andyWarhol' ? warholHeadingColor : useColorModeValue(theme.colors.gray[900], theme.colors.gray[50]);

  // Process activities
  const openActivities = deal.activities?.filter(a => !a.is_done) || [];
  const nextOpenActivity = openActivities
    .filter(a => a.due_date) // Only consider activities with a due date
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0];

  const getIconForActivityType = (activityType?: ActivityType | null) => {
    // Placeholder for more specific icons based on activity.type if desired
    // For now, using TimeIcon for open and CheckCircleIcon for general idea
    return TimeIcon; 
  };

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
            
            {/* Activities Section */}
            {deal.activities && deal.activities.length > 0 && (
              <Box mt={2} pt={1} borderTopWidth="1px" borderColor={cardBorderColor}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs" fontWeight="medium" color={secondaryTextColor}>Activities</Text>
                  {openActivities.length > 0 && (
                    <Badge colorScheme="orange" size="sm">{openActivities.length} open</Badge>
                  )}
                  {openActivities.length === 0 && deal.activities.length > 0 && (
                     <Badge colorScheme="green" size="sm">All done</Badge>
                  )}
                </HStack>
                {nextOpenActivity && (
                  <Tooltip label={`Due: ${new Date(nextOpenActivity.due_date!).toLocaleDateString()} - ${nextOpenActivity.type}`} placement="bottom-start" openDelay={300}>
                    <RouterLink to={`/activities/${nextOpenActivity.id}`} style={{ textDecoration: 'none', display: 'block', color: 'inherit' }}>
                      <Flex alignItems="center" mt={1} _hover={{ textDecoration: 'underline' }}>
                        <Icon as={getIconForActivityType(nextOpenActivity.type)} color={finalActivityIconColor} w={3} h={3} mr={1.5} />
                        <Text fontSize="xs" color={secondaryTextColor} isTruncated>
                          {nextOpenActivity.subject}
                        </Text>
                      </Flex>
                    </RouterLink>
                  </Tooltip>
                )}
                {openActivities.length > 0 && !nextOpenActivity && openActivities[0] && (
                  // Show first open activity if no 'nextOpenActivity' with a due date was found
                  <RouterLink to={`/activities/${openActivities[0].id}`} style={{ textDecoration: 'none', display: 'block', color: 'inherit' }}>
                    <Flex alignItems="center" mt={1} _hover={{ textDecoration: 'underline' }}>
                      <Icon as={getIconForActivityType(openActivities[0].type)} color={finalActivityIconColor} w={3} h={3} mr={1.5} />
                      <Text fontSize="xs" color={secondaryTextColor} isTruncated>
                        {openActivities[0].subject} (No due date)
                      </Text>
                    </Flex>
                  </RouterLink>
                )}
              </Box>
            )}
            {/* End Activities Section */}

          </VStack>
        </Box>
      )}
    </Draggable>
  );
};

export default DealCardKanban; 