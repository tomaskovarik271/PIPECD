import { supabase } from '../../supabaseClient';
import Anthropic from '@anthropic-ai/sdk';
import { SupabaseClient } from '@supabase/supabase-js';
import { ThinkTool, ThinkInput, ThinkResult } from '../tools/ThinkTool';
import { toolRegistry } from '../tools/ToolRegistry';

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
        conversation.id,
        client
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

      // Claude Sonnet 4 streaming request with tool support
      const tools = config.enableExtendedThinking ? toolRegistry.getToolDefinitions() : undefined;
      
      const stream = await this.anthropic.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.7,
        system: systemPrompt,
        messages,
        tools
      });

      let fullContent = '';
      const extendedThoughts: any[] = [];
      const toolCalls: any[] = [];

      // Process streaming chunks
      for await (const chunk of stream) {
        switch (chunk.type) {
          case 'content_block_delta':
            if (chunk.delta.type === 'text_delta') {
              const textChunk = chunk.delta.text;
              fullContent += textChunk;
              
              // Send content chunk to callback (STAGE 1: Initial Claude response)
              callback({
                type: 'content',
                content: textChunk,
                conversationId: conversationId
              });
            }
            break;
            
          case 'content_block_start':
            if (chunk.content_block.type === 'tool_use') {
              toolCalls.push(chunk.content_block);
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
            // STAGE 1 COMPLETE: Initial response finished, now process tools
            break;
        }
      }

      // STAGE 2: Process tool calls and stream thinking results
      for (const toolCall of toolCalls) {
        try {
          // Send thinking start notification
          callback({
            type: 'thinking',
            thinking: {
              type: 'tool_execution',
              content: `Executing ${toolCall.name} tool...`,
              metadata: { toolName: toolCall.name, stage: 'executing' }
            },
            conversationId: conversationId
          });

          // Get auth token from supabase client session (similar to V1 pattern)
          let authToken;
          try {
            const { data: { session } } = await client.auth.getSession();
            authToken = session?.access_token;
          } catch (error) {
            console.warn('Could not get auth token from session:', error);
          }

          const toolResult = await toolRegistry.executeTool(
            toolCall.name,
            toolCall.input,
            client,
            conversationId,
            authToken,
            userId
          );
          
          if (toolCall.name === 'think') {
            // Handle think tool results specifically
            const thinkResult = toolResult as ThinkResult;
            
            const thinkingData = {
              id: thinkResult.id,
              conversationId: conversationId,
              type: 'REASONING',
              content: thinkResult.reasoning,
              metadata: {
                acknowledgment: thinkResult.acknowledgment,
                strategy: thinkResult.strategy,
                concerns: thinkResult.concerns,
                nextSteps: thinkResult.nextSteps,
                thinkingDepth: thinkResult.metadata.thinkingDepth,
                strategicValue: thinkResult.metadata.strategicValue,
                confidenceLevel: thinkResult.metadata.confidenceLevel,
                toolType: 'think'
              },
              timestamp: thinkResult.timestamp
            };
            
            extendedThoughts.push(thinkingData);
            
            // STAGE 2: Stream thinking results immediately
            callback({
              type: 'thinking',
              thinking: thinkingData,
              conversationId: conversationId
            });
          }
        } catch (error) {
          console.error(`Error executing ${toolCall.name} tool:`, error);
          callback({
            type: 'thinking',
            thinking: {
              type: 'error',
              content: `Error executing ${toolCall.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              metadata: { toolName: toolCall.name, stage: 'error' }
            },
            conversationId: conversationId
          });
        }
      }

      // STAGE 3: Get continuation response from Claude if tools were used
      let continuationContent = '';
      if (toolCalls.length > 0) {
        try {
          callback({
            type: 'thinking',
            thinking: {
              type: 'continuation',
              content: 'Generating final response based on thinking results...',
              metadata: { stage: 'continuation_start' }
            },
            conversationId: conversationId
          });

          // Build tool results for continuation
          const toolResults = toolCalls.map(toolCall => ({
            type: 'tool_result' as const,
            tool_use_id: toolCall.id,
            content: JSON.stringify({ success: true, stage: 'completed' })
          }));

          // Request continuation from Claude with tool results
          const continuationMessages: Anthropic.Messages.MessageParam[] = [
            ...messages,
            {
              role: 'assistant' as const,
              content: [
                { type: 'text', text: fullContent },
                ...toolCalls.map(toolCall => ({
                  type: 'tool_use' as const,
                  id: toolCall.id,
                  name: toolCall.name,
                  input: toolCall.input
                }))
              ]
            },
            {
              role: 'user' as const,
              content: toolResults
            }
          ];

          const continuationStream = await this.anthropic.messages.stream({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            temperature: 0.7,
            system: systemPrompt,
            messages: continuationMessages
          });

          // Stream continuation response (STAGE 3)
          for await (const chunk of continuationStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const textChunk = chunk.delta.text;
              continuationContent += textChunk;
              
              callback({
                type: 'content',
                content: textChunk,
                conversationId: conversationId
              });
            }
          }
        } catch (continuationError) {
          console.error('Continuation streaming error:', continuationError);
          callback({
            type: 'thinking',
            thinking: {
              type: 'error',
              content: 'Error generating continuation response',
              metadata: { stage: 'continuation_error' }
            },
            conversationId: conversationId
          });
        }
      }

      const thinkingTime = (Date.now() - startTime) / 1000;

      // Generate extended thinking analysis after streaming completes
      if (config.enableExtendedThinking) {
        const thinkingAnalysis = this.analyzeResponseForThinking(fullContent + continuationContent, config.thinkingBudget, conversationId);
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

      // Create assistant message with full content including continuation
      const finalContent = fullContent + continuationContent;
      const assistantMessage = {
        role: 'assistant',
        content: finalContent,
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
    conversationId: string,
    supabaseClient?: SupabaseClient
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

              // Claude Sonnet 4 request with extended thinking and tool support
        const tools = config.enableExtendedThinking ? toolRegistry.getToolDefinitions() : undefined;
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022', // Latest Claude Sonnet model
          max_tokens: 4096,
          temperature: 0.7,
          system: systemPrompt,
          messages,
          tools
        });

              // Process response and handle tool calls
        return await this.processClaudeV2Response(response, config, conversationId, userMessage, messages, supabaseClient);

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
    const availableTools = toolRegistry.getToolDefinitions();
    
    return `You are Claude Sonnet 4, an advanced AI assistant with extended thinking capabilities for PipeCD CRM.

## EXTENDED THINKING MODE: ${config.enableExtendedThinking ? 'ENABLED' : 'DISABLED'}
## THINKING BUDGET: ${config.thinkingBudget.toUpperCase()}

${config.enableExtendedThinking ? `
## AVAILABLE TOOLS

${availableTools.map(tool => `### ${tool.name}
${JSON.stringify(tool, null, 2)}`).join('\n\n')}

## THINKING PROCESS
When extended thinking is enabled, you have access to the "think" tool for complex analysis.

### When to Use the Think Tool (OPTIONAL for most requests):
- Complex business analysis requiring deep reasoning
- Multi-step strategic planning
- When you need to analyze multiple variables or trade-offs
- Before making major strategic recommendations
- When explicitly asked for detailed analysis

### When to Respond Directly (PREFERRED for simple requests):
- General questions about your capabilities ("How can you help me?")
- Simple informational requests
- Basic CRM guidance
- Quick clarifications or explanations

### Think Tool Usage (Only for Complex Requests):
For complex questions requiring deep analysis, you MAY use the think tool with these parameters:
- acknowledgment: Brief statement of what the user is asking (e.g., "The user is asking about optimizing their sales pipeline..." NOT "You are looking to optimize...")
- reasoning: Detailed analysis of the user's complex request (at least 2-3 sentences)
- strategy: Strategic approach to addressing their needs (clear methodology)
- concerns: Potential risks or limitations to consider (specific considerations)
- next_steps: Specific actionable recommendations (concrete steps)

**IMPORTANT**: The think tool is for internal reasoning. After thinking, always provide a complete, helpful response to the user.

**CRITICAL**: When using the think tool, you MUST provide meaningful, detailed content for each parameter. Never use placeholder text like "No reasoning provided" - always provide substantive analysis.

**For simple questions like "How can you help me?", respond directly with your capabilities and examples.**
` : ''}

## YOUR ROLE
You are a sophisticated CRM assistant for PipeCD that can:
- Analyze business data and relationships
- Provide strategic insights for sales and pipeline management
- Help with deal progression and customer relationship management
- Offer data-driven recommendations
- Answer questions about CRM best practices
- Guide users through PipeCD features and workflows

## THINKING BUDGET LEVELS
- STANDARD: Quick, efficient responses
- THINK: Use think tool for moderately complex requests
- THINK_HARD: Use think tool for most substantive analysis
- THINK_HARDER: Use think tool for comprehensive evaluation
- ULTRATHINK: Use think tool extensively for maximum depth

## RESPONSE GUIDELINES
- For simple queries (data lookups, straightforward questions), respond directly using available tools
- For complex analysis requiring multiple steps or trade-offs, consider using the think tool
- Be professional and business-focused
- Provide actionable insights when possible
- Use data-driven reasoning
- Consider business context and implications

**Remember**: Your goal is to be helpful and responsive. Start with direct tool usage for simple requests. Use the think tool only when genuine analysis or strategy formulation would be valuable.`;
  }

  private async processClaudeV2Response(
    response: Anthropic.Messages.Message, 
    config: any, 
    conversationId: string, 
    userMessage: string, 
    originalMessages: Anthropic.Messages.MessageParam[], 
    supabaseClient?: SupabaseClient
  ) {
    let content = '';
    const extendedThoughts: any[] = [];
    const toolResults: any[] = [];
    
    // Extract raw text content for parsing (before tool processing)
    let rawContent = '';
    for (const block of response.content) {
      if (block.type === 'text') {
        rawContent += block.text + '\n';
      }
    }
    
    // Process each content block
    for (const block of response.content) {
      if (block.type === 'text') {
        content += block.text + '\n';
      } else if (block.type === 'tool_use') {
        // Handle tool execution via registry
        try {
          const client = supabaseClient || supabase;
          
          // Get auth token from supabase client session (similar to V1 pattern)
          let authToken;
          let userId;
          try {
            const { data: { session } } = await client.auth.getSession();
            authToken = session?.access_token;
            userId = session?.user?.id;
          } catch (error) {
            console.warn('Could not get auth token from session:', error);
          }
          
          const toolResult = await toolRegistry.executeTool(
            block.name,
            block.input,
            client,
            conversationId,
            authToken,
            userId
          );
          
          if (block.name === 'think') {
            // Handle think tool results specifically
            const thinkResult = toolResult as ThinkResult;
            
            // Always use the tool result as-is (no more fallback parsing)
            extendedThoughts.push({
              id: thinkResult.id,
              conversationId: conversationId,
              type: 'REASONING',
              content: thinkResult.reasoning,
              metadata: {
                acknowledgment: thinkResult.acknowledgment,
                strategy: thinkResult.strategy,
                concerns: thinkResult.concerns,
                nextSteps: thinkResult.nextSteps,
                thinkingDepth: thinkResult.metadata.thinkingDepth,
                strategicValue: thinkResult.metadata.strategicValue,
                confidenceLevel: thinkResult.metadata.confidenceLevel,
                toolType: 'think'
              },
              timestamp: thinkResult.timestamp
            });
            
            // Add tool result to trigger continuation response from Claude
            toolResults.push({
              tool_use_id: block.id,
              content: `Thinking completed. Strategy: ${thinkResult.strategy.substring(0, 100)}...`
            });
          }
          
        } catch (error) {
          console.error(`Error executing ${block.name} tool:`, error);
          content += `\n\n*Note: ${block.name} tool encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}*\n\n`;
          
          // Add error result for continuation
          toolResults.push({
            tool_use_id: block.id,
            content: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      }
    }
    
    // If tools were used, we need to continue the conversation to get Claude's final response
    if (toolResults.length > 0) {
      try {
        console.log('🔄 Tools were used, getting continuation response from Claude...');
        console.log('🔄 Tool results count:', toolResults.length);
        
        // Build messages for continuation - need to include the original conversation history
        const continuationMessages: Anthropic.Messages.MessageParam[] = [
          ...originalMessages,
          {
            role: 'assistant' as const,
            content: response.content
          },
          {
            role: 'user' as const,
            content: toolResults.map(result => ({
              type: 'tool_result' as const,
              tool_use_id: result.tool_use_id,
              content: result.content
            }))
          }
        ];
        
        // Get Claude's continuation after tool execution
        const continuationResponse = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          temperature: 0.7,
          system: this.buildV2SystemPrompt(config),
          messages: continuationMessages
        });
        
        console.log('✅ Got continuation response from Claude');
        
        // Add the continuation content
        for (const block of continuationResponse.content) {
          if (block.type === 'text') {
            content += block.text + '\n';
          }
        }
        
      } catch (error) {
        console.error('Error getting continuation response:', error);
        content += `\n\n*Continuing analysis after thinking...*\n\nBased on my analysis, I can provide you with comprehensive recommendations for optimizing your sales pipeline and improving conversion rates.`;
      }
    }
    
    // If extended thinking is enabled but no think tools were used, analyze the response
    if (config.enableExtendedThinking && !extendedThoughts.some(t => t.metadata?.toolType === 'think')) {
      const thinkingAnalysis = this.analyzeResponseForThinking(content, config.thinkingBudget, conversationId);
      extendedThoughts.push(...thinkingAnalysis);
    }

    // Calculate confidence based on response quality and thinking depth
    const confidenceScore = this.calculateConfidenceScore(content, extendedThoughts);

    console.log('🧠 Extended thoughts generated:', extendedThoughts.length);
    console.log('🧠 Extended thoughts data:', JSON.stringify(extendedThoughts, null, 2));

    return {
      content: content.trim(),
      extendedThoughts,
      reflections: extendedThoughts.filter(t => t.metadata?.type === 'reflection'),
      planModifications: this.extractPlanModifications(extendedThoughts),
      confidenceScore
    };
  }

  private analyzeResponseForThinking(content: string, thinkingBudget: string, conversationId: string): any[] {
    // Don't create fallback thinking - this creates confusing "No reasoning provided" messages
    // Let the UI handle the case where no actual thinking was performed
    return [];
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