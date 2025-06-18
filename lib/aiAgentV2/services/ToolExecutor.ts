import type {
  Tool,
  ToolCall,
  ToolResult,
  ToolExecutionContext,
  ToolValidationResult
} from '../types/tools.js';
import type { BusinessRule } from '../types/system.js';
import { PipeCDRulesEngine } from '../core/PipeCDRulesEngine.js';
import { ToolRegistryV2 } from '../tools/ToolRegistryV2.js';

export class ToolExecutor {
  private registeredTools: Map<string, Tool> = new Map();
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
    const tool = this.registeredTools.get(toolName);
    if (!tool) {
      return this.createErrorResult(`Tool "${toolName}" not found`, 'tool_not_found');
    }

    // Validate parameters
    const validation = this.validateToolCall(tool, parameters, context);
    if (!validation.valid) {
      return this.createErrorResult(
        `Parameter validation failed: ${validation.errors.join(', ')}`,
        'validation_error'
      );
    }

    // Check business rules
    const rulesCheck = await this.checkBusinessRules(toolName, parameters, context);
    if (!rulesCheck.allowed) {
      return this.createErrorResult(
        `Business rule violation: ${rulesCheck.reason}`,
        'business_rule_violation'
      );
    }

    // Execute tool with retry logic
    return await this.executeWithRetry(tool, parameters, context);
  }

  async executeMultipleTools(
    toolCalls: ToolCall[],
    context: ToolExecutionContext
  ): Promise<ToolResult[]> {
    const results: ToolResult[] = [];
    const updatedContext = { ...context };

    for (const toolCall of toolCalls) {
      try {
        const result = await this.executeTool(
          toolCall.tool,
          toolCall.parameters,
          updatedContext
        );

        results.push(result);

        // Update context with result for subsequent tools
        if (result.success && result.data) {
          updatedContext.previousResults = updatedContext.previousResults || {};
          updatedContext.previousResults[toolCall.tool] = result.data;
        }

        // If any tool fails critically, stop execution
        if (!result.success && result.metadata?.severity === 'critical') {
          break;
        }

      } catch (error: any) {
        results.push(this.createErrorResult(
          `Tool execution failed: ${error.message}`,
          'execution_error'
        ));
        break;
      }
    }

    return results;
  }

  private async executeWithRetry(
    tool: Tool,
    parameters: Record<string, any>,
    context: ToolExecutionContext,
    attempt: number = 1
  ): Promise<ToolResult> {
    try {
      // Execute with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Tool execution timeout')), this.executionTimeout);
      });

      const executionPromise = this.performToolExecution(tool, parameters, context);
      const result = await Promise.race([executionPromise, timeoutPromise]);

      // Record successful execution
      this.recordExecution(context.sessionId, tool.name, parameters, result);

      return result;

    } catch (error: any) {
      // Check if retry is appropriate
      if (attempt < this.maxRetryAttempts && this.isRetryableError(error)) {
        console.log(`Retrying tool ${tool.name}, attempt ${attempt + 1}`);
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );

        return this.executeWithRetry(tool, parameters, context, attempt + 1);
      }

      // Record failed execution
      const errorResult = this.createErrorResult(
        error.message || 'Unknown execution error',
        'execution_error'
      );
      this.recordExecution(context.sessionId, tool.name, parameters, errorResult);

      return errorResult;
    }
  }

  private async performToolExecution(
    tool: Tool,
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      // Execute the tool
      const result = await tool.execute(parameters, context);
      
      const executionTime = Date.now() - startTime;

      return {
        ...result,
        metadata: {
          ...result.metadata,
          executionTime,
          toolName: tool.name,
          source: 'tool_executor_v2'
        }
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error.message || 'Tool execution failed',
        metadata: {
          executionTime,
          toolName: tool.name,
          source: 'tool_executor_v2',
          severity: this.determineErrorSeverity(error)
        }
      };
    }
  }

  private validateToolCall(
    tool: Tool,
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): ToolValidationResult {
    const errors: string[] = [];

    // Check required parameters
    if (tool.parameters?.required) {
      for (const requiredParam of tool.parameters.required) {
        if (!(requiredParam in parameters)) {
          errors.push(`Missing required parameter: ${requiredParam}`);
        }
      }
    }

    // Check parameter types
    if (tool.parameters?.properties) {
      for (const [paramName, paramValue] of Object.entries(parameters)) {
        const paramSchema = tool.parameters.properties[paramName];
        if (paramSchema && !this.validateParameterType(paramValue, paramSchema)) {
          errors.push(`Invalid type for parameter ${paramName}`);
        }
      }
    }

    // Check user permissions
    if (tool.requiredPermissions) {
      const userPermissions = context.userPermissions || [];
      const missingPermissions = tool.requiredPermissions.filter(
        perm => !userPermissions.includes(perm)
      );
      
      if (missingPermissions.length > 0) {
        errors.push(`Missing permissions: ${missingPermissions.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private validateParameterType(value: any, schema: any): boolean {
    if (schema.type === 'string') {
      return typeof value === 'string';
    } else if (schema.type === 'number') {
      return typeof value === 'number' && !isNaN(value);
    } else if (schema.type === 'boolean') {
      return typeof value === 'boolean';
    } else if (schema.type === 'array') {
      return Array.isArray(value);
    } else if (schema.type === 'object') {
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
    return true; // Allow unknown types
  }

  private async checkBusinessRules(
    toolName: string,
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const relevantRules = await this.rulesEngine.getRelevantRules({
        messageHistory: [],
        systemState: context.systemState,
        currentObjective: `Execute tool: ${toolName}`
      });

      // Check critical rules that might block tool execution
      const criticalRules = relevantRules.filter(rule => 
        rule.priority === 'critical' && rule.category === 'data_handling'
      );

      for (const rule of criticalRules) {
        const violation = this.checkRuleViolation(rule, toolName, parameters, context);
        if (violation) {
          return { allowed: false, reason: violation };
        }
      }

      return { allowed: true };

    } catch (error) {
      console.error('Error checking business rules:', error);
      return { allowed: true }; // Allow execution if rule check fails
    }
  }

  private checkRuleViolation(
    rule: BusinessRule,
    toolName: string,
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): string | null {
    // Specific rule checks
    if (rule.rule.includes('search before create') && toolName.startsWith('create_')) {
      // Check if a corresponding search was performed recently
      const searchTools = ['search_organizations', 'search_people', 'search_deals'];
      const recentHistory = this.getRecentExecutionHistory(context.sessionId, 5);
      
      if (!recentHistory.some(call => searchTools.includes(call.tool))) {
        return 'Must search for existing entities before creating new ones';
      }
    }

    if (rule.rule.includes('dropdown data') && 
        ['create_deal', 'create_lead'].includes(toolName)) {
      const recentHistory = this.getRecentExecutionHistory(context.sessionId, 5);
      
      if (!recentHistory.some(call => call.tool === 'get_dropdown_data')) {
        return 'Must load dropdown data before creating entities with relationships';
      }
    }

    return null;
  }

  private isRetryableError(error: any): boolean {
    // Network/timeout errors are retryable
    if (error.message?.includes('timeout') || 
        error.message?.includes('network') ||
        error.message?.includes('connection')) {
      return true;
    }

    // Rate limit errors are retryable
    if (error.message?.includes('rate limit') || 
        error.message?.includes('too many requests')) {
      return true;
    }

    // Temporary server errors are retryable
    if (error.code >= 500 && error.code < 600) {
      return true;
    }

    return false;
  }

  private determineErrorSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    if (error.message?.includes('permission') ||
        error.message?.includes('unauthorized')) {
      return 'high';
    }

    if (error.message?.includes('validation') ||
        error.message?.includes('invalid parameter')) {
      return 'medium';
    }

    if (error.message?.includes('not found')) {
      return 'low';
    }

    if (error.message?.includes('timeout') ||
        error.message?.includes('system error')) {
      return 'critical';
    }

    return 'medium';
  }

  private createErrorResult(message: string, type: string): ToolResult {
    return {
      success: false,
      error: message,
      metadata: {
        executionTime: 0,
        source: 'tool_executor_v2',
        errorType: type,
        severity: this.determineErrorSeverity({ message }) as any
      }
    };
  }

  private recordExecution(
    sessionId: string,
    toolName: string,
    parameters: Record<string, any>,
    result: ToolResult
  ): void {
    if (!this.executionHistory.has(sessionId)) {
      this.executionHistory.set(sessionId, []);
    }

    const history = this.executionHistory.get(sessionId)!;
    
    const toolCall: ToolCall = {
      id: this.generateCallId(),
      tool: toolName,
      parameters,
      reasoning: parameters.reasoning || '',
      timestamp: new Date()
    };

    history.push(toolCall);

    // Keep only last 50 calls per session
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  private getRecentExecutionHistory(sessionId: string, count: number): ToolCall[] {
    const history = this.executionHistory.get(sessionId) || [];
    return history.slice(-count);
  }

  private generateCallId(): string {
    return `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Tool registration methods
  registerTool(tool: Tool): void {
    this.registeredTools.set(tool.name, tool);
  }

  unregisterTool(toolName: string): boolean {
    return this.registeredTools.delete(toolName);
  }

  getRegisteredTools(): string[] {
    return Array.from(this.registeredTools.keys());
  }

  async getAvailableTools(userId: string): Promise<Tool[]> {
    // Return all registered tools for now
    // In the future, this could filter based on user permissions
    return Array.from(this.registeredTools.values());
  }

  getToolDefinition(toolName: string): Tool | undefined {
    return this.registeredTools.get(toolName);
  }

  // Tool execution context management
  createExecutionContext(
    sessionId: string,
    userId: string,
    userPermissions: string[],
    additionalContext?: Record<string, any>
  ): ToolExecutionContext {
    return {
      sessionId,
      userId,
      userPermissions,
      timestamp: new Date(),
      conversationTurn: this.getConversationTurn(sessionId),
      previousResults: {},
      systemState: undefined, // Will be populated by AgentService
      ...additionalContext
    };
  }

  private getConversationTurn(sessionId: string): number {
    const history = this.executionHistory.get(sessionId) || [];
    return history.length;
  }

  // Analytics and monitoring
  getExecutionMetrics(sessionId?: string): {
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    toolUsageStats: Record<string, number>;
    errorStats: Record<string, number>;
  } {
    let allCalls: ToolCall[] = [];
    
    if (sessionId) {
      allCalls = this.executionHistory.get(sessionId) || [];
    } else {
      for (const calls of this.executionHistory.values()) {
        allCalls.push(...calls);
      }
    }

    const toolUsageStats: Record<string, number> = {};
    const errorStats: Record<string, number> = {};
    let totalExecutionTime = 0;
    let successCount = 0;

    for (const call of allCalls) {
      toolUsageStats[call.tool] = (toolUsageStats[call.tool] || 0) + 1;
      
      // Note: We'd need to store execution results to get actual metrics
      // This is a simplified version
    }

    return {
      totalExecutions: allCalls.length,
      successRate: allCalls.length > 0 ? successCount / allCalls.length : 0,
      averageExecutionTime: allCalls.length > 0 ? totalExecutionTime / allCalls.length : 0,
      toolUsageStats,
      errorStats
    };
  }

  // Cleanup
  clearSessionHistory(sessionId: string): boolean {
    return this.executionHistory.delete(sessionId);
  }

  clearOldHistory(olderThanMinutes: number = 60): number {
    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    let cleared = 0;

    for (const [sessionId, calls] of this.executionHistory) {
      const recentCalls = calls.filter(call => call.timestamp > cutoffTime);
      
      if (recentCalls.length === 0) {
        this.executionHistory.delete(sessionId);
        cleared++;
      } else if (recentCalls.length < calls.length) {
        this.executionHistory.set(sessionId, recentCalls);
      }
    }

    return cleared;
  }

  private initializeTools(): void {
    // Register V2 tools directly
    try {
      // Import and register all V2 tools
      import('../tools/SearchDealsTool.js').then(module => {
        const tool = new module.SearchDealsTool();
        this.registeredTools.set('search_deals', tool);
      });
      
      import('../tools/SearchOrganizationsTool.js').then(module => {
        const tool = new module.SearchOrganizationsTool();
        this.registeredTools.set('search_organizations', tool);
      });
      
      import('../tools/SearchContactsTool.js').then(module => {
        const tool = new module.SearchContactsTool();
        this.registeredTools.set('search_contacts', tool);
      });
      
      import('../tools/CreateDealTool.js').then(module => {
        const tool = new module.CreateDealTool();
        this.registeredTools.set('create_deal', tool);
      });
      
      import('../tools/CreateOrganizationTool.js').then(module => {
        const tool = new module.CreateOrganizationTool();
        this.registeredTools.set('create_organization', tool);
      });
      
      import('../tools/CreateContactTool.js').then(module => {
        const tool = new module.CreateContactTool();
        this.registeredTools.set('create_contact', tool);
      });
      
      import('../tools/GetDetailsTool.js').then(module => {
        const tool = new module.GetDetailsTool();
        this.registeredTools.set('get_details', tool);
      });
      
      import('../tools/GetDropdownDataTool.js').then(module => {
        const tool = new module.GetDropdownDataTool();
        this.registeredTools.set('get_dropdown_data', tool);
      });
      
      import('../tools/ThinkingTool.js').then(module => {
        const tool = new module.ThinkingTool();
        this.registeredTools.set('think', tool);
      });
      
      console.log('[ToolExecutor] V2 tools registration initiated');
    } catch (error) {
      console.error('[ToolExecutor] Error registering V2 tools:', error);
    }
  }
} 