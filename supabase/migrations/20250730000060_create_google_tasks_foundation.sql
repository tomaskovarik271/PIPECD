-- Migration: Create Google Tasks Foundation
-- Purpose: Establish database foundation for Google Tasks integration
-- Date: 2025-01-21

BEGIN;

-- ===================================================================
-- Google Tasks Foundation Tables
-- ===================================================================

-- Task Lists Table: Store Google Task Lists with metadata
CREATE TABLE IF NOT EXISTS task_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    google_task_list_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    google_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_synced_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Constraints
    UNIQUE(user_id, google_task_list_id)
);

-- Task Items Table: Store individual Google Tasks with CRM context
CREATE TABLE IF NOT EXISTS task_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_list_id UUID NOT NULL REFERENCES task_lists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    google_task_id VARCHAR(255) NOT NULL,
    title VARCHAR(1000) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'needsAction' NOT NULL CHECK (status IN ('needsAction', 'completed')),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    google_updated_at TIMESTAMPTZ,
    parent_task_id UUID REFERENCES task_items(id) ON DELETE CASCADE,
    position INTEGER,
    
    -- CRM Context Fields
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    person_id UUID REFERENCES people(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    task_type VARCHAR(50) CHECK (task_type IN ('FOLLOW_UP', 'PREPARATION', 'DEADLINE', 'EMAIL', 'CALL', 'MEETING_OUTCOME', 'INTERNAL')),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_synced_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Constraints
    UNIQUE(task_list_id, google_task_id)
);

-- Tasks Sync Log Table: Track synchronization operations
CREATE TABLE IF NOT EXISTS task_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('full_sync', 'incremental_sync', 'task_list_sync', 'task_create', 'task_update', 'task_delete')),
    sync_status VARCHAR(50) NOT NULL CHECK (sync_status IN ('started', 'completed', 'failed', 'partial')),
    task_list_id UUID REFERENCES task_lists(id) ON DELETE SET NULL,
    google_task_list_id VARCHAR(255),
    tasks_processed INTEGER DEFAULT 0,
    tasks_created INTEGER DEFAULT 0,
    tasks_updated INTEGER DEFAULT 0,
    tasks_deleted INTEGER DEFAULT 0,
    error_message TEXT,
    sync_duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- ===================================================================
-- Indexes for Performance
-- ===================================================================

-- Task Lists Indexes
CREATE INDEX IF NOT EXISTS idx_task_lists_user_id ON task_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_task_lists_google_id ON task_lists(google_task_list_id);
CREATE INDEX IF NOT EXISTS idx_task_lists_active ON task_lists(user_id, is_active);

