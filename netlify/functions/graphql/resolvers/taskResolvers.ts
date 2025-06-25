import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication } from '../helpers';
import { taskService } from '../../../../lib/taskService';
import { getServiceLevelUserProfileData } from '../../../../lib/userProfileService';
import { dealService } from '../../../../lib/dealService';
import { leadService } from '../../../../lib/leadService';
import { personService } from '../../../../lib/personService';
import { organizationService } from '../../../../lib/organizationService';

// Helper function to check task permissions
async function checkTaskPermission(
  context: GraphQLContext,
  permission: string,
  taskId?: string
): Promise<void> {
  const { user, userPermissions } = await requireAuthentication(context);
  
  // Check if user has the general permission
  if (userPermissions.includes(permission)) {
    return;
  }

  // For specific task permissions, check ownership
  if (taskId) {
    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new GraphQLError('Task not found', {
        extensions: { code: 'NOT_FOUND' }
      });
    }

    // Check if user owns or is assigned to the task
    if (task.assigned_to_user_id === user.id || task.created_by_user_id === user.id) {
      return;
    }
  }

  throw new GraphQLError('Insufficient permissions', {
    extensions: { code: 'FORBIDDEN' }
  });
}

// Enum mapping functions
function mapTaskTypeToEnum(type: string): string {
  const typeMap: Record<string, string> = {
    'follow_up': 'FOLLOW_UP',
    'preparation': 'PREPARATION', 
    'deadline': 'DEADLINE',
    'internal': 'INTERNAL',
    'research': 'RESEARCH',
    'administrative': 'ADMINISTRATIVE',
    'email': 'EMAIL',
    'call': 'CALL',
    'meeting_prep': 'MEETING_PREP',
    'post_meeting': 'POST_MEETING'
  };
  return typeMap[type] || type.toUpperCase();
}

function mapTaskTypeFromEnum(type: string): string {
  const typeMap: Record<string, string> = {
    'FOLLOW_UP': 'follow_up',
    'PREPARATION': 'preparation',
    'DEADLINE': 'deadline',
    'INTERNAL': 'internal',
    'RESEARCH': 'research',
    'ADMINISTRATIVE': 'administrative',
    'EMAIL': 'email',
    'CALL': 'call',
    'MEETING_PREP': 'meeting_prep',
    'POST_MEETING': 'post_meeting'
  };
  return typeMap[type] || type.toLowerCase();
}

function mapTaskStatusToEnum(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'PENDING',
    'in_progress': 'IN_PROGRESS',
    'completed': 'COMPLETED',
    'cancelled': 'CANCELLED',
    'waiting': 'WAITING'
  };
  return statusMap[status] || status.toUpperCase();
}

function mapTaskStatusFromEnum(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'pending',
    'IN_PROGRESS': 'in_progress',
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled',
    'WAITING': 'waiting'
  };
  return statusMap[status] || status.toLowerCase();
}

function mapTaskPriorityToEnum(priority: string): string {
  const priorityMap: Record<string, string> = {
    'low': 'LOW',
    'medium': 'MEDIUM',
    'high': 'HIGH',
    'urgent': 'URGENT'
  };
  return priorityMap[priority] || priority.toUpperCase();
}

function mapTaskPriorityFromEnum(priority: string): string {
  const priorityMap: Record<string, string> = {
    'LOW': 'low',
    'MEDIUM': 'medium',
    'HIGH': 'high',
    'URGENT': 'urgent'
  };
  return priorityMap[priority] || priority.toLowerCase();
}

