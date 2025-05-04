// Placeholder for Pipeline Service
// Functions for CRUD operations on pipelines will be implemented here.

import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils';

// Define the interface for a Pipeline based on the DB schema
export interface Pipeline {
    id: string;         // uuid, primary key
    name: string;       // text, not null
    created_at: string; // timestamptz, default now()
    updated_at: string; // timestamptz, default now()
    user_id: string;    // uuid, foreign key to auth.users
}

// Define the type for data needed to create a pipeline
// user_id will be inferred from the authenticated client context
export type CreatePipelineInput = Pick<Pipeline, 'name'>;

// Define the type for data needed to update a pipeline
// Only 'name' is expected to be updatable for now
export type UpdatePipelineInput = Partial<Pick<Pipeline, 'name'>>;


/**
 * Fetches all pipelines belonging to the authenticated user.
 * @param accessToken - The user's JWT.
 * @returns A promise that resolves to an array of Pipelines.
 */
export async function getPipelines(accessToken: string): Promise<Pipeline[]> {
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
        .from('pipelines')
        .select('*');

    handleSupabaseError(error, 'fetching pipelines');

    // Ensure data is not null before returning; default to empty array if null
    return data || [];
}

/**
 * Fetches a single pipeline by its ID, ensuring it belongs to the authenticated user.
 * @param accessToken - The user's JWT.
 * @param id - The UUID of the pipeline to fetch.
 * @returns A promise that resolves to the Pipeline object or null if not found/accessible.
 */
export async function getPipelineById(accessToken: string, id: string): Promise<Pipeline | null> {
     if (!id) {
        throw new Error("Pipeline ID is required.");
    }
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('id', id)
        .maybeSingle(); // Use maybeSingle() to return null instead of error if not found

    handleSupabaseError(error, `fetching pipeline with id ${id}`);

    return data;
}

/**
 * Creates a new pipeline for the authenticated user.
 * user_id is automatically handled by RLS policies based on the authenticated client.
 * @param accessToken - The user's JWT.
 * @param pipelineData - An object containing the 'name' for the new pipeline.
 * @returns A promise that resolves to the newly created Pipeline object.
 */
export async function createPipeline(accessToken: string, pipelineData: CreatePipelineInput): Promise<Pipeline> {
    if (!pipelineData || !pipelineData.name) {
        throw new Error("Pipeline name is required for creation.");
    }

    const supabase = getAuthenticatedClient(accessToken);

    // Get the authenticated user's ID
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
                user_id: userId // Explicitly set the user_id
            },
        ])
        .select() // Return the created record
        .single(); // Expecting a single record to be created

    // Handle potential errors during insertion
    handleSupabaseError(error, 'creating pipeline');

    // Supabase insert returns an array, but .single() ensures we get one object or error
    if (!data) {
        // This case should ideally be caught by handleSupabaseError, but added for robustness
         throw new Error("Failed to create pipeline, no data returned.");
    }

    return data;
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
export async function updatePipeline(accessToken: string, id: string, updates: UpdatePipelineInput): Promise<Pipeline> {
    if (!id) {
        throw new Error("Pipeline ID is required for update.");
    }
    if (!updates || Object.keys(updates).length === 0) {
        throw new Error("No update data provided for pipeline.");
    }
     // Basic validation for allowed fields (currently only 'name')
    if (updates.name !== undefined && typeof updates.name !== 'string') {
        throw new Error("Invalid type for pipeline name update.");
    }


    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
        .from('pipelines')
        .update(updates)
        .eq('id', id) // Match the specific pipeline
        // RLS policy ensures the user can only update their own pipelines
        .select() // Return the updated record
        .single(); // Expecting a single record to be updated

    handleSupabaseError(error, `updating pipeline with id ${id}`);

    if (!data) {
       // This might happen if the ID doesn't exist or RLS prevents access
        throw new Error(`Pipeline with id ${id} not found or update failed.`);
    }

    return data;
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
        .delete({ count: 'exact' }) // Request count for verification
        .eq('id', id); // Match the specific pipeline
        // RLS policy ensures the user can only delete their own pipelines

    // Check specifically for foreign key violation errors if needed (e.g., P0001),
    // although handleSupabaseError provides a general catch.
    // if (error && error.code === '23503') { // Foreign key violation
    //     console.warn(`Attempted to delete pipeline ${id} which might still have associated stages/deals.`);
    //     throw new Error(`Cannot delete pipeline: It may still contain stages or deals.`);
    // }

    handleSupabaseError(error, `deleting pipeline with id ${id}`);

    // Deletion is successful if there's no error.
    // count can be 0 if the pipeline didn't exist, which is still considered successful deletion state.
    console.log(`Pipeline delete operation for id ${id}: count=${count}`); // Log count for debugging
    return true; // Indicate success
} 