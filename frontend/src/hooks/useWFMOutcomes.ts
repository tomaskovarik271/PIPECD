import { useQuery } from '@apollo/client';
import { GET_WFM_STEP_MAPPINGS } from '../lib/graphql/wfmOutcomeOperations';

export const useWFMOutcomes = (workflowId?: string) => {
  const { data, loading, error } = useQuery(GET_WFM_STEP_MAPPINGS, {
    variables: {
      workflowId,
      isActive: true
    },
    skip: !workflowId
  });

  const availableOutcomes = data?.wfmStepMappings?.map((mapping: any) => mapping.outcomeType) || [];
  
  // Remove duplicates and add empty option for clearing selection
  const uniqueOutcomes = [...new Set(availableOutcomes), ''];

  return {
    outcomeTypes: uniqueOutcomes,
    loading,
    error
  };
}; 