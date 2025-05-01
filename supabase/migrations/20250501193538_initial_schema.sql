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
  company TEXT,
  notes TEXT
);

-- Create deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL, -- Allow deals without contacts initially?
  -- Basic deal info
  name TEXT NOT NULL,
  value DECIMAL(10, 2), -- Example: up to 99,999,999.99
  stage TEXT, -- Could be ENUM later (e.g., 'Lead', 'Proposal', 'Closed Won')
  expected_close_date DATE,
  notes TEXT
);

-- Add indexes for common lookups
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_stage ON deals(stage);

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

-- Trigger for deals
CREATE TRIGGER set_deals_timestamp
BEFORE UPDATE ON deals
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
