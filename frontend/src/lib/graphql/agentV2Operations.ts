/**
 * AI Agent V2 GraphQL Operations
 * GraphQL queries and mutations for Claude Sonnet 4 extended thinking capabilities
 */

import { gql } from '@apollo/client';

// Simplified V2 Interfaces (no thinking budget complexity)

export interface AgentV2Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AgentV2Conversation {
  id: string;
  userId: string;
  messages: AgentV2Message[];
  plan?: any;
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  agentVersion: string;
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
  toolExecutions: ToolExecution[];
}

// Simplified GraphQL Operations

export const CREATE_AGENT_V2_CONVERSATION = gql`
  mutation CreateAgentV2Conversation($input: CreateAgentV2ConversationInput!) {
    createAgentV2Conversation(input: $input) {
      id
      userId
      agentVersion
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

// Streaming Operations

export interface SendAgentV2MessageStreamInput {
  conversationId?: string;
  content: string;
}

export interface AgentV2StreamChunk {
  type: 'CONTENT' | 'COMPLETE' | 'ERROR';
  content?: string;
  conversationId: string;
  complete?: AgentV2Response;
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
      conversationId
      complete {
        conversation {
          id
          userId
          agentVersion
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