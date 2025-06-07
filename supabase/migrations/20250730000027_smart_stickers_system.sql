-- Smart Stickers System Migration
-- Implements visual sticky notes for deals, organizations, and people

-- Create sticker_categories table for organizing different types of stickers
CREATE TABLE sticker_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL, -- Hex color code for the sticker
    icon TEXT, -- Icon name from icon library
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE, -- System categories vs user-created
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create smart_stickers table
CREATE TABLE smart_stickers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Entity relationship (polymorphic)
    entity_type TEXT NOT NULL CHECK (entity_type IN ('DEAL', 'PERSON', 'ORGANIZATION')),
    entity_id UUID NOT NULL,
    
    -- Sticker content
    title TEXT NOT NULL,
    content TEXT, -- Rich text content
    category_id UUID REFERENCES sticker_categories(id),
    
    -- Visual positioning (like Miro)
    position_x INTEGER DEFAULT 0, -- X coordinate on the page
    position_y INTEGER DEFAULT 0, -- Y coordinate on the page
    width INTEGER DEFAULT 200, -- Sticker width in pixels
    height INTEGER DEFAULT 150, -- Sticker height in pixels
    
    -- Sticker properties
    color TEXT DEFAULT '#FFE066', -- Custom color override
    is_pinned BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE, -- Private to creator or visible to team
    priority INTEGER DEFAULT 0, -- For sorting (0=normal, 1=high, 2=urgent)
    
    -- Collaboration features
    mentions JSONB DEFAULT '[]', -- Array of user IDs mentioned in the sticker
    tags TEXT[] DEFAULT '{}', -- Array of tags for searching
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID NOT NULL REFERENCES user_profiles(user_id),
    last_edited_by_user_id UUID REFERENCES user_profiles(user_id),
    last_edited_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_position CHECK (position_x >= 0 AND position_y >= 0),
    CONSTRAINT valid_dimensions CHECK (width > 50 AND height > 50 AND width <= 800 AND height <= 600)
);

-- Create indexes for performance
CREATE INDEX idx_smart_stickers_entity ON smart_stickers(entity_type, entity_id);
CREATE INDEX idx_smart_stickers_created_by ON smart_stickers(created_by_user_id);
CREATE INDEX idx_smart_stickers_created_at ON smart_stickers(created_at DESC);
CREATE INDEX idx_smart_stickers_tags ON smart_stickers USING GIN(tags);
CREATE INDEX idx_smart_stickers_pinned ON smart_stickers(is_pinned, priority DESC, created_at DESC);

-- Create triggers for updated_at
CREATE TRIGGER set_smart_stickers_timestamp
    BEFORE UPDATE ON smart_stickers
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_sticker_categories_timestamp
    BEFORE UPDATE ON sticker_categories
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger to update last_edited fields
CREATE OR REPLACE FUNCTION update_sticker_edit_info()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_edited_at = NOW();
    -- last_edited_by_user_id should be set by the application
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sticker_edit_info
    BEFORE UPDATE ON smart_stickers
    FOR EACH ROW
    EXECUTE FUNCTION update_sticker_edit_info();

-- Enable RLS
ALTER TABLE smart_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for smart_stickers
CREATE POLICY "Users can view stickers for their entities" ON smart_stickers
    FOR SELECT USING (
        -- Check if user has access to the entity (this would need to be expanded based on your permission system)
        CASE entity_type
            WHEN 'DEAL' THEN EXISTS (
                SELECT 1 FROM deals d WHERE d.id = entity_id AND d.user_id = auth.uid()
            )
            WHEN 'PERSON' THEN EXISTS (
                SELECT 1 FROM people p WHERE p.id = entity_id AND p.user_id = auth.uid()
            )
            WHEN 'ORGANIZATION' THEN EXISTS (
                SELECT 1 FROM organizations o WHERE o.id = entity_id AND o.user_id = auth.uid()
            )
        END
    );

CREATE POLICY "Users can create stickers for their entities" ON smart_stickers
    FOR INSERT WITH CHECK (
        created_by_user_id = auth.uid() AND
        CASE entity_type
            WHEN 'DEAL' THEN EXISTS (
                SELECT 1 FROM deals d WHERE d.id = entity_id AND d.user_id = auth.uid()
            )
            WHEN 'PERSON' THEN EXISTS (
                SELECT 1 FROM people p WHERE p.id = entity_id AND p.user_id = auth.uid()
            )
            WHEN 'ORGANIZATION' THEN EXISTS (
                SELECT 1 FROM organizations o WHERE o.id = entity_id AND o.user_id = auth.uid()
            )
        END
    );

CREATE POLICY "Users can update their own stickers" ON smart_stickers
    FOR UPDATE USING (created_by_user_id = auth.uid());

CREATE POLICY "Users can delete their own stickers" ON smart_stickers
    FOR DELETE USING (created_by_user_id = auth.uid());

-- RLS Policies for sticker_categories (read-only for now)
CREATE POLICY "Anyone can view sticker categories" ON sticker_categories
    FOR SELECT USING (true);

-- Insert default sticker categories
INSERT INTO sticker_categories (name, color, icon, description, is_system, display_order) VALUES
    ('Important', '#FF6B6B', 'star', 'High priority information', true, 1),
    ('Follow Up', '#4ECDC4', 'clock', 'Action items and follow-ups', true, 2),
    ('Decision', '#45B7D1', 'checkCircle', 'Key decisions and approvals', true, 3),
    ('Risk', '#FFA726', 'warning', 'Potential risks and concerns', true, 4),
    ('Opportunity', '#66BB6A', 'trendingUp', 'Growth opportunities', true, 5),
    ('Meeting Notes', '#AB47BC', 'users', 'Meeting summaries and outcomes', true, 6),
    ('Technical', '#78909C', 'settings', 'Technical requirements and specs', true, 7),
    ('Budget', '#8BC34A', 'dollarSign', 'Financial information', true, 8);

-- Grant permissions (adjust based on your user system)
GRANT ALL ON smart_stickers TO authenticated;
GRANT ALL ON sticker_categories TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
