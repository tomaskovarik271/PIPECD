import type { GraphQLContext } from '../helpers';
import { requireAuthentication, getAccessToken } from '../helpers';
import { GraphQLError } from 'graphql';
import type { 
  PersonOrganizationRoleResolvers, 
  PersonHistoryResolvers,
  QueryResolvers, 
  MutationResolvers 
} from '../../../../lib/generated/graphql';
import { getAuthenticatedClient } from '../../../../lib/serviceUtils';

// ================================
// PersonOrganizationRole Resolvers
// ================================

export const PersonOrganizationRole: PersonOrganizationRoleResolvers<GraphQLContext> = {
  person: async (parent, _args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

    try {
      const supabase = getAuthenticatedClient(accessToken);
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('id', parent.person_id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching person for org role:', error);
      throw new GraphQLError('Failed to fetch person');
    }
  },

  organization: async (parent, _args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

    try {
      const supabase = getAuthenticatedClient(accessToken);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', parent.organization_id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching organization for role:', error);
      throw new GraphQLError('Failed to fetch organization');
    }
  }
};

// ================================
// PersonHistory Resolvers
// ================================

export const PersonHistory: PersonHistoryResolvers<GraphQLContext> = {
  person: async (parent, _args, context) => {
    if (!parent.person_id) return null;

    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

    try {
      const supabase = getAuthenticatedClient(accessToken);
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('id', parent.person_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore not found for deleted people
      return data || null;
    } catch (error) {
      console.error('Error fetching person for history:', error);
      return null;
    }
  }
};

// ================================
// Enhanced Person Resolvers
// ================================

export const PersonEnhanced = {
  // NEW: Get all organization roles for a person
  organizationRoles: async (parent: { id: string }, _args: unknown, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

    try {
      const supabase = getAuthenticatedClient(accessToken);
      const { data, error } = await supabase
        .from('person_organization_roles')
        .select(`
          id,
          person_id,
          organization_id,
          role_title,
          department,
          is_primary,
          status,
          start_date,
          end_date,
          notes,
          created_at,
          updated_at,
          created_by_user_id
        `)
        .eq('person_id', parent.id)
        .eq('status', 'active')
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching person organization roles:', error);
      return [];
    }
  },

  // NEW: Get primary organization for a person
  primaryOrganization: async (parent: { id: string }, _args: unknown, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

    try {
      const supabase = getAuthenticatedClient(accessToken);
      
      // First try to get from explicitly marked primary role
      const { data: primaryRoleData, error: primaryRoleError } = await supabase
        .from('person_organization_roles')
        .select('organization_id')
        .eq('person_id', parent.id)
        .eq('is_primary', true)
        .eq('status', 'active')
        .single();

      let organizationId = primaryRoleData?.organization_id;

      // If no explicit primary role found, get the first active role
      if (!organizationId && (primaryRoleError?.code === 'PGRST116')) {
        const { data: firstRoleData, error: firstRoleError } = await supabase
          .from('person_organization_roles')
          .select('organization_id')
          .eq('person_id', parent.id)
          .eq('status', 'active')
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (firstRoleError && firstRoleError.code !== 'PGRST116') throw firstRoleError;
        organizationId = firstRoleData?.organization_id;
      }

      if (!organizationId) return null;

      // Get the organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (orgError) throw orgError;
      return orgData;
    } catch (error) {
      console.error('Error fetching primary organization:', error);
      return null;
    }
  },

  // NEW: Get primary role for a person
  primaryRole: async (parent: { id: string }, _args: unknown, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

    try {
      const supabase = getAuthenticatedClient(accessToken);
      const { data, error } = await supabase
        .from('person_organization_roles')
        .select('*')
        .eq('person_id', parent.id)
        .eq('is_primary', true)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching primary role:', error);
      return null;
    }
  }
};

// ================================
// Query Resolvers
// ================================

export const PersonOrganizationRoleQueries: Partial<QueryResolvers<GraphQLContext>> = {
  personOrganizationRoles: async (_parent, args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

    try {
      const supabase = getAuthenticatedClient(accessToken);
      const { data, error } = await supabase
        .from('person_organization_roles')
        .select('*')
        .eq('person_id', args.personId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching person organization roles:', error);
      throw new GraphQLError('Failed to fetch person organization roles');
    }
  },

  personHistory: async (_parent, args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

    try {
      const supabase = getAuthenticatedClient(accessToken);
      const { data, error } = await supabase
        .from('person_history')
        .select('*')
        .eq('person_id', args.personId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching person history:', error);
      throw new GraphQLError('Failed to fetch person history');
    }
  },

  peopleByOrganization: async (_parent, args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

    try {
      const supabase = getAuthenticatedClient(accessToken);
      
      // Build status filter
      const statusFilter = args.includeFormerEmployees 
        ? ['active', 'inactive', 'former'] 
        : ['active'];

      const { data, error } = await supabase
        .from('person_organization_roles')
        .select(`
          person_id,
          people!inner(*)
        `)
        .eq('organization_id', args.organizationId)
        .in('status', statusFilter);

      if (error) throw error;
      
      // Extract unique people (person might have multiple roles)
      const uniquePeople = new Map();
      data?.forEach(role => {
        if (role.people && !uniquePeople.has(role.person_id)) {
          uniquePeople.set(role.person_id, role.people);
        }
      });

      return Array.from(uniquePeople.values());
    } catch (error) {
      console.error('Error fetching people by organization:', error);
      throw new GraphQLError('Failed to fetch people by organization');
    }
  }
};

// ================================
// Mutation Resolvers
// ================================

export const PersonOrganizationRoleMutations: Partial<MutationResolvers<GraphQLContext>> = {
  createPersonOrganizationRole: async (_parent, args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

    try {
      const supabase = getAuthenticatedClient(accessToken);
      
      // If setting as primary, unset other primary roles for this person
      if (args.input.is_primary) {
        await supabase
          .from('person_organization_roles')
          .update({ is_primary: false })
          .eq('person_id', args.personId)
          .eq('is_primary', true);
      }

      const { data, error } = await supabase
        .from('person_organization_roles')
        .insert({
          person_id: args.personId,
          organization_id: args.input.organization_id,
          role_title: args.input.role_title,
          department: args.input.department,
          is_primary: args.input.is_primary || false,
          status: args.input.status || 'active',
          start_date: args.input.start_date,
          end_date: args.input.end_date,
          notes: args.input.notes,
          created_by_user_id: context.currentUser?.id
        })
        .select(`
          *,
          person:people(*),
          organization:organizations(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating person organization role:', error);
      throw new GraphQLError('Failed to create person organization role');
    }
  },

  updatePersonOrganizationRole: async (_parent, args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

    try {
      const supabase = getAuthenticatedClient(accessToken);

      // If setting as primary, unset other primary roles for this person
      if (args.input.is_primary) {
        // Get the person_id for this role
        const { data: currentRole } = await supabase
          .from('person_organization_roles')
          .select('person_id')
          .eq('id', args.id)
          .single();

        if (currentRole) {
          await supabase
            .from('person_organization_roles')
            .update({ is_primary: false })
            .eq('person_id', currentRole.person_id)
            .eq('is_primary', true)
            .neq('id', args.id);
        }
      }

      const { data, error } = await supabase
        .from('person_organization_roles')
        .update(args.input)
        .eq('id', args.id)
        .select(`
          *,
          person:people(*),
          organization:organizations(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating person organization role:', error);
      throw new GraphQLError('Failed to update person organization role');
    }
  },

  deletePersonOrganizationRole: async (_parent, args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

    try {
      const supabase = getAuthenticatedClient(accessToken);
      const { error } = await supabase
        .from('person_organization_roles')
        .delete()
        .eq('id', args.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting person organization role:', error);
      throw new GraphQLError('Failed to delete person organization role');
    }
  },

  setPrimaryOrganizationRole: async (_parent, args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

    try {
      const supabase = getAuthenticatedClient(accessToken);

      // Unset all primary roles for this person
      await supabase
        .from('person_organization_roles')
        .update({ is_primary: false })
        .eq('person_id', args.personId)
        .eq('is_primary', true);

      // Set the specified role as primary
      const { data, error } = await supabase
        .from('person_organization_roles')
        .update({ is_primary: true })
        .eq('id', args.roleId)
        .eq('person_id', args.personId)
        .select(`
          *,
          person:people(*),
          organization:organizations(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error setting primary organization role:', error);
      throw new GraphQLError('Failed to set primary organization role');
    }
  }
}; 