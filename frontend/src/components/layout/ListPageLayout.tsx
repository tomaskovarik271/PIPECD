import React from 'react';
import {
  Heading,
  Button,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  Spacer,
  HStack,
  Box,
} from '@chakra-ui/react';
import EmptyState from '../common/EmptyState'; // Assuming EmptyState is in common

// Interface for EmptyState props (adjust if needed based on actual component)
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  message: string;
  // Add other props if EmptyState requires them
}

// Props for the ListPageLayout
interface ListPageLayoutProps {
  title: string;
  newButtonLabel: string;
  onNewButtonClick: () => void;
  isNewButtonDisabled?: boolean;
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyStateProps: EmptyStateProps;
  children: React.ReactNode; // Main content (e.g., the table)
  customControls?: React.ReactNode; // Optional prop for custom controls
}

const ListPageLayout: React.FC<ListPageLayoutProps> = ({
  title,
  newButtonLabel,
  onNewButtonClick,
  isNewButtonDisabled = false,
  isLoading,
  error,
  isEmpty,
  emptyStateProps,
  children,
  customControls,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      {/* Header Section */}
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h2" size="lg">
          {title}
        </Heading>
        <HStack spacing={2}>
          {customControls && <Box>{customControls}</Box>}
          <Button 
            colorScheme="blue"
            onClick={onNewButtonClick}
            isDisabled={isNewButtonDisabled}
          >
            {newButtonLabel}
          </Button>
        </HStack>
      </Flex>

      {/* Conditional Content */}
      {isLoading && (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" />
        </Flex>
      )}

      {!isLoading && error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!isLoading && !error && isEmpty && (
        <EmptyState 
          icon={emptyStateProps.icon}
          title={emptyStateProps.title}
          message={emptyStateProps.message}
          actionButtonLabel={newButtonLabel}
          onActionButtonClick={onNewButtonClick}
          isActionButtonDisabled={isNewButtonDisabled}
        />
      )}

      {!isLoading && !error && !isEmpty && (
        <>{children}</>
      )}
    </VStack>
  );
};

export default ListPageLayout; 