import { gql } from '@apollo/client';

export const GET_AGENT_V2_HEALTH = gql`
  query GetAgentV2Health {
    getAgentV2Health {
      status
      agent {
        version
        status
        lastActivity
      }
      hardening {
        overallHealth
        metrics {
          totalExecutions
          successRate
          averageExecutionTime
          circuitBreakersOpen
          rateLimitViolations
        }
        recommendations
        circuitBreakers {
          toolName
          failureCount
          lastFailure
          state
          nextRetryTime
        }
        rateLimits {
          key
          count
          resetTime
        }
      }
      database {
        status
        latency
      }
      recommendations
    }
  }
`;

export const GET_AGENT_V2_PERFORMANCE_METRICS = gql`
  query GetAgentV2PerformanceMetrics {
    getAgentV2PerformanceMetrics {
      toolMetrics {
        toolName
        executions
        successes
        averageTime
        successRate
      }
      conversationMetrics {
        totalConversations
        activeConversations
        averageResponseTime
      }
      errorAnalysis {
        commonErrors {
          error
          count
        }
        errorRate
      }
    }
  }
`; 