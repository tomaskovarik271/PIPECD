import { Inngest } from 'inngest';
import { serve } from 'inngest/netlify'; // Original import path
// import { Inngest, serve } from 'inngest'; // Previous attempt

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

// Create a client to send and receive events
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
    console.log('Received test/hello.world event:', event);
    await step.run('log-event-data', async () => {
      console.log('Event data:', event.data);
      return { message: 'Logged event data' };
    });
    return { event: event.name, body: 'Hello World!' };
  }
);

// Create the Netlify handler, passing the Inngest client and functions
export const handler = serve({
  client: inngest,
  functions: [
    helloWorld,
    // Add other functions here
  ],
  signingKey: process.env.INNGEST_SIGNING_KEY,
}); 