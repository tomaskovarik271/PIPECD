-- Migration: Fix workflow_id ambiguity in create_lead_wfm_project function
-- The function has ambiguous references to workflow_id (both column and variable)

-- Drop and recreate the function with proper variable qualification
DROP FUNCTION IF EXISTS create_lead_wfm_project(UUID, TEXT);

CREATE OR REPLACE FUNCTION create_lead_wfm_project(lead_uuid UUID, project_name TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_id UUID;
  project_type_id UUID;
  v_workflow_id UUID;  -- Renamed to avoid ambiguity
  initial_step_id UUID;
  v_project_name TEXT;
BEGIN
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
  
  -- Generate project name if not provided
  v_project_name := COALESCE(
    project_name,
    'Lead Qualification: ' || (
      SELECT COALESCE(l.contact_name, l.contact_email, 'Unknown Lead')
      FROM public.leads l WHERE l.id = lead_uuid
    )
  );
  
  -- Create the WFM project
  INSERT INTO public.wfm_projects (
    id,
    name,
    description,
    project_type_id,
    workflow_id,
    current_step_id,
    entity_type,
    entity_id,
    created_by_user_id,
    updated_by_user_id
  ) VALUES (
    gen_random_uuid(),
    v_project_name,
    'WFM project for lead qualification and conversion tracking',
    project_type_id,
    v_workflow_id,
    initial_step_id,
    'LEAD',
    lead_uuid,
    auth.uid(),
    auth.uid()
  )
  RETURNING id INTO project_id;
  
  RETURN project_id;
END;
$$; 