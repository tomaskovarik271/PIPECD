import type { MutationResolvers } from '../../../../../lib/generated/graphql';
import type { GraphQLContext } from '../../helpers';
import { requireAuthentication } from '../../helpers';
import { emailService } from '../../../../../lib/emailService';
import { useActivitiesStore } from '../../../../../frontend/src/stores/useActivitiesStore';

export const emailMutations: MutationResolvers<GraphQLContext> = {
  composeEmail: async (_, { input }, context) => {
    const { userId, accessToken } = requireAuthentication(context);

    try {
      const emailMessage = await emailService.composeEmail(userId, accessToken, {
        to: input.to,
        cc: input.cc || [],
        bcc: input.bcc || [],
        subject: input.subject,
        body: input.body,
        attachments: input.attachments || [],
        dealId: input.dealId,
        entityType: input.entityType,
        entityId: input.entityId,
        threadId: input.threadId,
      });

      return emailMessage;
    } catch (error) {
      console.error('Error composing email:', error);
      throw new Error('Failed to send email');
    }
  },

  markThreadAsRead: async (_, { threadId }, context) => {
    const { userId, accessToken } = requireAuthentication(context);

    try {
      return await emailService.markThreadAsRead(userId, accessToken, threadId);
    } catch (error) {
      console.error('Error marking thread as read:', error);
      return false;
    }
  },

  markThreadAsUnread: async (_, { threadId }, context) => {
    const { userId, accessToken } = requireAuthentication(context);

    try {
      return await emailService.markThreadAsUnread(userId, accessToken, threadId);
    } catch (error) {
      console.error('Error marking thread as unread:', error);
      return false;
    }
  },

  archiveThread: async (_, { threadId }, context) => {
    const { userId, accessToken } = requireAuthentication(context);

    try {
      // Archive thread by removing from inbox
      // This would be implemented in the email service
      console.log(`Archiving thread ${threadId} for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error archiving thread:', error);
      return false;
    }
  },

  createTaskFromEmail: async (_, { input }, context) => {
    const { userId, accessToken } = requireAuthentication(context);
    const { supabaseClient } = context;

    try {
      // Get the email message to extract context
      const emailMessage = await emailService.getEmailMessage(userId, accessToken, input.emailId);
      if (!emailMessage) {
        throw new Error('Email not found');
      }

      // Create activity/task in the database
      const { data: activityData, error: activityError } = await supabaseClient
        .from('activities')
        .insert({
          subject: input.subject,
          notes: input.description || `Task created from email: ${emailMessage.subject}`,
          type: 'TASK',
          deal_id: input.dealId,
          assigned_to_user_id: input.assigneeId || userId,
          due_date: input.dueDate,
          is_done: false,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (activityError) {
        console.error('Error creating task from email:', activityError);
        throw new Error('Failed to create task');
      }

      return activityData;
    } catch (error) {
      console.error('Error creating task from email:', error);
      throw new Error('Failed to create task from email');
    }
  },

  linkEmailToDeal: async (_, { emailId, dealId }, context) => {
    const { userId, accessToken } = requireAuthentication(context);
    const { supabaseClient } = context;

    try {
      // Store the email-deal association in the database
      const { error } = await supabaseClient
        .from('emails')
        .upsert({
          email_id: emailId,
          entity_type: 'DEAL',
          entity_id: dealId,
          user_id: userId,
          linked_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error linking email to deal:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error linking email to deal:', error);
      return false;
    }
  },
}; 