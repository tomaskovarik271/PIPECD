import { google } from 'googleapis';
import { googleIntegrationService } from './googleIntegrationService';
import { getAuthenticatedClient } from './serviceUtils';

// Google Calendar API Types
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }[];
  conferenceData?: any;
  reminders?: {
    useDefault: boolean;
    overrides?: {
      method: 'email' | 'popup';
      minutes: number;
    }[];
  };
}

export interface CalendarEventInput {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone?: string;
  location?: string;
  attendeeEmails?: string[];
  addGoogleMeet?: boolean;
  reminders?: {
    method: 'email' | 'popup';
    minutes: number;
  }[];
  // CRM Context
  dealId?: string;
  personId?: string;
  organizationId?: string;
  eventType?: 'MEETING' | 'DEMO' | 'CALL' | 'PROPOSAL_PRESENTATION' | 'CONTRACT_REVIEW' | 'FOLLOW_UP' | 'CHECK_IN' | 'INTERNAL';
}

export interface CalendarEventUpdate {
  summary?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  timeZone?: string;
  location?: string;
  attendeeEmails?: string[];
  addGoogleMeet?: boolean;
  reminders?: {
    method: 'email' | 'popup';
    minutes: number;
  }[];
}

export interface CalendarList {
  id: string;
  summary: string;
  description?: string;
  timeZone: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  primary?: boolean;
  accessRole: string;
}

export interface TimeRange {
  start: string; // ISO 8601
  end: string;   // ISO 8601
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  available: boolean;
}

// Enhanced Calendar Event with CRM context
export interface CRMCalendarEvent extends CalendarEvent {
  crmContext?: {
    dealId?: string;
    personId?: string;
    organizationId?: string;
    eventType?: string;
    outcome?: 'COMPLETED' | 'RESCHEDULED' | 'NO_SHOW' | 'CANCELLED';
    outcomeNotes?: string;
    nextActions?: string[];
  };
}

