import type {
  ToolExecutionContext,
  ToolResult,
  BaseTool
} from '../types/tools.js';
import type { BusinessRule } from '../types/system.js';
import { PipeCDRulesEngine } from '../core/PipeCDRulesEngine.js';
import { ToolRegistryV2 } from '../tools/ToolRegistryV2.js';

// Import all V2 tools directly
import { SearchDealsTool } from '../tools/SearchDealsTool.js';
import { SearchOrganizationsTool } from '../tools/SearchOrganizationsTool.js';
import { SearchContactsTool } from '../tools/SearchContactsTool.js';
import { CreateDealTool } from '../tools/CreateDealTool.js';
import { CreateOrganizationTool } from '../tools/CreateOrganizationTool.js';
import { CreateContactTool } from '../tools/CreateContactTool.js';
import { GetDetailsTool } from '../tools/GetDetailsTool.js';
import { GetDropdownDataTool } from '../tools/GetDropdownDataTool.js';
import { ThinkingTool } from '../tools/ThinkingTool.js';

interface ToolCall {
  id: string;
  tool: string;
  parameters: Record<string, any>;
  result?: any;
  timestamp: string;
}

interface ThinkingStep {
  id: string;
  timestamp: string;
  reasoning_type: string;
  thought: string;
  confidence: number;
  context?: string;
  focus_areas?: string[];
  constraints?: string[];
}

export class ToolExecutor {
  private registeredTools: Map<string, any> = new Map();
  private rulesEngine: PipeCDRulesEngine;
  private executionHistory: Map<string, ToolCall[]> = new Map();
  private thinkingHistory: ThinkingStep[] = [];
  private maxRetryAttempts = 3;
  private executionTimeout = 30000; // 30 seconds

  constructor(rulesEngine: PipeCDRulesEngine) {
    this.rulesEngine = rulesEngine;
    this.initializeTools();
  }

  async executeTool(
    toolName: string,
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    console.log(`[ToolExecutor V2 Minimal] *** EXECUTING TOOL: ${toolName} ***`);
    console.log(`[ToolExecutor V2 Minimal] *** PARAMETERS:`, JSON.stringify(parameters, null, 2));
    
    // Handle think tool - Anthropic's approach
    if (toolName === 'think') {
      return this.executeThink(parameters, context);
    }
    
    // Handle search_deals directly using V1's proven pattern
    if (toolName === 'search_deals') {
      return this.executeSearchDeals(parameters, context);
    }
    
    // Stub implementation for other tools
    console.log(`[ToolExecutor V2 Minimal] *** Tool ${toolName} is stubbed ***`);
    return {
      success: false,
      message: `Tool ${toolName} not implemented in minimal executor`,
      metadata: {
        executionTime: 0,
        dataSourcesUsed: ['stub'],
        confidenceScore: 0
      }
    };
  }

