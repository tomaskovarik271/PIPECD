const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCallPeter() {
  console.log('🔍 Checking "Call Peter" Activity and Reminders');
  console.log('===============================================\n');

  try {
    // 1. Get the Call Peter activity
    console.log('📋 1. "Call Peter" activity details:');
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id, subject, due_date, is_done, type, user_id, assigned_to_user_id, created_at, updated_at')
      .ilike('subject', '%Call Peter%')
      .order('created_at', { ascending: false });

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return;
    }

    if (activities.length === 0) {
      console.log('❌ No "Call Peter" activity found');
      return;
    }

    const activity = activities[0];
    console.log(`   Activity ID: ${activity.id}`);
    console.log(`   Subject: ${activity.subject}`);
    console.log(`   Due Date: ${activity.due_date}`);
    console.log(`   Type: ${activity.type}`);
    console.log(`   Is Done: ${activity.is_done}`);
    console.log(`   Created: ${activity.created_at}`);
    console.log(`   Creator: ${activity.user_id}`);
    console.log(`   Assigned To: ${activity.assigned_to_user_id || 'Not assigned'}`);

    // Parse the due date to show local time
    const dueDate = new Date(activity.due_date);
    console.log(`   Due Date (Local): ${dueDate.toLocaleString()}`);

    // 2. Check reminders for this activity
    console.log('\n📋 2. Reminders for "Call Peter":');
    const { data: reminders, error: remindersError } = await supabase
      .from('activity_reminders')
      .select('*')
      .eq('activity_id', activity.id)
      .order('scheduled_for', { ascending: true });

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError);
      return;
    }

    if (reminders.length === 0) {
      console.log('❌ No reminders found for this activity');
    } else {
      console.log(`✅ Found ${reminders.length} reminders:`);
      
      reminders.forEach((reminder, index) => {
        const scheduledDate = new Date(reminder.scheduled_for);
        const timeDiff = (dueDate - scheduledDate) / (1000 * 60); // minutes
        
        console.log(`\n   Reminder #${index + 1}:`);
        console.log(`     Type: ${reminder.reminder_type}`);
        console.log(`     Scheduled For: ${reminder.scheduled_for}`);
        console.log(`     Scheduled For (Local): ${scheduledDate.toLocaleString()}`);
        console.log(`     Time Before Due: ${Math.round(timeDiff)} minutes`);
        console.log(`     Is Sent: ${reminder.is_sent}`);
        console.log(`     User ID: ${reminder.user_id}`);
        console.log(`     Created: ${reminder.created_at}`);
        
        // Show reminder content
        if (reminder.reminder_content) {
          console.log(`     Content: ${JSON.stringify(reminder.reminder_content, null, 6)}`);
        }
      });
    }

    // 3. Timeline analysis
    console.log('\n📋 3. Timeline analysis:');
    console.log(`   Activity created: ${activity.created_at} (17:21 local)`);
    
    if (reminders.length > 0) {
      console.log(`   Reminders created: ${reminders[0].created_at} (seconds after activity)`);
      
      const activityTime = new Date(activity.created_at);
      const reminderTime = new Date(reminders[0].created_at);
      const timeDiff = (reminderTime - activityTime) / 1000; // seconds
      
      console.log(`   Processing delay: ~${timeDiff.toFixed(1)} seconds ⚡`);
      
      console.log('\n📅 Reminder schedule for tonight:');
      reminders.forEach(reminder => {
        const scheduledDate = new Date(reminder.scheduled_for);
        console.log(`   ${reminder.reminder_type}: ${scheduledDate.toLocaleTimeString()}`);
      });
    }

    // 4. Show current time and time until reminders
    console.log('\n📋 4. Current status:');
    const now = new Date();
    console.log(`   Current time: ${now.toLocaleString()}`);
    console.log(`   Due date: ${dueDate.toLocaleString()}`);
    
    if (reminders.length > 0) {
      reminders.forEach(reminder => {
        const scheduledDate = new Date(reminder.scheduled_for);
        const timeUntil = (scheduledDate - now) / (1000 * 60); // minutes
        
        if (timeUntil > 0) {
          console.log(`   Time until ${reminder.reminder_type} reminder: ${Math.round(timeUntil)} minutes`);
        } else {
          console.log(`   ${reminder.reminder_type} reminder was scheduled ${Math.round(-timeUntil)} minutes ago`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Error checking Call Peter activity:', error);
  }
}

checkCallPeter().then(() => {
  console.log('\n🎯 Check completed');
}); 