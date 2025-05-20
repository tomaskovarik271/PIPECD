-- Update RLS policy for deals to include team lead visibility

BEGIN;

-- Drop the existing policy
DROP POLICY IF EXISTS "Allow access based on RBAC permissions for deals" ON public.deals;

-- Create the new policy with updated USING clause for team lead visibility
CREATE POLICY "Allow access based on RBAC permissions for deals" ON public.deals
    FOR ALL
    USING (
        (public.check_permission(auth.uid(), 'read_own', 'deal') AND auth.uid() = deals.user_id) OR
        (public.check_permission(auth.uid(), 'read_any', 'deal')) OR
        (public.is_team_lead_of_item_owner(auth.uid(), deals.user_id)) -- Team lead visibility
    )
    WITH CHECK (
        -- INSERT check: requires 'create' permission AND user_id must match authenticated user
        (public.check_permission(auth.uid(), 'create', 'deal') AND auth.uid() = deals.user_id) OR 
        -- UPDATE check: requires 'update_own' and ownership OR 'update_any'
        ( (public.check_permission(auth.uid(), 'update_own', 'deal') AND auth.uid() = deals.user_id) OR public.check_permission(auth.uid(), 'update_any', 'deal') ) OR
        -- DELETE check: requires 'delete_own' and ownership OR 'delete_any'
        ( (public.check_permission(auth.uid(), 'delete_own', 'deal') AND auth.uid() = deals.user_id) OR public.check_permission(auth.uid(), 'delete_any', 'deal') )
    );

COMMIT; 