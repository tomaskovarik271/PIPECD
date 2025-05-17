-- Migration to create the custom_field_definitions table
-- and associated types for entity and field types.

BEGIN;

-- Define ENUM types for custom field types and entity types
CREATE TYPE public.custom_field_type AS ENUM (
    'TEXT',
    'NUMBER',
    'DATE',
    'BOOLEAN',
    'DROPDOWN',
    'MULTI_SELECT'
);

CREATE TYPE public.entity_type AS ENUM (
    'DEAL',
    'PERSON',
    'ORGANIZATION'
    -- Add more as needed in the future by altering the type
);

-- Create the custom_field_definitions table
CREATE TABLE public.custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type public.entity_type NOT NULL,
    field_name TEXT NOT NULL, -- Internal name, unique per entity_type
    field_label TEXT NOT NULL, -- Display name for UI
    field_type public.custom_field_type NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    dropdown_options JSONB NULL, -- For 'DROPDOWN' or 'MULTI_SELECT' types
    is_active BOOLEAN DEFAULT TRUE, -- For soft deletion
    display_order INT DEFAULT 0, -- For ordering fields in UI
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT unique_field_name_per_entity UNIQUE (entity_type, field_name)
);

-- Add comments to the table and specific columns
COMMENT ON TABLE public.custom_field_definitions IS 'Stores definitions for user-created custom fields.';
COMMENT ON COLUMN public.custom_field_definitions.dropdown_options IS 'Stores options for dropdown or multi-select field types as an array of objects, e.g., [{"value": "opt1", "label": "Option 1"}]';
COMMENT ON COLUMN public.custom_field_definitions.is_active IS 'When false, the field is hidden but not deleted from definitions to preserve data integrity of existing values.';
COMMENT ON COLUMN public.custom_field_definitions.field_name IS 'Internal system name for the field, should be unique per entity_type. Used for referencing the field in code or integrations if needed.';
COMMENT ON COLUMN public.custom_field_definitions.field_label IS 'User-friendly display name for the field shown in the UI.';

-- Create indexes for common query patterns
CREATE INDEX idx_custom_field_definitions_entity_type ON public.custom_field_definitions(entity_type);
CREATE INDEX idx_custom_field_definitions_is_active ON public.custom_field_definitions(is_active);

-- Enable Row Level Security
ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow all authenticated users to read active custom field definitions.
CREATE POLICY "Allow authenticated users to read active custom field definitions"
ON public.custom_field_definitions
FOR SELECT
USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Allow admins (users with 'custom_fields.manage_definitions' permission) to read all definitions, including inactive ones.
CREATE POLICY "Allow admins to read all custom field definitions"
ON public.custom_field_definitions
FOR SELECT
USING ( (SELECT public.check_permission(auth.uid(), 'manage_definitions', 'custom_fields')) );

-- Allow admins to insert new custom field definitions.
CREATE POLICY "Allow admins to insert custom field definitions"
ON public.custom_field_definitions
FOR INSERT
WITH CHECK ( (SELECT public.check_permission(auth.uid(), 'manage_definitions', 'custom_fields')) );

-- Allow admins to update existing custom field definitions.
CREATE POLICY "Allow admins to update custom field definitions"
ON public.custom_field_definitions
FOR UPDATE
USING ( (SELECT public.check_permission(auth.uid(), 'manage_definitions', 'custom_fields')) )
WITH CHECK ( (SELECT public.check_permission(auth.uid(), 'manage_definitions', 'custom_fields')) );

-- No DELETE policy is defined by default, encouraging soft deletion via the 'is_active' flag.
-- If hard deletion by admins is ever required, a specific policy would need to be added.

-- Apply the moddatetime extension trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.custom_field_definitions
  FOR EACH ROW
  EXECUTE PROCEDURE extensions.moddatetime (updated_at);

COMMIT;
