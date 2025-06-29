import React, { ReactNode, useState, useEffect } from 'react';
import {
  Tooltip,
  HStack,
  VStack,
  Text,
  IconButton,
  Link,
  Badge,
  Box,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { InfoIcon, ExternalLinkIcon, CloseIcon } from '@chakra-ui/icons';
import { useFeatureDiscovery } from '../../hooks/useFeatureDiscovery';
import { FeatureHint } from '../../../../lib/services/featureDiscoveryService';

interface FeatureTooltipProps {
  featureId: string;
  children: ReactNode;
  context?: string;
  showBadge?: boolean;
  triggerOn?: 'hover' | 'click';
  placement?: 'top' | 'bottom' | 'left' | 'right';
  onFeatureUsed?: () => void;
}

export const FeatureTooltip: React.FC<FeatureTooltipProps> = ({
  featureId,
  children,
  context,
  showBadge = true,
  triggerOn = 'hover',
  placement = 'top',
  onFeatureUsed
}) => {
  const {
    getFeature,
    shouldShowGuidance,
    markFeatureDiscovered,
    markFeatureUsed,
    dismissFeature,
    isFeatureDiscovered,
    isFeatureDismissed,
    getFeatureUsageCount
  } = useFeatureDiscovery();

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const feature = getFeature(featureId);
  const shouldShow = feature && shouldShowGuidance(featureId, 'tooltip');
  const usageCount = getFeatureUsageCount(featureId);
  const discovered = isFeatureDiscovered(featureId);
  const dismissed = isFeatureDismissed(featureId);

  // Auto-mark as discovered when tooltip is shown
  useEffect(() => {
    if (isTooltipOpen && feature && !discovered) {
      markFeatureDiscovered(featureId, context);
    }
  }, [isTooltipOpen, feature, discovered, featureId, context, markFeatureDiscovered]);

  // Handle feature usage
  const handleFeatureUsed = () => {
    if (feature) {
      markFeatureUsed(featureId, context);
      onFeatureUsed?.();
    }
  };

  // Handle dismiss
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissFeature(featureId, context);
    setIsTooltipOpen(false);
  };

  // Handle learn more
  const handleLearnMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTooltipOpen(false);
    onModalOpen();
  };

  if (!feature || !shouldShow) {
    // Still wrap children but without tooltip
    return (
      <Box onClick={handleFeatureUsed}>
        {children}
      </Box>
    );
  }

  const tooltipContent = (
    <VStack align="start" spacing={2} maxW="300px">
      <HStack justify="space-between" w="full">
        <Text fontWeight="bold" fontSize="sm">
          {feature.title}
        </Text>
        <IconButton
          aria-label="Dismiss hint"
          icon={<CloseIcon />}
          size="xs"
          variant="ghost"
          onClick={handleDismiss}
        />
      </HStack>
      
      <Text fontSize="sm" color="gray.600">
        {feature.description}
      </Text>

      {(feature.detailedDescription || feature.demoUrl || feature.docsUrl) && (
        <HStack spacing={2} w="full">
          <Button
            size="xs"
            colorScheme="blue"
            variant="outline"
            onClick={handleLearnMore}
          >
            Learn More
          </Button>
          {feature.demoUrl && (
            <Link href={feature.demoUrl} isExternal>
              <Button
                size="xs"
                variant="ghost"
                rightIcon={<ExternalLinkIcon />}
              >
                Demo
              </Button>
            </Link>
          )}
        </HStack>
      )}

      {usageCount > 0 && (
        <Text fontSize="xs" color="gray.500">
          Used {usageCount} time{usageCount !== 1 ? 's' : ''}
        </Text>
      )}
    </VStack>
  );

  return (
    <>
      <HStack spacing={1}>
        <Tooltip
          label={tooltipContent}
          placement={placement}
          hasArrow
          isOpen={triggerOn === 'hover' ? undefined : isTooltipOpen}
          onOpen={() => setIsTooltipOpen(true)}
          onClose={() => setIsTooltipOpen(false)}
          closeOnClick={triggerOn === 'click'}
          closeDelay={triggerOn === 'hover' ? 500 : 0}
          openDelay={triggerOn === 'hover' ? 300 : 0}
        >
          <Box onClick={handleFeatureUsed}>
            {children}
          </Box>
        </Tooltip>
        
        {showBadge && !discovered && !dismissed && (
          <Badge
            colorScheme={feature.category === 'innovative' ? 'purple' : feature.category === 'advanced' ? 'blue' : 'gray'}
            variant="solid"
            fontSize="xs"
            borderRadius="full"
            px={2}
            py={1}
            cursor="pointer"
            onClick={() => setIsTooltipOpen(!isTooltipOpen)}
          >
            {feature.category === 'innovative' ? 'NEW' : '?'}
          </Badge>
        )}
      </HStack>

      {/* Detailed Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Text>{feature.title}</Text>
              <Badge
                colorScheme={feature.category === 'innovative' ? 'purple' : feature.category === 'advanced' ? 'blue' : 'gray'}
                variant="subtle"
              >
                {feature.category}
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack align="start" spacing={4}>
              <Text color="gray.600">
                {feature.description}
              </Text>
              
              {feature.detailedDescription && (
                <Box>
                  <Text fontWeight="semibold" mb={2}>How it works:</Text>
                  <Text>{feature.detailedDescription}</Text>
                </Box>
              )}

              {feature.prerequisites && feature.prerequisites.length > 0 && (
                <Box>
                  <Text fontWeight="semibold" mb={2}>Prerequisites:</Text>
                  <VStack align="start" spacing={1}>
                    {feature.prerequisites.map(prereqId => {
                      const prereq = getFeature(prereqId);
                      return prereq ? (
                        <HStack key={prereqId} spacing={2}>
                          <Badge
                            colorScheme={isFeatureDiscovered(prereqId) ? 'green' : 'red'}
                            variant="subtle"
                          >
                            {isFeatureDiscovered(prereqId) ? '✓' : '✗'}
                          </Badge>
                          <Text fontSize="sm">{prereq.title}</Text>
                        </HStack>
                      ) : null;
                    })}
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <HStack spacing={3}>
              {feature.docsUrl && (
                <Link href={feature.docsUrl} isExternal>
                  <Button variant="ghost" rightIcon={<ExternalLinkIcon />}>
                    Documentation
                  </Button>
                </Link>
              )}
              {feature.demoUrl && (
                <Link href={feature.demoUrl} isExternal>
                  <Button colorScheme="blue" variant="outline" rightIcon={<ExternalLinkIcon />}>
                    View Demo
                  </Button>
                </Link>
              )}
              <Button colorScheme="blue" onClick={onModalClose}>
                Got it!
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}; 