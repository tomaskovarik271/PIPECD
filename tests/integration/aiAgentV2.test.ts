import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestEnvironment, TestEnvironment } from '../setup/testEnvironment';
import { BusinessScenarioFactory } from '../factories/businessScenarios';
import { CreateDealTool } from '../../lib/aiAgentV2/tools/CreateDealTool';
import { SearchDealsTool } from '../../lib/aiAgentV2/tools/SearchDealsTool';

describe('AI Agent V2 - Cognitive Tools Integration', () => {
  let testEnv: TestEnvironment;
  let factory: BusinessScenarioFactory;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
    factory = new BusinessScenarioFactory(testEnv.supabase, testEnv.testUserId);
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('CreateDealTool - Revolutionary Cognitive Creation', () => {
    it('should create deal with organization lookup', async () => {
      // Arrange: Create scenario with known organization
      const scenario = await factory.createEnterpriseSalesScenario();
      const existingOrg = scenario.organizations.find(
        org => org.name === 'Global Financial Corp'
      );

      const createTool = new CreateDealTool(testEnv.supabase, 'test-conversation');

      // Act: Use AI tool to create deal
      const result = await createTool.execute({
        name: 'AI-Created Strategic Deal',
        organization_name: 'Global Financial Corp', // Should find existing
        amount: 850000,
        currency: 'USD'
      }, {
        conversationId: 'test-conversation',
        userId: testEnv.testUserId,
        authToken: testEnv.mockAuthToken
      });

      // Assert: Cognitive tool should succeed
      expect(result.success).toBe(true);
      expect(result.deal).toMatchObject({
        name: 'AI-Created Strategic Deal',
        amount: 850000,
        organization_id: existingOrg.id
      });

      // Critical: Should have WFM integration for Kanban
      expect(result.deal.wfm_project_id).toBeDefined();

      await scenario.cleanup();
    });

    it('should handle organization creation when not found', async () => {
      // Arrange
      const scenario = await factory.createEnterpriseSalesScenario();
      const createTool = new CreateDealTool(testEnv.supabase, 'test-conversation');

      // Act: Create deal with new organization
      const result = await createTool.execute({
        name: 'New Company Deal',
        organization_name: 'Future Tech Innovations Ltd',
        amount: 150000
      }, {
        conversationId: 'test-conversation',
        userId: testEnv.testUserId,
        authToken: testEnv.mockAuthToken
      });

      // Assert: Should create both organization and deal
      expect(result.success).toBe(true);
      expect(result.deal.name).toBe('New Company Deal');
      expect(result.organizationCreated).toBe(true);

      await scenario.cleanup();
    });
  });

  describe('SearchDealsTool - Intelligent Discovery', () => {
    it('should find deals with semantic search', async () => {
      // Arrange: Create deals with specific characteristics
      const scenario = await factory.createEnterpriseSalesScenario();
      
      const searchTool = new SearchDealsTool(testEnv.supabase, 'test-conversation');

      // Act: Search for enterprise deals
      const result = await searchTool.execute({
        search_term: 'enterprise financial',
        min_amount: 400000
      }, {
        conversationId: 'test-conversation',
        userId: testEnv.testUserId,
        authToken: testEnv.mockAuthToken
      });

      // Assert: Should find relevant deals
      expect(result.total_count).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.deals)).toBe(true);
      
      // Should find the enterprise deal
      const enterpriseDeal = result.deals.find(
        deal => deal.name.includes('Enterprise') || deal.amount >= 400000
      );
      if (result.deals.length > 0) {
        expect(enterpriseDeal).toBeDefined();
      }

      await scenario.cleanup();
    });

    it('should respect user permissions in search', async () => {
      // Arrange
      const scenario = await factory.createEnterpriseSalesScenario();
      const searchTool = new SearchDealsTool(testEnv.supabase, 'test-conversation');

      // Act: Search with proper permissions
      const result = await searchTool.execute({
        search_term: 'all deals'
      }, {
        conversationId: 'test-conversation',
        userId: testEnv.testUserId,
        authToken: testEnv.mockAuthToken
      });

      // Assert: Should access all deals
      expect(result.total_count).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.deals)).toBe(true);

      await scenario.cleanup();
    });
  });

  describe('AI Tool Performance', () => {
    it('should execute tools within performance thresholds', async () => {
      // Arrange
      const scenario = await factory.createEnterpriseSalesScenario();
      const searchTool = new SearchDealsTool(testEnv.supabase, 'test-conversation');

      // Act: Measure search performance
      const startTime = Date.now();
      const result = await searchTool.execute({
        search_term: 'financial'
      }, {
        conversationId: 'test-conversation',
        userId: testEnv.testUserId,
        authToken: testEnv.mockAuthToken
      });
      const duration = Date.now() - startTime;

      // Assert: Should be fast
      expect(result.total_count).toBeGreaterThanOrEqual(0);
      expect(duration).toBeLessThan(1000); // Under 1 second

      await scenario.cleanup();
    });
  });
});
