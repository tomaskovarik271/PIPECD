// Tool system types for AI Agent V2
export interface ToolDefinition {
  name: string;
  description: string;
  category: 'search' | 'crud' | 'analysis' | 'workflow' | 'system' | 'thinking';
  parameters: ToolParameterDefinition[];
  examples: ToolExample[];
  graphqlOperation?: GraphQLOperation;
  permissions?: string[];
  rateLimits?: RateLimit;
}

export interface ToolParameterDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  validation?: ParameterValidation;
  examples?: any[];
  default?: any;
}

export interface ParameterValidation {
  pattern?: string; // Regex pattern
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  enum?: any[];
  format?: 'email' | 'uuid' | 'date' | 'currency' | 'phone';
}

export interface ToolExample {
  description: string;
  input: Record<string, any>;
  expectedOutput: ToolResult;
  context?: string;
}

export interface GraphQLOperation {
  type: 'query' | 'mutation';
  operation: string;
  variables?: Record<string, string>;
  fragments?: string[];
}

export interface RateLimit {
  requests: number;
  timeWindow: number; // seconds
  burst?: number;
}

export interface ToolExecutionContext {
  userId: string;
  sessionId: string;
  permissions: string[];
  authToken: string;
  requestId: string;
  toolCallId: string;
  systemState?: any;
  conversationHistory?: any[];
}

export interface ToolResult {
  success: boolean;
  data?: any;
  message?: string;
  error?: ToolError;
  metadata?: ToolMetadata;
  suggestions?: string[];
  relatedActions?: RelatedAction[];
}

export interface ToolError {
  code: string;
  message: string;
  details?: Record<string, any>;
  recoverable: boolean;
  retryable: boolean;
  suggestedFix?: string;
}

export interface ToolMetadata {
  executionTime: number;
  queryComplexity?: number;
  cacheHit?: boolean;
  rateLimitRemaining?: number;
  dataSourcesUsed?: string[];
  confidenceScore?: number;
}

export interface RelatedAction {
  tool: string;
  description: string;
  parameters?: Record<string, any>;
  reasoning?: string;
}

// Base tool interface
export interface BaseTool {
  name: string;
  definition: ToolDefinition;
  execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;
  validateParameters(parameters: Record<string, any>): ParameterValidationResult;
  getExamples(): ToolExample[];
}

export interface ParameterValidationResult {
  valid: boolean;
  errors: ValidationError[];
  sanitizedParameters?: Record<string, any>;
}

export interface ValidationError {
  parameter: string;
  message: string;
  received: any;
  expected: string;
}

// Domain-specific tool interfaces
export interface SearchTool extends BaseTool {
  search(query: string, options: SearchOptions, context: ToolExecutionContext): Promise<ToolResult>;
  indexContent?(content: SearchableContent): Promise<void>;
}

export interface CRUDTool extends BaseTool {
  create?(data: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;
  read?(id: string, context: ToolExecutionContext): Promise<ToolResult>;
  update?(id: string, data: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;
  delete?(id: string, context: ToolExecutionContext): Promise<ToolResult>;
  list?(filters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;
}

export interface AnalysisTool extends BaseTool {
  analyze(data: any[], context: ToolExecutionContext): Promise<ToolResult>;
  generateInsights?(data: any[], context: ToolExecutionContext): Promise<ToolResult>;
  detectPatterns?(data: any[], context: ToolExecutionContext): Promise<ToolResult>;
}

export interface WorkflowTool extends BaseTool {
  executeWorkflow(steps: WorkflowStep[], context: ToolExecutionContext): Promise<ToolResult>;
  getWorkflowStatus?(workflowId: string, context: ToolExecutionContext): Promise<ToolResult>;
}

export interface SystemTool extends BaseTool {
  getSystemState?(context: ToolExecutionContext): Promise<ToolResult>;
  getPermissions?(context: ToolExecutionContext): Promise<ToolResult>;
  healthCheck?(): Promise<ToolResult>;
}

export interface ThinkingTool extends BaseTool {
  think(thought: string, reasoningType: string, context: ToolExecutionContext): Promise<ToolResult>;
  analyzeContext?(context: ToolExecutionContext): Promise<ToolResult>;
  planWorkflow?(objective: string, context: ToolExecutionContext): Promise<ToolResult>;
}

// Tool registry interfaces
export interface ToolRegistry {
  registerTool(tool: BaseTool): void;
  getTool(name: string): BaseTool | undefined;
  getToolsByCategory(category: string): BaseTool[];
  getAllTools(): BaseTool[];
  validateToolCall(name: string, parameters: Record<string, any>): ParameterValidationResult;
  getToolDefinition(name: string): ToolDefinition | undefined;
}

export interface DomainModule {
  name: string;
  description: string;
  tools: BaseTool[];
  initialize(): Promise<void>;
  cleanup?(): Promise<void>;
}

// Import necessary types from system.ts
import type { 
  SearchOptions, 
  SearchableContent, 
  WorkflowStep 
} from './system.js'; 