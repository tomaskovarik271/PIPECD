
// Functions for CRUD operations on pipelines will be implemented here.

import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils';
import type { Pipeline, PipelineInput } from './generated/graphql'; // ADDED: Import generated types


/**
 * Fetches all pipelines belonging to the authenticated user.
 * @param accessToken - The user's JWT.
 * @returns A promise that resolves to an array of Pipelines.
 */
export async function getPipelines(accessToken: string): Promise<Pipeline[]> { // Return type is already Pipeline[] (compatible)
    console.log('[pipelineService.getPipelines] AccessToken:', accessToken); // DEBUG LOG
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
        .from('pipelines')
        .select('*');

    handleSupabaseError(error, 'fetching pipelines');

    return (data || []) as Pipeline[]; // CHANGED: Cast to Pipeline[] (from generated type)
}

/**
 * Fetches a single pipeline by its ID, ensuring it belongs to the authenticated user.
 * @param accessToken - The user's JWT.
 * @param id - The UUID of the pipeline to fetch.
 * @returns A promise that resolves to the Pipeline object or null if not found/accessible.
 */
export async function getPipelineById(accessToken: string, id: string): Promise<Pipeline | null> { // Return type is already Pipeline | null (compatible)
     if (!id) {
        throw new Error("Pipeline ID is required.");
    }
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('id', id)
        .maybeSingle(); 

    handleSupabaseError(error, `fetching pipeline with id ${id}`);

    return data; // CHANGED: Cast to Pipeline | null (from generated type)
}

/**
 * Creates a new pipeline for the authenticated user.
 * user_id is automatically handled by RLS policies based on the authenticated client.
 * @param accessToken - The user's JWT.
 * @param pipelineData - An object containing the 'name' for the new pipeline.
 * @returns A promise that resolves to the newly created Pipeline object.
 */
export async function createPipeline(accessToken: string, pipelineData: PipelineInput): Promise<Pipeline> { // CHANGED: pipelineData type to PipelineInput, return type to Pipeline (compatible)
    if (!pipelineData || !pipelineData.name) {
        throw new Error("Pipeline name is required for creation.");
    }

    const supabase = getAuthenticatedClient(accessToken);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error('Error fetching user for createPipeline:', userError);
        throw new Error("Could not get authenticated user to create pipeline.");
    }

    const userId = user.id;

    const { data, error } = await supabase
        .from('pipelines')
        .insert([
            { 
                name: pipelineData.name,
                user_id: userId 
            },
        ])
        .select() 
        .single(); 

    handleSupabaseError(error, 'creating pipeline');

    if (!data) {
         throw new Error("Failed to create pipeline, no data returned.");
    }

    return data as Pipeline; // CHANGED: Cast to Pipeline (from generated type)
}

/**
 * Updates an existing pipeline identified by its ID.
 * Only allows updating fields specified in UpdatePipelineInput (currently 'name').
 * Ensures the pipeline belongs to the authenticated user via RLS.
 * @param accessToken - The user's JWT.
 * @param id - The UUID of the pipeline to update.
 * @param updates - An object containing the fields to update (e.g., { name: 'New Name' }).
 * @returns A promise that resolves to the updated Pipeline object.
 */
export async function updatePipeline(accessToken: string, id: string, updates: PipelineInput): Promise<Pipeline> { // CHANGED: updates type to PipelineInput, return type to Pipeline (compatible)
    if (!id) {
        throw new Error("Pipeline ID is required for update.");
    }
    // The generated PipelineInput only has {name: string}, so it cannot be empty if provided.
    // The old UpdatePipelineInput was Partial<Pick<Pipeline, 'name'>>, so Object.keys(updates).length === 0 was relevant.
    // Now, if `updates` is provided, `updates.name` must be a string.
    if (!updates || typeof updates.name !== 'string' || updates.name.trim() === '') { // Updated validation for PipelineInput
        throw new Error("Valid pipeline name is required for update.");
    }

    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
        .from('pipelines')
        .update({ name: updates.name }) // Explicitly update only name, as PipelineInput might have more fields in future
        .eq('id', id) 
        .select() 
        .single(); 

    handleSupabaseError(error, `updating pipeline with id ${id}`);

    if (!data) {
        throw new Error(`Pipeline with id ${id} not found or update failed.`);
    }

    return data as Pipeline; // CHANGED: Cast to Pipeline (from generated type)
}

/**
 * Deletes a pipeline identified by its ID.
 * Ensures the pipeline belongs to the authenticated user via RLS.
 * Note: This might require cascading deletes or checks for associated stages/deals
 * depending on foreign key constraints and application logic (not implemented here).
 * @param accessToken - The user's JWT.
 * @param id - The UUID of the pipeline to delete.
 * @returns A promise that resolves to true if deletion was successful (or if the record didn't exist).
 *          Throws an error if deletion fails for other reasons.
 */
export async function deletePipeline(accessToken: string, id: string): Promise<boolean> {
    if (!id) {
        throw new Error("Pipeline ID is required for deletion.");
    }

    const supabase = getAuthenticatedClient(accessToken);
    const { error, count } = await supabase
        .from('pipelines')
        .delete({ count: 'exact' }) 
        .eq('id', id); 

    handleSupabaseError(error, `deleting pipeline with id ${id}`);

    console.log(`Pipeline delete operation for id ${id}: count=${count}`); 
    return true; 
} 