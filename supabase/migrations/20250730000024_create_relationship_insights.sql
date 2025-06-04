BEGIN;

-- Create relationship_insights table
CREATE TABLE relationship_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_type TEXT NOT NULL CHECK (insight_type IN (
        'missing_stakeholder', 'relationship_gap', 'influence_pattern', 
        'decision_path', 'risk_alert', 'opportunity', 'relationship_strength_change'
    )),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('deal', 'lead', 'organization', 'person')),
    entity_id UUID NOT NULL,
    priority_level TEXT CHECK (priority_level IN ('critical', 'high', 'medium', 'low')),
    
    insight_title TEXT NOT NULL,
    insight_description TEXT NOT NULL,
    recommended_actions JSONB, -- Array of suggested actions
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    
    supporting_data JSONB, -- Data that led to this insight
    ai_reasoning TEXT, -- AI explanation of how it reached this conclusion
    
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'acting_on', 'completed', 'dismissed')),
    reviewed_by_user_id UUID REFERENCES user_profiles(user_id),
    reviewed_at TIMESTAMPTZ,
    
    expires_at TIMESTAMPTZ, -- Some insights may be time-sensitive
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_insights_entity ON relationship_insights(entity_type, entity_id);
CREATE INDEX idx_insights_type ON relationship_insights(insight_type);
CREATE INDEX idx_insights_priority ON relationship_insights(priority_level);
CREATE INDEX idx_insights_status ON relationship_insights(status);
CREATE INDEX idx_insights_confidence ON relationship_insights(confidence_score);
CREATE INDEX idx_insights_expires ON relationship_insights(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_insights_reviewed_by ON relationship_insights(reviewed_by_user_id);
CREATE INDEX idx_insights_created_at ON relationship_insights(created_at);

-- Enable RLS
ALTER TABLE relationship_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view insights for entities they have access to
CREATE POLICY "Users can view insights for accessible entities" ON relationship_insights
    FOR SELECT USING (
        check_permission(auth.uid(), 'read_any', 'relationship_insight') OR
        CASE entity_type
            WHEN 'deal' THEN EXISTS (
                SELECT 1 FROM deals d 
                WHERE d.id = entity_id 
                AND d.user_id = auth.uid()
            )
            WHEN 'lead' THEN EXISTS (
                SELECT 1 FROM leads l 
                WHERE l.id = entity_id 
                AND l.user_id = auth.uid()
            )
            WHEN 'organization' THEN EXISTS (
                SELECT 1 FROM organizations o 
                WHERE o.id = entity_id 
                AND o.user_id = auth.uid()
            )
            WHEN 'person' THEN EXISTS (
                SELECT 1 FROM people p 
                WHERE p.id = entity_id 
                AND p.user_id = auth.uid()
            )
            ELSE FALSE
        END
    );

-- RLS Policy: System can create insights (no user restrictions for AI-generated insights)
CREATE POLICY "System can create insights" ON relationship_insights
    FOR INSERT WITH CHECK (TRUE);

-- RLS Policy: Users can update insights for entities they have access to
CREATE POLICY "Users can update insights for accessible entities" ON relationship_insights
    FOR UPDATE USING (
        check_permission(auth.uid(), 'update_any', 'relationship_insight') OR
        CASE entity_type
            WHEN 'deal' THEN EXISTS (
                SELECT 1 FROM deals d 
                WHERE d.id = entity_id 
                AND d.user_id = auth.uid()
            )
            WHEN 'lead' THEN EXISTS (
                SELECT 1 FROM leads l 
                WHERE l.id = entity_id 
                AND l.user_id = auth.uid()
            )
            WHEN 'organization' THEN EXISTS (
                SELECT 1 FROM organizations o 
                WHERE o.id = entity_id 
                AND o.user_id = auth.uid()
            )
            WHEN 'person' THEN EXISTS (
                SELECT 1 FROM people p 
                WHERE p.id = entity_id 
                AND p.user_id = auth.uid()
            )
            ELSE FALSE
        END
    );

-- RLS Policy: Users can delete insights for entities they own or have permission
CREATE POLICY "Users can delete insights for accessible entities" ON relationship_insights
    FOR DELETE USING (
        check_permission(auth.uid(), 'delete_any', 'relationship_insight') OR
        CASE entity_type
            WHEN 'deal' THEN EXISTS (
                SELECT 1 FROM deals d 
                WHERE d.id = entity_id 
                AND d.user_id = auth.uid()
            )
            WHEN 'lead' THEN EXISTS (
                SELECT 1 FROM leads l 
                WHERE l.id = entity_id 
                AND l.user_id = auth.uid()
            )
            WHEN 'organization' THEN EXISTS (
                SELECT 1 FROM organizations o 
                WHERE o.id = entity_id 
                AND o.user_id = auth.uid()
            )
            WHEN 'person' THEN EXISTS (
                SELECT 1 FROM people p 
                WHERE p.id = entity_id 
                AND p.user_id = auth.uid()
            )
            ELSE FALSE
        END
    );

-- Create updated_at trigger
CREATE TRIGGER update_relationship_insights_updated_at 
    BEFORE UPDATE ON relationship_insights 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to auto-expire insights
CREATE OR REPLACE FUNCTION expire_old_insights()
RETURNS void AS $$
BEGIN
    UPDATE relationship_insights 
    SET status = 'dismissed', updated_at = NOW()
    WHERE expires_at < NOW() AND status = 'new';
END;
$$ LANGUAGE plpgsql;

-- Create a function to be called periodically to clean up expired insights
-- This would typically be called by a cron job or background task
COMMENT ON FUNCTION expire_old_insights() IS 'Function to automatically dismiss expired insights. Should be called periodically by a background job.';

COMMIT; 