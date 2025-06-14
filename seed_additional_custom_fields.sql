BEGIN;

-- Seed Additional Custom Field Definitions
-- This script adds custom fields from the CSV that are not already seeded in existing migrations
-- 
-- ALREADY SEEDED (skipping these):
-- - PERSON: person_position, person_linkedin_profile
-- - ORGANIZATION: organization_industry  
-- - DEAL: deal_domain
-- - LEAD: All 8 lead fields (lead_industry, lead_company_size, lead_budget_range, 
--         lead_decision_timeline, lead_temperature, lead_pain_points, lead_contact_role, lead_priority)

-- =============================================================================
-- DEAL CUSTOM FIELDS (11 new fields)
-- =============================================================================

-- Deal: AI in scope (DROPDOWN)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'DEAL', 
    'AI_in_scope', 
    'AI in scope', 
    'DROPDOWN', 
    '[{"value": "Yes", "label": "Yes"}, {"value": "No", "label": "No"}, {"value": "Maybe", "label": "Maybe"}]', 
    FALSE, 
    TRUE, 
    2
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Deal: Microsite included? (BOOLEAN)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, is_required, is_active, display_order
)
VALUES (
    'DEAL', 
    'microsite_bool', 
    'Microsite included?', 
    'BOOLEAN', 
    FALSE, 
    TRUE, 
    3
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Deal: Product Type (MULTI_SELECT) 
-- Note: field_name has typo "product_tpye" in CSV, keeping as-is for consistency
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'DEAL', 
    'product_tpye', 
    'Product Type', 
    'MULTI_SELECT', 
    '[{"value": "venture_design", "label": "Venture Design"}, {"value": "mvp", "label": "MVP"}]', 
    FALSE, 
    TRUE, 
    4
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Deal: Sales type (DROPDOWN)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'DEAL', 
    'Sales_type', 
    'Sales type', 
    'DROPDOWN', 
    '[{"value": "New sale", "label": "New sale"}, {"value": "X-sell", "label": "X-sell"}, {"value": "Upsell", "label": "Upsell"}]', 
    FALSE, 
    TRUE, 
    5
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Deal: Microsite testing in scope? (DROPDOWN)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'DEAL', 
    'Microsite_testing_in_scope', 
    'Microsite testing in scope?', 
    'DROPDOWN', 
    '[{"value": "Yes", "label": "Yes"}, {"value": "No", "label": "No"}]', 
    FALSE, 
    TRUE, 
    6
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Deal: End date of a project (DATE)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, is_required, is_active, display_order
)
VALUES (
    'DEAL', 
    'End_date_of_a_project', 
    'End date of a project', 
    'DATE', 
    FALSE, 
    TRUE, 
    7
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Deal: AI checklist link (TEXT)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, is_required, is_active, display_order
)
VALUES (
    'DEAL', 
    'AI_checklist_link', 
    'AI checklist link', 
    'TEXT', 
    FALSE, 
    TRUE, 
    8
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Deal: Start date of a project (DATE)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, is_required, is_active, display_order
)
VALUES (
    'DEAL', 
    'Start_date_of_a_project', 
    'Start date of a project', 
    'DATE', 
    FALSE, 
    TRUE, 
    9
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Deal: Proposal link (TEXT)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, is_required, is_active, display_order
)
VALUES (
    'DEAL', 
    'Proposal_link', 
    'Proposal link', 
    'TEXT', 
    FALSE, 
    TRUE, 
    10
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Deal: Type of project/function (DROPDOWN)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'DEAL', 
    'type_of_project_function', 
    'Type of project/function', 
    'DROPDOWN', 
    '[{"value": "AI Transformation", "label": "AI Transformation"}, {"value": "Collaborative Innovation", "label": "Collaborative Innovation"}, {"value": "Venture Design", "label": "Venture Design"}]', 
    FALSE, 
    TRUE, 
    11
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Deal: Pricing calculator link (TEXT)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, is_required, is_active, display_order
)
VALUES (
    'DEAL', 
    'Pricing_calculator_link', 
    'Pricing calculator link', 
    'TEXT', 
    FALSE, 
    TRUE, 
    12
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- =============================================================================
-- SUMMARY
-- =============================================================================
-- This script adds 11 new DEAL custom fields that were missing from previous migrations:
-- 1. AI_in_scope (DROPDOWN) - Yes/No/Maybe
-- 2. microsite_bool (BOOLEAN) - Microsite included?
-- 3. product_tpye (MULTI_SELECT) - Venture Design/MVP (Note: typo in field name preserved from CSV)
-- 4. Sales_type (DROPDOWN) - New sale/X-sell/Upsell
-- 5. Microsite_testing_in_scope (DROPDOWN) - Yes/No
-- 6. End_date_of_a_project (DATE)
-- 7. AI_checklist_link (TEXT)
-- 8. Start_date_of_a_project (DATE)
-- 9. Proposal_link (TEXT)
-- 10. type_of_project_function (DROPDOWN) - AI Transformation/Collaborative Innovation/Venture Design
-- 11. Pricing_calculator_link (TEXT)
--
-- All fields from the CSV for PERSON, ORGANIZATION, and LEAD entities were already seeded
-- in previous migrations and are not duplicated here.
--
-- USAGE: Run this script directly against your Supabase database
-- The ON CONFLICT clauses ensure no duplicates are created if fields already exist

COMMIT;
