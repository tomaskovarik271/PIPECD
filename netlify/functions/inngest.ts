import { Inngest } from 'inngest';
import type { Handler } from '@netlify/functions';
import { supabaseAdmin } from '../../lib/supabaseClient';
import { getISOEndOfDay } from '../../lib/dateUtils';
import { serve } from 'inngest/lambda';

if (!process.env.INNGEST_EVENT_KEY) {
  throw new Error('INNGEST_EVENT_KEY environment variable is not set.');
}

if (!process.env.INNGEST_SIGNING_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('INNGEST_SIGNING_KEY environment variable is not set in production.');
  } else {
    console.warn('INNGEST_SIGNING_KEY environment variable is not set. Requests will not be signed.');
  }
}

if (!process.env.SYSTEM_USER_ID) {
    console.warn('SYSTEM_USER_ID environment variable is not set. Cannot create system-generated activities.');
}

export const inngest = new Inngest({
  id: 'pipe-cd-crm',
  eventKey: process.env.INNGEST_EVENT_KEY,
});

const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    console.log('[Inngest Fn: hello-world] Received event:', event.name);
    await step.run('log-event-data', async () => {
      console.log('[Inngest Fn: hello-world] Event data:', event.data);
      return { message: 'Logged event data' };
    });
    return { event: event.name, body: 'Hello World!' };
  }
);

const logContactCreation = inngest.createFunction(
  { id: 'log-contact-creation' },
  { event: 'crm/contact.created' },
  async ({ event, step }) => {
    console.log(`[Inngest Fn: log-contact-creation] Received event '${event.name}'`, event.data);

    await step.sleep('wait-a-bit', '50ms'); 

    const logMessage = `Contact created: ID=${event.data.contactId}, Email=${event.data.email}, Name=${event.data.firstName}`; 
    console.log(`[Inngest Fn: log-contact-creation] Processed: ${logMessage}`);

    return { success: true, message: logMessage };
  }
);

const logDealCreation = inngest.createFunction(
  { id: 'log-deal-creation' },
  { event: 'crm/deal.created' },
  async ({ event, step }) => {
    console.log(`[Inngest Fn: log-deal-creation] Received event '${event.name}'`);
    console.log('[Inngest Fn: log-deal-creation] Event Data:', event.data);
    console.log('[Inngest Fn: log-deal-creation] User Info:', event.user);

    await step.sleep('wait-a-moment', '100ms'); 

    const logMessage = `Deal created: ID=${event.data.dealId}, Name=${event.data.name}, Stage=${event.data.stage}, Amount=${event.data.amount}, ContactID=${event.data.contactId}`; 
    console.log(`[Inngest Fn: log-deal-creation] Processed: ${logMessage}`);

    return { success: true, message: logMessage };
  }
);

