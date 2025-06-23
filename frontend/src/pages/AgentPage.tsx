/**
 * Agent Page - Main page for AI agent interactions
 */

import React from 'react';
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, Button, VStack, Text, Spinner } from '@chakra-ui/react';
import { AIAgentChat } from '../components/agent/AIAgentChat';
import { useAppStore } from '../stores/useAppStore';

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
  const { userPermissions, permissionsLoading } = useAppStore();

  // Check if user has admin permissions
  const hasAdminPermissions = userPermissions?.some(permission => 
    permission.includes('admin') || 
    permission.includes('manage') || 
    permission.includes('custom_fields') ||
    permission.includes('wfm') ||
    permission.endsWith(':update_any') ||
    permission.endsWith(':delete_any') ||
    permission.endsWith(':create_any')
  ) || false;

  // Show loading while checking permissions
  if (permissionsLoading) {
    return (
      <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.500">Checking permissions...</Text>
        </VStack>
      </Box>
    );
  }

  // Show access denied for non-admin users
  if (!hasAdminPermissions) {
    return (
      <Box h="100vh" display="flex" alignItems="center" justifyContent="center" p={6}>
        <VStack spacing={4} maxW="md" textAlign="center">
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <AlertTitle>Access Restricted</AlertTitle>
              <AlertDescription>
                The AI Assistant is currently available to administrators only. 
                Please contact your system administrator for access.
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>
      </Box>
    );
  }

  return (
    <Box h="100vh" overflow="hidden">
      <AgentErrorBoundary>
        <AIAgentChat />
      </AgentErrorBoundary>
    </Box>
  );
};

export default AgentPage; 