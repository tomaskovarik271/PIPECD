/**
 * Agent Store - Zustand store for AI agent conversations
 * Manages conversation state, message sending, and agent configuration
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { apolloClient } from '../lib/apolloClient';
import { gql } from '@apollo/client';

// Types
export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  thoughts?: AgentThought[];
}

export interface AgentThought {
  id: string;
  conversationId: string;
  type: 'REASONING' | 'QUESTION' | 'TOOL_CALL' | 'OBSERVATION' | 'PLAN';
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface AgentConversation {
  id: string;
  userId: string;
  messages: AgentMessage[];
  plan?: AgentPlan;
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentPlan {
  goal: string;
  steps: AgentPlanStep[];
  context: Record<string, any>;
}

export interface AgentPlanStep {
  id: string;
  description: string;
  toolName?: string;
  parameters?: Record<string, any>;
  dependencies?: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  result?: any;
}

export interface AgentConfig {
  maxThinkingSteps: number;
  enableExtendedThinking: boolean;
  thinkingBudget: 'STANDARD' | 'THINK' | 'THINK_HARD' | 'THINK_HARDER' | 'ULTRATHINK';
  maxClarifyingQuestions: number;
  autoExecute: boolean;
}

export interface SendMessageInput {
  conversationId?: string;
  content: string;
  config?: Partial<AgentConfig>;
}

// Store State
export interface AgentState {
  // Current conversation
  currentConversation: AgentConversation | null;
  
  // All conversations
  conversations: AgentConversation[];
  
  // Agent configuration
  config: AgentConfig;
  
  // Loading states
  isLoading: boolean;
  isSendingMessage: boolean;
  isLoadingConversations: boolean;
  
  // Error states
  error: string | null;
  sendError: string | null;
  
  // Available tools
  availableTools: any[];
  
  // UI state
  showThinkingProcess: boolean;
  sidebarCollapsed: boolean;
}

// Store Actions
export interface AgentActions {
  // Conversation management
  setCurrentConversation: (conversation: AgentConversation | null) => void;
  createConversation: (config?: Partial<AgentConfig>) => Promise<AgentConversation>;
  loadConversations: () => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  
  // Messaging
  sendMessage: (input: SendMessageInput) => Promise<void>;
  
  // Configuration
  updateConfig: (config: Partial<AgentConfig>) => void;
  
  // Tools
  loadAvailableTools: () => Promise<void>;
  
  // UI actions
  toggleThinkingProcess: () => void;
  toggleSidebar: () => void;
  
  // Error handling
  clearError: () => void;
  clearSendError: () => void;
  
  // Reset
  reset: () => void;
}

// GraphQL Queries and Mutations
const CREATE_AGENT_CONVERSATION = gql`
  mutation CreateAgentConversation($config: AgentConfigInput) {
    createAgentConversation(config: $config) {
      id
      userId
      messages {
        role
        content
        timestamp
        thoughts {
          id
          type
          content
          metadata
          timestamp
        }
      }
      plan {
        goal
        steps {
          id
          description
          toolName
          status
        }
        context
      }
      context
      createdAt
      updatedAt
    }
  }
`;

const GET_AGENT_CONVERSATIONS = gql`
  query GetAgentConversations($limit: Int, $offset: Int) {
    agentConversations(limit: $limit, offset: $offset) {
      id
      userId
      messages {
        role
        content
        timestamp
      }
      context
      createdAt
      updatedAt
    }
  }
`;

const SEND_AGENT_MESSAGE = gql`
  mutation SendAgentMessage($input: SendMessageInput!) {
    sendAgentMessage(input: $input) {
      conversation {
        id
        userId
        messages {
          role
          content
          timestamp
          thoughts {
            id
            type
            content
            metadata
            timestamp
          }
        }
        plan {
          goal
          steps {
            id
            description
            toolName
            status
            result
          }
          context
        }
        context
        createdAt
        updatedAt
      }
      message {
        role
        content
        timestamp
      }
      thoughts {
        id
        type
        content
        metadata
        timestamp
      }
      plan {
        goal
        steps {
          id
          description
          toolName
          status
        }
        context
      }
    }
  }
`;

const DELETE_AGENT_CONVERSATION = gql`
  mutation DeleteAgentConversation($id: ID!) {
    deleteAgentConversation(id: $id)
  }
`;

const DISCOVER_AGENT_TOOLS = gql`
  query DiscoverAgentTools {
    discoverAgentTools {
      tools
      error
    }
  }
`;

// Default configuration
const DEFAULT_CONFIG: AgentConfig = {
  maxThinkingSteps: 10,
  enableExtendedThinking: true,
  thinkingBudget: 'THINK_HARD',
  maxClarifyingQuestions: 3,
  autoExecute: false,
};

// Initial state
const initialState: AgentState = {
  currentConversation: null,
  conversations: [],
  config: DEFAULT_CONFIG,
  isLoading: false,
  isSendingMessage: false,
  isLoadingConversations: false,
  error: null,
  sendError: null,
  availableTools: [],
  showThinkingProcess: true,
  sidebarCollapsed: false,
};

// Store implementation
export const useAgentStore = create<AgentState & AgentActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,

        // Conversation management
        setCurrentConversation: (conversation) =>
          set((state) => {
            state.currentConversation = conversation;
          }),

        createConversation: async (config) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const { data } = await apolloClient.mutate({
              mutation: CREATE_AGENT_CONVERSATION,
              variables: { config },
            });

            const newConversation = data.createAgentConversation;
            
            set((state) => {
              state.conversations.unshift(newConversation);
              state.currentConversation = newConversation;
              state.isLoading = false;
            });

            return newConversation;
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to create conversation';
              state.isLoading = false;
            });
            throw error;
          }
        },

        loadConversations: async () => {
          set((state) => {
            state.isLoadingConversations = true;
            state.error = null;
          });

          try {
            const { data } = await apolloClient.query({
              query: GET_AGENT_CONVERSATIONS,
              variables: { limit: 50, offset: 0 },
              fetchPolicy: 'network-only', // Always fetch fresh data
            });

            set((state) => {
              state.conversations = data.agentConversations;
              state.isLoadingConversations = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to load conversations';
              state.isLoadingConversations = false;
            });
          }
        },

        deleteConversation: async (id) => {
          try {
            await apolloClient.mutate({
              mutation: DELETE_AGENT_CONVERSATION,
              variables: { id },
            });

            set((state) => {
              state.conversations = state.conversations.filter((conv: AgentConversation) => conv.id !== id);
              if (state.currentConversation?.id === id) {
                state.currentConversation = null;
              }
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to delete conversation';
            });
            throw error;
          }
        },

        // Messaging
        sendMessage: async (input) => {
          set((state) => {
            state.isSendingMessage = true;
            state.sendError = null;
          });

          try {
            const { data } = await apolloClient.mutate({
              mutation: SEND_AGENT_MESSAGE,
              variables: { input },
            });

            const response_data = data.sendAgentMessage;
            
            set((state) => {
              // Update current conversation
              state.currentConversation = response_data.conversation;
              
              // Update conversations list
              const existingIndex = state.conversations.findIndex(
                (conv: AgentConversation) => conv.id === response_data.conversation.id
              );
              
              if (existingIndex >= 0) {
                state.conversations[existingIndex] = response_data.conversation;
              } else {
                state.conversations.unshift(response_data.conversation);
              }
              
              state.isSendingMessage = false;
            });
          } catch (error) {
            set((state) => {
              state.sendError = error instanceof Error ? error.message : 'Failed to send message';
              state.isSendingMessage = false;
            });
          }
        },

        // Configuration
        updateConfig: (newConfig) =>
          set((state) => {
            state.config = { ...state.config, ...newConfig };
          }),

        // Tools
        loadAvailableTools: async () => {
          try {
            const { data } = await apolloClient.query({
              query: DISCOVER_AGENT_TOOLS,
              fetchPolicy: 'network-only',
            });

            set((state) => {
              state.availableTools = data.discoverAgentTools.tools || [];
            });
          } catch (error) {
            console.error('Failed to load available tools:', error);
            set((state) => {
              state.availableTools = [];
            });
          }
        },

        // UI actions
        toggleThinkingProcess: () =>
          set((state) => {
            state.showThinkingProcess = !state.showThinkingProcess;
          }),

        toggleSidebar: () =>
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          }),

        // Error handling
        clearError: () =>
          set((state) => {
            state.error = null;
          }),

        clearSendError: () =>
          set((state) => {
            state.sendError = null;
          }),

        // Reset
        reset: () =>
          set((state) => {
            Object.assign(state, initialState);
          }),
      }))
    ),
    {
      name: 'agent-store',
    }
  )
);

// Memoized selector hooks to prevent infinite loops
export const useCurrentConversation = () => {
  return useAgentStore((state) => state.currentConversation);
};

export const useConversations = () => {
  return useAgentStore((state) => state.conversations);
};

export const useAgentConfig = () => {
  return useAgentStore((state) => state.config);
};

export const useAgentLoading = () => {
  return useAgentStore((state) => ({
    isLoading: state.isLoading,
    isSendingMessage: state.isSendingMessage,
    isLoadingConversations: state.isLoadingConversations,
  }));
};

export const useAgentErrors = () => {
  return useAgentStore((state) => ({
    error: state.error,
    sendError: state.sendError,
  }));
}; 