/**
 * WorkflowOutcomeEngine - Configurable WFM Business Logic
 * 
 * Replaces hardcoded WFM business logic with configurable, database-driven rules.
 * Enables dynamic WON/LOST/CONVERT buttons and no-code workflow management.
 * Focused on workflow outcomes and WFM behavior - separate from general Business Rules Engine.
 * 
 * @version 1.0
 * @phase Phase 1 - Foundation
 */

import { GraphQLError } from 'graphql';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// ================================
// TYPES AND INTERFACES
// ================================

export interface BusinessRule {
  id: string;
  rule_name: string;
  description: string | null;
  entity_type: 'DEAL' | 'LEAD' | 'ANY';
  outcome_type: 'WON' | 'LOST' | 'CONVERTED';
  rule_type: 'ALLOW_FROM_ANY' | 'PROBABILITY_THRESHOLD' | 'STEP_SPECIFIC' | 'WORKFLOW_SPECIFIC';
  conditions: Record<string, any>;
  restrictions: Record<string, any>;
  target_step_mapping: Record<string, string>;
  side_effects: Record<string, any>;
  is_active: boolean;
  priority: number;
}

export interface OutcomeOption {
  outcome_type: 'WON' | 'LOST' | 'CONVERTED';
  display_name: string;
  available: boolean;
  reason?: string; // Why not available if false
  target_step_id?: string;
  side_effects?: Record<string, any>;
}

export interface ExecutionContext {
  entity_id: string;
  entity_type: 'DEAL' | 'LEAD';
  current_step_id?: string;
  workflow_id?: string;
  user_id: string;
  user_permissions: string[];
  entity_data?: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  rule_matches: BusinessRule[];
}

export interface ExecutionResult {
  success: boolean;
  outcome_executed: string;
  target_step_id: string;
  side_effects_applied: Record<string, any>;
  errors?: string[];
  wfm_project_updated?: boolean;
  history_recorded?: boolean;
}

export interface OutcomeStepMapping {
  id: string;
  workflow_id: string;
  outcome_type: 'WON' | 'LOST' | 'CONVERTED';
  target_step_id: string;
  from_step_ids: string[] | null;
  conditions: Record<string, any>;
  is_active: boolean;
}

export interface WorkflowBehavior {
  id: string;
  workflow_id: string;
  behavior_type: 'KANBAN_VISIBILITY' | 'BUTTON_AVAILABILITY' | 'AUTO_TRANSITIONS' | 'UI_CUSTOMIZATION';
  configuration: Record<string, any>;
  applies_to_steps: string[] | null;
  user_roles: string[] | null;
  is_active: boolean;
}

// ================================
// BUSINESS RULE ENGINE CLASS
// ================================

