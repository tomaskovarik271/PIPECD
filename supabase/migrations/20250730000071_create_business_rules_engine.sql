-- Migration: Create Business Rules Engine Core Infrastructure
-- Phase 1: EVENT_BASED and FIELD_CHANGE rules with Supabase-native implementation
-- File: 20250730000071_create_business_rules_engine.sql

BEGIN;

-- Create entity types enum (reuse existing if available, otherwise create)
DO $$ BEGIN
    CREATE TYPE entity_type_enum AS ENUM ('DEAL', 'LEAD', 'TASK', 'PERSON', 'ORGANIZATION', 'ACTIVITY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create trigger types enum for business rules
CREATE TYPE trigger_type_enum AS ENUM ('EVENT_BASED', 'FIELD_CHANGE', 'TIME_BASED');

-- Create rule status enum for lifecycle management
CREATE TYPE rule_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- Main business rules table
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

-- Enhanced notifications table for business rules
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

-- Rule execution tracking and auditing
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

-- Create indexes for performance
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

-- Function to evaluate rule conditions
CREATE OR REPLACE FUNCTION public.evaluate_rule_conditions(
  rule_conditions JSONB,
  entity_data JSONB,
  change_data JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  condition JSONB;
  field_value TEXT;
  condition_value TEXT;
  condition_met BOOLEAN;
  all_conditions_met BOOLEAN := TRUE;
  operator TEXT;
  field_name TEXT;
  numeric_value NUMERIC;
  numeric_condition NUMERIC;
  timestamp_value TIMESTAMPTZ;
  original_value TEXT;
  new_value TEXT;
BEGIN
  -- If no conditions, rule matches
  IF jsonb_array_length(rule_conditions) = 0 THEN
    RETURN TRUE;
  END IF;

  -- Loop through conditions and evaluate each one
  FOR condition IN SELECT jsonb_array_elements(rule_conditions)
  LOOP
    field_name := condition ->> 'field';
    operator := condition ->> 'operator';
    condition_value := condition ->> 'value';
    
    -- Extract field value from entity data
    field_value := entity_data ->> field_name;
    
    -- Initialize condition as not met
    condition_met := FALSE;
    
    -- Evaluate condition based on operator
    CASE operator
      WHEN 'EQUALS' THEN
        condition_met := field_value = condition_value;
      
      WHEN 'NOT_EQUALS' THEN
        condition_met := field_value != condition_value OR field_value IS NULL;
      
      WHEN 'GREATER_THAN' THEN
        BEGIN
          numeric_value := field_value::NUMERIC;
          numeric_condition := condition_value::NUMERIC;
          condition_met := numeric_value > numeric_condition;
        EXCEPTION
          WHEN invalid_text_representation THEN
            condition_met := FALSE;
        END;
      
      WHEN 'LESS_THAN' THEN
        BEGIN
          numeric_value := field_value::NUMERIC;
          numeric_condition := condition_value::NUMERIC;
          condition_met := numeric_value < numeric_condition;
        EXCEPTION
          WHEN invalid_text_representation THEN
            condition_met := FALSE;
        END;
      
      WHEN 'GREATER_EQUAL' THEN
        BEGIN
          numeric_value := field_value::NUMERIC;
          numeric_condition := condition_value::NUMERIC;
          condition_met := numeric_value >= numeric_condition;
        EXCEPTION
          WHEN invalid_text_representation THEN
            condition_met := FALSE;
        END;
      
      WHEN 'LESS_EQUAL' THEN
        BEGIN
          numeric_value := field_value::NUMERIC;
          numeric_condition := condition_value::NUMERIC;
          condition_met := numeric_value <= numeric_condition;
        EXCEPTION
          WHEN invalid_text_representation THEN
            condition_met := FALSE;
        END;
      
      WHEN 'OLDER_THAN' THEN
        BEGIN
          timestamp_value := field_value::TIMESTAMPTZ;
          condition_met := timestamp_value < NOW() - condition_value::INTERVAL;
        EXCEPTION
          WHEN invalid_text_representation THEN
            condition_met := FALSE;
        END;
      
      WHEN 'NEWER_THAN' THEN
        BEGIN
          timestamp_value := field_value::TIMESTAMPTZ;
          condition_met := timestamp_value > NOW() - condition_value::INTERVAL;
        EXCEPTION
          WHEN invalid_text_representation THEN
            condition_met := FALSE;
        END;
      
      WHEN 'IS_NULL' THEN
        condition_met := field_value IS NULL;
      
      WHEN 'IS_NOT_NULL' THEN
        condition_met := field_value IS NOT NULL;
      
      WHEN 'CONTAINS' THEN
        condition_met := field_value LIKE '%' || condition_value || '%';
      
      WHEN 'STARTS_WITH' THEN
        condition_met := field_value LIKE condition_value || '%';
      
      WHEN 'ENDS_WITH' THEN
        condition_met := field_value LIKE '%' || condition_value;
      
      WHEN 'IN' THEN
        condition_met := field_value = ANY(string_to_array(condition_value, ','));
      
      WHEN 'NOT_IN' THEN
        condition_met := NOT (field_value = ANY(string_to_array(condition_value, ',')));
      
      WHEN 'CHANGED_FROM' THEN
        IF change_data IS NOT NULL THEN
          original_value := change_data ->> ('original_' || field_name);
          condition_met := original_value = condition_value AND field_value != condition_value;
        END IF;
      
      WHEN 'CHANGED_TO' THEN
        IF change_data IS NOT NULL THEN
          original_value := change_data ->> ('original_' || field_name);
          condition_met := field_value = condition_value AND original_value != condition_value;
        END IF;
      
      WHEN 'DECREASED_BY_PERCENT' THEN
        IF change_data IS NOT NULL THEN
          BEGIN
            original_value := change_data ->> ('original_' || field_name);
            numeric_value := field_value::NUMERIC;
            numeric_condition := original_value::NUMERIC;
            IF numeric_condition > 0 THEN
              condition_met := ((numeric_condition - numeric_value) / numeric_condition * 100) >= condition_value::NUMERIC;
            END IF;
          EXCEPTION
            WHEN invalid_text_representation THEN
              condition_met := FALSE;
          END;
        END IF;
      
      WHEN 'INCREASED_BY_PERCENT' THEN
        IF change_data IS NOT NULL THEN
          BEGIN
            original_value := change_data ->> ('original_' || field_name);
            numeric_value := field_value::NUMERIC;
            numeric_condition := original_value::NUMERIC;
            IF numeric_condition > 0 THEN
              condition_met := ((numeric_value - numeric_condition) / numeric_condition * 100) >= condition_value::NUMERIC;
            END IF;
          EXCEPTION
            WHEN invalid_text_representation THEN
              condition_met := FALSE;
          END;
        END IF;
      
      ELSE
        -- Unknown operator, condition not met
        condition_met := FALSE;
    END CASE;
    
    -- Handle logical operators (default AND)
    IF (condition ->> 'logicalOperator') = 'OR' THEN
      IF condition_met THEN
        RETURN TRUE; -- Short circuit on OR success
      END IF;
    ELSE
      -- Default AND logic
      IF NOT condition_met THEN
        all_conditions_met := FALSE;
        -- Don't return early for AND - need to check if any OR conditions exist
      END IF;
    END IF;
  END LOOP;
  
  RETURN all_conditions_met;
END;
$$ LANGUAGE plpgsql;

-- Function to execute rule actions
CREATE OR REPLACE FUNCTION public.execute_rule_actions(
  rule_id UUID,
  rule_actions JSONB,
  entity_type entity_type_enum,
  entity_id UUID,
  entity_data JSONB
) RETURNS JSONB AS $$
DECLARE
  action JSONB;
  execution_result JSONB := '{"notifications_created": 0, "tasks_created": 0, "activities_created": 0, "errors": []}'::JSONB;
  target_user_id UUID;
  notification_title TEXT;
  notification_message TEXT;
  notification_priority INTEGER;
  action_type TEXT;
  error_message TEXT;
BEGIN
  -- Loop through actions and execute each one
  FOR action IN SELECT jsonb_array_elements(rule_actions)
  LOOP
    action_type := action ->> 'type';
    
    BEGIN
      CASE action_type
        WHEN 'NOTIFY_USER' THEN
          target_user_id := (action ->> 'target')::UUID;
          notification_title := COALESCE(action ->> 'template', 'Business Rule Notification') || ' - ' || COALESCE(entity_data ->> 'name', 'Entity');
          notification_message := COALESCE(action ->> 'message', 'A business rule has been triggered for this entity');
          notification_priority := COALESCE((action ->> 'priority')::INTEGER, 1);
          
          INSERT INTO public.business_rule_notifications (
            rule_id, entity_type, entity_id, user_id, title, message, 
            notification_type, priority, actions
          ) VALUES (
            rule_id, entity_type, entity_id, target_user_id,
            notification_title, notification_message,
            COALESCE(action ->> 'template', 'business_rule'),
            notification_priority, action
          );
          
          execution_result := jsonb_set(execution_result, '{notifications_created}', 
            ((execution_result ->> 'notifications_created')::INTEGER + 1)::TEXT::JSONB);
        
        WHEN 'NOTIFY_OWNER' THEN
          -- Get owner from entity data
          target_user_id := COALESCE(
            (entity_data ->> 'assigned_to_user_id')::UUID,
            (entity_data ->> 'user_id')::UUID,
            (entity_data ->> 'created_by_user_id')::UUID
          );
          
          IF target_user_id IS NOT NULL THEN
            notification_title := COALESCE(action ->> 'template', 'Business Rule Notification') || ' - ' || COALESCE(entity_data ->> 'name', 'Entity');
            notification_message := COALESCE(action ->> 'message', 'A business rule has been triggered for your entity');
            notification_priority := COALESCE((action ->> 'priority')::INTEGER, 1);
            
            INSERT INTO public.business_rule_notifications (
              rule_id, entity_type, entity_id, user_id, title, message, 
              notification_type, priority, actions
            ) VALUES (
              rule_id, entity_type, entity_id, target_user_id,
              notification_title, notification_message,
              COALESCE(action ->> 'template', 'business_rule'),
              notification_priority, action
            );
            
            execution_result := jsonb_set(execution_result, '{notifications_created}', 
              ((execution_result ->> 'notifications_created')::INTEGER + 1)::TEXT::JSONB);
          END IF;
        
        WHEN 'CREATE_TASK' THEN
          -- Integration with existing task system would go here
          -- For now, just count the action
          execution_result := jsonb_set(execution_result, '{tasks_created}', 
            ((execution_result ->> 'tasks_created')::INTEGER + 1)::TEXT::JSONB);
        
        WHEN 'CREATE_ACTIVITY' THEN
          -- Integration with existing activity system would go here
          -- For now, just count the action
          execution_result := jsonb_set(execution_result, '{activities_created}', 
            ((execution_result ->> 'activities_created')::INTEGER + 1)::TEXT::JSONB);
        
        ELSE
          -- Unknown action type
          error_message := 'Unknown action type: ' || action_type;
          execution_result := jsonb_set(execution_result, '{errors}', 
            (execution_result -> 'errors') || jsonb_build_array(error_message));
      END CASE;
      
    EXCEPTION
      WHEN OTHERS THEN
        error_message := 'Error executing action ' || action_type || ': ' || SQLERRM;
        execution_result := jsonb_set(execution_result, '{errors}', 
          (execution_result -> 'errors') || jsonb_build_array(error_message));
    END;
  END LOOP;
  
  RETURN execution_result;
END;
$$ LANGUAGE plpgsql;

-- Function to process business rules for an entity
CREATE OR REPLACE FUNCTION public.process_business_rules(
  p_entity_type entity_type_enum,
  p_entity_id UUID,
  p_trigger_event TEXT,
  p_entity_data JSONB,
  p_change_data JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  rule RECORD;
  execution_result JSONB;
  total_result JSONB := '{"rules_processed": 0, "notifications_created": 0, "tasks_created": 0, "activities_created": 0, "errors": []}'::JSONB;
  rule_execution_id UUID;
  start_time TIMESTAMPTZ;
  execution_time_ms INTEGER;
  conditions_met BOOLEAN;
BEGIN
  start_time := clock_timestamp();
  
  -- Find matching rules
  FOR rule IN 
    SELECT * FROM public.business_rules 
    WHERE status = 'ACTIVE' 
      AND entity_type = p_entity_type
      AND (
        (trigger_type = 'EVENT_BASED' AND p_trigger_event = ANY(trigger_events))
        OR 
        (trigger_type = 'FIELD_CHANGE' AND p_change_data IS NOT NULL)
      )
    ORDER BY created_at ASC
  LOOP
    -- Evaluate rule conditions
    conditions_met := public.evaluate_rule_conditions(rule.conditions, p_entity_data, p_change_data);
    
    -- Create execution record
    INSERT INTO public.rule_executions (
      rule_id, entity_id, entity_type, execution_trigger, conditions_met
    ) VALUES (
      rule.id, p_entity_id, p_entity_type, p_trigger_event, conditions_met
    ) RETURNING id INTO rule_execution_id;
    
    -- If conditions are met, execute actions
    IF conditions_met THEN
      execution_result := public.execute_rule_actions(
        rule.id, rule.actions, p_entity_type, p_entity_id, p_entity_data
      );
      
      -- Update execution record with results
      execution_time_ms := EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000;
      
      UPDATE public.rule_executions 
      SET execution_result = execution_result,
          notifications_created = (execution_result ->> 'notifications_created')::INTEGER,
          tasks_created = (execution_result ->> 'tasks_created')::INTEGER,
          activities_created = (execution_result ->> 'activities_created')::INTEGER,
          errors = execution_result -> 'errors',
          execution_time_ms = execution_time_ms
      WHERE id = rule_execution_id;
      
      -- Update rule execution count
      UPDATE public.business_rules 
      SET execution_count = execution_count + 1,
          last_execution = NOW(),
          updated_at = NOW()
      WHERE id = rule.id;
      
      -- Aggregate results
      total_result := jsonb_set(total_result, '{notifications_created}', 
        ((total_result ->> 'notifications_created')::INTEGER + (execution_result ->> 'notifications_created')::INTEGER)::TEXT::JSONB);
      total_result := jsonb_set(total_result, '{tasks_created}', 
        ((total_result ->> 'tasks_created')::INTEGER + (execution_result ->> 'tasks_created')::INTEGER)::TEXT::JSONB);
      total_result := jsonb_set(total_result, '{activities_created}', 
        ((total_result ->> 'activities_created')::INTEGER + (execution_result ->> 'activities_created')::INTEGER)::TEXT::JSONB);
      
      -- Append errors
      IF jsonb_array_length(execution_result -> 'errors') > 0 THEN
        total_result := jsonb_set(total_result, '{errors}', 
          (total_result -> 'errors') || (execution_result -> 'errors'));
      END IF;
    END IF;
    
    total_result := jsonb_set(total_result, '{rules_processed}', 
      ((total_result ->> 'rules_processed')::INTEGER + 1)::TEXT::JSONB);
  END LOOP;
  
  RETURN total_result;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger for business_rules
CREATE OR REPLACE FUNCTION public.update_business_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_rules_updated_at
    BEFORE UPDATE ON public.business_rules
    FOR EACH ROW EXECUTE FUNCTION public.update_business_rules_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.business_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_rule_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_rules (admin only for now)
CREATE POLICY "Admin can manage business rules"
ON public.business_rules FOR ALL
USING (
  public.check_permission(auth.uid(), 'manage', 'app_settings')
);

-- RLS Policies for business_rule_notifications (users can see their own)
CREATE POLICY "Users can view their own business rule notifications"
ON public.business_rule_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own business rule notifications"
ON public.business_rule_notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create business rule notifications"
ON public.business_rule_notifications FOR INSERT
WITH CHECK (true);

-- RLS Policies for rule_executions (admin and rule creators can view)
CREATE POLICY "Admin can view all rule executions"
ON public.rule_executions FOR SELECT
USING (
  public.check_permission(auth.uid(), 'manage', 'app_settings')
);

CREATE POLICY "System can create rule executions"
ON public.rule_executions FOR INSERT
WITH CHECK (true);

COMMIT; 