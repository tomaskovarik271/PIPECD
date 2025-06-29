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

### **Current Status: INFRASTRUCTURE COMPLETE - INTEGRATION MISSING**

**✅ COMPLETED COMPONENTS:**
- **Database Schema**: ✅ **PRODUCTION READY** - Complete with business_rules, business_rule_notifications, rule_executions tables
- **Supabase Functions**: ✅ **PRODUCTION READY** - Sophisticated `process_business_rules()`, `evaluate_rule_conditions()`, `execute_rule_actions()` functions
- **GraphQL Schema**: ✅ **PRODUCTION READY** - Complete businessRules.graphql with full CRUD API
- **Backend Resolvers**: ✅ **PRODUCTION READY** - businessRulesResolvers.ts with full rule management
- **Admin UI**: ✅ **PRODUCTION READY** - BusinessRulesPage.tsx with complete rule management interface
- **Frontend Store**: ✅ **PRODUCTION READY** - useBusinessRulesStore.ts with full state management
- **Manual Testing**: ✅ **PRODUCTION READY** - executeBusinessRule mutation for testing rules
- **RLS Security**: ✅ **PRODUCTION READY** - Complete row-level security policies
- **Integration Tests**: ✅ **PRODUCTION READY** - businessRulesGraphQL.test.ts with comprehensive testing

**❌ MISSING CRITICAL COMPONENT:**
- **Automatic Trigger Integration**: ❌ **NOT IMPLEMENTED** - Rules are never automatically triggered by real CRM operations

### **The Critical Gap**

The Business Rules Engine is **95% complete** but **0% functional** because:

1. **Rules can be created** via admin UI ✅
2. **Rules can be tested manually** via executeBusinessRule mutation ✅  
3. **Rules are NEVER triggered automatically** when deals/leads/people are created/updated ❌

**Example**: A rule "Notify when deal > $50K is created" will:
- ✅ Save successfully in the database
- ✅ Test successfully via manual execution
- ❌ **NEVER fire when an actual $50K deal is created**

### **Root Cause Analysis**

The integration points in mutation resolvers are missing. For example, `dealMutations.createDeal` should call:

```typescript
// MISSING: This call should happen after deal creation
await context.supabaseClient.rpc('process_business_rules', {
  p_entity_type: 'DEAL',
  p_entity_id: newDeal.id,
  p_trigger_event: 'DEAL_CREATED',
  p_entity_data: JSON.stringify(newDeal)
});
```

