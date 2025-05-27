-- 1. Create organizations table -- This is now handled in initial_schema.sql
-- CREATE TABLE organizations (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to owner user
--   name TEXT NOT NULL,
--   address TEXT,
--   -- Add other relevant organization fields here (e.g., website, industry)
--   notes TEXT
-- );

-- Add index for user lookup -- This is now handled in initial_schema.sql
-- CREATE INDEX idx_organizations_user_id ON organizations(user_id);

-- Trigger for organizations updated_at -- This is now handled in initial_schema.sql
-- CREATE TRIGGER set_organizations_timestamp
-- BEFORE UPDATE ON organizations
-- FOR EACH ROW
-- EXECUTE FUNCTION trigger_set_timestamp(); -- Reuse existing timestamp function

-- 2. Rename contacts table to people
ALTER TABLE contacts RENAME TO people;

-- 3. Add organization_id FK to people table
-- This assumes organizations table exists (created by initial_schema.sql)
ALTER TABLE people
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL; -- Allow people without organizations

-- Add index for organization lookup
CREATE INDEX idx_people_organization_id ON people(organization_id);

-- 4. Enable RLS and define policies for organizations
-- This assumes organizations table exists (created by initial_schema.sql)
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

-- Rename the column first (In initial_schema.sql, deals.person_id already references contacts(id), and contacts is renamed to people)
-- So, the column deals.person_id should already exist and correctly reference (what will be) people(id).
-- The issue is that initial_schema.sql creates deals.person_id REFERENCES contacts(id).
-- This script renames contacts to people. So the FK in deals should automatically point to people.
-- The RENAME COLUMN line below is thus unnecessary and potentially harmful if person_id already exists.

-- ALTER TABLE deals RENAME COLUMN contact_id TO person_id; -- REMOVE THIS LINE as deals.person_id is already created in initial_schema

-- The FK constraint name will be based on the original creation in initial_schema.
-- Let's assume the FK from initial_schema.sql `person_id UUID REFERENCES contacts(id)` creates a constraint.
-- When `contacts` is renamed to `people`, that constraint should automatically update its target table.
-- So, no need to drop/add FK constraints here IF the initial schema correctly established it.

-- If `initial_schema.sql` created `deals.person_id REFERENCES contacts(id)`, then after `ALTER TABLE contacts RENAME TO people;`,
-- `deals.person_id` will correctly reference `people(id)`.
-- The existing FK constraint will just point to the renamed table.

-- The index `idx_deals_person_id` is already created in `initial_schema.sql`.
-- DROP INDEX IF EXISTS idx_deals_contact_id; -- Not needed if contact_id was never the name in deals table from initial_schema
-- CREATE INDEX idx_deals_person_id ON deals(person_id); -- Already created in initial_schema

-- The original script might have been written when initial_schema was different.
-- Based on the current initial_schema, step 6 is largely simplified or not needed for FKs/indexes if already correct.
-- However, the RENAME COLUMN contact_id TO person_id for deals table *is* present in the original of this script.
-- My `initial_schema.sql` uses `person_id` from the start, referencing `contacts(id)`.
-- So the `ALTER TABLE deals RENAME COLUMN contact_id TO person_id;` is problematic.
-- I will comment out the parts of step 6 that are now redundant or conflicting.

-- 6. Update foreign key constraint on 'deals' table to reference 'people'

-- The `initial_schema.sql` creates `deals.person_id UUID REFERENCES contacts(id)`.
-- After `ALTER TABLE contacts RENAME TO people;` (Step 2), this foreign key will correctly point to `people(id)`.
-- The column name in `deals` is already `person_id`.

-- ALTER TABLE deals RENAME COLUMN contact_id TO person_id; -- This is not needed as initial_schema uses person_id

-- The foreign key constraint `deals_person_id_fkey` (or similar default name)
-- established by `initial_schema.sql` pointing `deals.person_id` to `contacts.id`
-- will automatically update to point to `people.id` after table rename. So no need to drop/add.

-- ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_contact_id_fkey; -- Not applicable / default name might differ
-- ALTER TABLE deals 
-- ADD CONSTRAINT deals_person_id_fkey
-- FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE SET NULL;

-- The index `idx_deals_person_id` is already created in `initial_schema.sql`.
-- DROP INDEX IF EXISTS idx_deals_contact_id;
-- CREATE INDEX idx_deals_person_id ON deals(person_id);
