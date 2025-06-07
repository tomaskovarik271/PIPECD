-- BNP Paribas Ecosystem Seed Data
-- Based on the organizational network diagram
-- Instructions:
-- 1. Reset your database: npx supabase db reset
-- 2. Create a new user account through your UI
-- 3. Replace 'YOUR_USER_ID_HERE' below with your actual user ID
-- 4. Run this script: PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres < bnp_paribas_ecosystem_seed.sql

DO $$
DECLARE
    -- REPLACE THIS WITH YOUR ACTUAL USER ID FROM THE UI
    admin_user_id UUID := 'YOUR_USER_ID_HERE';
    
    -- Organization IDs
    bnp_paribas_group_id UUID;
    bnp_poland_id UUID;
    bnp_czech_id UUID;
    arval_leasing_id UUID;
    latelier_bnp_id UUID;
    biwaki_studio_id UUID;
    hq_paris_id UUID;
    klim_id UUID;
    
    -- Person IDs
    robert_springinsfeld_id UUID;
    xavier_lapie_id UUID;
    myriam_vermot_id UUID;
    marilyn_samson_id UUID;
    axel_leon_deval_id UUID;
    deborah_tempesta_id UUID;
    stephanie_dal_id UUID;
    benoit_ratier_id UUID;
    magali_laurence_id UUID;
    pierre_potron_id UUID;
    florian_begliat_id UUID;
    john_egan_id UUID;
    nadya_ivanova_id UUID;
    denis_peccoud_id UUID;
    bartosz_urbanjak_id UUID;
    jaroslaw_rot_id UUID;
    michal_siwek_id UUID;
    dominika_marciniak_id UUID;
    marcin_adamczyk_id UUID;
    felix_jakobsen_id UUID;
    benoit_passot_id UUID;
    ingrid_pautrat_id UUID;
    ivan_barichman_id UUID;
    lucine_avoine_id UUID;
    romain_queilles_id UUID;
    
    -- Workflow and Status IDs
    sales_workflow_id UUID;
    qualified_lead_status_id UUID;
    opp_scoping_status_id UUID;
    prop_dev_status_id UUID;
    closed_won_status_id UUID;
    
    -- WFM Project variables
    sales_project_type_id UUID;
    step_counter INTEGER := 1;
    current_step_id UUID;
    current_wfm_project_id UUID;
    
