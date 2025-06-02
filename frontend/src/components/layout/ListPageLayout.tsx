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
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors'; // NEW: Use semantic tokens

// Interface for EmptyState props (adjust if needed based on actual component)
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  message: string;
  actionButtonLabel?: string; // Make optional if not always needed
  onActionButtonClick?: () => void; // Make optional
  isActionButtonDisabled?: boolean; // Make optional
  // REMOVED: isModernTheme prop - no longer needed with semantic tokens
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
  // NEW: Use semantic tokens instead of manual theme checking
  const colors = useThemeColors();
  const styles = useThemeStyles();

  return (
    <VStack 
      spacing={4} 
      align="stretch" 
      p={6}
      bg={colors.bg.content} // NEW: Semantic token
      color={colors.text.primary} // NEW: Semantic token
      minH="100%" // Ensure it fills height
    >
      {/* Header Section */}
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading 
          as="h2" 
          size="lg" 
          color={colors.text.primary} // NEW: Semantic token
        >
          {title}
        </Heading>
        <HStack spacing={2}>
          {customControls && <Box>{customControls}</Box>}
          <Button 
            onClick={onNewButtonClick}
            isDisabled={isNewButtonDisabled}
            size="md"
            height="40px"
            minW="120px"
            {...styles.button.primary} // NEW: Theme-aware styles
          >
            {newButtonLabel}
          </Button>
        </HStack>
      </Flex>

      {/* Conditional Content */}
      {isLoading && (
        <Flex justify="center" align="center" minH="200px">
          <Spinner 
            size="xl" 
            color={colors.interactive.default} // NEW: Semantic token
          />
        </Flex>
      )}

      {!isLoading && error && (
        <Alert 
          status="error" 
          variant="subtle"
          bg={colors.status.error} // NEW: Semantic token
          color={colors.text.onAccent} // NEW: Semantic token
        >
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
          // REMOVED: isModernTheme prop - EmptyState should use semantic tokens too
        />
      )}

      {!isLoading && !error && !isEmpty && (
        // The table (children) will use its own semantic styling
        <Box 
          bg={colors.bg.surface} // NEW: Semantic token
          borderRadius="xl"
          borderWidth="1px"
          borderColor={colors.border.default} // NEW: Semantic token
          p={6}
        >
          {children}
        </Box>
      )}
    </VStack>
  );
};

export default ListPageLayout; 