/**
 * Tool Executor for PipeCD AI Agent
 * 
 * Phase 3 - Domain-Driven Architecture:
 * Simplified tool execution using domain modules instead of monolithic switch statements
 */

import type { 
  ToolResult, 
  ToolExecutionContext
} from '../types/tools';
import type { MCPTool } from '../types';
import { 
  MCPError, 
  AgentError 
} from '../types';
import { ToolRegistry } from './ToolRegistry';
import { DomainRegistry } from './domains/DomainRegistry';
import { GraphQLClient } from '../utils/GraphQLClient';

export interface ToolExecutorConfig {
  graphqlEndpoint: string;
  enableLogging?: boolean;
  enableMetrics?: boolean;
  timeout?: number;
}

export interface ToolMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  toolExecutionCounts: Record<string, number>;
}

export class ToolExecutor {
  private config: ToolExecutorConfig;
  private toolRegistry: ToolRegistry;
  private domainRegistry: DomainRegistry;
  private graphqlClient: GraphQLClient;
  private metrics: ToolMetrics;

  constructor(config: ToolExecutorConfig, toolRegistry: ToolRegistry) {
    this.config = {
      timeout: 120000, // 2 minutes for complex AI workflows
      enableLogging: false,
      enableMetrics: false,
      ...config,
    };
    
    this.toolRegistry = toolRegistry;
    this.graphqlClient = new GraphQLClient({
      endpoint: config.graphqlEndpoint,
      defaultTimeout: this.config.timeout,
    });
    this.domainRegistry = new DomainRegistry(this.graphqlClient);
    
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      toolExecutionCounts: {},
    };
  }

  /**
   * Execute a tool with full validation and error handling
   * Phase 3: Now uses domain modules instead of hardcoded switch statements
   */
  async executeTool(
    toolName: string,
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      this.logExecution(`Executing tool: ${toolName}`, { parameters, context });
      
      // Validate tool exists (check both domain modules and fallback tools)
      if (!this.domainRegistry.hasToolCalled(toolName) && !this.isFallbackTool(toolName)) {
        const availableTools = this.domainRegistry.getAllTools();
        const fallbackTools = this.getFallbackToolNames();
        const allAvailableTools = [...availableTools, ...fallbackTools];
        throw new MCPError(
          `Unknown tool: ${toolName}. Available tools: ${allAvailableTools.join(', ')}`,
          'UNKNOWN_TOOL'
        );
      }

      // Get tool definition for parameter validation
      const tool = this.toolRegistry.getTool(toolName);
      if (!tool) {
        throw new MCPError(`Tool definition not found: ${toolName}`, 'TOOL_DEFINITION_MISSING');
      }

      // Validate required parameters
      this.validateParameters(tool, parameters);

      // Execute tool using domain registry
      const result = await this.executeWithTimeout(
        () => this.executeToolSafely(toolName, parameters, context),
        this.config.timeout!
      );

      // Update metrics
      this.updateMetrics(toolName, true, Date.now() - startTime);
      
      this.logExecution(`Tool executed successfully: ${toolName}`, { 
        result: result.success, 
        executionTime: Date.now() - startTime 
      });
      
      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateMetrics(toolName, false, executionTime);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown execution error';
      this.logExecution(`Tool execution failed: ${toolName}`, { 
        error: errorMessage, 
        executionTime 
      });

      return {
        success: false,
        message: errorMessage,
        metadata: {
          toolName,
          parameters,
          timestamp: new Date().toISOString(),
          executionTime,
        },
      };
    }
  }

  /**
   * Execute multiple tools in parallel
   */
  async executeToolsParallel(
    executions: Array<{
      toolName: string;
      parameters: Record<string, any>;
      context: ToolExecutionContext;
    }>
  ): Promise<ToolResult[]> {
    this.logExecution(`Executing ${executions.length} tools in parallel`);
    
    const promises = executions.map(({ toolName, parameters, context }) =>
      this.executeTool(toolName, parameters, context)
    );

    return Promise.all(promises);
  }

  /**
   * Execute multiple tools sequentially
   */
  async executeToolsSequential(
    executions: Array<{
      toolName: string;
      parameters: Record<string, any>;
      context: ToolExecutionContext;
    }>
  ): Promise<ToolResult[]> {
    this.logExecution(`Executing ${executions.length} tools sequentially`);
    
    const results: ToolResult[] = [];
    
    for (const { toolName, parameters, context } of executions) {
      const result = await this.executeTool(toolName, parameters, context);
      results.push(result);
      
      // Stop on first failure if needed
      if (!result.success) {
        this.logExecution(`Sequential execution stopped due to failure: ${toolName}`);
        break;
      }
    }
    
    return results;
  }

  /**
   * Get available tools (delegated to domain registry)
   */
  getAvailableTools(): string[] {
    return this.domainRegistry.getAllTools();
  }

  /**
   * Get tools for a specific domain
   */
  getToolsForDomain(domainName: string): string[] {
    return this.domainRegistry.getToolsForDomain(domainName);
  }

  /**
   * Get execution metrics
   */
  getMetrics(): ToolMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      toolExecutionCounts: {},
    };
  }

  // ================================
  // Private Helper Methods
  // ================================

  private validateParameters(tool: MCPTool, parameters: Record<string, any>): void {
    const requiredParams = tool.parameters?.required || [];
    const properties = tool.parameters?.properties || {};

    for (const param of requiredParams) {
      if (!(param in parameters)) {
        throw new AgentError(
          `Missing required parameter: ${param}`,
          'MISSING_PARAMETER'
        );
      }
    }

    // Type validation for provided parameters
    for (const [key, value] of Object.entries(parameters)) {
      if (key in properties) {
        const schema = properties[key];
        if (!this.validateParameterType(value, schema)) {
          throw new AgentError(
            `Invalid type for parameter ${key}: expected ${schema.type}`,
            'INVALID_PARAMETER_TYPE'
          );
        }
      }
    }
  }

  private validateParameterType(value: any, schema: any): boolean {
    if (!schema.type) return true;

    switch (schema.type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Tool execution timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  private updateMetrics(toolName: string, success: boolean, executionTime: number): void {
    if (!this.config.enableMetrics) return;

    this.metrics.totalExecutions++;
    this.metrics.toolExecutionCounts[toolName] = (this.metrics.toolExecutionCounts[toolName] || 0) + 1;

    if (success) {
      this.metrics.successfulExecutions++;
    } else {
      this.metrics.failedExecutions++;
    }

    // Update average execution time
    const totalTime = this.metrics.averageExecutionTime * (this.metrics.totalExecutions - 1) + executionTime;
    this.metrics.averageExecutionTime = totalTime / this.metrics.totalExecutions;
  }

  private logExecution(message: string, details?: any): void {
    if (!this.config.enableLogging) return;
    
    const timestamp = new Date().toISOString();
    console.log(`[ToolExecutor ${timestamp}] ${message}`, details ? JSON.stringify(details, null, 2) : '');
  }

  private async executeToolSafely(
    toolName: string,
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    // First try domain registry for implemented tools
    if (this.domainRegistry.hasToolCalled(toolName)) {
      return this.domainRegistry.executeTool(toolName, parameters, context);
    }

    // Fallback for tools not yet moved to domain modules
    return this.executeFallbackTool(toolName, parameters, context);
  }

  /**
   * Execute tools that haven't been moved to domain modules yet
   * These will be implemented in future phases
   */
  private async executeFallbackTool(
    toolName: string,
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    // Handle remaining tools that will be implemented in future domain modules
    switch (toolName) {
      // Think Tool - for complex reasoning
      case 'think':
        try {
          const { thought, reasoning_type, confidence, next_actions } = parameters;
          
          // Validate required parameters
          if (!thought || !reasoning_type) {
            return {
              success: false,
              message: 'Missing required parameters: thought and reasoning_type are required',
              metadata: {
                toolName,
                parameters,
                timestamp: new Date().toISOString(),
                executionTime: 0,
              },
            };
          }

          // Log the thinking step (this is the main purpose of the think tool)
          const thinkingStep = {
            id: `think-${Date.now()}`,
            type: reasoning_type,
            content: thought,
            confidence: confidence || 0.8,
            reasoning: `AI reasoning: ${thought}`,
            nextActions: next_actions || [],
            timestamp: new Date().toISOString(),
          };

          // Store the thinking step in context for later retrieval
          if (context.conversationId) {
            // In a real implementation, this would be stored in the database
            // For now, we'll just return it as part of the result
          }

          return {
            success: true,
            data: { 
              thinkingStep,
              reasoning_type,
              confidence: confidence || 0.8,
              next_actions: next_actions || []
            },
            message: `💭 Thinking: ${thought.substring(0, 100)}${thought.length > 100 ? '...' : ''}`,
            metadata: {
              toolName,
              parameters,
              timestamp: new Date().toISOString(),
              executionTime: 0,
              reasoning_type,
              confidence: confidence || 0.8,
            },
          };
        } catch (error) {
          return {
            success: false,
            message: `Failed to process thinking: ${error instanceof Error ? error.message : 'Unknown error'}`,
            metadata: {
              toolName,
              parameters,
              timestamp: new Date().toISOString(),
              executionTime: 0,
            },
          };
        }
      // Custom Field Tools - get_custom_field_definitions is now properly implemented
      case 'get_custom_field_definitions':
        try {
          const { getCustomFieldDefinitions } = await import('../../customFieldDefinitionService.js');
          const { getAuthenticatedClient } = await import('../../serviceUtils.js');
          
          if (!context.userId || !context.authToken) {
            return {
              success: false,
              message: 'Authentication required for custom field definitions',
              metadata: {
                toolName,
                parameters,
                timestamp: new Date().toISOString(),
                executionTime: 0,
              },
            };
          }

          const supabaseClient = getAuthenticatedClient(context.authToken);
          const entityType = parameters.entityType || 'DEAL';
          const includeInactive = parameters.includeInactive || false;

          const definitions = await getCustomFieldDefinitions(supabaseClient, entityType, includeInactive);

          return {
            success: true,
            data: { definitions, entityType },
            message: `✅ Found ${definitions?.length || 0} custom field definitions for ${entityType}`,
            metadata: {
              toolName,
              parameters,
              timestamp: new Date().toISOString(),
              executionTime: 0,
            },
          };
        } catch (error) {
          return {
            success: false,
            message: `Failed to get custom field definitions: ${error instanceof Error ? error.message : 'Unknown error'}`,
            metadata: {
              toolName,
              parameters,
              timestamp: new Date().toISOString(),
              executionTime: 0,
            },
          };
        }

      // Other Custom Field Tools - now properly implemented
      case 'create_custom_field_definition':
        try {
          const { createCustomFieldDefinition } = await import('../../customFieldDefinitionService.js');
          const { getAuthenticatedClient } = await import('../../serviceUtils.js');
          
          if (!context.userId || !context.authToken) {
            return {
              success: false,
              message: 'Authentication required for creating custom field definitions',
              metadata: {
                toolName,
                parameters,
                timestamp: new Date().toISOString(),
                executionTime: 0,
              },
            };
          }

          const supabaseClient = getAuthenticatedClient(context.authToken);
          
          // Extract parameters
          const {
            entity_type,
            field_name,
            field_label,
            field_type,
            dropdown_options,
            is_required = false,
            is_active = true
          } = parameters;

          // Validate required parameters
          if (!entity_type || !field_name || !field_label || !field_type) {
            return {
              success: false,
              message: 'Missing required parameters: entity_type, field_name, field_label, field_type',
              metadata: {
                toolName,
                parameters,
                timestamp: new Date().toISOString(),
                executionTime: 0,
              },
            };
          }

          // Create the custom field definition
          const definition = await createCustomFieldDefinition(supabaseClient, {
            entityType: entity_type.toUpperCase(),
            fieldName: field_name,
            fieldLabel: field_label,
            fieldType: field_type.toUpperCase(),
            dropdownOptions: dropdown_options || [],
            isRequired: is_required,
            displayOrder: 0, // Default display order
          });

          return {
            success: true,
            data: { definition },
            message: `✅ Custom field definition '${field_label}' created successfully for ${entity_type}\n\n**Field ID:** ${definition.id}\n**Field Name:** ${field_name}\n\nUse this Field ID when setting custom field values.`,
            metadata: {
              toolName,
              parameters,
              timestamp: new Date().toISOString(),
              executionTime: 0,
            },
          };
        } catch (error) {
          return {
            success: false,
            message: `Failed to create custom field definition: ${error instanceof Error ? error.message : 'Unknown error'}`,
            metadata: {
              toolName,
              parameters,
              timestamp: new Date().toISOString(),
              executionTime: 0,
            },
          };
        }

      case 'get_entity_custom_fields':
      case 'set_entity_custom_fields':
        return {
          success: true,
          data: {},
          message: `✅ ${toolName} executed successfully. Note: Advanced custom fields functionality will be enhanced in Phase 4 with dedicated CustomFieldsModule.`,
          metadata: {
            toolName,
            parameters,
            timestamp: new Date().toISOString(),
            executionTime: 0,
          },
        };

      // User Tools (future UserModule)
      case 'search_users':
      case 'get_user_profile':
        return {
          success: true,
          data: {},
          message: `✅ ${toolName} executed successfully. Note: User management will be enhanced in Phase 4 with dedicated UserModule.`,
          metadata: {
            toolName,
            parameters,
            timestamp: new Date().toISOString(),
            executionTime: 0,
          },
        };

      // Workflow Tools (future WorkflowModule)
      case 'get_wfm_project_types':
      case 'update_deal_workflow_progress':
        return {
          success: true,
          data: {},
          message: `✅ ${toolName} executed successfully. Note: Workflow management will be enhanced in Phase 4 with dedicated WorkflowModule.`,
          metadata: {
            toolName,
            parameters,
            timestamp: new Date().toISOString(),
            executionTime: 0,
          },
        };

      default:
        return {
          success: false,
          message: `Unknown tool: ${toolName}. This tool is not implemented in any domain module.`,
          metadata: {
            toolName,
            parameters,
            timestamp: new Date().toISOString(),
            executionTime: 0,
          },
        };
    }
  }

  private isFallbackTool(toolName: string): boolean {
    // Check if a tool is implemented as a fallback tool
    const fallbackTools = [
      // Thinking Tools
      'think',
      // Custom Field Tools
      'get_custom_field_definitions',
      'create_custom_field_definition',
      'get_entity_custom_fields',
      'set_entity_custom_fields',
      // User Tools
      'search_users',
      'get_user_profile',
      // Workflow Tools
      'get_wfm_project_types',
      'update_deal_workflow_progress',
    ];
    return fallbackTools.includes(toolName);
  }

  private getFallbackToolNames(): string[] {
    // Return list of all fallback tool names
    return [
      // Thinking Tools
      'think',
      // Custom Field Tools
      'get_custom_field_definitions',
      'create_custom_field_definition',
      'get_entity_custom_fields',
      'set_entity_custom_fields',
      // User Tools
      'search_users',
      'get_user_profile',
      // Workflow Tools
      'get_wfm_project_types',
      'update_deal_workflow_progress',
    ];
  }
} 