#!/usr/bin/env node

/**
 * Simple Database Test for Activity Reminders System
 * Tests database tables and basic operations
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://localhost:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function testDatabase() {
  console.log('📊 Testing Activity Reminders Database...\n');
  
  let allTestsPassed = true;

  try {
    // Test 1: user_reminder_preferences table
    console.log('1️⃣ Testing user_reminder_preferences table...');
    const { data: prefs, error: prefsError } = await supabase
      .from('user_reminder_preferences')
      .select('*')
      .limit(1);
    
    if (prefsError) {
      console.log(`❌ Error: ${prefsError.message}`);
      allTestsPassed = false;
    } else {
      console.log('✅ user_reminder_preferences table accessible');
    }

    // Test 2: activity_reminders table
    console.log('\n2️⃣ Testing activity_reminders table...');
    const { data: reminders, error: remindersError } = await supabase
      .from('activity_reminders')
      .select('*')
      .limit(1);
    
    if (remindersError) {
      console.log(`❌ Error: ${remindersError.message}`);
      allTestsPassed = false;
    } else {
      console.log('✅ activity_reminders table accessible');
    }

    // Test 3: notifications table
    console.log('\n3️⃣ Testing notifications table...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);
    
    if (notificationsError) {
      console.log(`❌ Error: ${notificationsError.message}`);
      allTestsPassed = false;
    } else {
      console.log('✅ notifications table accessible');
    }

    // Test 4: Check database function
    console.log('\n4️⃣ Testing database functions...');
    const { data: functionResult, error: functionError } = await supabase
      .rpc('cleanup_expired_notifications');
    
    if (functionError) {
      console.log(`❌ Function error: ${functionError.message}`);
      allTestsPassed = false;
    } else {
      console.log('✅ cleanup_expired_notifications function working');
    }

    // Test 5: Check for existing data
    console.log('\n5️⃣ Checking for existing data...');
    
    const { count: prefsCount } = await supabase
      .from('user_reminder_preferences')
      .select('*', { count: 'exact', head: true });
    
    const { count: remindersCount } = await supabase
      .from('activity_reminders')
      .select('*', { count: 'exact', head: true });
    
    const { count: notificationsCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    console.log(`📈 Data counts:`);
    console.log(`   - User preferences: ${prefsCount || 0}`);
    console.log(`   - Activity reminders: ${remindersCount || 0}`);
    console.log(`   - Notifications: ${notificationsCount || 0}`);

    // Summary
    console.log('\n📊 Database Test Summary:');
    if (allTestsPassed) {
      console.log('🎉 All database tests passed! Activity Reminders database is ready.');
    } else {
      console.log('⚠️ Some database tests failed. Check the output above.');
    }

    return allTestsPassed;

  } catch (error) {
    console.error(`💥 Database test error: ${error.message}`);
    return false;
  }
}

if (require.main === module) {
  testDatabase()
    .then(success => process.exit(success ? 0 : 1))
    .catch(console.error);
}

module.exports = { testDatabase }; 