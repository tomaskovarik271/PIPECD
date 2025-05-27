-- Migration: Setup Sales WFM Definitions (Statuses, Workflow, Steps, Transitions, Project Type)

BEGIN;

DO $$
DECLARE
    -- Attempt to get auth.uid(). If in a context where it's null (like some migration scenarios),
    -- user_id columns will be NULL if they are nullable.
    -- The WFM definition tables (statuses, workflows, project_types) have created_by_user_id/updated_by_user_id
    -- as nullable FKs to auth.users, so this is acceptable.
    v_user_id UUID;

    -- Status IDs
    status_qualified_lead_id UUID;
    status_opp_scoping_id UUID;
    status_prop_dev_id UUID;
    status_prop_sent_id UUID;
    status_contract_neg_id UUID;
    status_closed_won_id UUID;
    status_closed_lost_id UUID;

    -- Workflow ID
    workflow_sales_process_id UUID;

    -- Workflow Step IDs
    step_qualified_lead_id UUID;
    step_opp_scoping_id UUID;
    step_prop_dev_id UUID;
    step_prop_sent_id UUID;
    step_contract_neg_id UUID;
    step_closed_won_id UUID;
    step_closed_lost_id UUID;

BEGIN
    -- Try to get the user ID. This might be NULL during migrations.
    BEGIN
        SELECT auth.uid() INTO v_user_id;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    -- 1. Create WFMStatus records
    INSERT INTO public.statuses (name, color, created_by_user_id, updated_by_user_id)
    VALUES ('Qualified Lead', '#A0D2DB', v_user_id, v_user_id)
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO status_qualified_lead_id;
    IF status_qualified_lead_id IS NULL THEN SELECT id INTO status_qualified_lead_id FROM public.statuses WHERE name = 'Qualified Lead'; END IF;

    INSERT INTO public.statuses (name, color, created_by_user_id, updated_by_user_id)
    VALUES ('Opportunity Scoping', '#74A4BC', v_user_id, v_user_id)
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO status_opp_scoping_id;
    IF status_opp_scoping_id IS NULL THEN SELECT id INTO status_opp_scoping_id FROM public.statuses WHERE name = 'Opportunity Scoping'; END IF;

    INSERT INTO public.statuses (name, color, created_by_user_id, updated_by_user_id)
    VALUES ('Proposal Development', '#B28DFF', v_user_id, v_user_id)
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO status_prop_dev_id;
    IF status_prop_dev_id IS NULL THEN SELECT id INTO status_prop_dev_id FROM public.statuses WHERE name = 'Proposal Development'; END IF;

    INSERT INTO public.statuses (name, color, created_by_user_id, updated_by_user_id)
    VALUES ('Proposal Sent', '#FFD166', v_user_id, v_user_id)
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO status_prop_sent_id;
    IF status_prop_sent_id IS NULL THEN SELECT id INTO status_prop_sent_id FROM public.statuses WHERE name = 'Proposal Sent'; END IF;

    INSERT INTO public.statuses (name, color, created_by_user_id, updated_by_user_id)
    VALUES ('Contract Negotiation', '#FF8C42', v_user_id, v_user_id)
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO status_contract_neg_id;
    IF status_contract_neg_id IS NULL THEN SELECT id INTO status_contract_neg_id FROM public.statuses WHERE name = 'Contract Negotiation'; END IF;

    INSERT INTO public.statuses (name, color, created_by_user_id, updated_by_user_id)
    VALUES ('Closed Won', '#52C41A', v_user_id, v_user_id)
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO status_closed_won_id;
    IF status_closed_won_id IS NULL THEN SELECT id INTO status_closed_won_id FROM public.statuses WHERE name = 'Closed Won'; END IF;

    INSERT INTO public.statuses (name, color, created_by_user_id, updated_by_user_id)
    VALUES ('Closed Lost', '#FF4D4F', v_user_id, v_user_id)
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO status_closed_lost_id;
    IF status_closed_lost_id IS NULL THEN SELECT id INTO status_closed_lost_id FROM public.statuses WHERE name = 'Closed Lost'; END IF;

    -- 2. Create WFMWorkflow record
    INSERT INTO public.workflows (name, description, created_by_user_id, updated_by_user_id)
    VALUES ('Standard Sales Process', 'Main sales pipeline for tracking deals', v_user_id, v_user_id)
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO workflow_sales_process_id;
    IF workflow_sales_process_id IS NULL THEN SELECT id INTO workflow_sales_process_id FROM public.workflows WHERE name = 'Standard Sales Process'; END IF;

    -- 3. Create WFMWorkflowStep records
    IF workflow_sales_process_id IS NOT NULL AND status_qualified_lead_id IS NOT NULL THEN
        INSERT INTO public.workflow_steps (workflow_id, status_id, step_order, is_initial_step, is_final_step, metadata)
        VALUES (workflow_sales_process_id, status_qualified_lead_id, 1, TRUE, FALSE, '{"deal_probability": 0.10, "outcome_type": "OPEN"}')
        ON CONFLICT (workflow_id, step_order) DO NOTHING
        RETURNING id INTO step_qualified_lead_id;
        IF step_qualified_lead_id IS NULL THEN SELECT id INTO step_qualified_lead_id FROM public.workflow_steps WHERE workflow_id = workflow_sales_process_id AND step_order = 1; END IF;
    END IF;

    IF workflow_sales_process_id IS NOT NULL AND status_opp_scoping_id IS NOT NULL THEN
        INSERT INTO public.workflow_steps (workflow_id, status_id, step_order, is_initial_step, is_final_step, metadata)
        VALUES (workflow_sales_process_id, status_opp_scoping_id, 2, FALSE, FALSE, '{"deal_probability": 0.25, "outcome_type": "OPEN"}')
        ON CONFLICT (workflow_id, step_order) DO NOTHING
        RETURNING id INTO step_opp_scoping_id;
        IF step_opp_scoping_id IS NULL THEN SELECT id INTO step_opp_scoping_id FROM public.workflow_steps WHERE workflow_id = workflow_sales_process_id AND step_order = 2; END IF;
    END IF;

    IF workflow_sales_process_id IS NOT NULL AND status_prop_dev_id IS NOT NULL THEN
        INSERT INTO public.workflow_steps (workflow_id, status_id, step_order, is_initial_step, is_final_step, metadata)
        VALUES (workflow_sales_process_id, status_prop_dev_id, 3, FALSE, FALSE, '{"deal_probability": 0.50, "outcome_type": "OPEN"}')
        ON CONFLICT (workflow_id, step_order) DO NOTHING
        RETURNING id INTO step_prop_dev_id;
        IF step_prop_dev_id IS NULL THEN SELECT id INTO step_prop_dev_id FROM public.workflow_steps WHERE workflow_id = workflow_sales_process_id AND step_order = 3; END IF;
    END IF;

    IF workflow_sales_process_id IS NOT NULL AND status_prop_sent_id IS NOT NULL THEN
        INSERT INTO public.workflow_steps (workflow_id, status_id, step_order, is_initial_step, is_final_step, metadata)
        VALUES (workflow_sales_process_id, status_prop_sent_id, 4, FALSE, FALSE, '{"deal_probability": 0.75, "outcome_type": "OPEN"}')
        ON CONFLICT (workflow_id, step_order) DO NOTHING
        RETURNING id INTO step_prop_sent_id;
        IF step_prop_sent_id IS NULL THEN SELECT id INTO step_prop_sent_id FROM public.workflow_steps WHERE workflow_id = workflow_sales_process_id AND step_order = 4; END IF;
    END IF;

    IF workflow_sales_process_id IS NOT NULL AND status_contract_neg_id IS NOT NULL THEN
        INSERT INTO public.workflow_steps (workflow_id, status_id, step_order, is_initial_step, is_final_step, metadata)
        VALUES (workflow_sales_process_id, status_contract_neg_id, 5, FALSE, FALSE, '{"deal_probability": 0.90, "outcome_type": "OPEN"}')
        ON CONFLICT (workflow_id, step_order) DO NOTHING
        RETURNING id INTO step_contract_neg_id;
        IF step_contract_neg_id IS NULL THEN SELECT id INTO step_contract_neg_id FROM public.workflow_steps WHERE workflow_id = workflow_sales_process_id AND step_order = 5; END IF;
    END IF;

    IF workflow_sales_process_id IS NOT NULL AND status_closed_won_id IS NOT NULL THEN
        INSERT INTO public.workflow_steps (workflow_id, status_id, step_order, is_initial_step, is_final_step, metadata)
        VALUES (workflow_sales_process_id, status_closed_won_id, 6, FALSE, TRUE, '{"deal_probability": 1.0, "outcome_type": "WON"}')
        ON CONFLICT (workflow_id, step_order) DO NOTHING
        RETURNING id INTO step_closed_won_id;
        IF step_closed_won_id IS NULL THEN SELECT id INTO step_closed_won_id FROM public.workflow_steps WHERE workflow_id = workflow_sales_process_id AND step_order = 6; END IF;
    END IF;

    IF workflow_sales_process_id IS NOT NULL AND status_closed_lost_id IS NOT NULL THEN
        INSERT INTO public.workflow_steps (workflow_id, status_id, step_order, is_initial_step, is_final_step, metadata)
        VALUES (workflow_sales_process_id, status_closed_lost_id, 7, FALSE, TRUE, '{"deal_probability": 0.0, "outcome_type": "LOST"}')
        ON CONFLICT (workflow_id, step_order) DO NOTHING
        RETURNING id INTO step_closed_lost_id;
        IF step_closed_lost_id IS NULL THEN SELECT id INTO step_closed_lost_id FROM public.workflow_steps WHERE workflow_id = workflow_sales_process_id AND step_order = 7; END IF;
    END IF;

    -- 4. Create WFMWorkflowTransition records
    IF  workflow_sales_process_id IS NOT NULL AND
        step_qualified_lead_id IS NOT NULL AND step_opp_scoping_id IS NOT NULL AND
        step_prop_dev_id IS NOT NULL AND step_prop_sent_id IS NOT NULL AND
        step_contract_neg_id IS NOT NULL AND step_closed_won_id IS NOT NULL AND
        step_closed_lost_id IS NOT NULL
    THEN
        INSERT INTO public.workflow_transitions (workflow_id, from_step_id, to_step_id, name)
        VALUES
            (workflow_sales_process_id, step_qualified_lead_id, step_opp_scoping_id, 'Scope Opportunity'),
            (workflow_sales_process_id, step_opp_scoping_id, step_prop_dev_id, 'Start Proposal'),
            (workflow_sales_process_id, step_prop_dev_id, step_prop_sent_id, 'Send Proposal'),
            (workflow_sales_process_id, step_prop_sent_id, step_contract_neg_id, 'Begin Negotiation'),
            (workflow_sales_process_id, step_contract_neg_id, step_closed_won_id, 'Deal Won'),
            (workflow_sales_process_id, step_qualified_lead_id, step_closed_lost_id, 'Lost Early'),
            (workflow_sales_process_id, step_opp_scoping_id, step_closed_lost_id, 'Lost at Scoping'),
            (workflow_sales_process_id, step_prop_dev_id, step_closed_lost_id, 'Lost at Proposal Dev'),
            (workflow_sales_process_id, step_prop_sent_id, step_closed_lost_id, 'Lost After Proposal'),
            (workflow_sales_process_id, step_contract_neg_id, step_closed_lost_id, 'Lost at Negotiation')
        ON CONFLICT (workflow_id, from_step_id, to_step_id) DO NOTHING;
    END IF;

    -- 5. Create WFMProjectType record
    IF workflow_sales_process_id IS NOT NULL THEN
        INSERT INTO public.project_types (name, description, default_workflow_id, created_by_user_id, updated_by_user_id, icon_name)
        VALUES ('Sales Deal', 'Represents a sales opportunity managed via the standard sales process', workflow_sales_process_id, v_user_id, v_user_id, 'briefcase')
        ON CONFLICT (name) DO NOTHING;
    END IF;

    RAISE NOTICE 'WFM Sales Process definitions setup script completed.';
END $$;

COMMIT;