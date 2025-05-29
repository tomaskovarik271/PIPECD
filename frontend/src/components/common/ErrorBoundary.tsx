import React, { Component, ReactNode } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    // e.g., Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onRetry: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, onRetry }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box 
      p={6} 
      maxW="600px" 
      mx="auto" 
      mt={8}
      borderRadius="lg"
      bg="red.50"
      border="1px solid"
      borderColor="red.200"
    >
      <VStack spacing={4} align="stretch">
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <AlertTitle>Something went wrong!</AlertTitle>
            <AlertDescription>
              An unexpected error occurred. You can try refreshing the page or contact support if the problem persists.
            </AlertDescription>
          </VStack>
        </Alert>

        <VStack spacing={3}>
          <Button
            colorScheme="blue"
            onClick={onRetry}
            size="md"
          >
            Try Again
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>

          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              leftIcon={<WarningIcon />}
            >
              {isOpen ? 'Hide' : 'Show'} Error Details
            </Button>
          )}
        </VStack>

        {process.env.NODE_ENV === 'development' && (
          <Collapse in={isOpen}>
            <VStack spacing={3} align="stretch">
              {error && (
                <Box>
                  <Heading size="sm" mb={2} color="red.600">
                    Error Message:
                  </Heading>
                  <Code 
                    p={3} 
                    borderRadius="md" 
                    bg="gray.100" 
                    color="red.600"
                    whiteSpace="pre-wrap"
                    fontSize="sm"
                    display="block"
                  >
                    {error.message}
                  </Code>
                </Box>
              )}

              {error?.stack && (
                <Box>
                  <Heading size="sm" mb={2} color="red.600">
                    Stack Trace:
                  </Heading>
                  <Code 
                    p={3} 
                    borderRadius="md" 
                    bg="gray.100" 
                    color="gray.700"
                    whiteSpace="pre-wrap"
                    fontSize="xs"
                    display="block"
                    maxH="200px"
                    overflowY="auto"
                  >
                    {error.stack}
                  </Code>
                </Box>
              )}

              {errorInfo?.componentStack && (
                <Box>
                  <Heading size="sm" mb={2} color="red.600">
                    Component Stack:
                  </Heading>
                  <Code 
                    p={3} 
                    borderRadius="md" 
                    bg="gray.100" 
                    color="gray.700"
                    whiteSpace="pre-wrap"
                    fontSize="xs"
                    display="block"
                    maxH="200px"
                    overflowY="auto"
                  >
                    {errorInfo.componentStack}
                  </Code>
                </Box>
              )}
            </VStack>
          </Collapse>
        )}
      </VStack>
    </Box>
  );
};

export default ErrorBoundary; 