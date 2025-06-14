// User resolvers for role management
import { GraphQLError } from 'graphql';
import { supabaseAdmin } from '../../../../lib/supabaseClient';
import {
  GraphQLContext,
  getAccessToken,
  requireAuthentication
} from '../helpers';

export const User = {
  roles: async (parent: any, _args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    
    if (!supabaseAdmin) {
      throw new GraphQLError('Could not fetch user roles due to server configuration error.', { 
        extensions: { code: 'INTERNAL_SERVER_ERROR' } 
      });
    }

    // Fetch user roles from user_roles and roles tables
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select(`
        role_id,
        roles (
          id,
          name,
          description
        )
      `)
      .eq('user_id', parent.id);

    if (error) {
      console.error('Error fetching user roles:', error);
      throw new GraphQLError('Could not fetch user roles', { 
        extensions: { code: 'INTERNAL_SERVER_ERROR' } 
      });
    }

    return data.map((userRole: any) => ({
      id: userRole.roles.id,
      name: userRole.roles.name,
      description: userRole.roles.description
    }));
  }
};

export const userMutations = {
  assignUserRole: async (_parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    
    // Check if user has admin permissions (check for app_settings:manage which only admins have)
    if (!context.userPermissions?.includes('app_settings:manage')) {
      throw new GraphQLError('Forbidden: Only admins can assign roles', { 
        extensions: { code: 'FORBIDDEN' } 
      });
    }

    if (!supabaseAdmin) {
      throw new GraphQLError('Could not assign user role due to server configuration error.', { 
        extensions: { code: 'INTERNAL_SERVER_ERROR' } 
      });
    }

    const { userId, roleName } = args;

    // Get the role ID by name
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (roleError || !roleData) {
      throw new GraphQLError(`Role '${roleName}' not found`, { 
        extensions: { code: 'BAD_USER_INPUT' } 
      });
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      throw new GraphQLError('User not found', { 
        extensions: { code: 'BAD_USER_INPUT' } 
      });
    }

    // Assign the role (upsert to handle duplicates)
    const { error: assignError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role_id: roleData.id
      })
      .select();

    if (assignError) {
      console.error('Error assigning role:', assignError);
      throw new GraphQLError('Failed to assign role', { 
        extensions: { code: 'INTERNAL_SERVER_ERROR' } 
      });
    }

    // Return updated user
    const { data: updatedUser, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, email, display_name, avatar_url')
      .eq('user_id', userId)
      .single();

    if (fetchError || !updatedUser) {
      throw new GraphQLError('Failed to fetch updated user', { 
        extensions: { code: 'INTERNAL_SERVER_ERROR' } 
      });
    }

    return {
      id: updatedUser.user_id,
      email: updatedUser.email!,
      display_name: updatedUser.display_name,
      avatar_url: updatedUser.avatar_url
    };
  },

  removeUserRole: async (_parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    
    // Check if user has admin permissions (check for app_settings:manage which only admins have)
    if (!context.userPermissions?.includes('app_settings:manage')) {
      throw new GraphQLError('Forbidden: Only admins can remove roles', { 
        extensions: { code: 'FORBIDDEN' } 
      });
    }

    if (!supabaseAdmin) {
      throw new GraphQLError('Could not remove user role due to server configuration error.', { 
        extensions: { code: 'INTERNAL_SERVER_ERROR' } 
      });
    }

    const { userId, roleName } = args;

    // Get the role ID by name
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (roleError || !roleData) {
      throw new GraphQLError(`Role '${roleName}' not found`, { 
        extensions: { code: 'BAD_USER_INPUT' } 
      });
    }

    // Remove the role assignment
    const { error: removeError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleData.id);

    if (removeError) {
      console.error('Error removing role:', removeError);
      throw new GraphQLError('Failed to remove role', { 
        extensions: { code: 'INTERNAL_SERVER_ERROR' } 
      });
    }

    // Return updated user
    const { data: updatedUser, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, email, display_name, avatar_url')
      .eq('user_id', userId)
      .single();

    if (fetchError || !updatedUser) {
      throw new GraphQLError('Failed to fetch updated user', { 
        extensions: { code: 'INTERNAL_SERVER_ERROR' } 
      });
    }

    return {
      id: updatedUser.user_id,
      email: updatedUser.email!,
      display_name: updatedUser.display_name,
      avatar_url: updatedUser.avatar_url
    };
  }
}; 