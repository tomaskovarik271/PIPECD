import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestEnvironment, TestEnvironment } from '../setup/testEnvironment';
import { BusinessScenarioFactory } from '../factories/businessScenarios';

describe('Collaboration Model - Permission System', () => {
  let testEnv: TestEnvironment;
  let factory: BusinessScenarioFactory;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
    factory = new BusinessScenarioFactory(testEnv.supabase, testEnv.testUserId);
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Deal Collaboration Permissions', () => {
    it('should allow member users to edit any deal', async () => {
      // Arrange: Create test scenario
      const scenario = await factory.createEnterpriseSalesScenario();
      const deal = scenario.deals[0];

      // Act: Update deal via direct database call (simulating new collaboration model)
      const { data: updatedDeal, error } = await testEnv.supabase
        .from('deals')
        .update({ amount: 999000 })
        .eq('id', deal.id)
        .select()
        .single();

      // Assert: Update should succeed
      expect(error).toBeNull();
      expect(updatedDeal.amount).toBe(999000);
      expect(updatedDeal.id).toBe(deal.id);

      await scenario.cleanup();
    });

    it('should maintain assignment for reporting while allowing collaboration', async () => {
      // Arrange
      const scenario = await factory.createEnterpriseSalesScenario();
      const deal = scenario.deals[0];
      const originalAssignee = deal.assigned_to_user_id;

      // Act: Update deal without changing assignment
      const { data: updatedDeal } = await testEnv.supabase
        .from('deals')
        .update({ name: 'Collaborative Edit' })
        .eq('id', deal.id)
        .select()
        .single();

      // Assert: Assignment preserved for reporting
      expect(updatedDeal.assigned_to_user_id).toBe(originalAssignee);
      expect(updatedDeal.name).toBe('Collaborative Edit');

      await scenario.cleanup();
    });
  });

  describe('Lead Collaboration Permissions', () => {
    it('should allow collaborative lead editing', async () => {
      // Arrange
      const scenario = await factory.createEnterpriseSalesScenario();
      const lead = scenario.leads[0];

      // Act: Update lead
      const { data: updatedLead, error } = await testEnv.supabase
        .from('leads')
        .update({ lead_score: 95 })
        .eq('id', lead.id)
        .select()
        .single();

      // Assert
      expect(error).toBeNull();
      expect(updatedLead.lead_score).toBe(95);

      await scenario.cleanup();
    });
  });
});
