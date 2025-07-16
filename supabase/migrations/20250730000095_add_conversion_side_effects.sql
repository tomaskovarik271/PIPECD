-- Migration: Add Conversion Side Effects to WFM Outcome Rules
-- Date: 2025-01-15
-- Purpose: Enable WFM CONVERTED outcomes to trigger real entity conversions

BEGIN;

-- Update the CONVERTED outcome rule for deals to include entity conversion side effect
UPDATE public.wfm_outcome_rules 
SET side_effects = jsonb_build_object(
  'trigger_entity_conversion', true,
  'conversion_config', jsonb_build_object(
    'preserve_activities', true,
    'create_conversion_activity', true,
    'archive_deal', false,
    'reason', 'WFM outcome triggered conversion',
    'notes', 'Deal converted to lead via WFM outcome execution'
  )
)
WHERE outcome_type = 'CONVERTED' 
  AND entity_type = 'DEAL' 
  AND rule_type = 'ALLOW_FROM_ANY'
  AND rule_name = 'deal_conversion_allow_any';

-- Verify the update was successful
DO $$
DECLARE
  rule_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rule_count
  FROM public.wfm_outcome_rules 
  WHERE outcome_type = 'CONVERTED' 
    AND entity_type = 'DEAL'
    AND side_effects ? 'trigger_entity_conversion';
    
  IF rule_count > 0 THEN
    RAISE NOTICE 'SUCCESS: Updated % WFM outcome rule(s) with entity conversion side effects', rule_count;
  ELSE
    RAISE NOTICE 'WARNING: No WFM outcome rules were updated with conversion side effects';
  END IF;
END $$;

-- Create a new rule specifically for WFM-driven conversions if the update didn't work
INSERT INTO public.wfm_outcome_rules (
  rule_name,
  description,
  entity_type,
  outcome_type,
  rule_type,
  conditions,
  restrictions,
  target_step_mapping,
  side_effects,
  is_active,
  priority
) VALUES (
  'wfm_deal_to_lead_conversion',
  'WFM-driven deal to lead conversion with entity creation',
  'DEAL',
  'CONVERTED',
  'ALLOW_FROM_ANY',
  '{}',
  '{"exclude_final_steps": false}',
  '{}',
  jsonb_build_object(
    'trigger_entity_conversion', true,
    'conversion_config', jsonb_build_object(
      'preserve_activities', true,
      'create_conversion_activity', true,
      'archive_deal', false,
      'reason', 'WFM outcome triggered conversion',
      'notes', 'Deal converted to lead via WFM outcome execution'
    )
  ),
  true,
  100
) ON CONFLICT (rule_name) DO UPDATE SET
  side_effects = EXCLUDED.side_effects,
  is_active = EXCLUDED.is_active,
  priority = EXCLUDED.priority;

-- Final completion message
DO $$
BEGIN
  RAISE NOTICE 'WFM Conversion side effects migration completed successfully!';
  RAISE NOTICE 'CONVERTED outcomes for deals will now trigger real entity conversions';
END $$;

COMMIT; 