import { SupabaseClient } from '@supabase/supabase-js';
import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils'; // Assuming getAuthenticatedClient can be used or adapted
import type { WfmProject } from './generated/graphql'; // CORRECTED CASING
import type { GraphQLContext } from '../netlify/functions/graphql/helpers'; // CORRECTED PATH

// Interface for createWFMProject input, to be refined based on actual GQL input type if different
interface CreateWFMProjectInput {
  projectTypeId: string;
  workflowId: string;
  name: string;
  initialStepId?: string | null;
  description?: string | null;
  createdByUserId?: string | null; 
}

/**
 * Creates a new WFM Project.
 * @param input - Data for the new WFMProject.
 * @param context - GraphQL context containing Supabase client and user info.
 * @returns The newly created WFMProject.
 */
export async function createWFMProject(
  input: CreateWFMProjectInput,
  context: GraphQLContext
): Promise<WfmProject> {
  const supabase = context.supabaseClient; // Or however you access it from context
  // console.log('[wfmProjectService.createWFMProject] Input:', input); // Reduced verbosity

  const insertData: any = {
    project_type_id: input.projectTypeId,
    workflow_id: input.workflowId,
    name: input.name,
    current_step_id: input.initialStepId,
    description: input.description,
    created_by_user_id: input.createdByUserId, // This might come from context.currentUser.id depending on policy
    updated_by_user_id: input.createdByUserId, // Similarly for updated_by
  };

  const { data, error } = await supabase
    .from('wfm_projects')
    .insert(insertData)
    .select('*')
    .single();

  handleSupabaseError(error, 'creating WFM project');
  if (!data) {
    throw new Error('Failed to create WFM project, no data returned.');
  }
  // console.log('[wfmProjectService.createWFMProject] Created project:', data); // Reduced verbosity
  return data as WfmProject; // Cast to the GQL type
}

/**
 * Fetches a WFM Project by its ID.
 * @param id - The ID of the WFMProject to fetch.
 * @param context - GraphQL context.
 * @returns The WFMProject or null if not found.
 */
export async function getWFMProjectById(
  id: string,
  context: GraphQLContext
): Promise<WfmProject | null> {
  const supabase = context.supabaseClient;
  // console.log('[wfmProjectService.getWFMProjectById] ID:', id); // Reduced verbosity

  const { data, error } = await supabase
    .from('wfm_projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  handleSupabaseError(error, `fetching WFM project with ID ${id}`);
  return data as WfmProject | null;
}

/**
 * Updates the current step of a WFM Project.
 * Note: Transition validation should occur before calling this function.
 * @param projectId - The ID of the WFMProject to update.
 * @param targetStepId - The ID of the new current_step_id.
 * @param userId - The ID of the user performing the update (for updated_by_user_id).
 * @param context - GraphQL context.
 * @returns The updated WFMProject.
 */
export async function updateWFMProjectStep(
  projectId: string,
  targetStepId: string,
  userId: string, // For auditing updated_by_user_id
  context: GraphQLContext
): Promise<WfmProject> {
  const supabase = context.supabaseClient;
  // console.log('[wfmProjectService.updateWFMProjectStep] ProjectID:', projectId, 'TargetStepID:', targetStepId); // Reduced verbosity

  const updateData = {
    current_step_id: targetStepId,
    updated_by_user_id: userId,
    // updated_at is handled by the trigger
  };

  const { data, error } = await supabase
    .from('wfm_projects')
    .update(updateData)
    .eq('id', projectId)
    .select('*')
    .single();

  handleSupabaseError(error, `updating WFM project step for project ID ${projectId}`);
  if (!data) {
    throw new Error('Failed to update WFM project step, no data returned or project not found.');
  }
  // console.log('[wfmProjectService.updateWFMProjectStep] Updated project:', data); // Reduced verbosity
  return data as WfmProject;
} 