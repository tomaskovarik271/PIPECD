# PipeCD Business Rules Engine Design

## Executive Summary

PipeCD's Business Rules Engine is a **generic, entity-agnostic notification and automation system** that monitors business processes across all CRM entities (deals, leads, tasks, people, organizations). Unlike task-specific reminders, this system provides enterprise-grade business intelligence automation following patterns used by Salesforce, Microsoft Dynamics, and HubSpot.

## Architecture Philosophy

### **Entity-Agnostic Design**
- **One system handles all entities**: Deals, leads, tasks, people, organizations, activities
- **Flexible condition system**: Any field, any operator, any value
- **Multi-action support**: Notifications, task creation, field updates, email alerts
- **Cross-entity relationships**: Rules can span multiple entity types

### **Supabase-Native Architecture**
- **Database-First Approach**: Leverage Supabase triggers, functions, and policies
- **GraphQL Integration**: Seamless integration with existing mutation/query patterns
- **Progressive Enhancement**: Start simple, add complexity only when needed
- **No External Dependencies**: Build on existing Supabase and Netlify infrastructure

### **Enterprise Patterns Followed**
- **Salesforce Process Builder**: Flexible condition/action workflow automation
- **Microsoft Dynamics Business Rules**: Real-time field validation and automation
- **HubSpot Workflows**: Time-based and enrollment-based automation sequences
- **Pipedrive Activity-Based Alerts**: Inactivity detection and escalation

## Implementation Status

### **Current Status: DESIGN PHASE - REVISED FOR SUPABASE**
- 📋 **Database Schema**: Designed for Supabase-native implementation
- 📋 **Backend Services**: Planned as extensions to existing GraphQL services
- 📋 **Admin UI**: Wireframes updated for phased approach
- 📋 **Integration Points**: Direct GraphQL mutation integration mapped

## Core Components

### **1. Business Rules Engine**

```typescript
interface BusinessRule {
  id: string;
  name: string;
  description: string;
  entityType: EntityType;
  triggerType: 'EVENT_BASED' | 'FIELD_CHANGE' | 'TIME_BASED';
  
  // Flexible condition system
  conditions: RuleCondition[];
  
  // Multiple possible actions
  actions: RuleAction[];
  
  // Scheduling for time-based rules (Phase 2)
  schedule?: {
    frequency: 'HOURLY' | 'DAILY' | 'WEEKLY';
    time?: string; // "09:00" for daily checks
  };
  
  isActive: boolean;
  createdBy: string;
  updatedAt: Date;
}
```

### **2. Flexible Condition System**

```typescript
interface RuleCondition {
  field: string; // "lastActivityDate", "amount", "dueDate", "status"
  operator: ConditionOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

type ConditionOperator = 
  | 'EQUALS' | 'NOT_EQUALS'
  | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_EQUAL' | 'LESS_EQUAL'
  | 'OLDER_THAN' | 'NEWER_THAN'
  | 'IS_NULL' | 'IS_NOT_NULL'
  | 'IN' | 'NOT_IN'
  | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH'
  | 'CHANGED_FROM' | 'CHANGED_TO' | 'DECREASED_BY_PERCENT' | 'INCREASED_BY_PERCENT';
```

### **3. Multi-Action System**

```typescript
interface RuleAction {
  type: ActionType;
  target?: string; // User ID, role, or email
  template?: string; // Notification/email template
  data?: Record<string, any>; // Additional action data
  delay?: string; // "2 hours", "1 day" (Phase 2)
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

type ActionType = 
  | 'NOTIFY_USER'      // Send notification to specific user
  | 'NOTIFY_OWNER'     // Send notification to entity owner
  | 'NOTIFY_MANAGER'   // Send notification to user's manager (Phase 2)
  | 'NOTIFY_ROLE'      // Send notification to users with specific role (Phase 2)
  | 'CREATE_TASK'      // Create a follow-up task
  | 'UPDATE_FIELD'     // Update entity field value (Phase 2)
  | 'SEND_EMAIL'       // Send email notification (Phase 2)
  | 'WEBHOOK'          // Call external webhook (Phase 3)
  | 'CREATE_ACTIVITY'  // Log activity record
  | 'ESCALATE';        // Escalate to next level in hierarchy (Phase 3)
```

## Real-World Business Rules Examples

### **Phase 1: EVENT_BASED Rules (GraphQL Integration)**

