/**
 * useAgentV2 Hook
 * Custom hook for AI Agent V2 operations with Claude Sonnet 4 integration
 */

import { useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useMutation, useQuery } from '@apollo/client';
import {
  CREATE_AGENT_V2_CONVERSATION,
  SEND_AGENT_V2_MESSAGE,
  GET_AGENT_V2_CONVERSATIONS,
  type AgentV2Conversation,
  type AgentV2Message,
  type SendAgentV2MessageInput,
  type SendAgentV2MessageStreamInput,
  type CreateAgentV2ConversationInput,
  type AgentV2StreamChunk,
} from '../lib/graphql/agentV2Operations';

export interface UseAgentV2Return {
  // State
  currentConversation: AgentV2Conversation | null;
  conversations: AgentV2Conversation[];
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

  // Derived state
  const conversations = conversationsData?.agentV2Conversations || [];
  const isLoading = isLoadingConversations;

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
              thoughts: data.sendAgentV2Message.extendedThoughts || [],
              toolExecutions: data.sendAgentV2Message.toolExecutions || []
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
          initialContext: {}
        });
        conversationId = newConversation.id;
      } else if (!conversationId && currentConversation) {
        conversationId = currentConversation.id;
      }

      // For streaming, don't add user message to conversation immediately
      // Let the backend response handle adding both user and assistant messages
      // This ensures the assistant message will be the latest during streaming

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
      const toolExecutions = responseData.sendAgentV2Message.toolExecutions || [];
      
      // Create a temporary conversation for streaming display
      const tempConversation = {
        ...responseData.sendAgentV2Message.conversation,
        createdAt: new Date(responseData.sendAgentV2Message.conversation.createdAt),
        updatedAt: new Date(responseData.sendAgentV2Message.conversation.updatedAt),
        messages: [
          // User message
          {
            role: 'user' as const,
            content: input.content,
            timestamp: new Date()
          },
          // Assistant message (placeholder for streaming)
          {
            role: 'assistant' as const,
            content: '', // Will be updated as we stream
            timestamp: new Date()
          }
        ]
      };
      
      // Set the temporary conversation immediately so component can render
      setCurrentConversation(tempConversation);
      
      // Now stream the response progressively with realistic timing
      let streamedContent = '';
      
      // Show thinking stage if there are tool executions
      if (toolExecutions.length > 0) {
        setStreamingStage('thinking');
        setStreamingContent('🧠 Claude is analyzing and executing tools...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Transition to response streaming
        setStreamingStage('continuation');
        setStreamingContent('📝 Formulating comprehensive response...');
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      
      // Stream the actual content
      setStreamingStage('initial');
      setStreamingContent(''); // Start with empty content for true progressive streaming
      const words = aiResponse.split(' ');
      const wordsPerChunk = Math.max(1, Math.floor(words.length / 40)); // Slightly larger chunks for smoother feel
      
      for (let i = 0; i < words.length; i += wordsPerChunk) {
        const chunk = words.slice(i, i + wordsPerChunk).join(' ') + (i + wordsPerChunk < words.length ? ' ' : '');
        streamedContent += chunk; // Build up locally
        
        // Force React to render this update immediately
        flushSync(() => {
          setStreamingContent(streamedContent); // Update state progressively
        });
        
        if (onChunk) {
          onChunk({
            type: 'CONTENT',
            content: chunk,
            conversationId: conversationId || 'unknown'
          });
        }
        
        // Faster streaming for better user experience
        const baseDelay = 80; // Much faster than 300ms
        const variableDelay = Math.random() * 60; // Less variation
        await new Promise(resolve => setTimeout(resolve, baseDelay + variableDelay));
      }

      // Complete the streaming
      setStreamingStage('complete');
      
      if (onChunk) {
        onChunk({
          type: 'COMPLETE',
          conversationId: conversationId || 'unknown',
          complete: responseData.sendAgentV2Message
        });
      }
      
      // Store the final conversation data to update after streaming completes
      const finalConversation = {
        ...responseData.sendAgentV2Message.conversation,
        createdAt: new Date(responseData.sendAgentV2Message.conversation.createdAt),
        updatedAt: new Date(responseData.sendAgentV2Message.conversation.updatedAt),
        messages: responseData.sendAgentV2Message.conversation.messages.map((msg: any, index: number) => {
          if (msg.role === 'assistant' && index === responseData.sendAgentV2Message.conversation.messages.length - 1) {
            return {
              ...msg,
              timestamp: new Date(msg.timestamp),
              toolExecutions: responseData.sendAgentV2Message.toolExecutions || []
            };
          }
          return {
            ...msg,
            timestamp: new Date(msg.timestamp)
          };
        })
      };
      
      // Wait a moment to ensure UI shows the complete streaming
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Now update the conversation with final data
      setCurrentConversation(finalConversation);
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