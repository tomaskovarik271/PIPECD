-- Migration to add the check_user_has_permission helper function

BEGIN;

-- Function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION public.check_user_has_permission(
    checking_user_id uuid,
    required_permission_code text -- e.g., 'deal:create', 'custom_fields.manage_definitions'
)
RETURNS boolean
LANGUAGE plpgsql
STABLE -- Function doesn't modify the database and returns same result for same args within a transaction
SECURITY DEFINER -- Important: Must run with the permissions of the function owner to query RBAC tables
AS $$
DECLARE
    has_perm boolean;
    permission_parts text[];
    required_resource text;
    required_action text;
BEGIN
    -- Split the required_permission_code into resource and action
    permission_parts := string_to_array(required_permission_code, ':');
    IF array_length(permission_parts, 1) != 2 THEN
        RAISE EXCEPTION 'Invalid permission code format: %s. Expected format: resource:action', required_permission_code;
    END IF;
    required_resource := permission_parts[1];
    required_action := permission_parts[2];

    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = checking_user_id
          AND p.resource = required_resource
          AND p.action = required_action
    ) INTO has_perm;

    RETURN has_perm;
END;
$$;

-- Grant execute permission to authenticated users (or a more specific role if preferred for security)
-- Authenticated is fine here because the function itself checks the specific user_id passed in.
GRANT EXECUTE ON FUNCTION public.check_user_has_permission(uuid, text) TO authenticated;


-- Example of how permissions might be defined (ensure these are in your rbac_schema_and_policies.sql or similar):
-- This is just for illustration here, these INSERTs should be in the appropriate RBAC setup migration.
-- Make sure the 'permissions' table can support 'custom_fields.manage_definitions'
-- Example: INSERT INTO public.permissions (resource, action, description) VALUES ('custom_fields', 'manage_definitions', 'Allows managing custom field definitions') ON CONFLICT DO NOTHING;

COMMIT;
