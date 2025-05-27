-- Migration: Add get_user_permissions helper function

BEGIN;

-- Function to retrieve all permission strings for a given user
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS jsonb -- Return as JSONB array of strings e.g., ["deal:create", "pipeline:read_any"]
LANGUAGE sql
STABLE -- Function doesn't modify the database and returns same result for same args within a transaction
SECURITY INVOKER -- Check permissions based on the calling user (who is authenticated)
AS $$
    SELECT COALESCE(jsonb_agg(p.resource || ':' || p.action ORDER BY p.resource, p.action), '[]'::jsonb)
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_permissions(UUID) TO authenticated;

COMMIT;
