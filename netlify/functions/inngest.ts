import { Handler } from '@netlify/functions';
import { serve } from 'inngest/lambda';
import { Inngest } from 'inngest';
import { createClient } from '@supabase/supabase-js';
import { ECBService } from '../../lib/services/ecbService';

// Configure Supabase Admin Client for system operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create a client to send and receive events
export const inngest = new Inngest({
  id: 'pipecd-inngest-app',
  name: 'PipeCD Background Jobs',
});

// Simple hello world function for testing
const helloWorld = inngest.createFunction(
  { id: 'hello-world', name: 'Hello World' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '1s');
    return { message: `Hello ${event.data.email || 'World'}!` };
  }
);

// Simple logging functions (kept for audit trail)
const logContactCreation = inngest.createFunction(
  { id: 'log-contact-creation', name: 'Log Contact Creation' },
  { event: 'crm/contact.created' },
  async ({ event, step }) => {
    const logMessage = `Contact created: ${event.data.contactName} (ID: ${event.data.contactId}) by user ${event.data.createdByUserId}`;
    console.log(`[Inngest Fn: log-contact-creation] Processed: ${logMessage}`);
    return { success: true, message: logMessage };
  }
);

const logDealCreation = inngest.createFunction(
  { id: 'log-deal-creation', name: 'Log Deal Creation' },
  { event: 'crm/deal.created' },
  async ({ event, step }) => {
    const logMessage = `Deal created: ${event.data.dealName} (ID: ${event.data.dealId}) by user ${event.data.createdByUserId}`;
    console.log(`[Inngest Fn: log-deal-creation] Processed: ${logMessage}`);
    return { success: true, message: logMessage };
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

    // Import NonRetriableError for better error handling
    const { NonRetriableError } = await import('inngest');

    try {
      // Check if it's a weekend/holiday when ECB doesn't update
      const isWeekend = [0, 6].includes(new Date().getDay()); // Sunday = 0, Saturday = 6
      
      if (isWeekend) {
        console.log('[Inngest Fn: updateExchangeRatesFromECB] Weekend detected - ECB likely not updating rates');
        throw new NonRetriableError('Weekend - ECB not updating rates on weekend/holiday');
      }

      // Step 1: Test ECB API connectivity with timeout
      const connectionStatus = await step.run('test-ecb-connection', async () => {
        console.log('[Inngest Fn: updateExchangeRatesFromECB] Testing ECB API connectivity...');
        return await ECBService.testECBConnection();
      });

      if (!connectionStatus.success) {
        // API connectivity issues are usually external and shouldn't be retried immediately
        console.error(`[Inngest Fn: updateExchangeRatesFromECB] ECB API connection failed: ${connectionStatus.message}`);
        throw new NonRetriableError(`ECB API unavailable: ${connectionStatus.message}`);
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
        // If the service itself reports failure, this might be retryable
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
      
      // If it's already a NonRetriableError, just re-throw it
      if (error instanceof Error && error.name === 'NonRetriableError') {
        throw error;
      }

      // Check if it's a timeout error
      const isTimeoutError = error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('timed out') ||
        error.message.includes('AbortError')
      );

      if (isTimeoutError) {
        console.error('[Inngest Fn: updateExchangeRatesFromECB] Timeout error detected - this may indicate function timeout issues');
        // Timeout errors might be transient, so allow retries
        throw new Error(`Function timeout: ${error instanceof Error ? error.message : 'Unknown timeout error'}`);
      }

      // For other errors, determine if they should be retryable
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // API errors that suggest external service issues (non-retryable)
      if (errorMessage.includes('ECB API') || errorMessage.includes('unavailable')) {
        throw new NonRetriableError(`External service error: ${errorMessage}`);
      }

      // Database or internal errors might be retryable
      throw new Error(`ECB exchange rate update failed: ${errorMessage}`);
    }
  }
);

export const functions = [
  helloWorld, 
  logContactCreation, 
  logDealCreation, 
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