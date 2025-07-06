import { Deal } from '../../stores/useDealsStore';
import { ApolloClient, gql } from '@apollo/client';

/**
 * ULTRA-MINIMAL CALENDAR SCHEDULER
 * 
 * Directly opens Google Calendar with deal context.
 * No modal, no extra clicks, pure magic.
 */

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

interface DirectScheduleOptions {
  deal: Deal;
  onSync?: (success: boolean) => void;
  toast?: any; // Toast function for notifications
  apolloClient?: ApolloClient<any>; // Optional Apollo client for sync
  useEmbeddedModal?: boolean; // Use embedded modal instead of new tab
  onOpenEmbeddedModal?: (deal: Deal) => void; // Callback to open embedded modal
}

export class DirectCalendarScheduler {
  private static syncInterval: NodeJS.Timeout | null = null;
  private static apolloClient: ApolloClient<any> | null = null;

  /**
   * Set Apollo Client for GraphQL operations
   */
  static setApolloClient(client: ApolloClient<any>): void {
    this.apolloClient = client;
  }

  /**
   * Main function: Schedule meeting (embedded modal or new tab)
   */
  static scheduleMeeting({ deal, toast, apolloClient, useEmbeddedModal, onOpenEmbeddedModal }: DirectScheduleOptions): void {
    // Store Apollo client if provided
    if (apolloClient) {
      this.apolloClient = apolloClient;
    }

    // Option 1: Use embedded modal for better UX
    if (useEmbeddedModal && onOpenEmbeddedModal) {
      onOpenEmbeddedModal(deal);
      
      // Start silent auto-sync for embedded modal
      this.startSilentAutoSync(toast);
      return;
    }

    // Option 2: Fallback to new tab (legacy behavior)
    // 1. Build Google Calendar URL with deal context
    const calendarUrl = this.buildGoogleCalendarUrl(deal);
    
    // 2. Open Google Calendar immediately
    window.open(calendarUrl, '_blank');
    
    // 3. Show minimal feedback
    if (toast) {
      toast({
        title: '📅 Google Calendar opened',
        description: 'Meeting will automatically appear in your PipeCD timeline.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
    
    // 4. Start silent auto-sync
    this.startSilentAutoSync(toast);
  }

  /**
   * Build Google Calendar URL with embedded deal context
   */
  static buildGoogleCalendarUrl(deal: Deal): string {
    const startTime = this.getNextBusinessHour();
    const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour

    const description = this.generateMeetingDescription(deal);
    const attendees = deal.person?.email || '';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Meeting: ${deal.name}`,
      details: description,
      dates: `${this.formatGoogleCalendarDate(startTime)}/${this.formatGoogleCalendarDate(endTime)}`,
      add: attendees,
      location: 'Google Meet',
      src: 'PipeCD'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Generate meeting description with deal context (THE MAGIC)
   */
  private static generateMeetingDescription(deal: Deal): string {
    return [
      `Meeting regarding: ${deal.name}`,
      '',
      '📊 Deal Context:',
      `• Value: ${deal.amount ? `${deal.currency || 'USD'} ${deal.amount.toLocaleString()}` : 'TBD'}`,
      `• Organization: ${deal.organization?.name || 'Not specified'}`,
      `• Contact: ${deal.person ? `${deal.person.first_name} ${deal.person.last_name}` : 'Not specified'}`,
      `• Stage: ${deal.currentWfmStep?.status?.name || 'Not specified'}`,
      '',
      '🔗 Created from PipeCD CRM',
      `Deal ID: ${deal.id}` // ← THE MAGIC: Auto-linking
    ].join('\n');
  }

  /**
   * Get next business hour (simple logic)
   */
  private static getNextBusinessHour(): Date {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 2, 0, 0, 0);

    // Weekend/after-hours → next Monday 9 AM
    const day = nextHour.getDay();
    const hour = nextHour.getHours();
    
    if (day === 0 || day === 6 || hour < 9 || hour >= 17) {
      const nextMonday = new Date(nextHour);
      const daysUntilMonday = day === 0 ? 1 : (8 - day);
      nextMonday.setDate(nextHour.getDate() + daysUntilMonday);
      nextMonday.setHours(9, 0, 0, 0);
      return nextMonday;
    }

    return nextHour;
  }

  /**
   * Format date for Google Calendar URL
   */
  private static formatGoogleCalendarDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /**
   * Silent background auto-sync (with real GraphQL integration)
   */
  private static startSilentAutoSync(toast?: any): void {
    // Clear any existing sync
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    let attempts = 0;
    const maxAttempts = 8; // 2 minutes

    this.syncInterval = setInterval(async () => {
      attempts++;

      try {
        const hasNewEvents = await this.checkForNewEvents();

        if (hasNewEvents) {
          clearInterval(this.syncInterval!);
          this.syncInterval = null;
          
          if (toast) {
            toast({
              title: '✅ Meeting synced!',
              description: 'Meeting now appears in both Google Calendar and PipeCD.',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          }
        }

        // Timeout
        if (attempts >= maxAttempts) {
          clearInterval(this.syncInterval!);
          this.syncInterval = null;
        }
      } catch (error) {
        // Silent failure - continue
        console.log('Auto-sync check failed, continuing...');
      }
    }, 15000); // Every 15 seconds
  }

  /**
   * Check for new events (with real GraphQL integration)
   */
  private static async checkForNewEvents(): Promise<boolean> {
    if (!this.apolloClient) {
      console.log('No Apollo client available for sync');
      return false;
    }

    try {
      const result = await this.apolloClient.mutate({
        mutation: SYNC_CALENDAR_EVENTS,
        variables: {
          daysPast: 0,    // Only today
          daysFuture: 1,  // Only tomorrow  
          fullSync: false // Quick sync
        }
      });

      const syncData = result.data?.syncCalendarEvents;
      if (syncData?.eventsCount > 0) {
        return true; // New events found
      }

      return false; // No new events
    } catch (error) {
      console.log('GraphQL sync failed:', error);
      return false;
    }
  }

  /**
   * Stop any running auto-sync
   */
  static stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
} 