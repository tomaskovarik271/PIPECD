import type { Handler } from '@netlify/functions';
import { serve } from 'inngest/lambda';
import { inngest } from '../../lib/inngestClient';

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

    const logMessage = `Deal created: ID=${event.data.deal.id}, Name=${event.data.deal.name}, Stage=${event.data.deal.stage_id}, Amount=${event.data.deal.amount}, ContactID=${event.data.deal.person_id}`;
    console.log(`[Inngest Fn: log-deal-creation] Processed: ${logMessage}`);

    return { success: true, message: logMessage };
  }
);

// Add new function for logging deal updates
const logDealUpdate = inngest.createFunction(
  { id: 'log-deal-update' },
  { event: 'crm/deal.updated' },
  async ({ event, step }) => {
    console.log(`[Inngest Fn: log-deal-update] Received event '${event.name}' for deal ID: ${event.data.dealId}`);
    console.log('[Inngest Fn: log-deal-update] Event Data:', event.data);
    console.log('[Inngest Fn: log-deal-update] User Info:', event.user);

    // Example of using a step, e.g., to simulate further processing or notify another system
    await step.run('log-update-details', async () => {
      const changesSummary = Object.entries(event.data.changes)
        .map(([key, value]: [string, any]) => `${key}: '${value.oldValue}' -> '${value.newValue}'`)
        .join('; ');
      console.log(`[Inngest Fn: log-deal-update] Changes processed: ${changesSummary}`);
      return { summary: changesSummary };
    });

    return { success: true, message: `Deal update for ${event.data.dealId} processed.` };
  }
);

export const functions = [helloWorld, logContactCreation, logDealCreation];

// Add the new function to the exported array
export const allFunctions = [...functions, logDealUpdate];

// Base config for Inngest serve
const inngestServeConfig = {
  client: inngest,
  functions: allFunctions,
  signingKey: process.env.INNGEST_SIGNING_KEY,
};

// Add serveHost and servePath only if running in Netlify Dev local environment
if (process.env.NETLIFY_DEV === 'true') {
  Object.assign(inngestServeConfig, {
    serveHost: 'http://localhost:8888', 
    servePath: '/.netlify/functions/inngest',
  });
}

export const handler = serve(inngestServeConfig);