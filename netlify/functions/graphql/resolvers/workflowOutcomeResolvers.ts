/**
 * Workflow Outcome Engine Resolvers
 * Provides GraphQL API for configurable WFM outcome management
 */

import { GraphQLError } from 'graphql';
import { requireAuthentication, GraphQLContext } from '../helpers';
import { createWorkflowOutcomeEngine } from '../../../../lib/workflowOutcomeEngine';

export const workflowOutcomeResolvers = {
  Query: {
    // Get available outcomes for an entity
    getAvailableOutcomes: async (_: any, { entityId, entityType }: { entityId: string; entityType: string }, context: GraphQLContext) => {
      const { userId } = requireAuthentication(context);
      
      try {
        const engine = createWorkflowOutcomeEngine(context.supabaseClient);
        const outcomes = await engine.getAvailableOutcomes(entityId, entityType, userId);
        
        return outcomes.map((outcome: any) => ({
          outcome: outcome.outcome_type,
          label: outcome.display_name,
          available: outcome.available,
          reason: outcome.reason,
          targetStepId: outcome.target_step_id,
          requiresConfirmation: false // Default for now
        }));
      } catch (error) {
        console.error('[getAvailableOutcomes] Error:', error);
        throw new GraphQLError('Failed to get available outcomes', {
          extensions: { code: 'WORKFLOW_OUTCOME_ERROR' }
        });
      }
    },

    // Get business outcome rules
    getBusinessOutcomeRules: async (_: any, { entityType, outcomeType }: { entityType?: string; outcomeType?: string }, context: any) => {
      const { supabaseClient } = await requireAuthentication(context);
      
      try {
        let query = supabaseClient
          .from('business_outcome_rules')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: true });

        if (entityType) {
          query = query.in('entity_type', [entityType, 'ANY']);
        }
        
        if (outcomeType) {
          query = query.eq('outcome_type', outcomeType);
        }

        const { data, error } = await query;
        
        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        return data.map(rule => ({
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
          updatedAt: rule.updated_at
        }));
      } catch (error) {
        console.error('[getBusinessOutcomeRules] Error:', error);
        throw new GraphQLError('Failed to get business outcome rules', {
          extensions: { code: 'WORKFLOW_OUTCOME_ERROR' }
        });
      }
    },

    // Get workflow behaviors
    getWorkflowBehaviors: async (_: any, { workflowId, behaviorType }: { workflowId: string; behaviorType?: string }, context: any) => {
      const { supabaseClient } = await requireAuthentication(context);
      
      try {
        let query = supabaseClient
          .from('workflow_behaviors')
          .select('*')
          .eq('workflow_id', workflowId)
          .eq('is_active', true);

        if (behaviorType) {
          query = query.eq('behavior_type', behaviorType);
        }

        const { data, error } = await query;
        
        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        return data.map(behavior => ({
          id: behavior.id,
          workflowId: behavior.workflow_id,
          behaviorType: behavior.behavior_type,
          configuration: behavior.configuration,
          isActive: behavior.is_active,
          createdAt: behavior.created_at,
          updatedAt: behavior.updated_at
        }));
      } catch (error) {
        console.error('[getWorkflowBehaviors] Error:', error);
        throw new GraphQLError('Failed to get workflow behaviors', {
          extensions: { code: 'WORKFLOW_OUTCOME_ERROR' }
        });
      }
    }
  },

  Mutation: {
    // Execute an outcome (WON/LOST/CONVERTED)
    executeOutcome: async (_: any, { input }: { input: any }, context: any) => {
      const { supabaseClient, user } = await requireAuthentication(context);
      
      try {
        const engine = createWorkflowOutcomeEngine(supabaseClient);
        const result = await engine.executeOutcome(
          input.entityId,
          input.entityType,
          input.outcome,
          {
            userId: user.id,
            confirmationReason: input.confirmationReason,
            additionalData: input.additionalData
          }
        );

        return {
          success: result.success,
          message: result.message,
          newStepId: result.newStepId,
          newProbability: result.newProbability,
          conversionCreated: result.conversionCreated || false,
          errors: result.errors || []
        };
      } catch (error) {
        console.error('[executeOutcome] Error:', error);
        return {
          success: false,
          message: `Execution failed: ${error.message}`,
          newStepId: null,
          newProbability: null,
          conversionCreated: false,
          errors: [error.message]
        };
      }
    },

    // Test outcome availability (no actual execution)
    testOutcomeAvailability: async (_: any, { entityId, entityType, outcome }: { entityId: string; entityType: string; outcome: string }, context: any) => {
      const { supabaseClient } = await requireAuthentication(context);
      
      try {
        const engine = createWorkflowOutcomeEngine(supabaseClient);
        const validation = await engine.validateOutcomeExecution(entityId, entityType, outcome);

        return {
          outcome,
          label: `${outcome} (Test Mode)`,
          available: validation.allowed,
          reason: validation.reason,
          targetStepId: validation.targetStepId,
          requiresConfirmation: validation.requiresConfirmation || false
        };
      } catch (error) {
        console.error('[testOutcomeAvailability] Error:', error);
        throw new GraphQLError('Failed to test outcome availability', {
          extensions: { code: 'WORKFLOW_OUTCOME_ERROR' }
        });
      }
    }
  }
}; 