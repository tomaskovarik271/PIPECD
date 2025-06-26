import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestEnvironment, TestEnvironment } from '../setup/testEnvironment';
import { BusinessScenarioFactory } from '../factories/businessScenarios';
import { v4 as uuidv4 } from 'uuid';

describe('Deal Lifecycle - Business Logic', () => {
  let testEnv: TestEnvironment;
  let factory: BusinessScenarioFactory;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
    factory = new BusinessScenarioFactory(testEnv.supabase, testEnv.testUserId);
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Deal Creation with Business Context', () => {
    it('should create deal with proper WFM integration', async () => {
      // Arrange: Create enterprise sales scenario
      const scenario = await factory.createEnterpriseSalesScenario();

      // Act: Create deal using Supabase client directly
      const { data: deal, error } = await testEnv.supabase
        .from('deals')
        .insert({
          name: 'Test Deal with WFM',
          amount: 100000,
          organization_id: scenario.organizations[0].id,
          person_id: scenario.people[0].id,
          assigned_to_user_id: testEnv.testUserId,
          user_id: testEnv.testUserId,
          wfm_project_id: scenario.deals[0].wfm_project_id // Use the WFM project from scenario
        })
        .select()
        .single();

      // Assert: Verify business requirements
      expect(error).toBeNull();
      expect(deal).toMatchObject({
        id: expect.any(String),
        name: 'Test Deal with WFM',
        amount: 100000,
        organization_id: scenario.organizations[0].id,
        person_id: scenario.people[0].id,
        assigned_to_user_id: testEnv.testUserId,
        user_id: testEnv.testUserId,
        wfm_project_id: scenario.deals[0].wfm_project_id
      });

      // Critical: Should have WFM integration
      expect(deal.wfm_project_id).toBeDefined();
      expect(deal.wfm_project_id).toBe(scenario.deals[0].wfm_project_id);

      await scenario.cleanup();
    });

    it('should handle organization lookup for existing companies', async () => {
      // Arrange: Create scenario with existing organization
      const scenario = await factory.createEnterpriseSalesScenario();
      const existingOrg = scenario.organizations[0];

      // Act: Create another deal for same organization
      const { data: deal, error } = await testEnv.supabase
        .from('deals')
        .insert({
          name: 'Second Deal - Same Organization',
          amount: 75000,
          organization_id: existingOrg.id,
          assigned_to_user_id: testEnv.testUserId,
          user_id: testEnv.testUserId,
          wfm_project_id: scenario.deals[0].wfm_project_id
        })
        .select()
        .single();

      // Assert: Should link to existing organization
      expect(error).toBeNull();
      expect(deal.organization_id).toBe(existingOrg.id);
      expect(deal.wfm_project_id).toBeDefined();

      await scenario.cleanup();
    });
  });

  describe('Deal Updates with Collaboration Model', () => {
    it('should allow any member to update deal (new collaboration model)', async () => {
      // Arrange: Create deal and test scenario
      const scenario = await factory.createEnterpriseSalesScenario();
      const deal = scenario.deals[0];

      // Act: Update deal (any member can update in new collaboration model)
      const { data: updatedDeal, error } = await testEnv.supabase
        .from('deals')
        .update({
          name: 'Updated by Team Member',
          amount: 150000
        })
        .eq('id', deal.id)
        .select()
        .single();

      // Assert: Update should succeed
      expect(error).toBeNull();
      expect(updatedDeal.name).toBe('Updated by Team Member');
      expect(updatedDeal.amount).toBe(150000);

      await scenario.cleanup();
    });

    it('should preserve WFM integration on updates', async () => {
      // Arrange
      const scenario = await factory.createEnterpriseSalesScenario();
      const originalDeal = scenario.deals[0];
      const originalWfmProjectId = originalDeal.wfm_project_id;

      // Act: Update deal details but preserve WFM
      const { data: updatedDeal, error } = await testEnv.supabase
        .from('deals')
        .update({
          name: 'Updated Deal Name',
          amount: 200000
        })
        .eq('id', originalDeal.id)
        .select()
        .single();

      // Assert: WFM integration preserved
      expect(error).toBeNull();
      expect(updatedDeal.wfm_project_id).toBe(originalWfmProjectId);

      await scenario.cleanup();
    });
  });

  describe('Deal Validation and Business Rules', () => {
    it('should enforce required fields', async () => {
      // Arrange
      const scenario = await factory.createEnterpriseSalesScenario();

      // Act: Try to create deal without required fields
      const { data: deal, error } = await testEnv.supabase
        .from('deals')
        .insert({
          // Missing name (required)
          amount: 50000,
          user_id: testEnv.testUserId
        })
        .select()
        .single();

      // Should fail due to database constraints
      expect(error).not.toBeNull();

      await scenario.cleanup();
    });

    it('should handle valid organization reference', async () => {
      // Arrange
      const scenario = await factory.createEnterpriseSalesScenario();
      const organization = scenario.organizations[0];

      // Act: Create deal with valid organization
      const { data: deal, error } = await testEnv.supabase
        .from('deals')
        .insert({
          name: 'Valid Organization Deal',
          amount: 80000,
          organization_id: organization.id,
          user_id: testEnv.testUserId,
          wfm_project_id: scenario.deals[0].wfm_project_id
        })
        .select()
        .single();

      // Assert: Should succeed
      expect(error).toBeNull();
      expect(deal.organization_id).toBe(organization.id);

      await scenario.cleanup();
    });
  });

  describe('Performance and Scalability', () => {
    it('should create multiple deals efficiently', async () => {
      // Arrange
      const scenario = await factory.createEnterpriseSalesScenario();
      const startTime = Date.now();

      // Act: Create multiple deals
      const dealPromises = Array.from({ length: 5 }, (_, i) => 
        testEnv.supabase
          .from('deals')
          .insert({
            name: `Performance Test Deal ${i + 1}`,
            amount: 10000 * (i + 1),
            organization_id: scenario.organizations[0].id,
            user_id: testEnv.testUserId,
            wfm_project_id: scenario.deals[0].wfm_project_id
          })
          .select()
          .single()
      );

      const dealResults = await Promise.all(dealPromises);
      const duration = Date.now() - startTime;

      // Assert: Performance and correctness
      expect(duration).toBeLessThan(2000); // Under 2 seconds
      expect(dealResults).toHaveLength(5);

      // All deals should have proper WFM integration
      dealResults.forEach(result => {
        expect(result.error).toBeNull();
        expect(result.data?.wfm_project_id).toBeDefined();
      });

      await scenario.cleanup();
    });
  });
});
