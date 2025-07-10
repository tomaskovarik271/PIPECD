-- 02_custom_fields.sql
-- CUSTOM FIELD DEFINITIONS SEEDING
-- ==================================
-- These were moved from various migrations for better maintainability
-- Original sources:
-- - 20250730000001_seed_custom_field_definitions.sql
-- - 20250730000014_seed_lead_custom_field_definitions.sql  
-- - 20250730000018_add_person_linkedin_custom_field.sql
-- - 20250730000084_create_deal_team_members_custom_field.sql

DO $$
BEGIN
    RAISE NOTICE 'Seeding custom field definitions...';
    
    -- ORGANIZATION CUSTOM FIELDS
    -- ===========================
    
    -- Organization: Industry (DROPDOWN) 
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
    ) VALUES (
        'ORGANIZATION', 
        'organization_industry', 
        'Industry', 
        'DROPDOWN', 
        '[{"value": "tech", "label": "Technology"}, {"value": "finance", "label": "Finance"}, {"value": "healthcare", "label": "Healthcare"}, {"value": "retail", "label": "Retail"}, {"value": "manufacturing", "label": "Manufacturing"}, {"value": "other", "label": "Other"}]', 
        FALSE, 
        TRUE, 
        1
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- PERSON CUSTOM FIELDS
    -- =====================
    
    -- Person: LinkedIn Profile (TEXT)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, is_required, is_active, display_order
    ) VALUES (
        'PERSON', 'person_linkedin_profile', 'LinkedIn Profile', 'TEXT', FALSE, TRUE, 2
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- DEAL CUSTOM FIELDS  
    -- ===================
    
    -- Deal: Domain (DROPDOWN)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
    ) VALUES (
        'DEAL', 
        'deal_domain', 
        'Domain', 
        'DROPDOWN', 
        '[{"value": "mena", "label": "MENA"}, {"value": "elevator", "label": "Elevator"}, {"value": "other", "label": "Other"}]', 
        FALSE, 
        TRUE, 
        1
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Deal: Team Members (USER_MULTISELECT)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, is_required, is_active, display_order
    ) VALUES (
        'DEAL', 'deal_team_members', 'Deal Team Members', 'USER_MULTISELECT', FALSE, TRUE, 2
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Deal: AI in Scope (DROPDOWN)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
    ) VALUES (
        'DEAL', 
        'AI_in_scope', 
        'AI in Scope', 
        'DROPDOWN', 
        '[{"value": "yes", "label": "Yes"}, {"value": "no", "label": "No"}, {"value": "maybe", "label": "Maybe"}]', 
        FALSE, 
        TRUE, 
        3
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Deal: Microsite Included (BOOLEAN)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, is_required, is_active, display_order
    ) VALUES (
        'DEAL', 'microsite_bool', 'Microsite Included', 'BOOLEAN', FALSE, TRUE, 4
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Deal: Product Type (MULTI_SELECT) - Note: preserving original typo in field name
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
    ) VALUES (
        'DEAL', 
        'product_tpye', 
        'Product Type', 
        'MULTI_SELECT', 
        '[{"value": "web_development", "label": "Web Development"}, {"value": "mobile_app", "label": "Mobile App"}, {"value": "ai_solution", "label": "AI Solution"}, {"value": "consulting", "label": "Consulting"}, {"value": "maintenance", "label": "Maintenance"}, {"value": "other", "label": "Other"}]', 
        FALSE, 
        TRUE, 
        5
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Deal: Sales Type (DROPDOWN)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
    ) VALUES (
        'DEAL', 
        'Sales_type', 
        'Sales Type', 
        'DROPDOWN', 
        '[{"value": "new_sale", "label": "New Sale"}, {"value": "x_sell", "label": "Cross-sell"}, {"value": "upsell", "label": "Upsell"}]', 
        FALSE, 
        TRUE, 
        6
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Deal: Microsite Testing in Scope (DROPDOWN)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
    ) VALUES (
        'DEAL', 
        'Microsite_testing_in_scope', 
        'Microsite Testing in Scope', 
        'DROPDOWN', 
        '[{"value": "yes", "label": "Yes"}, {"value": "no", "label": "No"}]', 
        FALSE, 
        TRUE, 
        7
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Deal: Project End Date (DATE)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, is_required, is_active, display_order
    ) VALUES (
        'DEAL', 'End_date_of_a_project', 'Project End Date', 'DATE', FALSE, TRUE, 8
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Deal: Project Start Date (DATE)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, is_required, is_active, display_order
    ) VALUES (
        'DEAL', 'Start_date_of_a_project', 'Project Start Date', 'DATE', FALSE, TRUE, 9
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Deal: Project Function Type (DROPDOWN)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
    ) VALUES (
        'DEAL', 
        'type_of_project_function', 
        'Project Function Type', 
        'DROPDOWN', 
        '[{"value": "frontend", "label": "Frontend Development"}, {"value": "backend", "label": "Backend Development"}, {"value": "fullstack", "label": "Full Stack Development"}, {"value": "design", "label": "UI/UX Design"}, {"value": "ai_ml", "label": "AI/ML Development"}, {"value": "devops", "label": "DevOps"}, {"value": "qa_testing", "label": "QA/Testing"}, {"value": "consulting", "label": "Consulting"}, {"value": "other", "label": "Other"}]', 
        FALSE, 
        TRUE, 
        10
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- LEAD CUSTOM FIELDS
    -- ===================
    
    -- Lead: Industry (DROPDOWN)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
    ) VALUES (
        'LEAD', 
        'lead_industry', 
        'Industry', 
        'DROPDOWN', 
        '[{"value": "technology", "label": "Technology"}, {"value": "healthcare", "label": "Healthcare"}, {"value": "finance", "label": "Finance"}, {"value": "education", "label": "Education"}, {"value": "retail", "label": "Retail"}, {"value": "manufacturing", "label": "Manufacturing"}, {"value": "other", "label": "Other"}]', 
        FALSE, 
        TRUE, 
        1
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Lead: Company Size (DROPDOWN)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
    ) VALUES (
        'LEAD', 
        'lead_company_size', 
        'Company Size', 
        'DROPDOWN', 
        '[{"value": "1-10", "label": "1-10 employees"}, {"value": "11-50", "label": "11-50 employees"}, {"value": "51-200", "label": "51-200 employees"}, {"value": "201-500", "label": "201-500 employees"}, {"value": "500+", "label": "500+ employees"}]', 
        FALSE, 
        TRUE, 
        2
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Lead: Budget Range (DROPDOWN)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
    ) VALUES (
        'LEAD', 
        'lead_budget_range', 
        'Budget Range', 
        'DROPDOWN', 
        '[{"value": "under-10k", "label": "Under $10,000"}, {"value": "10k-50k", "label": "$10,000 - $50,000"}, {"value": "50k-100k", "label": "$50,000 - $100,000"}, {"value": "100k-500k", "label": "$100,000 - $500,000"}, {"value": "500k+", "label": "$500,000+"}]', 
        FALSE, 
        TRUE, 
        3
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Lead: Decision Timeline (DROPDOWN)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
    ) VALUES (
        'LEAD', 
        'lead_decision_timeline', 
        'Decision Timeline', 
        'DROPDOWN', 
        '[{"value": "immediate", "label": "Immediate (< 1 month)"}, {"value": "short", "label": "Short term (1-3 months)"}, {"value": "medium", "label": "Medium term (3-6 months)"}, {"value": "long", "label": "Long term (6+ months)"}, {"value": "unknown", "label": "Unknown"}]', 
        FALSE, 
        TRUE, 
        4
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Lead: Temperature (DROPDOWN)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
    ) VALUES (
        'LEAD', 
        'lead_temperature', 
        'Lead Temperature', 
        'DROPDOWN', 
        '[{"value": "hot", "label": "Hot"}, {"value": "warm", "label": "Warm"}, {"value": "cold", "label": "Cold"}, {"value": "frozen", "label": "Frozen"}]', 
        FALSE, 
        TRUE, 
        5
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Lead: Pain Points (TEXT)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, is_required, is_active, display_order
    ) VALUES (
        'LEAD', 'lead_pain_points', 'Pain Points', 'TEXT', FALSE, TRUE, 6
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Lead: Contact Role (DROPDOWN)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
    ) VALUES (
        'LEAD', 
        'lead_contact_role', 
        'Contact Role', 
        'DROPDOWN', 
        '[{"value": "decision_maker", "label": "Decision Maker"}, {"value": "influencer", "label": "Influencer"}, {"value": "user", "label": "End User"}, {"value": "gatekeeper", "label": "Gatekeeper"}, {"value": "other", "label": "Other"}]', 
        FALSE, 
        TRUE, 
        7
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    -- Lead: Priority (DROPDOWN)
    INSERT INTO public.custom_field_definitions (
        entity_type, field_name, field_label, field_type, dropdown_options, is_required, is_active, display_order
    ) VALUES (
        'LEAD', 
        'lead_priority', 
        'Priority', 
        'DROPDOWN', 
        '[{"value": "high", "label": "High"}, {"value": "medium", "label": "Medium"}, {"value": "low", "label": "Low"}]', 
        FALSE, 
        TRUE, 
        8
    ) ON CONFLICT (entity_type, field_name) DO NOTHING;
    
    RAISE NOTICE 'Custom field definitions seeding completed! Created 20 custom field definitions across 4 entity types.';
END $$; 

