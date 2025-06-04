BEGIN;

-- Create stakeholder_analysis table
CREATE TABLE stakeholder_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Influence & Decision Power
    influence_score INTEGER CHECK (influence_score BETWEEN 1 AND 10),
    decision_authority TEXT CHECK (decision_authority IN (
        'final_decision', 'strong_influence', 'recommender', 'influencer', 'gatekeeper', 'end_user', 'blocker'
    )),
    budget_authority_level TEXT CHECK (budget_authority_level IN (
        'unlimited', 'high', 'medium', 'low', 'none'
    )),
    
    -- Engagement Analysis
    engagement_level TEXT CHECK (engagement_level IN (
        'champion', 'supporter', 'neutral', 'skeptic', 'blocker'
    )),
    communication_preference TEXT CHECK (communication_preference IN (
        'email', 'phone', 'in_person', 'slack', 'teams', 'formal_meetings'
    )),
    preferred_meeting_time TEXT,
    
    -- Business Context
    pain_points JSONB, -- Array of pain point categories
    motivations JSONB, -- What drives their decisions
    success_metrics JSONB, -- How they measure success
    concerns JSONB, -- What worries them about solutions
    
    -- Relationship Strategy
    approach_strategy TEXT,
    next_best_action TEXT,
    last_interaction_date DATE,
    last_interaction_type TEXT,
    
    -- AI Insights
    ai_personality_profile JSONB,
    ai_communication_style TEXT,
    ai_decision_pattern TEXT,
    ai_influence_network JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES user_profiles(user_id),
    
    -- Ensure we have either deal_id or lead_id, not both
    CONSTRAINT stakeholder_context CHECK (
        (deal_id IS NOT NULL AND lead_id IS NULL) OR 
        (deal_id IS NULL AND lead_id IS NOT NULL) OR
        (deal_id IS NULL AND lead_id IS NULL)
    )
);

-- Create indexes for performance
CREATE INDEX idx_stakeholder_person ON stakeholder_analysis(person_id);
CREATE INDEX idx_stakeholder_deal ON stakeholder_analysis(deal_id);
CREATE INDEX idx_stakeholder_lead ON stakeholder_analysis(lead_id);
CREATE INDEX idx_stakeholder_org ON stakeholder_analysis(organization_id);
CREATE INDEX idx_stakeholder_influence ON stakeholder_analysis(influence_score);
CREATE INDEX idx_stakeholder_decision_authority ON stakeholder_analysis(decision_authority);
CREATE INDEX idx_stakeholder_engagement ON stakeholder_analysis(engagement_level);
CREATE INDEX idx_stakeholder_budget_authority ON stakeholder_analysis(budget_authority_level);
CREATE INDEX idx_stakeholder_created_by ON stakeholder_analysis(created_by_user_id);

-- Enable RLS
ALTER TABLE stakeholder_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view stakeholder analysis for entities they have access to
CREATE POLICY "Users can view stakeholder analysis for accessible entities" ON stakeholder_analysis
    FOR SELECT USING (
        -- RBAC permission check
        check_permission(auth.uid(), 'read_any', 'stakeholder_analysis') OR
        -- Or they created it
        created_by_user_id = auth.uid() OR
        -- Or they have access to any of the related entities
        EXISTS (
            SELECT 1 FROM people p 
            WHERE p.id = person_id 
            AND p.user_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM organizations o 
            WHERE o.id = organization_id 
            AND o.user_id = auth.uid()
        ) OR
        (deal_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM deals d 
            WHERE d.id = deal_id 
            AND d.user_id = auth.uid()
        )) OR
        (lead_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM leads l 
            WHERE l.id = lead_id 
            AND l.user_id = auth.uid()
        ))
    );

-- RLS Policy: Users can create stakeholder analysis
CREATE POLICY "Users can create stakeholder analysis" ON stakeholder_analysis
    FOR INSERT WITH CHECK (
        check_permission(auth.uid(), 'create', 'stakeholder_analysis') AND
        created_by_user_id = auth.uid()
    );

-- RLS Policy: Users can update stakeholder analysis they created or have permission
CREATE POLICY "Users can update stakeholder analysis" ON stakeholder_analysis
    FOR UPDATE USING (
        check_permission(auth.uid(), 'update_any', 'stakeholder_analysis') OR
        (check_permission(auth.uid(), 'update_own', 'stakeholder_analysis') AND created_by_user_id = auth.uid())
    );

-- RLS Policy: Users can delete stakeholder analysis they created or have permission
CREATE POLICY "Users can delete stakeholder analysis" ON stakeholder_analysis
    FOR DELETE USING (
        check_permission(auth.uid(), 'delete_any', 'stakeholder_analysis') OR
        (check_permission(auth.uid(), 'delete_own', 'stakeholder_analysis') AND created_by_user_id = auth.uid())
    );

-- Create updated_at trigger
CREATE TRIGGER update_stakeholder_analysis_updated_at 
    BEFORE UPDATE ON stakeholder_analysis 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT; 