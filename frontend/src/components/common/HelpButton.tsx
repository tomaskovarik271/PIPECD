import React from 'react';
import {
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  useDisclosure,
  Badge,
  HStack,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FiHelpCircle, FiInfo } from 'react-icons/fi';
import { useHelp } from '../../contexts/HelpContext';
import { FeatureHelpTips } from './FeatureHelpTips';
import { useThemeColors } from '../../hooks/useThemeColors';

export const HelpButton: React.FC = () => {
  const { availableHelp } = useHelp();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const colors = useThemeColors();

  // Don't show the help button if no help is available
  if (availableHelp.length === 0) {
    return null;
  }

  const getFeatureTitle = (feature: string) => {
    switch (feature) {
      case 'deal-to-lead-conversion':
        return 'Deal → Lead Conversion';
      case 'lead-to-deal-conversion':
        return 'Lead → Deal Conversion';
      case 'meeting-scheduling':
        return 'Meeting Scheduling';
      case 'deals-overview':
        return 'Deals Overview';
      case 'kanban-vs-table':
        return 'Kanban vs Table Views';
      case 'task-indicators':
        return 'Task Indicators';
      default:
        return 'Feature Help';
    }
  };

  return (
    <>
      <Tooltip label={`Help available (${availableHelp.length} topic${availableHelp.length > 1 ? 's' : ''})`} hasArrow>
        <IconButton
          aria-label="Help & Tips"
          icon={<Icon as={FiInfo} />}
          variant="ghost"
          size="md"
          onClick={onOpen}
          color={colors.text.primary}
          _hover={{
            bg: colors.bg.elevated,
            color: 'yellow.500'
          }}
          position="relative"
        >
          {availableHelp.length > 1 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              fontSize="xs"
              colorScheme="blue"
              borderRadius="full"
              minW="18px"
              h="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {availableHelp.length}
            </Badge>
          )}
        </IconButton>
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxW="1000px">
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FiHelpCircle} color="blue.500" />
              <Text>Help & Tips</Text>
              <Badge colorScheme="blue" variant="subtle">
                {availableHelp.length} topic{availableHelp.length > 1 ? 's' : ''} available
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Text color={colors.text.muted} fontSize="sm">
                Get help with the advanced features available on this page:
              </Text>

              {availableHelp.map((feature, index) => (
                <VStack key={feature} spacing={4} align="stretch">
                  {index > 0 && <hr style={{ border: `1px solid ${colors.border.subtle}`, margin: 0 }} />}
                  <FeatureHelpTips feature={feature as any} isOpen={true} />
                </VStack>
              ))}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default HelpButton; 