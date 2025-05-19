-- Migration: Create teams table and related permissions

-- 1. Create public.teams table
CREATE TABLE public.teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text NULL,
    team_lead_user_id uuid REFERENCES public.user_profiles(user_id) ON DELETE SET NULL, -- Can be null if no lead assigned
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by_user_id uuid REFERENCES public.user_profiles(user_id) ON DELETE SET NULL -- User who created the team
);

-- 2. Add comments
COMMENT ON TABLE public.teams IS 'Stores information about different teams.';
COMMENT ON COLUMN public.teams.team_lead_user_id IS 'The user_id of the designated team lead.';

-- 3. Setup handle_updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- 4. Enable RLS for teams table
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams FORCE ROW LEVEL SECURITY;

-- 5. RLS Policies for teams

-- Policy: Admins can manage teams
CREATE POLICY "Admins can manage teams" ON public.teams
    FOR ALL
    USING (public.check_permission(auth.uid(), 'manage_any', 'team'))
    WITH CHECK (public.check_permission(auth.uid(), 'manage_any', 'team'));

-- Policy: Team leads can view their own team details
CREATE POLICY "Team leads can view their team" ON public.teams
    FOR SELECT
    USING (auth.uid() = team_lead_user_id);

-- 6. Insert new permissions for teams
INSERT INTO public.permissions (resource, action, description) VALUES
('team', 'create', 'Create a new team'),
('team', 'read_any', 'Read any team data'), 
('team', 'update_any', 'Update any team data'), 
('team', 'delete_any', 'Delete any team'), 
('team', 'manage_any', 'Full management of any team (used for RLS shortcut)'); 