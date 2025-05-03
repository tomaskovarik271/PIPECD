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
      if (!context.currentUser) {
        return null; // Or throw an AuthenticationError
      }
      return {
        id: context.currentUser.id,
        email: context.currentUser.email,
        // Map other fields if needed
      };
    },

    // --- Person Resolvers ---
    people: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const token = getAccessToken(context);
      if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
      return personService.getPeople(context.currentUser.id, token);
    },
    person: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const token = getAccessToken(context);
      if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
      return personService.getPersonById(context.currentUser.id, args.id, token);
    },
    personList: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
        if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
        const token = getAccessToken(context);
        if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
        const people = await personService.getPeople(context.currentUser.id, token);
        return people.map(p => ({ 
            id: p.id, 
            name: `${p.last_name || ''}, ${p.first_name || ''}`.trim() || p.email || 'Unnamed' 
        }));
    },

    // --- Organization Resolvers ---
    organizations: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
        if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
        const token = getAccessToken(context);
        if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
        return organizationService.getOrganizations(context.currentUser.id, token);
    },
    organization: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
        if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
        const token = getAccessToken(context);
        if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
        return organizationService.getOrganizationById(context.currentUser.id, args.id, token);
    },

    // --- Deal Resolvers ---
    deals: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
        if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
        const token = getAccessToken(context);
        if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
        // Call deal service (currently returns placeholder)
        return dealService.getDeals(context.currentUser.id, token);
    },
    deal: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
        if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
        const token = getAccessToken(context);
        if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
         // Call deal service (currently returns placeholder)
        return dealService.getDealById(context.currentUser.id, args.id, token);
    },
  },

  Mutation: {
    // --- Person Mutations ---
    createPerson: async (_parent: unknown, args: { input: any }, context: GraphQLContext) => {
      if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const token = getAccessToken(context);
      if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
      
      // Validate input FIRST, outside the main try-catch for service errors
      let validatedInput;
      try {
          validatedInput = PersonCreateSchema.parse(args.input);
      } catch (error) {
          // Let Zod validation errors be processed specifically
          throw processZodError(error, 'create person validation'); 
      }

      try { // Wrap service call and Inngest send
        // Now pass validatedInput to the service
        const newPerson = await personService.createPerson(context.currentUser.id, validatedInput, token);

        // Send event to Inngest AFTER successful creation
        // Use await, but don't necessarily block the GraphQL response if sending fails
        // Note: Keep inngest send separate try...catch if we don't want its failure to roll back the GQL response
        try {
          await inngest.send({
            name: 'crm/person.created',
            user: { id: context.currentUser.id, email: context.currentUser.email },
            data: { // Updated payload structure
              personId: newPerson.id,
              userId: context.currentUser.id,
              firstName: validatedInput.first_name,
              lastName: validatedInput.last_name,
              email: validatedInput.email,
              organizationId: validatedInput.organization_id
            }
          });
          console.log(`Sent 'crm/person.created' event for person ID: ${newPerson.id}`);
        } catch (inngestError) {
          console.error(`Failed to send Inngest event: crm/person.created`, inngestError);
          // Log the error, but don't fail the mutation
        }

        return newPerson; // Return the created person
      } catch (error) { // Catch errors from personService.createPerson 
            // Use processZodError, which will handle non-Zod errors as INTERNAL_SERVER_ERROR
            throw processZodError(error, 'create person service call');
      }
    },
    updatePerson: async (_parent: unknown, args: { id: string; input: any }, context: GraphQLContext) => {
      if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const token = getAccessToken(context);
      if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
        try {
            // Validate partial input using the update schema
            const validatedInput = PersonUpdateSchema.parse(args.input);
             // Filter out undefined values after validation if necessary
             const cleanInput = Object.fromEntries(Object.entries(validatedInput).filter(([_, v]) => v !== undefined));
             if (Object.keys(cleanInput).length === 0) {
                throw new GraphQLError('No valid fields provided for update', { extensions: { code: 'BAD_USER_INPUT' } });
            }

            return personService.updatePerson(context.currentUser.id, args.id, cleanInput, token);
        } catch (error) {
            throw processZodError(error, 'update person');
        }
    },
    deletePerson: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const token = getAccessToken(context);
      if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
      // Note: Service layer handles not found/permissions
      return personService.deletePerson(context.currentUser.id, args.id, token);
    },

    // --- Organization Mutations ---
    createOrganization: async (_parent: unknown, args: { input: any }, context: GraphQLContext) => {
        if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
        const token = getAccessToken(context);
        if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
        try {
            const validatedInput = OrganizationInputSchema.parse(args.input);
            const newOrganization = await organizationService.createOrganization(context.currentUser.id, validatedInput, token);

            // Send Inngest event asynchronously (don't block response)
            inngest.send({
                name: 'crm/organization.created',
                user: { id: context.currentUser.id, email: context.currentUser.email },
                data: {
                    organizationId: newOrganization.id,
                    userId: context.currentUser.id,
                    input: validatedInput // Send validated input
                }
            }).catch(error => {
                console.error('Failed to send Inngest event: crm/organization.created', error);
                // Log the error, but don't fail the mutation
            });

            return newOrganization;
        } catch (error) {
            throw processZodError(error, 'create organization');
        }
    },
    updateOrganization: async (_parent: unknown, args: { id: string; input: any }, context: GraphQLContext) => {
        if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
        const token = getAccessToken(context);
        if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
        try {
            // Validate partial input
            const validatedInput = OrganizationInputSchema.partial().parse(args.input);
            const cleanInput = Object.fromEntries(Object.entries(validatedInput).filter(([_, v]) => v !== undefined));
             if (Object.keys(cleanInput).length === 0) {
                throw new GraphQLError('No valid fields provided for update', { extensions: { code: 'BAD_USER_INPUT' } });
            }
            return organizationService.updateOrganization(context.currentUser.id, args.id, cleanInput, token);
        } catch (error) {
            throw processZodError(error, 'update organization');
        }
    },
    deleteOrganization: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
        if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
        const token = getAccessToken(context);
        if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
        return organizationService.deleteOrganization(context.currentUser.id, args.id, token);
    },

    // --- Deal Mutations ---
    createDeal: async (_parent: unknown, args: { input: any }, context: GraphQLContext) => {
      if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const token = getAccessToken(context);
      if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
        try {
            // Use create schema
            const validatedInput = DealCreateSchema.parse(args.input);
            const newDeal = await dealService.createDeal(context.currentUser.id, validatedInput, token);

            // Send Inngest event asynchronously (don't block response)
            inngest.send({
                name: 'crm/deal.created',
                user: { id: context.currentUser.id, email: context.currentUser.email }, // Add user info
                data: {
                    dealId: newDeal.id,
                    userId: context.currentUser.id, // Add userId for consistency
                    personId: validatedInput.person_id, // Send person_id from validated input
                    input: validatedInput // Send validated input
                }
            }).catch(error => {
                console.error('Failed to send Inngest event: crm/deal.created', error); // Updated log message
                // Log the error, but don't fail the mutation
            });

            return newDeal;
        } catch (error) {
            throw processZodError(error, 'create deal');
        }
    },
    updateDeal: async (_parent: unknown, args: { id: string; input: any }, context: GraphQLContext) => {
      if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const token = getAccessToken(context);
      if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });
      try {
          // Use update schema
          const validatedInput = DealUpdateSchema.parse(args.input);
          // Filter out undefined values after validation if necessary
          const cleanInput = Object.fromEntries(Object.entries(validatedInput).filter(([_, v]) => v !== undefined));
           if (Object.keys(cleanInput).length === 0) {
                throw new GraphQLError('No valid fields provided for update', { extensions: { code: 'BAD_USER_INPUT' } });
            }
          // Now pass cleanInput to the service
          // Explicitly await the promise (though it should be awaited implicitly)
          const result = await dealService.updateDeal(context.currentUser.id, args.id, cleanInput, token);
          return result; // Return the awaited result
      } catch (error) {
            throw processZodError(error, 'update deal');
      }
    },
    deleteDeal: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
        if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
        const token = getAccessToken(context);
        if (!token) throw new GraphQLError('Auth token missing', { extensions: { code: 'UNAUTHENTICATED' } });

        // Call deal service (currently returns placeholder)
        const success = await dealService.deleteDeal(context.currentUser.id, args.id, token);

        // TODO: Optionally send crm/deal.deleted event here (if success)

        return success; // Return boolean
    },
  },
  
  // --- Add Resolver for Person type ---
  Person: {
    // Resolver for the nested 'organization' field within Person
    organization: async (parentPerson: { organization_id: string | null, user_id: string }, _args: unknown, context: GraphQLContext) => {
        // Check if there is an organization_id on the parent Person object
        if (!parentPerson.organization_id) {
            return null; // No organization linked
        }
        // Ensure user context exists
        if (!context.currentUser) {
             console.warn('Attempted to fetch Person.organization without user context');
             return null;
        }
        // Get access token
        const token = getAccessToken(context);
        if (!token) {
             console.warn('Attempted to fetch Person.organization without access token');
             return null;
        }
        
        // Fetch the organization using the organizationService
        try {
            // Use the context user ID for consistency and rely on RLS on the organizations table.
            return await organizationService.getOrganizationById(context.currentUser.id, parentPerson.organization_id, token);
        } catch (error) {
            console.error(`Error fetching organization ${parentPerson.organization_id} for person:`, error);
            // Don't fail the whole query, just return null for this field if fetch fails
            return null;
        }
    },
    // TODO: Add resolver for Person.deals if needed
    // deals: async (parentPerson, _args, context) => { ... }
  },
  
  // Add resolver for nested Deal.person field
  Deal: {
    person: async (parentDeal: { person_id: string | null, user_id: string }, _args: unknown, context: GraphQLContext) => {
        // Check if there is a person_id on the parent Deal object
        if (!parentDeal.person_id) {
            return null; // No person linked
        }
        // Ensure user context exists (should generally be true if they fetched the parent Deal)
        if (!context.currentUser) {
             console.warn('Attempted to fetch Deal.person without user context');
             return null; // Or throw error
        }
        // Get access token
        const token = getAccessToken(context);
        if (!token) {
             console.warn('Attempted to fetch Deal.person without access token');
             return null; // Or throw error
        }
        
        // Fetch the person using the personService
        // We pass the parentDeal.user_id to ensure RLS check uses the *deal owner's* ID
        // Although, RLS on contacts table itself should handle this fine as well.
        try {
            // Note: Using parentDeal.user_id might be slightly less secure if ownership differs,
            // relying on context.currentUser.id and RLS policy is generally better.
            // Let's use the context user ID for consistency and rely on RLS.
            return await personService.getPersonById(context.currentUser.id, parentDeal.person_id, token);
        } catch (error) {
            console.error(`Error fetching person ${parentDeal.person_id} for deal:`, error);
            // Don't fail the whole query, just return null for this field
            return null;
        }
    }
  }
  // TODO: Add resolver for Contact.deals if needed (would involve calling dealService.getDealsByContactId)
};

