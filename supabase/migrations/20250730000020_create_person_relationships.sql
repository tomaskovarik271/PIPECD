BEGIN;

-- Create person_relationships table
CREATE TABLE person_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    to_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'reports_to', 'manages', 'influences', 'collaborates_with', 
        'mentors', 'partners_with', 'competes_with', 'refers_to'
    )),
    relationship_strength INTEGER CHECK (relationship_strength BETWEEN 1 AND 10),
    is_bidirectional BOOLEAN DEFAULT FALSE,
    interaction_frequency TEXT CHECK (interaction_frequency IN (
        'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'rarely'
    )),
    relationship_context TEXT, -- 'work', 'personal', 'industry', 'education'
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES user_profiles(user_id),
    
    -- Prevent self-referencing
    CONSTRAINT no_self_reference CHECK (from_person_id != to_person_id),
    CONSTRAINT unique_person_relationship UNIQUE (from_person_id, to_person_id, relationship_type)
);

-- Create indexes for performance
CREATE INDEX idx_person_rel_from ON person_relationships(from_person_id);
CREATE INDEX idx_person_rel_to ON person_relationships(to_person_id);
CREATE INDEX idx_person_rel_type ON person_relationships(relationship_type);
CREATE INDEX idx_person_rel_strength ON person_relationships(relationship_strength);
CREATE INDEX idx_person_rel_bidirectional ON person_relationships(is_bidirectional);
CREATE INDEX idx_person_rel_frequency ON person_relationships(interaction_frequency);
CREATE INDEX idx_person_rel_created_by ON person_relationships(created_by_user_id);

-- Enable RLS
ALTER TABLE person_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view person relationships for people they have access to
CREATE POLICY "Users can view person relationships for accessible people" ON person_relationships
    FOR SELECT USING (
        -- RBAC permission check
        check_permission(auth.uid(), 'read_any', 'person_relationship') OR
        -- Or they created it
        created_by_user_id = auth.uid() OR
        -- Or they have access to either person
        EXISTS (
            SELECT 1 FROM people p1 
            WHERE p1.id = from_person_id 
            AND p1.user_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM people p2 
            WHERE p2.id = to_person_id 
            AND p2.user_id = auth.uid()
        )
    );

-- RLS Policy: Users can create person relationships
CREATE POLICY "Users can create person relationships" ON person_relationships
    FOR INSERT WITH CHECK (
        check_permission(auth.uid(), 'create', 'person_relationship') AND
        created_by_user_id = auth.uid()
    );

-- RLS Policy: Users can update relationships they created or have permission
CREATE POLICY "Users can update person relationships" ON person_relationships
    FOR UPDATE USING (
        check_permission(auth.uid(), 'update_any', 'person_relationship') OR
        (check_permission(auth.uid(), 'update_own', 'person_relationship') AND created_by_user_id = auth.uid())
    );

-- RLS Policy: Users can delete relationships they created or have permission
CREATE POLICY "Users can delete person relationships" ON person_relationships
    FOR DELETE USING (
        check_permission(auth.uid(), 'delete_any', 'person_relationship') OR
        (check_permission(auth.uid(), 'delete_own', 'person_relationship') AND created_by_user_id = auth.uid())
    );

-- Create updated_at trigger
CREATE TRIGGER update_person_relationships_updated_at 
    BEFORE UPDATE ON person_relationships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT; 