import React from 'react';
import {
  Tooltip,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { InfoIcon, CloseIcon } from '@chakra-ui/icons';
import { featureDiscoveryService } from '../../../../lib/featureDiscoveryService';
import { useAppStore } from '../../stores/useAppStore';

interface FeatureTooltipProps {
  featureId: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FeatureTooltip: React.FC<FeatureTooltipProps> = ({
  featureId,
  children,
  placement = 'top',
  showIcon = true,
  size = 'md'
}) => {
  const { user } = useAppStore();
  const userId = user?.id;

  const iconColor = useColorModeValue('blue.500', 'blue.300');
  const badgeColorScheme = useColorModeValue('blue', 'blue');

  // Don't render if no user
  if (!userId) {
    return <>{children}</>;
  }

  // Check if we should show guidance for this feature
  const shouldShow = featureDiscoveryService.shouldShowGuidance(userId, featureId);
  const feature = featureDiscoveryService.getFeature(featureId);

  if (!shouldShow || !feature) {
    return <>{children}</>;
  }

  const handleTooltipOpen = () => {
    featureDiscoveryService.markFeatureDiscovered(userId, featureId);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    featureDiscoveryService.markCalloutDismissed(userId, featureId);
  };

  const tooltipContent = (
    <VStack align="start" spacing={2} maxW="300px">
      <HStack justify="space-between" w="full">
        <HStack spacing={2}>
          <Text fontWeight="bold" fontSize="sm">
            {feature.title}
          </Text>
          {feature.isNew && (
            <Badge colorScheme={badgeColorScheme} size="sm">
              NEW
            </Badge>
          )}
        </HStack>
        <IconButton
          icon={<CloseIcon />}
          size="xs"
          variant="ghost"
          onClick={handleDismiss}
          aria-label="Dismiss tooltip"
        />
      </HStack>
      
      <Text fontSize="xs" color="gray.600">
        {feature.description}
      </Text>
      
      {feature.estimatedTime && (
        <Text fontSize="xs" color="gray.500">
          ⏱️ {feature.estimatedTime} min to learn
        </Text>
      )}
      
      {feature.learnMoreUrl && (
        <Text 
          fontSize="xs" 
          color="blue.500" 
          cursor="pointer"
          textDecoration="underline"
          onClick={() => window.open(feature.learnMoreUrl, '_blank')}
        >
          Learn more →
        </Text>
      )}
    </VStack>
  );

  return (
    <HStack spacing={2}>
      {children}
      {showIcon && (
        <Tooltip
          label={tooltipContent}
          placement={placement}
          hasArrow
          bg="white"
          color="black"
          borderColor="gray.200"
          borderWidth="1px"
          borderRadius="md"
          p={3}
          shadow="lg"
          onOpen={handleTooltipOpen}
        >
          <InfoIcon
            color={iconColor}
            cursor="pointer"
            boxSize={size === 'sm' ? 3 : size === 'md' ? 4 : 5}
            _hover={{ color: 'blue.600' }}
            transition="color 0.2s"
          />
        </Tooltip>
      )}
    </HStack>
  );
}; 