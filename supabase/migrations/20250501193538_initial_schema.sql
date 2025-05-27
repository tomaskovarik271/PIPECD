-- Create contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Basic contact info
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE, -- Consider constraints/validation
  phone TEXT,
  company TEXT, -- This might be organization name, or a separate link to organizations is needed
  notes TEXT
);

-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Or NOT NULL based on requirements
  name TEXT NOT NULL,
  address TEXT,
  notes TEXT
  -- Add other relevant fields for an organization
);

-- Create deals table
CREATE TABLE deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2),
  expected_close_date DATE,
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- Creator of the deal
  assigned_to_user_id UUID REFERENCES auth.users(id), -- User the deal is currently assigned to
  person_id UUID REFERENCES contacts(id) ON DELETE SET NULL, -- Corrected FK to contacts, consider ON DELETE behavior
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL, -- FK to new organizations table
  -- wfm_project_id UUID REFERENCES wfm_projects(id) ON DELETE SET NULL, -- Link to WFM Project - To be added in a later migration
  deal_specific_probability DECIMAL(5, 2) CHECK (deal_specific_probability >= 0 AND deal_specific_probability <= 100), -- Probability override by user
  weighted_amount DECIMAL(12, 2), -- Calculated: amount * final_probability
  custom_field_values JSONB -- Stores custom field values for this deal
);

-- Add indexes for common lookups
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_organizations_user_id ON organizations(user_id);
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_assigned_to_user_id ON deals(assigned_to_user_id);
CREATE INDEX idx_deals_person_id ON deals(person_id); -- Corrected index
CREATE INDEX idx_deals_organization_id ON deals(organization_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for contacts
CREATE TRIGGER set_contacts_timestamp
BEFORE UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger for organizations
CREATE TRIGGER set_organizations_timestamp
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger for deals
CREATE TRIGGER set_deals_timestamp
BEFORE UPDATE ON deals
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
