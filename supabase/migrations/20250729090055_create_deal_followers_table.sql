-- Migration: Create deal_followers table and related permissions

-- 1. Create public.deal_followers table
CREATE TABLE public.deal_followers (
    deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    followed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (deal_id, user_id)
);

-- 2. Add comment
COMMENT ON TABLE public.deal_followers IS 'Links users to deals they are following, for visibility and notifications.';

-- 3. Enable RLS
ALTER TABLE public.deal_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_followers FORCE ROW LEVEL SECURITY;

-- 4. RLS Policies for deal_followers

-- Policy: Admins can manage any deal's followers
CREATE POLICY "Admins can manage all deal followers" ON public.deal_followers
    FOR ALL
    USING (public.check_permission(auth.uid(), 'manage_any', 'deal_follower'))
    WITH CHECK (public.check_permission(auth.uid(), 'manage_any', 'deal_follower'));

-- Policy: Users who can update a deal can manage its followers
CREATE POLICY "Users with deal update access can manage its followers" ON public.deal_followers
    FOR ALL
    USING (
        (SELECT EXISTS (
            SELECT 1 FROM public.deals d
            WHERE d.id = deal_followers.deal_id AND
                  (
                    (public.check_permission(auth.uid(), 'update_own', 'deal') AND d.user_id = auth.uid()) OR
                    public.check_permission(auth.uid(), 'update_any', 'deal')
                  )
        ))
    )
    WITH CHECK (
         (SELECT EXISTS (
            SELECT 1 FROM public.deals d
            WHERE d.id = deal_followers.deal_id AND
                  (
                    (public.check_permission(auth.uid(), 'update_own', 'deal') AND d.user_id = auth.uid()) OR
                    public.check_permission(auth.uid(), 'update_any', 'deal')
                  )
        ))
    );

-- Policy: Users can view followers of deals they can see
CREATE POLICY "Users can view followers of deals they can see" ON public.deal_followers
    FOR SELECT
    USING (
        (SELECT EXISTS (
            SELECT 1 FROM public.deals d
            WHERE d.id = deal_followers.deal_id AND (
                (public.check_permission(auth.uid(), 'read_own', 'deal') AND d.user_id = auth.uid()) OR
                public.check_permission(auth.uid(), 'read_any', 'deal') OR
                -- Placeholder for RLS-based team lead visibility: is_team_lead_of_owner(auth.uid(), d.user_id, 'deal') OR 
                -- RLS check for current user being the follower of this specific deal (this row in deal_followers)
                deal_followers.user_id = auth.uid() 
            )
        ))
    );

-- 5. Insert new permissions for deal reassignment and follower management
INSERT INTO public.permissions (resource, action, description) VALUES 
('deal', 'reassign', 'Reassign a deal to another user'),
('deal_follower', 'manage_any', 'Manage followers for any deal (Admin)'); 