-- Optimize check_permission function for better performance
-- This fixes the 40+ second AI agent contact creation issue

BEGIN;

-- Create optimized version with early returns (using CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.check_permission(
    p_user_id uuid,
    p_action text,
    p_resource text
) RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER -- Essential for checking permissions tables
    -- Set a secure search_path: Prevents search path hijacking
    SET search_path = public
    AS $$
DECLARE
    has_permission boolean := false;
    user_has_roles boolean := false;
BEGIN
    -- Early return if user_id is null
    IF p_user_id IS NULL THEN
        RETURN false;
    END IF;

    -- Early return: Check if user has any roles at all
    -- This prevents expensive JOINs for users with no roles
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = p_user_id
    ) INTO user_has_roles;
    
    -- If user has no roles, return false immediately
    IF NOT user_has_roles THEN
        RETURN false;
    END IF;

    -- Only do the expensive JOIN if user has roles
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id
          AND p.action = p_action
          AND p.resource = p_resource
    )
    INTO has_permission;

    RETURN has_permission;
END;
$$;

-- Revoke execute permission from public implicitly granted by SECURITY DEFINER
-- Then grant execute specifically to authenticated users
REVOKE EXECUTE ON FUNCTION public.check_permission(uuid, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.check_permission(uuid, text, text) TO authenticated;

COMMIT; 