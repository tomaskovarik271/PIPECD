const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function debugDatabase() {
  console.log('🔍 Debugging database connection and tables...\n');

  try {
    // 1. Test basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (healthError) {
      console.error('❌ Database connection failed:', healthError);
      return;
    }

    console.log('✅ Database connection working');

    // 2. Check if statuses table exists
    const { data: statusesTable, error: statusesError } = await supabase
      .from('statuses')
      .select('*')
      .limit(1);

    if (statusesError) {
      console.error('❌ Statuses table error:', statusesError);
      
      // Check if it's a table not found error
      if (statusesError.message.includes('relation') && statusesError.message.includes('does not exist')) {
        console.log('💡 Statuses table does not exist - this is the problem!');
      }
      return;
    }

    console.log('✅ Statuses table exists');

    // 3. Check workflows table
    const { data: workflows, error: workflowError } = await supabase
      .from('workflows')
      .select('id, name')
      .limit(5);

    if (workflowError) {
      console.error('❌ Workflows table error:', workflowError);
    } else {
      console.log('✅ Workflows table exists with', workflows.length, 'workflows');
      workflows.forEach(w => console.log(`  - ${w.name} (${w.id})`));
    }

    // 4. Check workflow_steps table
    const { data: steps, error: stepsError } = await supabase
      .from('workflow_steps')
      .select('id, step_order')
      .limit(5);

    if (stepsError) {
      console.error('❌ Workflow steps table error:', stepsError);
    } else {
      console.log('✅ Workflow steps table exists with', steps.length, 'steps');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugDatabase();
