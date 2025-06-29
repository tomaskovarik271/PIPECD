const { createClient } = require('@supabase/supabase-js');

const client = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function testTemplateSubstitution() {
  console.log('🧪 Testing Business Rules Template Substitution...\n');
  
  try {
    // Clear existing notifications first
    console.log('🧹 Clearing existing notifications...');
    await client
      .from('business_rule_notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Notifications cleared\n');
    
    // Get user data
    const { data: users } = await client
      .from('user_profiles')
      .select('id, first_name, last_name')
      .limit(1);
    
    if (!users || users.length === 0) {
      console.error('❌ No users found');
      return;
    }
    
    const userId = users[0].id;
    console.log(`👤 Using user: ${users[0].first_name} ${users[0].last_name} (${userId})`);
    
    // Get organization
    const { data: orgs } = await client
      .from('organizations')
      .select('id, name')
      .limit(1);
    
    const orgId = orgs && orgs.length > 0 ? orgs[0].id : null;
    console.log(`🏢 Using organization: ${orgs?.[0]?.name || 'None'}`);
    
    // Get WFM project type
    const { data: projectTypes } = await client
      .from('project_types')
      .select('id, name')
      .eq('name', 'Sales Deal')
      .limit(1);
    
    const projectTypeId = projectTypes && projectTypes.length > 0 ? projectTypes[0].id : null;
    console.log(`📋 Using project type: ${projectTypes?.[0]?.name || 'None'}\n`);
    
    // Create high-value deal to trigger business rules
    console.log('💰 Creating high-value deal to trigger business rules...');
    const dealData = {
      name: 'Template Substitution Test Deal',
      amount: 95000, // High enough to trigger high value rule
      currency: 'EUR',
      expected_close_date: '2025-02-20',
      assigned_to_user_id: userId,
      organization_id: orgId,
      wfm_project_type_id: projectTypeId,
      created_by_user_id: userId
    };
    
    const { data: deal, error: dealError } = await client
      .from('deals')
      .insert(dealData)
      .select('*')
      .single();
    
    if (dealError) {
      console.error('❌ Error creating deal:', dealError);
      return;
    }
    
    console.log(`✅ Created deal: "${deal.name}"`);
    console.log(`   Amount: ${deal.currency} ${deal.amount?.toLocaleString()}`);
    console.log(`   ID: ${deal.id}\n`);
    
    // Wait for business rules to process
    console.log('⏳ Waiting for business rules to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for notifications
    console.log('🔍 Checking generated notifications...\n');
    const { data: notifications } = await client
      .from('business_rule_notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!notifications || notifications.length === 0) {
      console.log('⚠️ No notifications found - business rules may not have triggered');
      
      // Check rule executions
      const { data: executions } = await client
        .from('rule_executions')
        .select('*')
        .eq('entity_id', deal.id)
        .order('executed_at', { ascending: false });
      
      if (executions && executions.length > 0) {
        console.log('📊 Rule executions found:');
        executions.forEach((exec, i) => {
          console.log(`   ${i + 1}. Rule: ${exec.rule_id}`);
          console.log(`      Conditions Met: ${exec.conditions_met}`);
          console.log(`      Notifications: ${exec.notifications_created}`);
        });
      } else {
        console.log('⚠️ No rule executions found either');
      }
      
      return;
    }
    
    console.log(`🎉 Found ${notifications.length} notification(s) with template substitution:\n`);
    
    notifications.forEach((notif, i) => {
      console.log(`📢 Notification ${i + 1}:`);
      console.log(`   Title: "${notif.title}"`);
      console.log(`   Message: "${notif.message}"`);
      console.log(`   Priority: ${notif.priority}`);
      console.log(`   Type: ${notif.notification_type}`);
      console.log(`   Created: ${new Date(notif.created_at).toLocaleString()}`);
      console.log('');
    });
    
    // Verify template substitution worked
    const hasSubstitution = notifications.some(n => 
      n.title.includes(deal.name) || 
      n.message.includes(deal.name) ||
      n.message.includes(deal.currency) ||
      n.message.includes(deal.amount?.toString())
    );
    
    if (hasSubstitution) {
      console.log('✅ Template substitution is working correctly!');
      console.log('   Variables like {{deal_name}} and {{deal_amount}} are being replaced with actual values.');
    } else {
      console.log('❌ Template substitution may not be working properly.');
      console.log('   Check if template variables are still showing as {{deal_name}} etc.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTemplateSubstitution().catch(console.error); 