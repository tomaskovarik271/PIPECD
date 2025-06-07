-- Comprehensive Deals and Leads Seed Data
-- Instructions:
-- 1. Make sure you have run the relationship_intelligence_user_seed.sql first
-- 2. Replace 'YOUR_USER_ID_HERE' below with your actual user ID
-- 3. Run this script: PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres < deals_leads_seed_data.sql

DO $$
DECLARE
    -- REPLACE THIS WITH YOUR ACTUAL USER ID FROM THE UI
    admin_user_id UUID := 'YOUR_USER_ID_HERE';
    
    -- Organization IDs (from relationship intelligence seeding)
    acme_org_id UUID;
    global_org_id UUID;
    techstart_org_id UUID;
    
    -- Person IDs (from relationship intelligence seeding)
    sarah_chen_id UUID;
    marcus_johnson_id UUID;
    lisa_rodriguez_id UUID;
    david_kim_id UUID;
    jennifer_wong_id UUID;
    michael_brown_id UUID;
    amanda_davis_id UUID;
    robert_taylor_id UUID;
    
    -- WFM Project Type IDs
    deal_project_type_id UUID;
    lead_project_type_id UUID;
    
    -- Deal IDs (for activities)
    enterprise_crm_deal_id UUID;
    startup_saas_deal_id UUID;
    manufacturing_deal_id UUID;
    
    -- Lead IDs (for activities)
    tech_lead_id UUID;
    consulting_lead_id UUID;
    startup_lead_id UUID;
    
    -- Record variable for loops
    rec RECORD;
    
