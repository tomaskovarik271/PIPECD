import { google } from 'googleapis';
import { googleIntegrationService } from './googleIntegrationService';
import { getAuthenticatedClient } from './serviceUtils';

// Google Tasks API Types
export interface TaskList {
  id: string;
  title: string;
  updated: string;
  selfLink?: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  deleted?: boolean;
  hidden?: boolean;
  parent?: string;
  position?: string;
  updated: string;
  selfLink?: string;
  links?: Array<{
    type: string;
    description: string;
    link: string;
  }>;
  // CRM Context - will be stored in notes as structured data
  dealId?: string;
  personId?: string;
  organizationId?: string;
  taskType?: 'FOLLOW_UP' | 'PREPARATION' | 'DEADLINE' | 'EMAIL' | 'CALL' | 'MEETING_OUTCOME' | 'INTERNAL';
}

export interface TaskInput {
  title: string;
  notes?: string;
  due?: string;
  parent?: string;
  // CRM Context
  dealId?: string;
  personId?: string;
  organizationId?: string;
  taskType?: 'FOLLOW_UP' | 'PREPARATION' | 'DEADLINE' | 'EMAIL' | 'CALL' | 'MEETING_OUTCOME' | 'INTERNAL';
}

export interface TaskUpdateInput {
  title?: string;
  notes?: string;
  status?: 'needsAction' | 'completed';
  due?: string;
  parent?: string;
}

export interface TaskListInput {
  title: string;
}

