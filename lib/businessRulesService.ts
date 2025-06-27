import { GraphQLContext } from '../netlify/functions/graphql/helpers';
import { 
  BusinessRuleInput, 
  UpdateBusinessRuleInput,
  EntityTypeEnum,
  TriggerTypeEnum,
  RuleStatusEnum,
  BusinessRuleExecutionResult
} from './generated/graphql';

export interface BusinessRuleCondition {
  field: string;
  operator: string;
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

export interface BusinessRuleAction {
  type: string;
  target?: string;
  template?: string;
  message?: string;
  priority?: number;
  metadata?: any;
}

export interface ProcessingContext {
  entityType: EntityTypeEnum;
  entityId: string;
  triggerEvent: string;
  entityData: any;
  changeData?: any;
  testMode?: boolean;
}

export class BusinessRulesService {
  private context: GraphQLContext;

  constructor(context: GraphQLContext) {
    this.context = context;
  }

  // ===============================
  // Rule Management Methods
  // ===============================

  async createRule(input: BusinessRuleInput): Promise<any> {
    const validationErrors = await this.validateRule(input);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const { data } = await this.context.supabaseClient
      .from('business_rules')
      .insert({
        name: input.name,
        description: input.description,
        entity_type: input.entityType,
        trigger_type: input.triggerType,
        trigger_events: input.triggerEvents || [],
        trigger_fields: input.triggerFields || [],
        conditions: JSON.stringify(input.conditions),
        actions: JSON.stringify(input.actions),
        wfm_workflow_id: input.wfmWorkflowId,
        wfm_step_id: input.wfmStepId,
        wfm_status_id: input.wfmStatusId,
        status: input.status || 'DRAFT',
        created_by: this.context.user?.id
      })
      .select()
      .single()
      .throwOnError();

    return data;
  }

  async updateRule(id: string, input: UpdateBusinessRuleInput): Promise<any> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.triggerEvents !== undefined) updateData.trigger_events = input.triggerEvents;
    if (input.triggerFields !== undefined) updateData.trigger_fields = input.triggerFields;
    if (input.conditions !== undefined) updateData.conditions = JSON.stringify(input.conditions);
    if (input.actions !== undefined) updateData.actions = JSON.stringify(input.actions);
    if (input.wfmWorkflowId !== undefined) updateData.wfm_workflow_id = input.wfmWorkflowId;
    if (input.wfmStepId !== undefined) updateData.wfm_step_id = input.wfmStepId;
    if (input.wfmStatusId !== undefined) updateData.wfm_status_id = input.wfmStatusId;
    if (input.status !== undefined) updateData.status = input.status;

    const { data } = await this.context.supabaseClient
      .from('business_rules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
      .throwOnError();

    return data;
  }

  async deleteRule(id: string): Promise<boolean> {
    await this.context.supabaseClient
      .from('business_rules')
      .delete()
      .eq('id', id)
      .throwOnError();

    return true;
  }

