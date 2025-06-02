/**
 * Agent Page - Main page for AI agent interactions
 */

import React from 'react';
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, Button, VStack } from '@chakra-ui/react';
import { AIAgentChat } from '../components/agent/AIAgentChat';

// Error Boundary Component
class AgentErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AI Agent Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box h="100vh" display="flex" alignItems="center" justifyContent="center" p={6}>
          <VStack spacing={4} maxW="md">
            <Alert status="error">
              <AlertIcon />
              <Box>
                <AlertTitle>AI Assistant Error</AlertTitle>
                <AlertDescription>
                  The AI assistant encountered an error. Please refresh the page to try again.
                </AlertDescription>
              </Box>
            </Alert>
            <Button 
              colorScheme="blue" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

const AgentPage: React.FC = () => {
  return (
    <Box h="100vh" overflow="hidden">
      <AgentErrorBoundary>
        <AIAgentChat />
      </AgentErrorBoundary>
    </Box>
  );
};

export default AgentPage; 