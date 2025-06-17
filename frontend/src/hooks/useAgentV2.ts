import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { PROCESS_MESSAGE_V2, AGENT_V2_HEALTH_CHECK } from '../lib/graphql/agentV2Operations';

export interface AgentV2Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  toolCalls?: any[];
  toolResults?: any[];
  reasoning?: any[];
  suggestions?: any[];
  insights?: any[];
  nextActions?: any[];
  metadata?: any;
  systemContext?: any;
}

export interface AgentV2Config {
  useAdvancedReasoning?: boolean;
  maxToolCalls?: number;
  thinkingDepth?: string;
  responseStyle?: string;
}

export interface AgentV2Request {
  message: string;
  conversationContext?: {
    conversationId?: string;
    userId?: string;
    recentMessages?: string[];
    systemState?: string;
  };
  config?: AgentV2Config;
}

export const useAgentV2 = () => {
  const [messages, setMessages] = useState<AgentV2Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // GraphQL mutations and queries
  const [processMessageMutation] = useMutation(PROCESS_MESSAGE_V2);
  const { data: healthData, loading: healthLoading, refetch: refetchHealth } = useQuery(AGENT_V2_HEALTH_CHECK, {
    pollInterval: 30000, // Poll every 30 seconds
  });

  const sendMessage = useCallback(async (
    content: string, 
    config: AgentV2Config = {},
    conversationContext?: any
  ): Promise<AgentV2Message> => {
    setIsProcessing(true);

    try {
      // Add user message to state
      const userMessage: AgentV2Message = {
        id: `user-${Date.now()}`,
        content,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      // Prepare request
      const request: AgentV2Request = {
        message: content,
        conversationContext: {
          conversationId: conversationContext?.conversationId,
          userId: conversationContext?.userId || 'anonymous-user', // Required field - provide default
          recentMessages: messages.slice(-5).map(m => m.content), // Last 5 messages for context
          systemState: conversationContext?.systemState
        },
        config: {
          useAdvancedReasoning: true,
          maxToolCalls: 5,
          thinkingDepth: 'standard',
          responseStyle: 'professional',
          ...config
        }
      };

      // Send to V2 agent
      const { data } = await processMessageMutation({
        variables: { input: request }
      });

      if (!data?.processMessageV2) {
        throw new Error('No response from V2 agent');
      }

      const response = data.processMessageV2;

      // Create assistant message
      const assistantMessage: AgentV2Message = {
        id: `assistant-${Date.now()}`,
        content: response.message,
        sender: 'assistant',
        timestamp: new Date(),
        toolCalls: response.toolCalls || [],
        toolResults: response.toolResults || [],
        reasoning: response.reasoning || [],
        suggestions: response.suggestions || [],
        insights: response.insights || [],
        nextActions: response.nextActions || [],
        metadata: response.metadata,
        systemContext: response.data
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      return assistantMessage;

    } catch (error) {
      console.error('Error sending message to V2 agent:', error);
      
      // Get more detailed error information
      let errorMessage = 'Sorry, I encountered an error processing your request. Please try again.';
      
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        if (error.message.includes('Network error')) {
          errorMessage = 'Network error: Unable to connect to the AI agent. Please check your connection.';
        } else if (error.message.includes('GraphQL error')) {
          errorMessage = 'GraphQL error: There was an issue with the request format.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      // Create error message
      const errorMsg: AgentV2Message = {
        id: `error-${Date.now()}`,
        content: errorMessage,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [processMessageMutation, messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const getHealthStatus = useCallback(() => {
    return {
      status: healthData?.agentV2HealthCheck?.status || 'unknown',
      components: healthData?.agentV2HealthCheck?.components || {},
      lastCheck: healthData?.agentV2HealthCheck?.lastCheck,
      uptime: healthData?.agentV2HealthCheck?.uptime || 0,
      loading: healthLoading
    };
  }, [healthData, healthLoading]);

  return {
    // State
    messages,
    isProcessing,
    
    // Actions
    sendMessage,
    clearMessages,
    
    // Health monitoring
    healthStatus: getHealthStatus(),
    refetchHealth,
    
    // Utils
    isHealthy: healthData?.agentV2HealthCheck?.status === 'healthy'
  };
}; 