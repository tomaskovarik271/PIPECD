import type { ToolExecutionContext, ToolResult } from '../types/tools.js';

/**
 * Base class for V2 tools that interact with GraphQL
 * Provides standardized GraphQL integration, error handling, and response formatting
 */
export abstract class GraphQLTool {
  protected abstract name: string;
  protected abstract description: string;
  protected abstract parameters: any;
  protected abstract requiredPermissions: string[];

  /**
   * Execute GraphQL query with proper error handling and authentication
   */
  protected async executeGraphQL(
    query: string,
    variables: Record<string, any> = {},
    context: ToolExecutionContext
  ): Promise<any> {
    try {
      // In a real implementation, this would use your GraphQL client
      // For now, we'll simulate the structure
      const response = await this.makeGraphQLRequest(query, variables, context);
      
      if (response.errors) {
        throw new Error(`GraphQL errors: ${response.errors.map((e: any) => e.message).join(', ')}`);
      }

      return response.data;
    } catch (error: any) {
      console.error(`GraphQL execution error in ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Mock GraphQL request - replace with actual GraphQL client integration
   */
  private async makeGraphQLRequest(
    query: string,
    variables: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<{ data?: any; errors?: any[] }> {
    // This is where you'd integrate with your actual GraphQL client
    // Example using fetch:
    /*
    const response = await fetch('/.netlify/functions/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.authToken}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    return response.json();
    */

    // For now, return a mock response structure
    console.log(`[MOCK] GraphQL Query: ${query.replace(/\s+/g, ' ').trim()}`);
    console.log(`[MOCK] Variables:`, variables);
    
    return {
      data: {},
      errors: undefined
    };
  }

  /**
   * Standard error result formatting
   */
  protected createErrorResult(
    error: any,
    parameters: Record<string, any>
  ): ToolResult {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      success: false,
      error: {
        code: 'TOOL_EXECUTION_ERROR',
        message: `${this.name} failed: ${errorMessage}`,
        details: { parameters },
        recoverable: true,
        retryable: false,
        suggestedFix: 'Check parameters and try again'
      },
      metadata: {
        executionTime: 0
      }
    };
  }

  /**
   * Standard success result formatting
   */
  protected createSuccessResult(
    data: any,
    message: string,
    parameters: Record<string, any>,
    executionTime: number = 0
  ): ToolResult {
    return {
      success: true,
      data,
      message,
      metadata: {
        executionTime
      }
    };
  }

  /**
   * Validate required parameters
   */
  protected validateRequiredParams(
    parameters: Record<string, any>,
    required: string[]
  ): string[] {
    const errors: string[] = [];
    
    for (const param of required) {
      if (!(param in parameters) || parameters[param] === null || parameters[param] === undefined) {
        errors.push(`Missing required parameter: ${param}`);
      }
    }

    return errors;
  }

  /**
   * Check user permissions for this operation
   */
  protected checkPermissions(context: ToolExecutionContext): boolean {
    if (this.requiredPermissions.length === 0) {
      return true;
    }

    const userPermissions = context.permissions || [];
    return this.requiredPermissions.some(perm => userPermissions.includes(perm));
  }

  /**
   * Main execute method that all tools must implement
   */
  abstract execute(
    parameters: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<ToolResult>;

  /**
   * Get tool definition for registration
   */
  getDefinition() {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
      requiredPermissions: this.requiredPermissions,
      execute: this.execute.bind(this)
    };
  }
} 