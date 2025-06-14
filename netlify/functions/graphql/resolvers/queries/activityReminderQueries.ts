import type { QueryResolvers } from '../../../../../lib/generated/graphql';
import type { GraphQLContext } from '../../helpers';
import { requireAuthentication } from '../../helpers';
import { activityReminderService } from '../../../../../lib/activityReminderService';
import { GraphQLError } from 'graphql';

export const activityReminderQueries: Pick<QueryResolvers<GraphQLContext>, 
  'myReminderPreferences' | 'activityReminders' | 'myNotifications' | 'notification' | 'unreadNotificationCount'
> = {
  myReminderPreferences: async (_, __, context) => {
    const { userId } = requireAuthentication(context);

    try {
      const preferences = await activityReminderService.getUserReminderPreferences(userId);
      
      if (!preferences) {
        throw new GraphQLError('Failed to fetch reminder preferences', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }

      return {
        id: preferences.id,
        userId: preferences.user_id,
        emailRemindersEnabled: preferences.email_reminders_enabled,
        emailReminderMinutesBefore: preferences.email_reminder_minutes_before,
        emailDailyDigestEnabled: preferences.email_daily_digest_enabled,
        emailDailyDigestTime: preferences.email_daily_digest_time,
        inAppRemindersEnabled: preferences.in_app_reminders_enabled,
        inAppReminderMinutesBefore: preferences.in_app_reminder_minutes_before,
        pushRemindersEnabled: preferences.push_reminders_enabled,
        pushReminderMinutesBefore: preferences.push_reminder_minutes_before,
        overdueNotificationsEnabled: preferences.overdue_notifications_enabled,
        overdueNotificationFrequencyHours: preferences.overdue_notification_frequency_hours,
        createdAt: new Date(preferences.created_at),
        updatedAt: new Date(preferences.updated_at),
      };
    } catch (error) {
      console.error('[Query.myReminderPreferences] Error:', error);
      throw new GraphQLError('Failed to fetch reminder preferences', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  },

  activityReminders: async (_, { activityId }, context) => {
    const { userId } = requireAuthentication(context);

    // This query is mainly for admin/debugging purposes
    // In production, you might want to add permission checks
    try {
      // For now, we'll just return an empty array as this is primarily for system use
      // In the future, this could be expanded for admin users to view reminder status
      return [];
    } catch (error) {
      console.error('[Query.activityReminders] Error:', error);
      throw new GraphQLError('Failed to fetch activity reminders', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  },

  myNotifications: async (_, { filter, limit = 20, offset = 0 }, context) => {
    const { userId } = requireAuthentication(context);

    try {
      const result = await activityReminderService.getUserNotifications(userId, {
        filter: filter ? {
          isRead: filter.isRead ?? undefined,
          notificationType: filter.notificationType ?? undefined,
          priority: filter.priority ?? undefined,
          entityType: filter.entityType ?? undefined,
          entityId: filter.entityId ?? undefined,
        } : undefined,
        limit: limit ?? 20,
        offset: offset ?? 0,
      });

      if (!result) {
        throw new GraphQLError('Failed to fetch notifications', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }

      return {
        totalCount: result.totalCount,
        unreadCount: result.unreadCount,
        notifications: result.notifications.map(notification => ({
          id: notification.id,
          userId: notification.user_id,
          title: notification.title,
          message: notification.message,
          notificationType: notification.notification_type.toUpperCase() as any,
          isRead: notification.is_read,
          readAt: notification.read_at ? new Date(notification.read_at) : null,
          entityType: notification.entity_type,
          entityId: notification.entity_id,
          actionUrl: notification.action_url,
          metadata: notification.metadata,
          priority: notification.priority.toUpperCase() as any,
          expiresAt: notification.expires_at ? new Date(notification.expires_at) : null,
          createdAt: new Date(notification.created_at),
          updatedAt: new Date(notification.updated_at),
        })),
      };
    } catch (error) {
      console.error('[Query.myNotifications] Error:', error);
      throw new GraphQLError('Failed to fetch notifications', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  },

  notification: async (_, { id }, context) => {
    const { userId } = requireAuthentication(context);

    try {
      const result = await activityReminderService.getUserNotifications(userId, {
        filter: { entityId: id },
        limit: 1,
      });

      if (!result || result.notifications.length === 0) {
        return null;
      }

      const notification = result.notifications[0];
      if (!notification) {
        return null;
      }

      return {
        id: notification.id,
        userId: notification.user_id,
        title: notification.title,
        message: notification.message,
        notificationType: notification.notification_type.toUpperCase() as any,
        isRead: notification.is_read,
        readAt: notification.read_at ? new Date(notification.read_at) : null,
        entityType: notification.entity_type,
        entityId: notification.entity_id,
        actionUrl: notification.action_url,
        metadata: notification.metadata,
        priority: notification.priority.toUpperCase() as any,
        expiresAt: notification.expires_at ? new Date(notification.expires_at) : null,
        createdAt: new Date(notification.created_at),
        updatedAt: new Date(notification.updated_at),
      };
    } catch (error) {
      console.error('[Query.notification] Error:', error);
      throw new GraphQLError('Failed to fetch notification', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  },

  unreadNotificationCount: async (_, __, context) => {
    const { userId } = requireAuthentication(context);

    try {
      const count = await activityReminderService.getUnreadNotificationCount(userId);
      return count;
    } catch (error) {
      console.error('[Query.unreadNotificationCount] Error:', error);
      throw new GraphQLError('Failed to fetch unread notification count', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  },
}; 