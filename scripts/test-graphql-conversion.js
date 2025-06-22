#!/usr/bin/env node

/**
 * GraphQL Conversion System Test Script
 * Tests GraphQL queries, mutations, and resolvers
 */

const fetch = require('node-fetch');
require('dotenv').config();

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:8888/.netlify/functions/graphql';

class GraphQLConversionTester {
  constructor() {
    this.testResults = [];
    this.authToken = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`Running GraphQL test: ${testName}`, 'info');
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

  async graphqlRequest(query, variables = {}) {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`);
    }

    return result.data;
  }

  // Test 1: Schema Introspection
  async testSchemaIntrospection() {
    const query = `
      query IntrospectionQuery {
        __schema {
          types {
            name
            kind
            description
          }
        }
      }
    `;

    const data = await this.graphqlRequest(query);
    
    // Check if conversion types exist
    const typeNames = data.__schema.types.map(t => t.name);
    const requiredTypes = [
      'ConversionEvent',
      'ConversionValidation',
      'ConversionResult',
      'ReactivationPlan',
      'ConvertLeadToDealInput',
      'ConvertDealToLeadInput',
      'BulkConvertLeadsInput'
    ];

    const missingTypes = requiredTypes.filter(type => !typeNames.includes(type));
    
    if (missingTypes.length > 0) {
      throw new Error(`Missing GraphQL types: ${missingTypes.join(', ')}`);
    }

    this.log(`Schema introspection successful - Found ${requiredTypes.length} conversion types`);
  }

  // Test 2: Conversion Validation Query
  async testConversionValidation() {
    const query = `
      query ValidateConversion($input: ConversionValidationInput!) {
        validateConversion(input: $input) {
          isValid
          canConvert
          errors
          warnings
          recommendations {
            type
            message
            priority
          }
          estimatedDuration
          requiredPermissions
        }
      }
    `;

    const variables = {
      input: {
        sourceEntityType: 'lead',
        sourceEntityId: '00000000-0000-0000-0000-000000000001',
        targetEntityType: 'deal',
        conversionType: 'lead_to_deal'
      }
    };

    const data = await this.graphqlRequest(query, variables);
    
    if (!data.validateConversion) {
      throw new Error('validateConversion query returned null');
    }

    const validation = data.validateConversion;
    
    // Basic validation structure check
    if (typeof validation.isValid !== 'boolean') {
      throw new Error('validateConversion.isValid should be boolean');
    }

    if (!Array.isArray(validation.errors)) {
      throw new Error('validateConversion.errors should be array');
    }

    this.log(`Conversion validation query working - Valid: ${validation.isValid}`);
  }

  // Test 3: Lead to Deal Conversion Mutation
  async testLeadToDealConversion() {
    // First create a test lead (we'll mock this for the test)
    const mutation = `
      mutation ConvertLeadToDeal($input: ConvertLeadToDealInput!) {
        convertLeadToDeal(input: $input) {
          success
          message
          conversionId
          dealId
          personId
          organizationId
          errors
          warnings
          metadata {
            originalLeadId
            conversionType
            preservedActivities
            createdEntities
          }
        }
      }
    `;

    const variables = {
      input: {
        leadId: '00000000-0000-0000-0000-000000000001', // Mock ID
        dealData: {
          name: 'GraphQL Test Deal',
          amount: 75000,
          currency: 'USD',
          expectedCloseDate: '2024-08-15',
          priority: 'high'
        },
        personData: {
          firstName: 'Jane',
          lastName: 'GraphQLTest',
          email: 'jane.graphql@test.com',
          phone: '+1-555-GRQL'
        },
        organizationData: {
          name: 'GraphQL Test Corp',
          industry: 'Technology',
          website: 'https://graphql-test.com'
        },
        options: {
          preserveActivities: true,
          createConversionActivity: true,
          archiveOriginalLead: false
        }
      }
    };

    try {
      const data = await this.graphqlRequest(mutation, variables);
      
      if (!data.convertLeadToDeal) {
        throw new Error('convertLeadToDeal mutation returned null');
      }

      const result = data.convertLeadToDeal;
      
      // For testing purposes, we expect this to fail with validation errors
      // since we're using mock IDs, but the structure should be correct
      if (typeof result.success !== 'boolean') {
        throw new Error('convertLeadToDeal.success should be boolean');
      }

      if (!Array.isArray(result.errors)) {
        throw new Error('convertLeadToDeal.errors should be array');
      }

      this.log(`Lead to Deal conversion mutation structure valid`);
    } catch (error) {
      // Expected to fail with mock data, but should have proper error structure
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        this.log('Lead to Deal conversion mutation structure valid (expected validation error with mock data)');
      } else {
        throw error;
      }
    }
  }

  // Test 4: Deal to Lead Conversion Mutation
  async testDealToLeadConversion() {
    const mutation = `
      mutation ConvertDealToLead($input: ConvertDealToLeadInput!) {
        convertDealToLead(input: $input) {
          success
          message
          conversionId
          leadId
          errors
          warnings
          metadata {
            originalDealId
            conversionType
            conversionReason
            preservedActivities
          }
        }
      }
    `;

    const variables = {
      input: {
        dealId: '00000000-0000-0000-0000-000000000001', // Mock ID
        conversionReason: 'unqualified',
        leadData: {
          name: 'GraphQL Converted Lead',
          contactName: 'John Converted',
          contactEmail: 'john.converted@test.com',
          estimatedValue: 25000,
          leadScore: 60,
          source: 'conversion_test'
        },
        options: {
          preserveActivities: true,
          createConversionActivity: true,
          archiveOriginalDeal: true
        }
      }
    };

    try {
      const data = await this.graphqlRequest(mutation, variables);
      
      if (!data.convertDealToLead) {
        throw new Error('convertDealToLead mutation returned null');
      }

      const result = data.convertDealToLead;
      
      if (typeof result.success !== 'boolean') {
        throw new Error('convertDealToLead.success should be boolean');
      }

      this.log(`Deal to Lead conversion mutation structure valid`);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        this.log('Deal to Lead conversion mutation structure valid (expected validation error with mock data)');
      } else {
        throw error;
      }
    }
  }

  // Test 5: Bulk Conversion Mutation
  async testBulkConversion() {
    const mutation = `
      mutation BulkConvertLeads($input: BulkConvertLeadsInput!) {
        bulkConvertLeads(input: $input) {
          totalLeads
          successfulConversions
          failedConversions
          results {
            leadId
            success
            dealId
            personId
            organizationId
            errors
          }
          summary {
            totalProcessed
            successRate
            averageProcessingTime
            errors
          }
        }
      }
    `;

    const variables = {
      input: {
        leadIds: [
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002'
        ],
        globalOptions: {
          preserveActivities: true,
          createConversionActivity: true,
          defaultCurrency: 'USD'
        },
        leadSpecificData: [
          {
            leadId: '00000000-0000-0000-0000-000000000001',
            dealData: {
              name: 'Bulk Test Deal 1',
              amount: 50000
            }
          }
        ]
      }
    };

    try {
      const data = await this.graphqlRequest(mutation, variables);
      
      if (!data.bulkConvertLeads) {
        throw new Error('bulkConvertLeads mutation returned null');
      }

      const result = data.bulkConvertLeads;
      
      if (typeof result.totalLeads !== 'number') {
        throw new Error('bulkConvertLeads.totalLeads should be number');
      }

      if (!Array.isArray(result.results)) {
        throw new Error('bulkConvertLeads.results should be array');
      }

      this.log(`Bulk conversion mutation structure valid`);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        this.log('Bulk conversion mutation structure valid (expected validation error with mock data)');
      } else {
        throw error;
      }
    }
  }

  // Test 6: Conversion History Query
  async testConversionHistory() {
    const query = `
      query GetConversionHistory($entityType: String!, $entityId: ID!) {
        getConversionHistory(entityType: $entityType, entityId: $entityId) {
          id
          sourceEntityType
          sourceEntityId
          targetEntityType
          targetEntityId
          conversionType
          conversionReason
          conversionData
          convertedAt
          convertedByUser {
            id
            email
          }
        }
      }
    `;

    const variables = {
      entityType: 'lead',
      entityId: '00000000-0000-0000-0000-000000000001'
    };

    const data = await this.graphqlRequest(query, variables);
    
    if (!Array.isArray(data.getConversionHistory)) {
      throw new Error('getConversionHistory should return array');
    }

    this.log(`Conversion history query working - Found ${data.getConversionHistory.length} records`);
  }

  // Test 7: Conversion Statistics Query
  async testConversionStatistics() {
    const query = `
      query GetConversionStatistics($timeRange: String, $filters: ConversionStatisticsFilters) {
        getConversionStatistics(timeRange: $timeRange, filters: $filters) {
          totalConversions
          conversionsByType {
            type
            count
            percentage
          }
          conversionsByReason {
            reason
            count
            percentage
          }
          averageConversionTime
          successRate
          trendsOverTime {
            date
            conversions
            successRate
          }
        }
      }
    `;

    const variables = {
      timeRange: 'last_30_days',
      filters: {
        conversionType: 'lead_to_deal'
      }
    };

    const data = await this.graphqlRequest(query, variables);
    
    if (!data.getConversionStatistics) {
      throw new Error('getConversionStatistics returned null');
    }

    const stats = data.getConversionStatistics;
    
    if (typeof stats.totalConversions !== 'number') {
      throw new Error('getConversionStatistics.totalConversions should be number');
    }

    if (!Array.isArray(stats.conversionsByType)) {
      throw new Error('getConversionStatistics.conversionsByType should be array');
    }

    this.log(`Conversion statistics query working - Total: ${stats.totalConversions}`);
  }

  // Test 8: Reactivation Plans Query
  async testReactivationPlans() {
    const query = `
      query GetReactivationPlans($filters: ReactivationPlanFilters) {
        getReactivationPlans(filters: $filters) {
          id
          leadId
          originalDealId
          status
          reactivationStrategy
          targetReactivationDate
          followUpActivities
          notes
          assignedToUser {
            id
            email
          }
          createdAt
          updatedAt
        }
      }
    `;

    const variables = {
      filters: {
        status: 'active'
      }
    };

    const data = await this.graphqlRequest(query, variables);
    
    if (!Array.isArray(data.getReactivationPlans)) {
      throw new Error('getReactivationPlans should return array');
    }

    this.log(`Reactivation plans query working - Found ${data.getReactivationPlans.length} plans`);
  }

  // Run all GraphQL tests
  async runAllTests() {
    this.log('🚀 Starting GraphQL Conversion System Tests', 'info');
    this.log('==========================================', 'info');

    await this.runTest('Schema Introspection', () => this.testSchemaIntrospection());
    await this.runTest('Conversion Validation Query', () => this.testConversionValidation());
    await this.runTest('Lead to Deal Conversion Mutation', () => this.testLeadToDealConversion());
    await this.runTest('Deal to Lead Conversion Mutation', () => this.testDealToLeadConversion());
    await this.runTest('Bulk Conversion Mutation', () => this.testBulkConversion());
    await this.runTest('Conversion History Query', () => this.testConversionHistory());
    await this.runTest('Conversion Statistics Query', () => this.testConversionStatistics());
    await this.runTest('Reactivation Plans Query', () => this.testReactivationPlans());

    // Print summary
    this.log('==========================================', 'info');
    this.log('🏁 GraphQL Test Summary', 'info');
    
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

// Main execution
async function main() {
  const tester = new GraphQLConversionTester();
  
  try {
    const results = await tester.runAllTests();
    
    if (results.failed === 0) {
      console.log('\n🎉 All GraphQL tests passed! The conversion system API is ready for frontend testing.');
      process.exit(0);
    } else {
      console.log('\n❌ Some GraphQL tests failed. Please fix the issues before proceeding.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ GraphQL test runner failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { GraphQLConversionTester }; 