BEGIN
    -- Verify the user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_user_id) THEN
        RAISE EXCEPTION 'User ID % does not exist. Please create a user account first and update the admin_user_id variable.', admin_user_id;
    END IF;
    
    RAISE NOTICE 'Using user ID: %', admin_user_id;
    
    -- Assign admin role to the user
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT admin_user_id, id FROM public.roles WHERE name = 'admin'
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    -- Get workflow and status IDs for Sales Deal
    SELECT id INTO sales_workflow_id FROM public.workflows WHERE name = 'Standard Sales Process' LIMIT 1;
    SELECT id INTO qualified_lead_status_id FROM public.statuses WHERE name = 'Qualified Lead' LIMIT 1;
    SELECT id INTO opp_scoping_status_id FROM public.statuses WHERE name = 'Opportunity Scoping' LIMIT 1;
    SELECT id INTO prop_dev_status_id FROM public.statuses WHERE name = 'Proposal Development' LIMIT 1;
    SELECT id INTO closed_won_status_id FROM public.statuses WHERE name = 'Closed Won' LIMIT 1;
    
    -- Insert Organizations
    INSERT INTO organizations (id, name, address, notes, user_id)
    SELECT gen_random_uuid(), 'BNP PARIBAS GROUP', 'Paris, France', 'Major international banking group and financial services company', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'BNP PARIBAS GROUP');
    
    INSERT INTO organizations (id, name, address, notes, user_id)
    SELECT gen_random_uuid(), 'BNP POLAND', 'Warsaw, Poland', 'BNP Paribas operations in Poland', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'BNP POLAND');
    
    INSERT INTO organizations (id, name, address, notes, user_id)
    SELECT gen_random_uuid(), 'BNP CZECH', 'Prague, Czech Republic', 'BNP Paribas operations in Czech Republic and Slovakia', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'BNP CZECH');
    
    INSERT INTO organizations (id, name, address, notes, user_id)
    SELECT gen_random_uuid(), 'ARVAL LEASING', 'Various Locations', 'Vehicle leasing and fleet management subsidiary', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'ARVAL LEASING');
    
    INSERT INTO organizations (id, name, address, notes, user_id)
    SELECT gen_random_uuid(), 'L''Atelier BNP', 'Paris, France', 'Innovation and technology research center', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'L''Atelier BNP');
    
    INSERT INTO organizations (id, name, address, notes, user_id)
    SELECT gen_random_uuid(), 'BiwAki Studio', 'Paris, France', 'Digital innovation studio', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'BiwAki Studio');
    
    INSERT INTO organizations (id, name, address, notes, user_id)
    SELECT gen_random_uuid(), 'HQ PARIS', 'Paris, France', 'BNP Paribas headquarters operations', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'HQ PARIS');
    
    INSERT INTO organizations (id, name, address, notes, user_id)
    SELECT gen_random_uuid(), 'KLIM', 'External Location', 'External venture partner focusing on agricultural sustainability', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'KLIM');
    
    -- Get organization IDs
    SELECT id INTO bnp_paribas_group_id FROM organizations WHERE name = 'BNP PARIBAS GROUP' LIMIT 1;
    SELECT id INTO bnp_poland_id FROM organizations WHERE name = 'BNP POLAND' LIMIT 1;
    SELECT id INTO bnp_czech_id FROM organizations WHERE name = 'BNP CZECH' LIMIT 1;
    SELECT id INTO arval_leasing_id FROM organizations WHERE name = 'ARVAL LEASING' LIMIT 1;
    SELECT id INTO latelier_bnp_id FROM organizations WHERE name = 'L''Atelier BNP' LIMIT 1;
    SELECT id INTO biwaki_studio_id FROM organizations WHERE name = 'BiwAki Studio' LIMIT 1;
    SELECT id INTO hq_paris_id FROM organizations WHERE name = 'HQ PARIS' LIMIT 1;
    SELECT id INTO klim_id FROM organizations WHERE name = 'KLIM' LIMIT 1;
    
    -- Insert People
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Robert', 'Springinsfeld', 'robert.springinsfeld@bnpparibas.com', '+420-555-0101', bnp_czech_id, admin_user_id, 'CEO for Czech Republic and Slovakia operations'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'robert.springinsfeld@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Xavier', 'LAPIE', 'xavier.lapie@bnpparibas.com', '+33-555-0201', hq_paris_id, admin_user_id, 'Head of Innovation & Acceleration'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'xavier.lapie@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Myriam', 'VERMOT DESROCHES', 'myriam.vermot@bnpparibas.com', '+33-555-0202', hq_paris_id, admin_user_id, 'Innovation Program Director'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'myriam.vermot@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Marilyn', 'SAMSON', 'marilyn.samson@bnpparibas.com', '+33-555-0203', hq_paris_id, admin_user_id, 'Tech innovation and acceleration Director'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'marilyn.samson@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Axel-Leon', 'DEVAL LEROY', 'axel.deval@bnpparibas.com', '+33-555-0204', hq_paris_id, admin_user_id, 'Group Corporate Development Director'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'axel.deval@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Deborah', 'TEMPESTA', 'deborah.tempesta@bnpparibas.com', '+33-555-0205', hq_paris_id, admin_user_id, 'Innovation Coordinator'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'deborah.tempesta@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Stephanie', 'DAL', 'stephanie.dal@bnpparibas.com', '+33-555-0206', hq_paris_id, admin_user_id, 'Chief Customer Officer'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'stephanie.dal@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Benoit', 'RATIER', 'benoit.ratier@bnpparibas.com', '+33-555-0207', hq_paris_id, admin_user_id, 'Business Lead Innovation'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'benoit.ratier@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Magali', 'LAURENCE', 'magali.laurence@bnpparibas.com', '+33-555-0208', hq_paris_id, admin_user_id, 'IT Manager'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'magali.laurence@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Pierre', 'POTRON', 'pierre.potron@bnpparibas.com', '+33-555-0209', biwaki_studio_id, admin_user_id, 'Head of Operations'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'pierre.potron@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Florian', 'BEGLIAT', 'florian.begliat@bnpparibas.com', '+33-555-0210', hq_paris_id, admin_user_id, 'Head of Startup Program'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'florian.begliat@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'John', 'EGAN', 'john.egan@latelier.net', '+33-555-0301', latelier_bnp_id, admin_user_id, 'CEO of L''Atelier BNP'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'john.egan@latelier.net');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Nadya', 'IVANOVA', 'nadya.ivanova@latelier.net', '+33-555-0302', latelier_bnp_id, admin_user_id, 'COO of L''Atelier BNP'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'nadya.ivanova@latelier.net');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Denis', 'PECCOUD', 'denis.peccoud@bnpparibas.com', '+48-555-0401', bnp_poland_id, admin_user_id, 'Transformation Executive Director'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'denis.peccoud@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Bartosz', 'URBANJAK', 'bartosz.urbanjak@bnpparibas.com', '+48-555-0402', bnp_poland_id, admin_user_id, 'Head of Agriculture CEE and Africa'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'bartosz.urbanjak@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Jaroslaw', 'ROT', 'jaroslaw.rot@bnpparibas.com', '+48-555-0403', bnp_poland_id, admin_user_id, 'Chief Sustainability Officer'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'jaroslaw.rot@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Michal', 'SIWEK', 'michal.siwek@bnpparibas.com', '+48-555-0404', bnp_poland_id, admin_user_id, 'Head of Decarbonization & Biodiversity Product'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'michal.siwek@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Dominika', 'MARCINIAK', 'dominika.marciniak@bnpparibas.com', '+48-555-0405', bnp_poland_id, admin_user_id, 'Specialist Sustainability'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'dominika.marciniak@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Marcin', 'ADAMCZYK', 'marcin.adamczyk@bnpparibas.com', '+48-555-0406', bnp_poland_id, admin_user_id, 'Manager of Sustainable Solutions and ESG Product Development'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'marcin.adamczyk@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Felix', 'JAKOBSEN', 'felix.jakobsen@bnpparibas.com', '+48-555-0407', bnp_poland_id, admin_user_id, 'COO Poland'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'felix.jakobsen@bnpparibas.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Benoit', 'PASSOT', 'benoit.passot@arval.com', '+33-555-0501', arval_leasing_id, admin_user_id, 'Corporate Strategy and Chief of Staff'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'benoit.passot@arval.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Ingrid', 'PAUTRAT', 'ingrid.pautrat@arval.com', '+33-555-0502', arval_leasing_id, admin_user_id, 'Energy Transition Director'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'ingrid.pautrat@arval.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Ivan', 'BARICHMAN', 'ivan.barichman@arval.com', '+33-555-0503', arval_leasing_id, admin_user_id, 'Finance & Strategy'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'ivan.barichman@arval.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Lucine', 'AVOINE', 'lucine.avoine@arval.com', '+33-555-0504', arval_leasing_id, admin_user_id, 'Indirect Procurement Manager'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'lucine.avoine@arval.com');
    
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    SELECT gen_random_uuid(), 'Romain', 'Queilles', 'romain.queilles@external.com', '+33-555-0601', biwaki_studio_id, admin_user_id, 'External Consultant'
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE email = 'romain.queilles@external.com');
    
    -- Get person IDs
    SELECT id INTO robert_springinsfeld_id FROM people WHERE email = 'robert.springinsfeld@bnpparibas.com';
    SELECT id INTO xavier_lapie_id FROM people WHERE email = 'xavier.lapie@bnpparibas.com';
    SELECT id INTO myriam_vermot_id FROM people WHERE email = 'myriam.vermot@bnpparibas.com';
    SELECT id INTO marilyn_samson_id FROM people WHERE email = 'marilyn.samson@bnpparibas.com';
    SELECT id INTO axel_leon_deval_id FROM people WHERE email = 'axel.deval@bnpparibas.com';
    SELECT id INTO deborah_tempesta_id FROM people WHERE email = 'deborah.tempesta@bnpparibas.com';
    SELECT id INTO stephanie_dal_id FROM people WHERE email = 'stephanie.dal@bnpparibas.com';
    SELECT id INTO benoit_ratier_id FROM people WHERE email = 'benoit.ratier@bnpparibas.com';
    SELECT id INTO magali_laurence_id FROM people WHERE email = 'magali.laurence@bnpparibas.com';
    SELECT id INTO pierre_potron_id FROM people WHERE email = 'pierre.potron@bnpparibas.com';
    SELECT id INTO florian_begliat_id FROM people WHERE email = 'florian.begliat@bnpparibas.com';
    SELECT id INTO john_egan_id FROM people WHERE email = 'john.egan@latelier.net';
    SELECT id INTO nadya_ivanova_id FROM people WHERE email = 'nadya.ivanova@latelier.net';
    SELECT id INTO denis_peccoud_id FROM people WHERE email = 'denis.peccoud@bnpparibas.com';
    SELECT id INTO bartosz_urbanjak_id FROM people WHERE email = 'bartosz.urbanjak@bnpparibas.com';
    SELECT id INTO jaroslaw_rot_id FROM people WHERE email = 'jaroslaw.rot@bnpparibas.com';
    SELECT id INTO michal_siwek_id FROM people WHERE email = 'michal.siwek@bnpparibas.com';
    SELECT id INTO dominika_marciniak_id FROM people WHERE email = 'dominika.marciniak@bnpparibas.com';
    SELECT id INTO marcin_adamczyk_id FROM people WHERE email = 'marcin.adamczyk@bnpparibas.com';
    SELECT id INTO felix_jakobsen_id FROM people WHERE email = 'felix.jakobsen@bnpparibas.com';
    SELECT id INTO benoit_passot_id FROM people WHERE email = 'benoit.passot@arval.com';
    SELECT id INTO ingrid_pautrat_id FROM people WHERE email = 'ingrid.pautrat@arval.com';
    SELECT id INTO ivan_barichman_id FROM people WHERE email = 'ivan.barichman@arval.com';
    SELECT id INTO lucine_avoine_id FROM people WHERE email = 'lucine.avoine@arval.com';
    SELECT id INTO romain_queilles_id FROM people WHERE email = 'romain.queilles@external.com';
    
    -- Insert Organizational Roles
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT robert_springinsfeld_id, bnp_czech_id, 'Chief Executive Officer', 'Executive', 'c_level', true, '2020-01-01', 100000000, 500, '{"regional_leadership": true, "strategic_direction": true, "czech_slovakia_operations": true}', admin_user_id
    WHERE robert_springinsfeld_id IS NOT NULL AND bnp_czech_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = robert_springinsfeld_id AND organization_id = bnp_czech_id AND role_title = 'Chief Executive Officer');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT xavier_lapie_id, hq_paris_id, 'Head of Innovation & Acceleration', 'Innovation', 'director', true, '2019-06-01', 25000000, 50, '{"innovation_strategy": true, "acceleration_programs": true, "startup_partnerships": true}', admin_user_id
    WHERE xavier_lapie_id IS NOT NULL AND hq_paris_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = xavier_lapie_id AND organization_id = hq_paris_id AND role_title = 'Head of Innovation & Acceleration');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT myriam_vermot_id, hq_paris_id, 'Innovation Program Director', 'Innovation', 'director', true, '2020-03-01', 15000000, 30, '{"program_management": true, "innovation_initiatives": true, "cross_team_coordination": true}', admin_user_id
    WHERE myriam_vermot_id IS NOT NULL AND hq_paris_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = myriam_vermot_id AND organization_id = hq_paris_id AND role_title = 'Innovation Program Director');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT marilyn_samson_id, hq_paris_id, 'Tech Innovation and Acceleration Director', 'Technology', 'director', true, '2021-01-01', 20000000, 40, '{"technology_innovation": true, "digital_acceleration": true, "tech_partnerships": true}', admin_user_id
    WHERE marilyn_samson_id IS NOT NULL AND hq_paris_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = marilyn_samson_id AND organization_id = hq_paris_id AND role_title = 'Tech Innovation and Acceleration Director');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT axel_leon_deval_id, hq_paris_id, 'Group Corporate Development Director', 'Corporate Development', 'director', true, '2018-09-01', 500000000, 25, '{"mergers_acquisitions": true, "strategic_partnerships": true, "corporate_strategy": true}', admin_user_id
    WHERE axel_leon_deval_id IS NOT NULL AND hq_paris_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = axel_leon_deval_id AND organization_id = hq_paris_id AND role_title = 'Group Corporate Development Director');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT john_egan_id, latelier_bnp_id, 'Chief Executive Officer', 'Executive', 'c_level', true, '2019-01-01', 50000000, 100, '{"research_direction": true, "innovation_research": true, "technology_trends": true}', admin_user_id
    WHERE john_egan_id IS NOT NULL AND latelier_bnp_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = john_egan_id AND organization_id = latelier_bnp_id AND role_title = 'Chief Executive Officer');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT nadya_ivanova_id, latelier_bnp_id, 'Chief Operating Officer', 'Operations', 'c_level', true, '2019-06-01', 25000000, 60, '{"operational_excellence": true, "research_operations": true, "team_management": true}', admin_user_id
    WHERE nadya_ivanova_id IS NOT NULL AND latelier_bnp_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = nadya_ivanova_id AND organization_id = latelier_bnp_id AND role_title = 'Chief Operating Officer');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT denis_peccoud_id, bnp_poland_id, 'Transformation Executive Director', 'Transformation', 'director', true, '2020-01-01', 75000000, 80, '{"digital_transformation": true, "organizational_change": true, "process_optimization": true}', admin_user_id
    WHERE denis_peccoud_id IS NOT NULL AND bnp_poland_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = denis_peccoud_id AND organization_id = bnp_poland_id AND role_title = 'Transformation Executive Director');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT bartosz_urbanjak_id, bnp_poland_id, 'Head of Agriculture CEE and Africa', 'Agriculture', 'director', true, '2021-03-01', 40000000, 45, '{"agricultural_finance": true, "sustainability": true, "regional_expansion": true}', admin_user_id
    WHERE bartosz_urbanjak_id IS NOT NULL AND bnp_poland_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = bartosz_urbanjak_id AND organization_id = bnp_poland_id AND role_title = 'Head of Agriculture CEE and Africa');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT jaroslaw_rot_id, bnp_poland_id, 'Chief Sustainability Officer', 'Sustainability', 'c_level', true, '2020-06-01', 30000000, 35, '{"sustainability_strategy": true, "esg_initiatives": true, "climate_finance": true}', admin_user_id
    WHERE jaroslaw_rot_id IS NOT NULL AND bnp_poland_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = jaroslaw_rot_id AND organization_id = bnp_poland_id AND role_title = 'Chief Sustainability Officer');
    
    -- Insert Organization Relationships
    INSERT INTO organization_relationships (parent_org_id, child_org_id, relationship_type, relationship_strength, start_date, notes, created_by_user_id)
    SELECT bnp_paribas_group_id, bnp_poland_id, 'subsidiary', 10, '1990-01-01', 'Polish subsidiary of BNP Paribas Group', admin_user_id
    WHERE bnp_paribas_group_id IS NOT NULL AND bnp_poland_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM organization_relationships WHERE parent_org_id = bnp_paribas_group_id AND child_org_id = bnp_poland_id AND relationship_type = 'subsidiary');
    
    INSERT INTO organization_relationships (parent_org_id, child_org_id, relationship_type, relationship_strength, start_date, notes, created_by_user_id)
    SELECT bnp_paribas_group_id, bnp_czech_id, 'subsidiary', 10, '1992-01-01', 'Czech and Slovak operations subsidiary', admin_user_id
    WHERE bnp_paribas_group_id IS NOT NULL AND bnp_czech_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM organization_relationships WHERE parent_org_id = bnp_paribas_group_id AND child_org_id = bnp_czech_id AND relationship_type = 'subsidiary');
    
    INSERT INTO organization_relationships (parent_org_id, child_org_id, relationship_type, relationship_strength, start_date, notes, created_by_user_id)
    SELECT bnp_paribas_group_id, arval_leasing_id, 'subsidiary', 10, '1989-01-01', 'Vehicle leasing subsidiary', admin_user_id
    WHERE bnp_paribas_group_id IS NOT NULL AND arval_leasing_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM organization_relationships WHERE parent_org_id = bnp_paribas_group_id AND child_org_id = arval_leasing_id AND relationship_type = 'subsidiary');
    
    INSERT INTO organization_relationships (parent_org_id, child_org_id, relationship_type, relationship_strength, start_date, notes, created_by_user_id)
    SELECT bnp_paribas_group_id, latelier_bnp_id, 'subsidiary', 9, '2015-01-01', 'Innovation research center', admin_user_id
    WHERE bnp_paribas_group_id IS NOT NULL AND latelier_bnp_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM organization_relationships WHERE parent_org_id = bnp_paribas_group_id AND child_org_id = latelier_bnp_id AND relationship_type = 'subsidiary');
    
    INSERT INTO organization_relationships (parent_org_id, child_org_id, relationship_type, relationship_strength, start_date, notes, created_by_user_id)
    SELECT bnp_paribas_group_id, biwaki_studio_id, 'subsidiary', 8, '2020-01-01', 'Digital innovation studio', admin_user_id
    WHERE bnp_paribas_group_id IS NOT NULL AND biwaki_studio_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM organization_relationships WHERE parent_org_id = bnp_paribas_group_id AND child_org_id = biwaki_studio_id AND relationship_type = 'subsidiary');
    
    INSERT INTO organization_relationships (parent_org_id, child_org_id, relationship_type, relationship_strength, start_date, notes, created_by_user_id)
    SELECT bnp_paribas_group_id, hq_paris_id, 'division', 10, '1848-01-01', 'Headquarters operations', admin_user_id
    WHERE bnp_paribas_group_id IS NOT NULL AND hq_paris_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM organization_relationships WHERE parent_org_id = bnp_paribas_group_id AND child_org_id = hq_paris_id AND relationship_type = 'division');
    
    INSERT INTO organization_relationships (parent_org_id, child_org_id, relationship_type, relationship_strength, start_date, notes, created_by_user_id)
    SELECT bnp_paribas_group_id, klim_id, 'partnership', 6, '2023-01-01', 'Strategic partnership for agricultural sustainability', admin_user_id
    WHERE bnp_paribas_group_id IS NOT NULL AND klim_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM organization_relationships WHERE parent_org_id = bnp_paribas_group_id AND child_org_id = klim_id AND relationship_type = 'partnership');
    
    -- Insert Person Relationships (Key leadership and collaboration relationships)
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT robert_springinsfeld_id, axel_leon_deval_id, 'reports_to', 8, false, 'monthly', 'Regional CEO reporting to Group Corporate Development', admin_user_id
    WHERE robert_springinsfeld_id IS NOT NULL AND axel_leon_deval_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = robert_springinsfeld_id AND to_person_id = axel_leon_deval_id AND relationship_type = 'reports_to');
    
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT xavier_lapie_id, axel_leon_deval_id, 'collaborates_with', 9, true, 'weekly', 'Innovation and corporate development collaboration', admin_user_id
    WHERE xavier_lapie_id IS NOT NULL AND axel_leon_deval_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = xavier_lapie_id AND to_person_id = axel_leon_deval_id AND relationship_type = 'collaborates_with');
    
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT myriam_vermot_id, xavier_lapie_id, 'reports_to', 9, false, 'weekly', 'Innovation program coordination', admin_user_id
    WHERE myriam_vermot_id IS NOT NULL AND xavier_lapie_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = myriam_vermot_id AND to_person_id = xavier_lapie_id AND relationship_type = 'reports_to');
    
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT marilyn_samson_id, xavier_lapie_id, 'reports_to', 9, false, 'weekly', 'Technology innovation reporting', admin_user_id
    WHERE marilyn_samson_id IS NOT NULL AND xavier_lapie_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = marilyn_samson_id AND to_person_id = xavier_lapie_id AND relationship_type = 'reports_to');
    
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT deborah_tempesta_id, xavier_lapie_id, 'reports_to', 8, false, 'weekly', 'Innovation coordination reporting', admin_user_id
    WHERE deborah_tempesta_id IS NOT NULL AND xavier_lapie_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = deborah_tempesta_id AND to_person_id = xavier_lapie_id AND relationship_type = 'reports_to');
    
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT john_egan_id, xavier_lapie_id, 'collaborates_with', 8, true, 'monthly', 'Research and innovation partnership', admin_user_id
    WHERE john_egan_id IS NOT NULL AND xavier_lapie_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = john_egan_id AND to_person_id = xavier_lapie_id AND relationship_type = 'collaborates_with');
    
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT nadya_ivanova_id, john_egan_id, 'reports_to', 9, false, 'daily', 'L''Atelier operations management', admin_user_id
    WHERE nadya_ivanova_id IS NOT NULL AND john_egan_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = nadya_ivanova_id AND to_person_id = john_egan_id AND relationship_type = 'reports_to');
    
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT pierre_potron_id, florian_begliat_id, 'collaborates_with', 7, true, 'weekly', 'Startup program and operations collaboration', admin_user_id
    WHERE pierre_potron_id IS NOT NULL AND florian_begliat_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = pierre_potron_id AND to_person_id = florian_begliat_id AND relationship_type = 'collaborates_with');
    
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT denis_peccoud_id, bartosz_urbanjak_id, 'collaborates_with', 8, true, 'monthly', 'Transformation and agriculture initiatives', admin_user_id
    WHERE denis_peccoud_id IS NOT NULL AND bartosz_urbanjak_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = denis_peccoud_id AND to_person_id = bartosz_urbanjak_id AND relationship_type = 'collaborates_with');
    
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT jaroslaw_rot_id, bartosz_urbanjak_id, 'collaborates_with', 9, true, 'weekly', 'Sustainability and agriculture collaboration', admin_user_id
    WHERE jaroslaw_rot_id IS NOT NULL AND bartosz_urbanjak_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = jaroslaw_rot_id AND to_person_id = bartosz_urbanjak_id AND relationship_type = 'collaborates_with');
    
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT michal_siwek_id, jaroslaw_rot_id, 'reports_to', 8, false, 'weekly', 'Sustainability product development', admin_user_id
    WHERE michal_siwek_id IS NOT NULL AND jaroslaw_rot_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = michal_siwek_id AND to_person_id = jaroslaw_rot_id AND relationship_type = 'reports_to');
    
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT dominika_marciniak_id, jaroslaw_rot_id, 'reports_to', 7, false, 'weekly', 'Sustainability specialization', admin_user_id
    WHERE dominika_marciniak_id IS NOT NULL AND jaroslaw_rot_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = dominika_marciniak_id AND to_person_id = jaroslaw_rot_id AND relationship_type = 'reports_to');
    
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT marcin_adamczyk_id, jaroslaw_rot_id, 'reports_to', 8, false, 'weekly', 'ESG product development', admin_user_id
    WHERE marcin_adamczyk_id IS NOT NULL AND jaroslaw_rot_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = marcin_adamczyk_id AND to_person_id = jaroslaw_rot_id AND relationship_type = 'reports_to');
    
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT benoit_passot_id, axel_leon_deval_id, 'collaborates_with', 7, true, 'monthly', 'Corporate strategy coordination across subsidiaries', admin_user_id
    WHERE benoit_passot_id IS NOT NULL AND axel_leon_deval_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = benoit_passot_id AND to_person_id = axel_leon_deval_id AND relationship_type = 'collaborates_with');
    
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    SELECT ingrid_pautrat_id, jaroslaw_rot_id, 'collaborates_with', 8, true, 'monthly', 'Energy transition and sustainability partnership', admin_user_id
    WHERE ingrid_pautrat_id IS NOT NULL AND jaroslaw_rot_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM person_relationships WHERE from_person_id = ingrid_pautrat_id AND to_person_id = jaroslaw_rot_id AND relationship_type = 'collaborates_with');
    
    -- Insert Sample Deals using basic structure
    INSERT INTO deals (
        id, name, amount, expected_close_date, organization_id, 
        assigned_to_user_id, user_id
    )
    SELECT gen_random_uuid(), 'KLIM Agricultural Sustainability Platform', 2500000, '2024-06-30', klim_id, admin_user_id, admin_user_id
    WHERE klim_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM deals WHERE name = 'KLIM Agricultural Sustainability Platform');
    
    INSERT INTO deals (
        id, name, amount, expected_close_date, organization_id, 
        assigned_to_user_id, user_id
    )
    SELECT gen_random_uuid(), 'Digital Transformation Initiative - Poland', 15000000, '2024-09-15', bnp_poland_id, admin_user_id, admin_user_id
    WHERE bnp_poland_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM deals WHERE name = 'Digital Transformation Initiative - Poland');
    
    INSERT INTO deals (
        id, name, amount, expected_close_date, organization_id, 
        assigned_to_user_id, user_id
    )
    SELECT gen_random_uuid(), 'Innovation Lab Technology Stack', 5000000, '2024-04-30', latelier_bnp_id, admin_user_id, admin_user_id
    WHERE latelier_bnp_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM deals WHERE name = 'Innovation Lab Technology Stack');
    
    INSERT INTO deals (
        id, name, amount, expected_close_date, organization_id, 
        assigned_to_user_id, user_id
    )
    SELECT gen_random_uuid(), 'Sustainable Finance Product Suite', 8000000, '2024-12-31', bnp_paribas_group_id, admin_user_id, admin_user_id
    WHERE bnp_paribas_group_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM deals WHERE name = 'Sustainable Finance Product Suite');
    
    INSERT INTO deals (
        id, name, amount, expected_close_date, organization_id, 
        assigned_to_user_id, user_id
    )
    SELECT gen_random_uuid(), 'Fleet Electrification Program', 12000000, '2024-08-15', arval_leasing_id, admin_user_id, admin_user_id
    WHERE arval_leasing_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM deals WHERE name = 'Fleet Electrification Program');
    
    -- Insert Stakeholder Analysis for key deals
    INSERT INTO stakeholder_analysis (
        person_id, organization_id, influence_score, decision_authority, 
        budget_authority_level, engagement_level, communication_preference, 
        pain_points, motivations, approach_strategy, next_best_action, 
        ai_personality_profile, ai_communication_style, created_by_user_id
    )
    SELECT robert_springinsfeld_id, bnp_czech_id, 9, 'final_decision', 'unlimited', 'supporter', 'formal_meetings', 
         '["regional_competition", "regulatory_compliance", "digital_transformation"]',
         '["market_leadership", "operational_efficiency", "customer_satisfaction"]',
         'Focus on strategic value and competitive advantages for CEE region',
         'Schedule executive briefing on regional digital strategy',
         '{"leadership_style": "strategic", "decision_pattern": "regional_focus", "risk_tolerance": "moderate"}',
         'Strategic and regional focus, prefers comprehensive market analysis',
         admin_user_id
    WHERE robert_springinsfeld_id IS NOT NULL AND bnp_czech_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM stakeholder_analysis WHERE person_id = robert_springinsfeld_id AND organization_id = bnp_czech_id);
    
    INSERT INTO stakeholder_analysis (
        person_id, organization_id, influence_score, decision_authority, 
        budget_authority_level, engagement_level, communication_preference, 
        pain_points, motivations, approach_strategy, next_best_action, 
        ai_personality_profile, ai_communication_style, created_by_user_id
    )
    SELECT xavier_lapie_id, hq_paris_id, 8, 'strong_influence', 'high', 'champion', 'email',
         '["innovation_speed", "technology_adoption", "startup_ecosystem"]',
         '["innovation_leadership", "technological_advancement", "ecosystem_development"]',
         'Emphasize cutting-edge technology and innovation ecosystem benefits',
         'Arrange innovation showcase and technology roadmap session',
         '{"leadership_style": "innovative", "decision_pattern": "technology_focused", "risk_tolerance": "high"}',
         'Innovation-focused, appreciates emerging technology discussions',
         admin_user_id
    WHERE xavier_lapie_id IS NOT NULL AND hq_paris_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM stakeholder_analysis WHERE person_id = xavier_lapie_id AND organization_id = hq_paris_id);
    
    INSERT INTO stakeholder_analysis (
        person_id, organization_id, influence_score, decision_authority, 
        budget_authority_level, engagement_level, communication_preference, 
        pain_points, motivations, approach_strategy, next_best_action, 
        ai_personality_profile, ai_communication_style, created_by_user_id
    )
    SELECT jaroslaw_rot_id, bnp_poland_id, 8, 'strong_influence', 'high', 'champion', 'email',
         '["sustainability_targets", "regulatory_pressure", "stakeholder_expectations"]',
         '["environmental_impact", "sustainability_leadership", "esg_performance"]',
         'Lead with sustainability benefits and ESG impact metrics',
         'Present comprehensive sustainability impact analysis',
         '{"leadership_style": "purpose_driven", "decision_pattern": "sustainability_focused", "risk_tolerance": "low"}',
         'Sustainability-focused, requires detailed environmental impact data',
         admin_user_id
    WHERE jaroslaw_rot_id IS NOT NULL AND bnp_poland_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM stakeholder_analysis WHERE person_id = jaroslaw_rot_id AND organization_id = bnp_poland_id);
    
    INSERT INTO stakeholder_analysis (
        person_id, organization_id, influence_score, decision_authority, 
        budget_authority_level, engagement_level, communication_preference, 
        pain_points, motivations, approach_strategy, next_best_action, 
        ai_personality_profile, ai_communication_style, created_by_user_id
    )
    SELECT john_egan_id, latelier_bnp_id, 8, 'final_decision', 'high', 'supporter', 'slack',
         '["research_relevance", "technology_trends", "innovation_impact"]',
         '["research_excellence", "technology_leadership", "innovation_influence"]',
         'Focus on research capabilities and technology trend insights',
         'Arrange research collaboration and technology trends discussion',
         '{"leadership_style": "research_oriented", "decision_pattern": "technology_merit", "risk_tolerance": "moderate"}',
         'Research-oriented, values deep technology insights and trends',
         admin_user_id
    WHERE john_egan_id IS NOT NULL AND latelier_bnp_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM stakeholder_analysis WHERE person_id = john_egan_id AND organization_id = latelier_bnp_id);
    
    -- Create WFM projects for the deals and assign them to workflow steps
    -- This is needed for deals to appear in the kanban view
    
    -- Get Sales Deal project type
    SELECT id INTO sales_project_type_id 
    FROM project_types 
    WHERE name = 'Sales Deal' 
    LIMIT 1;
    
    IF sales_project_type_id IS NULL THEN
        RAISE NOTICE 'Sales Deal project type not found. Deals will not have workflow steps assigned.';
    ELSE
        RAISE NOTICE 'Found Sales Deal project type: %', sales_project_type_id;
        
        -- Assign deals to different workflow steps for demonstration
        -- Deal 1: KLIM Agricultural Sustainability Platform -> Initial step
        SELECT ws.id INTO current_step_id
        FROM workflow_steps ws 
        INNER JOIN workflows w ON w.id = ws.workflow_id
        INNER JOIN project_types pt ON pt.default_workflow_id = w.id
        WHERE pt.name = 'Sales Deal' AND ws.is_initial_step = true
        LIMIT 1;
        
        IF current_step_id IS NOT NULL THEN
            INSERT INTO wfm_projects (
                id, project_type_id, workflow_id, current_step_id, 
                name, description, created_by_user_id, updated_by_user_id
            )
            SELECT 
                gen_random_uuid(),
                sales_project_type_id,
                w.id,
                current_step_id,
                'WFM Project for KLIM Agricultural Sustainability Platform',
                'Automatically created WFM project for seeded deal',
                admin_user_id,
                admin_user_id
            FROM workflows w 
            INNER JOIN project_types pt ON pt.default_workflow_id = w.id
            WHERE pt.id = sales_project_type_id
            RETURNING id INTO current_wfm_project_id;
            
            UPDATE deals 
            SET wfm_project_id = current_wfm_project_id
            WHERE name = 'KLIM Agricultural Sustainability Platform' AND user_id = admin_user_id;
            
            RAISE NOTICE 'Assigned KLIM deal to initial workflow step';
        END IF;
        
        -- Deal 2: Digital Transformation Initiative -> Second step
        SELECT ws.id INTO current_step_id
        FROM workflow_steps ws 
        INNER JOIN workflows w ON w.id = ws.workflow_id
        INNER JOIN project_types pt ON pt.default_workflow_id = w.id
        WHERE pt.name = 'Sales Deal' AND ws.is_initial_step = false
        ORDER BY ws.step_order
        LIMIT 1;
        
        IF current_step_id IS NOT NULL THEN
            INSERT INTO wfm_projects (
                id, project_type_id, workflow_id, current_step_id, 
                name, description, created_by_user_id, updated_by_user_id
            )
            SELECT 
                gen_random_uuid(),
                sales_project_type_id,
                w.id,
                current_step_id,
                'WFM Project for Digital Transformation Initiative - Poland',
                'Automatically created WFM project for seeded deal',
                admin_user_id,
                admin_user_id
            FROM workflows w 
            INNER JOIN project_types pt ON pt.default_workflow_id = w.id
            WHERE pt.id = sales_project_type_id
            RETURNING id INTO current_wfm_project_id;
            
            UPDATE deals 
            SET wfm_project_id = current_wfm_project_id
            WHERE name = 'Digital Transformation Initiative - Poland' AND user_id = admin_user_id;
            
            RAISE NOTICE 'Assigned Digital Transformation deal to second workflow step';
        END IF;
        
        -- Deal 3: Innovation Lab Technology Stack -> Third step
        SELECT ws.id INTO current_step_id
        FROM workflow_steps ws 
        INNER JOIN workflows w ON w.id = ws.workflow_id
        INNER JOIN project_types pt ON pt.default_workflow_id = w.id
        WHERE pt.name = 'Sales Deal' AND ws.is_initial_step = false
        ORDER BY ws.step_order
        OFFSET 1
        LIMIT 1;
        
        IF current_step_id IS NOT NULL THEN
            INSERT INTO wfm_projects (
                id, project_type_id, workflow_id, current_step_id, 
                name, description, created_by_user_id, updated_by_user_id
            )
            SELECT 
                gen_random_uuid(),
                sales_project_type_id,
                w.id,
                current_step_id,
                'WFM Project for Innovation Lab Technology Stack',
                'Automatically created WFM project for seeded deal',
                admin_user_id,
                admin_user_id
            FROM workflows w 
            INNER JOIN project_types pt ON pt.default_workflow_id = w.id
            WHERE pt.id = sales_project_type_id
            RETURNING id INTO current_wfm_project_id;
            
            UPDATE deals 
            SET wfm_project_id = current_wfm_project_id
            WHERE name = 'Innovation Lab Technology Stack' AND user_id = admin_user_id;
            
            RAISE NOTICE 'Assigned Innovation Lab deal to third workflow step';
        END IF;
        
        -- Deal 4: Sustainable Finance Product Suite -> Fourth step
        SELECT ws.id INTO current_step_id
        FROM workflow_steps ws 
        INNER JOIN workflows w ON w.id = ws.workflow_id
        INNER JOIN project_types pt ON pt.default_workflow_id = w.id
        WHERE pt.name = 'Sales Deal' AND ws.is_initial_step = false
        ORDER BY ws.step_order
        OFFSET 2
        LIMIT 1;
        
        IF current_step_id IS NOT NULL THEN
            INSERT INTO wfm_projects (
                id, project_type_id, workflow_id, current_step_id, 
                name, description, created_by_user_id, updated_by_user_id
            )
            SELECT 
                gen_random_uuid(),
                sales_project_type_id,
                w.id,
                current_step_id,
                'WFM Project for Sustainable Finance Product Suite',
                'Automatically created WFM project for seeded deal',
                admin_user_id,
                admin_user_id
            FROM workflows w 
            INNER JOIN project_types pt ON pt.default_workflow_id = w.id
            WHERE pt.id = sales_project_type_id
            RETURNING id INTO current_wfm_project_id;
            
            UPDATE deals 
            SET wfm_project_id = current_wfm_project_id
            WHERE name = 'Sustainable Finance Product Suite' AND user_id = admin_user_id;
            
            RAISE NOTICE 'Assigned Sustainable Finance deal to fourth workflow step';
        END IF;
        
        -- Deal 5: Fleet Electrification Program -> Fifth step or back to first if not enough steps
        SELECT ws.id INTO current_step_id
        FROM workflow_steps ws 
        INNER JOIN workflows w ON w.id = ws.workflow_id
        INNER JOIN project_types pt ON pt.default_workflow_id = w.id
        WHERE pt.name = 'Sales Deal' AND ws.is_initial_step = false
        ORDER BY ws.step_order
        OFFSET 3
        LIMIT 1;
        
        -- If no fifth step, use initial step
        IF current_step_id IS NULL THEN
            SELECT ws.id INTO current_step_id
            FROM workflow_steps ws 
            INNER JOIN workflows w ON w.id = ws.workflow_id
            INNER JOIN project_types pt ON pt.default_workflow_id = w.id
            WHERE pt.name = 'Sales Deal' AND ws.is_initial_step = true
            LIMIT 1;
        END IF;
        
        IF current_step_id IS NOT NULL THEN
            INSERT INTO wfm_projects (
                id, project_type_id, workflow_id, current_step_id, 
                name, description, created_by_user_id, updated_by_user_id
            )
            SELECT 
                gen_random_uuid(),
                sales_project_type_id,
                w.id,
                current_step_id,
                'WFM Project for Fleet Electrification Program',
                'Automatically created WFM project for seeded deal',
                admin_user_id,
                admin_user_id
            FROM workflows w 
            INNER JOIN project_types pt ON pt.default_workflow_id = w.id
            WHERE pt.id = sales_project_type_id
            RETURNING id INTO current_wfm_project_id;
            
            UPDATE deals 
            SET wfm_project_id = current_wfm_project_id
            WHERE name = 'Fleet Electrification Program' AND user_id = admin_user_id;
            
            RAISE NOTICE 'Assigned Fleet Electrification deal to workflow step';
        END IF;
    END IF;
    
    RAISE NOTICE 'BNP Paribas ecosystem seed data completed successfully!';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '- Organizations: %', (SELECT COUNT(*) FROM organizations WHERE user_id = admin_user_id);
    RAISE NOTICE '- People: %', (SELECT COUNT(*) FROM people WHERE user_id = admin_user_id);
    RAISE NOTICE '- Organizational Roles: %', (SELECT COUNT(*) FROM person_organizational_roles WHERE created_by_user_id = admin_user_id);
    RAISE NOTICE '- Person Relationships: %', (SELECT COUNT(*) FROM person_relationships WHERE created_by_user_id = admin_user_id);
    RAISE NOTICE '- Organization Relationships: %', (SELECT COUNT(*) FROM organization_relationships WHERE created_by_user_id = admin_user_id);
    RAISE NOTICE '- Deals: %', (SELECT COUNT(*) FROM deals WHERE user_id = admin_user_id);
    RAISE NOTICE '- WFM Projects: %', (SELECT COUNT(*) FROM wfm_projects WHERE created_by_user_id = admin_user_id);
    RAISE NOTICE '- Stakeholder Analyses: %', (SELECT COUNT(*) FROM stakeholder_analysis WHERE created_by_user_id = admin_user_id);
    
    -- Output organization IDs for frontend
    RAISE NOTICE '';
    RAISE NOTICE '=== ORGANIZATION IDs FOR FRONTEND ===';
    RAISE NOTICE 'BNP PARIBAS GROUP: %', bnp_paribas_group_id;
    RAISE NOTICE 'BNP POLAND: %', bnp_poland_id;
    RAISE NOTICE 'BNP CZECH: %', bnp_czech_id;
    RAISE NOTICE 'ARVAL LEASING: %', arval_leasing_id;
    RAISE NOTICE 'L''Atelier BNP: %', latelier_bnp_id;
    RAISE NOTICE '';
    
END $$; 