-- Test script to verify USER_MULTISELECT custom field fix
-- This script tests that USER_MULTISELECT values are properly stored and can be retrieved

-- First, let's check if we have the USER_MULTISELECT custom field definition
SELECT 
    id,
    field_name,
    field_label,
    field_type,
    entity_type,
    is_active
FROM custom_field_definitions 
WHERE field_type = 'USER_MULTISELECT'
ORDER BY created_at DESC;

-- Check if we have some sample deals with USER_MULTISELECT values
SELECT 
    d.id,
    d.name,
    d.custom_field_values
FROM deals d
WHERE d.custom_field_values IS NOT NULL 
   AND d.custom_field_values::text LIKE '%deal_team_members%'
ORDER BY d.updated_at DESC
LIMIT 5;

-- Check if we have users to select from (using user_profiles table)
SELECT 
    user_id,
    email
FROM user_profiles
ORDER BY created_at
LIMIT 10;

-- Test query to simulate what the GraphQL resolver does
-- This mimics the resolver logic for custom field values
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
)
SELECT 
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
    END as selected_count
FROM deal_custom_fields
WHERE raw_value IS NOT NULL
ORDER BY deal_id, field_name;

-- Create test users if they don't exist
DO $$
DECLARE
    test_user_id_1 uuid;
    test_user_id_2 uuid;
BEGIN
    -- Create test users in auth.users and user_profiles
    INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES 
        (gen_random_uuid(), 'testuser1@example.com', now(), now(), now(), '', '', '', ''),
        (gen_random_uuid(), 'testuser2@example.com', now(), now(), now(), '', '', '', '')
    ON CONFLICT (email) DO NOTHING;
    
    -- Get the user IDs
    SELECT id INTO test_user_id_1 FROM auth.users WHERE email = 'testuser1@example.com';
    SELECT id INTO test_user_id_2 FROM auth.users WHERE email = 'testuser2@example.com';
    
    -- Create user profiles
    INSERT INTO user_profiles (user_id, email, display_name, created_at, updated_at)
    VALUES 
        (test_user_id_1, 'testuser1@example.com', 'Test User 1', now(), now()),
        (test_user_id_2, 'testuser2@example.com', 'Test User 2', now(), now())
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Created test users: % and %', test_user_id_1, test_user_id_2;
END $$;

-- Create a test deal with USER_MULTISELECT data
DO $$
DECLARE
    test_deal_id uuid;
    user_id_1 uuid;
    user_id_2 uuid;
    project_type_id uuid;
BEGIN
    -- Get some user IDs
    SELECT user_id INTO user_id_1 FROM user_profiles ORDER BY created_at LIMIT 1;
    SELECT user_id INTO user_id_2 FROM user_profiles ORDER BY created_at LIMIT 1 OFFSET 1;
    
    -- Get a project type from wfm_project_types (or use a default)
    SELECT id INTO project_type_id FROM wfm_project_types WHERE name = 'Sales Deal' LIMIT 1;
    
    -- If no project type found, get any project type
    IF project_type_id IS NULL THEN
        SELECT id INTO project_type_id FROM wfm_project_types LIMIT 1;
    END IF;
    
    -- Create a test deal
    INSERT INTO deals (
        name, 
        amount, 
        user_id, 
        wfm_project_type_id,
        custom_field_values
    ) VALUES (
        'Test Deal with Team Members',
        50000,
        user_id_1,
        project_type_id,
        jsonb_build_object(
            'deal_team_members', jsonb_build_array(user_id_1::text, user_id_2::text)
        )
    ) RETURNING id INTO test_deal_id;
    
    RAISE NOTICE 'Created test deal % with team members: [%, %]', test_deal_id, user_id_1, user_id_2;
END $$;

-- Verify the test deal was created correctly
SELECT 
    d.id,
    d.name,
    d.custom_field_values,
    d.custom_field_values->'deal_team_members' as team_members_field,
    jsonb_array_length(d.custom_field_values->'deal_team_members') as team_members_count
FROM deals d
WHERE d.name = 'Test Deal with Team Members';

-- Final verification: simulate the GraphQL resolver output
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
    deal_id,
    deal_name,
    field_name,
    field_label,
    field_type,
    raw_value,
    'This should now work with our GraphQL resolver fix!' as status
FROM deal_custom_fields
WHERE raw_value IS NOT NULL; 