-- Migration: WFM Outcome Engine
-- Create configurable WFM outcome system to replace hardcoded workflow logic
-- This is separate from the existing Business Rules Engine (general automation)
-- Version: 1.0
-- Timestamp: 20250730000094

BEGIN;

-- ================================
-- 1. WFM OUTCOME RULES TABLE
-- ================================
-- Defines when specific outcomes (WON/LOST/CONVERTED) are allowed

CREATE TABLE public.wfm_outcome_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  description TEXT,
  
  -- Rule scope
  entity_type TEXT NOT NULL CHECK (entity_type IN ('DEAL', 'LEAD', 'ANY')),
  outcome_type TEXT NOT NULL CHECK (outcome_type IN ('WON', 'LOST', 'CONVERTED')),
  rule_type TEXT NOT NULL CHECK (rule_type IN ('ALLOW_FROM_ANY', 'PROBABILITY_THRESHOLD', 'STEP_SPECIFIC', 'WORKFLOW_SPECIFIC', 'PROJECT_TYPE_MAPPING', 'UI_BEHAVIOR', 'WIN_RATE_CALCULATION')),
  
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

COMMENT ON TABLE public.wfm_outcome_rules IS 'Configurable rules defining when and how WFM outcomes (WON/LOST/CONVERTED) can be executed and UI behaviors';
COMMENT ON COLUMN public.wfm_outcome_rules.conditions IS 'JSONB conditions like {"min_probability": 0.9, "workflow_ids": ["uuid"], "project_type_mapping": {"DEAL": "Sales Deal"}}';
COMMENT ON COLUMN public.wfm_outcome_rules.restrictions IS 'JSONB restrictions like {"blocked_steps": ["uuid"], "required_permissions": ["permission"]}';
COMMENT ON COLUMN public.wfm_outcome_rules.target_step_mapping IS 'JSONB mapping of workflow_id to target_step_id for this outcome';
COMMENT ON COLUMN public.wfm_outcome_rules.side_effects IS 'JSONB side effects like {"update_probability": 1.0, "trigger_automations": ["automation_id"]}';

-- ================================
-- 2. WFM WORKFLOW BEHAVIORS TABLE  
-- ================================
-- Defines UI and system behavior per workflow

CREATE TABLE public.wfm_workflow_behaviors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  behavior_type TEXT NOT NULL CHECK (behavior_type IN ('KANBAN_VISIBILITY', 'BUTTON_AVAILABILITY', 'AUTO_TRANSITIONS', 'UI_CUSTOMIZATION', 'METADATA_SCHEMA')),
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

COMMENT ON TABLE public.wfm_workflow_behaviors IS 'Configurable UI and system behaviors per workflow';
COMMENT ON COLUMN public.wfm_workflow_behaviors.configuration IS 'JSONB configuration specific to behavior_type like {"available_outcome_types": ["OPEN", "WON"], "metadata_fields": ["deal_probability"]}';
COMMENT ON COLUMN public.wfm_workflow_behaviors.applies_to_steps IS 'Array of step UUIDs this behavior applies to, NULL = all steps';
COMMENT ON COLUMN public.wfm_workflow_behaviors.user_roles IS 'Array of role names this behavior applies to, NULL = all roles';

-- ================================
-- 3. WFM STEP MAPPINGS TABLE
-- ================================  
-- Maps business outcomes to target workflow steps

