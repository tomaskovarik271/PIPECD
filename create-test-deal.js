const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function createTestDeal() {
  console.log('🏗️  Creating test deal for conversion testing...\n');

  try {
    // 1. Get the Sales Deal project type
    const { data: projectType, error: ptError } = await supabase
      .from('project_types')
      .select('id, name, default_workflow_id')
      .eq('name', 'Sales Deal')
      .single();

    if (ptError) {
      console.error('❌ Error finding Sales Deal project type:', ptError);
      return;
    }

    console.log('✅ Sales Deal project type found:', projectType);

    // 2. Get the initial workflow step (Qualified Lead)
    const { data: initialStep, error: stepError } = await supabase
      .from('workflow_steps')
      .select('id, status_id')
      .eq('workflow_id', projectType.default_workflow_id)
      .eq('is_initial_step', true)
      .single();

    if (stepError) {
      console.error('❌ Error finding initial workflow step:', stepError);
      return;
    }

    console.log('✅ Initial workflow step found:', initialStep);

    // 3. Create a WFM project for the deal
    const { data: wfmProject, error: wfmError } = await supabase
      .from('wfm_projects')
      .insert({
        project_type_id: projectType.id,
        workflow_id: projectType.default_workflow_id,
        current_wfm_step_id: initialStep.id,
        project_name: 'Test Deal for Conversion',
        project_description: 'Test deal created for conversion testing'
      })
      .select()
      .single();

    if (wfmError) {
      console.error('❌ Error creating WFM project:', wfmError);
      return;
    }

    console.log('✅ WFM project created:', wfmProject);

    // 4. Create the test deal
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .insert({
        name: 'Test Deal for Conversion',
        amount: 50000,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        wfm_project_id: wfmProject.id,
        currency: 'USD'
      })
      .select()
      .single();

    if (dealError) {
      console.error('❌ Error creating deal:', dealError);
      return;
    }

    console.log('✅ Test deal created:', {
      id: deal.id,
      name: deal.name,
      amount: deal.amount,
      wfm_project_id: deal.wfm_project_id
    });

    console.log('\n🎯 TEST DEAL READY FOR CONVERSION!');
    console.log(`Deal ID: ${deal.id}`);
    console.log(`Deal Name: ${deal.name}`);
    console.log(`Amount: $${deal.amount}`);
    console.log('\n💡 You can now test the deal-to-lead conversion in the UI!');

  } catch (error) {
    console.error('❌ Test deal creation failed:', error);
  }
}

createTestDeal();