```typescript
const EVENT_BASED_RULES = [
  {
    name: "High-Value Deal Assignment Notification",
    description: "Notify manager when deal > $50K is assigned",
    entityType: "DEAL",
    triggerType: "EVENT_BASED",
    triggerEvent: "DEAL_ASSIGNED", // Maps to existing Inngest events
    conditions: [
      { field: "amount", operator: "GREATER_THAN", value: 50000 }
    ],
    actions: [
      { 
        type: "NOTIFY_USER", 
        target: "ASSIGNED_USER_MANAGER",
        template: "high_value_deal_assigned",
        priority: "HIGH"
      },
      { 
        type: "CREATE_TASK", 
        template: "review_high_value_deal",
        data: { priority: "HIGH", dueInDays: 1 }
      }
    ]
  }
];
```

### **Phase 1: FIELD_CHANGE Rules (GraphQL Trigger)**

```typescript
const FIELD_CHANGE_RULES = [
  {
    name: "Deal Value Drop Alert",
    description: "Alert when deal value decreases by 25%+",
    entityType: "DEAL",
    triggerType: "FIELD_CHANGE",
    triggerFields: ["amount"],
    conditions: [
      { field: "amount", operator: "DECREASED_BY_PERCENT", value: 25 }
    ],
    actions: [
      {
        type: "NOTIFY_OWNER",
        template: "deal_value_decrease_alert",
        priority: "HIGH"
      },
      {
        type: "CREATE_ACTIVITY",
        template: "log_deal_value_change"
      }
    ]
  }
];
```

### **Phase 2: TIME_BASED Rules (Netlify Scheduled Functions)**

```typescript
const TIME_BASED_RULES = [
  {
    name: "Stale High-Value Deal Alert",
    description: "Alert when high-value deals have no activity for 5+ days",
    entityType: "DEAL",
    triggerType: "TIME_BASED",
    schedule: { frequency: "DAILY", time: "09:00" },
    conditions: [
      { field: "amount", operator: "GREATER_THAN", value: 25000 },
      { field: "lastActivityDate", operator: "OLDER_THAN", value: "5 days" },
      { field: "status", operator: "IN", value: ["ACTIVE", "QUALIFICATION", "PROPOSAL"] }
    ],
    actions: [
      { 
        type: "NOTIFY_OWNER", 
        template: "stale_deal_alert",
        priority: "HIGH"
      },
      { 
        type: "CREATE_TASK", 
        template: "follow_up_stale_deal",
        data: { priority: "HIGH", dueInDays: 1 }
      }
    ]
  }
];
```

## Supabase-Native Architecture

### **Database Schema (Enhanced for Supabase)**

```sql
-- Entity types supported by the rules engine
CREATE TYPE entity_type_enum AS ENUM ('DEAL', 'LEAD', 'TASK', 'PERSON', 'ORGANIZATION', 'ACTIVITY');
CREATE TYPE trigger_type_enum AS ENUM ('EVENT_BASED', 'FIELD_CHANGE', 'TIME_BASED');
CREATE TYPE rule_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- Main business rules table
CREATE TABLE business_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  entity_type entity_type_enum NOT NULL,
  trigger_type trigger_type_enum NOT NULL,
  
  -- Event-based trigger configuration
  trigger_events TEXT[], -- ['DEAL_CREATED', 'DEAL_ASSIGNED', 'DEAL_UPDATED']
  trigger_fields TEXT[], -- For FIELD_CHANGE: ['amount', 'status']
  
  -- Flexible JSON-based condition system
  conditions JSONB NOT NULL,
  
  -- Flexible JSON-based action system
  actions JSONB NOT NULL,
  
  -- Scheduling configuration for time-based rules (Phase 2)
  schedule JSONB, -- {"frequency": "DAILY", "time": "09:00", "timezone": "UTC"}
  next_execution TIMESTAMPTZ, -- When this rule should next run
  last_execution TIMESTAMPTZ, -- When this rule last ran
  
  -- WFM Integration (optional)
  wfm_workflow_id UUID REFERENCES wfm_workflows(id),
  wfm_step_id UUID REFERENCES wfm_steps(id),
  wfm_status_id UUID REFERENCES wfm_statuses(id),
  
  -- Metadata
  status rule_status_enum DEFAULT 'DRAFT',
  execution_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced notifications table (using existing structure)
CREATE TABLE business_rule_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES business_rules(id) ON DELETE CASCADE,
  
  -- Entity context
  entity_type entity_type_enum NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Notification details
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT,
  notification_type TEXT NOT NULL,
  priority INTEGER DEFAULT 1, -- 1=LOW, 2=MEDIUM, 3=HIGH, 4=URGENT
  
  -- Actionable notification data
  actions JSONB, -- Available actions for this notification
  
  -- Notification state
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  acted_upon_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rule execution tracking and auditing
CREATE TABLE rule_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES business_rules(id) ON DELETE CASCADE,
  
  -- Execution context
  entity_id UUID NOT NULL,
  entity_type entity_type_enum NOT NULL,
  execution_trigger TEXT NOT NULL, -- 'DEAL_UPDATED', 'SCHEDULED', etc.
  
  -- Execution results
  conditions_met BOOLEAN NOT NULL,
  execution_result JSONB,
  notifications_created INTEGER DEFAULT 0,
  tasks_created INTEGER DEFAULT 0,
  activities_created INTEGER DEFAULT 0,
  errors JSONB,
  
  execution_time_ms INTEGER,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_business_rules_entity_trigger ON business_rules(entity_type, trigger_type) WHERE status = 'ACTIVE';
CREATE INDEX idx_business_rules_next_execution ON business_rules(next_execution) WHERE trigger_type = 'TIME_BASED' AND status = 'ACTIVE';
CREATE INDEX idx_rule_executions_rule_entity ON rule_executions(rule_id, entity_id, executed_at DESC);
CREATE INDEX idx_business_rule_notifications_user_unread ON business_rule_notifications(user_id, read_at) WHERE read_at IS NULL;
```

