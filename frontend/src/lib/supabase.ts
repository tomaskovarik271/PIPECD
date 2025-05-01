import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env variable: VITE_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing env variable: VITE_SUPABASE_ANON_KEY");
}

// Create and export the Supabase client instance for frontend usage
// It uses the anon key, and Supabase handles session management automatically.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Ensure session persistence across browser tabs/reloads
    persistSession: true,
    // Automatically refresh the token when expired
    autoRefreshToken: true,
    // Supabase Auth UI or manual login handles session detection
    detectSessionInUrl: false, 
  },
}); 