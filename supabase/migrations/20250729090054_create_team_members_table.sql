-- Migration: Create team_members table and related permissions

-- 1. Create public.team_members table
CREATE TABLE public.team_members (
    team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (team_id, user_id)
);

-- 2. Add comment
COMMENT ON TABLE public.team_members IS 'Links users to teams, establishing team membership.';

-- 3. Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members FORCE ROW LEVEL SECURITY;

-- 4. RLS Policies for team_members

-- Policy: Admins can manage team memberships
CREATE POLICY "Admins can manage team members" ON public.team_members
    FOR ALL
    USING (public.check_permission(auth.uid(), 'manage_any', 'team_membership'))
    WITH CHECK (public.check_permission(auth.uid(), 'manage_any', 'team_membership'));

-- Policy: Team leads can manage members of their own team
CREATE POLICY "Team leads can manage their team members" ON public.team_members
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.teams t
            WHERE t.id = team_members.team_id AND t.team_lead_user_id = auth.uid()
        ) AND (
          public.check_permission(auth.uid(), 'manage_own', 'team_membership')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teams t
            WHERE t.id = team_members.team_id AND t.team_lead_user_id = auth.uid()
        ) AND (
          public.check_permission(auth.uid(), 'manage_own', 'team_membership')
        )
    );

-- 5. Insert new permissions for team_memberships
INSERT INTO public.permissions (resource, action, description) VALUES
('team_membership', 'manage_any', 'Manage memberships for any team'), 
('team_membership', 'manage_own', 'Manage memberships for teams the user leads'); 