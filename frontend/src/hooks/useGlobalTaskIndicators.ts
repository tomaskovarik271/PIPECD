import { useQuery } from '@apollo/client';
import { GET_GLOBAL_TASK_INDICATORS } from '../graphql/task.operations';

export interface GlobalTaskIndicator {
  tasksDueToday: number;
  tasksOverdue: number;
  tasksHighPriority: number;
  totalActiveTasks: number;
  tasksByPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}

export const useGlobalTaskIndicators = (userId: string | null) => {
  const { data, loading, error, refetch } = useQuery(GET_GLOBAL_TASK_INDICATORS, {
    variables: { userId },
    skip: !userId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network', // Same as deal indicators
    notifyOnNetworkStatusChange: true,
    pollInterval: 60000, // Refresh every minute for live data
  });

  const taskIndicators: GlobalTaskIndicator = data?.globalTaskIndicators || {
    tasksDueToday: 0,
    tasksOverdue: 0,
    tasksHighPriority: 0,
    totalActiveTasks: 0,
    tasksByPriority: {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
  };

  // Calculate total unread count for notification badge
  const unreadCount = taskIndicators.tasksDueToday + taskIndicators.tasksOverdue;

  // Generate live notification items (no stored notifications needed)
  const liveNotificationItems = [];

  if (taskIndicators.tasksDueToday > 0) {
    liveNotificationItems.push({
      id: 'tasks-due-today',
      title: `${taskIndicators.tasksDueToday} Tasks Due Today`,
      message: 'Click to view tasks requiring attention today',
      priority: 2,
      actionUrl: '/tasks?filter=due-today',
      source: 'LIVE_TASK_DATA',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  if (taskIndicators.tasksOverdue > 0) {
    liveNotificationItems.push({
      id: 'tasks-overdue',
      title: `${taskIndicators.tasksOverdue} Overdue Tasks`,
      message: 'These tasks need immediate attention',
      priority: 3,
      actionUrl: '/tasks?filter=overdue',
      source: 'LIVE_TASK_DATA',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  if (taskIndicators.tasksHighPriority > 0) {
    liveNotificationItems.push({
      id: 'high-priority-tasks',
      title: `${taskIndicators.tasksHighPriority} High Priority Tasks`,
      message: 'Focus on these important tasks',
      priority: 2,
      actionUrl: '/tasks?filter=high-priority',
      source: 'LIVE_TASK_DATA',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  return {
    taskIndicators,
    unreadCount,
    liveNotificationItems,
    loading,
    error,
    refetch,
  };
}; 