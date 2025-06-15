/**
 * Centralized GraphQL Client for PipeCD AI Agent
 * 
 * Handles all GraphQL execution with centralized:
 * - Authentication
 * - Error handling  
 * - Response formatting
 * - Request retries
 */

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, any>;
  }>;
}

export interface GraphQLClientConfig {
  endpoint: string;
  defaultTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export class GraphQLError extends Error {
  constructor(
    message: string,
    public errors: GraphQLResponse['errors'],
    public response?: Response
  ) {
    super(message);
    this.name = 'GraphQLError';
  }
}

export class GraphQLClient {
  private endpoint: string;
  private defaultTimeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config: GraphQLClientConfig) {
    this.endpoint = config.endpoint;
    this.defaultTimeout = config.defaultTimeout || 120000; // 2 minutes for AI agent operations
    this.retryAttempts = config.retryAttempts || 2;
    this.retryDelay = config.retryDelay || 1000; // 1 second
  }

  /**
   * Execute a GraphQL query or mutation with automatic auth and error handling
   */
  async execute<T = any>(
    query: string,
    variables?: Record<string, any>,
    authToken?: string,
    options?: {
      timeout?: number;
      retries?: number;
    }
  ): Promise<T> {
    const timeout = options?.timeout || this.defaultTimeout;
    const retries = options?.retries !== undefined ? options.retries : this.retryAttempts;

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: this.buildHeaders(authToken),
          body: JSON.stringify({
            query: query.trim(),
            variables: variables || {},
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result: GraphQLResponse<T> = await response.json();
        
        // Handle GraphQL errors
        if (result.errors && result.errors.length > 0) {
          throw new GraphQLError(
            `GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`,
            result.errors,
            response
          );
        }

        if (!result.data) {
          throw new GraphQLError('No data returned from GraphQL query', result.errors);
        }

        return result.data;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry on authentication errors or GraphQL errors
        if (lastError instanceof GraphQLError || 
            lastError.message.includes('401') || 
            lastError.message.includes('403') ||
            lastError.message.includes('UNAUTHENTICATED')) {
          throw lastError;
        }

        // Don't retry on last attempt
        if (attempt === retries) {
          throw lastError;
        }

        // Wait before retry
        await this.delay(this.retryDelay * (attempt + 1));
      }
    }

    throw lastError!;
  }

  /**
   * Execute multiple GraphQL operations in parallel
   */
  async executeBatch<T = any>(
    operations: Array<{
      query: string;
      variables?: Record<string, any>;
      operationName?: string;
    }>,
    authToken?: string
  ): Promise<T[]> {
    const promises = operations.map(op => 
      this.execute<T>(op.query, op.variables, authToken)
    );

    return Promise.all(promises);
  }

  /**
   * Build request headers with authentication
   */
  private buildHeaders(authToken?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return headers;
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get endpoint URL (for debugging)
   */
  getEndpoint(): string {
    return this.endpoint;
  }

  /**
   * Create a new client with different configuration
   */
  withConfig(config: Partial<GraphQLClientConfig>): GraphQLClient {
    return new GraphQLClient({
      endpoint: config.endpoint || this.endpoint,
      defaultTimeout: config.defaultTimeout || this.defaultTimeout,
      retryAttempts: config.retryAttempts || this.retryAttempts,
      retryDelay: config.retryDelay || this.retryDelay,
    });
  }
} 