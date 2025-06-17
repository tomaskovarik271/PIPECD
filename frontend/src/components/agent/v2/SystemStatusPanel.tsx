import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  Icon,
  Progress,
  Divider
} from '@chakra-ui/react';
import {
  FiCheck,
  FiX,
  FiClock,
  FiZap,
  FiDatabase,
  FiCloud,
  FiCpu
} from 'react-icons/fi';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface Props {
  isConnected: boolean;
  systemHealth: 'healthy' | 'degraded' | 'offline';
}

interface SystemMetric {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'error';
  icon: any;
}

export const SystemStatusPanel: React.FC<Props> = ({ isConnected, systemHealth }) => {
  const colors = useThemeColors();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const metrics: SystemMetric[] = [
    {
      label: 'Response Time',
      value: '< 3s',
      status: 'good',
      icon: FiZap
    },
    {
      label: 'GraphQL API',
      value: isConnected ? 'Connected' : 'Offline',
      status: isConnected ? 'good' : 'error',
      icon: FiDatabase
    },
    {
      label: 'Claude API',
      value: 'Active',
      status: 'good',
      icon: FiCpu
    },
    {
      label: 'Tools Available',
      value: '10/10',
      status: 'good',
      icon: FiCheck
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'green.500';
      case 'warning':
        return 'orange.500';
      case 'error':
        return 'red.500';
      default:
        return 'gray.500';
    }
  };

  const getHealthBadgeColor = () => {
    switch (systemHealth) {
      case 'healthy':
        return 'green';
      case 'degraded':
        return 'orange';
      case 'offline':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box
      bg={cardBg}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      p={6}
      shadow="lg"
      w="full"
    >
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="medium" color={colors.text.primary}>
            System Status
          </Text>
          <Badge
            colorScheme={getHealthBadgeColor()}
            variant="solid"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
          >
            {systemHealth.toUpperCase()}
          </Badge>
        </HStack>

        <Divider />

        {/* Metrics */}
        <VStack spacing={3} align="stretch">
          {metrics.map((metric, index) => (
            <HStack key={index} justify="space-between">
              <HStack spacing={2}>
                <Icon
                  as={metric.icon}
                  color={getStatusColor(metric.status)}
                  size={16}
                />
                <Text fontSize="sm" color={colors.text.secondary}>
                  {metric.label}
                </Text>
              </HStack>
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={getStatusColor(metric.status)}
              >
                {metric.value}
              </Text>
            </HStack>
          ))}
        </VStack>

        <Divider />

        {/* Performance Indicator */}
        <VStack spacing={2} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="sm" color={colors.text.secondary}>
              Performance
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="green.500">
              Optimal
            </Text>
          </HStack>
          <Progress
            value={95}
            size="sm"
            colorScheme="green"
            borderRadius="full"
            bg={useColorModeValue('gray.200', 'gray.700')}
          />
        </VStack>

        {/* Capabilities */}
        <VStack spacing={2} align="stretch">
          <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
            Capabilities
          </Text>
          <VStack spacing={1} align="stretch">
            {[
              'Advanced Reasoning',
              'Real-time Data Access',
              'Multi-step Workflows',
              'Error Recovery',
              'Context Preservation'
            ].map((capability, index) => (
              <HStack key={index} spacing={2}>
                <Icon as={FiCheck} color="green.500" size={12} />
                <Text fontSize="xs" color={colors.text.secondary}>
                  {capability}
                </Text>
              </HStack>
            ))}
          </VStack>
        </VStack>

        {/* Last Update */}
        <HStack spacing={2} justify="center" pt={2}>
          <Icon as={FiClock} size={12} color={colors.text.secondary} />
          <Text fontSize="xs" color={colors.text.secondary}>
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}; 