-- Migration: Fix existing leads without WFM projects
-- This migration will create WFM projects for any existing leads that don't have them

-- Function to fix a single lead's WFM project
CREATE OR REPLACE FUNCTION fix_lead_wfm_project(lead_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_id UUID;
  project_type_id UUID;
  v_workflow_id UUID;
  initial_step_id UUID;
  v_project_name TEXT;
  existing_project_id UUID;
BEGIN
  -- Check if lead already has a WFM project
  SELECT wfm_project_id INTO existing_project_id
  FROM public.leads 
  WHERE id = lead_uuid;
  
  IF existing_project_id IS NOT NULL THEN
    RETURN existing_project_id; -- Already has a project
  END IF;
  
  -- Get the Lead project type ID
  SELECT id INTO project_type_id 
  FROM public.project_types 
  WHERE name = 'Lead Qualification and Conversion Process';
  
  IF project_type_id IS NULL THEN
    RAISE EXCEPTION 'Lead project type not found. Ensure WFM definitions are properly set up.';
  END IF;
  
  -- Get the workflow and initial step
  SELECT pt.default_workflow_id INTO v_workflow_id
  FROM public.project_types pt 
  WHERE pt.id = project_type_id;
  
  SELECT ws.id INTO initial_step_id
  FROM public.workflow_steps ws
  WHERE ws.workflow_id = v_workflow_id AND ws.is_initial_step = TRUE
  LIMIT 1;
  
  IF initial_step_id IS NULL THEN
    RAISE EXCEPTION 'No initial step found for lead qualification workflow';
  END IF;
  
  -- Generate project name
  SELECT 'Lead Qualification: ' || COALESCE(l.name, l.contact_name, l.contact_email, 'Unknown Lead')
  INTO v_project_name
  FROM public.leads l 
  WHERE l.id = lead_uuid;
  
  -- Create the WFM project
  INSERT INTO public.wfm_projects (
    id,
    name,
    description,
    project_type_id,
    workflow_id,
    current_step_id,
    created_by_user_id,
    updated_by_user_id
  ) VALUES (
    gen_random_uuid(),
    v_project_name,
    'WFM project for lead qualification and conversion tracking (retroactively created)',
    project_type_id,
    v_workflow_id,
    initial_step_id,
    (SELECT user_id FROM public.leads WHERE id = lead_uuid),
    (SELECT user_id FROM public.leads WHERE id = lead_uuid)
  )
  RETURNING id INTO project_id;
  
  -- Update the lead with the WFM project ID
  UPDATE public.leads 
  SET wfm_project_id = project_id
  WHERE id = lead_uuid;
  
  RETURN project_id;
END;
$$;

-- Fix all existing leads that don't have WFM projects
DO $$
DECLARE
  lead_record RECORD;
  fixed_count INTEGER := 0;
BEGIN
  -- Loop through all leads without WFM projects
  FOR lead_record IN 
    SELECT id, name FROM public.leads 
    WHERE wfm_project_id IS NULL
  LOOP
    BEGIN
      PERFORM fix_lead_wfm_project(lead_record.id);
      fixed_count := fixed_count + 1;
      RAISE NOTICE 'Fixed WFM project for lead: % (ID: %)', lead_record.name, lead_record.id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to fix WFM project for lead % (ID: %): %', lead_record.name, lead_record.id, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Successfully fixed WFM projects for % leads', fixed_count;
END;
$$;

-- Drop the helper function after use
DROP FUNCTION IF EXISTS fix_lead_wfm_project(UUID); 