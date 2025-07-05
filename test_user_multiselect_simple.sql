-- Simple test script to verify USER_MULTISELECT custom field fix
-- This creates test data and verifies the GraphQL resolver can handle it

-- First, check our USER_MULTISELECT custom field definitions
SELECT 
    'Custom Field Definitions' as test_section,
    field_name,
    field_label,
    field_type,
    entity_type
FROM custom_field_definitions 
WHERE field_type = 'USER_MULTISELECT'
ORDER BY entity_type, field_name;

-- Create some test user IDs (using UUIDs)
DO $$
DECLARE
    test_user_id_1 uuid := '550e8400-e29b-41d4-a716-446655440001';
    test_user_id_2 uuid := '550e8400-e29b-41d4-a716-446655440002';
    test_deal_id uuid;
    project_type_id uuid;
BEGIN
    -- Get a project type
    SELECT id INTO project_type_id FROM project_types LIMIT 1;
    
    -- Create a test deal with USER_MULTISELECT data
    INSERT INTO deals (
        name, 
        amount, 
        user_id, 
        custom_field_values
    ) VALUES (
        'Test Deal with Team Members',
        50000,
        test_user_id_1,
        jsonb_build_object(
            'deal_team_members', jsonb_build_array(test_user_id_1::text, test_user_id_2::text)
        )
    ) RETURNING id INTO test_deal_id;
    
    RAISE NOTICE 'Created test deal % with team members: [%, %]', test_deal_id, test_user_id_1, test_user_id_2;
END $$;

-- Verify the test deal was created correctly
SELECT 
    'Test Deal Created' as test_section,
    d.id,
    d.name,
    d.custom_field_values->'deal_team_members' as team_members_field,
    jsonb_array_length(d.custom_field_values->'deal_team_members') as team_members_count
FROM deals d
WHERE d.name = 'Test Deal with Team Members';

-- Test the GraphQL resolver logic simulation
WITH deal_custom_fields AS (
    SELECT 
        d.id as deal_id,
        d.name as deal_name,
        cfd.id as definition_id,
        cfd.field_name,
        cfd.field_label,
        cfd.field_type,
        (d.custom_field_values->cfd.field_name) as raw_value
    FROM deals d
    CROSS JOIN custom_field_definitions cfd
    WHERE cfd.field_type = 'USER_MULTISELECT'
    AND cfd.entity_type = 'DEAL'
    AND cfd.is_active = true
    AND d.name = 'Test Deal with Team Members'
)
SELECT 
    'GraphQL Resolver Simulation' as test_section,
    deal_id,
    deal_name,
    field_name,
    field_label,
    field_type,
    raw_value,
    CASE 
        WHEN raw_value IS NOT NULL AND jsonb_typeof(raw_value) = 'array' THEN
            jsonb_array_length(raw_value)
        ELSE 0
    END as selected_count,
    'This should now work with our GraphQL resolver fix!' as status
FROM deal_custom_fields
WHERE raw_value IS NOT NULL;

-- Test what the frontend display logic should show
WITH deal_custom_fields AS (
    SELECT 
        d.id as deal_id,
        d.name as deal_name,
        cfd.field_name,
        cfd.field_label,
        (d.custom_field_values->cfd.field_name) as raw_value
    FROM deals d
    CROSS JOIN custom_field_definitions cfd
    WHERE cfd.field_type = 'USER_MULTISELECT'
    AND cfd.entity_type = 'DEAL'
    AND cfd.is_active = true
    AND d.name = 'Test Deal with Team Members'
)
SELECT 
    'Frontend Display Logic' as test_section,
    deal_id,
    deal_name,
    field_label,
    CASE 
        WHEN raw_value IS NOT NULL AND jsonb_typeof(raw_value) = 'array' AND jsonb_array_length(raw_value) > 0 THEN
            jsonb_array_length(raw_value)::text || ' user(s) selected'
        ELSE '-'
    END as display_value,
    raw_value as raw_data
FROM deal_custom_fields
WHERE raw_value IS NOT NULL; 