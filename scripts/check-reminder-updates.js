const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkReminderUpdates() {
  console.log('🔍 Checking Activity Reminder Updates');
  console.log('====================================\n');

  try {
    // 1. Check the Call IMR activity current state
    console.log('📋 1. Current state of "Call IMR" activity:');
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id, subject, due_date, is_done, type, created_at, updated_at')
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
    console.log(`   Due Date: ${activity.due_date}`);
    console.log(`   Type: ${activity.type}`);
    console.log(`   Is Done: ${activity.is_done}`);
    console.log(`   Created: ${activity.created_at}`);
    console.log(`   Updated: ${activity.updated_at}`);
    console.log(`   Was Modified: ${activity.updated_at !== activity.created_at ? 'YES' : 'NO'}`);

    // 2. Check all reminders for this activity
    console.log('\n📋 2. All reminders for this activity:');
    const { data: reminders, error: remindersError } = await supabase
      .from('activity_reminders')
      .select('*')
      .eq('activity_id', activity.id)
      .order('created_at', { ascending: true });

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError);
      return;
    }

    if (reminders.length === 0) {
      console.log('❌ No reminders found for this activity');
    } else {
      reminders.forEach((reminder, index) => {
        console.log(`\n   Reminder #${index + 1}:`);
        console.log(`     ID: ${reminder.id}`);
        console.log(`     Type: ${reminder.reminder_type}`);
        console.log(`     Scheduled For: ${reminder.scheduled_for}`);
        console.log(`     Is Sent: ${reminder.is_sent}`);
        console.log(`     Created: ${reminder.created_at}`);
        console.log(`     Updated: ${reminder.updated_at}`);
        
        // Check if reminder was created after activity update
        const reminderCreated = new Date(reminder.created_at);
        const activityUpdated = new Date(activity.updated_at);
        const createdAfterUpdate = reminderCreated > activityUpdated;
        console.log(`     Created After Activity Update: ${createdAfterUpdate ? 'YES' : 'NO'}`);
      });
    }

    // 3. Summary analysis
    console.log('\n📋 3. Analysis:');
    const emailReminders = reminders.filter(r => r.reminder_type === 'email');
    const inAppReminders = reminders.filter(r => r.reminder_type === 'in_app');
    
    console.log(`   Total reminders: ${reminders.length}`);
    console.log(`   Email reminders: ${emailReminders.length}`);
    console.log(`   In-app reminders: ${inAppReminders.length}`);
    
    if (reminders.length > 2) {
      console.log('⚠️  MORE than 2 reminders found - possible old reminders not cleaned up');
    } else if (reminders.length === 2) {
      console.log('✅ Exactly 2 reminders found (email + in-app) - looks good');
    } else if (reminders.length === 0) {
      console.log('❌ No reminders found - reminder scheduling may not be working');
    }

    // 4. Check timing
    if (reminders.length > 0) {
      console.log('\n📋 4. Reminder timing analysis:');
      reminders.forEach(reminder => {
        const scheduledFor = new Date(reminder.scheduled_for);
        const activityDueDate = new Date(activity.due_date);
        const timeDiff = (activityDueDate - scheduledFor) / (1000 * 60); // minutes
        
        console.log(`   ${reminder.reminder_type} reminder: ${Math.round(timeDiff)} minutes before due date`);
      });
    }

    // 5. Check recent reminder activity
    console.log('\n📋 5. Recent reminder activity (last 2 hours):');
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    
    const { data: recentReminders, error: recentError } = await supabase
      .from('activity_reminders')
      .select(`
        id, reminder_type, scheduled_for, created_at,
        activities!inner(subject, due_date)
      `)
      .gte('created_at', twoHoursAgo)
      .order('created_at', { ascending: false });

    if (recentError) {
      console.error('Error fetching recent reminders:', recentError);
    } else if (recentReminders.length === 0) {
      console.log('   No recent reminder activity');
    } else {
      recentReminders.forEach(reminder => {
        console.log(`   ${reminder.created_at}: ${reminder.reminder_type} reminder for "${reminder.activities.subject}"`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking reminders:', error);
  }
}

checkReminderUpdates().then(() => {
  console.log('\n🎯 Check completed');
}); 