export class WorkflowOutcomeEngine {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient;
  }

  // ================================
  // CORE RULE EVALUATION
  // ================================

  /**
   * Get available outcomes for an entity based on business rules
   */
  async getAvailableOutcomes(
    entityId: string, 
    entityType: 'DEAL' | 'LEAD',
    context: ExecutionContext
  ): Promise<OutcomeOption[]> {
    try {
      // Get entity's current WFM state
      const entityState = await this.getEntityWFMState(entityId, entityType);
      if (!entityState) {
        return [];
      }

      // Get applicable business rules
      const rules = await this.getRulesForEntity(entityType, entityState.workflow_id);
      
      // Evaluate each outcome type
      const outcomes: OutcomeOption[] = [];
      const outcomeTypes: Array<'WON' | 'LOST' | 'CONVERTED'> = ['WON', 'LOST', 'CONVERTED'];
      
      for (const outcomeType of outcomeTypes) {
        const outcomeRules = rules.filter(r => r.outcome_type === outcomeType);
        const evaluation = await this.evaluateOutcomeAvailability(
          outcomeType, 
          outcomeRules, 
          { ...context, ...entityState }
        );
        
        outcomes.push({
          outcome_type: outcomeType,
          display_name: this.getOutcomeDisplayName(outcomeType),
          available: evaluation.available,
          reason: evaluation.reason,
          target_step_id: evaluation.target_step_id,
          side_effects: evaluation.side_effects
        });
      }

      return outcomes;
    } catch (error) {
      console.error('[WorkflowOutcomeEngine.getAvailableOutcomes] Error:', error);
      throw new GraphQLError('Failed to evaluate available outcomes', {
        extensions: { code: 'BUSINESS_RULE_ERROR' }
      });
    }
  }

  /**
   * Validate if outcome execution is allowed
   */
  async validateOutcomeExecution(
    entityId: string,
    entityType: 'DEAL' | 'LEAD',
    outcome: 'WON' | 'LOST' | 'CONVERTED',
    context: ExecutionContext
  ): Promise<ValidationResult> {
    try {
      const entityState = await this.getEntityWFMState(entityId, entityType);
      if (!entityState) {
        return {
          valid: false,
          errors: ['Entity has no WFM state'],
          warnings: [],
          rule_matches: []
        };
      }

      const rules = await this.getRulesForEntity(entityType, entityState.workflow_id);
      const applicableRules = rules.filter(r => r.outcome_type === outcome);
      
      const errors: string[] = [];
      const warnings: string[] = [];
      const matchingRules: BusinessRule[] = [];

      for (const rule of applicableRules) {
        const evaluation = await this.evaluateRule(rule, { ...context, ...entityState });
        
        if (evaluation.matches) {
          matchingRules.push(rule);
        } else if (evaluation.blocking) {
          errors.push(evaluation.reason || `Rule ${rule.rule_name} prevents this outcome`);
        } else if (evaluation.warning) {
          warnings.push(evaluation.reason || `Rule ${rule.rule_name} has warnings`);
        }
      }

      return {
        valid: errors.length === 0 && matchingRules.length > 0,
        errors,
        warnings,
        rule_matches: matchingRules
      };
    } catch (error) {
      console.error('[WorkflowOutcomeEngine.validateOutcomeExecution] Error:', error);
      return {
        valid: false,
        errors: ['Failed to validate outcome execution'],
        warnings: [],
        rule_matches: []
      };
    }
  }

  /**
   * Execute business outcome with full validation and side effects
   */
  async executeOutcome(
    entityId: string,
    entityType: 'DEAL' | 'LEAD',
    outcome: 'WON' | 'LOST' | 'CONVERTED',
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    try {
      // 1. Validate execution is allowed
      const validation = await this.validateOutcomeExecution(entityId, entityType, outcome, context);
      if (!validation.valid) {
        return {
          success: false,
          outcome_executed: outcome,
          target_step_id: '',
          side_effects_applied: {},
          errors: validation.errors
        };
      }

      // 2. Get target step for outcome
      const entityState = await this.getEntityWFMState(entityId, entityType);
      if (!entityState) {
        throw new Error('Entity WFM state not found');
      }

      const targetStepId = await this.findTargetStepForOutcome(
        entityState.workflow_id, 
        outcome, 
        entityState.current_step_id
      );
      
      if (!targetStepId) {
        return {
          success: false,
          outcome_executed: outcome,
          target_step_id: '',
          side_effects_applied: {},
          errors: [`No target step found for outcome ${outcome}`]
        };
      }

      // 3. Execute WFM step transition
      const wfmUpdateSuccess = await this.updateEntityWFMStep(
        entityId,
        entityType,
        entityState.wfm_project_id,
        targetStepId,
        context.user_id
      );

      if (!wfmUpdateSuccess) {
        return {
          success: false,
          outcome_executed: outcome,
          target_step_id: targetStepId,
          side_effects_applied: {},
          errors: ['Failed to update WFM step']
        };
      }

      // 4. Apply side effects from matching rules
      const sideEffects = await this.applySideEffects(
        entityId,
        entityType,
        validation.rule_matches,
        context
      );

      // 5. Record execution in history
      const historyRecorded = await this.recordOutcomeExecution(
        entityId,
        entityType,
        outcome,
        entityState.current_step_id,
        targetStepId,
        context.user_id
      );

      return {
        success: true,
        outcome_executed: outcome,
        target_step_id: targetStepId,
        side_effects_applied: sideEffects,
        wfm_project_updated: wfmUpdateSuccess,
        history_recorded: historyRecorded
      };
    } catch (error) {
      console.error('[WorkflowOutcomeEngine.executeOutcome] Error:', error);
      return {
        success: false,
        outcome_executed: outcome,
        target_step_id: '',
        side_effects_applied: {},
        errors: [error instanceof Error ? error.message : 'Unknown error during outcome execution']
      };
    }
  }

  // ================================
  // RULE MANAGEMENT
  // ================================

  /**
   * Get business rules for entity type and optional workflow
   */
  async getRulesForEntity(
    entityType: 'DEAL' | 'LEAD',
    workflowId?: string
  ): Promise<BusinessRule[]> {
    try {
      let query = this.supabase
        .from('business_outcome_rules')
        .select('*')
        .eq('is_active', true)
        .in('entity_type', [entityType, 'ANY'])
        .order('priority', { ascending: true });

      // Add workflow filtering if specified
      if (workflowId) {
        // Rules that either apply to all workflows or specifically to this workflow
        query = query.or(`conditions->>'workflow_ids' IS NULL,conditions->>'workflow_ids' LIKE '%${workflowId}%'`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('[WorkflowOutcomeEngine.getRulesForEntity] Database error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[WorkflowOutcomeEngine.getRulesForEntity] Error:', error);
      return [];
    }
  }

  /**
   * Evaluate individual business rule against context
   */
  async evaluateRule(
    rule: BusinessRule,
    context: ExecutionContext & { workflow_id?: string; current_step_id?: string; entity_data?: any }
  ): Promise<{ matches: boolean; blocking: boolean; warning: boolean; reason?: string }> {
    try {
      // Check rule type specific logic
      switch (rule.rule_type) {
        case 'ALLOW_FROM_ANY':
          return this.evaluateAllowFromAnyRule(rule, context);
        
        case 'STEP_SPECIFIC':
          return this.evaluateStepSpecificRule(rule, context);
        
        case 'PROBABILITY_THRESHOLD':
          return this.evaluateProbabilityThresholdRule(rule, context);
        
        case 'WORKFLOW_SPECIFIC':
          return this.evaluateWorkflowSpecificRule(rule, context);
        
        default:
          return {
            matches: false,
            blocking: true,
            warning: false,
            reason: `Unknown rule type: ${rule.rule_type}`
          };
      }
    } catch (error) {
      console.error('[WorkflowOutcomeEngine.evaluateRule] Error:', error);
      return {
        matches: false,
        blocking: true,
        warning: false,
        reason: 'Rule evaluation failed'
      };
    }
  }

  // ================================
  // HELPER METHODS
  // ================================

  /**
   * Get entity's current WFM state
   */
  private async getEntityWFMState(entityId: string, entityType: 'DEAL' | 'LEAD') {
    try {
      const tableName = entityType === 'DEAL' ? 'deals' : 'leads';
      
      const { data, error } = await this.supabase
        .from(tableName as any)
        .select(`
          wfm_project_id,
          wfmProject:wfm_projects!wfm_project_id(
            id,
            workflow_id,
            current_step_id,
            currentStep:workflow_steps!current_step_id(
              id,
              step_order,
              metadata,
              status_id
            )
          )
        `)
        .eq('id', entityId)
        .single();

      if (error || !data || !data.wfm_project_id) {
        return null;
      }

      const wfmProject = (data as any).wfmProject;
      if (!wfmProject) {
        return null;
      }

      return {
        wfm_project_id: data.wfm_project_id,
        workflow_id: wfmProject.workflow_id,
        current_step_id: wfmProject.current_step_id,
        current_step_order: wfmProject.currentStep?.step_order,
        current_step_metadata: wfmProject.currentStep?.metadata || {},
        entity_data: data
      };
    } catch (error) {
      console.error('[WorkflowOutcomeEngine.getEntityWFMState] Error:', error);
      return null;
    }
  }

  /**
   * Find target step for specific outcome in workflow
   */
  private async findTargetStepForOutcome(
    workflowId: string,
    outcome: 'WON' | 'LOST' | 'CONVERTED',
    fromStepId?: string
  ): Promise<string | null> {
    try {
      let query = this.supabase
        .from('outcome_step_mappings')
        .select('target_step_id')
        .eq('workflow_id', workflowId)
        .eq('outcome_type', outcome)
        .eq('is_active', true);

      // If fromStepId provided, filter by compatible mappings
      if (fromStepId) {
        query = query.or(`from_step_ids IS NULL,from_step_ids @> '["${fromStepId}"]'`);
      }

      const { data, error } = await query
        .order('priority', { ascending: true })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return data.target_step_id;
    } catch (error) {
      console.error('[WorkflowOutcomeEngine.findTargetStepForOutcome] Error:', error);
      return null;
    }
  }

  /**
   * Evaluate outcome availability for specific outcome type
   */
  private async evaluateOutcomeAvailability(
    outcomeType: 'WON' | 'LOST' | 'CONVERTED',
    rules: BusinessRule[],
    context: ExecutionContext & { workflow_id?: string; current_step_id?: string }
  ): Promise<{ available: boolean; reason?: string; target_step_id?: string; side_effects?: any }> {
    if (rules.length === 0) {
      return {
        available: false,
        reason: `No rules configured for ${outcomeType} outcome`
      };
    }

    // Find the highest priority matching rule
    for (const rule of rules.sort((a, b) => a.priority - b.priority)) {
      const evaluation = await this.evaluateRule(rule, context);
      
      if (evaluation.matches) {
        const targetStepId = context.workflow_id ? 
          await this.findTargetStepForOutcome(context.workflow_id, outcomeType, context.current_step_id) : 
          undefined;

        return {
          available: true,
          target_step_id: targetStepId || undefined,
          side_effects: rule.side_effects
        };
      }
    }

    return {
      available: false,
      reason: `No matching rules for ${outcomeType} from current context`
    };
  }

  /**
   * Rule evaluation methods for different rule types
   */
  private async evaluateAllowFromAnyRule(
    rule: BusinessRule,
    context: ExecutionContext & { current_step_id?: string }
  ) {
    const allowedSteps = rule.conditions.allowed_from_steps as string[] | undefined;
    
    if (!allowedSteps || allowedSteps.length === 0) {
      return { matches: true, blocking: false, warning: false };
    }

    if (!context.current_step_id) {
      return {
        matches: false,
        blocking: true,
        warning: false,
        reason: 'Entity has no current step'
      };
    }

    const isAllowed = allowedSteps.includes(context.current_step_id);
    return {
      matches: isAllowed,
      blocking: !isAllowed,
      warning: false,
      reason: isAllowed ? undefined : `Not allowed from current step`
    };
  }

  private async evaluateStepSpecificRule(
    rule: BusinessRule,
    context: ExecutionContext & { current_step_id?: string }
  ) {
    return this.evaluateAllowFromAnyRule(rule, context); // Same logic for now
  }

  private async evaluateProbabilityThresholdRule(
    rule: BusinessRule,
    context: ExecutionContext & { entity_data?: any }
  ) {
    const minProbability = rule.conditions.min_probability as number | undefined;
    
    if (minProbability === undefined) {
      return { matches: true, blocking: false, warning: false };
    }

    const entityProbability = context.entity_data?.deal_specific_probability || 
                              context.entity_data?.current_step_metadata?.deal_probability || 
                              0;

    const meets = entityProbability >= minProbability;
    return {
      matches: meets,
      blocking: !meets,
      warning: false,
      reason: meets ? undefined : `Probability ${entityProbability} below threshold ${minProbability}`
    };
  }

  private async evaluateWorkflowSpecificRule(
    rule: BusinessRule,
    context: ExecutionContext & { workflow_id?: string }
  ) {
    const allowedWorkflows = rule.conditions.workflow_ids as string[] | undefined;
    
    if (!allowedWorkflows || allowedWorkflows.length === 0) {
      return { matches: true, blocking: false, warning: false };
    }

    if (!context.workflow_id) {
      return {
        matches: false,
        blocking: true,
        warning: false,
        reason: 'Entity has no workflow'
      };
    }

    const isAllowed = allowedWorkflows.includes(context.workflow_id);
    return {
      matches: isAllowed,
      blocking: !isAllowed,
      warning: false,
      reason: isAllowed ? undefined : `Not allowed for this workflow`
    };
  }

  /**
   * Apply side effects from matched rules
   */
  private async applySideEffects(
    entityId: string,
    entityType: 'DEAL' | 'LEAD',
    matchingRules: BusinessRule[],
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const appliedEffects: Record<string, any> = {};

    for (const rule of matchingRules) {
      if (rule.side_effects && Object.keys(rule.side_effects).length > 0) {
        // Apply probability updates
        if (rule.side_effects.update_probability !== undefined) {
          await this.updateEntityProbability(
            entityId,
            entityType,
            rule.side_effects.update_probability as number
          );
          appliedEffects.probability_updated = rule.side_effects.update_probability;
        }

        // Apply other side effects as needed
        appliedEffects[`rule_${rule.id}_effects`] = rule.side_effects;
      }
    }

    return appliedEffects;
  }

  /**
   * Update entity WFM step
   */
  private async updateEntityWFMStep(
    entityId: string,
    entityType: 'DEAL' | 'LEAD',
    wfmProjectId: string,
    targetStepId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('wfm_projects')
        .update({
          current_step_id: targetStepId,
          updated_by_user_id: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', wfmProjectId);

      return !error;
    } catch (error) {
      console.error('[WorkflowOutcomeEngine.updateEntityWFMStep] Error:', error);
      return false;
    }
  }

  /**
   * Update entity probability
   */
  private async updateEntityProbability(
    entityId: string,
    entityType: 'DEAL' | 'LEAD',
    probability: number
  ): Promise<boolean> {
    try {
      const tableName = entityType === 'DEAL' ? 'deals' : 'leads';
      const field = entityType === 'DEAL' ? 'deal_specific_probability' : 'lead_score';
      
      const { error } = await this.supabase
        .from(tableName as any)
        .update({ [field]: probability })
        .eq('id', entityId);

      return !error;
    } catch (error) {
      console.error('[WorkflowOutcomeEngine.updateEntityProbability] Error:', error);
      return false;
    }
  }

  /**
   * Record outcome execution in history
   */
  private async recordOutcomeExecution(
    entityId: string,
    entityType: 'DEAL' | 'LEAD',
    outcome: string,
    fromStepId: string,
    toStepId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const tableName = entityType === 'DEAL' ? 'deal_history' : 'lead_history';
      const entityField = entityType === 'DEAL' ? 'deal_id' : 'lead_id';
      
      const { error } = await this.supabase
        .from(tableName as any)
        .insert({
          [entityField]: entityId,
          user_id: userId,
          action: 'BUSINESS_OUTCOME_EXECUTED',
          changes: {
            outcome_type: outcome,
            from_step_id: fromStepId,
            to_step_id: toStepId,
            executed_via: 'business_rule_engine'
          },
          created_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('[WorkflowOutcomeEngine.recordOutcomeExecution] Error:', error);
      return false;
    }
  }

  /**
   * Get user-friendly display name for outcome
   */
  private getOutcomeDisplayName(outcome: 'WON' | 'LOST' | 'CONVERTED'): string {
    switch (outcome) {
      case 'WON': return 'Mark as Won';
      case 'LOST': return 'Mark as Lost';
      case 'CONVERTED': return 'Convert';
      default: return outcome;
    }
  }
}

// ================================
// FACTORY FUNCTION
// ================================

/**
 * Factory function to create WorkflowOutcomeEngine instance
 */
export function createWorkflowOutcomeEngine(supabaseClient: SupabaseClient<Database>): WorkflowOutcomeEngine {
  return new WorkflowOutcomeEngine(supabaseClient);
}

// ================================
// EXPORTS
// ================================

export default WorkflowOutcomeEngine; 