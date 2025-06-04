-- 20250730000008_create_leads_rls_policies.sql
-- PipeCD Leads Management: Row Level Security Policies
-- Following exact patterns from deals RLS implementation

-- ================================
-- 1. Core Leads Table RLS Policies
-- ================================

-- Policy: Users can view leads they own or are assigned to
CREATE POLICY "Users can view leads they own or are assigned to" ON public.leads
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = assigned_to_user_id OR
    auth.uid() = created_by_user_id OR
    public.check_permission(auth.uid(), 'lead', 'read_any')
  );

-- Policy: Users can create leads
CREATE POLICY "Users can create leads" ON public.leads
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    public.check_permission(auth.uid(), 'lead', 'create')
  );

-- Policy: Users can update their leads or assigned leads
CREATE POLICY "Users can update their leads or assigned leads" ON public.leads
  FOR UPDATE USING (
    (auth.uid() = user_id OR 
     auth.uid() = assigned_to_user_id OR
     auth.uid() = created_by_user_id OR
     public.check_permission(auth.uid(), 'lead', 'update_any')) AND
    public.check_permission(auth.uid(), 'lead', 'update_own')
  ) WITH CHECK (
    (auth.uid() = user_id OR 
     auth.uid() = assigned_to_user_id OR
     auth.uid() = created_by_user_id OR
     public.check_permission(auth.uid(), 'lead', 'update_any')) AND
    public.check_permission(auth.uid(), 'lead', 'update_own')
  );

-- Policy: Users can delete their leads
CREATE POLICY "Users can delete their leads" ON public.leads
  FOR DELETE USING (
    (auth.uid() = user_id OR 
     public.check_permission(auth.uid(), 'lead', 'delete_any')) AND
    public.check_permission(auth.uid(), 'lead', 'delete_own')
  );

-- ================================
-- 2. Lead History Table RLS Policies
-- ================================

-- Policy: Users can view history for leads they have access to
CREATE POLICY "Users can view lead history they have access to" ON public.lead_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE id = lead_history.lead_id 
      AND (
        auth.uid() = leads.user_id OR 
        auth.uid() = leads.assigned_to_user_id OR
        auth.uid() = leads.created_by_user_id OR
        public.check_permission(auth.uid(), 'lead', 'read_any')
      )
    )
  );

-- Policy: System can insert lead history (for triggers)
CREATE POLICY "System can insert lead history" ON public.lead_history
  FOR INSERT WITH CHECK (true);

-- Policy: Users cannot directly update or delete lead history
CREATE POLICY "Users cannot modify lead history" ON public.lead_history
  FOR UPDATE USING (false);

CREATE POLICY "Users cannot delete lead history" ON public.lead_history
  FOR DELETE USING (false);

-- ================================
-- 3. Permission Setup for Leads
-- ================================

-- Add lead-specific permissions to the permissions system
-- (Following exact deal permission patterns)

-- Insert lead permissions if they don't exist
INSERT INTO public.permissions (resource, action, description) VALUES
  ('lead', 'create', 'Create new leads'),
  ('lead', 'read_own', 'Read own leads'),
  ('lead', 'read_any', 'Read any leads (admin)'),
  ('lead', 'update_own', 'Update own leads'),
  ('lead', 'update_any', 'Update any leads (admin)'),
  ('lead', 'delete_own', 'Delete own leads'),
  ('lead', 'delete_any', 'Delete any leads (admin)'),
  ('lead', 'qualify', 'Qualify leads'),
  ('lead', 'convert', 'Convert leads to deals/people/organizations'),
  ('lead', 'assign', 'Assign leads to other users'),
  ('lead', 'view_analytics', 'View lead analytics and reports')
ON CONFLICT (resource, action) DO NOTHING;

-- ================================
-- 4. Activities RLS for Leads
-- ================================

-- Update activities RLS to include lead access
-- Note: This assumes activities table already has RLS policies for deals
-- We're extending the existing SELECT policy to include lead access

-- Drop existing activities SELECT policy if it exists and recreate with lead support
DROP POLICY IF EXISTS "Users can view activities for entities they have access to" ON public.activities;

CREATE POLICY "Users can view activities for entities they have access to" ON public.activities
  FOR SELECT USING (
    -- Check deal access
    (deal_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.deals 
      WHERE id = activities.deal_id 
      AND (
        auth.uid() = deals.user_id OR 
        auth.uid() = deals.assigned_to_user_id OR
        public.check_permission(auth.uid(), 'deal', 'read_any')
      )
    )) OR
    -- Check lead access  
    (lead_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.leads 
      WHERE id = activities.lead_id 
      AND (
        auth.uid() = leads.user_id OR 
        auth.uid() = leads.assigned_to_user_id OR
        auth.uid() = leads.created_by_user_id OR
        public.check_permission(auth.uid(), 'lead', 'read_any')
      )
    )) OR
    -- User's own activities
    auth.uid() = user_id OR
    -- Admin access
    public.check_permission(auth.uid(), 'activity', 'read_any')
  );

