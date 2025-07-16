import { requireAuthentication, getAccessToken } from '../helpers';
import { getAuthenticatedClient } from '../../../../lib/serviceUtils';
import { WFMOutcomeEngine } from '../../../../lib/wfmOutcomeEngine';
import { GraphQLError } from 'graphql';

export const wfmOutcomeResolvers = {
  Query: {
    // WFM Outcome Rules
    wfmOutcomeRules: async (_: any, args: { entityType?: string; outcomeType?: string; ruleType?: string; isActive?: boolean }, context: any) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      let query = supabase
        .from('wfm_outcome_rules')
        .select(`
          id,
          rule_name,
          description,
          entity_type,
          outcome_type,
          rule_type,
          conditions,
          restrictions,
          target_step_mapping,
          side_effects,
          is_active,
          priority,
          created_at,
          updated_at,
          created_by_user_id,
          updated_by_user_id
        `);

      if (args.entityType) query = query.eq('entity_type', args.entityType);
      if (args.outcomeType) query = query.eq('outcome_type', args.outcomeType);
      if (args.ruleType) query = query.eq('rule_type', args.ruleType);
      if (args.isActive !== undefined) query = query.eq('is_active', args.isActive);

      const { data, error } = await query.order('priority', { ascending: false });

      if (error) {
        throw new GraphQLError(`Failed to fetch WFM outcome rules: ${error.message}`);
      }

      return data?.map(rule => ({
        id: rule.id,
        ruleName: rule.rule_name,
        description: rule.description,
        entityType: rule.entity_type,
        outcomeType: rule.outcome_type,
        ruleType: rule.rule_type,
        conditions: rule.conditions,
        restrictions: rule.restrictions,
        targetStepMapping: rule.target_step_mapping,
        sideEffects: rule.side_effects,
        isActive: rule.is_active,
        priority: rule.priority,
        createdAt: rule.created_at,
        updatedAt: rule.updated_at,
        createdByUserId: rule.created_by_user_id,
        updatedByUserId: rule.updated_by_user_id
      })) || [];
    },

    wfmOutcomeRule: async (_: any, { id }: { id: string }, context: any) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      const { data, error } = await supabase
        .from('wfm_outcome_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new GraphQLError(`Failed to fetch WFM outcome rule: ${error.message}`);
      }

      if (!data) {
        throw new GraphQLError('WFM outcome rule not found');
      }

      return {
        id: data.id,
        ruleName: data.rule_name,
        description: data.description,
        entityType: data.entity_type,
        outcomeType: data.outcome_type,
        ruleType: data.rule_type,
        conditions: data.conditions,
        restrictions: data.restrictions,
        targetStepMapping: data.target_step_mapping,
        sideEffects: data.side_effects,
        isActive: data.is_active,
        priority: data.priority,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },

    // WFM Workflow Behaviors
    wfmWorkflowBehaviors: async (_: any, args: { workflowId?: string; behaviorType?: string; isActive?: boolean }, context: any) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      let query = supabase
        .from('wfm_workflow_behaviors')
        .select('*');

      if (args.workflowId) query = query.eq('workflow_id', args.workflowId);
      if (args.behaviorType) query = query.eq('behavior_type', args.behaviorType);
      if (args.isActive !== undefined) query = query.eq('is_active', args.isActive);

      const { data, error } = await query.order('priority', { ascending: false });

      if (error) {
        throw new GraphQLError(`Failed to fetch WFM workflow behaviors: ${error.message}`);
      }

      return data?.map(behavior => ({
        id: behavior.id,
        workflowId: behavior.workflow_id,
        behaviorType: behavior.behavior_type,
        configuration: behavior.configuration,
        appliesToSteps: behavior.applies_to_steps,
        userRoles: behavior.user_roles,
        isActive: behavior.is_active,
        priority: behavior.priority,
        createdAt: behavior.created_at,
        updatedAt: behavior.updated_at
      })) || [];
    },

    // WFM Step Mappings
    wfmStepMappings: async (_: any, args: { workflowId?: string; outcomeType?: string; isActive?: boolean }, context: any) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      let query = supabase
        .from('wfm_step_mappings')
        .select('*');

      if (args.workflowId) query = query.eq('workflow_id', args.workflowId);
      if (args.outcomeType) query = query.eq('outcome_type', args.outcomeType);
      if (args.isActive !== undefined) query = query.eq('is_active', args.isActive);

      const { data, error } = await query.order('priority', { ascending: false });

      if (error) {
        throw new GraphQLError(`Failed to fetch WFM step mappings: ${error.message}`);
      }

      return data?.map(mapping => ({
        id: mapping.id,
        workflowId: mapping.workflow_id,
        outcomeType: mapping.outcome_type,
        targetStepId: mapping.target_step_id,
        fromStepIds: mapping.from_step_ids,
        conditions: mapping.conditions,
        isActive: mapping.is_active,
        priority: mapping.priority,
        createdAt: mapping.created_at,
        updatedAt: mapping.updated_at
      })) || [];
    },

    // WFM Conversion Rules
    wfmConversionRules: async (_: any, args: { fromEntityType?: string; toEntityType?: string; isActive?: boolean }, context: any) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      let query = supabase
        .from('wfm_conversion_rules')
        .select('*');

      if (args.fromEntityType) query = query.eq('from_entity_type', args.fromEntityType);
      if (args.toEntityType) query = query.eq('to_entity_type', args.toEntityType);
      if (args.isActive !== undefined) query = query.eq('is_active', args.isActive);

      const { data, error } = await query.order('priority', { ascending: false });

      if (error) {
        throw new GraphQLError(`Failed to fetch WFM conversion rules: ${error.message}`);
      }

      return data?.map(rule => ({
        id: rule.id,
        ruleName: rule.rule_name,
        description: rule.description,
        fromEntityType: rule.from_entity_type,
        toEntityType: rule.to_entity_type,
        conditions: rule.conditions,
        restrictions: rule.restrictions,
        fieldMappings: rule.field_mappings,
        requiredPermissions: rule.required_permissions,
        blockedStatuses: rule.blocked_statuses,
        isActive: rule.is_active,
        priority: rule.priority,
        createdAt: rule.created_at,
        updatedAt: rule.updated_at
      })) || [];
    },

    // Get available outcomes for entity
    wfmAvailableOutcomes: async (_: any, { entityId, entityType }: { entityId: string; entityType: string }, context: any) => {
      const { userId } = requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      const wfmEngine = new WFMOutcomeEngine(supabase);
      
      // Get user permissions
      const { data: permissions } = await supabase.rpc('get_user_permissions', { user_id: userId });
      
      const outcomes = await wfmEngine.getAvailableOutcomes(
        entityId, 
        entityType as 'DEAL' | 'LEAD',
        {
          user_id: userId,
          user_permissions: permissions || []
        }
      );

      return outcomes.map(outcome => ({
        outcomeType: outcome.outcome_type,
        displayName: outcome.display_name,
        available: outcome.available,
        reason: outcome.reason,
        targetStepId: outcome.target_step_id,
        sideEffects: outcome.side_effects
      }));
    },

    // Get UI configuration for workflow
    wfmUIConfiguration: async (_: any, { workflowId, userRoles }: { workflowId: string; userRoles?: string[] }, context: any) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      const wfmEngine = new WFMOutcomeEngine(supabase);
      const config = await wfmEngine.getUIConfiguration(workflowId, userRoles);

      return {
        availableOutcomeTypes: config.availableOutcomeTypes,
        metadataFields: config.metadataFields,
        metadataSchema: config.metadataSchema,
        kanbanSettings: config.kanbanSettings
      };
    },

    // Get project type mapping
    wfmProjectTypeMapping: async (_: any, { entityType }: { entityType: string }, context: any) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      const wfmEngine = new WFMOutcomeEngine(supabase);
      return await wfmEngine.getProjectTypeMapping(entityType as 'DEAL' | 'LEAD');
    }
  },

  Mutation: {
    // Execute outcome
    wfmExecuteOutcome: async (_: any, { input }: { input: { entityId: string; entityType: string; outcome: string } }, context: any) => {
      const { userId } = requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      const wfmEngine = new WFMOutcomeEngine(supabase);
      
      // Get user permissions
      const { data: permissions } = await supabase.rpc('get_user_permissions', { user_id: userId });
      
      const result = await wfmEngine.executeOutcome(
        input.entityId,
        input.entityType as 'DEAL' | 'LEAD',
        input.outcome as 'WON' | 'LOST' | 'CONVERTED',
        {
          user_id: userId,
          user_permissions: permissions || []
        }
      );

      return {
        success: result.success,
        outcomeExecuted: result.outcome_executed,
        targetStepId: result.target_step_id,
        sideEffectsApplied: result.side_effects_applied,
        errors: result.errors
      };
    },

    // Create WFM Outcome Rule
    createWFMOutcomeRule: async (_: any, { input }: { input: any }, context: any) => {
      const { userId } = requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      // Check admin permissions
      const { data: permissions } = await supabase.rpc('get_user_permissions', { user_id: userId });
      if (!permissions?.includes('app_settings:manage')) {
        throw new GraphQLError('Insufficient permissions to manage WFM outcome rules');
      }

      const { data, error } = await supabase
        .from('wfm_outcome_rules')
        .insert({
          rule_name: input.ruleName,
          description: input.description,
          entity_type: input.entityType,
          outcome_type: input.outcomeType,
          rule_type: input.ruleType,
          conditions: input.conditions || {},
          restrictions: input.restrictions || {},
          target_step_mapping: input.targetStepMapping || {},
          side_effects: input.sideEffects || {},
          priority: input.priority || 100,
          created_by_user_id: userId,
          updated_by_user_id: userId
        })
        .select('*')
        .single();

      if (error) {
        throw new GraphQLError(`Failed to create WFM outcome rule: ${error.message}`);
      }

      return {
        id: data.id,
        ruleName: data.rule_name,
        description: data.description,
        entityType: data.entity_type,
        outcomeType: data.outcome_type,
        ruleType: data.rule_type,
        conditions: data.conditions,
        restrictions: data.restrictions,
        targetStepMapping: data.target_step_mapping,
        sideEffects: data.side_effects,
        isActive: data.is_active,
        priority: data.priority,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },

    // Update WFM Outcome Rule
    updateWFMOutcomeRule: async (_: any, { id, input }: { id: string; input: any }, context: any) => {
      const { userId } = requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      // Check admin permissions
      const { data: permissions } = await supabase.rpc('get_user_permissions', { user_id: userId });
      if (!permissions?.includes('app_settings:manage')) {
        throw new GraphQLError('Insufficient permissions to manage WFM outcome rules');
      }

      const updateData: any = {
        updated_by_user_id: userId,
        updated_at: new Date().toISOString()
      };

      if (input.ruleName !== undefined) updateData.rule_name = input.ruleName;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.entityType !== undefined) updateData.entity_type = input.entityType;
      if (input.outcomeType !== undefined) updateData.outcome_type = input.outcomeType;
      if (input.ruleType !== undefined) updateData.rule_type = input.ruleType;
      if (input.conditions !== undefined) updateData.conditions = input.conditions;
      if (input.restrictions !== undefined) updateData.restrictions = input.restrictions;
      if (input.targetStepMapping !== undefined) updateData.target_step_mapping = input.targetStepMapping;
      if (input.sideEffects !== undefined) updateData.side_effects = input.sideEffects;
      if (input.isActive !== undefined) updateData.is_active = input.isActive;
      if (input.priority !== undefined) updateData.priority = input.priority;

      const { data, error } = await supabase
        .from('wfm_outcome_rules')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw new GraphQLError(`Failed to update WFM outcome rule: ${error.message}`);
      }

      return {
        id: data.id,
        ruleName: data.rule_name,
        description: data.description,
        entityType: data.entity_type,
        outcomeType: data.outcome_type,
        ruleType: data.rule_type,
        conditions: data.conditions,
        restrictions: data.restrictions,
        targetStepMapping: data.target_step_mapping,
        sideEffects: data.side_effects,
        isActive: data.is_active,
        priority: data.priority,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },

    // Delete WFM Outcome Rule
    deleteWFMOutcomeRule: async (_: any, { id }: { id: string }, context: any) => {
      const { userId } = requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      // Check admin permissions
      const { data: permissions } = await supabase.rpc('get_user_permissions', { user_id: userId });
      if (!permissions?.includes('app_settings:manage')) {
        throw new GraphQLError('Insufficient permissions to manage WFM outcome rules');
      }

      const { error } = await supabase
        .from('wfm_outcome_rules')
        .delete()
        .eq('id', id);

      if (error) {
        throw new GraphQLError(`Failed to delete WFM outcome rule: ${error.message}`);
      }

      return true;
    }

    // Note: Additional CRUD mutations for other types (behaviors, mappings, conversion rules) 
    // would follow the same pattern as above but are omitted for brevity
  }
}; 