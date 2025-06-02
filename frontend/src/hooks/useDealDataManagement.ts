import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
import type { CustomFieldDefinition } from '../generated/graphql/graphql';

// Define the shape of the props this hook will receive
interface UseDealDataManagementProps {
  deleteDealActionFromStore: (id: string) => Promise<boolean>; // From useDealsStore
  initialDealsError?: string | null; // To display errors from the main store if needed
}

// Define the shape of the object returned by this hook
export interface DealDataManagementHandles {
  dealCustomFieldDefinitions: CustomFieldDefinition[];
  customFieldsLoading: boolean;
  confirmDeleteHandler: (dealId: string) => Promise<boolean>; // Returns success status
  isDeletingDeal: boolean; // True if a delete operation is in progress
  clearDealToDeleteId: () => void; // Function to clear dealToDeleteId after modal closes
  dealToDeleteId: string | null; // Expose this to be managed alongside modal state
}

const GET_DEAL_CUSTOM_FIELD_DEFS_QUERY = gql`
  query GetDealCustomFieldDefinitions {
    customFieldDefinitions(entityType: DEAL, includeInactive: false) {
      id
      fieldName
      fieldLabel
      fieldType
      dropdownOptions { value label }
    }
  }
`;

export const useDealDataManagement = ({
  deleteDealActionFromStore,
  initialDealsError,
}: UseDealDataManagementProps): DealDataManagementHandles => {
  const [dealCustomFieldDefinitions, setDealCustomFieldDefinitions] = useState<CustomFieldDefinition[]>([]);
  const [customFieldsLoading, setCustomFieldsLoading] = useState<boolean>(true);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null); // Used to show loading on specific row
  const [dealToDeleteId, setDealToDeleteId] = useState<string | null>(null); // Track which deal is targeted for deletion
  const toast = useToast();

  useEffect(() => {
    const fetchCustomFieldDefs = async () => {
      setCustomFieldsLoading(true);
      try {
        const data = await gqlClient.request<{ customFieldDefinitions: CustomFieldDefinition[] }>(GET_DEAL_CUSTOM_FIELD_DEFS_QUERY);
        setDealCustomFieldDefinitions(data.customFieldDefinitions || []);
      } catch (error) {
        console.error("Error fetching deal custom field definitions:", error);
        toast({ title: 'Error loading custom field definitions', status: 'error', duration: 3000, isClosable: true });
      }
      finally {
        setCustomFieldsLoading(false);
      }
    };
    fetchCustomFieldDefs();
  }, [toast]);

  const confirmDeleteHandler = useCallback(async (idToDelete: string): Promise<boolean> => {
    if (!idToDelete) return false;
    setDealToDeleteId(idToDelete); // Set which deal is being targeted
    setDeletingRowId(idToDelete); // For UI feedback (e.g., spinner on delete button)
    
    const success = await deleteDealActionFromStore(idToDelete);
    
    setDeletingRowId(null); // Clear loading state
    // setDealToDeleteId(null); // Don't clear here, let the caller do it via clearDealToDeleteId

    if (success) {
      toast({ title: 'Deal deleted.', status: 'success', duration: 3000, isClosable: true });
    } else {
      toast({ 
        title: 'Error Deleting Deal', 
        description: initialDealsError || 'An unknown error occurred while deleting the deal.', 
        status: 'error', 
        duration: 5000, 
        isClosable: true 
      });
    }
    return success;
  }, [deleteDealActionFromStore, toast, initialDealsError]);

  const clearDealToDeleteId = useCallback(() => {
    setDealToDeleteId(null);
  }, []);

  return {
    dealCustomFieldDefinitions,
    customFieldsLoading,
    confirmDeleteHandler,
    isDeletingDeal: !!deletingRowId, // Expose as a boolean for general delete in progress
    dealToDeleteId, // Expose the ID for modal management synchronization
    clearDealToDeleteId,
  };
}; 