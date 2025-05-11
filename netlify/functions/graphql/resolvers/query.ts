// Resolvers for Query operations
import { GraphQLError } from 'graphql';
import { supabase } from '../../../../lib/supabaseClient';
import { personService } from '../../../../lib/personService';
import { organizationService } from '../../../../lib/organizationService';
import { dealService } from '../../../../lib/dealService';
import * as pipelineService from '../../../../lib/pipelineService';
import * as stageService from '../../../../lib/stageService';
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
    UserInfo as GraphQLUserInfo,
    PersonListItem as GraphQLPersonListItem
    // Argument types (e.g., QueryPersonArgs) are inferred by QueryResolvers
} from '../../../../lib/generated/graphql';

// REMOVE: Old frontend type imports
// import type {
//     Person,
//     Organization,
//     Deal,
//     Pipeline,
//     Stage,
//     QueryPersonArgs,
//     QueryOrganizationArgs,
//     QueryDealArgs,
//     QueryPipelineArgs,
//     QueryStagesArgs,
//     QueryStageArgs
// } from '../../../../frontend/src/generated/graphql/graphql.js' with { "resolution-mode": "import" };

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
    me: (_parent, _args, context) => {
      requireAuthentication(context);
      const currentUser = context.currentUser!; // Assert non-null due to requireAuthentication
      return {
        id: currentUser.id,
        email: currentUser.email,
      } as GraphQLUserInfo; // Cast to generated UserInfo
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
            // organization, deals, activities resolved by Person type resolvers
          })) as GraphQLPerson[];
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
          } as GraphQLPerson;
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
            // activities, deals, people resolved by Organization type resolvers
         })) as GraphQLOrganization[];
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
          } as GraphQLOrganization;
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
           // Map DealRecord[] to GraphQLDeal[]
           return dealList.map(d => ({
                id: d.id,
                created_at: d.created_at,
                updated_at: d.updated_at,
                user_id: d.user_id,
                name: d.name!, // Name is non-nullable in GraphQL Deal type
                amount: d.amount,
                stage_id: d.stage_id!, // Stage (and thus stage_id) is non-nullable on Deal type
                person_id: d.person_id,
                // person, stage, activities resolved by Deal type resolvers
           })) as GraphQLDeal[];
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
           // Map DealRecord to GraphQLDeal
           return {
                id: d.id,
                created_at: d.created_at,
                updated_at: d.updated_at,
                user_id: d.user_id,
                name: d.name!, 
                amount: d.amount,
                stage_id: d.stage_id!, 
                person_id: d.person_id,
           } as GraphQLDeal;
       } catch (e) {
           throw processZodError(e, 'fetching deal by ID');
       }
    },
    // Pipeline Resolvers
    pipelines: async (_parent, _args, context) => {
        const action = 'fetching pipelines';
        try {
            requireAuthentication(context);
            const accessToken = getAccessToken(context)!;
            const pipelineList = await pipelineService.getPipelines(accessToken);
            // Explicitly map Pipeline from lib/types to GraphQLPipeline
            return pipelineList.map(p => ({
                id: p.id,
                user_id: p.user_id,
                name: p.name,
                created_at: p.created_at,
                updated_at: p.updated_at,
            })) as GraphQLPipeline[];
        } catch (error) { 
            console.error('[Query.pipelines] Error during ' + action + ':', error);
            throw processZodError(error, action); 
        }
    },
    pipeline: async (_parent, args, context) => {
        const action = 'fetching pipeline ' + args.id;
        try {
            requireAuthentication(context);
            const accessToken = getAccessToken(context)!;
            const p = await pipelineService.getPipelineById(accessToken, args.id);
            if (!p) return null;
            // Explicitly map Pipeline from lib/types to GraphQLPipeline
            return {
                id: p.id,
                user_id: p.user_id,
                name: p.name,
                created_at: p.created_at,
                updated_at: p.updated_at,
            } as GraphQLPipeline;
        } catch (error) {
            console.error('[Query.pipeline] Error during ' + action + ':', error);
            throw processZodError(error, action); 
        }
    },
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