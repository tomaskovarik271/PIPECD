-- Migration: Multi-Organization Contacts
-- Phase 1: Person Organization Roles Table
-- Enables people to have multiple organizational affiliations with role context

BEGIN;

-- ================================
-- 1. Create Person Organization Roles Table
-- ================================

CREATE TABLE public.person_organization_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Role Information
  role_title TEXT NOT NULL, -- CFO, Board Member, Consultant, Manager, etc.
  department TEXT, -- Finance, Engineering, Sales, Marketing, etc.
  
  -- Primary Organization Flag (only one primary per person)
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Status and Dates
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'former')),
  start_date DATE,
  end_date DATE,
  
  -- Additional Context
  notes TEXT,
  
  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_user_id UUID REFERENCES auth.users(id),
  
  -- Constraints
  UNIQUE(person_id, organization_id, role_title), -- Prevent duplicate roles
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

-- ================================
-- 2. Create Indexes for Performance
-- ================================

-- Core lookup indexes
CREATE INDEX idx_person_org_roles_person ON person_organization_roles(person_id);
CREATE INDEX idx_person_org_roles_org ON person_organization_roles(organization_id);
CREATE INDEX idx_person_org_roles_primary ON person_organization_roles(is_primary);
CREATE INDEX idx_person_org_roles_status ON person_organization_roles(status);

-- Query optimization indexes
CREATE INDEX idx_person_org_roles_active ON person_organization_roles(status) 
WHERE status = 'active';
CREATE INDEX idx_person_org_roles_created_by ON person_organization_roles(created_by_user_id);
CREATE INDEX idx_person_org_roles_role_title ON person_organization_roles(role_title);
CREATE INDEX idx_person_org_roles_department ON person_organization_roles(department);

-- Composite indexes for common queries
CREATE INDEX idx_person_org_roles_person_active ON person_organization_roles(person_id, status) 
WHERE status = 'active';
CREATE INDEX idx_person_org_roles_org_active ON person_organization_roles(organization_id, status) 
WHERE status = 'active';

-- ================================
-- 3. Primary Organization Constraint
-- ================================

-- Ensure only one primary organization per person
CREATE UNIQUE INDEX idx_person_primary_org_unique 
ON person_organization_roles(person_id) 
WHERE is_primary = true AND status = 'active';

-- ================================
-- 4. Enable Row Level Security
-- ================================

ALTER TABLE person_organization_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage person org roles for entities they own
CREATE POLICY "Users can manage person org roles for their entities" 
ON person_organization_roles FOR ALL
USING (
  -- User owns the person
  EXISTS (
    SELECT 1 FROM people p 
    WHERE p.id = person_id 
    AND p.user_id = auth.uid()
  )
  OR
  -- User owns the organization  
  EXISTS (
    SELECT 1 FROM organizations o 
    WHERE o.id = organization_id 
    AND o.user_id = auth.uid()
  )
  OR
  -- User created this role
  created_by_user_id = auth.uid()
);

-- ================================
-- 5. Create Updated At Trigger
-- ================================

CREATE TRIGGER update_person_organization_roles_updated_at 
    BEFORE UPDATE ON person_organization_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 6. Create Helper Functions
-- ================================

-- Function to get primary organization for a person
CREATE OR REPLACE FUNCTION get_person_primary_organization(person_uuid UUID)
RETURNS TABLE(organization_id UUID, organization_name TEXT, role_title TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        por.organization_id,
        o.name as organization_name,
        por.role_title
    FROM person_organization_roles por
    JOIN organizations o ON por.organization_id = o.id
    WHERE por.person_id = person_uuid
    AND por.is_primary = true
    AND por.status = 'active'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get all active organizations for a person
CREATE OR REPLACE FUNCTION get_person_organizations(person_uuid UUID)
RETURNS TABLE(
    role_id UUID,
    organization_id UUID, 
    organization_name TEXT, 
    role_title TEXT,
    department TEXT,
    is_primary BOOLEAN,
    start_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        por.id as role_id,
        por.organization_id,
        o.name as organization_name,
        por.role_title,
        por.department,
        por.is_primary,
        por.start_date
    FROM person_organization_roles por
    JOIN organizations o ON por.organization_id = o.id
    WHERE por.person_id = person_uuid
    AND por.status = 'active'
    ORDER BY por.is_primary DESC, por.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- 7. Add Comments for Documentation
-- ================================

COMMENT ON TABLE person_organization_roles IS 'Enables people to have multiple organizational affiliations with role context';
COMMENT ON COLUMN person_organization_roles.person_id IS 'Reference to person in people table';
COMMENT ON COLUMN person_organization_roles.organization_id IS 'Reference to organization in organizations table';
COMMENT ON COLUMN person_organization_roles.role_title IS 'Job title or role at the organization (e.g., CFO, Board Member)';
COMMENT ON COLUMN person_organization_roles.department IS 'Department or division within the organization';
COMMENT ON COLUMN person_organization_roles.is_primary IS 'Whether this is the persons primary organization (only one per person)';
COMMENT ON COLUMN person_organization_roles.status IS 'Status of the role: active, inactive, or former';
COMMENT ON COLUMN person_organization_roles.start_date IS 'When the person started in this role';
COMMENT ON COLUMN person_organization_roles.end_date IS 'When the person ended this role (null for current roles)';

COMMIT; 