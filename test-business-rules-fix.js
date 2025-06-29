const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testBusinessRulesExecution() {
  console.log('🧪 Testing Business Rules Execution After Fix...\n');

  try {
    // 1. Get a test deal
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('id, name, assigned_to_user_id')
      .limit(1);

    if (dealsError) {
      console.error('❌ Error fetching deals:', dealsError);
      return;
    }

    if (!deals || deals.length === 0) {
      console.log('⚠️ No deals found to test with');
      return;
    }

    const testDeal = deals[0];
    console.log('📊 Test Deal:', {
      id: testDeal.id,
      name: testDeal.name,
      currentAssignee: testDeal.assigned_to_user_id
    });

    // 2. Get a different user to assign (or unassign and then reassign)
    const { data: userProfiles, error: usersError } = await supabase
      .from('user_profiles')
      .select('user_id, email, display_name')
      .neq('user_id', testDeal.assigned_to_user_id || '00000000-0000-0000-0000-000000000000')
      .limit(1);

    if (usersError) {
      console.error('❌ Error fetching user profiles:', usersError);
      return;
    }

    let newAssignee;
    if (!userProfiles || userProfiles.length === 0) {
      console.log('⚠️ No other user profiles found - will test by unassigning and reassigning same user');
      
      // First, unassign the deal
      console.log('\n🔄 Step 1: Unassigning deal to create a change...');
      const { data: unassignedDeal, error: unassignError } = await supabase
        .from('deals')
        .update({ 
          assigned_to_user_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', testDeal.id)
        .select()
        .single();

      if (unassignError) {
        console.error('❌ Error unassigning deal:', unassignError);
        return;
      }

      console.log('✅ Deal unassigned successfully!');
      
      // Wait a moment to ensure the change is processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now reassign to the original user
      newAssignee = { user_id: testDeal.assigned_to_user_id };
    } else {
      newAssignee = userProfiles[0];
    }

    console.log('👤 New Assignee:', newAssignee.user_id);

    // 3. Update the deal to trigger business rules
    console.log('\n🔄 Step 2: Updating deal to trigger business rules...');
    
    const { data: updatedDeal, error: updateError } = await supabase
      .from('deals')
      .update({ 
        assigned_to_user_id: newAssignee.user_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', testDeal.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating deal:', updateError);
      return;
    }

    console.log('✅ Deal updated successfully!');
    console.log('📊 Updated Deal:', {
      id: updatedDeal.id,
      name: updatedDeal.name,
      newAssignee: updatedDeal.assigned_to_user_id
    });

    // 4. Check if business rules were executed
    console.log('\n🔍 Checking rule executions...');
    
    const { data: executions, error: executionsError } = await supabase
      .from('rule_executions')
      .select(`
        id,
        rule_id,
        entity_id,
        execution_trigger,
        conditions_met,
        execution_time_ms,
        notifications_created,
        executed_at,
        business_rules (
          name,
          entity_type
        )
      `)
      .eq('entity_id', testDeal.id)
      .order('executed_at', { ascending: false })
      .limit(5);

    if (executionsError) {
      console.error('❌ Error fetching rule executions:', executionsError);
      return;
    }

    if (!executions || executions.length === 0) {
      console.log('⚠️ No rule executions found - business rules may not have triggered');
      return;
    }

    console.log(`✅ Found ${executions.length} rule execution(s):`);
    executions.forEach((execution, index) => {
      console.log(`\n${index + 1}. Rule: ${execution.business_rules?.name}`);
      console.log(`   - Entity Type: ${execution.business_rules?.entity_type}`);
      console.log(`   - Trigger: ${execution.execution_trigger}`);
      console.log(`   - Conditions Met: ${execution.conditions_met}`);
      console.log(`   - Execution Time: ${execution.execution_time_ms}ms`);
      console.log(`   - Notifications Created: ${execution.notifications_created || 0}`);
      console.log(`   - Executed At: ${new Date(execution.executed_at).toLocaleString()}`);
    });

    // 5. Check notifications created
    console.log('\n📬 Checking notifications...');
    
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('entity_id', testDeal.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (notificationsError) {
      console.error('❌ Error fetching notifications:', notificationsError);
      return;
    }

    if (!notifications || notifications.length === 0) {
      console.log('⚠️ No notifications found');
    } else {
      console.log(`✅ Found ${notifications.length} notification(s):`);
      notifications.forEach((notification, index) => {
        console.log(`\n${index + 1}. Type: ${notification.type}`);
        console.log(`   - Title: ${notification.title}`);
        console.log(`   - Message: ${notification.message}`);
        console.log(`   - User ID: ${notification.user_id}`);
        console.log(`   - Created: ${new Date(notification.created_at).toLocaleString()}`);
      });
    }

    console.log('\n🎉 Business Rules Test Completed Successfully!');
    console.log('✅ The "execution_time_ms ambiguous" error has been fixed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testBusinessRulesExecution().then(() => {
  console.log('\n✅ Test script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
}); 