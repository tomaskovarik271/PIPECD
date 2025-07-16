import { gql } from '@apollo/client';

export const GET_WFM_STEP_MAPPINGS = gql`
  query GetWFMStepMappings($workflowId: ID, $outcomeType: WFMOutcomeType, $isActive: Boolean) {
    wfmStepMappings(workflowId: $workflowId, outcomeType: $outcomeType, isActive: $isActive) {
      id
      workflowId
      outcomeType
      targetStepId
      fromStepIds
      conditions
      isActive
      priority
    }
  }
`;

export const GET_WFM_OUTCOME_RULES = gql`
  query GetWFMOutcomeRules($entityType: WFMEntityType, $outcomeType: WFMOutcomeType, $isActive: Boolean) {
    wfmOutcomeRules(entityType: $entityType, outcomeType: $outcomeType, isActive: $isActive) {
      id
      ruleName
      description
      entityType
      outcomeType
      ruleType
      conditions
      restrictions
      targetStepMapping
      sideEffects
      isActive
      priority
    }
  }
`;

export const WFM_EXECUTE_OUTCOME = gql`
  mutation WFMExecuteOutcome($input: WFMExecuteOutcomeInput!) {
    wfmExecuteOutcome(input: $input) {
      success
      outcomeExecuted
      targetStepId
      sideEffectsApplied
      errors
    }
  }
`;

export const GET_WFM_AVAILABLE_OUTCOMES = gql`
  query GetWFMAvailableOutcomes($entityId: ID!, $entityType: WFMEntityType!) {
    wfmAvailableOutcomes(entityId: $entityId, entityType: $entityType) {
      outcomeType
      displayName
      available
      reason
      targetStepId
      sideEffects
    }
  }
`; 