-- Migration: Assign Lead Permissions to Admin Role
-- This ensures admin users have all lead permissions

-- Assign all lead permissions to admin role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin' 
AND p.resource = 'lead'
AND NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Also assign basic lead permissions to member role (following deal patterns)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON TRUE
WHERE r.name = 'member' 
AND p.resource = 'lead'
AND p.action IN ('create', 'read_own', 'update_own', 'delete_own', 'qualify', 'convert')
AND NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
); 