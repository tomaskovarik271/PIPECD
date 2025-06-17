import React from 'react';
import {
  Badge,
  HStack,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import { FiClock, FiAlertCircle } from 'react-icons/fi';
import { DealActivityIndicators } from '../../utils/activityIndicators';

interface ActivityIndicatorProps {
  indicators: DealActivityIndicators;
  variant?: 'default' | 'compact';
}

export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({ 
  indicators, 
  variant = 'default' 
}) => {
  if (!indicators.hasUrgentActivities) {
    return null;
  }

  const isCompact = variant === 'compact';

  return (
    <HStack spacing={1} flexShrink={0}>
      {indicators.overdueCount > 0 && (
        <Tooltip 
          label={`${indicators.overdueCount} overdue activit${indicators.overdueCount === 1 ? 'y' : 'ies'}`}
          placement="top"
        >
          <Badge
            colorScheme="red"
            variant="solid"
            fontSize={isCompact ? "2xs" : "xs"}
            display="flex"
            alignItems="center"
            gap={1}
            px={isCompact ? 1.5 : 2}
            py={isCompact ? 0.5 : 1}
            borderRadius="md"
            fontWeight="semibold"
          >
            <Icon as={FiAlertCircle} boxSize={isCompact ? "10px" : "12px"} />
            {indicators.overdueCount}
          </Badge>
        </Tooltip>
      )}
      
      {indicators.dueTodayCount > 0 && (
        <Tooltip 
          label={`${indicators.dueTodayCount} activit${indicators.dueTodayCount === 1 ? 'y' : 'ies'} due today`}
          placement="top"
        >
          <Badge
            colorScheme="orange"
            variant="solid"
            fontSize={isCompact ? "2xs" : "xs"}
            display="flex"
            alignItems="center"
            gap={1}
            px={isCompact ? 1.5 : 2}
            py={isCompact ? 0.5 : 1}
            borderRadius="md"
            fontWeight="semibold"
          >
            <Icon as={FiClock} boxSize={isCompact ? "10px" : "12px"} />
            {indicators.dueTodayCount}
          </Badge>
        </Tooltip>
      )}
    </HStack>
  );
}; 