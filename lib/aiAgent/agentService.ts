/**
 * PipeCD AI Agent Service
 * Core service for managing autonomous agent conversations, thoughts, and tool execution
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import type {
  AgentConversation,
  AgentMessage,
  AgentThought,
  AgentPlan,
  AgentConfig,
  AgentResponse,
  MCPTool,
  MCPToolCall,
  MCPToolResponse,
  SendMessageInput,
  ConversationCreateData,
  ConversationUpdateData,
  ThoughtCreateData,
  ThinkingBudget,
} from './types';
import {
  AgentError,
  MCPError,
  DEFAULT_AGENT_CONFIG,
  THINKING_BUDGET_LIMITS,
} from './types';
import type { Database } from '../database.types';

export class AgentService {
  private supabase: SupabaseClient<Database>;
  private mcpEndpoint: string;
  private availableTools: Map<string, MCPTool> = new Map();

  constructor(
    supabase: SupabaseClient<Database>,
    mcpEndpoint: string = process.env.MCP_ENDPOINT || 'http://localhost:3001'
  ) {
    this.supabase = supabase;
    this.mcpEndpoint = mcpEndpoint;
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
    try {
      const response = await fetch(`${this.mcpEndpoint}/tools/discover`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new MCPError(`MCP server responded with ${response.status}`, undefined, {
          status: response.status,
          statusText: response.statusText,
        });
      }

      const tools = await response.json();
      
      // Cache tools for later use
      this.availableTools.clear();
      tools.forEach((tool: MCPTool) => {
        this.availableTools.set(tool.name, tool);
      });

      return tools;
    } catch (error) {
      if (error instanceof MCPError) throw error;
      throw new MCPError('Failed to discover MCP tools', undefined, { error });
    }
  }

  async callTool(toolCall: MCPToolCall): Promise<MCPToolResponse> {
    try {
      const response = await fetch(`${this.mcpEndpoint}/tools/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolName: toolCall.toolName,
          parameters: toolCall.parameters,
          conversationId: toolCall.conversationId,
          stepId: toolCall.stepId,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Tool call failed with status ${response.status}`,
          metadata: { status: response.status, statusText: response.statusText },
        };
      }

      const result = await response.json();
      return {
        success: true,
        result,
        metadata: { timestamp: new Date().toISOString() },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error calling tool',
        metadata: { error },
      };
    }
  }

  // ================================
  // Message Processing (Placeholder for AI integration)
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

      // For now, create a simple response (placeholder for actual AI integration)
      const assistantMessage: AgentMessage = {
        role: 'assistant',
        content: `I received your message: "${input.content}". I'm currently a placeholder implementation. Once integrated with Claude or other AI providers, I'll provide intelligent responses and autonomous planning capabilities.`,
        timestamp: new Date(),
        thoughts: [],
      };

      const finalMessages = [...updatedMessages, assistantMessage];

      // Update conversation
      conversation = await this.updateConversation(conversation.id, userId, {
        messages: finalMessages,
        context: {
          ...conversation.context,
          lastActivity: new Date().toISOString(),
        },
      });

      // Create thinking thoughts (placeholder)
      const thoughts = await this.addThoughts(conversation.id, [
        {
          conversationId: conversation.id,
          type: 'reasoning',
          content: 'Processing user message and determining appropriate response.',
          metadata: { userMessage: input.content },
        },
      ]);

      return {
        conversation,
        message: assistantMessage,
        thoughts,
        plan: conversation.plan,
      };
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Failed to process message', 'PROCESS_MESSAGE_ERROR', { error });
    }
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
} 