/**
 * GraphQL Resolvers for AI Agent System
 * Handles queries and mutations for agent conversations, thoughts, and tool discovery
 */

import { GraphQLError } from 'graphql';
import { supabase } from '../../../../lib/supabaseClient';
import { AgentService } from '../../../../lib/aiAgent/agentService';
import type {
  QueryResolvers,
  MutationResolvers,
  AgentConversation as GraphQLAgentConversation,
  AgentThought as GraphQLAgentThought,
  AgentResponse as GraphQLAgentResponse,
} from '../../../../lib/generated/graphql';
import type {
  GraphQLContext,
  getAccessToken,
  processZodError,
  requireAuthentication
} from '../helpers';

// Initialize agent service
let agentService: AgentService;

const getAgentService = (context: GraphQLContext): AgentService => {
  if (!agentService) {
    const accessToken = getAccessToken(context);
    const supabaseWithAuth = supabase;
    if (accessToken) {
      supabaseWithAuth.auth.setSession({
        access_token: accessToken,
        refresh_token: '', // Not needed for this use case
      });
    }
    agentService = new AgentService(supabaseWithAuth);
  }
  return agentService;
};

// ================================
// Query Resolvers
// ================================

export const agentQueries: Pick<QueryResolvers<GraphQLContext>, 
  'agentConversations' | 'agentConversation' | 'agentThoughts' | 'discoverAgentTools'
> = {
  agentConversations: async (_parent, args, context) => {
    const action = 'fetching agent conversations';
    try {
      requireAuthentication(context);
      const service = getAgentService(context);
      const userId = context.currentUser!.id;
      
      const conversations = await service.getConversations(
        userId,
        args.limit || 10,
        args.offset || 0
      );

      return conversations.map(conv => ({
        id: conv.id,
        userId: conv.userId,
        messages: conv.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          thoughts: msg.thoughts || [],
        })),
        plan: conv.plan ? {
          goal: conv.plan.goal,
          steps: conv.plan.steps.map(step => ({
            id: step.id,
            description: step.description,
            toolName: step.toolName || null,
            parameters: step.parameters || null,
            dependencies: step.dependencies || [],
            status: step.status.toUpperCase(),
            result: step.result || null,
          })),
          context: conv.plan.context,
        } : null,
        context: conv.context,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
      })) as GraphQLAgentConversation[];
    } catch (error) {
      throw processZodError(error, action);
    }
  },

  agentConversation: async (_parent, args, context) => {
    const action = 'fetching agent conversation by ID';
    try {
      requireAuthentication(context);
      const service = getAgentService(context);
      const userId = context.currentUser!.id;
      
      const conversation = await service.getConversation(args.id, userId);
      if (!conversation) return null;

      return {
        id: conversation.id,
        userId: conversation.userId,
        messages: conversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          thoughts: msg.thoughts || [],
        })),
        plan: conversation.plan ? {
          goal: conversation.plan.goal,
          steps: conversation.plan.steps.map(step => ({
            id: step.id,
            description: step.description,
            toolName: step.toolName || null,
            parameters: step.parameters || null,
            dependencies: step.dependencies || [],
            status: step.status.toUpperCase(),
            result: step.result || null,
          })),
          context: conversation.plan.context,
        } : null,
        context: conversation.context,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
      } as GraphQLAgentConversation;
    } catch (error) {
      throw processZodError(error, action);
    }
  },

  agentThoughts: async (_parent, args, context) => {
    const action = 'fetching agent thoughts';
    try {
      requireAuthentication(context);
      const service = getAgentService(context);
      
      const thoughts = await service.getThoughts(args.conversationId, args.limit || 50);
      
      return thoughts.map(thought => ({
        id: thought.id,
        conversationId: thought.conversationId,
        type: thought.type.toUpperCase(),
        content: thought.content,
        metadata: thought.metadata,
        timestamp: thought.timestamp.toISOString(),
      })) as GraphQLAgentThought[];
    } catch (error) {
      throw processZodError(error, action);
    }
  },

  discoverAgentTools: async (_parent, _args, context) => {
    const action = 'discovering agent tools';
    try {
      requireAuthentication(context);
      const service = getAgentService(context);
      
      try {
        const tools = await service.discoverTools();
        return {
          tools: tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          })),
          error: null,
        };
      } catch (error) {
        console.error('Tool discovery failed:', error);
        return {
          tools: [],
          error: error instanceof Error ? error.message : 'Unknown error discovering tools',
        };
      }
    } catch (error) {
      throw processZodError(error, action);
    }
  },
};

// ================================
// Mutation Resolvers
// ================================

export const agentMutations: Pick<MutationResolvers<GraphQLContext>,
  'sendAgentMessage' | 'createAgentConversation' | 'updateAgentConversation' | 
  'addAgentThoughts' | 'deleteAgentConversation' | 'executeAgentStep'
