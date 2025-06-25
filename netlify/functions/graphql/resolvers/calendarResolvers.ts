import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken } from '../helpers';
import { googleCalendarService } from '../../../../lib/googleCalendarService';
import { getAuthenticatedClient } from '../../../../lib/serviceUtils';
import { dealService } from '../../../../lib/dealService';

// Database to GraphQL type mappers
function mapDbCalendarEventToGraphQL(dbEvent: any) {
  return {
    id: dbEvent.id,
    googleEventId: dbEvent.google_event_id,
    googleCalendarId: dbEvent.google_calendar_id,
    title: dbEvent.title,
    description: dbEvent.description || null,
    startTime: dbEvent.start_time,
    endTime: dbEvent.end_time,
    isAllDay: dbEvent.is_all_day || false,
    timezone: dbEvent.timezone || 'UTC',
    location: dbEvent.location || null,
    googleMeetLink: dbEvent.google_meet_link || null,
    eventType: dbEvent.event_type || 'MEETING',
    outcome: dbEvent.outcome || null,
    outcomeNotes: dbEvent.outcome_notes || null,
    nextActions: dbEvent.next_actions || [],
    isCancelled: dbEvent.is_cancelled || false,
    attendees: [],
    lastSyncedAt: dbEvent.last_synced_at,
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at
  };
}

// Query Resolvers
export const calendarQueries = {
  upcomingMeetings: async (_: any, args: { days?: number; limit?: number }, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context)!;
    const supabase = getAuthenticatedClient(accessToken);
    const userId = context.user!.id;

    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (args.days || 7));

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', new Date().toISOString())
        .lte('start_time', endDate.toISOString())
        .eq('is_cancelled', false)
        .order('start_time', { ascending: true })
        .limit(args.limit || 10);

      if (error) {
        console.error('Error fetching upcoming meetings:', error);
        throw new GraphQLError('Failed to fetch upcoming meetings');
      }

      return (data || []).map(mapDbCalendarEventToGraphQL);
    } catch (error) {
      console.error('Error in upcomingMeetings query:', error);
      throw new GraphQLError('Failed to fetch upcoming meetings');
    }
  },

  googleCalendars: async (_: any, __: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context)!;
    const userId = context.user!.id;

    try {
      const calendars = await googleCalendarService.getCalendarList(userId, accessToken);
      return calendars.map(cal => ({
        id: cal.id,
        summary: cal.summary,
        description: cal.description || null,
        timeZone: cal.timeZone,
        colorId: cal.colorId || null,
        backgroundColor: cal.backgroundColor || null,
        foregroundColor: cal.foregroundColor || null,
        primary: cal.primary || false,
        accessRole: cal.accessRole
      }));
    } catch (error) {
      console.error('Error fetching Google calendars:', error);
      throw new GraphQLError('Failed to fetch Google calendars');
    }
  }
};

// Mutation Resolvers
export const calendarMutations = {
  createCalendarEvent: async (_: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context)!;
    const userId = context.user!.id;

    try {
      console.log('Calendar event creation started for user:', userId);
      console.log('Input args:', JSON.stringify(args.input, null, 2));

      const eventData = {
        summary: args.input.title,
        description: args.input.description,
        startDateTime: args.input.startDateTime,
        endDateTime: args.input.endDateTime,
        timeZone: args.input.timezone || 'UTC',
        location: args.input.location,
        attendeeEmails: args.input.attendeeEmails,
        addGoogleMeet: args.input.addGoogleMeet || false,
        dealId: args.input.dealId,
        personId: args.input.personId,
        organizationId: args.input.organizationId,
        eventType: args.input.eventType
      };

      console.log('Calling googleCalendarService.createEvent with:', JSON.stringify(eventData, null, 2));

      const createdEvent = await googleCalendarService.createEvent(
        userId,
        accessToken,
        eventData,
        args.input.calendarId || 'primary'
      );

      console.log('Google Calendar service returned:', JSON.stringify(createdEvent, null, 2));

      if (!createdEvent) {
        throw new GraphQLError('Failed to create calendar event - no response from Google Calendar API');
      }

      // Extract Google Meet link from conferenceData if available
      const googleMeetLink = createdEvent.conferenceData?.entryPoints?.find(
        (entry: any) => entry.entryPointType === 'video'
      )?.uri || null;

      return {
        id: createdEvent.id,
        googleEventId: createdEvent.id,
        googleCalendarId: args.input.calendarId || 'primary',
        title: createdEvent.summary,
        description: createdEvent.description || null,
        startTime: createdEvent.start.dateTime || createdEvent.start.date!,
        endTime: createdEvent.end.dateTime || createdEvent.end.date!,
        isAllDay: !createdEvent.start.dateTime,
        timezone: createdEvent.start.timeZone || 'UTC',
        location: createdEvent.location || null,
        googleMeetLink,
        eventType: args.input.eventType || 'MEETING',
        outcome: null,
        outcomeNotes: null,
        nextActions: [],
        isCancelled: false,
        attendees: createdEvent.attendees || [],
        lastSyncedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new GraphQLError('Failed to create calendar event');
    }
  }
};

// Field Resolvers
export const CalendarEvent = {
  deal: async (parent: any, _: any, context: GraphQLContext) => {
    if (!parent.deal_id) return null;
    
    requireAuthentication(context);
    const accessToken = getAccessToken(context)!;
    
    try {
      return await dealService.getDealById(parent.deal_id, accessToken);
    } catch (error) {
      console.error('Error fetching deal for calendar event:', error);
      return null;
    }
  }
};

export const calendarResolvers = {
  Query: calendarQueries,
  Mutation: calendarMutations,
  CalendarEvent
};