export const createDealAssignmentTask = inngest.createFunction(
  { id: 'create-deal-assignment-task', name: 'Create Deal Assignment Review Task' },
  { event: 'crm/deal.assigned' },
  async ({ event, step }) => {
    console.log('[Inngest Fn: createDealAssignmentTask] Received event \'crm/deal.assigned\' for deal:', event.data.dealName, '(ID:', event.data.dealId, '), assigned to:', event.data.assignedToUserId, 'by user:', event.data.assignedByUserId);
    if (event.data.previousAssignedToUserId) {
      console.log('[Inngest Fn: createDealAssignmentTask] Previous assignee was:', event.data.previousAssignedToUserId);
    }

    const systemUserId = process.env.SYSTEM_USER_ID;
    if (!systemUserId) {
      console.error('[Inngest Fn: createDealAssignmentTask] SYSTEM_USER_ID environment variable is not set. Skipping activity creation.');
      // Optionally, throw an error to make the step fail and retry if this is critical
      throw new Error('SYSTEM_USER_ID is not configured.'); 
    }

    try {
      const newActivity = await step.run('create-review-activity', async () => {
        if (!supabaseAdmin) {
          console.error('[Inngest Fn: createDealAssignmentTask] supabaseAdmin is not initialized. SUPABASE_SERVICE_ROLE_KEY might be missing. Skipping activity creation.');
          throw new Error('supabaseAdmin is not initialized. Cannot create system activity.');
        }

        const activityInput = {
          deal_id: event.data.dealId,
          user_id: systemUserId, // Activity created by the System User
          assigned_to_user_id: event.data.assignedToUserId, // Activity assigned to the user who got the deal
          type: 'SYSTEM_TASK',
          subject: `Review new deal assignment: ${event.data.dealName}`,
          notes: `Deal "${event.data.dealName}" (ID: ${event.data.dealId}) was assigned to user ID ${event.data.assignedToUserId} by user ID ${event.data.assignedByUserId}. Please review.`,
          due_date: getISOEndOfDay(),
          is_done: false,
          is_system_activity: true, // Mark as a system-generated activity
        };

        const { data: createdActivity, error: activityError } = await supabaseAdmin
          .from('activities')
          .insert(activityInput)
          .select()
          .single();

        if (activityError) {
          console.error('[Inngest Fn: createDealAssignmentTask] Error creating activity:', activityError);
          throw activityError; // This will make the Inngest step fail and retry
        }
        if (!createdActivity) {
          console.error('[Inngest Fn: createDealAssignmentTask] Failed to create activity, no data returned.');
          throw new Error('Failed to create activity, no data returned from insert.');
        }
        console.log('[Inngest Fn: createDealAssignmentTask] Successfully created activity ID:', createdActivity.id, 'for deal ID:', event.data.dealId);
        return createdActivity;
      });

      return { success: true, activityId: newActivity.id, message: `Activity created for deal ${event.data.dealName}` };
    } catch (error) {
      console.error('[Inngest Fn: createDealAssignmentTask] Overall error in function execution:', error);
      // Ensure the error is re-thrown if not handled by a step retry, so Inngest knows the run failed.
      throw error;
    }
  }
);

export const createLeadAssignmentTask = inngest.createFunction(
  { id: 'create-lead-assignment-task', name: 'Create Lead Assignment Review Task' },
  { event: 'crm/lead.assigned' },
  async ({ event, step }) => {
    console.log('[Inngest Fn: createLeadAssignmentTask] Received event \'crm/lead.assigned\' for lead:', event.data.leadName, '(ID:', event.data.leadId, '), assigned to:', event.data.assignedToUserId, 'by user:', event.data.assignedByUserId);
    if (event.data.previousAssignedToUserId) {
      console.log('[Inngest Fn: createLeadAssignmentTask] Previous assignee was:', event.data.previousAssignedToUserId);
    }

    const systemUserId = process.env.SYSTEM_USER_ID;
    if (!systemUserId) {
      console.error('[Inngest Fn: createLeadAssignmentTask] SYSTEM_USER_ID environment variable is not set. Skipping activity creation.');
      throw new Error('SYSTEM_USER_ID is not configured.'); 
    }

    try {
      const newActivity = await step.run('create-lead-review-activity', async () => {
        if (!supabaseAdmin) {
          console.error('[Inngest Fn: createLeadAssignmentTask] supabaseAdmin is not initialized. SUPABASE_SERVICE_ROLE_KEY might be missing. Skipping activity creation.');
          throw new Error('supabaseAdmin is not initialized. Cannot create system activity.');
        }

        const activityInput = {
          lead_id: event.data.leadId,
          user_id: systemUserId, // Activity created by the System User
          assigned_to_user_id: event.data.assignedToUserId, // Activity assigned to the user who got the lead
          type: 'SYSTEM_TASK',
          subject: `Review new lead assignment: ${event.data.leadName}`,
          notes: `Lead "${event.data.leadName}" (ID: ${event.data.leadId}) was assigned to user ID ${event.data.assignedToUserId} by user ID ${event.data.assignedByUserId}. Please review and follow up.`,
          due_date: getISOEndOfDay(),
          is_done: false,
          is_system_activity: true, // Mark as a system-generated activity
        };

        const { data: createdActivity, error: activityError } = await supabaseAdmin
          .from('activities')
          .insert(activityInput)
          .select()
          .single();

        if (activityError) {
          console.error('[Inngest Fn: createLeadAssignmentTask] Error creating activity:', activityError);
          throw activityError; // This will make the Inngest step fail and retry
        }
        if (!createdActivity) {
          console.error('[Inngest Fn: createLeadAssignmentTask] Failed to create activity, no data returned.');
          throw new Error('Failed to create activity, no data returned from insert.');
        }
        console.log('[Inngest Fn: createLeadAssignmentTask] Successfully created activity ID:', createdActivity.id, 'for lead ID:', event.data.leadId);
        return createdActivity;
      });

      return { success: true, activityId: newActivity.id, message: `Activity created for lead ${event.data.leadName}` };
    } catch (error) {
      console.error('[Inngest Fn: createLeadAssignmentTask] Overall error in function execution:', error);
      throw error;
    }
  }
);

