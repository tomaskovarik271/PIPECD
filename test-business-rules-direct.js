const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env file
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }
}

loadEnv();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testBusinessRulesDirect() {
  console.log('🧪 Testing Business Rules Function Directly...\n');

  try {
    // 1. Get a test deal
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('*')
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
      assigned_to_user_id: testDeal.assigned_to_user_id
    });

    // 2. Test the business rules function directly
    console.log('\n🔄 Calling process_business_rules function directly...');
    
    const entityData = {
      id: testDeal.id,
      name: testDeal.name,
      assigned_to_user_id: testDeal.assigned_to_user_id,
      amount: testDeal.amount,
      user_id: testDeal.user_id
    };

    const changeData = {
      original_assigned_to_user_id: null,
      assigned_to_user_id: testDeal.assigned_to_user_id
    };

    console.log('📤 Entity Data:', entityData);
    console.log('📤 Change Data:', changeData);

    const { data: businessRulesResult, error: businessRulesError } = await supabase
      .rpc('process_business_rules', {
        p_entity_type: 'DEAL',
        p_entity_id: testDeal.id,
        p_trigger_event: 'DEAL_UPDATED',
        p_entity_data: entityData,
        p_change_data: changeData
      });

    if (businessRulesError) {
      console.error('❌ Business rules function error:', businessRulesError);
      return;
    }

    console.log('✅ Business rules function executed successfully!');
    console.log('📊 Result:', JSON.stringify(businessRulesResult, null, 2));

    // 3. Check rule executions
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
      console.log('⚠️ No rule executions found');
    } else {
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
    }

    // 4. Check business rules
    console.log('\n🔍 Checking business rules configuration...');
    
    const { data: rules, error: rulesError } = await supabase
      .from('business_rules')
      .select('*')
      .eq('status', 'ACTIVE')
      .eq('entity_type', 'DEAL');

    if (rulesError) {
      console.error('❌ Error fetching business rules:', rulesError);
    } else if (!rules || rules.length === 0) {
      console.log('⚠️ No active DEAL business rules found');
    } else {
      console.log(`✅ Found ${rules.length} active DEAL rule(s):`);
      rules.forEach((rule, index) => {
        console.log(`\n${index + 1}. ${rule.name}`);
        console.log(`   - Trigger Type: ${rule.trigger_type}`);
        console.log(`   - Trigger Events: ${JSON.stringify(rule.trigger_events)}`);
        console.log(`   - Conditions: ${JSON.stringify(rule.conditions)}`);
        console.log(`   - Actions: ${JSON.stringify(rule.actions)}`);
      });
    }

    console.log('\n🎉 Direct Business Rules Test Completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testBusinessRulesDirect().then(() => {
  console.log('\n✅ Test script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
}); 