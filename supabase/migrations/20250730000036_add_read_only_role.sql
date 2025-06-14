-- Migration: Add read_only role for finance/reporting users
-- This role provides read access to all data without modification capabilities

BEGIN;

-- 1. Add the read_only role
INSERT INTO public.roles (name, description) VALUES
('read_only', 'Read-only access for finance, reporting, and analyst users - can view all data but cannot modify anything')
ON CONFLICT (name) DO UPDATE SET 
description = EXCLUDED.description;

-- 2. Define read-only permissions for the new role
-- Get the read_only role ID for permission assignment
DO $$
DECLARE
    read_only_role_id uuid;
    temp_permission_id uuid;
BEGIN
    -- Get the read_only role ID
    SELECT id INTO read_only_role_id FROM public.roles WHERE name = 'read_only';
    
    -- Assign read-only permissions to the role
    -- People: read access only
    SELECT id INTO temp_permission_id FROM public.permissions WHERE resource = 'person' AND action = 'read_any';
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES (read_only_role_id, temp_permission_id) ON CONFLICT DO NOTHING;
    
    -- Organizations: read access only
    SELECT id INTO temp_permission_id FROM public.permissions WHERE resource = 'organization' AND action = 'read_any';
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES (read_only_role_id, temp_permission_id) ON CONFLICT DO NOTHING;
    
    -- Deals: read access only (both read_own and read_any for maximum visibility)
    SELECT id INTO temp_permission_id FROM public.permissions WHERE resource = 'deal' AND action = 'read_any';
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES (read_only_role_id, temp_permission_id) ON CONFLICT DO NOTHING;
    
    -- Leads: read access only
    SELECT id INTO temp_permission_id FROM public.permissions WHERE resource = 'lead' AND action = 'read_any';
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES (read_only_role_id, temp_permission_id) ON CONFLICT DO NOTHING;
    
    -- Pipelines: read access only
    SELECT id INTO temp_permission_id FROM public.permissions WHERE resource = 'pipeline' AND action = 'read_any';
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES (read_only_role_id, temp_permission_id) ON CONFLICT DO NOTHING;
    
    -- Stages: read access only
    SELECT id INTO temp_permission_id FROM public.permissions WHERE resource = 'stage' AND action = 'read_any';
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES (read_only_role_id, temp_permission_id) ON CONFLICT DO NOTHING;
    
    -- Activities: read access only
    SELECT id INTO temp_permission_id FROM public.permissions WHERE resource = 'activity' AND action = 'read_any';
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES (read_only_role_id, temp_permission_id) ON CONFLICT DO NOTHING;
    
    -- Custom Fields: read access only (no management permissions)
    -- Note: read_only users can see custom field values but cannot modify field definitions
    
    RAISE NOTICE 'Successfully created read_only role with read-only permissions for all entities';
END
$$;

-- 3. Create helper function for easy read_only user assignment
CREATE OR REPLACE FUNCTION assign_user_read_only_role(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid UUID;
    role_uuid UUID;
    result_message TEXT;
BEGIN
    -- Find user by email
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    IF user_uuid IS NULL THEN
        RETURN 'ERROR: User with email ' || user_email || ' not found';
    END IF;
    
    -- Get read_only role ID
    SELECT id INTO role_uuid FROM public.roles WHERE name = 'read_only';
    
    -- Assign role to user
    INSERT INTO public.user_roles (user_id, role_id) 
    VALUES (user_uuid, role_uuid)
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    -- Check if assignment was successful
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_uuid AND role_id = role_uuid) THEN
        result_message := 'SUCCESS: Assigned read_only role to user ' || user_email;
    ELSE
        result_message := 'ERROR: Failed to assign read_only role to user ' || user_email;
    END IF;
    
    RETURN result_message;
END;
$$;

-- Grant execute permission to authenticated users (for admins to use)
GRANT EXECUTE ON FUNCTION assign_user_read_only_role(TEXT) TO authenticated;

-- 4. Create helper function to list users by role (useful for management)
CREATE OR REPLACE FUNCTION get_users_by_role(role_name TEXT)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    assigned_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ur.user_id,
        au.email,
        ur.created_at as assigned_at
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    JOIN auth.users au ON ur.user_id = au.id
    WHERE r.name = role_name
    ORDER BY ur.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_users_by_role(TEXT) TO authenticated;

-- 5. Verification query to show the new role and its permissions
DO $$
DECLARE
    permission_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO permission_count
    FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    WHERE r.name = 'read_only';
    
    RAISE NOTICE 'Read-only role created with % permissions assigned', permission_count;
    RAISE NOTICE 'Use: SELECT assign_user_read_only_role(''user@example.com'') to assign users';
    RAISE NOTICE 'Use: SELECT * FROM get_users_by_role(''read_only'') to list read-only users';
END
$$;

COMMIT; 