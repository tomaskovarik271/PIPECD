-- 20250730000009_setup_lead_qualification_wfm.sql
-- PipeCD Leads Management: WFM Integration Setup
-- Lead Qualification and Conversion Workflow Configuration

-- ================================
-- 1. Create Lead Project Type
-- ================================

-- Insert Lead Qualification Project Type
-- Following exact pattern from deals project type
INSERT INTO public.project_types (
  name, 
  description, 
  icon_name,
  created_by_user_id,
  updated_by_user_id
) VALUES (
  'Lead Qualification and Conversion Process',
  'Manages lead qualification workflow from initial contact through to conversion into deals, people, or organizations. Tracks lead scoring, qualification status, and conversion progress.',
  'user-check',
  auth.uid(),
  auth.uid()
) ON CONFLICT (name) DO NOTHING;

-- ================================
-- 2. Create Lead Qualification Workflow
-- ================================

-- Insert Lead Qualification Workflow
INSERT INTO public.workflows (
  name,
  description,
  created_by_user_id,
  updated_by_user_id
) VALUES (
  'Lead Qualification Standard Process',
  'Standard lead qualification workflow: New Lead → Initial Contact → Qualified → Converted/Disqualified',
  auth.uid(),
  auth.uid()
) ON CONFLICT (name) DO NOTHING;

-- Update project type to reference the workflow
UPDATE public.project_types 
SET default_workflow_id = (
  SELECT id FROM public.workflows 
  WHERE name = 'Lead Qualification Standard Process'
)
WHERE name = 'Lead Qualification and Conversion Process';

-- ================================
-- 3. Create Workflow Statuses for Leads
-- ================================

-- Insert Lead-Specific Workflow Statuses
INSERT INTO public.statuses (
  name,
  description,
  color,
  created_by_user_id,
  updated_by_user_id
) VALUES 
  ('New Lead', 'Newly created lead requiring initial assessment', '#3B82F6', auth.uid(), auth.uid()),
  ('Initial Contact', 'First contact made with lead', '#F59E0B', auth.uid(), auth.uid()),
  ('Contacted - Follow Up', 'Lead contacted, awaiting response or follow-up', '#EF4444', auth.uid(), auth.uid()),
  ('Qualifying', 'Lead is being qualified for fit and interest', '#8B5CF6', auth.uid(), auth.uid()),
  ('Qualified Lead', 'Lead meets qualification criteria and is ready for conversion', '#10B981', auth.uid(), auth.uid()),
  ('Converted', 'Lead successfully converted to deal/person/organization', '#059669', auth.uid(), auth.uid()),
  ('Disqualified', 'Lead does not meet qualification criteria', '#6B7280', auth.uid(), auth.uid()),
  ('Nurturing', 'Lead not ready for conversion but being nurtured', '#F97316', auth.uid(), auth.uid())
ON CONFLICT (name) DO NOTHING;

-- ================================
-- 4. Create Workflow Steps
-- ================================

-- Insert Lead Qualification Workflow Steps
WITH workflow_data AS (
  SELECT w.id as workflow_id
  FROM public.workflows w 
  WHERE w.name = 'Lead Qualification Standard Process'
  LIMIT 1
)
INSERT INTO public.workflow_steps (
  workflow_id,
  status_id,
  step_order,
  is_initial_step,
  is_final_step,
  metadata
)
SELECT 
  wd.workflow_id,
  ws.id,
  step_data.step_order,
  step_data.is_initial,
  step_data.is_final,
  step_data.step_metadata::jsonb
