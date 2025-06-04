import { create } from 'zustand';
import { gqlClient } from '../lib/graphqlClient';
import gql from 'graphql-tag';
import type { QueryWfmProjectTypeByNameArgs, Maybe } from '../generated/graphql/graphql';
import type { WfmProjectType } from '../generated/graphql/graphql';

const GET_WFM_PROJECT_TYPE_BY_NAME_FOR_CONFIG = gql`
  query GetWFMProjectTypeByNameForConfig($name: String!) {
    wfmProjectTypeByName(name: $name) {
      id
      name
      defaultWorkflow {
        id
        name
      }
    }
  }
`;

// Define the expected response structure for the query
interface WFMProjectTypeByNameResponse {
  wfmProjectTypeByName: {
    id: string;
    name: string;
    defaultWorkflow: {
      id: string;
      name: string;
    } | null;
  } | null;
}

interface WFMConfigState {
  salesDealWorkflowId: string | null;
  isLoadingSalesDealWorkflowId: boolean;
  errorLoadingSalesDealWorkflowId: string | null;
  fetchSalesDealWorkflowId: () => Promise<void>;
  
  leadQualificationWorkflowId: string | null;
  isLoadingLeadQualificationWorkflowId: boolean;
  errorLoadingLeadQualificationWorkflowId: string | null;
  fetchLeadQualificationWorkflowId: () => Promise<void>;
}

export const useWFMConfigStore = create<WFMConfigState>((set) => ({
  salesDealWorkflowId: null,
  isLoadingSalesDealWorkflowId: false,
  errorLoadingSalesDealWorkflowId: null,
  fetchSalesDealWorkflowId: async () => {
    set({ isLoadingSalesDealWorkflowId: true, errorLoadingSalesDealWorkflowId: null });
    try {
      const data = await gqlClient.request<
        WFMProjectTypeByNameResponse,
        { name: string }
      >(GET_WFM_PROJECT_TYPE_BY_NAME_FOR_CONFIG, { name: "Sales Deal" });

      if (data.wfmProjectTypeByName && data.wfmProjectTypeByName.defaultWorkflow) {
        set({ 
          salesDealWorkflowId: data.wfmProjectTypeByName.defaultWorkflow.id, 
          isLoadingSalesDealWorkflowId: false 
        });
      } else {
        const errorMessage = data.wfmProjectTypeByName?.defaultWorkflow === null 
          ? 'Sales Deal project type exists but has no default workflow assigned.'
          : 'Sales Deal WFM Project Type not found or default workflow ID is missing.';
        console.error('Error fetching Sales Deal Workflow ID:', errorMessage);
        set({ 
          errorLoadingSalesDealWorkflowId: errorMessage, 
          isLoadingSalesDealWorkflowId: false 
        });
      }
    } catch (error: any) {
      console.error("Error fetching Sales Deal Workflow ID:", error);
      let message = 'Failed to fetch Sales Deal workflow configuration.';
      if (error instanceof Error) {
        message = error.message;
      }
      if (error.response && error.response.errors && Array.isArray(error.response.errors)) {
        message = error.response.errors.map((err: { message: string }) => err.message).join('\n');
      }
      set({ errorLoadingSalesDealWorkflowId: message, isLoadingSalesDealWorkflowId: false });
    }
  },
  
  leadQualificationWorkflowId: null,
  isLoadingLeadQualificationWorkflowId: false,
  errorLoadingLeadQualificationWorkflowId: null,
  fetchLeadQualificationWorkflowId: async () => {
    set({ isLoadingLeadQualificationWorkflowId: true, errorLoadingLeadQualificationWorkflowId: null });
    try {
      const data = await gqlClient.request<
        WFMProjectTypeByNameResponse,
        { name: string }
      >(GET_WFM_PROJECT_TYPE_BY_NAME_FOR_CONFIG, { name: "Lead Qualification and Conversion Process" });

      if (data.wfmProjectTypeByName && data.wfmProjectTypeByName.defaultWorkflow) {
        set({ 
          leadQualificationWorkflowId: data.wfmProjectTypeByName.defaultWorkflow.id, 
          isLoadingLeadQualificationWorkflowId: false 
        });
      } else {
        const errorMessage = data.wfmProjectTypeByName?.defaultWorkflow === null 
          ? 'Lead Qualification and Conversion Process project type exists but has no default workflow assigned.'
          : 'Lead Qualification and Conversion Process WFM Project Type not found or default workflow ID is missing.';
        console.error('Error fetching Lead Qualification Workflow ID:', errorMessage);
        set({ 
          errorLoadingLeadQualificationWorkflowId: errorMessage, 
          isLoadingLeadQualificationWorkflowId: false 
        });
      }
    } catch (error: any) {
      console.error("Error fetching Lead Qualification Workflow ID:", error);
      let message = 'Failed to fetch Lead Qualification workflow configuration.';
      if (error instanceof Error) {
        message = error.message;
      }
      if (error.response && error.response.errors && Array.isArray(error.response.errors)) {
        message = error.response.errors.map((err: { message: string }) => err.message).join('\n');
      }
      set({ errorLoadingLeadQualificationWorkflowId: message, isLoadingLeadQualificationWorkflowId: false });
    }
  },
}));

// Call this from a top-level component like App.tsx
// Example: useEffect(() => { useWFMConfigStore.getState().fetchSalesDealWorkflowId(); }, []); 