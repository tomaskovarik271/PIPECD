import { create } from 'zustand';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import type {
  Lead,
  LeadInput,
  LeadUpdateInput,
  Maybe,
  MutationCreateLeadArgs,
  MutationUpdateLeadArgs,
  MutationDeleteLeadArgs,
  MutationUpdateLeadWfmProgressArgs,
} from '../generated/graphql/graphql';

// Re-export core Lead types
export type { Lead, LeadInput, LeadUpdateInput, Maybe };

// --- GraphQL Fragments ---

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
        }
        stringValue
        numberValue
        booleanValue
        dateValue
        selectedOptionValues
      }
`;

// Activity fragment removed - using Google Calendar integration instead

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

const LEAD_CORE_FIELDS_FRAGMENT = gql`
  fragment LeadCoreFields on Lead {
    id
    name
    source
    description
    contact_name
    contact_email
    contact_phone
    company_name
    # NEW: Entity-based references
    person_id
    organization_id
    estimated_value
    estimated_close_date
    lead_score
    lead_score_factors
    # New computed qualification fields from WFM metadata
    isQualified
    qualificationLevel
    qualificationStatus
    assigned_to_user_id
    assigned_at
    converted_at
    converted_to_deal_id
    converted_to_person_id
    converted_to_organization_id
    converted_by_user_id
    wfm_project_id
    customFieldValues {
      ...CustomFieldValueFields
    }
    last_activity_at
    automation_score_factors
    ai_insights
    user_id
    created_at
    updated_at
  }
`;

// --- GraphQL Queries/Mutations for Leads ---
const GET_LEADS_QUERY = gql`
  ${USER_PROFILE_FIELDS_FRAGMENT}
  ${CUSTOM_FIELD_VALUE_FIELDS_FRAGMENT}
  # Activity fragment removed - using Google Calendar integration instead
  ${WFM_STEP_FIELDS_FRAGMENT}
  ${WFM_STATUS_FIELDS_FRAGMENT}
  ${LEAD_CORE_FIELDS_FRAGMENT}

  query GetLeads {
    leads {
      ...LeadCoreFields
      assignedToUser {
        ...UserProfileFields
      }
      # activities removed - using Google Calendar integration instead
      currentWfmStep {
        ...WfmStepFields
      }
      currentWfmStatus {
        ...WfmStatusFields
      }
    }
  }
