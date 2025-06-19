import { supabase } from '../../supabaseClient';
import Anthropic from '@anthropic-ai/sdk';
import { SupabaseClient } from '@supabase/supabase-js';
import { toolRegistry } from '../tools/ToolRegistry';

export interface AgentV2MessageInput {
  conversationId?: string;
  content: string;
  userId: string;
  supabaseClient?: SupabaseClient;
  accessToken?: string;
}

export interface AgentV2Response {
  conversation: any;
  message: any;
  toolExecutions?: any[];
}

export interface AgentV2StreamChunk {
  type: 'content' | 'complete' | 'error';
  content?: string;
  conversationId: string;
  complete?: AgentV2Response;
  error?: string;
}

export type StreamCallback = (chunk: AgentV2StreamChunk) => void;

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
    // Non-streaming mode removed - use processMessageStream instead
    throw new Error('Non-streaming mode removed. Use processMessageStream instead.');
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
        // Create new V2 conversation
        const { data, error } = await client
          .from('agent_conversations')
          .insert({
            user_id: input.userId,
            messages: [],
            plan: null,
            context: {},
            agent_version: 'v2'
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
        conversation.id,
        conversation,
        client,
        input.userId,
        callback,
        input.accessToken
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
    conversationId: string,
    conversation: any,
    client: SupabaseClient,
    userId: string,
    callback: StreamCallback,
    accessToken?: string
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

      // Claude Sonnet 4 streaming request with tool support
      const tools = toolRegistry.getToolDefinitions();
      const systemPrompt = this.buildV2SystemPrompt();
      
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
      const toolExecutions: any[] = []; // Track tool executions for frontend display

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
              console.log('🔧 Tool use detected during streaming:', chunk.content_block.name);
              toolCalls.push(chunk.content_block);
            }
            break;
            
          case 'message_start':
            // Message started - no special handling needed
            break;
            
          case 'message_stop':
            // STAGE 1 COMPLETE: Initial response finished, now process tools
            break;
        }
      }

      // STAGE 2: Process tool calls and stream thinking results
      const toolResultsMap = new Map(); // Store actual tool results by tool ID
      
      console.log('🔄 STAGE 2: Processing tool calls, found:', toolCalls.length, 'tools');
      
      for (const toolCall of toolCalls) {
        const toolStartTime = Date.now();
        try {
          // Use access token from parameter (preferred) or try to get from session
          let authToken = accessToken;
          let userIdForAuth = userId || 'anonymous'; // Use parameter userId with fallback
          if (!authToken) {
            try {
              const { data: { session } } = await client.auth.getSession();
              authToken = session?.access_token;
              userIdForAuth = userId || session?.user?.id || 'anonymous';
            } catch (error) {
              console.warn('Could not get auth token from session:', error);
            }
          }

          const toolResult = await toolRegistry.executeTool(
            toolCall.name,
            toolCall.input,
            client,
            conversationId,
            authToken,
            userIdForAuth
          );
          const toolEndTime = Date.now();
          const executionDuration = toolEndTime - toolStartTime;
          
          // Capture tool execution metadata for frontend display
          toolExecutions.push({
            id: toolCall.id,
            name: toolCall.name,
            input: toolCall.input,
            result: toolResult,
            executionTime: executionDuration,
            timestamp: new Date().toISOString(),
            status: 'SUCCESS'
          });
          
          // Store the actual tool result for continuation
          toolResultsMap.set(toolCall.id, toolResult);
        } catch (error) {
          console.error(`Error executing ${toolCall.name} tool:`, error);
          
          const toolEndTime = Date.now();
          const executionDuration = toolEndTime - toolStartTime;
          
          // Capture failed tool execution metadata for frontend display
          toolExecutions.push({
            id: toolCall.id,
            name: toolCall.name,
            input: toolCall.input,
            result: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            executionTime: executionDuration,
            timestamp: new Date().toISOString(),
            status: 'ERROR'
          });
          
          // Tool error is captured in toolExecutions - no need for special thinking callback
        }
      }

      // STAGE 3: Get continuation response from Claude if tools were used
      let continuationContent = '';
      console.log('🔄 STAGE 3: Checking for continuation, toolCalls.length:', toolCalls.length);
      if (toolCalls.length > 0) {
        try {
          // Build tool results for continuation
          const toolResults = toolCalls.map(toolCall => ({
            type: 'tool_result' as const,
            tool_use_id: toolCall.id,
            content: JSON.stringify(toolResultsMap.get(toolCall.id) || { success: true, stage: 'completed' })
          }));
          
          console.log('🔄 Tool results being passed to Claude:', toolResults.map(r => ({ 
            id: r.tool_use_id, 
            contentPreview: r.content.substring(0, 100) + '...' 
          })));

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
            messages: continuationMessages,
            tools: toolRegistry.getToolDefinitions()
          });

          // Process continuation stream - might include additional tool calls
          const continuationToolCalls: any[] = [];
          const continuationToolResultsMap = new Map();
          
          for await (const chunk of continuationStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const textChunk = chunk.delta.text;
              continuationContent += textChunk;
              
              callback({
                type: 'content',
                content: textChunk,
                conversationId: conversationId
              });
            } else if (chunk.type === 'content_block_start' && chunk.content_block.type === 'tool_use') {
              // Track additional tool calls in continuation
              continuationToolCalls.push({
                id: chunk.content_block.id,
                name: chunk.content_block.name,
                input: chunk.content_block.input
              });
            }
          }
          
          // Execute any additional tools from continuation (like search_deals after thinking)
          if (continuationToolCalls.length > 0) {
            console.log('🔄 Continuation had tools, executing them...', continuationToolCalls.map(t => t.name));
            
            for (const toolCall of continuationToolCalls) {
              const toolStartTime = Date.now();
              try {
                const toolResult = await toolRegistry.executeTool(
                  toolCall.name,
                  toolCall.input,
                  client,
                  conversationId,
                  accessToken,
                  userId
                );
                
                const toolEndTime = Date.now();
                const executionDuration = toolEndTime - toolStartTime;
                
                // Add to tool executions for UI display
                toolExecutions.push({
                  id: toolCall.id,
                  name: toolCall.name,
                  input: toolCall.input,
                  result: toolResult,
                  executionTime: executionDuration,
                  timestamp: new Date().toISOString(),
                  status: 'SUCCESS'
                });
                
                // Store result for final continuation
                continuationToolResultsMap.set(toolCall.id, toolResult);
                
              } catch (error) {
                console.error(`Error executing continuation tool ${toolCall.name}:`, error);
                const toolEndTime = Date.now();
                const executionDuration = toolEndTime - toolStartTime;
                
                toolExecutions.push({
                  id: toolCall.id,
                  name: toolCall.name,
                  input: toolCall.input,
                  result: null,
                  error: error instanceof Error ? error.message : 'Unknown error',
                  executionTime: executionDuration,
                  timestamp: new Date().toISOString(),
                  status: 'ERROR'
                });
                
                continuationToolResultsMap.set(toolCall.id, { error: error instanceof Error ? error.message : 'Unknown error' });
              }
            }
            
            // Get final response after executing continuation tools
            try {
              console.log('🔄 Getting final response after continuation tools...');
              
              const finalMessages: Anthropic.Messages.MessageParam[] = [
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
                },
                {
                  role: 'assistant' as const,
                  content: [
                    { type: 'text', text: continuationContent },
                    ...continuationToolCalls.map(toolCall => ({
                      type: 'tool_use' as const,
                      id: toolCall.id,
                      name: toolCall.name,
                      input: toolCall.input
                    }))
                  ]
                },
                {
                  role: 'user' as const,
                  content: continuationToolCalls.map(toolCall => ({
                    type: 'tool_result' as const,
                    tool_use_id: toolCall.id,
                    content: JSON.stringify(continuationToolResultsMap.get(toolCall.id) || { success: true })
                  }))
                }
              ];
              
              const finalResponse = await this.anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                temperature: 0.7,
                system: systemPrompt,
                messages: finalMessages,
                tools: toolRegistry.getToolDefinitions()
              });
              
              // Stream final response
              for await (const chunk of finalResponse.content) {
                if (chunk.type === 'text') {
                  const textChunk = chunk.text;
                  continuationContent += textChunk;
                  
                  callback({
                    type: 'content',
                    content: textChunk,
                    conversationId: conversationId
                  });
                }
              }
              
              console.log('✅ Got final response after continuation tools');
              
            } catch (finalError) {
              console.error('Error getting final continuation response:', finalError);
            }
          }
        } catch (error) {
          console.error('Continuation streaming error:', error);
        }
      }

      const thinkingTime = (Date.now() - startTime) / 1000;

      // Create assistant message with full content including continuation
      const finalContent = fullContent + continuationContent;
      const assistantMessage = {
        role: 'assistant',
        content: finalContent,
        timestamp: new Date().toISOString(),
        thoughts: [],
        toolExecutions: toolExecutions
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
        toolExecutions: toolExecutions
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
    supabaseClient?: SupabaseClient,
    accessToken?: string,
    userId?: string
  ) {
    // Removed - non-streaming mode no longer supported
    throw new Error('Non-streaming mode removed');
  }

  private buildV2SystemPrompt(): string {
    // Simplified system prompt - thinking budget no longer used
    const availableTools = toolRegistry.getToolDefinitions();
    
    return `You are Claude Sonnet 4, an advanced AI assistant for PipeCD CRM.

## AVAILABLE TOOLS

${availableTools.map(tool => `### ${tool.name}
${JSON.stringify(tool, null, 2)}`).join('\n\n')}

## THINKING PROCESS
You have access to the "think" tool for complex analysis.

### When to Use the Think Tool:
- Complex business analysis requiring deep reasoning
- Multi-step strategic planning
- When you need to analyze multiple variables or trade-offs
- Before making major strategic recommendations
- Pipeline performance questions requiring data analysis

### When to Respond Directly:
- General questions about your capabilities ("How can you help me?")
- Simple informational requests
- Basic CRM guidance that doesn't require data analysis
- Quick clarifications or explanations

**CRITICAL WORKFLOW**: After using the think tool for analytical questions:
1. **ALWAYS** follow up by executing relevant business tools to gather data
2. For pipeline questions: use search_deals to analyze current pipeline state
3. For customer questions: use search tools to gather customer data
4. For performance questions: gather relevant business metrics
5. Then provide data-driven recommendations based on actual system data

## YOUR ROLE
You are a sophisticated CRM assistant for PipeCD that can:
- Analyze business data and relationships
- Provide strategic insights for sales and pipeline management
- Help with deal progression and customer relationship management
- Offer data-driven recommendations
- Answer questions about CRM best practices
- Guide users through PipeCD features and workflows

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
    supabaseClient?: SupabaseClient,
    accessToken?: string,
    userId?: string
  ) {
    // Removed - non-streaming mode no longer supported
    throw new Error('Non-streaming mode removed');
  }

  private calculateConfidenceScore(content: string, thoughts: any[]): number {
    // Removed - confidence scoring no longer used
    return 0.8;
  }
}