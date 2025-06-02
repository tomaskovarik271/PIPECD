#!/usr/bin/env node

/**
 * Script to get authentication token for MCP testing
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getAuthToken() {
  try {
    console.log('🔐 Attempting to sign in to get auth token...\n');
    
    // Try to sign in with your main account
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'tomas@kovarik.cz',
      password: 'admin123' // Common test password - you'll need to use the right one
    });

    if (error) {
      console.log('❌ Sign in failed with admin123, trying other common passwords...');
      
      // Try a few common test passwords
      const commonPasswords = ['password', 'test123', 'admin', '123456', 'password123'];
      
      for (const pwd of commonPasswords) {
        console.log(`   Trying: ${pwd}`);
        const { data: tryData, error: tryError } = await supabase.auth.signInWithPassword({
          email: 'tomas@kovarik.cz',
          password: pwd
        });
        
        if (!tryError && tryData.session) {
          console.log(`✅ Success with password: ${pwd}`);
          console.log('\n🎯 Your auth token for MCP:\n');
          console.log(tryData.session.access_token);
          console.log('\nUpdate your claude-config.json with this token!');
          return;
        }
      }
      
      console.log('\n❌ Could not authenticate with common passwords.');
      console.log('Please create a test user or use the correct password.');
      console.log('\nTo create a test user, go to: http://127.0.0.1:54323 (Supabase Studio)');
      console.log('Then sign up through your frontend app or use the Studio interface.');
      return;
    }

    if (data.session) {
      console.log('✅ Authentication successful!\n');
      console.log('🎯 Your auth token for MCP:\n');
      console.log(data.session.access_token);
      console.log('\n📝 To use this token:');
      console.log('1. Copy the token above');
      console.log('2. Update mcp/claude-config.json');
      console.log('3. Replace SUPABASE_JWT_SECRET value with this token');
      console.log('4. Restart Claude Desktop');
      console.log('\n👤 User info:');
      console.log(`   Email: ${data.user.email}`);
      console.log(`   ID: ${data.user.id}`);
    } else {
      console.log('❌ No session returned from authentication');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getAuthToken(); 