import React from 'react';
import {
  Box,
  Text,
  VStack,
  Heading,
  Tooltip,
  Badge,
  Icon,
  HStack,
  Flex,
  Spacer,
  Progress,
  Avatar,
  Tag,
} from '@chakra-ui/react';
import { Deal } from '../../stores/useDealsStore';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { Link as RouterLink } from 'react-router-dom';
import { useThemeStore } from '../../stores/useThemeStore';
import { TimeIcon, ExternalLinkIcon, EditIcon, ViewIcon as EyeIcon } from '@chakra-ui/icons';
import { differenceInDays, formatDistanceToNowStrict, isPast, format } from 'date-fns';

interface DealCardKanbanProps {
  deal: Deal;
  index: number;
}

const DealCardKanban: React.FC<DealCardKanbanProps> = React.memo(({ deal, index }) => {
  const { currentTheme: currentThemeName } = useThemeStore();
  const isModernTheme = currentThemeName === 'modern';

  const placeholderTags = [deal.currentWfmStep?.status?.name].filter(Boolean) as string[];
  if (deal.amount && deal.amount > 50000) placeholderTags.push('High Value');

  const getEffectiveProbability = () => {
    if (deal.deal_specific_probability != null) return deal.deal_specific_probability;
    if (deal.currentWfmStep?.metadata && typeof deal.currentWfmStep.metadata === 'object' && 'deal_probability' in deal.currentWfmStep.metadata) {
      const stepProbability = (deal.currentWfmStep.metadata as { deal_probability?: number }).deal_probability;
      if (stepProbability != null) return stepProbability;
    }
    return 0;
  };
  const probabilityValue = getEffectiveProbability() * 100;

  const expectedCloseDate = deal.expected_close_date ? new Date(deal.expected_close_date) : null;
  let dueDateStatus = "";
  let dueDateColor = "text.muted";
  if (expectedCloseDate) {
    if (isPast(expectedCloseDate)) {
      dueDateStatus = `${formatDistanceToNowStrict(expectedCloseDate, { addSuffix: true })} overdue`;
      dueDateColor = "accent.danger";
    } else {
      dueDateStatus = `Due in ${formatDistanceToNowStrict(expectedCloseDate)}`;
    }
  }

  // Determine base and dragging styles based on theme
  let baseStyle: any;
  let draggingStyle: any;

  if (isModernTheme) {
    baseStyle = {
      bg: "gray.700",
      p: 5,
      borderRadius: "lg",
      border: "1px solid",
      borderColor: "gray.500",
      transition: "all 0.2s ease-in-out",
      _hover: {
        borderColor: "blue.400",
        transform: "translateY(-2px)",
        boxShadow: "lg"
      }
    };
    draggingStyle = {
      ...baseStyle,
      borderColor: "blue.500",
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-2px) rotate(1deg)',
    };
  } else {
    // Original styles for other themes
    baseStyle = {
      p: 3,
      bg: 'gray.50',
      borderRadius: "md",
      boxShadow: "sm",
      borderWidth: "1px",
      borderColor: "gray.200",
      _dark: {
        bg: 'gray.700',
        borderColor: "gray.600"
      }
    };
    draggingStyle = {
      ...baseStyle,
      bg: 'blue.50', _dark: { bg: 'blue.800' },
      boxShadow: "xl",
    };
  }

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          mb={isModernTheme ? 4 : 3}
          {...(snapshot.isDragging ? draggingStyle : baseStyle)}
          position="relative"
        >
          {isModernTheme ? (
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between" mb={2}>
                <VStack align="start" spacing={0.5}>
                  <RouterLink to={`/deals/${deal.id}`} style={{ textDecoration: 'none' }}>
                    <Text fontWeight="bold" color="white" noOfLines={2} _hover={{ color: 'blue.300' }} fontSize="md">
                      {deal.name}
                    </Text>
                  </RouterLink>
                  <Text fontSize="sm" color="gray.400" noOfLines={1}>
                    {deal.organization?.name || '-'}
                  </Text>
                </VStack>
                <Text fontSize="lg" fontWeight="bold" color="green.300">
                  {deal.amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits:0, maximumFractionDigits:0 }).format(deal.amount) : '-'}
                </Text>
              </HStack>

              <Box mb={2}>
                <Progress 
                  value={probabilityValue}
                  size="sm" 
                  colorScheme="blue" 
                  bg="gray.600"
                  borderRadius="full"
                />
                <Text fontSize="xs" color="blue.200" mt={1} textAlign="right">
                  {probabilityValue.toFixed(0)}% probability
                </Text>
              </Box>

              <HStack justify="space-between" borderTopWidth="1px" borderColor="gray.600" pt={2} mt="auto">
                <HStack spacing={1.5}>
                  <Avatar 
                    size="xs" 
                    name={deal.assignedToUser?.display_name || 'Unassigned'} 
                    src={deal.assignedToUser?.avatar_url || undefined}
                    bg="gray.500"
                  />
                  <Text fontSize="xs" color="gray.300" noOfLines={1}>
                    {deal.assignedToUser?.display_name || 'Unassigned'}
                  </Text>
                </HStack>
                <Text fontSize="xs" color={dueDateColor === "accent.danger" ? "red.400" : "gray.300"} textAlign="right">
                  {expectedCloseDate ? dueDateStatus : 'No due date'}
                </Text>
              </HStack>
            </VStack>
          ) : (
            <VStack align="stretch" spacing={1}>
              <RouterLink to={`/deals/${deal.id}`} style={{ textDecoration: 'none' }}><Heading size="xs" isTruncated>{deal.name}</Heading></RouterLink>
              <Text fontSize="sm">{deal.amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.amount) : 'No amount'}</Text>
              {deal.person && <Text fontSize="xs" color="gray.500">Person: {deal.person.first_name} {deal.person.last_name}</Text>}
              {deal.organization && <Text fontSize="xs" color="gray.500">Org: {deal.organization.name}</Text>}
              {deal.assignedToUser && <Text fontSize="xs" color="gray.600">Owner: {deal.assignedToUser.display_name}</Text>}
              <Text fontSize="xs" color="purple.500">Prob: {probabilityValue.toFixed(0)}%</Text>
            </VStack>
          )}
        </Box>
      )}
    </Draggable>
  );
});

DealCardKanban.displayName = 'DealCardKanban';
export default DealCardKanban; 