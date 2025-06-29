import { GraphQLContext, requireAuthentication, requirePermission } from '../helpers';
import {
  BusinessRule,
  BusinessRuleInput,
  UpdateBusinessRuleInput,
  BusinessRuleFilters,
  BusinessRuleNotification,
  RuleExecution,
  BusinessRuleExecutionResult,
  EntityTypeEnum,
  TriggerTypeEnum,
  RuleStatusEnum
} from '../../../../lib/generated/graphql';

// Database mappers for business rules
const mapDbBusinessRuleToGraphQL = (dbRule: any): BusinessRule => {
  try {
    // Parse conditions with error handling
    let conditions = [];
    try {
      const conditionsData = typeof dbRule.conditions === 'string' 
        ? JSON.parse(dbRule.conditions) 
        : dbRule.conditions || [];
      conditions = conditionsData.map((condition: any) => ({
        ...condition,
        logicalOperator: condition.logicalOperator || 'AND' // Ensure non-null default
      }));
    } catch (conditionsError) {
      console.error('Error parsing conditions for rule:', dbRule.id, conditionsError);
      conditions = [];
    }

    // Parse actions with error handling
    let actions = [];
    try {
      const actionsData = typeof dbRule.actions === 'string' 
        ? JSON.parse(dbRule.actions) 
        : dbRule.actions || [];
      actions = actionsData.map((action: any) => ({
        ...action,
        priority: action.priority || 1 // Ensure priority has default value
      }));
    } catch (actionsError) {
      console.error('Error parsing actions for rule:', dbRule.id, actionsError);
      actions = [];
    }

    return {
      id: dbRule.id,
      name: dbRule.name,
      description: dbRule.description,
      entityType: dbRule.entity_type as EntityTypeEnum,
      triggerType: dbRule.trigger_type as TriggerTypeEnum,
      triggerEvents: dbRule.trigger_events || [],
      triggerFields: dbRule.trigger_fields || [],
      conditions,
      actions,
      status: dbRule.status as RuleStatusEnum,
      executionCount: dbRule.execution_count || 0,
      lastError: dbRule.last_error,
      lastExecution: dbRule.last_execution,
      createdAt: new Date(dbRule.created_at),
      updatedAt: new Date(dbRule.updated_at),
      // Relations will be resolved separately
      wfmWorkflow: null,
      wfmStep: null,
      wfmStatus: null,
      createdBy: null
    };
  } catch (error) {
    console.error('Error mapping business rule:', dbRule?.id, error);
    throw new Error(`Failed to map business rule ${dbRule?.id}: ${error.message}`);
  }
};

const mapDbBusinessRuleNotificationToGraphQL = (dbNotification: any): BusinessRuleNotification => ({
  id: dbNotification.id,
  entityType: dbNotification.entity_type as EntityTypeEnum,
  entityId: dbNotification.entity_id,
  title: dbNotification.title,
  message: dbNotification.message,
  notificationType: dbNotification.notification_type,
  priority: dbNotification.priority,
  actions: dbNotification.actions,
  readAt: dbNotification.read_at ? new Date(dbNotification.read_at) : null,
  dismissedAt: dbNotification.dismissed_at ? new Date(dbNotification.dismissed_at) : null,
  actedUponAt: dbNotification.acted_upon_at ? new Date(dbNotification.acted_upon_at) : null,
  createdAt: new Date(dbNotification.created_at),
  // Relations will be resolved separately
  rule: null as any,
  user: null as any
});

const mapDbRuleExecutionToGraphQL = (dbExecution: any): RuleExecution => ({
  id: dbExecution.id,
  entityId: dbExecution.entity_id,
  entityType: dbExecution.entity_type as EntityTypeEnum,
  executionTrigger: dbExecution.execution_trigger,
  conditionsMet: dbExecution.conditions_met,
  executionResult: dbExecution.execution_result,
  notificationsCreated: dbExecution.notifications_created || 0,
  tasksCreated: dbExecution.tasks_created || 0,
  activitiesCreated: dbExecution.activities_created || 0,
  errors: dbExecution.errors || [],
  executionTimeMs: dbExecution.execution_time_ms,
  executedAt: new Date(dbExecution.executed_at),
  // Relations will be resolved separately
  rule: null as any
});

