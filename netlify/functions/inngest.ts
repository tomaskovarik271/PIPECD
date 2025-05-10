import { Inngest } from 'inngest';
import type { Handler, HandlerContext } from '@netlify/functions';

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

export const functions = [helloWorld, logContactCreation, logDealCreation];

export const handler: Handler = async (_event, _context: HandlerContext) => {
  console.warn('[inngest.ts handler] Invoked directly by Netlify Dev - this should ideally be handled by Inngest infrastructure (Plugin/Dev Server).');
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Inngest functions defined; placeholder handler invoked.' }),
    headers: { 'Content-Type': 'application/json' },
  };
}; 