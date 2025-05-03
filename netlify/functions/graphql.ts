import { createYoga, createSchema, YogaInitialContext } from 'graphql-yoga';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import { GraphQLError } from 'graphql';
import { personService } from '../../lib/personService';
import { organizationService } from '../../lib/organizationService';
import { dealService } from '../../lib/dealService';
import * as leadService from '../../lib/leadService';
import { z, ZodError } from 'zod';
import { inngest } from './inngest';

// Define GraphQL types related to User
interface Context {
  currentUser: User | null;
  request: Request;
  event: HandlerEvent;
  context: HandlerContext;
  supabaseClient: typeof supabase;
}

// Helper to get token from context (or request headers)
function getAccessToken(context: Context): string | null {
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
  // Check if it's an error from our handleSupabaseError with a specific code
  if (error instanceof Error && (error as any).code) {
    const serviceErrorCode = (error as any).code;
    console.error(`Service error during ${action}:`, error.message, `(Code: ${serviceErrorCode})`);
    // Map service error codes to GraphQL codes
    let graphqlCode = 'INTERNAL_SERVER_ERROR';
    if (serviceErrorCode === 'CONFLICT') graphqlCode = 'CONFLICT';
    if (serviceErrorCode === 'FORBIDDEN') graphqlCode = 'FORBIDDEN';
    
    return new GraphQLError(error.message, { // Use the specific message from the service error
      extensions: {
          code: graphqlCode, 
          originalError: error.message // Keep original message here too?
      }
    });
  } else {
      // Fallback for truly unexpected errors without a code
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

// Schema for updating a Person (all fields optional)
// Refinement skipped: Validating partial updates to ensure at least one identifier 
// remains requires context of the original record, which is complex to handle here.
// Validation should ideally happen in the service layer before the update if needed.
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

// Zod schema for LeadInput validation
const LeadInputBaseSchema = z.object({
    name: z.string().trim().min(1, { message: "Lead name cannot be empty" }).optional().nullable(),
    email: z.string().trim().email({ message: "Invalid email address" }).optional().nullable(),
    phone: z.string().trim().optional().nullable(), // Add more specific phone validation if needed
    company_name: z.string().trim().optional().nullable(),
    source: z.string().trim().optional().nullable(),
    status: z.string().trim().min(1, { message: "Status cannot be empty if provided" }).optional(), // Default is 'New'
    notes: z.string().trim().optional().nullable(),
});

const LeadInputSchema = LeadInputBaseSchema.refine(data => data.name || data.email || data.company_name, {
    message: "At least a name, email, or company name is required for a lead",
    path: ["name"], // Assign error broadly
});

const LeadUpdateSchema = LeadInputBaseSchema.partial().refine(data => {
    // If any of the required fields are present (even if null/undefined in partial), the refinement applies
    // This ensures that if you *try* to update to an invalid state (e.g., remove name, email, company), it fails.
    // However, if none of these fields are part of the partial update, the refinement passes.
    const hasRequiredFieldsInUpdate = ['name', 'email', 'company_name'].some(key => key in data);
    if (!hasRequiredFieldsInUpdate) return true; // Pass if none of the refined fields are being updated
    // If one of the refined fields *is* being updated, check the condition
    return data.name || data.email || data.company_name;
}, {
    message: "Cannot update lead to have no name, email, or company name",
    path: ["name"], 
});

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
    # Leads
    leads: [Lead!]!
    lead(id: ID!): Lead
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
    # Leads
    createLead(input: LeadInput!): Lead!
    updateLead(id: ID!, input: LeadUpdateInput!): Lead
    deleteLead(id: ID!): Boolean
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

  type Lead {
      id: ID!
      created_at: DateTime!
      updated_at: DateTime!
      user_id: ID!
      name: String
      email: String
      phone: String
      company_name: String
      source: String
      status: String! # Non-nullable, defaults to 'New'
      notes: String
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

  input LeadInput {
      name: String
      email: String
      phone: String
      company_name: String
      source: String
      status: String # Optional on input, service/DB sets default
      notes: String
  }

  # Define the missing LeadUpdateInput type
  input LeadUpdateInput {
      name: String
      email: String
      phone: String
      company_name: String
      source: String
      status: String 
      notes: String
  }
`;

// Export context type for testing
export type { Context };

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
    me: (_parent: unknown, _args: unknown, context: Context) => {
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
    people: async (_parent: unknown, _args: unknown, context: Context) => {
      console.info('[Query.people] Attempting to fetch people list.');
      requireAuthentication(context);
      try {
        // Pass client instead of userId/token
        return await personService.getPeople(context.supabaseClient);
      } catch (e) {
         console.error('[Query.people] Error caught:', e);
         throw processZodError(e, 'fetching people list');
      }
    },
    person: async (_parent: unknown, { id }: { id: string }, context: Context) => {
      requireAuthentication(context);
      try {
         // Pass client and personId
        return await personService.getPersonById(context.supabaseClient, id);
      } catch (e) {
         throw processZodError(e, 'fetching person by ID');
      }
    },
    personList: async (_parent: unknown, _args: unknown, context: Context) => {
      requireAuthentication(context);
      try {
        // Pass client
        const people = await personService.getPeople(context.supabaseClient); 
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
    organizations: async (_parent: unknown, _args: unknown, context: Context) => {
       requireAuthentication(context);
       try {
         // Pass client
         return await organizationService.getOrganizations(context.supabaseClient);
       } catch (e) {
          throw processZodError(e, 'fetching organizations list');
       }
    },
    organization: async (_parent: unknown, { id }: { id: string }, context: Context) => {
       requireAuthentication(context);
       try {
           // Pass client and orgId
          return await organizationService.getOrganizationById(context.supabaseClient, id);
       } catch (e) {
           throw processZodError(e, 'fetching organization by ID');
       }
    },

    // --- Deal Resolvers ---
    deals: async (_parent: unknown, _args: unknown, context: Context) => {
       requireAuthentication(context);
       try {
           // Pass client
           return await dealService.getDeals(context.supabaseClient);
       } catch (e) {
           throw processZodError(e, 'fetching deals list');
       }
    },
    deal: async (_parent: unknown, { id }: { id: string }, context: Context) => {
       requireAuthentication(context);
       try {
           // Pass client and dealId
           return await dealService.getDealById(context.supabaseClient, id);
       } catch (e) {
           throw processZodError(e, 'fetching deal by ID');
       }
    },

    // --- Lead Resolvers ---
    leads: async (_parent: unknown, _args: unknown, context: Context) => {
      console.info('[Query.leads] Attempting to fetch leads list.');
      requireAuthentication(context);
      try {
        // Call with client and user ID
        return await leadService.getLeads(context.supabaseClient, context.currentUser!.id);
      } catch (error: any) {
        console.error('[Query.leads] Error caught:', error);
        // Use processZodError helper for consistent error handling
        throw processZodError(error, 'fetching leads list');
      }
    },
    lead: async (_parent: unknown, { id }: { id: string }, context: Context) => {
       requireAuthentication(context);
      try {
        // Call with client, user ID, and lead ID
        const lead = await leadService.getLeadById(context.supabaseClient, context.currentUser!.id, id);
        // Service call now ensures ownership via user ID filter or RLS
        // If lead is null, it means not found *for this user*
        if (!lead) {
            throw new GraphQLError('Lead not found'); // Changed error message
        }
        return lead;
      } catch (error: any) {
         // Use processZodError helper
        throw processZodError(error, 'fetching lead by ID');
      }
    },
  },

  Mutation: {
    // --- Person Mutations ---
    createPerson: async (_parent: unknown, { input }: { input: any }, context: Context) => {
      requireAuthentication(context);
      const currentUser = context.currentUser!;

      try {
        const validatedInput = PersonCreateSchema.parse(input);
        // Pass client, userId, input
        const newPerson = await personService.createPerson(context.supabaseClient, currentUser.id, validatedInput);
        
        // Send Inngest event non-blocking
        inngest.send({
          name: 'crm/person.created',
          user: { id: currentUser.id, email: currentUser.email }, // Pass user info
          data: { // Pass relevant data for the event handler
            personId: newPerson.id,
            userId: currentUser.id,
            firstName: newPerson.first_name,
            lastName: newPerson.last_name,
            email: newPerson.email,
            organizationId: newPerson.organization_id,
          }
        }).catch(err => console.error('Failed to send Inngest event crm/person.created:', err));
        console.log(`Sent 'crm/person.created' event for person ID: ${newPerson.id}`);

        return newPerson;
      } catch (e) {
        // Use the helper to process Zod errors or other errors
        throw processZodError(e, 'create person'); 
      }
    },
    updatePerson: async (_parent: unknown, { id, input }: { id: string, input: any }, context: Context) => {
       requireAuthentication(context);
       try {
          const validatedInput = PersonUpdateSchema.parse(input);
           // Pass client, personId, input
          const updatedPerson = await personService.updatePerson(context.supabaseClient, id, validatedInput);
          // Service returns null if not found/updated
          if (!updatedPerson) {
             throw new GraphQLError('Person not found or update failed', { extensions: { code: 'NOT_FOUND' } }); 
          }
          // TODO: Send Inngest event crm/person.updated if needed
          return updatedPerson;
       } catch (e) {
          throw processZodError(e, 'update person'); // Use generic error processor
       }
    },
    deletePerson: async (_parent: unknown, { id }: { id: string }, context: Context) => {
       requireAuthentication(context);
       try {
          // Pass client, personId
          const success = await personService.deletePerson(context.supabaseClient, id);
          if (!success) {
             // Service returns false if not found or RLS prevented delete without error
             console.warn(`deletePerson resolver: Service returned false for id ${id}. Assuming not found.`);
             throw new GraphQLError('Person not found or delete failed', { extensions: { code: 'NOT_FOUND' } });
          }
           // TODO: Send Inngest event crm/person.deleted if needed
          // Send Inngest event for successful delete
          inngest.send({
              name: 'crm/person.deleted',
              user: { id: context.currentUser!.id, email: context.currentUser!.email },
              data: { personId: id, userId: context.currentUser!.id }
          }).catch(err => console.error('Failed to send Inngest event crm/person.deleted:', err));
          console.log(`Sent 'crm/person.deleted' event for person ID: ${id}`);

          return success; // Returns true
       } catch (e) {
           throw processZodError(e, 'delete person'); // Use generic error processor
       }
    },

    // --- Organization Mutations ---
    createOrganization: async (_parent: unknown, { input }: { input: any }, context: Context) => {
      requireAuthentication(context);
      const currentUser = context.currentUser!;

      try {
        const validatedInput = OrganizationInputSchema.parse(input);
        // Pass client, userId, input
        const newOrganization = await organizationService.createOrganization(context.supabaseClient, currentUser.id, validatedInput);
        // TODO: Send Inngest event crm/organization.created if needed
        // Send Inngest event
         inngest.send({
            name: 'crm/organization.created',
            user: { id: currentUser.id, email: currentUser.email },
            data: { organizationId: newOrganization.id, userId: currentUser.id, name: newOrganization.name }
        }).catch(err => console.error('Failed to send Inngest event crm/organization.created:', err));
        console.log(`Sent 'crm/organization.created' event for org ID: ${newOrganization.id}`);

        return newOrganization;
      } catch (e) {
        throw processZodError(e, 'create organization'); // Use generic error processor
      }
    },
    updateOrganization: async (_parent: unknown, { id, input }: { id: string, input: any }, context: Context) => {
       requireAuthentication(context);
       try {
         const validatedInput = OrganizationInputSchema.partial().parse(input);
          // Pass client, orgId, input
         const updatedOrganization = await organizationService.updateOrganization(context.supabaseClient, id, validatedInput);
         if (!updatedOrganization) {
             throw new GraphQLError('Organization not found or update failed', { extensions: { code: 'NOT_FOUND' } }); 
         }
          // TODO: Send Inngest event crm/organization.updated if needed
          // Update events not sent by default unless specific need arises
         return updatedOrganization;
       } catch (e) {
          throw processZodError(e, 'update organization'); // Use generic error processor
       }
    },
    deleteOrganization: async (_parent: unknown, { id }: { id: string }, context: Context) => {
       requireAuthentication(context);
       try {
          // Pass client, orgId
         const success = await organizationService.deleteOrganization(context.supabaseClient, id);
          if (!success) {
             console.warn(`deleteOrganization resolver: Service returned false for id ${id}. Assuming not found.`);
             throw new GraphQLError('Organization not found or delete failed', { extensions: { code: 'NOT_FOUND' } });
          }
         // TODO: Send Inngest event crm/organization.deleted if needed
        // Send Inngest event for successful delete
        inngest.send({
            name: 'crm/organization.deleted',
            user: { id: context.currentUser!.id, email: context.currentUser!.email },
            data: { organizationId: id, userId: context.currentUser!.id }
        }).catch(err => console.error('Failed to send Inngest event crm/organization.deleted:', err));
        console.log(`Sent 'crm/organization.deleted' event for organization ID: ${id}`);

        return success; // Returns true
       } catch (e) {
          throw processZodError(e, 'delete organization'); // Use generic error processor
       }
    },

     // --- Deal Mutations ---
    createDeal: async (_parent: unknown, { input }: { input: any }, context: Context) => {
      requireAuthentication(context);
      const currentUser = context.currentUser!;

      try {
         // Directly validate the original input which should contain person_id
        const validatedInput = DealCreateSchema.parse(input);
        
        // Pass client, userId, validatedInput
        const newDeal = await dealService.createDeal(context.supabaseClient, currentUser.id, validatedInput);
        
         // Send Inngest event non-blocking
        inngest.send({
          name: 'crm/deal.created',
          user: { id: currentUser.id, email: currentUser.email }, 
          data: { 
                dealId: newDeal.id,
            userId: currentUser.id, 
                name: newDeal.name,
                amount: newDeal.amount,
            personId: newDeal.person_id // Send person_id back as personId?
          }
        }).catch(err => console.error('Failed to send Inngest event crm/deal.created:', err));
            console.log(`Sent 'crm/deal.created' event for deal ID: ${newDeal.id}`);

        return newDeal;
      } catch (e) {
        throw processZodError(e, 'create deal');
      }
    },
    updateDeal: async (_parent: unknown, { id, input }: { id: string, input: any }, context: Context) => {
       requireAuthentication(context);
       try {
          // Directly validate the original input which should contain person_id
          const validatedInput = DealUpdateSchema.parse(input);
          
           // Pass client, dealId, validatedInput
          const updatedDeal = await dealService.updateDeal(context.supabaseClient, id, validatedInput);
          if (!updatedDeal) {
             throw new GraphQLError('Deal not found or update failed', { extensions: { code: 'NOT_FOUND' } }); 
          }
           // TODO: Send Inngest event crm/deal.updated if needed
          // Update events not sent by default unless specific need arises
          return updatedDeal;
       } catch (e) {
           throw processZodError(e, 'update deal'); // Use generic error processor
       }
    },
    deleteDeal: async (_parent: unknown, { id }: { id: string }, context: Context) => {
       requireAuthentication(context);
       try {
          // Pass client, dealId
         const success = await dealService.deleteDeal(context.supabaseClient, id);
         if (!success) {
             console.warn(`deleteDeal resolver: Service returned false for id ${id}. Assuming not found.`);
             throw new GraphQLError('Deal not found or delete failed', { extensions: { code: 'NOT_FOUND' } });
         }
         // TODO: Send Inngest event crm/deal.deleted if needed
        // Send Inngest event for successful delete
        inngest.send({
            name: 'crm/deal.deleted',
            user: { id: context.currentUser!.id, email: context.currentUser!.email },
            data: { dealId: id, userId: context.currentUser!.id }
        }).catch(err => console.error('Failed to send Inngest event crm/deal.deleted:', err));
        console.log(`Sent 'crm/deal.deleted' event for deal ID: ${id}`);

        return success; // Return true
       } catch (e) {
          throw processZodError(e, 'delete deal'); // Use generic error processor
       }
    },

    // --- Lead Mutations ---
    createLead: async (_parent: unknown, { input }: { input: leadService.LeadInput }, context: Context) => {
       requireAuthentication(context);
       try {
          const validatedInput = LeadInputSchema.parse(input);
          // Call with client, user ID, and input
          const newLead = await leadService.createLead(context.supabaseClient, context.currentUser!.id, validatedInput);
          // TODO: Send Inngest event crm/lead.created
          // Send Inngest event
          inngest.send({
              name: 'crm/lead.created',
              user: { id: context.currentUser!.id, email: context.currentUser!.email },
              data: { leadId: newLead.id, userId: context.currentUser!.id, name: newLead.name, email: newLead.email }
          }).catch(err => console.error('Failed to send Inngest event crm/lead.created:', err));
          console.log(`Sent 'crm/lead.created' event for lead ID: ${newLead.id}`);

          return newLead;
       } catch (error: any) {
           throw processZodError(error, 'create lead');
       }
    },
    updateLead: async (_parent: unknown, args: { id: string, input: leadService.LeadUpdateInput }, context: Context) => {
        requireAuthentication(context); // Guarantees currentUser is not null
        const parsedInput = LeadUpdateSchema.parse(args.input); // Validate input

        // Pre-check if lead exists and belongs to user (using service)
        // Use non-null assertion for currentUser.id after requireAuthentication
        const existingLead = await leadService.getLeadById(context.supabaseClient, context.currentUser!.id, args.id);
        if (!existingLead) {
            throw new GraphQLError('Lead not found', { extensions: { code: 'NOT_FOUND' } });
        }

        try {
            // Pass userId to service function, using non-null assertion
            const updatedLead = await leadService.updateLead(context.supabaseClient, context.currentUser!.id, args.id, parsedInput);
            if (!updatedLead) {
                 // This case might indicate an RLS issue or concurrent modification if pre-check passed
                 throw new GraphQLError('Lead update failed', { extensions: { code: 'FORBIDDEN' } });
            }
            // TODO: Consider Inngest event for lead update
             // Update events not sent by default unless specific need arises
            return updatedLead;
        } catch (error) {
             console.error('Unexpected error during update lead:', error);
             throw new GraphQLError('An unexpected error occurred during update lead.', { 
                 extensions: { code: 'INTERNAL_SERVER_ERROR' }, 
                 originalError: error instanceof Error ? error : undefined
             });
        }
    },
    deleteLead: async (_parent: unknown, args: { id: string }, context: Context) => {
        requireAuthentication(context); // Guarantees currentUser is not null
        
        // Pre-check if lead exists and belongs to user
        // Use non-null assertion for currentUser.id after requireAuthentication
        const existingLead = await leadService.getLeadById(context.supabaseClient, context.currentUser!.id, args.id);
        if (!existingLead) {
            throw new GraphQLError('Lead not found', { extensions: { code: 'NOT_FOUND' } });
        }

        try {
             // Pass userId to service function, using non-null assertion
            const success = await leadService.deleteLead(context.supabaseClient, args.id);
            if (!success) {
                 console.warn(`deleteLead resolver: Service returned false for lead ID: ${args.id} after existence check passed.`);
                 // If service returns false after pre-check passed, it might be a concurrent delete
                 throw new GraphQLError('Failed to delete lead, record might have been deleted concurrently.', { extensions: { code: 'NOT_FOUND' } }); // Use NOT_FOUND or CONFLICT? NOT_FOUND seems safer.
            }
             // TODO: Consider Inngest event for lead deletion
            // Send Inngest event for successful delete
            inngest.send({
                name: 'crm/lead.deleted',
                user: { id: context.currentUser!.id, email: context.currentUser!.email },
                data: { leadId: args.id, userId: context.currentUser!.id }
            }).catch(err => console.error('Failed to send Inngest event crm/lead.deleted:', err));
            console.log(`Sent 'crm/lead.deleted' event for lead ID: ${args.id}`);

            return success; 
        } catch (error) {
             // If the error is already a GraphQLError we threw intentionally, re-throw it
             if (error instanceof GraphQLError) {
                 throw error;
             }
             // Otherwise, wrap unexpected errors
             console.error('Unexpected error during delete lead:', error);
             throw new GraphQLError('An unexpected error occurred during delete lead.', { 
                 extensions: { code: 'INTERNAL_SERVER_ERROR' },
                 originalError: error instanceof Error ? error : undefined
             });
        }
    },
  },
  
  // --- Add Resolver for Person type ---
  Person: {
    // Resolver for the nested 'organization' field within Person
    organization: async (parent: { organization_id?: string | null }, _args: unknown, context: Context) => {
      requireAuthentication(context);
      if (!parent.organization_id) {
          return null;
      }

      try {
          // Fetch the organization using the organization_id from the parent Person object
          // Pass client and orgId
          return await organizationService.getOrganizationById(context.supabaseClient, parent.organization_id);
      } catch (e) {
          // Don't throw here, just return null if org fetch fails (e.g., RLS denies)
          console.error('Error fetching Person.organization:', e);
          return null; 
      }
    },
    // Placeholder for deals linked to a person (requires dealService update)
    deals: async (parent: { id: string }, _args: unknown, context: Context) => {
      requireAuthentication(context);
       console.warn(`Resolver Person.deals not fully implemented - needs service update`);
       // TODO: Implement dealService.getDealsByPersonId(context.supabaseClient, parent.id)
       // try {
       //   return await dealService.getDealsByPersonId(context.supabaseClient, parent.id);
       // } catch (e) {
       //   throw processZodError(e, 'fetching Person.deals');
       return []; // Return empty array for now
    }
  },
  
  // Add resolver for nested Deal.person field
  Deal: {
    person: async (parent: { person_id?: string | null }, _args: unknown, context: Context) => {
       requireAuthentication(context);
      if (!parent.person_id) {
            return null;
      }
 
       try {
        // Fetch the person using the person_id from the parent Deal object
        // Pass client and personId
        return await personService.getPersonById(context.supabaseClient, parent.person_id);
       } catch (e) {
          // Don't throw here, just return null if person fetch fails
          console.error('Error fetching Deal.person:', e);
            return null;
        }
    }
  },
  Organization: {
    // Placeholder for people linked to an organization (requires personService update)
    people: async (parent: { id: string }, _args: unknown, context: Context) => {
       requireAuthentication(context);
       console.warn(`Resolver Organization.people not fully implemented - needs service update`);
       // TODO: Implement personService.getPeopleByOrganizationId(context.supabaseClient, parent.id)
       // try {
       //    return await personService.getPeopleByOrganizationId(context.supabaseClient, parent.id);
       // } catch (e) {
       //    throw processZodError(e, 'fetching Organization.people');
       return []; // Return empty array for now
    }
  },
};

// Helper function for authentication check
function requireAuthentication(context: Context) {
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
const yoga = createYoga<Context>({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  // Define the context factory (Refactored for Request-Scoped Client)
  context: async (initialContext): Promise<Context> => {
    let currentUser: User | null = null;
    let requestScopedSupabaseClient: SupabaseClient = supabase; // Default to shared client

    // Get URL and Key from process.env for creating scoped client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    // Basic check - should be caught earlier, but good defense
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase URL or Anon Key missing in function environment!');
        // Return context with null user and default client, or throw?
        // Returning default might mask issues, but throwing breaks the request.
        // Let's log and return default for now.
        return {
            currentUser: null,
            event: initialContext.event as HandlerEvent,
            context: initialContext.context as HandlerContext,
            request: initialContext.request,
            supabaseClient: requestScopedSupabaseClient
        };
    }

    const token = getAccessToken({
        request: initialContext.request, 
        event: initialContext.event as HandlerEvent, 
        context: initialContext.context as HandlerContext, 
        currentUser: null,
        supabaseClient: requestScopedSupabaseClient // Pass initial client
    });

    if (token) {
      try {
        // 1. Validate the token using the shared client
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError) {
          console.warn('Error validating token:', userError.message);
        } else if (user) {
          console.log(`Token validated for user: ${user.id}`);
          currentUser = user;
          
          // 2. Create a NEW client instance scoped to this request/user
          requestScopedSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false }, // Keep server-side setting
            global: {
              headers: { Authorization: `Bearer ${token}` }
            }
          });
          console.log(`Created request-scoped Supabase client for user: ${currentUser.id}`);
          
          // No need to call setSession on the new client, as it's initialized with the token header
        }
      } catch (err) {
        console.error('Unexpected error during Supabase auth token validation:', err);
      }
    }

    // 3. Return context with the (potentially null) user and the appropriate client instance
    return {
      currentUser,
      event: initialContext.event as HandlerEvent,
      context: initialContext.context as HandlerContext,
      request: initialContext.request,
      supabaseClient: requestScopedSupabaseClient // Return shared or request-scoped client
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