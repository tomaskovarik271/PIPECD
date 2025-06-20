/**
 * AI Agent V2 Health Monitoring Dashboard
 * Provides comprehensive real-time monitoring and diagnostics
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardBody,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Flex,
  Spinner,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import { RefreshCw, Activity, Shield, Database, Clock, AlertTriangle } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { useThemeColors } from '../../hooks/useThemeColors';
import { GET_AGENT_V2_HEALTH, GET_AGENT_V2_PERFORMANCE_METRICS } from '../../lib/graphql/agentV2HealthOperations';

interface HealthStatusProps {
  status: 'healthy' | 'degraded' | 'unhealthy';
  agent: {
    version: string;
    status: string;
    lastActivity: string;
  };
  hardening: {
    overallHealth: string;
    metrics: {
      totalExecutions: number;
      successRate: number;
      averageExecutionTime: number;
      circuitBreakersOpen: number;
      rateLimitViolations: number;
    };
    recommendations: string[];
    circuitBreakers: Array<{
      toolName: string;
      failureCount: number;
      lastFailure?: string;
      state: string;
      nextRetryTime?: string;
    }>;
    rateLimits: Array<{
      key: string;
      count: number;
      resetTime: string;
    }>;
  };
  database: {
    status: string;
    latency: number;
  };
  recommendations: string[];
}

interface PerformanceMetricsProps {
  toolMetrics: Array<{
    toolName: string;
    executions: number;
    successes: number;
    averageTime: number;
    successRate: number;
  }>;
  conversationMetrics: {
    totalConversations: number;
    activeConversations: number;
    averageResponseTime: number;
  };
  errorAnalysis: {
    commonErrors: Array<{
      error: string;
      count: number;
    }>;
    errorRate: number;
  };
}

export const AgentHealthDashboard: React.FC = () => {
  const colors = useThemeColors();
  const toast = useToast();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // GraphQL queries for health data
  const {
    data: healthData,
    loading: healthLoading,
    error: healthError,
    refetch: refetchHealth
  } = useQuery<{ getAgentV2Health: HealthStatusProps }>(GET_AGENT_V2_HEALTH, {
    pollInterval: 30000, // Auto-refresh every 30 seconds
    errorPolicy: 'all'
  });

  const {
    data: metricsData,
    loading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery<{ getAgentV2PerformanceMetrics: PerformanceMetricsProps }>(GET_AGENT_V2_PERFORMANCE_METRICS, {
    pollInterval: 30000, // Auto-refresh every 30 seconds
    errorPolicy: 'all'
  });

  const loading = healthLoading || metricsLoading;
  const error = healthError || metricsError;

  const handleManualRefresh = async () => {
    try {
      await Promise.all([refetchHealth(), refetchMetrics()]);
      setLastRefresh(new Date());
      toast({
        title: "Dashboard Refreshed",
        description: "Latest data has been loaded",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Refresh Failed",
        description: "Unable to fetch latest data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'green';
      case 'degraded': return 'yellow';
      case 'unhealthy': return 'red';
      default: return 'gray';
    }
  };

  const getCircuitBreakerStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'closed': return 'green';
      case 'half_open': return 'yellow';
      case 'open': return 'red';
      default: return 'gray';
    }
  };

  if (loading && !healthData && !metricsData) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" color={colors.interactive.default} />
        <Text mt={4} color={colors.text.secondary}>Loading health dashboard...</Text>
      </Box>
    );
  }

  if (error && !healthData && !metricsData) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Unable to load health data!</AlertTitle>
        <AlertDescription>
          {error.message || 'Unknown error occurred while fetching health status'}
        </AlertDescription>
      </Alert>
    );
  }

  const health = healthData?.getAgentV2Health;
  const metrics = metricsData?.getAgentV2PerformanceMetrics;

  return (
    <Box p={6}>
      {/* Header Section */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={colors.text.primary}>
            AI Agent V2 Health Dashboard
          </Heading>
          <Text color={colors.text.secondary} fontSize="sm">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Text>
        </VStack>
        <IconButton
          aria-label="Refresh dashboard"
          icon={<RefreshCw size={16} />}
          onClick={handleManualRefresh}
          isLoading={loading}
          variant="outline"
          size="sm"
        />
      </Flex>

      <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
        {/* System Health Overview */}
        <Card>
          <CardBody>
            <HStack justify="space-between" align="center" mb={4}>
              <HStack>
                <Activity size={20} />
                <Heading size="md">System Health</Heading>
              </HStack>
              {health && (
                <Badge colorScheme={getStatusColor(health.status)} fontSize="sm">
                  {health.status.toUpperCase()}
                </Badge>
              )}
            </HStack>

            {health && (
              <VStack align="stretch" spacing={4}>
                {/* Agent Status */}
                <Box>
                  <Text fontWeight="semibold" mb={2}>Agent Status</Text>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat size="sm">
                      <StatLabel>Version</StatLabel>
                      <StatNumber fontSize="md">{health.agent.version}</StatNumber>
                    </Stat>
                    <Stat size="sm">
                      <StatLabel>Status</StatLabel>
                      <StatNumber fontSize="md">
                        <Badge colorScheme={getStatusColor(health.agent.status)}>
                          {health.agent.status}
                        </Badge>
                      </StatNumber>
                    </Stat>
                  </SimpleGrid>
                  <Text fontSize="sm" color={colors.text.secondary} mt={2}>
                    Last Activity: {health.agent.lastActivity}
                  </Text>
                </Box>

                <Divider />

                {/* Database Health */}
                <Box>
                  <Text fontWeight="semibold" mb={2}>Database</Text>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Status:</Text>
                    <Badge colorScheme={getStatusColor(health.database.status)}>
                      {health.database.status}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between" mt={1}>
                    <Text fontSize="sm">Latency:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {health.database.latency.toFixed(0)}ms
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardBody>
            <HStack justify="space-between" align="center" mb={4}>
              <HStack>
                <Clock size={20} />
                <Heading size="md">Performance</Heading>
              </HStack>
            </HStack>

            {health && (
              <VStack align="stretch" spacing={4}>
                {/* Success Rate */}
                <Box>
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="sm">Success Rate</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {(health.hardening.metrics.successRate * 100).toFixed(1)}%
                    </Text>
                  </Flex>
                  <Progress
                    value={health.hardening.metrics.successRate * 100}
                    colorScheme={health.hardening.metrics.successRate > 0.95 ? 'green' : 
                                health.hardening.metrics.successRate > 0.8 ? 'yellow' : 'red'}
                    size="sm"
                  />
                </Box>

                {/* Response Time */}
                <SimpleGrid columns={2} spacing={4}>
                  <Stat size="sm">
                    <StatLabel>Avg Response Time</StatLabel>
                    <StatNumber fontSize="md">
                      {health.hardening.metrics.averageExecutionTime.toFixed(0)}ms
                    </StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel>Total Executions</StatLabel>
                    <StatNumber fontSize="md">
                      {health.hardening.metrics.totalExecutions.toLocaleString()}
                    </StatNumber>
                  </Stat>
                </SimpleGrid>

                {/* Conversation Stats */}
                {metrics && (
                  <>
                    <Divider />
                    <SimpleGrid columns={2} spacing={4}>
                      <Stat size="sm">
                        <StatLabel>Active Conversations</StatLabel>
                        <StatNumber fontSize="md">
                          {metrics.conversationMetrics.activeConversations}
                        </StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel>Total Conversations</StatLabel>
                        <StatNumber fontSize="md">
                          {metrics.conversationMetrics.totalConversations}
                        </StatNumber>
                      </Stat>
                    </SimpleGrid>
                  </>
                )}
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Security Monitoring */}
        <Card>
          <CardBody>
            <HStack justify="space-between" align="center" mb={4}>
              <HStack>
                <Shield size={20} />
                <Heading size="md">Security & Hardening</Heading>
              </HStack>
              {health && (
                <Badge colorScheme={getStatusColor(health.hardening.overallHealth)} fontSize="sm">
                  {health.hardening.overallHealth.toUpperCase()}
                </Badge>
              )}
            </HStack>

            {health && (
              <VStack align="stretch" spacing={4}>
                {/* Circuit Breakers */}
                <Box>
                  <Text fontWeight="semibold" mb={2}>Circuit Breakers</Text>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Open Breakers:</Text>
                    <Badge
                      colorScheme={health.hardening.metrics.circuitBreakersOpen > 0 ? 'red' : 'green'}
                    >
                      {health.hardening.metrics.circuitBreakersOpen}
                    </Badge>
                  </HStack>
                </Box>

                {/* Rate Limits */}
                <Box>
                  <Text fontWeight="semibold" mb={2}>Rate Limiting</Text>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Violations:</Text>
                    <Badge
                      colorScheme={health.hardening.metrics.rateLimitViolations > 0 ? 'yellow' : 'green'}
                    >
                      {health.hardening.metrics.rateLimitViolations}
                    </Badge>
                  </HStack>
                </Box>

                {/* Error Analysis */}
                {metrics && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Error Analysis</Text>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Error Rate:</Text>
                        <Badge
                          colorScheme={metrics.errorAnalysis.errorRate > 0.1 ? 'red' : 
                                     metrics.errorAnalysis.errorRate > 0.05 ? 'yellow' : 'green'}
                        >
                          {(metrics.errorAnalysis.errorRate * 100).toFixed(2)}%
                        </Badge>
                      </HStack>
                    </Box>
                  </>
                )}
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Tool Performance Analysis */}
        <Card>
          <CardBody>
            <HStack justify="space-between" align="center" mb={4}>
              <HStack>
                <Database size={20} />
                <Heading size="md">Tool Performance</Heading>
              </HStack>
            </HStack>

            {metrics && metrics.toolMetrics.length > 0 ? (
              <Box overflowX="auto">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Tool</Th>
                      <Th isNumeric>Executions</Th>
                      <Th isNumeric>Success Rate</Th>
                      <Th isNumeric>Avg Time</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {metrics.toolMetrics.map((tool, index) => (
                      <Tr key={index}>
                        <Td fontWeight="medium">{tool.toolName}</Td>
                        <Td isNumeric>{tool.executions}</Td>
                        <Td isNumeric>
                          <Badge 
                            colorScheme={tool.successRate > 0.95 ? 'green' : 
                                       tool.successRate > 0.8 ? 'yellow' : 'red'}
                            fontSize="xs"
                          >
                            {(tool.successRate * 100).toFixed(1)}%
                          </Badge>
                        </Td>
                        <Td isNumeric>{tool.averageTime.toFixed(0)}ms</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Text color={colors.text.secondary} fontSize="sm">
                No tool performance data available
              </Text>
            )}
          </CardBody>
        </Card>
      </Grid>

      {/* Recommendations Section */}
      {health && health.recommendations.length > 0 && (
        <Card mt={6}>
          <CardBody>
            <HStack mb={4}>
              <AlertTriangle size={20} />
              <Heading size="md">System Recommendations</Heading>
            </HStack>
            <VStack align="stretch" spacing={2}>
              {health.recommendations.map((recommendation, index) => (
                <Alert key={index} status="info" variant="left-accent">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    {recommendation}
                  </AlertDescription>
                </Alert>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Error Analysis Details */}
      {metrics && metrics.errorAnalysis.commonErrors.length > 0 && (
        <Card mt={6}>
          <CardBody>
            <HStack mb={4}>
              <AlertTriangle size={20} />
              <Heading size="md">Common Errors</Heading>
            </HStack>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Error</Th>
                    <Th isNumeric>Count</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {metrics.errorAnalysis.commonErrors.map((error, index) => (
                    <Tr key={index}>
                      <Td fontFamily="mono" fontSize="xs">{error.error}</Td>
                      <Td isNumeric>{error.count}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      )}
    </Box>
  );
}; 