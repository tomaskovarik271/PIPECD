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
import type {
    Person,
    Organization,
    Deal,
    Pipeline,
    Stage,
    QueryPersonArgs,
    QueryOrganizationArgs,
    QueryDealArgs,
    QueryPipelineArgs,
    QueryStagesArgs,
    QueryStageArgs
} from '../../../../frontend/src/generated/graphql/graphql.js' with { "resolution-mode": "import" };

export const Query = {
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
    me: (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      requireAuthentication(context);
      const currentUser = context.currentUser!;
      return {
        id: currentUser.id,
        email: currentUser.email,
      };
    },

    // --- Person Resolvers ---
    people: async (_parent: unknown, _args: unknown, context: GraphQLContext): Promise<Person[]> => {
      const action = 'fetching people list';
      try {
          requireAuthentication(context);
          const accessToken = getAccessToken(context);
          if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
          const peopleList = await personService.getPeople(context.currentUser!.id, accessToken);
          return peopleList as Person[];
      } catch (e) {
         throw processZodError(e, action);
      }
    },
    person: async (_parent: unknown, args: QueryPersonArgs, context: GraphQLContext): Promise<Person | null> => {
      const action = 'fetching person by ID';
      try {
          requireAuthentication(context);
          const accessToken = getAccessToken(context);
          if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
          const personResult = await personService.getPersonById(context.currentUser!.id, args.id, accessToken);
          return personResult as Person | null;
      } catch (e) {
         throw processZodError(e, action);
      }
    },
    personList: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
      try {
        const people = await personService.getPeople(context.currentUser!.id, accessToken); 
        return people.map(p => ({
            id: p.id,
            name: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || 'Unnamed Person'
        }));
      } catch (e) {
         throw processZodError(e, 'fetching person list for dropdown');
      }
    },

    // --- Organization Resolvers ---
    organizations: async (_parent: unknown, _args: unknown, context: GraphQLContext): Promise<Organization[]> => {
       requireAuthentication(context);
       const accessToken = getAccessToken(context);
       if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
       try {
         const orgs = await organizationService.getOrganizations(context.currentUser!.id, accessToken);
         return orgs as Organization[];
       } catch (e) {
          throw processZodError(e, 'fetching organizations list');
       }
    },
    organization: async (_parent: unknown, args: QueryOrganizationArgs, context: GraphQLContext): Promise<Organization | null> => {
       requireAuthentication(context);
       const accessToken = getAccessToken(context);
       if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
       try {
          const org = await organizationService.getOrganizationById(context.currentUser!.id, args.id, accessToken);
          return org as Organization | null;
       } catch (e) {
           throw processZodError(e, 'fetching organization by ID');
       }
    },

    // --- Deal Resolvers ---
    deals: async (_parent: unknown, _args: unknown, context: GraphQLContext): Promise<Deal[]> => {
       requireAuthentication(context);
       const accessToken = getAccessToken(context);
       if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
       try {
           const dealList = await dealService.getDeals(context.currentUser!.id, accessToken);
           return dealList as Deal[];
       } catch (e) {
           throw processZodError(e, 'fetching deals list');
       }
    },
    deal: async (_parent: unknown, args: QueryDealArgs, context: GraphQLContext): Promise<Deal | null> => {
       requireAuthentication(context);
       const accessToken = getAccessToken(context);
       if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
       try {
           const dealResult = await dealService.getDealById(context.currentUser!.id, args.id, accessToken);
           return dealResult as Deal | null;
       } catch (e) {
           throw processZodError(e, 'fetching deal by ID');
       }
    },
    // Pipeline Resolvers
    pipelines: async (_parent: unknown, _args: unknown, context: GraphQLContext): Promise<Pipeline[]> => {
        const action = 'fetching pipelines';
        try {
            requireAuthentication(context);
            const accessToken = getAccessToken(context)!;
            const pipelineList = await pipelineService.getPipelines(accessToken);
            return pipelineList as Pipeline[];
        } catch (error) { 
            console.error(`[Query.pipelines] Error during ${action}:`, error);
            throw processZodError(error, action); 
        }
    },
    pipeline: async (_parent: unknown, args: QueryPipelineArgs, context: GraphQLContext): Promise<Pipeline | null> => {
        const action = `fetching pipeline ${args.id}`;
        try {
            requireAuthentication(context);
            const accessToken = getAccessToken(context)!;
            const pipelineResult = await pipelineService.getPipelineById(accessToken, args.id);
            return pipelineResult as Pipeline | null;
        } catch (error) {
            console.error(`[Query.pipeline] Error during ${action}:`, error);
            throw processZodError(error, action); 
        }
    },
    // Stage Resolvers
    stages: async (_parent: unknown, args: QueryStagesArgs, context: GraphQLContext): Promise<Stage[]> => {
        const action = `fetching stages for pipeline ${args.pipelineId}`;
        try {
            requireAuthentication(context);
            const accessToken = getAccessToken(context)!;
            if (!args.pipelineId) throw new GraphQLError("pipelineId is required", { extensions: { code: 'BAD_USER_INPUT' } });
            const stageList = await stageService.getStagesByPipelineId(accessToken, args.pipelineId);
            return stageList as Stage[];
        } catch (error) { 
            console.error(`[Query.stages] Error during ${action}:`, error);
            throw processZodError(error, action); 
        }
    },
    stage: async (_parent: unknown, args: QueryStageArgs, context: GraphQLContext): Promise<Stage | null> => {
        const action = `fetching stage ${args.id}`;
        try {
            requireAuthentication(context);
            const accessToken = getAccessToken(context)!;
            const stageResult = await stageService.getStageById(accessToken, args.id);
            return stageResult as Stage | null;
        } catch (error) {
            console.error(`[Query.stage] Error during ${action}:`, error);
            throw processZodError(error, action);
        }
    },
    // --- My Permissions Query ---
    myPermissions: (_parent: unknown, _args: unknown, context: GraphQLContext): string[] => {
        requireAuthentication(context);
        return context.userPermissions ?? [];
    },
}; 