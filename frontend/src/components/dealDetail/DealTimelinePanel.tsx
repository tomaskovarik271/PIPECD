import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Badge,
  Icon,
  Flex,
  Button,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip,
  useToast,
  Collapse,
  Heading
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiVideo,
  FiMapPin,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiPlus,
  FiRefreshCw,
  FiUsers,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { GET_DEAL_CALENDAR_EVENTS } from '../../lib/graphql/calendarOperations';
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

interface DealTimelinePanelProps {
  deal: Deal;
  onUpcomingEventsCountChange?: (count: number) => void;
}

interface TimelineEvent {
  id: string;
  type: 'calendar' | 'task';
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  eventType?: string;
  status: 'completed' | 'upcoming' | 'overdue' | 'in_progress' | 'cancelled';
  location?: string;
  googleMeetLink?: string;
  person?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  outcome?: string;
  outcomeNotes?: string;
  nextActions?: string[];
  isCancelled: boolean;
}

export const DealTimelinePanel: React.FC<DealTimelinePanelProps> = ({ deal, onUpcomingEventsCountChange }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'all'>('month');
  const [isCancelledExpanded, setIsCancelledExpanded] = useState(false);
  const toast = useToast();

  // Colors for different themes
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const upcomingBg = useColorModeValue('blue.50', 'blue.900');
  const pastBg = useColorModeValue('gray.50', 'gray.700');
  const todayBg = useColorModeValue('green.50', 'green.900');

  // Query for deal-specific calendar events
  const { data: calendarData, loading: calendarLoading, error: calendarError, refetch } = useQuery(
    GET_DEAL_CALENDAR_EVENTS,
    {
      variables: { dealId: deal.id },
      fetchPolicy: 'cache-and-network'
    }
  );

  const [syncCalendarEvents, { loading: syncLoading }] = useMutation(SYNC_CALENDAR_EVENTS);

  const handleSyncEvents = async () => {
    try {
      const result = await syncCalendarEvents({
        variables: {
          daysPast: 7,    // Look back 7 days
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
            title: 'Timeline updated!',
            description: `${eventsCount} events synced from Google Calendar.`,
            status: 'success',
            duration: 4000,
            isClosable: true,
          });
        }
        
        // Refetch the calendar events to update the UI
        refetch();
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

  // Process and categorize events
  const processEvents = (): {
    overdue: TimelineEvent[];
    today: TimelineEvent[];
    upcoming: TimelineEvent[];
    past: TimelineEvent[];
    cancelled: TimelineEvent[];
  } => {
    const events: TimelineEvent[] = [];

    // Add calendar events
    if (calendarData?.dealCalendarEvents) {
      calendarData.dealCalendarEvents.forEach((event: any) => {
        const startTime = new Date(event.startTime);
        const endTime = event.endTime ? new Date(event.endTime) : undefined;
        
        let status: TimelineEvent['status'] = 'upcoming';
        
        // Check if event is cancelled (deleted from Google Calendar)
        if (event.isCancelled) {
          status = 'cancelled';
        } else if (isPast(endTime || startTime)) {
          status = 'completed';
        } else if (isToday(startTime)) {
          status = 'in_progress';
        }

        events.push({
          id: event.id,
          type: 'calendar',
          title: event.title,
          description: event.description,
          startTime: event.startTime,
          endTime: event.endTime,
          eventType: event.eventType,
          status,
          location: event.location,
          googleMeetLink: event.googleMeetLink,
          person: event.person,
          outcome: event.outcome,
          outcomeNotes: event.outcomeNotes,
          nextActions: event.nextActions || [],
          isCancelled: event.isCancelled || false
        });
      });
    }

    // Sort events by start time
    events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Categorize events
    const categorized = {
      overdue: events.filter(e => e.status === 'overdue'),
      today: events.filter(e => isToday(new Date(e.startTime)) && !e.isCancelled),
      upcoming: events.filter(e => e.status === 'upcoming' && isFuture(new Date(e.startTime)) && !e.isCancelled),
      past: events.filter(e => e.status === 'completed' && !e.isCancelled),
      cancelled: events.filter(e => e.isCancelled)
    };

    return categorized;
  };

  const { overdue, today, upcoming, past, cancelled } = processEvents();

  // Notify parent component about upcoming events count
  useEffect(() => {
    if (onUpcomingEventsCountChange) {
      onUpcomingEventsCountChange(upcoming.length);
    }
  }, [upcoming.length, onUpcomingEventsCountChange]);

  const renderEvent = (event: TimelineEvent) => {
    const startTime = new Date(event.startTime);
    const endTime = event.endTime ? new Date(event.endTime) : undefined;
    
    const getEventBg = () => {
      if (event.isCancelled) return useColorModeValue('gray.50', 'gray.800');
      if (isToday(startTime)) return useColorModeValue('green.25', 'green.900');
      if (isPast(endTime || startTime)) return useColorModeValue('gray.25', 'gray.750');
      return useColorModeValue('blue.25', 'blue.900');
    };

    const getStatusIcon = () => {
      switch (event.status) {
        case 'completed':
          return <Icon as={FiCheckCircle} color="green.400" boxSize={4} />;
        case 'overdue':
          return <Icon as={FiAlertCircle} color="red.400" boxSize={4} />;
        case 'in_progress':
          return <Icon as={FiClock} color="orange.400" boxSize={4} />;
        case 'cancelled':
          return <Icon as={FiAlertCircle} color="gray.400" boxSize={4} />;
        default:
          return <Icon as={FiCalendar} color="blue.400" boxSize={4} />;
      }
    };

    const getEventTypeColor = (type?: string): string => {
      switch (type) {
        case 'DEMO': return 'blue';
        case 'PROPOSAL_PRESENTATION': return 'purple';
        case 'CONTRACT_REVIEW': return 'orange';
        case 'FOLLOW_UP': return 'green';
        case 'CHECK_IN': return 'teal';
        default: return 'gray';
      }
    };

    const getBorderColor = () => {
      if (event.isCancelled) return 'gray.300';
      if (event.status === 'completed') return 'green.300';
      if (event.status === 'overdue') return 'red.300';
      if (isToday(startTime)) return 'green.300';
      return 'blue.300';
    };

    return (
      <Box
        key={event.id}
        p={4}
        bg={getEventBg()}
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.600')}
        borderLeft="3px solid"
        borderLeftColor={getBorderColor()}
        borderRadius="md"
        _hover={{
          borderColor: useColorModeValue('gray.300', 'gray.500'),
          bg: useColorModeValue('gray.50', 'gray.700')
        }}
        transition="all 0.2s"
      >
        <VStack align="stretch" spacing={3}>
          {/* Header */}
          <HStack justify="space-between">
            <HStack>
              {getStatusIcon()}
              <Text fontWeight="semibold" fontSize="sm" color={useColorModeValue('gray.700', 'gray.200')}>
                {event.title}
              </Text>
            </HStack>
            {event.eventType && (
              <Badge colorScheme={getEventTypeColor(event.eventType)} size="sm" variant="subtle">
                {event.eventType.replace('_', ' ')}
              </Badge>
            )}
          </HStack>

          {/* Description */}
          {event.description && (
            <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} noOfLines={2}>
              {event.description}
            </Text>
          )}

          {/* Time and Details */}
          <VStack spacing={1} align="start" fontSize="xs">
            <HStack>
              <Icon as={FiClock} color="gray.500" boxSize={3} />
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                {format(startTime, 'MMM dd, yyyy HH:mm')}
                {endTime && ` - ${format(endTime, 'HH:mm')}`}
                {isToday(startTime) && <Badge ml={2} colorScheme="green" size="sm">TODAY</Badge>}
              </Text>
            </HStack>

            {event.location && (
              <HStack>
                <Icon as={FiMapPin} color="gray.500" boxSize={3} />
                <Text color={useColorModeValue('gray.600', 'gray.400')} noOfLines={1}>{event.location}</Text>
              </HStack>
            )}

            {event.googleMeetLink && (
              <HStack>
                <Icon as={FiVideo} color="blue.500" boxSize={3} />
                <Text
                  as="a"
                  href={event.googleMeetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="blue.600"
                  _hover={{ textDecoration: 'underline' }}
                  fontSize="xs"
                >
                  Join Google Meet
                </Text>
              </HStack>
            )}

            {event.person && (
              <HStack>
                <Icon as={FiUser} color="gray.500" boxSize={3} />
                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                  with {event.person.first_name} {event.person.last_name}
                </Text>
              </HStack>
            )}
          </VStack>

          {/* Outcome and Next Actions - Simplified */}
          {(event.outcome || event.nextActions?.length) && (
            <Box>
              <Divider borderColor={useColorModeValue('gray.200', 'gray.600')} />
              <VStack align="stretch" spacing={1} mt={2}>
                {event.outcome && (
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color={useColorModeValue('gray.600', 'gray.400')} mb={1}>
                      Outcome:
                    </Text>
                    <Text fontSize="xs" color={useColorModeValue('gray.700', 'gray.300')} noOfLines={2}>{event.outcome}</Text>
                  </Box>
                )}
                
                {event.nextActions && event.nextActions.length > 0 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color={useColorModeValue('gray.600', 'gray.400')} mb={1}>
                      Next actions:
                    </Text>
                    <Text fontSize="xs" color={useColorModeValue('gray.700', 'gray.300')} noOfLines={2}>
                      • {event.nextActions.slice(0, 2).join(' • ')}
                      {event.nextActions.length > 2 && ` +${event.nextActions.length - 2} more`}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    );
  };

  if (calendarLoading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="lg" />
        <Text mt={4}>Loading timeline...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Flex 
        justify="space-between" 
        align="center" 
        mb={6}
        wrap="wrap"
        gap={4}
      >
        <Heading size="md" color="gray.600">
          Deal Timeline & Activities
        </Heading>
        
        <HStack spacing={3}>
          <Select
            size="sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            variant="outline"
            w="180px"
          >
            <option value="week">Past & Next Week</option>
            <option value="month">Past & Next Month</option>
            <option value="quarter">Past & Next Quarter</option>
            <option value="all">All Time</option>
          </Select>
          
          <Tooltip label="Sync from Google Calendar">
            <IconButton
              size="sm"
              icon={<FiRefreshCw />}
              onClick={handleSyncEvents}
              variant="outline"
              colorScheme="blue"
              isLoading={syncLoading}
              aria-label="Sync from Google Calendar"
            />
          </Tooltip>
        </HStack>
      </Flex>

      {/* Error State */}
      {calendarError && (
        <Alert status="warning">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Calendar integration not fully configured</Text>
            <Text fontSize="sm">
              Connect your Google Calendar to see meeting timeline. Some features may be limited.
            </Text>
          </Box>
        </Alert>
      )}

      {/* Timeline Content */}
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>
            All Events
            <Badge ml={2} variant="subtle">
              {overdue.length + today.length + upcoming.length + past.length + cancelled.length}
            </Badge>
          </Tab>
          <Tab>
            Upcoming
            <Badge ml={2} colorScheme="blue" variant="subtle">
              {upcoming.length}
            </Badge>
          </Tab>
          <Tab>
            Today
            <Badge ml={2} colorScheme="green" variant="subtle">
              {today.length}
            </Badge>
          </Tab>
          <Tab>
            Past
            <Badge ml={2} variant="subtle">
              {past.length}
            </Badge>
          </Tab>
          <Tab>
            Cancelled
            <Badge ml={2} variant="subtle">
              {cancelled.length}
            </Badge>
          </Tab>
        </TabList>

        <TabPanels>
          {/* All Events */}
          <TabPanel p={0} pt={6}>
            <VStack spacing={6} align="stretch">
              {/* Overdue Section */}
              {overdue.length > 0 && (
                <Box>
                  <HStack mb={4}>
                    <Icon as={FiAlertCircle} color="red.500" />
                    <Text fontWeight="bold" color="red.500">
                      Overdue ({overdue.length})
                    </Text>
                  </HStack>
                  <VStack spacing={3} align="stretch">
                    {overdue.map(renderEvent)}
                  </VStack>
                </Box>
              )}

              {/* Today Section */}
              {today.length > 0 && (
                <Box>
                  <HStack mb={4}>
                    <Icon as={FiClock} color="green.500" />
                    <Text fontWeight="bold" color="green.500">
                      Today ({today.length})
                    </Text>
                  </HStack>
                  <VStack spacing={3} align="stretch">
                    {today.map(renderEvent)}
                  </VStack>
                </Box>
              )}

              {/* Upcoming Section */}
              {upcoming.length > 0 && (
                <Box>
                  <HStack mb={4}>
                    <Icon as={FiCalendar} color="blue.500" />
                    <Text fontWeight="bold" color="blue.500">
                      Upcoming ({upcoming.length})
                    </Text>
                  </HStack>
                  <VStack spacing={3} align="stretch">
                    {upcoming.map(renderEvent)}
                  </VStack>
                </Box>
              )}

              {/* Past Section */}
              {past.length > 0 && (
                <Box>
                  <HStack mb={4}>
                    <Icon as={FiCheckCircle} color="gray.500" />
                    <Text fontWeight="bold" color="gray.500">
                      Completed ({past.length})
                    </Text>
                  </HStack>
                  <VStack spacing={3} align="stretch">
                    {past.slice(0, 10).map(renderEvent)}
                    {past.length > 10 && (
                      <Text fontSize="sm" color="gray.500" textAlign="center">
                        ... and {past.length - 10} more past events
                      </Text>
                    )}
                  </VStack>
                </Box>
              )}

              {/* Cancelled Section - Collapsible */}
              {cancelled.length > 0 && (
                <Box>
                  <HStack
                    mb={4}
                    cursor="pointer"
                    onClick={() => setIsCancelledExpanded(!isCancelledExpanded)}
                    _hover={{ bg: 'gray.50' }}
                    p={2}
                    borderRadius="md"
                    transition="background-color 0.2s"
                  >
                    <Icon 
                      as={isCancelledExpanded ? FiChevronDown : FiChevronRight} 
                      color="gray.500" 
                    />
                    <Icon as={FiAlertCircle} color="gray.500" />
                    <Text fontWeight="bold" color="gray.500">
                      Cancelled ({cancelled.length})
                    </Text>
                    <Text fontSize="sm" color="gray.400" ml="auto">
                      {isCancelledExpanded ? 'Click to hide' : 'Click to show'}
                    </Text>
                  </HStack>
                  
                  <Collapse in={isCancelledExpanded} animateOpacity>
                    <VStack spacing={3} align="stretch">
                      {cancelled.slice(0, 10).map(renderEvent)}
                      {cancelled.length > 10 && (
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          ... and {cancelled.length - 10} more cancelled events
                        </Text>
                      )}
                    </VStack>
                  </Collapse>
                </Box>
              )}

              {/* Empty State */}
              {overdue.length === 0 && today.length === 0 && upcoming.length === 0 && past.length === 0 && cancelled.length === 0 && (
                <Box textAlign="center" py={12}>
                  <Icon as={FiCalendar} size="3em" color="gray.400" />
                  <Text fontSize="lg" fontWeight="bold" color="gray.500" mt={4}>
                    No timeline events yet
                  </Text>
                  <Text color="gray.500" mb={6}>
                    Create your first meeting in Google Calendar
                  </Text>
                  <Button
                    as="a"
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting: ${deal.name}&details=Meeting regarding deal: ${deal.name}${deal.person ? ` with ${deal.person.first_name} ${deal.person.last_name}` : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                  >
                    Open Google Calendar
                  </Button>
                </Box>
              )}
            </VStack>
          </TabPanel>

          {/* Upcoming Tab */}
          <TabPanel p={0} pt={6}>
            {upcoming.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {upcoming.map(renderEvent)}
              </VStack>
            ) : (
              <Box textAlign="center" py={8}>
                <Icon as={FiCalendar} size="2em" color="gray.400" />
                <Text color="gray.500" mt={2}>
                  No upcoming meetings scheduled
                </Text>
              </Box>
            )}
          </TabPanel>

          {/* Today Tab */}
          <TabPanel p={0} pt={6}>
            {today.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {today.map(renderEvent)}
              </VStack>
            ) : (
              <Box textAlign="center" py={8}>
                <Icon as={FiClock} size="2em" color="gray.400" />
                <Text color="gray.500" mt={2}>
                  No meetings scheduled for today
                </Text>
              </Box>
            )}
          </TabPanel>

          {/* Past Tab */}
          <TabPanel p={0} pt={6}>
            {past.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {past.slice(0, 20).map(renderEvent)}
                {past.length > 20 && (
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Showing 20 most recent past events of {past.length} total
                  </Text>
                )}
              </VStack>
            ) : (
              <Box textAlign="center" py={8}>
                <Icon as={FiCheckCircle} size="2em" color="gray.400" />
                <Text color="gray.500" mt={2}>
                  No past meetings found
                </Text>
              </Box>
            )}
          </TabPanel>

          {/* Cancelled Tab */}
          <TabPanel p={0} pt={6}>
            {cancelled.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {cancelled.slice(0, 20).map(renderEvent)}
                {cancelled.length > 20 && (
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Showing 20 most recent cancelled events of {cancelled.length} total
                  </Text>
                )}
              </VStack>
            ) : (
              <Box textAlign="center" py={8}>
                <Icon as={FiAlertCircle} size="2em" color="gray.400" />
                <Text color="gray.500" mt={2}>
                  No cancelled meetings found
                </Text>
              </Box>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}; 