-- Comprehensive Relationship Intelligence Seed Data
-- Instructions:
-- 1. Reset your database: npx supabase db reset
-- 2. Create a new user account through your UI
-- 3. Replace 'YOUR_USER_ID_HERE' below with your actual user ID
-- 4. Run this script: PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres < relationship_intelligence_user_seed.sql

DO $$
DECLARE
    -- REPLACE THIS WITH YOUR ACTUAL USER ID FROM THE UI
    admin_user_id UUID := 'YOUR_USER_ID_HERE';
    
    -- Organization IDs
    acme_org_id UUID;
    global_org_id UUID;
    techstart_org_id UUID;
    
    -- Person IDs
    sarah_chen_id UUID;
    marcus_johnson_id UUID;
    lisa_rodriguez_id UUID;
    david_kim_id UUID;
    jennifer_wong_id UUID;
    michael_brown_id UUID;
    amanda_davis_id UUID;
    robert_taylor_id UUID;
BEGIN
    -- Verify the user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_user_id) THEN
        RAISE EXCEPTION 'User ID % does not exist. Please create a user account first and update the admin_user_id variable.', admin_user_id;
    END IF;
    
    RAISE NOTICE 'Using user ID: %', admin_user_id;
    
    -- Assign admin role to the user (required for permissions)
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT admin_user_id, id FROM public.roles WHERE name = 'admin'
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RAISE NOTICE 'Assigned admin role to user';
    
    -- Insert sample organizations (only if they don't exist)
    INSERT INTO organizations (id, name, address, notes, user_id)
    SELECT gen_random_uuid(), 'Acme Corporation', '123 Technology Drive, San Francisco, CA 94105', 'Leading enterprise software company specializing in CRM and business automation', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Acme Corporation');
    
    INSERT INTO organizations (id, name, address, notes, user_id)
    SELECT gen_random_uuid(), 'Global Industries Inc', '456 Manufacturing Blvd, Detroit, MI 48201', 'Fortune 500 manufacturing conglomerate with operations worldwide', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Global Industries Inc');
    
    INSERT INTO organizations (id, name, address, notes, user_id)
    SELECT gen_random_uuid(), 'TechStart Innovations', '789 Startup Ave, Austin, TX 73301', 'Fast-growing SaaS startup focused on AI-powered business intelligence', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'TechStart Innovations');
    
    -- Get organization IDs
    SELECT id INTO acme_org_id FROM organizations WHERE name = 'Acme Corporation' LIMIT 1;
    SELECT id INTO global_org_id FROM organizations WHERE name = 'Global Industries Inc' LIMIT 1;
    SELECT id INTO techstart_org_id FROM organizations WHERE name = 'TechStart Innovations' LIMIT 1;
    
    RAISE NOTICE 'Organization IDs: Acme=%, Global=%, TechStart=%', acme_org_id, global_org_id, techstart_org_id;
    
    -- Insert sample people (email has unique constraint, so we can use ON CONFLICT)
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id, notes)
    VALUES 
        (gen_random_uuid(), 'Sarah', 'Chen', 'sarah.chen@acme.com', '+1-555-0101', acme_org_id, admin_user_id, 'CEO and founder, final decision authority on all major initiatives'),
        (gen_random_uuid(), 'Marcus', 'Johnson', 'marcus.j@acme.com', '+1-555-0102', acme_org_id, admin_user_id, 'CTO, technical decision maker and innovation leader'),
        (gen_random_uuid(), 'Lisa', 'Rodriguez', 'lisa.r@acme.com', '+1-555-0103', acme_org_id, admin_user_id, 'VP Engineering, oversees all product development'),
        (gen_random_uuid(), 'David', 'Kim', 'david.kim@acme.com', '+1-555-0104', acme_org_id, admin_user_id, 'Procurement Manager, controls vendor relationships and purchasing'),
        (gen_random_uuid(), 'Jennifer', 'Wong', 'jennifer.wong@globalindustries.com', '+1-555-0201', global_org_id, admin_user_id, 'CFO, budget authority and financial oversight'),
        (gen_random_uuid(), 'Michael', 'Brown', 'michael.brown@globalindustries.com', '+1-555-0202', global_org_id, admin_user_id, 'Head of Digital Transformation, leads technology initiatives'),
        (gen_random_uuid(), 'Amanda', 'Davis', 'amanda.davis@techstart.com', '+1-555-0301', techstart_org_id, admin_user_id, 'Founder and CEO, visionary leader with strong technical background'),
        (gen_random_uuid(), 'Robert', 'Taylor', 'robert.taylor@techstart.com', '+1-555-0302', techstart_org_id, admin_user_id, 'VP of Sales, responsible for revenue growth and customer relationships')
    ON CONFLICT (email) DO NOTHING;
    
    -- Get person IDs
    SELECT id INTO sarah_chen_id FROM people WHERE email = 'sarah.chen@acme.com';
    SELECT id INTO marcus_johnson_id FROM people WHERE email = 'marcus.j@acme.com';
    SELECT id INTO lisa_rodriguez_id FROM people WHERE email = 'lisa.r@acme.com';
    SELECT id INTO david_kim_id FROM people WHERE email = 'david.kim@acme.com';
    SELECT id INTO jennifer_wong_id FROM people WHERE email = 'jennifer.wong@globalindustries.com';
    SELECT id INTO michael_brown_id FROM people WHERE email = 'michael.brown@globalindustries.com';
    SELECT id INTO amanda_davis_id FROM people WHERE email = 'amanda.davis@techstart.com';
    SELECT id INTO robert_taylor_id FROM people WHERE email = 'robert.taylor@techstart.com';
    
    RAISE NOTICE 'Created % people', (SELECT COUNT(*) FROM people WHERE user_id = admin_user_id);
    
    -- Insert organizational roles (no unique constraint, so use WHERE NOT EXISTS)
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT sarah_chen_id, acme_org_id, 'Chief Executive Officer', 'Executive', 'c_level', true, '2018-01-15', 50000000, 250, '{"strategic_direction": true, "final_authority": true, "board_relations": true}', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = sarah_chen_id AND organization_id = acme_org_id AND role_title = 'Chief Executive Officer');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT marcus_johnson_id, acme_org_id, 'Chief Technology Officer', 'Technology', 'c_level', true, '2019-03-01', 10000000, 85, '{"technical_strategy": true, "architecture_decisions": true, "innovation": true}', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = marcus_johnson_id AND organization_id = acme_org_id AND role_title = 'Chief Technology Officer');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT lisa_rodriguez_id, acme_org_id, 'VP Engineering', 'Technology', 'vp', true, '2020-06-15', 5000000, 45, '{"product_development": true, "engineering_leadership": true, "technical_delivery": true}', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = lisa_rodriguez_id AND organization_id = acme_org_id AND role_title = 'VP Engineering');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT david_kim_id, acme_org_id, 'Procurement Manager', 'Operations', 'manager', true, '2021-09-01', 2000000, 8, '{"vendor_management": true, "purchasing_decisions": true, "cost_optimization": true}', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = david_kim_id AND organization_id = acme_org_id AND role_title = 'Procurement Manager');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT jennifer_wong_id, global_org_id, 'Chief Financial Officer', 'Finance', 'c_level', true, '2017-04-01', 25000000, 120, '{"financial_strategy": true, "budget_approval": true, "investor_relations": true}', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = jennifer_wong_id AND organization_id = global_org_id AND role_title = 'Chief Financial Officer');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT michael_brown_id, global_org_id, 'Head of Digital Transformation', 'Technology', 'director', true, '2022-01-10', 8000000, 35, '{"digital_strategy": true, "technology_modernization": true, "process_automation": true}', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = michael_brown_id AND organization_id = global_org_id AND role_title = 'Head of Digital Transformation');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT amanda_davis_id, techstart_org_id, 'Founder & CEO', 'Executive', 'founder', true, '2021-01-01', 15000000, 75, '{"company_vision": true, "product_strategy": true, "fundraising": true}', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = amanda_davis_id AND organization_id = techstart_org_id AND role_title = 'Founder & CEO');
    
    INSERT INTO person_organizational_roles (
        person_id, organization_id, role_title, department, seniority_level, 
        is_primary_role, start_date, budget_authority_usd, team_size, 
        responsibilities, created_by_user_id
    )
    SELECT robert_taylor_id, techstart_org_id, 'VP Sales', 'Sales', 'vp', true, '2021-08-15', 3000000, 12, '{"revenue_growth": true, "customer_acquisition": true, "sales_strategy": true}', admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM person_organizational_roles WHERE person_id = robert_taylor_id AND organization_id = techstart_org_id AND role_title = 'VP Sales');
    
    -- Insert person relationships (has unique constraint, so we can use ON CONFLICT)
    INSERT INTO person_relationships (from_person_id, to_person_id, relationship_type, relationship_strength, is_bidirectional, interaction_frequency, relationship_context, created_by_user_id)
    VALUES 
        (marcus_johnson_id, sarah_chen_id, 'reports_to', 9, false, 'weekly', 'Direct report relationship with regular strategic discussions', admin_user_id),
        (lisa_rodriguez_id, marcus_johnson_id, 'reports_to', 8, false, 'weekly', 'Engineering leadership reporting structure', admin_user_id),
        (david_kim_id, sarah_chen_id, 'reports_to', 6, false, 'monthly', 'Procurement oversight and budget approval chain', admin_user_id),
        (lisa_rodriguez_id, david_kim_id, 'collaborates_with', 7, true, 'monthly', 'Technology procurement and vendor evaluation collaboration', admin_user_id),
        (marcus_johnson_id, lisa_rodriguez_id, 'manages', 8, false, 'daily', 'Direct management of engineering organization', admin_user_id),
        (sarah_chen_id, amanda_davis_id, 'mentors', 6, false, 'quarterly', 'Mentorship relationship - Sarah advises Amanda on scaling strategies', admin_user_id),
        (marcus_johnson_id, michael_brown_id, 'collaborates_with', 5, true, 'monthly', 'Technology partnership discussions and knowledge sharing', admin_user_id)
    ON CONFLICT (from_person_id, to_person_id, relationship_type) DO NOTHING;
    
    -- Insert stakeholder analysis (no unique constraint, so use WHERE NOT EXISTS)
    INSERT INTO stakeholder_analysis (person_id, organization_id, influence_score, decision_authority, budget_authority_level, engagement_level, communication_preference, pain_points, motivations, approach_strategy, next_best_action, ai_personality_profile, ai_communication_style, created_by_user_id)
    SELECT sarah_chen_id, acme_org_id, 9, 'final_decision', 'unlimited', 'supporter', 'email', 
         '["scaling_challenges", "competitive_pressure", "talent_retention"]',
         '["company_growth", "market_leadership", "innovation"]',
         'Focus on strategic value proposition and ROI. Emphasize scalability and competitive advantages.',
         'Schedule executive briefing to discuss strategic partnership opportunities',
         '{"leadership_style": "visionary", "decision_pattern": "data_driven", "risk_tolerance": "moderate"}',
         'Direct and strategic, prefers executive summaries with clear ROI metrics', 
         admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM stakeholder_analysis WHERE person_id = sarah_chen_id AND organization_id = acme_org_id);
    
    INSERT INTO stakeholder_analysis (person_id, organization_id, influence_score, decision_authority, budget_authority_level, engagement_level, communication_preference, pain_points, motivations, approach_strategy, next_best_action, ai_personality_profile, ai_communication_style, created_by_user_id)
    SELECT marcus_johnson_id, acme_org_id, 8, 'strong_influence', 'high', 'champion', 'slack',
         '["technical_debt", "security_concerns", "integration_complexity"]',
         '["technical_excellence", "innovation", "team_productivity"]', 
         'Lead with technical architecture and security benefits. Provide detailed technical documentation.',
         'Arrange technical deep-dive session with engineering team',
         '{"leadership_style": "collaborative", "decision_pattern": "technical_merit", "risk_tolerance": "low"}',
         'Technical and detailed, appreciates in-depth technical discussions',
         admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM stakeholder_analysis WHERE person_id = marcus_johnson_id AND organization_id = acme_org_id);
    
    INSERT INTO stakeholder_analysis (person_id, organization_id, influence_score, decision_authority, budget_authority_level, engagement_level, communication_preference, pain_points, motivations, approach_strategy, next_best_action, ai_personality_profile, ai_communication_style, created_by_user_id)
    SELECT lisa_rodriguez_id, acme_org_id, 7, 'recommender', 'medium', 'neutral', 'email',
         '["resource_constraints", "delivery_timelines", "technical_complexity"]',
         '["product_quality", "team_efficiency", "technical_growth"]',
         'Emphasize development efficiency gains and reduced technical overhead.',
         'Provide product roadmap and technical implementation timeline',
         '{"leadership_style": "hands_on", "decision_pattern": "practical", "risk_tolerance": "moderate"}',
         'Practical and implementation-focused, wants concrete deliverables',
         admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM stakeholder_analysis WHERE person_id = lisa_rodriguez_id AND organization_id = acme_org_id);
    
    INSERT INTO stakeholder_analysis (person_id, organization_id, influence_score, decision_authority, budget_authority_level, engagement_level, communication_preference, pain_points, motivations, approach_strategy, next_best_action, ai_personality_profile, ai_communication_style, created_by_user_id)
    SELECT david_kim_id, acme_org_id, 6, 'gatekeeper', 'medium', 'skeptic', 'phone',
         '["budget_constraints", "vendor_management", "cost_control"]',
         '["cost_optimization", "vendor_reliability", "process_efficiency"]',
         'Focus on cost-benefit analysis and vendor management efficiency gains.',
         'Prepare detailed pricing proposal with cost comparison analysis',
         '{"leadership_style": "analytical", "decision_pattern": "cost_focused", "risk_tolerance": "low"}',
         'Detailed and cost-conscious, requires comprehensive vendor evaluation',
         admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM stakeholder_analysis WHERE person_id = david_kim_id AND organization_id = acme_org_id);
    
    INSERT INTO stakeholder_analysis (person_id, organization_id, influence_score, decision_authority, budget_authority_level, engagement_level, communication_preference, pain_points, motivations, approach_strategy, next_best_action, ai_personality_profile, ai_communication_style, created_by_user_id)
    SELECT jennifer_wong_id, global_org_id, 9, 'final_decision', 'unlimited', 'neutral', 'formal_meetings',
         '["financial_performance", "investor_relations", "cost_management"]',
         '["financial_growth", "operational_efficiency", "shareholder_value"]',
         'Present comprehensive business case with clear financial metrics and ROI projections.',
         'Schedule formal presentation with financial impact analysis',
         '{"leadership_style": "analytical", "decision_pattern": "financial_metrics", "risk_tolerance": "conservative"}',
         'Formal and metrics-driven, requires detailed financial justification',
         admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM stakeholder_analysis WHERE person_id = jennifer_wong_id AND organization_id = global_org_id);
    
    INSERT INTO stakeholder_analysis (person_id, organization_id, influence_score, decision_authority, budget_authority_level, engagement_level, communication_preference, pain_points, motivations, approach_strategy, next_best_action, ai_personality_profile, ai_communication_style, created_by_user_id)
    SELECT michael_brown_id, global_org_id, 7, 'strong_influence', 'high', 'supporter', 'email',
         '["digital_transformation", "legacy_systems", "change_management"]',
         '["modernization", "efficiency_gains", "competitive_advantage"]',
         'Highlight digital transformation benefits and legacy system modernization capabilities.',
         'Conduct technology assessment and modernization roadmap session',
         '{"leadership_style": "transformational", "decision_pattern": "innovation_focused", "risk_tolerance": "moderate"}',
         'Innovation-focused, interested in cutting-edge solutions and transformation',
         admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM stakeholder_analysis WHERE person_id = michael_brown_id AND organization_id = global_org_id);
    
    INSERT INTO stakeholder_analysis (person_id, organization_id, influence_score, decision_authority, budget_authority_level, engagement_level, communication_preference, pain_points, motivations, approach_strategy, next_best_action, ai_personality_profile, ai_communication_style, created_by_user_id)
    SELECT amanda_davis_id, techstart_org_id, 8, 'final_decision', 'high', 'champion', 'slack',
         '["rapid_scaling", "funding_pressures", "market_competition"]',
         '["product_innovation", "market_capture", "team_scaling"]',
         'Focus on rapid implementation and scaling benefits. Emphasize competitive advantages.',
         'Arrange founder-to-founder discussion on scaling strategies',
         '{"leadership_style": "entrepreneurial", "decision_pattern": "speed_focused", "risk_tolerance": "high"}',
         'Entrepreneurial and fast-paced, values quick decisions and rapid implementation',
         admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM stakeholder_analysis WHERE person_id = amanda_davis_id AND organization_id = techstart_org_id);
    
    INSERT INTO stakeholder_analysis (person_id, organization_id, influence_score, decision_authority, budget_authority_level, engagement_level, communication_preference, pain_points, motivations, approach_strategy, next_best_action, ai_personality_profile, ai_communication_style, created_by_user_id)
    SELECT robert_taylor_id, techstart_org_id, 6, 'influencer', 'medium', 'supporter', 'phone',
         '["sales_targets", "customer_acquisition", "revenue_growth"]',
         '["sales_efficiency", "customer_success", "revenue_scaling"]',
         'Demonstrate how solution can accelerate sales processes and improve customer relationships.',
         'Provide sales enablement demo and customer success case studies',
         '{"leadership_style": "results_driven", "decision_pattern": "revenue_impact", "risk_tolerance": "moderate"}',
         'Results-oriented, focused on measurable sales and revenue impact',
         admin_user_id
    WHERE NOT EXISTS (SELECT 1 FROM stakeholder_analysis WHERE person_id = robert_taylor_id AND organization_id = techstart_org_id);
    
    -- Insert organization relationships (has unique constraint, so we can use ON CONFLICT)
    INSERT INTO organization_relationships (parent_org_id, child_org_id, relationship_type, relationship_strength, start_date, notes, created_by_user_id)
    VALUES 
        (acme_org_id, techstart_org_id, 'partnership', 7, '2023-06-01', 'Strategic technology partnership for AI integration', admin_user_id),
        (global_org_id, acme_org_id, 'customer', 8, '2022-01-15', 'Global Industries is a major enterprise customer of Acme', admin_user_id)
    ON CONFLICT (parent_org_id, child_org_id, relationship_type) DO NOTHING;
    
    -- Insert territories (using WHERE NOT EXISTS since no unique constraint on name)
    INSERT INTO territories (name, territory_type, region, industry_focus, assigned_user_id, metadata)
    SELECT 'North America Enterprise', 'geographic', 'North America', ARRAY['enterprise', 'fortune_500'], admin_user_id, '{"account_size_range": "enterprise"}'
    WHERE NOT EXISTS (SELECT 1 FROM territories WHERE name = 'North America Enterprise');
    
    INSERT INTO territories (name, territory_type, region, industry_focus, assigned_user_id, metadata)
    SELECT 'West Coast Tech', 'geographic', 'California, Oregon, Washington', ARRAY['technology', 'startups', 'saas'], admin_user_id, '{"account_size_range": "mid_market"}'
    WHERE NOT EXISTS (SELECT 1 FROM territories WHERE name = 'West Coast Tech');
    
    INSERT INTO territories (name, territory_type, region, industry_focus, assigned_user_id, metadata)
    SELECT 'Manufacturing Vertical', 'industry', NULL, ARRAY['manufacturing', 'industrial', 'automotive'], admin_user_id, '{"account_size_range": "enterprise", "global_scope": true}'
    WHERE NOT EXISTS (SELECT 1 FROM territories WHERE name = 'Manufacturing Vertical');
    
    -- Insert relationship insights (using WHERE NOT EXISTS for safety)
    INSERT INTO relationship_insights (insight_type, entity_type, entity_id, priority_level, insight_title, insight_description, recommended_actions, confidence_score, ai_reasoning, status, expires_at)
    SELECT 'missing_stakeholder', 'organization', acme_org_id, 'high',
         'Missing Chief Legal Officer in Stakeholder Network',
         'Analysis indicates no legal decision maker identified for enterprise contract approvals. This represents a significant risk for deals >$500K.',
         '{"primary_action": "Identify and engage Chief Legal Officer", "secondary_actions": ["Schedule legal review meeting", "Prepare contract terms overview"]}',
         0.87, 'Pattern analysis of enterprise deals shows 94% require legal approval. No legal stakeholders currently mapped.',
         'new', NOW() + INTERVAL '30 days'
    WHERE NOT EXISTS (SELECT 1 FROM relationship_insights WHERE insight_title = 'Missing Chief Legal Officer in Stakeholder Network' AND entity_id = acme_org_id);
    
    INSERT INTO relationship_insights (insight_type, entity_type, entity_id, priority_level, insight_title, insight_description, recommended_actions, confidence_score, ai_reasoning, status, expires_at)
    SELECT 'influence_pattern', 'organization', acme_org_id, 'medium',
         'Strong Technical Influence Cluster Identified',
         'CTO and VP Engineering form a highly influential technical decision cluster. Engaging both increases technical approval probability by 340%.',
         '{"primary_action": "Coordinate joint technical presentation", "secondary_actions": ["Prepare technical architecture docs", "Schedule demo session"]}',
         0.92, 'Relationship strength analysis shows Marcus-Lisa collaboration score of 8/10 with daily interaction frequency.',
         'new', NOW() + INTERVAL '30 days'
    WHERE NOT EXISTS (SELECT 1 FROM relationship_insights WHERE insight_title = 'Strong Technical Influence Cluster Identified' AND entity_id = acme_org_id);
    
    INSERT INTO relationship_insights (insight_type, entity_type, entity_id, priority_level, insight_title, insight_description, recommended_actions, confidence_score, ai_reasoning, status, expires_at)
    SELECT 'risk_alert', 'organization', acme_org_id, 'high',
         'Procurement Gatekeeper Shows Skeptical Engagement',
         'David Kim (Procurement Manager) demonstrates skeptical engagement level despite gatekeeper authority. Risk of procurement bottleneck.',
         '{"primary_action": "Schedule cost-benefit analysis meeting", "secondary_actions": ["Prepare vendor comparison analysis", "Develop procurement efficiency proposal"]}',
         0.78, 'Engagement analysis indicates skeptical positioning with cost-focused decision pattern and conservative risk tolerance.',
         'new', NOW() + INTERVAL '30 days'
    WHERE NOT EXISTS (SELECT 1 FROM relationship_insights WHERE insight_title = 'Procurement Gatekeeper Shows Skeptical Engagement' AND entity_id = acme_org_id);
    
    INSERT INTO relationship_insights (insight_type, entity_type, entity_id, priority_level, insight_title, insight_description, recommended_actions, confidence_score, ai_reasoning, status, expires_at)
    SELECT 'opportunity', 'organization', global_org_id, 'medium',
         'Digital Transformation Champion Identified',
         'Michael Brown shows strong support for modernization initiatives. High influence on technology decisions with transformation mandate.',
         '{"primary_action": "Present digital transformation roadmap", "secondary_actions": ["Conduct legacy system assessment", "Provide modernization timeline"]}',
         0.83, 'Role analysis shows transformation mandate with $8M budget authority and innovation-focused decision pattern.',
         'new', NOW() + INTERVAL '30 days'
    WHERE NOT EXISTS (SELECT 1 FROM relationship_insights WHERE insight_title = 'Digital Transformation Champion Identified' AND entity_id = global_org_id);
    
    INSERT INTO relationship_insights (insight_type, entity_type, entity_id, priority_level, insight_title, insight_description, recommended_actions, confidence_score, ai_reasoning, status, expires_at)
    SELECT 'relationship_strength_change', 'organization', techstart_org_id, 'low',
         'Founder Mentorship Relationship Strengthening',
         'Cross-organizational mentorship between Sarah Chen (Acme CEO) and Amanda Davis (TechStart CEO) creating partnership opportunities.',
         '{"primary_action": "Leverage mentorship for strategic partnership discussions", "secondary_actions": ["Explore joint venture opportunities", "Consider technology collaboration"]}',
         0.65, 'Relationship tracking shows increasing interaction frequency and collaboration discussions.',
         'new', NOW() + INTERVAL '30 days'
    WHERE NOT EXISTS (SELECT 1 FROM relationship_insights WHERE insight_title = 'Founder Mentorship Relationship Strengthening' AND entity_id = techstart_org_id);
    
    RAISE NOTICE 'Relationship Intelligence seed data completed successfully!';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '- Organizations: %', (SELECT COUNT(*) FROM organizations WHERE user_id = admin_user_id);
    RAISE NOTICE '- People: %', (SELECT COUNT(*) FROM people WHERE user_id = admin_user_id);
    RAISE NOTICE '- Organizational Roles: %', (SELECT COUNT(*) FROM person_organizational_roles WHERE created_by_user_id = admin_user_id);
    RAISE NOTICE '- Person Relationships: %', (SELECT COUNT(*) FROM person_relationships WHERE created_by_user_id = admin_user_id);
    RAISE NOTICE '- Stakeholder Analyses: %', (SELECT COUNT(*) FROM stakeholder_analysis WHERE created_by_user_id = admin_user_id);
    RAISE NOTICE '- Organization Relationships: %', (SELECT COUNT(*) FROM organization_relationships WHERE created_by_user_id = admin_user_id);
    RAISE NOTICE '- Territories: %', (SELECT COUNT(*) FROM territories WHERE assigned_user_id = admin_user_id);
    RAISE NOTICE '- AI Insights: %', (SELECT COUNT(*) FROM relationship_insights);
    
    -- Output the organization IDs for the frontend
    RAISE NOTICE '';
    RAISE NOTICE '=== ORGANIZATION IDs FOR FRONTEND ===';
    RAISE NOTICE 'Acme Corporation: %', acme_org_id;
    RAISE NOTICE 'Global Industries Inc: %', global_org_id;
    RAISE NOTICE 'TechStart Innovations: %', techstart_org_id;
    RAISE NOTICE '';
    RAISE NOTICE 'Update your frontend relationships.tsx with these IDs!';
        
END $$; 