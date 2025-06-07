-- Migration: Add project_id field to deals table
-- 4-digit unique identifier for external system integration

BEGIN;

-- Add project_id column to deals table
ALTER TABLE public.deals
ADD COLUMN project_id VARCHAR(4) UNIQUE;

-- Add index for performance
CREATE INDEX idx_deals_project_id ON public.deals(project_id);

-- Create function to generate unique 4-digit project ID
CREATE OR REPLACE FUNCTION generate_project_id()
RETURNS VARCHAR(4) AS $$
DECLARE
    new_id VARCHAR(4);
    counter INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    LOOP
        -- Generate a random 4-digit number (1000-9999)
        new_id := LPAD((1000 + FLOOR(RANDOM() * 9000))::TEXT, 4, '0');
        
        -- Check if this ID already exists
        IF NOT EXISTS (SELECT 1 FROM deals WHERE project_id = new_id) THEN
            RETURN new_id;
        END IF;
        
        counter := counter + 1;
        IF counter >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique project_id after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-generate project_id on insert
CREATE OR REPLACE FUNCTION trigger_generate_project_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if project_id is NULL
    IF NEW.project_id IS NULL THEN
        NEW.project_id := generate_project_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate project_id for new deals
CREATE TRIGGER generate_deal_project_id
    BEFORE INSERT ON public.deals
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_project_id();

-- Backfill existing deals with project_ids
DO $$
DECLARE
    deal_record RECORD;
BEGIN
    FOR deal_record IN SELECT id FROM deals WHERE project_id IS NULL
    LOOP
        UPDATE deals 
        SET project_id = generate_project_id()
        WHERE id = deal_record.id;
    END LOOP;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN public.deals.project_id IS '4-digit unique identifier for external system integration. Auto-generated on deal creation.';

COMMIT; 