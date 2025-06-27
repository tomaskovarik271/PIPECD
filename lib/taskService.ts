import { supabase } from './supabaseClient';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Types
type DatabaseTask = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

// Temporary simple logger to avoid type issues
const logger = {
  error: (message: string, error?: any) => console.error(message, error),
  info: (message: string) => console.log(message),
  warn: (message: string) => console.warn(message)
};

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'WAITING_ON_INTERNAL' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  task_type: string;
  entity_type: 'DEAL' | 'LEAD' | 'PERSON' | 'ORGANIZATION';
  entity_id: string;
  assigned_to_user_id?: string;
  created_by_user_id: string;
  due_date?: string;
  completed_at?: string;
  deal_id?: string;
  lead_id?: string;
  person_id?: string;
  organization_id?: string;
  wfm_project_id?: string;
  automation_rule_id?: string;
  parent_task_id?: string;
  completion_triggers_stage_change: boolean;
  blocks_stage_progression: boolean;
  required_for_deal_closure: boolean;
  affects_lead_scoring: boolean;
  custom_field_values: Record<string, any>;
  tags: string[];
  estimated_hours?: number;
  actual_hours?: number;
  calculated_priority: number;
  business_impact_score: number;
  created_at: string;
  updated_at: string;
}

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: string;
  created_at: string;
}

export interface TaskAutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger_event: string;
  trigger_conditions: Record<string, any>;
  task_template: Record<string, any>;
  is_active: boolean;
  applies_to_entity_type: 'DEAL' | 'LEAD' | 'PERSON' | 'ORGANIZATION';
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  task_type: string;
  entity_type: Task['entity_type'];
  entity_id: string;
  assigned_to_user_id?: string;
  due_date?: string;
  deal_id?: string;
  lead_id?: string;
  person_id?: string;
  organization_id?: string;
  wfm_project_id?: string;
  parent_task_id?: string;
  completion_triggers_stage_change?: boolean;
  blocks_stage_progression?: boolean;
  required_for_deal_closure?: boolean;
  affects_lead_scoring?: boolean;
  custom_field_values?: Record<string, any>;
  tags?: string[];
  estimated_hours?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  task_type?: string;
  assigned_to_user_id?: string;
  due_date?: string;
  completed_at?: string;
  completion_triggers_stage_change?: boolean;
  blocks_stage_progression?: boolean;
  required_for_deal_closure?: boolean;
  affects_lead_scoring?: boolean;
  custom_field_values?: Record<string, any>;
  tags?: string[];
  estimated_hours?: number;
  actual_hours?: number;
}

export interface TaskFilters {
  status?: Task['status'][];
  priority?: Task['priority'][];
  task_type?: string[];
  entity_type?: Task['entity_type'][];
  entity_id?: string;
  assigned_to_user_id?: string;
  created_by_user_id?: string;
  due_date_from?: string;
  due_date_to?: string;
  overdue?: boolean;
  tags?: string[];
}

export interface TaskCompletion {
  completed_at?: string;
  actual_hours?: number;
  completion_notes?: string;
}

export interface CRMEvent {
  event_type: string;
  entity_type: Task['entity_type'];
  entity_id: string;
  event_data: Record<string, any>;
}

export interface CRMContext {
  entity_type: Task['entity_type'];
  entity_id: string;
  deal_id?: string;
  lead_id?: string;
  person_id?: string;
  organization_id?: string;
}

class TaskService {
  private supabase: ReturnType<typeof createClient<Database>>;

  constructor(supabase: ReturnType<typeof createClient<Database>>) {
    this.supabase = supabase;
  }

  // Core CRUD Operations

