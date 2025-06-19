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
  streamingStage: 'initial' | 'thinking' | 'continuation' | 'complete';
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
  const [streamingStage, setStreamingStage] = useState<'initial' | 'thinking' | 'continuation' | 'complete'>('initial');
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
        messages: data.sendAgentV2Message.conversation.messages.map((msg: any, index: number) => {
          // Attach extended thoughts to the assistant message (last message)
          if (msg.role === 'assistant' && index === data.sendAgentV2Message.conversation.messages.length - 1) {
            return {
              ...msg,
              timestamp: new Date(msg.timestamp),
              thoughts: data.sendAgentV2Message.extendedThoughts || []
            };
          }
          return {
            ...msg,
            timestamp: new Date(msg.timestamp)
          };
        })
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
      setStreamingStage('initial');

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

      // Show initial thinking state
      setStreamingStage('initial');
      setStreamingContent('Claude is analyzing your question...');
      
      // Simulate initial delay to show we're processing
      await new Promise(resolve => setTimeout(resolve, 800));

      // Get the response from backend
      const { data: responseData } = await sendMessageMutation({
        variables: {
          input: {
            ...input,
            conversationId
          }
        }
      });

      if (!responseData?.sendAgentV2Message) {
        throw new Error('Failed to get response');
      }

      const aiResponse = responseData.sendAgentV2Message.message.content;
      const extendedThoughts = responseData.sendAgentV2Message.extendedThoughts || [];
      
      // Now stream the response progressively with realistic timing
      let streamedContent = '';
      
      // If we have thoughts, show thinking stage first
      if (extendedThoughts.length > 0) {
        setStreamingStage('thinking');
        setStreamingContent('🧠 Claude is thinking deeply about this...');
        
        // Stream thinking results
        for (const thought of extendedThoughts) {
          if (onChunk) {
            onChunk({
              type: 'THINKING',
              thinking: thought,
              conversationId: conversationId || 'unknown'
            });
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); // Show each thought
        }
        
        // Transition to response streaming
        setStreamingStage('continuation');
        setStreamingContent('📝 Formulating comprehensive response...');
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      
      // Stream the actual content
      setStreamingStage('initial');
      const words = aiResponse.split(' ');
      const wordsPerChunk = Math.max(1, Math.floor(words.length / 30)); // Adaptive chunking
      
      for (let i = 0; i < words.length; i += wordsPerChunk) {
        const chunk = words.slice(i, i + wordsPerChunk).join(' ') + (i + wordsPerChunk < words.length ? ' ' : '');
        streamedContent += chunk;
        setStreamingContent(streamedContent);
        
        if (onChunk) {
          onChunk({
            type: 'CONTENT',
            content: chunk,
            conversationId: conversationId || 'unknown'
          });
        }
        
        // Variable delay based on content length and position
        const baseDelay = 150;
        const variableDelay = Math.random() * 100; // Add some natural variation
        await new Promise(resolve => setTimeout(resolve, baseDelay + variableDelay));
      }

      // Complete the streaming
      setStreamingStage('complete');
      
      // Update final conversation
      const finalConversation = {
        ...responseData.sendAgentV2Message.conversation,
        createdAt: new Date(responseData.sendAgentV2Message.conversation.createdAt),
        updatedAt: new Date(responseData.sendAgentV2Message.conversation.updatedAt),
        messages: responseData.sendAgentV2Message.conversation.messages.map((msg: any, index: number) => {
          if (msg.role === 'assistant' && index === responseData.sendAgentV2Message.conversation.messages.length - 1) {
            return {
              ...msg,
              timestamp: new Date(msg.timestamp),
              thoughts: responseData.sendAgentV2Message.extendedThoughts || []
            };
          }
          return {
            ...msg,
            timestamp: new Date(msg.timestamp)
          };
        })
      };

      setCurrentConversation(finalConversation);
      
      if (onChunk) {
        onChunk({
          type: 'COMPLETE',
          conversationId: conversationId || 'unknown',
          complete: responseData.sendAgentV2Message
        });
      }
      
      await refetchConversations();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send streaming message';
      setError(errorMessage);
      throw err;
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      setStreamingStage('complete');
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
    streamingStage,
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