import { useCallback, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useApolloClient, gql } from '@apollo/client';
import { DirectCalendarScheduler } from '../lib/utils/directCalendarScheduler';
import { Deal } from '../stores/useDealsStore';

/**
 * ULTRA-MINIMAL CALENDAR SCHEDULING HOOK
 * 
 * Provides quick calendar scheduling throughout the app.
 * One line of code: const { quickSchedule } = useQuickSchedule();
 * 
 * ✨ NEW: Automatic continuous background sync!
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

export interface QuickScheduleOptions {
  deal: Deal;
  successMessage?: string;
  onSync?: (success: boolean) => void;
}

export const useQuickSchedule = () => {
  const toast = useToast();
  const apolloClient = useApolloClient();

  // Set Apollo client for DirectCalendarScheduler
  DirectCalendarScheduler.setApolloClient(apolloClient);

  /**
   * 🔄 AUTOMATIC CONTINUOUS BACKGROUND SYNC
   * Syncs calendar events every 2 minutes silently
   */
  useEffect(() => {
    if (!apolloClient) return;

    const startContinuousSync = () => {
      // Initial sync
      performSilentSync();

      // Set up continuous sync every 2 minutes
      const syncInterval = setInterval(() => {
        performSilentSync();
      }, 120000); // 2 minutes

      return () => clearInterval(syncInterval);
    };

    const performSilentSync = async () => {
      try {
        const result = await apolloClient.mutate({
          mutation: SYNC_CALENDAR_EVENTS,
          variables: {
            daysPast: 1,    // Yesterday
            daysFuture: 7,  // Next week
            fullSync: false // Quick sync
          }
        });

        // Silent success - only log new events
        const syncData = result.data?.syncCalendarEvents;
        if (syncData?.eventsCount > 0) {
          console.log(`🔄 Auto-synced ${syncData.eventsCount} calendar events`);
        }
      } catch (error) {
        // Silent failure - don't interrupt user
        console.log('Background sync failed, will retry:', error);
      }
    };

    const cleanup = startContinuousSync();
    return cleanup;
  }, [apolloClient]);

  const quickSchedule = useCallback(
    ({ deal, successMessage, onSync }: QuickScheduleOptions) => {
      DirectCalendarScheduler.scheduleMeeting({
        deal,
        toast,
        apolloClient,
        onSync
      });

      // Optional custom success handling
      if (successMessage) {
        setTimeout(() => {
          toast({
            title: successMessage,
            status: 'info',
            duration: 2000,
            isClosable: true,
          });
        }, 500);
      }
    },
    [toast, apolloClient]
  );

  const stopAutoSync = useCallback(() => {
    DirectCalendarScheduler.stopAutoSync();
  }, []);

  return {
    quickSchedule,
    stopAutoSync,
    isReady: !!apolloClient // Indicates if scheduling is ready
  };
}; 