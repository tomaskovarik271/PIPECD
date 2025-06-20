/**
 * AI Agent V2 Health Monitoring Admin Page
 * Provides comprehensive monitoring and diagnostics for the AI Agent V2 system
 */

import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { useThemeColors } from '../../hooks/useThemeColors';
import { AgentHealthDashboard } from '../../components/admin/AgentHealthDashboard';

export const AgentHealthPage: React.FC = () => {
  const colors = useThemeColors();

  return (
    <Box p={6} bg={colors.bg.app} minH="100vh">
      <Box mb={6}>
        <Heading size="xl" color={colors.text} mb={2}>
          AI Agent V2 Health Monitoring
        </Heading>
        <Text color={colors.textSecondary} fontSize="lg">
          Comprehensive system monitoring, security hardening status, and performance analytics
        </Text>
      </Box>
      
      <AgentHealthDashboard />
    </Box>
  );
}; 