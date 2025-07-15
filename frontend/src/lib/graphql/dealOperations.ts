import { gql } from 'graphql-request';

// Re-use fragments from the deals store
const PERSON_FIELDS_FRAGMENT = gql`
  fragment PersonFields on Person {
    id
    first_name
    last_name
    email
  }
`;

const ORGANIZATION_FIELDS_FRAGMENT = gql`
  fragment OrganizationFields on Organization {
    id
    name
  }
`;

const USER_PROFILE_FIELDS_FRAGMENT = gql`
  fragment UserProfileFields on User {
    id
    display_name
    email
    avatar_url
  }
`;

const CUSTOM_FIELD_VALUE_FIELDS_FRAGMENT = gql`
  fragment CustomFieldValueFields on CustomFieldValue {
    definition {
      id
      fieldName
      fieldType
      isRequired
      dropdownOptions {
        value
        label
      }
    }
    stringValue
    numberValue
    booleanValue
    dateValue
    selectedOptionValues
  }
`;

const WFM_STEP_FIELDS_FRAGMENT = gql`
  fragment WfmStepFields on WFMWorkflowStep {
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
`;

const WFM_STATUS_FIELDS_FRAGMENT = gql`
  fragment WfmStatusFields on WFMStatus {
    id
    name
    color
  }
`;

const DEAL_CORE_FIELDS_FRAGMENT = gql`
  fragment DealCoreFields on Deal {
    id
    name
    amount
    currency
    expected_close_date
    created_at
    updated_at
    person_id
    organization_id
    project_id
    user_id
    assigned_to_user_id
    deal_specific_probability
    weighted_amount
    wfm_project_id
    labels {
      id
      dealId
      labelText
      colorHex
      createdByUserId
      createdAt
      updatedAt
    }
  }
`;

// Main filtered deals query
export const GET_DEALS_FILTERED = gql`
  ${PERSON_FIELDS_FRAGMENT}
  ${ORGANIZATION_FIELDS_FRAGMENT}
  ${USER_PROFILE_FIELDS_FRAGMENT}
  ${CUSTOM_FIELD_VALUE_FIELDS_FRAGMENT}
  ${WFM_STEP_FIELDS_FRAGMENT}
  ${WFM_STATUS_FIELDS_FRAGMENT}
  ${DEAL_CORE_FIELDS_FRAGMENT}

  query GetDealsFiltered(
    $filters: DealFiltersInput
    $sort: DealSortInput
    $first: Int
    $after: String
  ) {
    dealsFiltered(
      filters: $filters
      sort: $sort
      first: $first
      after: $after
    ) {
      nodes {
        ...DealCoreFields
        person {
          ...PersonFields
        }
        organization {
          ...OrganizationFields
        }
        assignedToUser {
          ...UserProfileFields
        }
        customFieldValues {
          ...CustomFieldValueFields
        }
        currentWfmStep {
          ...WfmStepFields
        }
        currentWfmStatus {
          ...WfmStatusFields
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

// Quick filter queries for common use cases
export const GET_MY_DEALS = gql`
  ${PERSON_FIELDS_FRAGMENT}
  ${ORGANIZATION_FIELDS_FRAGMENT}
  ${USER_PROFILE_FIELDS_FRAGMENT}
  ${CUSTOM_FIELD_VALUE_FIELDS_FRAGMENT}
  ${WFM_STEP_FIELDS_FRAGMENT}
  ${WFM_STATUS_FIELDS_FRAGMENT}
  ${DEAL_CORE_FIELDS_FRAGMENT}

  query GetMyDeals($filters: DealFiltersInput) {
    myDeals(filters: $filters) {
      ...DealCoreFields
      person {
        ...PersonFields
      }
      organization {
        ...OrganizationFields
      }
      assignedToUser {
        ...UserProfileFields
      }
      customFieldValues {
        ...CustomFieldValueFields
      }
      currentWfmStep {
        ...WfmStepFields
      }
      currentWfmStatus {
        ...WfmStatusFields
      }
    }
  }
`;

export const GET_MY_OPEN_DEALS = gql`
  ${PERSON_FIELDS_FRAGMENT}
  ${ORGANIZATION_FIELDS_FRAGMENT}
  ${USER_PROFILE_FIELDS_FRAGMENT}
  ${CUSTOM_FIELD_VALUE_FIELDS_FRAGMENT}
  ${WFM_STEP_FIELDS_FRAGMENT}
  ${WFM_STATUS_FIELDS_FRAGMENT}
  ${DEAL_CORE_FIELDS_FRAGMENT}

  query GetMyOpenDeals {
    myOpenDeals {
      ...DealCoreFields
      person {
        ...PersonFields
      }
      organization {
        ...OrganizationFields
      }
      assignedToUser {
        ...UserProfileFields
      }
      customFieldValues {
        ...CustomFieldValueFields
      }
      currentWfmStep {
        ...WfmStepFields
      }
      currentWfmStatus {
        ...WfmStatusFields
      }
    }
  }
