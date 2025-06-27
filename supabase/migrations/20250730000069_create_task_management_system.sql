-- Migration: Create Task Management System
-- This migration implements the CRM-native task management system

BEGIN;

-- Create enums for task system
CREATE TYPE task_entity_type AS ENUM (
  'DEAL',
  'LEAD', 
  'PERSON',
  'ORGANIZATION'
);

CREATE TYPE task_type_enum AS ENUM (
  -- Deal Progression Tasks
  'DISCOVERY',
  'DEMO_PREPARATION',
  'PROPOSAL_CREATION', 
  'NEGOTIATION_PREP',
  'CONTRACT_REVIEW',
  'DEAL_CLOSURE',
  
  -- Lead Management Tasks
  'LEAD_QUALIFICATION',
  'LEAD_NURTURING',
  'FOLLOW_UP',
  'LEAD_SCORING_REVIEW',
  
  -- Relationship Tasks
  'STAKEHOLDER_MAPPING',
  'RELATIONSHIP_BUILDING',
  'RENEWAL_PREPARATION',
  
  -- Administrative CRM Tasks
  'DATA_ENRICHMENT',
  'CRM_UPDATE',
  'REPORTING'
);

CREATE TYPE task_status AS ENUM (
  'TODO',
  'IN_PROGRESS', 
  'WAITING_ON_CUSTOMER',
  'WAITING_ON_INTERNAL',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE task_priority AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
);

-- Core tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Properties
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'TODO',
  priority task_priority DEFAULT 'MEDIUM',
  
  -- CRM Context (Always Required)
  entity_type task_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Assignment & Scheduling
  assigned_to_user_id UUID REFERENCES auth.users(id),
  created_by_user_id UUID REFERENCES auth.users(id) NOT NULL,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- CRM Integration
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  person_id UUID REFERENCES public.people(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  
  -- Workflow Integration
  wfm_project_id UUID REFERENCES public.wfm_projects(id),
  automation_rule_id UUID,
  parent_task_id UUID REFERENCES public.tasks(id),
  
  -- Business Logic
  completion_triggers_stage_change BOOLEAN DEFAULT false,
  blocks_stage_progression BOOLEAN DEFAULT false,
  required_for_deal_closure BOOLEAN DEFAULT false,
  affects_lead_scoring BOOLEAN DEFAULT false,
  
  -- CRM Task Type (Business Process Categories)
  task_type task_type_enum NOT NULL,
  
  -- Metadata
  custom_field_values JSONB DEFAULT '{}',
  tags TEXT[],
  estimated_hours INTEGER,
  actual_hours INTEGER,
  
  -- Calculated fields (computed on read)
  calculated_priority DECIMAL(5,2) DEFAULT 0,
  business_impact_score DECIMAL(5,2) DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task automation rules table
CREATE TABLE public.task_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Trigger Configuration
  trigger_event TEXT NOT NULL, -- deal_stage_changed, lead_created, etc.
  trigger_conditions JSONB DEFAULT '{}',
  
  -- Task Template
  task_template JSONB NOT NULL,
  
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  applies_to_entity_type task_entity_type NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task dependencies table
CREATE TABLE public.task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  dependency_type TEXT DEFAULT 'BLOCKS', -- BLOCKS, TRIGGERS, RELATED
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent circular dependencies
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id)
);

-- Task history table for audit trail
CREATE TABLE public.task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID, -- Allow null after task deletion
  action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, COMPLETE, CANCEL
  old_value JSONB,
  new_value JSONB,
  changed_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tasks_entity_type_id ON public.tasks(entity_type, entity_id);
