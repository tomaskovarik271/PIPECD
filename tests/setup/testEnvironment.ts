import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Test environment configuration
export interface TestEnvironment {
  supabase: SupabaseClient;
  testUserId: string;
  mockAuthToken: string;
  cleanup: () => Promise<void>;
}

// Track test data for cleanup
const testDataRegistry = new Set<string>();

export async function createTestEnvironment(): Promise<TestEnvironment> {
  const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for testing');
  }

  // Use service role client to bypass RLS for testing
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  // Create test user in auth.users table
  const testUserEmail = `test-${uuidv4()}@pipecd-test.com`;
  const testPassword = 'test-password-123';
  
  // Create test user with proper authentication
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: testUserEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      test_user: true,
      test_session: Date.now()
    }
  });

  if (authError) {
    throw new Error(`Failed to create auth user: ${authError.message}`);
  }

  const finalUserId = authUser.user.id;

  // Create user profile with proper permissions
  try {
    await supabase.from('user_profiles').insert({
      user_id: finalUserId,
      email: testUserEmail,
      full_name: 'Test User',
      role: 'member', // Give member role for testing collaboration
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.warn('User profile creation warning:', error);
  }

  // Now create a regular Supabase client and sign in to get a real auth token
  const regularSupabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data: signInData, error: signInError } = await regularSupabase.auth.signInWithPassword({
    email: testUserEmail,
    password: testPassword,
  });

  if (signInError || !signInData.session) {
    throw new Error(`Failed to sign in test user: ${signInError?.message || 'No session'}`);
  }

  const authToken = signInData.session.access_token;

  // Register for cleanup
  testDataRegistry.add(finalUserId);

  return {
    supabase,
    testUserId: finalUserId,
    mockAuthToken: authToken, // Now using real auth token
    cleanup: async () => {
      await cleanupTestData(supabase, finalUserId);
      testDataRegistry.delete(finalUserId);
    }
  };
}

async function cleanupTestData(supabase: SupabaseClient, testUserId: string) {
  try {
    // Clean up in reverse dependency order
    await supabase.from('activities').delete().eq('user_id', testUserId);
    await supabase.from('deals').delete().eq('user_id', testUserId);
    await supabase.from('leads').delete().eq('user_id', testUserId);
    await supabase.from('people').delete().eq('user_id', testUserId);
    await supabase.from('organizations').delete().eq('user_id', testUserId);
    
    // Clean up user profile
    await supabase.from('user_profiles').delete().eq('user_id', testUserId);
    
    // Clean up auth user if it exists
    try {
      await supabase.auth.admin.deleteUser(testUserId);
    } catch (error) {
      // Ignore auth cleanup errors
    }
    
    console.log(`✅ Cleaned up test data for user: ${testUserId}`);
  } catch (error) {
    console.warn(`⚠️ Cleanup warning for ${testUserId}:`, error);
  }
}

// Global cleanup for any remaining test data
export async function globalTestCleanup() {
  if (testDataRegistry.size > 0) {
    console.log(`🧹 Cleaning up ${testDataRegistry.size} remaining test environments`);
    // Additional cleanup logic if needed
  }
} 