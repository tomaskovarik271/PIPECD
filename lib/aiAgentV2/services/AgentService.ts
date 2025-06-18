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
  DecisionContext,
  DecisionResult,
  WorkflowExecution
} from '../types/agent.js';
import type { 
  SystemSnapshot,
  BusinessRule,
  ConversationContext
} from '../types/system.js';
import type { ToolExecutionContext } from '../types/tools.js';
import type { ToolResult } from '../types/system.js';

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
    supabaseClient: any,
    anthropicApiKey: string,
    config: Partial<AgentConfig> = {}
  ) {
    // Initialize core components
    this.systemStateEncoder = new SystemStateEncoder(supabaseClient);
    this.rulesEngine = new PipeCDRulesEngine();
    this.promptGenerator = new EnhancedSystemPrompt(this.systemStateEncoder, this.rulesEngine);
    this.toolExecutor = new ToolExecutor(this.rulesEngine);
    this.aiService = new AIService(anthropicApiKey);
    this.workflowOrchestrator = new WorkflowOrchestrator(this.toolExecutor, this.rulesEngine);

    // Set configuration with defaults
    this.config = {
      model: 'claude-sonnet-4-20250514',
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
      
      // Debug logging to track permissions flow
      console.log('[AgentService] Debug - Request context:', {
        userId: request.userId,
        hasContext: !!request.context,
        contextSystemState: !!request.context?.systemState,
        contextPermissions: request.context?.systemState?.user_context?.permissions?.length || 0,
        contextPermissionsPreview: request.context?.systemState?.user_context?.permissions?.slice(0, 5) || []
      });
      
      // Generate real-time system state if enabled
      let systemState: SystemSnapshot | undefined;
      if (this.config.realTimeContext) {
        // Check if we can reuse recent system state (cache for 5 minutes for follow-up messages)
        const now = new Date();
        const systemStateCacheMinutes = 5;
        const canReuseSystemState = context.systemState && 
          context.systemState.timestamp && 
          (now.getTime() - new Date(context.systemState.timestamp).getTime()) < (systemStateCacheMinutes * 60 * 1000);

        if (canReuseSystemState) {
          systemState = context.systemState;
          console.log('[AgentService] Debug - Using cached system state:', {
            dealsTotal: systemState.deals.total,
            cacheAge: Math.round((now.getTime() - new Date(systemState.timestamp).getTime()) / 1000) + 's',
            source: 'cache'
          });
        } else {
          // Generate fresh system state
          const userPermissions = (request as any).permissions || [];
          console.log('[AgentService] Debug - About to generate snapshot with permissions:', {
            permissionCount: userPermissions.length,
            permissionsPreview: userPermissions.slice(0, 5),
            reason: canReuseSystemState ? 'expired' : 'no_cache'
          });
          
          systemState = await this.systemStateEncoder.generateSnapshot(
            request.userId, 
            userPermissions
          );
          
          // Update context with fresh system state for future caching
          context.systemState = systemState;
          
          console.log('[AgentService] Debug - Generated snapshot result:', {
            dealsTotal: systemState.deals.total,
            dealsRecentActivity: systemState.deals.recent_activity.length,
            organizationsTotal: systemState.organizations.total,
            peopleTotal: systemState.people.total,
            activitiesOverdue: systemState.activities.overdue,
            pipelineHealthStatus: systemState.pipeline_health.status,
            userContextPermissions: systemState.user_context.permissions.length,
            source: 'fresh'
          });
        }
      }

      // Make intelligent decision about how to proceed
      const decision = await this.makeDecision(request, context, systemState);
      
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

  private async makeDecision(request: AgentRequest, context: ConversationContext, systemState?: SystemSnapshot): Promise<DecisionResult> {
    const availableTools = await this.toolExecutor.getAvailableTools(request.userId);
    
    // Debug logging to see what tools are available
    console.log('[AgentService] Available tools for decision:', {
      toolCount: availableTools.length,
      toolNames: availableTools.map(t => t.name),
      registeredToolNames: this.toolExecutor.getRegisteredTools()
    });

    // Use fresh systemState if provided, otherwise fall back to context
    const currentSystemState = systemState || context.systemState!;
    
    console.log('[AgentService] Decision using system state:', {
      dealsTotal: currentSystemState.deals.total,
      source: systemState ? 'fresh' : 'context',
      timestamp: currentSystemState.timestamp
    });

    const decisionContext: DecisionContext = {
      objective: this.extractObjective(request.message),
      userMessage: request.message,
      availableTools: availableTools,
      systemState: currentSystemState,
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
    const reasoningSteps = [];

    switch (decision.action) {
      case 'execute_tool':
        if (decision.toolName && decision.parameters) {
          // Create execution context
          const executionContext: ToolExecutionContext = {
            userId: request.userId,
            sessionId: request.sessionId,
            permissions: context.systemState?.user_context.permissions || [],
            authToken: request.authToken || '', // Use authToken from request
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

          // Extract thinking steps from ToolExecutor if this was a think tool execution
          const thinkingHistory = this.toolExecutor.getThinkingHistory();
          if (thinkingHistory.length > 0) {
            // Convert thinking steps to reasoning steps format for frontend
            const latestThinking = thinkingHistory[thinkingHistory.length - 1];
            if (latestThinking) {
              reasoningSteps.push({
                step: 1,
                type: latestThinking.reasoning_type,
                description: latestThinking.thought,
                confidence: latestThinking.confidence,
                evidence: latestThinking.focus_areas || []
              });
            }
          }

          // Add decision reasoning as a reasoning step
          reasoningSteps.push({
            step: reasoningSteps.length + 1,
            type: 'decision',
            description: decision.reasoning,
            confidence: decision.confidence,
            evidence: [decision.reasoning]
          });

          // Debug: Log the tool result to see what we're working with
          console.log('[AgentService] DEBUG - Tool result for response generation:', {
            toolName: decision.toolName,
            success: result.success,
            message: result.message,
            data: result.data,
            reasoning: result.reasoning,
            metadata: result.metadata
          });

          // Generate response based on tool result
          const responseMessage = await this.generateResponseFromToolResult(result, decision);
          
          console.log('[AgentService] DEBUG - Generated response message:', responseMessage);
          
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
            reasoning: reasoningSteps,
            // Remove unnecessary empty generators - keep response clean
            suggestions: [],
            insights: [],
            nextActions: [],
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
          reasoning: [{
            step: 1,
            type: 'analysis',
            description: `Need clarification: ${decision.reasoning}`,
            confidence: decision.confidence,
            evidence: decision.alternatives.map(alt => alt.action)
          }],
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
          reasoning: [{
            step: 1,
            type: 'synthesis',
            description: `Information synthesis: ${decision.reasoning}`,
            confidence: decision.confidence,
            evidence: ['System knowledge', 'Context analysis']
          }],
          insights: [], // Remove unnecessary empty generator
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
          reasoning: [{
            type: 'planning',
            content: `Alternative approaches identified: ${decision.reasoning}`,
            confidence: decision.confidence,
            evidence: decision.alternatives.map(alt => alt.action)
          }],
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
          reasoning: [{
            type: 'validation',
            content: `Conversation completion: ${decision.reasoning}`,
            confidence: decision.confidence,
            evidence: ['Task completed', 'User objective achieved']
          }],
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
      reasoning: [{
        type: 'analysis',
        content: 'Failed to execute decision - unknown action type',
        confidence: 0.1,
        evidence: ['Decision execution error']
      }],
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
    // Enhanced objective extraction for better intent recognition
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('create') && lowerMessage.includes('deal')) {
      return 'create_deal';
    } else if (
      lowerMessage.includes('search') || 
      lowerMessage.includes('find') || 
      lowerMessage.includes('show') || 
      lowerMessage.includes('list') || 
      lowerMessage.includes('get') ||
      lowerMessage.includes('all deals') ||
      lowerMessage.includes('deals worth') ||
      lowerMessage.includes('deals over') ||
      lowerMessage.includes('deals above')
    ) {
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
      // Handle think tool specifically - just return Claude's original thinking
      if (decision.toolName === 'think' && result.data?.thinking_step) {
        const thought = result.data.thinking_step.thought;
        
        // Return Claude's analysis with a simple intro and offer to proceed
        return `Based on your request, here's my analysis:\n\n${thought}\n\nWould you like me to proceed with searching for your high-value deals, or would you prefer to discuss the strategic recommendations first?`;
      }
      
      // Handle other tool results
      return result.message || 'Operation completed successfully';
    } else {
      return result.error?.message || 'Operation failed';
    }
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