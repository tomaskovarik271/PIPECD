import React from 'react';
import {
  Box,
  VStack,
  Icon,
  Heading,
  Text,
  Button,
} from '@chakra-ui/react';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';

interface EmptyStateProps {
  icon?: React.ElementType;
  iconColor?: string;
  title: string;
  message: string;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
  isActionButtonDisabled?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconColor,
  title,
  message,
  actionButtonLabel,
  onActionButtonClick,
  isActionButtonDisabled = false,
}) => {
  const colors = useThemeColors();
  const styles = useThemeStyles();

  return (
    <Box textAlign="center" py={10} px={6}>
      <VStack spacing={4} align="center">
        {icon && (
          <Icon as={icon} boxSize={'50px'} color={iconColor || colors.text.muted} />
        )}
        <Heading as="h2" size="lg" mt={6} mb={2} color={colors.text.primary}>
          {title}
        </Heading>
        <Text color={colors.text.secondary}>
          {message}
        </Text>
        {actionButtonLabel && onActionButtonClick && (
          <Button
            mt={6}
            onClick={onActionButtonClick}
            isDisabled={isActionButtonDisabled}
            size="md"
            height="40px"
            {...styles.button.primary}
          >
            {actionButtonLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default EmptyState; 