import { gql } from '@apollo/client';

// ================================
// Fragments
// ================================

export const PERSON_ORGANIZATION_ROLE_FRAGMENT = gql`
  fragment PersonOrganizationRoleFields on PersonOrganizationRole {
    id
    person_id
    organization_id
    role_title
    department
    is_primary
    status
    start_date
    end_date
    notes
    created_at
    updated_at
    created_by_user_id
    organization {
      id
      name
      address
    }
  }
`;

// ================================
// Queries
// ================================

export const GET_PERSON_ORGANIZATION_ROLES = gql`
  ${PERSON_ORGANIZATION_ROLE_FRAGMENT}
  query GetPersonOrganizationRoles($personId: ID!) {
    personOrganizationRoles(personId: $personId) {
      ...PersonOrganizationRoleFields
    }
  }
`;

export const GET_PEOPLE_BY_ORGANIZATION = gql`
  query GetPeopleByOrganization($organizationId: ID!, $includeFormerEmployees: Boolean = false) {
    peopleByOrganization(organizationId: $organizationId, includeFormerEmployees: $includeFormerEmployees) {
      id
      first_name
      last_name
      email
      phone
      notes
      created_at
      updated_at
    }
  }
`;

export const GET_ORGANIZATION_PEOPLE_WITH_ROLES = gql`
  query GetOrganizationPeopleWithRoles($organizationId: ID!, $includeFormerEmployees: Boolean = false) {
    peopleByOrganization(organizationId: $organizationId, includeFormerEmployees: $includeFormerEmployees) {
      id
      first_name
      last_name
      email
      phone
      notes
      created_at
      updated_at
      organizationRoles {
        id
        organization_id
        role_title
        department
        is_primary
        status
        start_date
        end_date
        notes
        created_at
        updated_at
        organization {
          id
          name
        }
      }
      primaryOrganization {
        id
        name
      }
      primaryRole {
        id
        role_title
        department
        is_primary
        status
      }
    }
  }
`;

// ================================
// Mutations
// ================================

export const CREATE_PERSON_ORGANIZATION_ROLE = gql`
  ${PERSON_ORGANIZATION_ROLE_FRAGMENT}
  mutation CreatePersonOrganizationRole($personId: ID!, $input: PersonOrganizationRoleInput!) {
    createPersonOrganizationRole(personId: $personId, input: $input) {
      ...PersonOrganizationRoleFields
    }
  }
`;

export const UPDATE_PERSON_ORGANIZATION_ROLE = gql`
  ${PERSON_ORGANIZATION_ROLE_FRAGMENT}
  mutation UpdatePersonOrganizationRole($id: ID!, $input: PersonOrganizationRoleUpdateInput!) {
    updatePersonOrganizationRole(id: $id, input: $input) {
      ...PersonOrganizationRoleFields
    }
  }
`;

export const DELETE_PERSON_ORGANIZATION_ROLE = gql`
  mutation DeletePersonOrganizationRole($id: ID!) {
    deletePersonOrganizationRole(id: $id)
  }
`;

export const SET_PRIMARY_ORGANIZATION_ROLE = gql`
  ${PERSON_ORGANIZATION_ROLE_FRAGMENT}
  mutation SetPrimaryOrganizationRole($personId: ID!, $roleId: ID!) {
    setPrimaryOrganizationRole(personId: $personId, roleId: $roleId) {
      ...PersonOrganizationRoleFields
    }
  }
`;

// ================================
// Input Types (for TypeScript)
// ================================

export interface PersonOrganizationRoleInput {
  organization_id: string;
  role_title: string;
  department?: string;
  is_primary?: boolean;
  status?: 'active' | 'inactive' | 'former';
  start_date?: string;
  end_date?: string;
  notes?: string;
}

export interface PersonOrganizationRoleUpdateInput {
  role_title?: string;
  department?: string;
  is_primary?: boolean;
  status?: 'active' | 'inactive' | 'former';
  start_date?: string;
  end_date?: string;
  notes?: string;
} 