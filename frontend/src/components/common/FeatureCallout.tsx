import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  HStack,
  VStack,
  CloseButton,
  Badge,
  Link,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useFeatureDiscovery } from '../../hooks/useFeatureDiscovery';

interface FeatureCalloutProps {
  featureId: string;
  context?: string;
  variant?: 'subtle' | 'solid' | 'left-accent' | 'top-accent';
  status?: 'info' | 'warning' | 'success' | 'error';
  isCollapsible?: boolean;
  defaultOpen?: boolean;
  onFeatureUsed?: () => void;
}

export const FeatureCallout: React.FC<FeatureCalloutProps> = ({
  featureId,
  context,
  variant = 'left-accent',
  status = 'info',
  isCollapsible = false,
  defaultOpen = true,
  onFeatureUsed
}) => {
  const {
    getFeature,
    shouldShowGuidance,
    markFeatureDiscovered,
    markFeatureUsed,
    dismissFeature,
    isFeatureDiscovered,
    getFeatureUsageCount
  } = useFeatureDiscovery();

  const { isOpen, onToggle, onClose } = useDisclosure({ defaultIsOpen: defaultOpen });

  const feature = getFeature(featureId);
  const shouldShow = feature && shouldShowGuidance(featureId, 'callout');
  const usageCount = getFeatureUsageCount(featureId);
  const discovered = isFeatureDiscovered(featureId);

  // Handle feature usage
  const handleFeatureUsed = () => {
    if (feature) {
      markFeatureUsed(featureId, context);
      onFeatureUsed?.();
    }
  };

  // Handle dismiss
  const handleDismiss = () => {
    dismissFeature(featureId, context);
    if (isCollapsible) {
      onClose();
    }
  };

  // Handle discovery
  const handleDiscovered = () => {
    if (feature && !discovered) {
      markFeatureDiscovered(featureId, context);
    }
  };

  if (!feature || !shouldShow) {
    return null;
  }

  // Determine status color based on feature category
  const getStatusForCategory = (category: string) => {
    switch (category) {
      case 'innovative':
        return 'success';
      case 'advanced':
        return 'info';
      case 'standard':
        return 'warning';
      default:
        return status;
    }
  };

  const calloutStatus = getStatusForCategory(feature.category);

  const calloutContent = (
    <Alert status={calloutStatus} variant={variant} borderRadius="md">
      <AlertIcon />
      <Box flex="1">
        <HStack justify="space-between" align="start" mb={2}>
          <VStack align="start" spacing={1} flex="1">
            <HStack>
              <AlertTitle fontSize="md">{feature.title}</AlertTitle>
              <Badge
                colorScheme={feature.category === 'innovative' ? 'purple' : feature.category === 'advanced' ? 'blue' : 'gray'}
                variant="subtle"
                fontSize="xs"
              >
                {feature.category}
              </Badge>
            </HStack>
            <AlertDescription fontSize="sm">
              {feature.detailedDescription || feature.description}
            </AlertDescription>
          </VStack>
          <CloseButton
            alignSelf="flex-start"
            position="relative"
            right={-1}
            top={-1}
            onClick={handleDismiss}
          />
        </HStack>

        <HStack spacing={3} mt={3}>
          <Button
            size="sm"
            colorScheme={calloutStatus === 'success' ? 'green' : calloutStatus === 'info' ? 'blue' : 'orange'}
            onClick={() => {
              handleFeatureUsed();
              handleDiscovered();
            }}
          >
            Try it now
          </Button>
          
          {feature.demoUrl && (
            <Link href={feature.demoUrl} isExternal>
              <Button
                size="sm"
                variant="outline"
                rightIcon={<ExternalLinkIcon />}
              >
                View Demo
              </Button>
            </Link>
          )}
          
          {feature.docsUrl && (
            <Link href={feature.docsUrl} isExternal>
              <Button
                size="sm"
                variant="ghost"
                rightIcon={<ExternalLinkIcon />}
              >
                Learn More
              </Button>
            </Link>
          )}

          {isCollapsible && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggle}
            >
              {isOpen ? 'Hide' : 'Show'}
            </Button>
          )}
        </HStack>

        {usageCount > 0 && (
          <Box mt={2}>
            <Badge colorScheme="gray" variant="subtle" fontSize="xs">
              Used {usageCount} time{usageCount !== 1 ? 's' : ''}
            </Badge>
          </Box>
        )}
      </Box>
    </Alert>
  );

  if (isCollapsible) {
    return (
      <Collapse in={isOpen} animateOpacity>
        {calloutContent}
      </Collapse>
    );
  }

  return calloutContent;
}; 