class GoogleCalendarService {
  private async getCalendarClient(userId: string, accessToken: string) {
    try {
      const tokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      if (!tokens) {
        throw new Error('CALENDAR_NOT_CONNECTED');
      }

      // Check if we have calendar scope
      const requiredScope = 'https://www.googleapis.com/auth/calendar';
      if (!tokens.granted_scopes.includes(requiredScope)) {
        throw new Error('CALENDAR_SCOPE_MISSING');
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      // Set up automatic token refresh
      oauth2Client.on('tokens', async (newTokens) => {
        if (newTokens.refresh_token) {
          await googleIntegrationService.storeExtendedTokens(
            userId,
            {
              access_token: newTokens.access_token!,
              refresh_token: newTokens.refresh_token,
              expires_at: newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : undefined,
              granted_scopes: tokens.granted_scopes
            },
            accessToken
          );
        } else if (newTokens.access_token) {
          const supabase = getAuthenticatedClient(accessToken);
          await supabase
            .from('google_oauth_tokens')
            .update({
              access_token: newTokens.access_token,
              expires_at: newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : null,
              last_used_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        }
      });

      return google.calendar({ version: 'v3', auth: oauth2Client });
    } catch (error) {
      console.error('Error creating Google Calendar client:', error);
      throw error;
    }
  }

  /**
   * Format Google Calendar API response to our interface
   */
  private formatCalendarEvent(event: any): CalendarEvent {
    return {
      id: event.id,
      summary: event.summary || 'No Title',
      description: event.description || undefined,
      start: {
        dateTime: event.start?.dateTime || undefined,
        date: event.start?.date || undefined,
        timeZone: event.start?.timeZone || undefined
      },
      end: {
        dateTime: event.end?.dateTime || undefined,
        date: event.end?.date || undefined,
        timeZone: event.end?.timeZone || undefined
      },
      location: event.location || undefined,
      attendees: event.attendees?.map((attendee: any) => ({
        email: attendee.email,
        displayName: attendee.displayName || undefined,
        responseStatus: attendee.responseStatus
      })),
      conferenceData: event.conferenceData,
      reminders: event.reminders
    };
  }

  /**
   * Get user's calendar list
   */
  async getCalendarList(userId: string, accessToken: string): Promise<CalendarList[]> {
    try {
      const calendar = await this.getCalendarClient(userId, accessToken);
      
      const response = await calendar.calendarList.list({
        minAccessRole: 'owner'
      });

      return response.data.items?.map(item => ({
        id: item.id!,
        summary: item.summary!,
        description: item.description || undefined,
        timeZone: item.timeZone!,
        colorId: item.colorId || undefined,
        backgroundColor: item.backgroundColor || undefined,
        foregroundColor: item.foregroundColor || undefined,
        primary: item.primary || undefined,
        accessRole: item.accessRole!
      })) || [];
    } catch (error) {
      console.error('Error fetching calendar list:', error);
      throw new Error('Failed to fetch calendar list');
    }
  }

  /**
   * Get events from a specific calendar
   */
  async getEvents(
    userId: string, 
    accessToken: string, 
    calendarId: string = 'primary',
    timeRange?: TimeRange,
    maxResults: number = 250
  ): Promise<CalendarEvent[]> {
    try {
      const calendar = await this.getCalendarClient(userId, accessToken);
      
      const response = await calendar.events.list({
        calendarId,
        timeMin: timeRange?.start || new Date().toISOString(),
        timeMax: timeRange?.end,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items?.map(event => this.formatCalendarEvent(event)) || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw new Error('Failed to fetch calendar events');
    }
  }

  /**
   * Create a new calendar event
   */
  async createEvent(
    userId: string,
    accessToken: string,
    eventData: CalendarEventInput,
    calendarId: string = 'primary'
  ): Promise<CalendarEvent> {
    try {
      const calendar = await this.getCalendarClient(userId, accessToken);

      // Ensure proper ISO 8601 format for dateTime fields
      const formatDateTime = (dateTime: string, timeZone: string = 'UTC'): string => {
        const date = new Date(dateTime);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date format: ${dateTime}`);
        }
        // Return the ISO string as-is since it's already in the correct format
        // Google Calendar will interpret this according to the timeZone field
        return date.toISOString();
      };

      const eventPayload: any = {
        summary: eventData.summary,
        description: eventData.description,
        start: {
          dateTime: formatDateTime(eventData.startDateTime, eventData.timeZone),
          timeZone: eventData.timeZone || 'UTC'
        },
        end: {
          dateTime: formatDateTime(eventData.endDateTime, eventData.timeZone),
          timeZone: eventData.timeZone || 'UTC'
        },
        location: eventData.location,
        attendees: eventData.attendeeEmails?.map(email => ({ email })),
        reminders: {
          useDefault: !eventData.reminders,
          overrides: eventData.reminders
        }
      };

      // Add Google Meet if requested
      if (eventData.addGoogleMeet) {
        eventPayload.conferenceData = {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        };
      }

      const response = await calendar.events.insert({
        calendarId,
        requestBody: eventPayload,
        conferenceDataVersion: eventData.addGoogleMeet ? 1 : 0
      });

      // Store CRM context in our database if provided
      if (eventData.dealId || eventData.personId || eventData.organizationId) {
        await this.storeCRMContext(
          userId,
          accessToken,
          response.data.id!,
          calendarId,
          {
            dealId: eventData.dealId,
            personId: eventData.personId,
            organizationId: eventData.organizationId,
            eventType: eventData.eventType || 'MEETING'
          }
        );
      }

      return this.formatCalendarEvent(response.data);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      
      // Log more details about the Google API error
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as any;
        console.error('Google Calendar API Error Details:');
        console.error('Status:', apiError.status);
        console.error('Message:', apiError.message);
        if (apiError.response?.data?.error) {
          console.error('API Error:', JSON.stringify(apiError.response.data.error, null, 2));
        }
      }
      
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(
    userId: string,
    accessToken: string,
    eventId: string,
    updates: CalendarEventUpdate,
    calendarId: string = 'primary'
  ): Promise<CalendarEvent> {
    try {
      const calendar = await this.getCalendarClient(userId, accessToken);

      // Get existing event first
      const existingEvent = await calendar.events.get({
        calendarId,
        eventId
      });

      const eventPayload: any = {
        ...existingEvent.data,
        summary: updates.summary || existingEvent.data.summary,
        description: updates.description !== undefined ? updates.description : existingEvent.data.description,
        location: updates.location !== undefined ? updates.location : existingEvent.data.location
      };

      if (updates.startDateTime) {
        eventPayload.start = {
          dateTime: updates.startDateTime,
          timeZone: updates.timeZone || existingEvent.data.start?.timeZone || 'UTC'
        };
      }

      if (updates.endDateTime) {
        eventPayload.end = {
          dateTime: updates.endDateTime,
          timeZone: updates.timeZone || existingEvent.data.end?.timeZone || 'UTC'
        };
      }

      if (updates.attendeeEmails) {
        eventPayload.attendees = updates.attendeeEmails.map(email => ({ email }));
      }

      if (updates.reminders) {
        eventPayload.reminders = {
          useDefault: false,
          overrides: updates.reminders
        };
      }

      // Handle Google Meet updates
      if (updates.addGoogleMeet !== undefined) {
        if (updates.addGoogleMeet && !existingEvent.data.conferenceData) {
          eventPayload.conferenceData = {
            createRequest: {
              requestId: `meet-${Date.now()}`,
              conferenceSolutionKey: {
                type: 'hangoutsMeet'
              }
            }
          };
        } else if (!updates.addGoogleMeet) {
          eventPayload.conferenceData = null;
        }
      }

      const response = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: eventPayload,
        conferenceDataVersion: updates.addGoogleMeet ? 1 : 0
      });

      return this.formatCalendarEvent(response.data);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(
    userId: string,
    accessToken: string,
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<boolean> {
    try {
      const calendar = await this.getCalendarClient(userId, accessToken);

      await calendar.events.delete({
        calendarId,
        eventId
      });

      // Clean up CRM context
      await this.removeCRMContext(userId, accessToken, eventId);

      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * Check availability for a time range
   */
  async checkAvailability(
    userId: string,
    accessToken: string,
    timeRange: TimeRange,
    calendarIds: string[] = ['primary']
  ): Promise<AvailabilitySlot[]> {
    try {
      const calendar = await this.getCalendarClient(userId, accessToken);

      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: timeRange.start,
          timeMax: timeRange.end,
          items: calendarIds.map(id => ({ id }))
        }
      });

      // Process free/busy data to create availability slots
      const availability: AvailabilitySlot[] = [];
      
      // This is a simplified implementation - you'd want more sophisticated logic
      // to handle multiple calendars and create proper availability slots
      
      return availability;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw new Error('Failed to check availability');
    }
  }

  /**
   * Store CRM context for a calendar event
   */
  private async storeCRMContext(
    userId: string,
    accessToken: string,
    googleEventId: string,
    calendarId: string,
    context: {
      dealId?: string;
      personId?: string;
      organizationId?: string;
      eventType?: string;
    }
  ): Promise<void> {
    try {
      const supabase = getAuthenticatedClient(accessToken);

      // Get event details to populate our table
      const calendar = await this.getCalendarClient(userId, accessToken);
      const eventResponse = await calendar.events.get({
        calendarId,
        eventId: googleEventId
      });

      const event = eventResponse.data;

      const insertData = {
        user_id: userId,
        google_calendar_id: calendarId,
        google_event_id: googleEventId,
        deal_id: context.dealId,
        person_id: context.personId,
        organization_id: context.organizationId,
        event_type: context.eventType || 'MEETING',
        title: event.summary || 'No Title',
        description: event.description,
        start_time: event.start?.dateTime || event.start?.date,
        end_time: event.end?.dateTime || event.end?.date,
        is_all_day: !event.start?.dateTime,
        timezone: event.start?.timeZone || 'UTC',
        location: event.location,
        google_meet_link: event.conferenceData?.entryPoints?.[0]?.uri
      };

      const { data, error } = await supabase.from('calendar_events').insert(insertData);

      if (error) {
        console.error('Database error storing calendar event:', error);
        throw error;
      }

      // Log the sync action
      await supabase.from('calendar_sync_log').insert({
        user_id: userId,
        sync_action: 'ADD_CRM_CONTEXT',
        sync_direction: 'CRM_TO_GOOGLE',
        sync_source: 'API',
        google_event_id: googleEventId,
        calendar_id: calendarId,
        success: true,
        processing_time_ms: 0
      });
    } catch (error) {
      console.error('Error storing CRM context:', error);
      // Don't throw - this shouldn't break calendar event creation
      if (error && typeof error === 'object') {
        console.error('Full error details:', JSON.stringify(error, null, 2));
      }
    }
  }

  /**
   * Remove CRM context for a calendar event
   */
  private async removeCRMContext(
    userId: string,
    accessToken: string,
    googleEventId: string
  ): Promise<void> {
    try {
      const supabase = getAuthenticatedClient(accessToken);

      await supabase
        .from('calendar_events')
        .delete()
        .eq('user_id', userId)
        .eq('google_event_id', googleEventId);
    } catch (error) {
      console.error('Error removing CRM context:', error);
      // Don't throw - this shouldn't break calendar event deletion
    }
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService(); 