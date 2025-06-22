import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError } from '../../helpers';
import { OrganizationInputSchema } from '../../validators';
import { inngest } from '../../../../../lib/inngestClient';
import { organizationService } from '../../../../../lib/organizationService';
import type { MutationResolvers } from '../../../../../lib/generated/graphql';

export const organizationMutations: Pick<MutationResolvers<GraphQLContext>, 'createOrganization' | 'updateOrganization' | 'deleteOrganization' | 'assignAccountManager' | 'removeAccountManager'> = {
    createOrganization: async (_parent, args, context) => {
      // console.log('[Mutation.createOrganization] received input:', args.input);
      const action = 'creating organization';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;

          const validatedInput = OrganizationInputSchema.parse(args.input);
          // console.log('[Mutation.createOrganization] validated input:', validatedInput);

          if (!context.userPermissions?.includes('organization:create')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }

          const newOrgRecord = await organizationService.createOrganization(userId, validatedInput, accessToken);
          // console.log('[Mutation.createOrganization] successfully created:', newOrgRecord.id);

          inngest.send({ 
            name: 'crm/organization.created',
            data: { organization: newOrgRecord as any },
            user: { id: userId, email: context.currentUser!.email! }
          }).catch((err: unknown) => console.error('Failed to send organization.created event to Inngest:', err));
          
          return {
            id: newOrgRecord.id,
            created_at: newOrgRecord.created_at,
            updated_at: newOrgRecord.updated_at,
            user_id: newOrgRecord.user_id,
            name: newOrgRecord.name,
            address: newOrgRecord.address,
            notes: newOrgRecord.notes,
            db_custom_field_values: (newOrgRecord as any).custom_field_values,
          } as any;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    updateOrganization: async (_parent, args, context) => {
      // console.log('[Mutation.updateOrganization] received id:', args.id, 'input:', args.input);
      const action = 'updating organization';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;
          
          const validatedInput = OrganizationInputSchema.partial().parse(args.input);
          // console.log('[Mutation.updateOrganization] validated input:', validatedInput);
          
          if (!context.userPermissions?.includes('organization:update_any')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          const updatedOrgRecord = await organizationService.updateOrganization(userId, args.id, validatedInput, accessToken);
          // console.log('[Mutation.updateOrganization] successfully updated:', updatedOrgRecord.id);

          inngest.send({ 
            name: 'crm/organization.updated',
            data: { organization: updatedOrgRecord as any },
            user: { id: userId, email: context.currentUser!.email! }
          }).catch((err: unknown) => console.error('Failed to send organization.updated event to Inngest:', err));
          
          return {
            id: updatedOrgRecord.id,
            created_at: updatedOrgRecord.created_at,
            updated_at: updatedOrgRecord.updated_at,
            user_id: updatedOrgRecord.user_id,
            name: updatedOrgRecord.name,
            address: updatedOrgRecord.address,
            notes: updatedOrgRecord.notes,
            db_custom_field_values: (updatedOrgRecord as any).custom_field_values,
          } as any;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    deleteOrganization: async (_parent, args, context) => {
      // console.log('[Mutation.deleteOrganization] received id:', args.id);
      const action = 'deleting organization';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;
          
          if (!context.userPermissions?.includes('organization:delete_any')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          const success = await organizationService.deleteOrganization(userId, args.id, accessToken);
          // console.log('[Mutation.deleteOrganization] success status:', success);

          if (success) {
            inngest.send({ 
              name: 'crm/organization.deleted',
              data: { organizationId: args.id },
              user: { id: userId, email: context.currentUser!.email! }
            }).catch((err: unknown) => console.error('Failed to send organization.deleted event to Inngest:', err));
          }

          return success;
      } catch (error) {
          throw processZodError(error, action);
      }
    },

    // Account Management Mutations
    assignAccountManager: async (_parent, args, context) => {
      const action = 'assigning account manager';
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        
        // Check permissions
        if (!context.userPermissions?.includes('organization:assign_account_manager')) {
          throw new GraphQLError('Insufficient permissions to assign account manager', { 
            extensions: { code: 'FORBIDDEN' } 
          });
        }
        
        const { getAuthenticatedClient } = require('../../../../../lib/serviceUtils');
        const supabase = getAuthenticatedClient(accessToken);
        
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
        throw processZodError(error, action);
      }
    },

    removeAccountManager: async (_parent, args, context) => {
      const action = 'removing account manager';
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        
        // Check permissions
        if (!context.userPermissions?.includes('organization:assign_account_manager')) {
          throw new GraphQLError('Insufficient permissions to remove account manager', { 
            extensions: { code: 'FORBIDDEN' } 
          });
        }
        
        const { getAuthenticatedClient } = require('../../../../../lib/serviceUtils');
        const supabase = getAuthenticatedClient(accessToken);
        
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
        throw processZodError(error, action);
      }
    },
}; 