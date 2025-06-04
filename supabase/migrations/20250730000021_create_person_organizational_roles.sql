BEGIN;

-- Create person_organizational_roles table
CREATE TABLE person_organizational_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role_title TEXT NOT NULL,
    department TEXT,
    seniority_level TEXT CHECK (seniority_level IN (
        'entry', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c_level', 'founder'
    )),
    is_primary_role BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    reporting_structure JSONB, -- {manager_id, direct_reports: [], dotted_line_reports: []}
    responsibilities JSONB, -- Array of responsibility areas
    budget_authority_usd DECIMAL(15,2),
    team_size INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES user_profiles(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_person_org_roles_person ON person_organizational_roles(person_id);
CREATE INDEX idx_person_org_roles_org ON person_organizational_roles(organization_id);
CREATE INDEX idx_person_org_roles_primary ON person_organizational_roles(is_primary_role);
CREATE INDEX idx_person_org_roles_seniority ON person_organizational_roles(seniority_level);
CREATE INDEX idx_person_org_roles_department ON person_organizational_roles(department);
CREATE INDEX idx_person_org_roles_active ON person_organizational_roles(end_date) WHERE end_date IS NULL;
CREATE INDEX idx_person_org_roles_created_by ON person_organizational_roles(created_by_user_id);

-- Enable RLS
ALTER TABLE person_organizational_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view person org roles for people and organizations they have access to
CREATE POLICY "Users can view person organizational roles for accessible entities" ON person_organizational_roles
    FOR SELECT USING (
        -- RBAC permission check
        check_permission(auth.uid(), 'read_any', 'person_organizational_role') OR
        -- Or they created it
        created_by_user_id = auth.uid() OR
        -- Or they have access to the person or organization
        EXISTS (
            SELECT 1 FROM people p 
            WHERE p.id = person_id 
            AND p.user_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM organizations o 
            WHERE o.id = organization_id 
            AND o.user_id = auth.uid()
        )
    );

-- RLS Policy: Users can create person org roles
CREATE POLICY "Users can create person organizational roles" ON person_organizational_roles
    FOR INSERT WITH CHECK (
        check_permission(auth.uid(), 'create', 'person_organizational_role') AND
        created_by_user_id = auth.uid()
    );

-- RLS Policy: Users can update roles they created or have permission
CREATE POLICY "Users can update person organizational roles" ON person_organizational_roles
    FOR UPDATE USING (
        check_permission(auth.uid(), 'update_any', 'person_organizational_role') OR
        (check_permission(auth.uid(), 'update_own', 'person_organizational_role') AND created_by_user_id = auth.uid())
    );

-- RLS Policy: Users can delete roles they created or have permission
CREATE POLICY "Users can delete person organizational roles" ON person_organizational_roles
    FOR DELETE USING (
        check_permission(auth.uid(), 'delete_any', 'person_organizational_role') OR
        (check_permission(auth.uid(), 'delete_own', 'person_organizational_role') AND created_by_user_id = auth.uid())
    );

-- Create updated_at trigger
CREATE TRIGGER update_person_organizational_roles_updated_at 
    BEFORE UPDATE ON person_organizational_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT; 