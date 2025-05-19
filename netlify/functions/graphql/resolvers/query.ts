// Resolvers for Query operations
import { GraphQLError } from 'graphql';
import { supabase } from '../../../../lib/supabaseClient';
import { personService } from '../../../../lib/personService';
import { organizationService } from '../../../../lib/organizationService';
import { dealService } from '../../../../lib/dealService';
import * as pipelineService from '../../../../lib/pipelineService';
import * as stageService from '../../../../lib/stageService';
import * as userProfileService from '../../../../lib/userProfileService';
import {
  GraphQLContext, 
  getAccessToken, 
  processZodError, 
  requireAuthentication
} from '../helpers';

// Import generated types from backend codegen
import type {
    QueryResolvers,
    Person as GraphQLPerson,
    Organization as GraphQLOrganization,
    Deal as GraphQLDeal,
    Pipeline as GraphQLPipeline,
    Stage as GraphQLStage,
    User as GraphQLUser,
    PersonListItem as GraphQLPersonListItem
    // Argument types (e.g., QueryPersonArgs) are inferred by QueryResolvers
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
          // Map PersonRecord[] to GraphQLPerson[]
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
            // Make raw DB data available for the Person.customFieldValues resolver
            db_custom_field_values: (p).custom_field_values,
            // organization, deals, activities resolved by Person type resolvers
          })) as any; // Cast to any to allow db_custom_field_values
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
          // Map PersonRecord to GraphQLPerson
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
            // Make raw DB data available for the Person.customFieldValues resolver
            db_custom_field_values: (p as any).custom_field_values,
          } as any; // Cast to any to allow db_custom_field_values
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
         // Map OrganizationRecord[] to GraphQLOrganization[]
         return orgs.map(o => ({
            id: o.id,
            created_at: o.created_at,
            updated_at: o.updated_at,
            user_id: o.user_id,
            name: o.name,
            address: o.address,
            notes: o.notes,
            db_custom_field_values: (o).custom_field_values,
            // activities, deals, people resolved by Organization type resolvers
         })) as any; // Cast to any to allow db_custom_field_values
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
          // Map OrganizationRecord to GraphQLOrganization
          return {
            id: o.id,
            created_at: o.created_at,
            updated_at: o.updated_at,
            user_id: o.user_id,
            name: o.name,
            address: o.address,
            notes: o.notes,
            db_custom_field_values: (o as any).custom_field_values,
          } as any; // Cast to any to allow db_custom_field_values
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
                pipeline_id: d.pipeline_id!,
                stage_id: d.stage_id!, 
                person_id: d.person_id,
                organization_id: d.organization_id,
                deal_specific_probability: d.deal_specific_probability,
                // Make raw DB data available for the Deal.customFieldValues resolver
                db_custom_field_values: (d).custom_field_values, 
           })) as any; // Cast to any to allow db_custom_field_values, field resolvers will complete the type
       } catch (e) {
           throw processZodError(e, 'fetching deals list');
       }
    },
    deal: async (_parent, args, context) => {
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
                pipeline_id: d.pipeline_id!,
                stage_id: d.stage_id!, 
                person_id: d.person_id,
                organization_id: d.organization_id,
                deal_specific_probability: d.deal_specific_probability,
                // Make raw DB data available for the Deal.customFieldValues resolver
                db_custom_field_values: (d as any).custom_field_values, 
           } as any; // Cast to any, field resolvers will complete the type
       } catch (e) {
           throw processZodError(e, 'fetching deal by ID');
       }
    },
    // Pipeline Resolvers
    pipelines: async (_parent, _args, context: GraphQLContext): Promise<GraphQLPipeline[]> => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      try {
        const pipelineList = await pipelineService.getPipelines(accessToken);
        return pipelineList.map(p => ({
          id: p.id,
          user_id: p.user_id,
          name: p.name,
          created_at: p.created_at, 
          updated_at: p.updated_at,
        })) as GraphQLPipeline[];
      } catch (e) {
        throw processZodError(e, 'fetching pipelines list');
      }
    },
    // Ensure there isn't a singular 'pipeline(id: ID!)' resolver here unless also defined in schema

    // Stage Resolvers
    stages: async (_parent, args, context) => {
        const action = 'fetching stages for pipeline ' + args.pipelineId;
        try {
            requireAuthentication(context);
            const accessToken = getAccessToken(context)!;
            if (!args.pipelineId) throw new GraphQLError("pipelineId is required", { extensions: { code: 'BAD_USER_INPUT' } });
            const stageList = await stageService.getStagesByPipelineId(accessToken, args.pipelineId);
            // Map Stage from lib/types to GraphQLStage
            return stageList.map(s => ({
                id: s.id,
                user_id: s.user_id,
                pipeline_id: s.pipeline_id,
                name: s.name,
                order: s.order,
                deal_probability: s.deal_probability,
                stage_type: s.stage_type,
                created_at: s.created_at,
                updated_at: s.updated_at,
                // pipeline field resolved by Stage type resolver
            })) as GraphQLStage[];
        } catch (error) { 
            console.error('[Query.stages] Error during ' + action + ':', error);
            throw processZodError(error, action); 
        }
    },
    stage: async (_parent, args, context) => {
        const action = 'fetching stage ' + args.id;
        try {
            requireAuthentication(context);
            const accessToken = getAccessToken(context)!;
            const s = await stageService.getStageById(accessToken, args.id);
            if (!s) return null;
            // Map Stage from lib/types to GraphQLStage
             return {
                id: s.id,
                user_id: s.user_id,
                pipeline_id: s.pipeline_id,
                name: s.name,
                order: s.order,
                deal_probability: s.deal_probability,
                stage_type: s.stage_type,
                created_at: s.created_at,
                updated_at: s.updated_at,
            } as GraphQLStage;
        } catch (error) {
            console.error('[Query.stage] Error during ' + action + ':', error);
            throw processZodError(error, action);
        }
    },
    // --- My Permissions Query ---\
    myPermissions: (_parent, _args, context) => {
        requireAuthentication(context);
        return context.userPermissions ?? []; // Already returns string[]
    },
}; 