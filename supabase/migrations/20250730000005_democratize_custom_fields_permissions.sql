-- Migration: Democratize Custom Fields Permissions
-- Allow all authenticated users (members) to create and manage custom field definitions
-- This enables immediate capture of RFP information without admin bottlenecks

BEGIN;

-- Grant custom fields management permission to the 'member' role
-- This allows regular users to create custom field definitions when needed

-- Get the ID of the 'member' role and the custom fields permission
WITH member_role_id AS (
  SELECT id FROM public.roles WHERE name = 'member' LIMIT 1
),
custom_fields_perm_id AS (
  SELECT id FROM public.permissions WHERE resource = 'custom_fields' AND action = 'manage_definitions' LIMIT 1
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT mr.id, cfp.id
FROM member_role_id mr, custom_fields_perm_id cfp
WHERE mr.id IS NOT NULL AND cfp.id IS NOT NULL
ON CONFLICT (role_id, permission_id) DO NOTHING; -- Avoid error if assignment already exists

-- Verify the permission was added
-- This is just for logging purposes in the migration
DO $$
DECLARE
    member_has_permission boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        JOIN public.roles r ON rp.role_id = r.id
        WHERE r.name = 'member'
          AND p.resource = 'custom_fields'
          AND p.action = 'manage_definitions'
    ) INTO member_has_permission;
    
    IF member_has_permission THEN
        RAISE NOTICE 'SUCCESS: Member role now has custom_fields:manage_definitions permission';
    ELSE
        RAISE NOTICE 'WARNING: Failed to grant custom_fields permission to member role';
    END IF;
END $$;

COMMIT; 