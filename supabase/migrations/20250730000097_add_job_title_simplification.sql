-- Migration: Add Job Title Simplification for People & Organizations
-- This implements Phase 1 of the UX simplification strategy
-- Adds job_title field and preserves existing complex role data

BEGIN;

-- ================================
-- 1. Add job_title Field to People Table
-- ================================

-- Add the simplified job_title field
ALTER TABLE people ADD COLUMN job_title TEXT;

-- Add index for job_title queries
CREATE INDEX idx_people_job_title ON people(job_title);

-- ================================
-- 2. Migrate Existing Role Data to job_title
-- ================================

-- Update people with their primary organization role title
UPDATE people SET job_title = (
  SELECT role_title 
  FROM person_organization_roles 
  WHERE person_id = people.id 
  AND is_primary = true 
  AND status = 'active'
  LIMIT 1
);

-- For people without primary roles, use the first active role
UPDATE people SET job_title = (
  SELECT role_title 
  FROM person_organization_roles 
  WHERE person_id = people.id 
  AND status = 'active'
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE job_title IS NULL;

-- ================================
-- 3. Re-establish organization_id for Simplified UX
-- ================================

-- Note: The people table already has organization_id from legacy system
-- But we need to ensure it's populated from primary organization roles

-- Update organization_id from primary organization roles
UPDATE people SET organization_id = (
  SELECT organization_id 
  FROM person_organization_roles 
  WHERE person_id = people.id 
  AND is_primary = true 
  AND status = 'active'
  LIMIT 1
)
WHERE organization_id IS NULL;

-- For people without primary roles, use the first active role's organization
UPDATE people SET organization_id = (
  SELECT organization_id 
  FROM person_organization_roles 
  WHERE person_id = people.id 
  AND status = 'active'
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE organization_id IS NULL;

-- ================================
-- 4. Add Comments for Future Reference
-- ================================

-- Add comments to document the simplification
COMMENT ON COLUMN people.job_title IS 'Simplified job title field for 90% of use cases. Replaces complex role management for basic contact info.';
COMMENT ON COLUMN people.organization_id IS 'Primary organization association. Simplified from complex multi-organization role system.';

-- Comment on the complex table for future reference
COMMENT ON TABLE person_organization_roles IS 'Complex role system preserved for edge cases (5% of users). Main UI uses simplified people.job_title and people.organization_id fields.';

-- ================================
-- 5. Create Migration Stats for Verification
-- ================================

-- Log migration statistics
DO $$
DECLARE
  total_people INTEGER;
  people_with_job_title INTEGER;
  people_with_organization INTEGER;
  people_with_roles INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_people FROM people;
  SELECT COUNT(*) INTO people_with_job_title FROM people WHERE job_title IS NOT NULL;
  SELECT COUNT(*) INTO people_with_organization FROM people WHERE organization_id IS NOT NULL;
  SELECT COUNT(DISTINCT person_id) INTO people_with_roles FROM person_organization_roles;
  
  RAISE NOTICE 'MIGRATION STATS:';
  RAISE NOTICE 'Total people: %', total_people;
  RAISE NOTICE 'People with job_title: %', people_with_job_title;
  RAISE NOTICE 'People with organization: %', people_with_organization;
  RAISE NOTICE 'People with complex roles: %', people_with_roles;
END $$;

COMMIT;