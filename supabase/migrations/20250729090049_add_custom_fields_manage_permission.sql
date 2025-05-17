BEGIN;

-- 1. Define the new permission for managing custom field definitions
INSERT INTO public.permissions (resource, action, description)
VALUES ('custom_fields', 'manage_definitions', 'Allows creating, updating, activating, and deactivating custom field definitions.')
ON CONFLICT (resource, action) DO NOTHING; -- Avoid error if permission already exists

-- 2. Assign the new permission to the 'admin' role

-- Get the ID of the 'admin' role
WITH admin_role_id AS (
  SELECT id FROM public.roles WHERE name = 'admin' LIMIT 1
),
-- Get the ID of the new permission
custom_fields_perm_id AS (
  SELECT id FROM public.permissions WHERE resource = 'custom_fields' AND action = 'manage_definitions' LIMIT 1
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT ar.id, cfp.id
FROM admin_role_id ar, custom_fields_perm_id cfp
WHERE ar.id IS NOT NULL AND cfp.id IS NOT NULL
ON CONFLICT (role_id, permission_id) DO NOTHING; -- Avoid error if assignment already exists

COMMIT;
