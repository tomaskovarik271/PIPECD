import { GraphQLContext } from '../netlify/functions/graphql/helpers';
import { 
  WfmWorkflow, 
  CreateWfmWorkflowInput, 
  UpdateWfmWorkflowInput,
  WfmWorkflowStep,
  WfmWorkflowTransition, // Imported for use in getTransitionsByWorkflowId
  CreateWfmWorkflowStepInput, // Added for the new service method
  UpdateWfmWorkflowStepInput, // Added for the update service method
  CreateWfmWorkflowTransitionInput, // Added for the new transition service method
  UpdateWfmWorkflowTransitionInput
} from './generated/graphql';

// --- Database Column Definitions ---
const WFM_WORKFLOW_DB_COLUMNS = 'id, name, description, is_archived, created_at, updated_at, created_by_user_id, updated_by_user_id';
const WFM_WORKFLOW_STEP_DB_COLUMNS = 'id, workflow_id, status_id, step_order, is_initial_step, is_final_step, metadata, created_at, updated_at';
const WFM_WORKFLOW_TRANSITION_DB_COLUMNS = 'id, workflow_id, from_step_id, to_step_id, name, created_at, updated_at';

// --- Database Interface Definitions ---
interface DbWfmWorkflow {
  id: string;
  name: string;
  description: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  created_by_user_id: string | null;
  updated_by_user_id: string | null;
}

interface DbWfmWorkflowStep {
  id: string;
  workflow_id: string;
  status_id: string;
  step_order: number;
  is_initial_step: boolean;
  is_final_step: boolean;
  metadata: any | null; 
  created_at: string;
  updated_at: string;
}

