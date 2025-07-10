-- 20250730000089_cleanup_custom_field_definitions.sql
-- Clean up all custom field definitions seeded across multiple migrations
-- These will be moved to seed files for better maintainability

BEGIN;

-- Remove all seeded custom field definitions with proper data cleanup
DO $$
DECLARE
    field_record RECORD;
    removed_count INTEGER := 0;
BEGIN
    -- Get all custom field definitions that were seeded in migrations
    FOR field_record IN 
        SELECT id, entity_type, field_name, field_label
        FROM public.custom_field_definitions 
        WHERE field_name IN (
            -- From 20250730000001_seed_custom_field_definitions.sql
            'person_position',  -- Already removed in 20250730000082
            'organization_industry',
            'deal_domain',
            
            -- From 20250730000014_seed_lead_custom_field_definitions.sql  
            'lead_industry',
            'lead_company_size',
            'lead_budget_range',
            'lead_decision_timeline', 
            'lead_temperature',
            'lead_pain_points',
            'lead_contact_role',
            'lead_priority',
            
            -- From 20250730000018_add_person_linkedin_custom_field.sql
            'person_linkedin_profile',
            'person_linkedin',  -- Handle potential duplicate created by seed file
            
            -- From 20250730000084_create_deal_team_members_custom_field.sql
            'deal_team_members'
        )
    LOOP
        -- Remove custom field values from entity records
        CASE field_record.entity_type
            WHEN 'PERSON' THEN
                UPDATE public.people 
                SET custom_field_values = custom_field_values - field_record.id::TEXT
                WHERE custom_field_values ? field_record.id::TEXT;
                
            WHEN 'ORGANIZATION' THEN  
                UPDATE public.organizations
                SET custom_field_values = custom_field_values - field_record.id::TEXT
                WHERE custom_field_values ? field_record.id::TEXT;
                
            WHEN 'DEAL' THEN
                UPDATE public.deals
                SET custom_field_values = custom_field_values - field_record.id::TEXT  
                WHERE custom_field_values ? field_record.id::TEXT;
                
            WHEN 'LEAD' THEN
                UPDATE public.leads
                SET custom_field_values = custom_field_values - field_record.id::TEXT
                WHERE custom_field_values ? field_record.id::TEXT;
        END CASE;
        
        removed_count := removed_count + 1;
        RAISE NOTICE 'Cleaned data for custom field: % (% - %)', 
            field_record.field_name, field_record.entity_type, field_record.field_label;
    END LOOP;
    
    -- Remove the custom field definitions themselves
    DELETE FROM public.custom_field_definitions 
    WHERE field_name IN (
        'organization_industry', 'deal_domain',
        'lead_industry', 'lead_company_size', 'lead_budget_range', 'lead_decision_timeline', 
        'lead_temperature', 'lead_pain_points', 'lead_contact_role', 'lead_priority',
        'person_linkedin_profile', 'person_linkedin', 'deal_team_members'
    );
    
    RAISE NOTICE 'Custom field definitions cleanup completed: % fields processed', removed_count;
    RAISE NOTICE 'NOTE: person_position was already removed in migration 20250730000082';
    RAISE NOTICE 'All custom field definitions will now be managed via seed files';
END $$;

COMMIT; 