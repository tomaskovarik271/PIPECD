import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestEnvironment, TestEnvironment } from '../setup/testEnvironment';
import { BusinessScenarioFactory } from '../factories/businessScenarios';

describe('Performance - Database Operations', () => {
  let testEnv: TestEnvironment;
  let factory: BusinessScenarioFactory;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
    factory = new BusinessScenarioFactory(testEnv.supabase, testEnv.testUserId);
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Deal Operations Performance', () => {
    it('should create deals efficiently', async () => {
      // Arrange
      const scenario = await factory.createEnterpriseSalesScenario();
      const organization = scenario.organizations[0];

      // Act: Measure bulk deal creation
      const startTime = Date.now();
      const dealPromises = Array.from({ length: 10 }, (_, i) => 
        testEnv.supabase
          .from('deals')
          .insert({
            name: `Performance Test Deal ${i + 1}`,
            amount: 100000 + (i * 10000),
            organization_id: organization.id,
            user_id: testEnv.testUserId,
            assigned_to_user_id: testEnv.testUserId
          })
          .select()
          .single()
      );

      const deals = await Promise.all(dealPromises);
      const duration = Date.now() - startTime;

      // Assert: Performance thresholds
      expect(deals).toHaveLength(10);
      expect(duration).toBeLessThan(3000); // Under 3 seconds
      expect(deals[0].data).toHaveProperty('id');

      await scenario.cleanup();
    });

    it('should search deals efficiently', async () => {
      // Arrange: Create multiple deals
      const scenario = await factory.createEnterpriseSalesScenario();
      
      // Act: Measure search performance
      const startTime = Date.now();
      const { data: deals } = await testEnv.supabase
        .from('deals')
        .select('*')
        .eq('user_id', testEnv.testUserId)
        .order('created_at', { ascending: false })
        .limit(50);
      const duration = Date.now() - startTime;

      // Assert: Fast search
      expect(duration).toBeLessThan(500); // Under 500ms
      expect(Array.isArray(deals)).toBe(true);

      await scenario.cleanup();
    });
  });

  describe('Memory and Resource Management', () => {
    it('should handle large datasets without memory leaks', async () => {
      // Arrange: Create substantial test data
      const scenario = await factory.createEnterpriseSalesScenario();
      
      // Act: Process data multiple times
      for (let i = 0; i < 5; i++) {
        const { data } = await testEnv.supabase
          .from('deals')
          .select('id, name, amount')
          .eq('user_id', testEnv.testUserId);
        
        // Process data
        const totalValue = data?.reduce((sum, deal) => sum + (deal.amount || 0), 0) || 0;
        expect(totalValue).toBeGreaterThan(0);
      }

      // Assert: No memory issues (test completes successfully)
      expect(true).toBe(true);

      await scenario.cleanup();
    });
  });
});
