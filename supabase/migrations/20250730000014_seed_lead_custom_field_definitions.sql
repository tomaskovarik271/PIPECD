BEGIN;

-- Seed Lead Custom Field Definitions
-- This migration runs after 20250730000005_add_lead_entity_type.sql

-- Leads: Industry (DROPDOWN)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'LEAD', 
    'lead_industry', 
    'Industry', 
    'DROPDOWN', 
    '[{"value": "tech", "label": "Technology"}, {"value": "finance", "label": "Finance"}, {"value": "healthcare", "label": "Healthcare"}, {"value": "retail", "label": "Retail"}, {"value": "manufacturing", "label": "Manufacturing"}, {"value": "other", "label": "Other"}]', 
    FALSE, 
    TRUE, 
    1
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Leads: Company Size (DROPDOWN)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'LEAD', 
    'lead_company_size', 
    'Company Size', 
    'DROPDOWN', 
    '[{"value": "1-10", "label": "1-10 employees"}, {"value": "11-50", "label": "11-50 employees"}, {"value": "51-200", "label": "51-200 employees"}, {"value": "201-1000", "label": "201-1000 employees"}, {"value": "1000+", "label": "1000+ employees"}]', 
    FALSE, 
    TRUE, 
    2
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Leads: Budget Range (DROPDOWN)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'LEAD', 
    'lead_budget_range', 
    'Budget Range', 
    'DROPDOWN', 
    '[{"value": "0-10k", "label": "Under $10,000"}, {"value": "10k-50k", "label": "$10,000 - $50,000"}, {"value": "50k-100k", "label": "$50,000 - $100,000"}, {"value": "100k-500k", "label": "$100,000 - $500,000"}, {"value": "500k+", "label": "Over $500,000"}]', 
    FALSE, 
    TRUE, 
    3
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Leads: Decision Timeline (DROPDOWN)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'LEAD', 
    'lead_decision_timeline', 
    'Decision Timeline', 
    'DROPDOWN', 
    '[{"value": "immediate", "label": "Immediate (< 1 month)"}, {"value": "short", "label": "Short term (1-3 months)"}, {"value": "medium", "label": "Medium term (3-6 months)"}, {"value": "long", "label": "Long term (6+ months)"}, {"value": "unknown", "label": "Unknown"}]', 
    FALSE, 
    TRUE, 
    4
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Leads: Lead Temperature (DROPDOWN)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'LEAD', 
    'lead_temperature', 
    'Lead Temperature', 
    'DROPDOWN', 
    '[{"value": "hot", "label": "Hot"}, {"value": "warm", "label": "Warm"}, {"value": "cold", "label": "Cold"}]', 
    FALSE, 
    TRUE, 
    5
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Leads: Pain Points (MULTI_SELECT)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'LEAD', 
    'lead_pain_points', 
    'Pain Points', 
    'MULTI_SELECT', 
    '[{"value": "cost_reduction", "label": "Cost Reduction"}, {"value": "efficiency", "label": "Efficiency Improvement"}, {"value": "scalability", "label": "Scalability Issues"}, {"value": "compliance", "label": "Compliance Requirements"}, {"value": "integration", "label": "Integration Challenges"}, {"value": "security", "label": "Security Concerns"}, {"value": "other", "label": "Other"}]', 
    FALSE, 
    TRUE, 
    6
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Leads: Contact Role (DROPDOWN)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'LEAD', 
    'lead_contact_role', 
    'Contact Role', 
    'DROPDOWN', 
    '[{"value": "decision_maker", "label": "Decision Maker"}, {"value": "influencer", "label": "Influencer"}, {"value": "end_user", "label": "End User"}, {"value": "gatekeeper", "label": "Gatekeeper"}, {"value": "champion", "label": "Champion"}, {"value": "unknown", "label": "Unknown"}]', 
    FALSE, 
    TRUE, 
    7
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Leads: Lead Priority (DROPDOWN)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'LEAD', 
    'lead_priority', 
    'Lead Priority', 
    'DROPDOWN', 
    '[{"value": "high", "label": "High"}, {"value": "medium", "label": "Medium"}, {"value": "low", "label": "Low"}]', 
    FALSE, 
    TRUE, 
    8
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

COMMIT; 