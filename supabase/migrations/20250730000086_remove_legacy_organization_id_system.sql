BEGIN;

-- =====================================================
-- Remove Legacy Organization ID System
-- Created: 2025-01-20
-- Purpose: Eliminate the legacy people.organization_id system and ensure all relationships use the role-based system
-- =====================================================

-- Step 1: Create organization roles for all people with organization_id (if they don't already have one)
INSERT INTO person_organization_roles (
  person_id,
  organization_id,
  role_title,
  is_primary,
  status,
  created_at,
  created_by_user_id
)
SELECT 
  p.id as person_id,
  p.organization_id,
  'Contact' as role_title,  -- Default role title
  true as is_primary,       -- Make it primary since it was the main organization
  'active' as status,
  NOW() as created_at,
  p.user_id as created_by_user_id
FROM people p
WHERE 
  p.organization_id IS NOT NULL
  AND NOT EXISTS (
    -- Only create if they don't already have a role for this organization
    SELECT 1 FROM person_organization_roles por 
    WHERE por.person_id = p.id 
    AND por.organization_id = p.organization_id
  );

-- Step 2: Add comment explaining the migration
COMMENT ON TABLE person_organization_roles IS 'Modern role-based organization relationships. Replaces legacy people.organization_id system.';

-- Step 3: Remove the legacy organization_id column from people table
-- Note: This will break backward compatibility, but since we're in development, it's safe
ALTER TABLE people DROP COLUMN IF EXISTS organization_id;

-- Step 4: Update any indexes that might reference the old column (if they exist)
-- The database will automatically drop indexes on dropped columns, but let's be explicit
DROP INDEX IF EXISTS idx_people_organization_id;

-- Step 5: Verify that all people now have proper organization relationships
-- (This is just a verification query, commented out)
-- SELECT 
--   'Migration verification' as check_type,
--   COUNT(*) as total_people,
--   COUNT(DISTINCT por.person_id) as people_with_org_roles,
--   COUNT(*) - COUNT(DISTINCT por.person_id) as people_without_org_roles
-- FROM people p
-- LEFT JOIN person_organization_roles por ON p.id = por.person_id AND por.status = 'active';

COMMIT; 