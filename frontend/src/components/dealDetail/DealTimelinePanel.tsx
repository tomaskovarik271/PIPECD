import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
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
  IconButton,
  Tooltip,
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
  FiRefreshCw,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { GET_DEAL_CALENDAR_EVENTS } from '../../lib/graphql/calendarOperations';
import { GET_TIMELINE_TASKS } from '../../lib/graphql/taskOperations';
import { ScheduleMeetingModal } from '../calendar/ScheduleMeetingModal';
import { TasksList } from '../tasks';
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
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
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

  // Query for deal-specific tasks
  const { data: tasksData, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useQuery(
    GET_TIMELINE_TASKS,
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

    // Add tasks
    if (tasksData?.timelineTasks) {
      tasksData.timelineTasks.forEach((task: any) => {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        
        let status: TimelineEvent['status'] = 'upcoming';
        
        if (task.status === 'completed') {
          status = 'completed';
        } else if (task.status === 'cancelled') {
          status = 'cancelled';
        } else if (task.status === 'in_progress') {
          status = 'in_progress';
        } else if (dueDate && isPast(dueDate)) {
          status = 'overdue';
        } else if (dueDate && isToday(dueDate)) {
          status = 'in_progress';
        }

        events.push({
          id: task.id,
          type: 'task',
          title: task.title,
          description: task.description,
          startTime: task.dueDate || task.createdAt,
          endTime: undefined,
          eventType: task.type,
          status,
          location: undefined,
          googleMeetLink: undefined,
          person: task.assignedToUser ? {
            id: task.assignedToUser.id,
            first_name: task.assignedToUser.firstName || '',
            last_name: task.assignedToUser.lastName || '',
            email: task.assignedToUser.email
          } : undefined,
          outcome: undefined,
          outcomeNotes: task.notes,
          nextActions: [],
          isCancelled: task.status === 'cancelled'
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
      // For tasks, use task-specific icons
      if (event.type === 'task') {
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
            return <Text fontSize="sm">📋</Text>; // Task icon
        }
      }
      
      // For calendar events, use calendar-specific icons
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
      // Calendar event types
      if (event.type === 'calendar') {
        switch (type) {
          case 'DEMO': return 'blue';
          case 'PROPOSAL_PRESENTATION': return 'purple';
          case 'CONTRACT_REVIEW': return 'orange';
          case 'FOLLOW_UP': return 'green';
          case 'CHECK_IN': return 'teal';
          default: return 'gray';
        }
      }
      
      // Task types
      if (event.type === 'task') {
        switch (type) {
          case 'call': return 'blue';
          case 'email': return 'purple';
          case 'meeting_prep': return 'teal';
          case 'post_meeting': return 'cyan';
          case 'follow_up': return 'green';
          case 'deadline': return 'red';
          case 'research': return 'yellow';
          case 'admin': return 'gray';
          case 'creative': return 'pink';
          default: return 'gray';
        }
      }
      
      return 'gray';
    };

    const getTaskTypeEmoji = (type?: string): string => {
      switch (type) {
        case 'call': return '📞';
        case 'email': return '📧';
        case 'meeting_prep': return '🤝';
        case 'post_meeting': return '📋';
        case 'follow_up': return '🔄';
        case 'deadline': return '⏰';
        case 'research': return '🔍';
        case 'admin': return '📊';
        case 'creative': return '🎨';
        default: return '📋';
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
        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
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
              {event.type === 'task' 
                ? `${getTaskTypeEmoji(event.eventType)} ${event.eventType.replace('_', ' ')}`
                : event.eventType.replace('_', ' ')
              }
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

  if (calendarLoading || tasksLoading) {
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
          <Tab>
            <Text mr={2}>📋</Text>
            Tasks
            <Badge ml={2} colorScheme="purple" variant="subtle">
              {(overdue.length + today.length + upcoming.length + past.length + cancelled.length) - 
               (overdue.filter(e => e.type === 'calendar').length + 
                today.filter(e => e.type === 'calendar').length + 
                upcoming.filter(e => e.type === 'calendar').length + 
                past.filter(e => e.type === 'calendar').length + 
                cancelled.filter(e => e.type === 'calendar').length)}
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

          {/* Tasks Tab */}
          <TabPanel p={0} pt={6}>
            <TasksList
              dealId={deal.id}
              compact={true}
              showFilters={true}
              maxHeight="500px"
            />
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