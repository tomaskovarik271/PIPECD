-- Update RLS policy for people to include team lead visibility

BEGIN;

-- Drop the existing policy
DROP POLICY IF EXISTS "Allow access based on RBAC permissions for people" ON public.people;

-- Create the new policy with updated USING clause
CREATE POLICY "Allow access based on RBAC permissions for people" ON public.people
    FOR ALL
    USING (
        -- Assuming 'read_own' for people implies ownership via people.user_id
        (public.check_permission(auth.uid(), 'read_own', 'person') AND auth.uid() = people.user_id) OR 
        (public.check_permission(auth.uid(), 'read_any', 'person')) OR
        (public.is_team_lead_of_item_owner(auth.uid(), people.user_id)) -- Team lead visibility
    )
    WITH CHECK (
        -- Retain original WITH CHECK logic for INSERT/UPDATE/DELETE operations
        public.check_permission(auth.uid(), 'create', 'person') OR 
        public.check_permission(auth.uid(), 'update_any', 'person') OR 
        public.check_permission(auth.uid(), 'delete_any', 'person')
    );

COMMIT; 