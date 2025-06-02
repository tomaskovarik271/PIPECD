-- Supabase migration to create core WFM definition tables
-- Version: 1
-- Timestamp: 20250521163623

BEGIN;

-- Ensure the moddatetime extension is available for updated_at triggers
CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;

-- Create statuses table
CREATE TABLE public.statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT, -- For UI hints, e.g., hex code
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.statuses IS 'Global status definitions for WFM (e.g., Open, In Progress, Lead, Qualified).';

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.statuses
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- Create workflows table
CREATE TABLE public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.workflows IS 'Defines a sequence of steps (statuses) for a process, e.g., Standard Sales Process.';

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- Create workflow_steps table
CREATE TABLE public.workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    status_id UUID NOT NULL REFERENCES public.statuses(id) ON DELETE RESTRICT, -- Prevent deleting a status if it's used in a workflow step
    step_order INTEGER NOT NULL,
    is_initial_step BOOLEAN NOT NULL DEFAULT FALSE,
    is_final_step BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_workflow_status UNIQUE (workflow_id, status_id), -- A status can only appear once per workflow directly
    CONSTRAINT uq_workflow_order UNIQUE (workflow_id, step_order) -- Step order must be unique within a workflow
);
COMMENT ON TABLE public.workflow_steps IS 'Defines a step within a workflow, linking to a global status and defining its order and properties.';
COMMENT ON COLUMN public.workflow_steps.metadata IS 'For future extensibility, e.g., storing deal probability or checklist templates for a step.';

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workflow_steps
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- Create workflow_transitions table
CREATE TABLE public.workflow_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    from_step_id UUID NOT NULL REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
    to_step_id UUID NOT NULL REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
    name TEXT, -- Optional name for the transition action, e.g., "Resolve", "Escalate"
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_workflow_transition UNIQUE (workflow_id, from_step_id, to_step_id)
);
COMMENT ON TABLE public.workflow_transitions IS 'Defines allowed transitions between steps within a specific workflow.';

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workflow_transitions
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- Create project_types table
CREATE TABLE public.project_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    default_workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL, -- A project type can optionally have a default workflow
    icon_name TEXT, -- For UI representation, e.g., a slug for an icon component
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.project_types IS 'Defines categories of projects, e.g., Sales Deal, Internal Project, Support Ticket.';

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.project_types
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);


-- Add a new WFM admin permission to the existing permissions table
-- This assumes the RBAC tables (permissions, roles, role_permissions) from 20250505072153_rbac_schema_and_policies.sql exist.
INSERT INTO public.permissions (resource, action, description)
VALUES
    ('wfm_definitions', 'manage', 'Manage WFM definitions (statuses, workflows, project types, etc.)')
ON CONFLICT (resource, action) DO NOTHING;

-- Assign this new permission to the 'admin' role (if it exists)
DO $$
DECLARE
    admin_role_id UUID;
    wfm_manage_perm_id UUID;
BEGIN
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    SELECT id INTO wfm_manage_perm_id FROM public.permissions WHERE resource = 'wfm_definitions' AND action = 'manage';

    IF admin_role_id IS NOT NULL AND wfm_manage_perm_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        VALUES (admin_role_id, wfm_manage_perm_id)
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;
END $$;

-- RLS Policies for WFM Definition Tables

-- statuses
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses FORCE ROW LEVEL SECURITY;
CREATE POLICY "Allow WFM admins to manage statuses" ON public.statuses
    FOR ALL USING ( (SELECT public.check_permission(auth.uid(), 'manage', 'wfm_definitions')) );
CREATE POLICY "Allow authenticated users to read statuses" ON public.statuses
    FOR SELECT USING (auth.role() = 'authenticated');

-- workflows
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows FORCE ROW LEVEL SECURITY;
CREATE POLICY "Allow WFM admins to manage workflows" ON public.workflows
    FOR ALL USING ( (SELECT public.check_permission(auth.uid(), 'manage', 'wfm_definitions')) );
CREATE POLICY "Allow authenticated users to read workflows" ON public.workflows
    FOR SELECT USING (auth.role() = 'authenticated');

-- workflow_steps
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps FORCE ROW LEVEL SECURITY;
CREATE POLICY "Allow WFM admins to manage workflow_steps" ON public.workflow_steps
    FOR ALL USING ( (SELECT public.check_permission(auth.uid(), 'manage', 'wfm_definitions')) );
CREATE POLICY "Allow authenticated users to read workflow_steps" ON public.workflow_steps
    FOR SELECT USING (auth.role() = 'authenticated');

-- workflow_transitions
ALTER TABLE public.workflow_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_transitions FORCE ROW LEVEL SECURITY;
CREATE POLICY "Allow WFM admins to manage workflow_transitions" ON public.workflow_transitions
    FOR ALL USING ( (SELECT public.check_permission(auth.uid(), 'manage', 'wfm_definitions')) );
CREATE POLICY "Allow authenticated users to read workflow_transitions" ON public.workflow_transitions
    FOR SELECT USING (auth.role() = 'authenticated');

-- project_types
ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_types FORCE ROW LEVEL SECURITY;
CREATE POLICY "Allow WFM admins to manage project_types" ON public.project_types
    FOR ALL USING ( (SELECT public.check_permission(auth.uid(), 'manage', 'wfm_definitions')) );
CREATE POLICY "Allow authenticated users to read project_types" ON public.project_types
    FOR SELECT USING (auth.role() = 'authenticated');

COMMIT; 