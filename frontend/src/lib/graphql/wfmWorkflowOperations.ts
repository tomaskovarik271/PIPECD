import { gql } from 'graphql-request';

export const GET_WFM_WORKFLOWS = gql`
  query GetWFMWorkflows($isArchived: Boolean) {
    wfmWorkflows(isArchived: $isArchived) {
      id
      name
      description
      isArchived
      createdAt
      updatedAt
      createdByUser {
        id
        display_name
      }
      updatedByUser {
        id
        display_name
      }
      # basic step and transition counts can be added here if useful for list view
    }
  }
`;

export const GET_WFM_WORKFLOW_BY_ID = gql`
  query GetWFMWorkflowById($id: ID!) {
    wfmWorkflow(id: $id) {
      id
      name
      description
      isArchived
      createdAt
      updatedAt
      createdByUser {
        id
        display_name
      }
      updatedByUser {
        id
        display_name
      }
      steps {
        id
        stepOrder
        isInitialStep
        isFinalStep
        status {
          id
          name
          color
        }
        metadata
      }
      transitions {
        id
        name # Action name for the transition
        fromStep {
          id
          status { id name } # mainly for identification
        }
        toStep {
          id
          status { id name } # mainly for identification
        }
      }
    }
  }
`;

export const CREATE_WFM_WORKFLOW = gql`
  mutation CreateWFMWorkflow($input: CreateWFMWorkflowInput!) {
    createWFMWorkflow(input: $input) {
      # Depending on whether your resolver returns full WFMWorkflow or just parts
      id
      name
      description
      isArchived
      createdAt
      updatedAt
      # createdByUser { id display_name }
      # updatedByUser { id display_name }
    }
  }
`;

export const UPDATE_WFM_WORKFLOW = gql`
  mutation UpdateWFMWorkflow($id: ID!, $input: UpdateWFMWorkflowInput!) {
    updateWFMWorkflow(id: $id, input: $input) {
      id
      name
      description
      isArchived
      createdAt
      updatedAt
      # createdByUser { id display_name }
      # updatedByUser { id display_name }
      # Potentially return steps and transitions if updated here, though less common for basic workflow update
    }
  }
`;

// For WFMWorkflows, we use an update mutation to archive/unarchive.
export const ARCHIVE_WFM_WORKFLOW = UPDATE_WFM_WORKFLOW;
export const UNARCHIVE_WFM_WORKFLOW = UPDATE_WFM_WORKFLOW;

// Mutations for Workflow Steps
export const ADD_WFM_WORKFLOW_STEP = gql`
  mutation CreateWFMWorkflowStep($input: CreateWFMWorkflowStepInput!) {
    createWFMWorkflowStep(input: $input) {
      id
      # workflowId # Not directly part of WFMWorkflowStep, but part of input
      status {
        id
        name
      }
      stepOrder
      isInitialStep
      isFinalStep
      metadata
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_WFM_WORKFLOW_STEP = gql`
  mutation UpdateWFMWorkflowStep($id: ID!, $input: UpdateWFMWorkflowStepInput!) {
    updateWFMWorkflowStep(id: $id, input: $input) {
      id
      status {
        id
        name
        color
      }
      stepOrder
      isInitialStep
      isFinalStep
      metadata
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_WFM_WORKFLOW_STEP = gql`
  mutation RemoveWFMWorkflowStep($id: ID!) {
    deleteWFMWorkflowStep(id: $id) {
      success
      message
      stepId
    }
  }
`;

export const UPDATE_WFM_WORKFLOW_STEPS_ORDER = gql`
  mutation UpdateWFMWorkflowStepsOrder($workflowId: ID!, $orderedStepIds: [ID!]!) {
    updateWFMWorkflowStepsOrder(workflowId: $workflowId, orderedStepIds: $orderedStepIds) {
      id # Workflow ID
      name # Workflow name
      description # Workflow description
      steps { # The reordered steps
        id
        stepOrder
        isInitialStep
        isFinalStep
        metadata
        status {
          id
          name
          color
        }
      }
      # Potentially other workflow fields if needed after reorder, e.g., updatedAt
      updatedAt
    }
  }
`;

// Mutations for Workflow Transitions
export const CREATE_WFM_WORKFLOW_TRANSITION = gql`
  mutation CreateWFMWorkflowTransition($input: CreateWFMWorkflowTransitionInput!) {
    createWFMWorkflowTransition(input: $input) {
      id
      name
      fromStep {
        id
        # stepOrder # if needed for UI updates
        # metadata # if name is needed
        status { id name color }
      }
      toStep {
        id
        # stepOrder
        # metadata
        status { id name color }
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_WFM_WORKFLOW_TRANSITION = gql`
  mutation DeleteWFMWorkflowTransition($id: ID!) { # Changed from transitionId to id
    deleteWFMWorkflowTransition(id: $id) { # Changed from transitionId to id
      success
      message
      transitionId
    }
  }
`;

export const UPDATE_WFM_WORKFLOW_TRANSITION = gql`
  mutation UpdateWFMWorkflowTransition($id: ID!, $input: UpdateWfmWorkflowTransitionInput!) {
    updateWFMWorkflowTransition(id: $id, input: $input) {
      id
      name
      fromStep {
        id
        status { id name color }
      }
      toStep {
        id
        status { id name color }
      }
      createdAt
      updatedAt
    }
  }
`;

// Placeholder for a more specific delete mutation if needed.
// Currently, archive is handled by UPDATE_WFM_WORKFLOW.
// export const DELETE_WFM_WORKFLOW = gql`
//   mutation DeleteWFMWorkflow($id: ID!) {
//     deleteWFMWorkflow(id: $id) {
//       success
//       message
//     }
//   }
// `; 