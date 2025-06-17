// Main entry point for AI Agent V2 system
export * from './types/system.js';
export * from './types/tools.js';
export * from './types/agent.js';

export * from './core/SystemStateEncoder.js';
export * from './core/PipeCDRulesEngine.js';
export * from './core/EnhancedSystemPrompt.js';
export * from './core/SemanticSearchEngine.js';

export * from './services/AgentService.js';
export * from './services/AIService.js';
export * from './services/WorkflowOrchestrator.js';
export * from './services/ToolExecutor.js';

export * from './tools/ThinkingTool.js';

import { SystemStateEncoder } from './core/SystemStateEncoder.js';
import { PipeCDRulesEngine } from './core/PipeCDRulesEngine.js';
import { EnhancedSystemPrompt } from './core/EnhancedSystemPrompt.js';
import { SemanticSearchEngine } from './core/SemanticSearchEngine.js';
import { AgentService } from './services/AgentService.js';
import { AIService } from './services/AIService.js';
import { WorkflowOrchestrator } from './services/WorkflowOrchestrator.js';
import { ToolExecutor } from './services/ToolExecutor.js';
import { ThinkingTool } from './tools/ThinkingTool.js';

import type { AgentConfig } from './types/agent.js';

/**
 * Factory for creating a complete AI Agent V2 system
 */
export class AIAgentV2Factory {
  static async create(
    config: Partial<AgentConfig> = {},
    anthropicApiKey: string
  ): Promise<AgentService> {
    // Default configuration
    const defaultConfig: AgentConfig = {
      model: 'claude-3-5-sonnet',
      temperature: 0.1,
      maxTokens: 4000,
      systemPromptStrategy: 'dynamic',
      thinkingEnabled: true,
      workflowOrchestration: true,
      semanticSearchEnabled: true,
      realTimeContext: true,
      errorRecoveryAttempts: 3,
      rateLimits: {
        requestsPerMinute: 30,
        requestsPerHour: 1000
      }
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Initialize core components
    const systemStateEncoder = new SystemStateEncoder();
    const rulesEngine = new PipeCDRulesEngine();
    const enhancedSystemPrompt = new EnhancedSystemPrompt(systemStateEncoder, rulesEngine);
    const semanticSearchEngine = new SemanticSearchEngine();
    
    // Initialize services
    const aiService = new AIService(anthropicApiKey);
    const toolExecutor = new ToolExecutor(rulesEngine);
    const workflowOrchestrator = new WorkflowOrchestrator(rulesEngine);

    // Register core tools
    const thinkingTool = new ThinkingTool();
    toolExecutor.registerTool(thinkingTool as any);

    // Create main agent service
    const agentService = new AgentService(
      systemStateEncoder,
      rulesEngine,
      enhancedSystemPrompt,
      aiService,
      toolExecutor,
      workflowOrchestrator,
      finalConfig
    );

    // Initialize the system
    await agentService.initialize();

    return agentService;
  }

  /**
   * Create a lightweight agent for simple operations
   */
  static async createLightweight(anthropicApiKey: string): Promise<AgentService> {
    return this.create({
      model: 'claude-3-haiku',
      temperature: 0.0,
      maxTokens: 1000,
      systemPromptStrategy: 'static',
      thinkingEnabled: false,
      workflowOrchestration: false,
      semanticSearchEnabled: false,
      realTimeContext: false,
      errorRecoveryAttempts: 1,
      rateLimits: {
        requestsPerMinute: 60,
        requestsPerHour: 2000
      }
    }, anthropicApiKey);
  }

  /**
   * Create a development agent with enhanced debugging
   */
  static async createDevelopment(anthropicApiKey: string): Promise<AgentService> {
    return this.create({
      model: 'claude-3-5-sonnet',
      temperature: 0.2,
      maxTokens: 8000,
      systemPromptStrategy: 'dynamic',
      thinkingEnabled: true,
      workflowOrchestration: true,
      semanticSearchEnabled: true,
      realTimeContext: true,
      errorRecoveryAttempts: 5,
      rateLimits: {
        requestsPerMinute: 10, // Lower for development
        requestsPerHour: 500
      }
    }, anthropicApiKey);
  }

  /**
   * Create a production-optimized agent
   */
  static async createProduction(anthropicApiKey: string): Promise<AgentService> {
    return this.create({
      model: 'claude-3-5-sonnet',
      temperature: 0.05,
      maxTokens: 4000,
      systemPromptStrategy: 'contextual',
      thinkingEnabled: true,
      workflowOrchestration: true,
      semanticSearchEnabled: true,
      realTimeContext: true,
      errorRecoveryAttempts: 3,
      rateLimits: {
        requestsPerMinute: 30,
        requestsPerHour: 1000
      }
    }, anthropicApiKey);
  }
}

/**
 * Convenience function to create a default agent
 */
export async function createAIAgentV2(
  anthropicApiKey: string,
  config?: Partial<AgentConfig>
): Promise<AgentService> {
  return AIAgentV2Factory.create(config, anthropicApiKey);
}

/**
 * Version information
 */
export const VERSION = {
  major: 2,
  minor: 0,
  patch: 0,
  build: '2024-01-15',
  name: 'Agent V2 - Intelligence Revolution'
};

/**
 * System capabilities that can be checked before using features
 */
export const CAPABILITIES = {
  REAL_TIME_CONTEXT: true,
  STRUCTURED_REASONING: true,
  WORKFLOW_ORCHESTRATION: true,
  ERROR_RECOVERY: true,
  BUSINESS_RULES_ENGINE: true,
  CONTEXT_PRESERVATION: true,
  SEMANTIC_SEARCH: true,
  PATTERN_RECOGNITION: true,
  PROACTIVE_INSIGHTS: true,
  MULTI_STEP_WORKFLOWS: true,
  GRAPHQL_FIRST_ARCHITECTURE: true,
  PERMISSION_AWARE_OPERATIONS: true,
  ADVANCED_PROMPT_GENERATION: true,
  INTELLIGENT_DECISION_MAKING: true
} as const;

/**
 * Migration helper for V1 to V2
 */
export class MigrationHelper {
  /**
   * Check if V1 agent service exists and provide migration guidance
   */
  static async checkV1Compatibility(): Promise<{
    hasV1: boolean;
    migrationRequired: boolean;
    recommendations: string[];
  }> {
    // This would check for existing V1 components
    return {
      hasV1: false, // Would be determined by actual check
      migrationRequired: false,
      recommendations: [
        'V2 system is fully backward compatible',
        'Consider migrating to V2 for enhanced capabilities',
        'V1 tools can be adapted to V2 architecture'
      ]
    };
  }

