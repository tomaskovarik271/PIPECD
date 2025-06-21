/**
 * Tool Registry for AI Agent V2
 * Manages tool definitions and execution for Claude Sonnet 4
 */

import { ThinkTool } from './ThinkTool';
import { SearchDealsTool } from './SearchDealsTool';
import { CreateDealTool } from './CreateDealTool';
import { CreateOrganizationTool } from './CreateOrganizationTool';
import { CreatePersonTool } from './CreatePersonTool';
import { UpdateDealTool } from './UpdateDealTool';
import { UpdatePersonTool } from './UpdatePersonTool';
import { UpdateOrganizationTool } from './UpdateOrganizationTool';
import { SupabaseClient } from '@supabase/supabase-js';
import { SimpleCognitiveEngine, SimpleToolEnhancer } from '../core/SimpleCognitiveEngine';

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: any;
}

export interface ToolExecutionContext {
  authToken?: string;
  userId?: string;
  conversationId: string;
  requestId?: string;
}

export interface ToolExecutor {
  execute(input: any, context: ToolExecutionContext): Promise<any>;
}

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, ToolDefinition> = new Map();
  private cognitiveEngine = SimpleCognitiveEngine.getInstance();
  private toolEnhancer = new SimpleToolEnhancer();
  private executors: Map<string, (supabaseClient: SupabaseClient, conversationId: string) => ToolExecutor> = new Map();

  constructor() {
    this.registerTool(
      ThinkTool.definition,
      (supabaseClient: SupabaseClient, conversationId: string) => new ThinkTool(supabaseClient, conversationId)
    );
    
    this.registerTool(
      SearchDealsTool.definition,
      (supabaseClient: SupabaseClient, conversationId: string) => new SearchDealsTool(supabaseClient, conversationId)
    );

    this.registerTool(
      CreateDealTool.definition,
      (supabaseClient: SupabaseClient, conversationId: string) => new CreateDealTool(supabaseClient, conversationId)
    );

    this.registerTool(
      CreateOrganizationTool.definition,
      (supabaseClient: SupabaseClient, conversationId: string) => new CreateOrganizationTool()
    );

    this.registerTool(
      CreatePersonTool.definition,
      (supabaseClient: SupabaseClient, conversationId: string) => new CreatePersonTool()
    );

    this.registerTool(
      UpdateDealTool.definition,
      (supabaseClient: SupabaseClient, conversationId: string) => new UpdateDealTool()
    );

    this.registerTool(
      UpdatePersonTool.definition,
      (supabaseClient: SupabaseClient, conversationId: string) => new UpdatePersonTool()
    );

    this.registerTool(
      UpdateOrganizationTool.definition,
      (supabaseClient: SupabaseClient, conversationId: string) => new UpdateOrganizationTool()
    );
  }

  registerTool(
    definition: ToolDefinition,
    executorFactory: (supabaseClient: SupabaseClient, conversationId: string) => ToolExecutor
  ) {
    this.tools.set(definition.name, definition);
    this.executors.set(definition.name, executorFactory);
  }

  getToolDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  async executeTool(
    toolName: string,
    input: any,
    supabaseClient: SupabaseClient,
    conversationId: string,
    authToken?: string,
    userId?: string
  ): Promise<any> {
    const executorFactory = this.executors.get(toolName);
    if (!executorFactory) {
      throw new Error(`Tool '${toolName}' not found in registry`);
    }

    const context: ToolExecutionContext = {
      authToken,
      userId,
      conversationId,
      requestId: `v2-tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    const executor = executorFactory(supabaseClient, conversationId);
    return await executor.execute(input, context);
  }

  hasTool(toolName: string): boolean {
    return this.tools.has(toolName);
  }

  getToolDefinition(toolName: string): ToolDefinition | undefined {
    return this.tools.get(toolName);
  }

  /**
   * 🧠 REVOLUTIONARY: Get Adaptive Tool Definitions
   * Tools now adapt their parameters based on user context and intent
   */
  async getAdaptiveToolDefinitions(userContext: {
    intent?: string;
    conversation_history?: string[];
    current_task?: string;
    user_id: string;
  }): Promise<any[]> {
    const definitions = [];
    
    for (const [name, toolDefinition] of Array.from(this.tools.entries())) {
      try {
        // Check if this tool needs smart enhancement
        if (this.needsSmartEnhancement(toolDefinition)) {
          const smartDefinition = await this.toolEnhancer.enhanceTool(
            toolDefinition,
            userContext
          );
          definitions.push(smartDefinition);
        } else {
          // Use standard definition for simple tools
          definitions.push(toolDefinition);
        }
      } catch (error) {
        console.error(`Failed to generate adaptive definition for ${name}:`, error);
        // Fallback to base definition
        definitions.push(toolDefinition);
      }
    }
    
    return definitions;
  }

  /**
   * 🎯 Check if tool needs smart enhancement
   */
  private needsSmartEnhancement(definition: any): boolean {
    const parameters = definition.parameters?.properties || {};
    
    const enhancementTriggers = [
      'organization_id',
      'person_id',
      'project_type_id', 
      'assigned_to',
      'contact_id'
    ];
    
    return Object.keys(parameters).some(paramName => 
      enhancementTriggers.some(trigger => paramName.includes(trigger))
    );
  }

  /**
   * 🚀 Handle Special Parameter Values
   * Process cognitive shortcuts and creation suggestions
   */
  async processToolInput(toolName: string, input: any, userContext: any): Promise<any> {
    const processedInput = { ...input };
    
    for (const [paramName, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        if (value === '__CREATE_NEW__') {
          // Handle creation workflow
          processedInput[paramName] = await this.handleCreateNew(paramName, userContext);
        } else if (value === '__SEARCH_MORE__') {
          // Handle extended search
          processedInput[paramName] = await this.handleSearchMore(paramName, userContext);
        }
      }
    }
    
    return processedInput;
  }

  private async handleCreateNew(paramName: string, userContext: any): Promise<string> {
    // This would trigger a creation workflow
    // For now, return a placeholder that the tool can handle
    return `CREATE_NEW_${paramName.toUpperCase()}`;
  }

  private async handleSearchMore(paramName: string, userContext: any): Promise<string> {
    // This would trigger an extended search
    // For now, return a search instruction
    return `SEARCH_MORE_${paramName.toUpperCase()}`;
  }
}

// Global tool registry instance
export const toolRegistry = new ToolRegistry(); 