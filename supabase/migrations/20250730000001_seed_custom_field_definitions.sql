BEGIN;

-- Seed Custom Field Definitions

-- People: Position (TEXT)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, is_required, is_active, display_order
)
VALUES (
    'PERSON', 'person_position', 'Position', 'TEXT', FALSE, TRUE, 1
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Organization: Industry (DROPDOWN)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'ORGANIZATION', 
    'organization_industry', 
    'Industry', 
    'DROPDOWN', 
    '[{"value": "tech", "label": "Technology"}, {"value": "finance", "label": "Finance"}, {"value": "healthcare", "label": "Healthcare"}, {"value": "retail", "label": "Retail"}, {"value": "manufacturing", "label": "Manufacturing"}, {"value": "other", "label": "Other"}]', 
    FALSE, 
    TRUE, 
    1
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Deals: Domain (DROPDOWN)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
)
VALUES (
    'DEAL', 
    'deal_domain', 
    'Domain', 
    'DROPDOWN', 
    '[{"value": "mena", "label": "MENA"}, {"value": "elevator", "label": "Elevator"}, {"value": "other", "label": "Other"}]', 
    FALSE, 
    TRUE, 
    1
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

COMMIT; 