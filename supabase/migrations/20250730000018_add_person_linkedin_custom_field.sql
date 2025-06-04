BEGIN;

-- Add LinkedIn Profile custom field for Person entities

-- People: LinkedIn Profile (TEXT)
INSERT INTO public.custom_field_definitions (
    entity_type, field_name, field_label, field_type, is_required, is_active, display_order
)
VALUES (
    'PERSON', 
    'person_linkedin_profile', 
    'LinkedIn Profile', 
    'TEXT', 
    FALSE, 
    TRUE, 
    2
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

COMMIT; 