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

export const functions = [helloWorld, logContactCreation, logDealCreation, createDealAssignmentTask];

// Determine serve options based on environment
const serveOptions: Parameters<typeof serve>[0] = {
  client: inngest,
  functions,
};

// IMPORTANT: Only set serveHost for local development to force HTTP
// Netlify sets CONTEXT='dev' when running `netlify dev`
if (process.env.CONTEXT === 'dev') {
  serveOptions.serveHost = 'http://localhost:8888'; // Or whatever your netlify dev port is
  console.log('[Inngest Handler] Netlify CONTEXT=dev: serveHost set to', serveOptions.serveHost);
} else if (process.env.NODE_ENV === 'development') {
  // Fallback for other local dev environments if CONTEXT isn't 'dev'
  serveOptions.serveHost = 'http://localhost:8888'; 
  console.log('[Inngest Handler] NODE_ENV=development: serveHost set to', serveOptions.serveHost);
}

// Export the handler using the lambda serve adapter
export const handler: Handler = serve(serveOptions) as any;