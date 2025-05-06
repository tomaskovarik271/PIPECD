import React from 'react';
import {
  Box,
  Heading,
  Button,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
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
}) => {
  return (
    <VStack spacing={4} align="stretch">
      {/* Header Section */}
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h2" size="lg">
          {title}
        </Heading>
        <Button 
          colorScheme="blue"
          onClick={onNewButtonClick}
          isDisabled={isNewButtonDisabled}
        >
          {newButtonLabel}
        </Button>
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
          actionButtonLabel={newButtonLabel} // Reuse button label
          onActionButtonClick={onNewButtonClick} // Reuse button action
          isActionButtonDisabled={isNewButtonDisabled} // Reuse button disabled state
        />
      )}

      {!isLoading && !error && !isEmpty && (
        <>{children}</> // Render the main content (table)
      )}
    </VStack>
  );
};

export default ListPageLayout; 