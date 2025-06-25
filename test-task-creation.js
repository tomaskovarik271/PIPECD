const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client for testing
const supabase = createClient(
  process.env.SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function testTaskCreation() {
  console.log('🧪 Testing Internal Tasks System...\n');

  try {
    // First, get an authenticated user
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    if (!users.users || users.users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    const testUser = users.users[0];
    console.log(`👤 Using test user: ${testUser.email}`);

    // Test 1: Create a basic task
    console.log('\n📝 Test 1: Creating a basic task...');
    const { data: task1, error: task1Error } = await supabase
      .from('tasks')
      .insert({
        title: 'Follow up with ORVIL CEO',
        description: 'Discuss the €90K proposal sent last week',
        type: 'follow_up',
        priority: 'high',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        created_by_user_id: testUser.id,
        assigned_to_user_id: testUser.id,
        tags: ['sales', 'urgent']
      })
      .select()
      .single();

    if (task1Error) {
      console.log('❌ Failed to create basic task:', task1Error.message);
    } else {
      console.log('✅ Basic task created successfully');
      console.log(`   ID: ${task1.id}`);
      console.log(`   Title: ${task1.title}`);
      console.log(`   Status: ${task1.status}`);
      console.log(`   Priority: ${task1.priority}`);
    }

    // Test 2: Get all tasks for user
    console.log('\n📋 Test 2: Retrieving user tasks...');
    const { data: userTasks, error: userTasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to_user_id', testUser.id);

    if (userTasksError) {
      console.log('❌ Failed to retrieve user tasks:', userTasksError.message);
    } else {
      console.log(`✅ Retrieved ${userTasks.length} task(s) for user`);
      userTasks.forEach(task => {
        console.log(`   - ${task.title} (${task.status})`);
      });
    }

    // Test 3: Update task status
    if (task1) {
      console.log('\n✏️  Test 3: Updating task status...');
      const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update({ 
          status: 'in_progress',
          notes: 'Started working on this task'
        })
        .eq('id', task1.id)
        .select()
        .single();

      if (updateError) {
        console.log('❌ Failed to update task:', updateError.message);
      } else {
        console.log('✅ Task updated successfully');
        console.log(`   Status: ${updatedTask.status}`);
        console.log(`   Notes: ${updatedTask.notes}`);
      }
    }

    // Test 4: Test task permissions
    console.log('\n🔐 Test 4: Testing task permissions...');
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('*')
      .like('name', 'task:%');

    if (permError) {
      console.log('❌ Failed to check permissions:', permError.message);
    } else {
      console.log(`✅ Found ${permissions.length} task permissions`);
      console.log('   Available permissions:');
      permissions.forEach(perm => {
        console.log(`   - ${perm.name}: ${perm.description}`);
      });
    }

    // Test 5: Test enum values
    console.log('\n🏷️  Test 5: Testing enum values...');
    try {
      const { data: enumTask, error: enumError } = await supabase
        .from('tasks')
        .insert({
          title: 'Test all enums',
          type: 'email',
          status: 'waiting',
          priority: 'urgent',
          created_by_user_id: testUser.id
        })
        .select()
        .single();

      if (enumError) {
        console.log('❌ Failed to test enums:', enumError.message);
      } else {
        console.log('✅ All enum values work correctly');
        console.log(`   Type: ${enumTask.type}`);
        console.log(`   Status: ${enumTask.status}`);
        console.log(`   Priority: ${enumTask.priority}`);
      }
    } catch (enumTestError) {
      console.log('❌ Enum test failed:', enumTestError.message);
    }

    console.log('\n🎉 Internal Tasks System test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testTaskCreation(); 