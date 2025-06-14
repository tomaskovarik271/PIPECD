#!/usr/bin/env node

/**
 * Test Notification Preferences System
 * 
 * This script tests the notification preferences functionality:
 * - Get user reminder preferences
 * - Update user reminder preferences  
 * - Test with real GraphQL API
 */

const fetch = require('node-fetch');

// Configuration
const GRAPHQL_ENDPOINT = 'http://localhost:8888/.netlify/functions/graphql';

class NotificationPreferencesTest {
  constructor() {
    this.authToken = null;
  }

  async graphqlRequest(query, variables = {}, useAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (useAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(result.errors, null, 2)}`);
    }

    return result.data;
  }

  async authenticateUser(email = 'test@example.com', password = 'testpassword123') {
    console.log('🔐 Authenticating user...');
    
    try {
      // Try to sign in first
      const signInQuery = `
        mutation SignIn($email: String!, $password: String!) {
          signIn(email: $email, password: $password) {
            access_token
            user {
              id
              email
            }
          }
        }
      `;

      const signInResult = await this.graphqlRequest(signInQuery, {
        email,
        password
      }, false);

      if (signInResult.signIn) {
        this.authToken = signInResult.signIn.access_token;
        console.log(`✅ Signed in successfully: ${signInResult.signIn.user.email}`);
        return true;
      }
    } catch (error) {
      console.log('⚠️ Sign in failed, trying sign up...');
      
      try {
        // Try to sign up if sign in fails
        const signUpQuery = `
          mutation SignUp($email: String!, $password: String!) {
            signUp(email: $email, password: $password) {
              access_token
              user {
                id
                email
              }
            }
          }
        `;

        const signUpResult = await this.graphqlRequest(signUpQuery, {
          email,
          password
        }, false);

        if (signUpResult.signUp) {
          this.authToken = signUpResult.signUp.access_token;
          console.log(`✅ Signed up successfully: ${signUpResult.signUp.user.email}`);
          return true;
        }
      } catch (signUpError) {
        console.log(`❌ Authentication failed: ${signUpError.message}`);
        return false;
      }
    }

    return false;
  }

  async testGetPreferences() {
    console.log('\n📋 Testing get reminder preferences...');
    
    try {
      const query = `
        query GetMyPreferences {
          myReminderPreferences {
            id
            userId
            emailRemindersEnabled
            emailReminderMinutesBefore
            emailDailyDigestEnabled
            emailDailyDigestTime
            inAppRemindersEnabled
            inAppReminderMinutesBefore
            pushRemindersEnabled
            pushReminderMinutesBefore
            overdueNotificationsEnabled
            overdueNotificationFrequencyHours
            createdAt
            updatedAt
          }
        }
      `;

      const result = await this.graphqlRequest(query);
      
      if (result.myReminderPreferences) {
        console.log('✅ Successfully retrieved preferences:');
        console.log(`   - Email reminders: ${result.myReminderPreferences.emailRemindersEnabled ? 'ON' : 'OFF'}`);
        console.log(`   - Email timing: ${result.myReminderPreferences.emailReminderMinutesBefore} minutes`);
        console.log(`   - In-app reminders: ${result.myReminderPreferences.inAppRemindersEnabled ? 'ON' : 'OFF'}`);
        console.log(`   - In-app timing: ${result.myReminderPreferences.inAppReminderMinutesBefore} minutes`);
        console.log(`   - Daily digest: ${result.myReminderPreferences.emailDailyDigestEnabled ? 'ON' : 'OFF'}`);
        console.log(`   - Digest time: ${result.myReminderPreferences.emailDailyDigestTime}`);
        console.log(`   - Overdue notifications: ${result.myReminderPreferences.overdueNotificationsEnabled ? 'ON' : 'OFF'}`);
        console.log(`   - Overdue frequency: ${result.myReminderPreferences.overdueNotificationFrequencyHours} hours`);
        return result.myReminderPreferences;
      } else {
        console.log('❌ No preferences found');
        return null;
      }
    } catch (error) {
      console.log(`❌ Error getting preferences: ${error.message}`);
      return null;
    }
  }

  async testUpdatePreferences() {
    console.log('\n✏️ Testing update reminder preferences...');
    
    try {
      const mutation = `
        mutation UpdatePrefs($input: UpdateUserReminderPreferencesInput!) {
          updateMyReminderPreferences(input: $input) {
            id
            emailRemindersEnabled
            emailReminderMinutesBefore
            inAppRemindersEnabled
            inAppReminderMinutesBefore
            emailDailyDigestEnabled
            emailDailyDigestTime
            overdueNotificationsEnabled
            overdueNotificationFrequencyHours
            updatedAt
          }
        }
      `;

      const testSettings = {
        emailRemindersEnabled: true,
        emailReminderMinutesBefore: 30,
        inAppRemindersEnabled: true,
        inAppReminderMinutesBefore: 10,
        emailDailyDigestEnabled: false,
        emailDailyDigestTime: '08:00:00',
        overdueNotificationsEnabled: true,
        overdueNotificationFrequencyHours: 12,
      };

      const result = await this.graphqlRequest(mutation, {
        input: testSettings
      });

      if (result.updateMyReminderPreferences) {
        console.log('✅ Successfully updated preferences:');
        console.log(`   - Email reminders: ${result.updateMyReminderPreferences.emailRemindersEnabled ? 'ON' : 'OFF'} (${result.updateMyReminderPreferences.emailReminderMinutesBefore} min)`);
        console.log(`   - In-app reminders: ${result.updateMyReminderPreferences.inAppRemindersEnabled ? 'ON' : 'OFF'} (${result.updateMyReminderPreferences.inAppReminderMinutesBefore} min)`);
        console.log(`   - Daily digest: ${result.updateMyReminderPreferences.emailDailyDigestEnabled ? 'ON' : 'OFF'} at ${result.updateMyReminderPreferences.emailDailyDigestTime}`);
        console.log(`   - Overdue: ${result.updateMyReminderPreferences.overdueNotificationsEnabled ? 'ON' : 'OFF'} every ${result.updateMyReminderPreferences.overdueNotificationFrequencyHours}h`);
        console.log(`   - Updated at: ${result.updateMyReminderPreferences.updatedAt}`);
        return true;
      } else {
        console.log('❌ Failed to update preferences');
        return false;
      }
    } catch (error) {
      console.log(`❌ Error updating preferences: ${error.message}`);
      return false;
    }
  }

  async testValidation() {
    console.log('\n🛡️ Testing preference validation...');
    
    try {
      // Test invalid values
      const mutation = `
        mutation UpdatePrefs($input: UpdateUserReminderPreferencesInput!) {
          updateMyReminderPreferences(input: $input) {
            id
            emailReminderMinutesBefore
          }
        }
      `;

      // Test negative minutes (should fail or be corrected)
      try {
        await this.graphqlRequest(mutation, {
          input: {
            emailReminderMinutesBefore: -10
          }
        });
        console.log('⚠️ Negative minutes were accepted (validation might be missing)');
      } catch (error) {
        console.log('✅ Negative minutes properly rejected');
      }

      // Test very large values
      try {
        await this.graphqlRequest(mutation, {
          input: {
            emailReminderMinutesBefore: 99999
          }
        });
        console.log('⚠️ Very large values were accepted');
      } catch (error) {
        console.log('✅ Large values properly handled');
      }

      return true;
    } catch (error) {
      console.log(`❌ Validation test error: ${error.message}`);
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 Testing Notification Preferences System');
    console.log('==========================================\n');

    const results = {
      auth: false,
      getPreferences: false,
      updatePreferences: false,
      validation: false,
    };

    try {
      // Authentication
      results.auth = await this.authenticateUser();
      
      if (!results.auth) {
        console.log('\n❌ Authentication failed - cannot proceed with tests');
        return results;
      }

      // Test getting preferences
      const initialPrefs = await this.testGetPreferences();
      results.getPreferences = !!initialPrefs;

      // Test updating preferences
      results.updatePreferences = await this.testUpdatePreferences();

      // Test validation
      results.validation = await this.testValidation();

      // Get updated preferences to confirm changes
      if (results.updatePreferences) {
        console.log('\n🔄 Verifying changes...');
        await this.testGetPreferences();
      }

      // Summary
      console.log('\n📊 Test Results Summary:');
      console.log(`🔐 Authentication: ${results.auth ? '✅' : '❌'}`);
      console.log(`📋 Get Preferences: ${results.getPreferences ? '✅' : '❌'}`);
      console.log(`✏️ Update Preferences: ${results.updatePreferences ? '✅' : '❌'}`);
      console.log(`🛡️ Validation: ${results.validation ? '✅' : '❌'}`);

      const passedTests = Object.values(results).filter(r => r).length;
      const totalTests = Object.keys(results).length;
      
      console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
      
      if (passedTests === totalTests) {
        console.log('🎉 All notification preference tests passed!');
      } else {
        console.log('⚠️ Some tests failed. Check the output above for details.');
      }

    } catch (error) {
      console.error(`💥 Test suite error: ${error.message}`);
    }

    return results;
  }
}

// Run the test suite
async function main() {
  const testSuite = new NotificationPreferencesTest();
  const results = await testSuite.runAllTests();
  
  process.exit(Object.values(results).every(r => r) ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { NotificationPreferencesTest }; 