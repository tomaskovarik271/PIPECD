-- Migration: Add entity-based references to leads table
-- This enables leads to link directly to person and organization entities
-- while maintaining backward compatibility with string fields

BEGIN;

-- Add entity reference columns to leads table
ALTER TABLE leads
ADD COLUMN person_id UUID REFERENCES people(id) ON DELETE SET NULL,
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX idx_leads_person_id ON leads(person_id) WHERE person_id IS NOT NULL;
CREATE INDEX idx_leads_organization_id ON leads(organization_id) WHERE organization_id IS NOT NULL;

-- Add helpful comments explaining the hybrid approach
COMMENT ON COLUMN leads.person_id IS 'Optional entity reference to person table. When present, takes precedence over contact_name/contact_email/contact_phone fields for entity linking.';
COMMENT ON COLUMN leads.organization_id IS 'Optional entity reference to organization table. When present, takes precedence over company_name field for entity linking.';

-- RLS policies for the new columns (inherit from existing lead policies)
-- No additional RLS needed as these are just references - existing lead RLS covers access

COMMIT; 