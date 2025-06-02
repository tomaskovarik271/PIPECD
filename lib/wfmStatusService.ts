import { GraphQLContext } from '../netlify/functions/graphql/helpers'; // For auth context
import { 
  WfmStatus, 
  CreateWfmStatusInput, 
  UpdateWfmStatusInput 
} from './generated/graphql'; 

// Placeholder for permission checks if you have a utility for it
// import { checkPermission, Permission } from './permissionUtils'; // Assuming Permission enum/type exists

// Define the fields to be selected for WfmStatus from the database.
const WFM_STATUS_DB_COLUMNS = 'id, name, description, color, is_archived, created_at, updated_at, created_by_user_id, updated_by_user_id';

// Interface for the raw database row structure
interface DbWfmStatus {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  is_archived: boolean;
  created_at: string; // Assuming TIMESTAMPTZ is stringified
  updated_at: string;
  created_by_user_id: string | null; 
  updated_by_user_id: string | null;
}

// Helper function to map DB row to GraphQL WfmStatus type
const mapDbStatusToGraphqlStatus = (dbStatus: DbWfmStatus): WfmStatus => {
  return {
    __typename: 'WFMStatus', // Ensure __typename is set for GraphQL
    id: dbStatus.id,
    name: dbStatus.name,
    description: dbStatus.description,
    color: dbStatus.color,
    isArchived: dbStatus.is_archived, // Map snake_case to camelCase
    createdAt: new Date(dbStatus.created_at),   // Map snake_case to camelCase
    updatedAt: new Date(dbStatus.updated_at),   // Map snake_case to camelCase
    // createdByUser and updatedByUser are resolved by GraphQL field resolvers
    // The service layer provides the IDs (created_by_user_id, updated_by_user_id)
    // which are implicitly part of the extended WfmStatusWithUserIds in resolvers,
    // but the base WfmStatus type from codegen doesn't have them.
    // The raw dbStatus object (containing created_by_user_id, updated_by_user_id)
    // will be cast to WfmStatusWithUserIds in the resolver layer.
  } as WfmStatus; // Cast to WfmStatus as created_by_user_id etc. are not on base type
};

export const wfmStatusService = {
  async getAll(isArchived: boolean = false, context: GraphQLContext): Promise<WfmStatus[]> {
    console.log(`wfmStatusService.getAll called with isArchived: ${isArchived}, user: ${context.currentUser?.id}`);
    // TODO: checkPermission(context, Permission.WFM_STATUS_READ_ALL); 
    const { data, error } = await context.supabaseClient
      .from('statuses')
      .select(WFM_STATUS_DB_COLUMNS)
      .eq('is_archived', isArchived);
    if (error) {
        console.error('Error fetching statuses:', error);
        throw error;
    }
    if (!data) return [];
    return (data as DbWfmStatus[]).map(mapDbStatusToGraphqlStatus);
  },

  async getById(id: string, context: GraphQLContext): Promise<WfmStatus | null> {
    console.log(`wfmStatusService.getById called with id: ${id}, user: ${context.currentUser?.id}`);
    // TODO: checkPermission(context, Permission.WFM_STATUS_READ_ONE);
    const { data, error } = await context.supabaseClient
      .from('statuses')
      .select(WFM_STATUS_DB_COLUMNS)
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // PGRST116: Row not found
      console.error('Error fetching status by ID:', error);
      throw error;
    }
    return data ? mapDbStatusToGraphqlStatus(data as DbWfmStatus) : null;
  },

  async create(input: CreateWfmStatusInput, userId: string, context: GraphQLContext): Promise<WfmStatus> {
    console.log(`wfmStatusService.create called with input:`, input, `by user: ${userId}`);
    // userId is now non-nullable based on resolver logic, removed redundant context.currentUser check here
    
    const recordToInsert = {
        name: input.name,
        description: input.description,
        color: input.color,
        // is_archived will default to false in DB if not provided, or can be set here
        created_by_user_id: userId,
        updated_by_user_id: userId,
    };

    const { data, error } = await context.supabaseClient
      .from('statuses')
      .insert([recordToInsert])
      .select(WFM_STATUS_DB_COLUMNS)
      .single();

    if (error) {
        console.error('Error creating status:', error);
        throw error;
    }
    if (!data) throw new Error('Failed to create status, no data returned.');
    return mapDbStatusToGraphqlStatus(data as DbWfmStatus);
  },

  async update(id: string, input: UpdateWfmStatusInput, userId: string, context: GraphQLContext): Promise<WfmStatus> {
    console.log(`wfmStatusService.update called with id: ${id}, input:`, input, `by user: ${userId}`);
    // userId is now non-nullable

    const recordToUpdate: Partial<Omit<DbWfmStatus, 'id' | 'created_at' | 'created_by_user_id'>> = {
        updated_by_user_id: userId,
    };

    // For non-nullable fields like 'name', only update if a string is provided.
    // null or undefined for input.name should not attempt to update the DB 'name' field.
    if (typeof input.name === 'string') {
        recordToUpdate.name = input.name;
    }
    
    if (Object.prototype.hasOwnProperty.call(input, 'description')) {
        recordToUpdate.description = input.description === null ? null : input.description;
    }
    if (Object.prototype.hasOwnProperty.call(input, 'color')) {
        recordToUpdate.color = input.color === null ? null : input.color;
    }
    
    if (typeof input.isArchived === 'boolean') {
        recordToUpdate.is_archived = input.isArchived;
    }

    const { data, error } = await context.supabaseClient
      .from('statuses')
      .update(recordToUpdate)
      .eq('id', id)
      .select(WFM_STATUS_DB_COLUMNS)
      .single();

    if (error) {
        console.error('Error updating status:', error);
        throw error;
    }
    if (!data) {
        // This case should ideally be handled by the resolver, 
        // potentially by first fetching to see if it exists, then updating.
        // Or, the resolver checks the return and throws a NotFoundError.
        // For now, service throws a generic error if update returns no data.
        throw new Error(`Status with ID ${id} not found or RLS prevented update.`);
    }
    return mapDbStatusToGraphqlStatus(data as DbWfmStatus);
  },

  async delete(id: string, context: GraphQLContext): Promise<{ success: boolean; message?: string }> {
    console.log(`wfmStatusService.delete called with id: ${id}, user: ${context.currentUser?.id}`);
    const { error } = await context.supabaseClient
        .from('statuses')
        .delete()
        .match({ id: id });

    if (error) {
        console.error('Error deleting status:', error);
        return { success: false, message: error.message };
    }
    // Supabase delete doesn't return the count of deleted rows by default in a simple way to check if 0 rows were deleted.
    // We assume success if no error is thrown. For more robust check, one might try to fetch before deleting or handle specific errors.
    return { success: true };
  }
}; 