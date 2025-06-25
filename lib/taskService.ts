import { supabase } from './supabaseClient'
import type { Database } from './database.types'

type Tables = Database['public']['Tables']
type TaskRow = Tables['tasks']['Row']
type TaskInsert = Tables['tasks']['Insert']
type TaskUpdate = Tables['tasks']['Update']

// Service interfaces
export interface CreateTaskParams {
  title: string
  description?: string
  type: TaskRow['type']
  priority?: TaskRow['priority']
  dueDate?: string
  estimatedDuration?: number // minutes
  assignedToUserId?: string
  dealId?: string
  leadId?: string
  personId?: string
  organizationId?: string
  emailThreadId?: string
  calendarEventId?: string
  notes?: string
  tags?: string[]
}

export interface UpdateTaskParams {
  title?: string
  description?: string
  type?: TaskRow['type']
  status?: TaskRow['status']
  priority?: TaskRow['priority']
  dueDate?: string
  completedAt?: string
  estimatedDuration?: number
  assignedToUserId?: string
  notes?: string
  tags?: string[]
}

export interface TaskFilters {
  status?: TaskRow['status']
  assignedToUserId?: string
  createdByUserId?: string
  dealId?: string
  leadId?: string
  dueBefore?: string
  dueAfter?: string
  limit?: number
  offset?: number
}

class TaskService {
  private supabase: typeof supabase

  constructor() {
    this.supabase = supabase
  }

