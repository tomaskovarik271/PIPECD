// Resolvers for Mutation operations
import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError } from '../helpers';
import { 
  PersonCreateSchema, 
  PersonUpdateSchema, 
  OrganizationInputSchema,
  DealCreateSchema,
  DealUpdateSchema,
  PipelineInputSchema,
  StageCreateSchema,
  StageUpdateSchema,
  CreateActivityInputSchema,
  UpdateActivityInputSchema
} from '../validators';
import { inngest } from '../../inngest';
import { personService } from '../../../../lib/personService';
import { organizationService } from '../../../../lib/organizationService';
import { dealService } from '../../../../lib/dealService';
import * as pipelineService from '../../../../lib/pipelineService';
import * as stageService from '../../../../lib/stageService';

export const Mutation = {
    // --- Person Mutations (formerly Contact) ---
    createPerson: async (_parent: unknown, args: { input: any }, context: GraphQLContext): Promise<any> => {
      console.log('[Mutation.createPerson] received input:', args.input);
      const action = 'creating person';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context);
          if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

          // Validate input using Zod
          const validatedInput = PersonCreateSchema.parse(args.input);
          console.log('[Mutation.createPerson] validated input:', validatedInput);

          // Check permission - Assuming 'person:create' exists
          if (!context.userPermissions?.includes('person:create')) {
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }

          // Call service with validated input
          const newPerson = await personService.createPerson(userId, validatedInput, accessToken);
          console.log('[Mutation.createPerson] successfully created:', newPerson.id);

          // Send event to Inngest
          inngest.send({
            name: 'crm/person.created',
            data: { person: newPerson },
            user: { id: userId, email: context.currentUser!.email }
          }).catch((err: any) => console.error('Failed to send person.created event to Inngest:', err));
          
          return newPerson;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    updatePerson: async (_parent: unknown, args: { id: string; input: any }, context: GraphQLContext): Promise<any> => {
      console.log('[Mutation.updatePerson] received id:', args.id, 'input:', args.input);
      const action = 'updating person';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context);
          if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

          // Validate input using Zod (using partial schema for updates)
          const validatedInput = PersonUpdateSchema.parse(args.input);
          console.log('[Mutation.updatePerson] validated input:', validatedInput);
          
          // Check permission - Assuming 'person:update_any' permission for simplicity now
          // More granular checks (update_own) would require checking ownership via service layer
          if (!context.userPermissions?.includes('person:update_any')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          // Ensure at least one field is provided for update (after parsing)
          if (Object.keys(validatedInput).length === 0) {
             throw new GraphQLError('Update input cannot be empty.', { extensions: { code: 'BAD_USER_INPUT' } });
          }

          // Call service with validated input
          const updatedPerson = await personService.updatePerson(userId, args.id, validatedInput, accessToken);
          console.log('[Mutation.updatePerson] successfully updated:', updatedPerson.id);

          // Send event to Inngest
          inngest.send({ 
            name: 'crm/person.updated',
            data: { person: updatedPerson },
            user: { id: userId, email: context.currentUser!.email }
          }).catch((err: any) => console.error('Failed to send person.updated event to Inngest:', err));
          
          return updatedPerson;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    deletePerson: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
      console.log('[Mutation.deletePerson] received id:', id);
      const action = 'deleting person';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context);
          if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
          
          // Check permission - Assuming 'person:delete_any'
          if (!context.userPermissions?.includes('person:delete_any')) {
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          // ID itself is validated by GraphQL schema type ID!
          
          const success = await personService.deletePerson(userId, id, accessToken);
          console.log('[Mutation.deletePerson] success status:', success);
          
          // Send event to Inngest
          if (success) {
            inngest.send({ 
              name: 'crm/person.deleted',
              data: { personId: id },
              user: { id: userId, email: context.currentUser!.email }
            }).catch((err: any) => console.error('Failed to send person.deleted event to Inngest:', err));
          }
          
          return success;
      } catch (error) {
          throw processZodError(error, action);
      }
    },

    // --- Organization Mutations ---
    createOrganization: async (_parent: unknown, args: { input: any }, context: GraphQLContext): Promise<any> => {
      console.log('[Mutation.createOrganization] received input:', args.input);
      const action = 'creating organization'; // Action context for error handling
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context);
          if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

          // Validate input using Zod
          const validatedInput = OrganizationInputSchema.parse(args.input);
          console.log('[Mutation.createOrganization] validated input:', validatedInput);

          // Check permission - Assuming 'organization:create'
          if (!context.userPermissions?.includes('organization:create')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }

          // Call service with validated input
          const newOrganization = await organizationService.createOrganization(userId, validatedInput, accessToken);
          console.log('[Mutation.createOrganization] successfully created:', newOrganization.id);

          // Send event to Inngest (fire and forget)
          inngest.send({ 
            name: 'crm/organization.created',
            data: { organization: newOrganization },
            user: { id: userId, email: context.currentUser!.email } // Send user info too
          }).catch((err: any) => console.error('Failed to send organization.created event to Inngest:', err));
          
          return newOrganization;
      } catch (error) {
          // Process Zod errors or other errors into a GraphQLError
          throw processZodError(error, action);
      }
    },
    updateOrganization: async (_parent: unknown, args: { id: string; input: any }, context: GraphQLContext): Promise<any> => {
      console.log('[Mutation.updateOrganization] received id:', args.id, 'input:', args.input);
      const action = 'updating organization';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context);
          if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
          
          // Validate input using Zod (using partial schema for updates)
          const validatedInput = OrganizationInputSchema.partial().parse(args.input);
          console.log('[Mutation.updateOrganization] validated input:', validatedInput);
          
          // Check permission - Assuming 'organization:update_any'
          if (!context.userPermissions?.includes('organization:update_any')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          // Call service with validated input
          const updatedOrganization = await organizationService.updateOrganization(userId, args.id, validatedInput, accessToken);
          console.log('[Mutation.updateOrganization] successfully updated:', updatedOrganization.id);

          // Send event to Inngest (fire and forget)
          inngest.send({ 
            name: 'crm/organization.updated',
            data: { organization: updatedOrganization },
            user: { id: userId, email: context.currentUser!.email }
          }).catch((err: any) => console.error('Failed to send organization.updated event to Inngest:', err));
          
          return updatedOrganization;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    deleteOrganization: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
      console.log('[Mutation.deleteOrganization] received id:', id);
      const action = 'deleting organization';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context);
          if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
          
          // Check permission - Assuming 'organization:delete_any'
          if (!context.userPermissions?.includes('organization:delete_any')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          // ID itself is validated by GraphQL schema type ID! (which maps to string)
          // No specific Zod validation needed for just the ID here
          
          const success = await organizationService.deleteOrganization(userId, id, accessToken);
          console.log('[Mutation.deleteOrganization] success status:', success);

          // Send event to Inngest (fire and forget)
          if (success) {
            inngest.send({ 
              name: 'crm/organization.deleted',
              data: { organizationId: id },
              user: { id: userId, email: context.currentUser!.email }
            }).catch((err: any) => console.error('Failed to send organization.deleted event to Inngest:', err));
          }

          return success;
      } catch (error) {
          throw processZodError(error, action);
      }
    },

     // --- Deal Mutations ---
    createDeal: async (_parent: unknown, args: { input: any }, context: GraphQLContext): Promise<any> => {
      const action = 'creating deal';
      try {
          requireAuthentication(context); // Check auth first
          const accessToken = getAccessToken(context)!; // Then get token
          // Validate input using Zod
          const validatedInput = DealCreateSchema.parse(args.input);
          // Check permission - 'deal:create' 
          // RLS also enforces ownership on insert via user_id match
          if (!context.userPermissions?.includes('deal:create')) {
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          // Call service with validated input
          const newDeal = await dealService.createDeal(context.currentUser!.id, validatedInput, accessToken);
          // Send event (consider adding stage_id?)
          inngest.send({
            name: 'crm/deal.created',
            data: { deal: newDeal },
            user: { id: context.currentUser!.id, email: context.currentUser!.email }
          }).catch((err: any) => console.error('Failed to send deal.created event to Inngest:', err));
          return newDeal;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    updateDeal: async (_parent: unknown, args: { id: string; input: any }, context: GraphQLContext): Promise<any> => {
      const action = 'updating deal';
      try {
          requireAuthentication(context); // Check auth first
          const accessToken = getAccessToken(context)!; // Then get token
          // Validate input using Zod
          const validatedInput = DealUpdateSchema.parse(args.input);
          // Permission check - RLS will handle 'update_own' vs 'update_any'
          // We just need to check if the user has *either* permission at the API level.
          if (!context.userPermissions?.includes('deal:update_own') && !context.userPermissions?.includes('deal:update_any')) {
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          // Ensure at least one field is provided
          if (Object.keys(validatedInput).length === 0) {
             throw new GraphQLError('Update input cannot be empty.', { extensions: { code: 'BAD_USER_INPUT' } });
          }
          // RLS in the service/DB layer will enforce ownership if only 'update_own' is present.
          const updatedDeal = await dealService.updateDeal(context.currentUser!.id, args.id, validatedInput, accessToken);
          // Send event (consider adding stage_id?)
          inngest.send({
            name: 'crm/deal.updated',
            data: { deal: updatedDeal },
            user: { id: context.currentUser!.id, email: context.currentUser!.email }
          }).catch((err: any) => console.error('Failed to send deal.updated event to Inngest:', err));
          return updatedDeal;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    deleteDeal: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
      console.log('[Mutation.deleteDeal] received id:', id);
      const action = 'deleting deal';
      try {
        requireAuthentication(context);
        const userId = context.currentUser!.id;
        const accessToken = getAccessToken(context);
        if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

        // Check permission - RLS will handle 'delete_own' vs 'delete_any'
        if (!context.userPermissions?.includes('deal:delete_own') && !context.userPermissions?.includes('deal:delete_any')) {
            throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
        }

        // ID itself is validated by GraphQL schema type ID!

        const success = await dealService.deleteDeal(userId, id, accessToken);
        console.log('[Mutation.deleteDeal] success status:', success);

        // Send event to Inngest
        if (success) {
          inngest.send({ 
            name: 'crm/deal.deleted',
            data: { dealId: id },
            user: { id: userId, email: context.currentUser!.email }
          }).catch((err: any) => console.error('Failed to send deal.deleted event to Inngest:', err));
        }

        return success;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    // Pipeline Mutations
    createPipeline: async (_parent: unknown, { input }: { input: pipelineService.CreatePipelineInput }, context: GraphQLContext) => {
        const action = 'creating pipeline';
        try {
            requireAuthentication(context); // Check auth first
            const accessToken = context.token!;
            // Permission Check (Admin Only)
            if (!context.userPermissions?.includes('pipeline:create')) {
                throw new GraphQLError('Forbidden: Only admins can create pipelines', { extensions: { code: 'FORBIDDEN' } });
            }
            const validatedInput = PipelineInputSchema.parse(input);
            const pipeline = await pipelineService.createPipeline(accessToken, validatedInput);
            return pipeline;
        } catch (error) { throw processZodError(error, action); }
    },
    updatePipeline: async (_parent: unknown, { id, input }: { id: string; input: pipelineService.UpdatePipelineInput }, context: GraphQLContext) => {
        const action = 'updating pipeline';
        try {
            requireAuthentication(context);
            const accessToken = context.token!;
            // Permission Check (Admin Only)
            if (!context.userPermissions?.includes('pipeline:update_any')) {
                 throw new GraphQLError('Forbidden: Only admins can update pipelines', { extensions: { code: 'FORBIDDEN' } });
            }
            const validatedInput = PipelineInputSchema.parse(input);
            const pipeline = await pipelineService.updatePipeline(accessToken, id, validatedInput);
            return pipeline;
        } catch (error) { throw processZodError(error, action); }
    },
    deletePipeline: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
        const action = 'deleting pipeline';
        try {
            requireAuthentication(context);
            const accessToken = context.token!;
            // Permission Check (Admin Only)
            if (!context.userPermissions?.includes('pipeline:delete_any')) {
                 throw new GraphQLError('Forbidden: Only admins can delete pipelines', { extensions: { code: 'FORBIDDEN' } });
            }
            const success = await pipelineService.deletePipeline(accessToken, id);
            return success;
        } catch (error) { throw processZodError(error, action); }
    },
     // Stage Mutations
    createStage: async (_parent: unknown, { input }: { input: stageService.CreateStageInput }, context: GraphQLContext) => {
        const action = 'creating stage';
        try {
            requireAuthentication(context);
            const accessToken = context.token!;
            // Permission Check (Admin Only)
             if (!context.userPermissions?.includes('stage:create')) {
                 throw new GraphQLError('Forbidden: Only admins can create stages', { extensions: { code: 'FORBIDDEN' } });
            }
            const validatedInput = StageCreateSchema.parse(input);
            // Check pipeline access *before* creating stage
            const pipeline = await pipelineService.getPipelineById(accessToken, validatedInput.pipeline_id);
            if (!pipeline) {
                 throw new GraphQLError(`Pipeline with id ${validatedInput.pipeline_id} not found or not accessible.`, { extensions: { code: 'BAD_USER_INPUT' } });
            }
            const stage = await stageService.createStage(accessToken, validatedInput);
            return stage;
        } catch (error) { throw processZodError(error, action); }
    },
    updateStage: async (_parent: unknown, { id, input }: { id: string; input: stageService.UpdateStageInput }, context: GraphQLContext) => {
        const action = 'updating stage';
        try {
            requireAuthentication(context);
            const accessToken = context.token!;
            // Permission Check (Admin Only)
             if (!context.userPermissions?.includes('stage:update_any')) {
                 throw new GraphQLError('Forbidden: Only admins can update stages', { extensions: { code: 'FORBIDDEN' } });
            }
            const validatedInput = StageUpdateSchema.parse(input);
            // We might want to check if the stage exists and belongs to the user first?
            // stageService.updateStage should handle this via RLS check based on pipeline ownership implicitly
            const stage = await stageService.updateStage(accessToken, id, validatedInput);
            return stage;
        } catch (error) { throw processZodError(error, action); }
    },
    deleteStage: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
        const action = 'deleting stage';
        try {
            requireAuthentication(context);
            const accessToken = context.token!;
            // Permission Check (Admin Only)
             if (!context.userPermissions?.includes('stage:delete_any')) {
                 throw new GraphQLError('Forbidden: Only admins can delete stages', { extensions: { code: 'FORBIDDEN' } });
            }
            // We might want to check if the stage exists and belongs to the user first?
            // stageService.deleteStage should handle this via RLS check based on pipeline ownership implicitly
            const success = await stageService.deleteStage(accessToken, id);
            return success;
        } catch (error) { throw processZodError(error, action); }
    },
}; 