FROM workflow_data wd
CROSS JOIN (VALUES
  -- Step 1: New Lead (Initial)
  (1, TRUE, FALSE, 
   '{"lead_score_threshold": 0, "auto_assign": true, "stage_name": "New Lead", "required_actions": ["initial_assessment"], "automation_triggers": ["score_calculation", "source_attribution"]}'),
   
  -- Step 2: Initial Contact
  (2, FALSE, FALSE, 
   '{"lead_score_threshold": 20, "required_fields": ["contact_email"], "stage_name": "Initial Contact", "required_actions": ["first_contact"], "automation_triggers": ["contact_activity", "response_tracking"]}'),
   
  -- Step 3: Follow Up
  (3, FALSE, FALSE,
   '{"lead_score_threshold": 30, "stage_name": "Follow Up", "required_actions": ["follow_up_sequence"], "automation_triggers": ["nurture_sequence", "engagement_tracking"]}'),
   
  -- Step 4: Qualifying
  (4, FALSE, FALSE,
   '{"lead_score_threshold": 50, "qualification_required": true, "stage_name": "Qualifying", "required_actions": ["qualification_assessment"], "automation_triggers": ["ai_qualification", "score_update"]}'),
   
  -- Step 5: Qualified (Conversion Ready)
  (5, FALSE, FALSE,
   '{"lead_score_threshold": 70, "conversion_eligible": true, "stage_name": "Qualified Lead", "required_actions": ["conversion_planning"], "automation_triggers": ["conversion_recommendation"]}'),
   
  -- Step 6: Converted (Final - Success)
  (6, FALSE, TRUE,
   '{"lead_score_threshold": 75, "outcome_type": "WON", "stage_name": "Converted", "required_actions": ["conversion_completion"], "automation_triggers": ["conversion_tracking", "success_metrics"]}'),
   
  -- Step 7: Disqualified (Final - Lost)
  (7, FALSE, TRUE,
   '{"lead_score_threshold": 0, "outcome_type": "LOST", "stage_name": "Disqualified", "required_actions": ["disqualification_reason"], "automation_triggers": ["loss_analysis"]}'),
   
  -- Step 8: Nurturing (Parallel Track)
  (8, FALSE, FALSE,
   '{"lead_score_threshold": 25, "nurturing_active": true, "stage_name": "Nurturing", "required_actions": ["nurture_planning"], "automation_triggers": ["nurture_campaigns", "re_engagement"]}')
) AS step_data(step_order, is_initial, is_final, step_metadata)
JOIN public.statuses ws ON ws.name = (
  CASE step_data.step_order
    WHEN 1 THEN 'New Lead'
    WHEN 2 THEN 'Initial Contact' 
    WHEN 3 THEN 'Contacted - Follow Up'
    WHEN 4 THEN 'Qualifying'
    WHEN 5 THEN 'Qualified Lead'
    WHEN 6 THEN 'Converted'
    WHEN 7 THEN 'Disqualified'
    WHEN 8 THEN 'Nurturing'
  END
)
WHERE NOT EXISTS (
  SELECT 1 FROM public.workflow_steps wfs
  WHERE wfs.workflow_id = wd.workflow_id AND wfs.step_order = step_data.step_order
);

-- ================================
-- 5. Create Workflow Transitions
-- ================================

-- Insert allowed transitions between workflow steps
WITH workflow_data AS (
  SELECT w.id as workflow_id
  FROM public.workflows w 
  WHERE w.name = 'Lead Qualification Standard Process'
  LIMIT 1
)
INSERT INTO public.workflow_transitions (
  workflow_id,
  from_step_id,
  to_step_id,
  name
)
SELECT 
  wd.workflow_id,
  from_step.id,
  to_step.id,
  transition_data.transition_name
