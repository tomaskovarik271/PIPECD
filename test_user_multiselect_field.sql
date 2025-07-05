-- Test script to create a USER_MULTISELECT custom field for deals
-- This demonstrates the new functionality for selecting multiple users

INSERT INTO public.custom_field_definitions (
    entity_type, 
    field_name, 
    field_label, 
    field_type, 
    is_required, 
    is_active, 
    display_order
)
VALUES (
    'DEAL', 
    'deal_team_members', 
    'Deal Team Members', 
    'USER_MULTISELECT', 
    FALSE, 
    TRUE, 
    10
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Another example for organizations
INSERT INTO public.custom_field_definitions (
    entity_type, 
    field_name, 
    field_label, 
    field_type, 
    is_required, 
    is_active, 
    display_order
)
VALUES (
    'ORGANIZATION', 
    'account_managers', 
    'Account Managers', 
    'USER_MULTISELECT', 
    FALSE, 
    TRUE, 
    5
)
ON CONFLICT (entity_type, field_name) DO NOTHING;

-- Example for people (project reviewers)
INSERT INTO public.custom_field_definitions (
    entity_type, 
    field_name, 
    field_label, 
    field_type, 
    is_required, 
    is_active, 
    display_order
)
VALUES (
    'PERSON', 
    'project_reviewers', 
    'Project Reviewers', 
    'USER_MULTISELECT', 
    FALSE, 
    TRUE, 
    3
)
ON CONFLICT (entity_type, field_name) DO NOTHING; 