  private async executeThink(
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    console.log(`[ToolExecutor V2 Minimal] *** EXECUTING THINK TOOL ***`);
    
    try {
      const startTime = Date.now();
      const { thought, reasoning_type = 'analysis', context: additionalContext, focus_areas, constraints } = parameters;
      
      // Validate required parameters
      if (!thought || typeof thought !== 'string' || thought.trim().length === 0) {
        return {
          success: false,
          message: 'Think tool requires a valid thought parameter',
          metadata: {
            executionTime: Date.now() - startTime,
            dataSourcesUsed: ['think_tool'],
            confidenceScore: 0
          }
        };
      }

      // Create thinking step following Anthropic's approach
      const thinkingStep: ThinkingStep = {
        id: `think-${Date.now()}`,
        timestamp: new Date().toISOString(),
        reasoning_type,
        thought: thought.trim(),
        confidence: 0.9,
        context: additionalContext,
        focus_areas,
        constraints
      };

      // Store in thinking history
      this.thinkingHistory.push(thinkingStep);

      console.log(`[ToolExecutor V2 Minimal] *** THINK RESULT:`, {
        reasoning_type,
        thoughtLength: thought.length,
        confidence: thinkingStep.confidence
      });

      // Return structured thinking result
      return {
        success: true,
        data: {
          thinking_step: thinkingStep,
          structured_thought: `[${reasoning_type.toUpperCase()}] ${thought}`,
          reasoning_chain: this.thinkingHistory.slice(-3), // Last 3 thinking steps for context
          next_actions: this.generateNextActions(reasoning_type, thought),
          insights: this.extractInsights(thought, additionalContext)
        },
        message: `Thinking completed: ${reasoning_type} reasoning about "${thought.substring(0, 50)}${thought.length > 50 ? '...' : ''}"`,
        metadata: {
          executionTime: Date.now() - startTime,
          dataSourcesUsed: ['think_tool'],
          confidenceScore: thinkingStep.confidence,
          thinking_steps_count: this.thinkingHistory.length
        }
      };
      
    } catch (error: any) {
      console.error(`[ToolExecutor V2 Minimal] *** THINK ERROR:`, error.message);
      return {
        success: false,
        message: `Think tool failed: ${error.message}`,
        metadata: {
          executionTime: 0,
          dataSourcesUsed: ['think_tool'],
          confidenceScore: 0
        }
      };
    }
  }

  private generateNextActions(reasoning_type: string, thought: string): string[] {
    switch (reasoning_type) {
      case 'planning':
        return [
          'Break down into actionable steps',
          'Identify required resources and dependencies',
          'Set timeline and priorities'
        ];
      case 'analysis':
        return [
          'Gather additional data if needed',
          'Apply analytical frameworks',
          'Document findings and patterns'
        ];
      case 'decision':
        return [
          'Define decision criteria clearly',
          'Evaluate options systematically',
          'Consider stakeholder impact and risks'
        ];
      case 'validation':
        return [
          'Verify against established criteria',
          'Check for completeness and accuracy',
          'Test assumptions and dependencies'
        ];
      case 'synthesis':
        return [
          'Identify connections between elements',
          'Create unified framework or solution',
          'Validate integrated approach'
        ];
      default:
        return [
          'Continue with structured analysis',
          'Gather more information if needed',
          'Apply appropriate reasoning framework'
        ];
    }
  }

  private extractInsights(thought: string, additionalContext?: string): string[] {
    const insights: string[] = [];
    
    // Simple keyword-based insight extraction
    const lowerThought = thought.toLowerCase();
    
    if (lowerThought.includes('deal') || lowerThought.includes('sales')) {
      insights.push('Deal-related analysis identified');
    }
    
    if (lowerThought.includes('policy') || lowerThought.includes('rule') || lowerThought.includes('permission')) {
      insights.push('Policy compliance consideration detected');
    }
    
    if (lowerThought.includes('step') || lowerThought.includes('sequence') || lowerThought.includes('order')) {
      insights.push('Sequential workflow planning identified');
    }
    
    if (lowerThought.includes('risk') || lowerThought.includes('error') || lowerThought.includes('fail')) {
      insights.push('Risk assessment component detected');
    }
    
    if (additionalContext) {
      insights.push('Additional context provided for enhanced reasoning');
    }
    
    return insights.length > 0 ? insights : ['General reasoning completed'];
  }

