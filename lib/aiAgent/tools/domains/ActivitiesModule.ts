/**
 * Activities Domain Module for PipeCD AI Agent (Refactored)
 * 
 * Uses existing activityService instead of direct GraphQL operations
 * Provides AI-optimized interface while maintaining business logic consistency
 */

import type { ToolResult, ToolExecutionContext } from '../../types/tools';
import { ActivityAdapter } from '../../adapters/ActivityAdapter';
import type { 
  AIActivitySearchParams, 
  AICreateActivityParams, 
  AIUpdateActivityParams 
} from '../../adapters/ActivityAdapter';
import { activityService } from '../../../activityService';

export class ActivitiesModule {
  /**
   * Search and filter activities using existing activityService with AI filtering
   */
  async searchActivities(
    params: AIActivitySearchParams,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return ActivityAdapter.createErrorResult('search_activities', new Error('Authentication required'), params);
      }

      // Use activityService to get activities with basic filtering
      const serviceFilter = {
        dealId: undefined, // Could be enhanced with AI params later
        personId: undefined,
        organizationId: undefined,
        isDone: params.completed,
      };

      const activities = await activityService.getActivities(context.userId, context.authToken, serviceFilter);
      
      // Apply AI-specific filtering and sorting
      const filteredActivities = ActivityAdapter.applySearchFilters(activities, params);
      
      return ActivityAdapter.createSearchResult(filteredActivities, params);
    } catch (error) {
      return ActivityAdapter.createErrorResult('search_activities', error, params);
    }
  }

  /**
   * Create a new activity using existing activityService
   */
  async createActivity(
    params: AICreateActivityParams,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return ActivityAdapter.createErrorResult('create_activity', new Error('Authentication required'), params);
      }

      const activityInput = ActivityAdapter.toActivityInput(params);
      const activity = await activityService.createActivity(context.userId, activityInput, context.authToken);
      
      return ActivityAdapter.createCreateResult(activity, params);
    } catch (error) {
      return ActivityAdapter.createErrorResult('create_activity', error, params);
    }
  }

  /**
   * Update an existing activity using existing activityService
   */
  async updateActivity(
    params: AIUpdateActivityParams,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return ActivityAdapter.createErrorResult('update_activity', new Error('Authentication required'), params);
      }

      const updateInput = ActivityAdapter.toActivityUpdateInput(params);
      const activity = await activityService.updateActivity(context.userId, params.activity_id, updateInput, context.authToken);
      
      return ActivityAdapter.createUpdateResult(activity, params);
    } catch (error) {
      return ActivityAdapter.createErrorResult('update_activity', error, params);
    }
  }

  /**
   * Mark an activity as completed (special case of update)
   */
  async completeActivity(
    params: { activity_id: string; completion_notes?: string },
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return ActivityAdapter.createErrorResult('complete_activity', new Error('Authentication required'), params);
      }

      const updateInput = {
        is_done: true,
        notes: params.completion_notes,
      };
      
      const activity = await activityService.updateActivity(context.userId, params.activity_id, updateInput, context.authToken);
      
      return {
        success: true,
        data: activity,
        message: `✅ Activity completed successfully!\n\n**Completed Activity:**\n- **Subject:** ${activity.subject}\n- **Completed:** ${new Date().toLocaleDateString()}\n- **Activity ID:** ${activity.id}`,
        metadata: {
          toolName: 'complete_activity',
          parameters: params,
          timestamp: new Date().toISOString(),
          executionTime: 0,
        },
      };
    } catch (error) {
      return ActivityAdapter.createErrorResult('complete_activity', error, params);
    }
  }

  /**
   * Get detailed information about a specific activity
   */
  async getActivityDetails(
    params: { activity_id: string },
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return ActivityAdapter.createErrorResult('get_activity_details', new Error('Authentication required'), params);
      }

      const activity = await activityService.getActivityById(context.userId, params.activity_id, context.authToken);
      
      if (!activity) {
        return {
          success: false,
          message: `❌ Activity not found: No activity found with ID ${params.activity_id}`,
          metadata: {
            toolName: 'get_activity_details',
            parameters: params,
            timestamp: new Date().toISOString(),
            executionTime: 0,
          },
        };
      }
      
      return {
        success: true,
        data: activity,
        message: ActivityAdapter.formatActivityDetails(activity),
        metadata: {
          toolName: 'get_activity_details',
          parameters: params,
          timestamp: new Date().toISOString(),
          executionTime: 0,
        },
      };
    } catch (error) {
      return ActivityAdapter.createErrorResult('get_activity_details', error, params);
    }
  }
} 