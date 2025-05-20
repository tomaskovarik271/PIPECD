-- supabase/migrations/20250730000000_update_deals_rls_for_follower_visibility.sql
-- Purpose: Refine RLS policies on public.deals to include follower visibility for SELECT operations
-- and separate policies for INSERT, UPDATE, DELETE for clarity and correctness.

BEGIN;

-- 1. Drop the existing encompassing "FOR ALL" policy
DROP POLICY IF EXISTS "Allow access based on RBAC permissions for deals" ON public.deals;

-- 2. Create SELECT policy: Includes owner, admin, team lead, and follower visibility
CREATE POLICY "SELECT access for deals (owner, admin, team_lead, follower)" ON public.deals
    FOR SELECT
    USING (
        (public.check_permission(auth.uid(), 'read_own', 'deal') AND auth.uid() = deals.user_id) OR
        (public.check_permission(auth.uid(), 'read_any', 'deal')) OR
        (public.is_team_lead_of_item_owner(auth.uid(), deals.user_id)) OR
        (EXISTS (SELECT 1 FROM public.deal_followers df WHERE df.deal_id = deals.id AND df.user_id = auth.uid()))
    );

-- 3. Create INSERT policy: Based on 'create' permission and user matching
CREATE POLICY "INSERT access for deals (creator with permission)" ON public.deals
    FOR INSERT
    WITH CHECK (
        (public.check_permission(auth.uid(), 'create', 'deal') AND auth.uid() = deals.user_id)
    );

-- 4. Create UPDATE policy: Users must be able to target the row (owner, admin, team_lead) AND have specific update permissions
CREATE POLICY "UPDATE access for deals (owner/admin with permission)" ON public.deals
    FOR UPDATE
    USING (
        -- Defines which rows can be targeted for an update attempt
        (public.check_permission(auth.uid(), 'read_own', 'deal') AND auth.uid() = deals.user_id) OR
        (public.check_permission(auth.uid(), 'read_any', 'deal')) OR
        (public.is_team_lead_of_item_owner(auth.uid(), deals.user_id))
        -- Followers are generally not granted update permissions via follower status
    )
    WITH CHECK (
        -- Defines if the update is allowed based on permissions for the targeted row
        ( (public.check_permission(auth.uid(), 'update_own', 'deal') AND auth.uid() = deals.user_id) OR public.check_permission(auth.uid(), 'update_any', 'deal') )
    );

-- 5. Create DELETE policy: Users must have specific delete permissions for the targeted row
CREATE POLICY "DELETE access for deals (owner/admin with permission)" ON public.deals
    FOR DELETE
    USING (
        -- Defines which rows can be targeted for deletion
        ( (public.check_permission(auth.uid(), 'delete_own', 'deal') AND auth.uid() = deals.user_id) OR public.check_permission(auth.uid(), 'delete_any', 'deal') )
        -- AND the user must be able to "see" the deal to target it for deletion.
        -- This is implicitly handled because if this condition isn't met, the row isn't even visible for the operation to target.
        -- However, to be explicit about the rows deletable by permission, we add the visibility check from the SELECT policy if it's more permissive.
        -- For DELETE, the permission check (delete_own/delete_any) is usually primary. If they have this permission, they can delete rows matching that criteria.
        -- The previous FOR ALL policy combined visibility and action permission in its WITH CHECK. 
        -- This is clearer: if you have 'delete_own' for your deals, or 'delete_any' for any deal, this policy leg applies.
    );

COMMIT; 