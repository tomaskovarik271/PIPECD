/**
 * Agent Page - Main page for AI agent interactions
 */

import React from 'react';
import { Box } from '@chakra-ui/react';
import { AIAgentChat } from '../components/agent/AIAgentChat';

const AgentPage: React.FC = () => {
  return (
    <Box h="100vh" overflow="hidden">
      <AIAgentChat />
    </Box>
  );
};

export default AgentPage; 