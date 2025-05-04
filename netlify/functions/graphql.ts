import { createYoga, createSchema } from 'graphql-yoga';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import type { User } from '@supabase/supabase-js'; // Import User type
import { supabase } from '../../lib/supabaseClient'; // Import Supabase client
import { GraphQLError } from 'graphql'; // Import GraphQLError
import { personService } from '../../lib/personService'; // Import the person service
import { organizationService } from '../../lib/organizationService'; // Import the organization service
import { dealService } from '../../lib/dealService'; // Import the deal service
import { z, ZodError } from 'zod'; // Import Zod and ZodError
import { inngest } from './inngest'; // Import the Inngest client
import * as pipelineService from '../../lib/pipelineService';
import * as stageService from '../../lib/stageService';
import { GraphQLScalarType, Kind } from 'graphql';
import fs from 'fs'; // ADDED import
import path from 'path'; // ADDED import

// Define GraphQL types related to User
type GraphQLContext = {
  currentUser: User | null;
  request: Request; // Add the original request object to context for header access
  event: HandlerEvent;
  context: HandlerContext;
};

// Helper to get token from context (or request headers)
function getAccessToken(context: GraphQLContext): string | null {
  const authHeader = context.request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Helper function to process ZodErrors into GraphQLErrors
function processZodError(error: unknown, action: string): GraphQLError {
  if (error instanceof ZodError) {
    console.error(`Zod validation error during ${action}:`, error.errors);
    const message = error.errors.map(e => `${e.path.join('.') || 'input'}: ${e.message}`).join(', ');
    return new GraphQLError(`Validation Error: ${message}`, {
      extensions: {
        code: 'BAD_USER_INPUT',
        zodErrors: error.errors
      }
    });
  }

  if (error instanceof GraphQLError) {
    console.error(`GraphQLError during ${action}:`, error.message, error.extensions?.originalError);
    // Check if it's already the generic wrapper, if so, return it
    if (error.message.startsWith('An unexpected error occurred')) {
        return error;
    }
    // Otherwise, wrap it to ensure consistent structure?
    // Or just return? Let's return for now, assuming service errors are already well-formed.
    return error;
  }

  // Handle generic Errors or other unknown throwables
  console.error(`Unexpected error during ${action}:`, error);
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  // Ensure we ALWAYS return a GraphQLError
  return new GraphQLError(`An unexpected error occurred during ${action}.`, {
      extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          originalError: errorMessage
      }
  });
}

// Base schema for Person fields
const PersonBaseSchema = z.object({
  first_name: z.string().trim().min(1, { message: "First name cannot be empty if provided" }).optional().nullable(),
  last_name: z.string().trim().min(1, { message: "Last name cannot be empty if provided" }).optional().nullable(),
  email: z.string().trim().email({ message: "Invalid email address" }).optional().nullable(),
  phone: z.string().trim().optional().nullable(), // Add more specific phone validation if needed
  notes: z.string().trim().optional().nullable(),
  organization_id: z.string().uuid({ message: "Invalid Organization ID format" }).optional().nullable(),
});

// Schema for creating a Person (requires at least one identifier)
const PersonCreateSchema = PersonBaseSchema.refine(data => data.first_name || data.last_name || data.email, {
  message: "At least a first name, last name, or email is required",
  path: ["first_name"], // Assign error to a field for better client handling
});

// Schema for updating a Person (all fields optional, but check applied later)
const PersonUpdateSchema = PersonBaseSchema.partial();

// Zod schema for OrganizationInput validation
const OrganizationInputSchema = z.object({
    name: z.string().trim().min(1, { message: "Organization name cannot be empty" }),
    address: z.string().trim().optional().nullable(),
    notes: z.string().trim().optional().nullable(),
});

// Zod schema for Deal validation
const DealBaseSchema = z.object({
    name: z.string().trim().min(1, { message: "Deal name cannot be empty" }),
    stage_id: z.string().uuid({ message: "Invalid Stage ID format" }),
    amount: z.number().positive({ message: "Amount must be a positive number"}).optional().nullable(),
    person_id: z.string().uuid({ message: "Invalid Person ID format" }).optional().nullable(),
});

