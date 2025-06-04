BEGIN;

-- Create organization_relationships table
CREATE TABLE organization_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    child_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'subsidiary', 'division', 'partnership', 'supplier', 'customer', 
        'joint_venture', 'acquisition_target', 'competitor'
    )),
    ownership_percentage DECIMAL(5,2), -- 0.00 to 100.00
    relationship_strength INTEGER CHECK (relationship_strength BETWEEN 1 AND 10),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES user_profiles(user_id),
    
    -- Prevent self-referencing and duplicate relationships
    CONSTRAINT no_self_reference CHECK (parent_org_id != child_org_id),
    CONSTRAINT unique_org_relationship UNIQUE (parent_org_id, child_org_id, relationship_type)
);

-- Create indexes for performance
CREATE INDEX idx_org_rel_parent ON organization_relationships(parent_org_id);
CREATE INDEX idx_org_rel_child ON organization_relationships(child_org_id);
CREATE INDEX idx_org_rel_type ON organization_relationships(relationship_type);
CREATE INDEX idx_org_rel_strength ON organization_relationships(relationship_strength);
CREATE INDEX idx_org_rel_created_by ON organization_relationships(created_by_user_id);

-- Enable RLS
ALTER TABLE organization_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see organization relationships for organizations they have access to
CREATE POLICY "Users can view organization relationships for accessible organizations" ON organization_relationships
    FOR SELECT USING (
        -- RBAC permission check
        check_permission(auth.uid(), 'read_any', 'organization_relationship') OR
        -- Or they created it
        created_by_user_id = auth.uid() OR
        -- Or they have access to either organization
        EXISTS (
            SELECT 1 FROM organizations o1 
            WHERE o1.id = parent_org_id 
            AND o1.user_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM organizations o2 
            WHERE o2.id = child_org_id 
            AND o2.user_id = auth.uid()
        )
    );

-- RLS Policy: Users can create organization relationships
CREATE POLICY "Users can create organization relationships" ON organization_relationships
    FOR INSERT WITH CHECK (
        check_permission(auth.uid(), 'create', 'organization_relationship') AND
        created_by_user_id = auth.uid()
    );

-- RLS Policy: Users can update relationships they created or have permission
CREATE POLICY "Users can update organization relationships" ON organization_relationships
    FOR UPDATE USING (
        check_permission(auth.uid(), 'update_any', 'organization_relationship') OR
        (check_permission(auth.uid(), 'update_own', 'organization_relationship') AND created_by_user_id = auth.uid())
    );

-- RLS Policy: Users can delete relationships they created or have permission
CREATE POLICY "Users can delete organization relationships" ON organization_relationships
    FOR DELETE USING (
        check_permission(auth.uid(), 'delete_any', 'organization_relationship') OR
        (check_permission(auth.uid(), 'delete_own', 'organization_relationship') AND created_by_user_id = auth.uid())
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organization_relationships_updated_at 
    BEFORE UPDATE ON organization_relationships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT; 