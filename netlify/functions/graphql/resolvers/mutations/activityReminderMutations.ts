import type { MutationResolvers } from '../../../../../lib/generated/graphql';
import type { GraphQLContext } from '../../helpers';
import { requireAuthentication } from '../../helpers';
import { activityReminderService } from '../../../../../lib/activityReminderService';
import { GraphQLError } from 'graphql';

export const activityReminderMutations: Pick<MutationResolvers<GraphQLContext>, 
  'updateMyReminderPreferences' | 'markNotificationAsRead' | 'markAllNotificationsAsRead' | 
  'deleteNotification' | 'createNotification' | 'scheduleActivityReminder' | 'cancelActivityReminder'
> = {
  updateMyReminderPreferences: async (_, { input }, context) => {
    const { userId } = requireAuthentication(context);

    try {
      const updates: any = {};
      
      if (input.emailRemindersEnabled !== undefined) {
        updates.email_reminders_enabled = input.emailRemindersEnabled;
      }
      if (input.emailReminderMinutesBefore !== undefined) {
        updates.email_reminder_minutes_before = input.emailReminderMinutesBefore;
      }
      if (input.emailDailyDigestEnabled !== undefined) {
        updates.email_daily_digest_enabled = input.emailDailyDigestEnabled;
      }
      if (input.emailDailyDigestTime !== undefined) {
        updates.email_daily_digest_time = input.emailDailyDigestTime;
      }
      if (input.inAppRemindersEnabled !== undefined) {
        updates.in_app_reminders_enabled = input.inAppRemindersEnabled;
      }
      if (input.inAppReminderMinutesBefore !== undefined) {
        updates.in_app_reminder_minutes_before = input.inAppReminderMinutesBefore;
      }
      if (input.pushRemindersEnabled !== undefined) {
        updates.push_reminders_enabled = input.pushRemindersEnabled;
      }
      if (input.pushReminderMinutesBefore !== undefined) {
        updates.push_reminder_minutes_before = input.pushReminderMinutesBefore;
      }
      if (input.overdueNotificationsEnabled !== undefined) {
        updates.overdue_notifications_enabled = input.overdueNotificationsEnabled;
      }
      if (input.overdueNotificationFrequencyHours !== undefined) {
        updates.overdue_notification_frequency_hours = input.overdueNotificationFrequencyHours;
      }

      const preferences = await activityReminderService.updateUserReminderPreferences(userId, updates);
      
      if (!preferences) {
        throw new GraphQLError('Failed to update reminder preferences', {
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
      console.error('[Mutation.updateMyReminderPreferences] Error:', error);
      throw new GraphQLError('Failed to update reminder preferences', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  },

  markNotificationAsRead: async (_, { id }, context) => {
    const { userId } = requireAuthentication(context);

    try {
      const notification = await activityReminderService.markNotificationAsRead(id, userId);
      
      if (!notification) {
        throw new GraphQLError('Notification not found or access denied', {
          extensions: { code: 'NOT_FOUND' }
        });
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
      console.error('[Mutation.markNotificationAsRead] Error:', error);
      throw new GraphQLError('Failed to mark notification as read', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  },

  markAllNotificationsAsRead: async (_, __, context) => {
    const { userId } = requireAuthentication(context);

    try {
      const count = await activityReminderService.markAllNotificationsAsRead(userId);
      return count;
    } catch (error) {
      console.error('[Mutation.markAllNotificationsAsRead] Error:', error);
      throw new GraphQLError('Failed to mark all notifications as read', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  },

  deleteNotification: async (_, { id }, context) => {
    const { userId } = requireAuthentication(context);

    try {
      const success = await activityReminderService.deleteNotification(id, userId);
      return success;
    } catch (error) {
      console.error('[Mutation.deleteNotification] Error:', error);
      throw new GraphQLError('Failed to delete notification', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  },

  createNotification: async (_, { input }, context) => {
    const { userId } = requireAuthentication(context);

    // Check if user has permission to create notifications (admin only)
    if (!context.userPermissions?.includes('app_settings:manage')) {
      throw new GraphQLError('Forbidden: You do not have permission to create notifications', {
        extensions: { code: 'FORBIDDEN' }
      });
    }

    try {
      const notification = await activityReminderService.createNotification(
        input.userId,
        input.title,
        input.message,
        input.notificationType.toLowerCase() as any,
        {
          entityType: input.entityType as any,
          entityId: input.entityId ?? undefined,
          actionUrl: input.actionUrl ?? undefined,
          metadata: input.metadata ?? undefined,
          priority: input.priority?.toLowerCase() as any,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        }
      );

      if (!notification) {
        throw new GraphQLError('Failed to create notification', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
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
      console.error('[Mutation.createNotification] Error:', error);
      throw new GraphQLError('Failed to create notification', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  },

  scheduleActivityReminder: async (_, { activityId, reminderType, scheduledFor }, context) => {
    const { userId } = requireAuthentication(context);

    // This is primarily for system use, but we'll allow users to manually schedule reminders
    try {
      await activityReminderService.scheduleActivityReminders(activityId);
      
      // Return a placeholder reminder object since the actual implementation
      // creates multiple reminders based on user preferences
      return {
        id: 'scheduled',
        activityId,
        userId,
        reminderType,
        scheduledFor,
        isSent: false,
        failedAttempts: 0,
        reminderContent: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('[Mutation.scheduleActivityReminder] Error:', error);
      throw new GraphQLError('Failed to schedule activity reminder', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  },

  cancelActivityReminder: async (_, { id }, context) => {
    const { userId } = requireAuthentication(context);

    try {
      // For simplicity, we'll cancel all reminders for the activity
      // In a more sophisticated implementation, you'd cancel specific reminders
      await activityReminderService.cancelActivityReminders(id);
      return true;
    } catch (error) {
      console.error('[Mutation.cancelActivityReminder] Error:', error);
      throw new GraphQLError('Failed to cancel activity reminder', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  },
}; 