`;

export const GET_DEALS_CLOSING_THIS_MONTH = gql`
  ${PERSON_FIELDS_FRAGMENT}
  ${ORGANIZATION_FIELDS_FRAGMENT}
  ${USER_PROFILE_FIELDS_FRAGMENT}
  ${CUSTOM_FIELD_VALUE_FIELDS_FRAGMENT}
  ${WFM_STEP_FIELDS_FRAGMENT}
  ${WFM_STATUS_FIELDS_FRAGMENT}
  ${DEAL_CORE_FIELDS_FRAGMENT}

  query GetDealsClosingThisMonth {
    dealsClosingThisMonth {
      ...DealCoreFields
      person {
        ...PersonFields
      }
      organization {
        ...OrganizationFields
      }
      assignedToUser {
        ...UserProfileFields
      }
      customFieldValues {
        ...CustomFieldValueFields
      }
      currentWfmStep {
        ...WfmStepFields
      }
      currentWfmStatus {
        ...WfmStatusFields
      }
    }
  }
`;

export const GET_UNASSIGNED_DEALS = gql`
  ${PERSON_FIELDS_FRAGMENT}
  ${ORGANIZATION_FIELDS_FRAGMENT}
  ${USER_PROFILE_FIELDS_FRAGMENT}
  ${CUSTOM_FIELD_VALUE_FIELDS_FRAGMENT}
  ${WFM_STEP_FIELDS_FRAGMENT}
  ${WFM_STATUS_FIELDS_FRAGMENT}
  ${DEAL_CORE_FIELDS_FRAGMENT}

  query GetUnassignedDeals {
    unassignedDeals {
      ...DealCoreFields
      person {
        ...PersonFields
      }
      organization {
        ...OrganizationFields
      }
      assignedToUser {
        ...UserProfileFields
      }
      customFieldValues {
        ...CustomFieldValueFields
      }
      currentWfmStep {
        ...WfmStepFields
      }
      currentWfmStatus {
        ...WfmStatusFields
      }
    }
  }
`;

export const SEARCH_DEALS = gql`
  ${PERSON_FIELDS_FRAGMENT}
  ${ORGANIZATION_FIELDS_FRAGMENT}
  ${USER_PROFILE_FIELDS_FRAGMENT}
  ${CUSTOM_FIELD_VALUE_FIELDS_FRAGMENT}
  ${WFM_STEP_FIELDS_FRAGMENT}
  ${WFM_STATUS_FIELDS_FRAGMENT}
  ${DEAL_CORE_FIELDS_FRAGMENT}

  query SearchDeals(
    $query: String!
    $filters: DealFiltersInput
  ) {
    searchDeals(query: $query, filters: $filters) {
      ...DealCoreFields
      person {
        ...PersonFields
      }
      organization {
        ...OrganizationFields
      }
      assignedToUser {
        ...UserProfileFields
      }
      customFieldValues {
        ...CustomFieldValueFields
      }
      currentWfmStep {
        ...WfmStepFields
      }
      currentWfmStatus {
        ...WfmStatusFields
      }
    }
  }
`;

// Queries for getting filter options
export const GET_WORKFLOW_STEPS = gql`
  query GetWorkflowSteps {
    wfmWorkflows {
      id
      name
      steps {
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
    }
  }
`;

export const GET_WFM_STATUSES = gql`
  query GetWfmStatuses {
    wfmStatuses {
      id
      name
      color
    }
  }
`;

export const GET_PROJECT_TYPES = gql`
  query GetProjectTypes {
    wfmProjectTypes {
      id
      name
      description
    }
  }
`;

export const GET_CUSTOM_FIELD_DEFINITIONS = gql`
  query GetCustomFieldDefinitions($entityType: CustomFieldEntityType!) {
    customFieldDefinitions(entityType: $entityType) {
      id
      fieldName
      fieldLabel
      fieldType
      isRequired
      dropdownOptions {
        value
        label
      }
      entityType
      isActive
      displayOrder
    }
  }
`;

// Type definitions for the responses
export interface DealsFilteredResponse {
  dealsFiltered: {
    nodes: any[]; // Will be typed as Deal[] in the component
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
    totalCount: number;
  };
}

export interface MyDealsResponse {
  myDeals: any[]; // Will be typed as Deal[] in the component
}

export interface SearchDealsResponse {
  searchDeals: any[]; // Will be typed as Deal[] in the component
}

export interface WorkflowStepsResponse {
  wfmWorkflows: Array<{
    id: string;
    name: string;
    steps: Array<{
      id: string;
      stepOrder: number;
      isInitialStep: boolean;
      isFinalStep: boolean;
      metadata?: any;
      status: {
        id: string;
        name: string;
        color: string;
      };
    }>;
  }>;
}

export interface WfmStatusesResponse {
  wfmStatuses: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export interface ProjectTypesResponse {
  wfmProjectTypes: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

export interface CustomFieldDefinitionsResponse {
  customFieldDefinitions: Array<{
    id: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: string;
    isRequired: boolean;
    dropdownOptions?: Array<{
      value: string;
      label: string;
    }>;
    entityType: string;
    isActive: boolean;
    displayOrder: number;
  }>;
} 