BEGIN;

-- Migration: Create deal_participants table for enhanced email filtering
-- Following existing dual attachment pattern from document system
-- Extends current deal-person relationship (deals.person_id) with many-to-many

-- Create deal_participants table
CREATE TABLE deal_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'participant' CHECK (role IN ('primary', 'participant', 'cc')),
  added_from_email BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_user_id UUID REFERENCES auth.users(id),
  UNIQUE(deal_id, person_id)
);

-- Create indexes for performance
CREATE INDEX idx_deal_participants_deal_id ON deal_participants(deal_id);
CREATE INDEX idx_deal_participants_person_id ON deal_participants(person_id);
CREATE INDEX idx_deal_participants_role ON deal_participants(role);

-- Enable RLS (following existing pattern)
ALTER TABLE deal_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view deal participants for accessible deals
-- Following same pattern as deals table RLS
CREATE POLICY "Users can view deal participants for accessible deals" ON deal_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deals d 
      WHERE d.id = deal_id 
      AND (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
    )
  );

-- RLS Policy: Users can manage participants for their deals
CREATE POLICY "Users can manage participants for their deals" ON deal_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deals d 
      WHERE d.id = deal_id 
      AND (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
    )
  );

-- Auto-populate existing primary contacts as participants
-- This ensures backward compatibility with current deal-person relationships
INSERT INTO deal_participants (deal_id, person_id, role, created_by_user_id, added_from_email)
SELECT 
  d.id, 
  d.person_id, 
  'primary', 
  d.user_id,
  false
FROM deals d 
WHERE d.person_id IS NOT NULL
ON CONFLICT (deal_id, person_id) DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE deal_participants IS 'Many-to-many relationship between deals and people for enhanced email filtering. Extends the existing deals.person_id (primary contact) relationship.';
COMMENT ON COLUMN deal_participants.role IS 'Role of person in deal context: primary (main contact), participant (additional contact), cc (copied on emails)';
COMMENT ON COLUMN deal_participants.added_from_email IS 'Track if this participant was discovered from email thread analysis';

COMMIT; 