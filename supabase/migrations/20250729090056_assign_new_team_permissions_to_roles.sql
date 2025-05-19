-- Migration: Assign new team-related permissions to roles

-- Grant permissions to 'admin' role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'admin'), 
    p.id
FROM public.permissions p
WHERE p.resource = 'team' AND p.action IN ('create', 'read_any', 'update_any', 'delete_any', 'manage_any');

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'admin'), 
    p.id
FROM public.permissions p
WHERE p.resource = 'team_membership' AND p.action IN ('manage_any', 'manage_own');

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'admin'), 
    p.id
FROM public.permissions p
WHERE p.resource = 'deal' AND p.action = 'reassign';

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'admin'), 
    p.id
FROM public.permissions p
WHERE p.resource = 'deal_follower' AND p.action = 'manage_any';


-- Grant 'manage_own' for 'team_membership' to 'user' role
-- This allows any user who becomes a team lead to manage their team members,
-- as the RLS policy on team_members also checks if they are the actual team_lead_user_id.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'member'),
    p.id
FROM public.permissions p
WHERE p.resource = 'team_membership' AND p.action = 'manage_own';

-- Note: Other permissions like 'deal:update_own' or 'deal:update_any' are assumed to be already
-- assigned to roles as needed for the RLS policy on 'deal_followers' (managing followers based on deal update access).
-- If not, those assignments would also be needed here or in a prior migration. 

-- COMMIT; -- Removed explicit commit 