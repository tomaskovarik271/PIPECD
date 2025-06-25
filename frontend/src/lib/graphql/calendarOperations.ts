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

// Contact suggestions for email autocomplete
export const SEARCH_GOOGLE_CONTACTS = gql`
  query SearchGoogleContacts($query: String!) {
    searchGoogleContacts(query: $query) {
      email
      name
      photoUrl
    }
  }
`; 