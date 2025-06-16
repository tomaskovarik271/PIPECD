import { gql } from 'graphql-request';
import { createCrudStore, commonExtractors } from './createCrudStore';
import type { 
  Organization, 
  OrganizationInput
} from '../generated/graphql/graphql';

// GraphQL Operations
const GET_ORGANIZATIONS_QUERY = gql`
  query GetOrganizations {
    organizations {
      id
      created_at
      updated_at
      name
      industry
      website
      notes
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
    }
  }
`;

const GET_ORGANIZATION_BY_ID_QUERY = gql`
  query GetOrganizationById($id: ID!) {
    organization(id: $id) {
      id
      created_at
      updated_at
      name
      industry
      website
      notes
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
    }
  }
`;

const CREATE_ORGANIZATION_MUTATION = gql`
  mutation CreateOrganization($input: OrganizationInput!) {
    createOrganization(input: $input) {
      id
      created_at
      updated_at
      name
      industry
      website
      notes
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
    }
  }
`;

const UPDATE_ORGANIZATION_MUTATION = gql`
  mutation UpdateOrganization($id: ID!, $input: OrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      id
      created_at
      updated_at
      name
      industry
      website
      notes
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
    }
  }
`;

const DELETE_ORGANIZATION_MUTATION = gql`
  mutation DeleteOrganization($id: ID!) {
    deleteOrganization(id: $id)
  }
`;

// Create the Organizations store using the factory
export const useOrganizationsStore = createCrudStore<Organization, OrganizationInput, Partial<OrganizationInput>>({
  entityName: 'organization',
  entityNamePlural: 'organizations',
  
  queries: {
    getItems: GET_ORGANIZATIONS_QUERY,
    getItemById: GET_ORGANIZATION_BY_ID_QUERY,
  },
  
  mutations: {
    create: CREATE_ORGANIZATION_MUTATION,
    update: UPDATE_ORGANIZATION_MUTATION,
    delete: DELETE_ORGANIZATION_MUTATION,
  },
  
  extractItems: commonExtractors.items('organizations'),
  extractSingleItem: commonExtractors.singleItem('organization'),
  extractCreatedItem: commonExtractors.createdItem('createOrganization'),
  extractUpdatedItem: commonExtractors.updatedItem('updateOrganization'),
  extractDeleteResult: commonExtractors.deleteResult('deleteOrganization'),
});

// Export types for convenience
export type { Organization, OrganizationInput };

// Store state type alias
export type OrganizationsStoreState = ReturnType<typeof useOrganizationsStore>;