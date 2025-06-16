import { gql } from 'graphql-request';
import { createCrudStore, commonExtractors } from './createCrudStore';
import type { 
  Lead, 
  LeadInput,
  LeadUpdateInput
} from '../generated/graphql/graphql';

// GraphQL Operations
const GET_LEADS_QUERY = gql`
  query GetLeads {
    leads {
      id
      created_at
      updated_at
      contact_name
      contact_email
      contact_phone
      company_name
      estimated_value
      estimated_close_date
      source
      notes
      user_id
      assigned_to_user_id
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

const GET_LEAD_BY_ID_QUERY = gql`
  query GetLeadById($id: ID!) {
    lead(id: $id) {
      id
      created_at
      updated_at
      contact_name
      contact_email
      contact_phone
      company_name
      estimated_value
      estimated_close_date
      source
      notes
      user_id
      assigned_to_user_id
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

const CREATE_LEAD_MUTATION = gql`
  mutation CreateLead($input: LeadInput!) {
    createLead(input: $input) {
      id
      created_at
      updated_at
      contact_name
      contact_email
      contact_phone
      company_name
      estimated_value
      estimated_close_date
      source
      notes
      user_id
      assigned_to_user_id
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

const UPDATE_LEAD_MUTATION = gql`
  mutation UpdateLead($id: ID!, $input: LeadUpdateInput!) {
    updateLead(id: $id, input: $input) {
      id
      created_at
      updated_at
      contact_name
      contact_email
      contact_phone
      company_name
      estimated_value
      estimated_close_date
      source
      notes
      user_id
      assigned_to_user_id
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

const DELETE_LEAD_MUTATION = gql`
  mutation DeleteLead($id: ID!) {
    deleteLead(id: $id)
  }
`;

// Create the Leads store using the factory
export const useLeadsStore = createCrudStore<Lead, LeadInput, LeadUpdateInput>({
  entityName: 'lead',
  entityNamePlural: 'leads',
  
  queries: {
    getItems: GET_LEADS_QUERY,
    getItemById: GET_LEAD_BY_ID_QUERY,
  },
  
  mutations: {
    create: CREATE_LEAD_MUTATION,
    update: UPDATE_LEAD_MUTATION,
    delete: DELETE_LEAD_MUTATION,
  },
  
  extractItems: commonExtractors.items('leads'),
  extractSingleItem: commonExtractors.singleItem('lead'),
  extractCreatedItem: commonExtractors.createdItem('createLead'),
  extractUpdatedItem: commonExtractors.updatedItem('updateLead'),
  extractDeleteResult: commonExtractors.deleteResult('deleteLead'),
});

// Export types for convenience
export type { Lead, LeadInput, LeadUpdateInput };

// Store state type alias
export type LeadsStoreState = ReturnType<typeof useLeadsStore>;