const DealCreateSchema = DealBaseSchema;
const DealUpdateSchema = DealBaseSchema.partial();

// Zod schema for PipelineInput validation
const PipelineInputSchema = z.object({
    name: z.string().trim().min(1, { message: "Pipeline name cannot be empty" }),
});

// Zod schema for StageInput validation
const StageBaseSchema = z.object({
    name: z.string().trim().min(1, { message: "Stage name cannot be empty" }),
    order: z.number().int().nonnegative({ message: "Order must be a non-negative integer"}),
    pipeline_id: z.string().uuid({ message: "Invalid Pipeline ID format" }),
    deal_probability: z.number().min(0).max(100, { message: "Probability must be between 0 and 100" }).optional().nullable(),
});

const StageCreateSchema = StageBaseSchema;
const StageUpdateSchema = StageBaseSchema.partial().omit({ pipeline_id: true });

// Placeholder service functions (REMOVED)
// const contactService = { ... };
// const dealService = { ... };

// --- Load Schema from Files ---
const loadTypeDefs = (): string => {
  // Construct path relative to project root instead of __dirname
  const schemaDir = path.join(process.cwd(), 'netlify/functions/graphql/schema');
  try {
    const files = fs.readdirSync(schemaDir);
    let typeDefs = '';
    files.forEach(file => {
      if (file.endsWith('.graphql')) {
        typeDefs += fs.readFileSync(path.join(schemaDir, file), 'utf-8') + '\n';
      }
    });
    return typeDefs;
  } catch (error: any) {
      console.error("Failed to load GraphQL schema files:", error);
      // Depending on how critical schema loading is, you might throw, 
      // return an empty string, or return a default minimal schema.
      // Throwing an error is probably best to prevent the server starting incorrectly.
      throw new Error(`Failed to load GraphQL schema files: ${error.message}`);
  }
};

const loadedTypeDefs = loadTypeDefs();

// Export context type for testing
export type { GraphQLContext };

// Define a type for the parent object in nested Deal resolvers
// Moved outside the resolvers object
type ParentDeal = {
  id: string;
  person_id?: string | null;
  stage_id?: string | null;
};

