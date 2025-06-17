import React from 'react';
import {
  Badge,
  HStack,
  Tooltip,
  Icon,
  Box,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiClock, FiAlertCircle } from 'react-icons/fi';
import { DealActivityIndicators } from '../../utils/activityIndicators';

// Pulse animation for urgent indicators
const pulseKeyframes = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

const glowKeyframes = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(251, 146, 60, 0.5); }
  70% { box-shadow: 0 0 0 3px rgba(251, 146, 60, 0); }
  100% { box-shadow: 0 0 0 0 rgba(251, 146, 60, 0); }
`;

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
          label={`🚨 URGENT: ${indicators.overdueCount} overdue activit${indicators.overdueCount === 1 ? 'y' : 'ies'} - Action required!`}
          placement="top"
          bg="red.600"
          color="white"
          fontSize="sm"
          fontWeight="medium"
          hasArrow
        >
          <Box
            as={Badge}
            colorScheme="red"
            variant="solid"
            fontSize={isCompact ? "2xs" : "xs"}
            display="flex"
            alignItems="center"
            gap={1}
            px={isCompact ? 1.5 : 2.5}
            py={isCompact ? 1 : 1.5}
            borderRadius="full"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="wide"
            cursor="pointer"
            position="relative"
            animation={`${pulseKeyframes} 2s infinite`}
            bg="red.500"
            color="white"
            border="2px solid"
            borderColor="red.600"
            _hover={{
              bg: "red.600",
              transform: "scale(1.05)",
              transition: "all 0.2s ease"
            }}
          >
            <Icon as={FiAlertCircle} boxSize={isCompact ? "10px" : "12px"} />
            {indicators.overdueCount}
          </Box>
        </Tooltip>
      )}
      
      {indicators.dueTodayCount > 0 && (
        <Tooltip 
          label={`⏰ TODAY: ${indicators.dueTodayCount} activit${indicators.dueTodayCount === 1 ? 'y' : 'ies'} due today - Don't forget!`}
          placement="top"
          bg="orange.500"
          color="white"
          fontSize="sm"
          fontWeight="medium"
          hasArrow
        >
          <Box
            as={Badge}
            colorScheme="orange"
            variant="solid"
            fontSize={isCompact ? "2xs" : "xs"}
            display="flex"
            alignItems="center"
            gap={1}
            px={isCompact ? 1.5 : 2.5}
            py={isCompact ? 1 : 1.5}
            borderRadius="full"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="wide"
            cursor="pointer"
            position="relative"
            animation={`${glowKeyframes} 3s infinite`}
            bg="orange.400"
            color="white"
            border="2px solid"
            borderColor="orange.500"
            _hover={{
              bg: "orange.500",
              transform: "scale(1.05)",
              transition: "all 0.2s ease"
            }}
          >
            <Icon as={FiClock} boxSize={isCompact ? "10px" : "12px"} />
            {indicators.dueTodayCount}
          </Box>
        </Tooltip>
      )}
    </HStack>
  );
}; 