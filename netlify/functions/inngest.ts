import { Inngest } from 'inngest';
import type { Handler } from '@netlify/functions'; // Import Handler type
// import { serve } from 'inngest/node'; // Node adapter expects IncomingMessage
// import { serve } from 'inngest/netlify'; // Revert to original import despite build warning
// import { serve } from 'inngest/netlify'; // Original import path (incorrect)

// Check for essential environment variables
if (!process.env.INNGEST_EVENT_KEY) {
  throw new Error('INNGEST_EVENT_KEY environment variable is not set.');
}

if (!process.env.INNGEST_SIGNING_KEY) {
  // Warn in development, throw error in production (or always throw if preferred)
  if (process.env.NODE_ENV === 'production') {
    throw new Error('INNGEST_SIGNING_KEY environment variable is not set in production.');
  } else {
    console.warn('INNGEST_SIGNING_KEY environment variable is not set. Requests will not be signed.');
  }
}

// Create and export the Inngest client (used by GraphQL function)
export const inngest = new Inngest({
  id: 'pipe-cd-crm', // TODO: Choose a better ID for your app
  eventKey: process.env.INNGEST_EVENT_KEY,
  // signingKey: process.env.INNGEST_SIGNING_KEY, // The serve handler uses the signing key
});

// Define an Inngest function (example)
const helloWorld = inngest.createFunction(
  { id: 'hello-world' }, // Function ID
  { event: 'test/hello.world' }, // Event trigger
  async ({ event, step }) => {
    console.log('[Inngest Fn: hello-world] Received event:', event.name);
    await step.run('log-event-data', async () => {
      console.log('[Inngest Fn: hello-world] Event data:', event.data);
      return { message: 'Logged event data' };
    });
    return { event: event.name, body: 'Hello World!' };
  }
);

// New function to log contact creation
const logContactCreation = inngest.createFunction(
  { id: 'log-contact-creation' }, // Function ID
  { event: 'crm/contact.created' }, // Event trigger
  async ({ event, step }) => {
    console.log(`[Inngest Fn: log-contact-creation] Received event '${event.name}'`, event.data);

    // Example step (optional)
    await step.sleep('wait-a-bit', '50ms'); 

    const logMessage = `Contact created: ID=${event.data.contactId}, Email=${event.data.email}, Name=${event.data.firstName}`; 
    console.log(`[Inngest Fn: log-contact-creation] Processed: ${logMessage}`);

    return { success: true, message: logMessage }; // Return value from function run
  }
);

// Export functions in an array (plugin might look for this)
export const functions = [helloWorld, logContactCreation];

// Add back the minimal handler export to satisfy Netlify Dev
// The Inngest Dev Server + Plugin should handle the actual serving.
export const handler: Handler = async (event, context) => {
  console.warn('[inngest.ts handler] Invoked directly by Netlify Dev - this should ideally be handled by Inngest infrastructure (Plugin/Dev Server).');
  // Return a simple response to avoid crashing Netlify Dev
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Inngest functions defined; placeholder handler invoked.' }),
    headers: { 'Content-Type': 'application/json' },
  };
};

// Remove the minimal handler export again
/*
export const handler: Handler = async (event, context) => {
  console.warn('[inngest.ts handler] Invoked directly by Netlify Dev - this should ideally be handled by Inngest Dev Server/Plugin.');
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Inngest functions defined; serving handled by Inngest infrastructure.' }),
    headers: { 'Content-Type': 'application/json' },
  };
};
*/ 