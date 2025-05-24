// Resolvers for Query operations
import { GraphQLError } from 'graphql';
import { supabase } from '../../../../lib/supabaseClient';
import { personService } from '../../../../lib/personService';
import { organizationService } from '../../../../lib/organizationService';
import { dealService } from '../../../../lib/dealService';
import * as userProfileService from '../../../../lib/userProfileService';
import {
  GraphQLContext, 
  getAccessToken, 
  processZodError, 
  requireAuthentication
} from '../helpers';
import { wfmStatusService } from '../../../../lib/wfmStatusService';
import { wfmWorkflowService } from '../../../../lib/wfmWorkflowService';
import { wfmProjectTypeService } from '../../../../lib/wfmProjectTypeService';

// Import generated types from backend codegen
import type {
    QueryResolvers,
    Person as GraphQLPerson,
    Organization as GraphQLOrganization,
    Deal as GraphQLDeal,
    User as GraphQLUser,
    PersonListItem as GraphQLPersonListItem,
    WfmWorkflowTransition as GraphQLWfmWorkflowTransition,
    QueryGetWfmAllowedTransitionsArgs
} from '../../../../lib/generated/graphql';



export const Query: QueryResolvers<GraphQLContext> = {
    health: () => 'OK',
    supabaseConnectionTest: async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Supabase connection error:', error.message);
          return `Connection Error: ${error.message}`;
        }
        console.log('Supabase getSession data:', data);
        return 'Successfully connected to Supabase (getSession succeeded)';
      } catch (error: unknown) {
        console.error('Unexpected error during Supabase test:', error);
        let message = "Unknown error during Supabase test";
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
        return `Unexpected Error: ${message}`;
      }
    },
    me: async (_parent, _args, context: GraphQLContext): Promise<GraphQLUser | null> => {
      requireAuthentication(context);
      const currentUser = context.currentUser!;
      const accessToken = getAccessToken(context)!;

      if (!currentUser.email) {
        // This case should ideally not happen for an authenticated user if email is a primary identifier.
        // Log an error and throw, as the GraphQL schema expects a non-null email for the User type.
        console.error(`[Query.me] Critical: Authenticated user ${currentUser.id} has no email.`);
        throw new GraphQLError('Authenticated user email is missing.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }

      try {
        const profile = await userProfileService.getUserProfile(currentUser.id, accessToken);
        
        return {
          id: currentUser.id,
          email: currentUser.email, // Now checked for null/undefined
          display_name: profile?.display_name || null,
          avatar_url: profile?.avatar_url || null,    
        };
      } catch (error) {
        console.error(`[Query.me] Error fetching profile for user ${currentUser.id}:`, error);
        // Fallback: return basic info, but email is guaranteed by the check above.
        return {
            id: currentUser.id,
            email: currentUser.email, // currentUser.email is guaranteed here
            display_name: null,
            avatar_url: null,
        }; 
      }
    },

    // --- Person Resolvers ---\
    people: async (_parent, _args, context) => {
      const action = 'fetching people list';
      try {
          requireAuthentication(context);
          const accessToken = getAccessToken(context)!;
          const peopleList = await personService.getPeople(context.currentUser!.id, accessToken);
          return peopleList.map(p => ({
            id: p.id,
            created_at: p.created_at,
            updated_at: p.updated_at,
            user_id: p.user_id,
            first_name: p.first_name,
            last_name: p.last_name,
            email: p.email,
            phone: p.phone,
            notes: p.notes,
            organization_id: p.organization_id,
            db_custom_field_values: (p as any).custom_field_values,
          })) as any; 
      } catch (e) {
         throw processZodError(e, action);
      }
    },
    person: async (_parent, args, context) => {
      const action = 'fetching person by ID';
      try {
          requireAuthentication(context);
          const accessToken = getAccessToken(context)!;
          const p = await personService.getPersonById(context.currentUser!.id, args.id, accessToken);
          if (!p) return null;
          return {
            id: p.id,
            created_at: p.created_at,
            updated_at: p.updated_at,
            user_id: p.user_id,
            first_name: p.first_name,
            last_name: p.last_name,
            email: p.email,
            phone: p.phone,
            notes: p.notes,
            organization_id: p.organization_id,
            db_custom_field_values: (p as any).custom_field_values,
          } as any; 
      } catch (e) {
         throw processZodError(e, action);
      }
    },
    personList: async (_parent, _args, context) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      try {
        const people = await personService.getPeople(context.currentUser!.id, accessToken); 
        return people.map(p => ({
            id: p.id,
            name: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || 'Unnamed Person'
        })) as GraphQLPersonListItem[];
      } catch (e) {
         throw processZodError(e, 'fetching person list for dropdown');
      }
    },

    // --- Organization Resolvers ---\
    organizations: async (_parent, _args, context) => {
       requireAuthentication(context);
       const accessToken = getAccessToken(context)!;
       try {
         const orgs = await organizationService.getOrganizations(context.currentUser!.id, accessToken);
         return orgs.map(o => ({
            id: o.id,
            created_at: o.created_at,
            updated_at: o.updated_at,
            user_id: o.user_id,
            name: o.name,
            address: o.address,
            notes: o.notes,
            db_custom_field_values: (o as any).custom_field_values,
         })) as any; 
       } catch (e) {
          throw processZodError(e, 'fetching organizations list');
       }
    },
    organization: async (_parent, args, context) => {
       requireAuthentication(context);
       const accessToken = getAccessToken(context)!;
       try {
          const o = await organizationService.getOrganizationById(context.currentUser!.id, args.id, accessToken);
          if (!o) return null;
          return {
            id: o.id,
            created_at: o.created_at,
            updated_at: o.updated_at,
            user_id: o.user_id,
            name: o.name,
            address: o.address,
            notes: o.notes,
            db_custom_field_values: (o as any).custom_field_values,
          } as any; 
       } catch (e) {
           throw processZodError(e, 'fetching organization by ID');
       }
    },

    // --- Deal Resolvers ---\
    deals: async (_parent, _args, context) => {
       requireAuthentication(context);
       const accessToken = getAccessToken(context)!;
       try {
           const dealList = await dealService.getDeals(context.currentUser!.id, accessToken);
           return dealList.map(d => ({
                id: d.id,
                user_id: d.user_id!,
                created_at: d.created_at,
                updated_at: d.updated_at,
                name: d.name!, 
                amount: d.amount,
                expected_close_date: d.expected_close_date,
                wfm_project_id: d.wfm_project_id,
                person_id: d.person_id,
                organization_id: d.organization_id,
                deal_specific_probability: d.deal_specific_probability,
                weighted_amount: d.weighted_amount,
                assignedToUserId: d.assigned_to_user_id, // Added mapping for assignedToUserId
                db_custom_field_values: (d as any).custom_field_values, 
           })) as any; 
       } catch (e) {
           throw processZodError(e, 'fetching deals list');
       }
    },
    deal: async (_parent, args, context) => {
       console.log('[Plain Resolver Query.deal] Received args:', JSON.stringify(args, null, 2));
       if (!args || args.id === undefined || args.id === null) { 
         console.error('[Plain Resolver Query.deal] args.id is MISSING or null/undefined!', args);
       }
       requireAuthentication(context);
       const accessToken = getAccessToken(context)!;
       try {
           const d = await dealService.getDealById(context.currentUser!.id, args.id, accessToken);
           if (!d) return null;
           return {
                id: d.id,
                user_id: d.user_id!,
                created_at: d.created_at,
                updated_at: d.updated_at,
                name: d.name!, 
                amount: d.amount,
                expected_close_date: d.expected_close_date,
                wfm_project_id: d.wfm_project_id,
                person_id: d.person_id,
                organization_id: d.organization_id,
                deal_specific_probability: d.deal_specific_probability,
                weighted_amount: d.weighted_amount,
                assignedToUserId: d.assigned_to_user_id, // Added mapping for assignedToUserId
                db_custom_field_values: (d as any).custom_field_values, 
           } as any; 
       } catch (e) {
           throw processZodError(e, 'fetching deal by ID');
       }
    },
    // --- My Permissions Query ---\
    myPermissions: (_parent, _args, context) => {
        requireAuthentication(context);
        return context.userPermissions ?? []; // Already returns string[]
    },
    wfmProjectTypeByName: async (_parent, args, context) => {
      requireAuthentication(context);
      return wfmProjectTypeService.getWFMProjectTypeByName(args.name, context);
    },
    getWfmAllowedTransitions: async (
      _parent,
      args: QueryGetWfmAllowedTransitionsArgs, 
      context: GraphQLContext
    ): Promise<GraphQLWfmWorkflowTransition[]> => {
      requireAuthentication(context);
      const { workflowId, fromStepId } = args;
      return wfmWorkflowService.getAllowedTransitions(workflowId, fromStepId, context);
    },
    // --- WFM Status Resolvers ---
    wfmStatuses: async (_parent, args, context: GraphQLContext) => {
      requireAuthentication(context);
      return wfmStatusService.getAll(args.isArchived || false, context);
    },
    wfmStatus: async (_parent, args, context: GraphQLContext) => {
      requireAuthentication(context);
      return wfmStatusService.getById(args.id, context);
    },

    // --- WFM Workflow Resolvers ---
    wfmWorkflows: async (_parent, args, context: GraphQLContext) => {
      requireAuthentication(context);
      return wfmWorkflowService.getAll(args.isArchived || false, context);
    },
    wfmWorkflow: async (_parent, args, context: GraphQLContext) => {
      requireAuthentication(context);
      return wfmWorkflowService.getById(args.id, context);
    },

    // --- WFM Project Type Resolvers ---
    wfmProjectTypes: async (_parent, args, context: GraphQLContext) => {
      requireAuthentication(context);
      return wfmProjectTypeService.getAll(args.isArchived || false, context);
    },
    wfmProjectType: async (_parent, args, context: GraphQLContext) => {
      requireAuthentication(context);
      return wfmProjectTypeService.getById(args.id, context);
    },
}; 