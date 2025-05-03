-- 1. Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to owner user
  name TEXT NOT NULL,
  address TEXT,
  -- Add other relevant organization fields here (e.g., website, industry)
  notes TEXT,
  CONSTRAINT organizations_user_id_name_key UNIQUE (user_id, name)
);

-- Add index for user lookup
CREATE INDEX idx_organizations_user_id ON organizations(user_id);

-- Trigger for organizations updated_at
CREATE TRIGGER set_organizations_timestamp
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp(); -- Reuse existing timestamp function

-- 2. Rename contacts table to people
ALTER TABLE contacts RENAME TO people;

-- 3. Add organization_id FK to people table
ALTER TABLE people
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL; -- Allow people without organizations

-- Add index for organization lookup
CREATE INDEX idx_people_organization_id ON people(organization_id);

-- 4. Enable RLS and define policies for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual user SELECT access on organizations" ON organizations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow individual user INSERT access on organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual user UPDATE access on organizations" ON organizations
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual user DELETE access on organizations" ON organizations
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Update RLS policy names for the renamed 'people' table (Optional but good practice)
-- Note: The policy logic remains the same, just updating the name to reflect the table rename.
-- Dropping and recreating policies is generally safer than ALTER POLICY if structure changes.

-- Drop old contact policies
DROP POLICY "Allow individual user SELECT access on contacts" ON people;
DROP POLICY "Allow individual user INSERT access on contacts" ON people;
DROP POLICY "Allow individual user UPDATE access on contacts" ON people;
DROP POLICY "Allow individual user DELETE access on contacts" ON people;

-- Recreate policies with new names for 'people' table
CREATE POLICY "Allow individual user SELECT access on people" ON people
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow individual user INSERT access on people" ON people
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual user UPDATE access on people" ON people
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual user DELETE access on people" ON people
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Update foreign key constraint on 'deals' table to reference 'people'

-- Rename the column first
ALTER TABLE deals RENAME COLUMN contact_id TO person_id;

-- Drop the old constraint first (It might reference the old column name implicitly, safer to drop)
-- If the constraint name was explicit, use that name. Assuming default naming convention.
-- We might need to find the actual constraint name if this fails.
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_contact_id_fkey;

-- Add the new constraint referencing the renamed 'people' table and the renamed column
ALTER TABLE deals 
ADD CONSTRAINT deals_person_id_fkey -- Use new column name in constraint name
FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE SET NULL;

-- Add index on the renamed column (optional but good practice)
DROP INDEX IF EXISTS idx_deals_contact_id;
CREATE INDEX idx_deals_person_id ON deals(person_id);
