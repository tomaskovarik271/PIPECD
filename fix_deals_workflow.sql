-- Quick fix to assign workflow steps to existing BNP Paribas deals
-- This will make them appear in the kanban view

DO $$
DECLARE
    sales_project_type_id UUID;
    current_step_id UUID;
    current_wfm_project_id UUID;
    deal_record RECORD;
    step_counter INTEGER := 1;
BEGIN
    -- Get Sales Deal project type
    SELECT id INTO sales_project_type_id 
    FROM project_types 
    WHERE name = 'Sales Deal' 
    LIMIT 1;
    
    IF sales_project_type_id IS NULL THEN
        RAISE NOTICE 'Sales Deal project type not found.';
        RETURN;
    END IF;
    
    -- Assign workflow steps to each BNP Paribas deal
    FOR deal_record IN 
        SELECT id, name FROM deals 
        WHERE name IN (
            'KLIM Agricultural Sustainability Platform',
            'Digital Transformation Initiative - Poland', 
            'Innovation Lab Technology Stack',
            'Sustainable Finance Product Suite',
            'Fleet Electrification Program'
        )
        AND wfm_project_id IS NULL
    LOOP
        -- Get a workflow step (cycling through available steps)
        SELECT ws.id INTO current_step_id
        FROM workflow_steps ws 
        INNER JOIN workflows w ON w.id = ws.workflow_id
        INNER JOIN project_types pt ON pt.default_workflow_id = w.id
        WHERE pt.name = 'Sales Deal'
        ORDER BY ws.step_order
        OFFSET (step_counter - 1) % (
            SELECT COUNT(*) 
            FROM workflow_steps ws2 
            INNER JOIN workflows w2 ON w2.id = ws2.workflow_id
            INNER JOIN project_types pt2 ON pt2.default_workflow_id = w2.id
            WHERE pt2.name = 'Sales Deal'
        )
        LIMIT 1;
        
        IF current_step_id IS NOT NULL THEN
            -- Create WFM project
            INSERT INTO wfm_projects (
                id, project_type_id, workflow_id, current_step_id, 
                name, description, created_by_user_id, updated_by_user_id
            )
            SELECT 
                gen_random_uuid(),
                sales_project_type_id,
                w.id,
                current_step_id,
                'WFM Project for ' || deal_record.name,
                'Automatically created WFM project for seeded deal',
                d.user_id,
                d.user_id
            FROM workflows w 
            INNER JOIN project_types pt ON pt.default_workflow_id = w.id
            INNER JOIN deals d ON d.id = deal_record.id
            WHERE pt.id = sales_project_type_id
            RETURNING id INTO current_wfm_project_id;
            
            -- Link deal to WFM project
            UPDATE deals 
            SET wfm_project_id = current_wfm_project_id
            WHERE id = deal_record.id;
            
            RAISE NOTICE 'Assigned deal "%" to workflow step', deal_record.name;
        END IF;
        
        step_counter := step_counter + 1;
    END LOOP;
    
    RAISE NOTICE 'Fix completed. Deals should now appear in kanban view.';
END $$; 