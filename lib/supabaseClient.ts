import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Check for essential environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is not set.');
}

if (!supabaseAnonKey) {
  throw new Error('SUPABASE_ANON_KEY environment variable is not set.');
}

// Create and export the Supabase client instance
// We use the anon key here, assuming RLS will handle authorization.
// For admin tasks, a separate client using the service_role key might be needed.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Optional settings:
  // auth: {
  //   autoRefreshToken: true,
  //   persistSession: false, // Important for server-side usage
  //   detectSessionInUrl: false,
  // },
});

// Optional: For operations requiring elevated privileges (use with extreme caution!)
// Ensure SERVICE_ROLE_KEY is set if you uncomment this

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceRoleKey) {
  // Changed from console.warn to throw an error if not set, as it might be critical for some operations
  // Or, keep as console.warn if the admin client is truly optional for most of the app.
  // For getServiceLevelUserProfileData to work as intended, it is now required.
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set. Admin client will not be available. Some user data lookups will fail.');
}
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null; 