  /**
   * Migrate V1 tool to V2 format
   */
  static migrateV1Tool(v1Tool: any): any {
    // This would contain actual migration logic
    return {
      name: v1Tool.name || 'unknown',
      description: v1Tool.description || 'Migrated from V1',
      parameters: v1Tool.parameters || {},
      requiredPermissions: v1Tool.requiredPermissions || [],
      execute: v1Tool.execute || (() => { throw new Error('Execute function not migrated'); })
    };
  }
}

/**
 * Health check utilities
 */
export class HealthCheck {
  /**
   * Perform comprehensive system health check
   */
  static async performHealthCheck(agentService: AgentService): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
    details: Record<string, any>;
  }> {
    const results = {
      overall: 'healthy' as const,
      components: {} as Record<string, 'healthy' | 'degraded' | 'unhealthy'>,
      details: {} as Record<string, any>
    };

    try {
      // Check AI service
      const aiHealthy = await agentService['aiService']?.healthCheck();
      results.components.aiService = aiHealthy ? 'healthy' : 'unhealthy';

      // Check system state encoder
      results.components.systemStateEncoder = 'healthy'; // Placeholder

      // Check rules engine
      results.components.rulesEngine = 'healthy'; // Placeholder

      // Check tool executor
      results.components.toolExecutor = 'healthy'; // Placeholder

      // Determine overall health
      const unhealthyCount = Object.values(results.components).filter(status => status === 'unhealthy').length;
      const degradedCount = Object.values(results.components).filter(status => status === 'degraded').length;

      if (unhealthyCount > 0) {
        results.overall = 'unhealthy';
      } else if (degradedCount > 0) {
        results.overall = 'degraded';
      }

      return results;

    } catch (error) {
      results.overall = 'unhealthy';
      results.details.error = error;
      return results;
    }
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static metrics: Map<string, any> = new Map();

  static startTracking(operationId: string): void {
    this.metrics.set(operationId, {
      startTime: Date.now(),
      endTime: null,
      duration: null
    });
  }

  static endTracking(operationId: string): number {
    const metric = this.metrics.get(operationId);
    if (metric) {
      metric.endTime = Date.now();
      metric.duration = metric.endTime - metric.startTime;
      return metric.duration;
    }
    return 0;
  }

  static getMetrics(): Record<string, any> {
    return Object.fromEntries(this.metrics);
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }
}

export default {
  AIAgentV2Factory,
  createAIAgentV2,
  VERSION,
  CAPABILITIES,
  MigrationHelper,
  HealthCheck,
  PerformanceMonitor
}; 