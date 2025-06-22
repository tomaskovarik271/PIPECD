import { GraphQLError } from 'graphql';
import { requireAuthentication, getAccessToken } from '../helpers';
import { GraphQLContext } from '../types';
import { 
  convertLeadToDeal,
  LeadToDealConversionInput,
  convertDealToLead,
  DealToLeadConversionInput,
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
  targetType?: string;
  preserveActivities?: boolean;
  createConversionActivity?: boolean;
  notes?: string;
  dealData?: {
    name?: string;
    amount?: number;
    currency?: string;
    expected_close_date?: string;
    deal_specific_probability?: number;
    wfmProjectTypeId?: string;
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
        const canConvertLead = context.userPermissions?.includes('lead:convert') ||
                              context.userPermissions?.includes('lead:update_any') || 
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
          wfmProjectTypeId: args.input.dealData?.wfmProjectTypeId,
          targetWfmStepId: args.input.targetWfmStepId
        };

        const result = await convertLeadToDeal(
          conversionInput,
          userId,
          context.supabaseClient,
          accessToken
        );

        if (!result.success) {
          throw new GraphQLError(result.message || 'Conversion failed', {
            extensions: { code: 'CONVERSION_FAILED', errors: result.errors }
          });
        }

        // Fetch created entities for response
        let person = null;
        let organization = null;
        let deal = null;

        // Fetch deal
        if (result.dealId) {
          const { data: dealData } = await context.supabaseClient
            .from('deals')
            .select('*')
            .eq('id', result.dealId)
            .single();
          
          if (dealData) {
            deal = dealData;
          }
        }

        // Fetch person
        if (result.personId) {
          const { data: personData } = await context.supabaseClient
            .from('people')
            .select('*')
            .eq('id', result.personId)
            .single();
          
          if (personData) {
            person = personData;
          }
        }

        // Fetch organization
        if (result.organizationId) {
          const { data: orgData } = await context.supabaseClient
            .from('organizations')
            .select('*')
            .eq('id', result.organizationId)
            .single();
          
          if (orgData) {
            organization = orgData;
          }
        }

        // Return in the correct LeadConversionResult format
        return {
          leadId: args.id,
          convertedEntities: {
            person,
            organization,
            deal
          }
        };

      } catch (error) {
        console.error('Error converting lead to deal:', error);
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError('Failed to convert lead to deal', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    // Placeholder for backwards conversion (Phase 2)
    convertDealToLead: async (
      _parent: any,
      args: { id: string; input: any },
      context: GraphQLContext
    ) => {
      try {
        requireAuthentication(context);
        const userId = context.currentUser!.id;
        const accessToken = getAccessToken(context)!;

        // Check permissions
        const canConvertDeal = context.userPermissions?.includes('deal:convert') ||
                              context.userPermissions?.includes('deal:update_any') || 
                              context.userPermissions?.includes('deal:update_own');
        
        if (!canConvertDeal) {
          throw new GraphQLError('Insufficient permissions to convert deals', {
            extensions: { code: 'FORBIDDEN' }
          });
        }

        // Convert GraphQL input to service input
        const conversionInput: DealToLeadConversionInput = {
          dealId: args.id,
          preserveActivities: args.input.preserveActivities,
          createConversionActivity: args.input.createConversionActivity,
          notes: args.input.notes,
          conversionReason: args.input.conversionReason,
          leadData: args.input.leadData,
          archiveDeal: args.input.archiveDeal
        };

        const result = await convertDealToLead(
          conversionInput,
          userId,
          context.supabaseClient,
          accessToken
        );

        if (!result.success) {
          throw new GraphQLError(result.message || 'Conversion failed', {
            extensions: { code: 'CONVERSION_FAILED', errors: result.errors }
          });
        }

        // Fetch created lead for response
        let lead = null;
        if (result.leadId) {
          const { data: leadData } = await context.supabaseClient
            .from('leads')
            .select('*')
            .eq('id', result.leadId)
            .single();
          
          if (leadData) {
            lead = leadData;
          }
        }

        // Return in the correct DealToLeadConversionResult format
        return {
          success: result.success,
          conversionId: result.conversionId,
          message: result.message,
          errors: result.errors || [],
          lead,
          reactivationPlan: null, // TODO: Implement reactivation plans
          conversionHistory: null // TODO: Fetch conversion history
        };

      } catch (error) {
        console.error('Error converting deal to lead:', error);
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError('Failed to convert deal to lead', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
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