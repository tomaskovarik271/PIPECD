import React, { useState } from 'react';
import {
  HStack,
  Tag,
  TagLabel,
  Tooltip,
  Box,
  VStack,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Badge,
  Wrap,
  WrapItem,
  Portal,
} from '@chakra-ui/react';
import { FiClock, FiAlertTriangle, FiHash, FiTag, FiMoreHorizontal } from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Deal } from '../../stores/useDealsStore';
import { DealLabels } from './DealLabels';

interface ConsolidatedCardIndicatorsProps {
  deal: Deal;
  taskIndicators?: {
    dealId: string;
    tasksDueToday: number;
    tasksOverdue: number;
    totalActiveTasks: number;
  };
  maxVisibleIndicators?: number;
  showProjectId?: boolean;
}

interface IndicatorItem {
  id: string;
  priority: number; // Lower number = higher priority
  element: React.ReactNode;
  category: 'urgent' | 'status' | 'label' | 'metadata';
}

export const ConsolidatedCardIndicators: React.FC<ConsolidatedCardIndicatorsProps> = ({
  deal,
  taskIndicators,
  maxVisibleIndicators = 3,
  showProjectId = true,
}) => {
  const colors = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);

  // Build all possible indicators with priority
  const allIndicators: IndicatorItem[] = [];

  // Priority 1: Urgent task indicators (overdue tasks)
  if (taskIndicators && taskIndicators.tasksOverdue > 0) {
    allIndicators.push({
      id: 'overdue-tasks',
      priority: 1,
      category: 'urgent',
      element: (
        <Tooltip 
          label={`${taskIndicators.tasksOverdue} overdue task${taskIndicators.tasksOverdue > 1 ? 's' : ''}`}
          placement="top"
        >
          <Tag size="sm" colorScheme="red" variant="solid" cursor="help">
            <FiAlertTriangle size={10} style={{ marginRight: '4px' }} />
            <TagLabel>{taskIndicators.tasksOverdue}</TagLabel>
          </Tag>
        </Tooltip>
      ),
    });
  }

  // Priority 2: Tasks due today
  if (taskIndicators && taskIndicators.tasksDueToday > 0) {
    allIndicators.push({
      id: 'due-today-tasks',
      priority: 2,
      category: 'urgent',
      element: (
        <Tooltip 
          label={`${taskIndicators.tasksDueToday} task${taskIndicators.tasksDueToday > 1 ? 's' : ''} due today`}
          placement="top"
        >
          <Tag size="sm" colorScheme="orange" variant="solid" cursor="help">
            <FiClock size={10} style={{ marginRight: '4px' }} />
            <TagLabel>{taskIndicators.tasksDueToday}</TagLabel>
          </Tag>
        </Tooltip>
      ),
    });
  }

  // Priority 3: Primary deal label (most important)
  if (deal.labels && deal.labels.length > 0) {
    const primaryLabel = deal.labels[0];
    allIndicators.push({
      id: 'primary-label',
      priority: 3,
      category: 'label',
      element: (
        <Tag 
          size="sm" 
          bg={primaryLabel.colorHex} 
          color="white"
          variant="solid"
          cursor="help"
        >
          <TagLabel>{primaryLabel.labelText}</TagLabel>
        </Tag>
      ),
    });
  }

  // Priority 4: Project ID
  if (showProjectId && (deal as any).project_id) {
    allIndicators.push({
      id: 'project-id',
      priority: 4,
      category: 'metadata',
      element: (
        <Tooltip label="Project ID" placement="top">
          <Tag size="sm" variant="outline" cursor="help">
            <FiHash size={10} style={{ marginRight: '2px' }} />
            <TagLabel>{(deal as any).project_id}</TagLabel>
          </Tag>
        </Tooltip>
      ),
    });
  }

  // Priority 5: Additional labels (secondary)
  if (deal.labels && deal.labels.length > 1) {
    deal.labels.slice(1, 3).forEach((label, index) => {
      allIndicators.push({
        id: `secondary-label-${index}`,
        priority: 5 + index,
        category: 'label',
        element: (
          <Tag 
            size="sm" 
            bg={label.colorHex} 
            color="white"
            variant="solid"
            cursor="help"
          >
            <TagLabel>{label.labelText}</TagLabel>
          </Tag>
        ),
      });
    });
  }

  // Sort by priority and split into visible and hidden
  const sortedIndicators = allIndicators.sort((a, b) => a.priority - b.priority);
  const visibleIndicators = sortedIndicators.slice(0, maxVisibleIndicators);
  const hiddenIndicators = sortedIndicators.slice(maxVisibleIndicators);

  // Check if we have more indicators to show
  const hasMoreIndicators = hiddenIndicators.length > 0 || (deal.labels && deal.labels.length > 3);

  return (
    <HStack spacing={1} flexWrap="wrap" align="center">
      {/* Always visible indicators */}
      {visibleIndicators.map((indicator) => (
        <Box key={indicator.id}>{indicator.element}</Box>
      ))}

      {/* "More" indicator with popover for additional items */}
      {hasMoreIndicators && (
        <Popover
          isOpen={isExpanded}
          onOpen={() => {
            console.log('🟢 Popover onOpen triggered');
            setIsExpanded(true);
          }}
          onClose={() => {
            console.log('🔴 Popover onClose triggered');
            setIsExpanded(false);
          }}
          placement="top-start"
          closeOnBlur={true}
          gutter={12}
        >
          <PopoverTrigger>
            <Tag 
              size="sm" 
              variant="outline" 
              cursor="pointer"
              title={!isExpanded ? "Click to see all indicators and labels" : ""}
              _hover={{ 
                bg: colors.bg.elevated,
                borderColor: colors.border.accent,
                transform: 'scale(1.05)',
                transition: 'all 0.2s ease'
              }}
              onClick={(e) => {
                console.log('🔍 +X button clicked:', { isExpanded, hasMoreIndicators });
                e.stopPropagation(); // Prevent card navigation
                setIsExpanded(true); // Manually open the popover
              }}
            >
              <FiMoreHorizontal size={12} />
              <TagLabel ml={1}>+{hiddenIndicators.length + Math.max(0, (deal.labels?.length || 0) - 3)}</TagLabel>
            </Tag>
          </PopoverTrigger>
          <Portal>
            <PopoverContent 
              width="280px" 
              bg={colors.bg.elevated}
              borderColor={colors.border.default}
              boxShadow="xl"
              zIndex={9999}
            >
            <PopoverBody p={3}>
              <VStack align="stretch" spacing={3}>
                {/* Hidden priority indicators */}
                {hiddenIndicators.length > 0 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color={colors.text.muted} mb={2}>
                      Priority Indicators
                    </Text>
                    <Wrap spacing={1}>
                      {hiddenIndicators.map((indicator) => (
                        <WrapItem key={indicator.id}>{indicator.element}</WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}

                {/* All labels (if there are more than 3) */}
                {deal.labels && deal.labels.length > 3 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color={colors.text.muted} mb={2}>
                      All Labels ({deal.labels.length})
                    </Text>
                    <DealLabels 
                      labels={deal.labels} 
                      size="sm" 
                      maxVisible={10}
                      isEditable={false}
                    />
                  </Box>
                )}

                {/* Task summary if applicable */}
                {taskIndicators && taskIndicators.totalActiveTasks > 0 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color={colors.text.muted} mb={1}>
                      Task Summary
                    </Text>
                    <VStack align="stretch" spacing={1}>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color={colors.text.secondary}>Total Active:</Text>
                        <Badge colorScheme="blue">{taskIndicators.totalActiveTasks}</Badge>
                      </HStack>
                      {taskIndicators.tasksDueToday > 0 && (
                        <HStack justify="space-between">
                          <Text fontSize="xs" color={colors.text.secondary}>Due Today:</Text>
                          <Badge colorScheme="orange">{taskIndicators.tasksDueToday}</Badge>
                        </HStack>
                      )}
                      {taskIndicators.tasksOverdue > 0 && (
                        <HStack justify="space-between">
                          <Text fontSize="xs" color={colors.text.secondary}>Overdue:</Text>
                          <Badge colorScheme="red">{taskIndicators.tasksOverdue}</Badge>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
      )}
    </HStack>
  );
}; 