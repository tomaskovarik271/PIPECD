import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
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
  Tooltip
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
  FiRefreshCw
} from 'react-icons/fi';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { GET_DEAL_CALENDAR_EVENTS } from '../../lib/graphql/calendarOperations';
import { ScheduleMeetingModal } from '../calendar/ScheduleMeetingModal';
import { Deal } from '../../stores/useDealsStore';

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
  status: 'completed' | 'upcoming' | 'overdue' | 'in_progress';
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
}

export const DealTimelinePanel: React.FC<DealTimelinePanelProps> = ({ deal }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'all'>('month');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

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
      errorPolicy: 'all'
    }
  );

  // Process and categorize events
  const processEvents = (): {
    overdue: TimelineEvent[];
    today: TimelineEvent[];
    upcoming: TimelineEvent[];
    past: TimelineEvent[];
  } => {
    const events: TimelineEvent[] = [];

    // Add calendar events
    if (calendarData?.dealCalendarEvents) {
      calendarData.dealCalendarEvents.forEach((event: any) => {
        const startTime = new Date(event.startTime);
        const endTime = event.endTime ? new Date(event.endTime) : undefined;
        
        let status: TimelineEvent['status'] = 'upcoming';
        if (isPast(endTime || startTime)) {
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
          nextActions: event.nextActions || []
        });
      });
    }

    // Sort events by start time
    events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Categorize events
    const categorized = {
      overdue: events.filter(e => e.status === 'overdue'),
      today: events.filter(e => isToday(new Date(e.startTime))),
      upcoming: events.filter(e => e.status === 'upcoming' && isFuture(new Date(e.startTime))),
      past: events.filter(e => e.status === 'completed')
    };

    return categorized;
  };

  const { overdue, today, upcoming, past } = processEvents();

  const renderEvent = (event: TimelineEvent) => {
    const startTime = new Date(event.startTime);
    const endTime = event.endTime ? new Date(event.endTime) : undefined;
    
    const getEventBg = () => {
      if (isToday(startTime)) return todayBg;
      if (isPast(endTime || startTime)) return pastBg;
      return upcomingBg;
    };

    const getStatusIcon = () => {
      switch (event.status) {
        case 'completed':
          return <Icon as={FiCheckCircle} color="green.500" />;
        case 'overdue':
          return <Icon as={FiAlertCircle} color="red.500" />;
        case 'in_progress':
          return <Icon as={FiClock} color="orange.500" />;
        default:
          return <Icon as={FiCalendar} color="blue.500" />;
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
      <Card
        key={event.id}
        p={4}
        bg={getEventBg()}
        border="1px solid"
        borderColor={borderColor}
        borderLeft="4px solid"
        borderLeftColor={event.status === 'completed' ? 'green.400' : event.status === 'overdue' ? 'red.400' : 'blue.400'}
      >
        <VStack align="stretch" spacing={3}>
          {/* Header */}
          <HStack justify="space-between">
            <HStack>
              {getStatusIcon()}
              <Text fontWeight="bold" fontSize="md">
                {event.title}
              </Text>
            </HStack>
            {event.eventType && (
              <Badge colorScheme={getEventTypeColor(event.eventType)} size="sm">
                {event.eventType.replace('_', ' ')}
              </Badge>
            )}
          </HStack>

          {/* Description */}
          {event.description && (
            <Text fontSize="sm" color="gray.600">
              {event.description}
            </Text>
          )}

          {/* Time and Details */}
          <VStack spacing={2} align="start" fontSize="sm">
            <HStack>
              <Icon as={FiClock} color="gray.500" />
              <Text>
                {format(startTime, 'MMM dd, yyyy HH:mm')}
                {endTime && ` - ${format(endTime, 'HH:mm')}`}
                {isToday(startTime) && <Badge ml={2} colorScheme="green">TODAY</Badge>}
              </Text>
            </HStack>

            {event.location && (
              <HStack>
                <Icon as={FiMapPin} color="gray.500" />
                <Text>{event.location}</Text>
              </HStack>
            )}

            {event.googleMeetLink && (
              <HStack>
                <Icon as={FiVideo} color="blue.500" />
                <Text
                  as="a"
                  href={event.googleMeetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="blue.600"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Join Google Meet
                </Text>
              </HStack>
            )}

            {event.person && (
              <HStack>
                <Icon as={FiUser} color="gray.500" />
                <Text>
                  with {event.person.first_name} {event.person.last_name}
                </Text>
              </HStack>
            )}
          </VStack>

          {/* Outcome and Next Actions */}
          {(event.outcome || event.nextActions?.length) && (
            <VStack align="stretch" spacing={2}>
              <Divider />
              {event.outcome && (
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                    OUTCOME:
                  </Text>
                  <Text fontSize="sm">{event.outcome}</Text>
                  {event.outcomeNotes && (
                    <Text fontSize="xs" color="gray.600" mt={1}>
                      {event.outcomeNotes}
                    </Text>
                  )}
                </Box>
              )}
              
              {event.nextActions && event.nextActions.length > 0 && (
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                    NEXT ACTIONS:
                  </Text>
                  <VStack align="start" spacing={1}>
                    {event.nextActions.map((action, index) => (
                      <Text key={index} fontSize="sm">
                        • {action}
                      </Text>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          )}
        </VStack>
      </Card>
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
      {/* Header with Controls */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <Text fontSize="lg" fontWeight="bold">
          Deal Timeline & Activities
        </Text>
        
        <HStack spacing={3}>
          <Select
            size="sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            width="auto"
          >
            <option value="week">Past & Next Week</option>
            <option value="month">Past & Next Month</option>
            <option value="quarter">Past & Next Quarter</option>
            <option value="all">All Time</option>
          </Select>
          
          <Tooltip label="Refresh timeline">
            <IconButton
              size="sm"
              icon={<FiRefreshCw />}
              onClick={() => refetch()}
              variant="outline"
              aria-label="Refresh timeline"
            />
          </Tooltip>
          
          <Button
            size="sm"
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={() => setIsScheduleModalOpen(true)}
          >
            Schedule Meeting
          </Button>
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
              {overdue.length + today.length + upcoming.length + past.length}
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

              {/* Empty State */}
              {overdue.length === 0 && today.length === 0 && upcoming.length === 0 && past.length === 0 && (
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
                    onClick={() => setIsScheduleModalOpen(true)}
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
        </TabPanels>
      </Tabs>

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        deal={deal}
      />
    </VStack>
  );
}; 