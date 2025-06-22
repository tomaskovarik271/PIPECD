-- Migration: Add conversion statuses to both sales and lead workflows
-- This ensures proper workflow management for bi-directional conversions

BEGIN;

DO $$
DECLARE
    v_user_id UUID;
    
    -- Status IDs for the new conversion statuses
    status_converted_to_lead_id UUID;
    status_converted_to_deal_id UUID;
    
    -- Workflow IDs
    workflow_sales_process_id UUID;
    workflow_lead_process_id UUID;
    
    -- New workflow step IDs
    step_converted_to_lead_id UUID;
    step_converted_to_deal_id UUID;
    
    -- Existing step IDs for creating transitions (DEALS)
    step_qualified_lead_id UUID;
    step_opp_scoping_id UUID;
    step_prop_dev_id UUID;
    step_prop_sent_id UUID;
    step_contract_neg_id UUID;
    
    -- Existing step IDs for creating transitions (LEADS)
    step_new_lead_id UUID;
    step_initial_contact_id UUID;
    step_follow_up_id UUID;
    step_qualifying_id UUID;
    step_qualified_lead_lead_id UUID;
    step_nurturing_id UUID;

BEGIN
    -- Try to get the user ID. This might be NULL during migrations.
    BEGIN
        SELECT auth.uid() INTO v_user_id;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    -- Get workflow IDs
    SELECT id INTO workflow_sales_process_id 
    FROM public.workflows 
    WHERE name = 'Standard Sales Process';
    
    SELECT id INTO workflow_lead_process_id 
    FROM public.workflows 
    WHERE name = 'Lead Qualification Standard Process';
    
    IF workflow_sales_process_id IS NULL THEN
        RAISE EXCEPTION 'Standard Sales Process workflow not found';
    END IF;
    
    IF workflow_lead_process_id IS NULL THEN
        RAISE EXCEPTION 'Lead Qualification Standard Process workflow not found';
    END IF;

    -- ================================
    -- PART 1: ADD "CONVERTED TO LEAD" STATUS TO DEALS WORKFLOW
    -- ================================

    -- 1. Create the "Converted to Lead" status
    INSERT INTO public.statuses (name, description, color, created_by_user_id, updated_by_user_id)
    VALUES (
        'Converted to Lead', 
        'Deal has been converted back to a lead for further qualification',
        '#9CA3AF', -- Gray color to indicate converted/inactive state
        v_user_id, 
        v_user_id
    )
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO status_converted_to_lead_id;
    
    -- If status already exists, get its ID
    IF status_converted_to_lead_id IS NULL THEN 
        SELECT id INTO status_converted_to_lead_id 
        FROM public.statuses 
        WHERE name = 'Converted to Lead'; 
    END IF;

    -- 2. Create workflow step for "Converted to Lead" (step order 8, is_final_step = true)
    INSERT INTO public.workflow_steps (
        workflow_id, 
        status_id, 
        step_order, 
        is_initial_step, 
        is_final_step, 
        metadata
    )
    VALUES (
        workflow_sales_process_id, 
        status_converted_to_lead_id, 
        8, -- After Closed Lost (step 7)
        FALSE, 
        TRUE, -- This is a final step - deals won't appear on Kanban
        '{"outcome_type": "CONVERTED", "deal_probability": 0.0, "conversion_type": "deal_to_lead"}'
    )
    ON CONFLICT (workflow_id, step_order) DO NOTHING
    RETURNING id INTO step_converted_to_lead_id;
    
    -- If step already exists, get its ID
    IF step_converted_to_lead_id IS NULL THEN 
        SELECT id INTO step_converted_to_lead_id 
        FROM public.workflow_steps 
        WHERE workflow_id = workflow_sales_process_id AND step_order = 8; 
    END IF;

    -- 3. Get existing step IDs for creating transitions (DEALS)
    SELECT id INTO step_qualified_lead_id 
    FROM public.workflow_steps 
    WHERE workflow_id = workflow_sales_process_id AND step_order = 1;
    
    SELECT id INTO step_opp_scoping_id 
    FROM public.workflow_steps 
    WHERE workflow_id = workflow_sales_process_id AND step_order = 2;
    
    SELECT id INTO step_prop_dev_id 
    FROM public.workflow_steps 
    WHERE workflow_id = workflow_sales_process_id AND step_order = 3;
    
    SELECT id INTO step_prop_sent_id 
    FROM public.workflow_steps 
    WHERE workflow_id = workflow_sales_process_id AND step_order = 4;
    
    SELECT id INTO step_contract_neg_id 
    FROM public.workflow_steps 
    WHERE workflow_id = workflow_sales_process_id AND step_order = 5;

    -- 4. Create transitions from all active steps to "Converted to Lead"
    IF step_converted_to_lead_id IS NOT NULL THEN
        INSERT INTO public.workflow_transitions (workflow_id, from_step_id, to_step_id, name)
        VALUES
            (workflow_sales_process_id, step_qualified_lead_id, step_converted_to_lead_id, 'Convert to Lead'),
            (workflow_sales_process_id, step_opp_scoping_id, step_converted_to_lead_id, 'Convert to Lead'),
            (workflow_sales_process_id, step_prop_dev_id, step_converted_to_lead_id, 'Convert to Lead'),
            (workflow_sales_process_id, step_prop_sent_id, step_converted_to_lead_id, 'Convert to Lead'),
            (workflow_sales_process_id, step_contract_neg_id, step_converted_to_lead_id, 'Convert to Lead')
        ON CONFLICT (workflow_id, from_step_id, to_step_id) DO NOTHING;
    END IF;

    -- ================================
    -- PART 2: ADD "CONVERTED TO DEAL" STATUS TO LEADS WORKFLOW
    -- ================================

    -- 5. Create the "Converted to Deal" status
    INSERT INTO public.statuses (name, description, color, created_by_user_id, updated_by_user_id)
    VALUES (
        'Converted to Deal', 
        'Lead has been converted to a deal in the sales pipeline',
        '#10B981', -- Green color to indicate successful conversion
        v_user_id, 
        v_user_id
    )
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO status_converted_to_deal_id;
    
    -- If status already exists, get its ID
    IF status_converted_to_deal_id IS NULL THEN 
        SELECT id INTO status_converted_to_deal_id 
        FROM public.statuses 
        WHERE name = 'Converted to Deal'; 
    END IF;

    -- 6. Create workflow step for "Converted to Deal" (step order 9, is_final_step = true)
    INSERT INTO public.workflow_steps (
        workflow_id, 
        status_id, 
        step_order, 
        is_initial_step, 
        is_final_step, 
        metadata
    )
    VALUES (
        workflow_lead_process_id, 
        status_converted_to_deal_id, 
        9, -- After Nurturing (step 8)
        FALSE, 
        TRUE, -- This is a final step - leads won't appear on Kanban
        '{"stage_name": "Converted to Deal", "is_qualified": 1, "outcome_type": "CONVERTED", "conversion_type": "lead_to_deal", "lead_qualification_level": 1.0, "lead_score_threshold": 80}'
    )
    ON CONFLICT (workflow_id, step_order) DO NOTHING
    RETURNING id INTO step_converted_to_deal_id;
    
    -- If step already exists, get its ID
    IF step_converted_to_deal_id IS NULL THEN 
        SELECT id INTO step_converted_to_deal_id 
        FROM public.workflow_steps 
        WHERE workflow_id = workflow_lead_process_id AND step_order = 9; 
    END IF;

    -- 7. Get existing step IDs for creating transitions (LEADS)
    SELECT id INTO step_new_lead_id 
    FROM public.workflow_steps 
    WHERE workflow_id = workflow_lead_process_id AND step_order = 1;
    
    SELECT id INTO step_initial_contact_id 
    FROM public.workflow_steps 
    WHERE workflow_id = workflow_lead_process_id AND step_order = 2;
    
    SELECT id INTO step_follow_up_id 
    FROM public.workflow_steps 
    WHERE workflow_id = workflow_lead_process_id AND step_order = 3;
    
    SELECT id INTO step_qualifying_id 
    FROM public.workflow_steps 
    WHERE workflow_id = workflow_lead_process_id AND step_order = 4;
    
    SELECT id INTO step_qualified_lead_lead_id 
    FROM public.workflow_steps 
    WHERE workflow_id = workflow_lead_process_id AND step_order = 5;
    
    SELECT id INTO step_nurturing_id 
    FROM public.workflow_steps 
    WHERE workflow_id = workflow_lead_process_id AND step_order = 8;

    -- 8. Create transitions from active lead steps to "Converted to Deal"
    IF step_converted_to_deal_id IS NOT NULL THEN
        INSERT INTO public.workflow_transitions (workflow_id, from_step_id, to_step_id, name)
        VALUES
            (workflow_lead_process_id, step_qualifying_id, step_converted_to_deal_id, 'Convert to Deal'),
            (workflow_lead_process_id, step_qualified_lead_lead_id, step_converted_to_deal_id, 'Convert to Deal'),
            (workflow_lead_process_id, step_nurturing_id, step_converted_to_deal_id, 'Convert to Deal')
        ON CONFLICT (workflow_id, from_step_id, to_step_id) DO NOTHING;
    END IF;

    RAISE NOTICE 'Successfully added conversion statuses to both Sales and Lead workflows';

END $$;

COMMIT; 