/**
 * WFMOutcomeEngine - Configurable WFM Business Logic
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

export interface WFMOutcomeRule {
  id: string;
  rule_name: string;
  description: string | null;
  entity_type: 'DEAL' | 'LEAD' | 'ANY';
  outcome_type: 'WON' | 'LOST' | 'CONVERTED';
  rule_type: 'ALLOW_FROM_ANY' | 'PROBABILITY_THRESHOLD' | 'STEP_SPECIFIC' | 'WORKFLOW_SPECIFIC' | 'PROJECT_TYPE_MAPPING' | 'UI_BEHAVIOR' | 'WIN_RATE_CALCULATION';
  conditions: Record<string, any>;
  restrictions: Record<string, any>;
  target_step_mapping: Record<string, string>;
  side_effects: Record<string, any>;
  is_active: boolean;
  priority: number;
}

export interface WFMOutcomeOption {
  outcome_type: 'WON' | 'LOST' | 'CONVERTED';
  display_name: string;
  available: boolean;
  reason?: string; // Why not available if false
  target_step_id?: string;
  side_effects?: Record<string, any>;
}

export interface WFMExecutionResult {
  success: boolean;
  outcome_executed: 'WON' | 'LOST' | 'CONVERTED';
  target_step_id: string;
  side_effects_applied: Record<string, any>;
  errors: string[];
}

export interface WFMExecutionContext {
  user_id: string;
  user_permissions: string[];
  entity_data?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface WFMStepMapping {
  id: string;
  workflow_id: string;
  outcome_type: 'WON' | 'LOST' | 'CONVERTED';
  target_step_id: string;
  from_step_ids: string[] | null;
  conditions: Record<string, any>;
  is_active: boolean;
}

export interface WFMWorkflowBehavior {
  id: string;
  workflow_id: string;
  behavior_type: 'KANBAN_VISIBILITY' | 'BUTTON_AVAILABILITY' | 'AUTO_TRANSITIONS' | 'UI_CUSTOMIZATION' | 'METADATA_SCHEMA';
  configuration: Record<string, any>;
  applies_to_steps: string[] | null;
  user_roles: string[] | null;
  is_active: boolean;
}

export interface WFMConversionRule {
  id: string;
  rule_name: string;
  from_entity_type: 'DEAL' | 'LEAD';
  to_entity_type: 'DEAL' | 'LEAD';
  conditions: Record<string, any>;
  restrictions: Record<string, any>;
  field_mappings: Record<string, any>;
  required_permissions: string[] | null;
  blocked_statuses: string[] | null;
  is_active: boolean;
}

export interface WFMEntityState {
  entity_id: string;
  entity_type: 'DEAL' | 'LEAD';
  workflow_id: string;
  current_step_id: string;
  wfm_project_id: string;
  current_step_metadata: Record<string, any>;
  current_step_is_final: boolean;
}

// ================================
// WFM OUTCOME ENGINE CLASS
// ================================

export class WFMOutcomeEngine {
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
    context: WFMExecutionContext
  ): Promise<WFMOutcomeOption[]> {
    try {
      // Get entity's current WFM state
      const entityState = await this.getEntityWFMState(entityId, entityType);
      if (!entityState) {
        return [];
      }

      // Get applicable business rules
      const rules = await this.getRulesForEntity(entityType, entityState.workflow_id);
      
      // Evaluate each outcome type
      const outcomes: WFMOutcomeOption[] = [];
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
      console.error('[WFMOutcomeEngine.getAvailableOutcomes] Error:', error);
      throw new GraphQLError('Failed to evaluate available outcomes', {
        extensions: { code: 'WFM_OUTCOME_ERROR' }
      });
    }
  }

  /**
   * Execute business outcome with full validation and side effects
   */
  async executeOutcome(
    entityId: string,
    entityType: 'DEAL' | 'LEAD',
    outcome: 'WON' | 'LOST' | 'CONVERTED',
    context: WFMExecutionContext
  ): Promise<WFMExecutionResult> {
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

      return {
        success: true,
        outcome_executed: outcome,
        target_step_id: targetStepId,
        side_effects_applied: sideEffects,
        errors: []
      };

    } catch (error) {
      console.error('[WFMOutcomeEngine.executeOutcome] Error:', error);
      return {
        success: false,
        outcome_executed: outcome,
        target_step_id: '',
        side_effects_applied: {},
        errors: [`Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  // ================================
  // PROJECT TYPE MAPPING
  // ================================

  /**
   * Get project type name for entity type (replaces AUTO_DEFAULT constants)
   */
  async getProjectTypeMapping(entityType: 'DEAL' | 'LEAD'): Promise<string> {
    try {
      const { data: rules, error } = await this.supabase
        .from('wfm_outcome_rules')
        .select('conditions')
        .eq('entity_type', entityType)
        .eq('rule_type', 'PROJECT_TYPE_MAPPING')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      if (rules && rules.length > 0) {
        const mapping = rules[0].conditions?.project_type_mapping;
        if (mapping && mapping[entityType]) {
          return mapping[entityType];
        }
      }

      // Fallback to hard-coded values if no configuration found
      return entityType === 'DEAL' ? 'Sales Deal' : 'Lead Qualification and Conversion Process';

    } catch (error) {
      console.error('[WFMOutcomeEngine.getProjectTypeMapping] Error:', error);
      // Return fallback values
      return entityType === 'DEAL' ? 'Sales Deal' : 'Lead Qualification and Conversion Process';
    }
  }

  /**
   * Get available outcome types for a workflow (for UI forms)
   * This is a simplified version that doesn't require entity context
   */
  async getWorkflowOutcomeTypes(workflowId: string): Promise<string[]> {
    try {
      const { data: mappings, error } = await this.supabase
        .from('wfm_step_mappings')
        .select('outcome_type')
        .eq('workflow_id', workflowId)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      // Get unique outcome types
      const uniqueOutcomes = [...new Set(mappings?.map(m => m.outcome_type) || [])];
      return uniqueOutcomes;
    } catch (error) {
      console.error('[WFMOutcomeEngine.getWorkflowOutcomeTypes] Error:', error);
      return [];
    }
  }

  /**
   * Get available outcome types for entity type (simplified for forms)
   */
  async getEntityTypeOutcomes(entityType: 'DEAL' | 'LEAD'): Promise<string[]> {
    try {
      const { data: rules, error } = await this.supabase
        .from('wfm_outcome_rules')
        .select('outcome_type')
        .eq('entity_type', entityType)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      // Get unique outcome types
      const uniqueOutcomes = [...new Set(rules?.map(r => r.outcome_type) || [])];
      return uniqueOutcomes;
    } catch (error) {
      console.error('[WFMOutcomeEngine.getEntityTypeOutcomes] Error:', error);
      return [];
    }
  }

  // ================================
  // WORKFLOW BEHAVIORS
  // ================================

  /**
   * Get workflow behaviors for UI configuration
   */
  async getWorkflowBehaviors(workflowId: string, behaviorType?: string, userRoles?: string[]): Promise<WFMWorkflowBehavior[]> {
    try {
      let query = this.supabase
        .from('wfm_workflow_behaviors')
        .select('*')
        .eq('workflow_id', workflowId)
        .eq('is_active', true);

      if (behaviorType) {
        query = query.eq('behavior_type', behaviorType);
      }

      const { data: behaviors, error } = await query.order('priority', { ascending: false });

      if (error) {
        throw error;
      }

      // Filter by user roles if provided
      const filteredBehaviors = behaviors?.filter(behavior => {
        if (!behavior.user_roles || behavior.user_roles.length === 0) {
          return true; // Applies to all roles
        }
        if (!userRoles || userRoles.length === 0) {
          return false; // User has no roles
        }
        return behavior.user_roles.some(role => userRoles.includes(role));
      }) || [];

      return filteredBehaviors;

    } catch (error) {
      console.error('[WFMOutcomeEngine.getWorkflowBehaviors] Error:', error);
      return [];
    }
  }

  /**
   * Get UI configuration for workflow
   */
  async getUIConfiguration(workflowId: string, userRoles?: string[]): Promise<{
    availableOutcomeTypes: string[];
    metadataFields: string[];
    metadataSchema: Record<string, any>;
    kanbanSettings: Record<string, any>;
  }> {
    try {
      const behaviors = await this.getWorkflowBehaviors(workflowId, undefined, userRoles);
      
      const uiCustomization = behaviors.find(b => b.behavior_type === 'UI_CUSTOMIZATION');
      const metadataSchema = behaviors.find(b => b.behavior_type === 'METADATA_SCHEMA');
      const kanbanVisibility = behaviors.find(b => b.behavior_type === 'KANBAN_VISIBILITY');

      return {
        availableOutcomeTypes: uiCustomization?.configuration?.available_outcome_types || ['WON', 'LOST', 'CONVERTED'],
        metadataFields: uiCustomization?.configuration?.metadata_fields || [],
        metadataSchema: metadataSchema?.configuration || {},
        kanbanSettings: kanbanVisibility?.configuration || {}
      };

    } catch (error) {
      console.error('[WFMOutcomeEngine.getUIConfiguration] Error:', error);
      return {
        availableOutcomeTypes: ['WON', 'LOST', 'CONVERTED'],
        metadataFields: [],
        metadataSchema: {},
        kanbanSettings: {}
      };
    }
  }

  // ================================
  // CONVERSION RULES
  // ================================

  /**
   * Get conversion rules for entity types
   */
  async getConversionRules(fromEntityType: 'DEAL' | 'LEAD', toEntityType: 'DEAL' | 'LEAD'): Promise<WFMConversionRule[]> {
    try {
      const { data: rules, error } = await this.supabase
        .from('wfm_conversion_rules')
        .select('*')
        .eq('from_entity_type', fromEntityType)
        .eq('to_entity_type', toEntityType)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) {
        throw error;
      }

      return rules || [];

    } catch (error) {
      console.error('[WFMOutcomeEngine.getConversionRules] Error:', error);
      return [];
    }
  }

  /**
   * Validate entity conversion
   */
  async validateConversion(
    entityId: string,
    fromEntityType: 'DEAL' | 'LEAD',
    toEntityType: 'DEAL' | 'LEAD',
    context: WFMExecutionContext
  ): Promise<{ valid: boolean; errors: string[]; rules: WFMConversionRule[] }> {
    try {
      const rules = await this.getConversionRules(fromEntityType, toEntityType);
      const entityState = await this.getEntityWFMState(entityId, fromEntityType);
      
      if (!entityState) {
        return { valid: false, errors: ['Entity WFM state not found'], rules: [] };
      }

      const errors: string[] = [];

      for (const rule of rules) {
        // Check blocked statuses
        if (rule.blocked_statuses && rule.blocked_statuses.length > 0) {
          const currentStatus = entityState.current_step_metadata?.status_name?.toLowerCase();
          if (currentStatus && rule.blocked_statuses.some(status => currentStatus.includes(status.toLowerCase()))) {
            errors.push(`Conversion blocked from status: ${currentStatus}`);
          }
        }

        // Check required permissions
        if (rule.required_permissions && rule.required_permissions.length > 0) {
          const missingPermissions = rule.required_permissions.filter(perm => !context.user_permissions.includes(perm));
          if (missingPermissions.length > 0) {
            errors.push(`Missing required permissions: ${missingPermissions.join(', ')}`);
          }
        }

        // Check restrictions
        if (rule.restrictions?.blocked_final_steps && entityState.current_step_is_final) {
          errors.push('Cannot convert entities from final steps');
        }
      }

      return { valid: errors.length === 0, errors, rules };

    } catch (error) {
      console.error('[WFMOutcomeEngine.validateConversion] Error:', error);
      return { valid: false, errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`], rules: [] };
    }
  }

  // ================================
  // PRIVATE HELPER METHODS
  // ================================

  private async getRulesForEntity(entityType: 'DEAL' | 'LEAD', workflowId: string): Promise<WFMOutcomeRule[]> {
    const { data: rules, error } = await this.supabase
      .from('wfm_outcome_rules')
      .select('*')
      .or(`entity_type.eq.${entityType},entity_type.eq.ANY`)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) {
      throw error;
    }

    // Filter rules that apply to this workflow
    return rules?.filter(rule => {
      if (rule.rule_type === 'WORKFLOW_SPECIFIC') {
        const workflowIds = rule.conditions?.workflow_ids;
        return workflowIds && workflowIds.includes(workflowId);
      }
      return true;
    }) || [];
  }

  private async evaluateOutcomeAvailability(
    outcomeType: 'WON' | 'LOST' | 'CONVERTED',
    rules: WFMOutcomeRule[],
    context: WFMExecutionContext & WFMEntityState
  ): Promise<{ available: boolean; reason?: string; target_step_id?: string; side_effects?: Record<string, any> }> {
    
    if (rules.length === 0) {
      return { available: false, reason: `No rules defined for ${outcomeType} outcome` };
    }

    // Check if current step is final and outcome rules exclude final steps
    if (context.current_step_is_final) {
      const allowFromFinal = rules.some(rule => !rule.conditions?.exclude_final_steps);
      if (!allowFromFinal) {
        return { available: false, reason: 'Outcome not available from final steps' };
      }
    }

    // Evaluate each rule
    for (const rule of rules) {
      const evaluation = await this.evaluateRule(rule, context);
      if (evaluation.matches) {
        const targetStepId = rule.target_step_mapping?.[context.workflow_id];
        return {
          available: true,
          target_step_id: targetStepId,
          side_effects: rule.side_effects
        };
      }
    }

    return { available: false, reason: `No matching rules for ${outcomeType} from current step` };
  }

  private async evaluateRule(rule: WFMOutcomeRule, context: WFMExecutionContext & WFMEntityState): Promise<{ matches: boolean; reason?: string }> {
    // Rule type specific evaluation
    switch (rule.rule_type) {
      case 'ALLOW_FROM_ANY':
        if (rule.conditions?.exclude_final_steps && context.current_step_is_final) {
          return { matches: false, reason: 'Final steps excluded' };
        }
        return { matches: true };

      case 'STEP_SPECIFIC':
        const allowedSteps = rule.conditions?.allowed_from_steps || [];
        if (!allowedSteps.includes(context.current_step_id)) {
          return { matches: false, reason: 'Current step not in allowed steps' };
        }
        return { matches: true };

      case 'PROBABILITY_THRESHOLD':
        const minProbability = rule.conditions?.min_probability || 0;
        const currentProbability = context.entity_data?.current_step_metadata?.deal_probability || 0;
        if (currentProbability < minProbability) {
          return { matches: false, reason: `Probability ${currentProbability} below threshold ${minProbability}` };
        }
        return { matches: true };

      default:
        return { matches: true };
    }
  }

  private async validateOutcomeExecution(
    entityId: string,
    entityType: 'DEAL' | 'LEAD',
    outcome: 'WON' | 'LOST' | 'CONVERTED',
    context: WFMExecutionContext
  ): Promise<{ valid: boolean; errors: string[]; rule_matches: WFMOutcomeRule[] }> {
    
    const entityState = await this.getEntityWFMState(entityId, entityType);
    if (!entityState) {
      return { valid: false, errors: ['Entity WFM state not found'], rule_matches: [] };
    }

    const rules = await this.getRulesForEntity(entityType, entityState.workflow_id);
    const outcomeRules = rules.filter(r => r.outcome_type === outcome);
    
    const matchingRules: WFMOutcomeRule[] = [];
    const errors: string[] = [];

    for (const rule of outcomeRules) {
      const evaluation = await this.evaluateRule(rule, { ...context, ...entityState });
      if (evaluation.matches) {
        matchingRules.push(rule);
      } else if (evaluation.reason) {
        errors.push(evaluation.reason);
      }
    }

    return {
      valid: matchingRules.length > 0,
      errors: matchingRules.length === 0 ? errors : [],
      rule_matches: matchingRules
    };
  }

  private async getEntityWFMState(entityId: string, entityType: 'DEAL' | 'LEAD'): Promise<WFMEntityState | null> {
    try {
      const tableName = entityType === 'DEAL' ? 'deals' : 'leads';
      
      const { data: entity, error } = await this.supabase
        .from(tableName as any)
        .select(`
          id,
          wfm_projects!inner(
            id,
            workflow_id,
            current_step_id,
            workflow_steps!inner(
              id,
              metadata,
              is_final_step
            )
          )
        `)
        .eq('id', entityId)
        .single();

      if (error || !entity) {
        return null;
      }

      const wfmProject = (entity as any).wfm_projects;
      const currentStep = wfmProject.workflow_steps;

      return {
        entity_id: entityId,
        entity_type: entityType,
        workflow_id: wfmProject.workflow_id,
        current_step_id: wfmProject.current_step_id,
        wfm_project_id: wfmProject.id,
        current_step_metadata: currentStep.metadata || {},
        current_step_is_final: currentStep.is_final_step
      };

    } catch (error) {
      console.error('[WFMOutcomeEngine.getEntityWFMState] Error:', error);
      return null;
    }
  }

  private async findTargetStepForOutcome(
    workflowId: string,
    outcome: 'WON' | 'LOST' | 'CONVERTED',
    currentStepId: string
  ): Promise<string | null> {
    try {
      const { data: mappings, error } = await this.supabase
        .from('wfm_step_mappings')
        .select('target_step_id, from_step_ids')
        .eq('workflow_id', workflowId)
        .eq('outcome_type', outcome)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error || !mappings || mappings.length === 0) {
        return null;
      }

      // Find mapping that applies to current step
      for (const mapping of mappings) {
        if (!mapping.from_step_ids || mapping.from_step_ids.length === 0) {
          // Applies to all steps
          return mapping.target_step_id;
        }
        if (mapping.from_step_ids.includes(currentStepId)) {
          // Applies to current step
          return mapping.target_step_id;
        }
      }

      return null;

    } catch (error) {
      console.error('[WFMOutcomeEngine.findTargetStepForOutcome] Error:', error);
      return null;
    }
  }

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
          updated_at: new Date().toISOString(),
          updated_by_user_id: userId
        })
        .eq('id', wfmProjectId);

      return !error;

    } catch (error) {
      console.error('[WFMOutcomeEngine.updateEntityWFMStep] Error:', error);
      return false;
    }
  }

  /**
   * Apply side effects from matched rules
   */
  private async applySideEffects(
    entityId: string,
    entityType: 'DEAL' | 'LEAD',
    matchedRules: WFMOutcomeRule[],
    context: WFMExecutionContext
  ): Promise<Record<string, any>> {
    const appliedSideEffects: Record<string, any> = {};

    for (const rule of matchedRules) {
      if (!rule.side_effects) continue;

      try {
        // Apply each side effect
        for (const [effectType, effectConfig] of Object.entries(rule.side_effects)) {
          switch (effectType) {
            case 'update_probability':
              if (effectConfig && typeof effectConfig === 'object' && 'probability' in effectConfig) {
                await this.updateEntityProbability(entityId, entityType, effectConfig.probability as number);
                appliedSideEffects.probability_updated = effectConfig.probability;
              }
              break;

            case 'trigger_notifications':
              if (effectConfig && typeof effectConfig === 'object') {
                await this.triggerNotifications(entityId, entityType, effectConfig, context);
                appliedSideEffects.notifications_sent = true;
              }
              break;

            case 'trigger_entity_conversion':
              // NEW: Handle entity conversion side effect
              if (effectConfig && rule.outcome_type === 'CONVERTED') {
                const conversionResult = await this.executeEntityConversion(
                  entityId,
                  entityType,
                  effectConfig,
                  context
                );
                appliedSideEffects.entity_conversion = conversionResult;
              }
              break;

            case 'update_metadata':
              if (effectConfig && typeof effectConfig === 'object') {
                await this.updateEntityMetadata(entityId, entityType, effectConfig);
                appliedSideEffects.metadata_updated = true;
              }
              break;

            default:
              console.warn(`[WFMOutcomeEngine] Unknown side effect type: ${effectType}`);
          }
        }
      } catch (error) {
        console.error(`[WFMOutcomeEngine] Error applying side effect ${Object.keys(rule.side_effects)[0]}:`, error);
        // Continue with other side effects even if one fails
      }
    }

    return appliedSideEffects;
  }

  // ================================
  // ENTITY CONVERSION INTEGRATION
  // ================================

  /**
   * Execute entity conversion as a WFM side effect
   */
  private async executeEntityConversion(
    entityId: string,
    entityType: 'DEAL' | 'LEAD',
    conversionConfig: any,
    context: WFMExecutionContext
  ): Promise<{ success: boolean; leadId?: string; errors: string[] }> {
    try {
      // Only support deal to lead conversion for now
      if (entityType !== 'DEAL') {
        return {
          success: false,
          errors: ['Entity conversion only supported for deals currently']
        };
      }

      // Import conversion service
      const { convertDealToLead } = await import('./conversionService');

      // Get deal data for conversion
      const { data: deal, error: dealError } = await this.supabase
        .from('deals')
        .select(`
          *,
          person:people(*),
          organization:organizations(*)
        `)
        .eq('id', entityId)
        .single();

      if (dealError || !deal) {
        return {
          success: false,
          errors: ['Failed to fetch deal data for conversion']
        };
      }

      // Prepare conversion input with intelligent defaults
      const conversionInput = {
        dealId: entityId,
        conversionReason: conversionConfig.reason || 'WFM outcome triggered conversion',
        leadData: {
          name: deal.name,
          contact_name: deal.person ? `${deal.person.first_name} ${deal.person.last_name}`.trim() : '',
          contact_email: deal.person?.email || '',
          contact_phone: deal.person?.phone || '',
          company_name: deal.organization?.name || '',
          estimated_value: deal.amount || 0,
          estimated_close_date: deal.expected_close_date,
          source: 'wfm_conversion',
          description: `Converted from deal via WFM outcome: ${deal.name}`
        },
        preserveActivities: conversionConfig.preserve_activities !== false,
        createConversionActivity: conversionConfig.create_conversion_activity !== false,
        archiveDeal: conversionConfig.archive_deal !== false,
        notes: conversionConfig.notes || `Deal converted to lead via WFM outcome execution`
      };

      // Execute the conversion
      const result = await convertDealToLead(
        conversionInput,
        context.user_id,
        this.supabase,
        '' // Access token will be handled by the conversion service
      );

      return {
        success: result.success,
        leadId: result.leadId,
        errors: result.errors || []
      };

    } catch (error) {
      console.error('[WFMOutcomeEngine.executeEntityConversion] Error:', error);
      return {
        success: false,
        errors: [`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  private getOutcomeDisplayName(outcome: 'WON' | 'LOST' | 'CONVERTED'): string {
    switch (outcome) {
      case 'WON': return 'Mark as Won';
      case 'LOST': return 'Mark as Lost';
      case 'CONVERTED': return 'Convert';
      default: return outcome;
    }
  }
} 