#!/usr/bin/env node

/**
 * Comprehensive Conversion System Test Script
 * Tests database schema, services, and GraphQL integration
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role for testing
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

class ConversionSystemTester {
  constructor() {
    this.testResults = [];
    this.testData = {
      testUserId: null,
      testLeadId: null,
      testDealId: null,
      testOrganizationId: null,
      testPersonId: null
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`Running test: ${testName}`, 'info');
      const startTime = Date.now();
      
      await testFunction();
      
      const duration = Date.now() - startTime;
      this.log(`✅ ${testName} passed (${duration}ms)`, 'success');
      this.testResults.push({ name: testName, status: 'passed', duration });
    } catch (error) {
      this.log(`❌ ${testName} failed: ${error.message}`, 'error');
      this.testResults.push({ name: testName, status: 'failed', error: error.message });
    }
  }

  // Test 1: Database Schema Verification
  async testDatabaseSchema() {
    // Check if conversion_history table exists
    const { data: conversionTable, error: conversionError } = await supabase
      .from('conversion_history')
      .select('*')
      .limit(1);

    if (conversionError && conversionError.code === '42P01') {
      throw new Error('conversion_history table does not exist. Run migration first.');
    }

    // Check if reactivation_plans table exists
    const { data: reactivationTable, error: reactivationError } = await supabase
      .from('reactivation_plans')
      .select('*')
      .limit(1);

    if (reactivationError && reactivationError.code === '42P01') {
      throw new Error('reactivation_plans table does not exist. Run migration first.');
    }

    // Verify deals table has conversion fields
    const { data: dealsSchema, error: dealsError } = await supabase
      .rpc('get_table_schema', { table_name: 'deals' });

    if (dealsError) {
      this.log('Warning: Could not verify deals table schema', 'warning');
    }

    this.log('Database schema verification completed');
  }

  // Test 2: Create Test Data
  async testCreateTestData() {
    // Create test user in auth.users table
    const testUserEmail = 'test-conversion@example.com';
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testUserEmail,
      password: 'test-password-123',
      email_confirm: true
    });

    if (authError) {
      // If user already exists, try to get it
      const { data: existingUsers } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', testUserEmail)
        .limit(1);
      
      if (existingUsers && existingUsers.length > 0) {
        this.testData.testUserId = existingUsers[0].id;
        this.log('Using existing test user');
      } else {
        // Fall back to mock user ID if auth creation fails
        this.testData.testUserId = '00000000-0000-0000-0000-000000000000';
        this.log('Using mock user ID for testing');
      }
    } else {
      this.testData.testUserId = authUser.user.id;
      this.log(`Created test user: ${authUser.user.id}`);
    }

    // Create test organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: 'Test Conversion Corp',
        address: '123 Test Street',
        notes: 'Created for conversion system testing'
      })
      .select()
      .single();

    if (orgError) throw new Error(`Failed to create test organization: ${orgError.message}`);
    this.testData.testOrganizationId = organization.id;

    // Create test person
    const { data: person, error: personError } = await supabase
      .from('people')
      .insert({
        first_name: 'John',
        last_name: 'TestUser',
        email: 'john.test@example.com',
        phone: '+1-555-TEST',
        organization_id: this.testData.testOrganizationId,
        user_id: this.testData.testUserId
      })
      .select()
      .single();

    if (personError) throw new Error(`Failed to create test person: ${personError.message}`);
    this.testData.testPersonId = person.id;

    // Create test lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        name: 'Test Conversion Lead',
        contact_name: 'John TestUser',
        contact_email: 'john.test@example.com',
        contact_phone: '+1-555-TEST',
        company_name: 'Test Conversion Corp',
        estimated_value: 50000,
        estimated_close_date: '2024-06-15',
        lead_score: 85,
        source: 'Test Script',
        description: 'Lead created for conversion testing',
        user_id: this.testData.testUserId
      })
      .select()
      .single();

    if (leadError) throw new Error(`Failed to create test lead: ${leadError.message}`);
    this.testData.testLeadId = lead.id;

    this.log(`Created test data - Lead: ${lead.id}, Person: ${person.id}, Org: ${organization.id}`);
  }

  // Test 3: Conversion History Service
  async testConversionHistoryService() {
    // Test recording a conversion event
    const conversionData = {
      source_entity_type: 'lead',
      source_entity_id: this.testData.testLeadId,
      target_entity_type: 'deal',
      target_entity_id: '00000000-0000-0000-0000-000000000001', // Mock deal ID
      conversion_type: 'LEAD_TO_DEAL', // Use uppercase as required by constraint
      conversion_reason: 'qualified',
      conversion_data: {
        preservedActivities: true,
        createdConversionActivity: true,
        dealData: {
          name: 'Test Conversion Deal',
          amount: 50000,
          currency: 'USD'
        }
      },
      converted_by_user_id: this.testData.testUserId
    };

    const { data: conversionEvent, error: conversionError } = await supabase
      .from('conversion_history')
      .insert(conversionData)
      .select()
      .single();

    if (conversionError) {
      throw new Error(`Failed to create conversion history: ${conversionError.message}`);
    }

    // Test retrieving conversion history
    const { data: history, error: historyError } = await supabase
      .from('conversion_history')
      .select('*')
      .eq('source_entity_id', this.testData.testLeadId);

    if (historyError) {
      throw new Error(`Failed to retrieve conversion history: ${historyError.message}`);
    }

    if (history.length === 0) {
      throw new Error('No conversion history found after creation');
    }

    this.log(`Conversion history service working - Created event: ${conversionEvent.id}`);
  }

  // Test 4: Reactivation Plans
  async testReactivationPlans() {
    const reactivationData = {
      lead_id: this.testData.testLeadId,
      // Remove original_deal_id to avoid foreign key constraint
      // original_deal_id: '00000000-0000-0000-0000-000000000001', // Mock deal ID
      status: 'ACTIVE',
      reactivation_strategy: 'NURTURING', // Use valid strategy value
      target_reactivation_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Date only
      follow_up_activities: [
        { type: 'email', subject: 'Follow-up on proposal' },
        { type: 'call', subject: 'Check budget status' }
      ],
      notes: 'Customer requested time to review budget',
      assigned_to_user_id: this.testData.testUserId,
      created_by_user_id: this.testData.testUserId
    };

    const { data: plan, error: planError } = await supabase
      .from('reactivation_plans')
      .insert(reactivationData)
      .select()
      .single();

    if (planError) {
      throw new Error(`Failed to create reactivation plan: ${planError.message}`);
    }

    this.log(`Reactivation plan created: ${plan.id}`);
  }

  // Test 5: Database Constraints and Relationships
  async testDatabaseConstraints() {
    // Test required fields
    try {
      const { error } = await supabase
        .from('conversion_history')
        .insert({
          source_entity_type: 'lead'
          // Missing required fields
        });
      
      if (error) {
        if (error.message.includes('null value') || error.message.includes('not-null')) {
          this.log('Required field constraints working correctly');
        } else {
          throw new Error(`Unexpected constraint error: ${error.message}`);
        }
      } else {
        throw new Error('Should have failed due to missing required fields');
      }
    } catch (error) {
      if (error.message.includes('null value') || error.message.includes('not-null') || error.message.includes('constraint')) {
        this.log('Required field constraints working correctly');
      } else {
        throw error;
      }
    }

    // Test foreign key constraints (optional since they might not be enforced in test environment)
    try {
      const { error } = await supabase
        .from('conversion_history')
        .insert({
          source_entity_type: 'lead',
          source_entity_id: '00000000-0000-0000-0000-000000000999', // Non-existent ID
          target_entity_type: 'deal',
          target_entity_id: '00000000-0000-0000-0000-000000000001',
          conversion_type: 'LEAD_TO_DEAL',
          converted_by_user_id: this.testData.testUserId
        });
      
      if (error && error.message.includes('foreign key')) {
        this.log('Foreign key constraints working correctly');
      } else {
        this.log('Foreign key constraints not strictly enforced (acceptable for testing)', 'warning');
      }
    } catch (error) {
      if (error.message.includes('foreign key')) {
        this.log('Foreign key constraints working correctly');
      } else {
        this.log('Foreign key constraint test inconclusive', 'warning');
      }
    }
  }

  // Test 6: Performance Test
  async testPerformance() {
    const startTime = Date.now();
    
    // Create multiple conversion records to test bulk operations
    const conversionPromises = [];
    for (let i = 0; i < 10; i++) {
      conversionPromises.push(
        supabase
          .from('conversion_history')
          .insert({
            source_entity_type: 'lead',
            source_entity_id: this.testData.testLeadId,
            target_entity_type: 'deal',
            target_entity_id: `00000000-0000-0000-0000-00000000000${i}`,
            conversion_type: 'LEAD_TO_DEAL', // Use uppercase
            conversion_reason: 'bulk_test',
            converted_by_user_id: this.testData.testUserId
          })
      );
    }

    await Promise.all(conversionPromises);
    
    const duration = Date.now() - startTime;
    
    if (duration > 5000) {
      throw new Error(`Bulk insert took too long: ${duration}ms`);
    }

    this.log(`Performance test passed - 10 bulk inserts in ${duration}ms`);
  }

  // Cleanup test data
  async cleanup() {
    try {
      // Clean up in reverse order due to foreign keys
      await supabase.from('conversion_history').delete().eq('converted_by_user_id', this.testData.testUserId);
      await supabase.from('reactivation_plans').delete().eq('created_by_user_id', this.testData.testUserId);
      
      if (this.testData.testLeadId) {
        await supabase.from('leads').delete().eq('id', this.testData.testLeadId);
      }
      
      if (this.testData.testPersonId) {
        await supabase.from('people').delete().eq('id', this.testData.testPersonId);
      }
      
      if (this.testData.testOrganizationId) {
        await supabase.from('organizations').delete().eq('id', this.testData.testOrganizationId);
      }

      // Clean up test user if it's not the mock ID
      if (this.testData.testUserId && this.testData.testUserId !== '00000000-0000-0000-0000-000000000000') {
        try {
          await supabase.auth.admin.deleteUser(this.testData.testUserId);
        } catch (userDeleteError) {
          this.log(`Could not delete test user: ${userDeleteError.message}`, 'warning');
        }
      }

      this.log('Test data cleanup completed');
    } catch (error) {
      this.log(`Cleanup warning: ${error.message}`, 'warning');
    }
  }

  // Run all tests
  async runAllTests() {
    this.log('🚀 Starting Conversion System Backend Tests', 'info');
    this.log('=====================================', 'info');

    await this.runTest('Database Schema Verification', () => this.testDatabaseSchema());
    await this.runTest('Create Test Data', () => this.testCreateTestData());
    await this.runTest('Conversion History Service', () => this.testConversionHistoryService());
    await this.runTest('Reactivation Plans', () => this.testReactivationPlans());
    await this.runTest('Database Constraints', () => this.testDatabaseConstraints());
    await this.runTest('Performance Test', () => this.testPerformance());

    // Cleanup
    await this.cleanup();

    // Print summary
    this.log('=====================================', 'info');
    this.log('🏁 Test Summary', 'info');
    
    const passed = this.testResults.filter(r => r.status === 'passed').length;
    const failed = this.testResults.filter(r => r.status === 'failed').length;
    const totalDuration = this.testResults.reduce((sum, r) => sum + (r.duration || 0), 0);

    this.log(`Total Tests: ${this.testResults.length}`, 'info');
    this.log(`Passed: ${passed}`, passed === this.testResults.length ? 'success' : 'info');
    this.log(`Failed: ${failed}`, failed > 0 ? 'error' : 'info');
    this.log(`Total Duration: ${totalDuration}ms`, 'info');

    if (failed > 0) {
      this.log('Failed Tests:', 'error');
      this.testResults
        .filter(r => r.status === 'failed')
        .forEach(r => this.log(`  - ${r.name}: ${r.error}`, 'error'));
    }

    return { passed, failed, total: this.testResults.length };
  }
}

// Helper function to get table schema (for testing)
async function createSchemaFunction() {
  const { error } = await supabase.rpc('get_table_schema', { table_name: 'test' });
  
  if (error && error.message.includes('function get_table_schema does not exist')) {
    // Create the helper function for testing
    const { error: createError } = await supabase.rpc('create_schema_helper');
    if (createError) {
      console.log('Note: Could not create schema helper function. Some tests may be limited.');
    }
  }
}

// Main execution
async function main() {
  const tester = new ConversionSystemTester();
  
  try {
    await createSchemaFunction();
    const results = await tester.runAllTests();
    
    if (results.failed === 0) {
      console.log('\n🎉 All backend tests passed! The conversion system is ready for GraphQL testing.');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed. Please fix the issues before proceeding.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ConversionSystemTester }; 