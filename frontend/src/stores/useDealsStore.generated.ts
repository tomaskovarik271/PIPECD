import { gql } from 'graphql-request';
import { createCrudStore, commonExtractors } from './createCrudStore';
import type { 
  Deal, 
  DealInput,
  DealUpdateInput
} from '../generated/graphql/graphql';

// GraphQL Operations
const GET_DEALS_QUERY = gql`
  query GetDeals {
    deals {
      id
      created_at
      updated_at
      name
      amount
      currency
      expected_close_date
      person_id
      organization_id
      project_id
      user_id
      assigned_to_user_id
      deal_specific_probability
      weighted_amount
      wfm_project_id
    customFieldValues {
      stringValue
      numberValue
      booleanValue
      dateValue
      selectedOptionValues
      definition {
        id
        fieldName
        fieldLabel
        fieldType
        isRequired
        dropdownOptions { value label }
      }
    }
      
    currentWfmStep {
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
    currentWfmStatus {
      id
      name
      color
    }
    }
  }
`;

const GET_DEAL_BY_ID_QUERY = gql`
  query GetDealById($id: ID!) {
    deal(id: $id) {
      id
      created_at
      updated_at
      name
      amount
      currency
      expected_close_date
      person_id
      organization_id
      project_id
      user_id
      assigned_to_user_id
      deal_specific_probability
      weighted_amount
      wfm_project_id
    customFieldValues {
      stringValue
      numberValue
      booleanValue
      dateValue
      selectedOptionValues
      definition {
        id
        fieldName
        fieldLabel
        fieldType
        isRequired
        dropdownOptions { value label }
      }
    }
      
    currentWfmStep {
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
    currentWfmStatus {
      id
      name
      color
    }
    }
  }
`;

const CREATE_DEAL_MUTATION = gql`
  mutation CreateDeal($input: DealInput!) {
    createDeal(input: $input) {
      id
      created_at
      updated_at
      name
      amount
      currency
      expected_close_date
      person_id
      organization_id
      project_id
      user_id
      assigned_to_user_id
      deal_specific_probability
      weighted_amount
      wfm_project_id
    customFieldValues {
      stringValue
      numberValue
      booleanValue
      dateValue
      selectedOptionValues
      definition {
        id
        fieldName
        fieldLabel
        fieldType
        isRequired
        dropdownOptions { value label }
      }
    }
      
    currentWfmStep {
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
    currentWfmStatus {
      id
      name
      color
    }
    }
  }
`;

const UPDATE_DEAL_MUTATION = gql`
  mutation UpdateDeal($id: ID!, $input: DealUpdateInput!) {
    updateDeal(id: $id, input: $input) {
      id
      created_at
      updated_at
      name
      amount
      currency
      expected_close_date
      person_id
      organization_id
      project_id
      user_id
      assigned_to_user_id
      deal_specific_probability
      weighted_amount
      wfm_project_id
    customFieldValues {
      stringValue
      numberValue
      booleanValue
      dateValue
      selectedOptionValues
      definition {
        id
        fieldName
        fieldLabel
        fieldType
        isRequired
        dropdownOptions { value label }
      }
    }
      
    currentWfmStep {
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
    currentWfmStatus {
      id
      name
      color
    }
    }
  }
`;

const DELETE_DEAL_MUTATION = gql`
  mutation DeleteDeal($id: ID!) {
    deleteDeal(id: $id)
  }
`;

// Create the Deals store using the factory
export const useDealsStore = createCrudStore<Deal, DealInput, DealUpdateInput>({
  entityName: 'deal',
  entityNamePlural: 'deals',
  
  queries: {
    getItems: GET_DEALS_QUERY,
    getItemById: GET_DEAL_BY_ID_QUERY,
  },
  
  mutations: {
    create: CREATE_DEAL_MUTATION,
    update: UPDATE_DEAL_MUTATION,
    delete: DELETE_DEAL_MUTATION,
  },
  
  extractItems: commonExtractors.items('deals'),
  extractSingleItem: commonExtractors.singleItem('deal'),
  extractCreatedItem: commonExtractors.createdItem('createDeal'),
  extractUpdatedItem: commonExtractors.updatedItem('updateDeal'),
  extractDeleteResult: commonExtractors.deleteResult('deleteDeal'),
});

// Export types for convenience
export type { Deal, DealInput, DealUpdateInput };

// Store state type alias
export type DealsStoreState = ReturnType<typeof useDealsStore>;