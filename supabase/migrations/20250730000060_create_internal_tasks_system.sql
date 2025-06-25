-- Internal Tasks System Migration
-- Creates the foundation for CRM-native task management

BEGIN;

-- Task Type Enum
CREATE TYPE task_type_enum AS ENUM (
  'follow_up',
  'preparation', 
  'deadline',
  'internal',
  'research',
  'administrative',
  'email',
  'call',
  'meeting_prep',
  'post_meeting'
);

-- Task Status Enum
CREATE TYPE task_status_enum AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled',
  'waiting'
);

-- Task Priority Enum
CREATE TYPE task_priority_enum AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Core Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Task Classification
  type task_type_enum NOT NULL DEFAULT 'follow_up',
  status task_status_enum NOT NULL DEFAULT 'pending',
  priority task_priority_enum NOT NULL DEFAULT 'medium',
  
  -- Timing
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_duration INTERVAL,
  
  -- User Assignment
  assigned_to_user_id UUID REFERENCES auth.users(id),
  created_by_user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Business Context Links
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  email_thread_id UUID, -- Link to email threads (future integration)
  calendar_event_id UUID, -- Link to calendar events
  
  -- Metadata
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can see tasks assigned to them or created by them
CREATE POLICY "users_own_tasks" ON tasks
  FOR ALL USING (
    assigned_to_user_id = auth.uid() OR 
    created_by_user_id = auth.uid()
  );

-- Users can see tasks related to deals they have access to
CREATE POLICY "users_deal_tasks" ON tasks
  FOR SELECT USING (
    deal_id IN (
      SELECT id FROM deals 
      WHERE assigned_to_user_id = auth.uid() OR created_by_user_id = auth.uid()
    )
  );

-- Users can see tasks related to leads they have access to
CREATE POLICY "users_lead_tasks" ON tasks
  FOR SELECT USING (
    lead_id IN (
      SELECT id FROM leads 
      WHERE assigned_to_user_id = auth.uid() OR created_by_user_id = auth.uid()
    )
  );

-- Performance Indexes

-- Index for querying tasks by assignee
CREATE INDEX idx_tasks_assigned_to_user_id ON tasks(assigned_to_user_id);

-- Index for querying tasks by creator
CREATE INDEX idx_tasks_created_by_user_id ON tasks(created_by_user_id);

-- Index for querying tasks by deal
CREATE INDEX idx_tasks_deal_id ON tasks(deal_id);

-- Index for querying tasks by lead
CREATE INDEX idx_tasks_lead_id ON tasks(lead_id);

-- Index for querying tasks by status
CREATE INDEX idx_tasks_status ON tasks(status);

-- Index for querying tasks by due date
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Composite index for timeline queries (deal + due date)
CREATE INDEX idx_tasks_deal_timeline ON tasks(deal_id, due_date DESC);

-- Composite index for user's daily tasks (assignee + due date)
CREATE INDEX idx_tasks_user_daily ON tasks(assigned_to_user_id, due_date);

-- Composite index for active tasks (status + due date)
CREATE INDEX idx_tasks_active ON tasks(status, due_date) WHERE status IN ('pending', 'in_progress');

-- Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Task Permissions for RBAC System

-- Insert task permissions into the permissions table
INSERT INTO permissions (resource, action, description) VALUES
  ('task', 'create', 'Create new tasks'),
  ('task', 'read_own', 'Read own tasks'),
  ('task', 'read_assigned', 'Read tasks assigned to user'),
  ('task', 'read_all', 'Read all tasks in system'),
  ('task', 'update_own', 'Update own tasks'),
  ('task', 'update_assigned', 'Update tasks assigned to user'),
  ('task', 'update_all', 'Update all tasks in system'),
  ('task', 'delete_own', 'Delete own tasks'),
  ('task', 'delete_assigned', 'Delete tasks assigned to user'),
  ('task', 'delete_all', 'Delete all tasks in system'),
  ('task', 'assign', 'Assign tasks to other users'),
  ('task', 'reassign', 'Reassign existing tasks');

-- Assign permissions to roles

-- Admin role gets all task permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin' 
  AND p.resource = 'task';

-- Member role gets standard task permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'member' 
  AND p.resource = 'task'
  AND p.action IN (
    'create',
    'read_own',
    'read_assigned',
    'update_own',
    'update_assigned',
    'delete_own',
    'assign',
    'reassign'
  );

-- Read-only role gets minimal task permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'read_only' 
  AND p.resource = 'task'
  AND p.action IN (
    'read_own',
    'read_assigned'
  );

COMMIT;

-- Comments for documentation
COMMENT ON TABLE tasks IS 'CRM-native tasks with business context and timeline integration';
COMMENT ON COLUMN tasks.type IS 'Task category for classification and workflow automation';
COMMENT ON COLUMN tasks.status IS 'Current task status for progress tracking';
COMMENT ON COLUMN tasks.priority IS 'Task priority for sorting and urgency indication';
COMMENT ON COLUMN tasks.due_date IS 'When the task should be completed';
COMMENT ON COLUMN tasks.estimated_duration IS 'Expected time to complete the task';
COMMENT ON COLUMN tasks.deal_id IS 'Link to deal for business context';
COMMENT ON COLUMN tasks.lead_id IS 'Link to lead for business context';
COMMENT ON COLUMN tasks.person_id IS 'Link to person for contact context';
COMMENT ON COLUMN tasks.organization_id IS 'Link to organization for account context';
COMMENT ON COLUMN tasks.email_thread_id IS 'Link to email thread for communication context';
COMMENT ON COLUMN tasks.calendar_event_id IS 'Link to calendar event for meeting context';
COMMENT ON COLUMN tasks.tags IS 'Flexible tagging system for categorization'; 