class GoogleTasksService {
  private async getTasksClient(userId: string, accessToken: string) {
    try {
      const tokens = await googleIntegrationService.getStoredTokens(userId, accessToken);
      if (!tokens) {
        throw new Error('TASKS_NOT_CONNECTED');
      }

      // Check if we have tasks scope
      const requiredScope = 'https://www.googleapis.com/auth/tasks';
      if (!tokens.granted_scopes.includes(requiredScope)) {
        throw new Error('TASKS_SCOPE_MISSING');
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      // Set up automatic token refresh
      oauth2Client.on('tokens', async (newTokens) => {
        if (newTokens.refresh_token) {
          await googleIntegrationService.storeExtendedTokens(
            userId,
            {
              access_token: newTokens.access_token!,
              refresh_token: newTokens.refresh_token,
              expires_at: newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : undefined,
              granted_scopes: tokens.granted_scopes
            },
            accessToken
          );
        } else if (newTokens.access_token) {
          const supabase = getAuthenticatedClient(accessToken);
          await supabase
            .from('google_oauth_tokens')
            .update({
              access_token: newTokens.access_token,
              expires_at: newTokens.expiry_date ? new Date(newTokens.expiry_date).toISOString() : null,
              last_used_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        }
      });

      return google.tasks({ version: 'v1', auth: oauth2Client });
    } catch (error) {
      console.error('Error creating Google Tasks client:', error);
      throw error;
    }
  }

  /**
   * Format Google Tasks API response to our interface
   */
  private formatTask(task: any): Task {
    // Parse CRM context from notes if present
    let crmContext = {};
    if (task.notes) {
      try {
        const match = task.notes.match(/\[CRM_CONTEXT\](.*?)\[\/CRM_CONTEXT\]/s);
        if (match) {
          crmContext = JSON.parse(match[1]);
        }
      } catch (e) {
        // If parsing fails, ignore CRM context
      }
    }

    return {
      id: task.id,
      title: task.title || 'Untitled Task',
      notes: task.notes || undefined,
      status: task.status || 'needsAction',
      due: task.due || undefined,
      completed: task.completed || undefined,
      deleted: task.deleted || false,
      hidden: task.hidden || false,
      parent: task.parent || undefined,
      position: task.position || undefined,
      updated: task.updated,
      selfLink: task.selfLink || undefined,
      links: task.links || undefined,
      ...crmContext
    };
  }

  /**
   * Add CRM context to task notes
   */
  private addCrmContextToNotes(notes: string = '', crmContext: any): string {
    // Remove existing CRM context if present
    const cleanNotes = notes.replace(/\[CRM_CONTEXT\].*?\[\/CRM_CONTEXT\]/s, '').trim();
    
    // Add new CRM context if provided
    if (Object.keys(crmContext).length > 0) {
      const contextString = `[CRM_CONTEXT]${JSON.stringify(crmContext)}[/CRM_CONTEXT]`;
      return cleanNotes ? `${cleanNotes}\n\n${contextString}` : contextString;
    }
    
    return cleanNotes;
  }

  /**
   * Get all task lists for the user
   */
  async getTaskLists(userId: string, accessToken: string): Promise<TaskList[]> {
    try {
      const tasks = await this.getTasksClient(userId, accessToken);
      
      const response = await tasks.tasklists.list({
        maxResults: 100
      });

      return response.data.items?.map(taskList => ({
        id: taskList.id!,
        title: taskList.title!,
        updated: taskList.updated!,
        selfLink: taskList.selfLink || undefined
      })) || [];
    } catch (error) {
      console.error('Error fetching task lists:', error);
      throw new Error('Failed to fetch task lists');
    }
  }

  /**
   * Create a new task list
   */
  async createTaskList(userId: string, accessToken: string, input: TaskListInput): Promise<TaskList> {
    try {
      const tasks = await this.getTasksClient(userId, accessToken);
      
      const response = await tasks.tasklists.insert({
        requestBody: {
          title: input.title
        }
      });

      return {
        id: response.data.id!,
        title: response.data.title!,
        updated: response.data.updated!,
        selfLink: response.data.selfLink || undefined
      };
    } catch (error) {
      console.error('Error creating task list:', error);
      throw new Error('Failed to create task list');
    }
  }

  /**
   * Get tasks from a specific task list
   */
  async getTasks(
    userId: string, 
    accessToken: string, 
    taskListId: string,
    options: {
      completed?: boolean;
      maxResults?: number;
      dueMin?: string;
      dueMax?: string;
    } = {}
  ): Promise<Task[]> {
    try {
      const tasks = await this.getTasksClient(userId, accessToken);
      
      const response = await tasks.tasks.list({
        tasklist: taskListId,
        maxResults: options.maxResults || 100,
        showCompleted: options.completed,
        showDeleted: false,
        showHidden: false,
        dueMin: options.dueMin,
        dueMax: options.dueMax
      });

      return response.data.items?.map(task => this.formatTask(task)) || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  /**
   * Create a new task
   */
  async createTask(
    userId: string, 
    accessToken: string, 
    taskListId: string, 
    input: TaskInput
  ): Promise<Task> {
    try {
      const tasks = await this.getTasksClient(userId, accessToken);
      
      // Extract CRM context
      const { dealId, personId, organizationId, taskType, ...taskData } = input;
      const crmContext = { dealId, personId, organizationId, taskType };
      
      // Add CRM context to notes
      const notesWithContext = this.addCrmContextToNotes(input.notes, crmContext);
      
      const response = await tasks.tasks.insert({
        tasklist: taskListId,
        parent: input.parent,
        requestBody: {
          title: input.title,
          notes: notesWithContext,
          due: input.due
        }
      });

      return this.formatTask(response.data);
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(
    userId: string, 
    accessToken: string, 
    taskListId: string, 
    taskId: string,
    input: TaskUpdateInput
  ): Promise<Task> {
    try {
      const tasks = await this.getTasksClient(userId, accessToken);
      
      const response = await tasks.tasks.update({
        tasklist: taskListId,
        task: taskId,
        requestBody: input
      });

      return this.formatTask(response.data);
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  /**
   * Mark task as completed
   */
  async completeTask(
    userId: string, 
    accessToken: string, 
    taskListId: string, 
    taskId: string
  ): Promise<Task> {
    return this.updateTask(userId, accessToken, taskListId, taskId, {
      status: 'completed'
    });
  }

  /**
   * Mark task as incomplete
   */
  async uncompleteTask(
    userId: string, 
    accessToken: string, 
    taskListId: string, 
    taskId: string
  ): Promise<Task> {
    return this.updateTask(userId, accessToken, taskListId, taskId, {
      status: 'needsAction'
    });
  }

  /**
   * Delete a task
   */
  async deleteTask(
    userId: string, 
    accessToken: string, 
    taskListId: string, 
    taskId: string
  ): Promise<void> {
    try {
      const tasks = await this.getTasksClient(userId, accessToken);
      
      await tasks.tasks.delete({
        tasklist: taskListId,
        task: taskId
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }

  /**
   * Move task to different position or parent
   */
  async moveTask(
    userId: string, 
    accessToken: string, 
    taskListId: string, 
    taskId: string,
    parent?: string,
    previous?: string
  ): Promise<Task> {
    try {
      const tasks = await this.getTasksClient(userId, accessToken);
      
      const response = await tasks.tasks.move({
        tasklist: taskListId,
        task: taskId,
        parent,
        previous
      });

      return this.formatTask(response.data);
    } catch (error) {
      console.error('Error moving task:', error);
      throw new Error('Failed to move task');
    }
  }

  /**
   * Clear all completed tasks from a task list
   */
  async clearCompletedTasks(
    userId: string, 
    accessToken: string, 
    taskListId: string
  ): Promise<void> {
    try {
      const tasks = await this.getTasksClient(userId, accessToken);
      
      await tasks.tasks.clear({
        tasklist: taskListId
      });
    } catch (error) {
      console.error('Error clearing completed tasks:', error);
      throw new Error('Failed to clear completed tasks');
    }
  }

  /**
   * Get tasks with CRM context (filtered by deal, person, or organization)
   */
  async getTasksWithCrmContext(
    userId: string, 
    accessToken: string,
    filters: {
      dealId?: string;
      personId?: string;
      organizationId?: string;
      taskType?: string;
    }
  ): Promise<Array<Task & { taskListId: string; taskListTitle: string }>> {
    try {
      // Get all task lists
      const taskLists = await this.getTaskLists(userId, accessToken);
      
      // Get tasks from all lists
      const allTasksPromises = taskLists.map(async (taskList) => {
        const tasks = await this.getTasks(userId, accessToken, taskList.id);
        return tasks.map(task => ({
          ...task,
          taskListId: taskList.id,
          taskListTitle: taskList.title
        }));
      });
      
      const allTasksArrays = await Promise.all(allTasksPromises);
      const allTasks = allTasksArrays.flat();
      
      // Filter tasks based on CRM context
      return allTasks.filter(task => {
        if (filters.dealId && task.dealId !== filters.dealId) return false;
        if (filters.personId && task.personId !== filters.personId) return false;
        if (filters.organizationId && task.organizationId !== filters.organizationId) return false;
        if (filters.taskType && task.taskType !== filters.taskType) return false;
        return true;
      });
    } catch (error) {
      console.error('Error fetching tasks with CRM context:', error);
      throw new Error('Failed to fetch tasks with CRM context');
    }
  }
}

// Export singleton instance following PipeCD patterns
export const googleTasksService = new GoogleTasksService(); 