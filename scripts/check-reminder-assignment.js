const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkReminderAssignment() {
  console.log('🔍 Checking Who Gets Activity Reminders');
  console.log('======================================\n');

  try {
    // 1. Get the Call IMR activity with all relevant user fields
    console.log('📋 1. Activity assignment details:');
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id, subject, user_id, assigned_to_user_id, due_date, created_at, updated_at')
      .ilike('subject', '%Call IMR%')
      .order('updated_at', { ascending: false });

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return;
    }

    if (activities.length === 0) {
      console.log('❌ No "Call IMR" activity found');
      return;
    }

    const activity = activities[0];
    console.log(`   Activity ID: ${activity.id}`);
    console.log(`   Subject: ${activity.subject}`);
    console.log(`   Creator (user_id): ${activity.user_id}`);
    console.log(`   Assigned To (assigned_to_user_id): ${activity.assigned_to_user_id || 'Not assigned'}`);
    console.log(`   Due Date: ${activity.due_date}`);

    // 2. Determine who should get reminders based on the logic:
    // targetUserId = activity.assigned_to_user_id || activity.user_id;
    const targetUserId = activity.assigned_to_user_id || activity.user_id;
    console.log(`\n📋 2. Reminder target user logic:`);
    console.log(`   Target User ID for reminders: ${targetUserId}`);
    
    if (activity.assigned_to_user_id) {
      console.log(`   ✅ Activity is assigned → Reminders go to ASSIGNED USER`);
    } else {
      console.log(`   ✅ Activity not assigned → Reminders go to CREATOR`);
    }

    // 3. Check who actually received the reminders
    console.log(`\n📋 3. Actual reminders in database:`);
    const { data: reminders, error: remindersError } = await supabase
      .from('activity_reminders')
      .select('id, user_id, reminder_type, scheduled_for, created_at')
      .eq('activity_id', activity.id)
      .order('created_at', { ascending: true });

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError);
      return;
    }

    if (reminders.length === 0) {
      console.log('   ❌ No reminders found');
    } else {
      reminders.forEach((reminder, index) => {
        console.log(`\n   Reminder #${index + 1}:`);
        console.log(`     Type: ${reminder.reminder_type}`);
        console.log(`     User ID: ${reminder.user_id}`);
        console.log(`     Scheduled For: ${reminder.scheduled_for}`);
        console.log(`     Matches Target: ${reminder.user_id === targetUserId ? '✅ YES' : '❌ NO'}`);
      });
    }

    // 4. Check if creator and assigned user are the same
    console.log(`\n📋 4. User comparison:`);
    if (activity.user_id === activity.assigned_to_user_id) {
      console.log(`   ✅ Creator and assigned user are THE SAME person`);
      console.log(`   → You created the activity AND assigned it to yourself`);
    } else if (activity.assigned_to_user_id) {
      console.log(`   ⚠️  Creator and assigned user are DIFFERENT`);
      console.log(`   → Activity created by: ${activity.user_id}`);
      console.log(`   → Activity assigned to: ${activity.assigned_to_user_id}`);
    } else {
      console.log(`   ⚠️  Activity is NOT assigned to anyone`);
      console.log(`   → Only creator gets reminders: ${activity.user_id}`);
    }

    // 5. Get user email/info for context (if available)
    console.log(`\n📋 5. User context:`);
    
    // Try to get user info from auth.users (might not work without proper auth)
    const userIds = [activity.user_id];
    if (activity.assigned_to_user_id && activity.assigned_to_user_id !== activity.user_id) {
      userIds.push(activity.assigned_to_user_id);
    }

    for (const userId of userIds) {
      console.log(`   User ${userId}: ${userId === activity.user_id ? '(Creator)' : '(Assigned)'}`);
    }

  } catch (error) {
    console.error('❌ Error checking reminder assignment:', error);
  }
}

checkReminderAssignment().then(() => {
  console.log('\n🎯 Check completed');
}); 