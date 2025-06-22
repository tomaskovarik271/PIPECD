const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function checkStatuses() {
  console.log('🔍 Checking all statuses in database...\n');

  try {
    const { data: statuses, error } = await supabase
      .from('statuses')
      .select('id, name, description, color')
      .order('name');

    if (error) {
      console.error('❌ Error fetching statuses:', error);
      return;
    }

    console.log('📋 All statuses in database:');
    statuses.forEach((status, index) => {
      console.log(`${index + 1}. ${status.name} (${status.color})`);
      if (status.description) {
        console.log(`   Description: ${status.description}`);
      }
    });

    console.log(`\nTotal: ${statuses.length} statuses`);

    // Look for conversion-related statuses
    const conversionStatuses = statuses.filter(s => 
      s.name.toLowerCase().includes('convert') || 
      s.name.toLowerCase().includes('lead') ||
      s.name.toLowerCase().includes('deal')
    );

    if (conversionStatuses.length > 0) {
      console.log('\n🔄 Conversion-related statuses found:');
      conversionStatuses.forEach(status => {
        console.log(`- ${status.name}: ${status.description || 'No description'}`);
      });
    } else {
      console.log('\n⚠️  No conversion-related statuses found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkStatuses();
