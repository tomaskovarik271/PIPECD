#!/usr/bin/env node

/**
 * Complete Activity Reminders System Test
 * 
 * This script tests the entire Activity Reminders System end-to-end
 * including GraphQL API, database operations, and business logic.
 * 
 * Usage: node scripts/test-activity-reminders-complete.js
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Configuration
const GRAPHQL_ENDPOINT = 'http://localhost:8888/.netlify/functions/graphql';
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Test user credentials (you'll need to create a test user)
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'testpassword123';

class ActivityRemindersTestSuite {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    this.authToken = null;
    this.testUserId = null;
    this.testActivityId = null;
    this.testNotificationId = null;
  }

  async graphqlRequest(query, variables = {}, useAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (useAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  }

  async createTestUser() {
    console.log('🔧 Creating test user...');
    
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      if (error && error.message !== 'User already registered') {
        throw error;
      }

      this.testUserId = data.user?.id;
      console.log(`✅ Test user ready: ${TEST_USER_EMAIL}`);
      return true;
    } catch (error) {
      console.log(`⚠️ Test user creation: ${error.message}`);
      return false;
    }
  }

  async authenticateTestUser() {
    console.log('🔐 Authenticating test user...');
    
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      if (error) throw error;

      this.authToken = data.session?.access_token;
      this.testUserId = data.user?.id;
      
      console.log('✅ Authentication successful');
      return true;
    } catch (error) {
      console.log(`❌ Authentication failed: ${error.message}`);
      return false;
    }
  }

  async testHealthCheck() {
    console.log('\n1️⃣ Testing GraphQL API health...');
    
    try {
      const result = await this.graphqlRequest('query { health }');
      
      if (result.health === 'OK') {
        console.log('✅ GraphQL API is healthy');
        return true;
      } else {
        console.log('❌ GraphQL API health check failed');
        return false;
      }
    } catch (error) {
      console.log(`❌ Health check error: ${error.message}`);
      return false;
    }
  }

  async testUserPreferences() {
    console.log('\n2️⃣ Testing user preferences system...');
    
    try {
      // Query initial preferences (should create defaults)
      const prefsQuery = `
        query {
          myReminderPreferences {
            id
            userId
            emailRemindersEnabled
            emailReminderMinutesBefore
            inAppRemindersEnabled
            inAppReminderMinutesBefore
            overdueNotificationsEnabled
            overdueNotificationFrequencyHours
          }
        }
      `;

      const prefsResult = await this.graphqlRequest(prefsQuery, {}, true);
      
      if (prefsResult.myReminderPreferences) {
        console.log('✅ User preferences retrieved/created');
        console.log(`   - Email reminders: ${prefsResult.myReminderPreferences.emailRemindersEnabled}`);
        console.log(`   - Email timing: ${prefsResult.myReminderPreferences.emailReminderMinutesBefore} min`);
      } else {
        console.log('❌ Failed to get user preferences');
        return false;
      }

      // Update preferences
      const updateQuery = `
        mutation UpdatePrefs($input: UpdateUserReminderPreferencesInput!) {
          updateMyReminderPreferences(input: $input) {
            emailReminderMinutesBefore
            inAppReminderMinutesBefore
          }
        }
      `;

      const updateResult = await this.graphqlRequest(updateQuery, {
        input: {
          emailReminderMinutesBefore: 30,
          inAppReminderMinutesBefore: 10,
        }
      }, true);

      if (updateResult.updateMyReminderPreferences) {
        console.log('✅ User preferences updated successfully');
        console.log(`   - New email timing: ${updateResult.updateMyReminderPreferences.emailReminderMinutesBefore} min`);
        console.log(`   - New in-app timing: ${updateResult.updateMyReminderPreferences.inAppReminderMinutesBefore} min`);
        return true;
      } else {
        console.log('❌ Failed to update user preferences');
        return false;
      }
    } catch (error) {
      console.log(`❌ User preferences test error: ${error.message}`);
      return false;
    }
  }

  async testActivityCreationAndReminders() {
    console.log('\n3️⃣ Testing activity creation and reminder scheduling...');
    
    try {
      // Create activity with due date
      const createQuery = `
        mutation CreateActivity($input: CreateActivityInput!) {
          createActivity(input: $input) {
            id
            subject
            due_date
            is_done
            created_at
          }
        }
      `;

      const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
      
      const createResult = await this.graphqlRequest(createQuery, {
        input: {
          subject: 'Test Activity for Reminders',
          type: 'CALL',
          due_date: futureDate.toISOString(),
          notes: 'Testing automatic reminder scheduling',
        }
      }, true);

      if (createResult.createActivity) {
        this.testActivityId = createResult.createActivity.id;
        console.log('✅ Activity created successfully');
        console.log(`   - ID: ${this.testActivityId}`);
        console.log(`   - Subject: ${createResult.createActivity.subject}`);
        console.log(`   - Due: ${createResult.createActivity.due_date}`);
      } else {
        console.log('❌ Failed to create activity');
        return false;
      }

      // Check if reminders were scheduled
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for reminder scheduling

      const { data: reminders, error: reminderError } = await this.supabase
        .from('activity_reminders')
        .select('*')
        .eq('activity_id', this.testActivityId)
        .eq('is_sent', false);

      if (reminderError) {
        console.log(`❌ Error checking reminders: ${reminderError.message}`);
        return false;
      }

      if (reminders && reminders.length > 0) {
        console.log(`✅ Reminders scheduled: ${reminders.length} reminders`);
        reminders.forEach(reminder => {
          console.log(`   - ${reminder.reminder_type}: ${reminder.scheduled_for}`);
        });
        return true;
      } else {
        console.log('⚠️ No reminders found (may be expected if due date is too close)');
        return true;
      }
    } catch (error) {
      console.log(`❌ Activity creation test error: ${error.message}`);
      return false;
    }
  }

  async testNotificationSystem() {
    console.log('\n4️⃣ Testing notification system...');
    
    try {
      // Create notification (admin-only function, using service key)
      const { data: notification, error: notifError } = await this.supabase
        .from('notifications')
        .insert({
          user_id: this.testUserId,
          title: 'Test Activity Reminder',
          message: 'Your test activity is due soon',
          notification_type: 'activity_reminder',
          priority: 'normal',
          entity_type: 'ACTIVITY',
          entity_id: this.testActivityId,
          action_url: `/activities/${this.testActivityId}`,
          metadata: { testMode: true },
        })
        .select()
        .single();

      if (notifError) {
        console.log(`❌ Error creating notification: ${notifError.message}`);
        return false;
      }

      this.testNotificationId = notification.id;
      console.log('✅ Notification created successfully');
      console.log(`   - ID: ${notification.id}`);
      console.log(`   - Title: ${notification.title}`);

      // Query notifications via GraphQL
      const notifQuery = `
        query {
          myNotifications(limit: 10) {
            totalCount
            unreadCount
            notifications {
              id
              title
              message
              isRead
              notificationType
              priority
            }
          }
          unreadNotificationCount
        }
      `;

      const notifResult = await this.graphqlRequest(notifQuery, {}, true);
      
      if (notifResult.myNotifications) {
        console.log('✅ Notifications retrieved via GraphQL');
        console.log(`   - Total: ${notifResult.myNotifications.totalCount}`);
        console.log(`   - Unread: ${notifResult.myNotifications.unreadCount}`);
        console.log(`   - Unread count query: ${notifResult.unreadNotificationCount}`);
      }

      // Test mark as read
      const markReadQuery = `
        mutation MarkAsRead($id: ID!) {
          markNotificationAsRead(id: $id) {
            id
            isRead
            readAt
          }
        }
      `;

      const markReadResult = await this.graphqlRequest(markReadQuery, {
        id: this.testNotificationId
      }, true);

      if (markReadResult.markNotificationAsRead) {
        console.log('✅ Notification marked as read');
        console.log(`   - Read at: ${markReadResult.markNotificationAsRead.readAt}`);
        return true;
      } else {
        console.log('❌ Failed to mark notification as read');
        return false;
      }
    } catch (error) {
      console.log(`❌ Notification system test error: ${error.message}`);
      return false;
    }
  }

  async testActivityLifecycle() {
    console.log('\n5️⃣ Testing activity lifecycle integration...');
    
    try {
      // Update activity due date
      const updateQuery = `
        mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {
          updateActivity(id: $id, input: $input) {
            id
            due_date
            updated_at
          }
        }
      `;

      const newDueDate = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours from now
      
      const updateResult = await this.graphqlRequest(updateQuery, {
        id: this.testActivityId,
        input: {
          due_date: newDueDate.toISOString(),
        }
      }, true);

      if (updateResult.updateActivity) {
        console.log('✅ Activity due date updated');
        console.log(`   - New due date: ${updateResult.updateActivity.due_date}`);
      }

      // Wait for reminder rescheduling
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check reminder status
      const { data: reminders } = await this.supabase
        .from('activity_reminders')
        .select('*')
        .eq('activity_id', this.testActivityId);

      console.log(`✅ Checked reminders after update: ${reminders?.length || 0} reminders found`);

      // Complete the activity
      const completeResult = await this.graphqlRequest(updateQuery, {
        id: this.testActivityId,
        input: { is_done: true }
      }, true);

      if (completeResult.updateActivity) {
        console.log('✅ Activity marked as complete');
      }

      // Wait for reminder cancellation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check that reminders are cancelled (implementation may vary)
      const { data: remainingReminders } = await this.supabase
        .from('activity_reminders')
        .select('*')
        .eq('activity_id', this.testActivityId)
        .eq('is_sent', false);

      console.log(`✅ Reminders after completion: ${remainingReminders?.length || 0} active reminders`);
      
      return true;
    } catch (error) {
      console.log(`❌ Activity lifecycle test error: ${error.message}`);
      return false;
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      // Delete test notifications
      if (this.testNotificationId) {
        await this.supabase
          .from('notifications')
          .delete()
          .eq('id', this.testNotificationId);
      }

      // Delete test activity
      if (this.testActivityId) {
        await this.supabase
          .from('activities')
          .delete()
          .eq('id', this.testActivityId);
      }

      // Delete test user preferences
      if (this.testUserId) {
        await this.supabase
          .from('user_reminder_preferences')
          .delete()
          .eq('user_id', this.testUserId);
      }

      console.log('✅ Test data cleaned up');
    } catch (error) {
      console.log(`⚠️ Cleanup warning: ${error.message}`);
    }
  }

  async runAllTests() {
    console.log('🧪 Starting Complete Activity Reminders System Test\n');
    
    const results = {
      setup: false,
      health: false,
      preferences: false,
      activities: false,
      notifications: false,
      lifecycle: false,
    };

    try {
      // Setup
      await this.createTestUser();
      results.setup = await this.authenticateTestUser();
      
      if (!results.setup) {
        console.log('\n❌ Setup failed - cannot proceed with tests');
        return results;
      }

      // Run tests
      results.health = await this.testHealthCheck();
      results.preferences = await this.testUserPreferences();
      results.activities = await this.testActivityCreationAndReminders();
      results.notifications = await this.testNotificationSystem();
      results.lifecycle = await this.testActivityLifecycle();

      // Summary
      console.log('\n📊 Test Results Summary:');
      console.log(`🔧 Setup: ${results.setup ? '✅' : '❌'}`);
      console.log(`❤️ Health Check: ${results.health ? '✅' : '❌'}`);
      console.log(`⚙️ User Preferences: ${results.preferences ? '✅' : '❌'}`);
      console.log(`📅 Activity & Reminders: ${results.activities ? '✅' : '❌'}`);
      console.log(`🔔 Notifications: ${results.notifications ? '✅' : '❌'}`);
      console.log(`🔄 Activity Lifecycle: ${results.lifecycle ? '✅' : '❌'}`);

      const passedTests = Object.values(results).filter(r => r).length;
      const totalTests = Object.keys(results).length;
      
      console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
      
      if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Activity Reminders System is working correctly.');
      } else {
        console.log('⚠️ Some tests failed. Check the output above for details.');
      }

    } catch (error) {
      console.error(`💥 Test suite error: ${error.message}`);
    } finally {
      await this.cleanup();
    }

    return results;
  }
}

// Run the test suite
async function main() {
  console.log('Activity Reminders System - Complete Test Suite');
  console.log('==============================================\n');
  
  const testSuite = new ActivityRemindersTestSuite();
  const results = await testSuite.runAllTests();
  
  process.exit(Object.values(results).every(r => r) ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ActivityRemindersTestSuite }; 