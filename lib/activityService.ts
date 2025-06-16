import { SupabaseClient } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils';
import { activityReminderService } from './activityReminderService';
import type { Activity, CreateActivityInput, UpdateActivityInput } from './generated/graphql';

// Define a simple filter type for getActivities
export interface ActivityFilter {
    dealId?: string;
    personId?: string;
    organizationId?: string;
    leadId?: string;
    isDone?: boolean;
}

// --- Activity Service ---
export const activityService = {
  /**
   * Creates a new activity for the given user.
   */
  async createActivity(userId: string, input: CreateActivityInput, accessToken: string): Promise<Activity> {
    // console.log('[activityService.createActivity] called for user:', userId, 'input:', input);
    const supabaseClient: SupabaseClient = getAuthenticatedClient(accessToken);
    const { error, data } = await supabaseClient
      .from('activities')
      .insert({ ...input, user_id: userId })
      .select()
      .single();

    handleSupabaseError(error, 'creating activity');
    if (!data) {
      throw new GraphQLError('Failed to create activity: No data returned', { 
        extensions: { code: 'INTERNAL_SERVER_ERROR' } 
      });
    }

    // Schedule reminders for the new activity if it has a due date
    if (data.due_date && !data.is_done) {
      try {
        await activityReminderService.scheduleActivityReminders(data.id);
      } catch (reminderError) {
        console.error('[activityService.createActivity] Failed to schedule reminders:', reminderError);
        // Don't fail the activity creation if reminder scheduling fails
      }
    }

    return data as Activity;
  },

  /**
   * Retrieves a single activity by its ID, ensuring the user has access.
   */
  async getActivityById(userId: string, activityId: string, accessToken: string): Promise<Activity | null> {
    // console.log('[activityService.getActivityById] called for user:', userId, 'activityId:', activityId);
    const supabaseClient: SupabaseClient = getAuthenticatedClient(accessToken);
    const { data, error } = await supabaseClient
      .from('activities')
      .select('id, user_id, type, subject, due_date, notes, is_done, assigned_to_user_id, deal_id, person_id, organization_id, lead_id, is_system_activity, created_at, updated_at')
      // RLS will enforce whether this user (userId, from accessToken) can access this activityId.
      // The RLS policy allows access if:
      // 1. auth.uid() = activities.user_id (current user is the creator)
      // OR
      // 2. auth.uid() = activities.assigned_to_user_id AND activities.is_system_activity = TRUE (current user is assigned to a system task)
      .eq('id', activityId) 
      .maybeSingle();

    // PGRST116: Row not found or permission denied. maybeSingle() handles this by returning null.
    // We only want to throw for other unexpected errors.
    if (error && error.code !== 'PGRST116') { 
      handleSupabaseError(error, 'getting activity by ID');
    }

    return data as Activity | null;
  },

  /**
   * Fetches activities for a given user, optionally filtered.
   * Note: RLS policies are expected to enforce that users can only see their own activities
   * or activities related to entities they have access to.
   */
  async getActivities(userId: string, accessToken: string, filter?: ActivityFilter): Promise<Activity[]> {
    // console.log('[activityService.getActivities] called for user:', userId, 'filter:', filter);
    const supabaseClient: SupabaseClient = getAuthenticatedClient(accessToken);
    let query = supabaseClient
      .from('activities')
      .select('id, user_id, type, subject, due_date, notes, is_done, assigned_to_user_id, deal_id, person_id, organization_id, lead_id, is_system_activity, created_at, updated_at');
      // RLS handles user_id filtering

    // Apply filters (logic remains the same)
    if (filter?.dealId) query = query.eq('deal_id', filter.dealId);
    if (filter?.personId) query = query.eq('person_id', filter.personId);
    if (filter?.organizationId) query = query.eq('organization_id', filter.organizationId);
    if (filter?.leadId) query = query.eq('lead_id', filter.leadId);
    if (filter?.isDone !== undefined) query = query.eq('is_done', filter.isDone);

    // Ordering logic remains the same
    query = query.order('due_date', { ascending: true, nullsFirst: false })
                 .order('created_at', { ascending: false });

    const { data, error } = await query;

    handleSupabaseError(error, 'getting activities');
    return (data || []) as Activity[];
  },

  /**
   * Updates an existing activity.
   */
  async updateActivity(userId: string, activityId: string, updates: UpdateActivityInput, accessToken: string): Promise<Activity> {
    // console.log('[activityService.updateActivity] called for user:', userId, 'activityId:', activityId, 'updates:', updates);
    const supabaseClient: SupabaseClient = getAuthenticatedClient(accessToken);
    
    // Safe update object logic remains the same
    const safeUpdates: Partial<UpdateActivityInput> = {};
    if (updates.type !== undefined) safeUpdates.type = updates.type;
    if (updates.subject !== undefined) safeUpdates.subject = updates.subject;
    if (updates.due_date !== undefined) safeUpdates.due_date = updates.due_date;
    if (updates.notes !== undefined) safeUpdates.notes = updates.notes;
    if (updates.is_done !== undefined) safeUpdates.is_done = updates.is_done;
    if (updates.assigned_to_user_id !== undefined) safeUpdates.assigned_to_user_id = updates.assigned_to_user_id;
    if (updates.deal_id !== undefined) safeUpdates.deal_id = updates.deal_id;
    if (updates.person_id !== undefined) safeUpdates.person_id = updates.person_id;
    if (updates.organization_id !== undefined) safeUpdates.organization_id = updates.organization_id;
    
    if (Object.keys(safeUpdates).length === 0) {
        throw new GraphQLError('No valid fields provided for update.');
    }

    const { data, error } = await supabaseClient
      .from('activities')
      .update(safeUpdates)
      .eq('id', activityId)
      .select()
      .single();

     // Handle not found error specifically
      if (error && error.code === 'PGRST116') {
        throw new GraphQLError('Activity not found or user not authorized.', { extensions: { code: 'NOT_FOUND' } });
      }
      handleSupabaseError(error, 'updating activity');
      if (!data) {
         throw new GraphQLError('Activity update failed, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }

    // Handle reminder scheduling based on updates
    try {
      // If activity is marked as done, cancel all reminders
      if (updates.is_done === true) {
        await activityReminderService.cancelActivityReminders(activityId);
      }
      // If due date changed or activity was unmarked as done, reschedule reminders
      else if (updates.due_date !== undefined || updates.is_done === false) {
        // Cancel existing reminders first
        await activityReminderService.cancelActivityReminders(activityId);
        
        // Schedule new reminders if activity has a due date and is not done
        if (data.due_date && !data.is_done) {
          await activityReminderService.scheduleActivityReminders(activityId);
        }
      }
    } catch (reminderError) {
      console.error('[activityService.updateActivity] Failed to manage reminders:', reminderError);
      // Don't fail the activity update if reminder management fails
    }

    return data as Activity;
  },

  /**
   * Deletes an activity.
   */
  async deleteActivity(userId: string, activityId: string, accessToken: string): Promise<{ id: string }> {
    // console.log('[activityService.deleteActivity] called for user:', userId, 'activityId:', activityId);
    const supabaseClient: SupabaseClient = getAuthenticatedClient(accessToken);
    const { error, count } = await supabaseClient 
      .from('activities')
      .delete({ count: 'exact' })
      .match({ id: activityId, user_id: userId });

    handleSupabaseError(error, 'deleting activity');
    if (count === 0 && !error) {
        throw new GraphQLError(`Activity with ID ${activityId} not found or user not authorized.`, { extensions: { code: 'NOT_FOUND' }});
    }

    // Cancel all reminders for the deleted activity
    try {
      await activityReminderService.cancelActivityReminders(activityId);
    } catch (reminderError) {
      console.error('[activityService.deleteActivity] Failed to cancel reminders:', reminderError);
      // Don't fail the activity deletion if reminder cancellation fails
    }

    return { id: activityId };
  }
}; 