BEGIN
    -- Verify the user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_user_id) THEN
        RAISE EXCEPTION 'User ID % does not exist. Please create a user account first and update the admin_user_id variable.', admin_user_id;
    END IF;
    
    RAISE NOTICE 'Using user ID: %', admin_user_id;
    
    -- Get organization IDs from existing data
    SELECT id INTO acme_org_id FROM organizations WHERE name = 'Acme Corporation' LIMIT 1;
    SELECT id INTO global_org_id FROM organizations WHERE name = 'Global Industries Inc' LIMIT 1;
    SELECT id INTO techstart_org_id FROM organizations WHERE name = 'TechStart Innovations' LIMIT 1;
    
    -- Get person IDs from existing data
    SELECT id INTO sarah_chen_id FROM people WHERE email = 'sarah.chen@acme.com';
    SELECT id INTO marcus_johnson_id FROM people WHERE email = 'marcus.j@acme.com';
    SELECT id INTO lisa_rodriguez_id FROM people WHERE email = 'lisa.r@acme.com';
    SELECT id INTO david_kim_id FROM people WHERE email = 'david.kim@acme.com';
    SELECT id INTO jennifer_wong_id FROM people WHERE email = 'jennifer.wong@globalindustries.com';
    SELECT id INTO michael_brown_id FROM people WHERE email = 'michael.brown@globalindustries.com';
    SELECT id INTO amanda_davis_id FROM people WHERE email = 'amanda.davis@techstart.com';
    SELECT id INTO robert_taylor_id FROM people WHERE email = 'robert.taylor@techstart.com';
    
    IF acme_org_id IS NULL OR global_org_id IS NULL OR techstart_org_id IS NULL THEN
        RAISE EXCEPTION 'Organizations not found. Please run relationship_intelligence_user_seed.sql first.';
    END IF;
    
    RAISE NOTICE 'Found organizations: Acme=%, Global=%, TechStart=%', acme_org_id, global_org_id, techstart_org_id;
    
    -- Create Project Types for deals and leads
    INSERT INTO project_types (id, name, description, icon_name, is_archived, created_by_user_id)
    VALUES 
        (gen_random_uuid(), 'Deal Pipeline', 'Standard deal progression workflow', 'target', false, admin_user_id),
        (gen_random_uuid(), 'Lead Qualification', 'Lead qualification and nurturing process', 'user-plus', false, admin_user_id)
    ON CONFLICT (name) DO NOTHING;
    
    -- Get project type IDs
    SELECT id INTO deal_project_type_id FROM project_types WHERE name = 'Deal Pipeline' LIMIT 1;
    SELECT id INTO lead_project_type_id FROM project_types WHERE name = 'Lead Qualification' LIMIT 1;
    
    RAISE NOTICE 'Project types: Deal=%, Lead=%', deal_project_type_id, lead_project_type_id;
    
    -- Insert sample deals (without wfm_project_type_id field)
    INSERT INTO deals (id, name, amount, expected_close_date, deal_specific_probability, organization_id, person_id, assigned_to_user_id, user_id)
    VALUES 
        (gen_random_uuid(), 'Enterprise CRM Implementation', 250000.00, '2024-04-15', 0.75, acme_org_id, sarah_chen_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'Manufacturing Digital Transformation', 500000.00, '2024-06-30', 0.60, global_org_id, jennifer_wong_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'SaaS Platform Integration', 85000.00, '2024-03-20', 0.85, techstart_org_id, amanda_davis_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'Data Analytics Suite', 150000.00, '2024-05-10', 0.45, acme_org_id, marcus_johnson_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'Cloud Infrastructure Upgrade', 75000.00, '2024-02-28', 0.90, techstart_org_id, robert_taylor_id, admin_user_id, admin_user_id)
    ON CONFLICT DO NOTHING;
    
    -- Get deal IDs for activities
    SELECT id INTO enterprise_crm_deal_id FROM deals WHERE name = 'Enterprise CRM Implementation' LIMIT 1;
    SELECT id INTO manufacturing_deal_id FROM deals WHERE name = 'Manufacturing Digital Transformation' LIMIT 1;
    SELECT id INTO startup_saas_deal_id FROM deals WHERE name = 'SaaS Platform Integration' LIMIT 1;
    
    RAISE NOTICE 'Created % deals', (SELECT COUNT(*) FROM deals WHERE user_id = admin_user_id);
    
    -- Insert sample leads (using only existing columns)
    INSERT INTO leads (id, name, contact_name, contact_email, contact_phone, company_name, source, description, estimated_value, estimated_close_date, lead_score, assigned_to_user_id, user_id)
    VALUES 
        (gen_random_uuid(), 'Tech Startup CRM Inquiry', 'Alex Chen', 'alex.chen@techcorp.com', '+1-555-0401', 'TechCorp Solutions', 'Website', 'Inbound inquiry about CRM solutions for 50-person startup', 45000.00, '2024-03-15', 85, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'Consulting Firm Lead', 'Maria Garcia', 'maria@consultpro.com', '+1-555-0402', 'ConsultPro Partners', 'Referral', 'Referral from existing client, looking for project management tools', 120000.00, '2024-04-30', 72, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'E-commerce Platform Interest', 'James Wilson', 'james.w@shopfast.com', '+1-555-0403', 'ShopFast Inc', 'Trade Show', 'Met at SaaS conference, interested in integration solutions', 90000.00, '2024-05-20', 65, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'Healthcare Analytics Prospect', 'Dr. Sarah Kim', 'sarah.kim@healthtech.com', '+1-555-0404', 'HealthTech Innovations', 'Cold Outreach', 'Initial interest in data analytics for patient outcomes', 200000.00, '2024-07-15', 55, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'Financial Services Automation', 'Robert Chang', 'robert.chang@finserv.com', '+1-555-0405', 'FinServ Solutions', 'LinkedIn', 'Responded to LinkedIn outreach about workflow automation', 175000.00, '2024-06-10', 78, admin_user_id, admin_user_id)
    ON CONFLICT DO NOTHING;
    
    -- Get lead IDs for activities
    SELECT id INTO tech_lead_id FROM leads WHERE contact_email = 'alex.chen@techcorp.com' LIMIT 1;
    SELECT id INTO consulting_lead_id FROM leads WHERE contact_email = 'maria@consultpro.com' LIMIT 1;
    SELECT id INTO startup_lead_id FROM leads WHERE contact_email = 'james.w@shopfast.com' LIMIT 1;
    
    RAISE NOTICE 'Created % leads', (SELECT COUNT(*) FROM leads WHERE user_id = admin_user_id);
    
    -- Insert activities for deals
    INSERT INTO activities (id, type, subject, notes, due_date, is_done, is_system_activity, deal_id, organization_id, person_id, assigned_to_user_id, user_id)
    VALUES 
        -- Enterprise CRM Deal Activities
        (gen_random_uuid(), 'MEETING', 'Initial Discovery Call', 'Discussed current CRM pain points and requirements. Sarah mentioned need for better lead tracking and sales automation.', '2024-01-15 14:00:00', true, false, enterprise_crm_deal_id, acme_org_id, sarah_chen_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'EMAIL', 'Follow-up Proposal', 'Sent detailed proposal including pricing, implementation timeline, and ROI projections.', '2024-01-18 10:00:00', true, false, enterprise_crm_deal_id, acme_org_id, sarah_chen_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'TASK', 'Technical Architecture Review', 'Schedule technical review with Marcus (CTO) to discuss integration requirements and data migration.', '2024-01-25 09:00:00', false, false, enterprise_crm_deal_id, acme_org_id, marcus_johnson_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'MEETING', 'Stakeholder Presentation', 'Present solution to key stakeholders including CEO, CTO, and procurement team.', '2024-02-05 15:00:00', false, false, enterprise_crm_deal_id, acme_org_id, sarah_chen_id, admin_user_id, admin_user_id),
        
        -- Manufacturing Deal Activities
        (gen_random_uuid(), 'CALL', 'Needs Assessment Call', 'Jennifer outlined digital transformation goals and budget constraints. Need to understand current systems better.', '2024-01-10 11:00:00', true, false, manufacturing_deal_id, global_org_id, jennifer_wong_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'MEETING', 'Site Visit and Assessment', 'On-site assessment of current manufacturing processes and technology stack.', '2024-01-30 13:00:00', false, false, manufacturing_deal_id, global_org_id, michael_brown_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'TASK', 'ROI Analysis Preparation', 'Prepare detailed ROI analysis showing efficiency gains and cost savings from digital transformation.', '2024-02-10 16:00:00', false, false, manufacturing_deal_id, global_org_id, jennifer_wong_id, admin_user_id, admin_user_id),
        
        -- SaaS Platform Deal Activities
        (gen_random_uuid(), 'EMAIL', 'Quick Integration Demo', 'Sent video demo showing how our platform integrates with their existing tech stack.', '2024-01-12 14:30:00', true, false, startup_saas_deal_id, techstart_org_id, amanda_davis_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'MEETING', 'Founder Meeting', 'Direct meeting with Amanda to discuss strategic fit and implementation timeline.', '2024-01-20 10:00:00', true, false, startup_saas_deal_id, techstart_org_id, amanda_davis_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'TASK', 'Contract Preparation', 'Prepare contract documents with startup-friendly terms and phased implementation.', '2024-02-01 12:00:00', false, false, startup_saas_deal_id, techstart_org_id, robert_taylor_id, admin_user_id, admin_user_id)
    ON CONFLICT DO NOTHING;
    
    -- Insert activities for leads
    INSERT INTO activities (id, type, subject, notes, due_date, is_done, is_system_activity, lead_id, assigned_to_user_id, user_id)
    VALUES 
        -- Tech Startup Lead Activities
        (gen_random_uuid(), 'EMAIL', 'Welcome and Discovery Questions', 'Sent welcome email with discovery questionnaire to understand their current setup and pain points.', '2024-01-08 09:00:00', true, false, tech_lead_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'CALL', 'Qualification Call', 'Great call with Alex! They have budget approved and are evaluating 3 vendors. We are in strong position.', '2024-01-12 15:00:00', true, false, tech_lead_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'MEETING', 'Product Demo', 'Scheduled live demo focusing on startup-specific features and pricing.', '2024-01-22 14:00:00', false, false, tech_lead_id, admin_user_id, admin_user_id),
        
        -- Consulting Firm Lead Activities
        (gen_random_uuid(), 'EMAIL', 'Referral Follow-up', 'Thanked existing client for referral and reached out to Maria with introduction.', '2024-01-05 10:30:00', true, false, consulting_lead_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'TASK', 'Research ConsultPro', 'Research their current tech stack and recent projects to prepare for discovery call.', '2024-01-18 16:00:00', false, false, consulting_lead_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'CALL', 'Discovery Call', 'Initial discovery call to understand their project management challenges and decision process.', '2024-01-25 11:00:00', false, false, consulting_lead_id, admin_user_id, admin_user_id),
        
        -- E-commerce Lead Activities
        (gen_random_uuid(), 'EMAIL', 'Trade Show Follow-up', 'Nice meeting you at SaaS Summit! Here are the integration case studies we discussed.', '2024-01-03 13:00:00', true, false, startup_lead_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'TASK', 'Competitive Analysis', 'Prepare comparison showing our advantages over competitors they mentioned.', '2024-01-20 09:00:00', false, false, startup_lead_id, admin_user_id, admin_user_id),
        (gen_random_uuid(), 'MEETING', 'Technical Requirements Review', 'Deep-dive into their integration requirements with their development team.', '2024-02-08 15:30:00', false, false, startup_lead_id, admin_user_id, admin_user_id)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created % activities', (SELECT COUNT(*) FROM activities WHERE user_id = admin_user_id);
    
    -- Insert deal history entries
    INSERT INTO deal_history (deal_id, event_type, changes, user_id)
    SELECT 
        d.id,
        'created',
        json_build_object('name', d.name, 'amount', d.amount, 'probability', d.deal_specific_probability),
        admin_user_id
    FROM deals d 
    WHERE d.user_id = admin_user_id
    ON CONFLICT DO NOTHING;
    
    -- Insert lead history entries
    INSERT INTO lead_history (lead_id, event_type, field_name, old_value, new_value, user_id)
    SELECT 
        l.id,
        'created',
        NULL,
        NULL,
        json_build_object('name', l.name, 'source', l.source, 'lead_score', l.lead_score),
        admin_user_id
    FROM leads l 
    WHERE l.user_id = admin_user_id
    ON CONFLICT DO NOTHING;
    
    -- Update lead scores with realistic factors
    UPDATE leads SET 
        lead_score_factors = json_build_object(
            'company_size', CASE 
                WHEN estimated_value > 150000 THEN 25
                WHEN estimated_value > 75000 THEN 20
                ELSE 15
            END,
            'industry_fit', CASE 
                WHEN source = 'Referral' THEN 25
                WHEN source = 'Website' THEN 20
                ELSE 15
            END,
            'engagement_level', CASE 
                WHEN lead_score > 80 THEN 25
                WHEN lead_score > 60 THEN 20
                ELSE 10
            END,
            'budget_qualified', CASE 
                WHEN lead_score > 75 THEN 25
                ELSE 10
            END
        ),
        automation_score_factors = json_build_object(
            'email_engagement', RANDOM() * 20 + 10,
            'website_activity', RANDOM() * 15 + 5,
            'social_signals', RANDOM() * 10 + 5
        )
    WHERE user_id = admin_user_id;
    
    -- Update deals with weighted amounts
    UPDATE deals SET 
        weighted_amount = amount * deal_specific_probability
    WHERE user_id = admin_user_id;
    
    RAISE NOTICE 'Deals and Leads seed data completed successfully!';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '- Deals: %', (SELECT COUNT(*) FROM deals WHERE user_id = admin_user_id);
    RAISE NOTICE '- Leads: %', (SELECT COUNT(*) FROM leads WHERE user_id = admin_user_id);
    RAISE NOTICE '- Activities: %', (SELECT COUNT(*) FROM activities WHERE user_id = admin_user_id);
    RAISE NOTICE '- Deal History: %', (SELECT COUNT(*) FROM deal_history WHERE user_id = admin_user_id);
    RAISE NOTICE '- Lead History: %', (SELECT COUNT(*) FROM lead_history WHERE user_id = admin_user_id);
    
    -- Output sample deal and lead IDs for reference
    RAISE NOTICE '';
    RAISE NOTICE '=== SAMPLE DEAL IDs ===';
    FOR rec IN SELECT id, name FROM deals WHERE user_id = admin_user_id LIMIT 3 LOOP
        RAISE NOTICE '% - %', rec.name, rec.id;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== SAMPLE LEAD IDs ===';
    FOR rec IN SELECT id, name FROM leads WHERE user_id = admin_user_id LIMIT 3 LOOP
        RAISE NOTICE '% - %', rec.name, rec.id;
    END LOOP;
    
END $$; 