BEGIN;

-- =====================================================
-- Deal Labels System Migration
-- =====================================================
-- Creates simple Gmail-style labeling system for deals
-- Following PipeCD migration patterns and RLS policies

-- Create deal_labels table
CREATE TABLE deal_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    label_text VARCHAR(50) NOT NULL,
    color_hex VARCHAR(7) DEFAULT '#3182ce',
    created_by_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Prevent duplicate labels on same deal
    UNIQUE(deal_id, label_text)
);

-- Performance indexes
CREATE INDEX idx_deal_labels_deal_id ON deal_labels(deal_id);
CREATE INDEX idx_deal_labels_text ON deal_labels(label_text);
CREATE INDEX idx_deal_labels_created_at ON deal_labels(created_at);
CREATE INDEX idx_deal_labels_created_by ON deal_labels(created_by_user_id);

-- Full-text search index for label suggestions
CREATE INDEX idx_deal_labels_search ON deal_labels 
    USING gin(to_tsvector('english', label_text));

-- Composite index for filtering deals by multiple labels
CREATE INDEX idx_deal_labels_deal_text ON deal_labels(deal_id, label_text);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE deal_labels ENABLE ROW LEVEL SECURITY;

-- Users can view labels on deals they can access
CREATE POLICY "Users can view deal labels" ON deal_labels FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_labels.deal_id
            AND (
                -- Deal owner can see labels
                deals.user_id = auth.uid() OR
                -- Assigned user can see labels
                deals.assigned_to_user_id = auth.uid() OR
                -- Users with appropriate permissions can see labels
                auth.uid() IN (
                    SELECT ur.user_id FROM user_roles ur
                    JOIN role_permissions rp ON ur.role_id = rp.role_id
                    JOIN permissions p ON rp.permission_id = p.id
                    WHERE p.resource = 'deal' AND p.action IN ('read_any', 'read_team')
                )
            )
        )
    );

-- Users can add labels to deals they can edit
CREATE POLICY "Users can add deal labels" ON deal_labels FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_labels.deal_id
            AND (
                -- Deal owner can add labels
                deals.user_id = auth.uid() OR
                -- Assigned user can add labels
                deals.assigned_to_user_id = auth.uid() OR
                -- Users with update permissions can add labels
                auth.uid() IN (
                    SELECT ur.user_id FROM user_roles ur
                    JOIN role_permissions rp ON ur.role_id = rp.role_id
                    JOIN permissions p ON rp.permission_id = p.id
                    WHERE p.resource = 'deal' AND p.action IN ('update_any', 'update_own')
                )
            )
        )
        -- Ensure user is recorded as creator
        AND deal_labels.created_by_user_id = auth.uid()
    );

-- Users can remove labels from deals they can edit
CREATE POLICY "Users can remove deal labels" ON deal_labels FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_labels.deal_id
            AND (
                -- Deal owner can remove labels
                deals.user_id = auth.uid() OR
                -- Assigned user can remove labels
                deals.assigned_to_user_id = auth.uid() OR
                -- Users with update permissions can remove labels
                auth.uid() IN (
                    SELECT ur.user_id FROM user_roles ur
                    JOIN role_permissions rp ON ur.role_id = rp.role_id
                    JOIN permissions p ON rp.permission_id = p.id
                    WHERE p.resource = 'deal' AND p.action IN ('update_any', 'update_own')
                )
            )
        )
    );

-- Users can update labels they created (for color changes, etc.)
CREATE POLICY "Users can update own deal labels" ON deal_labels FOR UPDATE
    USING (
        -- Only allow updating own labels
        deal_labels.created_by_user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_labels.deal_id
            AND (
                deals.user_id = auth.uid() OR
                deals.assigned_to_user_id = auth.uid() OR
                auth.uid() IN (
                    SELECT ur.user_id FROM user_roles ur
                    JOIN role_permissions rp ON ur.role_id = rp.role_id
                    JOIN permissions p ON rp.permission_id = p.id
                    WHERE p.resource = 'deal' AND p.action IN ('update_any', 'update_own')
                )
            )
        )
    )
    WITH CHECK (
        -- Prevent changing critical fields
        deal_labels.deal_id = deal_labels.deal_id
        AND deal_labels.created_by_user_id = auth.uid()
    );

-- =====================================================
-- Utility Functions
-- =====================================================

