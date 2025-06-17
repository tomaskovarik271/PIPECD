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
    // Use relative URL in production environment
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    this.timeout = timeout;
  }

  /**
   * Execute a GraphQL request
   */
  async request(
    request: GraphQLRequest,
    context: ToolExecutionContext
  ): Promise<GraphQLResponse> {
    const startTime = Date.now();

    try {
      const endpoint = `${this.baseUrl}/.netlify/functions/graphql`;
      
      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Request-ID': context.requestId,
        'X-Session-ID': context.sessionId,
        'X-User-ID': context.userId,
      };

      // Add authentication if available
      if (context.authToken) {
        headers['Authorization'] = `Bearer ${context.authToken}`;
      }

      // Prepare request body
      const body = JSON.stringify({
        query: request.query,
        variables: request.variables || {},
        operationName: request.operationName
      });

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      // Make the request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check if request was successful
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse JSON response
      const jsonResponse: GraphQLResponse = await response.json();

      // Log performance metrics
      const executionTime = Date.now() - startTime;
      this.logMetrics(request, executionTime, jsonResponse, context);

      // Handle GraphQL errors
      if (jsonResponse.errors && jsonResponse.errors.length > 0) {
        this.handleGraphQLErrors(jsonResponse.errors, request);
      }

      return jsonResponse;

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      // Handle different types of errors
      if (error.name === 'AbortError') {
        throw new Error(`GraphQL request timeout after ${this.timeout}ms`);
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to GraphQL endpoint');
      }

      // Log error metrics
      this.logError(error, request, executionTime, context);

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