// Smart Stickers GraphQL Resolvers
import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken } from '../helpers';
import { smartStickersService } from '../../../../lib/smartStickersService';
// Note: All types are now defined in smartStickersService.ts

// Helper functions moved to smartStickersService.ts

// Query resolvers
export const smartStickerQueries = {
  
  getEntityStickers: async (_parent: any, { entityType, entityId, filters, sortBy, first, after }: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    
    return await smartStickersService.getEntityStickers(
      entityType, 
      entityId, 
      filters, 
      sortBy, 
      first, 
      after, 
      accessToken || undefined
    );
  },
  
  searchStickers: async (_parent: any, { filters, sortBy, first, after }: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    
    return await smartStickersService.searchStickers(filters, sortBy, first, after, accessToken || undefined);
  },
  
  getSticker: async (_parent: any, { id }: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    
    if (!accessToken) {
      throw new GraphQLError('Authentication required');
    }
    
    return await smartStickersService.getStickerById(id, accessToken);
  },
  
  getStickerCategories: async (_parent: any, _args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    
    return await smartStickersService.getStickerCategories(accessToken || undefined);
  },
  
  getPinnedStickers: async (_parent: any, { entityType, first }: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    
    if (!accessToken) {
      throw new GraphQLError('Authentication required');
    }
    
    return await smartStickersService.getPinnedStickers(entityType, first, accessToken);
  },
};

// Mutation resolvers
export const smartStickerMutations = {
  
  createSticker: async (_parent: any, { input }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    const accessToken = getAccessToken(context);
    
    if (!accessToken) {
      throw new GraphQLError('Authentication required');
    }
    
    return await smartStickersService.createSticker(userId, input, accessToken);
  },
  
  updateSticker: async (_parent: any, { input }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    const accessToken = getAccessToken(context);
    
    if (!accessToken) {
      throw new GraphQLError('Authentication required');
    }
    
    const { id, ...updateInput } = input;
    return await smartStickersService.updateSticker(id, userId, updateInput, accessToken);
  },
  
  deleteSticker: async (_parent: any, { id }: any, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    
    if (!accessToken) {
      throw new GraphQLError('Authentication required');
    }
    
    return await smartStickersService.deleteSticker(id, accessToken);
  },
  
  moveStickersBulk: async (_parent: any, { moves }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    const accessToken = getAccessToken(context);
    
    if (!accessToken) {
      throw new GraphQLError('Authentication required');
    }
    
    return await smartStickersService.moveStickersBulk(moves, userId, accessToken);
  },
  
  toggleStickerPin: async (_parent: any, { id }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    const accessToken = getAccessToken(context);
    
    if (!accessToken) {
      throw new GraphQLError('Authentication required');
    }
    
    return await smartStickersService.toggleStickerPin(id, userId, accessToken);
  },
  
  updateStickerTags: async (_parent: any, { id, tagsToAdd, tagsToRemove }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    const accessToken = getAccessToken(context);
    
    if (!accessToken) {
      throw new GraphQLError('Authentication required');
    }
    
    return await smartStickersService.updateStickerTags(id, userId, tagsToAdd, tagsToRemove, accessToken);
  },
}; 