  async activateRule(id: string): Promise<any> {
    const { data } = await this.context.supabaseClient
      .from('business_rules')
      .update({ 
        status: 'ACTIVE', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()
      .throwOnError();

    return data;
  }

  async deactivateRule(id: string): Promise<any> {
    const { data } = await this.context.supabaseClient
      .from('business_rules')
      .update({ 
        status: 'INACTIVE', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()
      .throwOnError();

    return data;
  }

  // ===============================
  // Rule Processing Methods
  // ===============================

  async processEntityChange(context: ProcessingContext): Promise<BusinessRuleExecutionResult> {
    const { entityType, entityId, triggerEvent, entityData, changeData, testMode = false } = context;

    // Get matching rules
    const rules = await this.getMatchingRules(entityType, triggerEvent, changeData);

    let totalNotifications = 0;
    let totalTasks = 0;
    let totalActivities = 0;
    const allErrors: string[] = [];

    for (const rule of rules) {
      try {
        const executionResult = await this.executeRule(rule, context);
        
        totalNotifications += executionResult.notificationsCreated;
        totalTasks += executionResult.tasksCreated;
        totalActivities += executionResult.activitiesCreated;
        allErrors.push(...executionResult.errors);

        // Update rule execution count (unless in test mode)
        if (!testMode) {
          await this.updateRuleExecutionStats(rule.id);
        }
      } catch (error) {
        console.error(`Error executing rule ${rule.id}:`, error);
        allErrors.push(`Rule ${rule.name}: ${error.message}`);
        
        // Update rule with error (unless in test mode)
        if (!testMode) {
          await this.updateRuleError(rule.id, error.message);
        }
      }
    }

    return {
      rulesProcessed: rules.length,
      notificationsCreated: totalNotifications,
      tasksCreated: totalTasks,
      activitiesCreated: totalActivities,
      errors: allErrors
    };
  }

  private async getMatchingRules(
    entityType: EntityTypeEnum, 
    triggerEvent: string, 
    changeData?: any
  ): Promise<any[]> {
    let query = this.context.supabaseClient
      .from('business_rules')
      .select('*')
      .eq('status', 'ACTIVE')
      .eq('entity_type', entityType);

    // For EVENT_BASED rules, check if trigger event matches
    if (changeData) {
      // FIELD_CHANGE rules
      query = query.eq('trigger_type', 'FIELD_CHANGE');
    } else {
      // EVENT_BASED rules
      query = query
        .eq('trigger_type', 'EVENT_BASED')
        .contains('trigger_events', [triggerEvent]);
    }

    const { data: rules } = await query.throwOnError();
    return rules || [];
  }

  private async executeRule(rule: any, context: ProcessingContext): Promise<BusinessRuleExecutionResult> {
    const { entityData, changeData } = context;
    
    // Parse rule configuration
    const conditions = JSON.parse(rule.conditions || '[]');
    const actions = JSON.parse(rule.actions || '[]');

    // Evaluate conditions
    const conditionsMet = await this.evaluateConditions(conditions, entityData, changeData);
    
    let notificationsCreated = 0;
    let tasksCreated = 0;
    let activitiesCreated = 0;
    const errors: string[] = [];

    // Record execution
    const executionId = await this.recordExecution(rule.id, context, conditionsMet);

    if (conditionsMet) {
      // Execute actions
      for (const action of actions) {
        try {
          const result = await this.executeAction(action, rule, context);
          
          if (action.type.startsWith('NOTIFY')) {
            notificationsCreated += result.created ? 1 : 0;
          } else if (action.type === 'CREATE_TASK') {
            tasksCreated += result.created ? 1 : 0;
          } else if (action.type === 'CREATE_ACTIVITY') {
            activitiesCreated += result.created ? 1 : 0;
          }
        } catch (error) {
          errors.push(`Action ${action.type}: ${error.message}`);
        }
      }

      // Update execution with results
      await this.updateExecutionResults(executionId, {
        notificationsCreated,
        tasksCreated,
        activitiesCreated,
        errors
      });
    }

    return {
      rulesProcessed: 1,
      notificationsCreated,
      tasksCreated,
      activitiesCreated,
      errors
    };
  }

  private async evaluateConditions(
    conditions: BusinessRuleCondition[], 
    entityData: any, 
    changeData?: any
  ): Promise<boolean> {
    if (!conditions || conditions.length === 0) {
      return true; // No conditions means always match
    }

    let result = true;
    let hasOrCondition = false;
    let orResult = false;

    for (const condition of conditions) {
      const conditionMet = this.evaluateSingleCondition(condition, entityData, changeData);
      
      if (condition.logicalOperator === 'OR') {
        hasOrCondition = true;
        orResult = orResult || conditionMet;
      } else {
        // AND logic (default)
        result = result && conditionMet;
      }
    }

    // If we have OR conditions, use OR result, otherwise use AND result
    return hasOrCondition ? orResult : result;
  }

  private evaluateSingleCondition(
    condition: BusinessRuleCondition, 
    entityData: any, 
    changeData?: any
  ): boolean {
    const fieldValue = entityData[condition.field];
    const { operator, value } = condition;

    switch (operator) {
      case 'EQUALS':
        return String(fieldValue) === String(value);
      
      case 'NOT_EQUALS':
        return String(fieldValue) !== String(value);
      
      case 'GREATER_THAN':
        return Number(fieldValue) > Number(value);
      
      case 'LESS_THAN':
        return Number(fieldValue) < Number(value);
      
      case 'GREATER_EQUAL':
        return Number(fieldValue) >= Number(value);
      
      case 'LESS_EQUAL':
        return Number(fieldValue) <= Number(value);
      
      case 'CONTAINS':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      
      case 'STARTS_WITH':
        return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());
      
      case 'ENDS_WITH':
        return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());
      
      case 'IS_NULL':
        return fieldValue == null;
      
      case 'IS_NOT_NULL':
        return fieldValue != null;
      
      case 'IN':
        const values = String(value).split(',').map(v => v.trim());
        return values.includes(String(fieldValue));
      
      case 'NOT_IN':
        const notValues = String(value).split(',').map(v => v.trim());
        return !notValues.includes(String(fieldValue));
      
      case 'OLDER_THAN':
        if (!fieldValue) return false;
        const fieldDate = new Date(fieldValue);
        const intervalMs = this.parseInterval(value);
        return Date.now() - fieldDate.getTime() > intervalMs;
      
      case 'NEWER_THAN':
        if (!fieldValue) return false;
        const fieldDate2 = new Date(fieldValue);
        const intervalMs2 = this.parseInterval(value);
        return Date.now() - fieldDate2.getTime() < intervalMs2;
      
      case 'CHANGED_FROM':
        if (!changeData) return false;
        const originalValue = changeData[`original_${condition.field}`];
        return String(originalValue) === String(value) && String(fieldValue) !== String(value);
      
      case 'CHANGED_TO':
        if (!changeData) return false;
        const originalValue2 = changeData[`original_${condition.field}`];
        return String(fieldValue) === String(value) && String(originalValue2) !== String(value);
      
      default:
        console.warn(`Unknown condition operator: ${operator}`);
        return false;
    }
  }

  private parseInterval(interval: string): number {
    // Parse intervals like "2 days", "1 hour", "30 minutes"
    const match = interval.match(/(\d+)\s*(day|hour|minute|week)s?/i);
    if (!match) return 0;
    
    const [, amount, unit] = match;
    const multipliers = {
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000
    };
    
    return parseInt(amount) * (multipliers[unit.toLowerCase()] || 0);
  }

  private async executeAction(
    action: BusinessRuleAction, 
    rule: any, 
    context: ProcessingContext
  ): Promise<{ created: boolean; data?: any }> {
    const { entityType, entityId, entityData } = context;

    switch (action.type) {
      case 'NOTIFY_USER':
        return await this.createNotification({
          ruleId: rule.id,
          entityType,
          entityId,
          userId: action.target,
          title: this.buildNotificationTitle(action, entityData),
          message: action.message,
          notificationType: action.template || 'business_rule',
          priority: action.priority || 1,
          actions: action.metadata
        });

      case 'NOTIFY_OWNER':
        const ownerId = entityData.assigned_to_user_id || entityData.user_id || entityData.created_by_user_id;
        if (!ownerId) {
          throw new Error('No owner found for entity');
        }
        
        return await this.createNotification({
          ruleId: rule.id,
          entityType,
          entityId,
          userId: ownerId,
          title: this.buildNotificationTitle(action, entityData),
          message: action.message,
          notificationType: action.template || 'business_rule',
          priority: action.priority || 1,
          actions: action.metadata
        });

      case 'CREATE_TASK':
        return await this.createTask(action, entityData, context);

      case 'CREATE_ACTIVITY':
        return await this.createActivity(action, entityData, context);

      default:
        console.warn(`Unknown action type: ${action.type}`);
        return { created: false };
    }
  }

  private buildNotificationTitle(action: BusinessRuleAction, entityData: any): string {
    const template = action.template || 'Business Rule Notification';
    const entityName = entityData.name || entityData.title || entityData.contact_name || 'Entity';
    return `${template} - ${entityName}`;
  }

  private async createNotification(params: {
    ruleId: string;
    entityType: EntityTypeEnum;
    entityId: string;
    userId: string;
    title: string;
    message?: string;
    notificationType: string;
    priority: number;
    actions?: any;
  }): Promise<{ created: boolean; data?: any }> {
    try {
      const { data } = await this.context.supabaseClient
        .from('business_rule_notifications')
        .insert({
          rule_id: params.ruleId,
          entity_type: params.entityType,
          entity_id: params.entityId,
          user_id: params.userId,
          title: params.title,
          message: params.message,
          notification_type: params.notificationType,
          priority: params.priority,
          actions: JSON.stringify(params.actions || {})
        })
        .select()
        .single()
        .throwOnError();

      return { created: true, data };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  private async createTask(
    action: BusinessRuleAction, 
    entityData: any, 
    context: ProcessingContext
  ): Promise<{ created: boolean; data?: any }> {
    // Integration with existing task system would go here
    console.log('CREATE_TASK action triggered:', action);
    return { created: true };
  }

  private async createActivity(
    action: BusinessRuleAction, 
    entityData: any, 
    context: ProcessingContext
  ): Promise<{ created: boolean; data?: any }> {
    // Integration with existing activity system would go here
    console.log('CREATE_ACTIVITY action triggered:', action);
    return { created: true };
  }

  // ===============================
  // Utility Methods
  // ===============================

  async validateRule(input: BusinessRuleInput): Promise<string[]> {
    const errors: string[] = [];

    if (!input.name || input.name.trim().length === 0) {
      errors.push('Rule name is required');
    }

    if (!input.conditions || input.conditions.length === 0) {
      errors.push('At least one condition is required');
    }

    if (!input.actions || input.actions.length === 0) {
      errors.push('At least one action is required');
    }

    if (input.triggerType === 'EVENT_BASED' && (!input.triggerEvents || input.triggerEvents.length === 0)) {
      errors.push('Event-based rules must specify at least one trigger event');
    }

    if (input.triggerType === 'FIELD_CHANGE' && (!input.triggerFields || input.triggerFields.length === 0)) {
      errors.push('Field-change rules must specify at least one trigger field');
    }

    // Validate conditions
    input.conditions?.forEach((condition, index) => {
      if (!condition.field) {
        errors.push(`Condition ${index + 1}: Field is required`);
      }
      if (!condition.operator) {
        errors.push(`Condition ${index + 1}: Operator is required`);
      }
      if (condition.value === undefined || condition.value === null) {
        errors.push(`Condition ${index + 1}: Value is required`);
      }
    });

    // Validate actions
    input.actions?.forEach((action, index) => {
      if (!action.type) {
        errors.push(`Action ${index + 1}: Type is required`);
      }
      if ((action.type === 'NOTIFY_USER' || action.type === 'SEND_EMAIL') && !action.target) {
        errors.push(`Action ${index + 1}: Target is required for ${action.type}`);
      }
    });

    return errors;
  }

  private async recordExecution(
    ruleId: string, 
    context: ProcessingContext, 
    conditionsMet: boolean
  ): Promise<string> {
    const { data } = await this.context.supabaseClient
      .from('rule_executions')
      .insert({
        rule_id: ruleId,
        entity_id: context.entityId,
        entity_type: context.entityType,
        execution_trigger: context.triggerEvent,
        conditions_met: conditionsMet
      })
      .select()
      .single()
      .throwOnError();

    return data.id;
  }

  private async updateExecutionResults(executionId: string, results: {
    notificationsCreated: number;
    tasksCreated: number;
    activitiesCreated: number;
    errors: string[];
  }): Promise<void> {
    await this.context.supabaseClient
      .from('rule_executions')
      .update({
        notifications_created: results.notificationsCreated,
        tasks_created: results.tasksCreated,
        activities_created: results.activitiesCreated,
        errors: JSON.stringify(results.errors)
      })
      .eq('id', executionId)
      .throwOnError();
  }

  private async updateRuleExecutionStats(ruleId: string): Promise<void> {
    await this.context.supabaseClient
      .from('business_rules')
      .update({
        execution_count: this.context.supabaseClient.rpc('increment', { field: 'execution_count' }),
        last_execution: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', ruleId)
      .throwOnError();
  }

  private async updateRuleError(ruleId: string, errorMessage: string): Promise<void> {
    await this.context.supabaseClient
      .from('business_rules')
      .update({
        last_error: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', ruleId)
      .throwOnError();
  }

  // ===============================
  // Trigger Integration Methods
  // ===============================

  /**
   * Method to be called from Supabase triggers when entities change
   */
  static async triggerFromEntityChange(
    entityType: EntityTypeEnum,
    entityId: string,
    triggerEvent: string,
    newData: any,
    oldData?: any,
    context?: GraphQLContext
  ): Promise<BusinessRuleExecutionResult> {
    if (!context) {
      throw new Error('GraphQL context is required for business rule execution');
    }

    const service = new BusinessRulesService(context);
    
    // Build change data if we have old data
    const changeData = oldData ? {
      ...Object.keys(newData).reduce((acc, key) => {
        if (oldData[key] !== newData[key]) {
          acc[`original_${key}`] = oldData[key];
        }
        return acc;
      }, {} as any)
    } : undefined;

    return await service.processEntityChange({
      entityType,
      entityId,
      triggerEvent,
      entityData: newData,
      changeData
    });
  }
} 