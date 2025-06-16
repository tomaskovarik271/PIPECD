-- Add missing WFM permissions that GraphQL resolvers expect
-- This migration adds the granular WFM permissions that were missing from the original WFM migration

BEGIN;

-- Add missing WFM Status permissions
INSERT INTO public.permissions (resource, action, description)
VALUES
    ('wfm_status', 'read_all', 'Read all WFM statuses'),
    ('wfm_status', 'read_one', 'Read a single WFM status'),
    ('wfm_status', 'create', 'Create new WFM statuses'),
    ('wfm_status', 'update', 'Update WFM statuses'),
    ('wfm_status', 'delete', 'Delete WFM statuses')
ON CONFLICT (resource, action) DO NOTHING;

-- Add missing WFM Workflow permissions
INSERT INTO public.permissions (resource, action, description)
VALUES
    ('wfm_workflow', 'read_all', 'Read all WFM workflows'),
    ('wfm_workflow', 'read_one', 'Read a single WFM workflow'),
    ('wfm_workflow', 'create', 'Create new WFM workflows'),
    ('wfm_workflow', 'update', 'Update WFM workflows'),
    ('wfm_workflow', 'delete', 'Delete WFM workflows')
ON CONFLICT (resource, action) DO NOTHING;

-- Add missing WFM Project Type permissions
INSERT INTO public.permissions (resource, action, description)
VALUES
    ('wfm_project_type', 'read_all', 'Read all WFM project types'),
    ('wfm_project_type', 'read_one', 'Read a single WFM project type'),
    ('wfm_project_type', 'create', 'Create new WFM project types'),
    ('wfm_project_type', 'update', 'Update WFM project types'),
    ('wfm_project_type', 'delete', 'Delete WFM project types')
ON CONFLICT (resource, action) DO NOTHING;

-- Assign all WFM permissions to the admin role
DO $$
DECLARE
    admin_role_id UUID;
    perm_record RECORD;
BEGIN
    -- Get admin role ID
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    
    IF admin_role_id IS NOT NULL THEN
        -- Assign all WFM permissions to admin role
        FOR perm_record IN 
            SELECT id FROM public.permissions 
            WHERE resource IN ('wfm_status', 'wfm_workflow', 'wfm_project_type')
        LOOP
            INSERT INTO public.role_permissions (role_id, permission_id)
            VALUES (admin_role_id, perm_record.id)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END LOOP;
    END IF;
END $$;

COMMIT; 