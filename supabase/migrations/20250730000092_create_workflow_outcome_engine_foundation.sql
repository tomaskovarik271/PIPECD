-- Migration: Workflow Outcome Engine Foundation
-- Create configurable WFM outcome system to replace hardcoded workflow logic
-- This is separate from the existing Business Rules Engine (general automation)
-- Phase 1: Foundation tables with current system behavior seeded
-- Version: 1.0
-- Timestamp: 20250730000092

BEGIN;

-- ================================
-- 1. BUSINESS OUTCOME RULES TABLE
-- ================================
-- Defines when specific outcomes (WON/LOST/CONVERTED) are allowed

CREATE TABLE public.business_outcome_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  description TEXT,
  
  -- Rule scope
  entity_type TEXT NOT NULL CHECK (entity_type IN ('DEAL', 'LEAD', 'ANY')),
  outcome_type TEXT NOT NULL CHECK (outcome_type IN ('WON', 'LOST', 'CONVERTED')),
  rule_type TEXT NOT NULL CHECK (rule_type IN ('ALLOW_FROM_ANY', 'PROBABILITY_THRESHOLD', 'STEP_SPECIFIC', 'WORKFLOW_SPECIFIC')),
  
  -- Conditional logic (JSONB for flexibility)
  conditions JSONB DEFAULT '{}',
  restrictions JSONB DEFAULT '{}',
  
  -- Target behavior
  target_step_mapping JSONB DEFAULT '{}',
  side_effects JSONB DEFAULT '{}',
  
  -- Rule management
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 100,
  
  -- Audit
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(rule_name)
);

COMMENT ON TABLE public.business_outcome_rules IS 'Configurable rules defining when and how business outcomes (WON/LOST/CONVERTED) can be executed';
COMMENT ON COLUMN public.business_outcome_rules.conditions IS 'JSONB conditions like {"min_probability": 0.9, "workflow_ids": ["uuid"], "required_steps": ["uuid"]}';
COMMENT ON COLUMN public.business_outcome_rules.restrictions IS 'JSONB restrictions like {"blocked_steps": ["uuid"], "required_permissions": ["permission"]}';
COMMENT ON COLUMN public.business_outcome_rules.target_step_mapping IS 'JSONB mapping of workflow_id to target_step_id for this outcome';
COMMENT ON COLUMN public.business_outcome_rules.side_effects IS 'JSONB side effects like {"update_probability": 1.0, "trigger_automations": ["automation_id"]}';

-- ================================
-- 2. WORKFLOW BEHAVIORS TABLE  
-- ================================
-- Defines UI and system behavior per workflow

CREATE TABLE public.workflow_behaviors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  behavior_type TEXT NOT NULL CHECK (behavior_type IN ('KANBAN_VISIBILITY', 'BUTTON_AVAILABILITY', 'AUTO_TRANSITIONS', 'UI_CUSTOMIZATION')),
  configuration JSONB NOT NULL DEFAULT '{}',
  
  -- Context
  applies_to_steps UUID[], -- Specific step IDs, NULL = applies to all steps
  user_roles TEXT[], -- Which roles this applies to, NULL = applies to all
  
  -- Rule management
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 100,
  
  -- Audit
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.workflow_behaviors IS 'Configurable UI and system behaviors per workflow';
COMMENT ON COLUMN public.workflow_behaviors.configuration IS 'JSONB configuration specific to behavior_type';
COMMENT ON COLUMN public.workflow_behaviors.applies_to_steps IS 'Array of step UUIDs this behavior applies to, NULL = all steps';
COMMENT ON COLUMN public.workflow_behaviors.user_roles IS 'Array of role names this behavior applies to, NULL = all roles';

-- ================================
-- 3. OUTCOME STEP MAPPINGS TABLE
-- ================================  
-- Maps business outcomes to target workflow steps

CREATE TABLE public.outcome_step_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  outcome_type TEXT NOT NULL CHECK (outcome_type IN ('WON', 'LOST', 'CONVERTED')),
  target_step_id UUID REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
  
  -- Conditional mappings
  from_step_ids UUID[], -- Source steps this mapping applies to, NULL = all steps
  conditions JSONB DEFAULT '{}', -- Additional conditions for this mapping
  
  -- Rule management
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 100,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(workflow_id, outcome_type, target_step_id)
);

