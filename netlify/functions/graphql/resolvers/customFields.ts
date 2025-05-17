import { GraphQLError } from 'graphql';
import type {
  // CustomFieldDefinitionResolvers, // For field-level resolvers on CustomFieldDefinition type
  MutationResolvers,
  QueryResolvers,
  CustomFieldDefinition as GraphQLCustomFieldDefinition,
  CustomFieldDefinitionInput as GraphQLCustomFieldDefinitionInput,
  CustomFieldEntityType as GraphQLCustomFieldEntityType,
  // CustomFieldValue as GraphQLCustomFieldValue, // Not directly used as return type here yet
} from '../../../../lib/generated/graphql'; // Reverted to original path
import { requireAuthentication, GraphQLContext } from '../helpers'; // Common helpers
import { getAuthenticatedClient } from '../../../../lib/serviceUtils'; // Reverted to original path
import * as customFieldDefinitionService from '../../../../lib/customFieldDefinitionService'; // To be created, path matches others

export const queryResolvers: Pick<QueryResolvers, 'customFieldDefinitions' | 'customFieldDefinition'> = {
  customFieldDefinitions: async (
    _parent: unknown,
    args: { entityType: GraphQLCustomFieldEntityType; includeInactive?: boolean | null },
    context: GraphQLContext
  ): Promise<GraphQLCustomFieldDefinition[]> => {
    console.log('[Resolver Entry] Query.customFieldDefinitions invoked with args:', args);
    try {
      requireAuthentication(context);
      const { entityType, includeInactive = false } = args;
      const supabase = getAuthenticatedClient(context.token!);

      // Verify that the service and function exist before calling
      if (!customFieldDefinitionService || typeof customFieldDefinitionService.getCustomFieldDefinitions !== 'function') {
        console.error("[Resolver CRITICAL] customFieldDefinitionService.getCustomFieldDefinitions is not available or not a function!", customFieldDefinitionService);
        throw new GraphQLError("Critical server configuration error: Custom field definition service is unavailable.", {
          extensions: { code: "SERVICE_UNAVAILABLE" }
        });
      }

      const definitions = await customFieldDefinitionService.getCustomFieldDefinitions(
        supabase, 
        entityType, 
        includeInactive === null ? undefined : includeInactive
      );

      // The service is designed to return [] if no data, or throw an error.
      // It should not return null/undefined if its promise resolves successfully.
      // If for some reason definitions became null/undefined here, it would cause the non-nullable error.
      // However, the service function getCustomFieldDefinitions itself is typed to return Promise<GraphQLCustomFieldDefinition[]>.
      if (definitions == null) { // Defensive check for null or undefined
        console.error('[Resolver WARNING] customFieldDefinitionService.getCustomFieldDefinitions unexpectedly resolved to null/undefined. Returning empty array. Args:', args);
        return []; // Return empty array to satisfy non-nullable list schema type
      }
      
      return definitions;

    } catch (error: any) {
      console.error('[Resolver Error] Query.customFieldDefinitions failed unexpectedly:', error.message, error.stack, error.extensions);
      // Ensure any caught error is re-thrown as a GraphQLError for consistent error handling
      if (error instanceof GraphQLError) {
        throw error; // Re-throw if already a GraphQLError
      }
      // Wrap other errors
      throw new GraphQLError(`Failed to fetch custom field definitions. ${error.message || 'An unexpected error occurred.'}`, {
        extensions: { 
          code: error.extensions?.code || 'RESOLVER_EXECUTION_ERROR', 
          originalError: { message: error.message, stack: error.stack }
        },
      });
    }
  },
  customFieldDefinition: async (
    _parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ): Promise<GraphQLCustomFieldDefinition | null> => {
    requireAuthentication(context);
    const { id } = args;
    const supabase = getAuthenticatedClient(context.token!);

    // console.log(`[Query.customFieldDefinition] Fetching for id: ${id}`);
    return customFieldDefinitionService.getCustomFieldDefinitionById(supabase, id);
  },
};

export const mutationResolvers: Pick<
  MutationResolvers,
  | 'createCustomFieldDefinition'
  | 'updateCustomFieldDefinition'
  | 'deactivateCustomFieldDefinition'
  | 'reactivateCustomFieldDefinition'
> = {
  createCustomFieldDefinition: async (
    _parent: unknown,
    args: { input: GraphQLCustomFieldDefinitionInput },
    context: GraphQLContext
  ): Promise<GraphQLCustomFieldDefinition> => {
    requireAuthentication(context);
    // TODO: Add permission check for 'custom_fields:manage_definitions'
    const { input } = args;
    const supabase = getAuthenticatedClient(context.token!);
    const currentUser = context.currentUser!;

    // console.log(`[Mutation.createCustomFieldDefinition] User: ${currentUser.id}, Input:`, input);
    // Permission check for 'custom_fields.manage_definitions' will be handled by RLS or a helper
    return customFieldDefinitionService.createCustomFieldDefinition(supabase, input);
  },
  updateCustomFieldDefinition: async (
    _parent: unknown,
    args: { id: string; input: GraphQLCustomFieldDefinitionInput },
    context: GraphQLContext
  ): Promise<GraphQLCustomFieldDefinition> => {
    requireAuthentication(context);
    // TODO: Add permission check
    const { id, input } = args;
    const supabase = getAuthenticatedClient(context.token!);
    const currentUser = context.currentUser!;

    // console.log(`[Mutation.updateCustomFieldDefinition] User: ${currentUser.id}, ID: ${id}, Input:`, input);
    return customFieldDefinitionService.updateCustomFieldDefinition(supabase, id, input);
  },
  deactivateCustomFieldDefinition: async (
    _parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ): Promise<GraphQLCustomFieldDefinition> => {
    requireAuthentication(context);
    // TODO: Add permission check
    const { id } = args;
    const supabase = getAuthenticatedClient(context.token!);
    const currentUser = context.currentUser!;

    // console.log(`[Mutation.deactivateCustomFieldDefinition] User: ${currentUser.id}, ID: ${id}`);
    return customFieldDefinitionService.setCustomFieldDefinitionActiveStatus(supabase, id, false);
  },
  reactivateCustomFieldDefinition: async (
    _parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ): Promise<GraphQLCustomFieldDefinition> => {
    requireAuthentication(context);
    // TODO: Add permission check
    const { id } = args;
    const supabase = getAuthenticatedClient(context.token!);
    const currentUser = context.currentUser!;

    // console.log(`[Mutation.reactivateCustomFieldDefinition] User: ${currentUser.id}, ID: ${id}`);
    return customFieldDefinitionService.setCustomFieldDefinitionActiveStatus(supabase, id, true);
  },
};

// Example for field-level resolvers on CustomFieldDefinition if needed later:
// import { CustomFieldDefinitionResolvers } from '../../../../lib/generated/graphql'; // Path matches others
// export const customFieldDefinitionTypeResolvers: CustomFieldDefinitionResolvers = {
//   // Example: if dropdownOptions needed transformation:
//   // dropdownOptions: (parent) => { /* custom logic */ return parent.dropdownOptions; }
// }; 