import { isToday, isPast, parseISO } from 'date-fns';

export interface ActivitySummary {
  id: string;
  type: string;
  subject: string;
  due_date?: string | null;
  is_done: boolean;
}

export interface DealActivityIndicators {
  overdueCount: number;
  dueTodayCount: number;
  hasUrgentActivities: boolean;
}

/**
 * Analyzes activities for a deal and returns indicator counts
 */
export const analyzeDealActivities = (activities: ActivitySummary[]): DealActivityIndicators => {
  let overdueCount = 0;
  let dueTodayCount = 0;

  activities.forEach((activity) => {
    // Skip completed activities
    if (activity.is_done) return;
    
    // Skip activities without due dates
    if (!activity.due_date) return;

    const dueDate = parseISO(activity.due_date);
    const now = new Date();
    
    if (isToday(dueDate)) {
      dueTodayCount++;
    } else if (isPast(dueDate)) {
      overdueCount++;
    }
  });

  return {
    overdueCount,
    dueTodayCount,
    hasUrgentActivities: overdueCount > 0 || dueTodayCount > 0,
  };
};

/**
 * Returns appropriate indicator color based on activity status
 */
export const getActivityIndicatorColor = (indicators: DealActivityIndicators): string => {
  if (indicators.overdueCount > 0) {
    return 'red'; // Overdue activities - urgent
  }
  if (indicators.dueTodayCount > 0) {
    return 'orange'; // Due today - important
  }
  return 'gray'; // No urgent activities
}; 