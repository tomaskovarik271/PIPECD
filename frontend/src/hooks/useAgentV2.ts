/**
 * useAgentV2 Hook
 * Custom hook for AI Agent V2 operations with Claude Sonnet 4 extended thinking
 */

import { useState, useCallback, useRef } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  CREATE_AGENT_V2_CONVERSATION,
  SEND_AGENT_V2_MESSAGE,
  SEND_AGENT_V2_MESSAGE_STREAM,
  GET_AGENT_V2_CONVERSATIONS,
  GET_AGENT_V2_THOUGHTS,
  type AgentV2Conversation,
  type AgentV2Message,
  type AgentV2Thought,
  type SendAgentV2MessageInput,
  type SendAgentV2MessageStreamInput,
  type CreateAgentV2ConversationInput,
  type AgentV2StreamChunk,
} from '../lib/graphql/agentV2Operations';

export interface UseAgentV2Return {
  // State
  currentConversation: AgentV2Conversation | null;
  conversations: AgentV2Conversation[];
  thoughts: AgentV2Thought[];
  isLoading: boolean;
  isSendingMessage: boolean;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  
  // Actions
  createConversation: (input: CreateAgentV2ConversationInput) => Promise<AgentV2Conversation>;
  sendMessage: (input: SendAgentV2MessageInput) => Promise<void>;
  sendMessageStream: (
    input: SendAgentV2MessageStreamInput,
    onChunk?: (chunk: AgentV2StreamChunk) => void
  ) => Promise<void>;
  setCurrentConversation: (conversation: AgentV2Conversation | null) => void;
  clearError: () => void;
  
  // Data
  refetchConversations: () => Promise<any>;
}

export function useAgentV2(): UseAgentV2Return {
  // Local state
  const [currentConversation, setCurrentConversation] = useState<AgentV2Conversation | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  // GraphQL hooks
  const [createConversationMutation] = useMutation(CREATE_AGENT_V2_CONVERSATION);
  const [sendMessageMutation] = useMutation(SEND_AGENT_V2_MESSAGE);
  const [sendMessageStreamMutation] = useMutation(SEND_AGENT_V2_MESSAGE_STREAM);
  
  const { 
    data: conversationsData, 
    loading: isLoadingConversations,
    refetch: refetchConversations 
  } = useQuery(GET_AGENT_V2_CONVERSATIONS, {
    variables: { limit: 50, offset: 0 },
    fetchPolicy: 'cache-and-network'
  });

  const { 
    data: thoughtsData,
    loading: isLoadingThoughts 
  } = useQuery(GET_AGENT_V2_THOUGHTS, {
    variables: { 
      conversationId: currentConversation?.id || '',
      limit: 100 
    },
    skip: !currentConversation?.id,
    fetchPolicy: 'cache-and-network'
  });

  // Derived state
  const conversations = conversationsData?.agentV2Conversations || [];
  const thoughts = thoughtsData?.agentV2Thoughts || [];
  const isLoading = isLoadingConversations || isLoadingThoughts;

  // Actions
  const createConversation = useCallback(async (input: CreateAgentV2ConversationInput): Promise<AgentV2Conversation> => {
    try {
      setError(null);
      const { data } = await createConversationMutation({
        variables: { input }
      });

      if (!data?.createAgentV2Conversation) {
        throw new Error('Failed to create conversation');
      }

      const newConversation = {
        ...data.createAgentV2Conversation,
        createdAt: new Date(data.createAgentV2Conversation.createdAt),
        updatedAt: new Date(data.createAgentV2Conversation.updatedAt),
        messages: data.createAgentV2Conversation.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };

      setCurrentConversation(newConversation);
      
      // Refetch conversations to update the list
      await refetchConversations();
      
      return newConversation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation';
      setError(errorMessage);
      throw err;
    }
  }, [createConversationMutation, refetchConversations]);

  const sendMessage = useCallback(async (input: SendAgentV2MessageInput): Promise<void> => {
    try {
      setError(null);
      setIsSendingMessage(true);

      // If no conversation exists, create one first
      let conversationId = input.conversationId;
      if (!conversationId && !currentConversation) {
        const newConversation = await createConversation({
          enableExtendedThinking: input.enableExtendedThinking,
          thinkingBudget: input.thinkingBudget,
          initialContext: {}
        });
        conversationId = newConversation.id;
      } else if (!conversationId && currentConversation) {
        conversationId = currentConversation.id;
      }

      const { data } = await sendMessageMutation({
        variables: {
          input: {
            ...input,
            conversationId
          }
        }
      });

      if (!data?.sendAgentV2Message) {
        throw new Error('Failed to send message');
      }

      // Update current conversation with response
      const updatedConversation = {
        ...data.sendAgentV2Message.conversation,
        createdAt: new Date(data.sendAgentV2Message.conversation.createdAt),
        updatedAt: new Date(data.sendAgentV2Message.conversation.updatedAt),
        messages: data.sendAgentV2Message.conversation.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };

      setCurrentConversation(updatedConversation);
      
      // Refetch conversations to update the list
      await refetchConversations();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSendingMessage(false);
    }
  }, [sendMessageMutation, createConversation, currentConversation, refetchConversations]);

  const sendMessageStream = useCallback(async (
    input: SendAgentV2MessageStreamInput,
    onChunk?: (chunk: AgentV2StreamChunk) => void
  ): Promise<void> => {
    try {
      setError(null);
      setIsStreaming(true);
      setStreamingContent('');

      // If no conversation exists, create one first
      let conversationId = input.conversationId;
      if (!conversationId && !currentConversation) {
        const newConversation = await createConversation({
          enableExtendedThinking: input.enableExtendedThinking,
          thinkingBudget: input.thinkingBudget,
          initialContext: {}
        });
        conversationId = newConversation.id;
      } else if (!conversationId && currentConversation) {
        conversationId = currentConversation.id;
      }

      // Start streaming mutation
      const { data } = await sendMessageStreamMutation({
        variables: {
          input: {
            ...input,
            conversationId
          }
        }
      });

      if (!data?.sendAgentV2MessageStream) {
        throw new Error('Failed to start message streaming');
      }

      // For now, since we don't have WebSocket subscriptions implemented,
      // we'll simulate streaming by polling or use the regular mutation
      // TODO: Implement proper WebSocket subscriptions for real-time streaming
      
      // Fallback to regular message sending for now
      await sendMessage({
        conversationId,
        content: input.content,
        enableExtendedThinking: input.enableExtendedThinking,
        thinkingBudget: input.thinkingBudget
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send streaming message';
      setError(errorMessage);
      throw err;
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [sendMessageStreamMutation, createConversation, currentConversation, sendMessage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    currentConversation,
    conversations,
    thoughts,
    isLoading,
    isSendingMessage,
    isStreaming,
    streamingContent,
    error,
    
    // Actions
    createConversation,
    sendMessage,
    sendMessageStream,
    setCurrentConversation,
    clearError,
    
    // Data
    refetchConversations
  };
} 