import { gql } from 'graphql-request';

// Query to fetch all custom field definitions
export const GET_CUSTOM_FIELD_DEFINITIONS = gql`
  query GetCustomFieldDefinitions($entityType: CustomFieldEntityType!, $includeInactive: Boolean) {
    customFieldDefinitions(entityType: $entityType, includeInactive: $includeInactive) {
      id
      entityType
      fieldName
      fieldLabel
      fieldType
      isRequired
      dropdownOptions {
        value
        label
      }
      isActive
      displayOrder
      createdAt
      updatedAt
    }
  }
`;

// Query to fetch a single custom field definition by ID
export const GET_CUSTOM_FIELD_DEFINITION = gql`
  query GetCustomFieldDefinition($id: ID!) {
    customFieldDefinition(id: $id) {
      id
      entityType
      fieldName
      fieldLabel
      fieldType
      isRequired
      dropdownOptions {
        value
        label
      }
      isActive
      displayOrder
      createdAt
      updatedAt
    }
  }
`;

// Mutation to create a new custom field definition
export const CREATE_CUSTOM_FIELD_DEFINITION = gql`
  mutation CreateCustomFieldDefinition($input: CustomFieldDefinitionInput!) {
    createCustomFieldDefinition(input: $input) {
      id
      entityType
      fieldName
      fieldLabel
      fieldType
      isRequired
      dropdownOptions {
        value
        label
      }
      isActive
      displayOrder
      createdAt
      updatedAt
    }
  }
`;

// Mutation to update an existing custom field definition
export const UPDATE_CUSTOM_FIELD_DEFINITION = gql`
  mutation UpdateCustomFieldDefinition($id: ID!, $input: CustomFieldDefinitionInput!) {
    updateCustomFieldDefinition(id: $id, input: $input) {
      id
      entityType
      fieldName
      fieldLabel
      fieldType
      isRequired
      dropdownOptions {
        value
        label
      }
      isActive
      displayOrder
      createdAt
      updatedAt
    }
  }
`;

// Mutation to deactivate a custom field definition
export const DEACTIVATE_CUSTOM_FIELD_DEFINITION = gql`
  mutation DeactivateCustomFieldDefinition($id: ID!) {
    deactivateCustomFieldDefinition(id: $id) {
      id
      isActive # To confirm change
      updatedAt
    }
  }
`;

// Mutation to reactivate a custom field definition
export const REACTIVATE_CUSTOM_FIELD_DEFINITION = gql`
  mutation ReactivateCustomFieldDefinition($id: ID!) {
    reactivateCustomFieldDefinition(id: $id) {
      id
      isActive # To confirm change
      updatedAt
    }
  }
`; 