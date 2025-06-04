-- 20250730000006_create_leads_core_schema.sql
-- PipeCD Leads Management: Core Schema Implementation
-- Following exact patterns from deals schema with lead-specific enhancements

-- ================================
-- 1. Create Core Leads Table
-- ================================

CREATE TABLE public.leads (
  -- Primary Keys & Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core Lead Information  
  name TEXT NOT NULL,
  source TEXT, -- Website, LinkedIn, Referral, Trade Show, etc.
  description TEXT,
  
  -- Contact Information (Pre-conversion data)
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  company_name TEXT,
  
  -- Lead Metrics & Intelligence
  estimated_value DECIMAL(15,2),
  estimated_close_date DATE,
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  lead_score_factors JSONB DEFAULT '{}', -- Detailed scoring breakdown
  
  -- Qualification Status
  is_qualified BOOLEAN DEFAULT FALSE,
  qualification_notes TEXT,
  qualified_at TIMESTAMPTZ,
  qualified_by_user_id UUID REFERENCES auth.users(id),
  
  -- Assignment & Ownership
  assigned_to_user_id UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Conversion Tracking
  converted_at TIMESTAMPTZ,
  converted_to_deal_id UUID REFERENCES deals(id),
  converted_to_person_id UUID REFERENCES people(id), 
  converted_to_organization_id UUID REFERENCES organizations(id),
  converted_by_user_id UUID REFERENCES auth.users(id),
  
  -- WFM Integration (Following Deal Pattern)
  wfm_project_id UUID REFERENCES wfm_projects(id),
  
  -- Custom Fields (Following Deal Pattern)
  custom_field_values JSONB DEFAULT '{}',
  
  -- Automation & Intelligence  
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  automation_score_factors JSONB DEFAULT '{}',
  ai_insights JSONB DEFAULT '{}', -- AI-generated insights and recommendations
  
  -- Audit Fields
  created_by_user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- 2. Create Updated At Trigger
-- ================================

-- Create trigger to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at_trigger
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- ================================
-- 3. Add Activity Support for Leads
-- ================================

-- Add lead_id column to activities table if it doesn't exist
-- (Based on existing migration patterns, this may already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'lead_id'
  ) THEN
    ALTER TABLE public.activities 
    ADD COLUMN lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ================================
-- 4. Activity Types for Leads
-- ================================

-- Note: Activity types are handled through the 'type' field in activities table
-- Lead-specific activity types that can be used:
-- 'LEAD_QUALIFICATION_CALL' - Lead qualification phone call
-- 'LEAD_EMAIL_SEQUENCE' - Automated email follow-up  
-- 'LEAD_SCORE_UPDATE' - Lead score recalculation
-- 'LEAD_NURTURE_CAMPAIGN' - Lead nurturing campaign
-- 'LEAD_INITIAL_CONTACT' - First contact with lead
-- 'LEAD_FOLLOW_UP' - Follow-up contact with lead
-- 'LEAD_QUALIFICATION_MEETING' - Lead qualification meeting
-- 'LEAD_DEMO_SCHEDULED' - Product demo scheduled
-- 'LEAD_PROPOSAL_SENT' - Proposal sent to lead
-- 'LEAD_CONVERTED' - Lead successfully converted

-- ================================
-- 5. Create Lead History Table
-- ================================

-- Following exact pattern from deal_history table
CREATE TABLE public.lead_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- User who made the change (can be NULL for system changes)
  event_type TEXT NOT NULL,
  field_name TEXT, -- Which field changed (NULL for create/delete events)
  old_value JSONB, -- Previous value (NULL for create events)
  new_value JSONB, -- New value (NULL for delete events)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- 6. Create Lead History Trigger
-- ================================

-- Function to automatically track lead changes
CREATE OR REPLACE FUNCTION track_lead_changes()
RETURNS TRIGGER AS $$
DECLARE
  tracked_fields TEXT[] := ARRAY[
    'name', 'source', 'description', 'contact_name', 'contact_email', 
    'contact_phone', 'company_name', 'estimated_value', 'estimated_close_date',
    'lead_score', 'is_qualified', 'qualification_notes', 'assigned_to_user_id',
    'wfm_project_id', 'custom_field_values'
  ];
  field_name TEXT;
  old_val JSONB;
  new_val JSONB;
BEGIN
  -- Handle INSERT (lead creation)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_history (lead_id, user_id, event_type, field_name, old_value, new_value)
    VALUES (NEW.id, NEW.created_by_user_id, 'LEAD_CREATED', NULL, NULL, to_jsonb(NEW));
    RETURN NEW;
  END IF;

  -- Handle UPDATE (lead modification)
  IF TG_OP = 'UPDATE' THEN
    -- Check each tracked field for changes
    FOREACH field_name IN ARRAY tracked_fields LOOP
      EXECUTE format('SELECT to_jsonb($1.%I), to_jsonb($2.%I)', field_name, field_name) 
      USING OLD, NEW INTO old_val, new_val;
      
      -- If field changed, log it
      IF old_val IS DISTINCT FROM new_val THEN
        INSERT INTO public.lead_history (lead_id, user_id, event_type, field_name, old_value, new_value)
        VALUES (NEW.id, auth.uid(), 'LEAD_UPDATED', field_name, old_val, new_val);
      END IF;
    END LOOP;
    
    RETURN NEW;
  END IF;

  -- Handle DELETE (lead deletion)
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.lead_history (lead_id, user_id, event_type, field_name, old_value, new_value)
    VALUES (OLD.id, auth.uid(), 'LEAD_DELETED', NULL, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER lead_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION track_lead_changes();

-- ================================
-- 7. Create Lead Comments
-- ================================

-- Comments for documentation
COMMENT ON TABLE public.leads IS 'Core leads management table following PipeCD architectural patterns';
COMMENT ON COLUMN public.leads.lead_score IS 'Lead scoring from 0-100 based on qualification factors';
COMMENT ON COLUMN public.leads.lead_score_factors IS 'JSONB breakdown of scoring factors for transparency';
COMMENT ON COLUMN public.leads.ai_insights IS 'AI-generated insights and recommendations for lead management';
COMMENT ON COLUMN public.leads.automation_score_factors IS 'Automated scoring factors from AI analysis';
COMMENT ON COLUMN public.leads.custom_field_values IS 'JSONB storage for dynamic custom field values';
COMMENT ON COLUMN public.leads.wfm_project_id IS 'Links to WFM project for lead qualification workflow';

-- ================================
-- 8. Enable RLS (Row Level Security)
-- ================================

-- Enable RLS on leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Enable RLS on lead_history table  
ALTER TABLE public.lead_history ENABLE ROW LEVEL SECURITY; 