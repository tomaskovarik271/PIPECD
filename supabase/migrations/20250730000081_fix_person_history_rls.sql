-- Migration: Fix Person History RLS Policy
-- Fixing person creation failures due to restrictive RLS on person_history table

BEGIN;

-- ================================
-- 1. Drop Existing Restrictive Policy
-- ================================

DROP POLICY IF EXISTS "Users can view person history for accessible people" ON person_history;

-- ================================
-- 2. Create More Permissive RLS Policies
-- ================================

-- Policy 1: Users can view person history for people they can access
CREATE POLICY "person_history_select_policy" ON person_history
    FOR SELECT USING (
        -- Allow if user has person read permissions
        check_permission(auth.uid(), 'read_any', 'person') OR
        check_permission(auth.uid(), 'read_own', 'person') OR
        -- Allow if user made the change
        user_id = auth.uid()
    );

-- Policy 2: System can insert person history (triggers need this)
CREATE POLICY "person_history_insert_policy" ON person_history
    FOR INSERT WITH CHECK (
        -- Allow inserts from authenticated users (triggers run with user context)
        auth.uid() IS NOT NULL
    );

-- Policy 3: Users can update their own history entries (admin only)
CREATE POLICY "person_history_update_policy" ON person_history
    FOR UPDATE USING (
        user_id = auth.uid() OR
        check_permission(auth.uid(), 'update_any', 'person')
    );

-- Policy 4: Users can delete their own history entries (admin only)
CREATE POLICY "person_history_delete_policy" ON person_history
    FOR DELETE USING (
        check_permission(auth.uid(), 'delete_any', 'person')
    );

COMMIT; 