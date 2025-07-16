import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication } from '../helpers';

// Helper function to map database priority to GraphQL enum
const mapPriorityToEnum = (priority: number) => {
  switch (priority) {
    case 1: return 'LOW';
    case 2: return 'NORMAL';
    case 3: return 'HIGH';
    case 4: return 'URGENT';
    default: return 'NORMAL';
  }
};

// Helper function to map GraphQL enum to database priority
const mapEnumToPriority = (priority: string): number => {
  switch (priority) {
    case 'LOW': return 1;
    case 'NORMAL': return 2;
    case 'HIGH': return 3;
    case 'URGENT': return 4;
    default: return 2;
  }
};

// Helper function to map database notification to GraphQL SystemNotification
const mapDbSystemNotificationToGraphQL = (dbNotification: any) => ({
  id: dbNotification.id,
  userId: dbNotification.user_id,
  title: dbNotification.title,
  message: dbNotification.message,
  notificationType: dbNotification.notification_type,
  priority: mapPriorityToEnum(dbNotification.priority),
  entityType: dbNotification.entity_type,
  entityId: dbNotification.entity_id,
  actionUrl: dbNotification.action_url,
  metadata: dbNotification.metadata,
  isRead: dbNotification.is_read,
  readAt: dbNotification.read_at ? new Date(dbNotification.read_at) : null,
  dismissedAt: dbNotification.dismissed_at ? new Date(dbNotification.dismissed_at) : null,
  expiresAt: dbNotification.expires_at ? new Date(dbNotification.expires_at) : null,
  createdAt: new Date(dbNotification.created_at),
  updatedAt: new Date(dbNotification.updated_at),
  user: null as any
});

// Helper function to map unified notification view to GraphQL UnifiedNotification
const mapDbUnifiedNotificationToGraphQL = (dbNotification: any) => ({
  source: dbNotification.source,
  id: dbNotification.id,
  userId: dbNotification.user_id,
  title: dbNotification.title,
  message: dbNotification.message,
  notificationType: dbNotification.notification_type,
  priority: dbNotification.priority,
  entityType: dbNotification.entity_type,
  entityId: dbNotification.entity_id,
  actionUrl: dbNotification.action_url,
  metadata: dbNotification.metadata,
  isRead: dbNotification.is_read,
  readAt: dbNotification.read_at ? new Date(dbNotification.read_at) : null,
  dismissedAt: dbNotification.dismissed_at ? new Date(dbNotification.dismissed_at) : null,
  expiresAt: dbNotification.expires_at ? new Date(dbNotification.expires_at) : null,
  createdAt: new Date(dbNotification.created_at),
  updatedAt: new Date(dbNotification.updated_at),
  user: null as any
});