FROM workflow_data wd
CROSS JOIN (VALUES
  -- Forward progression paths
  (1, 2, 'Make Initial Contact'),
  (2, 3, 'Schedule Follow Up'),
  (3, 4, 'Begin Qualification'),
  (4, 5, 'Mark as Qualified'),
  (5, 6, 'Convert Lead'),
  
  -- Alternative paths from qualification
  (4, 8, 'Move to Nurturing'),
  (8, 4, 'Return to Qualification'),
  (8, 5, 'Promote to Qualified'),
  
  -- Disqualification paths (from any step)
  (1, 7, 'Disqualify Early'),
  (2, 7, 'Disqualify After Contact'),
  (3, 7, 'Disqualify After Follow Up'),
  (4, 7, 'Disqualify After Assessment'),
  (5, 7, 'Disqualify Qualified Lead'),
  (8, 7, 'Disqualify from Nurturing'),
  
  -- Re-engagement paths
  (7, 8, 'Move to Nurturing'),
  (6, 8, 'Post-Conversion Nurturing')
) AS transition_data(from_order, to_order, transition_name)
JOIN public.workflow_steps from_step ON (
  from_step.workflow_id = wd.workflow_id 
  AND from_step.step_order = transition_data.from_order
)
JOIN public.workflow_steps to_step ON (
  to_step.workflow_id = wd.workflow_id 
  AND to_step.step_order = transition_data.to_order
)
WHERE NOT EXISTS (
  SELECT 1 FROM public.workflow_transitions wft
  WHERE wft.workflow_id = wd.workflow_id 
    AND wft.from_step_id = from_step.id 
    AND wft.to_step_id = to_step.id
);

-- ================================
-- 6. WFM Project Functions
-- ================================

-- Function to create a WFM project for a lead
-- This links the lead to the workflow management system
CREATE OR REPLACE FUNCTION create_lead_wfm_project(lead_uuid UUID, project_name TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_id UUID;
  project_type_id UUID;
  workflow_id UUID;
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
  SELECT pt.default_workflow_id INTO workflow_id
  FROM public.project_types pt 
  WHERE pt.id = project_type_id;
  
  SELECT ws.id INTO initial_step_id
  FROM public.workflow_steps ws
  WHERE ws.workflow_id = workflow_id AND ws.is_initial_step = TRUE
  LIMIT 1;
  
  IF initial_step_id IS NULL THEN
    RAISE EXCEPTION 'No initial step found for lead qualification workflow';
  END IF;
  
  -- Generate project name if not provided
  v_project_name := COALESCE(
    project_name,
    'Lead Qualification: ' || (
      SELECT COALESCE(l.name, l.contact_name, l.contact_email, 'Unknown Lead')
      FROM public.leads l WHERE l.id = lead_uuid
    )
  );
  
  -- Create the WFM project
  INSERT INTO public.wfm_projects (
    id,
    name,
    description,
    project_type_id,
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

-- Function to update lead workflow step
CREATE OR REPLACE FUNCTION update_lead_workflow_step(lead_uuid UUID, target_step_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_id UUID;
  current_step_id UUID;
  transition_allowed BOOLEAN := FALSE;
BEGIN
  -- Get the lead's WFM project
  SELECT wp.id, wp.current_step_id 
  INTO project_id, current_step_id
  FROM public.wfm_projects wp
  WHERE wp.entity_type = 'LEAD' AND wp.entity_id = lead_uuid;
  
  IF project_id IS NULL THEN
    RAISE EXCEPTION 'No WFM project found for lead %', lead_uuid;
  END IF;
  
  -- Check if transition is allowed
  SELECT EXISTS(
    SELECT 1 FROM public.workflow_transitions wt
    WHERE wt.from_step_id = current_step_id AND wt.to_step_id = target_step_id
  ) INTO transition_allowed;
  
  IF NOT transition_allowed THEN
    RAISE EXCEPTION 'Transition from current step to target step is not allowed';
  END IF;
  
  -- Update the project step
  UPDATE public.wfm_projects 
  SET current_step_id = target_step_id,
      updated_by_user_id = auth.uid(),
      updated_at = NOW()
  WHERE id = project_id;
  
  RETURN TRUE;
END;
$$;

-- ================================
-- 7. Auto-Create WFM Project Trigger
-- ================================

-- Function to automatically create WFM project when lead is inserted
CREATE OR REPLACE FUNCTION auto_create_lead_wfm_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM create_lead_wfm_project(NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger to auto-create WFM project for new leads
CREATE TRIGGER auto_create_lead_wfm_project_trigger
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_lead_wfm_project();

-- ================================
-- End of Migration
-- ================================ 