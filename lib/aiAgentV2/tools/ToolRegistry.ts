/**
 * Tool Registry for AI Agent V2
 * Manages tool definitions and execution for Claude Sonnet 4
 */

import { ThinkTool } from './ThinkTool';
import { SearchDealsTool } from './SearchDealsTool';
import { SupabaseClient } from '@supabase/supabase-js';

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
  private tools: Map<string, ToolDefinition> = new Map();
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
}

// Global tool registry instance
export const toolRegistry = new ToolRegistry(); 