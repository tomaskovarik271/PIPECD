import React from 'react';
import {
  Box,
  VStack,
  Icon,
  Heading,
  Text,
  Button,
} from '@chakra-ui/react';

interface EmptyStateProps {
  icon?: React.ElementType;
  iconColor?: string;
  title: string;
  message: string;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
  isActionButtonDisabled?: boolean;
  isModernTheme?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconColor: defaultIconColor = 'gray.400',
  title,
  message,
  actionButtonLabel,
  onActionButtonClick,
  isActionButtonDisabled = false,
  isModernTheme = false,
}) => {
  const modernIconColor = 'gray.300';
  const modernTextColor = 'gray.300';
  const modernHeadingColor = 'white';
  const modernButtonColorScheme = 'brand';

  return (
    <Box textAlign="center" py={10} px={6}>
      <VStack spacing={4} align="center">
        {icon && (
          <Icon as={icon} boxSize={'50px'} color={isModernTheme ? modernIconColor : defaultIconColor} />
        )}
        <Heading as="h2" size="lg" mt={6} mb={2} color={isModernTheme ? modernHeadingColor : undefined}>
          {title}
        </Heading>
        <Text color={isModernTheme ? modernTextColor : 'gray.500'}>
          {message}
        </Text>
        {actionButtonLabel && onActionButtonClick && (
          <Button
            mt={6}
            colorScheme={isModernTheme ? modernButtonColorScheme : "teal"}
            onClick={onActionButtonClick}
            isDisabled={isActionButtonDisabled}
            size={isModernTheme ? "md" : undefined}
            height={isModernTheme ? "40px" : undefined}
          >
            {actionButtonLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default EmptyState; 