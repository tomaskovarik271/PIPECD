// Core system types for AI Agent V2
export interface SystemSnapshot {
  deals: {
    total: number;
    by_stage: Record<string, number>;
    closing_this_month: DealSummary[];
    at_risk: DealSummary[];
    recent_activity: DealSummary[];
  };
  organizations: {
    total: number;
    enterprise: number;
    recent_activity: OrganizationSummary[];
    top_by_deal_volume: OrganizationSummary[];
  };
  people: {
    total: number;
    recent_contacts: PersonSummary[];
    key_stakeholders: PersonSummary[];
  };
  activities: {
    overdue: number;
    due_today: number;
    upcoming: number;
    recent_completions: ActivitySummary[];
  };
  pipeline_health: {
    status: 'strong' | 'moderate' | 'at_risk';
    weighted_value: number;
    close_rate_trend: number;
    key_insights: string[];
  };
  intelligent_suggestions: string[];
  user_context: {
    role: string;
    permissions: string[];
    recent_focus_areas: string[];
  };
  timestamp: Date;
}

export interface DealSummary {
  id: string;
  name: string;
  value: number;
  currency: string;
  stage: string;
  organization: string;
  close_date?: string;
  last_activity?: string;
  risk_level?: 'low' | 'medium' | 'high';
}

export interface OrganizationSummary {
  id: string;
  name: string;
  industry?: string;
  deal_count: number;
  total_value: number;
  last_activity?: string;
}

export interface PersonSummary {
  id: string;
  name: string;
  email?: string;
  organization?: string;
  role?: string;
  last_contact?: string;
}

export interface ActivitySummary {
  id: string;
  subject: string;
  type: string;
  due_date?: string;
  completed_date?: string;
  deal?: string;
  organization?: string;
}

export interface BusinessRule {
  id: string;
  category: 'data_handling' | 'workflow' | 'business_logic' | 'user_experience' | 'security';
  priority: 'critical' | 'high' | 'medium' | 'low';
  rule: string;
  examples?: string[];
  exceptions?: string[];
  last_updated: Date;
  source: 'admin_config' | 'code_analysis' | 'user_feedback' | 'ml_learning';
}

export interface WorkflowPattern {
  name: string;
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
  fallback_strategies: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  tool: string;
  parameters: Record<string, any>;
  required: boolean;
  depends_on?: string[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
  value: any;
  action: 'skip' | 'required' | 'optional';
}

export interface SearchableContent {
  id: string;
  type: 'deal' | 'organization' | 'person' | 'activity' | 'note' | 'email' | 'document';
  entityId: string;
  entityName: string;
  content: string;
  title?: string;
  author?: string;
  created: string;
  updated?: string;
  embedding?: number[];
  metadata: {
    dealId?: string;
    organizationId?: string;
    personId?: string;
    tags?: string[];
    status?: string;
    priority?: string;
  };
}

export interface SearchResult {
  content: SearchableContent;
  relevanceScore: number;
  matchedTerms: string[];
  snippet: string;
  semanticSimilarity?: number;
  relatedEntities: {
    deals?: Array<{ id: string; name: string }>;
    organizations?: Array<{ id: string; name: string }>;
    people?: Array<{ id: string; name: string }>;
  };
}

export interface SearchOptions {
  types?: string[];
  limit?: number;
  dateRange?: {
    from: string;
    to: string;
  };
  entities?: {
    dealIds?: string[];
    organizationIds?: string[];
    personIds?: string[];
  };
  includeEmbeddings?: boolean;
}

export interface ConversationContext {
  sessionId: string;
  userId: string;
  messageHistory: ConversationMessage[];
  currentObjective?: string;
  systemState?: SystemSnapshot;
  workflowState?: WorkflowState;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface WorkflowState {
  currentStep: number;
  totalSteps: number;
  stepResults: Record<string, any>;
  context: Record<string, any>;
  errors: WorkflowError[];
}

export interface WorkflowError {
  step: string;
  error: string;
  recoveryAttempts: number;
  resolved: boolean;
}

export interface PromptContext {
  operationType: 'complete' | 'lightweight' | 'error_recovery' | 'workflow';
  systemState: SystemSnapshot;
  rules: BusinessRule[];
  conversationHistory: ConversationMessage[];
  userProfile: UserProfile;
  currentObjective?: string;
}

export interface UserProfile {
  id: string;
  role: string;
  permissions: string[];
  preferences: Record<string, any>;
  recentActivity: string[];
  expertiseAreas: string[];
}

export interface ToolCall {
  id: string;
  tool: string;
  parameters: Record<string, any>;
  timestamp: Date;
}

export interface ToolResult {
  id: string;
  toolCallId: string;
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  timestamp: Date;
} 