import React, { useState, useEffect } from 'react';
import {
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
  HStack,
  Icon,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiExternalLink, FiCalendar } from 'react-icons/fi';
import { useMutation } from '@apollo/client';
import { Deal } from '../../stores/useDealsStore';
import { SYNC_CALENDAR_EVENTS } from '../../lib/graphql/calendarOperations';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  deal,
}) => {
  const toast = useToast();
  const [isCalendarOpened, setIsCalendarOpened] = useState(false);

  // Theme-aware colors
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const [syncCalendarEvents] = useMutation(SYNC_CALENDAR_EVENTS);

  // Get next business hour (simple logic)
  const getNextBusinessHour = (): Date => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 2, 0, 0, 0); // 2 hours from now

    // If weekend or after hours, set to next Monday 9 AM
    const day = nextHour.getDay();
    const hour = nextHour.getHours();
    
    if (day === 0 || day === 6 || hour < 9 || hour >= 17) {
      const nextMonday = new Date(nextHour);
      const daysUntilMonday = day === 0 ? 1 : (8 - day);
      nextMonday.setDate(nextHour.getDate() + daysUntilMonday);
      nextMonday.setHours(9, 0, 0, 0);
      return nextMonday;
    }

    return nextHour;
  };

  // Generate meeting description with deal context (THE ESSENTIAL MAGIC)
  const generateMeetingDescription = (dealData: Deal): string => {
    const lines = [
      `Meeting regarding: ${dealData.name}`,
      '',
      '📊 Deal Context:',
      `• Value: ${dealData.amount ? `${dealData.currency || 'USD'} ${dealData.amount.toLocaleString()}` : 'TBD'}`,
      `• Organization: ${dealData.organization?.name || 'Not specified'}`,
      `• Contact: ${dealData.person ? `${dealData.person.first_name} ${dealData.person.last_name}` : 'Not specified'}`,
      `• Stage: ${dealData.currentWfmStep?.status?.name || 'Not specified'}`,
      '',
      '🔗 Created from PipeCD CRM',
      `Deal ID: ${dealData.id}` // ← THE MAGIC: Auto-linking via embedded ID
    ];
    return lines.join('\n');
  };

  // Build simple Google Calendar URL with deal context
  const buildGoogleCalendarUrl = (): string => {
    const startTime = getNextBusinessHour();
    const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour duration

    const attendees = deal.person?.email || '';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Meeting: ${deal.name}`,
      details: generateMeetingDescription(deal),
      dates: `${formatGoogleCalendarDate(startTime)}/${formatGoogleCalendarDate(endTime)}`,
      add: attendees,
      location: 'Google Meet',
      src: 'PipeCD'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Helper function to format dates for Google Calendar
  const formatGoogleCalendarDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Open Google Calendar and start silent auto-sync
  const handleOpenGoogleCalendar = () => {
    const calendarUrl = buildGoogleCalendarUrl();
    window.open(calendarUrl, '_blank');
    setIsCalendarOpened(true);
    
    toast({
      title: 'Google Calendar opened',
      description: 'Create your meeting - it will automatically appear in your PipeCD timeline.',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });

    // Start silent background auto-sync
    startSilentAutoSync();
  };

  // Silent background auto-sync (no UI noise)
  const startSilentAutoSync = () => {
    let attempts = 0;
    const maxAttempts = 8; // 2 minutes of silent polling

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const result = await syncCalendarEvents({
          variables: {
            daysPast: 0,    // Only today
            daysFuture: 1,  // Only tomorrow  
            fullSync: false // Quick sync
          }
        });

        // Success: Meeting found and synced
        if (result.data?.syncCalendarEvents?.eventsCount > 0) {
          clearInterval(pollInterval);
          toast({
            title: '✅ Meeting synced!',
            description: 'Your meeting now appears in both Google Calendar and PipeCD timeline.',
            status: 'success',
            duration: 4000,
            isClosable: true,
          });
          onClose(); // Auto-close modal
        }

        // Timeout: Stop trying
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
        }
      } catch (error) {
        // Silent failure - continue trying
        console.log('Auto-sync attempt failed, continuing...');
      }
    }, 15000); // Poll every 15 seconds (less aggressive)
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsCalendarOpened(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={FiCalendar} />
            <Text>Schedule Meeting</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="medium">
              📅 {deal.name}
            </Text>
            
            <VStack spacing={3} align="stretch" bg={bgColor} p={4} borderRadius="md">
              <Text fontSize="sm" fontWeight="medium">
                Meeting will be created in Google Calendar with deal context.
              </Text>
              <Text fontSize="sm" color={textColor}>
                It will automatically appear in your PipeCD timeline - no additional steps required.
              </Text>
            </VStack>

            <VStack spacing={2} align="stretch" fontSize="sm" color={textColor}>
              <Text><strong>Deal:</strong> {deal.name}</Text>
              <Text><strong>Organization:</strong> {deal.organization?.name || 'Not specified'}</Text>
              <Text><strong>Contact:</strong> {deal.person?.email || 'Not specified'}</Text>
              <Text><strong>Current Stage:</strong> {deal.currentWfmStep?.status?.name || 'Not specified'}</Text>
            </VStack>

            {isCalendarOpened && (
              <VStack spacing={2} align="stretch" bg="green.50" p={3} borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" color="green.700">
                  ✅ Google Calendar opened
                </Text>
                <Text fontSize="sm" color="green.600">
                  Create your meeting - PipeCD will automatically detect and sync it.
                </Text>
              </VStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            
            <Button
              colorScheme="blue"
              onClick={handleOpenGoogleCalendar}
              leftIcon={<FiExternalLink />}
            >
              Open Google Calendar
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 