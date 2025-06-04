-- 20250730000017_move_lead_qualification_to_wfm_metadata.sql
-- Move Lead Qualification from dual status to WFM metadata pattern
-- Following exact deals probability pattern to eliminate dual status conflicts

-- ================================
-- 1. Add is_qualified to WFM Step Metadata
-- ================================

-- Update workflow steps metadata to include is_qualified status
-- Following exact pattern from deals deal_probability metadata
WITH workflow_data AS (
  SELECT w.id as workflow_id
  FROM public.workflows w 
  WHERE w.name = 'Lead Qualification Standard Process'
  LIMIT 1
)
UPDATE public.workflow_steps 
SET metadata = metadata || jsonb_build_object('is_qualified', 
  CASE 
    -- Unqualified steps (early in funnel)
    WHEN step_order IN (1, 2, 3, 4, 8) THEN 0  -- New Lead, Initial Contact, Follow Up, Qualifying, Nurturing
    -- Qualified steps (ready for conversion)
    WHEN step_order IN (5, 6) THEN 1            -- Qualified Lead, Converted
    -- Disqualified (explicitly not qualified)
    WHEN step_order = 7 THEN 0                  -- Disqualified
    ELSE 0
  END
)
WHERE workflow_id IN (SELECT workflow_id FROM workflow_data);

-- ================================
-- 2. Drop indexes that reference qualification columns
-- ================================

-- Drop single-column indexes on qualification fields
DROP INDEX IF EXISTS public.idx_leads_is_qualified;
DROP INDEX IF EXISTS public.idx_leads_qualified_at;

-- Drop composite indexes that include qualification fields
DROP INDEX IF EXISTS public.idx_leads_user_qualified_score;
DROP INDEX IF EXISTS public.idx_leads_source_score_qualified;
DROP INDEX IF EXISTS public.idx_leads_qualified_by_date;
DROP INDEX IF EXISTS public.idx_leads_user_value_qualified;

-- ================================
-- 3. Remove is_qualified from leads table
-- ================================

-- Remove the standalone is_qualified field since we now use WFM metadata
ALTER TABLE public.leads DROP COLUMN IF EXISTS is_qualified;
ALTER TABLE public.leads DROP COLUMN IF EXISTS qualified_at;
ALTER TABLE public.leads DROP COLUMN IF EXISTS qualified_by_user_id;
ALTER TABLE public.leads DROP COLUMN IF EXISTS qualification_notes;

-- ================================
-- 4. Add lead-specific metadata fields
-- ================================

-- Add lead_qualification_level for future expansion (like deal_probability)
-- This allows for nuanced qualification levels beyond binary qualified/unqualified
WITH workflow_data AS (
  SELECT w.id as workflow_id
  FROM public.workflows w 
  WHERE w.name = 'Lead Qualification Standard Process'
  LIMIT 1
)
UPDATE public.workflow_steps 
SET metadata = metadata || jsonb_build_object('lead_qualification_level',
  CASE 
    WHEN step_order = 1 THEN 0.0   -- New Lead: 0% qualified
    WHEN step_order = 2 THEN 0.2   -- Initial Contact: 20% qualified
    WHEN step_order = 3 THEN 0.3   -- Follow Up: 30% qualified  
    WHEN step_order = 4 THEN 0.6   -- Qualifying: 60% qualified
    WHEN step_order = 5 THEN 0.9   -- Qualified Lead: 90% qualified
    WHEN step_order = 6 THEN 1.0   -- Converted: 100% qualified
    WHEN step_order = 7 THEN 0.0   -- Disqualified: 0% qualified
    WHEN step_order = 8 THEN 0.4   -- Nurturing: 40% qualified
    ELSE 0.0
  END
)
WHERE workflow_id IN (SELECT workflow_id FROM workflow_data);

-- ================================
-- 5. Update step metadata for better lead context
-- ================================

-- Add lead-specific outcome types (following deals pattern)
WITH workflow_data AS (
  SELECT w.id as workflow_id
  FROM public.workflows w 
  WHERE w.name = 'Lead Qualification Standard Process'
  LIMIT 1
)
UPDATE public.workflow_steps 
SET metadata = metadata || jsonb_build_object('outcome_type',
  CASE 
    WHEN step_order IN (1, 2, 3, 4, 5, 8) THEN 'OPEN'     -- Active/Open leads
    WHEN step_order = 6 THEN 'CONVERTED'                   -- Successfully converted
    WHEN step_order = 7 THEN 'DISQUALIFIED'               -- Lost/Disqualified
    ELSE 'OPEN'
  END
)
WHERE workflow_id IN (SELECT workflow_id FROM workflow_data);

-- ================================
-- 6. Recreate useful indexes without qualification columns
-- ================================

-- Replace idx_leads_user_qualified_score with just user + score
CREATE INDEX IF NOT EXISTS idx_leads_user_score 
ON public.leads(user_id, lead_score DESC);

-- Replace idx_leads_source_score_qualified with just source + score
CREATE INDEX IF NOT EXISTS idx_leads_source_score 
ON public.leads(source, lead_score DESC) WHERE source IS NOT NULL;

-- Replace idx_leads_user_value_qualified with just user + value
CREATE INDEX IF NOT EXISTS idx_leads_user_value 
ON public.leads(user_id, estimated_value DESC) WHERE estimated_value IS NOT NULL;

-- ================================
-- 7. Update lead history tracking to remove qualification fields
-- ================================

-- Update the track_lead_changes function to remove references to deleted columns
CREATE OR REPLACE FUNCTION track_lead_changes()
RETURNS TRIGGER AS $$
DECLARE
  tracked_fields TEXT[] := ARRAY[
    'name', 'source', 'description', 'contact_name', 'contact_email', 
    'contact_phone', 'company_name', 'estimated_value', 'estimated_close_date',
    'lead_score', 'assigned_to_user_id', 'wfm_project_id', 'custom_field_values'
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

-- Lead qualification moved to WFM metadata pattern following deals architecture 