// Query Resolvers
export const notificationQueries = {
  unifiedNotifications: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const userId = context.currentUser?.id;

    if (!userId) {
      throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    const { first = 20, filters } = args;

    try {
      let query = context.supabaseClient
        .from('unified_notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(first);

      // Apply filters
      if (filters?.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }

      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      if (filters?.notificationType) {
        query = query.eq('notification_type', filters.notificationType);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters?.entityId) {
        query = query.eq('entity_id', filters.entityId);
      }

      if (filters?.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }

      if (filters?.toDate) {
        query = query.lte('created_at', filters.toDate);
      }

      // Filter out expired and dismissed notifications
      query = query.or('expires_at.is.null,expires_at.gt.now()');
      query = query.is('dismissed_at', null);

      const { data: notifications, count, error } = await query;

      if (error) throw error;

      return {
        nodes: (notifications || []).map(mapDbUnifiedNotificationToGraphQL),
        totalCount: count || 0,
        hasNextPage: (notifications?.length || 0) === first,
        hasPreviousPage: false
      };
    } catch (error) {
      console.error('Error fetching unified notifications:', error);
      throw new GraphQLError('Failed to fetch notifications');
    }
  },

  systemNotifications: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const userId = context.currentUser?.id;

    if (!userId) {
      throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    const { first = 20, filters } = args;

    try {
      let query = context.supabaseClient
        .from('system_notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(first);

      // Apply filters
      if (filters?.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }

      if (filters?.notificationType) {
        query = query.eq('notification_type', filters.notificationType);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters?.entityId) {
        query = query.eq('entity_id', filters.entityId);
      }

      if (filters?.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }

      if (filters?.toDate) {
        query = query.lte('created_at', filters.toDate);
      }

      // Filter out expired and dismissed notifications
      query = query.or('expires_at.is.null,expires_at.gt.now()');
      query = query.is('dismissed_at', null);

      const { data: notifications, count, error } = await query;

      if (error) throw error;

      return {
        nodes: (notifications || []).map(mapDbSystemNotificationToGraphQL),
        totalCount: count || 0,
        hasNextPage: (notifications?.length || 0) === first,
        hasPreviousPage: false
      };
    } catch (error) {
      console.error('Error fetching system notifications:', error);
      throw new GraphQLError('Failed to fetch system notifications');
    }
  },

  notificationSummary: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const userId = context.currentUser?.id;

    if (!userId) {
      throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    try {
      const { data, error } = await context.supabaseClient.rpc('get_user_notification_summary', {
        target_user_id: userId
      });

      if (error) throw error;

      const summary = data?.[0] || {
        total_count: 0,
        unread_count: 0,
        business_rule_count: 0,
        system_count: 0,
        high_priority_count: 0
      };

      return {
        totalCount: summary.total_count,
        unreadCount: summary.unread_count,
        businessRuleCount: summary.business_rule_count,
        systemCount: summary.system_count,
        highPriorityCount: summary.high_priority_count
      };
    } catch (error) {
      console.error('Error fetching notification summary:', error);
      throw new GraphQLError('Failed to fetch notification summary');
    }
  },

  unreadNotificationCount: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const userId = context.currentUser?.id;

    if (!userId) {
      throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    try {
      const { data, error } = await context.supabaseClient.rpc('get_user_notification_summary', {
        target_user_id: userId
      });

      if (error) throw error;

      return data?.[0]?.unread_count || 0;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      throw new GraphQLError('Failed to fetch unread notification count');
    }
  },

  systemNotification: async (parent: any, args: any, context: GraphQLContext): Promise<any> => {
    requireAuthentication(context);
    const userId = context.currentUser?.id;

    if (!userId) {
      throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    try {
      const { data: notification, error } = await context.supabaseClient
        .from('system_notifications')
        .select('*')
        .eq('id', args.id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return mapDbSystemNotificationToGraphQL(notification);
    } catch (error) {
      console.error('Error fetching system notification:', error);
      throw new GraphQLError('Failed to fetch system notification');
    }
  }
};

// Mutation Resolvers
export const notificationMutations = {
  createSystemNotification: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);

    const { input } = args;

    try {
      const { data: notification, error } = await context.supabaseClient
        .from('system_notifications')
        .insert({
          user_id: input.userId,
          title: input.title,
          message: input.message,
          notification_type: input.notificationType,
          priority: mapEnumToPriority(input.priority || 'NORMAL'),
          entity_type: input.entityType,
          entity_id: input.entityId,
          action_url: input.actionUrl,
          metadata: input.metadata || {},
          expires_at: input.expiresAt
        })
        .select()
        .single();

      if (error) throw error;

      return mapDbSystemNotificationToGraphQL(notification);
    } catch (error) {
      console.error('Error creating system notification:', error);
      throw new GraphQLError('Failed to create system notification');
    }
  },

  updateSystemNotification: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const userId = context.currentUser?.id;

    if (!userId) {
      throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    const { id, input } = args;

    try {
      const updateData: any = {};

      if (input.isRead !== undefined) {
        updateData.is_read = input.isRead;
        if (input.isRead) {
          updateData.read_at = new Date().toISOString();
        }
      }

      if (input.dismissedAt !== undefined) {
        updateData.dismissed_at = input.dismissedAt;
      }

      const { data: notification, error } = await context.supabaseClient
        .from('system_notifications')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new GraphQLError('Notification not found', { extensions: { code: 'NOT_FOUND' } });
        }
        throw error;
      }

      return mapDbSystemNotificationToGraphQL(notification);
    } catch (error) {
      console.error('Error updating system notification:', error);
      throw new GraphQLError('Failed to update system notification');
    }
  },

  markSystemNotificationAsRead: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const userId = context.currentUser?.id;

    if (!userId) {
      throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    const { id } = args;

    try {
      const { error } = await context.supabaseClient
        .from('system_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error marking system notification as read:', error);
      throw new GraphQLError('Failed to mark system notification as read');
    }
  },

  markAllSystemNotificationsAsRead: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const userId = context.currentUser?.id;

    if (!userId) {
      throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    try {
      const { data, error } = await context.supabaseClient
        .from('system_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select('id');

      if (error) throw error;

      return data?.length || 0;
    } catch (error) {
      console.error('Error marking all system notifications as read:', error);
      throw new GraphQLError('Failed to mark all system notifications as read');
    }
  },

  dismissSystemNotification: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const userId = context.currentUser?.id;

    if (!userId) {
      throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    const { id } = args;

    try {
      const { error } = await context.supabaseClient
        .from('system_notifications')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error dismissing system notification:', error);
      throw new GraphQLError('Failed to dismiss system notification');
    }
  },

  deleteSystemNotification: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const userId = context.currentUser?.id;

    if (!userId) {
      throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    try {
      const { error } = await context.supabaseClient
        .from('system_notifications')
        .delete()
        .eq('id', args.id)
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting system notification:', error);
      throw new GraphQLError('Failed to delete system notification');
    }
  },

  markBusinessRuleNotificationAsRead: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const userId = context.currentUser?.id;

    if (!userId) {
      throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    const { id } = args;

    try {
      const { error } = await context.supabaseClient
        .from('business_rule_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error marking business rule notification as read:', error);
      throw new GraphQLError('Failed to mark business rule notification as read');
    }
  },

  markAllBusinessRuleNotificationsAsRead: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const userId = context.currentUser?.id;

    if (!userId) {
      throw new GraphQLError('User not found', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    try {
      const { data, error } = await context.supabaseClient
        .from('business_rule_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null)
        .select('id');

      if (error) throw error;

      return data?.length || 0;
    } catch (error) {
      console.error('Error marking all business rule notifications as read:', error);
      throw new GraphQLError('Failed to mark all business rule notifications as read');
    }
  },

  cleanupExpiredNotifications: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);

    try {
      const { data, error } = await context.supabaseClient.rpc('cleanup_expired_system_notifications');

      if (error) throw error;

      return data || 0;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw new GraphQLError('Failed to cleanup expired notifications');
    }
  }
};

// Field Resolvers
export const SystemNotification = {
  user: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);

    try {
      const { data: user, error } = await context.supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('user_id', parent.userId)
        .single();

      if (error) {
        console.error('Error fetching user for system notification:', error);
        return null;
      }

      return {
        id: user.user_id,
        email: user.email,
        display_name: user.display_name,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    } catch (error) {
      console.error('Error resolving user for system notification:', error);
      return null;
    }
  }
};

export const UnifiedNotification = {
  user: async (parent: any, args: any, context: GraphQLContext) => {
    requireAuthentication(context);

    try {
      const { data: user, error } = await context.supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('user_id', parent.userId)
        .single();

      if (error) {
        console.error('Error fetching user for unified notification:', error);
        return null;
      }

      return {
        id: user.user_id,
        email: user.email,
        display_name: user.display_name,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    } catch (error) {
      console.error('Error resolving user for unified notification:', error);
      return null;
    }
  }
}; 