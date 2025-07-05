BEGIN;

-- Remove the "position" custom field that duplicates organization_role functionality
-- This field was originally seeded in 20250730000001_seed_custom_field_definitions.sql
-- but is now redundant since we have the person_organization_roles table with role_title

-- Get the custom field definition ID for the position field
DO $$
DECLARE
    position_field_id TEXT;
BEGIN
    -- Find the custom field definition ID for person_position
    SELECT id::TEXT INTO position_field_id 
    FROM public.custom_field_definitions 
    WHERE entity_type = 'PERSON' AND field_name = 'person_position';
    
    -- If the field exists, remove it from all people's custom_field_values JSONB
    IF position_field_id IS NOT NULL THEN
        -- Remove the position field from all people's custom_field_values
        UPDATE public.people 
        SET custom_field_values = custom_field_values - position_field_id
        WHERE custom_field_values ? position_field_id;
        
        RAISE NOTICE 'Removed position custom field values from % people records', 
            (SELECT COUNT(*) FROM public.people WHERE custom_field_values ? position_field_id);
    END IF;
END $$;

-- Remove the custom field definition itself
DELETE FROM public.custom_field_definitions 
WHERE entity_type = 'PERSON' AND field_name = 'person_position';

COMMIT; 