-- Fix Deal Visibility for Kanban View
-- Users need to see all deals in kanban, not just their own
-- This matches Pipedrive behavior where users see all deals by default

BEGIN;

-- Add read_any permission for deals to member role
-- This allows members to see all deals in kanban view
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.resource = 'deal' AND p.action = 'read_any'
WHERE r.name = 'member'
AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Add comment explaining the change
COMMENT ON TABLE public.deals IS 
'Deals table with RLS policies. Members can read all deals (read_any) to support kanban view, but can only update/delete their own deals or assigned deals (read_own for modifications).';

COMMIT; 