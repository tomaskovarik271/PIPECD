-- Fix business rules function to properly handle JSON string conversion
-- The issue is that conditions and actions are stored as JSON strings but the function expects JSONB

-- Drop and recreate the process_business_rules function with proper JSON handling
CREATE OR REPLACE FUNCTION public.process_business_rules(
  p_entity_type entity_type_enum,
  p_entity_id UUID,
  p_trigger_event TEXT,
  p_entity_data JSONB,
  p_change_data JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  rule RECORD;
  action_execution_result JSONB;
  total_result JSONB := '{"rules_processed": 0, "notifications_created": 0, "tasks_created": 0, "activities_created": 0, "errors": []}'::JSONB;
  rule_execution_id UUID;
  start_time TIMESTAMPTZ;
  execution_time_ms INTEGER;
  conditions_met BOOLEAN;
  rule_conditions JSONB;
  rule_actions JSONB;
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
    -- Convert JSON strings to JSONB if needed
    BEGIN
      IF rule.conditions IS NULL THEN
        rule_conditions := '[]'::JSONB;
      ELSIF jsonb_typeof(rule.conditions) = 'string' THEN
        rule_conditions := (rule.conditions #>> '{}')::JSONB;
      ELSE
        rule_conditions := rule.conditions;
      END IF;
      
      IF rule.actions IS NULL THEN
        rule_actions := '[]'::JSONB;
      ELSIF jsonb_typeof(rule.actions) = 'string' THEN
        rule_actions := (rule.actions #>> '{}')::JSONB;
      ELSE
        rule_actions := rule.actions;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- If JSON parsing fails, skip this rule and log error
        total_result := jsonb_set(total_result, '{errors}', 
          (total_result -> 'errors') || jsonb_build_array('Failed to parse rule ' || rule.id || ': ' || SQLERRM));
        CONTINUE;
    END;
    
    -- Evaluate rule conditions
    conditions_met := public.evaluate_rule_conditions(rule_conditions, p_entity_data, p_change_data);
    
    -- Create execution record
    INSERT INTO public.rule_executions (
      rule_id, entity_id, entity_type, execution_trigger, conditions_met
    ) VALUES (
      rule.id, p_entity_id, p_entity_type, p_trigger_event, conditions_met
    ) RETURNING id INTO rule_execution_id;
    
    -- If conditions are met, execute actions
    IF conditions_met THEN
      action_execution_result := public.execute_rule_actions(
        rule.id, rule_actions, p_entity_type, p_entity_id, p_entity_data
      );
      
      -- Update execution record with results
      execution_time_ms := EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000;
      
      UPDATE public.rule_executions 
      SET execution_result = action_execution_result,
          notifications_created = COALESCE((action_execution_result ->> 'notifications_created')::INTEGER, 0),
          tasks_created = COALESCE((action_execution_result ->> 'tasks_created')::INTEGER, 0),
          activities_created = COALESCE((action_execution_result ->> 'activities_created')::INTEGER, 0),
          errors = COALESCE(action_execution_result -> 'errors', '[]'::JSONB),
          execution_time_ms = execution_time_ms
      WHERE id = rule_execution_id;
      
      -- Update rule execution count
      UPDATE public.business_rules 
      SET execution_count = execution_count + 1,
          last_execution = NOW(),
          updated_at = NOW()
      WHERE id = rule.id;
      
      -- Aggregate results with null safety
      total_result := jsonb_set(total_result, '{notifications_created}', 
        ((total_result ->> 'notifications_created')::INTEGER + COALESCE((action_execution_result ->> 'notifications_created')::INTEGER, 0))::TEXT::JSONB);
      total_result := jsonb_set(total_result, '{tasks_created}', 
        ((total_result ->> 'tasks_created')::INTEGER + COALESCE((action_execution_result ->> 'tasks_created')::INTEGER, 0))::TEXT::JSONB);
      total_result := jsonb_set(total_result, '{activities_created}', 
        ((total_result ->> 'activities_created')::INTEGER + COALESCE((action_execution_result ->> 'activities_created')::INTEGER, 0))::TEXT::JSONB);
      
      -- Append errors with null safety
      IF action_execution_result ? 'errors' AND jsonb_typeof(action_execution_result -> 'errors') = 'array' AND jsonb_array_length(action_execution_result -> 'errors') > 0 THEN
        total_result := jsonb_set(total_result, '{errors}', 
          (total_result -> 'errors') || (action_execution_result -> 'errors'));
      END IF;
    END IF;
    
    total_result := jsonb_set(total_result, '{rules_processed}', 
      ((total_result ->> 'rules_processed')::INTEGER + 1)::TEXT::JSONB);
  END LOOP;
  
  RETURN total_result;
END;
$$ LANGUAGE plpgsql; 