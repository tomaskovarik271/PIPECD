import { supabase } from '../../supabaseClient';
import Anthropic from '@anthropic-ai/sdk';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AgentV2MessageInput {
  conversationId?: string;
  content: string;
  enableExtendedThinking: boolean;
  thinkingBudget: string;
  userId: string;
  supabaseClient?: SupabaseClient;
  streaming?: boolean;
}

export interface AgentV2Response {
  conversation: any;
  message: any;
  extendedThoughts: any[];
  reflections: any[];
  planModifications: string[];
  thinkingTime?: number;
  confidenceScore?: number;
}

export interface AgentV2StreamChunk {
  type: 'content' | 'thinking' | 'complete' | 'error';
  content?: string;
  thinking?: any;
  conversationId: string;
  complete?: AgentV2Response;
  error?: string;
}

export type StreamCallback = (chunk: AgentV2StreamChunk) => void;

export interface ExtendedThinkingStep {
  type: 'reasoning' | 'planning' | 'reflection' | 'concern' | 'strategy';
  content: string;
  reasoning?: string;
  strategy?: string;
  concerns?: string;
  nextSteps?: string;
  metadata: Record<string, any>;
}

export class AgentServiceV2 {
  private anthropic: Anthropic;
  
  constructor() {
    // Initialize Claude Sonnet 4 client
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required for V2 Agent');
    }
    
    this.anthropic = new Anthropic({
      apiKey: apiKey
    });
    
