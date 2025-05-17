-- Migration to add the custom_field_values JSONB column to the organizations table.

BEGIN;

ALTER TABLE public.organizations
ADD COLUMN custom_field_values JSONB DEFAULT '{}' NOT NULL;

COMMENT ON COLUMN public.organizations.custom_field_values IS 'Stores key-value pairs of custom field data, where key is custom_field_definition_id and value is the user-provided data.';

-- Add a GIN index for efficient querying of JSONB data
CREATE INDEX idx_organizations_custom_field_values ON public.organizations USING GIN (custom_field_values);

COMMIT;
