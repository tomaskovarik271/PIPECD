import { GraphQLError } from 'graphql';
import { supabase } from '../../../../lib/supabaseClient';
import { AgentServiceV2 } from '../../../../lib/aiAgentV2/core/AgentServiceV2';
import { 
  GraphQLContext,
  requireAuthentication,
  processZodError 
} from '../helpers';

// Initialize V2 Agent Service
const agentServiceV2 = new AgentServiceV2();

export const agentV2Resolvers = {
  Query: {
    // Get V2 conversations only
    agentV2Conversations: async (_: any, { limit = 10, offset = 0 }: { limit?: number; offset?: number }, context: GraphQLContext) => {
      const { userId } = requireAuthentication(context);

      const action = 'fetching V2 conversations';
      try {
        const { data, error } = await context.supabaseClient
          .from('agent_conversations')
          .select('*')
          .eq('user_id', userId)
          .eq('agent_version', 'v2')
          .order('updated_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          console.error('Error fetching V2 conversations:', error);
          throw new GraphQLError('Failed to fetch conversations');
        }

        return data || [];
      } catch (err) {
        throw processZodError(err, action);
      }
    },

    // Get extended thinking analysis for a conversation
    agentV2ThinkingAnalysis: async (_: any, { conversationId }: { conversationId: string }, context: GraphQLContext) => {
      const { userId } = requireAuthentication(context);

      try {
        // Verify conversation ownership and V2 status
        const { data: conversation, error: convError } = await context.supabaseClient
          .from('agent_conversations')
          .select('id, agent_version, thinking_budget')
          .eq('id', conversationId)
          .eq('user_id', userId)
          .eq('agent_version', 'v2')
          .single();

        if (convError || !conversation) {
          throw new GraphQLError('V2 conversation not found');
        }

        // Get all thoughts for analysis
        const { data: thoughts, error: thoughtsError } = await context.supabaseClient
          .from('agent_thoughts')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('timestamp', { ascending: false });

        if (thoughtsError) {
          throw new GraphQLError('Failed to fetch thoughts for analysis');
        }

        // Analyze thinking patterns
        const reasoningThoughts = thoughts?.filter(t => t.type === 'reasoning') || [];
        const strategicInsights = thoughts?.filter(t => t.strategy).map(t => t.strategy).filter(Boolean) || [];
        const identifiedConcerns = thoughts?.filter(t => t.concerns).map(t => t.concerns).filter(Boolean) || [];
        const recommendedActions = thoughts?.filter(t => t.next_steps).map(t => t.next_steps).filter(Boolean) || [];

        return {
          totalThoughts: thoughts?.length || 0,
          reasoningDepth: reasoningThoughts.length / Math.max(thoughts?.length || 1, 1),
          strategicInsights,
          identifiedConcerns,
          recommendedActions,
          thinkingBudgetUsed: conversation.thinking_budget?.toUpperCase() || 'STANDARD'
        };
      } catch (err) {
        console.error('Error in agentV2ThinkingAnalysis query:', err);
        throw new GraphQLError('Failed to analyze thinking patterns');
      }
    },

    // Get V2 thoughts with extended reasoning
    agentV2Thoughts: async (_: any, { conversationId, limit = 50 }: { conversationId: string; limit?: number }, context: GraphQLContext) => {
      const { userId } = requireAuthentication(context);

      try {
        // Verify conversation ownership
        const { data: conversation, error: convError } = await context.supabaseClient
          .from('agent_conversations')
          .select('id')
          .eq('id', conversationId)
          .eq('user_id', userId)
          .single();

        if (convError || !conversation) {
          throw new GraphQLError('Conversation not found');
        }

        const { data, error } = await context.supabaseClient
          .from('agent_thoughts')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('timestamp', { ascending: false })
          .limit(limit);

        if (error) {
          throw new GraphQLError('Failed to fetch V2 thoughts');
        }

        return data || [];
      } catch (err) {
        console.error('Error in agentV2Thoughts query:', err);
        throw new GraphQLError('Failed to fetch V2 thoughts');
      }
    }
  },

  Mutation: {
    // Send message with V2 extended thinking
    sendAgentV2Message: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      const { userId } = requireAuthentication(context);

      try {
        // Process message with V2 Agent Service
        const response = await agentServiceV2.processMessage({
          conversationId: input.conversationId,
          content: input.content,
          enableExtendedThinking: input.enableExtendedThinking,
          thinkingBudget: input.thinkingBudget.toLowerCase(),
          userId,
          supabaseClient: context.supabaseClient
        });

        return response;
      } catch (err) {
        console.error('Error in sendAgentV2Message mutation:', err);
        throw new GraphQLError('Failed to process V2 message');
      }
    },

    // Send message with V2 streaming support
    sendAgentV2MessageStream: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      const { userId } = requireAuthentication(context);

      try {
        // Generate unique session ID for this streaming request
        const sessionId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Start streaming processing asynchronously
        // This allows the mutation to return immediately while streaming continues
        process.nextTick(async () => {
          try {
            await agentServiceV2.processMessageStream({
              conversationId: input.conversationId,
              content: input.content,
              enableExtendedThinking: input.enableExtendedThinking,
              thinkingBudget: input.thinkingBudget.toLowerCase(),
              userId,
              supabaseClient: context.supabaseClient,
              streaming: true
            }, (chunk) => {
                             // TODO: Implement proper pub/sub system for real-time streaming
               // For now, streaming will work through the callback pattern
               // In production, integrate with Redis or GraphQL subscriptions
            });
                     } catch (error) {
             console.error('Streaming error:', error);
             // TODO: Publish error to subscription system when implemented
           }
        });

        return sessionId;
      } catch (err) {
        console.error('Error in sendAgentV2MessageStream mutation:', err);
        throw new GraphQLError('Failed to start V2 message streaming');
      }
    },

    // Create new V2 conversation with extended thinking enabled
    createAgentV2Conversation: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      const { userId } = requireAuthentication(context);

      try {
        const { data, error } = await context.supabaseClient
          .from('agent_conversations')
          .insert({
            user_id: userId,
            messages: [],
            plan: null,
            context: input.initialContext || {},
            agent_version: 'v2',
            extended_thinking_enabled: input.enableExtendedThinking,
            thinking_budget: input.thinkingBudget?.toLowerCase() || 'standard'
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating V2 conversation:', error);
          throw new GraphQLError('Failed to create V2 conversation');
        }

        return data;
      } catch (err) {
        console.error('Error in createAgentV2Conversation mutation:', err);
        throw new GraphQLError('Failed to create V2 conversation');
      }
    },

    // Add V2 thoughts with extended reasoning data
    addAgentV2Thoughts: async (_: any, { conversationId, thoughts }: { conversationId: string; thoughts: any[] }, context: GraphQLContext) => {
      const { userId } = requireAuthentication(context);

      try {
        // Verify conversation ownership
        const { data: conversation, error: convError } = await context.supabaseClient
          .from('agent_conversations')
          .select('id')
          .eq('id', conversationId)
          .eq('user_id', userId)
          .single();

        if (convError || !conversation) {
          throw new GraphQLError('Conversation not found');
        }

        // Insert V2 thoughts with extended data
        const thoughtsToInsert = thoughts.map(thought => ({
          conversation_id: conversationId,
          type: thought.type.toLowerCase(),
          content: thought.content,
          metadata: thought.reflectionData || {},
          reasoning: thought.reasoning,
          strategy: thought.strategy,
          concerns: thought.concerns,
          next_steps: thought.nextSteps,
          thinking_budget: thought.thinkingBudget?.toLowerCase(),
          reflection_data: thought.reflectionData || {}
        }));

        const { data, error } = await context.supabaseClient
          .from('agent_thoughts')
          .insert(thoughtsToInsert)
          .select();

        if (error) {
          console.error('Error adding V2 thoughts:', error);
          throw new GraphQLError('Failed to add V2 thoughts');
        }

        return data || [];
      } catch (err) {
        console.error('Error in addAgentV2Thoughts mutation:', err);
        throw new GraphQLError('Failed to add V2 thoughts');
      }
    }
  },

  // Field resolvers for extended types
  AgentConversation: {
    userId: (conversation: any) => conversation.user_id,
    agentVersion: (conversation: any) => conversation.agent_version || 'v1',
    extendedThinkingEnabled: (conversation: any) => conversation.extended_thinking_enabled || false,
    thinkingBudget: (conversation: any) => conversation.thinking_budget?.toUpperCase() || 'STANDARD',
    createdAt: (conversation: any) => conversation.created_at,
    updatedAt: (conversation: any) => conversation.updated_at
  },

  AgentThought: {
    conversationId: (thought: any) => thought.conversationId || thought.conversation_id,
    thinkingBudget: (thought: any) => thought.thinking_budget?.toUpperCase() || null,
    reflectionData: (thought: any) => thought.reflection_data || {},
    reasoning: (thought: any) => thought.reasoning || null,
    strategy: (thought: any) => thought.strategy || null,
    concerns: (thought: any) => thought.concerns || null,
    nextSteps: (thought: any) => thought.next_steps || null
  },

  Subscription: {
    // Subscribe to V2 streaming messages
    agentV2MessageStream: {
      // TODO: Implement subscription resolver for real-time streaming
      // This would typically use GraphQL subscriptions with WebSockets
      subscribe: () => {
        throw new GraphQLError('Streaming subscriptions not yet implemented - use polling for now');
      }
    }
  }
}; 