-- Update RLS policy for activities to include team lead visibility

BEGIN;

-- Drop the existing policy
DROP POLICY IF EXISTS "Allow access based on RBAC permissions for activities" ON public.activities;

-- Create the new policy with updated USING clause
CREATE POLICY "Allow access based on RBAC permissions for activities" ON public.activities
    FOR ALL
    USING (
        (public.check_permission(auth.uid(), 'read_own', 'activity') AND auth.uid() = activities.user_id) OR
        (public.check_permission(auth.uid(), 'read_any', 'activity')) OR
        (public.is_team_lead_of_item_owner(auth.uid(), activities.user_id)) -- Team lead visibility
    )
    WITH CHECK (
        -- Retain original WITH CHECK logic
        (public.check_permission(auth.uid(), 'create', 'activity') AND auth.uid() = activities.user_id) OR
        ( (public.check_permission(auth.uid(), 'update_own', 'activity') AND auth.uid() = activities.user_id) OR public.check_permission(auth.uid(), 'update_any', 'activity') ) OR
        ( (public.check_permission(auth.uid(), 'delete_own', 'activity') AND auth.uid() = activities.user_id) OR public.check_permission(auth.uid(), 'delete_any', 'activity') )
    );

COMMIT; 