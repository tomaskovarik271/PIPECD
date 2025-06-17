// Main agent types for AI Agent V2
import type { 
  SystemSnapshot, 
  ConversationContext, 
  BusinessRule,
  UserProfile,
  PromptContext
} from './system.js';
import type { ToolResult, ToolExecutionContext } from './tools.js';

export interface AgentConfig {
  model: 'claude-3-5-sonnet' | 'claude-3-haiku' | 'claude-3-opus';
  temperature: number;
  maxTokens: number;
  systemPromptStrategy: 'dynamic' | 'static' | 'contextual';
  thinkingEnabled: boolean;
  workflowOrchestration: boolean;
  semanticSearchEnabled: boolean;
  realTimeContext: boolean;
  errorRecoveryAttempts: number;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export interface AgentCapabilities {
  toolExecution: boolean;
  multiStepWorkflows: boolean;
  contextPreservation: boolean;
  semanticSearch: boolean;
  patternRecognition: boolean;
  proactiveInsights: boolean;
  errorRecovery: boolean;
  learningFromFeedback: boolean;
}

export interface AgentRequest {
  sessionId: string;
  userId: string;
  message: string;
  context?: Partial<ConversationContext>;
  metadata?: RequestMetadata;
  preferences?: UserPreferences;
}

export interface RequestMetadata {
  channel: 'web' | 'api' | 'mobile' | 'integration';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expectedResponseTime?: number;
  locale?: string;
  timezone?: string;
}

export interface UserPreferences {
  verbosity: 'minimal' | 'standard' | 'detailed' | 'comprehensive';
  responseFormat: 'text' | 'structured' | 'markdown' | 'json';
  includeReasoningSteps: boolean;
  showDataSources: boolean;
  preferredCurrency?: string;
  businessContext?: string[];
}

export interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  reasoning?: ReasoningStep[];
  suggestions?: AgentSuggestion[];
  insights?: BusinessInsight[];
  nextActions?: RecommendedAction[];
  metadata: ResponseMetadata;
  error?: AgentError;
}

export interface ToolCall {
  id: string;
  tool: string;
  parameters: Record<string, any>;
  reasoning?: string;
  timestamp: Date;
}

export interface ReasoningStep {
  step: number;
  type: 'analysis' | 'planning' | 'decision' | 'validation' | 'synthesis';
  description: string;
  confidence: number;
  evidence?: string[];
  alternatives?: string[];
}

export interface AgentSuggestion {
  id: string;
  type: 'action' | 'question' | 'insight' | 'warning' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  actionable: boolean;
  parameters?: Record<string, any>;
}

export interface BusinessInsight {
  id: string;
  category: 'pipeline' | 'performance' | 'opportunity' | 'risk' | 'efficiency';
  insight: string;
  impact: string;
  evidence: string[];
  recommendedActions: string[];
  confidence: number;
  dataPoints: InsightDataPoint[];
}

export interface InsightDataPoint {
  metric: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  period?: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  priority: number;
  estimatedTime: string;
  tools?: string[];
  parameters?: Record<string, any>;
  dependencies?: string[];
}

export interface ResponseMetadata {
  agentVersion: string;
  processingTime: number;
  systemStateTimestamp?: Date;
  toolsUsed: string[];
  confidenceScore: number;
  rateLimitStatus: RateLimitStatus;
  cacheStatus: CacheStatus;
  sources: DataSource[];
}

export interface RateLimitStatus {
  remaining: number;
  resetTime: Date;
  burst: number;
}

export interface CacheStatus {
  systemStateFromCache: boolean;
  rulesFromCache: boolean;
  searchResultsFromCache: boolean;
  cacheAge?: number;
}

export interface DataSource {
  type: 'database' | 'api' | 'cache' | 'search_index' | 'real_time';
  name: string;
  queryTime: number;
  recordCount?: number;
}

export interface AgentError {
  code: string;
  message: string;
  type: 'validation' | 'execution' | 'permission' | 'rate_limit' | 'system';
  recoverable: boolean;
  retryAfter?: number;
  details?: Record<string, any>;
  suggestions?: string[];
}

// Decision making interfaces
export interface DecisionContext {
  objective: string;
  availableTools: string[];
  systemState: SystemSnapshot;
  conversationHistory: any[];
  businessRules: BusinessRule[];
  userProfile: UserProfile;
  constraints: DecisionConstraint[];
}

export interface DecisionConstraint {
  type: 'permission' | 'rate_limit' | 'data_access' | 'business_rule' | 'technical';
  description: string;
  severity: 'blocking' | 'warning' | 'advisory';
  parameters?: Record<string, any>;
}

export interface DecisionResult {
  action: 'execute_tool' | 'ask_clarification' | 'provide_info' | 'suggest_alternatives' | 'end_conversation';
  toolName?: string;
  parameters?: Record<string, any>;
  reasoning: string;
  confidence: number;
  alternatives: DecisionAlternative[];
  risks: DecisionRisk[];
}

export interface DecisionAlternative {
  action: string;
  reasoning: string;
  confidence: number;
  pros: string[];
  cons: string[];
}

export interface DecisionRisk {
  type: 'data_loss' | 'permission_violation' | 'business_rule_violation' | 'performance' | 'user_experience';
  description: string;
  likelihood: number;
  impact: number;
  mitigation?: string;
}

// Workflow orchestration interfaces
export interface WorkflowExecution {
  id: string;
  objective: string;
  status: 'planning' | 'executing' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentStep: number;
  totalSteps: number;
  startTime: Date;
  endTime?: Date;
  executionContext: ToolExecutionContext;
  steps: WorkflowExecutionStep[];
  results: Record<string, any>;
  errors: WorkflowExecutionError[];
}

export interface WorkflowExecutionStep {
  id: string;
  stepNumber: number;
  toolName: string;
  parameters: Record<string, any>;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  result?: ToolResult;
  retryCount: number;
  dependencies: string[];
}

export interface WorkflowExecutionError {
  stepId: string;
  error: string;
  timestamp: Date;
  recoveryAction?: string;
  resolved: boolean;
}

// Learning and adaptation interfaces
export interface FeedbackEvent {
  sessionId: string;
  userId: string;
  type: 'success' | 'failure' | 'partial_success' | 'user_correction' | 'user_satisfaction';
  description: string;
  context: Record<string, any>;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface LearningInsight {
  id: string;
  pattern: string;
  confidence: number;
  frequency: number;
  context: string[];
  suggestedImprovement: string;
  testable: boolean;
}

export interface PerformanceMetrics {
  successRate: number;
  averageResponseTime: number;
  averageConfidence: number;
  toolSuccessRates: Record<string, number>;
  userSatisfactionScore: number;
  errorRecoveryRate: number;
  contextPreservationRate: number;
} 