export const businessRulesResolvers = {
  Query: {
    businessRules: async (
      _: any,
      args: { 
        filters?: BusinessRuleFilters; 
        first?: number; 
        after?: string; 
      },
      context: GraphQLContext
    ) => {
      try {
        const { userId } = requireAuthentication(context);
        requirePermission(context, 'app_settings:manage');
        
        const { filters = {}, first = 20, after } = args;
        
        // Build the query using Supabase client
        let query = context.supabaseClient
          .from('business_rules')
          .select('*', { count: 'exact' });
        
        // Apply filters
        if (filters.entityType) {
          query = query.eq('entity_type', filters.entityType);
        }
        
        if (filters.triggerType) {
          query = query.eq('trigger_type', filters.triggerType);
        }
        
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
        
        // Handle pagination
        if (after) {
          query = query.lt('created_at', after);
        }
        
        // Order and limit
        query = query.order('created_at', { ascending: false }).limit(first + 1);
        
        console.log('Executing business rules query...');
        const { data: rules, count, error } = await query;
        
        if (error) {
          console.error('Supabase query error:', error);
          throw new Error(`Failed to fetch business rules: ${error.message}`);
        }
        
        console.log(`Found ${rules?.length || 0} business rules`);
        
        const hasNextPage = rules ? rules.length > first : false;
        let nodes = [];
        
        if (rules) {
          try {
            nodes = rules.slice(0, first).map((rule, index) => {
              console.log(`Mapping rule ${index + 1}/${rules.length}: ${rule.id}`);
              return mapDbBusinessRuleToGraphQL(rule);
            });
            console.log(`Successfully mapped ${nodes.length} business rules`);
          } catch (mappingError) {
            console.error('Error mapping business rules:', mappingError);
            throw new Error(`Failed to process business rules: ${mappingError.message}`);
          }
        }
        
        return {
          nodes,
          totalCount: count || 0,
          hasNextPage,
          hasPreviousPage: !!after
        };
      } catch (error) {
        console.error('Business rules query error:', error);
        throw error;
      }
    },

    businessRule: async (
      _: any,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      requirePermission(context, 'app_settings:manage');
      
      const { data } = await context.supabaseClient
        .from('business_rules')
        .select('*')
        .eq('id', args.id)
        .single()
        .throwOnError();
      
      return data ? mapDbBusinessRuleToGraphQL(data) : null;
    },

    businessRuleNotifications: async (
      _: any,
      args: { 
        userId?: string; 
        unreadOnly?: boolean; 
        first?: number; 
        after?: string; 
      },
      context: GraphQLContext
    ) => {
      const { userId: authUserId } = requireAuthentication(context);
      
      const { userId, unreadOnly = false, first = 20, after } = args;
      const targetUserId = userId || context.currentUser?.id;
      
      if (!targetUserId) {
        throw new Error('User ID is required');
      }
      
      let query = context.supabaseClient
        .from('business_rule_notifications')
        .select('*')
        .eq('user_id', targetUserId);
      
      if (unreadOnly) {
        query = query.is('read_at', null);
      }
      
      if (after) {
        query = query.lt('created_at', after);
      }
      
      query = query.order('created_at', { ascending: false }).limit(first + 1);
      
      const { data: notifications } = await query.throwOnError();
      
      const hasNextPage = notifications.length > first;
      const nodes = notifications.slice(0, first).map(mapDbBusinessRuleNotificationToGraphQL);
      
      // Get total count
      let countQuery = context.supabaseClient
        .from('business_rule_notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', targetUserId);
      
      if (unreadOnly) {
        countQuery = countQuery.is('read_at', null);
      }
      
      const { count: totalCount } = await countQuery.throwOnError();
      
      return {
        nodes,
        totalCount: totalCount || 0,
        hasNextPage,
        hasPreviousPage: !!after
      };
    },

    businessRuleNotification: async (
      _: any,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      
      const { data } = await context.supabaseClient
        .from('business_rule_notifications')
        .select('*')
        .eq('id', args.id)
        .single()
        .throwOnError();
      
      return data ? mapDbBusinessRuleNotificationToGraphQL(data) : null;
    },

    ruleExecutions: async (
      _: any,
      args: { 
        ruleId?: string; 
        entityType?: EntityTypeEnum; 
        entityId?: string; 
        first?: number; 
        after?: string; 
      },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      requirePermission(context, 'app_settings:manage');
      
      const { ruleId, entityType, entityId, first = 20, after } = args;
      
      let query = context.supabaseClient
        .from('rule_executions')
        .select('*');
      
      if (ruleId) {
        query = query.eq('rule_id', ruleId);
      }
      
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
      
      if (entityId) {
        query = query.eq('entity_id', entityId);
      }
      
      if (after) {
        query = query.lt('executed_at', after);
      }
      
      query = query.order('executed_at', { ascending: false }).limit(first + 1);
      
      const { data: executions } = await query.throwOnError();
      
      const hasNextPage = executions.length > first;
      const nodes = executions.slice(0, first).map(mapDbRuleExecutionToGraphQL);
      
      // Get total count
      let countQuery = context.supabaseClient
        .from('rule_executions')
        .select('id', { count: 'exact' });
      
      if (ruleId) {
        countQuery = countQuery.eq('rule_id', ruleId);
      }
      
      if (entityType) {
        countQuery = countQuery.eq('entity_type', entityType);
      }
      
      if (entityId) {
        countQuery = countQuery.eq('entity_id', entityId);
      }
      
      const { count: totalCount } = await countQuery.throwOnError();
      
      return {
        nodes,
        totalCount: totalCount || 0,
        hasNextPage,
        hasPreviousPage: !!after
      };
    },

    ruleExecution: async (
      _: any,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      requirePermission(context, 'app_settings:manage');
      
      const { data } = await context.supabaseClient
        .from('rule_executions')
        .select('*')
        .eq('id', args.id)
        .single()
        .throwOnError();
      
      return data ? mapDbRuleExecutionToGraphQL(data) : null;
    },

    businessRuleAnalytics: async (
      _: any,
      args: { entityType?: EntityTypeEnum; timeRange?: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      requirePermission(context, 'app_settings:manage');
      
      const { entityType, timeRange = '30d' } = args;
      
      // Calculate date range
      const days = parseInt(timeRange.replace('d', '')) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Get total rules
      let rulesQuery = context.supabaseClient
        .from('business_rules')
        .select('id, status', { count: 'exact' });
      
      if (entityType) {
        rulesQuery = rulesQuery.eq('entity_type', entityType);
      }
      
      const { data: rules, count: totalRules } = await rulesQuery.throwOnError();
      const activeRules = rules?.filter(r => r.status === 'ACTIVE').length || 0;
      
      // Get executions in time range
      let executionsQuery = context.supabaseClient
        .from('rule_executions')
        .select('execution_time_ms, conditions_met, errors', { count: 'exact' })
        .gte('executed_at', startDate.toISOString());
      
      if (entityType) {
        executionsQuery = executionsQuery.eq('entity_type', entityType);
      }
      
      const { data: executions, count: totalExecutions } = await executionsQuery.throwOnError();
      
      // Calculate analytics
      const executionTimes = executions?.map(e => e.execution_time_ms).filter(t => t !== null) || [];
      const averageExecutionTime = executionTimes.length > 0 
        ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length 
        : 0;
      
      const errorCount = executions?.filter(e => e.errors && e.errors.length > 0).length || 0;
      const errorRate = totalExecutions ? (errorCount / totalExecutions) * 100 : 0;
      
      // Get notifications count
      let notificationsQuery = context.supabaseClient
        .from('business_rule_notifications')
        .select('id', { count: 'exact' })
        .gte('created_at', startDate.toISOString());
      
      if (entityType) {
        notificationsQuery = notificationsQuery.eq('entity_type', entityType);
      }
      
      const { count: totalNotifications } = await notificationsQuery.throwOnError();
      
      // Get top performing rules (most executions)
      const { data: topRules } = await context.supabaseClient
        .from('business_rules')
        .select('*')
        .order('execution_count', { ascending: false })
        .limit(5)
        .throwOnError();
      
      // Get recent errors
      const { data: recentErrorExecutions } = await context.supabaseClient
        .from('rule_executions')
        .select('errors')
        .not('errors', 'is', null)
        .gte('executed_at', startDate.toISOString())
        .order('executed_at', { ascending: false })
        .limit(10)
        .throwOnError();
      
      const recentErrors = recentErrorExecutions?.flatMap(e => e.errors).slice(0, 5) || [];
      
      return {
        totalRules: totalRules || 0,
        activeRules,
        totalExecutions: totalExecutions || 0,
        totalNotifications: totalNotifications || 0,
        averageExecutionTime,
        errorRate,
        topPerformingRules: topRules?.map(mapDbBusinessRuleToGraphQL) || [],
        recentErrors
      };
    },

    validateBusinessRule: async (
      _: any,
      args: { input: BusinessRuleInput },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      requirePermission(context, 'app_settings:manage');
      
      const { input } = args;
      const errors: string[] = [];
      
      // Validate basic fields
      if (!input.name || input.name.trim().length === 0) {
        errors.push('Rule name is required');
      }
      
      if (!input.entityType) {
        errors.push('Entity type is required');
      }
      
      if (!input.triggerType) {
        errors.push('Trigger type is required');
      }
      
      if (!input.conditions || input.conditions.length === 0) {
        errors.push('At least one condition is required');
      }
      
      if (!input.actions || input.actions.length === 0) {
        errors.push('At least one action is required');
      }
      
      // Validate trigger-specific requirements
      if (input.triggerType === 'FIELD_CHANGE') {
        // For FIELD_CHANGE, we can auto-populate triggerFields from condition fields
        if (!input.triggerFields || input.triggerFields.length === 0) {
          // Auto-populate from condition fields
          const conditionFields = input.conditions?.map(c => c.field).filter(f => f) || [];
          if (conditionFields.length === 0) {
            errors.push('Trigger fields are required for FIELD_CHANGE trigger type, or at least one condition with a field must be specified');
          }
        }
      }
      
      if (input.triggerType === 'EVENT_BASED' && (!input.triggerEvents || input.triggerEvents.length === 0)) {
        errors.push('Trigger events are required for EVENT_BASED trigger type');
      }
      
      // Validate conditions
      if (input.conditions) {
        input.conditions.forEach((condition, index) => {
          if (!condition.field) {
            errors.push(`Condition ${index + 1}: Field is required`);
          }
          if (!condition.operator) {
            errors.push(`Condition ${index + 1}: Operator is required`);
          }
          // Some operators don't require values (IS_NULL, IS_NOT_NULL)
          const operatorsWithoutValue = ['IS_NULL', 'IS_NOT_NULL'];
          if (!operatorsWithoutValue.includes(condition.operator) && 
              (condition.value === undefined || condition.value === null || condition.value === '')) {
            errors.push(`Condition ${index + 1}: Value is required for operator ${condition.operator}`);
          }
        });
      }
      
      // Validate actions
      if (input.actions) {
        input.actions.forEach((action, index) => {
          if (!action.type) {
            errors.push(`Action ${index + 1}: Type is required`);
          }
          
          if (action.type === 'NOTIFY_USER' && !action.target) {
            errors.push(`Action ${index + 1}: Target user is required for NOTIFY_USER action`);
          }
          
          if (action.type === 'SEND_EMAIL' && !action.target) {
            errors.push(`Action ${index + 1}: Email address is required for SEND_EMAIL action`);
          }
        });
      }
      
      return errors;
    },

    previewRuleExecution: async (
      _: any,
      args: { ruleId: string; entityType: EntityTypeEnum; entityId: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      requirePermission(context, 'app_settings:manage');
      
      const { ruleId, entityType, entityId } = args;
      
      // Get the rule
      const { data: rule } = await context.supabaseClient
        .from('business_rules')
        .select('*')
        .eq('id', ruleId)
        .single()
        .throwOnError();
      
      if (!rule) {
        throw new Error('Rule not found');
      }
      
      // Get entity data based on type
      let entityData: any = {};
      let tableName = '';
      
      switch (entityType) {
        case 'DEAL':
          tableName = 'deals';
          break;
        case 'LEAD':
          tableName = 'leads';
          break;
        case 'TASK':
          tableName = 'task_items';
          break;
        case 'PERSON':
          tableName = 'people';
          break;
        case 'ORGANIZATION':
          tableName = 'organizations';
          break;
        case 'ACTIVITY':
          tableName = 'activities';
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
      
      const { data: entity } = await context.supabaseClient
        .from(tableName)
        .select('*')
        .eq('id', entityId)
        .single()
        .throwOnError();
      
      if (!entity) {
        throw new Error('Entity not found');
      }
      
      // Convert entity to JSON for processing
      entityData = JSON.stringify(entity);
      
      // Call the business rule processing function in preview mode
      const { data: result } = await context.supabaseClient
        .rpc('evaluate_rule_conditions', {
          rule_conditions: JSON.parse(rule.conditions || '[]'),
          entity_data: JSON.parse(entityData),
          change_data: null
        })
        .throwOnError();
      
      return {
        rulesProcessed: 1,
        notificationsCreated: result ? rule.actions?.filter((a: any) => a.type?.startsWith('NOTIFY')).length || 0 : 0,
        tasksCreated: result ? rule.actions?.filter((a: any) => a.type === 'CREATE_TASK').length || 0 : 0,
        activitiesCreated: result ? rule.actions?.filter((a: any) => a.type === 'CREATE_ACTIVITY').length || 0 : 0,
        errors: result ? [] : ['Conditions not met']
      };
    }
  },

  Mutation: {
    createBusinessRule: async (
      _: any,
      args: { input: BusinessRuleInput },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      requirePermission(context, 'app_settings:manage');
      
      const { input } = args;
      
      // Auto-populate triggerFields for FIELD_CHANGE trigger type
      let finalTriggerFields = input.triggerFields || [];
      if (input.triggerType === 'FIELD_CHANGE' && finalTriggerFields.length === 0) {
        // Auto-populate from condition fields
        const conditionFields = input.conditions?.map(c => c.field).filter(f => f) || [];
        finalTriggerFields = [...new Set(conditionFields)]; // Remove duplicates
      }
      
      // Validate the input
      const validationErrors = await businessRulesResolvers.Query.validateBusinessRule(
        _, { input }, context
      );
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      const { data } = await context.supabaseClient
        .from('business_rules')
        .insert({
          name: input.name,
          description: input.description,
          entity_type: input.entityType,
          trigger_type: input.triggerType,
          trigger_events: input.triggerEvents || [],
          trigger_fields: finalTriggerFields,
          conditions: JSON.stringify(input.conditions),
          actions: JSON.stringify(input.actions),
          wfm_workflow_id: input.wfmWorkflowId || null,
          wfm_step_id: input.wfmStepId || null,
          wfm_status_id: input.wfmStatusId || null,
          status: input.status || 'DRAFT',
          created_by: userId
        })
        .select()
        .single()
        .throwOnError();
      
      return mapDbBusinessRuleToGraphQL(data);
    },

    updateBusinessRule: async (
      _: any,
      args: { id: string; input: UpdateBusinessRuleInput },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      requirePermission(context, 'app_settings:manage');
      
      const { id, input } = args;
      
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
      
      const { data } = await context.supabaseClient
        .from('business_rules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
        .throwOnError();
      
      return mapDbBusinessRuleToGraphQL(data);
    },

    deleteBusinessRule: async (
      _: any,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      requirePermission(context, 'app_settings:manage');
      
      await context.supabaseClient
        .from('business_rules')
        .delete()
        .eq('id', args.id)
        .throwOnError();
      
      return true;
    },

    activateBusinessRule: async (
      _: any,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      requirePermission(context, 'app_settings:manage');
      
      const { data } = await context.supabaseClient
        .from('business_rules')
        .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
        .eq('id', args.id)
        .select()
        .single()
        .throwOnError();
      
      return mapDbBusinessRuleToGraphQL(data);
    },

    deactivateBusinessRule: async (
      _: any,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      requirePermission(context, 'app_settings:manage');
      
      const { data } = await context.supabaseClient
        .from('business_rules')
        .update({ status: 'INACTIVE', updated_at: new Date().toISOString() })
        .eq('id', args.id)
        .select()
        .single()
        .throwOnError();
      
      return mapDbBusinessRuleToGraphQL(data);
    },

    duplicateBusinessRule: async (
      _: any,
      args: { id: string; name: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      requirePermission(context, 'app_settings:manage');
      
      // Get the original rule
      const { data: originalRule } = await context.supabaseClient
        .from('business_rules')
        .select('*')
        .eq('id', args.id)
        .single()
        .throwOnError();
      
      if (!originalRule) {
        throw new Error('Rule not found');
      }
      
      // Create the duplicate
      const { data } = await context.supabaseClient
        .from('business_rules')
        .insert({
          name: args.name,
          description: originalRule.description,
          entity_type: originalRule.entity_type,
          trigger_type: originalRule.trigger_type,
          trigger_events: originalRule.trigger_events,
          trigger_fields: originalRule.trigger_fields,
          conditions: originalRule.conditions,
          actions: originalRule.actions,
          wfm_workflow_id: originalRule.wfm_workflow_id,
          wfm_step_id: originalRule.wfm_step_id,
          wfm_status_id: originalRule.wfm_status_id,
          status: 'DRAFT', // Always create duplicates as drafts
          created_by: context.currentUser?.id
        })
        .select()
        .single()
        .throwOnError();
      
      return mapDbBusinessRuleToGraphQL(data);
    },

    markNotificationAsRead: async (
      _: any,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      
      const { data } = await context.supabaseClient
        .from('business_rule_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', args.id)
        .eq('user_id', context.currentUser?.id) // Ensure user can only update their own notifications
        .select()
        .single()
        .throwOnError();
      
      return mapDbBusinessRuleNotificationToGraphQL(data);
    },

    markNotificationAsDismissed: async (
      _: any,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      
      const { data } = await context.supabaseClient
        .from('business_rule_notifications')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', args.id)
        .eq('user_id', context.currentUser?.id)
        .select()
        .single()
        .throwOnError();
      
      return mapDbBusinessRuleNotificationToGraphQL(data);
    },

    markNotificationAsActedUpon: async (
      _: any,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      
      const { data } = await context.supabaseClient
        .from('business_rule_notifications')
        .update({ acted_upon_at: new Date().toISOString() })
        .eq('id', args.id)
        .eq('user_id', context.currentUser?.id)
        .select()
        .single()
        .throwOnError();
      
      return mapDbBusinessRuleNotificationToGraphQL(data);
    },

    markAllNotificationsAsRead: async (
      _: any,
      args: { userId: string },
      context: GraphQLContext
    ) => {
      const { userId: authUserId } = requireAuthentication(context);
      
      // Users can only mark their own notifications as read
      const targetUserId = args.userId;
      if (targetUserId !== context.currentUser?.id) {
        throw new Error('You can only mark your own notifications as read');
      }
      
      const { data } = await context.supabaseClient
        .from('business_rule_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', targetUserId)
        .is('read_at', null)
        .select('id')
        .throwOnError();
      
      return data?.length || 0;
    },

    executeBusinessRule: async (
      _: any,
      args: { 
        ruleId: string; 
        entityType: EntityTypeEnum; 
        entityId: string; 
        testMode?: boolean 
      },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      requirePermission(context, 'app_settings:manage');
      
      const { ruleId, entityType, entityId, testMode = false } = args;
      
      // Get entity data
      let tableName = '';
      switch (entityType) {
        case 'DEAL':
          tableName = 'deals';
          break;
        case 'LEAD':
          tableName = 'leads';
          break;
        case 'TASK':
          tableName = 'task_items';
          break;
        case 'PERSON':
          tableName = 'people';
          break;
        case 'ORGANIZATION':
          tableName = 'organizations';
          break;
        case 'ACTIVITY':
          tableName = 'activities';
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
      
      const { data: entity } = await context.supabaseClient
        .from(tableName)
        .select('*')
        .eq('id', entityId)
        .single()
        .throwOnError();
      
      if (!entity) {
        throw new Error('Entity not found');
      }
      
      // Execute the business rule
      const triggerEvent = testMode ? 'MANUAL_TEST' : 'MANUAL_EXECUTION';
      
      const { data: result } = await context.supabaseClient
        .rpc('process_business_rules', {
          p_entity_type: entityType,
          p_entity_id: entityId,
          p_trigger_event: triggerEvent,
          p_entity_data: JSON.stringify(entity),
          p_change_data: null
        })
        .throwOnError();
      
      return {
        rulesProcessed: result?.rules_processed || 0,
        notificationsCreated: result?.notifications_created || 0,
        tasksCreated: result?.tasks_created || 0,
        activitiesCreated: result?.activities_created || 0,
        errors: result?.errors || []
      };
    },

    bulkUpdateBusinessRuleStatus: async (
      _: any,
      args: { ruleIds: string[]; status: RuleStatusEnum },
      context: GraphQLContext
    ) => {
      const { userId } = requireAuthentication(context);
      requirePermission(context, 'app_settings:manage');
      
      const { ruleIds, status } = args;
      
      const { data } = await context.supabaseClient
        .from('business_rules')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', ruleIds)
        .select()
        .throwOnError();
      
      return data?.map(mapDbBusinessRuleToGraphQL) || [];
    }
  },

  // Field resolvers for relationships
  BusinessRule: {
    wfmWorkflow: async (parent: BusinessRule, _: any, context: GraphQLContext) => {
      if (!parent.wfmWorkflow && parent.id) {
        // Get the workflow ID from the database
        const { data: rule } = await context.supabaseClient
          .from('business_rules')
          .select('wfm_workflow_id')
          .eq('id', parent.id)
          .single();
        
        if (rule?.wfm_workflow_id) {
          const { data: workflow } = await context.supabaseClient
            .from('workflows')
            .select('*')
            .eq('id', rule.wfm_workflow_id)
            .single();
          
          return workflow || null;
        }
      }
      return null;
    },

    createdBy: async (parent: BusinessRule, _: any, context: GraphQLContext) => {
      if (!parent.createdBy && parent.id) {
        const { data: rule } = await context.supabaseClient
          .from('business_rules')
          .select('created_by')
          .eq('id', parent.id)
          .single();
        
        if (rule?.created_by) {
          const { data: user } = await context.supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('user_id', rule.created_by)
            .single();
          
          return user || null;
        }
      }
      return null;
    }
  },

  BusinessRuleNotification: {
    rule: async (parent: BusinessRuleNotification, _: any, context: GraphQLContext) => {
      if (!parent.rule && parent.id) {
        const { data: notification } = await context.supabaseClient
          .from('business_rule_notifications')
          .select('rule_id')
          .eq('id', parent.id)
          .single();
        
        if (notification?.rule_id) {
          const { data: rule } = await context.supabaseClient
            .from('business_rules')
            .select('*')
            .eq('id', notification.rule_id)
            .single();
          
          return rule ? mapDbBusinessRuleToGraphQL(rule) : null;
        }
      }
      return null;
    },

    user: async (parent: BusinessRuleNotification, _: any, context: GraphQLContext) => {
      if (!parent.user && parent.id) {
        const { data: notification } = await context.supabaseClient
          .from('business_rule_notifications')
          .select('user_id')
          .eq('id', parent.id)
          .single();
        
        if (notification?.user_id) {
          const { data: user } = await context.supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('user_id', notification.user_id)
            .single();
          
          return user || null;
        }
      }
      return null;
    }
  },

  RuleExecution: {
    rule: async (parent: RuleExecution, _: any, context: GraphQLContext) => {
      if (!parent.rule && parent.id) {
        const { data: execution } = await context.supabaseClient
          .from('rule_executions')
          .select('rule_id')
          .eq('id', parent.id)
          .single();
        
        if (execution?.rule_id) {
          const { data: rule } = await context.supabaseClient
            .from('business_rules')
            .select('*')
            .eq('id', execution.rule_id)
            .single();
          
          return rule ? mapDbBusinessRuleToGraphQL(rule) : null;
        }
      }
      return null;
    }
  }
};