But this integration is **completely missing** from all mutation resolvers.

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
    name: "New Deal Creation Alert",
    description: "Notify deal owner when any deal is created",
    entityType: "DEAL",
    triggerType: "EVENT_BASED",
    triggerEvents: ["DEAL_CREATED"],
    conditions: [
      { field: "amount", operator: "GREATER_THAN", value: "0" }
    ],
    actions: [
      { 
        type: "NOTIFY_OWNER", 
        template: "new_deal_created",
        message: "A new deal has been created and assigned to you",
        priority: 2
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
    name: "Stale Deal Alert",
    description: "Alert when deals have no activity for 7+ days",
    entityType: "DEAL",
    triggerType: "TIME_BASED",
    schedule: { frequency: "DAILY", time: "09:00" },
    conditions: [
      { field: "amount", operator: "GREATER_THAN", value: 10000 },
      { field: "lastActivityDate", operator: "OLDER_THAN", value: "7 days" },
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

## Production Database Schema

### **Complete Implementation Status**

```sql
-- ✅ IMPLEMENTED: Entity types enum
CREATE TYPE entity_type_enum AS ENUM ('DEAL', 'LEAD', 'TASK', 'PERSON', 'ORGANIZATION', 'ACTIVITY');

-- ✅ IMPLEMENTED: Trigger types enum
CREATE TYPE trigger_type_enum AS ENUM ('EVENT_BASED', 'FIELD_CHANGE', 'TIME_BASED');

-- ✅ IMPLEMENTED: Rule status enum
CREATE TYPE rule_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- ✅ IMPLEMENTED: Main business rules table
CREATE TABLE public.business_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  entity_type entity_type_enum NOT NULL,
  trigger_type trigger_type_enum NOT NULL,
  
  -- Event-based trigger configuration
  trigger_events TEXT[], -- ['DEAL_CREATED', 'DEAL_ASSIGNED', 'DEAL_UPDATED']
  trigger_fields TEXT[], -- For FIELD_CHANGE: ['amount', 'status']
  
  -- Flexible JSON-based condition system
  conditions JSONB NOT NULL DEFAULT '[]',
  
  -- Flexible JSON-based action system
  actions JSONB NOT NULL DEFAULT '[]',
  
  -- Scheduling configuration for time-based rules (Phase 2)
  schedule JSONB, -- {"frequency": "DAILY", "time": "09:00", "timezone": "UTC"}
  next_execution TIMESTAMPTZ, -- When this rule should next run
  last_execution TIMESTAMPTZ, -- When this rule last ran
  
  -- WFM Integration (optional)
  wfm_workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
  wfm_step_id UUID REFERENCES public.workflow_steps(id) ON DELETE SET NULL,
  wfm_status_id UUID REFERENCES public.statuses(id) ON DELETE SET NULL,
  
  -- Metadata
  status rule_status_enum DEFAULT 'DRAFT',
  execution_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ✅ IMPLEMENTED: Business rule notifications table
CREATE TABLE public.business_rule_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.business_rules(id) ON DELETE CASCADE,
  
  -- Entity context
  entity_type entity_type_enum NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Notification details
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  notification_type TEXT NOT NULL,
  priority INTEGER DEFAULT 1, -- 1=LOW, 2=MEDIUM, 3=HIGH, 4=URGENT
  
  -- Actionable notification data
  actions JSONB DEFAULT '{}', -- Available actions for this notification
  
  -- Notification state
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  acted_upon_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ✅ IMPLEMENTED: Rule execution tracking and auditing
CREATE TABLE public.rule_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.business_rules(id) ON DELETE CASCADE,
  
  -- Execution context
  entity_id UUID NOT NULL,
  entity_type entity_type_enum NOT NULL,
  execution_trigger TEXT NOT NULL, -- 'DEAL_UPDATED', 'DEAL_ASSIGNED', 'SCHEDULED', etc.
  
  -- Execution results
  conditions_met BOOLEAN NOT NULL,
  execution_result JSONB DEFAULT '{}',
  notifications_created INTEGER DEFAULT 0,
  tasks_created INTEGER DEFAULT 0,
  activities_created INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  
  execution_time_ms INTEGER,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ✅ IMPLEMENTED: Performance indexes
CREATE INDEX idx_business_rules_entity_trigger ON public.business_rules(entity_type, trigger_type) WHERE status = 'ACTIVE';
CREATE INDEX idx_business_rules_trigger_events ON public.business_rules USING GIN (trigger_events) WHERE status = 'ACTIVE';
CREATE INDEX idx_business_rules_trigger_fields ON public.business_rules USING GIN (trigger_fields) WHERE status = 'ACTIVE';
CREATE INDEX idx_business_rules_next_execution ON public.business_rules(next_execution) WHERE trigger_type = 'TIME_BASED' AND status = 'ACTIVE';
CREATE INDEX idx_business_rules_status ON public.business_rules(status, created_at DESC);

CREATE INDEX idx_rule_executions_rule_entity ON public.rule_executions(rule_id, entity_id, executed_at DESC);
CREATE INDEX idx_rule_executions_trigger ON public.rule_executions(execution_trigger, executed_at DESC);
CREATE INDEX idx_rule_executions_entity ON public.rule_executions(entity_type, entity_id, executed_at DESC);

CREATE INDEX idx_business_rule_notifications_user_unread ON public.business_rule_notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_business_rule_notifications_entity ON public.business_rule_notifications(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_business_rule_notifications_rule ON public.business_rule_notifications(rule_id, created_at DESC);
```

### **✅ IMPLEMENTED: Sophisticated Supabase Functions**

```sql
-- ✅ IMPLEMENTED: Function to evaluate rule conditions
CREATE OR REPLACE FUNCTION public.evaluate_rule_conditions(
  rule_conditions JSONB,
  entity_data JSONB,
  change_data JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
-- [Complete sophisticated implementation with 15+ operators]
$$ LANGUAGE plpgsql;

-- ✅ IMPLEMENTED: Function to execute rule actions
CREATE OR REPLACE FUNCTION public.execute_rule_actions(
  rule_id UUID,
  rule_actions JSONB,
  entity_type entity_type_enum,
  entity_id UUID,
  entity_data JSONB
) RETURNS JSONB AS $$
-- [Complete implementation with NOTIFY_USER, NOTIFY_OWNER, CREATE_TASK, CREATE_ACTIVITY]
$$ LANGUAGE plpgsql;

-- ✅ IMPLEMENTED: Main business rules processing function
CREATE OR REPLACE FUNCTION public.process_business_rules(
  p_entity_type entity_type_enum,
  p_entity_id UUID,
  p_trigger_event TEXT,
  p_entity_data JSONB,
  p_change_data JSONB DEFAULT NULL
) RETURNS JSONB AS $$
-- [Complete implementation with rule matching, condition evaluation, action execution, audit logging]
$$ LANGUAGE plpgsql;
```

## Implementation Roadmap (UPDATED)

### **Phase 1: ACTIVATION - Integration Points (1 week)**
**Status: NEXT IMMEDIATE PRIORITY**

The entire infrastructure is ready. We need only to add trigger integration:

1. **Deal Mutations Integration**: Add `process_business_rules()` calls to:
   - `dealMutations.createDeal` → trigger 'DEAL_CREATED'
   - `dealMutations.updateDeal` → trigger 'DEAL_UPDATED' with change detection
   - `dealMutations.deleteDeal` → trigger 'DEAL_DELETED'

2. **Lead Mutations Integration**: Add `process_business_rules()` calls to:
   - `leadMutations.createLead` → trigger 'LEAD_CREATED'
   - `leadMutations.updateLead` → trigger 'LEAD_UPDATED'
   - `leadMutations.convertLead` → trigger 'LEAD_CONVERTED'

3. **Person/Organization Mutations Integration**: Add triggers for entity changes

4. **Testing & Validation**: Create simple rules and verify automatic triggering

**Expected Effort**: 4-6 hours of development + testing

### **Phase 2: TIME_BASED Rules - Netlify Functions (2-3 weeks)**
**Status: INFRASTRUCTURE READY**

1. **Scheduled Processing**: Add Netlify scheduled function for TIME_BASED rules
2. **Advanced Admin UI**: TIME_BASED rule configuration with scheduling
3. **Rule Templates**: Pre-built common business rules
4. **Enhanced Notifications**: Rich notification templates and actions

### **Phase 3: Advanced Actions & WFM Integration (2-3 weeks)**
**Status: PLANNED**

1. **WFM Event Hooks**: Integration with workflow state changes
2. **Advanced Actions**: SEND_EMAIL, UPDATE_FIELD actions
3. **Stage Progression Blocking**: Task-based workflow gates
4. **Performance Monitoring**: Rule effectiveness analytics

### **Phase 4: Enterprise Features (3-4 weeks)**
**Status: PLANNED**

1. **Advanced Scheduling**: Complex time-based rule configurations
2. **External Integrations**: Webhook actions, third-party notifications  
3. **Rule Analytics**: Effectiveness analysis and optimization suggestions
4. **Bulk Operations**: Mass rule operations and testing interface

## Missing Integration Examples

### **What Should Happen (But Doesn't)**

```typescript
// ❌ MISSING: In dealMutations.createDeal
export const dealMutations = {
  createDeal: async (_parent, args, context) => {
    // ... existing deal creation logic ...
    const newDeal = await dealService.createDeal(userId, serviceInput, accessToken);
    
    // ❌ MISSING: This critical integration
    await context.supabaseClient.rpc('process_business_rules', {
      p_entity_type: 'DEAL',
      p_entity_id: newDeal.id,
      p_trigger_event: 'DEAL_CREATED',
      p_entity_data: JSON.stringify(newDeal),
      p_change_data: null
    });
    
    return newDeal;
  }
}
```

### **What Currently Works**

```typescript
// ✅ WORKS: Manual rule testing via GraphQL
mutation {
  executeBusinessRule(
    ruleId: "rule-uuid"
    entityType: DEAL
    entityId: "deal-uuid"
    testMode: true
  ) {
    rulesProcessed
    notificationsCreated
    errors
  }
}
```

## Key Benefits

1. **✅ Supabase-Native**: Leverages existing database, functions, and security model
2. **✅ Progressive Enhancement**: Infrastructure ready, activation requires minimal changes
3. **✅ No External Dependencies**: Uses existing Netlify and Supabase infrastructure
4. **✅ Enterprise Patterns**: Follows established CRM automation patterns
5. **✅ Configurable**: Admins can create custom rules without code changes
6. **✅ Auditable**: Complete execution history and notification tracking
7. **✅ Performance Optimized**: Database-first approach with proper indexing
8. **✅ Future-Proof**: Easy to add new entity types and action types

## Critical Next Step

**The Business Rules Engine is 95% complete and can be activated with 4-6 hours of integration work.** The missing piece is simply adding `process_business_rules()` calls to existing mutation resolvers.

Once activated, PipeCD will transform from a reactive CRM into a **proactive business intelligence system** with zero additional infrastructure requirements. 