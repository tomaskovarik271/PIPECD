import React, { useState } from 'react';
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
  Divider,
} from '@chakra-ui/react';
import { FiExternalLink, FiCalendar, FiRefreshCw } from 'react-icons/fi';
import { useMutation, gql } from '@apollo/client';
import { Deal } from '../../stores/useDealsStore';

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
  const [syncCalendarEvents, { loading: syncLoading }] = useMutation(SYNC_CALENDAR_EVENTS);

  // Helper function to format dates for Google Calendar
  const formatGoogleCalendarDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Get next business hour (9 AM - 5 PM, weekdays)
  const getNextBusinessHour = (): Date => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);

    // If it's weekend or after hours, set to next Monday 9 AM
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

  // Generate meeting description with deal context
  const generateMeetingDescription = (dealData: Deal): string => {
    const lines = [
      `Meeting regarding deal: ${dealData.name}`,
      '',
      '📊 Deal Details:',
      `• Amount: ${dealData.amount ? `${dealData.currency || 'USD'} ${dealData.amount.toLocaleString()}` : 'Not specified'}`,
      `• Organization: ${dealData.organization?.name || 'Not specified'}`,
      `• Contact: ${dealData.person ? `${dealData.person.first_name} ${dealData.person.last_name}` : 'Not specified'}`,
      `• Stage: ${dealData.currentWfmStep?.status?.name || 'Not specified'}`,
      '',
      '🔗 Created from PipeCD',
      `Deal ID: ${dealData.id}`
    ];
    return lines.join('\n');
  };

  // Build Google Calendar URL with pre-filled data
  const buildGoogleCalendarUrl = (): string => {
    const startTime = getNextBusinessHour();
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes later

    const attendees = [
      deal.person?.email,
      // Add more attendees from deal participants if available
    ].filter(Boolean).join(',');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Meeting: ${deal.name}`,
      details: generateMeetingDescription(deal),
      dates: `${formatGoogleCalendarDate(startTime)}/${formatGoogleCalendarDate(endTime)}`,
      add: attendees,
      location: '', // Leave empty for Google Meet auto-generation
      src: 'PipeCD'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const handleOpenGoogleCalendar = () => {
    const calendarUrl = buildGoogleCalendarUrl();
    window.open(calendarUrl, '_blank');
    setIsCalendarOpened(true);
    
    toast({
      title: 'Opening Google Calendar',
      description: 'Create your meeting in Google Calendar, then click "Sync Events" to see it in your PipeCD timeline.',
      status: 'info',
      duration: 6000,
      isClosable: true,
    });
  };

  const handleSyncEvents = async () => {
    try {
      const result = await syncCalendarEvents({
        variables: {
          daysPast: 1,    // Look back 1 day to catch recently created events
          daysFuture: 30, // Look ahead 30 days
        }
      });

      if (result.data?.syncCalendarEvents) {
        const { eventsCount, hasSyncErrors, errorMessage } = result.data.syncCalendarEvents;
        
        if (hasSyncErrors) {
          toast({
            title: 'Sync completed with errors',
            description: errorMessage || 'Some events could not be synced',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Calendar sync successful!',
            description: `${eventsCount} events synced. Your Google Calendar meetings now appear in PipeCD timeline.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
        
        // Close modal after successful sync
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      console.error('Error syncing calendar events:', error);
      toast({
        title: 'Sync failed',
        description: 'Could not sync calendar events. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getFormattedDateTime = (): string => {
    const startTime = getNextBusinessHour();
    return startTime.toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

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
            
            <VStack spacing={3} align="stretch" bg="gray.50" p={4} borderRadius="md">
              <Text fontSize="sm" color="gray.600">
                Pre-filled meeting details:
              </Text>
              <VStack spacing={1} align="stretch" fontSize="sm">
                <Text><strong>Title:</strong> Meeting: {deal.name}</Text>
                <Text><strong>Default time:</strong> {getFormattedDateTime()}</Text>
                <Text><strong>Attendees:</strong> {deal.person?.email || 'None specified'}</Text>
                <Text><strong>Location:</strong> Google Meet (auto-generated)</Text>
              </VStack>
            </VStack>

            <Text fontSize="sm" color="gray.500">
              This will open Google Calendar with all the deal information pre-filled. 
              You can adjust the time, add more attendees, and customize the meeting as needed.
            </Text>

            {isCalendarOpened && (
              <>
                <Divider />
                <VStack spacing={3} align="stretch" bg="blue.50" p={4} borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium" color="blue.700">
                    📋 Next Step: Sync Your Events
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    After creating your meeting in Google Calendar, click "Sync Events" below to see it appear in your PipeCD timeline.
                  </Text>
                </VStack>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          
          {isCalendarOpened && (
            <Button
              colorScheme="green"
              onClick={handleSyncEvents}
              leftIcon={<FiRefreshCw />}
              isLoading={syncLoading}
              loadingText="Syncing..."
              mr={3}
            >
              Sync Events
            </Button>
          )}
          
          <Button
            colorScheme="blue"
            onClick={handleOpenGoogleCalendar}
            leftIcon={<FiExternalLink />}
          >
            Open Google Calendar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 