### **Supabase Functions for Rule Processing**

```sql
-- Function to evaluate rule conditions
CREATE OR REPLACE FUNCTION evaluate_rule_conditions(
  rule_conditions JSONB,
  entity_data JSONB,
  change_data JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  condition JSONB;
  field_value TEXT;
  condition_met BOOLEAN;
  all_conditions_met BOOLEAN := TRUE;
BEGIN
  -- Loop through conditions and evaluate each one
  FOR condition IN SELECT jsonb_array_elements(rule_conditions)
  LOOP
    -- Extract field value from entity data
    field_value := entity_data ->> (condition ->> 'field');
    
    -- Evaluate condition based on operator
    CASE condition ->> 'operator'
      WHEN 'EQUALS' THEN
        condition_met := field_value = (condition ->> 'value');
      WHEN 'GREATER_THAN' THEN
        condition_met := field_value::NUMERIC > (condition ->> 'value')::NUMERIC;
      WHEN 'OLDER_THAN' THEN
        condition_met := field_value::TIMESTAMPTZ < NOW() - (condition ->> 'value')::INTERVAL;
      -- Add more operators as needed
      ELSE
        condition_met := FALSE;
    END CASE;
    
    -- Handle logical operators (default AND)
    IF (condition ->> 'logicalOperator') = 'OR' THEN
      IF condition_met THEN
        RETURN TRUE; -- Short circuit on OR
      END IF;
    ELSE
      IF NOT condition_met THEN
        all_conditions_met := FALSE;
      END IF;
    END IF;
  END LOOP;
  
  RETURN all_conditions_met;
END;
$$ LANGUAGE plpgsql;

-- Function to execute rule actions
CREATE OR REPLACE FUNCTION execute_rule_actions(
  rule_id UUID,
  rule_actions JSONB,
  entity_type entity_type_enum,
  entity_id UUID,
  entity_data JSONB
) RETURNS JSONB AS $$
DECLARE
  action JSONB;
  execution_result JSONB := '{"notifications_created": 0, "tasks_created": 0, "activities_created": 0, "errors": []}'::JSONB;
  action_result JSONB;
BEGIN
  -- Loop through actions and execute each one
  FOR action IN SELECT jsonb_array_elements(rule_actions)
  LOOP
    CASE action ->> 'type'
      WHEN 'NOTIFY_USER', 'NOTIFY_OWNER' THEN
        -- Create notification
        INSERT INTO business_rule_notifications (
          rule_id, entity_type, entity_id, user_id, title, message, 
          notification_type, priority, actions
        ) VALUES (
          rule_id, entity_type, entity_id,
          CASE 
            WHEN action ->> 'type' = 'NOTIFY_OWNER' THEN (entity_data ->> 'assigned_to_user_id')::UUID
            ELSE (action ->> 'target')::UUID
          END,
          action ->> 'template' || ' - ' || (entity_data ->> 'name'),
          'Business rule notification',
          action ->> 'template',
          COALESCE((action ->> 'priority')::INTEGER, 1),
          action
        );
        execution_result := jsonb_set(execution_result, '{notifications_created}', 
          ((execution_result ->> 'notifications_created')::INTEGER + 1)::TEXT::JSONB);
      
      WHEN 'CREATE_TASK' THEN
        -- Integration with existing task system would go here
        execution_result := jsonb_set(execution_result, '{tasks_created}', 
          ((execution_result ->> 'tasks_created')::INTEGER + 1)::TEXT::JSONB);
      
      WHEN 'CREATE_ACTIVITY' THEN
        -- Integration with existing activity system would go here
        execution_result := jsonb_set(execution_result, '{activities_created}', 
          ((execution_result ->> 'activities_created')::INTEGER + 1)::TEXT::JSONB);
    END CASE;
  END LOOP;
  
  RETURN execution_result;
END;
$$ LANGUAGE plpgsql;
```

