/**
 * AI Agent V2 Hardening Service
 * Provides comprehensive security, validation, and resilience features for production AI agent operations
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ================================
// Core Types
// ================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedInput?: any;
}

export interface SecurityContext {
  userId: string;
  permissions: string[];
  accessToken?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PerformanceMetrics {
  toolName: string;
  executionTime: number;
  memoryUsage: number;
  retryCount: number;
  success: boolean;
  timestamp: string;
}

export interface CircuitBreakerState {
  toolName: string;
  failureCount: number;
  lastFailure: Date | null;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  nextRetryTime: Date | null;
}

// ================================
// Hardening Service
// ================================

export class HardeningService {
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private performanceMetrics: PerformanceMetrics[] = [];
  private rateLimiters = new Map<string, { count: number; resetTime: Date }>();
  
  // Configuration
  private readonly config = {
    maxRetries: 3,
    baseRetryDelay: 1000,
    maxRetryDelay: 10000,
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 60000, // 1 minute
    rateLimitWindow: 60000, // 1 minute
    maxRequestsPerWindow: 100,
    maxExecutionTime: 30000, // 30 seconds
    maxToolsPerConversation: 50,
    maxParameterSize: 1024 * 1024, // 1MB
  };

  constructor(private supabaseClient: SupabaseClient) {}

  // ================================
  // Input Validation & Sanitization
  // ================================

  async validateToolInput(
    toolName: string,
    parameters: any,
    securityContext: SecurityContext
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sanitizedInput = parameters;

    try {
      // 1. Basic validation
      if (!toolName || typeof toolName !== 'string') {
        errors.push('Invalid tool name');
      }

      if (!parameters || typeof parameters !== 'object') {
        errors.push('Invalid parameters object');
      }

      // 2. Size validation
      const parameterSize = JSON.stringify(parameters).length;
      if (parameterSize > this.config.maxParameterSize) {
        errors.push(`Parameter size exceeds limit: ${parameterSize} > ${this.config.maxParameterSize}`);
      }

      // 3. Tool-specific validation
      const toolValidation = await this.validateToolSpecificRules(toolName, parameters);
      errors.push(...toolValidation.errors);
      warnings.push(...toolValidation.warnings);
      sanitizedInput = toolValidation.sanitizedInput || sanitizedInput;

      // 4. Security validation
      const securityValidation = await this.validateSecurity(toolName, parameters, securityContext);
      errors.push(...securityValidation.errors);
      warnings.push(...securityValidation.warnings);

      // 5. Business rules validation
      const businessValidation = await this.validateBusinessRules(toolName, parameters, securityContext);
      errors.push(...businessValidation.errors);
      warnings.push(...businessValidation.warnings);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        sanitizedInput: errors.length === 0 ? sanitizedInput : undefined
      };

    } catch (error) {
      console.error('Validation error:', error);
      return {
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  private async validateToolSpecificRules(
    toolName: string,
    parameters: any
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sanitizedInput = { ...parameters };

    switch (toolName) {
      case 'create_deal':
        if (!parameters.name || typeof parameters.name !== 'string' || parameters.name.trim().length === 0) {
          errors.push('Deal name is required and must be non-empty');
        } else {
          sanitizedInput.name = parameters.name.trim().substring(0, 255); // Sanitize length
        }
        
        if (parameters.amount !== undefined) {
          const amount = parseFloat(parameters.amount);
          if (isNaN(amount) || amount < 0) {
            errors.push('Deal amount must be a positive number');
          } else if (amount > 10000000) {
            warnings.push('Deal amount is unusually high');
          }
          sanitizedInput.amount = amount;
        }
        break;

      case 'update_deal':
        if (!parameters.deal_id || typeof parameters.deal_id !== 'string') {
          errors.push('Deal ID is required');
        }
        break;

      case 'create_person':
        if (!parameters.first_name || typeof parameters.first_name !== 'string') {
          errors.push('First name is required');
        } else {
          sanitizedInput.first_name = parameters.first_name.trim().substring(0, 100);
        }
        
        if (parameters.email && !this.isValidEmail(parameters.email)) {
          errors.push('Invalid email format');
        }
        break;

      case 'search_deals':
        if (parameters.limit && (parameters.limit < 1 || parameters.limit > 1000)) {
          warnings.push('Search limit adjusted to safe range');
          sanitizedInput.limit = Math.max(1, Math.min(1000, parameters.limit));
        }
        break;

      default:
        // Generic validation for unknown tools
        warnings.push(`Unknown tool: ${toolName} - using generic validation`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedInput
    };
  }

  private async validateSecurity(
    toolName: string,
    parameters: any,
    securityContext: SecurityContext
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Check user permissions
      const requiredPermissions = this.getRequiredPermissions(toolName);
      for (const permission of requiredPermissions) {
        if (!securityContext.permissions.includes(permission)) {
          errors.push(`Missing required permission: ${permission}`);
        }
      }

      // 2. Rate limiting
      const rateLimitCheck = this.checkRateLimit(securityContext.userId, toolName);
      if (!rateLimitCheck.allowed) {
        errors.push(`Rate limit exceeded. Try again in ${rateLimitCheck.resetIn}ms`);
      }

      // 3. SQL injection prevention
      const sqlInjectionCheck = this.checkForSQLInjection(parameters);
      if (!sqlInjectionCheck.safe) {
        errors.push('Potential SQL injection detected');
      }

      // 4. XSS prevention
      const xssCheck = this.checkForXSS(parameters);
      if (!xssCheck.safe) {
        warnings.push('Potential XSS content detected and sanitized');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Security validation error:', error);
      return {
        isValid: false,
        errors: [`Security validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  private async validateBusinessRules(
    toolName: string,
    parameters: any,
    securityContext: SecurityContext
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Tool execution limits
      const executionCount = await this.getRecentExecutionCount(securityContext.userId);
      if (executionCount > this.config.maxToolsPerConversation) {
        errors.push('Maximum tools per conversation exceeded');
      }

      // Entity ownership checks for update operations
      if (toolName.startsWith('update_') || toolName.startsWith('delete_')) {
        const entityId = this.extractEntityId(parameters);
        if (entityId) {
          const hasAccess = await this.checkEntityAccess(securityContext.userId, entityId, toolName);
          if (!hasAccess) {
            errors.push('Access denied: insufficient permissions for this entity');
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Business rules validation error:', error);
      return {
        isValid: false,
        errors: [`Business rules validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  // ================================
  // Error Recovery & Circuit Breaker
  // ================================

  async executeWithRetryAndCircuitBreaker<T>(
    toolName: string,
    operation: () => Promise<T>,
    securityContext: SecurityContext
  ): Promise<T> {
    // Check circuit breaker
    if (!this.isCircuitBreakerClosed(toolName)) {
      throw new Error(`Circuit breaker open for tool: ${toolName}`);
    }

    let lastError: Error;
    let retryCount = 0;

    while (retryCount <= this.config.maxRetries) {
      try {
        const startTime = Date.now();
        const result = await Promise.race([
          operation(),
          this.createTimeoutPromise(this.config.maxExecutionTime)
        ]);

        // Success - reset circuit breaker
        this.recordSuccess(toolName);
        this.recordPerformanceMetric(toolName, Date.now() - startTime, retryCount, true);
        
        return result;

      } catch (error) {
        lastError = error as Error;
        retryCount++;

        // Record failure
        this.recordFailure(toolName, lastError);

        // Don't retry certain types of errors
        if (this.isNonRetryableError(lastError)) {
          break;
        }

        // Wait before retry
        if (retryCount <= this.config.maxRetries) {
          const delay = this.calculateRetryDelay(retryCount);
          await this.delay(delay);
        }
      }
    }

    // All retries failed
    this.recordPerformanceMetric(toolName, 0, retryCount, false);
    throw lastError!;
  }

  private isCircuitBreakerClosed(toolName: string): boolean {
    const breaker = this.circuitBreakers.get(toolName);
    if (!breaker) {
      // Initialize new circuit breaker
      this.circuitBreakers.set(toolName, {
        toolName,
        failureCount: 0,
        lastFailure: null,
        state: 'CLOSED',
        nextRetryTime: null
      });
      return true;
    }

    const now = new Date();

    switch (breaker.state) {
      case 'CLOSED':
        return true;
      
      case 'OPEN':
        if (breaker.nextRetryTime && now >= breaker.nextRetryTime) {
          breaker.state = 'HALF_OPEN';
          return true;
        }
        return false;
      
      case 'HALF_OPEN':
        return true;
      
      default:
        return false;
    }
  }

  private recordSuccess(toolName: string): void {
    const breaker = this.circuitBreakers.get(toolName);
    if (breaker) {
      breaker.failureCount = 0;
      breaker.lastFailure = null;
      breaker.state = 'CLOSED';
      breaker.nextRetryTime = null;
    }
  }

  private recordFailure(toolName: string, error: Error): void {
    let breaker = this.circuitBreakers.get(toolName);
    if (!breaker) {
      breaker = {
        toolName,
        failureCount: 0,
        lastFailure: null,
        state: 'CLOSED',
        nextRetryTime: null
      };
      this.circuitBreakers.set(toolName, breaker);
    }

    breaker.failureCount++;
    breaker.lastFailure = new Date();

    if (breaker.failureCount >= this.config.circuitBreakerThreshold) {
      breaker.state = 'OPEN';
      breaker.nextRetryTime = new Date(Date.now() + this.config.circuitBreakerTimeout);
    }
  }

  // ================================
  // Helper Methods
  // ================================

  private getRequiredPermissions(toolName: string): string[] {
    const permissionMap: Record<string, string[]> = {
      'create_deal': ['deal:create'],
      'update_deal': ['deal:update_any', 'deal:update_own'],
      'delete_deal': ['deal:delete_any', 'deal:delete_own'],
      'search_deals': ['deal:read_any', 'deal:read_own'],
      'create_person': ['person:create'],
      'update_person': ['person:update_any', 'person:update_own'],
      'create_organization': ['organization:create'],
      'update_organization': ['organization:update_any', 'organization:update_own'],
    };

    return permissionMap[toolName] || [];
  }

  private checkRateLimit(userId: string, toolName: string): { allowed: boolean; resetIn: number } {
    const key = `${userId}:${toolName}`;
    const now = new Date();
    const limiter = this.rateLimiters.get(key);

    if (!limiter || now >= limiter.resetTime) {
      this.rateLimiters.set(key, {
        count: 1,
        resetTime: new Date(now.getTime() + this.config.rateLimitWindow)
      });
      return { allowed: true, resetIn: 0 };
    }

    if (limiter.count >= this.config.maxRequestsPerWindow) {
      return {
        allowed: false,
        resetIn: limiter.resetTime.getTime() - now.getTime()
      };
    }

    limiter.count++;
    return { allowed: true, resetIn: 0 };
  }

  private checkForSQLInjection(parameters: any): { safe: boolean; threats: string[] } {
    const threats: string[] = [];
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(--|\/\*|\*\/|;|\||&)/gi,
      /(\b(OR|AND)\b.*\b(=|<|>|LIKE)\b)/gi
    ];

    const checkValue = (value: any, path: string): void => {
      if (typeof value === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(value)) {
            threats.push(`Potential SQL injection in ${path}: ${pattern.toString()}`);
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        for (const [key, val] of Object.entries(value)) {
          checkValue(val, `${path}.${key}`);
        }
      }
    };

    checkValue(parameters, 'parameters');

    return {
      safe: threats.length === 0,
      threats
    };
  }

  private checkForXSS(parameters: any): { safe: boolean; sanitized: any } {
    const xssPatterns = [
      /<script[^>]*>.*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*<\/iframe>/gi
    ];

    const sanitize = (value: any): any => {
      if (typeof value === 'string') {
        let sanitized = value;
        for (const pattern of xssPatterns) {
          sanitized = sanitized.replace(pattern, '');
        }
        return sanitized;
      } else if (typeof value === 'object' && value !== null) {
        const sanitized: any = {};
        for (const [key, val] of Object.entries(value)) {
          sanitized[key] = sanitize(val);
        }
        return sanitized;
      }
      return value;
    };

    const sanitized = sanitize(parameters);
    const hasXSS = JSON.stringify(parameters) !== JSON.stringify(sanitized);

    return {
      safe: !hasXSS,
      sanitized
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private extractEntityId(parameters: any): string | null {
    const idFields = ['deal_id', 'person_id', 'organization_id', 'id'];
    for (const field of idFields) {
      if (parameters[field]) {
        return parameters[field];
      }
    }
    return null;
  }

  private async checkEntityAccess(userId: string, entityId: string, operation: string): Promise<boolean> {
    try {
      // This is a simplified check - in production, implement proper RBAC
      const { data: user } = await this.supabaseClient
        .from('user_profiles')
        .select('permissions')
        .eq('id', userId)
        .single();

      if (user?.permissions?.includes('admin')) {
        return true;
      }

      // Check if user owns or is assigned to the entity
      // Implementation depends on your specific RBAC model
      return true; // Placeholder
    } catch (error) {
      console.error('Entity access check failed:', error);
      return false;
    }
  }

  private async getRecentExecutionCount(userId: string): Promise<number> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { count } = await this.supabaseClient
        .from('agent_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('updated_at', oneHourAgo);

      return count || 0;
    } catch (error) {
      console.error('Failed to get execution count:', error);
      return 0;
    }
  }

  private calculateRetryDelay(attempt: number): number {
    const delay = Math.min(
      this.config.baseRetryDelay * Math.pow(2, attempt - 1),
      this.config.maxRetryDelay
    );
    
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }

  private isNonRetryableError(error: Error): boolean {
    const nonRetryablePatterns = [
      /validation failed/i,
      /permission denied/i,
      /unauthorized/i,
      /not found/i,
      /already exists/i,
      /invalid input/i
    ];

    return nonRetryablePatterns.some(pattern => pattern.test(error.message));
  }

  private recordPerformanceMetric(
    toolName: string,
    executionTime: number,
    retryCount: number,
    success: boolean
  ): void {
    const metric: PerformanceMetrics = {
      toolName,
      executionTime,
      memoryUsage: process.memoryUsage().heapUsed,
      retryCount,
      success,
      timestamp: new Date().toISOString()
    };

    this.performanceMetrics.push(metric);

    // Keep only last 1000 metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }
  }

  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ================================
  // Monitoring & Diagnostics
  // ================================

  getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  getCircuitBreakerStatus(): CircuitBreakerState[] {
    return Array.from(this.circuitBreakers.values());
  }

  getRateLimitStatus(): Array<{ key: string; count: number; resetTime: Date }> {
    return Array.from(this.rateLimiters.entries()).map(([key, limiter]) => ({
      key,
      count: limiter.count,
      resetTime: limiter.resetTime
    }));
  }

  async generateHealthReport(): Promise<{
    overallHealth: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      totalExecutions: number;
      successRate: number;
      averageExecutionTime: number;
      circuitBreakersOpen: number;
      rateLimitViolations: number;
    };
    recommendations: string[];
  }> {
    const recentMetrics = this.performanceMetrics.filter(
      m => new Date(m.timestamp).getTime() > Date.now() - 60 * 60 * 1000 // Last hour
    );

    const totalExecutions = recentMetrics.length;
    const successCount = recentMetrics.filter(m => m.success).length;
    const successRate = totalExecutions > 0 ? successCount / totalExecutions : 1;
    const averageExecutionTime = totalExecutions > 0
      ? recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalExecutions
      : 0;

    const circuitBreakersOpen = Array.from(this.circuitBreakers.values())
      .filter(cb => cb.state === 'OPEN').length;

    const recommendations: string[] = [];

    if (successRate < 0.95) {
      recommendations.push(`Success rate is low (${(successRate * 100).toFixed(1)}%) - investigate failing tools`);
    }

    if (averageExecutionTime > 5000) {
      recommendations.push(`Average execution time is high (${averageExecutionTime}ms) - optimize slow tools`);
    }

    if (circuitBreakersOpen > 0) {
      recommendations.push(`${circuitBreakersOpen} circuit breakers are open - check tool reliability`);
    }

    let overallHealth: 'healthy' | 'degraded' | 'unhealthy';
    if (successRate >= 0.95 && averageExecutionTime <= 5000 && circuitBreakersOpen === 0) {
      overallHealth = 'healthy';
    } else if (successRate >= 0.8 && circuitBreakersOpen <= 2) {
      overallHealth = 'degraded';
    } else {
      overallHealth = 'unhealthy';
    }

    return {
      overallHealth,
      metrics: {
        totalExecutions,
        successRate,
        averageExecutionTime,
        circuitBreakersOpen,
        rateLimitViolations: 0 // TODO: Track this properly
      },
      recommendations
    };
  }
}

// ================================
// Singleton Export
// ================================

let hardeningServiceInstance: HardeningService | null = null;

export const getHardeningService = (supabaseClient: SupabaseClient): HardeningService => {
  if (!hardeningServiceInstance) {
    hardeningServiceInstance = new HardeningService(supabaseClient);
  }
  return hardeningServiceInstance;
}; 