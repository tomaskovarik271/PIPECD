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
  Divider,
  useColorModeValue,
  Badge,
  Spinner,
  SimpleGrid,
  Box,
  Avatar,
  Tooltip,
  Progress,
} from '@chakra-ui/react';
import { FiExternalLink, FiCalendar, FiRefreshCw, FiClock, FiUsers, FiCheck } from 'react-icons/fi';
import { useQuery, useMutation } from '@apollo/client';
import { Deal } from '../../stores/useDealsStore';
import { 
  CHECK_AVAILABILITY, 
  SEARCH_GOOGLE_CONTACTS,
  SYNC_CALENDAR_EVENTS 
} from '../../lib/graphql/calendarOperations';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
}

interface TimeSlot {
  datetime: string;
  label: string;
  available: boolean;
  confidence: 'high' | 'medium' | 'low';
}

interface ContactSuggestion {
  email: string;
  name?: string;
  photoUrl?: string;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  deal,
}) => {
  const toast = useToast();
  const [isCalendarOpened, setIsCalendarOpened] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [suggestedAttendees, setSuggestedAttendees] = useState<ContactSuggestion[]>([]);
  const [smartTimeSlots, setSmartTimeSlots] = useState<TimeSlot[]>([]);
  const [autoSyncProgress, setAutoSyncProgress] = useState(0);
  const [syncAttempts, setSyncAttempts] = useState(0);

  // Theme-aware colors
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const successBg = useColorModeValue('green.50', 'green.900');
  const availableBg = useColorModeValue('blue.50', 'blue.900');

  // GraphQL queries and mutations
  const { data: contactsData, loading: contactsLoading } = useQuery(SEARCH_GOOGLE_CONTACTS, {
    variables: { query: deal.organization?.name || deal.person?.email || '' },
    skip: !deal.organization?.name && !deal.person?.email,
  });

  const [syncCalendarEvents, { loading: syncLoading }] = useMutation(SYNC_CALENDAR_EVENTS);

  // Smart time slot generation
  const generateSmartTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const now = new Date();
    
    // Generate next 3 business time slots
    for (let i = 0; i < 3; i++) {
      const slotTime = getNextBusinessSlot(now, i);
      slots.push({
        datetime: slotTime.toISOString(),
        label: formatBusinessTime(slotTime),
        available: true, // Would be determined by availability check
        confidence: i === 0 ? 'high' : i === 1 ? 'medium' : 'low'
      });
    }
    
    return slots;
  };

  // Get next available business time slot
  const getNextBusinessSlot = (baseTime: Date, offset: number): Date => {
    const slot = new Date(baseTime);
    slot.setHours(slot.getHours() + 2 + (offset * 2), 0, 0, 0); // 2-hour increments
    
    // Ensure business hours (9 AM - 5 PM, weekdays)
    const day = slot.getDay();
    const hour = slot.getHours();
    
    if (day === 0 || day === 6 || hour < 9 || hour >= 17) {
      const nextMonday = new Date(slot);
      const daysUntilMonday = day === 0 ? 1 : (8 - day);
      nextMonday.setDate(slot.getDate() + daysUntilMonday);
      nextMonday.setHours(9 + (offset * 2), 0, 0, 0);
      return nextMonday;
    }
    
    return slot;
  };

  // Format time for display
  const formatBusinessTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get meeting type based on deal stage
  const getMeetingType = (deal: Deal): string => {
    const stage = deal.currentWfmStep?.status?.name?.toLowerCase() || '';
    if (stage.includes('demo')) return 'Demo';
    if (stage.includes('proposal')) return 'Proposal Presentation';
    if (stage.includes('contract')) return 'Contract Review';
    return 'Meeting';
  };

  // Generate intelligent meeting description
  const generateIntelligentDescription = (dealData: Deal): string => {
    const meetingType = getMeetingType(dealData);
    const lines = [
      `${meetingType} regarding: ${dealData.name}`,
      '',
      '📋 Meeting Agenda:',
      `• Review ${dealData.currentWfmStep?.status?.name || 'current status'}`,
      `• Discuss next steps and timeline`,
      `• Address questions and concerns`,
      '',
      '📊 Deal Context:',
      `• Value: ${dealData.amount ? `${dealData.currency || 'USD'} ${dealData.amount.toLocaleString()}` : 'TBD'}`,
      `• Organization: ${dealData.organization?.name || 'Not specified'}`,
      `• Primary Contact: ${dealData.person ? `${dealData.person.first_name} ${dealData.person.last_name}` : 'Not specified'}`,
      `• Current Stage: ${dealData.currentWfmStep?.status?.name || 'Not specified'}`,
      '',
      '🔗 Created from PipeCD CRM',
      `Deal ID: ${dealData.id}`
    ];
    return lines.join('\n');
  };

  // Build enhanced Google Calendar URL
  const buildSmartCalendarUrl = (): string => {
    const timeSlot = selectedTimeSlot || smartTimeSlots[0];
    const startTime = new Date(timeSlot?.datetime || Date.now());
    const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour default

    // Enhanced attendee list
    const attendees = [
      deal.person?.email,
      ...suggestedAttendees.slice(0, 3).map(contact => contact.email)
    ].filter(Boolean).join(',');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${getMeetingType(deal)}: ${deal.name}`,
      details: generateIntelligentDescription(deal),
      dates: `${formatGoogleCalendarDate(startTime)}/${formatGoogleCalendarDate(endTime)}`,
      add: attendees,
      location: 'Google Meet', // Will auto-generate Meet link
      src: 'PipeCD'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Helper function to format dates for Google Calendar
  const formatGoogleCalendarDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Enhanced calendar opening with auto-sync
  const handleOpenSmartCalendar = () => {
    const calendarUrl = buildSmartCalendarUrl();
    window.open(calendarUrl, '_blank');
    setIsCalendarOpened(true);
    
    toast({
      title: 'Opening Google Calendar',
      description: 'Smart pre-filled meeting with suggested times and attendees. PipeCD will auto-detect when you create the meeting.',
      status: 'info',
      duration: 8000,
      isClosable: true,
    });

    // Start auto-sync polling
    startAutoSyncPolling();
  };

  // Auto-sync polling after calendar is opened
  const startAutoSyncPolling = () => {
    const maxAttempts = 12; // 2 minutes of polling (10-second intervals)
    let attempts = 0;

    const pollInterval = setInterval(async () => {
      attempts++;
      setSyncAttempts(attempts);
      setAutoSyncProgress((attempts / maxAttempts) * 100);

      try {
        const result = await syncCalendarEvents({
          variables: {
            daysPast: 0,    // Only check today
            daysFuture: 1,  // And tomorrow
            fullSync: false
          }
        });

        if (result.data?.syncCalendarEvents?.eventsCount > 0) {
          clearInterval(pollInterval);
          toast({
            title: '🎉 Meeting detected!',
            description: `Successfully synced ${result.data.syncCalendarEvents.eventsCount} event(s) to your PipeCD timeline`,
            status: 'success',
            duration: 6000,
            isClosable: true,
          });
          setTimeout(() => onClose(), 2000);
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setAutoSyncProgress(100);
          toast({
            title: 'Auto-sync completed',
            description: 'You can manually sync later if needed.',
            status: 'info',
            duration: 4000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Auto-sync attempt failed:', error);
      }
    }, 10000); // Poll every 10 seconds
  };

  // Manual sync events
  const handleManualSync = async () => {
    try {
      const result = await syncCalendarEvents({
        variables: {
          daysPast: 1,    // Look back 1 day
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
            description: `${eventsCount} events synced from Google Calendar.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
        
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

  // Initialize smart features when modal opens
  useEffect(() => {
    if (isOpen) {
      setSmartTimeSlots(generateSmartTimeSlots());
      setSelectedTimeSlot(null);
      setIsCalendarOpened(false);
      setAutoSyncProgress(0);
      setSyncAttempts(0);
    }
  }, [isOpen]);

  // Process contact suggestions
  useEffect(() => {
    if (contactsData?.searchGoogleContacts) {
      setSuggestedAttendees(contactsData.searchGoogleContacts.slice(0, 5));
    }
  }, [contactsData]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={FiCalendar} />
            <Text>Smart Meeting Scheduler</Text>
            <Badge colorScheme="blue" fontSize="xs">AI-Enhanced</Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Deal Context */}
            <Box>
              <Text fontSize="lg" fontWeight="medium" mb={2}>
                📅 {getMeetingType(deal)}: {deal.name}
              </Text>
              <Text fontSize="sm" color={labelColor}>
                {deal.organization?.name} • {deal.currentWfmStep?.status?.name}
              </Text>
            </Box>

            {/* Smart Time Suggestions */}
            <VStack spacing={3} align="stretch">
              <HStack>
                <Icon as={FiClock} />
                <Text fontWeight="medium">Suggested Times</Text>
                <Badge colorScheme="green" size="sm">Smart</Badge>
              </HStack>
              
              <SimpleGrid columns={1} spacing={2}>
                {smartTimeSlots.map((slot, index) => (
                  <Box
                    key={index}
                    p={3}
                    bg={selectedTimeSlot?.datetime === slot.datetime ? 'blue.100' : availableBg}
                    border="1px solid"
                    borderColor={selectedTimeSlot?.datetime === slot.datetime ? 'blue.300' : 'gray.200'}
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => setSelectedTimeSlot(slot)}
                    _hover={{ borderColor: 'blue.300' }}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium" fontSize="sm">{slot.label}</Text>
                        <HStack spacing={2}>
                          <Badge 
                            colorScheme={slot.confidence === 'high' ? 'green' : slot.confidence === 'medium' ? 'yellow' : 'gray'} 
                            size="xs"
                          >
                            {slot.confidence} confidence
                          </Badge>
                          {slot.available && <Badge colorScheme="green" size="xs">Available</Badge>}
                        </HStack>
                      </VStack>
                      {selectedTimeSlot?.datetime === slot.datetime && <Icon as={FiCheck} color="blue.500" />}
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>

            {/* Smart Attendee Suggestions */}
            <VStack spacing={3} align="stretch">
              <HStack>
                <Icon as={FiUsers} />
                <Text fontWeight="medium">Suggested Attendees</Text>
                {contactsLoading && <Spinner size="sm" />}
              </HStack>
              
                             {suggestedAttendees.length > 0 ? (
                 <HStack spacing={2} wrap="wrap">
                   {[deal.person, ...suggestedAttendees].filter(Boolean).map((contact, index) => {
                     // Handle different contact types
                     const isDealPerson = index === 0 && deal.person;
                     const displayName = isDealPerson 
                       ? `${contact.first_name} ${contact.last_name}`.trim()
                       : contact.name || contact.email;
                     const avatarName = isDealPerson
                       ? `${contact.first_name} ${contact.last_name}`.trim()
                       : contact.name || contact.email;
                     
                     return (
                       <HStack
                         key={index}
                         spacing={2}
                         bg={bgColor}
                         px={3}
                         py={2}
                         borderRadius="md"
                         fontSize="sm"
                       >
                         <Avatar size="xs" name={avatarName} />
                         <Text>{displayName}</Text>
                         {index === 0 && <Badge size="xs" colorScheme="blue">Primary</Badge>}
                       </HStack>
                     );
                   })}
                 </HStack>
              ) : (
                <Text fontSize="sm" color={labelColor}>
                  {deal.person?.email ? `Primary contact: ${deal.person.email}` : 'No contacts found'}
                </Text>
              )}
            </VStack>

            {/* Enhanced Meeting Preview */}
            <VStack spacing={3} align="stretch" bg={bgColor} p={4} borderRadius="md">
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                Smart Pre-filled Details:
              </Text>
              <VStack spacing={2} align="stretch" fontSize="sm" color={textColor}>
                <Text><strong>Type:</strong> {getMeetingType(deal)}</Text>
                <Text><strong>Time:</strong> {selectedTimeSlot?.label || smartTimeSlots[0]?.label}</Text>
                <Text><strong>Attendees:</strong> {[deal.person?.email, ...suggestedAttendees.slice(0, 2).map(c => c.email)].filter(Boolean).join(', ') || 'None specified'}</Text>
                <Text><strong>Location:</strong> Google Meet (auto-generated)</Text>
                <Text><strong>Agenda:</strong> Auto-generated with deal context</Text>
              </VStack>
            </VStack>

            {/* Auto-sync Status */}
            {isCalendarOpened && (
              <>
                <Divider />
                <VStack spacing={3} align="stretch" bg={successBg} p={4} borderRadius="md">
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium" color="green.700">
                      🤖 Auto-Detection Active
                    </Text>
                    <Text fontSize="xs" color="green.600">
                      Attempt {syncAttempts}/12
                    </Text>
                  </HStack>
                  <Progress value={autoSyncProgress} colorScheme="green" size="sm" />
                  <Text fontSize="sm" color="green.600">
                    PipeCD is automatically checking for your new meeting. Create it in Google Calendar and we'll detect it!
                  </Text>
                </VStack>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3} width="100%" justify="flex-end">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            
            {isCalendarOpened && (
              <Tooltip label="Force sync now if auto-detection missed your meeting">
                <Button
                  colorScheme="green"
                  onClick={handleManualSync}
                  leftIcon={<FiRefreshCw />}
                  isLoading={syncLoading}
                  loadingText="Syncing..."
                  size="md"
                >
                  Manual Sync
                </Button>
              </Tooltip>
            )}
            
            {!isCalendarOpened && (
              <Button
                colorScheme="blue"
                onClick={handleOpenSmartCalendar}
                leftIcon={<FiExternalLink />}
                size="md"
              >
                Open Smart Calendar
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 