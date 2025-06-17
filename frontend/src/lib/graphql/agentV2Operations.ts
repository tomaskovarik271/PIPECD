import { gql } from '@apollo/client';

export const PROCESS_MESSAGE_V2 = gql`
  mutation ProcessMessageV2($input: AgentV2Request!) {
    processMessageV2(input: $input) {
      success
      message
      data
      toolCalls {
        id
        tool
        parameters
        reasoning
        timestamp
      }
      toolResults {
        success
        message
        data
        error {
          code
          message
          type
          recoverable
          suggestions
        }
        executionTime
      }
      reasoning {
        step
        type
        description
        confidence
        evidence
      }
      suggestions {
        id
        type
        title
        description
        confidence
        impact
        urgency
        actionable
      }
      insights {
        id
        type
        category
        content
        confidence
        businessValue
        actionable
        relatedEntities
      }
      nextActions {
        id
        title
        description
        priority
        estimatedTime
        category
        requiresInput
      }
      metadata {
        agentVersion
        processingTime
        systemStateTimestamp
        toolsUsed
        confidenceScore
        rateLimitStatus {
          remaining
          resetTime
          burst
        }
        cacheStatus {
          systemStateFromCache
          rulesFromCache
          searchResultsFromCache
        }
        sources {
          type
          name
          version
          confidence
        }
      }
      error {
        code
        message
        type
        recoverable
        suggestions
      }
    }
  }
`;

export const AGENT_V2_HEALTH_CHECK = gql`
  query AgentV2HealthCheck {
    agentV2HealthCheck {
      status
      components {
        systemStateEncoder
        pipeCDRulesEngine
        semanticSearchEngine
        toolRegistry
        aiService
        graphQLClient
      }
      lastCheck
      uptime
    }
  }
`; 