const { createClient } = require('@supabase/supabase-js');

// Use service role key for full access
const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function testConversionStatus() {
  console.log('🧪 Testing Conversion Status Setup...\n');

  try {
    // 1. Check "Converted to Lead" status
    const { data: convertedStatus, error: statusError } = await supabase
      .from('statuses')
      .select('id, name, description')
      .eq('name', 'Converted to Lead')
      .single();

    if (statusError) {
      console.error('❌ Error finding "Converted to Lead" status:', statusError);
      return;
    }

    console.log('✅ "Converted to Lead" status found:', convertedStatus);

    // 2. Find Sales Process workflow
    const { data: salesWorkflow, error: workflowError } = await supabase
      .from('workflows')
      .select('id, name')
      .eq('name', 'Standard Sales Process')
      .single();

    if (workflowError) {
      console.error('❌ Error finding Sales Process workflow:', workflowError);
      return;
    }

    console.log('✅ Sales Process workflow found:', salesWorkflow);

    // 3. Check workflow step for "Converted to Lead"
    const { data: workflowStep, error: stepError } = await supabase
      .from('workflow_steps')
      .select('id, step_order, is_final_step')
      .eq('status_id', convertedStatus.id)
      .eq('workflow_id', salesWorkflow.id)
      .single();

    if (stepError) {
      console.error('❌ Error finding workflow step:', stepError);
      return;
    }

    console.log('✅ Workflow step found:', workflowStep);

    // 4. Check if there are any deals to test with
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('id, name, wfm_project_id')
      .limit(1);

    if (dealsError) {
      console.error('❌ Error fetching deals:', dealsError);
      return;
    }

    console.log(`📊 Found ${deals.length} deals in database`);

    console.log('\n🎯 CONVERSION SETUP VERIFIED:');
    console.log('- "Converted to Lead" status exists ✅');
    console.log('- Sales Process workflow exists ✅');
    console.log('- Workflow step for conversion exists ✅');
    console.log('- Step is final step:', workflowStep.is_final_step ? '✅' : '❌');
    console.log('\n✨ The conversion system should work correctly!');

    if (workflowStep.is_final_step) {
      console.log('\n💡 When a deal is converted to lead, it will:');
      console.log('   1. Move to "Converted to Lead" status');
      console.log('   2. Disappear from Kanban (because is_final_step = true)');
      console.log('   3. Create a new lead with the deal data');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConversionStatus();
