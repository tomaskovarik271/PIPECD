import { useState, useCallback } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { useToast } from '@chakra-ui/react';
import {
  VALIDATE_CONVERSION,
  GET_CONVERSION_HISTORY,
  GET_CONVERSION_STATISTICS,
  CONVERT_LEAD_TO_DEAL,
  CONVERT_DEAL_TO_LEAD,
  BULK_CONVERT_LEADS,
  CONVERSION_UPDATES,
  ValidateConversionInput,
  ConvertLeadInput,
  ConvertDealInput,
  BulkConvertLeadsInput
} from '../lib/graphql/conversionOperations';

export interface UseConversionsOptions {
  entityType?: 'lead' | 'deal';
  entityId?: string;
  enableSubscription?: boolean;
}

export function useConversions(options: UseConversionsOptions = {}) {
  const { entityType, entityId, enableSubscription = false } = options;
  const toast = useToast();
  const [isConverting, setIsConverting] = useState(false);

  // Queries
  const {
    data: conversionHistory,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistory
  } = useQuery(GET_CONVERSION_HISTORY, {
    variables: { entityType, entityId },
    skip: !entityType || !entityId,
    fetchPolicy: 'cache-and-network'
  });

  const {
    data: conversionStats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery(GET_CONVERSION_STATISTICS, {
    variables: { timeframe: 'last_30_days' },
    fetchPolicy: 'cache-and-network'
  });

  // Mutations
  const [validateConversionMutation] = useMutation(VALIDATE_CONVERSION);
  const [convertLeadToDealMutation] = useMutation(CONVERT_LEAD_TO_DEAL);
  const [convertDealToLeadMutation] = useMutation(CONVERT_DEAL_TO_LEAD);
  const [bulkConvertLeadsMutation] = useMutation(BULK_CONVERT_LEADS);

  // Subscription for real-time updates
  const { data: conversionUpdate } = useSubscription(CONVERSION_UPDATES, {
    variables: { entityType, entityId },
    skip: !enableSubscription || !entityType || !entityId,
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data?.conversionUpdates) {
        // Refetch history when new conversion events occur
        refetchHistory();
        
        // Show toast notification
        const event = subscriptionData.data.conversionUpdates;
        toast({
          title: 'Conversion Update',
          description: `${event.sourceName} was converted to ${event.targetType}`,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  });

  // Validation function
  const validateConversion = useCallback(async (input: ValidateConversionInput) => {
    try {
      const { data } = await validateConversionMutation({
        variables: { input }
      });
      return data?.validateConversion;
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: 'Validation Failed',
        description: 'Failed to validate conversion. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  }, [validateConversionMutation, toast]);

  // Convert lead to deal
  const convertLeadToDeal = useCallback(async (leadId: string, input: ConvertLeadInput) => {
    setIsConverting(true);
    try {
      const { data } = await convertLeadToDealMutation({
        variables: { id: leadId, input },
        refetchQueries: [
          { query: GET_CONVERSION_HISTORY, variables: { entityType: 'lead', entityId: leadId } },
          { query: GET_CONVERSION_STATISTICS, variables: { timeframe: 'last_30_days' } }
        ]
      });

      const result = data?.convertLeadToDeal;
      if (result?.success) {
        toast({
          title: 'Conversion Successful!',
          description: result.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      return result;
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: 'Conversion Failed',
        description: 'An error occurred during conversion. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setIsConverting(false);
    }
  }, [convertLeadToDealMutation, toast]);

  // Convert deal to lead
  const convertDealToLead = useCallback(async (dealId: string, input: ConvertDealInput) => {
    setIsConverting(true);
    try {
      const { data } = await convertDealToLeadMutation({
        variables: { id: dealId, input },
        refetchQueries: [
          { query: GET_CONVERSION_HISTORY, variables: { entityType: 'deal', entityId: dealId } },
          { query: GET_CONVERSION_STATISTICS, variables: { timeframe: 'last_30_days' } }
        ]
      });

      const result = data?.convertDealToLead;
      if (result?.success) {
        toast({
          title: 'Conversion Successful!',
          description: result.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      return result;
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: 'Conversion Failed',
        description: 'An error occurred during conversion. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setIsConverting(false);
    }
  }, [convertDealToLeadMutation, toast]);

  // Bulk convert leads
  const bulkConvertLeads = useCallback(async (input: BulkConvertLeadsInput) => {
    setIsConverting(true);
    try {
      const { data } = await bulkConvertLeadsMutation({
        variables: { input },
        refetchQueries: [
          { query: GET_CONVERSION_STATISTICS, variables: { timeframe: 'last_30_days' } }
        ]
      });

      const result = data?.bulkConvertLeads;
      if (result?.summary) {
        const { successCount, errorCount, totalProcessed } = result.summary;
        
        if (errorCount === 0) {
          toast({
            title: 'Bulk Conversion Successful!',
            description: `Successfully converted ${successCount} out of ${totalProcessed} leads`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Bulk Conversion Completed with Errors',
            description: `Converted ${successCount} leads, ${errorCount} failed`,
            status: 'warning',
            duration: 7000,
            isClosable: true,
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Bulk conversion error:', error);
      toast({
        title: 'Bulk Conversion Failed',
        description: 'An error occurred during bulk conversion. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setIsConverting(false);
    }
  }, [bulkConvertLeadsMutation, toast]);

  // Utility functions
  const getConversionHistory = useCallback(() => {
    return conversionHistory?.getConversionHistory || [];
  }, [conversionHistory]);

  const getConversionStatistics = useCallback(() => {
    return conversionStats?.getConversionStatistics;
  }, [conversionStats]);

  const refreshData = useCallback(() => {
    refetchHistory();
    refetchStats();
  }, [refetchHistory, refetchStats]);

  return {
    // Data
    conversionHistory: getConversionHistory(),
    conversionStats: getConversionStatistics(),
    
    // Loading states
    isConverting,
    historyLoading,
    statsLoading,
    
    // Errors
    historyError,
    statsError,
    
    // Actions
    validateConversion,
    convertLeadToDeal,
    convertDealToLead,
    bulkConvertLeads,
    refreshData,
    
    // Real-time updates
    conversionUpdate: conversionUpdate?.conversionUpdates
  };
}

// Specialized hooks for specific use cases

export function useLeadConversion(leadId: string) {
  return useConversions({
    entityType: 'lead',
    entityId: leadId,
    enableSubscription: true
  });
}

export function useDealConversion(dealId: string) {
  return useConversions({
    entityType: 'deal',
    entityId: dealId,
    enableSubscription: true
  });
}

export function useConversionStatistics() {
  const { conversionStats, statsLoading, statsError, refreshData } = useConversions();
  
  return {
    statistics: conversionStats,
    loading: statsLoading,
    error: statsError,
    refresh: refreshData
  };
}

// Helper functions for conversion logic
export const ConversionHelpers = {
  canConvertLeadToDeal: (lead: any) => {
    // Basic validation - lead should have minimum required data
    return !!(lead?.name && (lead?.contact_name || lead?.contact_email));
  },

  canConvertDealToLead: (deal: any) => {
    // Check if deal is in a convertible status
    const status = deal?.currentWfmStep?.status?.name?.toLowerCase();
    const blockedStatuses = ['won', 'closed won', 'closed lost'];
    return !blockedStatuses.includes(status);
  },

  getConversionRecommendation: (entity: any, entityType: 'lead' | 'deal') => {
    if (entityType === 'lead') {
      const score = entity.lead_score || 0;
      if (score >= 70) return { recommend: true, reason: 'High lead score - ready for conversion' };
      if (score >= 50) return { recommend: true, reason: 'Good lead score - consider conversion' };
      return { recommend: false, reason: 'Low lead score - needs more qualification' };
    }
    
    if (entityType === 'deal') {
      const status = entity.currentWfmStep?.status?.name?.toLowerCase();
      if (status === 'prospecting') return { recommend: true, reason: 'Early stage - good for lead nurturing' };
      if (status === 'qualification') return { recommend: false, reason: 'In qualification - avoid conversion' };
      return { recommend: false, reason: 'Advanced stage - conversion not recommended' };
    }
    
    return { recommend: false, reason: 'Unable to determine recommendation' };
  },

  formatConversionReason: (reason: string) => {
    const reasonMap: Record<string, string> = {
      'unqualified': 'Prospect was unqualified',
      'timing': 'Wrong timing - too early',
      'budget': 'Budget constraints',
      'competition': 'Lost to competition',
      'requirements': 'Requirements mismatch',
      'nurture': 'Needs more nurturing',
      'qualified': 'Lead qualified for conversion',
      'demo_completed': 'Demo completed successfully',
      'other': 'Other reason'
    };
    
    return reasonMap[reason] || reason;
  }
}; 