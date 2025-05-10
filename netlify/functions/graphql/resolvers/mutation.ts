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
} from '../validators';
import { inngest } from '../../inngest';
import { personService } from '../../../../lib/personService';
import { organizationService } from '../../../../lib/organizationService';
import { dealService } from '../../../../lib/dealService';
import * as pipelineService from '../../../../lib/pipelineService';
import * as stageService from '../../../../lib/stageService';
import type { 
    // Person
    MutationCreatePersonArgs, 
    Person, 
    MutationUpdatePersonArgs,
    // Organization
    MutationCreateOrganizationArgs,
    Organization, 
    MutationUpdateOrganizationArgs,
    // Deal
    MutationCreateDealArgs,
    Deal, 
    MutationUpdateDealArgs,
    // Pipeline
    MutationCreatePipelineArgs,
    Pipeline, 
    MutationUpdatePipelineArgs,
    // Stage
    MutationCreateStageArgs,
    Stage, 
    MutationUpdateStageArgs
} from '../../../../frontend/src/generated/graphql/graphql.js' with { "resolution-mode": "import" };

export const Mutation = {
    // --- Person Mutations (formerly Contact) ---
    createPerson: async (_parent: unknown, args: MutationCreatePersonArgs, context: GraphQLContext): Promise<Person> => {
      console.log('[Mutation.createPerson] received input:', args.input);
      const action = 'creating person';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context);
          if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

          const validatedInput = PersonCreateSchema.parse(args.input);
          console.log('[Mutation.createPerson] validated input:', validatedInput);

          if (!context.userPermissions?.includes('person:create')) {
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }

          const newPerson = await personService.createPerson(userId, validatedInput, accessToken);
          console.log('[Mutation.createPerson] successfully created:', newPerson.id);

          inngest.send({
            name: 'crm/person.created',
            data: { person: newPerson },
            user: { id: userId, email: context.currentUser!.email }
          }).catch((err: unknown) => console.error('Failed to send person.created event to Inngest:', err));
          
          return newPerson as Person; // Cast if PersonRecord is used internally
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    updatePerson: async (_parent: unknown, args: MutationUpdatePersonArgs, context: GraphQLContext): Promise<Person> => {
      console.log('[Mutation.updatePerson] received id:', args.id, 'input:', args.input);
      const action = 'updating person';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context);
          if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

          const validatedInput = PersonUpdateSchema.parse(args.input);
          console.log('[Mutation.updatePerson] validated input:', validatedInput);
          
          if (!context.userPermissions?.includes('person:update_any')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          if (Object.keys(validatedInput).length === 0) {
             throw new GraphQLError('Update input cannot be empty.', { extensions: { code: 'BAD_USER_INPUT' } });
          }

          const updatedPerson = await personService.updatePerson(userId, args.id, validatedInput, accessToken);
          console.log('[Mutation.updatePerson] successfully updated:', updatedPerson.id);

          inngest.send({ 
            name: 'crm/person.updated',
            data: { person: updatedPerson },
            user: { id: userId, email: context.currentUser!.email }
          }).catch((err: unknown) => console.error('Failed to send person.updated event to Inngest:', err));
          
          return updatedPerson as Person;
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
          
          if (!context.userPermissions?.includes('person:delete_any')) {
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          const success = await personService.deletePerson(userId, id, accessToken);
          console.log('[Mutation.deletePerson] success status:', success);
          
          if (success) {
            inngest.send({ 
              name: 'crm/person.deleted',
              data: { personId: id },
              user: { id: userId, email: context.currentUser!.email }
            }).catch((err: unknown) => console.error('Failed to send person.deleted event to Inngest:', err));
          }
          
          return success;
      } catch (error) {
          throw processZodError(error, action);
      }
    },

    // --- Organization Mutations ---
    createOrganization: async (_parent: unknown, args: MutationCreateOrganizationArgs, context: GraphQLContext): Promise<Organization> => {
      console.log('[Mutation.createOrganization] received input:', args.input);
      const action = 'creating organization';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context);
          if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

          const validatedInput = OrganizationInputSchema.parse(args.input);
          console.log('[Mutation.createOrganization] validated input:', validatedInput);

          if (!context.userPermissions?.includes('organization:create')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }

          const newOrganization = await organizationService.createOrganization(userId, validatedInput, accessToken);
          console.log('[Mutation.createOrganization] successfully created:', newOrganization.id);

          inngest.send({ 
            name: 'crm/organization.created',
            data: { organization: newOrganization },
            user: { id: userId, email: context.currentUser!.email }
          }).catch((err: unknown) => console.error('Failed to send organization.created event to Inngest:', err));
          
          return newOrganization as Organization;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    updateOrganization: async (_parent: unknown, args: MutationUpdateOrganizationArgs, context: GraphQLContext): Promise<Organization> => {
      console.log('[Mutation.updateOrganization] received id:', args.id, 'input:', args.input);
      const action = 'updating organization';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context);
          if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
          
          const validatedInput = OrganizationInputSchema.partial().parse(args.input);
          console.log('[Mutation.updateOrganization] validated input:', validatedInput);
          
          if (!context.userPermissions?.includes('organization:update_any')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          const updatedOrganization = await organizationService.updateOrganization(userId, args.id, validatedInput, accessToken);
          console.log('[Mutation.updateOrganization] successfully updated:', updatedOrganization.id);

          inngest.send({ 
            name: 'crm/organization.updated',
            data: { organization: updatedOrganization },
            user: { id: userId, email: context.currentUser!.email }
          }).catch((err: unknown) => console.error('Failed to send organization.updated event to Inngest:', err));
          
          return updatedOrganization as Organization;
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
          
          if (!context.userPermissions?.includes('organization:delete_any')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          const success = await organizationService.deleteOrganization(userId, id, accessToken);
          console.log('[Mutation.deleteOrganization] success status:', success);

          if (success) {
            inngest.send({ 
              name: 'crm/organization.deleted',
              data: { organizationId: id },
              user: { id: userId, email: context.currentUser!.email }
            }).catch((err: unknown) => console.error('Failed to send organization.deleted event to Inngest:', err));
          }

          return success;
      } catch (error) {
          throw processZodError(error, action);
      }
    },

    // --- Deal Mutations ---
    createDeal: async (_parent: unknown, args: MutationCreateDealArgs, context: GraphQLContext): Promise<Deal> => {
      const action = 'creating deal';
      try {
          requireAuthentication(context);
          const accessToken = getAccessToken(context)!;
          const validatedInput = DealCreateSchema.parse(args.input);
          if (!context.userPermissions?.includes('deal:create')) {
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          const newDeal = await dealService.createDeal(context.currentUser!.id, validatedInput, accessToken);
          
          inngest.send({
            name: 'crm/deal.created',
            data: { deal: newDeal },
            user: { id: context.currentUser!.id, email: context.currentUser!.email }
          }).catch((err: unknown) => console.error('Failed to send deal.created event to Inngest:', err));

          return newDeal as Deal;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    updateDeal: async (_parent: unknown, args: MutationUpdateDealArgs, context: GraphQLContext): Promise<Deal> => {
      const action = `updating deal ${args.id}`;
      try {
          requireAuthentication(context);
          const accessToken = getAccessToken(context)!;
          const validatedInput = DealUpdateSchema.parse(args.input);
          
          if (!context.userPermissions?.includes('deal:update_any')) { // Simplified permission check
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
           if (Object.keys(validatedInput).length === 0) {
             throw new GraphQLError('Update input cannot be empty.', { extensions: { code: 'BAD_USER_INPUT' } });
          }

          const updatedDeal = await dealService.updateDeal(context.currentUser!.id, args.id, validatedInput, accessToken);

          inngest.send({
            name: 'crm/deal.updated',
            data: { deal: updatedDeal },
            user: { id: context.currentUser!.id, email: context.currentUser!.email }
          }).catch((err: unknown) => console.error('Failed to send deal.updated event to Inngest:', err));

          return updatedDeal as Deal;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    deleteDeal: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
      const action = `deleting deal ${id}`;
      try {
          requireAuthentication(context);
          const accessToken = getAccessToken(context)!;
          if (!context.userPermissions?.includes('deal:delete_any')) { // Simplified permission check
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          const success = await dealService.deleteDeal(context.currentUser!.id, id, accessToken);
          if (success) {
            inngest.send({
              name: 'crm/deal.deleted',
              data: { dealId: id },
              user: { id: context.currentUser!.id, email: context.currentUser!.email }
            }).catch((err: unknown) => console.error('Failed to send deal.deleted event to Inngest:', err));
          }
          return success;
      } catch (error) {
          throw processZodError(error, action);
      }
    },

    // --- Pipeline Mutations ---
    createPipeline: async (_parent: unknown, args: MutationCreatePipelineArgs, context: GraphQLContext): Promise<Pipeline> => {
      const action = 'creating pipeline';
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const validatedInput = PipelineInputSchema.parse(args.input);

        if (!context.userPermissions?.includes('pipeline:create')) {
          throw new GraphQLError('Forbidden: Missing permission to create pipeline', { extensions: { code: 'FORBIDDEN' } });
        }
        
        const newPipeline = await pipelineService.createPipeline(accessToken, validatedInput);
        return newPipeline as Pipeline;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    updatePipeline: async (_parent: unknown, args: MutationUpdatePipelineArgs, context: GraphQLContext): Promise<Pipeline> => {
      const action = `updating pipeline ${args.id}`;
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const validatedInput = PipelineInputSchema.parse(args.input); // Ensure it's a partial update or adjust schema

         if (!context.userPermissions?.includes('pipeline:update_any')) {
          throw new GraphQLError('Forbidden: Missing permission to update pipeline', { extensions: { code: 'FORBIDDEN' } });
        }
        if (Object.keys(validatedInput).length === 0) {
            throw new GraphQLError('Update input cannot be empty.', { extensions: { code: 'BAD_USER_INPUT' } });
        }

        const updatedPipeline = await pipelineService.updatePipeline(accessToken, args.id, validatedInput);
        return updatedPipeline as Pipeline;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    deletePipeline: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
      const action = `deleting pipeline ${id}`;
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;

        if (!context.userPermissions?.includes('pipeline:delete_any')) {
          throw new GraphQLError('Forbidden: Missing permission to delete pipeline', { extensions: { code: 'FORBIDDEN' } });
        }
        // Add check: cannot delete if pipeline has stages (unless cascade is handled)
        // This logic might be better in the service layer. For now, let service handle it.
        
        return await pipelineService.deletePipeline(accessToken, id);
      } catch (error) {
        throw processZodError(error, action);
      }
    },

    // --- Stage Mutations ---
    createStage: async (_parent: unknown, args: MutationCreateStageArgs, context: GraphQLContext): Promise<Stage> => {
      const action = 'creating stage';
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const validatedInput = StageCreateSchema.parse(args.input);

        if (!context.userPermissions?.includes('stage:create')) {
            throw new GraphQLError('Forbidden: Missing permission to create stage', { extensions: { code: 'FORBIDDEN' } });
        }
        
        const newStage = await stageService.createStage(accessToken, validatedInput);
        return newStage as Stage;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    updateStage: async (_parent: unknown, args: MutationUpdateStageArgs, context: GraphQLContext): Promise<Stage> => {
      const action = `updating stage ${args.id}`;
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const validatedInput = StageUpdateSchema.parse(args.input);

        if (!context.userPermissions?.includes('stage:update_any')) {
            throw new GraphQLError('Forbidden: Missing permission to update stage', { extensions: { code: 'FORBIDDEN' } });
        }
         if (Object.keys(validatedInput).length === 0) {
            throw new GraphQLError('Update input cannot be empty.', { extensions: { code: 'BAD_USER_INPUT' } });
        }
        
        const updatedStage = await stageService.updateStage(accessToken, args.id, validatedInput);
        return updatedStage as Stage;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    deleteStage: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
      const action = `deleting stage ${id}`;
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;

        if (!context.userPermissions?.includes('stage:delete_any')) {
            throw new GraphQLError('Forbidden: Missing permission to delete stage', { extensions: { code: 'FORBIDDEN' } });
        }

        return await stageService.deleteStage(accessToken, id);
      } catch (error) {
        throw processZodError(error, action);
      }
    },
}; 