// Define the expected shape of the context passed *into* the factory by Yoga
// Typically includes the Request object and potentially others based on environment
interface YogaInitialParams {
  request: Request;
  // Include other params Yoga might pass, like the ones from server adapters
  event?: HandlerEvent; // Netlify specific
  context?: HandlerContext; // Netlify specific
}

// Define the final shape of the context object *returned* by the factory
// This is what resolvers will receive
interface ResolverContext extends YogaInitialParams { // Inherit initial params
  currentUser: User | null;
  // Add any other derived context properties here
}

// Create GraphQL Yoga instance with context factory
const yoga = createYoga<ResolverContext>({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  // Context factory: receives initial params, returns the final ResolverContext
  context: async (initialContext: YogaInitialParams): Promise<ResolverContext> => {
    let currentUser: User | null = null;
    const authHeader = initialContext.request.headers.get('authorization');
    let token: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) {
          console.warn('JWT verification error:', error.message);
        } else {
          currentUser = user;
        }
      } catch (err) {
        console.error('Unexpected error during token verification:', err);
      }
    }

    // Return the full context object, explicitly merging initial params and derived values
    return {
      ...initialContext, // Pass through initial params like request, event, context
      currentUser,       // Add the derived user
    };
  },
  // Configure error masking
  maskedErrors: {
    maskError: (error, message, isDev) => {
      // Allow GraphQLErrors (like authentication errors) to pass through
      if (error instanceof GraphQLError) {
        return error;
      }
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        // Combine Zod issues into a user-friendly message
        const validationMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
        // Return a specific GraphQLError for validation issues
        return new GraphQLError(`Validation Error: ${validationMessage}`, {
          extensions: { code: 'BAD_USER_INPUT', validationErrors: error.flatten() }
        });
      }
      // Mask other unexpected errors in production
      if (!isDev) {
        console.error('Unexpected error in GraphQL resolver:', error); // Log the original error server-side
        return new GraphQLError('Internal Server Error', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
      // In development, return the original error for easier debugging
      return error as Error;
    },
  },
  // Enable/disable GraphiQL interface
  graphiql: process.env.NODE_ENV !== 'production', // Disable in production
  // Set the endpoint path for the GraphQL server
  graphqlEndpoint: '/.netlify/functions/graphql',
});

