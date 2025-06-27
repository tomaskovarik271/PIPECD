import { TaskService } from '../../../../lib/taskService';
import { GraphQLContext, requireAuthentication, getAccessToken } from '../helpers';
import { getAuthenticatedClient } from '../../../../lib/serviceUtils';
import { GraphQLError } from 'graphql';
import logger from '../../../../lib/logger';
import { getServiceLevelUserProfileData } from '../../../../lib/userProfileService';
import type { User } from '../../../../lib/generated/graphql';

// For now, create a simple task service initialization without complex types
const initTaskService = (supabase: any) => new TaskService(supabase);

// Task resolver that maps database fields to GraphQL fields
const mapTaskFromDb = (dbTask: any) => {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    status: dbTask.status,
    priority: dbTask.priority,
    entityType: dbTask.entity_type,
    entityId: dbTask.entity_id,
    // Keep snake_case for field resolvers to work
    assigned_to_user_id: dbTask.assigned_to_user_id,
    created_by_user_id: dbTask.created_by_user_id,
    dueDate: dbTask.due_date,
    completedAt: dbTask.completed_at,
    dealId: dbTask.deal_id,
    leadId: dbTask.lead_id,
    personId: dbTask.person_id,
    organizationId: dbTask.organization_id,
    wfmProjectId: dbTask.wfm_project_id,
    automationRuleId: dbTask.automation_rule_id,
    parentTaskId: dbTask.parent_task_id,
    completionTriggersStageChange: dbTask.completion_triggers_stage_change,
    blocksStageProgression: dbTask.blocks_stage_progression,
    requiredForDealClosure: dbTask.required_for_deal_closure,
    affectsLeadScoring: dbTask.affects_lead_scoring,
    taskType: dbTask.task_type,
    customFieldValues: dbTask.custom_field_values,
    tags: dbTask.tags,
    estimatedHours: dbTask.estimated_hours,
    actualHours: dbTask.actual_hours,
    calculatedPriority: dbTask.calculated_priority,
    businessImpactScore: dbTask.business_impact_score,
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at
  };
};

