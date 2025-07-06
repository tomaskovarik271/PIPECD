import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  HStack,
  Icon,
  Box,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
} from '@chakra-ui/react';
import { FiCalendar, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { Deal } from '../../stores/useDealsStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { DirectCalendarScheduler } from '../../lib/utils/directCalendarScheduler';

interface EmbeddedCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
  onMeetingCreated?: () => void;
}

export const EmbeddedCalendarModal: React.FC<EmbeddedCalendarModalProps> = ({
  isOpen,
  onClose,
  deal,
  onMeetingCreated,
}) => {
  const colors = useThemeColors();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [calendarUrl, setCalendarUrl] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'waiting' | 'syncing' | 'synced'>('waiting');

  // Use DirectCalendarScheduler to build URL (avoid code duplication)
  const buildGoogleCalendarUrl = (): string => {
    return DirectCalendarScheduler.buildGoogleCalendarUrl(deal);
  };

  // Initialize calendar URL when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setSyncStatus('waiting');
      const url = buildGoogleCalendarUrl();
      setCalendarUrl(url);
      
      // Simulate loading time for better UX
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen, deal]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
    toast({
      title: '📅 Google Calendar loaded',
      description: 'Create your meeting - it will automatically sync to PipeCD.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle opening in new tab as fallback
  const handleOpenInNewTab = () => {
    window.open(calendarUrl, '_blank');
    toast({
      title: 'Opened in new tab',
      description: 'Meeting will automatically sync to PipeCD once created.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle sync status updates
  const handleSyncStatusChange = (status: 'waiting' | 'syncing' | 'synced') => {
    setSyncStatus(status);
    if (status === 'synced') {
      toast({
        title: '✅ Meeting synced!',
        description: 'Meeting now appears in both Google Calendar and PipeCD.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onMeetingCreated?.();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent maxW="90vw" maxH="90vh" bg={colors.bg.surface}>
        <ModalHeader borderBottomWidth="1px" borderColor={colors.border.default}>
          <HStack justify="space-between" width="100%">
            <HStack>
              <Icon as={FiCalendar} color={colors.text.link} />
              <Text color={colors.text.primary}>Schedule Meeting</Text>
              <Badge colorScheme="blue" variant="subtle">
                {deal.name}
              </Badge>
            </HStack>
            <HStack spacing={2}>
              <Badge 
                colorScheme={syncStatus === 'synced' ? 'green' : syncStatus === 'syncing' ? 'yellow' : 'gray'}
                variant="solid"
              >
                {syncStatus === 'synced' ? '✅ Synced' : syncStatus === 'syncing' ? '🔄 Syncing' : '⏳ Waiting'}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<FiExternalLink />}
                onClick={handleOpenInNewTab}
                color={colors.text.secondary}
              >
                Open in New Tab
              </Button>
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color={colors.text.secondary} />
        
        <ModalBody p={0} position="relative">
          {isLoading && (
            <Box 
              position="absolute" 
              top="0" 
              left="0" 
              right="0" 
              bottom="0" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              bg={colors.bg.surface}
              zIndex={1}
            >
              <VStack spacing={4}>
                <Spinner size="lg" color={colors.interactive.default} />
                <Text color={colors.text.secondary}>Loading Google Calendar...</Text>
              </VStack>
            </Box>
          )}
          
          <Alert status="info" mb={4} bg={colors.bg.elevated} borderColor={colors.border.subtle}>
            <AlertIcon color={colors.status.info} />
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                Create your meeting in Google Calendar below
              </Text>
              <Text fontSize="xs" color={colors.text.secondary}>
                The meeting will automatically appear in your PipeCD timeline with full deal context.
              </Text>
            </VStack>
          </Alert>
          
          <Box height="70vh" borderRadius="md" overflow="hidden" border="1px solid" borderColor={colors.border.default}>
            <iframe
              src={calendarUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Google Calendar"
              onLoad={handleIframeLoad}
              style={{
                border: 'none',
                borderRadius: '6px',
              }}
            />
          </Box>
          
          <Box mt={4} p={4} bg={colors.bg.elevated} borderRadius="md" borderWidth="1px" borderColor={colors.border.subtle}>
            <VStack spacing={2} align="start">
              <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                📋 Meeting Details Pre-filled:
              </Text>
              <VStack spacing={1} align="start" fontSize="xs" color={colors.text.secondary}>
                <Text>• <strong>Title:</strong> Meeting: {deal.name}</Text>
                <Text>• <strong>Contact:</strong> {deal.person?.email || 'Not specified'}</Text>
                <Text>• <strong>Deal Context:</strong> Automatically included in description</Text>
                <Text>• <strong>Location:</strong> Google Meet (automatically added)</Text>
                <Text>• <strong>PipeCD Link:</strong> Deal ID embedded for auto-sync</Text>
              </VStack>
            </VStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}; 