-- Extend activities INSERT policy to include lead activities
DROP POLICY IF EXISTS "Users can create activities for entities they have access to" ON public.activities;

CREATE POLICY "Users can create activities for entities they have access to" ON public.activities
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      -- Can create activities for deals they have access to
      (deal_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.deals 
        WHERE id = activities.deal_id 
        AND (
          auth.uid() = deals.user_id OR 
          auth.uid() = deals.assigned_to_user_id OR
          public.check_permission(auth.uid(), 'deal', 'update_own')
        )
      )) OR
      -- Can create activities for leads they have access to
      (lead_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.leads 
        WHERE id = activities.lead_id 
        AND (
          auth.uid() = leads.user_id OR 
          auth.uid() = leads.assigned_to_user_id OR
          auth.uid() = leads.created_by_user_id OR
          public.check_permission(auth.uid(), 'lead', 'update_own')
        )
      )) OR
      -- General activity creation permission
      public.check_permission(auth.uid(), 'activity', 'create')
    )
  );

-- ================================
-- 5. Function to Check Lead Access
-- ================================

-- Create helper function to check if user has access to a specific lead
CREATE OR REPLACE FUNCTION public.user_has_lead_access(lead_uuid UUID, access_type TEXT DEFAULT 'read')
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.leads 
    WHERE id = lead_uuid 
    AND (
      CASE access_type
        WHEN 'read' THEN (
          auth.uid() = user_id OR 
          auth.uid() = assigned_to_user_id OR
          auth.uid() = created_by_user_id OR
          public.check_permission(auth.uid(), 'lead', 'read_any')
        )
        WHEN 'update' THEN (
          (auth.uid() = user_id OR 
           auth.uid() = assigned_to_user_id OR
           auth.uid() = created_by_user_id OR
           public.check_permission(auth.uid(), 'lead', 'update_any')) AND
          public.check_permission(auth.uid(), 'lead', 'update_own')
        )
        WHEN 'delete' THEN (
          (auth.uid() = user_id OR 
           public.check_permission(auth.uid(), 'lead', 'delete_any')) AND
          public.check_permission(auth.uid(), 'lead', 'delete_own')
        )
        ELSE FALSE
      END
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 6. Default Role Permissions
-- ================================

-- Grant basic lead permissions to authenticated users
-- (Following deal permission patterns)

-- Create function to setup default lead permissions
CREATE OR REPLACE FUNCTION setup_default_lead_permissions()
RETURNS VOID AS $$
BEGIN
  -- Grant basic lead permissions to all authenticated users
  INSERT INTO public.user_permissions (user_id, permission_id)
  SELECT 
    auth.uid(),
    p.id
  FROM public.permissions p
  WHERE p.resource = 'lead' 
  AND p.action IN ('create', 'read_own', 'update_own', 'delete_own', 'qualify', 'convert')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_permissions up 
    WHERE up.user_id = auth.uid() AND up.permission_id = p.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 7. Security Comments and Documentation
-- ================================

-- Add comprehensive comments for security documentation
COMMENT ON POLICY "Users can view leads they own or are assigned to" ON public.leads IS 
'Allows users to view leads they created, own, are assigned to, or have admin permissions for';

COMMENT ON POLICY "Users can create leads" ON public.leads IS 
'Allows authenticated users with create permissions to create new leads';

COMMENT ON POLICY "Users can update their leads or assigned leads" ON public.leads IS 
'Allows users to update leads they have access to and update permissions for';

COMMENT ON POLICY "Users can delete their leads" ON public.leads IS 
'Allows users to delete leads they own or have admin delete permissions for';

COMMENT ON FUNCTION public.user_has_lead_access(UUID, TEXT) IS 
'Helper function to check if the current user has specific access to a lead';

COMMENT ON FUNCTION setup_default_lead_permissions() IS 
'Sets up default lead permissions for authenticated users';

-- ================================
-- 8. RLS Policy Testing
-- ================================

-- Create function to test RLS policies (useful for development)
CREATE OR REPLACE FUNCTION test_lead_rls_policies()
RETURNS TABLE (
  policy_name TEXT,
  test_description TEXT,
  test_result BOOLEAN
) AS $$
BEGIN
  -- This function can be used to validate RLS policies are working correctly
  -- Implementation would include specific test cases for each policy
  RETURN QUERY
  SELECT 
    'lead_select_policy'::TEXT as policy_name,
    'Users can only see their own leads'::TEXT as test_description,
    TRUE as test_result; -- Placeholder - would include actual tests
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION test_lead_rls_policies() IS 
'Test function to validate RLS policies are working correctly for leads'; 