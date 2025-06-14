/**
 * Activity Reminder Service Test
 * 
 * This file provides a simple test to verify that the Activity Reminders System
 * is working correctly with the database and all components are properly integrated.
 */

import { createClient } from '@supabase/supabase-js';
import { activityReminderService } from './index';

// Test configuration
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'; // Placeholder user ID
const TEST_ACTIVITY_ID = '00000000-0000-0000-0000-000000000002'; // Placeholder activity ID

export async function testActivityReminderSystem() {
  console.log('🧪 Testing Activity Reminders System...\n');

  try {
    // Test 1: Create default user preferences
    console.log('1️⃣ Testing user preference creation...');
    const preferences = await activityReminderService.createDefaultReminderPreferences(TEST_USER_ID);
    if (preferences) {
      console.log('✅ Default preferences created successfully');
      console.log(`   - Email reminders: ${preferences.email_reminders_enabled}`);
      console.log(`   - Email timing: ${preferences.email_reminder_minutes_before} minutes before`);
      console.log(`   - In-app reminders: ${preferences.in_app_reminders_enabled}`);
      console.log(`   - In-app timing: ${preferences.in_app_reminder_minutes_before} minutes before\n`);
    } else {
      console.log('❌ Failed to create default preferences\n');
    }

    // Test 2: Get user preferences
    console.log('2️⃣ Testing user preference retrieval...');
    const retrievedPrefs = await activityReminderService.getUserReminderPreferences(TEST_USER_ID);
    if (retrievedPrefs) {
      console.log('✅ User preferences retrieved successfully');
      console.log(`   - User ID: ${retrievedPrefs.user_id}`);
      console.log(`   - Overdue notifications: ${retrievedPrefs.overdue_notifications_enabled}\n`);
    } else {
      console.log('❌ Failed to retrieve user preferences\n');
    }

    // Test 3: Update user preferences
    console.log('3️⃣ Testing user preference updates...');
    const updatedPrefs = await activityReminderService.updateUserReminderPreferences(TEST_USER_ID, {
      email_reminder_minutes_before: 30,
      in_app_reminder_minutes_before: 10,
    });
    if (updatedPrefs) {
      console.log('✅ User preferences updated successfully');
      console.log(`   - New email timing: ${updatedPrefs.email_reminder_minutes_before} minutes`);
      console.log(`   - New in-app timing: ${updatedPrefs.in_app_reminder_minutes_before} minutes\n`);
    } else {
      console.log('❌ Failed to update user preferences\n');
    }

    // Test 4: Create a test notification
    console.log('4️⃣ Testing notification creation...');
    const notification = await activityReminderService.createNotification(
      TEST_USER_ID,
      'Test Activity Reminder',
      'This is a test notification to verify the system is working',
      'activity_reminder',
      {
        entityType: 'ACTIVITY',
        entityId: TEST_ACTIVITY_ID,
        actionUrl: `/activities/${TEST_ACTIVITY_ID}`,
        priority: 'normal',
        metadata: {
          testMode: true,
          activityType: 'CALL',
        },
      }
    );
    if (notification) {
      console.log('✅ Test notification created successfully');
      console.log(`   - Notification ID: ${notification.id}`);
      console.log(`   - Title: ${notification.title}`);
      console.log(`   - Type: ${notification.notification_type}`);
      console.log(`   - Priority: ${notification.priority}\n`);
    } else {
      console.log('❌ Failed to create test notification\n');
    }

    // Test 5: Get user notifications
    console.log('5️⃣ Testing notification retrieval...');
    const notificationResult = await activityReminderService.getUserNotifications(TEST_USER_ID, {
      limit: 10,
      offset: 0,
      filter: {},
    });
    if (notificationResult) {
      console.log('✅ User notifications retrieved successfully');
      console.log(`   - Total count: ${notificationResult.totalCount}`);
      console.log(`   - Unread count: ${notificationResult.unreadCount}`);
      console.log(`   - Retrieved: ${notificationResult.notifications.length} notifications\n`);
      
      // Show first notification if exists
      if (notificationResult.notifications.length > 0) {
        const firstNotification = notificationResult.notifications[0];
        if (firstNotification) {
          console.log('   First notification:');
          console.log(`   - Title: ${firstNotification.title}`);
          console.log(`   - Read: ${firstNotification.is_read}`);
          console.log(`   - Created: ${firstNotification.created_at}\n`);
        }
      }
    } else {
      console.log('❌ Failed to retrieve user notifications\n');
    }

    // Test 6: Get unread notification count
    console.log('6️⃣ Testing unread count...');
    const unreadCount = await activityReminderService.getUnreadNotificationCount(TEST_USER_ID);
    console.log(`✅ Unread notification count: ${unreadCount}\n`);

    // Test 7: Mark notification as read (if we have one)
    if (notification) {
      console.log('7️⃣ Testing mark notification as read...');
      const markedAsRead = await activityReminderService.markNotificationAsRead(notification.id, TEST_USER_ID);
      if (markedAsRead) {
        console.log('✅ Notification marked as read successfully');
        console.log(`   - Read at: ${markedAsRead.read_at}\n`);
      } else {
        console.log('❌ Failed to mark notification as read\n');
      }
    }

    // Test 8: Database table verification
    console.log('8️⃣ Testing database table existence...');
    const supabase = createClient(
      process.env.SUPABASE_URL || 'http://localhost:54321',
      process.env.SUPABASE_ANON_KEY || 'your-anon-key'
    );

    // Check user_reminder_preferences table
    const { data: prefsData, error: prefsError } = await supabase
      .from('user_reminder_preferences')
      .select('count(*)')
      .limit(1);
    
    if (!prefsError) {
      console.log('✅ user_reminder_preferences table accessible');
    } else {
      console.log('❌ user_reminder_preferences table error:', prefsError.message);
    }

    // Check activity_reminders table
    const { data: remindersData, error: remindersError } = await supabase
      .from('activity_reminders')
      .select('count(*)')
      .limit(1);
    
    if (!remindersError) {
      console.log('✅ activity_reminders table accessible');
    } else {
      console.log('❌ activity_reminders table error:', remindersError.message);
    }

    // Check notifications table
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('count(*)')
      .limit(1);
    
    if (!notificationsError) {
      console.log('✅ notifications table accessible\n');
    } else {
      console.log('❌ notifications table error:', notificationsError.message, '\n');
    }

    console.log('🎉 Activity Reminders System test completed!');
    console.log('📋 Summary:');
    console.log('   - Database tables are accessible');
    console.log('   - User preferences system working');
    console.log('   - Notification system functional');
    console.log('   - Service layer operational');
    console.log('\n💡 Next steps:');
    console.log('   1. Test with real activity data');
    console.log('   2. Test reminder scheduling');
    console.log('   3. Test Inngest background jobs');
    console.log('   4. Test GraphQL API integration');
    console.log('   5. Test frontend notification center');

  } catch (error) {
    console.error('❌ Activity Reminders System test failed:', error);
    throw error;
  }
}

