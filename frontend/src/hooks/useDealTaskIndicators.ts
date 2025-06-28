import { useQuery } from '@apollo/client';
import { GET_DEAL_TASK_INDICATORS } from '../graphql/task.operations';

export interface DealTaskIndicator {
  dealId: string;
  tasksDueToday: number;
  tasksOverdue: number;
  totalActiveTasks: number;
}

export const useDealTaskIndicators = (dealIds: string[]) => {
  const { data, loading, error, refetch } = useQuery(GET_DEAL_TASK_INDICATORS, {
    variables: { dealIds },
    skip: dealIds.length === 0,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const taskIndicators = data?.dealTaskIndicators || [];

  // Create a map for easy lookup
  const taskIndicatorMap = taskIndicators.reduce((acc: Record<string, DealTaskIndicator>, indicator: DealTaskIndicator) => {
    acc[indicator.dealId] = indicator;
    return acc;
  }, {});

  // Helper function to get indicators for a specific deal
  const getIndicatorsForDeal = (dealId: string): DealTaskIndicator => {
    return taskIndicatorMap[dealId] || {
      dealId,
      tasksDueToday: 0,
      tasksOverdue: 0,
      totalActiveTasks: 0,
    };
  };

  return {
    taskIndicators,
    taskIndicatorMap,
    getIndicatorsForDeal,
    loading,
    error,
    refetch,
  };
}; 