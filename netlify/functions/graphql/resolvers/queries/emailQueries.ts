import type { QueryResolvers } from '../../../../../lib/generated/graphql';
import type { GraphQLContext } from '../../helpers';
import { requireAuthentication } from '../../helpers';
import { emailService } from '../../../../../lib/emailService';
import type { EmailMessage as ServiceEmailMessage, EmailThread as ServiceEmailThread } from '../../../../../lib/emailService';
import type { EmailMessage as GraphQLEmailMessage, EmailThread as GraphQLEmailThread, EmailImportance } from '../../../../../lib/generated/graphql';

// Helper function to convert service types to GraphQL types
function convertEmailMessageToGraphQL(message: ServiceEmailMessage): GraphQLEmailMessage {
  return {
    ...message,
    importance: message.importance as EmailImportance,
    attachments: message.attachments || null,
    cc: message.cc || null,
    bcc: message.bcc || null,
    htmlBody: message.htmlBody || null,
    labels: message.labels || null,
  };
}

function convertEmailThreadToGraphQL(thread: ServiceEmailThread): GraphQLEmailThread {
  return {
    ...thread,
    latestMessage: thread.latestMessage ? convertEmailMessageToGraphQL(thread.latestMessage) : null,
    dealId: thread.dealId || null,
    entityType: thread.entityType || null,
    entityId: thread.entityId || null,
  };
}

export const emailQueries: QueryResolvers<GraphQLContext> = {
  getEmailThreads: async (_, { filter }, context) => {
    const { userId, accessToken } = requireAuthentication(context);

    try {
      const threads = await emailService.getEmailThreads(userId, accessToken, {
        dealId: filter.dealId || undefined,
        contactEmail: filter.contactEmail || undefined,
        selectedContacts: filter.selectedContacts || undefined,
        includeAllParticipants: filter.includeAllParticipants || undefined,
        contactScope: filter.contactScope || undefined,
        keywords: filter.keywords || undefined,
        dateFrom: filter.dateFrom || undefined,
        dateTo: filter.dateTo || undefined,
        isUnread: filter.isUnread || undefined,
        hasAttachments: filter.hasAttachments || undefined,
        limit: filter.limit || undefined,
        pageToken: filter.pageToken || undefined,
      });

      return {
        threads: threads.threads.map(convertEmailThreadToGraphQL),
        totalCount: threads.totalCount,
        hasNextPage: threads.hasNextPage,
        nextPageToken: threads.nextPageToken,
      };
    } catch (error) {
      console.error('Error fetching email threads:', error);
      throw new Error('Failed to fetch email threads');
    }
  },

  getEmailThread: async (_, { threadId }, context) => {
    const { userId, accessToken } = requireAuthentication(context);

    try {
      const thread = await emailService.getEmailThread(userId, accessToken, threadId);
      return thread ? convertEmailThreadToGraphQL(thread) : null;
    } catch (error) {
      console.error('Error fetching email thread:', error);
      return null;
    }
  },

  getEmailMessage: async (_, { messageId }, context) => {
    const { userId, accessToken } = requireAuthentication(context);

    try {
      const message = await emailService.getEmailMessage(userId, accessToken, messageId);
      return message ? convertEmailMessageToGraphQL(message) : null;
    } catch (error) {
      console.error('Error fetching email message:', error);
      return null;
    }
  },

  getEmailAnalytics: async (_, _args, context) => {
    requireAuthentication(context);

    try {
      // This would be implemented in the email service
      // For now, return mock data
      return {
        totalThreads: 0,
        unreadCount: 0,
        avgResponseTime: '0h',
        lastContactTime: new Date().toISOString(),
        emailSentiment: 'NEUTRAL',
        responseRate: 0,
      };
    } catch (error) {
      console.error('Error fetching email analytics:', error);
      throw new Error('Failed to fetch email analytics');
    }
  },

  // Email pinning queries
  getPinnedEmails: async (_, { dealId }, context) => {
    const { userId } = requireAuthentication(context);
    const { supabaseClient } = context;

    try {
      const { data: pinnedEmails, error } = await supabaseClient
        .from('email_pins')
        .select('id, user_id, deal_id, email_id, thread_id, subject, from_email, pinned_at, notes, created_at, updated_at')
        .eq('user_id', userId)
        .eq('deal_id', dealId)
        .order('pinned_at', { ascending: false });

      if (error) {
        console.error('Error fetching pinned emails:', error);
        throw new Error('Failed to fetch pinned emails');
      }

      return pinnedEmails.map(pin => ({
        id: pin.id,
        userId: pin.user_id,
        dealId: pin.deal_id,
        emailId: pin.email_id,
        threadId: pin.thread_id,
        subject: pin.subject,
        fromEmail: pin.from_email,
        pinnedAt: pin.pinned_at,
        notes: pin.notes,
        createdAt: pin.created_at,
        updatedAt: pin.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching pinned emails:', error);
      throw error;
    }
  },

  getEmailPin: async (_, { id }, context) => {
    const { userId } = requireAuthentication(context);
    const { supabaseClient } = context;

    try {
      const { data: emailPin, error } = await supabaseClient
        .from('email_pins')
        .select('id, user_id, deal_id, email_id, thread_id, subject, from_email, pinned_at, notes, created_at, updated_at')
        .eq('id', id)
        .eq('user_id', userId) // Ensure user can only access their own pins
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        console.error('Error fetching email pin:', error);
        throw new Error('Failed to fetch email pin');
      }

      return {
        id: emailPin.id,
        userId: emailPin.user_id,
        dealId: emailPin.deal_id,
        emailId: emailPin.email_id,
        threadId: emailPin.thread_id,
        subject: emailPin.subject,
        fromEmail: emailPin.from_email,
        pinnedAt: emailPin.pinned_at,
        notes: emailPin.notes,
        createdAt: emailPin.created_at,
        updatedAt: emailPin.updated_at,
      };
    } catch (error) {
      console.error('Error fetching email pin:', error);
      throw error;
    }
  },
}; 