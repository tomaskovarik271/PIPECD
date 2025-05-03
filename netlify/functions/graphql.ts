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

// Zod schema for DealInput validation
const DealBaseSchema = z.object({ // Renamed to Base
    name: z.string().trim().min(1, { message: "Deal name cannot be empty" }),
    stage: z.string().trim().min(1, { message: "Deal stage cannot be empty" }), // Consider enum later
    amount: z.number().positive({ message: "Amount must be a positive number"}).optional().nullable(),
    person_id: z.string().uuid({ message: "Invalid Person ID format" }).optional().nullable(), // Renamed from contact_id
});

const DealCreateSchema = DealBaseSchema; // Create uses the base currently
const DealUpdateSchema = DealBaseSchema.partial(); // Update allows partial fields

// Placeholder service functions (REMOVED)
// const contactService = { ... };
// const dealService = { ... };

// Define GraphQL Schema
const typeDefs = /* GraphQL */ `
  scalar DateTime
  scalar Float # Ensure Float is available if using it

  type Query {
    health: String!
    supabaseConnectionTest: String!
    me: UserInfo
    # People (formerly Contacts)
    people: [Person!]!          # Get all people for the user
    person(id: ID!): Person      # Get a specific person by ID
    personList: [PersonListItem!]! # Simplified list for dropdowns
    # Organizations
    organizations: [Organization!]!
    organization(id: ID!): Organization
    # Deals
    deals: [Deal!]!            
    deal(id: ID!): Deal        
  }

  type Mutation {
    # People (formerly Contacts)
    createPerson(input: PersonInput!): Person!
    updatePerson(id: ID!, input: PersonInput!): Person
    deletePerson(id: ID!): Boolean
    # Organizations
    createOrganization(input: OrganizationInput!): Organization!
    updateOrganization(id: ID!, input: OrganizationInput!): Organization
    deleteOrganization(id: ID!): Boolean
    # Deals
    createDeal(input: DealInput!): Deal!
    updateDeal(id: ID!, input: DealInput!): Deal
    deleteDeal(id: ID!): Boolean
  }

  type UserInfo {
    id: ID!
    email: String
  }

  type Person { # Renamed from Contact
    id: ID!
    created_at: DateTime!
    updated_at: DateTime!
    user_id: ID! 
    first_name: String
    last_name: String
    email: String
    phone: String
    notes: String
    organization_id: ID # Foreign key
    organization: Organization # Associated organization
    deals: [Deal!] # Associated deals 
  }

  type Organization {
      id: ID!
      created_at: DateTime!
      updated_at: DateTime!
      user_id: ID!
      name: String!
      address: String
      notes: String
      people: [Person!] # People belonging to this organization
  }

  type Deal {
    id: ID!
    created_at: DateTime!
    updated_at: DateTime!
    user_id: ID! 
    name: String!
    stage: String! 
    amount: Float
    person_id: ID # FK referencing people table (Renamed from contact_id)
    person: Person # Associated person (updated from contact)
  }

  # Simplified type for person dropdowns
  type PersonListItem {
    id: ID!
    name: String! # Combined name generated by service
  }

  input PersonInput { # Renamed from ContactInput
    first_name: String
    last_name: String
    email: String
    phone: String
    notes: String
    organization_id: ID # Added field
  }

  input OrganizationInput {
      name: String!
      address: String
    notes: String
  }

  input DealInput {
    name: String!
    stage: String!
    amount: Float
    person_id: ID # FK referencing people table (Renamed from contact_id)
  }
`;

// Export context type for testing
export type { GraphQLContext };

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
      console.log('[Mutation.createDeal] received input:', args.input);
      const action = 'creating deal';
      try {
        requireAuthentication(context);
        const userId = context.currentUser!.id;
        const accessToken = getAccessToken(context);
        if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

        // Validate input using Zod
        const validatedInput = DealCreateSchema.parse(args.input);
        console.log('[Mutation.createDeal] validated input:', validatedInput);

        // Call service with validated input
        const newDeal = await dealService.createDeal(userId, validatedInput, accessToken);
        console.log('[Mutation.createDeal] successfully created:', newDeal.id);

        // Send event to Inngest
        inngest.send({ 
          name: 'crm/deal.created',
          data: { deal: newDeal },
          user: { id: userId, email: context.currentUser!.email }
        }).catch(err => console.error('Failed to send deal.created event to Inngest:', err));

        return newDeal;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    updateDeal: async (_parent: unknown, args: { id: string; input: any }, context: GraphQLContext): Promise<any> => {
      console.log('[Mutation.updateDeal] received id:', args.id, 'input:', args.input);
      const action = 'updating deal';
      try {
        requireAuthentication(context);
        const userId = context.currentUser!.id;
        const accessToken = getAccessToken(context);
        if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

        // Validate input using Zod (using partial schema for updates)
        const validatedInput = DealUpdateSchema.parse(args.input);
        console.log('[Mutation.updateDeal] validated input:', validatedInput);

        // Ensure at least one field is provided for update (after parsing)
        if (Object.keys(validatedInput).length === 0) {
          throw new GraphQLError('No fields provided for update', { extensions: { code: 'BAD_USER_INPUT' } });
        }

        // Call service with validated input
        const updatedDeal = await dealService.updateDeal(userId, args.id, validatedInput, accessToken);
        console.log('[Mutation.updateDeal] successfully updated:', updatedDeal.id);

        // Send event to Inngest
        inngest.send({ 
          name: 'crm/deal.updated',
          data: { deal: updatedDeal },
          user: { id: userId, email: context.currentUser!.email }
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
    person: async (parent: { person_id?: string | null }, _args: unknown, context: GraphQLContext) => {
      requireAuthentication(context); // Added Auth Check
      const accessToken = getAccessToken(context);
       if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
      
      if (!parent.person_id) {
            return null;
        }
       try {
        // Fetch the person using the person_id from the parent Deal object
        // Pass user context for RLS
        return await personService.getPersonById(context.currentUser!.id, parent.person_id, accessToken);
       } catch (e) {
          // Don't throw here, just return null if person fetch fails
          console.error('Error fetching Deal.person:', e);
          return null;
          // throw processServiceError(e, 'fetching Deal.person');
       }
    }
  },
  Organization: {
    // Placeholder for people linked to an organization (requires personService update)
    people: async (_parent: { id: string }, _args: unknown, context: GraphQLContext) => {
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
function requireAuthentication(context: GraphQLContext) {
  if (!context.currentUser) {
    // Log the attempt
    console.warn('Authentication required but currentUser is null.'); // Added logging
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  // If authenticated, proceed
}

// Create the Yoga instance
const yoga = createYoga<GraphQLContext>({
  schema: createSchema({
    typeDefs,
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