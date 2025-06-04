-- Migration: Fix lead WFM data consistency
-- This addresses the issue where leads may be linked to wrong project types or have inconsistent names

-- First, let's check and fix any leads that are linked to Deal project types instead of Lead project types
DO $$
DECLARE
  lead_record RECORD;
  lead_project_type_id UUID;
  lead_workflow_id UUID;
  initial_step_id UUID;
  new_project_id UUID;
  fixed_count INTEGER := 0;
BEGIN
  -- Get the correct Lead project type ID
  SELECT id INTO lead_project_type_id 
  FROM public.project_types 
  WHERE name = 'Lead Qualification and Conversion Process';
  
  IF lead_project_type_id IS NULL THEN
    RAISE EXCEPTION 'Lead project type not found. Cannot fix data consistency.';
  END IF;
  
  -- Get the lead workflow ID
  SELECT pt.default_workflow_id INTO lead_workflow_id
  FROM public.project_types pt 
  WHERE pt.id = lead_project_type_id;
  
  -- Get the initial step
  SELECT ws.id INTO initial_step_id
  FROM public.workflow_steps ws
  WHERE ws.workflow_id = lead_workflow_id AND ws.is_initial_step = TRUE
  LIMIT 1;
  
  -- Loop through all leads to check their WFM project associations
  FOR lead_record IN 
    SELECT l.id, l.name, l.wfm_project_id, l.user_id,
           wp.name as project_name, 
           pt.name as project_type_name,
           pt.id as project_type_id
    FROM public.leads l 
    LEFT JOIN public.wfm_projects wp ON l.wfm_project_id = wp.id
    LEFT JOIN public.project_types pt ON wp.project_type_id = pt.id
  LOOP
    -- Case 1: Lead has no WFM project
    IF lead_record.wfm_project_id IS NULL THEN
      -- Create a new Lead project
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
        'Lead Qualification: ' || COALESCE(lead_record.name, 'Unknown Lead'),
        'WFM project for lead qualification and conversion tracking',
        lead_project_type_id,
        lead_workflow_id,
        initial_step_id,
        lead_record.user_id,
        lead_record.user_id
      )
      RETURNING id INTO new_project_id;
      
      -- Link the lead to the new project
      UPDATE public.leads 
      SET wfm_project_id = new_project_id
      WHERE id = lead_record.id;
      
      fixed_count := fixed_count + 1;
      RAISE NOTICE 'Created new Lead project for lead: % (ID: %)', lead_record.name, lead_record.id;
      
    -- Case 2: Lead is linked to wrong project type (e.g., Deal project)
    ELSIF lead_record.project_type_id != lead_project_type_id THEN
      -- Create a new Lead project
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
        'Lead Qualification: ' || COALESCE(lead_record.name, 'Unknown Lead'),
        'WFM project for lead qualification and conversion tracking',
        lead_project_type_id,
        lead_workflow_id,
        initial_step_id,
        lead_record.user_id,
        lead_record.user_id
      )
      RETURNING id INTO new_project_id;
      
      -- Link the lead to the correct project
      UPDATE public.leads 
      SET wfm_project_id = new_project_id
      WHERE id = lead_record.id;
      
      fixed_count := fixed_count + 1;
      RAISE NOTICE 'Fixed project type for lead: % (was linked to % project, now linked to Lead project)', 
                   lead_record.name, lead_record.project_type_name;
                   
    -- Case 3: Lead has correct project type but wrong name
    ELSIF lead_record.project_name LIKE '%Unknown Lead%' AND lead_record.name IS NOT NULL THEN
      -- Update the project name to match the lead name
      UPDATE public.wfm_projects 
      SET name = 'Lead Qualification: ' || lead_record.name
      WHERE id = lead_record.wfm_project_id;
      
      fixed_count := fixed_count + 1;
      RAISE NOTICE 'Updated project name for lead: % (project name now matches lead name)', lead_record.name;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Successfully fixed % lead WFM project associations', fixed_count;
END;
$$;

-- Clean up any orphaned WFM projects that are not linked to any entity
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.wfm_projects 
  WHERE id NOT IN (
    SELECT wfm_project_id FROM public.leads WHERE wfm_project_id IS NOT NULL
    UNION
    SELECT wfm_project_id FROM public.deals WHERE wfm_project_id IS NOT NULL
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Cleaned up % orphaned WFM projects', deleted_count;
END;
$$; 