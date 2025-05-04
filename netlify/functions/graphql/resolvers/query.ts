// Resolvers for Query operations
import { GraphQLError } from 'graphql';
import { supabase } from '../../../../lib/supabaseClient';
import { personService, PersonRecord } from '../../../../lib/personService';
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

export const Query = {
    health: () => 'Ok',
    supabaseConnectionTest: async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Supabase connection error:', error.message);
          return `Connection Error: ${error.message}`;
        }
        console.log('Supabase getSession data:', data);
        return 'Successfully connected to Supabase (getSession succeeded)';
      } catch (err: any) {
        console.error('Unexpected error during Supabase test:', err);
        return `Unexpected Error: ${err.message}`;
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
    people: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
      try {
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
        return people.map((p: PersonRecord) => ({
            id: p.id,
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
            return await stageService.getStagesByPipelineId(accessToken, pipelineId);
        } catch (error) { throw processZodError(error, 'fetching stages'); }
    },
}; 