// Resolvers for Query operations
import { GraphQLError } from 'graphql';
import { supabase, supabaseAdmin } from '../../../../lib/supabaseClient';
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
import * as leadService from '../../../../lib/leadService';
import { googleIntegrationService } from '../../../../lib/googleIntegrationService';
import { dealParticipantQueries } from './queries/dealParticipantQueries';

// Import generated types from backend codegen
import type {
    QueryResolvers,
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
          roles: [] // Roles will be resolved by the User.roles resolver    
        };
      } catch (error) {
        console.error(`[Query.me] Error fetching profile for user ${currentUser.id}:`, error);
        // Fallback: return basic info, but email is guaranteed by the check above.
        return {
            id: currentUser.id,
            email: currentUser.email, // currentUser.email is guaranteed here
            display_name: null,
            avatar_url: null,
            roles: [] // Roles will be resolved by the User.roles resolver
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
                currency: d.currency,
                amount_usd: d.amount_usd,
                exchange_rate_used: d.exchange_rate_used,
                expected_close_date: d.expected_close_date,
                project_id: (d as any).project_id,
                wfm_project_id: d.wfm_project_id,
                person_id: d.person_id,
                organization_id: d.organization_id,
                deal_specific_probability: d.deal_specific_probability,
                assigned_to_user_id: d.assigned_to_user_id,
                db_custom_field_values: (d as any).custom_field_values, 
           })) as any; 
       } catch (e) {
           throw processZodError(e, 'fetching deals list');
       }
    },
    deal: async (_parent, args, context) => {
       // console.log('[Plain Resolver Query.deal] Received args:', JSON.stringify(args, null, 2));
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
                currency: d.currency,
                amount_usd: d.amount_usd,
                exchange_rate_used: d.exchange_rate_used,
                expected_close_date: d.expected_close_date,
                project_id: (d as any).project_id,
                wfm_project_id: d.wfm_project_id,
                person_id: d.person_id,
                organization_id: d.organization_id,
                deal_specific_probability: d.deal_specific_probability,
                assigned_to_user_id: d.assigned_to_user_id,
                db_custom_field_values: (d as any).custom_field_values, 
           } as any; 
       } catch (e) {
           throw processZodError(e, 'fetching deal by ID');
       }
    },

    // --- Lead Resolvers ---
    leads: async (_parent, _args, context) => {
       requireAuthentication(context);
       const accessToken = getAccessToken(context)!;
       try {
           const leadList = await leadService.getLeads(context.currentUser!.id, accessToken);
           return leadList.map((l: any) => ({
                id: l.id,
                user_id: l.user_id,
                created_at: l.created_at,
                updated_at: l.updated_at,
                name: l.name,
                source: l.source,
                description: l.description,
                contact_name: l.contact_name,
                contact_email: l.contact_email,
                contact_phone: l.contact_phone,
                company_name: l.company_name,
                estimated_value: l.estimated_value,
                estimated_close_date: l.estimated_close_date,
                lead_score: l.lead_score,
                assigned_to_user_id: l.assigned_to_user_id,
                assigned_at: l.assigned_at,
                converted_at: l.converted_at,
                converted_to_deal_id: l.converted_to_deal_id,
                converted_to_person_id: l.converted_to_person_id,
                converted_to_organization_id: l.converted_to_organization_id,
                converted_by_user_id: l.converted_by_user_id,
                wfm_project_id: l.wfm_project_id,
                last_activity_at: l.last_activity_at,
                automation_score_factors: l.automation_score_factors,
                ai_insights: l.ai_insights,
                created_by_user_id: l.created_by_user_id,
                db_custom_field_values: (l as any).custom_field_values,
           })) as any; 
       } catch (e) {
           throw processZodError(e, 'fetching leads list');
       }
    },
    lead: async (_parent, args, context) => {
       // console.log('[Plain Resolver Query.lead] Received args:', JSON.stringify(args, null, 2));
       if (!args || args.id === undefined || args.id === null) { 
         console.error('[Plain Resolver Query.lead] args.id is MISSING or null/undefined!', args);
       }
       requireAuthentication(context);
       const accessToken = getAccessToken(context)!;
       try {
           const l = await leadService.getLeadById(context.currentUser!.id, args.id, accessToken);
           if (!l) return null;
           return {
                id: l.id,
                user_id: l.user_id,
                created_at: l.created_at,
                updated_at: l.updated_at,
                name: l.name,
                source: l.source,
                description: l.description,
                contact_name: l.contact_name,
                contact_email: l.contact_email,
                contact_phone: l.contact_phone,
                company_name: l.company_name,
                estimated_value: l.estimated_value,
                estimated_close_date: l.estimated_close_date,
                lead_score: l.lead_score,
                assigned_to_user_id: l.assigned_to_user_id,
                assigned_at: l.assigned_at,
                converted_at: l.converted_at,
                converted_to_deal_id: l.converted_to_deal_id,
                converted_to_person_id: l.converted_to_person_id,
                converted_to_organization_id: l.converted_to_organization_id,
                converted_by_user_id: l.converted_by_user_id,
                wfm_project_id: l.wfm_project_id,
                last_activity_at: l.last_activity_at,
                automation_score_factors: l.automation_score_factors,
                ai_insights: l.ai_insights,
                created_by_user_id: l.created_by_user_id,
                db_custom_field_values: (l as any).custom_field_values,
           } as any; 
       } catch (e) {
           throw processZodError(e, 'fetching lead by ID');
       }
    },
    leadsStats: async (_parent, _args, context) => {
       requireAuthentication(context);
       const accessToken = getAccessToken(context)!;
       try {
           const leadList = await leadService.getLeads(context.currentUser!.id, accessToken);
           
           const totalLeads = leadList.length;
           // Note: Since qualification is now computed from WFM metadata, 
           // we'll use a simple approximation for now - leads that have WFM projects are "qualified"
           const qualifiedLeads = leadList.filter((l: any) => l.wfm_project_id).length;
           const convertedLeads = leadList.filter((l: any) => l.converted_at).length;
           const averageLeadScore = totalLeads > 0 ? 
               leadList.reduce((sum: number, l: any) => sum + l.lead_score, 0) / totalLeads : 0;
           const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
           // Placeholder for averageQualificationLevel - would need WFM metadata computation
           const averageQualificationLevel = 0.5; // TODO: Compute from WFM step metadata
           
           return {
               totalLeads,
               qualifiedLeads,
               convertedLeads,
               averageLeadScore,
               conversionRate,
               averageQualificationLevel,
           };
       } catch (e) {
           throw processZodError(e, 'fetching leads stats');
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
    wfmStatuses: async (_parent, _args, context: GraphQLContext) => {
      requireAuthentication(context);
      return wfmStatusService.getAll(_args.isArchived || false, context);
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

    // Resolver for fetching all users (admin only - for user management)
    users: async (_parent, _args, context: GraphQLContext): Promise<GraphQLUser[]> => {
      requireAuthentication(context); // Ensure user is logged in
      
          // Check if user has admin permissions to view user list (check for app_settings:manage which only admins have)
    if (!context.userPermissions?.includes('app_settings:manage')) {
      throw new GraphQLError('Forbidden: Only admins can view user list', { extensions: { code: 'FORBIDDEN' } });
    }
      
      if (!supabaseAdmin) {
        console.error('Error fetching users: supabaseAdmin client is not available. Check SUPABASE_SERVICE_ROLE_KEY.');
        throw new GraphQLError('Could not fetch users due to server configuration error.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }

      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('user_id, email, display_name, avatar_url');

      if (error) {
        console.error('Error fetching users:', error);
        throw new GraphQLError('Could not fetch users', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }

      return data
        .filter(profile => profile.email != null) // Filter out profiles with null email
        .map(profile => ({
          id: profile.user_id, // Map user_id to id for GraphQL User type
          email: profile.email!, // Now safe due to the filter
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          roles: [] // Roles will be resolved by the User.roles resolver
        })) as GraphQLUser[]; // Cast to GraphQLUser[] as User type in resolver can be more generic
    },

    // Resolver for fetching assignable users (for deal assignment - requires deal assignment permissions)
    assignableUsers: async (_parent, _args, context: GraphQLContext): Promise<GraphQLUser[]> => {
      requireAuthentication(context); // Ensure user is logged in
      
      // Check if user has deal assignment permissions (either assign_own or assign_any)
      const canAssignOwn = context.userPermissions?.includes('deal:assign_own') || false;
      const canAssignAny = context.userPermissions?.includes('deal:assign_any') || false;
      
      if (!canAssignOwn && !canAssignAny) {
        throw new GraphQLError('Forbidden: You need deal assignment permissions to view assignable users', { extensions: { code: 'FORBIDDEN' } });
      }
      
      if (!supabaseAdmin) {
        console.error('Error fetching assignable users: supabaseAdmin client is not available. Check SUPABASE_SERVICE_ROLE_KEY.');
        throw new GraphQLError('Could not fetch assignable users due to server configuration error.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }

      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('user_id, email, display_name, avatar_url');

      if (error) {
        console.error('Error fetching assignable users:', error);
        throw new GraphQLError('Could not fetch assignable users', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }

      return data
        .filter(profile => profile.email != null && profile.email !== 'system@automation.cz') // Filter out profiles with null email and system user
        .map(profile => ({
          id: profile.user_id, // Map user_id to id for GraphQL User type
          email: profile.email!, // Now safe due to the filter
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          roles: [] // Roles will be resolved by the User.roles resolver
        })) as GraphQLUser[]; // Cast to GraphQLUser[] as User type in resolver can be more generic
    },

    // Resolver for fetching all roles
    roles: async (_parent, _args, context: GraphQLContext) => {
      requireAuthentication(context);
      
      // Check if user has admin permissions to view roles (check for app_settings:manage which only admins have)
      if (!context.userPermissions?.includes('app_settings:manage')) {
        throw new GraphQLError('Forbidden: Only admins can view roles', { extensions: { code: 'FORBIDDEN' } });
      }

      if (!supabaseAdmin) {
        throw new GraphQLError('Could not fetch roles due to server configuration error.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }

      const { data, error } = await supabaseAdmin
        .from('roles')
        .select('id, name, description')
        .order('name');

      if (error) {
        console.error('Error fetching roles:', error);
        throw new GraphQLError('Could not fetch roles', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }

      return data;
    },

    // --- Google Integration Resolvers ---
    googleIntegrationStatus: async (_parent, _args, context) => {
      const { userId, accessToken } = requireAuthentication(context);
      
      try {
        const status = await googleIntegrationService.getIntegrationStatus(userId, accessToken);
        // Convert tokenExpiry string to Date if it exists
        return {
          ...status,
          tokenExpiry: status.tokenExpiry ? new Date(status.tokenExpiry) : null
        };
      } catch (error) {
        console.error('Error getting Google integration status:', error);
        throw new GraphQLError('Failed to get Google integration status');
      }
    },

    getEntityDocuments: async (_parent, { entityType: _entityType, entityId: _entityId }, context) => {
      const { userId: _userId, accessToken: _accessToken } = requireAuthentication(context);
      
      try {
        // TODO: Implement document retrieval service
        throw new GraphQLError('Document retrieval not yet implemented');
      } catch (error) {
        console.error('Error getting entity documents:', error);
        throw new GraphQLError('Failed to get entity documents');
      }
    },

    getEntityEmails: async (_parent, { entityType: _entityType, entityId: _entityId }, context) => {
      const { userId: _userId, accessToken: _accessToken } = requireAuthentication(context);
      
      try {
        // TODO: Implement email retrieval service
        throw new GraphQLError('Email retrieval not yet implemented');
      } catch (error) {
        console.error('Error getting entity emails:', error);
        throw new GraphQLError('Failed to get entity emails');
      }
    },

    searchEmails: async (_parent, { query: _query, entityType: _entityType, limit: _limit }, context) => {
      const { userId: _userId, accessToken: _accessToken } = requireAuthentication(context);
      
      try {
        // TODO: Implement email search service
        throw new GraphQLError('Email search not yet implemented');
      } catch (error) {
        console.error('Error searching emails:', error);
        throw new GraphQLError('Failed to search emails');
      }
    },

    // Enhanced: Deal participant queries
    ...dealParticipantQueries,

    // Note: Activity reminder queries will be added after GraphQL schema is updated and types are regenerated
}; 