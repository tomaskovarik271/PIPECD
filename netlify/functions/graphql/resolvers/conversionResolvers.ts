import { GraphQLError } from 'graphql';
import { requireAuthentication, getAccessToken } from '../helpers';
import { GraphQLContext } from '../types';
import { 
  convertLeadToDeal,
  LeadToDealConversionInput,
  getConversionHistory,
  validateConversion
} from '../../../../lib/conversionService';

// Type definitions for GraphQL resolvers
interface GraphQLConversionHistory {
  id: string;
  conversionType: string;
  sourceEntityType: string;
  sourceEntityId: string;
  targetEntityType: string;
  targetEntityId: string;
  conversionReason?: string;
  conversionData: any;
  wfmTransitionPlan: any;
  convertedByUserId?: string;
  convertedAt: string;
  createdAt: string;
}

interface GraphQLLeadConversionInput {
  preserveActivities?: boolean;
  createConversionActivity?: boolean;
  notes?: string;
  dealData?: {
    name?: string;
    amount?: number;
    currency?: string;
    expected_close_date?: string;
    deal_specific_probability?: number;
  };
  personData?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  organizationData?: {
    name?: string;
    address?: string;
    notes?: string;
  };
  wfmProjectTypeId?: string;
  targetWfmStepId?: string;
}

