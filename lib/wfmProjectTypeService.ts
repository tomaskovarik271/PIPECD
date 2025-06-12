import { GraphQLContext } from '../netlify/functions/graphql/helpers';
import { 
  WfmProjectType,
  CreateWfmProjectTypeInput,
  UpdateWfmProjectTypeInput,
  // WfmWorkflow // Not directly resolved here, but default_workflow_id is used by resolver
} from './generated/graphql';

// --- Database Column Definition ---
const WFM_PROJECT_TYPE_DB_COLUMNS = 'id, name, description, default_workflow_id, icon_name, is_archived, created_at, updated_at, created_by_user_id, updated_by_user_id';

// --- Database Interface Definition ---
interface DbWfmProjectType {
  id: string;
  name: string;
  description: string | null;
  default_workflow_id: string | null;
  icon_name: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  created_by_user_id: string | null;
  updated_by_user_id: string | null;
}

// --- Mapper Function ---
const mapDbProjectTypeToGraphqlProjectType = (dbProjectType: DbWfmProjectType): WfmProjectType => {
  const result = {
    __typename: 'WFMProjectType' as const,
    id: dbProjectType.id,
    name: dbProjectType.name,
    description: dbProjectType.description,
    iconName: dbProjectType.icon_name,
    isArchived: dbProjectType.is_archived,
    createdAt: new Date(dbProjectType.created_at),
    updatedAt: new Date(dbProjectType.updated_at),
    // Add IDs needed by field resolvers
    default_workflow_id: dbProjectType.default_workflow_id,
    created_by_user_id: dbProjectType.created_by_user_id,
    updated_by_user_id: dbProjectType.updated_by_user_id
  };
  // Cast because the generated WfmProjectType doesn't list these resolver-assisting IDs.
  return result as unknown as WfmProjectType;
};

export const wfmProjectTypeService = {
  async getAll(isArchived: boolean = false, context: GraphQLContext): Promise<WfmProjectType[]> {
    console.log(`wfmProjectTypeService.getAll called with isArchived: ${isArchived}, user: ${context.currentUser?.id}`);
    const { data, error } = await context.supabaseClient
      .from('project_types')
      .select(WFM_PROJECT_TYPE_DB_COLUMNS)
      .eq('is_archived', isArchived);
    if (error) {
      console.error('Error fetching project types:', error);
      throw error;
    }
    if (!data) return [];
    return (data as DbWfmProjectType[]).map(mapDbProjectTypeToGraphqlProjectType);
  },

  async getById(id: string, context: GraphQLContext): Promise<WfmProjectType | null> {
    console.log(`wfmProjectTypeService.getById called with id: ${id}, user: ${context.currentUser?.id}`);
    const { data, error } = await context.supabaseClient
      .from('project_types')
      .select(WFM_PROJECT_TYPE_DB_COLUMNS)
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching project type by ID:', error);
      throw error;
    }
    return data ? mapDbProjectTypeToGraphqlProjectType(data as DbWfmProjectType) : null;
  },

  async getWFMProjectTypeByName(name: string, context: GraphQLContext): Promise<WfmProjectType | null> {
    // console.log(`wfmProjectTypeService.getWFMProjectTypeByName called with name: ${name}, user: ${context.currentUser?.id}`);
    const { data, error } = await context.supabaseClient
      .from('project_types')
      .select(WFM_PROJECT_TYPE_DB_COLUMNS)
      .eq('name', name)
      .maybeSingle(); // Use maybeSingle as name should be unique but we want to handle null gracefully
    
    if (error) {
      // Don't throw if PGROST116 (not found), just return null
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching project type by name:', error);
      throw error;
    }
    return data ? mapDbProjectTypeToGraphqlProjectType(data as DbWfmProjectType) : null;
  },

  async create(input: CreateWfmProjectTypeInput, userId: string, context: GraphQLContext): Promise<WfmProjectType> {
    console.log(`wfmProjectTypeService.create called with input:`, input, `by user: ${userId}`);
    const recordToInsert = {
        name: input.name,
        description: input.description,
        default_workflow_id: input.defaultWorkflowId, // Map from camelCase input
        icon_name: input.iconName,                 // Map from camelCase input
        created_by_user_id: userId,
        updated_by_user_id: userId,
        // is_archived defaults to false in DB
    };
    const { data, error } = await context.supabaseClient
      .from('project_types')
      .insert([recordToInsert])
      .select(WFM_PROJECT_TYPE_DB_COLUMNS)
      .single();
    if (error) {
      console.error('Error creating project type:', error);
      throw error;
    }
    if (!data) throw new Error('Failed to create project type, no data returned.');
    return mapDbProjectTypeToGraphqlProjectType(data as DbWfmProjectType);
  },

  async update(id: string, input: UpdateWfmProjectTypeInput, userId: string, context: GraphQLContext): Promise<WfmProjectType> {
    console.log(`wfmProjectTypeService.update called with id: ${id}, input:`, input, `by user: ${userId}`);
    const recordToUpdate: Partial<Omit<DbWfmProjectType, 'id' | 'created_at' | 'created_by_user_id'>> = {
        updated_by_user_id: userId,
    };

    if (typeof input.name === 'string') {
        recordToUpdate.name = input.name;
    }
    if (Object.prototype.hasOwnProperty.call(input, 'description')) {
        recordToUpdate.description = input.description === null ? null : input.description;
    }
    if (Object.prototype.hasOwnProperty.call(input, 'defaultWorkflowId')) {
        recordToUpdate.default_workflow_id = input.defaultWorkflowId === null ? null : input.defaultWorkflowId;
    }
    if (Object.prototype.hasOwnProperty.call(input, 'iconName')) {
        recordToUpdate.icon_name = input.iconName === null ? null : input.iconName;
    }
    if (typeof input.isArchived === 'boolean') {
        recordToUpdate.is_archived = input.isArchived;
    }

    const { data, error } = await context.supabaseClient
      .from('project_types')
      .update(recordToUpdate)
      .eq('id', id)
      .select(WFM_PROJECT_TYPE_DB_COLUMNS)
      .single();
    if (error) {
      console.error('Error updating project type:', error);
      throw error;
    }
    if (!data) {
        throw new Error(`Project Type with ID ${id} not found or RLS prevented update.`);
    }
    return mapDbProjectTypeToGraphqlProjectType(data as DbWfmProjectType);
  },

  async delete(id: string, context: GraphQLContext): Promise<{ success: boolean; message?: string }> {
    console.log(`wfmProjectTypeService.delete called with id: ${id}, user: ${context.currentUser?.id}`);
    // Note: Consider implications if projects are using this project_type.
    const { error } = await context.supabaseClient
        .from('project_types')
        .delete()
        .match({ id: id });
    if (error) {
        console.error('Error deleting project type:', error);
        return { success: false, message: error.message };
    }
    return { success: true };
  },
}; 