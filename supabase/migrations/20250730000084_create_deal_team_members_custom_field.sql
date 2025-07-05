-- Migration: Create Deal Team Members Custom Field Definition
-- This migration adds a USER_MULTISELECT custom field for deals to manage team members

BEGIN;

-- Insert the Deal Team Members custom field definition
INSERT INTO custom_field_definitions (
    id,
    field_name,
    field_label,
    field_type,
    entity_type,
    is_required,
    is_active,
    dropdown_options,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'deal_team_members',
    'Deal Team Members',
    'USER_MULTISELECT',
    'DEAL',
    false,
    true,
    null, -- USER_MULTISELECT doesn't use dropdown_options, it uses the user list
    now(),
    now()
) ON CONFLICT (field_name, entity_type) DO NOTHING;

-- Log the result
DO $$
DECLARE
    field_exists boolean;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM custom_field_definitions 
        WHERE field_name = 'deal_team_members' 
        AND entity_type = 'DEAL'
        AND field_type = 'USER_MULTISELECT'
    ) INTO field_exists;
    
    IF field_exists THEN
        RAISE NOTICE 'Deal Team Members custom field definition created successfully';
        RAISE NOTICE 'Field Type: USER_MULTISELECT';
        RAISE NOTICE 'Entity Type: DEAL';
        RAISE NOTICE 'Usage: Select multiple users to assign as team members for deals';
        RAISE NOTICE 'Display: Shows "X user(s) selected" in deal detail and table views';
    ELSE
        RAISE WARNING 'Failed to create Deal Team Members custom field definition';
    END IF;
END $$;

COMMIT; 