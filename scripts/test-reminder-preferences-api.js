const fetch = require('node-fetch');

const GRAPHQL_URL = 'http://localhost:8888/.netlify/functions/graphql';

// Test just fetching preferences (should fail with auth error but we can see if endpoint exists)
async function testPreferencesEndpoint() {
  console.log('🧪 Testing Notification Preferences Endpoint');
  console.log('=============================================\n');

  try {
    // Test 1: Try to get preferences without auth (should fail)
    console.log('📋 Test 1: Testing endpoint availability...');
    const query = `
      query GetMyReminderPreferences {
        myReminderPreferences {
          id
          emailRemindersEnabled
          emailReminderMinutesBefore
        }
      }
    `;

    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();
    
    if (result.errors) {
      const error = result.errors[0];
      if (error.message.includes('Authentication required')) {
        console.log('✅ Endpoint exists and requires authentication (expected)');
        console.log('   Error:', error.message);
      } else {
        console.log('⚠️ Unexpected error:', error.message);
        if (error.message.includes('Cannot query field')) {
          console.log('❌ GraphQL schema issue - field not found');
        }
      }
    } else {
      console.log('🤔 Unexpected success (should require auth):', result);
    }

    console.log('\n📋 Test 2: Testing mutation endpoint...');
    const mutation = `
      mutation UpdateMyReminderPreferences($input: UpdateUserReminderPreferencesInput!) {
        updateMyReminderPreferences(input: $input) {
          id
          emailRemindersEnabled
        }
      }
    `;

    const mutationResponse = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: mutation,
        variables: {
          input: {
            emailRemindersEnabled: true
          }
        }
      })
    });

    const mutationResult = await mutationResponse.json();
    
    if (mutationResult.errors) {
      const error = mutationResult.errors[0];
      if (error.message.includes('Authentication required')) {
        console.log('✅ Mutation endpoint exists and requires authentication (expected)');
        console.log('   Error:', error.message);
      } else {
        console.log('⚠️ Unexpected mutation error:', error.message);
        if (error.message.includes('Cannot query field')) {
          console.log('❌ GraphQL schema issue - mutation not found');
        }
      }
    } else {
      console.log('🤔 Unexpected mutation success (should require auth):', mutationResult);
    }

    console.log('\n📋 Test 3: Testing GraphQL introspection for available queries...');
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType {
            fields {
              name
              description
            }
          }
          mutationType {
            fields {
              name
              description
            }
          }
        }
      }
    `;

    const introspectionResponse = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: introspectionQuery })
    });

    const introspectionResult = await introspectionResponse.json();
    
    if (introspectionResult.errors) {
      console.log('❌ Introspection failed:', introspectionResult.errors[0].message);
    } else {
      const queries = introspectionResult.data.__schema.queryType.fields;
      const mutations = introspectionResult.data.__schema.mutationType.fields;
      
      const reminderQueries = queries.filter(q => q.name.toLowerCase().includes('reminder') || q.name.toLowerCase().includes('notification'));
      const reminderMutations = mutations.filter(m => m.name.toLowerCase().includes('reminder') || m.name.toLowerCase().includes('notification'));
      
      console.log('✅ Available reminder/notification queries:');
      reminderQueries.forEach(q => console.log(`   - ${q.name}`));
      
      console.log('✅ Available reminder/notification mutations:');
      reminderMutations.forEach(m => console.log(`   - ${m.name}`));
      
      if (reminderQueries.length === 0 && reminderMutations.length === 0) {
        console.log('❌ No reminder/notification endpoints found in schema!');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPreferencesEndpoint().then(() => {
  console.log('\n🎯 Test completed');
}); 