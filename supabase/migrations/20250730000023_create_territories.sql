BEGIN;

-- Create territories table
CREATE TABLE territories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    territory_type TEXT CHECK (territory_type IN (
        'geographic', 'industry', 'account_size', 'product_line', 'hybrid'
    )),
    region TEXT,
    country TEXT,
    state_province TEXT,
    city TEXT,
    industry_focus TEXT[],
    account_size_range TEXT, -- 'enterprise', 'mid_market', 'smb'
    parent_territory_id UUID REFERENCES territories(id),
    assigned_user_id UUID REFERENCES user_profiles(user_id),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create account_territories table
CREATE TABLE account_territories (
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    territory_id UUID REFERENCES territories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT TRUE,
    assignment_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (organization_id, territory_id)
);

-- Create indexes for performance
CREATE INDEX idx_territories_name ON territories(name);
CREATE INDEX idx_territories_type ON territories(territory_type);
CREATE INDEX idx_territories_parent ON territories(parent_territory_id);
CREATE INDEX idx_territories_assigned_user ON territories(assigned_user_id);
CREATE INDEX idx_territories_active ON territories(is_active);
CREATE INDEX idx_territories_region ON territories(region);
CREATE INDEX idx_territories_country ON territories(country);

CREATE INDEX idx_account_territories_org ON account_territories(organization_id);
CREATE INDEX idx_account_territories_territory ON account_territories(territory_id);
CREATE INDEX idx_account_territories_primary ON account_territories(is_primary);

-- Enable RLS
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_territories ENABLE ROW LEVEL SECURITY;

-- RLS Policy for territories: Users can view territories assigned to them or if they have permission
CREATE POLICY "Users can view territories" ON territories
    FOR SELECT USING (
        assigned_user_id = auth.uid() OR 
        check_permission(auth.uid(), 'read_any', 'territory')
    );

-- RLS Policy: Users with permission can create territories
CREATE POLICY "Users can create territories" ON territories
    FOR INSERT WITH CHECK (
        check_permission(auth.uid(), 'create', 'territory')
    );

-- RLS Policy: Users with permission can update territories
CREATE POLICY "Users can update territories" ON territories
    FOR UPDATE USING (
        check_permission(auth.uid(), 'update_any', 'territory')
    );

-- RLS Policy: Users with permission can delete territories
CREATE POLICY "Users can delete territories" ON territories
    FOR DELETE USING (
        check_permission(auth.uid(), 'delete_any', 'territory')
    );

-- RLS Policy for account_territories: Users can view for organizations they have access to
CREATE POLICY "Users can view account territories for accessible organizations" ON account_territories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organizations o 
            WHERE o.id = organization_id 
            AND o.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM territories t 
            WHERE t.id = territory_id 
            AND t.assigned_user_id = auth.uid()
        ) OR
        check_permission(auth.uid(), 'read_any', 'territory')
    );

-- RLS Policy: Users can create account territory assignments
CREATE POLICY "Users can create account territory assignments" ON account_territories
    FOR INSERT WITH CHECK (
        check_permission(auth.uid(), 'create', 'territory')
    );

-- RLS Policy: Users with permission can update account territory assignments
CREATE POLICY "Users can update account territory assignments" ON account_territories
    FOR UPDATE USING (
        check_permission(auth.uid(), 'update_any', 'territory')
    );

-- RLS Policy: Users with permission can delete account territory assignments
CREATE POLICY "Users can delete account territory assignments" ON account_territories
    FOR DELETE USING (
        check_permission(auth.uid(), 'delete_any', 'territory')
    );

-- Create updated_at trigger for territories
CREATE TRIGGER update_territories_updated_at 
    BEFORE UPDATE ON territories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT; 