// Import activity reminder service
import { activityReminderService } from '../../lib/activityReminderService';
import { emailService } from '../../lib/emailService';
import { ECBService } from '../../lib/services/ecbService';

// Activity reminder processing function
export const processActivityReminder = inngest.createFunction(
  { id: 'process-activity-reminder', name: 'Process Activity Reminder' },
  { event: 'activity/reminder.scheduled' },
  async ({ event, step }) => {
    console.log('[Inngest Fn: processActivityReminder] Processing reminder for activity:', event.data.activityId);

    const { reminderId, activityId, userId, reminderType, scheduledFor } = event.data;

    try {
      // Step 1: Get the reminder details
      const reminderDetails = await step.run('get-reminder-details', async () => {
        if (!supabaseAdmin) {
          throw new Error('supabaseAdmin is not initialized');
        }

        const { data: reminder, error } = await supabaseAdmin
          .from('activity_reminders')
          .select(`
            *,
            activities (
              id, subject, type, due_date, deal_id, person_id, organization_id,
              deals (name),
              people (first_name, last_name),
              organizations (name)
            )
          `)
          .eq('id', reminderId)
          .eq('is_sent', false)
          .single();

        if (error || !reminder) {
          throw new Error(`Reminder not found or already sent: ${error?.message}`);
        }

        return reminder;
      });

      // Step 2: Process based on reminder type
      const result = await step.run('send-reminder', async () => {
        switch (reminderType) {
          case 'email':
            return await processEmailReminder(reminderDetails);
          case 'in_app':
            return await processInAppReminder(reminderDetails);
          case 'push':
            return await processPushReminder(reminderDetails);
          default:
            throw new Error(`Unknown reminder type: ${reminderType}`);
        }
      });

      // Step 3: Mark reminder as sent
      await step.run('mark-reminder-sent', async () => {
        if (!supabaseAdmin) {
          throw new Error('supabaseAdmin is not initialized');
        }

        const { error } = await supabaseAdmin
          .from('activity_reminders')
          .update({
            is_sent: true,
            sent_at: new Date().toISOString(),
          })
          .eq('id', reminderId);

        if (error) {
          throw new Error(`Failed to mark reminder as sent: ${error.message}`);
        }
      });

      return { success: true, reminderType, result };
    } catch (error) {
      console.error('[Inngest Fn: processActivityReminder] Error:', error);
      
      // Update failed attempts
      await step.run('update-failed-attempts', async () => {
        if (!supabaseAdmin) {
          return;
        }

        await supabaseAdmin
          .from('activity_reminders')
          .update({
            failed_attempts: supabaseAdmin.rpc('increment', { x: 1 }),
            last_error: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', reminderId);
      });

      throw error;
    }
  }
);

// Helper function to process email reminders
async function processEmailReminder(reminder: any): Promise<string> {
  const activity = reminder.activities;
  const content = reminder.reminder_content;

  // Get user email
  const { data: user, error: userError } = await supabaseAdmin!
    .from('user_profiles')
    .select('email')
    .eq('id', reminder.user_id)
    .single();

  if (userError || !user?.email) {
    throw new Error('User email not found');
  }

  // Send email using existing email service
  try {
    // For now, we'll create a simple email. In the future, this could use email templates
    const emailBody = `
      <h2>Activity Reminder</h2>
      <p>This is a reminder that your ${activity.type.toLowerCase()} is due soon:</p>
      <h3>${activity.subject}</h3>
      <p><strong>Due:</strong> ${new Date(activity.due_date).toLocaleString()}</p>
      ${activity.deals ? `<p><strong>Deal:</strong> ${activity.deals.name}</p>` : ''}
      ${activity.people ? `<p><strong>Contact:</strong> ${activity.people.first_name} ${activity.people.last_name}</p>` : ''}
      ${activity.organizations ? `<p><strong>Organization:</strong> ${activity.organizations.name}</p>` : ''}
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/activities/${activity.id}">View Activity</a></p>
    `;

    // Note: This is a simplified email sending. In production, you'd want to use proper email templates
    console.log(`[processEmailReminder] Would send email to ${user.email}: ${content.subject}`);
    console.log(`[processEmailReminder] Email body: ${emailBody}`);
    
    return `Email reminder sent to ${user.email}`;
  } catch (error) {
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to process in-app reminders
async function processInAppReminder(reminder: any): Promise<string> {
  const activity = reminder.activities;
  const content = reminder.reminder_content;

  // Create in-app notification
  const notification = await activityReminderService.createNotification(
    reminder.user_id,
    content.title || `${activity.type} Reminder`,
    content.message || `"${activity.subject}" is due soon`,
    'activity_reminder',
    {
      entityType: 'ACTIVITY',
      entityId: activity.id,
      actionUrl: `/activities/${activity.id}`,
      metadata: {
        activityType: activity.type,
        dueDate: activity.due_date,
      },
      priority: 'normal',
    }
  );

  if (!notification) {
    throw new Error('Failed to create in-app notification');
  }

  return `In-app notification created: ${notification.id}`;
}

// Helper function to process push reminders
async function processPushReminder(reminder: any): Promise<string> {
  // Push notifications would be implemented here
  // For now, just log that we would send a push notification
  console.log(`[processPushReminder] Would send push notification for activity: ${reminder.activities.subject}`);
  return 'Push notification sent (placeholder)';
}

// Function to check for overdue activities and send notifications
export const checkOverdueActivities = inngest.createFunction(
  { id: 'check-overdue-activities', name: 'Check Overdue Activities' },
  { cron: '0 9 * * *' }, // Run daily at 9 AM
  async ({ event, step }) => {
    console.log('[Inngest Fn: checkOverdueActivities] Checking for overdue activities');

    try {
      const overdueActivities = await step.run('find-overdue-activities', async () => {
        if (!supabaseAdmin) {
          throw new Error('supabaseAdmin is not initialized');
        }

        const { data, error } = await supabaseAdmin
          .from('activities')
          .select(`
            id, subject, type, due_date, assigned_to_user_id, user_id,
            deals (name),
            people (first_name, last_name),
            organizations (name)
          `)
          .lt('due_date', new Date().toISOString())
          .eq('is_done', false)
          .not('due_date', 'is', null);

        if (error) {
          throw new Error(`Failed to fetch overdue activities: ${error.message}`);
        }

        return data || [];
      });

      if (overdueActivities.length === 0) {
        return { success: true, message: 'No overdue activities found' };
      }

      // Process each overdue activity
      const results = await step.run('process-overdue-activities', async () => {
        const processResults = [];

        for (const activity of overdueActivities) {
          const targetUserId = activity.assigned_to_user_id || activity.user_id;
          
          // Check user preferences for overdue notifications
          const preferences = await activityReminderService.getUserReminderPreferences(targetUserId);
          
          if (preferences?.overdue_notifications_enabled) {
            // Check if we've already sent an overdue notification recently
            const { data: recentNotification } = await supabaseAdmin!
              .from('notifications')
              .select('id')
              .eq('user_id', targetUserId)
              .eq('entity_type', 'ACTIVITY')
              .eq('entity_id', activity.id)
              .eq('notification_type', 'activity_overdue')
              .gte('created_at', new Date(Date.now() - (preferences.overdue_notification_frequency_hours * 60 * 60 * 1000)).toISOString())
              .single();

            if (!recentNotification) {
              // Create overdue notification
              const notification = await activityReminderService.createNotification(
                targetUserId,
                'Overdue Activity',
                `"${activity.subject}" is overdue`,
                'activity_overdue',
                {
                  entityType: 'ACTIVITY',
                  entityId: activity.id,
                  actionUrl: `/activities/${activity.id}`,
                  metadata: {
                    activityType: activity.type,
                    dueDate: activity.due_date,
                    daysOverdue: Math.floor((Date.now() - new Date(activity.due_date).getTime()) / (1000 * 60 * 60 * 24)),
                  },
                  priority: 'high',
                }
              );

              processResults.push({
                activityId: activity.id,
                userId: targetUserId,
                notificationId: notification?.id,
                success: !!notification,
              });
            }
          }
        }

        return processResults;
      });

      return { 
        success: true, 
        overdueCount: overdueActivities.length,
        notificationsSent: results.filter(r => r.success).length,
        results 
      };
    } catch (error) {
      console.error('[Inngest Fn: checkOverdueActivities] Error:', error);
      throw error;
    }
  }
);

// Function to clean up old notifications
export const cleanupExpiredNotifications = inngest.createFunction(
  { id: 'cleanup-expired-notifications', name: 'Cleanup Expired Notifications' },
  { cron: '0 2 * * *' }, // Run daily at 2 AM
  async ({ event, step }) => {
    console.log('[Inngest Fn: cleanupExpiredNotifications] Cleaning up expired notifications');

    try {
      const deletedCount = await step.run('delete-expired-notifications', async () => {
        if (!supabaseAdmin) {
          throw new Error('supabaseAdmin is not initialized');
        }

        const { data, error } = await supabaseAdmin.rpc('cleanup_expired_notifications');

        if (error) {
          throw new Error(`Failed to cleanup notifications: ${error.message}`);
        }

        return data || 0;
      });

      return { success: true, deletedCount };
    } catch (error) {
      console.error('[Inngest Fn: cleanupExpiredNotifications] Error:', error);
      throw error;
    }
  }
);

// Function to update exchange rates from ECB API
export const updateExchangeRatesFromECB = inngest.createFunction(
  { 
    id: 'update-exchange-rates-ecb', 
    name: 'Update Exchange Rates from ECB',
    retries: 2, // Only retry twice for transient errors
  },
  { cron: '0 6 * * 1-5' }, // Run weekdays at 6 AM (ECB updates rates around 4 PM CET)
  async ({ event, step }) => {
    console.log('[Inngest Fn: updateExchangeRatesFromECB] Starting scheduled ECB exchange rate update');

    try {
      // Step 1: Test ECB API connectivity with timeout
      const connectionStatus = await step.run('test-ecb-connection', async () => {
        console.log('[Inngest Fn: updateExchangeRatesFromECB] Testing ECB API connectivity...');
        return await ECBService.testECBConnection();
      });

      if (!connectionStatus.success) {
        // Don't retry for API connectivity issues as they're likely external
        console.error(`[Inngest Fn: updateExchangeRatesFromECB] ECB API connection failed: ${connectionStatus.message}`);
        return { 
          success: false, 
          error: `ECB API unavailable: ${connectionStatus.message}`,
          retry: false, // Don't retry API connectivity issues
          message: 'ECB API connection failed - will retry on next schedule'
        };
      }

      console.log('[Inngest Fn: updateExchangeRatesFromECB] ✅ ECB API connection successful');

      // Step 2: Update exchange rates with optimized batch processing
      const updateResult = await step.run('update-rates-from-ecb', async () => {
        console.log('[Inngest Fn: updateExchangeRatesFromECB] Updating exchange rates...');
        const startTime = Date.now();
        
        const result = await ECBService.updateRatesFromECB();
        
        const duration = Date.now() - startTime;
        console.log(`[Inngest Fn: updateExchangeRatesFromECB] Update completed in ${duration}ms`);
        
        return { ...result, duration };
      });

      if (!updateResult.success) {
        throw new Error(`ECB rate update failed: ${updateResult.message}`);
      }

      console.log(`[Inngest Fn: updateExchangeRatesFromECB] ✅ Successfully updated ${updateResult.updatedCount} exchange rates from ECB in ${updateResult.duration}ms`);

      // Step 3: Get update status for monitoring
      const statusResult = await step.run('get-update-status', async () => {
        console.log('[Inngest Fn: updateExchangeRatesFromECB] Getting update status...');
        return await ECBService.getECBUpdateStatus();
      });

      const finalResult = { 
        success: true, 
        updatedCount: updateResult.updatedCount,
        totalRates: statusResult.totalECBRates || 0,
        lastUpdate: statusResult.lastUpdate,
        duration: updateResult.duration,
        supportedCurrencies: statusResult.supportedCurrencies.length,
        message: `Updated ${updateResult.updatedCount} exchange rates from ECB API in ${updateResult.duration}ms`
      };

      console.log('[Inngest Fn: updateExchangeRatesFromECB] Final result:', finalResult);
      return finalResult;

    } catch (error) {
      console.error('[Inngest Fn: updateExchangeRatesFromECB] Error:', error);
      
      // Check if it's a timeout error
      const isTimeoutError = error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('timed out') ||
        error.message.includes('AbortError')
      );

      // Check if it's a weekend/holiday when ECB doesn't update
      const isWeekend = [0, 6].includes(new Date().getDay()); // Sunday = 0, Saturday = 6
      
      if (isWeekend) {
        console.log('[Inngest Fn: updateExchangeRatesFromECB] Weekend detected - ECB likely not updating rates');
        return { 
          success: false, 
          error: 'Weekend - ECB not updating',
          retry: false, // Don't retry on weekends
          message: 'ECB exchange rate update skipped - weekend/holiday'
        };
      }

      if (isTimeoutError) {
        console.error('[Inngest Fn: updateExchangeRatesFromECB] Timeout error detected - this may indicate function timeout issues');
      }

      // For production monitoring: Log but don't throw to prevent infinite retries
      // ECB API failures are expected on weekends/holidays
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        isTimeout: isTimeoutError,
        timestamp: new Date().toISOString(),
        message: `ECB exchange rate update failed${isTimeoutError ? ' (timeout)' : ''} - will retry on next schedule`
      };
    }
  }
);

export const functions = [
  helloWorld, 
  logContactCreation, 
  logDealCreation, 
  createDealAssignmentTask, 
  createLeadAssignmentTask,
  processActivityReminder,
  checkOverdueActivities,
  cleanupExpiredNotifications,
  updateExchangeRatesFromECB
];

// Determine serve options based on environment
const serveOptions: Parameters<typeof serve>[0] = {
  client: inngest,
  functions,
};

// IMPORTANT: Only set serveHost for local development to force HTTP
// Netlify sets CONTEXT='dev' when running `netlify dev`
if (process.env.CONTEXT === 'dev') {
  serveOptions.serveHost = 'http://localhost:8888'; // Or whatever your netlify dev port is
      // console.log('[Inngest Handler] Netlify CONTEXT=dev: serveHost set to', serveOptions.serveHost);
} else if (process.env.NODE_ENV === 'development') {
  // Fallback for other local dev environments if CONTEXT isn't 'dev'
  serveOptions.serveHost = 'http://localhost:8888'; 
  console.log('[Inngest Handler] NODE_ENV=development: serveHost set to', serveOptions.serveHost);
}

// Export the handler using the lambda serve adapter
export const handler: Handler = serve(serveOptions) as any;