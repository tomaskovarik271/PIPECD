import { create } from 'zustand';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import type {
  Organization,
  OrganizationInput,
  Maybe,
  MutationCreateOrganizationArgs,
  MutationUpdateOrganizationArgs,
  MutationDeleteOrganizationArgs,
} from '../generated/graphql/graphql';

// Re-export core Organization types
export type { Organization, OrganizationInput, Maybe };

// --- GraphQL Fragment for Custom Field Values ---
// This ensures consistency in fetching custom field data
const CUSTOM_FIELD_VALUES_FRAGMENT = gql`
  fragment CustomFieldValuesData on CustomFieldValue {
    definition {
      id
      fieldName
      fieldLabel
      fieldType
      displayOrder
      isRequired
      isActive
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

// --- GraphQL Queries/Mutations for Organizations ---
const GET_ORGANIZATIONS_QUERY = gql`
  ${CUSTOM_FIELD_VALUES_FRAGMENT}
  query GetOrganizations {
    organizations {
      id
      name
      address
      notes
      created_at
      updated_at
      # user_id might be present if returned by resolver
      customFieldValues {
        ...CustomFieldValuesData
      }
    }
  }
`;

const CREATE_ORGANIZATION_MUTATION = gql`
  ${CUSTOM_FIELD_VALUES_FRAGMENT}
  mutation CreateOrganization($input: OrganizationInput!) {
    createOrganization(input: $input) {
      id
      name
      address
      notes
      created_at
      updated_at
      customFieldValues {
        ...CustomFieldValuesData
      }
    }
  }
`;

const UPDATE_ORGANIZATION_MUTATION = gql`
  ${CUSTOM_FIELD_VALUES_FRAGMENT}
  mutation UpdateOrganization($id: ID!, $input: OrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      id
      name
      address
      notes
      created_at
      updated_at
      customFieldValues {
        ...CustomFieldValuesData
      }
    }
  }
`;

const DELETE_ORGANIZATION_MUTATION = gql`
  mutation DeleteOrganization($id: ID!) {
    deleteOrganization(id: $id)
  }
`;

interface OrganizationsState {
  organizations: Organization[];
  organizationsLoading: boolean;
  organizationsError: string | null;
  fetchOrganizations: () => Promise<void>;
  createOrganization: (input: OrganizationInput) => Promise<Organization | null>;
  updateOrganization: (id: string, input: OrganizationInput) => Promise<Organization | null>;
  deleteOrganization: (id: string) => Promise<boolean>;
}

export const useOrganizationsStore = create<OrganizationsState>((set, get) => ({
  organizations: [],
  organizationsLoading: false,
  organizationsError: null,

  fetchOrganizations: async () => {
    set({ organizationsLoading: true, organizationsError: null });
    try {
      const data = await gqlClient.request<{ organizations: Organization[] }>(GET_ORGANIZATIONS_QUERY);
      set({ organizations: data.organizations || [], organizationsLoading: false });
    } catch (error: unknown) {
      console.error('Error fetching organizations:', error);
      let message = 'Failed to fetch organizations';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ organizationsError: message, organizationsLoading: false, organizations: [] });
    }
  },

  createOrganization: async (input: OrganizationInput): Promise<Organization | null> => {
    set({ organizationsLoading: true, organizationsError: null });
    try {
      type Response = { createOrganization?: Maybe<Organization> };
      const response = await gqlClient.request<Response, MutationCreateOrganizationArgs>(
        CREATE_ORGANIZATION_MUTATION,
        { input }
      );
      if (response.createOrganization) {
        set((state) => ({
          organizations: [...state.organizations, response.createOrganization!],
          organizationsLoading: false,
        }));
        return response.createOrganization;
      } else {
        set({ organizationsLoading: false, organizationsError: 'Create operation did not return an organization.' });
        return null;
      }
    } catch (error: unknown) {
      console.error('Error creating organization:', error);
      let message = 'Failed to create organization';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ organizationsError: message, organizationsLoading: false });
      return null;
    }
  },

  updateOrganization: async (id: string, input: OrganizationInput): Promise<Organization | null> => {
    set({ organizationsLoading: true, organizationsError: null });
    try {
      type Response = { updateOrganization?: Maybe<Organization> };
      const response = await gqlClient.request<Response, MutationUpdateOrganizationArgs>(
        UPDATE_ORGANIZATION_MUTATION,
        { id, input }
      );
      if (response.updateOrganization) {
        set((state) => ({
          organizations: state.organizations.map((o) => (o.id === id ? response.updateOrganization! : o)),
          organizationsLoading: false,
        }));
        return response.updateOrganization;
      } else {
        set({ organizationsLoading: false, organizationsError: 'Update operation did not return an organization.' });
        return null;
      }
    } catch (error: unknown) {
      console.error(`Error updating organization ${id}:`, error);
      let message = 'Failed to update organization';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ organizationsError: message, organizationsLoading: false });
      return null;
    }
  },

  deleteOrganization: async (id: string): Promise<boolean> => {
    const originalOrganizations = get().organizations;
    set((state) => ({
      organizations: state.organizations.filter((org) => org.id !== id),
      organizationsError: null,
      organizationsLoading: true, // Set loading true during optimistic update
    }));
    try {
      // The GQL mutation for deleteOrganization is expected to return a boolean indicating success.
      const response = await gqlClient.request<{ deleteOrganization?: Maybe<boolean> }, MutationDeleteOrganizationArgs>(
        DELETE_ORGANIZATION_MUTATION, 
        { id }
      );
      if (response.deleteOrganization) {
        set({ organizationsLoading: false }); // Clear loading on success
        return true;
      } else {
        // Revert if the API reports failure but didn't throw an error
        set({ organizations: originalOrganizations, organizationsError: 'Delete operation did not succeed as reported by API.', organizationsLoading: false });
        return false;
      }
    } catch (error: unknown) {
      console.error('Error deleting organization:', error);
      let message = 'Failed to delete organization';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      // Revert on error and set error message
      set({ organizations: originalOrganizations, organizationsError: message, organizationsLoading: false });
      return false;
    }
  },
})); 