  private async executeSearchDeals(
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    console.log(`[ToolExecutor V2 Minimal] *** EXECUTING SEARCH_DEALS ***`);
    
    try {
      // Import V1's DealsModule directly 
      const { DealsModule } = await import('../../aiAgent/tools/domains/DealsModule.js');
      const { GraphQLClient } = await import('../../aiAgent/utils/GraphQLClient.js');
      
      // Create V1 GraphQL client
      const graphqlClient = new GraphQLClient({
        endpoint: process.env.GRAPHQL_ENDPOINT || 'http://localhost:8888/.netlify/functions/graphql',
        defaultTimeout: 120000,
      });
      
      // Create V1 DealsModule
      const dealsModule = new DealsModule(graphqlClient);
      
      // Convert V2 context to V1 context format
      const v1Context = {
        authToken: context.authToken,
        userId: context.userId,
        conversationId: context.sessionId,
        requestId: context.requestId || `req-${Date.now()}`
      };
      
      console.log(`[ToolExecutor V2 Minimal] *** Calling V1 DealsModule.searchDeals ***`);
      
      // Call V1's working searchDeals method directly
      const result = await dealsModule.searchDeals(parameters, v1Context);
      
      console.log(`[ToolExecutor V2 Minimal] *** V1 DealsModule result:`, result.success ? 'SUCCESS' : 'FAILED');
      
      // Convert V1 result to V2 format
      return {
        success: result.success,
        data: result.data,
        message: result.message,
        metadata: {
          executionTime: result.metadata?.executionTime || 0,
          dataSourcesUsed: ['v1_deals_module'],
          confidenceScore: 0.95
        }
      };
      
    } catch (error: any) {
      console.error(`[ToolExecutor V2 Minimal] *** ERROR:`, error.message);
      return {
        success: false,
        message: `Search deals failed: ${error.message}`,
        metadata: {
          executionTime: 0,
          dataSourcesUsed: ['v1_deals_module'],
          confidenceScore: 0
        }
      };
    }
  }

  async getAvailableTools(userId: string): Promise<any[]> {
    // Return tool definitions including enhanced think tool
    return [
      { 
        name: 'think', 
        description: 'Use this tool for complex reasoning about CRM operations, policy compliance, or multi-step planning. Use it when you need to analyze tool results, check policy compliance, or plan sequential actions.',
        parameters: {
          type: 'object',
          properties: {
            thought: {
              type: 'string',
              description: 'Detailed reasoning about the current CRM task, decision, or analysis. Be specific about what you are thinking through.'
            },
            reasoning_type: {
              type: 'string',
              enum: ['planning', 'analysis', 'decision', 'validation', 'synthesis'],
              description: 'Type of reasoning being performed'
            },
            context: {
              type: 'string',
              description: 'Additional context for the reasoning'
            },
            focus_areas: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific areas to focus the analysis on'
            },
            constraints: {
              type: 'array',
              items: { type: 'string' },
              description: 'Constraints to consider in the reasoning'
            }
          },
          required: ['thought']
        }
      },
      { name: 'search_deals', description: 'Search for deals' },
      { name: 'search_organizations', description: 'Search for organizations' },
      { name: 'search_contacts', description: 'Search for contacts' },
      { name: 'create_deal', description: 'Create a new deal' },
      { name: 'create_organization', description: 'Create a new organization' },
      { name: 'create_contact', description: 'Create a new contact' },
      { name: 'get_details', description: 'Get entity details' },
      { name: 'get_dropdown_data', description: 'Get dropdown data' }
    ];
  }

  getRegisteredTools(): string[] {
    return ['think', 'search_deals', 'search_organizations', 'search_contacts', 'create_deal', 'create_organization', 'create_contact', 'get_details', 'get_dropdown_data'];
  }

  getThinkingHistory(): ThinkingStep[] {
    return [...this.thinkingHistory];
  }

  clearThinkingHistory(): void {
    this.thinkingHistory = [];
  }

  private initializeTools(): void {
    console.log('[ToolExecutor V2 Minimal] *** MINIMAL TOOL REGISTRATION ***');
    // Register think tool first (following Anthropic's priority)
    this.registeredTools.set('think', true);
    this.registeredTools.set('search_deals', true);
    this.registeredTools.set('search_organizations', true);
    this.registeredTools.set('search_contacts', true);
    this.registeredTools.set('create_deal', true);
    this.registeredTools.set('create_organization', true);
    this.registeredTools.set('create_contact', true);
    this.registeredTools.set('get_details', true);
    this.registeredTools.set('get_dropdown_data', true);
    console.log('[ToolExecutor V2 Minimal] *** REGISTERED 9 TOOLS (including think) ***');
  }
} 