COMMENT ON TABLE public.outcome_step_mappings IS 'Maps business outcomes to target workflow steps';
COMMENT ON COLUMN public.outcome_step_mappings.from_step_ids IS 'Array of step UUIDs this mapping applies from, NULL = all steps';
COMMENT ON COLUMN public.outcome_step_mappings.conditions IS 'JSONB additional conditions for this mapping';

-- ================================
-- 4. CONFIGURABLE CONVERSION RULES TABLE
-- ================================
-- Generic entity conversion configuration

CREATE TABLE public.configurable_conversion_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  description TEXT,
  
  -- Conversion scope
  source_entity_type TEXT NOT NULL CHECK (source_entity_type IN ('DEAL', 'LEAD', 'PERSON', 'ORGANIZATION')),
  target_entity_type TEXT NOT NULL CHECK (target_entity_type IN ('DEAL', 'LEAD', 'PERSON', 'ORGANIZATION')),
  
  -- Conversion logic
  conditions JSONB DEFAULT '{}', -- When this conversion is allowed
  field_mappings JSONB DEFAULT '{}', -- How to map fields between entities
  validation_rules JSONB DEFAULT '{}', -- Validation before conversion
  post_conversion_actions JSONB DEFAULT '{}', -- Actions after conversion
  
  -- Rule management
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 100,
  
  -- Audit
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(rule_name),
  CHECK (source_entity_type != target_entity_type)
);

COMMENT ON TABLE public.configurable_conversion_rules IS 'Generic configurable rules for entity conversions';
COMMENT ON COLUMN public.configurable_conversion_rules.field_mappings IS 'JSONB field mapping configuration between source and target entities';

-- ================================
-- 5. TRIGGERS FOR UPDATED_AT
-- ================================

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.business_outcome_rules
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workflow_behaviors
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.outcome_step_mappings
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.configurable_conversion_rules
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- ================================
-- 6. INDEXES FOR PERFORMANCE
-- ================================

-- Business outcome rules indexes
CREATE INDEX idx_business_outcome_rules_entity_type_outcome ON public.business_outcome_rules(entity_type, outcome_type) WHERE is_active = true;
CREATE INDEX idx_business_outcome_rules_rule_type ON public.business_outcome_rules(rule_type) WHERE is_active = true;
CREATE INDEX idx_business_outcome_rules_priority ON public.business_outcome_rules(priority) WHERE is_active = true;

-- Workflow behaviors indexes  
CREATE INDEX idx_workflow_behaviors_workflow_id ON public.workflow_behaviors(workflow_id) WHERE is_active = true;
CREATE INDEX idx_workflow_behaviors_behavior_type ON public.workflow_behaviors(behavior_type) WHERE is_active = true;
CREATE INDEX idx_workflow_behaviors_priority ON public.workflow_behaviors(priority) WHERE is_active = true;

-- Outcome step mappings indexes
CREATE INDEX idx_outcome_step_mappings_workflow_outcome ON public.outcome_step_mappings(workflow_id, outcome_type) WHERE is_active = true;
CREATE INDEX idx_outcome_step_mappings_target_step ON public.outcome_step_mappings(target_step_id) WHERE is_active = true;

-- Conversion rules indexes
CREATE INDEX idx_conversion_rules_source_target ON public.configurable_conversion_rules(source_entity_type, target_entity_type) WHERE is_active = true;

-- ================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ================================

-- Enable RLS on all tables
ALTER TABLE public.business_outcome_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_outcome_rules FORCE ROW LEVEL SECURITY;

ALTER TABLE public.workflow_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_behaviors FORCE ROW LEVEL SECURITY;

ALTER TABLE public.outcome_step_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcome_step_mappings FORCE ROW LEVEL SECURITY;

ALTER TABLE public.configurable_conversion_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configurable_conversion_rules FORCE ROW LEVEL SECURITY;

-- Admin policies (full access for business rule management)
CREATE POLICY "Allow admins to manage business outcome rules" ON public.business_outcome_rules
  FOR ALL USING ( (SELECT public.check_permission(auth.uid(), 'manage', 'wfm_definitions')) );

CREATE POLICY "Allow admins to manage workflow behaviors" ON public.workflow_behaviors
  FOR ALL USING ( (SELECT public.check_permission(auth.uid(), 'manage', 'wfm_definitions')) );