CREATE INDEX idx_tasks_assigned_to_user ON public.tasks(assigned_to_user_id);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_deal_id ON public.tasks(deal_id);
CREATE INDEX idx_tasks_lead_id ON public.tasks(lead_id);
CREATE INDEX idx_tasks_person_id ON public.tasks(person_id);
CREATE INDEX idx_tasks_organization_id ON public.tasks(organization_id);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at);
CREATE INDEX idx_task_dependencies_task_id ON public.task_dependencies(task_id);
CREATE INDEX idx_task_automation_rules_active ON public.task_automation_rules(is_active, applies_to_entity_type);
CREATE INDEX idx_task_history_task_id ON public.task_history(task_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON public.tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_automation_rules_updated_at 
    BEFORE UPDATE ON public.task_automation_rules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to track task changes
CREATE OR REPLACE FUNCTION track_task_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.task_history (
            task_id, 
            action, 
            new_value, 
            changed_by_user_id
        ) VALUES (
            NEW.id,
            'CREATE',
            row_to_json(NEW),
            NEW.created_by_user_id
        );
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Only log if there are actual changes
        IF OLD != NEW THEN
            INSERT INTO public.task_history (
                task_id,
                action,
                old_value,
                new_value,
                changed_by_user_id
            ) VALUES (
                NEW.id,
                CASE 
                    WHEN OLD.status != NEW.status AND NEW.status = 'COMPLETED' THEN 'COMPLETE'
                    WHEN OLD.status != NEW.status AND NEW.status = 'CANCELLED' THEN 'CANCEL'
                    ELSE 'UPDATE'
                END,
                row_to_json(OLD),
                row_to_json(NEW),
                NEW.created_by_user_id -- Use session user in real implementation
            );
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle DELETE (log before deletion)
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.task_history (
            task_id,
            action,
            old_value,
            changed_by_user_id
        ) VALUES (
            OLD.id,
            'DELETE',
            row_to_json(OLD),
            OLD.created_by_user_id -- Use session user in real implementation
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for task history tracking
CREATE TRIGGER track_task_changes_trigger
    AFTER INSERT OR UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION track_task_changes();

CREATE TRIGGER track_task_deletion_trigger
    BEFORE DELETE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION track_task_changes();

-- Function to calculate task priority based on CRM context
CREATE OR REPLACE FUNCTION calculate_task_priority(task_row public.tasks)
RETURNS DECIMAL AS $$
DECLARE
    score DECIMAL := 0;
    deal_record RECORD;
    lead_record RECORD;
    days_to_due INTEGER;
    days_to_close INTEGER;
BEGIN
    -- Base priority score
    CASE task_row.priority
        WHEN 'LOW' THEN score := 10;
        WHEN 'MEDIUM' THEN score := 25;
        WHEN 'HIGH' THEN score := 50;
        WHEN 'URGENT' THEN score := 75;
    END CASE;
    
    -- Due date urgency (add up to 20 points)
    IF task_row.due_date IS NOT NULL THEN
        days_to_due := EXTRACT(DAY FROM (task_row.due_date - NOW()));
        IF days_to_due <= 0 THEN
            score := score + 20; -- Overdue
        ELSIF days_to_due <= 1 THEN
            score := score + 15; -- Due today/tomorrow
        ELSIF days_to_due <= 7 THEN
            score := score + 10; -- Due this week
        END IF;
    END IF;
    
    -- Deal context impact (add up to 30 points)
    IF task_row.deal_id IS NOT NULL THEN
        SELECT amount, deal_specific_probability, expected_close_date INTO deal_record
        FROM public.deals WHERE id = task_row.deal_id;
        
        -- Deal value impact (0-15 points)
        IF deal_record.amount IS NOT NULL THEN
            score := score + LEAST(deal_record.amount / 10000, 15);
        END IF;
        
        -- Probability impact (0-10 points)
        IF deal_record.deal_specific_probability IS NOT NULL THEN
            score := score + (deal_record.deal_specific_probability * 10 / 100);
        END IF;
        
        -- Close date urgency (0-5 points)
        IF deal_record.expected_close_date IS NOT NULL THEN
            days_to_close := EXTRACT(DAY FROM (deal_record.expected_close_date - NOW()));
            IF days_to_close <= 7 THEN
                score := score + 5;
            ELSIF days_to_close <= 30 THEN
                score := score + 2;
            END IF;
        END IF;
    END IF;
    
    -- Lead context impact (add up to 15 points)
    IF task_row.lead_id IS NOT NULL THEN
        SELECT estimated_value, lead_score INTO lead_record
        FROM public.leads WHERE id = task_row.lead_id;
        
        -- Lead value impact (0-10 points)
        IF lead_record.estimated_value IS NOT NULL THEN
            score := score + LEAST(lead_record.estimated_value / 10000, 10);
        END IF;
        
        -- Lead score impact (0-5 points)
        IF lead_record.lead_score IS NOT NULL THEN
            score := score + (lead_record.lead_score * 5 / 100);
        END IF;
    END IF;
    
    -- Business impact multipliers
    IF task_row.blocks_stage_progression THEN
        score := score * 1.3;
    END IF;
    
    IF task_row.required_for_deal_closure THEN
        score := score * 1.2;
    END IF;
    
    IF task_row.completion_triggers_stage_change THEN
        score := score * 1.1;
    END IF;
    
    RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update calculated priority on task changes
CREATE OR REPLACE FUNCTION update_task_calculated_priority()
RETURNS TRIGGER AS $$
BEGIN
    NEW.calculated_priority := calculate_task_priority(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_task_priority_trigger
    BEFORE INSERT OR UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_task_calculated_priority();

-- RLS Policies for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

-- Task policies
CREATE POLICY "Users can view tasks they're assigned to or created"
ON public.tasks FOR SELECT
USING (
  assigned_to_user_id = auth.uid() OR 
  created_by_user_id = auth.uid() OR
  -- Also allow if user has deal/lead permissions for the related entity
  (deal_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.deals d WHERE d.id = deal_id AND (
      d.assigned_to_user_id = auth.uid() OR 
      d.user_id = auth.uid()
    )
  )) OR
  (lead_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.leads l WHERE l.id = lead_id AND (
      l.assigned_to_user_id = auth.uid() OR 
      l.user_id = auth.uid()
    )
  ))
);

CREATE POLICY "Users can create tasks"
ON public.tasks FOR INSERT
WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "Users can update tasks they're assigned to or created"
ON public.tasks FOR UPDATE
USING (
  assigned_to_user_id = auth.uid() OR 
  created_by_user_id = auth.uid()
);

CREATE POLICY "Users can delete tasks they created"
ON public.tasks FOR DELETE
USING (created_by_user_id = auth.uid());

-- Automation rules policies (admin only for now)
CREATE POLICY "Admin can manage automation rules"
ON public.task_automation_rules FOR ALL
USING (
  public.check_permission(auth.uid(), 'manage', 'task_automation')
);

-- Task dependencies policies
CREATE POLICY "Users can view task dependencies if they can view the tasks"
ON public.task_dependencies FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND (
    t.assigned_to_user_id = auth.uid() OR t.created_by_user_id = auth.uid()
  ))
);