  // Create a new task
  async createTask(params: CreateTaskParams, createdByUserId: string): Promise<TaskRow> {
    const taskData: TaskInsert = {
      title: params.title,
      description: params.description,
      type: params.type,
      priority: params.priority || 'medium',
      due_date: params.dueDate,
      estimated_duration: params.estimatedDuration ? `${params.estimatedDuration} minutes` : null,
      assigned_to_user_id: params.assignedToUserId,
      created_by_user_id: createdByUserId,
      deal_id: params.dealId,
      lead_id: params.leadId,
      person_id: params.personId,
      organization_id: params.organizationId,
      email_thread_id: params.emailThreadId,
      calendar_event_id: params.calendarEventId,
      notes: params.notes,
      tags: params.tags
    }

    const { data, error } = await this.supabase
      .from('tasks')
      .insert(taskData)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`)
    }

    return data
  }

  // Get a single task by ID
  async getTaskById(id: string): Promise<TaskRow | null> {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Task not found
      }
      throw new Error(`Failed to get task: ${error.message}`)
    }

    return data
  }

  // Get tasks with filtering
  async getTasks(filters: TaskFilters = {}): Promise<TaskRow[]> {
    let query = this.supabase
      .from('tasks')
      .select('*')

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.assignedToUserId) {
      query = query.eq('assigned_to_user_id', filters.assignedToUserId)
    }
    if (filters.createdByUserId) {
      query = query.eq('created_by_user_id', filters.createdByUserId)
    }
    if (filters.dealId) {
      query = query.eq('deal_id', filters.dealId)
    }
    if (filters.leadId) {
      query = query.eq('lead_id', filters.leadId)
    }
    if (filters.dueBefore) {
      query = query.lte('due_date', filters.dueBefore)
    }
    if (filters.dueAfter) {
      query = query.gte('due_date', filters.dueAfter)
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1)
    }

    // Order by due date (soonest first, then null dates last)
    query = query.order('due_date', { ascending: true, nullsFirst: false })
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get tasks: ${error.message}`)
    }

    return data || []
  }

  // Get tasks for timeline (deal-specific with date range)
  async getTimelineTasks(dealId: string, startDate?: string, endDate?: string): Promise<TaskRow[]> {
    let query = this.supabase
      .from('tasks')
      .select('*')
      .eq('deal_id', dealId)

    if (startDate) {
      query = query.gte('due_date', startDate)
    }
    if (endDate) {
      query = query.lte('due_date', endDate)
    }

    query = query.order('due_date', { ascending: true, nullsFirst: false })

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get timeline tasks: ${error.message}`)
    }

    return data || []
  }

  // Get user's daily tasks
  async getDailyTasks(userId: string, date: string): Promise<TaskRow[]> {
    const startOfDay = `${date}T00:00:00.000Z`
    const endOfDay = `${date}T23:59:59.999Z`

    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to_user_id', userId)
      .gte('due_date', startOfDay)
      .lte('due_date', endOfDay)
      .order('due_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to get daily tasks: ${error.message}`)
    }

    return data || []
  }

  // Update a task
  async updateTask(id: string, params: UpdateTaskParams): Promise<TaskRow> {
    const updateData: TaskUpdate = {
      ...(params.title && { title: params.title }),
      ...(params.description !== undefined && { description: params.description }),
      ...(params.type && { type: params.type }),
      ...(params.status && { status: params.status }),
      ...(params.priority && { priority: params.priority }),
      ...(params.dueDate !== undefined && { due_date: params.dueDate }),
      ...(params.completedAt !== undefined && { completed_at: params.completedAt }),
      ...(params.estimatedDuration !== undefined && { 
        estimated_duration: params.estimatedDuration ? `${params.estimatedDuration} minutes` : null 
      }),
      ...(params.assignedToUserId !== undefined && { assigned_to_user_id: params.assignedToUserId }),
      ...(params.notes !== undefined && { notes: params.notes }),
      ...(params.tags !== undefined && { tags: params.tags })
    }

    const { data, error } = await this.supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`)
    }

    return data
  }

  // Complete a task
  async completeTask(id: string, notes?: string): Promise<TaskRow> {
    const updateData: TaskUpdate = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      ...(notes && { notes })
    }

    return this.updateTask(id, updateData)
  }

  // Reschedule a task
  async rescheduleTask(id: string, newDueDate: string): Promise<TaskRow> {
    return this.updateTask(id, { dueDate: newDueDate })
  }

  // Reassign a task
  async reassignTask(id: string, newAssigneeId: string): Promise<TaskRow> {
    return this.updateTask(id, { assignedToUserId: newAssigneeId })
  }

  // Delete a task
  async deleteTask(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`)
    }

    return true
  }

  // Get task statistics for analytics
  async getTaskStats(userId?: string): Promise<{
    total: number
    pending: number
    inProgress: number
    completed: number
    overdue: number
  }> {
    let query = this.supabase
      .from('tasks')
      .select('status, due_date')

    if (userId) {
      query = query.eq('assigned_to_user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get task stats: ${error.message}`)
    }

    const now = new Date().toISOString()
    const stats = {
      total: data.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0
    }

    data.forEach(task => {
      switch (task.status) {
        case 'pending':
          stats.pending++
          if (task.due_date && task.due_date < now) {
            stats.overdue++
          }
          break
        case 'in_progress':
          stats.inProgress++
          if (task.due_date && task.due_date < now) {
            stats.overdue++
          }
          break
        case 'completed':
          stats.completed++
          break
      }
    })

    return stats
  }

  // Bulk update tasks
  async bulkUpdateTasks(ids: string[], params: UpdateTaskParams): Promise<TaskRow[]> {
    const updateData: TaskUpdate = {
      ...(params.status && { status: params.status }),
      ...(params.priority && { priority: params.priority }),
      ...(params.assignedToUserId !== undefined && { assigned_to_user_id: params.assignedToUserId }),
      ...(params.tags !== undefined && { tags: params.tags })
    }

    const { data, error } = await this.supabase
      .from('tasks')
      .update(updateData)
      .in('id', ids)
      .select('*')

    if (error) {
      throw new Error(`Failed to bulk update tasks: ${error.message}`)
    }

    return data || []
  }
}

// Export singleton instance
export const taskService = new TaskService()
export default taskService 