import { create } from 'zustand';
import { gqlClient } from '../lib/graphqlClient';
import { gql } from 'graphql-request';

interface RuleCondition {
  field: string;
  operator: string;
  value: string;
  logicalOperator: string;
}

interface RuleAction {
  type: string;
  target?: string;
  template?: string;
  message?: string;
  priority: number;
  metadata?: any;
}

interface BusinessRule {
  id: string;
  name: string;
  description?: string;
  entityType: string;
  triggerType: string;
  triggerEvents: string[];
  triggerFields?: string[];
  conditions: RuleCondition[];
  actions: RuleAction[];
  status: string;
  executionCount: number;
  lastExecution?: string;
  lastError?: string;
  wfmWorkflow?: { id: string; name: string };
  wfmStep?: { id: string; status: { id: string; name: string } };
  wfmStatus?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; email: string; display_name: string };
}

interface BusinessRuleInput {
  name: string;
  description?: string;
  entityType: string;
  triggerType: string;
  triggerEvents?: string[];
  triggerFields?: string[];
  conditions: RuleCondition[];
  actions: RuleAction[];
  status: string;
  wfmWorkflowId?: string;
  wfmStepId?: string;
  wfmStatusId?: string;
}

interface BusinessRulesState {
  rules: BusinessRule[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchBusinessRules: () => Promise<void>;
  createBusinessRule: (input: BusinessRuleInput) => Promise<BusinessRule>;
  updateBusinessRule: (id: string, input: Partial<BusinessRuleInput>) => Promise<BusinessRule>;
  deleteBusinessRule: (id: string) => Promise<void>;
  activateRule: (id: string) => Promise<void>;
  deactivateRule: (id: string) => Promise<void>;
  clearError: () => void;
}

// GraphQL Queries and Mutations
const GET_BUSINESS_RULES = gql`
  query GetBusinessRules {
    businessRules {
      nodes {
        id
        name
        description
        entityType
        triggerType
        triggerEvents
        triggerFields
        conditions {
          field
          operator
          value
          logicalOperator
        }
        actions {
          type
          target
          template
          message
          priority
          metadata
        }
        status
        executionCount
        lastError
        lastExecution
        wfmWorkflow {
          id
          name
        }
        wfmStep {
          id
          status {
            id
            name
          }
        }
        wfmStatus {
          id
          name
        }
        createdBy {
          id
          email
          display_name
        }
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

const CREATE_BUSINESS_RULE = gql`
  mutation CreateBusinessRule($input: BusinessRuleInput!) {
    createBusinessRule(input: $input) {
      id
      name
      description
      entityType
      triggerType
      triggerEvents
      triggerFields
      conditions {
        field
        operator
        value
        logicalOperator
      }
      actions {
        type
        target
        template
        message
        priority
        metadata
      }
      status
      executionCount
      lastError
      lastExecution
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_BUSINESS_RULE = gql`
  mutation UpdateBusinessRule($id: ID!, $input: UpdateBusinessRuleInput!) {
    updateBusinessRule(id: $id, input: $input) {
      id
      name
      description
      entityType
      triggerType
      triggerEvents
      triggerFields
      conditions {
        field
        operator
        value
        logicalOperator
      }
      actions {
        type
        target
        template
        message
        priority
        metadata
      }
      status
      executionCount
      lastError
      lastExecution
      createdAt
      updatedAt
    }
  }
`;

const DELETE_BUSINESS_RULE = gql`
  mutation DeleteBusinessRule($id: ID!) {
    deleteBusinessRule(id: $id)
  }
`;

const ACTIVATE_BUSINESS_RULE = gql`
  mutation ActivateBusinessRule($id: ID!) {
    activateBusinessRule(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

const DEACTIVATE_BUSINESS_RULE = gql`
  mutation DeactivateBusinessRule($id: ID!) {
    deactivateBusinessRule(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

export const useBusinessRulesStore = create<BusinessRulesState>((set, get) => ({
  rules: [],
  loading: false,
  error: null,

  fetchBusinessRules: async () => {
    set({ loading: true, error: null });
    try {
      const response = await gqlClient.request<{ businessRules: { nodes: BusinessRule[] } }>(GET_BUSINESS_RULES);
      set({ rules: response.businessRules.nodes, loading: false });
    } catch (error: any) {
      console.error('Error fetching business rules:', error);
      set({ 
        error: error.message || 'Failed to fetch business rules', 
        loading: false 
      });
    }
  },

  createBusinessRule: async (input: BusinessRuleInput) => {
    set({ loading: true, error: null });
    try {
      // Transform input to match GraphQL schema
      const graphqlInput = {
        ...input,
      };

      const response = await gqlClient.request<{ createBusinessRule: BusinessRule }>(
        CREATE_BUSINESS_RULE,
        { input: graphqlInput }
      );

      const newRule = response.createBusinessRule;
      set(state => ({ 
        rules: [...state.rules, newRule], 
        loading: false 
      }));

      return newRule;
    } catch (error: any) {
      console.error('Error creating business rule:', error);
      const errorMessage = error.message || 'Failed to create business rule';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  updateBusinessRule: async (id: string, input: Partial<BusinessRuleInput>) => {
    set({ loading: true, error: null });
    try {
      // Transform input to match GraphQL schema
      const graphqlInput = {
        ...input,
      };

      const response = await gqlClient.request<{ updateBusinessRule: BusinessRule }>(
        UPDATE_BUSINESS_RULE,
        { id, input: graphqlInput }
      );

      const updatedRule = response.updateBusinessRule;
      set(state => ({
        rules: state.rules.map(rule => 
          rule.id === id ? updatedRule : rule
        ),
        loading: false
      }));

      return updatedRule;
    } catch (error: any) {
      console.error('Error updating business rule:', error);
      const errorMessage = error.message || 'Failed to update business rule';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  deleteBusinessRule: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await gqlClient.request(DELETE_BUSINESS_RULE, { id });
      
      set(state => ({
        rules: state.rules.filter(rule => rule.id !== id),
        loading: false
      }));
    } catch (error: any) {
      console.error('Error deleting business rule:', error);
      const errorMessage = error.message || 'Failed to delete business rule';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  activateRule: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await gqlClient.request<{ activateBusinessRule: Partial<BusinessRule> }>(
        ACTIVATE_BUSINESS_RULE,
        { id }
      );

      const updatedRule = response.activateBusinessRule;
      set(state => ({
        rules: state.rules.map(rule => 
          rule.id === id ? { ...rule, ...updatedRule } : rule
        ),
        loading: false
      }));
    } catch (error: any) {
      console.error('Error activating business rule:', error);
      const errorMessage = error.message || 'Failed to activate business rule';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  deactivateRule: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await gqlClient.request<{ deactivateBusinessRule: Partial<BusinessRule> }>(
        DEACTIVATE_BUSINESS_RULE,
        { id }
      );

      const updatedRule = response.deactivateBusinessRule;
      set(state => ({
        rules: state.rules.map(rule => 
          rule.id === id ? { ...rule, ...updatedRule } : rule
        ),
        loading: false
      }));
    } catch (error: any) {
      console.error('Error deactivating business rule:', error);
      const errorMessage = error.message || 'Failed to deactivate business rule';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
})); 