## Implementation Roadmap (Revised)

### **Phase 1: Core Infrastructure - Supabase Native (2-3 weeks)**
1. **Database Schema**: Implement business_rules, business_rule_notifications, rule_executions tables
2. **GraphQL Integration**: Add rule evaluation to existing mutations (updateDeal, createDeal, etc.)
3. **Backend Services**: BusinessRulesEngine service using Supabase functions
4. **Basic Admin UI**: Rule listing and CRUD for EVENT_BASED and FIELD_CHANGE rules only
5. **Notification Integration**: Use existing Universal Notification Center with rule context
6. **Mention System Completion**: Complete @mention processing in stickers/notes with user_mentioned notifications
7. **Task Notification Integration**: Connect task system with system notifications for due/overdue alerts

### **Phase 2: TIME_BASED Rules - Netlify Functions (2-3 weeks)**
1. **Scheduled Processing**: Add Netlify scheduled function for TIME_BASED rules
2. **Advanced Admin UI**: TIME_BASED rule configuration with scheduling
3. **Rule Templates**: Pre-built common business rules
4. **Enhanced Notifications**: Rich notification templates and actions

### **Phase 3: Advanced Actions & WFM Integration (2-3 weeks)**
1. **WFM Event Hooks**: Integration with workflow state changes
2. **Advanced Actions**: SEND_EMAIL, UPDATE_FIELD, NOTIFY_MANAGER actions
3. **Stage Progression Blocking**: Task-based workflow gates
4. **Performance Monitoring**: Rule effectiveness analytics

### **Phase 4: Enterprise Features (3-4 weeks)**
1. **Advanced Scheduling**: Complex time-based rule configurations
2. **External Integrations**: Webhook actions, third-party notifications  
3. **Rule Analytics**: Effectiveness analysis and optimization suggestions
4. **Bulk Operations**: Mass rule operations and testing interface

## Integration with Existing Systems

### **GraphQL Mutation Integration (Phase 1)**
```typescript
// In existing dealMutations.ts
export const dealMutations = {
  updateDeal: async (parent, args, context) => {
    const originalDeal = await dealService.getDeal(args.id);
    const updatedDeal = await dealService.updateDeal(args.id, args.input);
    
    // NEW: Trigger business rules evaluation
    await businessRulesEngine.evaluateRules({
      triggerType: 'FIELD_CHANGE',
      entityType: 'DEAL',
      entityId: args.id,
      originalData: originalDeal,
      updatedData: updatedDeal,
      changes: calculateChanges(originalDeal, updatedDeal)
    });
    
    return updatedDeal;
  }
}
```

### **Event-Based Integration (Phase 1)**
```typescript
// Extend existing Inngest events to trigger business rules
inngest.send({
  name: 'crm/deal.assigned',
  data: { dealId, assignedToUserId, previousAssignedToUserId }
}).then(() => {
  // Trigger business rules for DEAL_ASSIGNED event
  businessRulesEngine.evaluateRules({
    triggerType: 'EVENT_BASED',
    entityType: 'DEAL',
    entityId: dealId,
    triggerEvent: 'DEAL_ASSIGNED',
    eventData: { assignedToUserId, previousAssignedToUserId }
  });
});
```

### **Scheduled Processing (Phase 2)**
```typescript
// netlify/functions/scheduled/business-rules.ts
export const handler = schedule("0 * * * *", async () => {
  console.log('Processing scheduled business rules...');
  
  const { data: rules } = await supabase
    .from('business_rules')
    .select('*')
    .eq('trigger_type', 'TIME_BASED')
    .eq('status', 'ACTIVE')
    .lte('next_execution', new Date().toISOString());
  
  for (const rule of rules || []) {
    await businessRulesEngine.executeTimeBasedRule(rule);
  }
});
```

## Key Benefits

1. **Supabase-Native**: Leverages existing database, functions, and security model
2. **Progressive Enhancement**: Start simple with immediate rules, add complexity gradually
3. **No External Dependencies**: Uses existing Netlify and Supabase infrastructure
4. **Enterprise Patterns**: Follows established CRM automation patterns
5. **Configurable**: Admins can create custom rules without code changes
6. **Auditable**: Complete execution history and notification tracking
7. **Performance Optimized**: Database-first approach with proper indexing
8. **Future-Proof**: Easy to add new entity types and action types

This revised Business Rules Engine design transforms PipeCD from a reactive CRM into a **proactive business intelligence system** using a practical, Supabase-native approach that builds on existing infrastructure rather than introducing unnecessary complexity. 