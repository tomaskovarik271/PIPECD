import type { ToolExecutionContext } from '../types/tools.js';

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

export interface GraphQLResponse {
  data?: any;
  errors?: GraphQLError[];
  extensions?: Record<string, any>;
}

export interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: Array<string | number>;
  extensions?: Record<string, any>;
}

/**
 * Real GraphQL Client for PipeCD
 * 
 * This client connects to PipeCD's actual GraphQL endpoint at /.netlify/functions/graphql
 * and handles authentication, error handling, and response parsing.
 */
export class RealGraphQLClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = '', timeout: number = 30000) {
    // In development (Node.js environment), use localhost:8888
    // In production (browser environment), use window.location.origin
    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (typeof window !== 'undefined') {
      // Browser environment - use current origin
      this.baseUrl = window.location.origin;
    } else {
      // Node.js environment (development) - use netlify dev URL
      this.baseUrl = 'http://localhost:8888';
    }
    this.timeout = timeout;
  }

  /**
   * Real GraphQL request using PipeCD's GraphQL client
   */
  private async makeGraphQLRequest(
    query: string,
    variables: Record<string, any>,
    context: ToolExecutionContext
  ): Promise<{ data?: any; errors?: any[] }> {
    try {
      const endpoint = `${this.baseUrl}/.netlify/functions/graphql`;
      
      // Prepare headers - simple approach like V1
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add authentication if available
      if (context.authToken) {
        headers['Authorization'] = `Bearer ${context.authToken}`;
      }

      // Make the request - simple approach like V1
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: query.trim(),
          variables: variables || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        data: result.data,
        errors: result.errors
      };
    } catch (error: any) {
      // Convert client errors to GraphQL error format
      return {
        data: null,
        errors: [{
          message: error.message,
          extensions: {
            code: 'CLIENT_ERROR'
          }
        }]
      };
    }
  }

  /**
   * Execute a GraphQL request
   */
  async request(
    request: GraphQLRequest,
    context: ToolExecutionContext
  ): Promise<GraphQLResponse> {
    try {
      // Use the simplified makeGraphQLRequest method
      const result = await this.makeGraphQLRequest(request.query, request.variables || {}, context);
      
      if (result.errors && result.errors.length > 0) {
        this.handleGraphQLErrors(result.errors, request);
      }

      return {
        data: result.data,
        errors: result.errors
      };

    } catch (error: any) {
      console.error('GraphQL Request Error:', {
        error: error.message,
        query: request.query.substring(0, 200) + '...',
        variables: request.variables,
        userId: context.userId
      });

      throw error;
    }
  }

  /**
   * Execute a query operation
   */
  async query(
    query: string,
    variables?: Record<string, any>,
    context?: ToolExecutionContext
  ): Promise<any> {
    if (!context) {
      throw new Error('Execution context is required for GraphQL queries');
    }

    const response = await this.request({ query, variables }, context);
    
    if (response.errors) {
      throw new Error(`GraphQL errors: ${response.errors.map(e => e.message).join(', ')}`);
    }

    return response.data;
  }

  /**
   * Execute a mutation operation
   */
  async mutate(
    mutation: string,
    variables?: Record<string, any>,
    context?: ToolExecutionContext
  ): Promise<any> {
    if (!context) {
      throw new Error('Execution context is required for GraphQL mutations');
    }

    const response = await this.request({ query: mutation, variables }, context);
    
    if (response.errors) {
      throw new Error(`GraphQL errors: ${response.errors.map(e => e.message).join(', ')}`);
    }

    return response.data;
  }

  /**
   * Handle GraphQL errors with context
   */
  private handleGraphQLErrors(errors: GraphQLError[], request: GraphQLRequest): void {
    // Log errors for debugging
    console.error('GraphQL Errors:', {
      query: request.query.substring(0, 200) + '...',
      variables: request.variables,
      errors: errors.map(error => ({
        message: error.message,
        path: error.path,
        locations: error.locations
      }))
    });

    // Check for specific error types
    for (const error of errors) {
      // Authentication errors
      if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
        throw new Error('Authentication required: Please ensure you are logged in');
      }

      // Permission errors
      if (error.message.includes('permission') || error.message.includes('forbidden')) {
        throw new Error(`Permission denied: ${error.message}`);
      }

      // Validation errors
      if (error.message.includes('validation') || error.message.includes('invalid')) {
        throw new Error(`Validation error: ${error.message}`);
      }

      // Not found errors
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        throw new Error(`Resource not found: ${error.message}`);
      }
    }

    // Generic error handling
    const errorMessages = errors.map(e => e.message).join(', ');
    throw new Error(`GraphQL execution failed: ${errorMessages}`);
  }

  /**
   * Log performance metrics
   */
  private logMetrics(
    request: GraphQLRequest,
    executionTime: number,
    response: GraphQLResponse,
    context: ToolExecutionContext
  ): void {
    // Only log in development or if verbose logging is enabled
    if (process.env.NODE_ENV === 'development' || process.env.GRAPHQL_VERBOSE_LOGGING === 'true') {
      console.log('GraphQL Request Metrics:', {
        operationType: this.detectOperationType(request.query),
        executionTime: `${executionTime}ms`,
        hasErrors: !!(response.errors && response.errors.length > 0),
        dataSize: response.data ? JSON.stringify(response.data).length : 0,
        userId: context.userId,
        requestId: context.requestId
      });
    }
  }

  /**
   * Log error information
   */
  private logError(
    error: Error,
    request: GraphQLRequest,
    executionTime: number,
    context: ToolExecutionContext
  ): void {
    console.error('GraphQL Request Error:', {
      error: error.message,
      operationType: this.detectOperationType(request.query),
      executionTime: `${executionTime}ms`,
      query: request.query.substring(0, 200) + '...',
      variables: request.variables,
      userId: context.userId,
      requestId: context.requestId
    });
  }

  /**
   * Detect operation type from query string
   */
  private detectOperationType(query: string): string {
    const trimmed = query.trim().toLowerCase();
    
    if (trimmed.startsWith('query')) return 'query';
    if (trimmed.startsWith('mutation')) return 'mutation';
    if (trimmed.startsWith('subscription')) return 'subscription';
    
    // Default to query if no explicit type
    return 'query';
  }

  /**
   * Health check for GraphQL endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      const healthQuery = `
        query HealthCheck {
          __schema {
            queryType {
              name
            }
          }
        }
      `;

      // Create a minimal context for health check
      const context: ToolExecutionContext = {
        userId: 'system',
        sessionId: 'health-check',
        permissions: [],
        authToken: '',
        requestId: `health-${Date.now()}`,
        toolCallId: 'health-check'
      };

      const response = await this.request({ query: healthQuery }, context);
      return !!(response.data && response.data.__schema);
    } catch (error) {
      console.error('GraphQL Health Check Failed:', error);
      return false;
    }
  }

  /**
   * Get server information
   */
  async getServerInfo(): Promise<any> {
    const infoQuery = `
      query ServerInfo {
        __schema {
          queryType {
            name
            fields {
              name
            }
          }
          mutationType {
            name
            fields {
              name
            }
          }
        }
      }
    `;

    const context: ToolExecutionContext = {
      userId: 'system',
      sessionId: 'server-info',
      permissions: [],
      authToken: '',
      requestId: `info-${Date.now()}`,
      toolCallId: 'server-info'
    };

    const response = await this.request({ query: infoQuery }, context);
    return response.data;
  }
}

// Export singleton instance
export const graphqlClient = new RealGraphQLClient(); 