-- Migration: Fix Task History RLS Policies
-- Description: Add missing INSERT, UPDATE, DELETE policies for task_history table
-- Date: 2025-01-27

BEGIN;

-- Add INSERT policy for task_history
-- Users can insert history records for tasks they have access to
DROP POLICY IF EXISTS "Users can insert history for accessible tasks" ON task_history;
CREATE POLICY "Users can insert history for accessible tasks"
  ON task_history FOR INSERT
  WITH CHECK (
    (task_id IS NULL) OR 
    (EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = task_history.task_id 
      AND (
        t.assigned_to_user_id = auth.uid() OR 
        t.created_by_user_id = auth.uid() OR
        -- Allow system/trigger inserts when changed_by_user_id matches authenticated user
        task_history.changed_by_user_id = auth.uid()
      )
    ))
  );

-- Add UPDATE policy for task_history (generally not needed, but good to have)
DROP POLICY IF EXISTS "Users can update history for accessible tasks" ON task_history;
CREATE POLICY "Users can update history for accessible tasks"
  ON task_history FOR UPDATE
  USING (
    (task_id IS NULL) OR 
    (EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = task_history.task_id 
      AND (
        t.assigned_to_user_id = auth.uid() OR 
        t.created_by_user_id = auth.uid()
      )
    ))
  )
  WITH CHECK (
    (task_id IS NULL) OR 
    (EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = task_history.task_id 
      AND (
        t.assigned_to_user_id = auth.uid() OR 
        t.created_by_user_id = auth.uid()
      )
    ))
  );

-- Add DELETE policy for task_history (for cleanup/admin purposes)
DROP POLICY IF EXISTS "Users can delete history for accessible tasks" ON task_history;
CREATE POLICY "Users can delete history for accessible tasks"
  ON task_history FOR DELETE
  USING (
    (task_id IS NULL) OR 
    (EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = task_history.task_id 
      AND t.created_by_user_id = auth.uid()
    ))
  );

COMMIT; 