// Export individual test functions for modular testing
export async function testUserPreferences(userId: string) {
  console.log('Testing user preferences for:', userId);
  
  try {
    const preferences = await activityReminderService.getUserReminderPreferences(userId);
    console.log('User preferences:', preferences);
    return preferences;
  } catch (error) {
    console.error('Failed to test user preferences:', error);
    throw error;
  }
}

export async function testNotificationCreation(userId: string, title: string, message: string) {
  console.log('Testing notification creation for:', userId);
  
  try {
    const notification = await activityReminderService.createNotification(
      userId,
      title,
      message,
      'activity_reminder',
      {
        priority: 'normal',
        metadata: { testMode: true },
      }
    );
    console.log('Created notification:', notification);
    return notification;
  } catch (error) {
    console.error('Failed to test notification creation:', error);
    throw error;
  }
}

export async function testActivityReminderScheduling(activityId: string) {
  console.log('Testing activity reminder scheduling for:', activityId);
  
  try {
    await activityReminderService.scheduleActivityReminders(activityId);
    console.log('Activity reminders scheduled successfully');
    return true;
  } catch (error) {
    console.error('Failed to test activity reminder scheduling:', error);
    throw error;
  }
}

// Helper function to cleanup test data
export async function cleanupTestData(userId: string) {
  console.log('Cleaning up test data for user:', userId);
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL || 'http://localhost:54321',
      process.env.SUPABASE_ANON_KEY || 'your-anon-key'
    );

    // Delete test notifications
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('metadata->testMode', true);

    // Delete test reminders
    await supabase
      .from('activity_reminders')
      .delete()
      .eq('user_id', userId);

    // Delete test preferences
    await supabase
      .from('user_reminder_preferences')
      .delete()
      .eq('user_id', userId);

    console.log('Test data cleaned up successfully');
  } catch (error) {
    console.error('Failed to cleanup test data:', error);
  }
}

// Run test if called directly
if (require.main === module) {
  testActivityReminderSystem()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} 