import type { GraphQLContext } from '../helpers';
import { requireAuthentication, getAccessToken } from '../helpers';
import { GraphQLError } from 'graphql';
import type { OrganizationResolvers, CustomFieldDefinition, CustomFieldValue, MutationResolvers, QueryResolvers } from '../../../../lib/generated/graphql';
import { CustomFieldEntityType, CustomFieldType } from '../../../../lib/generated/graphql';
import * as customFieldDefinitionService from '../../../../lib/customFieldDefinitionService';
import { getAuthenticatedClient } from '../../../../lib/serviceUtils';
import * as userProfileService from '../../../../lib/userProfileService';

export const Organization: OrganizationResolvers<GraphQLContext> = {
  people: async (parent: { id: string }, _args: unknown, context: GraphQLContext) => {
     requireAuthentication(context);
     const accessToken = getAccessToken(context);
     if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
     
     try {
       const supabase = getAuthenticatedClient(accessToken);
       
       const { data: peopleData, error } = await supabase
         .from('people')
         .select('*')
         .eq('organization_id', parent.id)
         .eq('user_id', context.currentUser!.id);
       
       if (error) throw error;
       
       return peopleData?.map(person => ({
         id: person.id,
         created_at: person.created_at,
         updated_at: person.updated_at,
         user_id: person.user_id,
         first_name: person.first_name,
         last_name: person.last_name,
         email: person.email,
         phone: person.phone,
         notes: person.notes,
         organization_id: person.organization_id,
         db_custom_field_values: person.custom_field_values,
       })) as any || [];
     } catch (error) {
       console.error('Error fetching organization people:', error);
       return [];
     }
  },

  // Account manager resolver
  accountManager: async (parent: { account_manager_id?: string | null }, _args: unknown, context: GraphQLContext) => {
    if (!parent.account_manager_id) return null;
    
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
    
    try {
      const supabase = getAuthenticatedClient(accessToken);
      
      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', parent.account_manager_id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', profileError);
        return null;
      }
      
      // Get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role:roles(id, name, description)')
        .eq('user_id', parent.account_manager_id);
      
      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      }
      
      // Return User type structure
      return {
        id: parent.account_manager_id,
        email: profileData?.email || '',
        display_name: profileData?.display_name || profileData?.email || 'Unknown User',
        avatar_url: profileData?.avatar_url || null,
        roles: rolesData?.map(r => r.role).filter(Boolean) || []
      } as any;
    } catch (error) {
      console.error('Error resolving account manager:', error);
      return null; // Return null if account manager not found
    }
  },

  // Account statistics resolvers
  totalDealValue: async (parent: { id: string }, _args: unknown, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
    
    const supabase = getAuthenticatedClient(accessToken);
    
    try {
      // Join with wfm_projects and workflow_steps to filter out final step deals
      const { data, error } = await supabase
        .from('deals')
        .select(`
          amount,
          wfm_projects!inner(
            current_step_id,
            workflow_steps!inner(
              is_final_step
            )
          )
        `)
        .eq('organization_id', parent.id)
        .eq('wfm_projects.workflow_steps.is_final_step', false);
      
      if (error) throw error;
      
      const total = data?.reduce((sum, deal) => sum + (deal.amount || 0), 0) || 0;
      return total;
    } catch (error) {
      console.error('Error calculating total deal value:', error);
      // Fallback: get all deals without WFM filtering
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('deals')
          .select('amount')
          .eq('organization_id', parent.id);
        
        if (fallbackError) throw fallbackError;
        const total = fallbackData?.reduce((sum, deal) => sum + (deal.amount || 0), 0) || 0;
        return total;
      } catch (fallbackError) {
        console.error('Error in fallback calculation:', fallbackError);
        return 0;
      }
    }
  },

  activeDealCount: async (parent: { id: string }, _args: unknown, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
    
    const supabase = getAuthenticatedClient(accessToken);
    
    try {
      // Join with wfm_projects and workflow_steps to filter out final step deals
      const { count, error } = await supabase
        .from('deals')
        .select(`
          id,
          wfm_projects!inner(
            current_step_id,
            workflow_steps!inner(
              is_final_step
            )
          )
        `, { count: 'exact' })
        .eq('organization_id', parent.id)
        .eq('wfm_projects.workflow_steps.is_final_step', false);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting active deals:', error);
      // Fallback: count all deals without WFM filtering
      try {
        const { count: fallbackCount, error: fallbackError } = await supabase
          .from('deals')
          .select('id', { count: 'exact' })
          .eq('organization_id', parent.id);
        
        if (fallbackError) throw fallbackError;
        return fallbackCount || 0;
      } catch (fallbackError) {
        console.error('Error in fallback count:', fallbackError);
        return 0;
      }
    }
  },

  // lastActivity resolver removed - using Google Calendar integration instead

  customFieldValues: async (parent: { id: string; db_custom_field_values?: Record<string, any> | null }, _args: unknown, context: GraphQLContext): Promise<CustomFieldValue[]> => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) {
      console.error('Organization.customFieldValues: Missing access token');
      throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
    }
    const supabase = getAuthenticatedClient(accessToken);
    const organizationIdForLog = parent.id || 'unknown_organization_id';

    const organizationSpecificValues = parent.db_custom_field_values || {};

    try {
      const definitions: CustomFieldDefinition[] = await customFieldDefinitionService.getCustomFieldDefinitions(
        supabase,
        CustomFieldEntityType.Organization, // Use enum value
        false // includeInactive = false
      );

      if (!definitions || definitions.length === 0) {
        console.log(`[Organization.customFieldValues] organization: ${organizationIdForLog}, no active Organization definitions found. Returning [].`);
        return [];
      }

      const mappedValues: CustomFieldValue[] = definitions
        .map((definition: CustomFieldDefinition) => {
          const rawValue = organizationSpecificValues[definition.fieldName];

          const fieldValue: CustomFieldValue = {
            definition: definition, 
            stringValue: null,
            numberValue: null,
            booleanValue: null,
            dateValue: null,
            selectedOptionValues: null,
          };

          if (rawValue === undefined || rawValue === null) {
            console.log(`[Organization.customFieldValues] organization: ${organizationIdForLog}, Def: ${definition.fieldName}, rawValue is null/undefined. FieldValue will have nulls.`);
            return fieldValue; 
          }

          switch (definition.fieldType) {
            case CustomFieldType.Text: 
              fieldValue.stringValue = String(rawValue);
              break;
            case CustomFieldType.Number:
              const num = parseFloat(String(rawValue));
              if (!isNaN(num)) {
                fieldValue.numberValue = num;
              } else {
                console.warn(`[Organization.customFieldValues] organization: ${organizationIdForLog}, Def: ${definition.fieldName}, could not parse number:`, rawValue);
              }
              break;
            case CustomFieldType.Boolean:
              fieldValue.booleanValue = Boolean(rawValue);
              break;
            case CustomFieldType.Date:
              fieldValue.dateValue = rawValue; 
              break;
            case CustomFieldType.Dropdown: 
              if (Array.isArray(rawValue) && rawValue.length > 0) {
                fieldValue.selectedOptionValues = [String(rawValue[0])]; 
              } else if (typeof rawValue === 'string') { 
                fieldValue.selectedOptionValues = [rawValue];
              }
              break;
            case CustomFieldType.MultiSelect:
              if (Array.isArray(rawValue)) {
                fieldValue.selectedOptionValues = rawValue.map(String);
              }
              break;
            default:
              console.warn(`[Organization.customFieldValues] organization: ${organizationIdForLog}, Def: ${definition.fieldName}, Unhandled custom field type: ${definition.fieldType as string}`);
          }
          return fieldValue;
        });
      
      return mappedValues;

    } catch (error) {
      console.error(`Error resolving customFieldValues for organization ${organizationIdForLog}:`, error);
      if (error instanceof GraphQLError) throw error;
      throw new GraphQLError('Could not resolve custom field values for the organization.', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
};

// Account Management Query Resolvers
export const accountManagementQueries: Partial<QueryResolvers<GraphQLContext>> = {
  myAccounts: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
    
    const supabase = getAuthenticatedClient(accessToken);
    const userId = context.currentUser!.id;
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('account_manager_id', userId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user accounts:', error);
      throw new GraphQLError('Failed to fetch accounts', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  },

  myAccountPortfolioStats: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
    
    const supabase = getAuthenticatedClient(accessToken);
    const userId = context.currentUser!.id;
    
    try {
      // Get total accounts
      const { count: totalAccounts } = await supabase
        .from('organizations')
        .select('id', { count: 'exact' })
        .eq('account_manager_id', userId);

      // First get the organization IDs for this account manager
      const { data: organizations } = await supabase
        .from('organizations')
        .select('id')
        .eq('account_manager_id', userId);

      const organizationIds = organizations?.map(org => org.id) || [];

      // Get deal statistics for managed accounts
      let dealStats: any[] = [];
      if (organizationIds.length > 0) {
        const { data } = await supabase
          .from('deals')
          .select('amount, organization_id')
          .in('organization_id', organizationIds);
        
        dealStats = data || [];
      }

      const totalDealValue = dealStats.reduce((sum, deal) => sum + (deal.amount || 0), 0);
      const activeDealCount = dealStats.length;

      // Calculate accounts needing attention (no activity in 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Activity-based account attention calculation removed
      // TODO: Replace with Google Calendar integration for tracking engagement
      const accountsNeedingAttention = 0; // Placeholder until Google Calendar integration

      return {
        totalAccounts: totalAccounts || 0,
        totalDealValue,
        activeDealCount,
        accountsNeedingAttention
      };
    } catch (error) {
      console.error('Error calculating portfolio stats:', error);
      throw new GraphQLError('Failed to calculate portfolio statistics', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }
};

// Account Management Mutation Resolvers
export const accountManagementMutations: Partial<MutationResolvers<GraphQLContext>> = {
  assignAccountManager: async (_parent: unknown, args: { organizationId: string; userId: string }, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
    
    // Check permissions
    const permissions = context.userPermissions || [];
    if (!permissions.includes('organization:assign_account_manager')) {
      throw new GraphQLError('Insufficient permissions to assign account manager', { 
        extensions: { code: 'FORBIDDEN' } 
      });
    }
    
    const supabase = getAuthenticatedClient(accessToken);
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({ account_manager_id: args.userId })
        .eq('id', args.organizationId)
        .select('*')
        .single();
      
      if (error) throw error;
      if (!data) throw new GraphQLError('Organization not found', { extensions: { code: 'NOT_FOUND' } });
      
      return data;
    } catch (error) {
      console.error('Error assigning account manager:', error);
      if (error instanceof GraphQLError) throw error;
      throw new GraphQLError('Failed to assign account manager', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  },

  removeAccountManager: async (_parent: unknown, args: { organizationId: string }, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
    
    // Check permissions
    const permissions = context.userPermissions || [];
    if (!permissions.includes('organization:assign_account_manager')) {
      throw new GraphQLError('Insufficient permissions to remove account manager', { 
        extensions: { code: 'FORBIDDEN' } 
      });
    }
    
    const supabase = getAuthenticatedClient(accessToken);
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({ account_manager_id: null })
        .eq('id', args.organizationId)
        .select('*')
        .single();
      
      if (error) throw error;
      if (!data) throw new GraphQLError('Organization not found', { extensions: { code: 'NOT_FOUND' } });
      
      return data;
    } catch (error) {
      console.error('Error removing account manager:', error);
      if (error instanceof GraphQLError) throw error;
      throw new GraphQLError('Failed to remove account manager', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }
};