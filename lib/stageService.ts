import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils';
// import { Stage } from './types'; // REMOVED: Import of local Stage type
import type { Stage, CreateStageInput, UpdateStageInput } from './generated/graphql'; // ADDED: Import generated types


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
        .order('order', { ascending: true }); 

    handleSupabaseError(error, `fetching stages for pipeline ${pipelineId}`);

    return (data || []) as Stage[]; // CHANGED: Cast to generated Stage[]
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
        .maybeSingle(); 

    handleSupabaseError(error, `fetching stage with id ${id}`);

    return data; // CHANGED: Cast to generated Stage | null
}

/**
 * Creates a new stage for the authenticated user within a specific pipeline.
 * user_id is automatically derived. pipeline_id, name, and order are required from input.
 * @param accessToken - The user's JWT.
 * @param stageData - An object containing the details for the new stage.
 * @returns A promise that resolves to the newly created Stage object.
 */
export async function createStage(accessToken: string, stageData: CreateStageInput): Promise<Stage> {
    // Runtime validation for required fields from CreateStageInput
    if (!stageData || !stageData.pipeline_id || !stageData.name || stageData.order === undefined || stageData.order === null) {
        throw new Error("Pipeline ID, stage name, and order are required for creation.");
    }
    // Optional deal_probability validation:
    // This initial validation can remain, but the actual value might be overridden by stage_type
    if (stageData.deal_probability !== undefined && stageData.deal_probability !== null && (stageData.deal_probability < 0 || stageData.deal_probability > 1)) {
        throw new Error("Deal probability must be between 0 and 1.");
    }

    const supabase = getAuthenticatedClient(accessToken);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error('Error fetching user for createStage:', userError);
        throw new Error("Could not get authenticated user to create stage.");
    }
    const userId = user.id;

    // Prepare the insert payload
    const insertPayload: {
        pipeline_id: string;
        name: string;
        order: number;
        deal_probability?: number | null;
        stage_type?: string | null; // Assuming StageType is string enum like 'OPEN', 'WON', 'LOST'
        user_id: string;
    } = {
        pipeline_id: stageData.pipeline_id,
        name: stageData.name,
        order: stageData.order,
        deal_probability: stageData.deal_probability, // Default to provided, may be overridden
        stage_type: stageData.stage_type,
        user_id: userId,
    };

    // Adjust deal_probability based on stage_type
    if (stageData.stage_type) {
        if (stageData.stage_type === 'WON') { // Assuming 'WON' is the string representation from StageType enum
            insertPayload.deal_probability = 1.0;
        } else if (stageData.stage_type === 'LOST') { // Assuming 'LOST'
            insertPayload.deal_probability = 0.0;
        }
        // If 'OPEN' or any other type, use the deal_probability already set from stageData.deal_probability
    }


    const { data, error } = await supabase
        .from('stages')
        .insert([insertPayload]) // Use the prepared payload
        .select() 
        .single(); 

    handleSupabaseError(error, 'creating stage');

    if (!data) {
         throw new Error("Failed to create stage, no data returned.");
    }
    return data as Stage; // CHANGED: Cast to generated Stage
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
export async function updateStage(accessToken: string, id: string, updates: UpdateStageInput): Promise<Stage> { // CHANGED: updates type to generated UpdateStageInput
    if (!id) {
        throw new Error("Stage ID is required for update.");
    }
    // The generated UpdateStageInput has all optional fields. Check if it's empty.
    if (!updates || Object.keys(updates).length === 0) {
        throw new Error("No update data provided for stage.");
    }
    // Validation for optional fields in generated UpdateStageInput
    // This initial validation can remain, but the actual value might be overridden by stage_type
    if (updates.deal_probability !== undefined && updates.deal_probability !== null && (updates.deal_probability < 0 || updates.deal_probability > 1)) {
        throw new Error("Deal probability must be between 0 and 1.");
    }
    if (updates.name !== undefined && (typeof updates.name !== 'string' || updates.name.trim() === '')) { // Added trim check for name
        throw new Error("Invalid type or empty string for stage name update.");
    }
    if (updates.order !== undefined && (updates.order === null || !Number.isInteger(updates.order))) { // Added null check for order
         throw new Error("Invalid type for stage order update, must be an integer.");
    }

    const supabase = getAuthenticatedClient(accessToken);

    // Prepare the actual data to be sent for update
    const updateData: Partial<UpdateStageInput> = { ...updates };

    // Adjust deal_probability based on stage_type, if stage_type is being updated
    if (updates.stage_type) {
        if (updates.stage_type === 'WON') { // Assuming 'WON' is the string representation
            updateData.deal_probability = 1.0;
        } else if (updates.stage_type === 'LOST') { // Assuming 'LOST'
            updateData.deal_probability = 0.0;
        }
        // If stage_type is 'OPEN':
        // - If updates.deal_probability was provided, it's already in updateData and will be used.
        // - If updates.deal_probability was NOT provided, updateData.deal_probability is undefined,
        //   so the existing DB value for deal_probability won't be changed by this logic.
        // This behavior is correct.
    }
    // If updates.stage_type is not provided, but updates.deal_probability is,
    // it will be used as is from updateData. This is generally fine, but front-end
    // should prevent setting arbitrary probabilities on WON/LOST stages.


    const { data, error } = await supabase
        .from('stages')
        .update(updateData) // Pass the prepared updateData
        .eq('id', id) 
        .select() 
        .single(); 

    handleSupabaseError(error, `updating stage with id ${id}`);

    if (!data) {
        throw new Error(`Stage with id ${id} not found or update failed.`);
    }
    return data as Stage; // CHANGED: Cast to generated Stage
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
        .delete({ count: 'exact' }) 
        .eq('id', id); 

    handleSupabaseError(error, `deleting stage with id ${id}`);

    console.log(`Stage delete operation for id ${id}: count=${count}`);
    return true; 
} 