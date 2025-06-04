-- 20250730000005_add_lead_entity_type.sql
-- PipeCD Leads Management: Add LEAD Entity Type to Enum
-- This must be done in a separate transaction from its usage

-- Add LEAD to entity_type enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'LEAD' AND enumtypid = 'public.entity_type'::regtype) THEN
    ALTER TYPE public.entity_type ADD VALUE 'LEAD';
  END IF;
END $$; 