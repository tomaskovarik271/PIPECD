const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableStructure() {
  console.log('🔍 Checking Activities Table Structure');
  console.log('====================================\n');

  try {
    // Just get one activity to see column structure
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (activities.length > 0) {
      console.log('✅ Available columns in activities table:');
      Object.keys(activities[0]).forEach(column => {
        console.log(`   - ${column}`);
      });
    } else {
      console.log('❌ No activities found in table');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTableStructure(); 