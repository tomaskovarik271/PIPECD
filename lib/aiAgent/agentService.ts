/**
 * PipeCD AI Agent Service
 * Core service for managing autonomous agent conversations, thoughts, and tool execution
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AIService } from './aiService';
// Phase 2 Integration: Import new infrastructure
import { ToolRegistry, ToolExecutor, type ToolExecutionContext } from './index';
import type {
  AgentConversation,
  AgentMessage,
  AgentThought,
  AgentResponse,
  MCPTool,
  MCPToolCall,
  MCPToolResponse,
  SendMessageInput,
  ConversationCreateData,
  ConversationUpdateData,
  ThoughtCreateData,
} from './types';
import {
  AgentError,
  MCPError,
  DEFAULT_AGENT_CONFIG,
} from './types';
import type { Database } from '../database.types';

export class AgentService {
  private supabase: SupabaseClient<Database>;
  private mcpEndpoint: string;
  private availableTools: Map<string, MCPTool> = new Map();
  private aiService: AIService | null = null;
  private accessToken: string | null = null;
  private emitThoughtUpdate?: (conversationId: string, thought: any) => void;
  
  // Phase 2 Integration: New infrastructure
  private toolRegistry: ToolRegistry;
  private toolExecutor: ToolExecutor;

  constructor(
    supabase: SupabaseClient<Database>,
    mcpEndpoint: string = process.env.MCP_ENDPOINT || 'http://localhost:3001'
  ) {
    this.supabase = supabase;
    this.mcpEndpoint = mcpEndpoint;
    
    // Phase 2 Integration: Initialize new infrastructure
    this.toolRegistry = new ToolRegistry();
    this.toolExecutor = new ToolExecutor({
      graphqlEndpoint: process.env.GRAPHQL_ENDPOINT || 'http://localhost:8888/.netlify/functions/graphql',
      enableLogging: true,
      enableMetrics: true,
    }, this.toolRegistry);
    
    // Initialize AI service if API key is available
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicApiKey) {
      this.aiService = new AIService({
        apiKey: anthropicApiKey,
        model: 'claude-sonnet-4-20250514', // Claude 4 Sonnet (May 2025)
        maxTokens: 4096,
        temperature: 0.7,
      });
    } else {
      console.warn('ANTHROPIC_API_KEY not found - AI responses will use placeholder mode');
    }
  }

  // Set access token for tool calls
  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  // Set callback for real-time thought updates (WebSocket/SSE integration)
  setThoughtUpdateCallback(callback: (conversationId: string, thought: any) => void) {
    this.emitThoughtUpdate = callback;
  }

  // ================================
  // Conversation Management
  // ================================

  async createConversation(data: ConversationCreateData): Promise<AgentConversation> {
    try {
      const conversationData = {
        user_id: data.userId,
        messages: JSON.stringify(data.messages || []),
        plan: data.plan ? JSON.stringify(data.plan) : null,
        context: JSON.stringify(data.context || {}),
      };

      const { data: conversation, error } = await this.supabase
        .from('agent_conversations')
        .insert(conversationData)
        .select()
        .single();

      if (error) {
        throw new AgentError('Failed to create conversation', 'CREATE_CONVERSATION_ERROR', { error });
      }

      return this.mapDbConversationToModel(conversation);
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Unexpected error creating conversation', 'UNEXPECTED_ERROR', { error });
    }
  }

  async getConversation(id: string, userId: string): Promise<AgentConversation | null> {
    try {
      const { data: conversation, error } = await this.supabase
        .from('agent_conversations')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw new AgentError('Failed to fetch conversation', 'FETCH_CONVERSATION_ERROR', { error });
      }

      return this.mapDbConversationToModel(conversation);
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Unexpected error fetching conversation', 'UNEXPECTED_ERROR', { error });
    }
  }

  async getConversations(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<AgentConversation[]> {
    try {
      const { data: conversations, error } = await this.supabase
        .from('agent_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new AgentError('Failed to fetch conversations', 'FETCH_CONVERSATIONS_ERROR', { error });
      }

      return conversations.map(this.mapDbConversationToModel);
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Unexpected error fetching conversations', 'UNEXPECTED_ERROR', { error });
    }
  }

  async updateConversation(
    id: string,
    userId: string,
    updates: ConversationUpdateData
  ): Promise<AgentConversation> {
    try {
      const updateData: any = {};
      
      if (updates.messages) {
        updateData.messages = JSON.stringify(updates.messages);
      }
      if (updates.plan) {
        updateData.plan = JSON.stringify(updates.plan);
      }
      if (updates.context) {
        updateData.context = JSON.stringify(updates.context);
      }

      const { data: conversation, error } = await this.supabase
        .from('agent_conversations')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new AgentError('Failed to update conversation', 'UPDATE_CONVERSATION_ERROR', { error });
      }

      return this.mapDbConversationToModel(conversation);
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Unexpected error updating conversation', 'UNEXPECTED_ERROR', { error });
    }
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('agent_conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw new AgentError('Failed to delete conversation', 'DELETE_CONVERSATION_ERROR', { error });
      }

      return true;
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Unexpected error deleting conversation', 'UNEXPECTED_ERROR', { error });
    }
  }

  // ================================
  // Thought Management
  // ================================

  async addThoughts(
    conversationId: string,
    thoughts: ThoughtCreateData[]
  ): Promise<AgentThought[]> {
    try {
      const thoughtsData = thoughts.map(thought => ({
        conversation_id: conversationId,
        type: thought.type,
        content: thought.content,
        metadata: JSON.stringify(thought.metadata || {}),
      }));

      const { data: createdThoughts, error } = await this.supabase
        .from('agent_thoughts')
        .insert(thoughtsData)
        .select();

      if (error) {
        throw new AgentError('Failed to add thoughts', 'ADD_THOUGHTS_ERROR', { error });
      }

      return createdThoughts.map(this.mapDbThoughtToModel);
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Unexpected error adding thoughts', 'UNEXPECTED_ERROR', { error });
    }
  }

  async getThoughts(conversationId: string, limit: number = 50): Promise<AgentThought[]> {
    try {
      const { data: thoughts, error } = await this.supabase
        .from('agent_thoughts')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true })
        .limit(limit);

      if (error) {
        throw new AgentError('Failed to fetch thoughts', 'FETCH_THOUGHTS_ERROR', { error });
      }

      return thoughts.map(this.mapDbThoughtToModel);
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Unexpected error fetching thoughts', 'UNEXPECTED_ERROR', { error });
    }
  }

  // ================================
  // MCP Tool Integration
  // ================================

  async discoverTools(): Promise<MCPTool[]> {
    // Phase 2 Integration: Use ToolRegistry instead of hardcoded tools
    return this.toolRegistry.getAllTools();
  }

  async callTool(toolCall: MCPToolCall, accessToken?: string): Promise<MCPToolResponse> {
    try {
      // Execute GraphQL operations directly instead of calling HTTP MCP server
      const toolResult = await this.executeToolDirectly(toolCall.toolName, toolCall.parameters, accessToken);
      
      return {
        success: true,
        result: toolResult.formattedMessage, // For backward compatibility, return formatted message
        metadata: { 
          timestamp: new Date().toISOString(),
          rawData: toolResult.rawData,  // Include raw data for technical details
          formattedMessage: toolResult.formattedMessage
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error calling tool',
        metadata: { error },
      };
    }
  }

  private async executeToolDirectly(toolName: string, parameters: Record<string, any>, accessToken?: string): Promise<{ formattedMessage: string; rawData: any }> {
    // Phase 2 Integration: Use ToolExecutor instead of massive switch statement
    
    // Try to get the access token from parameters first, then from supabase session
    let authToken = accessToken;
    let userId: string | undefined;
    
    if (!authToken) {
      const { data: { session } } = await this.supabase.auth.getSession();
      authToken = session?.access_token;
      userId = session?.user?.id;
    } else {
      // If we have access token, try to get user info from it
      try {
        const { data: { user } } = await this.supabase.auth.getUser(authToken);
        userId = user?.id;
      } catch (error) {
        console.warn('Could not get user from access token:', error);
      }
    }

    if (!authToken) {
      throw new Error('Authentication required - please log in');
    }

    // Create execution context with both authToken and userId
    const context: ToolExecutionContext = {
      authToken,
      userId,
      conversationId: undefined,
      requestId: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    try {
      const result = await this.toolExecutor.executeTool(toolName, parameters, context);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      // Return both formatted message and raw data
      return {
        formattedMessage: result.message || `Tool ${toolName} executed successfully`,
        rawData: result.data || null
      };
      
    } catch (error) {
      throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ================================
  // Message Processing (AI Integration)
  // ================================

  async processMessage(input: SendMessageInput, userId: string): Promise<AgentResponse> {
    try {
      // Get or create conversation
      let conversation: AgentConversation;
      
      if (input.conversationId) {
        const existing = await this.getConversation(input.conversationId, userId);
        if (!existing) {
          throw new AgentError('Conversation not found', 'CONVERSATION_NOT_FOUND');
        }
        conversation = existing;
      } else {
        conversation = await this.createConversation({
          userId,
          context: { 
            agentConfig: { ...DEFAULT_AGENT_CONFIG, ...input.config },
            lastActivity: new Date().toISOString(),
          },
        });
      }

      // Add user message
      const userMessage: AgentMessage = {
        role: 'user',
        content: input.content,
        timestamp: new Date(),
        thoughts: [],
      };

      const updatedMessages = [...conversation.messages, userMessage];

      // Get agent configuration
      const agentConfig = { ...DEFAULT_AGENT_CONFIG, ...input.config };

      // Get available tools
      let availableTools: MCPTool[] = [];
      try {
        availableTools = await this.discoverTools();
      } catch (error) {
        console.warn('Could not discover tools, continuing without them:', error);
      }

      // Generate AI response with Claude 4's autonomous reasoning
      let assistantMessage: AgentMessage;
      let aiThoughts: AgentThought[] = [];

      if (this.aiService) {
        try {
          // Let Claude 4 work completely autonomously
          const aiResponse = await this.aiService.generateResponse(
            input.content,
            conversation.messages,
            agentConfig,
            availableTools,
            { 
              ...conversation.context,
              currentUser: userId,
              conversationId: conversation.id,
            }
          );

          assistantMessage = {
            role: 'assistant',
            content: aiResponse.content,
            timestamp: new Date(),
            thoughts: [],
          };

          // Convert AI thoughts to agent thoughts
          const thoughtsToAdd = aiResponse.thoughts.map(thought => ({
            conversationId: conversation.id,
            type: thought.type as any,
            content: thought.content,
            metadata: {
              confidence: thought.confidence,
              reasoning: thought.reasoning,
              nextActions: thought.nextActions,
            },
          }));

          if (thoughtsToAdd.length > 0) {
            aiThoughts = await this.addThoughts(conversation.id, thoughtsToAdd);
          }

          // Execute any tool calls that Claude autonomously decided to make
          if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
            console.log('Claude autonomously suggested tool calls:', aiResponse.toolCalls);
            
            // Execute tools sequentially and let Claude decide next steps
            const finalResult = await this.executeSequentialWorkflow(
              aiResponse.toolCalls,
              conversation,
              input.content,
              aiResponse.content,
              updatedMessages
            );
            
            // Update the assistant message with the final result
            assistantMessage.content = finalResult.finalResponse;
            
            // All additional thoughts from sequential execution are already saved
          } else {
            // Filter out TASK_COMPLETE from initial response if no tools were called
            assistantMessage.content = aiResponse.content
              .replace(/^TASK_COMPLETE\s*/i, '') // Remove TASK_COMPLETE at start
              .replace(/\bTASK_COMPLETE\b/gi, '') // Remove any other TASK_COMPLETE occurrences
              .trim();
          }

        } catch (aiError) {
          console.error('AI service error, falling back to placeholder:', aiError);
          
          // Fallback to placeholder
          assistantMessage = {
            role: 'assistant',
            content: `I received your message: "${input.content}". I'm experiencing some technical difficulties with my AI processing, but I'm working to resolve them. Please try again in a moment.`,
            timestamp: new Date(),
            thoughts: [],
          };

          aiThoughts = await this.addThoughts(conversation.id, [{
            conversationId: conversation.id,
            type: 'reasoning',
            content: 'AI service error, provided fallback response',
            metadata: { error: aiError instanceof Error ? aiError.message : 'Unknown error' },
          }]);
        }
      } else {
        // Use placeholder implementation (no API key)
        assistantMessage = {
          role: 'assistant',
          content: `I received your message: "${input.content}". I'm currently running in placeholder mode because no AI API key is configured. To enable full AI capabilities, please set the ANTHROPIC_API_KEY environment variable.`,
          timestamp: new Date(),
          thoughts: [],
        };

        aiThoughts = await this.addThoughts(conversation.id, [{
          conversationId: conversation.id,
          type: 'reasoning',
          content: 'Running in placeholder mode - no AI API key configured',
          metadata: { userMessage: input.content },
        }]);
      }

      const finalMessages = [...updatedMessages, assistantMessage];

      // Update conversation
      conversation = await this.updateConversation(conversation.id, userId, {
        messages: finalMessages,
        context: {
          ...conversation.context,
          lastActivity: new Date().toISOString(),
        },
      });

      return {
        conversation,
        message: assistantMessage,
        thoughts: aiThoughts,
        plan: conversation.plan,
      };
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Failed to process message', 'PROCESS_MESSAGE_ERROR', { error });
    }
  }

  // ================================
  // Autonomous Tool Execution (No Hardcoded Patterns)
  // ================================

  /**
   * Execute tools sequentially, calling Claude again after each tool to decide next steps
   * This implements proper sequential workflow where tool results inform subsequent actions
   */
  private async executeSequentialWorkflow(
    initialToolCalls: Array<{ toolName: string; parameters: Record<string, any>; reasoning: string }>,
    conversation: AgentConversation,
    originalUserMessage: string,
    initialAssistantResponse: string,
    conversationHistory: AgentMessage[]
  ): Promise<{ finalResponse: string; allToolResults: string[] }> {
    let currentResponse = initialAssistantResponse;
    const allToolResults: string[] = [];
    let remainingTools = [...initialToolCalls];
    let iterationCount = 0;
    const maxIterations = 5; // Prevent infinite loops

    // Build an updated conversation history that includes tool results from this workflow
    let updatedConversationHistory = [...conversationHistory];

    while (remainingTools.length > 0 && iterationCount < maxIterations) {
      iterationCount++;
      
      // Execute the FIRST tool only (sequential execution)
      const currentTool = remainingTools[0];
      if (!currentTool) {
        break; // No more tools to execute
      }
      
      console.log(`Sequential execution - executing tool: ${currentTool.toolName}`);
      
      try {
        const toolCallRequest: MCPToolCall = {
          toolName: currentTool.toolName,
          parameters: currentTool.parameters,
          conversationId: conversation.id,
        };

        const toolResponse = await this.callTool(toolCallRequest, this.accessToken || undefined);
        let toolResultText: string;

        if (toolResponse.success) {
          toolResultText = typeof toolResponse.result === 'string' 
            ? toolResponse.result 
            : JSON.stringify(toolResponse.result, null, 2);

          // Don't add tool results to main response - we have clean AI interpretation above and raw data in technical details
          // allToolResults.push(`🔧 **${currentTool.toolName}** execution:\n${toolResultText}`);

          // Add successful tool execution thought
          await this.addThoughts(conversation.id, [{
            conversationId: conversation.id,
            type: 'tool_call',
            content: `Claude autonomously executed ${currentTool.toolName}`,
            metadata: {
              toolName: currentTool.toolName,
              parameters: currentTool.parameters,
              result: toolResponse.result,  // Formatted result for display
              rawData: toolResponse.metadata?.rawData,  // Raw data for technical details
              reasoning: currentTool.reasoning,
            },
          }]);

          // For real-time updates: emit thought immediately (future implementation for WebSockets/SSE)
          this.emitThoughtUpdate?.(conversation.id, {
            type: 'tool_call',
            content: `Claude autonomously executed ${currentTool.toolName}`,
            toolName: currentTool.toolName,
            parameters: currentTool.parameters,
            result: toolResponse.result,
            timestamp: new Date(),
          });

          // ✅ ADD TOOL RESULT TO CONVERSATION HISTORY
          updatedConversationHistory.push({
            role: 'assistant',
            content: `🔧 **${currentTool.toolName}** executed successfully:\n\n${toolResultText}`,
            timestamp: new Date(),
          });

          // ✅ SPECIAL HANDLING FOR DEAL CREATION - Extract deal ID for future reference
          if (currentTool.toolName === 'create_deal' && toolResultText.includes('Deal ID for future updates:')) {
            const dealIdMatch = toolResultText.match(/Deal ID for future updates: ([a-f0-9-]+)/);
            if (dealIdMatch) {
              const dealId = dealIdMatch[1];
              updatedConversationHistory.push({
                role: 'assistant',
                content: `📝 **IMPORTANT CONTEXT**: The deal just created has ID: ${dealId}. Use this exact ID for any future updates to this deal.`,
                timestamp: new Date(),
              });
            }
          }

        } else {
          toolResultText = `❌ **${currentTool.toolName}** failed: ${toolResponse.error}`;
          // Don't add error results to main response - errors are shown in technical details
          // allToolResults.push(toolResultText);

          await this.addThoughts(conversation.id, [{
            conversationId: conversation.id,
            type: 'observation',
            content: `Tool execution failed: ${currentTool.toolName}`,
            metadata: {
              toolName: currentTool.toolName,
              parameters: currentTool.parameters,
              error: toolResponse.error,
              reasoning: currentTool.reasoning,
            },
          }]);

          // ✅ ADD TOOL ERROR TO CONVERSATION HISTORY
          updatedConversationHistory.push({
            role: 'assistant',
            content: toolResultText,
            timestamp: new Date(),
          });
        }

        // Remove the executed tool
        remainingTools = remainingTools.slice(1);

        // Call Claude again with the tool result to see if more actions are needed
        if (this.aiService && remainingTools.length === 0) {
          // Check if the task appears to be complete based on the tool result
          const taskComplete = this.isTaskComplete(currentTool.toolName, toolResultText, originalUserMessage);
          
          console.log(`Task completion check: ${taskComplete} for tool ${currentTool.toolName} with user message: "${originalUserMessage}"`);
          
          if (taskComplete) {
            console.log('Task appears complete, generating final summary');
            
            // Generate a completion summary for the user
            const completionPrompt = `The task has been completed successfully. Here's what happened:

Tool executed: ${currentTool.toolName}
Result: ${toolResultText}

Original user request: "${originalUserMessage}"

Please provide a clear, user-friendly summary of what was accomplished. Do not include "TASK_COMPLETE" in your response - just explain what was done for the user.`;

            const completionResponse = await this.aiService.generateResponse(
              completionPrompt,
              updatedConversationHistory, // ✅ Use updated history
              { ...DEFAULT_AGENT_CONFIG },
              [], // No tools needed for completion summary
              {
                currentUser: conversation.userId,
                conversationId: conversation.id,
                currentToolResult: toolResultText,
              }
            );

            // Update current response with the completion summary
            currentResponse = completionResponse.content;
            console.log('Generated completion summary:', completionResponse.content);
            break;
          }
          
          console.log('Asking Claude for follow-up actions...');
          
          const followUpPrompt = `You just executed the tool "${currentTool.toolName}" with the following result:

${toolResultText}

Original user request: "${originalUserMessage}"

IMPORTANT CONTEXT:
- You have already executed: ${currentTool.toolName}
- This tool result contains the information you need to proceed
- Do NOT repeat the same search operations
- If you found the data you need, proceed to the next logical action

WORKFLOW EXECUTION HISTORY:
${updatedConversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n\n')}

DECISION RULES:
1. If the user requested to CREATE something and you found the required information (like organization IDs), proceed to CREATE the entity
2. If the user's request has been fulfilled completely, respond with "TASK_COMPLETE"
3. Only suggest additional tools if they are NECESSARY and DIFFERENT from what you've already done
4. NEVER repeat the same search tool with the same parameters
5. If you need to UPDATE a deal, use the EXACT deal_id from the conversation history - NEVER make up fake UUIDs
6. If you don't have the deal_id for an update, search for the deal first to get the correct ID

Based on this result and the execution history above, what is the NEXT logical step to complete the user's request? If the request is complete, respond with "TASK_COMPLETE". If you need to create something with the data you found, make the appropriate create_* tool call.`;

          const followUpResponse = await this.aiService.generateResponse(
            followUpPrompt,
            updatedConversationHistory, // ✅ Use updated history with tool results
            { ...DEFAULT_AGENT_CONFIG },
            await this.discoverTools(),
            {
              currentUser: conversation.userId,
              conversationId: conversation.id,
              currentToolResult: toolResultText,
            }
          );

          // Update current response
          currentResponse = followUpResponse.content;

          console.log('Claude follow-up response:', followUpResponse.content);
          console.log('Claude suggested tool calls:', followUpResponse.toolCalls?.length || 0);

          // Check if Claude indicates the task is complete
          if (followUpResponse.content.includes('TASK_COMPLETE') || 
              followUpResponse.content.toLowerCase().includes('task is complete') ||
              followUpResponse.content.toLowerCase().includes('request has been fulfilled')) {
            console.log('Claude indicates task is complete, stopping sequential execution');
            break;
          }

          // If Claude suggests more tools, add them to the queue
          if (followUpResponse.toolCalls && followUpResponse.toolCalls.length > 0) {
            console.log('Claude suggests additional tools after seeing results:', followUpResponse.toolCalls);
            remainingTools.push(...followUpResponse.toolCalls);

            // Add follow-up reasoning thought
            await this.addThoughts(conversation.id, [{
              conversationId: conversation.id,
              type: 'reasoning',
              content: `Claude analyzed tool results and decided to execute additional tools`,
              metadata: {
                previousTool: currentTool.toolName,
                nextTools: followUpResponse.toolCalls.map(tc => tc.toolName),
                reasoning: 'Sequential workflow continuation based on tool results',
              },
            }]);
          }
        }

      } catch (toolError) {
        console.error('Sequential tool execution error:', toolError);
        const errorText = `⚠️ **${currentTool.toolName}** error: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`;
        // Don't add error results to main response - errors are shown in technical details
        // allToolResults.push(errorText);

        await this.addThoughts(conversation.id, [{
          conversationId: conversation.id,
          type: 'observation',
          content: `Tool execution exception: ${currentTool.toolName}`,
          metadata: {
            toolName: currentTool.toolName,
            parameters: currentTool.parameters,
            exception: toolError instanceof Error ? toolError.message : 'Unknown error',
          },
        }]);

        // ✅ ADD TOOL ERROR TO CONVERSATION HISTORY
        updatedConversationHistory.push({
          role: 'assistant',
          content: errorText,
          timestamp: new Date(),
        });

        // Remove the failed tool and continue
        remainingTools = remainingTools.slice(1);
      }
    }

    // Since we removed tool results from display, just return the clean AI response
    // Filter out internal workflow signals that shouldn't be shown to users
    const cleanResponse = currentResponse
      .replace(/^TASK_COMPLETE\s*/i, '') // Remove TASK_COMPLETE at start
      .replace(/\bTASK_COMPLETE\b/gi, '') // Remove any other TASK_COMPLETE occurrences
      .trim();
    
    return {
      finalResponse: cleanResponse,
      allToolResults
    };
  }

  /**
   * Execute tools autonomously as requested by Claude 4
   * No hardcoded follow-up logic - Claude decides everything
   */
  private async executeToolsAutonomously(
    toolCalls: Array<{ toolName: string; parameters: Record<string, any>; reasoning: string }>,
    conversation: AgentConversation,
    userMessage: string,
    assistantResponse: string
  ): Promise<string[]> {
    const toolResults: string[] = [];

    for (const toolCall of toolCalls) {
      try {
        const toolCallRequest: MCPToolCall = {
          toolName: toolCall.toolName,
          parameters: toolCall.parameters,
          conversationId: conversation.id,
        };

        const toolResponse = await this.callTool(toolCallRequest, this.accessToken || undefined);

        if (toolResponse.success) {
          const resultText = typeof toolResponse.result === 'string' 
            ? toolResponse.result 
            : JSON.stringify(toolResponse.result, null, 2);

          // Don't add tool results to main response - we have clean AI interpretation above and raw data in technical details
          // toolResults.push(`🔧 **${toolCall.toolName}** execution:\n${resultText}`);

          // Add successful tool execution thought
          await this.addThoughts(conversation.id, [{
            conversationId: conversation.id,
            type: 'tool_call',
            content: `Claude autonomously executed ${toolCall.toolName}`,
            metadata: {
              toolName: toolCall.toolName,
              parameters: toolCall.parameters,
              result: toolResponse.result,  // Formatted result for display
              rawData: toolResponse.metadata?.rawData,  // Raw data for technical details
              reasoning: toolCall.reasoning,
            },
          }]);

        } else {
          // Don't add error results to main response - errors are shown in technical details
          // toolResults.push(`❌ **${toolCall.toolName}** failed: ${toolResponse.error}`);

          await this.addThoughts(conversation.id, [{
            conversationId: conversation.id,
            type: 'observation',
            content: `Tool execution failed: ${toolCall.toolName}`,
            metadata: {
              toolName: toolCall.toolName,
              parameters: toolCall.parameters,
              error: toolResponse.error,
              reasoning: toolCall.reasoning,
            },
          }]);
        }
      } catch (toolError) {
        console.error('Tool execution error:', toolError);
        // Don't add error results to main response - errors are shown in technical details
        // toolResults.push(`⚠️ **${toolCall.toolName}** error: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`);

        await this.addThoughts(conversation.id, [{
          conversationId: conversation.id,
          type: 'observation',
          content: `Tool execution exception: ${toolCall.toolName}`,
          metadata: {
            toolName: toolCall.toolName,
            parameters: toolCall.parameters,
            exception: toolError instanceof Error ? toolError.message : 'Unknown error',
          },
        }]);
      }
    }

    return toolResults;
  }

  // ================================
  // Private Helper Methods
  // ================================

  private mapDbConversationToModel(dbConversation: any): AgentConversation {
    return {
      id: dbConversation.id,
      userId: dbConversation.user_id,
      messages: JSON.parse(dbConversation.messages),
      plan: dbConversation.plan ? JSON.parse(dbConversation.plan) : undefined,
      context: JSON.parse(dbConversation.context),
      createdAt: new Date(dbConversation.created_at),
      updatedAt: new Date(dbConversation.updated_at),
    };
  }

  private mapDbThoughtToModel(dbThought: any): AgentThought {
    return {
      id: dbThought.id,
      conversationId: dbThought.conversation_id,
      type: dbThought.type,
      content: dbThought.content,
      metadata: JSON.parse(dbThought.metadata),
      timestamp: new Date(dbThought.timestamp),
    };
  }

  private isTaskComplete(toolName: string, toolResultText: string, originalUserMessage: string): boolean {
    // Deal creation requests - check if deal was successfully created
    if (originalUserMessage.toLowerCase().includes('create deal') || 
        originalUserMessage.toLowerCase().includes('rfp') ||
        originalUserMessage.toLowerCase().includes('new deal')) {
      
      if (toolName === 'create_deal' && toolResultText.includes('✅ Deal created successfully')) {
        return true; // Deal creation task is complete
      }
      // Allow intermediate steps (think, search_deals, search_organizations) to continue
      // Only complete when create_deal is actually executed successfully
      return false;
    }
    
    // Lead creation requests - check if lead was successfully created
    if (originalUserMessage.toLowerCase().includes('create lead') || 
        originalUserMessage.toLowerCase().includes('new lead') ||
        originalUserMessage.toLowerCase().includes('add lead')) {
      
      if (toolName === 'create_lead' && toolResultText.includes('✅ Lead created successfully')) {
        return true; // Lead creation task is complete
      }
      // search operations are just steps, not completion for lead creation requests
      return false;
    }
    
    // Lead conversion requests - check if lead was successfully converted
    if (originalUserMessage.toLowerCase().includes('convert lead') || 
        originalUserMessage.toLowerCase().includes('qualify lead')) {
      
      if (toolName === 'convert_lead' && toolResultText.includes('✅ Lead converted successfully')) {
        return true; // Lead conversion task is complete
      }
      if (toolName === 'qualify_lead' && toolResultText.includes('✅ Lead qualified successfully')) {
        return true; // Lead qualification task is complete
      }
      return false;
    }
    
    // PURE search/analysis requests (not creation) - complete after results
    if (originalUserMessage.toLowerCase().includes('search') ||
        originalUserMessage.toLowerCase().includes('find') ||
        originalUserMessage.includes('analyze') ||
        originalUserMessage.includes('pipeline')) {
      
      // But NOT if this is part of a creation workflow
      if (originalUserMessage.toLowerCase().includes('create') ||
          originalUserMessage.toLowerCase().includes('rfp') ||
          originalUserMessage.toLowerCase().includes('deal') ||
          originalUserMessage.toLowerCase().includes('lead')) {
        return false; // Continue with creation workflow
      }
      
      if (toolName === 'search_deals' || toolName === 'search_leads' || toolName === 'search_contacts' || 
          toolName === 'search_organizations' || toolName === 'analyze_pipeline') {
        return true; // Search/analysis task is complete after first result
      }
    }
    
    // If we just got details about something, that's usually complete
    if ((toolName === 'get_deal_details' || toolName === 'get_lead_details') && !toolResultText.includes('not found')) {
      return true;
    }
    
    return false; // Continue execution for other cases
  }
}