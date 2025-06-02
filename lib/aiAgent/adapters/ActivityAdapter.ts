/**
 * Activity Adapter for PipeCD AI Agent
 * 
 * Converts between AI Agent activity tool parameters and
 * existing PipeCD activityService interface
 */

import type { Activity, CreateActivityInput, UpdateActivityInput } from '../../generated/graphql';
import type { ToolResult } from '../types/tools';
import { BaseAdapter } from './BaseAdapter';

// AI Agent parameter types
export interface AIActivitySearchParams {
  search_term?: string;
  type?: string;
  assigned_to?: string;
  due_before?: string;
  completed?: boolean;
  limit?: number;
}

export interface AICreateActivityParams {
  type: string;
  description: string;
  due_date?: string;
  deal_id?: string;
  contact_id?: string;
  assigned_to_user_id?: string;
}

export interface AIUpdateActivityParams {
  activity_id: string;
  type?: string;
  subject?: string;
  due_date?: string;
  notes?: string;
  is_done?: boolean;
  deal_id?: string;
  person_id?: string;
  organization_id?: string;
}

export class ActivityAdapter extends BaseAdapter {
  /**
   * Convert AI search parameters to service filters and apply filtering
   */
  static applySearchFilters(activities: Activity[], params: AIActivitySearchParams): Activity[] {
    const { limit = 20 } = params;

    const filterMappings = {
      search_term: (activity: Activity, term: string) => {
        const searchTerm = term.toLowerCase();
        return activity.subject?.toLowerCase().includes(searchTerm) || 
               activity.notes?.toLowerCase().includes(searchTerm) ||
               activity.type?.toLowerCase().includes(searchTerm) || false;
      },
      type: (activity: Activity, type: string) =>
        activity.type?.toLowerCase() === type.toLowerCase(),
      assigned_to: (activity: Activity, userId: string) =>
        activity.assigned_to_user_id === userId,
      due_before: (activity: Activity, dueBefore: string) => {
        if (!activity.due_date) return false;
        return new Date(activity.due_date) <= new Date(dueBefore);
      },
      completed: (activity: Activity, completed: boolean) =>
        activity.is_done === completed,
    };

    const filtered = this.applyFilters(activities, params, filterMappings);
    return this.sortAndLimit(filtered, 'due_date', limit, true);
  }

  /**
   * Convert AI create activity parameters to CreateActivityInput for activityService
   */
  static toActivityInput(params: AICreateActivityParams): CreateActivityInput {
    return {
      type: params.type as any, // Will be validated by service
      subject: params.description, // Required field, don't pass through cleanInput
      due_date: params.due_date ? new Date(params.due_date) : undefined,
      is_done: false, // Default for new activities
      notes: undefined, // Not provided in create params
      deal_id: params.deal_id,
      person_id: params.contact_id, // AI uses contact_id, service expects person_id
      organization_id: undefined, // Not provided in create params
    };
  }

  /**
   * Convert AI update activity parameters to UpdateActivityInput for activityService
   */
  static toActivityUpdateInput(params: AIUpdateActivityParams): UpdateActivityInput {
    return this.cleanInput({
      type: params.type as any,
      subject: params.subject,
      due_date: params.due_date ? new Date(params.due_date) : undefined,
      notes: params.notes,
      is_done: params.is_done,
      deal_id: params.deal_id,
      person_id: params.person_id,
      organization_id: params.organization_id,
    });
  }

  /**
   * Format a list of Activity records for AI response
   */
  static formatActivitiesList(activities: Activity[], searchTerm?: string): string {
    const activityList = activities.map((activity: Activity) => {
      const dueDate = activity.due_date 
        ? new Date(activity.due_date).toLocaleDateString()
        : 'No due date';
      const status = activity.is_done ? '✅ Completed' : '⏰ Pending';
      
      // Show linked entity info when available
      let linkedInfo = '';
      if (activity.deal_id) {
        linkedInfo += ` (Deal: ${activity.deal_id.substring(0, 8)}...)`;
      }
      if (activity.person_id) {
        linkedInfo += ` (Contact: ${activity.person_id.substring(0, 8)}...)`;
      }
      if (activity.organization_id) {
        linkedInfo += ` (Org: ${activity.organization_id.substring(0, 8)}...)`;
      }
      
      return `• **${activity.subject}** [${activity.type}] - ${status}\nDue: ${dueDate}${linkedInfo}\nID: ${activity.id}`;
    }).join('\n\n');

    return `✅ Found ${activities.length} activit${activities.length === 1 ? 'y' : 'ies'}${searchTerm ? ` matching "${searchTerm}"` : ''}\n\n${activityList}`;
  }

