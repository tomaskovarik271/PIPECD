/**
 * AI Agent V2 GraphQL Operations
 * GraphQL queries and mutations for Claude Sonnet 4 extended thinking capabilities
 */

import { gql } from '@apollo/client';

// V2-specific types for frontend
export interface AgentV2Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  thoughts?: AgentV2Thought[];
  extendedThinking?: boolean;
  thinkingBudget?: string;
}

export interface AgentV2Thought {
  id: string;
  conversationId: string;
  type: 'REASONING' | 'QUESTION' | 'TOOL_CALL' | 'OBSERVATION' | 'PLAN';
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
  // V2 extended thinking fields
  thinkingBudget?: string;
  reasoning?: string;
  strategy?: string;
  concerns?: string;
  nextSteps?: string;
  reflectionData?: Record<string, any>;
}

export interface AgentV2Conversation {
  id: string;
  userId: string;
  messages: AgentV2Message[];
  plan?: any;
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  // V2 fields
  agentVersion: string;
  extendedThinkingEnabled: boolean;
  thinkingBudget: string;
}

export interface SendAgentV2MessageInput {
  conversationId?: string;
  content: string;
}

export interface CreateAgentV2ConversationInput {
  initialContext?: Record<string, any>;
}

export interface ToolExecution {
  id: string;
  name: string;
  input: any;
  result?: any;
  error?: string;
  executionTime: number;
  timestamp: string;
  status: 'SUCCESS' | 'ERROR';
}

export interface AgentV2Response {
  conversation: AgentV2Conversation;
  message: AgentV2Message;
  extendedThoughts: AgentV2Thought[];
  reflections: AgentV2Thought[];
  planModifications: string[];
  thinkingTime?: number;
  confidenceScore?: number;
  toolExecutions: ToolExecution[];
}

// GraphQL Operations

export const CREATE_AGENT_V2_CONVERSATION = gql`
  mutation CreateAgentV2Conversation($input: CreateAgentV2ConversationInput!) {
    createAgentV2Conversation(input: $input) {
      id
      userId
      agentVersion
      extendedThinkingEnabled
      thinkingBudget
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

export const SEND_AGENT_V2_MESSAGE = gql`
  mutation SendAgentV2Message($input: SendAgentV2MessageInput!) {
    sendAgentV2Message(input: $input) {
      conversation {
        id
        userId
        agentVersion
        extendedThinkingEnabled
        thinkingBudget
        messages {
          role
          content
          timestamp
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
      extendedThoughts {
        id
        conversationId
        type
        content
        thinkingBudget
        reasoning
        strategy
        concerns
        nextSteps
        reflectionData
        metadata
        timestamp
      }
      reflections {
        id
        conversationId
        type
        content
        thinkingBudget
        reasoning
        strategy
        concerns
        nextSteps
        reflectionData
        metadata
        timestamp
      }
      planModifications
      thinkingTime
      confidenceScore
      toolExecutions {
        id
        name
        input
        result
        error
        executionTime
        timestamp
        status
      }
    }
  }
`;

export const GET_AGENT_V2_CONVERSATIONS = gql`
  query GetAgentV2Conversations($limit: Int, $offset: Int) {
    agentV2Conversations(limit: $limit, offset: $offset) {
      id
      userId
      agentVersion
      extendedThinkingEnabled
      thinkingBudget
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

export const GET_AGENT_V2_THOUGHTS = gql`
  query GetAgentV2Thoughts($conversationId: ID!, $limit: Int) {
    agentV2Thoughts(conversationId: $conversationId, limit: $limit) {
      id
      conversationId
      type
      content
      thinkingBudget
      reasoning
      strategy
      concerns
      nextSteps
      reflectionData
      metadata
      timestamp
    }
  }
`;

export const GET_AGENT_V2_THINKING_ANALYSIS = gql`
  query GetAgentV2ThinkingAnalysis($conversationId: ID!) {
    agentV2ThinkingAnalysis(conversationId: $conversationId) {
      totalThoughts
      reasoningDepth
      strategicInsights
      identifiedConcerns
      recommendedActions
      thinkingBudgetUsed
    }
  }
`;

// Streaming Operations

export interface SendAgentV2MessageStreamInput {
  conversationId?: string;
  content: string;
}

export interface AgentV2StreamChunk {
  type: 'CONTENT' | 'THINKING' | 'COMPLETE' | 'ERROR';
  content?: string;
  thinking?: AgentV2Thought;
  conversationId: string;
  complete?: any; // AgentV2Response
  error?: string;
}

export const SEND_AGENT_V2_MESSAGE_STREAM = gql`
  mutation SendAgentV2MessageStream($input: SendAgentV2MessageStreamInput!) {
    sendAgentV2MessageStream(input: $input)
  }
`;

export const AGENT_V2_MESSAGE_STREAM_SUBSCRIPTION = gql`
  subscription AgentV2MessageStream($conversationId: ID!) {
    agentV2MessageStream(conversationId: $conversationId) {
      type
      content
      thinking {
        id
        conversationId
        type
        content
        thinkingBudget
        reasoning
        strategy
        concerns
        nextSteps
        reflectionData
        metadata
        timestamp
      }
      conversationId
      complete {
        conversation {
          id
          userId
          agentVersion
          extendedThinkingEnabled
          thinkingBudget
          messages {
            role
            content
            timestamp
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
        extendedThoughts {
          id
          conversationId
          type
          content
          thinkingBudget
          reasoning
          strategy
          concerns
          nextSteps
          reflectionData
          metadata
          timestamp
        }
        reflections {
          id
          conversationId
          type
          content
          thinkingBudget
          reasoning
          strategy
          concerns
          nextSteps
          reflectionData
          metadata
          timestamp
        }
        planModifications
        thinkingTime
        confidenceScore
        toolExecutions {
          id
          name
          input
          result
          error
          executionTime
          timestamp
          status
        }
      }
      error
    }
  }
`; 