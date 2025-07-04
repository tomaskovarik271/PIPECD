-- Migration: Person History Tracking
-- Phase 1: Multi-Organization Contacts Foundation
-- Following exact patterns from deal_history and lead_history

BEGIN;

-- ================================
-- 1. Create Person History Table
-- ================================

CREATE TABLE public.person_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID, -- Allow null after person deletion to preserve audit history
  user_id UUID REFERENCES auth.users(id), -- User who made the change (can be NULL for system changes)
  event_type TEXT NOT NULL, -- PERSON_CREATED, PERSON_UPDATED, PERSON_DELETED
  field_name TEXT, -- Which field changed (NULL for create/delete events)
  old_value JSONB, -- Previous value (NULL for create events)
  new_value JSONB, -- New value (NULL for delete events)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- 2. Create Indexes for Performance
-- ================================

CREATE INDEX idx_person_history_person_id ON person_history(person_id);
CREATE INDEX idx_person_history_user_id ON person_history(user_id);
CREATE INDEX idx_person_history_event_type ON person_history(event_type);
CREATE INDEX idx_person_history_field_name ON person_history(field_name);
CREATE INDEX idx_person_history_created_at ON person_history(created_at);

-- ================================
-- 3. Enable Row Level Security
-- ================================

ALTER TABLE person_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view person history for people they have access to
CREATE POLICY "Users can view person history for accessible people" ON person_history
    FOR SELECT USING (
        -- User owns the person (current or historical)
        EXISTS (
            SELECT 1 FROM people p 
            WHERE p.id = person_id 
            AND p.user_id = auth.uid()
        )
        OR
        -- User made the change
        user_id = auth.uid()
        OR
        -- Admin permission check (if implemented)
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'admin'
        )
    );

-- ================================
-- 4. Create Trigger Function
-- ================================

CREATE OR REPLACE FUNCTION track_person_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT (create event)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO person_history (person_id, user_id, event_type, new_value)
    VALUES (NEW.id, NEW.user_id, 'PERSON_CREATED', to_jsonb(NEW));
    RETURN NEW;
  END IF;
  
  -- Handle UPDATE (field change events)
  IF TG_OP = 'UPDATE' THEN
    -- Track organization changes specifically (critical for multi-org feature)
    IF OLD.organization_id IS DISTINCT FROM NEW.organization_id THEN
      INSERT INTO person_history (person_id, user_id, event_type, field_name, old_value, new_value)
      VALUES (NEW.id, NEW.user_id, 'PERSON_UPDATED', 'organization_id', 
              to_jsonb(OLD.organization_id), to_jsonb(NEW.organization_id));
    END IF;
    
    -- Track email changes (important for contact management)
    IF OLD.email IS DISTINCT FROM NEW.email THEN
      INSERT INTO person_history (person_id, user_id, event_type, field_name, old_value, new_value)
      VALUES (NEW.id, NEW.user_id, 'PERSON_UPDATED', 'email',
              to_jsonb(OLD.email), to_jsonb(NEW.email));
    END IF;
    
    -- Track name changes
    IF OLD.first_name IS DISTINCT FROM NEW.first_name THEN
      INSERT INTO person_history (person_id, user_id, event_type, field_name, old_value, new_value)
      VALUES (NEW.id, NEW.user_id, 'PERSON_UPDATED', 'first_name',
              to_jsonb(OLD.first_name), to_jsonb(NEW.first_name));
    END IF;
    
    IF OLD.last_name IS DISTINCT FROM NEW.last_name THEN
      INSERT INTO person_history (person_id, user_id, event_type, field_name, old_value, new_value)
      VALUES (NEW.id, NEW.user_id, 'PERSON_UPDATED', 'last_name',
              to_jsonb(OLD.last_name), to_jsonb(NEW.last_name));
    END IF;
    
    -- Track phone changes
    IF OLD.phone IS DISTINCT FROM NEW.phone THEN
      INSERT INTO person_history (person_id, user_id, event_type, field_name, old_value, new_value)
      VALUES (NEW.id, NEW.user_id, 'PERSON_UPDATED', 'phone',
              to_jsonb(OLD.phone), to_jsonb(NEW.phone));
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Handle DELETE (delete event)
  IF TG_OP = 'DELETE' THEN
    INSERT INTO person_history (person_id, user_id, event_type, old_value)
    VALUES (OLD.id, OLD.user_id, 'PERSON_DELETED', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- 5. Create Trigger
-- ================================

CREATE TRIGGER track_person_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON people
  FOR EACH ROW EXECUTE FUNCTION track_person_changes();

-- ================================
-- 6. Add Comments for Documentation
-- ================================

COMMENT ON TABLE person_history IS 'Tracks all changes to people records for audit and multi-organization relationship history';
COMMENT ON COLUMN person_history.person_id IS 'Person ID (nullable to preserve history after deletion)';
COMMENT ON COLUMN person_history.event_type IS 'Type of change: PERSON_CREATED, PERSON_UPDATED, PERSON_DELETED';
COMMENT ON COLUMN person_history.field_name IS 'Specific field that changed (null for create/delete)';
COMMENT ON COLUMN person_history.old_value IS 'Previous value in JSONB format';
COMMENT ON COLUMN person_history.new_value IS 'New value in JSONB format';

COMMIT; 