-- Task Items Indexes
CREATE INDEX IF NOT EXISTS idx_task_items_task_list_id ON task_items(task_list_id);
CREATE INDEX IF NOT EXISTS idx_task_items_user_id ON task_items(user_id);
CREATE INDEX IF NOT EXISTS idx_task_items_google_id ON task_items(google_task_id);
CREATE INDEX IF NOT EXISTS idx_task_items_status ON task_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_task_items_due_date ON task_items(user_id, due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_items_deal_id ON task_items(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_items_person_id ON task_items(person_id) WHERE person_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_items_organization_id ON task_items(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_items_task_type ON task_items(user_id, task_type) WHERE task_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_items_parent ON task_items(parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_items_not_deleted ON task_items(user_id, is_deleted) WHERE is_deleted = false;

-- Sync Log Indexes
CREATE INDEX IF NOT EXISTS idx_task_sync_log_user_id ON task_sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_task_sync_log_created_at ON task_sync_log(created_at);
CREATE INDEX IF NOT EXISTS idx_task_sync_log_status ON task_sync_log(user_id, sync_status);

-- ===================================================================
-- Row Level Security (RLS) Policies
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_sync_log ENABLE ROW LEVEL SECURITY;

-- Task Lists RLS Policies
CREATE POLICY "Users can view their own task lists" ON task_lists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task lists" ON task_lists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task lists" ON task_lists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task lists" ON task_lists
    FOR DELETE USING (auth.uid() = user_id);

-- Task Items RLS Policies
CREATE POLICY "Users can view their own task items" ON task_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task items" ON task_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task items" ON task_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task items" ON task_items
    FOR DELETE USING (auth.uid() = user_id);

-- Task Sync Log RLS Policies
CREATE POLICY "Users can view their own task sync logs" ON task_sync_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task sync logs" ON task_sync_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===================================================================
-- Update Triggers
-- ===================================================================

-- Update timestamps on task_lists
CREATE OR REPLACE FUNCTION update_task_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_lists_updated_at
    BEFORE UPDATE ON task_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_task_lists_updated_at();

-- Update timestamps on task_items
CREATE OR REPLACE FUNCTION update_task_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_items_updated_at
    BEFORE UPDATE ON task_items
    FOR EACH ROW
    EXECUTE FUNCTION update_task_items_updated_at();

-- ===================================================================
-- Tasks RBAC Permissions
-- ===================================================================

-- Insert Tasks permissions into permissions table
INSERT INTO permissions (resource, action, description) VALUES
('tasks', 'read_own', 'View own tasks and task lists'),
('tasks', 'read_all', 'View all tasks and task lists'),
('tasks', 'create', 'Create new tasks and task lists'),
('tasks', 'update_own', 'Update own tasks and task lists'),
('tasks', 'update_all', 'Update all tasks and task lists'),
('tasks', 'delete_own', 'Delete own tasks and task lists'),
('tasks', 'delete_all', 'Delete all tasks and task lists'),
('tasks', 'sync', 'Synchronize tasks with Google Tasks API')
ON CONFLICT (resource, action) DO NOTHING;

-- Assign Tasks permissions to roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin' AND p.resource = 'tasks' AND p.action IN (
    'read_all', 'create', 'update_all', 'delete_all', 'sync'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'member' AND p.resource = 'tasks' AND p.action IN (
    'read_own', 'create', 'update_own', 'delete_own', 'sync'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'read_only' AND p.resource = 'tasks' AND p.action IN (
    'read_own'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ===================================================================
-- Helper Functions
-- ===================================================================

-- Function to get task statistics for a user
CREATE OR REPLACE FUNCTION get_user_task_stats(target_user_id UUID)
RETURNS TABLE (
    total_tasks BIGINT,
    completed_tasks BIGINT,
    pending_tasks BIGINT,
    overdue_tasks BIGINT,
    due_today_tasks BIGINT,
    total_task_lists BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(ti.id) AS total_tasks,
        COUNT(ti.id) FILTER (WHERE ti.status = 'completed') AS completed_tasks,
        COUNT(ti.id) FILTER (WHERE ti.status = 'needsAction') AS pending_tasks,
        COUNT(ti.id) FILTER (WHERE ti.status = 'needsAction' AND ti.due_date < NOW()) AS overdue_tasks,
        COUNT(ti.id) FILTER (WHERE ti.status = 'needsAction' AND DATE(ti.due_date) = CURRENT_DATE) AS due_today_tasks,
        COUNT(DISTINCT tl.id) AS total_task_lists
    FROM task_lists tl
    LEFT JOIN task_items ti ON tl.id = ti.task_list_id AND ti.is_deleted = false
    WHERE tl.user_id = target_user_id AND tl.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tasks with CRM context
CREATE OR REPLACE FUNCTION get_crm_tasks(
    target_user_id UUID,
    target_deal_id UUID DEFAULT NULL,
    target_person_id UUID DEFAULT NULL,
    target_organization_id UUID DEFAULT NULL,
    target_task_type VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    task_id UUID,
    task_list_id UUID,
    task_list_title VARCHAR,
    google_task_id VARCHAR,
    title VARCHAR,
    notes TEXT,
    status VARCHAR,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    task_type VARCHAR,
    deal_id UUID,
    person_id UUID,
    organization_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ti.id,
        ti.task_list_id,
        tl.title,
        ti.google_task_id,
        ti.title,
        ti.notes,
        ti.status,
        ti.due_date,
        ti.completed_at,
        ti.task_type,
        ti.deal_id,
        ti.person_id,
        ti.organization_id,
        ti.created_at,
        ti.updated_at
    FROM task_items ti
    JOIN task_lists tl ON ti.task_list_id = tl.id
    WHERE ti.user_id = target_user_id 
        AND ti.is_deleted = false
        AND tl.is_active = true
        AND (target_deal_id IS NULL OR ti.deal_id = target_deal_id)
        AND (target_person_id IS NULL OR ti.person_id = target_person_id)
        AND (target_organization_id IS NULL OR ti.organization_id = target_organization_id)
        AND (target_task_type IS NULL OR ti.task_type = target_task_type)
    ORDER BY 
        CASE WHEN ti.due_date IS NULL THEN 1 ELSE 0 END,
        ti.due_date ASC,
        ti.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT; 