export const conversionResolvers = {
  Query: {
    // Get conversion history for an entity
    conversionHistory: async (
      _parent: any,
      args: { entityType: string; entityId: string },
      context: GraphQLContext
    ): Promise<GraphQLConversionHistory[]> => {
      try {
        requireAuthentication(context);
        const { entityType, entityId } = args;

        const history = await getConversionHistory(
          entityType as 'lead' | 'deal',
          entityId,
          context.supabaseClient
        );

        return history.map(entry => ({
          id: entry.id,
          conversionType: entry.conversionType,
          sourceEntityType: entry.sourceEntityType,
          sourceEntityId: entry.sourceEntityId,
          targetEntityType: entry.targetEntityType,
          targetEntityId: entry.targetEntityId,
          conversionReason: entry.conversionReason,
          conversionData: entry.conversionData,
          wfmTransitionPlan: entry.wfmTransitionPlan,
          convertedByUserId: entry.convertedByUserId,
          convertedAt: entry.convertedAt,
          createdAt: entry.createdAt
        }));
      } catch (error) {
        console.error('Error fetching conversion history:', error);
        throw new GraphQLError('Failed to fetch conversion history', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    // Get single conversion history entry
    conversionHistoryById: async (
      _parent: any,
      args: { id: string },
      context: GraphQLContext
    ): Promise<GraphQLConversionHistory | null> => {
      try {
        requireAuthentication(context);
        
        const { data, error } = await context.supabaseClient
          .from('conversion_history')
          .select('*')
          .eq('id', args.id)
          .single();

        if (error || !data) {
          return null;
        }

        return {
          id: data.id,
          conversionType: data.conversion_type,
          sourceEntityType: data.source_entity_type,
          sourceEntityId: data.source_entity_id,
          targetEntityType: data.target_entity_type,
          targetEntityId: data.target_entity_id,
          conversionReason: data.conversion_reason || undefined,
          conversionData: data.conversion_data,
          wfmTransitionPlan: data.wfm_transition_plan,
          convertedByUserId: data.converted_by_user_id || undefined,
          convertedAt: data.converted_at || '',
          createdAt: data.created_at || ''
        };
      } catch (error) {
        console.error('Error fetching conversion history by ID:', error);
        return null;
      }
    },

    // Validate conversion before executing
    validateConversion: async (
      _parent: any,
      args: { sourceType: string; sourceId: string; targetType: string },
      context: GraphQLContext
    ) => {
      try {
        requireAuthentication(context);
        const userId = context.currentUser!.id;
        const accessToken = getAccessToken(context)!;

        const validationResult = await validateConversion({
          sourceType: args.sourceType as 'lead' | 'deal',
          sourceId: args.sourceId,
          targetType: args.targetType as 'deal' | 'lead',
          userId,
          supabase: context.supabaseClient,
          accessToken
        });

        return {
          isValid: validationResult.isValid,
          canProceed: validationResult.canProceed,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          sourceEntity: validationResult.sourceEntity
        };
      } catch (error) {
        console.error('Error validating conversion:', error);
        throw new GraphQLError('Failed to validate conversion', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    }
  },

  Mutation: {
    // Convert lead to deal
    convertLead: async (
      _parent: any,
      args: { id: string; input: GraphQLLeadConversionInput },
      context: GraphQLContext
    ) => {
      try {
        requireAuthentication(context);
        const userId = context.currentUser!.id;
        const accessToken = getAccessToken(context)!;

        // Check permissions
        const canConvertLead = context.userPermissions?.includes('lead:update_any') || 
                              context.userPermissions?.includes('lead:update_own');
        
        if (!canConvertLead) {
          throw new GraphQLError('Insufficient permissions to convert leads', {
            extensions: { code: 'FORBIDDEN' }
          });
        }

        // Convert GraphQL input to service input
        const conversionInput: LeadToDealConversionInput = {
          leadId: args.id,
          preserveActivities: args.input.preserveActivities,
          createConversionActivity: args.input.createConversionActivity,
          notes: args.input.notes,
          dealData: args.input.dealData,
          personData: args.input.personData,
          organizationData: args.input.organizationData,
          wfmProjectTypeId: args.input.wfmProjectTypeId,
          targetWfmStepId: args.input.targetWfmStepId
        };

        const result = await convertLeadToDeal(
          conversionInput,
          userId,
          context.supabaseClient,
          accessToken
        );

        // Fetch created entities for response
        let deal = null;
        let person = null;
        let organization = null;
        let wfmProject = null;
        let conversionHistory = null;

        if (result.success && result.dealId) {
          // Fetch deal
          const { data: dealData } = await context.supabaseClient
            .from('deals')
            .select('*')
            .eq('id', result.dealId)
            .single();
          
          if (dealData) {
            deal = {
              id: dealData.id,
              name: dealData.name,
              amount: dealData.amount,
              currency: dealData.currency,
              expected_close_date: dealData.expected_close_date,
              created_at: dealData.created_at,
              updated_at: dealData.updated_at,
              user_id: dealData.user_id,
              person_id: dealData.person_id,
              organization_id: dealData.organization_id,
              wfm_project_id: dealData.wfm_project_id,
              assigned_to_user_id: dealData.assigned_to_user_id,
              deal_specific_probability: dealData.deal_specific_probability,
              project_id: dealData.project_id
            };
          }

          // Fetch conversion history
          if (result.conversionId) {
            const { data: historyData } = await context.supabaseClient
              .from('conversion_history')
              .select('*')
              .eq('id', result.conversionId)
              .single();

            if (historyData) {
              conversionHistory = {
                id: historyData.id,
                conversionType: historyData.conversion_type,
                sourceEntityType: historyData.source_entity_type,
                sourceEntityId: historyData.source_entity_id,
                targetEntityType: historyData.target_entity_type,
                targetEntityId: historyData.target_entity_id,
                conversionReason: historyData.conversion_reason,
                conversionData: historyData.conversion_data,
                wfmTransitionPlan: historyData.wfm_transition_plan,
                convertedByUserId: historyData.converted_by_user_id,
                convertedAt: historyData.converted_at,
                createdAt: historyData.created_at
              };
            }
          }
        }

        return {
          success: result.success,
          conversionId: result.conversionId,
          message: result.message,
          errors: result.errors || [],
          deal,
          person,
          organization,
          wfmProject,
          conversionHistory
        };

      } catch (error) {
        console.error('Error converting lead to deal:', error);
        throw new GraphQLError('Failed to convert lead to deal', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    // Placeholder for backwards conversion (Phase 2)
    convertDealToLead: async (
      _parent: any,
      args: any,
      context: GraphQLContext
    ) => {
      throw new GraphQLError('Deal to lead conversion not yet implemented', {
        extensions: { code: 'NOT_IMPLEMENTED' }
      });
    }
  },

  // Field resolvers for enhanced types
  Lead: {
    conversionHistory: async (parent: any, _args: any, context: GraphQLContext) => {
      try {
        const history = await getConversionHistory('lead', parent.id, context.supabaseClient);
        return history.map(entry => ({
          id: entry.id,
          conversionType: entry.conversionType,
          sourceEntityType: entry.sourceEntityType,
          sourceEntityId: entry.sourceEntityId,
          targetEntityType: entry.targetEntityType,
          targetEntityId: entry.targetEntityId,
          conversionReason: entry.conversionReason,
          conversionData: entry.conversionData,
          wfmTransitionPlan: entry.wfmTransitionPlan,
          convertedByUserId: entry.convertedByUserId,
          convertedAt: entry.convertedAt,
          createdAt: entry.createdAt
        }));
      } catch (error) {
        console.error('Error fetching lead conversion history:', error);
        return [];
      }
    }
  },

  Deal: {
    conversionHistory: async (parent: any, _args: any, context: GraphQLContext) => {
      try {
        const history = await getConversionHistory('deal', parent.id, context.supabaseClient);
        return history.map(entry => ({
          id: entry.id,
          conversionType: entry.conversionType,
          sourceEntityType: entry.sourceEntityType,
          sourceEntityId: entry.sourceEntityId,
          targetEntityType: entry.targetEntityType,
          targetEntityId: entry.targetEntityId,
          conversionReason: entry.conversionReason,
          conversionData: entry.conversionData,
          wfmTransitionPlan: entry.wfmTransitionPlan,
          convertedByUserId: entry.convertedByUserId,
          convertedAt: entry.convertedAt,
          createdAt: entry.createdAt
        }));
      } catch (error) {
        console.error('Error fetching deal conversion history:', error);
        return [];
      }
    }
  },

  ConversionHistory: {
    convertedByUser: async (parent: any, _args: any, context: GraphQLContext) => {
      if (!parent.convertedByUserId) return null;
      
      try {
        const { data } = await context.supabaseClient
          .from('user_profiles')
          .select('*')
          .eq('id', parent.convertedByUserId)
          .single();
        
        return data;
      } catch (error) {
        console.error('Error fetching converted by user:', error);
        return null;
      }
    }
  }
}; 