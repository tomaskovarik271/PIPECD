-- Fix notification template variable substitution in business rules
-- The issue is that {{deal_name}}, {{deal_amount}} etc. are not being replaced with actual values

-- Create a helper function to substitute template variables
CREATE OR REPLACE FUNCTION public.substitute_template_variables(
  template_text TEXT,
  entity_data JSONB,
  entity_type entity_type_enum
) RETURNS TEXT AS $$
DECLARE
  result_text TEXT;
  formatted_amount TEXT;
BEGIN
  result_text := template_text;
  
  -- Handle NULL or empty template
  IF result_text IS NULL OR result_text = '' THEN
    RETURN result_text;
  END IF;
  
  -- Common substitutions for all entity types
  result_text := replace(result_text, '{{entity_id}}', COALESCE(entity_data ->> 'id', ''));
  result_text := replace(result_text, '{{entity_name}}', COALESCE(entity_data ->> 'name', ''));
  
  -- Deal-specific substitutions
  IF entity_type = 'DEAL' THEN
    result_text := replace(result_text, '{{deal_name}}', COALESCE(entity_data ->> 'name', 'Unnamed Deal'));
    result_text := replace(result_text, '{{deal_id}}', COALESCE(entity_data ->> 'id', ''));
    
    -- Format deal amount with currency
    IF entity_data ? 'amount' AND entity_data ->> 'amount' IS NOT NULL THEN
      formatted_amount := COALESCE(entity_data ->> 'currency', 'USD') || ' ' || 
                         to_char((entity_data ->> 'amount')::NUMERIC, 'FM999,999,999.00');
      result_text := replace(result_text, '{{deal_amount}}', formatted_amount);
    ELSE
      result_text := replace(result_text, '{{deal_amount}}', 'No amount set');
    END IF;
    
    result_text := replace(result_text, '{{deal_stage}}', COALESCE(entity_data ->> 'stage', 'Unknown Stage'));
    result_text := replace(result_text, '{{deal_owner}}', COALESCE(entity_data ->> 'owner_name', 'Unassigned'));
    result_text := replace(result_text, '{{deal_close_date}}', COALESCE(entity_data ->> 'expected_close_date', 'No close date'));
  END IF;
  
  -- Lead-specific substitutions
  IF entity_type = 'LEAD' THEN
    result_text := replace(result_text, '{{lead_name}}', COALESCE(entity_data ->> 'contact_name', 'Unnamed Lead'));
    result_text := replace(result_text, '{{lead_id}}', COALESCE(entity_data ->> 'id', ''));
    result_text := replace(result_text, '{{lead_email}}', COALESCE(entity_data ->> 'contact_email', 'No email'));
    result_text := replace(result_text, '{{lead_source}}', COALESCE(entity_data ->> 'source', 'Unknown Source'));
    
    -- Format lead estimated value
    IF entity_data ? 'estimated_value' AND entity_data ->> 'estimated_value' IS NOT NULL THEN
      formatted_amount := 'USD ' || to_char((entity_data ->> 'estimated_value')::NUMERIC, 'FM999,999,999.00');
      result_text := replace(result_text, '{{lead_value}}', formatted_amount);
    ELSE
      result_text := replace(result_text, '{{lead_value}}', 'No value estimate');
    END IF;
  END IF;
  
  -- Organization-specific substitutions
  IF entity_type = 'ORGANIZATION' THEN
    result_text := replace(result_text, '{{organization_name}}', COALESCE(entity_data ->> 'name', 'Unnamed Organization'));
    result_text := replace(result_text, '{{organization_id}}', COALESCE(entity_data ->> 'id', ''));
    result_text := replace(result_text, '{{organization_website}}', COALESCE(entity_data ->> 'website', 'No website'));
  END IF;
  
  -- Person-specific substitutions
  IF entity_type = 'PERSON' THEN
    result_text := replace(result_text, '{{person_name}}', 
      TRIM(COALESCE(entity_data ->> 'first_name', '') || ' ' || COALESCE(entity_data ->> 'last_name', '')));
    result_text := replace(result_text, '{{person_id}}', COALESCE(entity_data ->> 'id', ''));
    result_text := replace(result_text, '{{person_email}}', COALESCE(entity_data ->> 'email', 'No email'));
    result_text := replace(result_text, '{{person_phone}}', COALESCE(entity_data ->> 'phone', 'No phone'));
  END IF;
  
  -- Task-specific substitutions
  IF entity_type = 'TASK' THEN
    result_text := replace(result_text, '{{task_title}}', COALESCE(entity_data ->> 'title', 'Unnamed Task'));
    result_text := replace(result_text, '{{task_id}}', COALESCE(entity_data ->> 'id', ''));
    result_text := replace(result_text, '{{task_due_date}}', COALESCE(entity_data ->> 'due_date', 'No due date'));
    result_text := replace(result_text, '{{task_priority}}', COALESCE(entity_data ->> 'priority', 'Normal'));
  END IF;
  
  -- Activity-specific substitutions
  IF entity_type = 'ACTIVITY' THEN
    result_text := replace(result_text, '{{activity_subject}}', COALESCE(entity_data ->> 'subject', 'Unnamed Activity'));
    result_text := replace(result_text, '{{activity_id}}', COALESCE(entity_data ->> 'id', ''));
    result_text := replace(result_text, '{{activity_type}}', COALESCE(entity_data ->> 'type', 'Unknown Type'));
    result_text := replace(result_text, '{{activity_due_date}}', COALESCE(entity_data ->> 'due_date', 'No due date'));
  END IF;
  
  -- Date/time substitutions
  result_text := replace(result_text, '{{current_date}}', CURRENT_DATE::TEXT);
  result_text := replace(result_text, '{{current_time}}', CURRENT_TIMESTAMP::TEXT);
  
  RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- Update the execute_rule_actions function to use template substitution
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
  raw_title TEXT;
  raw_message TEXT;
BEGIN
  -- Loop through actions and execute each one
  FOR action IN SELECT jsonb_array_elements(rule_actions)
  LOOP
    action_type := action ->> 'type';
    
    BEGIN
      CASE action_type
        WHEN 'NOTIFY_USER' THEN
          target_user_id := (action ->> 'target')::UUID;
          
          -- Get raw title and message, then substitute variables
          raw_title := COALESCE(action ->> 'template', 'Business Rule Notification');
          raw_message := COALESCE(action ->> 'message', 'A business rule has been triggered for this entity');
          
          notification_title := public.substitute_template_variables(raw_title, entity_data, entity_type);
          notification_message := public.substitute_template_variables(raw_message, entity_data, entity_type);
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
            -- Get raw title and message, then substitute variables
            raw_title := COALESCE(action ->> 'template', 'Business Rule Notification');
            raw_message := COALESCE(action ->> 'message', 'A business rule has been triggered for your entity');
            
            notification_title := public.substitute_template_variables(raw_title, entity_data, entity_type);
            notification_message := public.substitute_template_variables(raw_message, entity_data, entity_type);
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