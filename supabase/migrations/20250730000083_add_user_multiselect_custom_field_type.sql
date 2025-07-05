BEGIN;

-- Add USER_MULTISELECT to the custom_field_type enum
-- This allows selecting multiple users for custom fields like "Deal Team", "Reviewers", etc.
ALTER TYPE public.custom_field_type ADD VALUE 'USER_MULTISELECT';

-- Add comments explaining the new field type
COMMENT ON TYPE public.custom_field_type IS 'Supported custom field types: TEXT, NUMBER, DATE, BOOLEAN, DROPDOWN, MULTI_SELECT, USER_MULTISELECT. USER_MULTISELECT stores user IDs in selectedOptionValues array.';

COMMIT; 