/**
 * PipeCD AI Agent - Type Definitions
 * 
 * TypeScript types for the autonomous agent system
 * Matches GraphQL schema and database structure
 */

import type { Database } from '../database.types';

// Base database types from Supabase
export type AgentConversationRow = Database['public']['Tables']['agent_conversations']['Row'];
export type AgentThoughtRow = Database['public']['Tables']['agent_thoughts']['Row'];

// ================================
// Core Enums
// ================================

export type AgentThoughtType = 'reasoning' | 'question' | 'tool_call' | 'observation' | 'plan';

export type AgentStepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export type ThinkingBudget = 'standard' | 'think' | 'think_hard' | 'think_harder' | 'ultrathink';

// ================================
// Core Types
// ================================

export interface AgentThought {
  id: string;
  conversationId: string;
  type: AgentThoughtType;
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface AgentPlanStep {
  id: string;
  description: string;
  toolName?: string;
  parameters?: Record<string, any>;
  dependencies?: string[]; // IDs of steps this depends on
  status: AgentStepStatus;
  result?: any;
}

export interface AgentPlan {
  goal: string;
  steps: AgentPlanStep[];
  context: Record<string, any>;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  thoughts?: AgentThought[];
}

export interface AgentConfig {
  maxThinkingSteps: number;
  enableExtendedThinking: boolean;
  thinkingBudget: ThinkingBudget;
  maxClarifyingQuestions: number;
  autoExecute: boolean;
}

export interface AgentConversation {
  id: string;
  userId: string;
  messages: AgentMessage[];
  plan?: AgentPlan;
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ================================
// MCP Tool Types
// ================================

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>; // JSON Schema
}

export interface MCPToolCall {
  toolName: string;
  parameters: Record<string, any>;
  conversationId: string;
  stepId?: string;
}

export interface MCPToolResponse {
  success: boolean;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

// ================================
// Input Types (for mutations)
// ================================

export interface AgentConfigInput {
  maxThinkingSteps?: number;
  enableExtendedThinking?: boolean;
  thinkingBudget?: ThinkingBudget;
  maxClarifyingQuestions?: number;
  autoExecute?: boolean;
}

export interface SendMessageInput {
  conversationId?: string;
  content: string;
  config?: AgentConfigInput;
}

export interface AgentThoughtInput {
  type: AgentThoughtType;
  content: string;
  metadata?: Record<string, any>;
}

export interface AgentPlanStepInput {
  description: string;
  toolName?: string;
  parameters?: Record<string, any>;
  dependencies?: string[];
}

export interface UpdateConversationInput {
  conversationId: string;
  plan?: Record<string, any>;
  context?: Record<string, any>;
}

// ================================
// Response Types
// ================================

export interface AgentResponse {
  conversation: AgentConversation;
  message: AgentMessage;
  thoughts: AgentThought[];
  plan?: AgentPlan;
}

export interface ToolDiscoveryResponse {
  tools: MCPTool[];
  error?: string;
}

// ================================
// Service Types
// ================================

export interface AgentServiceConfig {
  mcpEndpoint: string;
  defaultConfig: AgentConfig;
  anthropicApiKey?: string;
  openaiApiKey?: string;
}

export interface ThinkingStep {
  id: string;
  type: 'reasoning' | 'planning' | 'tool_selection' | 'clarification';
  content: string;
  confidence: number;
  reasoning: string;
  nextActions?: string[];
}

export interface PlanningContext {
  userGoal: string;
  availableTools: MCPTool[];
  conversationHistory: AgentMessage[];
  constraints: string[];
  budget: ThinkingBudget;
}

// ================================
// Database Adapter Types
// ================================

export interface ConversationCreateData {
  userId: string;
  messages?: AgentMessage[];
  plan?: AgentPlan;
  context?: Record<string, any>;
}

export interface ConversationUpdateData {
  messages?: AgentMessage[];
  plan?: AgentPlan;
  context?: Record<string, any>;
}

export interface ThoughtCreateData {
  conversationId: string;
  type: AgentThoughtType;
  content: string;
  metadata?: Record<string, any>;
}

// ================================
// Error Types
// ================================

export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class MCPError extends Error {
  constructor(
    message: string,
    public toolName?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

export class PlanningError extends Error {
  constructor(
    message: string,
    public context?: PlanningContext,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'PlanningError';
  }
}

// ================================
// Utility Types
// ================================

export type ConversationState = 'idle' | 'thinking' | 'planning' | 'executing' | 'waiting_for_user';

export interface ConversationMetrics {
  messageCount: number;
  thoughtCount: number;
  toolCallCount: number;
  averageResponseTime: number;
  successRate: number;
}

// Default configurations
export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  maxThinkingSteps: 10,
  enableExtendedThinking: true,
  thinkingBudget: 'think_hard',
  maxClarifyingQuestions: 3,
  autoExecute: false,
};

export const THINKING_BUDGET_LIMITS: Record<ThinkingBudget, number> = {
  standard: 5,
  think: 10,
  think_hard: 20,
  think_harder: 35,
  ultrathink: 50,
}; 