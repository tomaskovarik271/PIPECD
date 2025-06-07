import type { QueryResolvers } from '../../../../../lib/generated/graphql';
import type { GraphQLContext } from '../../helpers';
import { requireAuthentication } from '../../helpers';
import { emailService } from '../../../../../lib/emailService';

export const emailQueries: QueryResolvers<GraphQLContext> = {
  getEmailThreads: async (_, { filter }, context) => {
    const { userId, accessToken } = requireAuthentication(context);

    try {
      const result = await emailService.getEmailThreads(userId, accessToken, {
        dealId: filter.dealId,
        contactEmail: filter.contactEmail,
        keywords: filter.keywords,
        dateFrom: filter.dateFrom,
        dateTo: filter.dateTo,
        isUnread: filter.isUnread,
        hasAttachments: filter.hasAttachments,
        limit: filter.limit,
        pageToken: filter.pageToken,
      });

      return {
        threads: result.threads,
        totalCount: result.totalCount,
        hasNextPage: result.hasNextPage,
        nextPageToken: result.nextPageToken,
      };
    } catch (error) {
      console.error('Error fetching email threads:', error);
      throw new Error('Failed to fetch email threads');
    }
  },

  getEmailThread: async (_, { threadId }, context) => {
    const { userId, accessToken } = requireAuthentication(context);

    try {
      return await emailService.getEmailThread(userId, accessToken, threadId);
    } catch (error) {
      console.error('Error fetching email thread:', error);
      throw new Error('Failed to fetch email thread');
    }
  },

  getEmailMessage: async (_, { messageId }, context) => {
    const { userId, accessToken } = requireAuthentication(context);

    try {
      return await emailService.getEmailMessage(userId, accessToken, messageId);
    } catch (error) {
      console.error('Error fetching email message:', error);
      throw new Error('Failed to fetch email message');
    }
  },

  getEmailAnalytics: async (_, { dealId }, context) => {
    const { userId, accessToken } = requireAuthentication(context);
    const { supabaseClient } = context;

    try {
      // Get deal information to find primary contact
      const { data: dealData, error: dealError } = await supabaseClient
        .from('deals')
        .select(`
          id,
          name,
          created_at,
          person:person_id (
            id,
            email
          )
        `)
        .eq('id', dealId)
        .single();

      if (dealError || !dealData) {
        throw new Error('Deal not found');
      }

      const primaryContactEmail = dealData.person?.email;
      
      if (!primaryContactEmail) {
        return {
          totalThreads: 0,
          unreadCount: 0,
          avgResponseTime: 'N/A',
          lastContactTime: 'N/A',
          emailSentiment: 'neutral',
          responseRate: 0,
        };
      }

      // Fetch email threads for this deal/contact
      const emailThreads = await emailService.getEmailThreads(userId, accessToken, {
        dealId,
        contactEmail: primaryContactEmail,
        dateFrom: dealData.created_at,
        limit: 100,
      });

      const totalThreads = emailThreads.threads.length;
      const unreadCount = emailThreads.threads.filter(t => t.isUnread).length;
      
      // Calculate last contact time
      const lastContactTime = emailThreads.threads.length > 0 
        ? emailThreads.threads[0].lastActivity 
        : 'N/A';

      // Simple analytics calculations
      const avgResponseTime = '2.3 hours'; // Mock for now
      const emailSentiment = 'positive'; // Mock for now
      const responseRate = totalThreads > 0 ? 0.85 : 0; // Mock for now

      return {
        totalThreads,
        unreadCount,
        avgResponseTime,
        lastContactTime,
        emailSentiment,
        responseRate,
      };
    } catch (error) {
      console.error('Error fetching email analytics:', error);
      throw new Error('Failed to fetch email analytics');
    }
  },
}; 