  async createTask(taskData: CreateTaskInput, userId: string): Promise<Task> {
    try {
      const taskRecord = {
        ...taskData,
        created_by_user_id: userId,
        status: taskData.status || 'TODO',
        priority: taskData.priority || 'MEDIUM',
        completion_triggers_stage_change: taskData.completion_triggers_stage_change || false,
        blocks_stage_progression: taskData.blocks_stage_progression || false,
        required_for_deal_closure: taskData.required_for_deal_closure || false,
        affects_lead_scoring: taskData.affects_lead_scoring || false,
        custom_field_values: taskData.custom_field_values || {},
        tags: taskData.tags || []
      };

      const { data, error } = await this.supabase
        .from('tasks')
        .insert([taskRecord])
        .select('*')
        .single();

      if (error) {
        logger.error('Error creating task:', error);
        throw new Error(`Failed to create task: ${error.message}`);
      }

      logger.info(`Task created successfully: ${data.id}`);
      return data as Task;
    } catch (error) {
      logger.error('Error in createTask:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updates: UpdateTaskInput, userId: string): Promise<Task> {
    try {
      const { data, error } = await this.supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select('*')
        .single();

      if (error) {
        logger.error('Error updating task:', error);
        throw new Error(`Failed to update task: ${error.message}`);
      }

      logger.info(`Task updated successfully: ${taskId}`);
      return data as Task;
    } catch (error) {
      logger.error('Error in updateTask:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        logger.error('Error deleting task:', error);
        throw new Error(`Failed to delete task: ${error.message}`);
      }

      logger.info(`Task deleted successfully: ${taskId}`);
      return true;
    } catch (error) {
      logger.error('Error in deleteTask:', error);
      throw error;
    }
  }

  async getTask(taskId: string): Promise<Task | null> {
    try {
      const { data, error } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Task not found
        }
        logger.error('Error fetching task:', error);
        throw new Error(`Failed to fetch task: ${error.message}`);
      }

      return data as Task;
    } catch (error) {
      logger.error('Error in getTask:', error);
      throw error;
    }
  }

  // Context-aware Queries

  async getTasksForDeal(dealId: string, filters?: TaskFilters): Promise<Task[]> {
    try {
      let query = this.supabase
        .from('tasks')
        .select('*')
        .eq('deal_id', dealId);

      query = this.applyTaskFilters(query, filters);

      const { data, error } = await query.order('calculated_priority', { ascending: false });

      if (error) {
        logger.error('Error fetching tasks for deal:', error);
        throw new Error(`Failed to fetch tasks for deal: ${error.message}`);
      }

      return data as Task[];
    } catch (error) {
      logger.error('Error in getTasksForDeal:', error);
      throw error;
    }
  }

  async getTasksForLead(leadId: string, filters?: TaskFilters): Promise<Task[]> {
    try {
      let query = this.supabase
        .from('tasks')
        .select('*')
        .eq('lead_id', leadId);

      query = this.applyTaskFilters(query, filters);

      const { data, error } = await query.order('calculated_priority', { ascending: false });

      if (error) {
        logger.error('Error fetching tasks for lead:', error);
        throw new Error(`Failed to fetch tasks for lead: ${error.message}`);
      }

      return data as Task[];
    } catch (error) {
      logger.error('Error in getTasksForLead:', error);
      throw error;
    }
  }

