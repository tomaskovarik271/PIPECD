const { createClient } = require('@supabase/supabase-js');

const client = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function testFinalTemplateSubstitution() {
  console.log('🧪 Final Test: Template Substitution in Business Rules\n');
  
  try {
    // First test the template substitution function directly
    console.log('🔧 Testing substitute_template_variables function directly...');
    const { data: testResult, error: testError } = await client.rpc('substitute_template_variables', {
      template_text: 'High value deal detected: {{deal_name}} - Amount: {{deal_amount}}',
      entity_data: {
        id: 'test-123',
        name: 'ACME Corporation Deal',
        amount: 75000,
        currency: 'EUR'
      },
      entity_type: 'DEAL'
    });
    
    if (testError) {
      console.error('❌ Template function error:', testError);
      return;
    }
    
    console.log('✅ Template function result:', testResult);
    console.log('');
    
    // Clear existing notifications
    console.log('🧹 Clearing old notifications...');
    await client
      .from('business_rule_notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Check if we have users, if not create one
    const { data: existingUsers } = await client
      .from('user_profiles')
      .select('id, first_name, last_name')
      .limit(1);
    
    let userId;
    if (!existingUsers || existingUsers.length === 0) {
      console.log('👤 Creating test user...');
      userId = '11111111-1111-1111-1111-111111111111';
      const { error: userError } = await client
        .from('user_profiles')
        .upsert({
          id: userId,
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com'
        });
      
      if (userError) {
        console.error('❌ Error creating user:', userError);
        return;
      }
      console.log('✅ Test user created');
    } else {
      userId = existingUsers[0].id;
      console.log(`👤 Using existing user: ${existingUsers[0].first_name} ${existingUsers[0].last_name}`);
    }
    
    // Update an existing deal to trigger business rules
    console.log('\\n💼 Updating existing deal to trigger business rules...');
    const { data: existingDeals } = await client
      .from('deals')
      .select('id, name, amount, currency')
      .limit(1);
    
    if (!existingDeals || existingDeals.length === 0) {
      console.log('❌ No existing deals found to update');
      return;
    }
    
    const dealToUpdate = existingDeals[0];
    console.log(`📝 Updating deal: ${dealToUpdate.name}`);
    
    // Update the deal with a high amount to trigger rules
    const { data: updatedDeal, error: updateError } = await client
      .from('deals')
      .update({
        amount: 95000,
        currency: 'EUR',
        assigned_to_user_id: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', dealToUpdate.id)
      .select('*')
      .single();
    
    if (updateError) {
      console.error('❌ Error updating deal:', updateError);
      return;
    }
    
    console.log('✅ Deal updated successfully');
    console.log(`   New amount: ${updatedDeal.currency} ${updatedDeal.amount?.toLocaleString()}`);
    
    // Wait for business rules to process
    console.log('\\n⏳ Waiting for business rules to process...');
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Check for new notifications
    console.log('🔍 Checking for new notifications...');
    const { data: notifications } = await client
      .from('business_rule_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!notifications || notifications.length === 0) {
      console.log('⚠️ No notifications found');
      
      // Check rule executions
      const { data: executions } = await client
        .from('rule_executions')
        .select('*')
        .eq('entity_id', dealToUpdate.id)
        .order('executed_at', { ascending: false });
      
      console.log(`📊 Rule executions: ${executions?.length || 0}`);
      if (executions && executions.length > 0) {
        executions.forEach(exec => {
          console.log(`   - Conditions Met: ${exec.conditions_met}, Notifications: ${exec.notifications_created}`);
        });
      }
      return;
    }
    
    console.log(`\\n🎉 Found ${notifications.length} notification(s):\\n`);
    
    notifications.forEach((notif, i) => {
      console.log(`📢 Notification ${i + 1}:`);
      console.log(`   Title: "${notif.title}"`);
      console.log(`   Message: "${notif.message}"`);
      console.log(`   Priority: ${notif.priority}`);
      console.log(`   Created: ${new Date(notif.created_at).toLocaleString()}`);
      console.log('');
    });
    
    // Analyze template substitution
    console.log('🔍 Template Substitution Analysis:');
    const hasTemplateVars = notifications.some(n => 
      n.title.includes('{{') || n.message.includes('{{')
    );
    
    const hasActualValues = notifications.some(n => 
      n.title.includes(updatedDeal.name) || 
      n.message.includes(updatedDeal.name) ||
      n.message.includes('EUR') ||
      n.message.includes('95,000')
    );
    
    if (hasTemplateVars) {
      console.log('❌ Template variables still showing ({{deal_name}}, etc.)');
      console.log('   Template substitution is NOT working properly');
    } else if (hasActualValues) {
      console.log('✅ Template substitution is working correctly!');
      console.log('   Variables have been replaced with actual deal values');
    } else {
      console.log('⚠️ Cannot determine template substitution status');
      console.log('   Notifications exist but content is unclear');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFinalTemplateSubstitution().catch(console.error); 