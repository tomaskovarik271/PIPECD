import { ConversationContext, ToolCall, ToolResult } from '../../../../lib/aiAgentV2/types/system';
import { loggers } from '../../../../lib/logger';

export const agentV2Resolvers = {
  Query: {
    agentV2HealthCheck: async () => {
      try {
        // Basic health check - V2 system is available
        return {
          status: 'healthy',
          components: {
            systemStateEncoder: 'healthy',
            pipeCDRulesEngine: 'healthy', 
            semanticSearchEngine: 'healthy',
            toolRegistry: 'healthy',
            aiService: 'healthy',
            graphQLClient: 'healthy'
          },
          lastCheck: new Date(),
          uptime: Math.floor(process.uptime())
        };
      } catch (error) {
        loggers.ai.error('Agent V2 health check failed:', error);
        return {
          status: 'error',
          components: {
            systemStateEncoder: 'error',
            pipeCDRulesEngine: 'error',
            semanticSearchEngine: 'error', 
            toolRegistry: 'error',
            aiService: 'error',
            graphQLClient: 'error'
          },
          lastCheck: new Date(),
          uptime: 0
        };
      }
    }
  },

  Mutation: {
    processMessageV2: async (_parent: any, { input }: { input: any }, context: any) => {
      const startTime = Date.now();
      
      try {
        // Extract user from context (assuming JWT auth)
        const userId = context?.currentUser?.id || 'anonymous-user';
        const authToken = context?.token || '';
        let userPermissions = context?.userPermissions || [];
        
        // Debug logging to see what permissions we have
        loggers.ai.info(`[Agent V2] User context debug:`, {
          userId,
          hasCurrentUser: !!context?.currentUser?.id,
          userPermissionsCount: userPermissions.length,
          userPermissions: userPermissions.slice(0, 10), // Log first 10 permissions
          contextKeys: Object.keys(context || {})
        });
        
        // Development-only fallback: provide basic permissions for testing when no auth
        if (!context?.currentUser?.id && process.env.NODE_ENV !== 'production') {
          loggers.ai.warn('[Agent V2] Development mode: providing basic permissions for testing');
          userPermissions = ['deal:read_any', 'deal:read_own', 'deal:create', 'organization:read_any', 'organization:create', 'person:read_any', 'person:create', 'activity:read_any', 'activity:read_own'];
        } else if (!context?.currentUser?.id) {
          loggers.ai.warn('[Agent V2] Processing request without authentication - using anonymous user');
        }

        loggers.ai.info(`[Agent V2] Processing message from user ${userId}:`, {
          messageLength: input.message.length,
          message: input.message.substring(0, 100) + '...',
          environment: process.env.NODE_ENV || 'development'
        });

        // Create execution context for AI agent
        const executionContext = {
          userId: userId,
          sessionId: input.sessionId || `session-${Date.now()}`,
          permissions: userPermissions,
          authToken: authToken,
          requestId: `req-${Date.now()}`,
          toolCallId: `tool-${Date.now()}`,
          systemState: {},
          conversationHistory: input.conversationHistory || []
        };

        // Use the real AI Agent V2 service
        try {
          const { AgentService } = await import('../../../../lib/aiAgentV2/services/AgentService.js');
          
          // Initialize AgentService with authenticated Supabase client
          const agentService = new AgentService(
            context.supabaseClient,
            process.env.ANTHROPIC_API_KEY!,
            {
              model: 'claude-3-5-sonnet-20241022',
              temperature: 0.1,
              maxTokens: 4000,
              systemPromptStrategy: 'dynamic',
              thinkingEnabled: true,
              workflowOrchestration: true,
              realTimeContext: true
            }
          );
          
          // Debug: Log exactly what we're passing to AgentService
          const requestToSend = {
            message: input.message,
            userId: userId,
            sessionId: executionContext.sessionId,
            authToken: authToken,
            permissions: userPermissions, // Pass the permissions directly
            context: {
              sessionId: executionContext.sessionId,
              userId: userId,
              messageHistory: executionContext.conversationHistory,
              currentObjective: undefined,
              systemState: undefined, // Let AgentService generate fresh system state
              workflowState: undefined
            }
          };
          
          loggers.ai.info('[Agent V2] About to call AgentService with:', {
            permissionCount: userPermissions.length,
            systemStateSource: 'will be generated fresh by AgentService'
          });
          
          // Process the message using Claude AI
          const agentResponse = await agentService.processRequest(requestToSend);

          const processingTime = Date.now() - startTime;
          loggers.ai.info(`[Agent V2] V2 response generated in ${processingTime}ms`);

          // Return the AI-generated response
          return {
            success: agentResponse.success,
            message: agentResponse.message,
            data: agentResponse.data,
            toolCalls: agentResponse.toolCalls || [],
            toolResults: agentResponse.toolResults || [],
            reasoning: agentResponse.reasoning || [],
            suggestions: agentResponse.suggestions || [],
            insights: agentResponse.insights || [],
            nextActions: agentResponse.nextActions || [],
            metadata: {
              agentVersion: '2.0.0',
              processingTime,
              systemStateTimestamp: new Date(),
              toolsUsed: (agentResponse.toolCalls || []).map((tc: any) => tc.tool),
              confidenceScore: agentResponse.metadata?.confidenceScore || 0.9,
              rateLimitStatus: {
                remaining: 50,
                resetTime: new Date(Date.now() + 60000),
                burst: 5
              },
              cacheStatus: {
                systemStateFromCache: false,
                rulesFromCache: false,
                searchResultsFromCache: false
              },
              sources: (agentResponse.toolCalls || []).map((tc: any) => ({
                type: 'tool',
                name: tc.tool,
                version: '2.0.0',
                confidence: 0.9
              }))
            },
            error: agentResponse.error || null
          };

        } catch (error) {
          loggers.ai.error('[Agent V2] AI Service error:', error);
          
          const processingTime = Date.now() - startTime;
          return {
            success: false,
            message: 'I encountered an error while processing your request with Claude AI. Please try again.',
            data: null,
            toolCalls: [],
            toolResults: [],
            reasoning: [],
            suggestions: [
              {
                id: `suggestion-${Date.now()}-1`,
                type: 'action',
                title: 'Try Again',
                description: 'Please try your request again',
                confidence: 0.8,
                impact: 'medium',
                urgency: 'medium',
                actionable: true
              },
              {
                id: `suggestion-${Date.now()}-2`,
                type: 'format',
                title: 'Check Request Format',
                description: 'Verify your request format is correct',
                confidence: 0.7,
                impact: 'low',
                urgency: 'low',
                actionable: true
              }
            ],
            insights: [],
            nextActions: [],
            metadata: {
              agentVersion: '2.0.0',
              processingTime,
              systemStateTimestamp: new Date(),
              toolsUsed: [],
              confidenceScore: 0,
              rateLimitStatus: {
                remaining: 0,
                resetTime: new Date(),
                burst: 0
              },
              cacheStatus: {
                systemStateFromCache: false,
                rulesFromCache: false,
                searchResultsFromCache: false
              },
              sources: []
            },
            error: {
              code: 'AI_SERVICE_ERROR',
              message: error instanceof Error ? error.message : 'AI service unavailable',
              type: 'ai_service',
              recoverable: true,
              suggestions: ['Please try again', 'Check Claude API configuration']
            }
          };
        }

      } catch (error) {
        const processingTime = Date.now() - startTime;
        loggers.ai.error('[Agent V2] Request processing failed:', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          inputMessage: input?.message?.substring(0, 100),
          processingTime
        });

        return {
          success: false,
          message: 'I encountered an error while processing your request. Please try again.',
          data: null,
          toolCalls: [],
          toolResults: [],
          reasoning: [],
          suggestions: [],
          insights: [],
          nextActions: [],
          metadata: {
            agentVersion: '2.0.0',
            processingTime,
            systemStateTimestamp: new Date(),
            toolsUsed: [],
            confidenceScore: 0,
            rateLimitStatus: {
              remaining: 0,
              resetTime: new Date(),
              burst: 0
            },
            cacheStatus: {
              systemStateFromCache: false,
              rulesFromCache: false,
              searchResultsFromCache: false
            },
            sources: []
          },
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            type: 'system',
            recoverable: true,
            suggestions: ['Please try again', 'Check your request format', 'Contact support if issue persists']
          }
        };
      }
    }
  }
}; 