// Export resolvers for testing
export const resolvers = {
  Query: {
    health: () => 'Ok',
    supabaseConnectionTest: async () => {
      try {
        // Attempt a simple read operation (e.g., get session)
        // This doesn't require a specific table to exist yet.
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Supabase connection error:', error.message);
          // Don't expose detailed errors to the client
          return `Connection Error: ${error.message}`;
        }

        console.log('Supabase getSession data:', data); // Log session data (will likely be null)
        return 'Successfully connected to Supabase (getSession succeeded)';
      } catch (err: any) {
        console.error('Unexpected error during Supabase test:', err);
        return `Unexpected Error: ${err.message}`;
      }
    },
    // Resolver for the 'me' query
    me: (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      // Return minimal user info from context
      requireAuthentication(context); // Use helper
      // Now we know currentUser is not null due to requireAuthentication
      const currentUser = context.currentUser!;
      return {
        id: currentUser.id,
        email: currentUser.email,
        // Map other fields if needed
      };
    },

    // --- Person Resolvers ---
    people: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
      try {
        // Assuming personService handles filtering by user ID internally based on context/token
        return await personService.getPeople(context.currentUser!.id, accessToken);
      } catch (e) {
         throw processZodError(e, 'fetching people list');
      }
    },
    person: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
      try {
        return await personService.getPersonById(context.currentUser!.id, id, accessToken);
      } catch (e) {
         throw processZodError(e, 'fetching person by ID');
      }
    },
    personList: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
      try {
        const people = await personService.getPeople(context.currentUser!.id, accessToken); 
        // Map PersonRecord to PersonListItem
        return people.map(p => ({
            id: p.id,
            // Combine first and last name, handling nulls gracefully
            name: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || 'Unnamed Person'
        }));
      } catch (e) {
         throw processZodError(e, 'fetching person list for dropdown');
      }
    },

    // --- Organization Resolvers ---
    organizations: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
       requireAuthentication(context);
       const accessToken = getAccessToken(context);
       if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
       try {
         return await organizationService.getOrganizations(context.currentUser!.id, accessToken);
       } catch (e) {
          throw processZodError(e, 'fetching organizations list');
       }
    },
    organization: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
       requireAuthentication(context);
       const accessToken = getAccessToken(context);
       if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
       try {
          return await organizationService.getOrganizationById(context.currentUser!.id, id, accessToken);
       } catch (e) {
           throw processZodError(e, 'fetching organization by ID');
       }
    },

    // --- Deal Resolvers ---
    deals: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
       requireAuthentication(context);
       const accessToken = getAccessToken(context);
       if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
       try {
           return await dealService.getDeals(context.currentUser!.id, accessToken);
       } catch (e) {
           throw processZodError(e, 'fetching deals list');
       }
    },
    deal: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
       requireAuthentication(context);
       const accessToken = getAccessToken(context);
       if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
       try {
           return await dealService.getDealById(context.currentUser!.id, id, accessToken);
       } catch (e) {
           throw processZodError(e, 'fetching deal by ID');
       }
    },
    // Pipeline Resolvers
    pipelines: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
        const accessToken = requireAuthentication(context);
        try {
            return await pipelineService.getPipelines(accessToken);
        } catch (error) { throw processZodError(error, 'fetching pipelines'); }
    },
    // Stage Resolvers
    stages: async (_parent: unknown, { pipelineId }: { pipelineId: string }, context: GraphQLContext) => {
        const accessToken = requireAuthentication(context);
        if (!pipelineId) throw new GraphQLError("pipelineId is required", { extensions: { code: 'BAD_USER_INPUT' } });
        try {
            // Optional: Verify pipelineId belongs to user first?
            // The RLS policy on stages indirectly verifies this via user_id check on insert/update/delete
            // and the getStagesByPipeline service function filters by pipeline_id which is linked to user_id.
            // Adding an explicit check here might be redundant but could provide earlier feedback.
            // const pipeline = await pipelineService.getPipelineById(accessToken, pipelineId);
            // if (!pipeline) throw new GraphQLError("Pipeline not found or not accessible", { extensions: { code: 'NOT_FOUND' } });

            return await stageService.getStagesByPipeline(accessToken, pipelineId);
        } catch (error) { throw processZodError(error, 'fetching stages'); }
    },
  },

  Mutation: {
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

          // Call service with validated input
          const newPerson = await personService.createPerson(userId, validatedInput, accessToken);
          console.log('[Mutation.createPerson] successfully created:', newPerson.id);

          // Send event to Inngest
          inngest.send({
            name: 'crm/person.created',
            data: { person: newPerson },
            user: { id: userId, email: context.currentUser!.email }
          }).catch(err => console.error('Failed to send person.created event to Inngest:', err));
          
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
          
          // Ensure at least one field is provided for update (after parsing)
          if (Object.keys(validatedInput).length === 0) {
             throw new GraphQLError('No fields provided for update', { extensions: { code: 'BAD_USER_INPUT' } });
          }

          // Call service with validated input
          const updatedPerson = await personService.updatePerson(userId, args.id, validatedInput, accessToken);
          console.log('[Mutation.updatePerson] successfully updated:', updatedPerson.id);

          // Send event to Inngest
          inngest.send({ 
            name: 'crm/person.updated',
            data: { person: updatedPerson },
            user: { id: userId, email: context.currentUser!.email }
          }).catch(err => console.error('Failed to send person.updated event to Inngest:', err));
          
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
          
          // ID itself is validated by GraphQL schema type ID!
          
          const success = await personService.deletePerson(userId, id, accessToken);
          console.log('[Mutation.deletePerson] success status:', success);
          
          // Send event to Inngest
          if (success) {
            inngest.send({ 
              name: 'crm/person.deleted',
              data: { personId: id },
              user: { id: userId, email: context.currentUser!.email }
            }).catch(err => console.error('Failed to send person.deleted event to Inngest:', err));
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

          // Call service with validated input
          const newOrganization = await organizationService.createOrganization(userId, validatedInput, accessToken);
          console.log('[Mutation.createOrganization] successfully created:', newOrganization.id);

          // Send event to Inngest (fire and forget)
          inngest.send({ 
            name: 'crm/organization.created',
            data: { organization: newOrganization },
            user: { id: userId, email: context.currentUser!.email } // Send user info too
          }).catch(err => console.error('Failed to send organization.created event to Inngest:', err));
          
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
          
          // Call service with validated input
          const updatedOrganization = await organizationService.updateOrganization(userId, args.id, validatedInput, accessToken);
          console.log('[Mutation.updateOrganization] successfully updated:', updatedOrganization.id);

          // Send event to Inngest (fire and forget)
          inngest.send({ 
            name: 'crm/organization.updated',
            data: { organization: updatedOrganization },
            user: { id: userId, email: context.currentUser!.email }
          }).catch(err => console.error('Failed to send organization.updated event to Inngest:', err));
          
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
            }).catch(err => console.error('Failed to send organization.deleted event to Inngest:', err));
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
          const accessToken = requireAuthentication(context);
          // Validate input using Zod
          const validatedInput = DealCreateSchema.parse(args.input); // Uses updated schema
          // Call service with validated input
          const newDeal = await dealService.createDeal(context.currentUser!.id, validatedInput, accessToken);
          // Send event (consider adding stage_id?)
          inngest.send({
            name: 'crm/deal.created',
            data: { deal: newDeal },
            user: { id: context.currentUser!.id, email: context.currentUser!.email }
          }).catch(err => console.error('Failed to send deal.created event to Inngest:', err));
          return newDeal;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    updateDeal: async (_parent: unknown, args: { id: string; input: any }, context: GraphQLContext): Promise<any> => {
      const action = 'updating deal';
      try {
          const accessToken = requireAuthentication(context);
          // Validate input using Zod
          const validatedInput = DealUpdateSchema.parse(args.input); // Uses updated schema
          // Ensure at least one field is provided
          if (Object.keys(validatedInput).length === 0) {
             throw new GraphQLError('No fields provided for update', { extensions: { code: 'BAD_USER_INPUT' } });
          }
          // Call service with validated input
          const updatedDeal = await dealService.updateDeal(context.currentUser!.id, args.id, validatedInput, accessToken);
          // Send event (consider adding stage_id?)
          inngest.send({
            name: 'crm/deal.updated',
            data: { deal: updatedDeal },
            user: { id: context.currentUser!.id, email: context.currentUser!.email }
          }).catch(err => console.error('Failed to send deal.updated event to Inngest:', err));
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

        // ID itself is validated by GraphQL schema type ID!

        const success = await dealService.deleteDeal(userId, id, accessToken);
        console.log('[Mutation.deleteDeal] success status:', success);

        // Send event to Inngest
        if (success) {
          inngest.send({ 
            name: 'crm/deal.deleted',
            data: { dealId: id },
            user: { id: userId, email: context.currentUser!.email }
          }).catch(err => console.error('Failed to send deal.deleted event to Inngest:', err));
        }

        return success;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    // Pipeline Mutations
    createPipeline: async (_parent: unknown, { input }: { input: pipelineService.CreatePipelineInput }, context: GraphQLContext) => {
        const accessToken = requireAuthentication(context);
        const action = 'creating pipeline';
        try {
            const validatedInput = PipelineInputSchema.parse(input);
            const pipeline = await pipelineService.createPipeline(accessToken, validatedInput);
            // Optional: Inngest event?
            // await inngest.send({ name: 'crm/pipeline.created', data: { pipelineId: pipeline.id }, user: context.currentUser! });
            return pipeline;
        } catch (error) { throw processZodError(error, action); }
    },
    updatePipeline: async (_parent: unknown, { id, input }: { id: string; input: pipelineService.UpdatePipelineInput }, context: GraphQLContext) => {
        const accessToken = requireAuthentication(context);
        const action = 'updating pipeline';
        if (!input || Object.keys(input).length === 0) {
            throw new GraphQLError("Update input cannot be empty", { extensions: { code: 'BAD_USER_INPUT' } });
        }
        try {
            // Validate the input. PipelineInputSchema only has 'name', so it works for updates too.
            const validatedInput = PipelineInputSchema.parse(input);
            const pipeline = await pipelineService.updatePipeline(accessToken, id, validatedInput);
            // Optional: Inngest event?
            // await inngest.send({ name: 'crm/pipeline.updated', data: { pipelineId: id, changes: validatedInput }, user: context.currentUser! });
            return pipeline;
        } catch (error) { throw processZodError(error, action); }
    },
    deletePipeline: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
        const accessToken = requireAuthentication(context);
        const action = 'deleting pipeline';
        try {
            // Check for existing stages before deleting pipeline?
            // The ON DELETE CASCADE on stages.pipeline_id handles this in the DB.
            // If we wanted to prevent deletion if stages exist, we'd query stages first.
            // const stages = await stageService.getStagesByPipeline(accessToken, id);
            // if (stages && stages.length > 0) {
            //     throw new GraphQLError(`Cannot delete pipeline: Pipeline still contains ${stages.length} stage(s). Delete or move stages first.`, { extensions: { code: 'FAILED_PRECONDITION', reason: 'PIPELINE_NOT_EMPTY' } });
            // }
            const success = await pipelineService.deletePipeline(accessToken, id);
            // Optional: Inngest event?
            // if (success) {
            //     await inngest.send({ name: 'crm/pipeline.deleted', data: { pipelineId: id }, user: context.currentUser! });
            // }
            return success;
        } catch (error) { throw processZodError(error, action); }
    },
     // Stage Mutations
    createStage: async (_parent: unknown, { input }: { input: stageService.CreateStageInput }, context: GraphQLContext) => {
        const accessToken = requireAuthentication(context);
        const action = 'creating stage';
        try {
            const validatedInput = StageCreateSchema.parse(input);
            // Verify pipeline exists and belongs to user (RLS handles this implicitly on insert)
            // but checking explicitly gives better error message.
            const pipeline = await pipelineService.getPipelineById(accessToken, validatedInput.pipeline_id);
            if (!pipeline) {
                 throw new GraphQLError(`Pipeline with id ${validatedInput.pipeline_id} not found or not accessible.`, { extensions: { code: 'BAD_USER_INPUT' } });
            }
            const stage = await stageService.createStage(accessToken, validatedInput);
            // Optional: Inngest event?
            // await inngest.send({ name: 'crm/stage.created', data: { stageId: stage.id, pipelineId: stage.pipeline_id }, user: context.currentUser! });
            return stage;
        } catch (error) { throw processZodError(error, action); }
    },
    updateStage: async (_parent: unknown, { id, input }: { id: string; input: stageService.UpdateStageInput }, context: GraphQLContext) => {
        const accessToken = requireAuthentication(context);
        const action = 'updating stage';
        if (!input || Object.keys(input).length === 0) {
            throw new GraphQLError("Update input cannot be empty", { extensions: { code: 'BAD_USER_INPUT' } });
        }
        try {
            // Validate using the specific update schema
            const validatedInput = StageUpdateSchema.parse(input);
             // Check if stage exists and belongs to user (implicitly via RLS on update)
             // Optional: Explicit check first?
             // const existingStage = await stageService.getStageById(accessToken, id);
             // if (!existingStage) {
             //     throw new GraphQLError(`Stage with id ${id} not found or not accessible.`, { extensions: { code: 'NOT_FOUND' } });
             // }
            const stage = await stageService.updateStage(accessToken, id, validatedInput);
            // Optional: Inngest event?
            // await inngest.send({ name: 'crm/stage.updated', data: { stageId: id, changes: validatedInput }, user: context.currentUser! });
            return stage;
        } catch (error) { throw processZodError(error, action); }
    },
    deleteStage: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
        const accessToken = requireAuthentication(context);
        const action = 'deleting stage';
        try {
             // Check for existing deals in this stage before deleting?
             // DB constraint `ON DELETE SET NULL` on deals.stage_id handles this.
             // If we wanted to prevent deletion, we'd check deals first.
             // const dealsInStage = await dealService.getDealsByStageId(accessToken, id); // Need this service method
             // if (dealsInStage && dealsInStage.length > 0) {
             //      throw new GraphQLError(`Cannot delete stage: Stage still contains ${dealsInStage.length} deal(s). Move deals first.`, { extensions: { code: 'FAILED_PRECONDITION', reason: 'STAGE_NOT_EMPTY' } });
             // }
            const success = await stageService.deleteStage(accessToken, id);
            // Optional: Inngest event?
            // if (success) {
            //    await inngest.send({ name: 'crm/stage.deleted', data: { stageId: id }, user: context.currentUser! });
            // }
            return success;
        } catch (error) { throw processZodError(error, action); }
    },
  },
  
  // --- Add Resolver for Person type ---
  Person: {
    // Resolver for the nested 'organization' field within Person
    organization: async (parent: { organization_id?: string | null }, _args: unknown, context: GraphQLContext) => {
      requireAuthentication(context); // Added Auth Check
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

      if (!parent.organization_id) {
        return null;
      }
      try {
        // Fetch the organization using the organization_id from the parent Person object
        // Pass user context for RLS
        return await organizationService.getOrganizationById(context.currentUser!.id, parent.organization_id, accessToken);
      } catch (e) {
        // Don't throw here, just return null if org fetch fails (e.g., RLS denies)
        console.error('Error fetching Person.organization:', e);
        return null; 
        // Alternatively, re-throw using processServiceError if we want errors shown?
        // throw processServiceError(e, 'fetching Person.organization');
      }
    },
    // Placeholder for deals linked to a person (requires dealService update)
    deals: async (_parent: { id: string }, _args: unknown, context: GraphQLContext) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
       console.warn(`Resolver Person.deals not fully implemented - needs service update`);
       // TODO: Implement dealService.getDealsByPersonId(userId, personId, accessToken)
       // try {
       //   return await dealService.getDealsByPersonId(context.currentUser!.id, parent.id, accessToken);
       // } catch (e) {
       //   throw processServiceError(e, 'fetching Person.deals');
       // }
       return []; // Return empty array for now
    }
  },
  
  // Add resolver for nested Deal.person field
  Deal: {
    // Resolver for the 'person' field on Deal
    person: async (parent: ParentDeal, _args: unknown, context: GraphQLContext) => {
      if (!parent.person_id) return null;
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
      try {
         // Use personService to fetch the person
         return await personService.getPersonById(context.currentUser!.id, parent.person_id, accessToken);
      } catch (e) {
          console.error(`Error fetching person ${parent.person_id} for deal ${parent.id}:`, e);
          // Avoid throwing full error which might fail the whole deal query
          // Return null or a minimal error object if preferred
          return null; 
      }
    },
    // ADDED: Resolver for the 'stage' field on Deal
    stage: async (parent: ParentDeal, _args: unknown, context: GraphQLContext) => {
        if (!parent.stage_id) {
            // This shouldn't happen if stage_id is non-nullable in DB/schema
            console.error(`Deal ${parent.id} is missing stage_id.`);
            throw new GraphQLError('Internal Error: Deal is missing stage information.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        const accessToken = requireAuthentication(context); // Ensure user is authenticated
        try {
            // Assuming stageService has a method like getStageById
            // Note: Stage RLS might need checking if it's not implicitly handled by user_id on pipeline
            const stage = await stageService.getStageById(accessToken, parent.stage_id);
            if (!stage) {
                console.error(`Stage ${parent.stage_id} not found for deal ${parent.id}.`);
                // Handle case where stage might have been deleted but deal wasn't updated
                 throw new GraphQLError('Stage associated with this deal not found.', { extensions: { code: 'NOT_FOUND' } });
            }
            return stage;
        } catch (e) {
            console.error(`Error fetching stage ${parent.stage_id} for deal ${parent.id}:`, e);
            // Process error: Check if it's a standard not found or other issue
             if (e instanceof GraphQLError && e.extensions?.code === 'NOT_FOUND') {
                 throw e; // Re-throw known errors
             }
             // Log unexpected errors but return a generic error to client
             throw processZodError(e, `fetching stage ${parent.stage_id}`);
        }
    }
  },
  Organization: {
    // Resolver for the 'people' field on Organization
    people: async (parent: { id: string }, _args: unknown, context: GraphQLContext) => {
       requireAuthentication(context);
       const accessToken = getAccessToken(context);
       if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
       console.warn(`Resolver Organization.people not fully implemented - needs service update`);
       // TODO: Implement personService.getPeopleByOrganizationId(userId, orgId, accessToken)
       // try {
       //    return await personService.getPeopleByOrganizationId(context.currentUser!.id, parent.id, accessToken);
       // } catch (e) {
       //    throw processServiceError(e, 'fetching Organization.people');
       // }
       return []; // Return empty array for now
    }
  },
};

// Helper function for authentication check
function requireAuthentication(context: GraphQLContext): string /* Returns access token */ {
  if (!context.currentUser) {
    // Log the attempt
    console.warn('Authentication required but currentUser is null.'); // Added logging
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  const token = getAccessToken(context);
   if (!token) {
    // This case should ideally not happen if currentUser is set, but check defensively
    console.error('Authentication check passed (currentUser exists), but failed to extract token.');
    throw new GraphQLError('Authentication token is missing or invalid.', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  // If authenticated, return the token
  return token;
}

// Create the Yoga instance
const yoga = createYoga<GraphQLContext>({
  schema: createSchema({
    typeDefs: loadedTypeDefs, // Use loaded schema
    resolvers,
  }),
  // Define the context factory
  context: async (initialContext): Promise<GraphQLContext> => {
    let currentUser: User | null = null;
    const token = getAccessToken({ 
        request: initialContext.request, 
        // Populate event/context if they exist from Netlify adapter
        event: initialContext.event as HandlerEvent, 
        context: initialContext.context as HandlerContext, 
        currentUser: null // Placeholder, will be replaced
    });

    if (token) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) {
          console.warn('Error fetching user from token:', error.message);
        } else {
          currentUser = user;
        }
      } catch (err) {
        console.error('Unexpected error during supabase.auth.getUser:', err);
      }
    }

    return {
      currentUser,
      // Pass along Netlify event/context if available
      event: initialContext.event as HandlerEvent,
      context: initialContext.context as HandlerContext,
      request: initialContext.request, // Keep original request
    };
  },
  // GraphQL endpoint path
  graphqlEndpoint: '/.netlify/functions/graphql',
  // Health check endpoint
  healthCheckEndpoint: '/.netlify/functions/graphql/health',
  landingPage: false, // Disable GraphiQL landing page for now
});

// Netlify Function handler
export const handler: Handler = async (event, context) => {
  // Use Yoga's Fetch API integration for Netlify
  const response = await yoga.fetch(
    // Construct the URL for Yoga (needed for routing inside Yoga)
    event.path, 
    {
      method: event.httpMethod,
      headers: event.headers as HeadersInit,
      body: event.body ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8') : undefined,
    },
    // Pass Netlify context and event for potential use in Yoga context factory
    { event, context }
  );

  // Convert Fetch API Response back to Netlify Handler Response
  const responseHeaders: { [key: string]: string } = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    statusCode: response.status,
    headers: responseHeaders,
    body: await response.text(),
  };
}; 