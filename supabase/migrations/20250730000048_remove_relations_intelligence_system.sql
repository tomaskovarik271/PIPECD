BEGIN;

-- Remove Relations Intelligence System
-- This migration removes all tables, permissions, and data related to the relationship intelligence functionality

-- Drop relationship insights table first (has no foreign key dependencies)
DROP TABLE IF EXISTS relationship_insights CASCADE;

-- Drop account territories (junction table)
DROP TABLE IF EXISTS account_territories CASCADE;

-- Drop territories table
DROP TABLE IF EXISTS territories CASCADE;

-- Drop stakeholder analysis table
DROP TABLE IF EXISTS stakeholder_analysis CASCADE;

-- Drop person organizational roles table
DROP TABLE IF EXISTS person_organizational_roles CASCADE;

-- Drop person relationships table
DROP TABLE IF EXISTS person_relationships CASCADE;

-- Drop organization relationships table
DROP TABLE IF EXISTS organization_relationships CASCADE;

-- Remove relationship intelligence permissions
DELETE FROM role_permissions 
WHERE permission_id IN (
    SELECT id FROM permissions 
    WHERE resource IN (
        'person_organizational_role',
        'person_relationship', 
        'organization_relationship',
        'stakeholder_analysis',
        'territory',
        'relationship_insight'
    )
);

-- Remove relationship intelligence permission definitions
DELETE FROM permissions 
WHERE resource IN (
    'person_organizational_role',
    'person_relationship', 
    'organization_relationship',
    'stakeholder_analysis',
    'territory',
    'relationship_insight'
);

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Relations Intelligence system has been completely removed from the database.';
    RAISE NOTICE 'Removed tables: organization_relationships, person_relationships, person_organizational_roles, stakeholder_analysis, territories, account_territories, relationship_insights';
    RAISE NOTICE 'Removed all related permissions and role assignments.';
END $$;

COMMIT; 