-- Migration: Create wfm_projects table and link deals

BEGIN;

-- 1. Create wfm_projects table
CREATE TABLE public.wfm_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_type_id UUID NOT NULL REFERENCES public.project_types(id) ON DELETE RESTRICT,
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE RESTRICT,
    current_step_id UUID REFERENCES public.workflow_steps(id) ON DELETE SET NULL, -- Can be NULL if not started or step deleted
    name TEXT NOT NULL,
    description TEXT,
    created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional: for audit if WFM projects are user-creatable
    updated_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional: for audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.wfm_projects IS 'Stores instances of WFM-managed processes, e.g., a specific sales deal undergoing a sales workflow.';
COMMENT ON COLUMN public.wfm_projects.current_step_id IS 'The current step this project is in within its assigned workflow.';

CREATE TRIGGER handle_updated_at_wfm_projects
  BEFORE UPDATE ON public.wfm_projects
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- Row Level Security for wfm_projects
ALTER TABLE public.wfm_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access to wfm_projects"
  ON public.wfm_projects
  FOR ALL
  USING (true) 
  WITH CHECK (true);

-- 2. Add wfm_project_id to deals table
ALTER TABLE public.deals
ADD COLUMN wfm_project_id UUID REFERENCES public.wfm_projects(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.deals.wfm_project_id IS 'Links the deal to its corresponding WFM project instance that manages its process/status.';

CREATE INDEX IF NOT EXISTS idx_deals_wfm_project_id ON public.deals(wfm_project_id);

COMMIT;