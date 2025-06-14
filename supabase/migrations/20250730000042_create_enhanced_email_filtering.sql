BEGIN;

-- Enhanced Email Filtering System Migration
-- Creates contact association and user preference tables for flexible email filtering

-- =============================================
-- Deal Contact Associations Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.deal_contact_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'other' CHECK (role IN ('primary', 'decision_maker', 'influencer', 'technical', 'legal', 'other')),
  custom_role_label TEXT, -- For custom role names beyond predefined types
  include_in_email_filter BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  UNIQUE(deal_id, person_id) -- One association per deal-person pair
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_deal_contact_associations_deal_id ON public.deal_contact_associations(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_contact_associations_person_id ON public.deal_contact_associations(person_id);
CREATE INDEX IF NOT EXISTS idx_deal_contact_associations_role ON public.deal_contact_associations(role) WHERE include_in_email_filter = true;
CREATE INDEX IF NOT EXISTS idx_deal_contact_associations_created_by ON public.deal_contact_associations(created_by_user_id);

-- =============================================
-- User Email Filter Preferences Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_email_filter_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  default_contact_scope TEXT NOT NULL DEFAULT 'primary' CHECK (default_contact_scope IN ('primary', 'all', 'custom', 'selected_roles')),
  include_new_participants BOOLEAN NOT NULL DEFAULT true,
  auto_discover_contacts BOOLEAN NOT NULL DEFAULT true,
  saved_filter_presets JSONB DEFAULT '[]'::jsonb, -- Array of saved filter combinations
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id) -- One preference record per user
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_email_filter_preferences_user_id ON public.user_email_filter_preferences(user_id);

-- =============================================
-- Email Contact Discovery Log Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.email_contact_discovery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  discovered_name TEXT,
  suggested_role TEXT NOT NULL DEFAULT 'other' CHECK (suggested_role IN ('primary', 'decision_maker', 'influencer', 'technical', 'legal', 'other')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1), -- 0.00 to 1.00
  first_seen_thread_id TEXT,
  email_count INTEGER DEFAULT 1,
  is_existing_contact BOOLEAN DEFAULT false,
  existing_person_id UUID REFERENCES public.people(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'auto_associated')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMPTZ,
  processed_by_user_id UUID REFERENCES auth.users(id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_contact_discovery_deal_id ON public.email_contact_discovery_log(deal_id);
CREATE INDEX IF NOT EXISTS idx_email_contact_discovery_email ON public.email_contact_discovery_log(email_address);
CREATE INDEX IF NOT EXISTS idx_email_contact_discovery_status ON public.email_contact_discovery_log(status) WHERE status = 'pending';

-- =============================================
-- Row Level Security Policies
-- =============================================

-- Deal Contact Associations RLS
ALTER TABLE public.deal_contact_associations ENABLE ROW LEVEL SECURITY;

-- Users can view associations for deals they have access to
CREATE POLICY "Users can view deal contact associations for accessible deals" ON public.deal_contact_associations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deals d
      WHERE d.id = deal_contact_associations.deal_id
      AND (
        d.user_id = auth.uid()
        OR d.assigned_to_user_id = auth.uid()
        OR get_user_permissions(auth.uid())::jsonb ? 'deal:read_any'
      )
    )
  );

-- Users can create associations for deals they can update
CREATE POLICY "Users can create deal contact associations for updatable deals" ON public.deal_contact_associations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deals d
      WHERE d.id = deal_contact_associations.deal_id
      AND (
        (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
        AND get_user_permissions(auth.uid())::jsonb ? 'deal:update_own'
        OR get_user_permissions(auth.uid())::jsonb ? 'deal:update_any'
      )
    )
    AND created_by_user_id = auth.uid()
  );

-- Users can update associations they created or for deals they can update
CREATE POLICY "Users can update deal contact associations" ON public.deal_contact_associations
  FOR UPDATE USING (
    created_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.deals d
      WHERE d.id = deal_contact_associations.deal_id
      AND get_user_permissions(auth.uid())::jsonb ? 'deal:update_any'
    )
  );

-- Users can delete associations they created or for deals they can update
CREATE POLICY "Users can delete deal contact associations" ON public.deal_contact_associations
  FOR DELETE USING (
    created_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.deals d
      WHERE d.id = deal_contact_associations.deal_id
      AND get_user_permissions(auth.uid())::jsonb ? 'deal:update_any'
    )
  );

