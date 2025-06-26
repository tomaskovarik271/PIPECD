import { gql } from '@apollo/client';

// Queries
export const GET_UPCOMING_MEETINGS = gql`
  query GetUpcomingMeetings($days: Int, $limit: Int) {
    upcomingMeetings(days: $days, limit: $limit) {
      id
      googleEventId
      googleCalendarId
      title
      description
      startTime
      endTime
      isAllDay
      timezone
      location
      googleMeetLink
      eventType
      outcome
      outcomeNotes
      nextActions
      isCancelled
      lastSyncedAt
      createdAt
      updatedAt
      deal {
        id
        name
        amount
        currency
      }
      person {
        id
        first_name
        last_name
        email
      }
      organization {
        id
        name
      }
    }
  }
`;

export const GET_GOOGLE_CALENDARS = gql`
  query GetGoogleCalendars {
    googleCalendars {
      id
      summary
      description
      timeZone
      colorId
      backgroundColor
      foregroundColor
      primary
      accessRole
    }
  }
`;

// New: Check availability for smart time suggestions
export const CHECK_AVAILABILITY = gql`
  query CheckAvailability($timeRange: CalendarTimeRangeInput!, $calendarIds: [String!]) {
    checkAvailability(timeRange: $timeRange, calendarIds: $calendarIds) {
      start
      end
      available
    }
  }
`;

// Enhanced: Contact suggestions with query parameter
export const SEARCH_GOOGLE_CONTACTS = gql`
  query SearchGoogleContacts($query: String!) {
    searchGoogleContacts(query: $query) {
      email
      name
      photoUrl
    }
  }
`;

// Mutations
export const CREATE_CALENDAR_EVENT = gql`
  mutation CreateCalendarEvent($input: CreateCalendarEventInput!) {
    createCalendarEvent(input: $input) {
      id
      googleEventId
      googleCalendarId
      title
      description
      startTime
      endTime
      isAllDay
      timezone
      location
      googleMeetLink
      eventType
      outcome
      outcomeNotes
      nextActions
      isCancelled
      lastSyncedAt
      createdAt
      updatedAt
      deal {
        id
        name
      }
      person {
        id
        first_name
        last_name
        email
      }
      organization {
        id
        name
      }
    }
  }
`;

// Deal-specific calendar queries (for integration into deal detail page)
export const GET_DEAL_CALENDAR_EVENTS = gql`
  query GetDealCalendarEvents($dealId: ID!) {
    dealCalendarEvents(dealId: $dealId) {
      id
      googleEventId
      googleCalendarId
      title
      description
      startTime
      endTime
      isAllDay
      timezone
      location
      googleMeetLink
      eventType
      outcome
      outcomeNotes
      nextActions
      isCancelled
      lastSyncedAt
      createdAt
      updatedAt
      person {
        id
        first_name
        last_name
        email
      }
      organization {
        id
        name
      }
    }
  }
`;

// Enhanced: Auto-sync mutation with better parameters
export const SYNC_CALENDAR_EVENTS = gql`
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