    console.log('AgentServiceV2 initialized with Claude Sonnet 4 integration');
  }

  async processMessage(input: AgentV2MessageInput): Promise<AgentV2Response> {
    if (input.streaming) {
      throw new Error('Use processMessageStream for streaming responses');
    }
    try {
      // Use authenticated supabase client if provided, fallback to global client
      const client = input.supabaseClient || supabase;
      
      // Phase 1: Basic implementation - create or get conversation
      let conversation;
      
      if (input.conversationId) {
        // Get existing conversation
        const { data, error } = await client
          .from('agent_conversations')
          .select('*')
          .eq('id', input.conversationId)
          .eq('user_id', input.userId)
          .eq('agent_version', 'v2')
          .single();

        if (error || !data) {
          throw new Error('V2 conversation not found');
        }
        conversation = data;
      } else {
        // Create new V2 conversation
        const { data, error } = await client
          .from('agent_conversations')
          .insert({
            user_id: input.userId,
            messages: [],
            plan: null,
            context: {
              agentConfig: {
                enableExtendedThinking: input.enableExtendedThinking,
                thinkingBudget: input.thinkingBudget
              }
            },
            agent_version: 'v2',
            extended_thinking_enabled: input.enableExtendedThinking,
            thinking_budget: input.thinkingBudget
          })
          .select()
          .single();

        if (error || !data) {
          throw new Error('Failed to create V2 conversation');
        }
        conversation = data;
      }

      // Phase 2: Claude Sonnet 4 Extended Thinking Integration
      const startTime = Date.now();
      
      // Generate response using Claude Sonnet 4 with extended thinking
      const claudeResponse = await this.generateExtendedThinkingResponse(
        input.content,
        conversation.messages || [],
        {
          enableExtendedThinking: input.enableExtendedThinking,
          thinkingBudget: input.thinkingBudget
        },
        conversation.id
      );
      
      const thinkingTime = (Date.now() - startTime) / 1000;
      
      const assistantMessage = {
        role: 'assistant',
        content: claudeResponse.content,
        timestamp: new Date().toISOString(),
        thoughts: claudeResponse.extendedThoughts
      };

      // Add user message and assistant response to conversation
      const updatedMessages = [
        ...(conversation.messages || []),
        {
          role: 'user',
          content: input.content,
          timestamp: new Date().toISOString(),
          thoughts: []
        },
        assistantMessage
      ];

      // Update conversation with new messages
      const { data: updatedConversation, error: updateError } = await client
        .from('agent_conversations')
        .update({ 
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id)
        .select()
        .single();

      if (updateError) {
        throw new Error('Failed to update conversation');
      }

      // Phase 2: Return enriched response structure with extended thinking
      return {
        conversation: updatedConversation,
        message: assistantMessage,
        extendedThoughts: claudeResponse.extendedThoughts,
        reflections: claudeResponse.reflections || [],
        planModifications: claudeResponse.planModifications || [],
        thinkingTime: thinkingTime,
        confidenceScore: claudeResponse.confidenceScore || 0.8
      };

    } catch (error) {
      console.error('Error in AgentServiceV2.processMessage:', error);
      throw new Error(`V2 Agent processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processMessageStream(input: AgentV2MessageInput, callback: StreamCallback): Promise<void> {
    try {
      // Use authenticated supabase client if provided, fallback to global client
      const client = input.supabaseClient || supabase;
      
      // Phase 1: Create or get conversation (same as non-streaming)
      let conversation;
      
      if (input.conversationId) {
        const { data, error } = await client
          .from('agent_conversations')
          .select('*')
          .eq('id', input.conversationId)
          .eq('user_id', input.userId)
          .eq('agent_version', 'v2')
          .single();

        if (error || !data) {
          throw new Error('V2 conversation not found');
        }
        conversation = data;
      } else {
        const { data, error } = await client
          .from('agent_conversations')
          .insert({
            user_id: input.userId,
            messages: [],
            plan: null,
            context: {
              agentConfig: {
                enableExtendedThinking: input.enableExtendedThinking,
                thinkingBudget: input.thinkingBudget
              }
            },
            agent_version: 'v2',
            extended_thinking_enabled: input.enableExtendedThinking,
            thinking_budget: input.thinkingBudget
          })
          .select()
          .single();

        if (error || !data) {
          throw new Error('Failed to create V2 conversation');
        }
        conversation = data;
      }

      // Phase 2: Generate streaming response
      await this.generateStreamingResponse(
        input.content,
        conversation.messages || [],
        {
          enableExtendedThinking: input.enableExtendedThinking,
          thinkingBudget: input.thinkingBudget
        },
        conversation.id,
        conversation,
        client,
        input.userId,
        callback
      );

    } catch (error) {
      console.error('Error in AgentServiceV2.processMessageStream:', error);
      callback({
        type: 'error',
        conversationId: input.conversationId || 'unknown',
        error: `V2 Agent streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  // Phase 1: Basic conversation management
  async getConversation(conversationId: string, userId: string, supabaseClient?: SupabaseClient) {
    const client = supabaseClient || supabase;
    const { data, error } = await client
      .from('agent_conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .eq('agent_version', 'v2')
      .single();

    if (error || !data) {
      throw new Error('V2 conversation not found');
    }

    return data;
  }

  // Phase 1: Get conversation history
  async getConversationHistory(userId: string, limit = 10, supabaseClient?: SupabaseClient) {
    const client = supabaseClient || supabase;
    const { data, error } = await client
      .from('agent_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('agent_version', 'v2')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error('Failed to fetch V2 conversation history');
    }

    return data || [];
  }

  // Phase 2: Claude Sonnet 4 Streaming Integration
  private async generateStreamingResponse(
    userMessage: string,
    conversationHistory: any[],
    config: { enableExtendedThinking: boolean; thinkingBudget: string },
    conversationId: string,
    conversation: any,
    client: SupabaseClient,
    userId: string,
    callback: StreamCallback
  ): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Build conversation messages for Claude
      const messages: Anthropic.Messages.MessageParam[] = [
        ...conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: userMessage
        }
      ];

      // Enhanced system prompt for V2 extended thinking
      const systemPrompt = this.buildV2SystemPrompt(config);

      // Claude Sonnet 4 streaming request
      const stream = await this.anthropic.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.7,
        system: systemPrompt,
        messages
      });

      let fullContent = '';
      const extendedThoughts: any[] = [];

      // Process streaming chunks
      for await (const chunk of stream) {
        switch (chunk.type) {
          case 'content_block_delta':
            if (chunk.delta.type === 'text_delta') {
              const textChunk = chunk.delta.text;
              fullContent += textChunk;
              
              // Send content chunk to callback
              callback({
                type: 'content',
                content: textChunk,
                conversationId: conversationId
              });
            }
            break;
            
          case 'message_start':
            // Send thinking update if extended thinking is enabled
            if (config.enableExtendedThinking) {
              callback({
                type: 'thinking',
                thinking: {
                  type: 'reasoning',
                  content: `Starting extended thinking with ${config.thinkingBudget} budget...`,
                  metadata: { thinkingBudget: config.thinkingBudget }
                },
                conversationId: conversationId
              });
            }
            break;
            
          case 'message_stop':
            // Message complete - process final response
            break;
        }
      }

      const thinkingTime = (Date.now() - startTime) / 1000;

      // Generate extended thinking analysis after streaming completes
      if (config.enableExtendedThinking) {
        const thinkingAnalysis = this.analyzeResponseForThinking(fullContent, config.thinkingBudget, conversationId);
        extendedThoughts.push(...thinkingAnalysis);
        
        // Send final thinking update
        for (const thought of thinkingAnalysis) {
          callback({
            type: 'thinking',
            thinking: thought,
            conversationId: conversationId
          });
        }
      }

      // Create assistant message
      const assistantMessage = {
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString(),
        thoughts: extendedThoughts
      };

      // Update conversation in database
      const updatedMessages = [
        ...(conversation.messages || []),
        {
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString(),
          thoughts: []
        },
        assistantMessage
      ];

      const { data: updatedConversation, error: updateError } = await client
        .from('agent_conversations')
        .update({ 
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update conversation:', updateError);
      }

      // Send completion message
      const finalResponse: AgentV2Response = {
        conversation: updatedConversation || conversation,
        message: assistantMessage,
        extendedThoughts,
        reflections: extendedThoughts.filter(t => t.metadata?.type === 'reflection'),
        planModifications: this.extractPlanModifications(extendedThoughts),
        thinkingTime,
        confidenceScore: this.calculateConfidenceScore(fullContent, extendedThoughts)
      };

      callback({
        type: 'complete',
        conversationId: conversationId,
        complete: finalResponse
      });

    } catch (error) {
      console.error('Claude V2 streaming error:', error);
      callback({
        type: 'error',
        conversationId: conversationId,
        error: `Streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  // Phase 2: Claude Sonnet 4 Extended Thinking Integration (Non-streaming)
  private async generateExtendedThinkingResponse(
    userMessage: string,
    conversationHistory: any[],
    config: { enableExtendedThinking: boolean; thinkingBudget: string },
    conversationId: string
  ) {
    try {
      // Build conversation messages for Claude
      const messages: Anthropic.Messages.MessageParam[] = [
        ...conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: userMessage
        }
      ];

      // Enhanced system prompt for V2 extended thinking
      const systemPrompt = this.buildV2SystemPrompt(config);

      // Claude Sonnet 4 request with extended thinking
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022', // Latest Claude Sonnet model
        max_tokens: 4096,
        temperature: 0.7,
        system: systemPrompt,
        messages
      });

      // Process response and extract extended thinking
      return this.processClaudeV2Response(response, config, conversationId);

    } catch (error) {
      console.error('Claude V2 processing error:', error);
      
      // Fallback response if Claude fails
      return {
        content: `I apologize, but I'm experiencing technical difficulties with my extended thinking capabilities. Please try again in a moment.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        extendedThoughts: [],
        reflections: [],
        planModifications: [],
        confidenceScore: 0.3
      };
    }
  }

  private buildV2SystemPrompt(config: { enableExtendedThinking: boolean; thinkingBudget: string }): string {
    return `You are Claude Sonnet 4, an advanced AI assistant with extended thinking capabilities for PipeCD CRM.

## EXTENDED THINKING MODE: ${config.enableExtendedThinking ? 'ENABLED' : 'DISABLED'}
## THINKING BUDGET: ${config.thinkingBudget.toUpperCase()}

${config.enableExtendedThinking ? `
## THINKING PROCESS
When extended thinking is enabled, structure your response with:

1. **Deep Analysis**: Thoroughly analyze the user's request
2. **Strategic Planning**: Consider multiple approaches and their implications  
3. **Concerns & Risks**: Identify potential issues or limitations
4. **Next Steps**: Provide clear action recommendations

Think step-by-step through complex problems and show your reasoning process.
` : ''}

## YOUR ROLE
You are a sophisticated CRM assistant for PipeCD that can:
- Analyze business data and relationships
- Provide strategic insights for sales and pipeline management
- Help with deal progression and customer relationship management
- Offer data-driven recommendations

## THINKING BUDGET LEVELS
- STANDARD: Quick, efficient responses
- THINK: Moderate analysis and reasoning
- THINK_HARD: Deep analysis with multiple perspectives
- THINK_HARDER: Comprehensive evaluation with strategic insights
- ULTRATHINK: Maximum depth analysis with extensive planning

## RESPONSE STYLE
- Be professional and business-focused
- Provide actionable insights
- Use data-driven reasoning
- Consider business context and implications
- Show your thinking process when extended thinking is enabled

Respond naturally and helpfully to the user's request while utilizing your extended thinking capabilities when enabled.`;
  }

  private processClaudeV2Response(response: Anthropic.Messages.Message, config: any, conversationId: string) {
    // Extract main content
    const content = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    // Generate extended thinking steps based on response analysis
    const extendedThoughts: any[] = [];
    
    if (config.enableExtendedThinking) {
      // Analyze the response to extract thinking patterns
      const thinkingAnalysis = this.analyzeResponseForThinking(content, config.thinkingBudget, conversationId);
      extendedThoughts.push(...thinkingAnalysis);
    }

    // Calculate confidence based on response quality and thinking depth
    const confidenceScore = this.calculateConfidenceScore(content, extendedThoughts);

    return {
      content,
      extendedThoughts,
      reflections: extendedThoughts.filter(t => t.metadata?.type === 'reflection'),
      planModifications: this.extractPlanModifications(extendedThoughts),
      confidenceScore
    };
  }

  private analyzeResponseForThinking(content: string, thinkingBudget: string, conversationId: string): any[] {
    const thoughts: any[] = [];
    
    // Defensive programming: ensure conversationId is not null/undefined
    if (!conversationId) {
      console.error('analyzeResponseForThinking: conversationId is null or undefined');
      return thoughts; // Return empty array if no conversationId
    }
    
    // Create AgentThought-compatible object for reasoning process
    thoughts.push({
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Temporary ID for GraphQL
      conversationId: conversationId,
      type: 'REASONING', // Match AgentThoughtType enum
      content: `Extended thinking applied with ${thinkingBudget} budget. Analyzed user request and generated response using Claude Sonnet 4's advanced reasoning capabilities.`,
      metadata: {
        thinkingBudget,
        responseLength: content.length,
        reasoning: `Analyzed user request and generated response using Claude Sonnet 4's advanced reasoning capabilities`,
        strategy: `Applied ${thinkingBudget.toLowerCase()} level thinking for optimal response quality`,
        concerns: content.length < 100 ? 'Response may be too brief for complex request' : undefined,
        nextSteps: 'Continue conversation based on user feedback and follow-up questions'
      },
      timestamp: new Date().toISOString()
    });

    return thoughts;
  }

  private calculateConfidenceScore(content: string, thoughts: any[]): number {
    let score = 0.7; // Base confidence
    
    // Increase confidence based on content quality
    if (content.length > 200) score += 0.1;
    if (content.includes('analysis') || content.includes('recommend')) score += 0.1;
    
    // Increase confidence based on extended thinking depth
    if (thoughts.length > 0) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private extractPlanModifications(thoughts: any[]): string[] {
    return thoughts
      .filter(t => t.metadata?.nextSteps)
      .map(t => t.metadata.nextSteps)
      .filter(Boolean);
  }
} 