// Query resolvers
export const taskQueries = {
  tasks: async (_: any, { filters }: any, context: GraphQLContext) => {
    await checkTaskPermission(context, 'task:read_all');
    
    const dbFilters = {
      ...filters,
      ...(filters?.status && { status: mapTaskStatusFromEnum(filters.status) })
    };
    
    const tasks = await taskService.getTasks(dbFilters);
    
    return tasks.map(task => ({
      ...task,
      type: mapTaskTypeToEnum(task.type),
      status: mapTaskStatusToEnum(task.status),
      priority: mapTaskPriorityToEnum(task.priority),
      dueDate: task.due_date,
      completedAt: task.completed_at,
      estimatedDuration: task.estimated_duration ? 
        parseInt(task.estimated_duration.replace(' minutes', '')) : null,
      assignedToUser: task.assigned_to_user_id,
      createdByUser: task.created_by_user_id,
      deal: task.deal_id,
      lead: task.lead_id,
      person: task.person_id,
      organization: task.organization_id,
      emailThreadId: task.email_thread_id,
      calendarEventId: task.calendar_event_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));
  },

  task: async (_: any, { id }: any, context: GraphQLContext) => {
    await checkTaskPermission(context, 'task:read_assigned', id);
    
    const task = await taskService.getTaskById(id);
    if (!task) return null;
    
    return {
      ...task,
      type: mapTaskTypeToEnum(task.type),
      status: mapTaskStatusToEnum(task.status),
      priority: mapTaskPriorityToEnum(task.priority),
      dueDate: task.due_date,
      completedAt: task.completed_at,
      estimatedDuration: task.estimated_duration ? 
        parseInt(task.estimated_duration.replace(' minutes', '')) : null,
      assignedToUser: task.assigned_to_user_id,
      createdByUser: task.created_by_user_id,
      deal: task.deal_id,
      lead: task.lead_id,
      person: task.person_id,
      organization: task.organization_id,
      emailThreadId: task.email_thread_id,
      calendarEventId: task.calendar_event_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };
  },

  timelineTasks: async (_: any, { dealId, startDate, endDate }: any, context: GraphQLContext) => {
    await checkTaskPermission(context, 'task:read_assigned');
    
    const tasks = await taskService.getTimelineTasks(dealId, startDate, endDate);
    
    return tasks.map(task => ({
      ...task,
      type: mapTaskTypeToEnum(task.type),
      status: mapTaskStatusToEnum(task.status),
      priority: mapTaskPriorityToEnum(task.priority),
      dueDate: task.due_date,
      completedAt: task.completed_at,
      estimatedDuration: task.estimated_duration ? 
        parseInt(task.estimated_duration.replace(' minutes', '')) : null,
      assignedToUser: task.assigned_to_user_id,
      createdByUser: task.created_by_user_id,
      deal: task.deal_id,
      lead: task.lead_id,
      person: task.person_id,
      organization: task.organization_id,
      emailThreadId: task.email_thread_id,
      calendarEventId: task.calendar_event_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));
  },

  myDailyTasks: async (_: any, { date }: any, context: GraphQLContext) => {
    const { user } = await requireAuthentication(context);
    
    const tasks = await taskService.getDailyTasks(user.id, date);
    
    return tasks.map(task => ({
      ...task,
      type: mapTaskTypeToEnum(task.type),
      status: mapTaskStatusToEnum(task.status),
      priority: mapTaskPriorityToEnum(task.priority),
      dueDate: task.due_date,
      completedAt: task.completed_at,
      estimatedDuration: task.estimated_duration ? 
        parseInt(task.estimated_duration.replace(' minutes', '')) : null,
      assignedToUser: task.assigned_to_user_id,
      createdByUser: task.created_by_user_id,
      deal: task.deal_id,
      lead: task.lead_id,
      person: task.person_id,
      organization: task.organization_id,
      emailThreadId: task.email_thread_id,
      calendarEventId: task.calendar_event_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));
  },

  taskStats: async (_: any, { userId }: any, context: GraphQLContext) => {
    await checkTaskPermission(context, 'task:read_all');
    
    const stats = await taskService.getTaskStats(userId);
    return stats;
  }
};

// Mutation resolvers
export const taskMutations = {
  createTask: async (_: any, { input }: any, context: GraphQLContext) => {
    await checkTaskPermission(context, 'task:create');
    const { user } = await requireAuthentication(context);
    
    const params = {
      ...input,
      type: mapTaskTypeFromEnum(input.type),
      priority: input.priority ? mapTaskPriorityFromEnum(input.priority) : undefined
    };
    
    const task = await taskService.createTask(params, user.id);
    
    return {
      ...task,
      type: mapTaskTypeToEnum(task.type),
      status: mapTaskStatusToEnum(task.status),
      priority: mapTaskPriorityToEnum(task.priority),
      dueDate: task.due_date,
      completedAt: task.completed_at,
      estimatedDuration: task.estimated_duration ? 
        parseInt(task.estimated_duration.replace(' minutes', '')) : null,
      assignedToUser: task.assigned_to_user_id,
      createdByUser: task.created_by_user_id,
      deal: task.deal_id,
      lead: task.lead_id,
      person: task.person_id,
      organization: task.organization_id,
      emailThreadId: task.email_thread_id,
      calendarEventId: task.calendar_event_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };
  },

  updateTask: async (_: any, { id, input }: any, context: GraphQLContext) => {
    await checkTaskPermission(context, 'task:update_assigned', id);
    
    const params = {
      ...input,
      type: input.type ? mapTaskTypeFromEnum(input.type) : undefined,
      status: input.status ? mapTaskStatusFromEnum(input.status) : undefined,
      priority: input.priority ? mapTaskPriorityFromEnum(input.priority) : undefined
    };
    
    const task = await taskService.updateTask(id, params);
    
    return {
      ...task,
      type: mapTaskTypeToEnum(task.type),
      status: mapTaskStatusToEnum(task.status),
      priority: mapTaskPriorityToEnum(task.priority),
      dueDate: task.due_date,
      completedAt: task.completed_at,
      estimatedDuration: task.estimated_duration ? 
        parseInt(task.estimated_duration.replace(' minutes', '')) : null,
      assignedToUser: task.assigned_to_user_id,
      createdByUser: task.created_by_user_id,
      deal: task.deal_id,
      lead: task.lead_id,
      person: task.person_id,
      organization: task.organization_id,
      emailThreadId: task.email_thread_id,
      calendarEventId: task.calendar_event_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };
  },

  deleteTask: async (_: any, { id }: any, context: GraphQLContext) => {
    await checkTaskPermission(context, 'task:delete_assigned', id);
    
    return await taskService.deleteTask(id);
  },

  completeTask: async (_: any, { id, notes }: any, context: GraphQLContext) => {
    await checkTaskPermission(context, 'task:update_assigned', id);
    
    const task = await taskService.completeTask(id, notes);
    
    return {
      ...task,
      type: mapTaskTypeToEnum(task.type),
      status: mapTaskStatusToEnum(task.status),
      priority: mapTaskPriorityToEnum(task.priority),
      dueDate: task.due_date,
      completedAt: task.completed_at,
      estimatedDuration: task.estimated_duration ? 
        parseInt(task.estimated_duration.replace(' minutes', '')) : null,
      assignedToUser: task.assigned_to_user_id,
      createdByUser: task.created_by_user_id,
      deal: task.deal_id,
      lead: task.lead_id,
      person: task.person_id,
      organization: task.organization_id,
      emailThreadId: task.email_thread_id,
      calendarEventId: task.calendar_event_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };
  },

  rescheduleTask: async (_: any, { id, newDueDate }: any, context: GraphQLContext) => {
    await checkTaskPermission(context, 'task:update_assigned', id);
    
    const task = await taskService.rescheduleTask(id, newDueDate);
    
    return {
      ...task,
      type: mapTaskTypeToEnum(task.type),
      status: mapTaskStatusToEnum(task.status),
      priority: mapTaskPriorityToEnum(task.priority),
      dueDate: task.due_date,
      completedAt: task.completed_at,
      estimatedDuration: task.estimated_duration ? 
        parseInt(task.estimated_duration.replace(' minutes', '')) : null,
      assignedToUser: task.assigned_to_user_id,
      createdByUser: task.created_by_user_id,
      deal: task.deal_id,
      lead: task.lead_id,
      person: task.person_id,
      organization: task.organization_id,
      emailThreadId: task.email_thread_id,
      calendarEventId: task.calendar_event_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };
  },

  reassignTask: async (_: any, { id, newAssigneeId }: any, context: GraphQLContext) => {
    await checkTaskPermission(context, 'task:reassign', id);
    
    const task = await taskService.reassignTask(id, newAssigneeId);
    
    return {
      ...task,
      type: mapTaskTypeToEnum(task.type),
      status: mapTaskStatusToEnum(task.status),
      priority: mapTaskPriorityToEnum(task.priority),
      dueDate: task.due_date,
      completedAt: task.completed_at,
      estimatedDuration: task.estimated_duration ? 
        parseInt(task.estimated_duration.replace(' minutes', '')) : null,
      assignedToUser: task.assigned_to_user_id,
      createdByUser: task.created_by_user_id,
      deal: task.deal_id,
      lead: task.lead_id,
      person: task.person_id,
      organization: task.organization_id,
      emailThreadId: task.email_thread_id,
      calendarEventId: task.calendar_event_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };
  },

  bulkUpdateTasks: async (_: any, { ids, input }: any, context: GraphQLContext) => {
    await checkTaskPermission(context, 'task:update_all');
    
    const params = {
      ...input,
      status: input.status ? mapTaskStatusFromEnum(input.status) : undefined,
      priority: input.priority ? mapTaskPriorityFromEnum(input.priority) : undefined
    };
    
    const tasks = await taskService.bulkUpdateTasks(ids, params);
    
    return tasks.map(task => ({
      ...task,
      type: mapTaskTypeToEnum(task.type),
      status: mapTaskStatusToEnum(task.status),
      priority: mapTaskPriorityToEnum(task.priority),
      dueDate: task.due_date,
      completedAt: task.completed_at,
      estimatedDuration: task.estimated_duration ? 
        parseInt(task.estimated_duration.replace(' minutes', '')) : null,
      assignedToUser: task.assigned_to_user_id,
      createdByUser: task.created_by_user_id,
      deal: task.deal_id,
      lead: task.lead_id,
      person: task.person_id,
      organization: task.organization_id,
      emailThreadId: task.email_thread_id,
      calendarEventId: task.calendar_event_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));
  }
};

// Field resolvers for nested data
export const TaskFieldResolvers = {
  assignedToUser: async (parent: any) => {
    if (!parent.assignedToUser) return null;
    return await getServiceLevelUserProfileData(parent.assignedToUser);
  },

  createdByUser: async (parent: any) => {
    if (!parent.createdByUser) return null;
    return await getServiceLevelUserProfileData(parent.createdByUser);
  },

  deal: async (parent: any) => {
    if (!parent.deal) return null;
    return await dealService.getDealById(parent.deal);
  },

  lead: async (parent: any) => {
    if (!parent.lead) return null;
    return await leadService.getLeadById(parent.lead);
  },

  person: async (parent: any) => {
    if (!parent.person) return null;
    return await personService.getPersonById(parent.person);
  },

  organization: async (parent: any) => {
    if (!parent.organization) return null;
    return await organizationService.getOrganizationById(parent.organization);
  }
}; 