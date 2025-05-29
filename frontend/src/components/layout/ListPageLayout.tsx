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
import { useThemeStore } from '../../stores/useThemeStore'; // Added theme store

// Interface for EmptyState props (adjust if needed based on actual component)
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  message: string;
  actionButtonLabel?: string; // Make optional if not always needed
  onActionButtonClick?: () => void; // Make optional
  isActionButtonDisabled?: boolean; // Make optional
  isModernTheme?: boolean; // ADDED for styling
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
  const { currentTheme: currentThemeName } = useThemeStore();
  const isModernTheme = currentThemeName === 'modern';

  return (
    <VStack 
      spacing={4} 
      align="stretch" 
      p={isModernTheme ? 6 : 4} // Add padding consistent with other modern pages
      bg={isModernTheme ? 'gray.900' : undefined} // Dark background for modern theme
      color={isModernTheme ? 'white' : undefined} // Default text color for modern theme
      minH="100%" // Ensure it fills height
    >
      {/* Header Section */}
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h2" size="lg" color={isModernTheme ? 'white' : undefined}>
          {title}
        </Heading>
        <HStack spacing={2}>
          {customControls && <Box>{customControls}</Box>}
          <Button 
            colorScheme={isModernTheme ? "brand" : "blue"} // Use brand for modern theme
            onClick={onNewButtonClick}
            isDisabled={isNewButtonDisabled}
            size={isModernTheme ? "md" : "md"} // Ensure consistent size
            height={isModernTheme ? "40px" : undefined}
            minW={isModernTheme ? "120px" : undefined}
          >
            {newButtonLabel}
          </Button>
        </HStack>
      </Flex>

      {/* Conditional Content */}
      {isLoading && (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" color={isModernTheme ? 'white' : undefined} />
        </Flex>
      )}

      {!isLoading && error && (
        <Alert status="error" variant={isModernTheme ? "solidSubtle" : "subtle"}> {/* Use modern variant if available */}
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
          isModernTheme={isModernTheme}
        />
      )}

      {!isLoading && !error && !isEmpty && (
        // The table (children) will need its own modern theme styling
        <Box 
          bg={isModernTheme ? 'gray.800' : undefined} 
          borderRadius={isModernTheme ? 'xl' : undefined}
          p={isModernTheme ? 6 : 0} // Add padding around table for modern
        >
          {children}
        </Box>
      )}
    </VStack>
  );
};

export default ListPageLayout; 