> = {
  sendAgentMessage: async (_parent, args, context) => {
    const action = 'sending agent message';
    try {
      requireAuthentication(context);
      const service = getAgentService(context);
      const userId = context.currentUser!.id;
      
      const response = await service.processMessage(args.input, userId);
      
      return {
        conversation: {
          id: response.conversation.id,
          userId: response.conversation.userId,
          messages: response.conversation.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
            thoughts: msg.thoughts || [],
          })),
          plan: response.conversation.plan ? {
            goal: response.conversation.plan.goal,
            steps: response.conversation.plan.steps.map(step => ({
              id: step.id,
              description: step.description,
              toolName: step.toolName || null,
              parameters: step.parameters || null,
              dependencies: step.dependencies || [],
              status: step.status.toUpperCase(),
              result: step.result || null,
            })),
            context: response.conversation.plan.context,
          } : null,
          context: response.conversation.context,
          createdAt: response.conversation.createdAt.toISOString(),
          updatedAt: response.conversation.updatedAt.toISOString(),
        },
        message: {
          role: response.message.role,
          content: response.message.content,
          timestamp: response.message.timestamp.toISOString(),
          thoughts: response.message.thoughts || [],
        },
        thoughts: response.thoughts.map(thought => ({
          id: thought.id,
          conversationId: thought.conversationId,
          type: thought.type.toUpperCase(),
          content: thought.content,
          metadata: thought.metadata,
          timestamp: thought.timestamp.toISOString(),
        })),
        plan: response.plan ? {
          goal: response.plan.goal,
          steps: response.plan.steps.map(step => ({
            id: step.id,
            description: step.description,
            toolName: step.toolName || null,
            parameters: step.parameters || null,
            dependencies: step.dependencies || [],
            status: step.status.toUpperCase(),
            result: step.result || null,
          })),
          context: response.plan.context,
        } : null,
      } as GraphQLAgentResponse;
    } catch (error) {
      throw processZodError(error, action);
    }
  },

  createAgentConversation: async (_parent, args, context) => {
    const action = 'creating agent conversation';
    try {
      requireAuthentication(context);
      const service = getAgentService(context);
      const userId = context.currentUser!.id;
      
      const conversation = await service.createConversation({
        userId,
        context: {
          agentConfig: args.config || {},
          lastActivity: new Date().toISOString(),
        },
      });

      return {
        id: conversation.id,
        userId: conversation.userId,
        messages: conversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          thoughts: msg.thoughts || [],
        })),
        plan: conversation.plan ? {
          goal: conversation.plan.goal,
          steps: conversation.plan.steps.map(step => ({
            id: step.id,
            description: step.description,
            toolName: step.toolName || null,
            parameters: step.parameters || null,
            dependencies: step.dependencies || [],
            status: step.status.toUpperCase(),
            result: step.result || null,
          })),
          context: conversation.plan.context,
        } : null,
        context: conversation.context,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
      } as GraphQLAgentConversation;
    } catch (error) {
      throw processZodError(error, action);
    }
  },

  updateAgentConversation: async (_parent, args, context) => {
    const action = 'updating agent conversation';
    try {
      requireAuthentication(context);
      const service = getAgentService(context);
      const userId = context.currentUser!.id;
      
      const conversation = await service.updateConversation(
        args.input.conversationId,
        userId,
        {
          plan: args.input.plan ? JSON.parse(JSON.stringify(args.input.plan)) : undefined,
          context: args.input.context ? JSON.parse(JSON.stringify(args.input.context)) : undefined,
        }
      );

      return {
        id: conversation.id,
        userId: conversation.userId,
        messages: conversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          thoughts: msg.thoughts || [],
        })),
        plan: conversation.plan ? {
          goal: conversation.plan.goal,
          steps: conversation.plan.steps.map(step => ({
            id: step.id,
            description: step.description,
            toolName: step.toolName || null,
            parameters: step.parameters || null,
            dependencies: step.dependencies || [],
            status: step.status.toUpperCase(),
            result: step.result || null,
          })),
          context: conversation.plan.context,
        } : null,
        context: conversation.context,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
      } as GraphQLAgentConversation;
    } catch (error) {
      throw processZodError(error, action);
    }
  },

  addAgentThoughts: async (_parent, args, context) => {
    const action = 'adding agent thoughts';
    try {
      requireAuthentication(context);
      const service = getAgentService(context);
      
      const thoughts = await service.addThoughts(
        args.conversationId,
        args.thoughts.map(thought => ({
          conversationId: args.conversationId,
          type: thought.type.toLowerCase() as any,
          content: thought.content,
          metadata: thought.metadata || {},
        }))
      );

      return thoughts.map(thought => ({
        id: thought.id,
        conversationId: thought.conversationId,
        type: thought.type.toUpperCase(),
        content: thought.content,
        metadata: thought.metadata,
        timestamp: thought.timestamp.toISOString(),
      })) as GraphQLAgentThought[];
    } catch (error) {
      throw processZodError(error, action);
    }
  },

  deleteAgentConversation: async (_parent, args, context) => {
    const action = 'deleting agent conversation';
    try {
      requireAuthentication(context);
      const service = getAgentService(context);
      const userId = context.currentUser!.id;
      
      return await service.deleteConversation(args.id, userId);
    } catch (error) {
      throw processZodError(error, action);
    }
  },

  executeAgentStep: async (_parent, args, context) => {
    const action = 'executing agent step';
    try {
      requireAuthentication(context);
      // This is a placeholder for step execution logic
      // In a full implementation, this would execute a specific plan step
      throw new GraphQLError('Step execution not yet implemented', {
        extensions: { code: 'NOT_IMPLEMENTED' }
      });
    } catch (error) {
      throw processZodError(error, action);
    }
  },
}; 