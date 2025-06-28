import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Flex,
  Button,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Collapse
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
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { GET_DEAL_CALENDAR_EVENTS } from '../../lib/graphql/calendarOperations';
import { Deal } from '../../stores/useDealsStore';
import { useQuickSchedule } from '../../hooks/useQuickSchedule';

interface DealTimelinePanelProps {
  deal: Deal;
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

export const DealTimelinePanel: React.FC<DealTimelinePanelProps> = ({ deal }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'all'>('month');
  const [isCancelledExpanded, setIsCancelledExpanded] = useState(false);
  const toast = useToast();
  const { quickSchedule } = useQuickSchedule();

  // Colors for different themes - move all hook calls to top level
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const upcomingBg = useColorModeValue('blue.50', 'blue.900');
  const pastBg = useColorModeValue('gray.50', 'gray.700');
  const todayBg = useColorModeValue('green.50', 'green.900');
  const hoverBg = useColorModeValue('gray.50', 'gray.700'); // Move this from renderEvent

  // Query for deal-specific calendar events (auto-refreshes with background sync)
  const { data: calendarData, loading: calendarLoading, error: calendarError } = useQuery(
    GET_DEAL_CALENDAR_EVENTS,
    {
      variables: { dealId: deal.id },
      fetchPolicy: 'cache-and-network',
      pollInterval: 30000 // Auto-refresh every 30 seconds 🔄
    }
  );

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

  const renderEvent = (event: TimelineEvent) => {
    const startTime = new Date(event.startTime);
    const endTime = event.endTime ? new Date(event.endTime) : undefined;
    
    const getStatusIcon = () => {
      switch (event.status) {
        case 'completed':
          return <Icon as={FiCheckCircle} color="green.500" boxSize={3} />;
        case 'overdue':
          return <Icon as={FiAlertCircle} color="red.500" boxSize={3} />;
        case 'in_progress':
          return <Icon as={FiClock} color="orange.500" boxSize={3} />;
        case 'cancelled':
          return <Icon as={FiAlertCircle} color="gray.400" boxSize={3} />;
        default:
          return <Icon as={FiCalendar} color="blue.500" boxSize={3} />;
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

    return (
      <Box
        key={event.id}
        p={3}
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="md"
        borderLeft="3px solid"
        borderLeftColor={event.status === 'completed' ? 'green.400' : event.status === 'overdue' ? 'red.400' : event.status === 'cancelled' ? 'gray.400' : 'blue.400'}
        _hover={{ bg: hoverBg }}
        transition="background-color 0.2s"
      >
        {/* Header Row */}
        <HStack justify="space-between" mb={2}>
          <HStack spacing={2}>
            {getStatusIcon()}
            <Text fontWeight="semibold" fontSize="sm">
              {event.title}
            </Text>
            {isToday(startTime) && <Badge colorScheme="green" size="sm">TODAY</Badge>}
          </HStack>
          {event.eventType && (
            <Badge colorScheme={getEventTypeColor(event.eventType)} size="sm" fontSize="xs">
              {event.eventType.replace('_', ' ')}
            </Badge>
          )}
        </HStack>

        {/* Time Row */}
        <HStack spacing={2} mb={2} fontSize="sm" color="gray.600">
          <Icon as={FiClock} boxSize={3} />
          <Text>
            {format(startTime, 'MMM dd, HH:mm')}
            {endTime && ` - ${format(endTime, 'HH:mm')}`}
          </Text>
        </HStack>

        {/* Details Row */}
        <HStack spacing={4} fontSize="sm" color="gray.600" wrap="wrap">
          {event.person && (
            <HStack spacing={1}>
              <Icon as={FiUser} boxSize={3} />
              <Text>{event.person.first_name} {event.person.last_name}</Text>
            </HStack>
          )}
          
          {event.location && (
            <HStack spacing={1}>
              <Icon as={FiMapPin} boxSize={3} />
              <Text>{event.location}</Text>
            </HStack>
          )}

          {event.googleMeetLink && (
            <HStack spacing={1}>
              <Icon as={FiVideo} color="blue.500" boxSize={3} />
              <Text
                as="a"
                href={event.googleMeetLink}
                target="_blank"
                rel="noopener noreferrer"
                color="blue.600"
                _hover={{ textDecoration: 'underline' }}
              >
                Google Meet
              </Text>
            </HStack>
          )}
        </HStack>

        {/* Description */}
        {event.description && (
          <Text fontSize="sm" color="gray.600" mt={2} noOfLines={2}>
            {event.description}
          </Text>
        )}
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
      {/* Timeline Header */}
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <HStack spacing={3}>
          <Icon as={FiCalendar} color="blue.500" />
          <Text fontSize="lg" fontWeight="semibold">
            Meeting Timeline
          </Text>
          <Badge colorScheme="green" variant="subtle" fontSize="xs">
            🔄 Auto-sync
          </Badge>
        </HStack>
        
        <HStack spacing={2}>
          <Select size="sm" value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)} maxW="200px">
            <option value="week">Past & Next Week</option>
            <option value="month">Past & Next Month</option>
            <option value="quarter">Past & Next Quarter</option>
            <option value="all">All Time</option>
          </Select>
        </HStack>
      </Flex>

      {/* Error State */}
      {calendarError && (
        <Alert status="warning">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Calendar integration not fully configured</Text>
            <Text fontSize="sm">
              Connect your Google Calendar to enable automatic meeting timeline sync.
            </Text>
          </Box>
        </Alert>
      )}

      {/* Timeline Content */}
      <Tabs variant="soft-rounded" colorScheme="blue">
        <TabList>
          <Tab>
            <Icon as={FiCalendar} mr={2} />
            All Events
            <Badge ml={2} variant="subtle">
              {overdue.length + today.length + upcoming.length + past.length + cancelled.length}
            </Badge>
          </Tab>
          <Tab>
            <Icon as={FiClock} mr={2} />
            Upcoming
            <Badge ml={2} colorScheme="blue" variant="subtle">
              {upcoming.length}
            </Badge>
          </Tab>
          <Tab>
            <Icon as={FiCheckCircle} mr={2} />
            Today
            <Badge ml={2} colorScheme="green" variant="subtle">
              {today.length}
            </Badge>
          </Tab>
          <Tab>
            <Icon as={FiCheckCircle} mr={2} />
            Past
            <Badge ml={2} variant="subtle">
              {past.length}
            </Badge>
          </Tab>
        </TabList>

        <TabPanels>
          {/* All Events */}
          <TabPanel p={0} pt={6}>
            <VStack spacing={4} align="stretch">
              {/* Overdue Section */}
              {overdue.length > 0 && (
                <Box>
                  <HStack mb={3}>
                    <Icon as={FiAlertCircle} color="red.500" boxSize={4} />
                    <Text fontWeight="semibold" color="red.500" fontSize="sm">
                      Overdue ({overdue.length})
                    </Text>
                  </HStack>
                  <VStack spacing={2} align="stretch">
                    {overdue.map(renderEvent)}
                  </VStack>
                </Box>
              )}

              {/* Today Section */}
              {today.length > 0 && (
                <Box>
                  <HStack mb={3}>
                    <Icon as={FiClock} color="green.500" boxSize={4} />
                    <Text fontWeight="semibold" color="green.500" fontSize="sm">
                      Today ({today.length})
                    </Text>
                  </HStack>
                  <VStack spacing={2} align="stretch">
                    {today.map(renderEvent)}
                  </VStack>
                </Box>
              )}

              {/* Upcoming Section */}
              {upcoming.length > 0 && (
                <Box>
                  <HStack mb={3}>
                    <Icon as={FiCalendar} color="blue.500" boxSize={4} />
                    <Text fontWeight="semibold" color="blue.500" fontSize="sm">
                      Upcoming ({upcoming.length})
                    </Text>
                  </HStack>
                  <VStack spacing={2} align="stretch">
                    {upcoming.map(renderEvent)}
                  </VStack>
                </Box>
              )}

              {/* Past Section */}
              {past.length > 0 && (
                <Box>
                  <HStack mb={3}>
                    <Icon as={FiCheckCircle} color="gray.500" boxSize={4} />
                    <Text fontWeight="semibold" color="gray.500" fontSize="sm">
                      Completed ({past.length})
                    </Text>
                  </HStack>
                  <VStack spacing={2} align="stretch">
                    {past.slice(0, 10).map(renderEvent)}
                    {past.length > 10 && (
                      <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
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
                    mb={3}
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
                      boxSize={3}
                    />
                    <Icon as={FiAlertCircle} color="gray.500" boxSize={4} />
                    <Text fontWeight="semibold" color="gray.500" fontSize="sm">
                      Cancelled ({cancelled.length})
                    </Text>
                    <Text fontSize="xs" color="gray.400" ml="auto">
                      {isCancelledExpanded ? 'Click to hide' : 'Click to show'}
                    </Text>
                  </HStack>
                  
                  <Collapse in={isCancelledExpanded} animateOpacity>
                    <VStack spacing={2} align="stretch">
                      {cancelled.slice(0, 10).map(renderEvent)}
                      {cancelled.length > 10 && (
                        <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
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
                    Schedule your first meeting with this deal to get started
                  </Text>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={() => quickSchedule({ deal })}
                  >
                    Schedule Meeting
                  </Button>
                </Box>
              )}
            </VStack>
          </TabPanel>

          {/* Upcoming Tab */}
          <TabPanel p={0} pt={6}>
            {upcoming.length > 0 ? (
              <VStack spacing={2} align="stretch">
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
              <VStack spacing={2} align="stretch">
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
              <VStack spacing={2} align="stretch">
                {past.slice(0, 20).map(renderEvent)}
                {past.length > 20 && (
                  <Text fontSize="xs" color="gray.500" textAlign="center" mt={4}>
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
        </TabPanels>
      </Tabs>
    </VStack>
  );
}; 