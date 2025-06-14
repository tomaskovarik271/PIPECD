const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestNotification() {
  console.log('🧪 Creating Test Notification');
  console.log('============================\n');

  try {
    const testUserId = '4d3cbcd4-e0a4-4a63-b8d3-4360344a1c54';
    
    // Create a test notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: testUserId,
        title: 'Test Notification',
        message: 'This is a test notification to verify the notification center is working!',
        notification_type: 'system_announcement',
        priority: 'normal',
        entity_type: null,
        entity_id: null,
        action_url: null,
        metadata: { test: true },
        expires_at: null,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating test notification:', error);
      return;
    }

    console.log('✅ Test notification created successfully!');
    console.log(`   ID: ${data.id}`);
    console.log(`   Title: ${data.title}`);
    console.log(`   Message: ${data.message}`);
    console.log(`   User: ${data.user_id}`);
    console.log(`   Created: ${data.created_at}`);
    
    console.log('\n🔔 Now check the notification bell in your app - you should see:');
    console.log('   • Red badge with "1" on the bell icon');
    console.log('   • Test notification when you click the bell');
    console.log('   • Ability to mark as read or delete');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestNotification().then(() => {
  console.log('\n🎯 Test notification creation completed');
}); 