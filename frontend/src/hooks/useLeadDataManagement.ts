import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useCustomFieldsStore } from '../stores/useCustomFieldsStore';
import { CustomFieldEntityType } from '../generated/graphql/graphql';

interface UseLeadDataManagementProps {
  deleteLeadActionFromStore: (id: string) => Promise<boolean>;
  initialLeadsError: string | null;
}

interface UseLeadDataManagementReturn {
  leadCustomFieldDefinitions: any[];
  customFieldsLoading: boolean;
  confirmDeleteHandler: (leadId: string) => Promise<void>;
  isDeletingLead: boolean;
  leadToDeleteId: string | null;
  clearLeadToDeleteId: () => void;
}

export function useLeadDataManagement({
  deleteLeadActionFromStore,
  initialLeadsError
}: UseLeadDataManagementProps): UseLeadDataManagementReturn {
  const toast = useToast();
  const { customFieldDefinitions, loading: customFieldsLoading, fetchCustomFieldDefinitions } = useCustomFieldsStore();
  const [isDeletingLead, setIsDeletingLead] = useState(false);
  const [leadToDeleteId, setLeadToDeleteId] = useState<string | null>(null);

  // Filter custom fields for leads
  const leadCustomFieldDefinitions = customFieldDefinitions.filter(
    (def) => def.entityType === CustomFieldEntityType.Lead
  );

  useEffect(() => {
    fetchCustomFieldDefinitions();
  }, [fetchCustomFieldDefinitions]);

  // Show toast for leads error
  useEffect(() => {
    if (initialLeadsError) {
      toast({
        title: 'Error Loading Leads',
        description: initialLeadsError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [initialLeadsError, toast]);

  const confirmDeleteHandler = async (leadId: string) => {
    setIsDeletingLead(true);
    setLeadToDeleteId(leadId);
    
    try {
      await deleteLeadActionFromStore(leadId);
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    } finally {
      setIsDeletingLead(false);
      setLeadToDeleteId(null);
    }
  };

  const clearLeadToDeleteId = () => {
    setLeadToDeleteId(null);
  };

  return {
    leadCustomFieldDefinitions,
    customFieldsLoading,
    confirmDeleteHandler,
    isDeletingLead,
    leadToDeleteId,
    clearLeadToDeleteId
  };
} 