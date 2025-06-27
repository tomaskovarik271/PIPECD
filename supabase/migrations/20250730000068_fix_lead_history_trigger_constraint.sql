-- 20250730000068_fix_lead_history_trigger_constraint.sql
-- Fix foreign key constraint violation in lead deletion trigger

BEGIN;

-- ================================
-- 1. Fix Lead History Foreign Key Constraint
-- ================================

-- Drop the existing foreign key constraint
ALTER TABLE public.lead_history 
DROP CONSTRAINT IF EXISTS lead_history_lead_id_fkey;

-- Make lead_id column nullable to support history preservation after lead deletion
ALTER TABLE public.lead_history 
ALTER COLUMN lead_id DROP NOT NULL;

-- Recreate the foreign key constraint without CASCADE DELETE
-- This allows history records to persist even after the lead is deleted
-- providing a complete audit trail
ALTER TABLE public.lead_history 
ADD CONSTRAINT lead_history_lead_id_fkey 
FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;

-- ================================
-- 2. Update Lead History Trigger for Better Handling
-- ================================

-- Recreate the trigger function with improved error handling
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
  -- Record deletion history BEFORE the lead is actually deleted
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.lead_history (lead_id, user_id, event_type, field_name, old_value, new_value)
    VALUES (OLD.id, auth.uid(), 'LEAD_DELETED', NULL, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger to ensure it fires BEFORE DELETE
DROP TRIGGER IF EXISTS lead_history_trigger ON public.leads;

-- Create trigger that fires BEFORE DELETE to ensure history is recorded
-- before the foreign key constraint is checked
CREATE TRIGGER lead_history_trigger
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION track_lead_changes();

-- Separate trigger for DELETE that fires BEFORE to avoid constraint issues
CREATE TRIGGER lead_history_delete_trigger
  BEFORE DELETE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION track_lead_changes();

-- ================================
-- 3. Add Comments for Documentation
-- ================================

COMMENT ON CONSTRAINT lead_history_lead_id_fkey ON public.lead_history 
IS 'Foreign key to leads table with SET NULL on delete to preserve audit history';

COMMENT ON TRIGGER lead_history_trigger ON public.leads 
IS 'Tracks lead changes for INSERT and UPDATE operations';

COMMENT ON TRIGGER lead_history_delete_trigger ON public.leads 
IS 'Tracks lead deletion before the lead is removed to avoid foreign key constraint violations';

COMMENT ON COLUMN public.lead_history.lead_id 
IS 'Lead ID reference, nullable to preserve history after lead deletion';

COMMIT; 