import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils';
import { Stage } from './types'; // Import the Stage interface

// Define the type for data needed to create a stage
// user_id and pipeline_id are required, name and order are essential. deal_probability is optional.
export type CreateStageInput = Pick<Stage, 'pipeline_id' | 'name' | 'order'> & Partial<Pick<Stage, 'deal_probability'>>;

// Define the type for data needed to update a stage
// Allow updating name, order, and deal_probability. pipeline_id and user_id should not be changed here.
export type UpdateStageInput = Partial<Pick<Stage, 'name' | 'order' | 'deal_probability'>>;


/**
 * Fetches all stages belonging to a specific pipeline for the authenticated user.
 * Assumes RLS on stages table enforces user ownership via the pipeline.
 * @param accessToken - The user's JWT.
 * @param pipelineId - The UUID of the pipeline whose stages are to be fetched.
 * @returns A promise that resolves to an array of Stages, ordered by their 'order' field.
 */
export async function getStagesByPipelineId(accessToken: string, pipelineId: string): Promise<Stage[]> {
    if (!pipelineId) {
        throw new Error("Pipeline ID is required to fetch stages.");
    }
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .order('order', { ascending: true }); // Order stages by their 'order' field

    handleSupabaseError(error, `fetching stages for pipeline ${pipelineId}`);

    // Ensure data is not null before returning; default to empty array if null
    return data || [];
}

/**
 * Fetches a single stage by its ID, ensuring it belongs to the authenticated user (via RLS).
 * @param accessToken - The user's JWT.
 * @param id - The UUID of the stage to fetch.
 * @returns A promise that resolves to the Stage object or null if not found/accessible.
 */
export async function getStageById(accessToken: string, id: string): Promise<Stage | null> {
     if (!id) {
        throw new Error("Stage ID is required.");
    }
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('id', id)
        .maybeSingle(); // Use maybeSingle() to return null instead of error if not found

    handleSupabaseError(error, `fetching stage with id ${id}`);

    return data;
}

/**
 * Creates a new stage for the authenticated user within a specific pipeline.
 * user_id is automatically derived. pipeline_id, name, and order are required from input.
 * @param accessToken - The user's JWT.
 * @param stageData - An object containing the details for the new stage.
 * @returns A promise that resolves to the newly created Stage object.
 */
export async function createStage(accessToken: string, stageData: CreateStageInput): Promise<Stage> {
    if (!stageData || !stageData.pipeline_id || !stageData.name || stageData.order === undefined || stageData.order === null) {
        throw new Error("Pipeline ID, stage name, and order are required for creation.");
    }
     // Validate deal_probability if provided
    if (stageData.deal_probability !== undefined && stageData.deal_probability !== null && (stageData.deal_probability < 0 || stageData.deal_probability > 1)) {
        throw new Error("Deal probability must be between 0 and 1.");
    }

    const supabase = getAuthenticatedClient(accessToken);

    // Get the authenticated user's ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error('Error fetching user for createStage:', userError);
        throw new Error("Could not get authenticated user to create stage.");
    }

    const userId = user.id;

    const { data, error } = await supabase
        .from('stages')
        .insert([
            {
                pipeline_id: stageData.pipeline_id,
                name: stageData.name,
                order: stageData.order, // Supabase client handles JS 'order' mapping to DB '"order"' if needed, but explicit quoting is safer if issues arise
                deal_probability: stageData.deal_probability, // Include if provided, else DB default/null
                user_id: userId // Explicitly set the user_id
            },
        ])
        .select() // Return the created record
        .single(); // Expecting a single record to be created

    // Handle potential errors during insertion
    handleSupabaseError(error, 'creating stage');

    if (!data) {
         throw new Error("Failed to create stage, no data returned.");
    }

    return data;
}

/**
 * Updates an existing stage identified by its ID.
 * Allows updating fields specified in UpdateStageInput (name, order, deal_probability).
 * Ensures the stage belongs to the authenticated user via RLS.
 * @param accessToken - The user's JWT.
 * @param id - The UUID of the stage to update.
 * @param updates - An object containing the fields to update.
 * @returns A promise that resolves to the updated Stage object.
 */
export async function updateStage(accessToken: string, id: string, updates: UpdateStageInput): Promise<Stage> {
    if (!id) {
        throw new Error("Stage ID is required for update.");
    }
    if (!updates || Object.keys(updates).length === 0) {
        throw new Error("No update data provided for stage.");
    }
     // Validate deal_probability if provided
    if (updates.deal_probability !== undefined && updates.deal_probability !== null && (updates.deal_probability < 0 || updates.deal_probability > 1)) {
        throw new Error("Deal probability must be between 0 and 1.");
    }
    // Add validation for other fields if necessary (e.g., non-empty name, integer order)
     if (updates.name !== undefined && typeof updates.name !== 'string') {
        throw new Error("Invalid type for stage name update.");
    }
    if (updates.order !== undefined && !Number.isInteger(updates.order)) {
         throw new Error("Invalid type for stage order update, must be an integer.");
    }

    const supabase = getAuthenticatedClient(accessToken);

    // Fetch user ID for potential use in complex RLS checks if needed, though standard RLS should handle it
     const { data: { user }, error: userError } = await supabase.auth.getUser();
     if (userError || !user) {
        console.error('Error fetching user for updateStage:', userError);
        throw new Error("Could not get authenticated user to update stage.");
    }
    // const userId = user.id; // Not strictly needed for the update query itself due to RLS

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: { [key: string]: any } = { ...updates };

    // Map JS 'order' to DB '"order"' if necessary - Supabase client often handles this, but check during testing
    // If there's an issue, use: if ('order' in updatePayload) { updatePayload['"order"'] = updatePayload.order; delete updatePayload.order; }

    const { data, error } = await supabase
        .from('stages')
        .update(updatePayload)
        .eq('id', id) // Match the specific stage
        // RLS policy ensures the user can only update stages in pipelines they own
        .select() // Return the updated record
        .single(); // Expecting a single record to be updated

    handleSupabaseError(error, `updating stage with id ${id}`);

    if (!data) {
       // This might happen if the ID doesn't exist or RLS prevents access
        throw new Error(`Stage with id ${id} not found or update failed.`);
    }

    return data;
}

/**
 * Deletes a stage identified by its ID.
 * Ensures the stage belongs to the authenticated user via RLS.
 * Deals associated with this stage will have their stage_id set to NULL due to `ON DELETE SET NULL`.
 * @param accessToken - The user's JWT.
 * @param id - The UUID of the stage to delete.
 * @returns A promise that resolves to true if deletion was successful.
 * @throws Error if deletion fails.
 */
export async function deleteStage(accessToken: string, id: string): Promise<boolean> {
    if (!id) {
        throw new Error("Stage ID is required for deletion.");
    }

    const supabase = getAuthenticatedClient(accessToken);
    const { error, count } = await supabase
        .from('stages')
        .delete({ count: 'exact' }) // Request count for verification
        .eq('id', id); // Match the specific stage
        // RLS policy ensures the user can only delete stages in pipelines they own

    // handleSupabaseError will throw if there's a DB error (other than not found)
    handleSupabaseError(error, `deleting stage with id ${id}`);

    // Deletion is successful if there's no error.
    // count will be 0 if the stage didn't exist or RLS prevented access, which is fine.
    console.log(`Stage delete operation for id ${id}: count=${count}`);
    return true; // Indicate success
} 