const taskResolvers = {
  Query: {
    tasksForDeal: async (_: any, { dealId, filters }: any, context: GraphQLContext) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      try {
        let query = supabase
          .from('tasks')
          .select('*')
          .eq('deal_id', dealId);

        // Apply filters if provided
        if (filters) {
          if (filters.status && filters.status.length > 0) {
            query = query.in('status', filters.status);
          }
          if (filters.priority && filters.priority.length > 0) {
            query = query.in('priority', filters.priority);
          }
          if (filters.taskType && filters.taskType.length > 0) {
            query = query.in('task_type', filters.taskType);
          }
          if (filters.assignedToUserId) {
            query = query.eq('assigned_to_user_id', filters.assignedToUserId);
          }
          if (filters.overdue) {
            query = query.lt('due_date', new Date().toISOString());
          }
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          logger.error('Error fetching tasks for deal:', error);
          throw new Error(`Failed to fetch tasks for deal: ${error.message}`);
        }

        return (data || []).map(mapTaskFromDb);
      } catch (error) {
        logger.error('Error in tasksForDeal resolver:', error);
        throw new Error('Failed to fetch tasks for deal');
      }
    },

    // Basic task query
    task: async (_: any, { id }: any, context: GraphQLContext) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('Error fetching task:', error);
        throw new Error(`Failed to fetch task: ${error.message}`);
      }

      return data ? mapTaskFromDb(data) : null;
    }
  },

  Mutation: {
    // Basic create task mutation
    createTask: async (_: any, { input }: any, context: GraphQLContext) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);

      try {
        const taskData = {
          title: input.title,
          description: input.description,
          status: input.status || 'TODO',
          priority: input.priority || 'MEDIUM',
          entity_type: input.entityType,
          entity_id: input.entityId,
          assigned_to_user_id: input.assignedToUserId,
          created_by_user_id: context.currentUser!.id,
          due_date: input.dueDate,
          deal_id: input.dealId,
          lead_id: input.leadId,
          person_id: input.personId,
          organization_id: input.organizationId,
          task_type: input.taskType,
          tags: input.tags,
          estimated_hours: input.estimatedHours
        };

        const { data, error } = await supabase
          .from('tasks')
          .insert(taskData)
          .select()
          .single();

        if (error) {
          logger.error('Error creating task:', error);
          throw new Error(`Failed to create task: ${error.message}`);
        }

        return mapTaskFromDb(data);
      } catch (error) {
        logger.error('Error in createTask mutation:', error);
        throw new Error('Failed to create task');
      }
    },

    // Update task mutation
    updateTask: async (_: any, { id, input }: any, context: GraphQLContext) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);

      try {
        const updateData: any = {};
        
        if (input.title !== undefined) updateData.title = input.title;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.priority !== undefined) updateData.priority = input.priority;
        if (input.taskType !== undefined) updateData.task_type = input.taskType;
        if (input.assignedToUserId !== undefined) updateData.assigned_to_user_id = input.assignedToUserId;
        if (input.dueDate !== undefined) updateData.due_date = input.dueDate;
        if (input.completedAt !== undefined) updateData.completed_at = input.completedAt;
        if (input.estimatedHours !== undefined) updateData.estimated_hours = input.estimatedHours;
        if (input.actualHours !== undefined) updateData.actual_hours = input.actualHours;
        if (input.tags !== undefined) updateData.tags = input.tags;

        const { data, error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          logger.error('Error updating task:', error);
          throw new Error(`Failed to update task: ${error.message}`);
        }

        return mapTaskFromDb(data);
      } catch (error) {
        logger.error('Error in updateTask mutation:', error);
        throw new Error('Failed to update task');
      }
    },

    // Complete task mutation
    completeTask: async (_: any, { id, completionData }: any, context: GraphQLContext) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);

      try {
        const updateData: any = {
          status: 'COMPLETED',
          completed_at: completionData?.completedAt || new Date().toISOString()
        };

        if (completionData?.actualHours !== undefined) {
          updateData.actual_hours = completionData.actualHours;
        }

        const { data, error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          logger.error('Error completing task:', error);
          throw new Error(`Failed to complete task: ${error.message}`);
        }

        return mapTaskFromDb(data);
      } catch (error) {
        logger.error('Error in completeTask mutation:', error);
        throw new Error('Failed to complete task');
      }
    },

    // Delete task mutation
    deleteTask: async (_: any, { id }: any, context: GraphQLContext) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);

      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);

        if (error) {
          logger.error('Error deleting task:', error);
          throw new Error(`Failed to delete task: ${error.message}`);
        }

        return true;
      } catch (error) {
        logger.error('Error in deleteTask mutation:', error);
        throw new Error('Failed to delete task');
      }
    }
  },

  // Type resolvers for Task fields that need special handling
  Task: {
    // Required user resolvers
    createdByUser: async (parent: any, _: any, context: GraphQLContext): Promise<User | null> => {
      const createdByUserId = parent.created_by_user_id;
      if (!createdByUserId) {
        return null;
      }

      try {
        const userProfileData = await getServiceLevelUserProfileData(createdByUserId);
        if (!userProfileData) {
          logger.warn(`User profile data not found for created by user ID ${createdByUserId} on task ${parent.id}.`);
          return null;
        }

        if (!userProfileData.email) {
          logger.error(`User profile for ${createdByUserId} is missing an email. Task ${parent.id}. Returning null for createdByUser.`);
          return null;
        }

        return {
          id: userProfileData.user_id,
          email: userProfileData.email,
          display_name: userProfileData.display_name || userProfileData.email,
          avatar_url: userProfileData.avatar_url,
        } as User;
      } catch (error: any) {
        logger.error(`Error fetching created by user for task ${parent.id}, user ID ${createdByUserId}:`, error.message);
        return null;
      }
    },

    assignedToUser: async (parent: any, _: any, context: GraphQLContext): Promise<User | null> => {
      const assignedToUserId = parent.assigned_to_user_id;
      
      if (!assignedToUserId) {
        return null;
      }

      try {
        const userProfileData = await getServiceLevelUserProfileData(assignedToUserId);
        if (!userProfileData) {
          logger.warn(`User profile data not found for assigned user ID ${assignedToUserId} on task ${parent.id}.`);
          return null;
        }

        if (!userProfileData.email) {
          logger.error(`User profile for ${assignedToUserId} is missing an email. Task ${parent.id}. Returning null for assignedToUser.`);
          return null;
        }

        return {
          id: userProfileData.user_id,
          email: userProfileData.email,
          display_name: userProfileData.display_name || userProfileData.email,
          avatar_url: userProfileData.avatar_url,
        } as User;
      } catch (error: any) {
        logger.error(`Error fetching user profile for assigned user ID ${assignedToUserId} on task ${parent.id}: ${error.message}`);
        return null;
      }
    },

    // Entity resolvers
    deal: async (parent: any, _: any, context: GraphQLContext) => {
      if (!parent.deal_id) return null;
      
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', parent.deal_id)
        .single();
      
      if (error) {
        logger.error('Error fetching deal:', error);
        return null;
      }
      
      return data;
    },

    lead: async (parent: any, _: any, context: GraphQLContext) => {
      if (!parent.lead_id) return null;
      
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', parent.lead_id)
        .single();
      
      if (error) {
        logger.error('Error fetching lead:', error);
        return null;
      }
      
      return data;
    },

    person: async (parent: any, _: any, context: GraphQLContext) => {
      if (!parent.person_id) return null;
      
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('id', parent.person_id)
        .single();
      
      if (error) {
        logger.error('Error fetching person:', error);
        return null;
      }
      
      return data;
    },

    organization: async (parent: any, _: any, context: GraphQLContext) => {
      if (!parent.organization_id) return null;
      
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', parent.organization_id)
        .single();
      
      if (error) {
        logger.error('Error fetching organization:', error);
        return null;
      }
      
      return data;
    },

    // Array resolvers
    subtasks: async (parent: any, _: any, context: GraphQLContext) => {
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('parent_task_id', parent.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        logger.error('Error fetching subtasks:', error);
        return [];
      }
      
      return (data || []).map(mapTaskFromDb);
    },

    dependencies: async (parent: any, _: any, context: GraphQLContext) => {
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      const { data, error } = await supabase
        .from('task_dependencies')
        .select('*')
        .eq('task_id', parent.id);
      
      if (error) {
        logger.error('Error fetching dependencies:', error);
        return [];
      }
      
      return data || [];
    },

    // Simple field mappings with defaults
    customFieldValues: () => [], // TODO: Implement when custom fields are needed
    tags: (parent: any) => parent.tags || [],
    completionTriggersStageChange: (parent: any) => parent.completion_triggers_stage_change || false,
    blocksStageProgression: (parent: any) => parent.blocks_stage_progression || false,
    requiredForDealClosure: (parent: any) => parent.required_for_deal_closure || false,
    affectsLeadScoring: (parent: any) => parent.affects_lead_scoring || false,
    calculatedPriority: (parent: any) => parent.calculated_priority || 0,
    businessImpactScore: (parent: any) => parent.business_impact_score || 0
  },

  TaskDependency: {
    // These can be added later as needed
  },

  TaskHistory: {
    // These can be added later as needed
  }
};

export default taskResolvers; 