CREATE POLICY "Allow admins to manage outcome step mappings" ON public.outcome_step_mappings
  FOR ALL USING ( (SELECT public.check_permission(auth.uid(), 'manage', 'wfm_definitions')) );

CREATE POLICY "Allow admins to manage conversion rules" ON public.configurable_conversion_rules
  FOR ALL USING ( (SELECT public.check_permission(auth.uid(), 'manage', 'wfm_definitions')) );

-- Read-only policies for authenticated users (needed for business logic)
CREATE POLICY "Allow authenticated users to read business outcome rules" ON public.business_outcome_rules
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Allow authenticated users to read workflow behaviors" ON public.workflow_behaviors
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Allow authenticated users to read outcome step mappings" ON public.outcome_step_mappings
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Allow authenticated users to read conversion rules" ON public.configurable_conversion_rules
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- ================================
-- 8. SEED CURRENT SYSTEM BEHAVIOR
-- ================================
-- Replicate existing hardcoded behavior as configurable rules

DO $$
DECLARE
  sales_workflow_id UUID;
  lead_workflow_id UUID;
  
  -- Sales workflow step IDs
  step_qualified_lead_id UUID;
  step_opp_scoping_id UUID;
  step_prop_dev_id UUID; 
  step_prop_sent_id UUID;
  step_contract_neg_id UUID;
  step_closed_won_id UUID;
  step_closed_lost_id UUID;
  step_converted_to_lead_id UUID;
  
  -- Lead workflow step IDs
  step_new_lead_id UUID;
  step_initial_contact_id UUID;
  step_follow_up_id UUID;
  step_qualifying_id UUID;
  step_qualified_lead_lead_id UUID;
  step_converted_id UUID;
  step_disqualified_id UUID;
  step_nurturing_id UUID;
  step_converted_to_deal_id UUID;
  