CREATE TABLE public.wfm_step_mappings (
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

COMMENT ON TABLE public.wfm_step_mappings IS 'Maps business outcomes to target workflow steps';
COMMENT ON COLUMN public.wfm_step_mappings.from_step_ids IS 'Array of step UUIDs this mapping applies from, NULL = all steps';
COMMENT ON COLUMN public.wfm_step_mappings.conditions IS 'JSONB additional conditions for this mapping';

-- ================================
-- 4. WFM CONVERSION RULES TABLE
-- ================================
-- Generic entity conversion configuration

CREATE TABLE public.wfm_conversion_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  description TEXT,
  
  -- Conversion scope
  from_entity_type TEXT NOT NULL CHECK (from_entity_type IN ('DEAL', 'LEAD')),
  to_entity_type TEXT NOT NULL CHECK (to_entity_type IN ('DEAL', 'LEAD')),
  
  -- Conversion logic
  conditions JSONB DEFAULT '{}', -- When this conversion is allowed
  restrictions JSONB DEFAULT '{}', -- When this conversion is blocked
  field_mappings JSONB DEFAULT '{}', -- How to map fields between entities
  
  -- Validation rules
  required_permissions TEXT[], -- Required user permissions
  blocked_statuses TEXT[], -- Status names that block conversion
  
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

COMMENT ON TABLE public.wfm_conversion_rules IS 'Configurable rules for entity conversion (deal ↔ lead)';
COMMENT ON COLUMN public.wfm_conversion_rules.conditions IS 'JSONB conditions when conversion is allowed like {"min_probability": 0.1, "allowed_steps": ["uuid"]}';
COMMENT ON COLUMN public.wfm_conversion_rules.restrictions IS 'JSONB restrictions like {"blocked_steps": ["uuid"], "final_steps_blocked": true}';
COMMENT ON COLUMN public.wfm_conversion_rules.field_mappings IS 'JSONB field mapping configuration like {"name": "contact_name", "amount": "estimated_value"}';

-- ================================
-- 5. INDEXES FOR PERFORMANCE
-- ================================

-- Core lookup indexes
CREATE INDEX idx_wfm_outcome_rules_entity_type ON public.wfm_outcome_rules(entity_type);
CREATE INDEX idx_wfm_outcome_rules_outcome_type ON public.wfm_outcome_rules(outcome_type);
CREATE INDEX idx_wfm_outcome_rules_rule_type ON public.wfm_outcome_rules(rule_type);
CREATE INDEX idx_wfm_outcome_rules_active ON public.wfm_outcome_rules(is_active) WHERE is_active = true;

CREATE INDEX idx_wfm_workflow_behaviors_workflow_id ON public.wfm_workflow_behaviors(workflow_id);
CREATE INDEX idx_wfm_workflow_behaviors_behavior_type ON public.wfm_workflow_behaviors(behavior_type);
CREATE INDEX idx_wfm_workflow_behaviors_active ON public.wfm_workflow_behaviors(is_active) WHERE is_active = true;

CREATE INDEX idx_wfm_step_mappings_workflow_id ON public.wfm_step_mappings(workflow_id);
CREATE INDEX idx_wfm_step_mappings_outcome_type ON public.wfm_step_mappings(outcome_type);
CREATE INDEX idx_wfm_step_mappings_target_step_id ON public.wfm_step_mappings(target_step_id);
CREATE INDEX idx_wfm_step_mappings_active ON public.wfm_step_mappings(is_active) WHERE is_active = true;

CREATE INDEX idx_wfm_conversion_rules_from_entity ON public.wfm_conversion_rules(from_entity_type);
CREATE INDEX idx_wfm_conversion_rules_to_entity ON public.wfm_conversion_rules(to_entity_type);
CREATE INDEX idx_wfm_conversion_rules_active ON public.wfm_conversion_rules(is_active) WHERE is_active = true;

-- ================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ================================

-- Enable RLS on all tables
ALTER TABLE public.wfm_outcome_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wfm_workflow_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wfm_step_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wfm_conversion_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin users can manage all, regular users can read active rules
CREATE POLICY "wfm_outcome_rules_admin_all" ON public.wfm_outcome_rules
  FOR ALL TO authenticated
  USING (
    'app_settings:manage' = ANY(
      SELECT jsonb_array_elements_text(public.get_user_permissions(auth.uid()))
    )
  );

CREATE POLICY "wfm_outcome_rules_read_active" ON public.wfm_outcome_rules
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "wfm_workflow_behaviors_admin_all" ON public.wfm_workflow_behaviors
  FOR ALL TO authenticated
  USING (
    'app_settings:manage' = ANY(
      SELECT jsonb_array_elements_text(public.get_user_permissions(auth.uid()))
    )
  );

CREATE POLICY "wfm_workflow_behaviors_read_active" ON public.wfm_workflow_behaviors
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "wfm_step_mappings_admin_all" ON public.wfm_step_mappings
  FOR ALL TO authenticated
  USING (
    'app_settings:manage' = ANY(
      SELECT jsonb_array_elements_text(public.get_user_permissions(auth.uid()))
    )
  );

CREATE POLICY "wfm_step_mappings_read_active" ON public.wfm_step_mappings
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "wfm_conversion_rules_admin_all" ON public.wfm_conversion_rules
  FOR ALL TO authenticated
  USING (
    'app_settings:manage' = ANY(
      SELECT jsonb_array_elements_text(public.get_user_permissions(auth.uid()))
    )
  );

CREATE POLICY "wfm_conversion_rules_read_active" ON public.wfm_conversion_rules
  FOR SELECT TO authenticated
  USING (is_active = true);

-- ================================
-- 7. SEEDING CURRENT SYSTEM CONFIGURATION
-- ================================

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
  
  -- Get sales workflow step IDs by step order (safer than assuming step order)
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
  -- SEED PROJECT TYPE MAPPING RULES
  -- =====================================
  
  -- Replace hard-coded project type names with configurable mappings
  INSERT INTO public.wfm_outcome_rules (
    rule_name, description, entity_type, outcome_type, rule_type,
    conditions, priority
  ) VALUES
  ('project_type_mapping_deals', 'Maps deals to Sales Deal project type', 'DEAL', 'WON', 'PROJECT_TYPE_MAPPING',
   '{"project_type_mapping": {"DEAL": "Sales Deal"}}', 50),
  
  ('project_type_mapping_leads', 'Maps leads to Lead Qualification project type', 'LEAD', 'CONVERTED', 'PROJECT_TYPE_MAPPING',
   '{"project_type_mapping": {"LEAD": "Lead Qualification and Conversion Process"}}', 50);
  
  -- =====================================
  -- SEED WFM OUTCOME RULES
  -- =====================================
  
  -- DEAL WON RULES - Currently allowed from any step (based on existing transitions)
  INSERT INTO public.wfm_outcome_rules (
    rule_name, description, entity_type, outcome_type, rule_type,
    conditions, target_step_mapping, side_effects, priority
  ) VALUES
  ('deals_won_from_any_step', 'Allow deals to be marked WON from any active step', 'DEAL', 'WON', 'ALLOW_FROM_ANY',
   '{"exclude_final_steps": true}',
   jsonb_build_object(sales_workflow_id::text, step_closed_won_id::text),
   '{"update_probability": 1.0, "outcome_type": "WON"}', 100);
  
  -- DEAL LOST RULES - Currently allowed from any step (based on existing transitions)
  INSERT INTO public.wfm_outcome_rules (
    rule_name, description, entity_type, outcome_type, rule_type,
    conditions, target_step_mapping, side_effects, priority
  ) VALUES
  ('deals_lost_from_any_step', 'Allow deals to be marked LOST from any active step', 'DEAL', 'LOST', 'ALLOW_FROM_ANY',
   '{"exclude_final_steps": true}',
   jsonb_build_object(sales_workflow_id::text, step_closed_lost_id::text),
   '{"update_probability": 0.0, "outcome_type": "LOST"}', 100);
  
  -- DEAL CONVERTED TO LEAD RULES - Currently allowed from any step
  INSERT INTO public.wfm_outcome_rules (
    rule_name, description, entity_type, outcome_type, rule_type,
    conditions, target_step_mapping, side_effects, priority
  ) VALUES
  ('deals_converted_to_lead_from_any_step', 'Allow deals to be converted to leads from any active step', 'DEAL', 'CONVERTED', 'ALLOW_FROM_ANY',
   '{"exclude_final_steps": true}',
   jsonb_build_object(sales_workflow_id::text, step_converted_to_lead_id::text),
   '{"outcome_type": "CONVERTED", "conversion_type": "deal_to_lead"}', 100);
  
  -- LEAD CONVERTED TO DEAL RULES - From qualifying steps only
  INSERT INTO public.wfm_outcome_rules (
    rule_name, description, entity_type, outcome_type, rule_type,
    conditions, target_step_mapping, side_effects, priority
  ) VALUES
  ('leads_converted_to_deal_qualified_steps', 'Allow leads to be converted to deals from qualified steps', 'LEAD', 'CONVERTED', 'STEP_SPECIFIC',
   jsonb_build_object('allowed_from_steps', jsonb_build_array(step_qualifying_id::text, step_qualified_lead_lead_id::text, step_nurturing_id::text)),
   jsonb_build_object(lead_workflow_id::text, step_converted_to_deal_id::text),
   '{"outcome_type": "CONVERTED", "conversion_type": "lead_to_deal"}', 100);
  
  -- WIN RATE CALCULATION RULE
  INSERT INTO public.wfm_outcome_rules (
    rule_name, description, entity_type, outcome_type, rule_type,
    conditions, priority
  ) VALUES
  ('win_rate_calculation_deals', 'Defines how to calculate win rates for deals', 'DEAL', 'WON', 'WIN_RATE_CALCULATION',
   '{"winning_outcomes": ["WON"], "exclude_outcomes": ["CONVERTED"], "count_final_steps": true}', 50);
  
  -- =====================================
  -- SEED WFM STEP MAPPINGS
  -- =====================================
  
  -- Sales workflow outcome mappings (allowing from all active steps)
  INSERT INTO public.wfm_step_mappings (workflow_id, outcome_type, target_step_id, from_step_ids) VALUES
  (sales_workflow_id, 'WON', step_closed_won_id, ARRAY[step_qualified_lead_id, step_opp_scoping_id, step_prop_dev_id, step_prop_sent_id, step_contract_neg_id]),
  (sales_workflow_id, 'LOST', step_closed_lost_id, ARRAY[step_qualified_lead_id, step_opp_scoping_id, step_prop_dev_id, step_prop_sent_id, step_contract_neg_id]),
  (sales_workflow_id, 'CONVERTED', step_converted_to_lead_id, ARRAY[step_qualified_lead_id, step_opp_scoping_id, step_prop_dev_id, step_prop_sent_id, step_contract_neg_id]);
  
  -- Lead workflow outcome mappings
  INSERT INTO public.wfm_step_mappings (workflow_id, outcome_type, target_step_id, from_step_ids) VALUES
  (lead_workflow_id, 'CONVERTED', step_converted_to_deal_id, ARRAY[step_qualifying_id, step_qualified_lead_lead_id, step_nurturing_id]);
  
  -- =====================================
  -- SEED WFM WORKFLOW BEHAVIORS
  -- =====================================
  
  -- Kanban visibility and UI behaviors for sales workflow
  INSERT INTO public.wfm_workflow_behaviors (workflow_id, behavior_type, configuration) VALUES
  (sales_workflow_id, 'KANBAN_VISIBILITY', '{"hide_final_steps": true, "show_probability": true, "show_outcome_buttons": true}'),
  (sales_workflow_id, 'UI_CUSTOMIZATION', '{"available_outcome_types": ["WON", "LOST", "CONVERTED"], "metadata_fields": ["deal_probability", "outcome_type"]}'),
  (sales_workflow_id, 'METADATA_SCHEMA', '{"deal_probability": {"type": "number", "min": 0, "max": 1, "required": false}, "outcome_type": {"type": "enum", "values": ["OPEN", "WON", "LOST", "CONVERTED"], "required": false}}');
  
  -- Kanban visibility and UI behaviors for lead workflow  
  INSERT INTO public.wfm_workflow_behaviors (workflow_id, behavior_type, configuration) VALUES
  (lead_workflow_id, 'KANBAN_VISIBILITY', '{"hide_final_steps": true, "show_lead_score": true, "show_conversion_buttons": true}'),
  (lead_workflow_id, 'UI_CUSTOMIZATION', '{"available_outcome_types": ["CONVERTED"], "metadata_fields": ["lead_score_threshold", "outcome_type"]}'),
  (lead_workflow_id, 'METADATA_SCHEMA', '{"lead_score_threshold": {"type": "number", "min": 0, "max": 100, "required": false}, "outcome_type": {"type": "enum", "values": ["OPEN", "WON", "LOST", "CONVERTED"], "required": false}}');
  
  -- =====================================
  -- SEED WFM CONVERSION RULES
  -- =====================================
  
  -- Deal to Lead conversion rules
  INSERT INTO public.wfm_conversion_rules (
    rule_name, description, from_entity_type, to_entity_type,
    conditions, restrictions, field_mappings, blocked_statuses
  ) VALUES
  ('deal_to_lead_conversion', 'Rules for converting deals back to leads', 'DEAL', 'LEAD',
   '{"min_probability": 0.0, "exclude_final_outcomes": ["WON"]}',
   '{"blocked_final_steps": true, "require_reason": true}',
   '{"name": "contact_name", "amount": "estimated_value", "description": "description", "user_id": "user_id"}',
   ARRAY['won', 'closed won']);
  
  -- Lead to Deal conversion rules
  INSERT INTO public.wfm_conversion_rules (
    rule_name, description, from_entity_type, to_entity_type,
    conditions, restrictions, field_mappings
  ) VALUES
  ('lead_to_deal_conversion', 'Rules for converting qualified leads to deals', 'LEAD', 'DEAL',
   '{"min_lead_score": 50, "allowed_steps": ["qualifying", "qualified", "nurturing"]}',
   '{"require_qualification": true}',
   '{"contact_name": "name", "estimated_value": "amount", "description": "description", "user_id": "user_id"}');

END $$;

COMMIT; 