  async getTasksForUser(userId: string, filters?: TaskFilters): Promise<Task[]> {
    try {
      let query = this.supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to_user_id.eq.${userId},created_by_user_id.eq.${userId}`);

      query = this.applyTaskFilters(query, filters);

      const { data, error } = await query.order('calculated_priority', { ascending: false });

      if (error) {
        logger.error('Error fetching tasks for user:', error);
        throw new Error(`Failed to fetch tasks for user: ${error.message}`);
      }

      return data as Task[];
    } catch (error) {
      logger.error('Error in getTasksForUser:', error);
      throw error;
    }
  }

  async getMyAssignedTasks(userId: string, filters?: TaskFilters): Promise<Task[]> {
    try {
      let query = this.supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to_user_id', userId);

      query = this.applyTaskFilters(query, filters);

      const { data, error } = await query.order('calculated_priority', { ascending: false });

      if (error) {
        logger.error('Error fetching assigned tasks:', error);
        throw new Error(`Failed to fetch assigned tasks: ${error.message}`);
      }

      return data as Task[];
    } catch (error) {
      logger.error('Error in getMyAssignedTasks:', error);
      throw error;
    }
  }

  async getOverdueTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await this.supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to_user_id.eq.${userId},created_by_user_id.eq.${userId}`)
        .lt('due_date', new Date().toISOString())
        .neq('status', 'COMPLETED')
        .neq('status', 'CANCELLED')
        .order('due_date', { ascending: true });

      if (error) {
        logger.error('Error fetching overdue tasks:', error);
        throw new Error(`Failed to fetch overdue tasks: ${error.message}`);
      }

      return data as Task[];
    } catch (error) {
      logger.error('Error in getOverdueTasks:', error);
      throw error;
    }
  }

  async getTasksDueToday(userId: string): Promise<Task[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      const { data, error } = await this.supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to_user_id.eq.${userId},created_by_user_id.eq.${userId}`)
        .gte('due_date', startOfDay)
        .lt('due_date', endOfDay)
        .neq('status', 'COMPLETED')
        .neq('status', 'CANCELLED')
        .order('calculated_priority', { ascending: false });

      if (error) {
        logger.error('Error fetching tasks due today:', error);
        throw new Error(`Failed to fetch tasks due today: ${error.message}`);
      }

      return data as Task[];
    } catch (error) {
      logger.error('Error in getTasksDueToday:', error);
      throw error;
    }
  }

  // Business Logic

  async completeTask(taskId: string, completionData?: TaskCompletion): Promise<Task> {
    try {
      const updates: UpdateTaskInput = {
        status: 'COMPLETED',
        completed_at: completionData?.completed_at || new Date().toISOString(),
        actual_hours: completionData?.actual_hours
      };

      const task = await this.updateTask(taskId, updates, ''); // userId will be from auth context

      // Check if task completion should trigger stage changes
      if (task.completion_triggers_stage_change) {
        await this.triggerStageChange(task);
      }

      return task;
    } catch (error) {
      logger.error('Error in completeTask:', error);
      throw error;
    }
  }

  async calculateTaskPriority(taskId: string): Promise<number> {
    try {
      // Use the database function for consistent calculation
      const { data, error } = await this.supabase
        .rpc('calculate_task_priority', { task_row: { id: taskId } });

      if (error) {
        logger.error('Error calculating task priority:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      logger.error('Error in calculateTaskPriority:', error);
      return 0;
    }
  }

  // Task Dependencies

  async getTaskDependencies(taskId: string): Promise<TaskDependency[]> {
    try {
      const { data, error } = await this.supabase
        .from('task_dependencies')
        .select('*')
        .eq('task_id', taskId);

      if (error) {
        logger.error('Error fetching task dependencies:', error);
        throw new Error(`Failed to fetch task dependencies: ${error.message}`);
      }

      return data as TaskDependency[];
    } catch (error) {
      logger.error('Error in getTaskDependencies:', error);
      throw error;
    }
  }

  async createTaskDependency(taskId: string, dependsOnTaskId: string, dependencyType: string = 'BLOCKS'): Promise<TaskDependency> {
    try {
      const { data, error } = await this.supabase
        .from('task_dependencies')
        .insert([{
          task_id: taskId,
          depends_on_task_id: dependsOnTaskId,
          dependency_type: dependencyType
        }])
        .select('*')
        .single();

      if (error) {
        logger.error('Error creating task dependency:', error);
        throw new Error(`Failed to create task dependency: ${error.message}`);
      }

      return data as TaskDependency;
    } catch (error) {
      logger.error('Error in createTaskDependency:', error);
      throw error;
    }
  }

  // Automation

  async triggerAutomationRules(event: CRMEvent): Promise<Task[]> {
    try {
      // Get active automation rules for this entity type and event
      const { data: rules, error: rulesError } = await this.supabase
        .from('task_automation_rules')
        .select('*')
        .eq('is_active', true)
        .eq('applies_to_entity_type', event.entity_type)
        .eq('trigger_event', event.event_type);

      if (rulesError) {
        logger.error('Error fetching automation rules:', rulesError);
        throw new Error(`Failed to fetch automation rules: ${rulesError.message}`);
      }

      const createdTasks: Task[] = [];

      for (const rule of rules || []) {
        // Evaluate trigger conditions
        if (this.evaluateTriggerConditions(rule.trigger_conditions, event.event_data)) {
          const task = await this.createTaskFromTemplate(rule.task_template, {
            entity_type: event.entity_type,
            entity_id: event.entity_id,
            deal_id: event.entity_type === 'DEAL' ? event.entity_id : undefined,
            lead_id: event.entity_type === 'LEAD' ? event.entity_id : undefined,
            person_id: event.entity_type === 'PERSON' ? event.entity_id : undefined,
            organization_id: event.entity_type === 'ORGANIZATION' ? event.entity_id : undefined
          });

          if (task) {
            createdTasks.push(task);
          }
        }
      }

      logger.info(`Created ${createdTasks.length} tasks from automation rules`);
      return createdTasks;
    } catch (error) {
      logger.error('Error in triggerAutomationRules:', error);
      throw error;
    }
  }

  async createTaskFromTemplate(template: Record<string, any>, context: CRMContext): Promise<Task | null> {
    try {
      const taskData: CreateTaskInput = {
        title: this.processTemplate(template.title, context),
        description: template.description ? this.processTemplate(template.description, context) : undefined,
        task_type: template.task_type,
        entity_type: context.entity_type,
        entity_id: context.entity_id,
        priority: template.priority || 'MEDIUM',
        due_date: template.due_in_days ? 
          new Date(Date.now() + template.due_in_days * 24 * 60 * 60 * 1000).toISOString() : 
          undefined,
        deal_id: context.deal_id,
        lead_id: context.lead_id,
        person_id: context.person_id,
        organization_id: context.organization_id,
        blocks_stage_progression: template.blocks_stage_progression || false,
        required_for_deal_closure: template.required_for_deal_closure || false,
        affects_lead_scoring: template.affects_lead_scoring || false,
        tags: template.tags || []
      };

      return await this.createTask(taskData, 'system'); // System-created tasks
    } catch (error) {
      logger.error('Error creating task from template:', error);
      return null;
    }
  }

  // Helper Methods

  private applyTaskFilters(query: any, filters?: TaskFilters): any {
    if (!filters) return query;

    if (filters.status) {
      query = query.in('status', filters.status);
    }

    if (filters.priority) {
      query = query.in('priority', filters.priority);
    }

    if (filters.task_type) {
      query = query.in('task_type', filters.task_type);
    }

    if (filters.entity_type) {
      query = query.in('entity_type', filters.entity_type);
    }

    if (filters.entity_id) {
      query = query.eq('entity_id', filters.entity_id);
    }

    if (filters.assigned_to_user_id) {
      query = query.eq('assigned_to_user_id', filters.assigned_to_user_id);
    }

    if (filters.created_by_user_id) {
      query = query.eq('created_by_user_id', filters.created_by_user_id);
    }

    if (filters.due_date_from) {
      query = query.gte('due_date', filters.due_date_from);
    }

    if (filters.due_date_to) {
      query = query.lte('due_date', filters.due_date_to);
    }

    if (filters.overdue) {
      query = query.lt('due_date', new Date().toISOString());
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    return query;
  }

  private evaluateTriggerConditions(conditions: Record<string, any>, eventData: Record<string, any>): boolean {
    // Simple condition evaluation - can be extended for complex logic
    for (const [key, expectedValue] of Object.entries(conditions)) {
      if (eventData[key] !== expectedValue) {
        return false;
      }
    }
    return true;
  }

  private processTemplate(template: string, context: CRMContext): string {
    // Simple template processing - replace variables with context data
    return template
      .replace('{{entity_type}}', context.entity_type)
      .replace('{{entity_id}}', context.entity_id);
  }

  private async triggerStageChange(task: Task): Promise<void> {
    // Implement stage change logic based on task completion
    // This would integrate with the WFM system
    logger.info(`Task completion triggered stage change for entity ${task.entity_type}:${task.entity_id}`);
  }
}

export { TaskService }; 