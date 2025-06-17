import { SystemStateEncoder } from '../core/SystemStateEncoder.js';
import { PipeCDRulesEngine } from '../core/PipeCDRulesEngine.js';
import { EnhancedSystemPrompt } from '../core/EnhancedSystemPrompt.js';
import { ToolExecutor } from './ToolExecutor.js';
import { AIService } from './AIService.js';
import { WorkflowOrchestrator } from './WorkflowOrchestrator.js';
import type {
  AgentRequest,
  AgentResponse,
  AgentConfig,
  AgentCapabilities,
  ConversationContext,
  DecisionContext,
  DecisionResult,
  WorkflowExecution
} from '../types/agent.js';
import type { 
  SystemSnapshot,
  BusinessRule 
} from '../types/system.js';
import type { ToolResult, ToolExecutionContext } from '../types/tools.js';

export class AgentService {
  private systemStateEncoder: SystemStateEncoder;
  private rulesEngine: PipeCDRulesEngine;
  private promptGenerator: EnhancedSystemPrompt;
  private toolExecutor: ToolExecutor;
  private aiService: AIService;
  private workflowOrchestrator: WorkflowOrchestrator;
  private config: AgentConfig;
  private capabilities: AgentCapabilities;
  private conversationContexts: Map<string, ConversationContext> = new Map();

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    anthropicApiKey: string,
    config: Partial<AgentConfig> = {}
  ) {
    // Initialize core components
    this.systemStateEncoder = new SystemStateEncoder(supabaseUrl, supabaseKey);
    this.rulesEngine = new PipeCDRulesEngine();
    this.promptGenerator = new EnhancedSystemPrompt(this.systemStateEncoder, this.rulesEngine);
    this.toolExecutor = new ToolExecutor(supabaseUrl, supabaseKey);
    this.aiService = new AIService(anthropicApiKey);
    this.workflowOrchestrator = new WorkflowOrchestrator(this.toolExecutor, this.rulesEngine);

    // Set configuration with defaults
    this.config = {
      model: 'claude-3-5-sonnet',
      temperature: 0.1,
      maxTokens: 4000,
      systemPromptStrategy: 'dynamic',
      thinkingEnabled: true,
      workflowOrchestration: true,
      semanticSearchEnabled: true,
      realTimeContext: true,
      errorRecoveryAttempts: 3,
      rateLimits: {
        requestsPerMinute: 60,
        requestsPerHour: 1000
      },
      ...config
    };

    // Define capabilities
    this.capabilities = {
      toolExecution: true,
      multiStepWorkflows: this.config.workflowOrchestration,
      contextPreservation: true,
      semanticSearch: this.config.semanticSearchEnabled,
      patternRecognition: true,
      proactiveInsights: this.config.realTimeContext,
      errorRecovery: this.config.errorRecoveryAttempts > 0,
      learningFromFeedback: true
    };
  }

  async processRequest(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      // Get or create conversation context
      const context = await this.getOrCreateContext(request);
      
      // Generate real-time system state if enabled
      let systemState: SystemSnapshot | undefined;
      if (this.config.realTimeContext) {
        systemState = await this.systemStateEncoder.generateSnapshot(
          request.userId, 
          context.systemState?.user_context.permissions || []
        );
        context.systemState = systemState;
      }

      // Make intelligent decision about how to proceed
      const decision = await this.makeDecision(request, context);
      
      // Execute the decision
      const response = await this.executeDecision(decision, request, context);
      
      // Update conversation context
      await this.updateContext(context, request, response);
      
      // Calculate metadata
      const processingTime = Date.now() - startTime;
      response.metadata = {
        ...response.metadata,
        agentVersion: '2.0.0',
        processingTime,
        systemStateTimestamp: systemState?.timestamp,
        confidenceScore: this.calculateConfidenceScore(response),
        rateLimitStatus: await this.getRateLimitStatus(request.userId),
        cacheStatus: this.getCacheStatus(),
        sources: this.getDataSources(response)
      };

      return response;
    } catch (error) {
      console.error('Error processing agent request:', error);
      return this.createErrorResponse(error, Date.now() - startTime);
    }
  }

  private async getOrCreateContext(request: AgentRequest): Promise<ConversationContext> {
    let context = this.conversationContexts.get(request.sessionId);
    
    if (!context) {
      context = {
        sessionId: request.sessionId,
        userId: request.userId,
        messageHistory: [],
        currentObjective: undefined,
        systemState: undefined,
        workflowState: undefined
      };
      this.conversationContexts.set(request.sessionId, context);
    }

    // Merge any provided context
    if (request.context) {
      context = { ...context, ...request.context };
    }

    return context;
  }

  private async makeDecision(request: AgentRequest, context: ConversationContext): Promise<DecisionResult> {
    const decisionContext: DecisionContext = {
      objective: this.extractObjective(request.message),
      availableTools: await this.toolExecutor.getAvailableTools(request.userId),
      systemState: context.systemState!,
      conversationHistory: context.messageHistory,
      businessRules: await this.rulesEngine.getRelevantRules(context),
      userProfile: await this.getUserProfile(request.userId),
      constraints: await this.getConstraints(request.userId, context)
    };

    // Use AI to make intelligent decision
    const prompt = await this.promptGenerator.generateDecisionPrompt(decisionContext);
    const aiDecision = await this.aiService.makeDecision(prompt, decisionContext);
    
    return aiDecision;
  }

  private async executeDecision(
    decision: DecisionResult, 
    request: AgentRequest, 
    context: ConversationContext
  ): Promise<AgentResponse> {
    const toolsUsed: string[] = [];
    const toolResults: ToolResult[] = [];
    const reasoning = [];

    switch (decision.action) {
      case 'execute_tool':
        if (decision.toolName && decision.parameters) {
          // Create execution context
          const executionContext: ToolExecutionContext = {
            userId: request.userId,
            sessionId: request.sessionId,
            permissions: context.systemState?.user_context.permissions || [],
            authToken: '', // Would be provided from request
            requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            toolCallId: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            systemState: context.systemState,
            conversationHistory: context.messageHistory
          };

          // Execute the tool
          const result = await this.toolExecutor.executeTool(
            decision.toolName,
            decision.parameters,
            executionContext
          );

          toolsUsed.push(decision.toolName);
          toolResults.push(result);

          // Generate response based on tool result
          const responseMessage = await this.generateResponseFromToolResult(result, decision);
          
          return {
            success: result.success,
            message: responseMessage,
            data: result.data,
            toolCalls: [{
              id: executionContext.toolCallId,
              tool: decision.toolName,
              parameters: decision.parameters,
              reasoning: decision.reasoning,
              timestamp: new Date()
            }],
            toolResults: [result],
            reasoning: [{
              step: 1,
              type: 'decision',
              description: decision.reasoning,
              confidence: decision.confidence,
              evidence: [decision.reasoning]
            }],
            suggestions: await this.generateSuggestions(result, context),
            insights: await this.generateInsights(result, context),
            nextActions: await this.generateNextActions(result, context),
            metadata: {
              agentVersion: '2.0.0',
              processingTime: 0, // Will be set by caller
              toolsUsed,
              confidenceScore: decision.confidence,
              rateLimitStatus: { remaining: 0, resetTime: new Date(), burst: 0 },
              cacheStatus: { systemStateFromCache: false, rulesFromCache: false, searchResultsFromCache: false },
              sources: []
            }
          };
        }
        break;

      case 'ask_clarification':
        return {
          success: true,
          message: decision.reasoning,
          suggestions: decision.alternatives.map(alt => ({
            id: `alt-${Math.random().toString(36).substr(2, 9)}`,
            type: 'question' as const,
            title: alt.action,
            description: alt.reasoning,
            confidence: alt.confidence,
            impact: 'medium' as const,
            urgency: 'medium' as const,
            actionable: true
          })),
          metadata: {
            agentVersion: '2.0.0',
            processingTime: 0,
            toolsUsed: [],
            confidenceScore: decision.confidence,
            rateLimitStatus: { remaining: 0, resetTime: new Date(), burst: 0 },
            cacheStatus: { systemStateFromCache: false, rulesFromCache: false, searchResultsFromCache: false },
            sources: []
          }
        };

      case 'provide_info':
        return {
          success: true,
          message: decision.reasoning,
          insights: await this.generateContextualInsights(context),
          metadata: {
            agentVersion: '2.0.0',
            processingTime: 0,
            toolsUsed: [],
            confidenceScore: decision.confidence,
            rateLimitStatus: { remaining: 0, resetTime: new Date(), burst: 0 },
            cacheStatus: { systemStateFromCache: false, rulesFromCache: false, searchResultsFromCache: false },
            sources: []
          }
        };

      case 'suggest_alternatives':
        return {
          success: true,
          message: decision.reasoning,
          suggestions: decision.alternatives.map((alt, index) => ({
            id: `alt-${index}`,
            type: 'action' as const,
            title: alt.action,
            description: alt.reasoning,
            confidence: alt.confidence,
            impact: 'medium' as const,
            urgency: 'medium' as const,
            actionable: true
          })),
          metadata: {
            agentVersion: '2.0.0',
            processingTime: 0,
            toolsUsed: [],
            confidenceScore: decision.confidence,
            rateLimitStatus: { remaining: 0, resetTime: new Date(), burst: 0 },
            cacheStatus: { systemStateFromCache: false, rulesFromCache: false, searchResultsFromCache: false },
            sources: []
          }
        };

      case 'end_conversation':
        return {
          success: true,
          message: decision.reasoning,
          metadata: {
            agentVersion: '2.0.0',
            processingTime: 0,
            toolsUsed: [],
            confidenceScore: decision.confidence,
            rateLimitStatus: { remaining: 0, resetTime: new Date(), burst: 0 },
            cacheStatus: { systemStateFromCache: false, rulesFromCache: false, searchResultsFromCache: false },
            sources: []
          }
        };

      default:
        throw new Error(`Unknown decision action: ${decision.action}`);
    }

    // Fallback response
    return {
      success: false,
      message: 'Unable to process request',
      error: {
        code: 'DECISION_EXECUTION_FAILED',
        message: 'Failed to execute decision',
        type: 'execution',
        recoverable: true
      },
      metadata: {
        agentVersion: '2.0.0',
        processingTime: 0,
        toolsUsed: [],
        confidenceScore: 0,
        rateLimitStatus: { remaining: 0, resetTime: new Date(), burst: 0 },
        cacheStatus: { systemStateFromCache: false, rulesFromCache: false, searchResultsFromCache: false },
        sources: []
      }
    };
  }

  private async updateContext(
    context: ConversationContext, 
    request: AgentRequest, 
    response: AgentResponse
  ): Promise<void> {
    // Add user message to history
    context.messageHistory.push({
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: request.message,
      timestamp: new Date()
    });

    // Add assistant response to history
    context.messageHistory.push({
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      toolCalls: response.toolCalls,
      toolResults: response.toolResults
    });

    // Keep only last 20 messages to prevent context bloat
    if (context.messageHistory.length > 20) {
      context.messageHistory = context.messageHistory.slice(-20);
    }

    // Update conversation context
    this.conversationContexts.set(request.sessionId, context);
  }

  // Utility methods
  private extractObjective(message: string): string {
    // Simple objective extraction - could be enhanced with NLP
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('create') && lowerMessage.includes('deal')) {
      return 'create_deal';
    } else if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
      return 'search_entities';
    } else if (lowerMessage.includes('update') || lowerMessage.includes('edit')) {
      return 'update_entity';
    } else {
      return 'general_inquiry';
    }
  }

  private async getUserProfile(userId: string): Promise<any> {
    // Would fetch from database
    return {
      id: userId,
      role: 'user',
      permissions: [],
      preferences: {},
      recentActivity: [],
      expertiseAreas: []
    };
  }

  private async getConstraints(userId: string, context: ConversationContext): Promise<any[]> {
    return []; // Would be populated based on user permissions and business rules
  }

  private async generateResponseFromToolResult(result: ToolResult, decision: DecisionResult): Promise<string> {
    if (result.success) {
      return result.message || 'Operation completed successfully';
    } else {
      return result.error?.message || 'Operation failed';
    }
  }

  private async generateSuggestions(result: ToolResult, context: ConversationContext): Promise<any[]> {
    return []; // Would generate contextual suggestions
  }

  private async generateInsights(result: ToolResult, context: ConversationContext): Promise<any[]> {
    return []; // Would generate business insights
  }

  private async generateNextActions(result: ToolResult, context: ConversationContext): Promise<any[]> {
    return []; // Would generate recommended next actions
  }

  private async generateContextualInsights(context: ConversationContext): Promise<any[]> {
    return []; // Would generate insights based on system state
  }

  private calculateConfidenceScore(response: AgentResponse): number {
    // Calculate confidence based on various factors
    let score = 0.5; // Base score
    
    if (response.success) score += 0.3;
    if (response.toolResults?.length) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private async getRateLimitStatus(userId: string): Promise<any> {
    return {
      remaining: 100,
      resetTime: new Date(Date.now() + 60000),
      burst: 10
    };
  }

  private getCacheStatus(): any {
    return {
      systemStateFromCache: false,
      rulesFromCache: false,
      searchResultsFromCache: false
    };
  }

  private getDataSources(response: AgentResponse): any[] {
    return [];
  }

  private createErrorResponse(error: any, processingTime: number): AgentResponse {
    return {
      success: false,
      message: 'An error occurred while processing your request',
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Unknown error',
        type: 'system',
        recoverable: true
      },
      metadata: {
        agentVersion: '2.0.0',
        processingTime,
        toolsUsed: [],
        confidenceScore: 0,
        rateLimitStatus: { remaining: 0, resetTime: new Date(), burst: 0 },
        cacheStatus: { systemStateFromCache: false, rulesFromCache: false, searchResultsFromCache: false },
        sources: []
      }
    };
  }

  // Public management methods
  getCapabilities(): AgentCapabilities {
    return { ...this.capabilities };
  }

  getConfig(): AgentConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  clearConversationContext(sessionId: string): boolean {
    return this.conversationContexts.delete(sessionId);
  }

  getActiveContextCount(): number {
    return this.conversationContexts.size;
  }

  // Cleanup method
  cleanup(): void {
    this.conversationContexts.clear();
    this.systemStateEncoder.clearCache();
    this.rulesEngine.clearCache();
  }
} 