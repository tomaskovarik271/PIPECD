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

export class ToolExecutor {
  private registeredTools: Map<string, any> = new Map();
  private rulesEngine: PipeCDRulesEngine;
  private executionHistory: Map<string, ToolCall[]> = new Map();
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
    // Return simple tool definitions
    return [
      { name: 'search_deals', description: 'Search for deals' },
      { name: 'search_organizations', description: 'Search for organizations' },
      { name: 'search_contacts', description: 'Search for contacts' },
      { name: 'create_deal', description: 'Create a new deal' },
      { name: 'create_organization', description: 'Create a new organization' },
      { name: 'create_contact', description: 'Create a new contact' },
      { name: 'get_details', description: 'Get entity details' },
      { name: 'get_dropdown_data', description: 'Get dropdown data' },
      { name: 'think', description: 'Reasoning tool' }
    ];
  }

  getRegisteredTools(): string[] {
    return ['search_deals', 'search_organizations', 'search_contacts', 'create_deal', 'create_organization', 'create_contact', 'get_details', 'get_dropdown_data', 'think'];
  }

  private initializeTools(): void {
    console.log('[ToolExecutor V2 Minimal] *** MINIMAL TOOL REGISTRATION ***');
    // Just register that we support these tools
    this.registeredTools.set('search_deals', true);
    this.registeredTools.set('search_organizations', true);
    this.registeredTools.set('search_contacts', true);
    this.registeredTools.set('create_deal', true);
    this.registeredTools.set('create_organization', true);
    this.registeredTools.set('create_contact', true);
    this.registeredTools.set('get_details', true);
    this.registeredTools.set('get_dropdown_data', true);
    this.registeredTools.set('think', true);
    console.log('[ToolExecutor V2 Minimal] *** REGISTERED 9 TOOLS ***');
  }
} 