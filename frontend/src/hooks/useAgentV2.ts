/**
 * useAgentV2 Hook
 * Custom hook for AI Agent V2 operations with Claude Sonnet 4 extended thinking
 */

import { useState, useCallback, useRef } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  CREATE_AGENT_V2_CONVERSATION,
  SEND_AGENT_V2_MESSAGE,
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

      // Add user message to conversation immediately
      if (currentConversation) {
        const userMessage = {
          role: 'user' as const,
          content: input.content,
          timestamp: new Date(),
          thoughts: []
        };
        
        const updatedConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, userMessage],
          updatedAt: new Date()
        };
        
        setCurrentConversation(updatedConversation);
      }

      // Get the AI response in the background
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

      // Get the AI response content
      const aiResponse = data.sendAgentV2Message.message.content;
      
      // Simulate streaming by updating content character by character
      let streamedContent = '';
      const streamDelay = Math.max(10, Math.min(50, 1000 / aiResponse.length)); // Adaptive delay based on response length
      
      for (let i = 0; i < aiResponse.length; i++) {
        streamedContent += aiResponse[i];
        setStreamingContent(streamedContent);
        
        // Call onChunk callback if provided
        if (onChunk) {
          onChunk({
            type: 'CONTENT',
            content: aiResponse[i],
            conversationId: conversationId || 'unknown'
          });
        }
        
        // Add delay for streaming effect
        await new Promise(resolve => setTimeout(resolve, streamDelay));
      }

      // Stream complete - update the full conversation
      const finalConversation = {
        ...data.sendAgentV2Message.conversation,
        createdAt: new Date(data.sendAgentV2Message.conversation.createdAt),
        updatedAt: new Date(data.sendAgentV2Message.conversation.updatedAt),
        messages: data.sendAgentV2Message.conversation.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };

      setCurrentConversation(finalConversation);
      
      // Call completion callback
      if (onChunk) {
        onChunk({
          type: 'COMPLETE',
          conversationId: conversationId || 'unknown',
          complete: data.sendAgentV2Message
        });
      }
      
      // Refetch conversations to update the list
      await refetchConversations();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send streaming message';
      setError(errorMessage);
      throw err;
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [sendMessageMutation, createConversation, currentConversation, refetchConversations]);

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