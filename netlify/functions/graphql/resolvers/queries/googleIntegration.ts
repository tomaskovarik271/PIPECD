// Google Integration Query Resolvers
import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken } from '../../helpers';
import { googleIntegrationService } from '../../../../../lib/googleIntegrationService';
import type {
  QueryResolvers,
  GoogleIntegrationStatus,
  Document,
  Email
} from '../../../../../lib/generated/graphql';

export const googleIntegrationQueries: Pick<
  QueryResolvers<GraphQLContext>,
  | 'googleIntegrationStatus'
  | 'getEntityDocuments'
  | 'getEntityEmails'
  | 'searchEmails'
> = {
  googleIntegrationStatus: async (_parent, _args, context): Promise<GoogleIntegrationStatus> => {
    const { userId, accessToken } = requireAuthentication(context);
    
    try {
      return await googleIntegrationService.getIntegrationStatus(userId, accessToken);
    } catch (error) {
      console.error('Error getting Google integration status:', error);
      throw new GraphQLError('Failed to get Google integration status');
    }
  },

  getEntityDocuments: async (_parent, { entityType, entityId }, context): Promise<Document[]> => {
    const { userId, accessToken } = requireAuthentication(context);
    
    try {
      // TODO: Implement document retrieval service
      // This would query the documents table for the specified entity
      throw new GraphQLError('Document retrieval not yet implemented');
    } catch (error) {
      console.error('Error getting entity documents:', error);
      throw new GraphQLError('Failed to get entity documents');
    }
  },

  getEntityEmails: async (_parent, { entityType, entityId }, context): Promise<Email[]> => {
    const { userId, accessToken } = requireAuthentication(context);
    
    try {
      // TODO: Implement email retrieval service
      // This would query the emails table for the specified entity
      throw new GraphQLError('Email retrieval not yet implemented');
    } catch (error) {
      console.error('Error getting entity emails:', error);
      throw new GraphQLError('Failed to get entity emails');
    }
  },

  searchEmails: async (_parent, { query, entityType, limit }, context): Promise<Email[]> => {
    const { userId, accessToken } = requireAuthentication(context);
    
    try {
      // TODO: Implement email search service
      // This would search emails table with text search capabilities
      throw new GraphQLError('Email search not yet implemented');
    } catch (error) {
      console.error('Error searching emails:', error);
      throw new GraphQLError('Failed to search emails');
    }
  }
}; 