`;

const CREATE_LEAD_MUTATION = gql`
  ${USER_PROFILE_FIELDS_FRAGMENT}
  ${CUSTOM_FIELD_VALUE_FIELDS_FRAGMENT}
  ${WFM_STEP_FIELDS_FRAGMENT}
  ${WFM_STATUS_FIELDS_FRAGMENT}
  ${LEAD_CORE_FIELDS_FRAGMENT}

  mutation CreateLead($input: LeadInput!) {
    createLead(input: $input) {
      ...LeadCoreFields
      assignedToUser {
        ...UserProfileFields
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

const UPDATE_LEAD_MUTATION = gql`
  ${USER_PROFILE_FIELDS_FRAGMENT}
  ${CUSTOM_FIELD_VALUE_FIELDS_FRAGMENT}
  ${LEAD_CORE_FIELDS_FRAGMENT}

  mutation UpdateLead($id: ID!, $input: LeadUpdateInput!) {
    updateLead(id: $id, input: $input) {
      ...LeadCoreFields
      assignedToUser {
        ...UserProfileFields
      }
    }
  }
`;

const DELETE_LEAD_MUTATION = gql`
  mutation DeleteLead($id: ID!) {
    deleteLead(id: $id)
  }
`;

const UPDATE_LEAD_WFM_PROGRESS_MUTATION = gql`
  ${USER_PROFILE_FIELDS_FRAGMENT}
  ${CUSTOM_FIELD_VALUE_FIELDS_FRAGMENT}
  ${WFM_STEP_FIELDS_FRAGMENT}
  ${WFM_STATUS_FIELDS_FRAGMENT}
  ${LEAD_CORE_FIELDS_FRAGMENT}

  mutation UpdateLeadWFMProgress($leadId: ID!, $targetWfmWorkflowStepId: ID!) {
    updateLeadWFMProgress(leadId: $leadId, targetWfmWorkflowStepId: $targetWfmWorkflowStepId) {
      ...LeadCoreFields
      assignedToUser {
        ...UserProfileFields
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

interface LeadsState {
  leads: Lead[];
  leadsLoading: boolean;
  leadsError: string | null;
  hasInitiallyFetchedLeads: boolean;
  fetchLeads: () => Promise<void>;
  createLead: (input: LeadInput) => Promise<Lead | null>;
  updateLead: (id: string, input: Partial<LeadUpdateInput>) => Promise<{ lead: Lead | null; error?: string }>;
  deleteLead: (id: string) => Promise<boolean>;
  updateLeadWFMProgress: (leadId: string, targetWfmWorkflowStepId: string) => Promise<Lead | null>;

  // View State and Actions
  leadsViewMode: 'table' | 'kanban-compact';
  setLeadsViewMode: (mode: 'table' | 'kanban-compact') => void;
  kanbanCompactMode: boolean;
  setKanbanCompactMode: (isCompact: boolean) => void;
}

// Local storage helpers
const getLeadsViewModeFromLocalStorage = (): 'table' | 'kanban-compact' => {
  try {
    const stored = localStorage.getItem('leadsViewMode');
    if (stored === 'kanban-compact' || stored === 'table') return stored;
    return 'kanban-compact'; // Default to 'kanban-compact' instead of 'table'
  } catch {
    return 'kanban-compact';
  }
};

const getKanbanCompactModeFromLocalStorage = (): boolean => {
  try {
    const isCompact = localStorage.getItem('leadsKanbanCompactMode');
    return isCompact === 'true';
  } catch (_error) {
    return false;
  }
};

const setLeadsViewModeInLocalStorage = (mode: 'table' | 'kanban-compact') => {
  try {
    localStorage.setItem('leadsViewMode', mode);
  } catch {
    // Silently fail if localStorage is not available
  }
};

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: [],
  leadsLoading: false,
  leadsError: null,
  hasInitiallyFetchedLeads: false,
  leadsViewMode: getLeadsViewModeFromLocalStorage(),
  kanbanCompactMode: getKanbanCompactModeFromLocalStorage(),

  fetchLeads: async () => {
    const state = get();
    if (state.leadsLoading) return;

    set({ leadsLoading: true, leadsError: null });

    try {
      type GetLeadsQueryResponse = { leads: Lead[] };
      const response = await gqlClient.request<GetLeadsQueryResponse>(GET_LEADS_QUERY);
      set({ 
        leads: response.leads || [], 
        leadsLoading: false, 
        hasInitiallyFetchedLeads: true 
      });
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      let message = 'Failed to fetch leads';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ leadsError: message, leadsLoading: false });
    }
  },

  createLead: async (input: LeadInput): Promise<Lead | null> => {
    try {
      type CreateLeadMutationResponse = { createLead: Lead };
      const response = await gqlClient.request<CreateLeadMutationResponse, MutationCreateLeadArgs>(
        CREATE_LEAD_MUTATION,
        { input }
      );

      if (response.createLead) {
        set((state) => ({
          leads: [response.createLead, ...state.leads]
        }));
        return response.createLead;
      }
      return null;
    } catch (error: any) {
      console.error('Error creating lead:', error);
      let message = 'Failed to create lead';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ leadsError: message });
      return null;
    }
  },

  updateLead: async (id: string, input: Partial<LeadUpdateInput>): Promise<{ lead: Lead | null; error?: string }> => {
    try {
      type UpdateLeadMutationResponse = { updateLead?: Maybe<Lead> };
      const response = await gqlClient.request<UpdateLeadMutationResponse, MutationUpdateLeadArgs>(
        UPDATE_LEAD_MUTATION,
        { id, input }
      );

      if (response.updateLead) {
        set((state) => ({
          leads: state.leads.map((lead) => 
            lead.id === id ? response.updateLead! : lead
          )
        }));
        return { lead: response.updateLead };
      }

      return { lead: null, error: 'Update returned null' };
    } catch (error: any) {
      console.error('Error updating lead:', error);
      let message = 'Failed to update lead';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ leadsError: message });
      return { lead: null, error: message };
    }
  },

  deleteLead: async (id: string): Promise<boolean> => {
    try {
      type DeleteLeadMutationResponse = { deleteLead?: Maybe<boolean> };
      const response = await gqlClient.request<DeleteLeadMutationResponse, MutationDeleteLeadArgs>(
        DELETE_LEAD_MUTATION,
        { id }
      );

      if (response.deleteLead) {
        set((state) => ({
          leads: state.leads.filter((lead) => lead.id !== id)
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      let message = 'Failed to delete lead';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ leadsError: message });
      return false;
    }
  },

  updateLeadWFMProgress: async (leadId: string, targetWfmWorkflowStepId: string): Promise<Lead | null> => {
    try {
      type UpdateLeadWFMProgressResponse = { updateLeadWFMProgress: Lead };
      const response = await gqlClient.request<UpdateLeadWFMProgressResponse, MutationUpdateLeadWfmProgressArgs>(
        UPDATE_LEAD_WFM_PROGRESS_MUTATION,
        { leadId, targetWfmWorkflowStepId }
      );

      if (response.updateLeadWFMProgress) {
        set((state) => ({
          leads: state.leads.map((lead) => 
            lead.id === leadId ? response.updateLeadWFMProgress : lead
          )
        }));
        return response.updateLeadWFMProgress;
      }
      return null;
    } catch (error: any) {
      console.error('Error updating lead WFM progress:', error);
      let message = 'Failed to update lead workflow progress';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ leadsError: message });
      return null;
    }
  },

  setLeadsViewMode: (mode: 'table' | 'kanban-compact') => {
    set({ leadsViewMode: mode });
    setLeadsViewModeInLocalStorage(mode);
  },

  setKanbanCompactMode: (isCompact: boolean) => {
    set({ kanbanCompactMode: isCompact });
    try {
      localStorage.setItem('leadsKanbanCompactMode', isCompact.toString());
    } catch (error) {
      console.warn('Could not access localStorage to set leadsKanbanCompactMode.', error);
    }
  },
})); 