  /**
   * Format a single Activity record for AI response
   */
  static formatActivityDetails(activity: Activity): string {
    const dueDate = activity.due_date 
      ? new Date(activity.due_date).toLocaleDateString()
      : 'Not set';
    const status = activity.is_done ? '✅ Completed' : '⏰ Pending';
    
    // Show linked entity info
    let linkedDisplay = 'None';
    if (activity.deal_id) {
      linkedDisplay = `Deal (ID: ${activity.deal_id})`;
    } else if (activity.person_id) {
      linkedDisplay = `Contact (ID: ${activity.person_id})`;
    } else if (activity.organization_id) {
      linkedDisplay = `Organization (ID: ${activity.organization_id})`;
    }

    let assigneeDisplay = 'Not assigned';
    if (activity.assigned_to_user_id) {
      assigneeDisplay = `Assigned (ID: ${activity.assigned_to_user_id})`;
    }
    
    return `✅ Activity details retrieved

**Activity Information:**
- **Subject:** ${activity.subject}
- **Type:** ${activity.type}
- **Status:** ${status}
- **Due Date:** ${dueDate}
- **Linked To:** ${linkedDisplay}
- **Assigned To:** ${assigneeDisplay}
- **Notes:** ${activity.notes || 'None'}
- **Created:** ${new Date(activity.created_at).toLocaleDateString()}
- **Last Updated:** ${new Date(activity.updated_at).toLocaleDateString()}
- **Activity ID:** ${activity.id}`;
  }

  /**
   * Format activity creation success for AI response
   */
  static formatActivityCreated(activity: Activity): string {
    const dueDate = activity.due_date 
      ? new Date(activity.due_date).toLocaleDateString()
      : 'Not set';
    
    let linkedDisplay = 'None';
    if (activity.deal_id) {
      linkedDisplay = `Deal (ID: ${activity.deal_id})`;
    } else if (activity.person_id) {
      linkedDisplay = `Contact (ID: ${activity.person_id})`;
    } else if (activity.organization_id) {
      linkedDisplay = `Organization (ID: ${activity.organization_id})`;
    }
    
    return `✅ Activity created successfully!

**Activity Details:**
- **Subject:** ${activity.subject}
- **Type:** ${activity.type}
- **Due Date:** ${dueDate}
- **Linked To:** ${linkedDisplay}
- **Status:** ⏰ Pending
- **Created:** ${new Date(activity.created_at).toLocaleDateString()}
- **Activity ID:** ${activity.id}`;
  }

  /**
   * Format activity update success for AI response
   */
  static formatActivityUpdated(activity: Activity): string {
    const status = activity.is_done ? '✅ Completed' : '⏰ Pending';
    const dueDate = activity.due_date 
      ? new Date(activity.due_date).toLocaleDateString()
      : 'Not set';
    
    return `✅ Activity updated successfully!

**Updated Activity:**
- **Subject:** ${activity.subject}
- **Type:** ${activity.type}
- **Status:** ${status}
- **Due Date:** ${dueDate}
- **Last Updated:** ${new Date(activity.updated_at).toLocaleDateString()}
- **Activity ID:** ${activity.id}`;
  }

  /**
   * Create a successful search result
   */
  static createSearchResult(
    activities: Activity[],
    params: AIActivitySearchParams
  ): ToolResult {
    return this.createSuccessResult(
      'search_activities',
      this.formatActivitiesList(activities, params.search_term),
      activities,
      params
    );
  }

  /**
   * Create a successful create result
   */
  static createCreateResult(
    activity: Activity,
    params: AICreateActivityParams
  ): ToolResult {
    return this.createSuccessResult(
      'create_activity',
      this.formatActivityCreated(activity),
      activity,
      params
    );
  }

  /**
   * Create a successful update result
   */
  static createUpdateResult(
    activity: Activity,
    params: AIUpdateActivityParams
  ): ToolResult {
    return this.createSuccessResult(
      'update_activity',
      this.formatActivityUpdated(activity),
      activity,
      params
    );
  }

  /**
   * Create an error result for AI tools
   */
  static createErrorResult(
    toolName: string,
    error: unknown,
    parameters: Record<string, any>
  ): ToolResult {
    return super.createErrorResult(toolName, error, parameters);
  }
} 