CREATE POLICY "Users can manage dependencies for their tasks"
ON public.task_dependencies FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND (
    t.assigned_to_user_id = auth.uid() OR t.created_by_user_id = auth.uid()
  ))
);

-- Task history policies
CREATE POLICY "Users can view history for tasks they have access to"
ON public.task_history FOR SELECT
USING (
  task_id IS NULL OR -- Allow viewing history even after task deletion
  EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND (
    t.assigned_to_user_id = auth.uid() OR t.created_by_user_id = auth.uid()
  ))
);

-- Add task-related permissions to RBAC system
INSERT INTO public.permissions (resource, action, description) VALUES
  ('task', 'create', 'Create tasks'),
  ('task', 'read_own', 'Read own tasks'),
  ('task', 'read_assigned', 'Read assigned tasks'),
  ('task', 'read_any', 'Read any tasks'),
  ('task', 'update_own', 'Update own tasks'),
  ('task', 'update_assigned', 'Update assigned tasks'),
  ('task', 'update_any', 'Update any tasks'),
  ('task', 'delete_own', 'Delete own tasks'),
  ('task', 'delete_any', 'Delete any tasks'),
  ('task_automation', 'manage', 'Manage task automation rules');

-- Grant task permissions to roles
-- Admin gets all task permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p 
WHERE r.name = 'admin' 
  AND p.resource IN ('task', 'task_automation');

-- Member gets most task permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p 
WHERE r.name = 'member' 
  AND p.resource = 'task' 
  AND p.action IN (
    'create',
    'read_own',
    'read_assigned', 
    'update_own',
    'update_assigned',
    'delete_own'
  );

COMMIT; 