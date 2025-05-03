import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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
  // Explicitly configure auth for server-side usage
  auth: {
    // autoRefreshToken: true, // Keep default or set as needed
    persistSession: false, // Set to false for server-side/stateless environments
    // detectSessionInUrl: false, // Keep default (false)
  },
});

// Optional: For operations requiring elevated privileges (use with extreme caution!)
// Ensure SERVICE_ROLE_KEY is set if you uncomment this
/*
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceRoleKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set. Admin client will not be available.');
}
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
*/ 