-- User Email Filter Preferences RLS
ALTER TABLE public.user_email_filter_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own preferences
CREATE POLICY "Users can manage their own email filter preferences" ON public.user_email_filter_preferences
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Email Contact Discovery Log RLS
ALTER TABLE public.email_contact_discovery_log ENABLE ROW LEVEL SECURITY;

-- Users can view discovery logs for deals they have access to
CREATE POLICY "Users can view email contact discovery for accessible deals" ON public.email_contact_discovery_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deals d
      WHERE d.id = email_contact_discovery_log.deal_id
      AND (
        d.user_id = auth.uid()
        OR d.assigned_to_user_id = auth.uid()
        OR get_user_permissions(auth.uid())::jsonb ? 'deal:read_any'
      )
    )
  );

-- System can insert discovery logs (will be handled by service functions)
CREATE POLICY "System can create email contact discovery logs" ON public.email_contact_discovery_log
  FOR INSERT WITH CHECK (true);

-- Users can update discovery logs for deals they can update
CREATE POLICY "Users can update email contact discovery logs" ON public.email_contact_discovery_log
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.deals d
      WHERE d.id = email_contact_discovery_log.deal_id
      AND (
        (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
        AND get_user_permissions(auth.uid())::jsonb ? 'deal:update_own'
        OR get_user_permissions(auth.uid())::jsonb ? 'deal:update_any'
      )
    )
  );

-- =============================================
-- Helper Functions
-- =============================================

-- Function to get deal contact associations with person details
CREATE OR REPLACE FUNCTION public.get_deal_contact_associations_with_details(p_deal_id UUID)
RETURNS TABLE (
  id UUID,
  deal_id UUID,
  person_id UUID,
  person_first_name TEXT,
  person_last_name TEXT,
  person_email TEXT,
  person_phone TEXT,
  role TEXT,
  custom_role_label TEXT,
  include_in_email_filter BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dca.id,
    dca.deal_id,
    dca.person_id,
    p.first_name,
    p.last_name,
    p.email,
    p.phone,
    dca.role,
    dca.custom_role_label,
    dca.include_in_email_filter,
    dca.created_at,
    dca.updated_at
  FROM public.deal_contact_associations dca
  JOIN public.people p ON p.id = dca.person_id
  WHERE dca.deal_id = p_deal_id
  AND dca.include_in_email_filter = true
  ORDER BY 
    CASE dca.role 
      WHEN 'primary' THEN 1
      WHEN 'decision_maker' THEN 2
      WHEN 'influencer' THEN 3
      WHEN 'technical' THEN 4
      WHEN 'legal' THEN 5
      ELSE 6
    END,
    p.first_name, p.last_name;
END;
$$;

-- Function to get or create user email filter preferences
CREATE OR REPLACE FUNCTION public.get_or_create_user_email_filter_preferences(p_user_id UUID)
RETURNS public.user_email_filter_preferences
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result public.user_email_filter_preferences;
BEGIN
  -- Try to get existing preferences
  SELECT * INTO result
  FROM public.user_email_filter_preferences
  WHERE user_id = p_user_id;
  
  -- If not found, create default preferences
  IF NOT FOUND THEN
    INSERT INTO public.user_email_filter_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO result;
  END IF;
  
  RETURN result;
END;
$$;

-- =============================================
-- Triggers for Updated At Timestamps
-- =============================================

-- Function to update updated_at timestamp for deal_contact_associations
CREATE OR REPLACE FUNCTION public.update_deal_contact_associations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_deal_contact_associations_updated_at
  BEFORE UPDATE ON public.deal_contact_associations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_deal_contact_associations_updated_at();

-- Function to update updated_at timestamp for user_email_filter_preferences
CREATE OR REPLACE FUNCTION public.update_user_email_filter_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_email_filter_preferences_updated_at
  BEFORE UPDATE ON public.user_email_filter_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_email_filter_preferences_updated_at();

-- =============================================
-- Seed Primary Contact Associations
-- =============================================

-- Create associations for existing deals with primary contacts
INSERT INTO public.deal_contact_associations (
  deal_id,
  person_id,
  role,
  include_in_email_filter,
  created_by_user_id
)
SELECT 
  d.id,
  d.person_id,
  'primary' as role,
  true as include_in_email_filter,
  d.user_id
FROM public.deals d
WHERE d.person_id IS NOT NULL
ON CONFLICT (deal_id, person_id) DO NOTHING;

COMMIT; 