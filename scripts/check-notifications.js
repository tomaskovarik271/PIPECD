const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNotifications() {
  console.log('🔍 Checking Notifications in Database');
  console.log('====================================\n');

  try {
    // 1. Check total notifications in the system
    console.log('📋 1. Total notifications in database:');
    const { data: allNotifications, error: allError } = await supabase
      .from('notifications')
      .select('id, user_id, title, notification_type, is_read, created_at')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('Error fetching all notifications:', allError);
      return;
    }

    console.log(`   Total notifications: ${allNotifications.length}`);

    if (allNotifications.length === 0) {
      console.log('   ❌ No notifications found in database');
      console.log('\n🎯 This explains why the notification center shows empty or mock data!');
      
      console.log('\n📋 To test notifications, you can:');
      console.log('   1. Wait for activity reminders to be processed by Inngest');
      console.log('   2. Create test notifications manually');
      console.log('   3. Trigger overdue activity notifications');
      
      return;
    }

    // Group by user
    const userGroups = allNotifications.reduce((acc, notif) => {
      if (!acc[notif.user_id]) acc[notif.user_id] = [];
      acc[notif.user_id].push(notif);
      return acc;
    }, {});

    console.log(`   Users with notifications: ${Object.keys(userGroups).length}`);
    
    Object.entries(userGroups).forEach(([userId, notifications]) => {
      const unreadCount = notifications.filter(n => !n.is_read).length;
      console.log(`   User ${userId}: ${notifications.length} total, ${unreadCount} unread`);
    });

    // 2. Show recent notifications
    console.log('\n📋 2. Recent notifications (last 10):');
    allNotifications.slice(0, 10).forEach((notif, index) => {
      console.log(`\n   Notification #${index + 1}:`);
      console.log(`     ID: ${notif.id}`);
      console.log(`     User: ${notif.user_id}`);
      console.log(`     Title: ${notif.title}`);
      console.log(`     Type: ${notif.notification_type}`);
      console.log(`     Read: ${notif.is_read ? 'Yes' : 'No'}`);
      console.log(`     Created: ${notif.created_at}`);
    });

    // 3. Check notification types
    console.log('\n📋 3. Notification types breakdown:');
    const typeBreakdown = allNotifications.reduce((acc, notif) => {
      acc[notif.notification_type] = (acc[notif.notification_type] || 0) + 1;
      return acc;
    }, {});

    Object.entries(typeBreakdown).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} notifications`);
    });

    // 4. Check for specific user (the one we tested with Call IMR activity)
    const testUserId = '4d3cbcd4-e0a4-4a63-b8d3-4360344a1c54';
    console.log(`\n📋 4. Notifications for test user (${testUserId}):`);
    
    const userNotifications = allNotifications.filter(n => n.user_id === testUserId);
    
    if (userNotifications.length === 0) {
      console.log('   ❌ No notifications found for this user');
      console.log('   → This means activity reminders haven\'t been processed yet');
    } else {
      console.log(`   ✅ Found ${userNotifications.length} notifications:`);
      userNotifications.forEach((notif, index) => {
        console.log(`\n     #${index + 1}: ${notif.title}`);
        console.log(`       Type: ${notif.notification_type}`);
        console.log(`       Read: ${notif.is_read ? 'Yes' : 'No'}`);
        console.log(`       Created: ${notif.created_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking notifications:', error);
  }
}

checkNotifications().then(() => {
  console.log('\n🎯 Check completed');
}); 