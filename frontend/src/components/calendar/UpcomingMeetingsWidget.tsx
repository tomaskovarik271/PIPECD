import React from 'react';
import { useQuery } from '@apollo/client';
import { Box, Text, VStack, Card, Badge, HStack, Icon } from '@chakra-ui/react';
import { FiCalendar, FiVideo, FiMapPin, FiUser } from 'react-icons/fi';
import { GET_UPCOMING_MEETINGS } from '../../lib/graphql/calendarOperations';
import { format } from 'date-fns';

interface UpcomingMeetingsWidgetProps {
  dealId?: string; // Optional prop to filter meetings for a specific deal
}

export const UpcomingMeetingsWidget: React.FC<UpcomingMeetingsWidgetProps> = ({ dealId }) => {
  const { data, loading, error } = useQuery(GET_UPCOMING_MEETINGS, {
    variables: { days: 7, limit: 5 },
    errorPolicy: 'all'
  });

  if (loading) {
    return (
      <Card p={4}>
        <Text>Loading upcoming meetings...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card p={4}>
        <Text color="red.500">
          Calendar integration not yet configured: {error.message}
        </Text>
        <Text fontSize="sm" color="gray.500" mt={2}>
          Connect your Google Calendar to see upcoming meetings here.
        </Text>
      </Card>
    );
  }

  const meetings = data?.upcomingMeetings || [];
  
  // Filter meetings by dealId if provided
  const filteredMeetings = dealId 
    ? meetings.filter((meeting: any) => meeting.deal?.id === dealId)
    : meetings;

  if (filteredMeetings.length === 0) {
    const noMeetingsMessage = dealId 
      ? "No upcoming meetings for this deal in the next 7 days"
      : "No upcoming meetings in the next 7 days";
      
    return (
      <Card p={4}>
        <HStack mb={2}>
          <Icon as={FiCalendar} />
          <Text fontWeight="bold">Upcoming Meetings</Text>
        </HStack>
        <Text color="gray.500">{noMeetingsMessage}</Text>
      </Card>
    );
  }

  return (
    <Card p={4}>
      <HStack mb={4}>
        <Icon as={FiCalendar} />
        <Text fontWeight="bold">
          {dealId ? "Deal Meetings" : "Upcoming Meetings"}
        </Text>
      </HStack>
      
      <VStack spacing={3} align="stretch">
        {filteredMeetings.map((meeting: any) => (
          <Box
            key={meeting.id}
            p={3}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            bg="gray.50"
          >
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="semibold" fontSize="sm">
                {meeting.title}
              </Text>
              <Badge colorScheme={getEventTypeColor(meeting.eventType)}>
                {meeting.eventType}
              </Badge>
            </HStack>
            
            <VStack spacing={1} align="start" fontSize="xs" color="gray.600">
              <HStack>
                <Icon as={FiCalendar} />
                <Text>
                  {format(new Date(meeting.startTime), 'MMM dd, yyyy HH:mm')}
                </Text>
              </HStack>
              
              {meeting.location && (
                <HStack>
                  <Icon as={FiMapPin} />
                  <Text>{meeting.location}</Text>
                </HStack>
              )}
              
              {meeting.googleMeetLink && (
                <HStack>
                  <Icon as={FiVideo} />
                  <Text 
                    as="a" 
                    href={meeting.googleMeetLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    color="blue.600"
                    _hover={{textDecoration: 'underline'}}
                  >
                    Join Google Meet
                  </Text>
                </HStack>
              )}
              
              {!dealId && meeting.deal && (
                <HStack>
                  <Icon as={FiUser} />
                  <Text>
                    Deal: {meeting.deal.name} 
                    {meeting.deal.amount && ` (${meeting.deal.currency || 'USD'} ${meeting.deal.amount})`}
                  </Text>
                </HStack>
              )}
              
              {meeting.person && (
                <HStack>
                  <Icon as={FiUser} />
                  <Text>
                    with {meeting.person.first_name} {meeting.person.last_name}
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Card>
  );
};

function getEventTypeColor(eventType: string): string {
  switch (eventType) {
    case 'DEMO':
      return 'blue';
    case 'PROPOSAL_PRESENTATION':
      return 'purple';
    case 'CONTRACT_REVIEW':
      return 'orange';
    case 'FOLLOW_UP':
      return 'green';
    default:
      return 'gray';
  }
} 