-- Function to get popular labels for suggestions
CREATE OR REPLACE FUNCTION get_popular_labels(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    label_text TEXT,
    usage_count BIGINT,
    color_hex TEXT,
    last_used TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dl.label_text::TEXT,
        COUNT(*)::BIGINT as usage_count,
        -- Use most recent color for this label
        (array_agg(dl.color_hex ORDER BY dl.created_at DESC))[1]::TEXT as color_hex,
        MAX(dl.created_at) as last_used
    FROM deal_labels dl
    WHERE 
        -- Only include labels from deals user can access
        EXISTS (
            SELECT 1 FROM deals d
            WHERE d.id = dl.deal_id
            AND (
                d.user_id = auth.uid() OR
                d.assigned_to_user_id = auth.uid() OR
                auth.uid() IN (
                    SELECT ur.user_id FROM user_roles ur
                    JOIN role_permissions rp ON ur.role_id = rp.role_id
                    JOIN permissions p ON rp.permission_id = p.id
                    WHERE p.resource = 'deal' AND p.action IN ('read_any', 'read_team')
                )
            )
        )
    GROUP BY dl.label_text
    ORDER BY usage_count DESC, last_used DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to suggest labels based on input
CREATE OR REPLACE FUNCTION suggest_labels(
    input_text TEXT,
    deal_id_param UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    label_text TEXT,
    usage_count BIGINT,
    color_hex TEXT,
    is_exact_match BOOLEAN,
    similarity_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH label_stats AS (
        SELECT 
            dl.label_text,
            COUNT(*) as usage_count,
            (array_agg(dl.color_hex ORDER BY dl.created_at DESC))[1] as color_hex,
            -- Calculate similarity score (without pg_trgm dependency)
            CASE 
                WHEN LOWER(dl.label_text) = LOWER(input_text) THEN 1.0
                WHEN LOWER(dl.label_text) LIKE LOWER(input_text || '%') THEN 0.9
                WHEN LOWER(dl.label_text) LIKE LOWER('%' || input_text || '%') THEN 0.7
                -- Simple length-based similarity for labels without pg_trgm
                WHEN LENGTH(input_text) > 0 THEN 
                    GREATEST(0.1, 1.0 - (ABS(LENGTH(dl.label_text) - LENGTH(input_text))::FLOAT / GREATEST(LENGTH(dl.label_text), LENGTH(input_text))))
                ELSE 0.1
            END as sim_score
        FROM deal_labels dl
        WHERE 
            -- Only include labels from deals user can access
            EXISTS (
                SELECT 1 FROM deals d
                WHERE d.id = dl.deal_id
                AND (
                    d.user_id = auth.uid() OR
                    d.assigned_to_user_id = auth.uid() OR
                    auth.uid() IN (
                        SELECT ur.user_id FROM user_roles ur
                        JOIN role_permissions rp ON ur.role_id = rp.role_id
                        JOIN permissions p ON rp.permission_id = p.id
                        WHERE p.resource = 'deal' AND p.action IN ('read_any', 'read_team')
                    )
                )
            )
            -- Exclude labels already on this deal
            AND (deal_id_param IS NULL OR NOT EXISTS (
                SELECT 1 FROM deal_labels existing 
                WHERE existing.deal_id = deal_id_param 
                AND existing.label_text = dl.label_text
            ))
            -- Basic text matching (without pg_trgm dependency)
            AND LOWER(dl.label_text) LIKE LOWER('%' || input_text || '%')
        GROUP BY dl.label_text
        HAVING COUNT(*) > 0
    )
    SELECT 
        ls.label_text::TEXT,
        ls.usage_count::BIGINT,
        ls.color_hex::TEXT,
        (LOWER(ls.label_text) = LOWER(input_text))::BOOLEAN as is_exact_match,
        ls.sim_score::FLOAT as similarity_score
    FROM label_stats ls
    WHERE ls.sim_score > 0.3
    ORDER BY 
        is_exact_match DESC,
        ls.sim_score DESC,
        ls.usage_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Sample Data (for development/testing)
-- =====================================================

-- Insert some sample labels for existing deals (if any exist)
-- This will help with testing the system
DO $$
DECLARE
    sample_deal_id UUID;
    sample_colors TEXT[] := ARRAY['#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#319795', '#3182ce', '#805ad5', '#d53f8c'];
    sample_labels TEXT[] := ARRAY['hot', 'warm', 'cold', 'urgent', 'demo', 'proposal', 'negotiation', 'follow-up'];
    sample_label_text TEXT;
    sample_color_hex TEXT;
    i INTEGER;
BEGIN
    -- Get a sample deal ID (first available deal)
    SELECT id INTO sample_deal_id FROM deals LIMIT 1;
    
    -- Only add sample data if we have deals
    IF sample_deal_id IS NOT NULL THEN
        -- Add a few sample labels to demonstrate the system
        FOR i IN 1..3 LOOP
            sample_label_text := sample_labels[i];
            sample_color_hex := sample_colors[i];
            
            INSERT INTO deal_labels (deal_id, label_text, color_hex, created_by_user_id)
            VALUES (sample_deal_id, sample_label_text, sample_color_hex, auth.uid())
            ON CONFLICT (deal_id, label_text) DO NOTHING;
        END LOOP;
        
        RAISE NOTICE 'Added sample labels to deal %', sample_deal_id;
    ELSE
        RAISE NOTICE 'No deals found - skipping sample label creation';
    END IF;
END $$;

-- =====================================================
-- Update timestamps trigger
-- =====================================================

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_deal_labels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_deal_labels_updated_at
    BEFORE UPDATE ON deal_labels
    FOR EACH ROW
    EXECUTE FUNCTION update_deal_labels_updated_at();

COMMIT; 