import { Inngest } from 'inngest';

if (!process.env.INNGEST_EVENT_KEY) {
  // In a real app, you might want to throw an error only if not in a dev environment
  // or if the functionality relying on Inngest is critical.
  console.warn('INNGEST_EVENT_KEY environment variable is not set. Inngest client might not work as expected.');
}

// Note: INNGEST_SIGNING_KEY is primarily used by the serve handler, not directly by the client for sending events.
// However, the serve handler in netlify/functions/inngest.ts will need it.

export const inngest = new Inngest({
  id: 'pipe-cd-crm', // This ID should be consistent with the one used in the serve handler
  eventKey: process.env.INNGEST_EVENT_KEY,
  // We can set a default event key for local dev if INNGEST_EVENT_KEY is not set, e.g.:
  // eventKey: process.env.INNGEST_EVENT_KEY || (process.env.NODE_ENV !== 'production' ? 'IS_DEV_EVENT_KEY' : undefined),
}); 