// Netlify Function Handler
export const handler: Handler = async (event, context) => {
  // Construct the URL for the Request object
  // Use x-forwarded-host/proto or fallback to Netlify env vars or defaults
  const protocol = event.headers['x-forwarded-proto'] || 'http';
  const host = event.headers['x-forwarded-host'] || event.headers.host || 'localhost';
  const url = new URL(yoga.graphqlEndpoint, `${protocol}://${host}`);

  // Create a standard Request object from the Netlify event
  const request = new Request(url.toString(), {
    method: event.httpMethod,
    headers: event.headers as HeadersInit, // Type assertion might be needed
    body: event.body ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8') : undefined,
  });

  // Use yoga.fetch to handle the request
  const response = await yoga.fetch(
    request,
    // Pass Netlify event/context here; context factory might access them if needed
    // Note: Yoga's context factory primarily uses the standard Request object
    {
      event,
      context,
    }
  );

  // Prepare Netlify response headers
  const headers: { [key: string]: string } = {};
  const multiValueHeaders: { [key: string]: string[] } = {};

  response.headers.forEach((value, key) => {
    const lowerCaseKey = key.toLowerCase();
    if (lowerCaseKey === 'set-cookie') {
      // Use getSetCookie to handle multiple Set-Cookie headers correctly
      multiValueHeaders[key] = response.headers.getSetCookie();
    } else {
      // Assign single value headers
      headers[key] = value;
    }
  });

  // Convert Response back to Netlify format
  return {
    statusCode: response.status,
    body: await response.text(),
    headers: headers, // Use the single-value headers
    multiValueHeaders: multiValueHeaders, // Use the multi-value headers
  };
}; 