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

// Import generated types from backend codegen
import type { 
    MutationResolvers,
    Person as GraphQLPerson,
    Organization as GraphQLOrganization,
    Deal as GraphQLDeal,
    Pipeline as GraphQLPipeline,
    Stage as GraphQLStage
    // Argument types (e.g., MutationCreatePersonArgs) are inferred by MutationResolvers for args and args.input
} from '../../../../lib/generated/graphql';

// REMOVE: Old frontend type imports
// import type { 
// // ... (old types) ...
// } from '../../../../frontend/src/generated/graphql/graphql.js' with { "resolution-mode": "import" };

export const Mutation: MutationResolvers<GraphQLContext> = {
    // --- Person Mutations (formerly Contact) ---
    createPerson: async (_parent, args, context) => {
      console.log('[Mutation.createPerson] received input:', args.input);
      const action = 'creating person';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;

          const validatedInput = PersonCreateSchema.parse(args.input);
          console.log('[Mutation.createPerson] validated input:', validatedInput);

          if (!context.userPermissions?.includes('person:create')) {
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }

          const newPersonRecord = await personService.createPerson(userId, validatedInput, accessToken);
          console.log('[Mutation.createPerson] successfully created:', newPersonRecord.id);

          inngest.send({
            name: 'crm/person.created',
            data: { person: newPersonRecord as any }, // Inngest might not know specific record/GraphQL type
            user: { id: userId, email: context.currentUser!.email! }
          }).catch((err: unknown) => console.error('Failed to send person.created event to Inngest:', err));
          
          // Map PersonRecord to GraphQLPerson
          return {
            id: newPersonRecord.id,
            created_at: newPersonRecord.created_at,
            updated_at: newPersonRecord.updated_at,
            user_id: newPersonRecord.user_id,
            first_name: newPersonRecord.first_name,
            last_name: newPersonRecord.last_name,
            email: newPersonRecord.email,
            phone: newPersonRecord.phone,
            notes: newPersonRecord.notes,
            organization_id: newPersonRecord.organization_id,
          } as GraphQLPerson;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    updatePerson: async (_parent, args, context) => {
      console.log('[Mutation.updatePerson] received id:', args.id, 'input:', args.input);
      const action = 'updating person';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;

          const validatedInput = PersonUpdateSchema.parse(args.input);
          console.log('[Mutation.updatePerson] validated input:', validatedInput);
          
          if (!context.userPermissions?.includes('person:update_any')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          if (Object.keys(validatedInput).length === 0) {
             throw new GraphQLError('Update input cannot be empty.', { extensions: { code: 'BAD_USER_INPUT' } });
          }

          const updatedPersonRecord = await personService.updatePerson(userId, args.id, validatedInput, accessToken);
          console.log('[Mutation.updatePerson] successfully updated:', updatedPersonRecord.id);

          inngest.send({ 
            name: 'crm/person.updated',
            data: { person: updatedPersonRecord as any },
            user: { id: userId, email: context.currentUser!.email! }
          }).catch((err: unknown) => console.error('Failed to send person.updated event to Inngest:', err));
          
          // Map PersonRecord to GraphQLPerson
          return {
            id: updatedPersonRecord.id,
            created_at: updatedPersonRecord.created_at,
            updated_at: updatedPersonRecord.updated_at,
            user_id: updatedPersonRecord.user_id,
            first_name: updatedPersonRecord.first_name,
            last_name: updatedPersonRecord.last_name,
            email: updatedPersonRecord.email,
            phone: updatedPersonRecord.phone,
            notes: updatedPersonRecord.notes,
            organization_id: updatedPersonRecord.organization_id,
          } as GraphQLPerson;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    deletePerson: async (_parent, args, context) => {
      console.log('[Mutation.deletePerson] received id:', args.id);
      const action = 'deleting person';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;
          
          if (!context.userPermissions?.includes('person:delete_any')) {
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          const success = await personService.deletePerson(userId, args.id, accessToken);
          console.log('[Mutation.deletePerson] success status:', success);
          
          if (success) {
            inngest.send({ 
              name: 'crm/person.deleted',
              data: { personId: args.id },
              user: { id: userId, email: context.currentUser!.email! }
            }).catch((err: unknown) => console.error('Failed to send person.deleted event to Inngest:', err));
          }
          
          return success;
      } catch (error) {
          throw processZodError(error, action);
      }
    },

    // --- Organization Mutations ---
    createOrganization: async (_parent, args, context) => {
      console.log('[Mutation.createOrganization] received input:', args.input);
      const action = 'creating organization';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;

          const validatedInput = OrganizationInputSchema.parse(args.input);
          console.log('[Mutation.createOrganization] validated input:', validatedInput);

          if (!context.userPermissions?.includes('organization:create')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }

          const newOrgRecord = await organizationService.createOrganization(userId, validatedInput, accessToken);
          console.log('[Mutation.createOrganization] successfully created:', newOrgRecord.id);

          inngest.send({ 
            name: 'crm/organization.created',
            data: { organization: newOrgRecord as any },
            user: { id: userId, email: context.currentUser!.email! }
          }).catch((err: unknown) => console.error('Failed to send organization.created event to Inngest:', err));
          
          // Map OrganizationRecord to GraphQLOrganization
          return {
            id: newOrgRecord.id,
            created_at: newOrgRecord.created_at,
            updated_at: newOrgRecord.updated_at,
            user_id: newOrgRecord.user_id,
            name: newOrgRecord.name,
            address: newOrgRecord.address,
            notes: newOrgRecord.notes,
          } as GraphQLOrganization;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    updateOrganization: async (_parent, args, context) => {
      console.log('[Mutation.updateOrganization] received id:', args.id, 'input:', args.input);
      const action = 'updating organization';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;
          
          const validatedInput = OrganizationInputSchema.partial().parse(args.input);
          console.log('[Mutation.updateOrganization] validated input:', validatedInput);
          
          if (!context.userPermissions?.includes('organization:update_any')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          const updatedOrgRecord = await organizationService.updateOrganization(userId, args.id, validatedInput, accessToken);
          console.log('[Mutation.updateOrganization] successfully updated:', updatedOrgRecord.id);

          inngest.send({ 
            name: 'crm/organization.updated',
            data: { organization: updatedOrgRecord as any },
            user: { id: userId, email: context.currentUser!.email! }
          }).catch((err: unknown) => console.error('Failed to send organization.updated event to Inngest:', err));
          
          // Map OrganizationRecord to GraphQLOrganization
          return {
            id: updatedOrgRecord.id,
            created_at: updatedOrgRecord.created_at,
            updated_at: updatedOrgRecord.updated_at,
            user_id: updatedOrgRecord.user_id,
            name: updatedOrgRecord.name,
            address: updatedOrgRecord.address,
            notes: updatedOrgRecord.notes,
          } as GraphQLOrganization;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    deleteOrganization: async (_parent, args, context) => {
      console.log('[Mutation.deleteOrganization] received id:', args.id);
      const action = 'deleting organization';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;
          
          if (!context.userPermissions?.includes('organization:delete_any')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          
          const success = await organizationService.deleteOrganization(userId, args.id, accessToken);
          console.log('[Mutation.deleteOrganization] success status:', success);

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

    // --- Deal Mutations ---
    createDeal: async (_parent, args, context) => {
      const action = 'creating deal';
      try {
          requireAuthentication(context);
          const accessToken = getAccessToken(context)!;
          const userId = context.currentUser!.id;
          const validatedInput = DealCreateSchema.parse(args.input);
          if (!context.userPermissions?.includes('deal:create')) {
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          const newDealRecord = await dealService.createDeal(userId, validatedInput, accessToken);
          
          inngest.send({
            name: 'crm/deal.created',
            data: { deal: newDealRecord as any },
            user: { id: userId, email: context.currentUser!.email! }
          }).catch((err: unknown) => console.error('Failed to send deal.created event to Inngest:', err));

          // Map DealRecord to GraphQLDeal
          return {
            id: newDealRecord.id,
            created_at: newDealRecord.created_at,
            updated_at: newDealRecord.updated_at,
            user_id: newDealRecord.user_id,
            name: newDealRecord.name!,
            amount: newDealRecord.amount,
            stage_id: newDealRecord.stage_id!,
            person_id: newDealRecord.person_id,
          } as GraphQLDeal;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    updateDeal: async (_parent, args, context) => {
      const action = `updating deal ${args.id}`;
      try {
          requireAuthentication(context);
          const accessToken = getAccessToken(context)!;
          const userId = context.currentUser!.id;
          const validatedInput = DealUpdateSchema.parse(args.input);
          
          if (!context.userPermissions?.includes('deal:update_any')) { // Assuming generic update perm for now
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }

          const updatedDealRecord = await dealService.updateDeal(userId, args.id, validatedInput, accessToken);

          inngest.send({
            name: 'crm/deal.updated',
            data: { deal: updatedDealRecord as any },
            user: { id: userId, email: context.currentUser!.email! }
          }).catch((err: unknown) => console.error('Failed to send deal.updated event to Inngest:', err));

          // Map DealRecord to GraphQLDeal
          return {
            id: updatedDealRecord.id,
            created_at: updatedDealRecord.created_at,
            updated_at: updatedDealRecord.updated_at,
            user_id: updatedDealRecord.user_id,
            name: updatedDealRecord.name!,
            amount: updatedDealRecord.amount,
            stage_id: updatedDealRecord.stage_id!,
            person_id: updatedDealRecord.person_id,
          } as GraphQLDeal;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    deleteDeal: async (_parent, args, context) => {
      const action = `deleting deal ${args.id}`;
      try {
          requireAuthentication(context);
          const accessToken = getAccessToken(context)!;
          const userId = context.currentUser!.id;
          if (!context.userPermissions?.includes('deal:delete_any')) { // Assuming generic delete perm
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          const success = await dealService.deleteDeal(userId, args.id, accessToken);

          if (success) {
            inngest.send({
              name: 'crm/deal.deleted',
              data: { dealId: args.id },
              user: { id: userId, email: context.currentUser!.email! }
            }).catch((err: unknown) => console.error('Failed to send deal.deleted event to Inngest:', err));
          }
          return success;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    // --- Pipeline Mutations ---
    createPipeline: async (_parent, args, context) => {
      const action = 'creating pipeline';
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const validatedInput = PipelineInputSchema.parse(args.input);
        if (!context.userPermissions?.includes('pipeline:create')) {
                throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
        }
        const newPipeline = await pipelineService.createPipeline(accessToken, validatedInput);
            // Map Pipeline from lib/types to GraphQLPipeline
            return {
                id: newPipeline.id,
                user_id: newPipeline.user_id,
                name: newPipeline.name,
                created_at: newPipeline.created_at,
                updated_at: newPipeline.updated_at,
            } as GraphQLPipeline;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    updatePipeline: async (_parent, args, context) => {
      const action = `updating pipeline ${args.id}`;
      try {
        // --- START DEBUG LOGS ---
        console.log(`[Mutation.updatePipeline] Attempting to update pipeline ID: ${args.id}`);
        console.log(`[Mutation.updatePipeline] Input:`, args.input);
        console.log(`[Mutation.updatePipeline] Context User ID: ${context.currentUser?.id}`);
        console.log(`[Mutation.updatePipeline] User Permissions from context:`, context.userPermissions);
        // --- END DEBUG LOGS ---

        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;

        const validatedInput = PipelineInputSchema.parse(args.input);

         if (!context.userPermissions?.includes('pipeline:update_any')) {
          console.error(`[Mutation.updatePipeline] FORBIDDEN: User ${context.currentUser?.id} does NOT have 'pipeline:update_any' permission.`);
          throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
        }
        
        console.log(`[Mutation.updatePipeline] User ${context.currentUser?.id} HAS 'pipeline:update_any' permission. Proceeding with service call.`);
        const updatedPipeline = await pipelineService.updatePipeline(accessToken, args.id, validatedInput);
        
        return {
          id: updatedPipeline.id,
          name: updatedPipeline.name,
        } as GraphQLPipeline;
      } catch (error) {
        console.error(`[Mutation.updatePipeline] Error in resolver for pipeline ${args.id}:`, error);
        // Ensure processZodError is robust or temporarily log raw error for more details
        if (error instanceof GraphQLError && error.extensions?.code === 'FORBIDDEN') {
            throw error; // Re-throw if it's already the specific forbidden error
        }
        throw processZodError(error, action); // Or your existing error processing
      }
    },
    deletePipeline: async (_parent, args, context) => {
        const action = `deleting pipeline ${args.id}`;
      try {
        // --- START DEBUG LOGS ---
        console.log(`[Mutation.deletePipeline] Attempting to delete pipeline ID: ${args.id}`);
        console.log(`[Mutation.deletePipeline] Context User ID: ${context.currentUser?.id}`);
        console.log(`[Mutation.deletePipeline] User Permissions from context:`, context.userPermissions);
        // --- END DEBUG LOGS ---

        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;

        if (!context.userPermissions?.includes('pipeline:delete_any')) { // Changed from 'pipeline:delete' to 'pipeline:delete_any'
          console.error(`[Mutation.deletePipeline] FORBIDDEN: User ${context.currentUser?.id} does NOT have 'pipeline:delete_any' permission.`);
          throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
        }
        
        console.log(`[Mutation.deletePipeline] User ${context.currentUser?.id} HAS 'pipeline:delete_any' permission. Proceeding with service call.`);
        return await pipelineService.deletePipeline(accessToken, args.id);
      } catch (error) {
        console.error(`[Mutation.deletePipeline] Error in resolver for pipeline ${args.id}:`, error);
        if (error instanceof GraphQLError && error.extensions?.code === 'FORBIDDEN') {
            throw error; // Re-throw if it's already the specific forbidden error
        }
        throw processZodError(error, action);
      }
    },
    // --- Stage Mutations ---
    createStage: async (_parent, args, context) => {
      const action = 'creating stage';
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const validatedInput = StageCreateSchema.parse(args.input);
        if (!context.userPermissions?.includes('stage:create')) {
                throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
        }
        const newStage = await stageService.createStage(accessToken, validatedInput);
            // Map Stage from lib/types to GraphQLStage
            return {
                id: newStage.id,
                user_id: newStage.user_id,
                pipeline_id: newStage.pipeline_id,
                name: newStage.name,
                order: newStage.order,
                deal_probability: newStage.deal_probability,
                created_at: newStage.created_at,
                updated_at: newStage.updated_at,
            } as GraphQLStage;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    updateStage: async (_parent, args, context) => {
      const action = `updating stage ${args.id}`;
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const validatedInput = StageUpdateSchema.parse(args.input);
            if (!context.userPermissions?.includes('stage:update_any')) { // Assuming general update permission
                throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
        }
        const updatedStage = await stageService.updateStage(accessToken, args.id, validatedInput);
            // Map Stage from lib/types to GraphQLStage
            return {
                id: updatedStage.id,
                user_id: updatedStage.user_id,
                pipeline_id: updatedStage.pipeline_id,
                name: updatedStage.name,
                order: updatedStage.order,
                deal_probability: updatedStage.deal_probability,
                created_at: updatedStage.created_at,
                updated_at: updatedStage.updated_at,
            } as GraphQLStage;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    deleteStage: async (_parent, args, context) => {
        const action = `deleting stage ${args.id}`;
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
            if (!context.userPermissions?.includes('stage:delete_any')) { // Assuming general delete permission
                throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
        }
            return await stageService.deleteStage(accessToken, args.id);
      } catch (error) {
        throw processZodError(error, action);
      }
    },
}; 