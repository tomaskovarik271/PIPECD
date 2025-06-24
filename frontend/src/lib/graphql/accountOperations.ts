import { gql } from '@apollo/client';

// Query to get organizations managed by the current user
export const GET_MY_ACCOUNTS = gql`
  query GetMyAccounts {
    myAccounts {
      id
      name
      address
      notes
      created_at
      updated_at
      account_manager_id
      accountManager {
        id
        display_name
        email
        avatar_url
      }
      totalDealValue
      activeDealCount
      customFieldValues {
        definition {
          id
          fieldName
          fieldLabel
          fieldType
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
    }
  }
`;

// Query to get account portfolio statistics for current user
export const GET_MY_ACCOUNT_PORTFOLIO_STATS = gql`
  query GetMyAccountPortfolioStats {
    myAccountPortfolioStats {
      totalAccounts
      totalDealValue
      activeDealCount
      accountsNeedingAttention
    }
  }
`;

// Mutation to assign account manager to organization
export const ASSIGN_ACCOUNT_MANAGER = gql`
  mutation AssignAccountManager($organizationId: ID!, $userId: ID!) {
    assignAccountManager(organizationId: $organizationId, userId: $userId) {
      id
      name
      account_manager_id
      accountManager {
        id
        display_name
        email
        avatar_url
      }
    }
  }
`;

// Mutation to remove account manager from organization
export const REMOVE_ACCOUNT_MANAGER = gql`
  mutation RemoveAccountManager($organizationId: ID!) {
    removeAccountManager(organizationId: $organizationId) {
      id
      name
      account_manager_id
      accountManager {
        id
        display_name
        email
        avatar_url
      }
    }
  }
`;

// Enhanced organization query with account manager details
export const GET_ORGANIZATION_WITH_ACCOUNT_MANAGER = gql`
  query GetOrganizationWithAccountManager($id: ID!) {
    organization(id: $id) {
      id
      name
      address
      notes
      created_at
      updated_at
      account_manager_id
      accountManager {
        id
        display_name
        email
        avatar_url
      }
      totalDealValue
      activeDealCount
    }
  }
`; 