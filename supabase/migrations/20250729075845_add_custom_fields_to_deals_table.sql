-- Migration to add the custom_field_values JSONB column to the deals table.

BEGIN;

ALTER TABLE public.deals
ADD COLUMN custom_field_values JSONB DEFAULT '{}' NOT NULL;

COMMENT ON COLUMN public.deals.custom_field_values IS 'Stores key-value pairs of custom field data, where key is custom_field_definition_id and value is the user-provided data.';

-- Add a GIN index for efficient querying of JSONB data
CREATE INDEX idx_deals_custom_field_values ON public.deals USING GIN (custom_field_values);

COMMIT;
