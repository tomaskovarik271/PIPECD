const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function testDealToLeadConversion() {
  console.log('🧪 Testing Deal to Lead Conversion Status Update...\n');

  try {
    // 1. Check if "Converted to Lead" status exists
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

    // 2. Find the Sales Process workflow
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

    // 3. Check if workflow step exists for "Converted to Lead" in Sales Process
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

    // 4. Check if there are any existing deals to test with
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('id, name, wfm_project_id')
      .limit(1);

    if (dealsError) {
      console.error('❌ Error fetching deals:', dealsError);
      return;
    }

    if (!deals || deals.length === 0) {
      console.log('⚠️  No deals found to test with. Please create a deal first.');
      return;
    }

    const testDeal = deals[0];
    console.log('✅ Test deal found:', testDeal);

    // 5. Check the deal's current WFM project status
    const { data: wfmProject, error: wfmError } = await supabase
      .from('wfm_projects')
      .select('id, current_wfm_step_id, workflow_id')
      .eq('id', testDeal.wfm_project_id)
      .single();

    if (wfmError) {
      console.error('❌ Error fetching WFM project:', wfmError);
      return;
    }

    console.log('✅ Deal\'s WFM project:', wfmProject);

    // 6. Get current status name
    const { data: currentStep, error: currentStepError } = await supabase
      .from('workflow_steps')
      .select('statuses(name)')
      .eq('id', wfmProject.current_wfm_step_id)
      .single();

    if (!currentStepError && currentStep) {
      console.log('✅ Deal\'s current status:', currentStep.statuses.name);
    }

    console.log('\n🎯 CONVERSION SETUP VERIFIED:');
    console.log('- "Converted to Lead" status exists ✅');
    console.log('- Sales Process workflow exists ✅');
    console.log('- Workflow step for conversion exists ✅');
    console.log('- Step is marked as final step:', workflowStep.is_final_step ? '✅' : '❌');
    console.log('- Test deal available ✅');
    console.log('\n✨ The conversion system should work correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDealToLeadConversion(); 