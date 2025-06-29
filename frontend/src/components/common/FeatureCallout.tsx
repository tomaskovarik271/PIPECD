import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  CloseButton,
  HStack,
  Badge,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { featureDiscoveryService } from '../../../../lib/featureDiscoveryService';
import { useAppStore } from '../../stores/useAppStore';

interface FeatureCalloutProps {
  featureId: string;
  variant?: 'subtle' | 'left-accent' | 'top-accent' | 'solid';
  status?: 'info' | 'warning' | 'success' | 'error';
  showActionButton?: boolean;
  actionButtonText?: string;
  onActionClick?: () => void;
}

export const FeatureCallout: React.FC<FeatureCalloutProps> = ({
  featureId,
  variant = 'left-accent',
  status = 'info',
  showActionButton = true,
  actionButtonText,
  onActionClick
}) => {
  const { user } = useAppStore();
  const userId = user?.id;

  const badgeColorScheme = useColorModeValue('blue', 'blue');

  // Don't render if no user
  if (!userId) {
    return null;
  }

  // Check if we should show guidance for this feature
  const shouldShow = featureDiscoveryService.shouldShowGuidance(userId, featureId);
  const feature = featureDiscoveryService.getFeature(featureId);

  if (!shouldShow || !feature || feature.type !== 'callout') {
    return null;
  }

  const handleDismiss = () => {
    featureDiscoveryService.markCalloutDismissed(userId, featureId);
    featureDiscoveryService.markFeatureDiscovered(userId, featureId);
  };

  const handleActionClick = () => {
    featureDiscoveryService.incrementFeatureUsage(userId, featureId);
    featureDiscoveryService.markFeatureDiscovered(userId, featureId);
    if (onActionClick) {
      onActionClick();
    }
  };

  const defaultActionText = feature.learnMoreUrl ? 'Learn More' : 'Got it';

  return (
    <Alert status={status} variant={variant} mb={4} borderRadius="md">
      <AlertIcon />
      <Box flex="1">
        <VStack align="start" spacing={2}>
          <HStack spacing={2}>
            <AlertTitle fontSize="sm">
              {feature.title}
            </AlertTitle>
            {feature.isNew && (
              <Badge colorScheme={badgeColorScheme} size="sm">
                NEW
              </Badge>
            )}
            {feature.category === 'crm-innovation' && (
              <Badge colorScheme="purple" size="sm">
                INNOVATIVE
              </Badge>
            )}
          </HStack>
          
          <AlertDescription fontSize="sm">
            {feature.description}
          </AlertDescription>
          
          {(showActionButton || feature.learnMoreUrl) && (
            <HStack spacing={2} mt={2}>
              {showActionButton && (
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="solid"
                  onClick={handleActionClick}
                >
                  {actionButtonText || defaultActionText}
                </Button>
              )}
              
              {feature.estimatedTime && (
                <Box fontSize="xs" color="gray.500">
                  ⏱️ {feature.estimatedTime} min
                </Box>
              )}
            </HStack>
          )}
        </VStack>
      </Box>
      <CloseButton
        alignSelf="flex-start"
        position="relative"
        right={-1}
        top={-1}
        onClick={handleDismiss}
      />
    </Alert>
  );
}; 