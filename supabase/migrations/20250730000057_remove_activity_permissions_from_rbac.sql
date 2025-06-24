-- Migration: Remove activity-related permissions from RBAC system
-- Since we've removed the activities system, clean up all activity permissions

BEGIN;

-- 1. Remove activity permission assignments from all roles
-- This will remove activity permissions from admin, member, and read_only roles
DELETE FROM public.role_permissions 
WHERE permission_id IN (
    SELECT id FROM public.permissions 
    WHERE resource = 'activity'
);

-- 2. Remove all activity permissions from the permissions table
DELETE FROM public.permissions 
WHERE resource = 'activity';

-- 3. Remove any RLS policies that reference activity permissions
-- These policies were already removed when we dropped the activities table in migration 20250730000056
-- No action needed here since the activities table no longer exists

-- 4. Verification and logging
DO $$
DECLARE
    remaining_activity_permissions INTEGER;
    remaining_role_permissions INTEGER;
BEGIN
    -- Check for any remaining activity permissions
    SELECT COUNT(*) INTO remaining_activity_permissions
    FROM public.permissions 
    WHERE resource = 'activity';
    
    -- Check for any remaining activity role assignments
    SELECT COUNT(*) INTO remaining_role_permissions
    FROM public.role_permissions rp
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE p.resource = 'activity';
    
    RAISE NOTICE 'Activity permissions cleanup completed:';
    RAISE NOTICE '- Remaining activity permissions: %', remaining_activity_permissions;
    RAISE NOTICE '- Remaining activity role assignments: %', remaining_role_permissions;
    
    IF remaining_activity_permissions = 0 AND remaining_role_permissions = 0 THEN
        RAISE NOTICE 'SUCCESS: All activity-related RBAC permissions have been removed';
    ELSE
        RAISE WARNING 'WARNING: Some activity permissions may still remain in the system';
    END IF;
END
$$;

COMMIT; 