interface DbWfmWorkflowTransition {
  id: string;
  workflow_id: string;
  from_step_id: string;
  to_step_id: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

// This is what the service layer will return for steps.
// It includes status_id for the GraphQL field resolver.
interface ServiceLayerWfmWorkflowStep extends Omit<WfmWorkflowStep, 'status'> {
  status_id: string;
}

// --- Mapper Functions ---
const mapDbWorkflowToGraphqlWorkflow = (dbWorkflow: DbWfmWorkflow): WfmWorkflow => {
  return {
    __typename: 'WFMWorkflow',
    id: dbWorkflow.id,
    name: dbWorkflow.name,
    description: dbWorkflow.description,
    isArchived: dbWorkflow.is_archived,
    createdAt: new Date(dbWorkflow.created_at),
    updatedAt: new Date(dbWorkflow.updated_at),
    steps: [], // Placeholder, to be filled by resolver
    transitions: [], // Placeholder, to be filled by resolver
  } as WfmWorkflow; 
};

const mapDbStepToGraphqlStep = (dbStep: DbWfmWorkflowStep): ServiceLayerWfmWorkflowStep => {
  return {
    __typename: 'WFMWorkflowStep',
    id: dbStep.id,
    status_id: dbStep.status_id,
    stepOrder: dbStep.step_order,
    isInitialStep: dbStep.is_initial_step,
    isFinalStep: dbStep.is_final_step,
    metadata: dbStep.metadata,
    createdAt: new Date(dbStep.created_at),
    updatedAt: new Date(dbStep.updated_at),
  } as ServiceLayerWfmWorkflowStep; 
};

const mapDbTransitionToGraphqlTransition = (dbTransition: DbWfmWorkflowTransition): WfmWorkflowTransition => {
  const result = {
    __typename: 'WFMWorkflowTransition' as const,
    id: dbTransition.id,
    name: dbTransition.name,
    createdAt: new Date(dbTransition.created_at),
    updatedAt: new Date(dbTransition.updated_at),
    // Add the IDs needed by the field resolvers
    from_step_id: dbTransition.from_step_id,
    to_step_id: dbTransition.to_step_id,
    // workflow_id: dbTransition.workflow_id, // Optional, if needed later
  };
  // The object 'result' is structurally compatible with WfmWorkflowTransition
  // (it has all its fields, like 'id', 'name') and also carries the extra IDs 
  // needed by field resolvers like 'fromStep' and 'toStep'.
  // TypeScript needs a more permissive cast here because the generated WfmWorkflowTransition type
  // doesn't explicitly list from_step_id or to_step_id (as they are resolved fields).
  return result as unknown as WfmWorkflowTransition;
};

export const wfmWorkflowService = {
  async getAll(isArchived: boolean = false, context: GraphQLContext): Promise<WfmWorkflow[]> {
    console.log(`wfmWorkflowService.getAll called with isArchived: ${isArchived}, user: ${context.currentUser?.id}`);
    const { data, error } = await context.supabaseClient
      .from('workflows')
      .select(WFM_WORKFLOW_DB_COLUMNS)
      .eq('is_archived', isArchived);
    if (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
    if (!data) return [];
    return (data as DbWfmWorkflow[]).map(mapDbWorkflowToGraphqlWorkflow);
  },

  async getById(id: string, context: GraphQLContext): Promise<WfmWorkflow | null> {
    console.log(`wfmWorkflowService.getById called with id: ${id}, user: ${context.currentUser?.id}`);
    const { data, error } = await context.supabaseClient
      .from('workflows')
      .select(WFM_WORKFLOW_DB_COLUMNS)
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching workflow by ID:', error);
      throw error;
    }
    return data ? mapDbWorkflowToGraphqlWorkflow(data as DbWfmWorkflow) : null;
  },

  async create(input: CreateWfmWorkflowInput, userId: string, context: GraphQLContext): Promise<WfmWorkflow> {
    console.log(`wfmWorkflowService.create called with input:`, input, `by user: ${userId}`);
    const recordToInsert = {
        name: input.name,
        description: input.description,
        created_by_user_id: userId,
        updated_by_user_id: userId,
    };
    const { data, error } = await context.supabaseClient
      .from('workflows')
      .insert([recordToInsert])
      .select(WFM_WORKFLOW_DB_COLUMNS)
      .single();
    if (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
    if (!data) throw new Error('Failed to create workflow, no data returned.');
    return mapDbWorkflowToGraphqlWorkflow(data as DbWfmWorkflow);
  },

  async update(id: string, input: UpdateWfmWorkflowInput, userId: string, context: GraphQLContext): Promise<WfmWorkflow> {
    console.log(`wfmWorkflowService.update called with id: ${id}, input:`, input, `by user: ${userId}`);
    const recordToUpdate: Partial<Omit<DbWfmWorkflow, 'id' | 'created_at' | 'created_by_user_id'>> = {
        updated_by_user_id: userId,
    };

    if (typeof input.name === 'string') {
        recordToUpdate.name = input.name;
    }
    if (Object.prototype.hasOwnProperty.call(input, 'description')) {
        recordToUpdate.description = input.description === null ? null : input.description;
    }
    if (typeof input.isArchived === 'boolean') {
        recordToUpdate.is_archived = input.isArchived;
    }

    const { data, error } = await context.supabaseClient
      .from('workflows')
      .update(recordToUpdate)
      .eq('id', id)
      .select(WFM_WORKFLOW_DB_COLUMNS)
      .single();
    if (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
    if (!data) {
        throw new Error(`Workflow with ID ${id} not found or RLS prevented update.`);
    }
    return mapDbWorkflowToGraphqlWorkflow(data as DbWfmWorkflow);
  },

  async delete(id: string, context: GraphQLContext): Promise<{ success: boolean; message?: string }> {
    console.log(`wfmWorkflowService.delete called with id: ${id}, user: ${context.currentUser?.id}`);
    const { error } = await context.supabaseClient
        .from('workflows')
        .delete()
        .match({ id: id });
    if (error) {
        console.error('Error deleting workflow:', error);
        return { success: false, message: error.message };
    }
    return { success: true };
  },

  async getStepsByWorkflowId(workflowId: string, context: GraphQLContext): Promise<ServiceLayerWfmWorkflowStep[]> {
    console.log(`wfmWorkflowService.getStepsByWorkflowId called for workflowId: ${workflowId}, user: ${context.currentUser?.id}`);
    const { data, error } = await context.supabaseClient
      .from('workflow_steps')
      .select(WFM_WORKFLOW_STEP_DB_COLUMNS)
      .eq('workflow_id', workflowId)
      .order('step_order', { ascending: true });
    if (error) {
      console.error('Error fetching steps for workflow:', error);
      throw error;
    }
    if (!data) return [];
    return (data as DbWfmWorkflowStep[]).map(mapDbStepToGraphqlStep);
  },

  async getStepById(stepId: string, context: GraphQLContext): Promise<ServiceLayerWfmWorkflowStep | null> {
    console.log(`wfmWorkflowService.getStepById called for stepId: ${stepId}, user: ${context.currentUser?.id}`);
    const { data, error } = await context.supabaseClient
      .from('workflow_steps')
      .select(WFM_WORKFLOW_STEP_DB_COLUMNS)
      .eq('id', stepId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching step by ID:', error);
      throw error;
    }
    return data ? mapDbStepToGraphqlStep(data as DbWfmWorkflowStep) : null;
  },

  async getTransitionsByWorkflowId(workflowId: string, context: GraphQLContext): Promise<WfmWorkflowTransition[]> {
    console.log(`wfmWorkflowService.getTransitionsByWorkflowId called for workflowId: ${workflowId}, user: ${context.currentUser?.id}`);
    const { data, error } = await context.supabaseClient
      .from('workflow_transitions')
      .select(WFM_WORKFLOW_TRANSITION_DB_COLUMNS)
      .eq('workflow_id', workflowId);
    if (error) {
      console.error('Error fetching transitions for workflow:', error);
      throw error;
    }
    if (!data) return [];
    return (data as DbWfmWorkflowTransition[]).map(mapDbTransitionToGraphqlTransition);
  },

  async addStepToWorkflow(input: CreateWfmWorkflowStepInput, userId: string, context: GraphQLContext): Promise<ServiceLayerWfmWorkflowStep> {
    console.log(`wfmWorkflowService.addStepToWorkflow called with input:`, input, `by user: ${userId}`);
    // In a real scenario, you might want to add created_by_user_id, updated_by_user_id to workflow_steps table
    // and populate them here, similar to how workflows are handled.
    // For now, the table schema for workflow_steps doesn't have these user tracking columns.

    const recordToInsert = {
      workflow_id: input.workflowId,
      status_id: input.statusId,
      step_order: input.stepOrder,
      is_initial_step: input.isInitialStep ?? false,
      is_final_step: input.isFinalStep ?? false,
      metadata: input.metadata ?? {},
      // created_by_user_id: userId, // If table had this column
      // updated_by_user_id: userId, // If table had this column
    };

    const { data, error } = await context.supabaseClient
      .from('workflow_steps')
      .insert([recordToInsert])
      .select(WFM_WORKFLOW_STEP_DB_COLUMNS)
      .single();

    if (error) {
      console.error('Error adding step to workflow:', error);
      // Consider more specific error handling or re-throwing a custom error
      throw new Error(`Failed to add step: ${error.message}`);
    }
    if (!data) {
      throw new Error('Failed to add step, no data returned from database.');
    }

    // The mapDbStepToGraphqlStep function needs to correctly map all fields,
    // including status_id if the GraphQL resolver for WFMWorkflowStep.status depends on it.
    return mapDbStepToGraphqlStep(data as DbWfmWorkflowStep);
  },

  async updateStepInWorkflow(stepId: string, input: UpdateWfmWorkflowStepInput, userId: string, context: GraphQLContext): Promise<ServiceLayerWfmWorkflowStep> {
    console.log(`wfmWorkflowService.updateStepInWorkflow called for stepId: ${stepId}, input:`, input, `by user: ${userId}`);

    const recordToUpdate: Partial<DbWfmWorkflowStep> = {
      // updated_by_user_id: userId, // If workflow_steps table had this
      // updated_at will be handled by Supabase moddatetime
    };

    if (typeof input.statusId === 'string') recordToUpdate.status_id = input.statusId;
    if (input.stepOrder !== undefined && input.stepOrder !== null) recordToUpdate.step_order = input.stepOrder;
    if (input.isInitialStep !== undefined && input.isInitialStep !== null) recordToUpdate.is_initial_step = input.isInitialStep;
    if (input.isFinalStep !== undefined && input.isFinalStep !== null) recordToUpdate.is_final_step = input.isFinalStep;
    if (input.metadata !== undefined) recordToUpdate.metadata = input.metadata; // Allows setting metadata to null or an object

    if (Object.keys(recordToUpdate).length === 0) {
      // Nothing to update, fetch and return current state
      const currentStep = await this.getStepById(stepId, context);
      if (!currentStep) throw new Error(`Step with ID ${stepId} not found.`);
      return currentStep;
    }

    const { data, error } = await context.supabaseClient
      .from('workflow_steps')
      .update(recordToUpdate)
      .eq('id', stepId)
      .select(WFM_WORKFLOW_STEP_DB_COLUMNS)
      .single();

    if (error) {
      console.error('Error updating workflow step:', error);
      throw new Error(`Failed to update step ${stepId}: ${error.message}`);
    }
    if (!data) {
      throw new Error(`Failed to update step ${stepId}, no data returned or RLS prevented update.`);
    }

    return mapDbStepToGraphqlStep(data as DbWfmWorkflowStep);
  },

  async removeStepFromWorkflow(stepId: string, context: GraphQLContext): Promise<{ success: boolean; message?: string; stepId?: string }> {
    console.log(`wfmWorkflowService.removeStepFromWorkflow called for stepId: ${stepId}, user: ${context.currentUser?.id}`);
    
    const { error: deleteError } = await context.supabaseClient
      .from('workflow_steps')
      .delete()
      .match({ id: stepId });

    if (deleteError) {
      console.error('Error deleting workflow step:', deleteError);
      return { success: false, message: deleteError.message };
    }

    return { success: true, stepId: stepId };
  },

  // TODO: Implement reorder steps method
  async updateStepsOrder(workflowId: string, orderedStepIds: string[], context: GraphQLContext): Promise<ServiceLayerWfmWorkflowStep[]> {
    console.log(`wfmWorkflowService.updateStepsOrder called for workflowId: ${workflowId}, orderedStepIds:`, orderedStepIds, `user: ${context.currentUser?.id}`);

    // It's generally safer to run these updates within a transaction.
    // Supabase client might batch these or run them sequentially.
    // For true atomicity, a plpgsql function executed via .rpc() would be best.
    // Here, we use a two-pass approach to avoid unique constraint violations.

    // Phase 1: Update to temporary, unique negative order values
    // We use negative values to avoid clashing with existing positive step_order values.
    // Adding 1 to 'i' before making it negative ensures uniqueness (e.g., -1, -2, -3)
    // and avoids -0 (which is just 0).
    for (let i = 0; i < orderedStepIds.length; i++) {
      const stepId = orderedStepIds[i];
      const temporaryOrder = -(i + 1); // e.g., -1 for first ID, -2 for second

      const { error: tempUpdateError } = await context.supabaseClient
        .from('workflow_steps')
        .update({ step_order: temporaryOrder, updated_at: new Date().toISOString() })
        .eq('id', stepId)
        .eq('workflow_id', workflowId);

      if (tempUpdateError) {
        console.error(`Error setting temporary order for stepId ${stepId}:`, tempUpdateError);
        // Attempt to revert or handle, though this partial update is tricky without a transaction.
        // For now, we throw, indicating a failure in the reordering process.
        throw new Error(`Failed to set temporary order for step ${stepId}: ${tempUpdateError.message}`);
      }
    }

    // Phase 2: Update to final, positive order values
    for (let i = 0; i < orderedStepIds.length; i++) {
      const stepId = orderedStepIds[i];
      const finalOrder = i + 1; // 1-based indexing for step_order

      const { error: finalUpdateError } = await context.supabaseClient
        .from('workflow_steps')
        .update({ step_order: finalOrder, updated_at: new Date().toISOString() })
        .eq('id', stepId)
        .eq('workflow_id', workflowId)
        // Critically, ensure we are selecting the row with the temporary negative order
        // This assumes that step_order was correctly set in Phase 1.
        // If the temporary update used a different logic, this condition might need adjustment.
        // For this implementation, we target the step by its ID and workflow ID,
        // relying on the fact that its order is now negative.
        // No, we just need to ensure we're updating the correct step ID. The previous phase moved it.
        // .eq('step_order', -(i + 1)) // This is not strictly necessary if ID and workflow_id are sufficient and unique

      if (finalUpdateError) {
        console.error(`Error setting final order for stepId ${stepId}:`, finalUpdateError);
        // If this fails, the data is in an inconsistent state (negative orders).
        // This highlights the need for a true transaction.
        throw new Error(`Failed to set final order for step ${stepId}: ${finalUpdateError.message}`);
      }
    }

    // After all updates, fetch and return the reordered steps
    const updatedSteps = await this.getStepsByWorkflowId(workflowId, context);
    return updatedSteps;
  },

  async addTransitionToWorkflow(input: CreateWfmWorkflowTransitionInput, userId: string, context: GraphQLContext): Promise<WfmWorkflowTransition> {
    console.log(`wfmWorkflowService.addTransitionToWorkflow called with input:`, input, `by user: ${userId}`);
    // Consider adding created_by_user_id, updated_by_user_id to workflow_transitions table if user tracking is needed for transitions

    const recordToInsert = {
      workflow_id: input.workflowId,
      from_step_id: input.fromStepId,
      to_step_id: input.toStepId,
      name: input.name,
      // created_by_user_id: userId, // If table had this
      // updated_by_user_id: userId, // If table had this
    };

    // Optional: Validate that fromStepId and toStepId belong to workflowId
    // This adds overhead but ensures integrity if not otherwise guaranteed.
    // For now, assuming the input is trustworthy or other layers handle this.

    const { data, error } = await context.supabaseClient
      .from('workflow_transitions')
      .insert([recordToInsert])
      .select(WFM_WORKFLOW_TRANSITION_DB_COLUMNS) // Ensure this constant includes all necessary fields
      .single();

    if (error) {
      console.error('Error adding transition to workflow:', error);
      // TODO: More specific error handling for duplicate transitions (uq_workflow_transition constraint)
      // if (error.code === '23505' && error.message.includes('uq_workflow_transition')) { ... }
      throw new Error(`Failed to add transition: ${error.message}`);
    }
    if (!data) {
      throw new Error('Failed to add transition, no data returned from database.');
    }
    // mapDbTransitionToGraphqlTransition currently doesn't handle fromStep/toStep objects
    // The resolver will handle fetching those. The service returns the basic transition.
    return mapDbTransitionToGraphqlTransition(data as DbWfmWorkflowTransition);
  },

  async removeTransitionFromWorkflow(transitionId: string, context: GraphQLContext): Promise<{ success: boolean; message?: string; transitionId?: string }> {
    console.log(`wfmWorkflowService.removeTransitionFromWorkflow called for transitionId: ${transitionId}, user: ${context.currentUser?.id}`);

    const { error } = await context.supabaseClient
      .from('workflow_transitions')
      .delete()
      .match({ id: transitionId });

    if (error) {
      console.error('Error deleting workflow transition:', error);
      return { success: false, message: error.message };
    }

    return { success: true, transitionId: transitionId };
  },

  async updateWorkflowTransition(transitionId: string, input: UpdateWfmWorkflowTransitionInput, userId: string, context: GraphQLContext): Promise<WfmWorkflowTransition> {
    console.log(`wfmWorkflowService.updateWorkflowTransition called for transitionId: ${transitionId}, input:`, input, `by user: ${userId}`);
    
    const recordToUpdate: Partial<DbWfmWorkflowTransition> = {};

    if (Object.prototype.hasOwnProperty.call(input, 'name')) {
      // Ensure name is explicitly set to null if input.name is null, otherwise use input.name
      // Supabase client handles undefined as "do not update field", null as "set field to null"
      recordToUpdate.name = input.name === undefined ? undefined : (input.name || null);
    }

    // If workflow_transitions had an updated_by_user_id, it would be set here:
    // recordToUpdate.updated_by_user_id = userId;

    if (Object.keys(recordToUpdate).length === 0) {
      // No actual fields to update, fetch and return current state of the transition.
      // This requires a getTransitionById method, which isn't explicitly defined yet.
      // For now, if nothing to update, we can throw an error or fetch (if getTransitionById existed).
      // Let's assume for now that an update call implies at least one field in input is provided.
      // If input.name could be undefined and we still want to "touch" the record, this changes.
      // Given UpdateWfmWorkflowTransitionInput only has optional name, this case is possible.
      // To be safe, we should fetch if nothing is to be updated, or make 'name' required if it must change.
      // For now, let's proceed assuming 'name' will be in input if an update is intended.
      // If input is empty, we could choose to throw an error or query and return the existing.
      // Let's query and return if no changes, assuming a getTransitionById method exists or can be added.
      // For simplicity in this step, we'll rely on the caller providing a name to change.
      // If the input only has optional fields, and none are provided, it's an issue.
      // The GQL schema implies name is optional: input UpdateWfmWorkflowTransitionInput { name: String }
      // So, if name is undefined in input, we are not changing it.
      // If name is null, we set it to null.
      // If name is a string, we set it to that string.

      // If no updatable fields were actually provided in the input (e.g. input was {} or { name: undefined })
      // we should probably fetch the current record and return it.
      // This requires a getTransitionById function.
      // Let's throw an error for now if no fields are to be updated.
      if (recordToUpdate.name === undefined) {
         throw new Error('No valid fields provided for transition update.');
      }
    }

    const { data, error } = await context.supabaseClient
      .from('workflow_transitions')
      .update(recordToUpdate)
      .eq('id', transitionId)
      .select(WFM_WORKFLOW_TRANSITION_DB_COLUMNS)
      .single();

    if (error) {
      console.error('Error updating workflow transition:', error);
      throw new Error(`Failed to update transition ${transitionId}: ${error.message}`);
    }
    if (!data) {
      throw new Error(`Failed to update transition ${transitionId}, no data returned or RLS prevented update.`);
    }

    return mapDbTransitionToGraphqlTransition(data as DbWfmWorkflowTransition);
  },

  // TODO: Implement transition management methods (create, delete)
  // async createTransition(...) { ... }
}; 