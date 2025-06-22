#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const graphqlUrl = 'http://localhost:8888/.netlify/functions/graphql';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConversion() {
  console.log('🧪 Testing Lead to Deal Conversion...\n');

  try {
    // 1. Get a test lead
    console.log('1. Fetching a test lead...');
    const { data: leads, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);

    if (leadError) {
      console.error('❌ Error fetching leads:', leadError);
      return;
    }

    if (!leads || leads.length === 0) {
      console.log('❌ No leads found in database');
      return;
    }

    const testLead = leads[0];
    console.log(`✅ Found test lead: ${testLead.name} (ID: ${testLead.id})`);

    // 2. Get Sales Deal project type
    console.log('2. Fetching Sales Deal project type...');
    const { data: projectTypes, error: ptError } = await supabase
      .from('project_types')
      .select('*')
      .eq('name', 'Sales Deal')
      .limit(1);

    if (ptError) {
      console.error('❌ Error fetching project types:', ptError);
      return;
    }

    if (!projectTypes || projectTypes.length === 0) {
      console.log('❌ No "Sales Deal" project type found');
      return;
    }

    const salesDealProjectType = projectTypes[0];
    console.log(`✅ Found Sales Deal project type: ${salesDealProjectType.id}`);

    // 3. Test GraphQL conversion
    console.log('3. Testing GraphQL conversion...');
    const conversionInput = {
      targetType: 'DEAL',
      preserveActivities: false,
      createConversionActivity: true,
      dealData: {
        name: testLead.name,
        amount: testLead.estimated_value || 50000,
        currency: 'USD',
        expected_close_date: testLead.estimated_close_date,
        wfmProjectTypeId: salesDealProjectType.id
      }
    };

    const mutation = `
      mutation ConvertLead($id: ID!, $input: LeadConversionInput!) {
        convertLead(id: $id, input: $input) {
          leadId
          convertedEntities {
            person {
              id
              first_name
              last_name
              email
            }
            organization {
              id
              name
            }
            deal {
              id
              name
              amount
              currency
            }
          }
        }
      }
    `;

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          id: testLead.id,
          input: conversionInput
        }
      })
    });

    const result = await response.json();

    if (result.errors) {
      console.error('❌ GraphQL errors:', result.errors);
      return;
    }

    if (!result.data || !result.data.convertLead) {
      console.error('❌ No conversion result returned');
      return;
    }

    const conversion = result.data.convertLead;
    console.log('✅ Conversion successful!');
    console.log(`   Lead ID: ${conversion.leadId}`);
    
    if (conversion.convertedEntities.deal) {
      console.log(`   Deal: ${conversion.convertedEntities.deal.name} (${conversion.convertedEntities.deal.amount} ${conversion.convertedEntities.deal.currency})`);
    }
    
    if (conversion.convertedEntities.person) {
      console.log(`   Person: ${conversion.convertedEntities.person.first_name} ${conversion.convertedEntities.person.last_name}`);
    }
    
    if (conversion.convertedEntities.organization) {
      console.log(`   Organization: ${conversion.convertedEntities.organization.name}`);
    }

    // 4. Verify deal was created
    console.log('4. Verifying deal was created...');
    const { data: deals, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', conversion.convertedEntities.deal.id);

    if (dealError) {
      console.error('❌ Error fetching created deal:', dealError);
      return;
    }

    if (!deals || deals.length === 0) {
      console.log('❌ Deal not found in database');
      return;
    }

    console.log('✅ Deal verified in database!');
    console.log(`   Name: ${deals[0].name}`);
    console.log(`   Amount: ${deals[0].amount} ${deals[0].currency}`);
    console.log(`   WFM Project ID: ${deals[0].wfm_project_id}`);

    console.log('\n🎉 All tests passed! Conversion system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testConversion(); 