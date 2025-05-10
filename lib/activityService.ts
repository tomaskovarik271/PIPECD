import { SupabaseClient } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils';
import { Activity, CreateActivityInput, UpdateActivityInput } from './types';

/**
 * Creates a new activity for the given user.
 */
export const createActivity = async (userId: string, input: CreateActivityInput, accessToken: string): Promise<Activity> => {
  const supabaseClient: SupabaseClient = getAuthenticatedClient(accessToken);
  const { error, data } = await supabaseClient
    .from('activities')
    .insert({ ...input, user_id: userId })
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'creating activity');
  }
  if (!data) {
    throw new GraphQLError('Failed to create activity: No data returned');
  }

  return data as Activity;
};

/**
 * Retrieves a single activity by its ID, ensuring the user has access.
 */
export const getActivityById = async (userId: string, activityId: string, accessToken: string): Promise<Activity | null> => {
  const supabaseClient: SupabaseClient = getAuthenticatedClient(accessToken);
  const { data, error } = await supabaseClient
    .from('activities')
    .select('*')
    .match({ id: activityId, user_id: userId }) 
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    handleSupabaseError(error, 'getting activity by ID');
  }

  return data as Activity | null;
};

// Define a simple filter type for getActivities
export interface ActivityFilter {
    dealId?: string;
    personId?: string;
    organizationId?: string;
    isDone?: boolean;
}

/**
 * Fetches activities for a given user, optionally filtered.
 * Note: RLS policies are expected to enforce that users can only see their own activities
 * or activities related to entities they have access to.
 */
export const getActivities = async (_userId: string, accessToken: string, filter?: ActivityFilter): Promise<Activity[]> => {
  const supabaseClient: SupabaseClient = getAuthenticatedClient(accessToken);
  let query = supabaseClient
    .from('activities')
    .select('*');
    // RLS handles user_id filtering

  // Apply filters (logic remains the same)
  if (filter?.dealId) query = query.eq('deal_id', filter.dealId);
  if (filter?.personId) query = query.eq('person_id', filter.personId);
  if (filter?.organizationId) query = query.eq('organization_id', filter.organizationId);
  if (filter?.isDone !== undefined) query = query.eq('is_done', filter.isDone);

  // Ordering logic remains the same
  query = query.order('due_date', { ascending: true, nullsFirst: false })
               .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    handleSupabaseError(error, 'getting activities');
  }

  return (data || []) as Activity[];
};

/**
 * Updates an existing activity.
 */
export const updateActivity = async (userId: string, activityId: string, updates: UpdateActivityInput, accessToken: string): Promise<Activity> => {
  const supabaseClient: SupabaseClient = getAuthenticatedClient(accessToken);
  
  // Safe update object logic remains the same
  const safeUpdates: Partial<UpdateActivityInput> = {};
  if (updates.type !== undefined) safeUpdates.type = updates.type;
  if (updates.subject !== undefined) safeUpdates.subject = updates.subject;
  if (updates.due_date !== undefined) safeUpdates.due_date = updates.due_date;
  if (updates.notes !== undefined) safeUpdates.notes = updates.notes;
  if (updates.is_done !== undefined) safeUpdates.is_done = updates.is_done;
  if (updates.deal_id !== undefined) safeUpdates.deal_id = updates.deal_id;
  if (updates.person_id !== undefined) safeUpdates.person_id = updates.person_id;
  if (updates.organization_id !== undefined) safeUpdates.organization_id = updates.organization_id;
  
  if (Object.keys(safeUpdates).length === 0) {
      throw new GraphQLError('No valid fields provided for update.');
  }

  const { data, error } = await supabaseClient
    .from('activities')
    .update(safeUpdates)
    .match({ id: activityId, user_id: userId })
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

  return data as Activity;
};

/**
 * Deletes an activity.
 */
export const deleteActivity = async (userId: string, activityId: string, accessToken: string): Promise<{ id: string }> => {
  const supabaseClient: SupabaseClient = getAuthenticatedClient(accessToken);
  const { error, count } = await supabaseClient 
    .from('activities')
    .delete({ count: 'exact' })
    .match({ id: activityId, user_id: userId });

  if (error) {
    handleSupabaseError(error, 'deleting activity');
  }
  if (count === 0 && !error) {
      throw new GraphQLError(`Activity with ID ${activityId} not found or user not authorized.`, { extensions: { code: 'NOT_FOUND' }});
  }

  return { id: activityId };
}; 