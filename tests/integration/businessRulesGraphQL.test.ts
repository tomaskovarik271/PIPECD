import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestEnvironment, type TestEnvironment } from '../setup/testEnvironment';

// GraphQL endpoint for testing
const GRAPHQL_ENDPOINT = 'http://localhost:8888/.netlify/functions/graphql';

describe('Business Rules GraphQL Integration', () => {
  let testEnv: TestEnvironment;

  beforeAll(async () => {
    testEnv = await createTestEnvironment();
    
    // Assign admin role for testing business rules
    await testEnv.supabase
      .from('user_role_assignments')
      .insert({
        user_id: testEnv.testUserId,
        role_name: 'admin'
      });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  const executeGraphQL = async (query: string, variables?: any) => {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testEnv.mockAuthToken}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    return result;
  };

  it('should query business rules with correct schema structure', async () => {
    const query = `
      query GetBusinessRules {
        businessRules {
          nodes {
            id
            name
            description
            entityType
            triggerType
            status
            executionCount
            wfmWorkflow {
              id
              name
            }
            wfmStep {
              id
              status {
                id
                name
              }
            }
            wfmStatus {
              id
              name
            }
            createdBy {
              id
              email
              display_name
            }
            createdAt
            updatedAt
          }
          totalCount
        }
      }
    `;

    const result = await executeGraphQL(query);
    
    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data.businessRules).toBeDefined();
    expect(result.data.businessRules.nodes).toBeInstanceOf(Array);
    expect(typeof result.data.businessRules.totalCount).toBe('number');
  });

  it('should create a business rule successfully', async () => {
    const mutation = `
      mutation CreateBusinessRule($input: BusinessRuleInput!) {
        createBusinessRule(input: $input) {
          id
          name
          description
          entityType
          triggerType
          status
          conditions {
            field
            operator
            value
            logicalOperator
          }
          actions {
            type
            target
            message
            priority
          }
        }
      }
    `;

    const variables = {
      input: {
        name: 'Test Deal Value Rule',
        description: 'Notify when deal value exceeds $10,000',
        entityType: 'DEAL',
        triggerType: 'FIELD_CHANGE',
        triggerEvents: ['UPDATE'],
        triggerFields: ['amount'],
        conditions: [{
          field: 'amount',
          operator: 'GREATER_THAN',
          value: '10000',
          logicalOperator: 'AND'
        }],
        actions: [{
          type: 'NOTIFY_USER',
          target: 'ASSIGNED_USER',
          message: 'High value deal detected',
          priority: 'HIGH'
        }],
        status: 'ACTIVE'
      }
    };

    const result = await executeGraphQL(mutation, variables);
    
    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data.createBusinessRule).toBeDefined();
    expect(result.data.createBusinessRule.id).toBeDefined();
    expect(result.data.createBusinessRule.name).toBe('Test Deal Value Rule');
    expect(result.data.createBusinessRule.entityType).toBe('DEAL');
    expect(result.data.createBusinessRule.status).toBe('ACTIVE');
  });

  it('should handle WFM workflow step fields correctly', async () => {
    const query = `
      query GetBusinessRulesWithWFMDetails {
        businessRules {
          nodes {
            id
            name
            wfmStep {
              id
              status {
                id
                name
              }
            }
          }
        }
      }
    `;

    const result = await executeGraphQL(query);
    
    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data.businessRules).toBeDefined();
    
    // Check that wfmStep structure is correct when present
    const rulesWithWfmStep = result.data.businessRules.nodes.filter(
      (rule: any) => rule.wfmStep
    );
    
    rulesWithWfmStep.forEach((rule: any) => {
      expect(rule.wfmStep.id).toBeDefined();
      expect(rule.wfmStep.status).toBeDefined();
      expect(rule.wfmStep.status.id).toBeDefined();
      expect(rule.wfmStep.status.name).toBeDefined();
    });
  });

  it('should handle user display_name field correctly', async () => {
    const query = `
      query GetBusinessRulesWithUsers {
        businessRules {
          nodes {
            id
            name
            createdBy {
              id
              email
              display_name
            }
          }
        }
      }
    `;

    const result = await executeGraphQL(query);
    
    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data.businessRules).toBeDefined();
    
    // Check that user fields are correct when present
    const rulesWithCreatedBy = result.data.businessRules.nodes.filter(
      (rule: any) => rule.createdBy
    );
    
    rulesWithCreatedBy.forEach((rule: any) => {
      expect(rule.createdBy.id).toBeDefined();
      expect(rule.createdBy.email).toBeDefined();
      // display_name can be null, but should not be undefined
      expect(rule.createdBy).toHaveProperty('display_name');
    });
  });

  it('should update business rule status', async () => {
    // First create a rule
    const createMutation = `
      mutation CreateBusinessRule($input: BusinessRuleInput!) {
        createBusinessRule(input: $input) {
          id
          status
        }
      }
    `;

    const createResult = await executeGraphQL(createMutation, {
      input: {
        name: 'Test Status Update Rule',
        description: 'Rule for testing status updates',
        entityType: 'DEAL',
        triggerType: 'FIELD_CHANGE',
        triggerEvents: ['UPDATE'],
        conditions: [],
        actions: [],
        status: 'ACTIVE'
      }
    });

    expect(createResult.errors).toBeUndefined();
    const ruleId = createResult.data.createBusinessRule.id;

    // Then deactivate it
    const deactivateMutation = `
      mutation DeactivateBusinessRule($id: ID!) {
        deactivateBusinessRule(id: $id) {
          id
          status
        }
      }
    `;

    const deactivateResult = await executeGraphQL(deactivateMutation, { id: ruleId });
    
    expect(deactivateResult.errors).toBeUndefined();
    expect(deactivateResult.data.deactivateBusinessRule.status).toBe('INACTIVE');
  });

  it('should delete business rule', async () => {
    // First create a rule
    const createMutation = `
      mutation CreateBusinessRule($input: BusinessRuleInput!) {
        createBusinessRule(input: $input) {
          id
        }
      }
    `;

    const createResult = await executeGraphQL(createMutation, {
      input: {
        name: 'Test Delete Rule',
        description: 'Rule for testing deletion',
        entityType: 'LEAD',
        triggerType: 'CREATE',
        triggerEvents: ['CREATE'],
        conditions: [],
        actions: [],
        status: 'ACTIVE'
      }
    });

    expect(createResult.errors).toBeUndefined();
    const ruleId = createResult.data.createBusinessRule.id;

    // Then delete it
    const deleteMutation = `
      mutation DeleteBusinessRule($id: ID!) {
        deleteBusinessRule(id: $id) {
          success
          message
        }
      }
    `;

    const deleteResult = await executeGraphQL(deleteMutation, { id: ruleId });
    
    expect(deleteResult.errors).toBeUndefined();
    expect(deleteResult.data.deleteBusinessRule.success).toBe(true);
  });

  it('should handle authentication requirement', async () => {
    const query = `
      query GetBusinessRules {
        businessRules {
          nodes {
            id
            name
          }
        }
      }
    `;

    // Test without authentication token
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    
    expect(result.errors).toBeDefined();
    expect(result.errors[0].message).toContain('Authentication required');
    expect(result.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });
}); 