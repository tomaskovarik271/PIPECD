/**
 * Workflow and Sequential Execution Types for PipeCD AI Agent
 * 
 * Types for managing complex multi-step tool execution workflows
 */

import type { MCPTool } from '../types';
import type { ToolResult, ToolExecutionContext } from './tools';

// ================================
// Core Workflow Types
// ================================

export interface WorkflowStep {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  reasoning?: string;
  status: WorkflowStepStatus;
  result?: ToolResult;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  dependencies?: string[]; // IDs of steps this depends on
}

export type WorkflowStepStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface WorkflowContext {
  originalUserMessage: string;
  conversationId: string;
  userId: string;
  executionContext: ToolExecutionContext;
  maxIterations?: number;
  timeout?: number;
}

export interface WorkflowResult {
  success: boolean;
  finalResponse: string;
  steps: WorkflowStep[];
  allToolResults: string[];
  totalExecutionTime: number;
  metadata: {
    stepCount: number;
    successfulSteps: number;
    failedSteps: number;
    iterationCount: number;
    completed: boolean;
    terminationReason: WorkflowTerminationReason;
  };
}

export type WorkflowTerminationReason =
  | 'task_complete'
  | 'max_iterations_reached'
  | 'timeout_reached'
  | 'critical_error'
  | 'user_interrupted'
  | 'ai_indicated_complete';

// ================================
// Sequential Execution Types
// ================================

export interface SequentialWorkflowConfig {
  maxIterations: number;
  maxExecutionTime: number; // milliseconds
  retryFailedSteps: boolean;
  continueOnNonCriticalErrors: boolean;
  enableAIDecisionMaking: boolean;
}

export interface ToolExecution {
  toolName: string;
  parameters: Record<string, any>;
  reasoning: string;
  priority?: number;
  isRequired?: boolean;
}

export interface WorkflowDecision {
  shouldContinue: boolean;
  nextTools: ToolExecution[];
  reasoning: string;
  confidence: number;
  estimatedCompletion: number; // 0-100 percentage
}

// ================================
// Task Completion Assessment Types
// ================================

export interface TaskCompletionContext {
  originalRequest: string;
  executedTools: WorkflowStep[];
  latestToolResult: ToolResult;
  conversationHistory: any[];
  userExpectations?: string[];
}

export interface TaskCompletionAssessment {
  isComplete: boolean;
  confidence: number; // 0-100
  reasoning: string;
  missingActions?: string[];
  suggestedNextSteps?: ToolExecution[];
}

export interface CompletionRule {
  name: string;
  description: string;
  priority: number;
  condition: (context: TaskCompletionContext) => boolean;
  confidence: number;
}

// ================================
// Workflow Engine Events
// ================================

export interface WorkflowEvent {
  type: WorkflowEventType;
  timestamp: Date;
  stepId?: string;
  data?: any;
  message?: string;
}

export type WorkflowEventType =
  | 'workflow_started'
  | 'step_started'
  | 'step_completed'
  | 'step_failed'
  | 'step_skipped'
  | 'ai_decision_made'
  | 'workflow_completed'
  | 'workflow_failed'
  | 'workflow_timeout'
  | 'user_intervention_required';

export interface WorkflowEventHandler {
  onEvent(event: WorkflowEvent): void | Promise<void>;
}

// ================================
// Advanced Workflow Features
// ================================

export interface ConditionalExecution {
  condition: string; // JavaScript expression
  trueTools: ToolExecution[];
  falseTools: ToolExecution[];
}

export interface ParallelExecution {
  tools: ToolExecution[];
  waitForAll: boolean;
  maxConcurrency: number;
}

export interface LoopExecution {
  tools: ToolExecution[];
  condition: string; // Continue while this is true
  maxIterations: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  steps: (ToolExecution | ConditionalExecution | ParallelExecution | LoopExecution)[];
  config: SequentialWorkflowConfig;
}

export interface WorkflowTrigger {
  type: 'user_request' | 'pattern_match' | 'scheduled' | 'event_driven';
  pattern?: RegExp;
  keywords?: string[];
  conditions?: Record<string, any>;
}

// ================================
// Performance and Monitoring
// ================================

export interface WorkflowMetrics {
  averageExecutionTime: number;
  successRate: number;
  averageStepsPerWorkflow: number;
  mostUsedTools: Array<{ toolName: string; count: number }>;
  commonFailureReasons: Array<{ reason: string; count: number }>;
  userSatisfactionScore?: number;
}

export interface StepMetrics {
  toolName: string;
  averageExecutionTime: number;
  successRate: number;
  errorRate: number;
  retryRate: number;
  userInterventionRate: number;
}

// ================================
// Error Handling and Recovery
// ================================

export interface WorkflowError {
  stepId: string;
  toolName: string;
  error: Error;
  isRecoverable: boolean;
  recoveryStrategy?: WorkflowRecoveryStrategy;
  retryCount: number;
  maxRetries: number;
}

export type WorkflowRecoveryStrategy =
  | 'retry_with_backoff'
  | 'skip_step'
  | 'alternative_tool'
  | 'ask_user'
  | 'fallback_workflow'
  | 'terminate_gracefully';

export interface RecoveryAction {
  strategy: WorkflowRecoveryStrategy;
  parameters?: Record<string, any>;
  description: string;
} 