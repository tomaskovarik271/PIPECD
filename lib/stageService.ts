import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils';

// Define the interface for a Stage based on the DB schema
export interface Stage {
    id: string;                 // uuid, primary key
    name: string;               // text, not null
    order: number;              // integer, not null
    pipeline_id: string;        // uuid, foreign key to pipelines
    deal_probability?: number | null; // numeric (percentage, 0-100?)
    created_at: string;         // timestamptz, default now()
    updated_at: string;         // timestamptz, default now()
    user_id: string;            // uuid, foreign key to auth.users
}

// Define the type for data needed to create a stage
// user_id will be inferred.
export type CreateStageInput = Pick<Stage, 'name' | 'order' | 'pipeline_id' | 'deal_probability'>;

// Define the type for data needed to update a stage
// Only 'name', 'order', 'deal_probability' are expected to be updatable.
// pipeline_id should generally not be changed directly.
export type UpdateStageInput = Partial<Pick<Stage, 'name' | 'order' | 'deal_probability'>>;

/**
 * Fetches all stages for a specific pipeline belonging to the authenticated user.
 * Orders stages by the 'order' field.
 * @param accessToken - The user's JWT.
 * @param pipelineId - The UUID of the pipeline whose stages are to be fetched.
 * @returns A promise that resolves to an array of Stages.
 */
export async function getStagesByPipeline(accessToken: string, pipelineId: string): Promise<Stage[]> {
    if (!pipelineId) {
        throw new Error("Pipeline ID is required to fetch stages.");
    }
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .order('order', { ascending: true }); // Ensure stages are ordered

    handleSupabaseError(error, `fetching stages for pipeline ${pipelineId}`);

    return data || [];
}

/**
 * Fetches a single stage by its ID, ensuring it belongs to the authenticated user (implicitly via pipeline RLS).
 * @param accessToken - The user's JWT.
 * @param id - The UUID of the stage to fetch.
 * @returns A promise that resolves to the Stage object or null if not found.
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
        .maybeSingle();

    handleSupabaseError(error, `fetching stage with id ${id}`);

    return data;
}

/**
 * Creates a new stage within a specific pipeline for the authenticated user.
 * @param accessToken - The user's JWT.
 * @param stageData - An object containing the details for the new stage ('name', 'order', 'pipeline_id', 'deal_probability').
 * @returns A promise that resolves to the newly created Stage object.
 */
export async function createStage(accessToken: string, stageData: CreateStageInput): Promise<Stage> {
    if (!stageData || !stageData.name || stageData.order === undefined || !stageData.pipeline_id) {
        throw new Error("Stage name, order, and pipeline ID are required for creation.");
    }
    // Basic validation
    if (typeof stageData.name !== 'string' || stageData.name.trim() === '') {
        throw new Error("Invalid stage name.");
    }
    if (typeof stageData.order !== 'number' || !Number.isInteger(stageData.order) || stageData.order < 0) {
         throw new Error("Stage order must be a non-negative integer.");
    }
    if (typeof stageData.pipeline_id !== 'string') {
         throw new Error("Invalid pipeline ID.");
    }
     if (stageData.deal_probability !== undefined && stageData.deal_probability !== null) {
        if (typeof stageData.deal_probability !== 'number' || stageData.deal_probability < 0 || stageData.deal_probability > 100) {
            throw new Error("Deal probability must be a number between 0 and 100.");
        }
    }

    const supabase = getAuthenticatedClient(accessToken);

    // Get the authenticated user's ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        console.error('Error fetching user for createStage:', userError);
        throw new Error("Could not get authenticated user to create stage.");
    }
    const userId = user.id;

    // Optional: Verify the pipeline belongs to the user before inserting stage?
    // This is technically enforced by the RLS policy check constraint, but an early check
    // could provide a clearer error message if the pipeline doesn't exist or isn't accessible.
    // const { data: pipelineData, error: pipelineError } = await supabase
    //     .from('pipelines')
    //     .select('id')
    //     .eq('id', stageData.pipeline_id)
    //     .eq('user_id', userId)
    //     .maybeSingle();
    // if (pipelineError || !pipelineData) {
    //     console.error('Error verifying pipeline ownership:', pipelineError);
    //     throw new Error(`Pipeline not found or not accessible (ID: ${stageData.pipeline_id}).`);
    // }

    const { data, error } = await supabase
        .from('stages')
        .insert([
            {
                name: stageData.name,
                order: stageData.order,
                pipeline_id: stageData.pipeline_id,
                deal_probability: stageData.deal_probability, // Use null if not provided or explicitly null
                user_id: userId // Explicitly set the user_id
            }
        ])
        .select()
        .single();

    handleSupabaseError(error, 'creating stage');

    if (!data) {
         throw new Error("Failed to create stage, no data returned.");
    }

    return data;
}

/**
 * Updates an existing stage identified by its ID.
 * Allows updating 'name', 'order', 'deal_probability'.
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
    // Add validation for update fields
    if (updates.name !== undefined && (typeof updates.name !== 'string' || updates.name.trim() === '')) {
        throw new Error("Invalid stage name update.");
    }
     if (updates.order !== undefined && (typeof updates.order !== 'number' || !Number.isInteger(updates.order) || updates.order < 0)) {
         throw new Error("Stage order update must be a non-negative integer.");
    }
    if (updates.deal_probability !== undefined && updates.deal_probability !== null) {
        if (typeof updates.deal_probability !== 'number' || updates.deal_probability < 0 || updates.deal_probability > 100) {
            throw new Error("Deal probability update must be a number between 0 and 100.");
        }
    } else if (updates.deal_probability === null) {
        // Allow setting probability to null explicitly
        updates.deal_probability = null;
    }


    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
        .from('stages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    handleSupabaseError(error, `updating stage with id ${id}`);

    if (!data) {
        throw new Error(`Stage with id ${id} not found or update failed.`);
    }

    return data;
}

/**
 * Deletes a stage identified by its ID.
 * Ensures the stage belongs to the authenticated user via RLS.
 * Note: Consider implications if deals are currently associated with this stage.
 * The foreign key constraint on deals might prevent deletion unless handled (e.g., ON DELETE SET NULL/RESTRICT).
 * @param accessToken - The user's JWT.
 * @param id - The UUID of the stage to delete.
 * @returns A promise that resolves to true if deletion was successful.
 */
export async function deleteStage(accessToken: string, id: string): Promise<boolean> {
    if (!id) {
        throw new Error("Stage ID is required for deletion.");
    }

    const supabase = getAuthenticatedClient(accessToken);
    const { error, count } = await supabase
        .from('stages')
        .delete({ count: 'exact' })
        .eq('id', id);

     // Handle potential foreign key violation errors specifically if deals depend on this stage
    // if (error && error.code === '23503') { // Foreign key violation
    //     console.warn(`Attempted to delete stage ${id} which might still have associated deals.`);
    //     throw new Error(`Cannot delete stage: It may still contain deals. Consider moving deals first.`);
    // }

    handleSupabaseError(error, `deleting stage with id ${id}`);

    console.log(`Stage delete operation for id ${id}: count=${count}`);
    return true; // Indicate success
} 