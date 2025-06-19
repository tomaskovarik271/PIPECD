/**
 * useAgentV2 Hook
 * Custom hook for AI Agent V2 operations with Claude Sonnet 4 extended thinking
 */

import { useState, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import {
  CREATE_AGENT_V2_CONVERSATION,
  SEND_AGENT_V2_MESSAGE,
  SEND_AGENT_V2_MESSAGE_STREAM,
  GET_AGENT_V2_STREAM_CHUNKS,
  GET_AGENT_V2_CONVERSATIONS,
  GET_AGENT_V2_THOUGHTS,
  type AgentV2Conversation,
  type AgentV2Message,
  type AgentV2Thought,
  type SendAgentV2MessageInput,
  type SendAgentV2MessageStreamInput,
  type CreateAgentV2ConversationInput,
  type AgentV2StreamChunk,
  type AgentV2StreamResponse,
  type AgentV2StreamChunkRow,
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
  streamingThoughts: any[];
  streamingStage: 'initial' | 'thinking' | 'continuation' | 'complete';
  error: string | null;
  
  // Actions
  createConversation: (input: CreateAgentV2ConversationInput) => Promise<AgentV2Conversation>;
  sendMessage: (input: SendAgentV2MessageInput) => Promise<void>;
  sendMessageStream: (
    content: string, 
    conversationId?: string,
    enableExtendedThinking?: boolean,
    thinkingBudget?: string
  ) => Promise<void>;
  setCurrentConversation: (conversation: AgentV2Conversation | null) => void;
  clearError: () => void;
  
  // Data
  refetch: () => Promise<any>;
  refetchHistory: () => Promise<any>;
}

export function useAgentV2(): UseAgentV2Return {
  // Local state
  const [currentConversation, setCurrentConversation] = useState<AgentV2Conversation | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingThoughts, setStreamingThoughts] = useState<any[]>([]);
  const [streamingStage, setStreamingStage] = useState<'initial' | 'thinking' | 'continuation' | 'complete'>('initial');
  const [error, setError] = useState<string | null>(null);

  // Refs for streaming
  const streamingSessionRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // GraphQL hooks
  const [createConversationMutation] = useMutation(CREATE_AGENT_V2_CONVERSATION);
  const [sendMessageMutation] = useMutation(SEND_AGENT_V2_MESSAGE);
  const [sendMessageStreamMutation] = useMutation(SEND_AGENT_V2_MESSAGE_STREAM);
  const [getStreamChunks, { data: streamChunksData }] = useLazyQuery(GET_AGENT_V2_STREAM_CHUNKS, {
    fetchPolicy: 'no-cache'
  });
  
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
    loading: isLoadingThoughts,
    refetch: refetchThoughts
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

  // Real streaming implementation using GraphQL polling
  const sendMessageStream = useCallback(async (
    content: string, 
    conversationId?: string,
    enableExtendedThinking = true,
    thinkingBudget = 'STANDARD'
  ) => {
    try {
      setIsStreaming(true);
      setStreamingContent('');
      setStreamingThoughts([]);
      setStreamingStage('initial');
      
      // If no conversation exists, create one first
      let actualConversationId = conversationId;
      if (!actualConversationId && !currentConversation) {
        const newConversation = await createConversation({
          enableExtendedThinking,
          thinkingBudget,
          initialContext: {}
        });
        actualConversationId = newConversation.id;
      } else if (!actualConversationId && currentConversation) {
        actualConversationId = currentConversation.id;
      }

      // Create temporary conversation state for streaming
      const tempConversation = {
        id: actualConversationId || 'temp',
        userId: '',
        agentVersion: 'v2',
        extendedThinkingEnabled: enableExtendedThinking,
        thinkingBudget,
        context: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [
          {
            role: 'user' as const,
            content,
            timestamp: new Date(),
            thoughts: []
          },
          {
            role: 'assistant' as const,
            content: '',
            timestamp: new Date(),
            thoughts: []
          }
        ]
      };

      // Set temporary conversation immediately
      flushSync(() => {
        setCurrentConversation(tempConversation);
      });

      // Start streaming backend request
      const { data: streamResponse } = await sendMessageStreamMutation({
        variables: {
          input: {
            conversationId: actualConversationId,
            content,
            enableExtendedThinking,
            thinkingBudget
          }
        }
      });

      if (!streamResponse?.sendAgentV2MessageStream?.sessionId) {
        throw new Error('Failed to start streaming');
      }

      const sessionId = streamResponse.sendAgentV2MessageStream.sessionId;
      streamingSessionRef.current = sessionId;

      // Start polling for stream chunks
      let processedChunkIds = new Set<string>();
      let accumulatedContent = '';
      let accumulatedThoughts: any[] = [];
      let currentStage: 'initial' | 'thinking' | 'continuation' = 'initial';
      let isComplete = false;

      const pollChunks = async () => {
        try {
          const { data: chunksData } = await getStreamChunks({
            variables: { sessionId }
          });

          const chunks = chunksData?.agentV2StreamChunks || [];
          const newChunks = chunks.filter((chunk: AgentV2StreamChunkRow) => 
            !processedChunkIds.has(chunk.id)
          );

          for (const chunk of newChunks) {
            processedChunkIds.add(chunk.id);
            console.log('🔄 Processing chunk:', chunk.chunkType, chunk.content?.length || 0);

            if (chunk.chunkType === 'CONTENT') {
              // STAGE 1 & 3: Stream content immediately
              accumulatedContent += chunk.content || '';
              
              flushSync(() => {
                setStreamingContent(accumulatedContent);
                setStreamingStage(currentStage);
                
                // Update temporary conversation with streaming content
                setCurrentConversation(prev => prev ? {
                  ...prev,
                  messages: [
                    ...prev.messages.slice(0, -1),
                    {
                      ...prev.messages[prev.messages.length - 1],
                      content: accumulatedContent
                    }
                  ]
                } : null);
              });
              
            } else if (chunk.chunkType === 'THINKING') {
              // STAGE 2: Stream thinking results
              if (chunk.thinkingData) {
                if (chunk.thinkingData.type === 'tool_execution') {
                  currentStage = 'thinking';
                } else if (chunk.thinkingData.type === 'continuation') {
                  currentStage = 'continuation';
                } else if (chunk.thinkingData.type !== 'tool_execution' && chunk.thinkingData.type !== 'continuation') {
                  accumulatedThoughts.push(chunk.thinkingData);
                  
                  flushSync(() => {
                    setStreamingThoughts([...accumulatedThoughts]);
                    setStreamingStage(currentStage);
                  });
                }
              }
            } else if (chunk.chunkType === 'COMPLETE' || chunk.chunkType === 'ERROR') {
              isComplete = true;
              if (chunk.chunkType === 'ERROR') {
                console.error('Streaming error:', chunk.thinkingData?.error);
              }
            }
          }

          if (!isComplete && streamingSessionRef.current === sessionId) {
            // Continue polling if not complete
            pollingIntervalRef.current = setTimeout(pollChunks, 300);
          } else {
            // Streaming complete - refresh conversation data
            if (actualConversationId) {
              await refetchConversations();
              await refetchThoughts();
            }
          }

        } catch (error) {
          console.error('Error polling stream chunks:', error);
          isComplete = true;
        }
      };

      // Start polling
      pollChunks();

    } catch (error) {
      console.error('Error in streaming message:', error);
      throw error;
    } finally {
      // Cleanup will happen when polling detects completion
    }
  }, [sendMessageStreamMutation, createConversation, currentConversation, refetchConversations, refetchThoughts, getStreamChunks]);

  // Cleanup polling on unmount or streaming stop
  const stopStreaming = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    streamingSessionRef.current = null;
    setIsStreaming(false);
    setStreamingContent('');
    setStreamingThoughts([]);
    setStreamingStage('initial');
  }, []);

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
    streamingThoughts,
    streamingStage,
    error,
    
    // Actions
    createConversation,
    sendMessage,
    sendMessageStream,
    setCurrentConversation,
    clearError,
    
    // Data refresh
    refetch: refetchThoughts,
    refetchHistory: refetchConversations
  };
} 