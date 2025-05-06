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
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconColor = 'gray.400',
  title,
  message,
  actionButtonLabel,
  onActionButtonClick,
  isActionButtonDisabled = false,
}) => {
  return (
    <Box textAlign="center" py={10} px={6}>
      <VStack spacing={4} align="center">
        {icon && (
          <Icon as={icon} boxSize={'50px'} color={iconColor} />
        )}
        <Heading as="h2" size="lg" mt={6} mb={2}>
          {title}
        </Heading>
        <Text color={'gray.500'}>
          {message}
        </Text>
        {actionButtonLabel && onActionButtonClick && (
          <Button
            mt={6}
            colorScheme="teal"
            onClick={onActionButtonClick}
            isDisabled={isActionButtonDisabled}
          >
            {actionButtonLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default EmptyState; 