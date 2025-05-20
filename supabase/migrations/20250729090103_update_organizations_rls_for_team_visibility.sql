-- Update RLS policy for organizations to include team lead visibility

BEGIN;

-- Drop the existing policy
DROP POLICY IF EXISTS "Allow access based on RBAC permissions for organizations" ON public.organizations;

-- Create the new policy with updated USING clause
CREATE POLICY "Allow access based on RBAC permissions for organizations" ON public.organizations
    FOR ALL
    USING (
        -- Assuming 'read_own' for organizations implies ownership via organizations.user_id
        (public.check_permission(auth.uid(), 'read_own', 'organization') AND auth.uid() = organizations.user_id) OR 
        (public.check_permission(auth.uid(), 'read_any', 'organization')) OR
        (public.is_team_lead_of_item_owner(auth.uid(), organizations.user_id)) -- Team lead visibility
    )
    WITH CHECK (
        -- Retain original WITH CHECK logic for INSERT/UPDATE/DELETE operations
        public.check_permission(auth.uid(), 'create', 'organization') OR 
        public.check_permission(auth.uid(), 'update_any', 'organization') OR 
        public.check_permission(auth.uid(), 'delete_any', 'organization')
    );

COMMIT; 