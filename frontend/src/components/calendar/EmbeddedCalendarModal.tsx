import React, { useState, useEffect, useRef } from 'react';
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
import { FiCalendar, FiExternalLink, FiRefreshCw, FiMonitor } from 'react-icons/fi';
import { useApolloClient, gql } from '@apollo/client';
import { Deal } from '../../stores/useDealsStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { DirectCalendarScheduler } from '../../lib/utils/directCalendarScheduler';

const SYNC_CALENDAR_EVENTS = gql`
  mutation SyncCalendarEvents($calendarId: String, $fullSync: Boolean, $daysPast: Int, $daysFuture: Int) {
    syncCalendarEvents(calendarId: $calendarId, fullSync: $fullSync, daysPast: $daysPast, daysFuture: $daysFuture) {
      lastSyncAt
      isConnected
      hasSyncErrors
      errorMessage
      eventsCount
    }
  }
`;

interface EmbeddedCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
  onMeetingCreated?: () => void;
  onEmailRefresh?: () => void; // Callback to refresh email data
}

export const EmbeddedCalendarModal: React.FC<EmbeddedCalendarModalProps> = ({
  isOpen,
  onClose,
  deal,
  onMeetingCreated,
  onEmailRefresh,
}) => {
  const colors = useThemeColors();
  const toast = useToast();
  const apolloClient = useApolloClient();
  const [isLoading, setIsLoading] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'waiting' | 'syncing' | 'synced'>('waiting');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use DirectCalendarScheduler to build URL (avoid code duplication)
  const buildGoogleCalendarUrl = (): string => {
    return DirectCalendarScheduler.buildGoogleCalendarUrl(deal);
  };

  // Initialize calendar URL when modal opens
  useEffect(() => {
    if (isOpen) {
      setSyncStatus('waiting');
      const url = buildGoogleCalendarUrl();
      setCalendarUrl(url);
    }
  }, [isOpen, deal]);

  // Clean up popup and timeouts when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
      setIsPopupOpen(false);
    }
  }, [isOpen]);

  // Handle opening Google Calendar in popup window
  const handleOpenCalendarPopup = () => {
    const popup = window.open(
      calendarUrl,
      'GoogleCalendar',
      'width=1200,height=800,left=' + 
      ((screen.width - 1200) / 2) + 
      ',top=' + 
      ((screen.height - 800) / 2) + 
      ',toolbar=no,menubar=no,scrollbars=yes,resizable=yes'
    );
    
    if (popup) {
      popupRef.current = popup;
      setIsPopupOpen(true);
      
      toast({
        title: '📅 Google Calendar opened',
        description: 'Create your meeting - it will automatically sync to PipeCD.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      // Monitor popup window and start sync when closed
      startPopupMonitoring();
    } else {
      // Popup blocked - fallback to new tab
      handleOpenInNewTab();
    }
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

  // Monitor popup window
  const startPopupMonitoring = () => {
    const checkClosed = setInterval(() => {
      if (popupRef.current?.closed) {
        clearInterval(checkClosed);
        setIsPopupOpen(false);
        
        toast({
          title: '🔄 Calendar closed',
          description: 'Checking for new meetings...',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });

        // Start real sync after a short delay to let Google Calendar save
        syncTimeoutRef.current = setTimeout(() => {
          startRealSync();
        }, 2000); // 2 second delay
      }
    }, 1000);
  };

  // Start real calendar sync
  const startRealSync = async () => {
    setSyncStatus('syncing');
    
    try {
      const result = await apolloClient.mutate({
        mutation: SYNC_CALENDAR_EVENTS,
        variables: {
          daysPast: 0,     // Today only
          daysFuture: 1,   // Tomorrow
          fullSync: false  // Quick sync
        }
      });

      const syncData = result.data?.syncCalendarEvents;
      
      if (syncData?.hasSyncErrors) {
        throw new Error(syncData.errorMessage || 'Sync failed');
      }

      // Success!
      setSyncStatus('synced');
      
      toast({
        title: '✅ Meeting synced!',
        description: `${syncData?.eventsCount || 0} events synced to PipeCD.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh email data to show the new meeting
      onEmailRefresh?.();
      
      onMeetingCreated?.();
      
    } catch (error) {
      console.error('Calendar sync failed:', error);
      setSyncStatus('waiting');
      
      toast({
        title: 'Sync failed',
        description: 'Meeting may take a few minutes to appear in PipeCD.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      
      // Still refresh email data in case sync worked but API reported error
      onEmailRefresh?.();
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
        
        <ModalBody p={6}>
          <VStack spacing={6}>
            {/* Calendar Integration Info */}
            <Alert status="info" borderRadius="md" bg={colors.bg.elevated} borderColor={colors.border.subtle}>
              <AlertIcon color={colors.status.info} />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                  Integrated Google Calendar Experience
                </Text>
                <Text fontSize="xs" color={colors.text.secondary}>
                  Opens Google Calendar in a focused popup window. Meetings automatically sync to PipeCD.
                </Text>
              </VStack>
            </Alert>

            {/* Status Display */}
            {isPopupOpen && (
              <Box
                w="full"
                bg={colors.bg.elevated}
                p={4}
                borderRadius="md"
                border="1px solid"
                borderColor={colors.border.subtle}
              >
                <HStack justify="center" spacing={3}>
                  <Spinner size="sm" color={colors.interactive.default} />
                  <Text color={colors.text.secondary}>
                    Google Calendar is open - create your meeting there
                  </Text>
                </HStack>
              </Box>
            )}

            {syncStatus === 'syncing' && (
              <Box
                w="full"
                bg={colors.bg.elevated}
                p={4}
                borderRadius="md"
                border="1px solid"
                borderColor={colors.border.subtle}
              >
                <HStack justify="center" spacing={3}>
                  <Spinner size="sm" color={colors.interactive.default} />
                  <Text color={colors.text.secondary}>
                    Syncing new meeting to PipeCD...
                  </Text>
                </HStack>
              </Box>
            )}

            {syncStatus === 'synced' && (
              <Box
                w="full"
                bg="green.50"
                p={4}
                borderRadius="md"
                border="1px solid"
                borderColor="green.200"
              >
                <HStack justify="center" spacing={3}>
                  <Icon as={FiCalendar} color="green.500" />
                  <Text color="green.700" fontWeight="medium">
                    Meeting successfully synced to PipeCD!
                  </Text>
                </HStack>
              </Box>
            )}

            {/* Meeting Details */}
            <Box w="full" p={4} bg={colors.bg.elevated} borderRadius="md" borderWidth="1px" borderColor={colors.border.subtle}>
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

            {/* Action Buttons */}
            <VStack w="full" spacing={3}>
              <Button
                leftIcon={<Icon as={FiMonitor} />}
                onClick={handleOpenCalendarPopup}
                colorScheme="blue"
                size="lg"
                w="full"
                isDisabled={isPopupOpen}
              >
                {isPopupOpen ? 'Calendar Open' : 'Open Google Calendar'}
              </Button>
              
              <HStack w="full" justify="center">
                <Button
                  leftIcon={<Icon as={FiExternalLink} />}
                  onClick={handleOpenInNewTab}
                  variant="outline"
                  size="sm"
                >
                  Open in New Tab Instead
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}; 