BEGIN
  -- Get workflow IDs
  SELECT id INTO sales_workflow_id FROM public.workflows WHERE name = 'Standard Sales Process';
  SELECT id INTO lead_workflow_id FROM public.workflows WHERE name = 'Lead Qualification Standard Process';
  
  IF sales_workflow_id IS NULL OR lead_workflow_id IS NULL THEN
    RAISE EXCEPTION 'Required workflows not found. Ensure Standard Sales Process and Lead Qualification Standard Process exist.';
  END IF;
  
  -- Get sales workflow step IDs
  SELECT id INTO step_qualified_lead_id FROM public.workflow_steps WHERE workflow_id = sales_workflow_id AND step_order = 1;
  SELECT id INTO step_opp_scoping_id FROM public.workflow_steps WHERE workflow_id = sales_workflow_id AND step_order = 2;
  SELECT id INTO step_prop_dev_id FROM public.workflow_steps WHERE workflow_id = sales_workflow_id AND step_order = 3;
  SELECT id INTO step_prop_sent_id FROM public.workflow_steps WHERE workflow_id = sales_workflow_id AND step_order = 4;
  SELECT id INTO step_contract_neg_id FROM public.workflow_steps WHERE workflow_id = sales_workflow_id AND step_order = 5;
  SELECT id INTO step_closed_won_id FROM public.workflow_steps WHERE workflow_id = sales_workflow_id AND step_order = 6;
  SELECT id INTO step_closed_lost_id FROM public.workflow_steps WHERE workflow_id = sales_workflow_id AND step_order = 7;
  SELECT id INTO step_converted_to_lead_id FROM public.workflow_steps WHERE workflow_id = sales_workflow_id AND step_order = 8;
  
  -- Get lead workflow step IDs  
  SELECT id INTO step_new_lead_id FROM public.workflow_steps WHERE workflow_id = lead_workflow_id AND step_order = 1;
  SELECT id INTO step_initial_contact_id FROM public.workflow_steps WHERE workflow_id = lead_workflow_id AND step_order = 2;
  SELECT id INTO step_follow_up_id FROM public.workflow_steps WHERE workflow_id = lead_workflow_id AND step_order = 3;
  SELECT id INTO step_qualifying_id FROM public.workflow_steps WHERE workflow_id = lead_workflow_id AND step_order = 4;
  SELECT id INTO step_qualified_lead_lead_id FROM public.workflow_steps WHERE workflow_id = lead_workflow_id AND step_order = 5;
  SELECT id INTO step_converted_id FROM public.workflow_steps WHERE workflow_id = lead_workflow_id AND step_order = 6;
  SELECT id INTO step_disqualified_id FROM public.workflow_steps WHERE workflow_id = lead_workflow_id AND step_order = 7;
  SELECT id INTO step_nurturing_id FROM public.workflow_steps WHERE workflow_id = lead_workflow_id AND step_order = 8;
  SELECT id INTO step_converted_to_deal_id FROM public.workflow_steps WHERE workflow_id = lead_workflow_id AND step_order = 9;
  
  -- =====================================
  -- SEED BUSINESS OUTCOME RULES
  -- =====================================
  
  -- DEAL WON RULES
  INSERT INTO public.business_outcome_rules (
    rule_name, description, entity_type, outcome_type, rule_type,
    conditions, target_step_mapping, side_effects, priority
  ) VALUES
  -- Current system: WON only allowed from Contract Negotiation
  ('deals_won_from_contract_negotiation', 'Allow deals to be marked WON from Contract Negotiation step', 'DEAL', 'WON', 'STEP_SPECIFIC',
   jsonb_build_object('allowed_from_steps', jsonb_build_array(step_contract_neg_id::text)),
   jsonb_build_object(sales_workflow_id::text, step_closed_won_id::text),
   jsonb_build_object('update_probability', 1.0, 'outcome_type', 'WON'), 100),
  
  -- NEW: Allow WON from any active step (what users want!)
  ('deals_won_from_any_step', 'Allow deals to be marked WON from any active step', 'DEAL', 'WON', 'ALLOW_FROM_ANY',
   jsonb_build_object('allowed_from_steps', jsonb_build_array(step_qualified_lead_id::text, step_opp_scoping_id::text, step_prop_dev_id::text, step_prop_sent_id::text, step_contract_neg_id::text)),
   jsonb_build_object(sales_workflow_id::text, step_closed_won_id::text),
   jsonb_build_object('update_probability', 1.0, 'outcome_type', 'WON'), 50),
  
    -- DEAL LOST RULES
  ('deals_lost_from_any_step', 'Allow deals to be marked LOST from any active step', 'DEAL', 'LOST', 'ALLOW_FROM_ANY',
   jsonb_build_object('allowed_from_steps', jsonb_build_array(step_qualified_lead_id::text, step_opp_scoping_id::text, step_prop_dev_id::text, step_prop_sent_id::text, step_contract_neg_id::text)),
   jsonb_build_object(sales_workflow_id::text, step_closed_lost_id::text),
   jsonb_build_object('update_probability', 0.0, 'outcome_type', 'LOST'), 100),
  
  -- DEAL CONVERTED TO LEAD RULES
  ('deals_converted_to_lead_any_step', 'Allow deals to be converted to leads from any active step', 'DEAL', 'CONVERTED', 'ALLOW_FROM_ANY',
   jsonb_build_object('allowed_from_steps', jsonb_build_array(step_qualified_lead_id::text, step_opp_scoping_id::text, step_prop_dev_id::text, step_prop_sent_id::text, step_contract_neg_id::text)),
   jsonb_build_object(sales_workflow_id::text, step_converted_to_lead_id::text),
   jsonb_build_object('update_probability', 0.0, 'outcome_type', 'CONVERTED', 'conversion_type', 'deal_to_lead'), 100);
  
  -- LEAD CONVERTED TO DEAL RULES
  INSERT INTO public.business_outcome_rules (
    rule_name, description, entity_type, outcome_type, rule_type,
    conditions, target_step_mapping, side_effects, priority  
  ) VALUES
  ('leads_converted_to_deal_qualified_steps', 'Allow leads to be converted to deals from qualified steps', 'LEAD', 'CONVERTED', 'STEP_SPECIFIC',
   jsonb_build_object('allowed_from_steps', jsonb_build_array(step_qualifying_id::text, step_qualified_lead_lead_id::text, step_nurturing_id::text)),
   jsonb_build_object(lead_workflow_id::text, step_converted_to_deal_id::text),
   jsonb_build_object('outcome_type', 'CONVERTED', 'conversion_type', 'lead_to_deal'), 100);
  
  -- =====================================
  -- SEED OUTCOME STEP MAPPINGS
  -- =====================================
  
  -- Sales workflow outcome mappings
  INSERT INTO public.outcome_step_mappings (workflow_id, outcome_type, target_step_id, from_step_ids) VALUES
  (sales_workflow_id, 'WON', step_closed_won_id, ARRAY[step_qualified_lead_id, step_opp_scoping_id, step_prop_dev_id, step_prop_sent_id, step_contract_neg_id]),
  (sales_workflow_id, 'LOST', step_closed_lost_id, ARRAY[step_qualified_lead_id, step_opp_scoping_id, step_prop_dev_id, step_prop_sent_id, step_contract_neg_id]),
  (sales_workflow_id, 'CONVERTED', step_converted_to_lead_id, ARRAY[step_qualified_lead_id, step_opp_scoping_id, step_prop_dev_id, step_prop_sent_id, step_contract_neg_id]);
  
  -- Lead workflow outcome mappings
  INSERT INTO public.outcome_step_mappings (workflow_id, outcome_type, target_step_id, from_step_ids) VALUES
  (lead_workflow_id, 'CONVERTED', step_converted_to_deal_id, ARRAY[step_qualifying_id, step_qualified_lead_lead_id, step_nurturing_id]);
  
  -- =====================================
  -- SEED WORKFLOW BEHAVIORS
  -- =====================================
  
  -- Kanban visibility behaviors
  INSERT INTO public.workflow_behaviors (workflow_id, behavior_type, configuration) VALUES
  (sales_workflow_id, 'KANBAN_VISIBILITY', jsonb_build_object('hide_final_steps', true, 'show_probability', true, 'show_outcome_buttons', true)),
  (lead_workflow_id, 'KANBAN_VISIBILITY', jsonb_build_object('hide_final_steps', true, 'show_lead_score', true, 'show_conversion_buttons', true));
  
  -- Button availability behaviors  
  INSERT INTO public.workflow_behaviors (workflow_id, behavior_type, configuration) VALUES
  (sales_workflow_id, 'BUTTON_AVAILABILITY', jsonb_build_object('show_won_button', true, 'show_lost_button', true, 'show_convert_button', true, 'button_style', 'always_visible')),
  (lead_workflow_id, 'BUTTON_AVAILABILITY', jsonb_build_object('show_convert_button', true, 'show_disqualify_button', true, 'button_style', 'context_sensitive'));
  
  -- =====================================
  -- SEED CONVERSION RULES  
  -- =====================================
  
  -- Deal to Lead conversion
  INSERT INTO public.configurable_conversion_rules (
    rule_name, description, source_entity_type, target_entity_type,
    field_mappings, validation_rules, post_conversion_actions
  ) VALUES
  ('deal_to_lead_conversion', 'Standard deal to lead conversion for deal cooling', 'DEAL', 'LEAD',
   '{"name": "name", "amount": "estimated_value", "expected_close_date": "estimated_close_date", "person_id": "person_id", "organization_id": "organization_id"}',
   '{"require_conversion_reason": true, "min_deal_age_days": 0}',
   '{"update_source_wfm_status": "converted_to_lead", "create_conversion_history": true, "preserve_activities": true}');
  
  -- Lead to Deal conversion
  INSERT INTO public.configurable_conversion_rules (
    rule_name, description, source_entity_type, target_entity_type,
    field_mappings, validation_rules, post_conversion_actions
  ) VALUES  
  ('lead_to_deal_conversion', 'Standard lead to deal conversion for qualified leads', 'LEAD', 'DEAL',
   '{"name": "name", "estimated_value": "amount", "estimated_close_date": "expected_close_date", "contact_name": "person_name", "company_name": "organization_name"}',
   '{"min_lead_score": 50, "require_qualified_status": true}',
   '{"update_source_wfm_status": "converted_to_deal", "create_conversion_history": true, "preserve_activities": true}');
  
  RAISE NOTICE 'Business rule engine foundation seeded successfully with current system behavior';
  
END $$;

-- ================================
-- 9. VALIDATION FUNCTIONS
-- ================================

-- Function to validate business rule configuration
CREATE OR REPLACE FUNCTION validate_business_rule_config(
  rule_config JSONB
) RETURNS BOOLEAN AS $$
BEGIN
  -- Basic JSONB validation
  IF rule_config IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Additional validation logic can be added here
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_business_rule_config IS 'Validates business rule configuration JSONB';

COMMIT; 