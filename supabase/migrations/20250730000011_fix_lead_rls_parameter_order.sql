-- Migration: Fix Lead RLS Policy Parameter Order
-- The check_permission function signature is (user_id, action, resource)
-- but our RLS policies were calling it as (user_id, resource, action)

-- Drop existing lead RLS policies
DROP POLICY IF EXISTS "Users can view leads they own or are assigned to" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their leads or assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their leads" ON public.leads;

-- Recreate with correct parameter order

-- Policy: Users can view leads they own or are assigned to
CREATE POLICY "Users can view leads they own or are assigned to" ON public.leads
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = assigned_to_user_id OR
    auth.uid() = created_by_user_id OR
    public.check_permission(auth.uid(), 'read_any', 'lead')
  );

-- Policy: Users can create leads
CREATE POLICY "Users can create leads" ON public.leads
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    public.check_permission(auth.uid(), 'create', 'lead')
  );

-- Policy: Users can update their leads or assigned leads
CREATE POLICY "Users can update their leads or assigned leads" ON public.leads
  FOR UPDATE USING (
    (auth.uid() = user_id OR 
     auth.uid() = assigned_to_user_id OR
     auth.uid() = created_by_user_id OR
     public.check_permission(auth.uid(), 'update_any', 'lead')) AND
    public.check_permission(auth.uid(), 'update_own', 'lead')
  ) WITH CHECK (
    (auth.uid() = user_id OR 
     auth.uid() = assigned_to_user_id OR
     auth.uid() = created_by_user_id OR
     public.check_permission(auth.uid(), 'update_any', 'lead')) AND
    public.check_permission(auth.uid(), 'update_own', 'lead')
  );

-- Policy: Users can delete their leads
CREATE POLICY "Users can delete their leads" ON public.leads
  FOR DELETE USING (
    (auth.uid() = user_id OR 
     public.check_permission(auth.uid(), 'delete_any', 'lead')) AND
    public.check_permission(auth.uid(), 'delete_own', 'lead')
  );

-- Also fix the activity RLS policies that reference leads
DROP POLICY IF EXISTS "Users can view activities for entities they have access to" ON public.activities;
DROP POLICY IF EXISTS "Users can create activities for entities they have access to" ON public.activities;

-- Recreate activities policies with correct parameter order
CREATE POLICY "Users can view activities for entities they have access to" ON public.activities
  FOR SELECT USING (
    -- Check deal access
    (deal_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.deals 
      WHERE id = activities.deal_id 
      AND (
        auth.uid() = deals.user_id OR 
        auth.uid() = deals.assigned_to_user_id OR
        public.check_permission(auth.uid(), 'read_any', 'deal')
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
        public.check_permission(auth.uid(), 'read_any', 'lead')
      )
    )) OR
    -- User's own activities
    auth.uid() = user_id OR
    -- Admin access
    public.check_permission(auth.uid(), 'read_any', 'activity')
  );

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
          public.check_permission(auth.uid(), 'update_own', 'deal')
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
          public.check_permission(auth.uid(), 'update_own', 'lead')
        )
      )) OR
      -- General activity creation permission
      public.check_permission(auth.uid(), 'create', 'activity')
    )
  ); 