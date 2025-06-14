import { supabaseAdmin } from '../supabaseClient';
import { inngest } from '../inngestClient';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UserReminderPreferences {
  id: string;
  user_id: string;
  email_reminders_enabled: boolean;
  email_reminder_minutes_before: number;
  email_daily_digest_enabled: boolean;
  email_daily_digest_time: string;
  in_app_reminders_enabled: boolean;
  in_app_reminder_minutes_before: number;
  push_reminders_enabled: boolean;
  push_reminder_minutes_before: number;
  overdue_notifications_enabled: boolean;
  overdue_notification_frequency_hours: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityReminder {
  id: string;
  activity_id: string;
  user_id: string;
  reminder_type: 'email' | 'in_app' | 'push';
  scheduled_for: string;
  is_sent: boolean;
  sent_at?: string;
  failed_attempts: number;
  last_error?: string;
  reminder_content: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'activity_reminder' | 'activity_overdue' | 'deal_assigned' | 'lead_assigned' | 'system_announcement' | 'custom';
  is_read: boolean;
  read_at?: string;
  entity_type?: 'ACTIVITY' | 'DEAL' | 'LEAD' | 'PERSON' | 'ORGANIZATION';
  entity_id?: string;
  action_url?: string;
  metadata: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  subject: string;
  type: string;
  due_date?: string;
  assigned_to_user_id?: string;
  user_id: string;
  deal_id?: string;
  person_id?: string;
  organization_id?: string;
  is_done: boolean;
}

class ActivityReminderService {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    if (!supabaseClient && !supabaseAdmin) {
      throw new Error('Supabase client is required');
    }
    this.supabase = supabaseClient || supabaseAdmin!;
  }

  /**
   * Get user reminder preferences, creating defaults if they don't exist
   */
  async getUserReminderPreferences(userId: string): Promise<UserReminderPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_reminder_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No preferences found, create defaults
        return await this.createDefaultReminderPreferences(userId);
      }

      if (error) {
        console.error('[ActivityReminderService] Error fetching user preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[ActivityReminderService] Error in getUserReminderPreferences:', error);
      return null;
    }
  }

  /**
   * Create default reminder preferences for a user
   */
  async createDefaultReminderPreferences(userId: string): Promise<UserReminderPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_reminder_preferences')
        .insert({
          user_id: userId,
          email_reminders_enabled: true,
          email_reminder_minutes_before: 60, // 1 hour
          email_daily_digest_enabled: true,
          email_daily_digest_time: '09:00:00',
          in_app_reminders_enabled: true,
          in_app_reminder_minutes_before: 15, // 15 minutes
          push_reminders_enabled: false,
          push_reminder_minutes_before: 30,
          overdue_notifications_enabled: true,
          overdue_notification_frequency_hours: 24,
        })
        .select()
        .single();

      if (error) {
        console.error('[ActivityReminderService] Error creating default preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[ActivityReminderService] Error in createDefaultReminderPreferences:', error);
      return null;
    }
  }

  /**
   * Update user reminder preferences
   */
  async updateUserReminderPreferences(
    userId: string, 
    updates: Partial<Omit<UserReminderPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<UserReminderPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_reminder_preferences')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('[ActivityReminderService] Error updating preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[ActivityReminderService] Error in updateUserReminderPreferences:', error);
      return null;
    }
  }

  /**
   * Schedule reminders for an activity based on user preferences
   */
  async scheduleActivityReminders(activityId: string): Promise<void> {
    try {
      // Get the activity details
      const { data: activity, error: activityError } = await this.supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();

      if (activityError || !activity) {
        console.error('[ActivityReminderService] Activity not found:', activityError);
        return;
      }

      // Skip if activity has no due date or is already done
      if (!activity.due_date || activity.is_done) {
        return;
      }

      // Get user preferences for the assigned user (or creator if not assigned)
      const targetUserId = activity.assigned_to_user_id || activity.user_id;
      const preferences = await this.getUserReminderPreferences(targetUserId);

      if (!preferences) {
        console.error('[ActivityReminderService] No preferences found for user:', targetUserId);
        return;
      }

      const dueDate = new Date(activity.due_date);
      const now = new Date();

      // Schedule email reminder
      if (preferences.email_reminders_enabled) {
        const emailReminderTime = new Date(dueDate.getTime() - (preferences.email_reminder_minutes_before * 60 * 1000));
        if (emailReminderTime > now) {
          await this.createActivityReminder(activityId, targetUserId, 'email', emailReminderTime, activity);
        }
      }

      // Schedule in-app reminder
      if (preferences.in_app_reminders_enabled) {
        const inAppReminderTime = new Date(dueDate.getTime() - (preferences.in_app_reminder_minutes_before * 60 * 1000));
        if (inAppReminderTime > now) {
          await this.createActivityReminder(activityId, targetUserId, 'in_app', inAppReminderTime, activity);
        }
      }

      // Schedule push reminder (if enabled)
      if (preferences.push_reminders_enabled) {
        const pushReminderTime = new Date(dueDate.getTime() - (preferences.push_reminder_minutes_before * 60 * 1000));
        if (pushReminderTime > now) {
          await this.createActivityReminder(activityId, targetUserId, 'push', pushReminderTime, activity);
        }
      }

    } catch (error) {
      console.error('[ActivityReminderService] Error in scheduleActivityReminders:', error);
    }
  }

  /**
   * Create a scheduled activity reminder
   */
  private async createActivityReminder(
    activityId: string,
    userId: string,
    reminderType: 'email' | 'in_app' | 'push',
    scheduledFor: Date,
    activity: Activity
  ): Promise<ActivityReminder | null> {
    try {
      // Check if reminder already exists
      const { data: existingReminder } = await this.supabase
        .from('activity_reminders')
        .select('id')
        .eq('activity_id', activityId)
        .eq('user_id', userId)
        .eq('reminder_type', reminderType)
        .eq('is_sent', false)
        .single();

      if (existingReminder) {
        // Reminder already exists, skip
        return null;
      }

      // Create reminder content based on type
      const reminderContent = this.generateReminderContent(reminderType, activity);

      const { data, error } = await this.supabase
        .from('activity_reminders')
        .insert({
          activity_id: activityId,
          user_id: userId,
          reminder_type: reminderType,
          scheduled_for: scheduledFor.toISOString(),
          reminder_content: reminderContent,
        })
        .select()
        .single();

      if (error) {
        console.error('[ActivityReminderService] Error creating reminder:', error);
        return null;
      }

      // Schedule the reminder with Inngest
      await this.scheduleReminderWithInngest(data);

      return data;
    } catch (error) {
      console.error('[ActivityReminderService] Error in createActivityReminder:', error);
      return null;
    }
  }

  /**
   * Generate reminder content based on type and activity
   */
  private generateReminderContent(reminderType: string, activity: Activity): Record<string, any> {
    const baseContent = {
      activitySubject: activity.subject,
      activityType: activity.type,
      dueDate: activity.due_date,
    };

    switch (reminderType) {
      case 'email':
        return {
          ...baseContent,
          subject: `Reminder: ${activity.subject} is due soon`,
          body: `Your ${activity.type.toLowerCase()} "${activity.subject}" is due at ${new Date(activity.due_date!).toLocaleString()}.`,
        };
      case 'in_app':
        return {
          ...baseContent,
          title: `${activity.type} Reminder`,
          message: `"${activity.subject}" is due soon`,
        };
      case 'push':
        return {
          ...baseContent,
          title: 'Activity Reminder',
          body: `${activity.subject} is due soon`,
        };
      default:
        return baseContent;
    }
  }

  /**
   * Schedule reminder with Inngest for background processing
   */
  private async scheduleReminderWithInngest(reminder: ActivityReminder): Promise<void> {
    try {
      await inngest.send({
        name: 'activity/reminder.scheduled',
        data: {
          reminderId: reminder.id,
          activityId: reminder.activity_id,
          userId: reminder.user_id,
          reminderType: reminder.reminder_type,
          scheduledFor: reminder.scheduled_for,
        },
        // Schedule the event to be processed at the reminder time
        ts: new Date(reminder.scheduled_for).getTime(),
      });
    } catch (error) {
      console.error('[ActivityReminderService] Error scheduling reminder with Inngest:', error);
    }
  }

  /**
   * Cancel all reminders for an activity (when activity is completed or deleted)
   */
  async cancelActivityReminders(activityId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('activity_reminders')
        .delete()
        .eq('activity_id', activityId)
        .eq('is_sent', false);

      if (error) {
        console.error('[ActivityReminderService] Error canceling reminders:', error);
      }
    } catch (error) {
      console.error('[ActivityReminderService] Error in cancelActivityReminders:', error);
    }
  }

  /**
   * Create an in-app notification
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    notificationType: Notification['notification_type'],
    options: {
      entityType?: Notification['entity_type'];
      entityId?: string;
      actionUrl?: string;
      metadata?: Record<string, any>;
      priority?: Notification['priority'];
      expiresAt?: Date;
    } = {}
  ): Promise<Notification | null> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          notification_type: notificationType,
          entity_type: options.entityType,
          entity_id: options.entityId,
          action_url: options.actionUrl,
          metadata: options.metadata || {},
          priority: options.priority || 'normal',
          expires_at: options.expiresAt?.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('[ActivityReminderService] Error creating notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[ActivityReminderService] Error in createNotification:', error);
      return null;
    }
  }

  /**
   * Get user notifications with filtering and pagination
   */
  async getUserNotifications(
    userId: string,
    options: {
      filter?: {
        isRead?: boolean;
        notificationType?: string;
        priority?: string;
        entityType?: string;
        entityId?: string;
      };
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ notifications: Notification[]; totalCount: number; unreadCount: number } | null> {
    try {
      let query = this.supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.filter) {
        if (options.filter.isRead !== undefined) {
          query = query.eq('is_read', options.filter.isRead);
        }
        if (options.filter.notificationType) {
          query = query.eq('notification_type', options.filter.notificationType);
        }
        if (options.filter.priority) {
          query = query.eq('priority', options.filter.priority);
        }
        if (options.filter.entityType) {
          query = query.eq('entity_type', options.filter.entityType);
        }
        if (options.filter.entityId) {
          query = query.eq('entity_id', options.filter.entityId);
        }
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data: notifications, error, count } = await query;

      if (error) {
        console.error('[ActivityReminderService] Error fetching notifications:', error);
        return null;
      }

      // Get unread count
      const { count: unreadCount, error: unreadError } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (unreadError) {
        console.error('[ActivityReminderService] Error fetching unread count:', unreadError);
      }

      return {
        notifications: notifications || [],
        totalCount: count || 0,
        unreadCount: unreadCount || 0,
      };
    } catch (error) {
      console.error('[ActivityReminderService] Error in getUserNotifications:', error);
      return null;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string, userId: string): Promise<Notification | null> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('[ActivityReminderService] Error marking notification as read:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[ActivityReminderService] Error in markNotificationAsRead:', error);
      return null;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select('id');

      if (error) {
        console.error('[ActivityReminderService] Error marking all notifications as read:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('[ActivityReminderService] Error in markAllNotificationsAsRead:', error);
      return 0;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.error('[ActivityReminderService] Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[ActivityReminderService] Error in deleteNotification:', error);
      return false;
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('[ActivityReminderService] Error fetching unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('[ActivityReminderService] Error in getUnreadNotificationCount:', error);
      return 0;
    }
  }
}

export const activityReminderService = new ActivityReminderService(); 