-- Update RLS Policies for Full Collaboration Model
-- Members with update_any permission can now access any deal/lead for related operations

BEGIN;

-- Update Smart Stickers RLS Policies
-- Now users with read_any permission can view/create stickers for any deal/lead
DROP POLICY IF EXISTS "Users can view stickers for accessible entities" ON smart_stickers;
DROP POLICY IF EXISTS "Users can create stickers for accessible entities" ON smart_stickers;

CREATE POLICY "Users can view stickers for accessible entities" ON smart_stickers
    FOR SELECT USING (
        -- Check if user has access to the entity
        CASE entity_type
            WHEN 'DEAL' THEN (
                check_permission(auth.uid(), 'read_any', 'deal') OR
                (check_permission(auth.uid(), 'read_own', 'deal') AND EXISTS (
                    SELECT 1 FROM deals d 
                    WHERE d.id = entity_id 
                    AND (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
                ))
            )
            WHEN 'PERSON' THEN (
                check_permission(auth.uid(), 'read_any', 'person') OR
                (check_permission(auth.uid(), 'read_own', 'person') AND EXISTS (
                    SELECT 1 FROM people p 
                    WHERE p.id = entity_id 
                    AND p.user_id = auth.uid()
                ))
            )
            WHEN 'ORGANIZATION' THEN (
                check_permission(auth.uid(), 'read_any', 'organization') OR
                (check_permission(auth.uid(), 'read_own', 'organization') AND EXISTS (
                    SELECT 1 FROM organizations o 
                    WHERE o.id = entity_id 
                    AND o.user_id = auth.uid()
                ))
            )
            WHEN 'LEAD' THEN (
                check_permission(auth.uid(), 'read_any', 'lead') OR
                (check_permission(auth.uid(), 'read_own', 'lead') AND EXISTS (
                    SELECT 1 FROM leads l 
                    WHERE l.id = entity_id 
                    AND (l.user_id = auth.uid() OR l.assigned_to_user_id = auth.uid())
                ))
            )
        END
    );

CREATE POLICY "Users can create stickers for accessible entities" ON smart_stickers
    FOR INSERT WITH CHECK (
        created_by_user_id = auth.uid() AND
        CASE entity_type
            WHEN 'DEAL' THEN (
                check_permission(auth.uid(), 'update_any', 'deal') OR
                (check_permission(auth.uid(), 'update_own', 'deal') AND EXISTS (
                    SELECT 1 FROM deals d 
                    WHERE d.id = entity_id 
                    AND (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
                ))
            )
            WHEN 'PERSON' THEN (
                check_permission(auth.uid(), 'update_any', 'person') OR
                (check_permission(auth.uid(), 'update_own', 'person') AND EXISTS (
                    SELECT 1 FROM people p 
                    WHERE p.id = entity_id 
                    AND p.user_id = auth.uid()
                ))
            )
            WHEN 'ORGANIZATION' THEN (
                check_permission(auth.uid(), 'update_any', 'organization') OR
                (check_permission(auth.uid(), 'update_own', 'organization') AND EXISTS (
                    SELECT 1 FROM organizations o 
                    WHERE o.id = entity_id 
                    AND o.user_id = auth.uid()
                ))
            )
            WHEN 'LEAD' THEN (
                check_permission(auth.uid(), 'update_any', 'lead') OR
                (check_permission(auth.uid(), 'update_own', 'lead') AND EXISTS (
                    SELECT 1 FROM leads l 
                    WHERE l.id = entity_id 
                    AND (l.user_id = auth.uid() OR l.assigned_to_user_id = auth.uid())
                ))
            )
        END
    );

-- Update Deal Participants RLS Policies
-- Now users with deal read_any can view any deal participants
DROP POLICY IF EXISTS "Users can view deal participants for accessible deals" ON deal_participants;
DROP POLICY IF EXISTS "Users can create deal participants for accessible deals" ON deal_participants;

CREATE POLICY "Users can view deal participants for accessible deals" ON deal_participants
    FOR SELECT USING (
        check_permission(auth.uid(), 'read_any', 'deal') OR
        (check_permission(auth.uid(), 'read_own', 'deal') AND EXISTS (
            SELECT 1 FROM deals d 
            WHERE d.id = deal_id 
            AND (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
        ))
    );

CREATE POLICY "Users can create deal participants for accessible deals" ON deal_participants
    FOR INSERT WITH CHECK (
        check_permission(auth.uid(), 'update_any', 'deal') OR
        (check_permission(auth.uid(), 'update_own', 'deal') AND EXISTS (
            SELECT 1 FROM deals d 
            WHERE d.id = deal_id 
            AND (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
        ))
    );

-- Update Email Pins RLS Policy
DROP POLICY IF EXISTS "Users can manage email pins for accessible deals" ON email_pins;

CREATE POLICY "Users can manage email pins for accessible deals" ON email_pins
    FOR ALL USING (
        check_permission(auth.uid(), 'read_any', 'deal') OR
        (check_permission(auth.uid(), 'read_own', 'deal') AND EXISTS (
            SELECT 1 FROM deals d 
            WHERE d.id = deal_id 
            AND (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
        ))
    );

-- Update Conversion History RLS Policies
DROP POLICY IF EXISTS "Users can view conversion history for their entities" ON conversion_history;
DROP POLICY IF EXISTS "Users can create conversion history" ON conversion_history;

CREATE POLICY "Users can view conversion history for accessible entities" ON conversion_history
    FOR SELECT USING (
        -- User performed the conversion
        converted_by_user_id = auth.uid()
        OR
        -- User has access to source entity
        (
            source_entity_type = 'lead' AND (
                check_permission(auth.uid(), 'read_any', 'lead') OR
                (check_permission(auth.uid(), 'read_own', 'lead') AND EXISTS (
                    SELECT 1 FROM leads l 
                    WHERE l.id = source_entity_id 
                    AND (l.user_id = auth.uid() OR l.assigned_to_user_id = auth.uid())
                ))
            )
        )
        OR
        (
            source_entity_type = 'deal' AND (
                check_permission(auth.uid(), 'read_any', 'deal') OR
                (check_permission(auth.uid(), 'read_own', 'deal') AND EXISTS (
                    SELECT 1 FROM deals d 
                    WHERE d.id = source_entity_id 
                    AND (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
                ))
            )
        )
        OR
        -- User has access to target entity
        (
            target_entity_type = 'lead' AND (
                check_permission(auth.uid(), 'read_any', 'lead') OR
                (check_permission(auth.uid(), 'read_own', 'lead') AND EXISTS (
                    SELECT 1 FROM leads l 
                    WHERE l.id = target_entity_id 
                    AND (l.user_id = auth.uid() OR l.assigned_to_user_id = auth.uid())
                ))
            )
        )
        OR
        (
            target_entity_type = 'deal' AND (
                check_permission(auth.uid(), 'read_any', 'deal') OR
                (check_permission(auth.uid(), 'read_own', 'deal') AND EXISTS (
                    SELECT 1 FROM deals d 
                    WHERE d.id = target_entity_id 
                    AND (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
                ))
            )
        )
    );

CREATE POLICY "Users can create conversion history" ON conversion_history
    FOR INSERT WITH CHECK (converted_by_user_id = auth.uid());

COMMIT; 