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
      const action = 'fetching people list';
      try {
          requireAuthentication(context);
          const accessToken = getAccessToken(context);
          if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
          // Use the service function which handles auth
          return await personService.getPeople(context.currentUser!.id, accessToken);
      } catch (e) {
         throw processZodError(e, action);
      }
    },
    person: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const action = 'fetching person by ID';
      try {
          requireAuthentication(context);
          const accessToken = getAccessToken(context);
          if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
          // Use the service function which handles auth
          return await personService.getPersonById(context.currentUser!.id, id, accessToken);
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
         // Use the service function which handles auth
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
          // Use the service function which handles auth
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
           // Use the service function which handles auth and includes nested selects
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
           // Use the service function which handles auth and includes nested selects
           return await dealService.getDealById(context.currentUser!.id, id, accessToken);
       } catch (e) {
           throw processZodError(e, 'fetching deal by ID');
       }
    },
    // Pipeline Resolvers
    pipelines: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
        const action = 'fetching pipelines';
        try {
            requireAuthentication(context);
            const accessToken = getAccessToken(context)!;
            // Use the service function which handles auth
            return await pipelineService.getPipelines(accessToken);
        } catch (error) { 
            console.error(`[Query.pipelines] Error during ${action}:`, error);
            throw processZodError(error, action); 
        }
    },
    pipeline: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
        const action = `fetching pipeline ${id}`;
        try {
            requireAuthentication(context);
            const accessToken = getAccessToken(context)!;
            // Use the service function which handles auth
            return await pipelineService.getPipelineById(accessToken, id);
        } catch (error) {
            console.error(`[Query.pipeline] Error during ${action}:`, error);
            throw processZodError(error, action); 
        }
    },
    // Stage Resolvers
    stages: async (_parent: unknown, { pipelineId }: { pipelineId: string }, context: GraphQLContext) => {
        const action = `fetching stages for pipeline ${pipelineId}`;
        try {
            requireAuthentication(context);
            const accessToken = getAccessToken(context)!;
            if (!pipelineId) throw new GraphQLError("pipelineId is required", { extensions: { code: 'BAD_USER_INPUT' } });
            // Use the service function which handles auth
            return await stageService.getStagesByPipelineId(accessToken, pipelineId);
        } catch (error) { 
            console.error(`[Query.stages] Error during ${action}:`, error);
            throw processZodError(error, action); 
        }
    },
    stage: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
        const action = `fetching stage ${id}`;
        try {
            requireAuthentication(context);
            const accessToken = getAccessToken(context)!;
             // Use the service function which handles auth
            return await stageService.getStageById(accessToken, id);
        } catch (error) {
            console.error(`[Query.stage] Error during ${action}:`, error);
            throw processZodError(error, action);
        }
    },
    // --- My Permissions Query ---
    myPermissions: (_: any, __: any, context: GraphQLContext): string[] => {
        requireAuthentication(context); // Ensure user is logged in
        // Permissions are already fetched in the context factory
        return context.userPermissions ?? []; // Return fetched permissions or empty array
    },
}; 