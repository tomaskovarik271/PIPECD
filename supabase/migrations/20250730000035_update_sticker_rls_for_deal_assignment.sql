-- Update Smart Stickers RLS Policies to Support Deal Assignment
-- Users should be able to create/view stickers for deals they own OR are assigned to

BEGIN;

-- Drop existing sticker RLS policies
DROP POLICY IF EXISTS "Users can view stickers for their entities" ON smart_stickers;
DROP POLICY IF EXISTS "Users can create stickers for their entities" ON smart_stickers;

-- Create updated VIEW policy to include assignment
CREATE POLICY "Users can view stickers for accessible entities" ON smart_stickers
    FOR SELECT USING (
        -- Check if user has access to the entity (ownership OR assignment)
        CASE entity_type
            WHEN 'DEAL' THEN EXISTS (
                SELECT 1 FROM deals d 
                WHERE d.id = entity_id 
                AND (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
            )
            WHEN 'PERSON' THEN EXISTS (
                SELECT 1 FROM people p 
                WHERE p.id = entity_id 
                AND p.user_id = auth.uid()
            )
            WHEN 'ORGANIZATION' THEN EXISTS (
                SELECT 1 FROM organizations o 
                WHERE o.id = entity_id 
                AND o.user_id = auth.uid()
            )
            WHEN 'LEAD' THEN EXISTS (
                SELECT 1 FROM leads l 
                WHERE l.id = entity_id 
                AND (l.user_id = auth.uid() OR l.assigned_to_user_id = auth.uid())
            )
        END
    );

-- Create updated CREATE policy to include assignment
CREATE POLICY "Users can create stickers for accessible entities" ON smart_stickers
    FOR INSERT WITH CHECK (
        created_by_user_id = auth.uid() AND
        CASE entity_type
            WHEN 'DEAL' THEN EXISTS (
                SELECT 1 FROM deals d 
                WHERE d.id = entity_id 
                AND (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
            )
            WHEN 'PERSON' THEN EXISTS (
                SELECT 1 FROM people p 
                WHERE p.id = entity_id 
                AND p.user_id = auth.uid()
            )
            WHEN 'ORGANIZATION' THEN EXISTS (
                SELECT 1 FROM organizations o 
                WHERE o.id = entity_id 
                AND o.user_id = auth.uid()
            )
            WHEN 'LEAD' THEN EXISTS (
                SELECT 1 FROM leads l 
                WHERE l.id = entity_id 
                AND (l.user_id = auth.uid() OR l.assigned_to_user_id = auth.uid())
            )
        END
    );

COMMIT; 