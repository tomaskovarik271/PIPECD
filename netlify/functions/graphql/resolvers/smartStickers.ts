// Smart Stickers GraphQL Resolvers
import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken } from '../helpers';
import type {
  QueryResolvers,
  MutationResolvers,
  EntityType,
} from '../../../../lib/generated/graphql';

// Basic types for Smart Stickers
interface CreateStickerInput {
  entityType: string;
  entityId: string;
  title: string;
  content?: string;
  categoryId?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  color?: string;
  isPinned?: boolean;
  isPrivate?: boolean;
  priority?: string;
  mentions?: string[];
  tags?: string[];
}

interface UpdateStickerInput {
  id: string;
  title?: string;
  content?: string;
  categoryId?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  color?: string;
  isPinned?: boolean;
  isPrivate?: boolean;
  priority?: string;
  mentions?: string[];
  tags?: string[];
}

interface StickerFilters {
  entityType?: string;
  entityId?: string;
  categoryIds?: string[];
  isPinned?: boolean;
  isPrivate?: boolean;
  priority?: string;
  tags?: string[];
  createdByUserId?: string;
  search?: string;
}

interface StickerMoveInput {
  id: string;
  positionX: number;
  positionY: number;
}

// Helper functions
const transformStickerFromDb = (dbSticker: any) => ({
  ...dbSticker,
  entityType: dbSticker.entity_type,
  entityId: dbSticker.entity_id,
  positionX: dbSticker.position_x,
  positionY: dbSticker.position_y,
  isPinned: dbSticker.is_pinned,
  isPrivate: dbSticker.is_private,
  priority: dbSticker.priority === 0 ? 'NORMAL' : 
           dbSticker.priority === 1 ? 'HIGH' : 
           dbSticker.priority === 2 ? 'URGENT' : 'NORMAL',
  mentions: dbSticker.mentions || [],
  tags: dbSticker.tags || [],
  createdAt: dbSticker.created_at,
  updatedAt: dbSticker.updated_at,
  createdByUserId: dbSticker.created_by_user_id,
  lastEditedByUserId: dbSticker.last_edited_by_user_id,
  lastEditedAt: dbSticker.last_edited_at,
});

const mapPriorityToInteger = (priority: string | undefined): number => {
  switch (priority?.toUpperCase()) {
    case 'HIGH': return 1;
    case 'URGENT': return 2;
    case 'NORMAL':
    default: return 0;
  }
};

const buildStickerFilters = (filters: StickerFilters | null | undefined, baseQuery: any) => {
  let query = baseQuery;
  
  if (!filters) return query;
  
  if (filters.entityType) {
    query = query.eq('entity_type', filters.entityType);
  }
  
  if (filters.entityId) {
    query = query.eq('entity_id', filters.entityId);
  }
  
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    query = query.in('category_id', filters.categoryIds);
  }
  
  if (filters.isPinned !== undefined) {
    query = query.eq('is_pinned', filters.isPinned);
  }
  
  if (filters.isPrivate !== undefined) {
    query = query.eq('is_private', filters.isPrivate);
  }
  
  if (filters.priority) {
    query = query.eq('priority', mapPriorityToInteger(filters.priority));
  }
  
  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }
  
  if (filters.createdByUserId) {
    query = query.eq('created_by_user_id', filters.createdByUserId);
  }
  
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
  }
  
  return query;
};

// Query resolvers
export const smartStickerQueries = {
  
  getEntityStickers: async (_parent: any, { entityType, entityId, filters, sortBy, first, after }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    
    let query = context.supabaseClient
      .from('smart_stickers')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);
    
    // Apply filters
    query = buildStickerFilters(filters, query);
    
    // Apply sorting
    if (sortBy) {
      const field = sortBy.field.toLowerCase();
      const direction = sortBy.direction === 'ASC' ? 'asc' : 'desc';
      query = query.order(field === 'position_x' ? 'position_x' : 
                         field === 'position_y' ? 'position_y' :
                         field === 'created_at' ? 'created_at' :
                         field === 'updated_at' ? 'updated_at' : 'title', 
                         { ascending: direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    const limit = Math.min(first || 20, 100);
    query = query.limit(limit);
    
    if (after) {
      // Implement cursor-based pagination if needed
      // For now, simple offset-based pagination
      const offset = parseInt(after, 10) || 0;
      query = query.range(offset, offset + limit - 1);
    }
    
    const { data, error, count } = await query;
    if (error) throw new GraphQLError(`Failed to fetch stickers: ${error.message}`);
    
    const transformedStickers = (data || []).map(transformStickerFromDb);
    
    return {
      nodes: transformedStickers,
      totalCount: count || transformedStickers.length,
      hasNextPage: transformedStickers.length === limit,
      hasPreviousPage: Boolean(after && parseInt(after, 10) > 0),
    };
  },
  
  searchStickers: async (_parent: any, { filters, sortBy, first, after }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    
    let query = context.supabaseClient
      .from('smart_stickers')
      .select('*');
    
    // Apply filters
    query = buildStickerFilters(filters, query);
    
    // Apply sorting
    if (sortBy) {
      const field = sortBy.field.toLowerCase();
      const direction = sortBy.direction === 'ASC' ? 'asc' : 'desc';
      query = query.order(field, { ascending: direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    const limit = Math.min(first || 20, 100);
    query = query.limit(limit);
    
    if (after) {
      const offset = parseInt(after, 10) || 0;
      query = query.range(offset, offset + limit - 1);
    }
    
    const { data, error, count } = await query;
    if (error) throw new GraphQLError(`Failed to search stickers: ${error.message}`);
    
    const transformedStickers = (data || []).map(transformStickerFromDb);
    
    return {
      nodes: transformedStickers,
      totalCount: count || transformedStickers.length,
      hasNextPage: transformedStickers.length === limit,
      hasPreviousPage: Boolean(after && parseInt(after, 10) > 0),
    };
  },
  
  getSticker: async (_parent: any, { id }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    
    const { data, error } = await context.supabaseClient
      .from('smart_stickers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new GraphQLError(`Failed to fetch sticker: ${error.message}`);
    }
    
    return transformStickerFromDb(data);
  },
  
  getStickerCategories: async (_parent: any, _args: any, context: GraphQLContext) => {
    requireAuthentication(context);
    
    const { data, error } = await context.supabaseClient
      .from('sticker_categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw new GraphQLError(`Failed to fetch categories: ${error.message}`);
    
    return (data || []).map(cat => ({
      ...cat,
      isSystem: cat.is_system,
      displayOrder: cat.display_order,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at,
    }));
  },
  
  getPinnedStickers: async (_parent: any, { entityType, first }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    
    let query = context.supabaseClient
      .from('smart_stickers')
      .select('*')
      .eq('is_pinned', true);
    
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    
    query = query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(Math.min(first || 10, 50));
    
    const { data, error } = await query;
    if (error) throw new GraphQLError(`Failed to fetch pinned stickers: ${error.message}`);
    
    const transformedStickers = (data || []).map(transformStickerFromDb);
    
    return {
      nodes: transformedStickers,
      totalCount: transformedStickers.length,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  },
};

// Mutation resolvers
export const smartStickerMutations = {
  
  createSticker: async (_parent: any, { input }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    
    const { data, error } = await context.supabaseClient
      .from('smart_stickers')
      .insert({
        entity_type: input.entityType,
        entity_id: input.entityId,
        title: input.title,
        content: input.content,
        category_id: input.categoryId && input.categoryId.trim() !== '' ? input.categoryId : null,
        position_x: input.positionX || 0,
        position_y: input.positionY || 0,
        width: input.width || 200,
        height: input.height || 150,
        color: input.color || '#FFE066',
        is_pinned: input.isPinned || false,
        is_private: input.isPrivate || false,
        priority: mapPriorityToInteger(input.priority),
        mentions: input.mentions || [],
        tags: input.tags || [],
        created_by_user_id: userId,
      })
      .select()
      .single();
    
    if (error) throw new GraphQLError(`Failed to create sticker: ${error.message}`);
    return transformStickerFromDb(data);
  },
  
  updateSticker: async (_parent: any, { input }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    
    const updateData: any = {
      last_edited_by_user_id: userId,
      last_edited_at: new Date().toISOString(),
    };
    
    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.categoryId !== undefined) updateData.category_id = input.categoryId && input.categoryId.trim() !== '' ? input.categoryId : null;
    if (input.positionX !== undefined) updateData.position_x = input.positionX;
    if (input.positionY !== undefined) updateData.position_y = input.positionY;
    if (input.width !== undefined) updateData.width = input.width;
    if (input.height !== undefined) updateData.height = input.height;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.isPinned !== undefined) updateData.is_pinned = input.isPinned;
    if (input.isPrivate !== undefined) updateData.is_private = input.isPrivate;
    if (input.priority !== undefined) updateData.priority = mapPriorityToInteger(input.priority);
    if (input.mentions !== undefined) updateData.mentions = input.mentions;
    if (input.tags !== undefined) updateData.tags = input.tags;
    
    const { data, error } = await context.supabaseClient
      .from('smart_stickers')
      .update(updateData)
      .eq('id', input.id)
      .select()
      .single();
    
    if (error) throw new GraphQLError(`Failed to update sticker: ${error.message}`);
    return transformStickerFromDb(data);
  },
  
  deleteSticker: async (_parent: any, { id }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    
    const { error } = await context.supabaseClient
      .from('smart_stickers')
      .delete()
      .eq('id', id);
    
    if (error) throw new GraphQLError(`Failed to delete sticker: ${error.message}`);
    return true;
  },
  
  moveStickersBulk: async (_parent: any, { moves }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    
    const updatedStickers = [];
    
    // Process moves in batches
    for (const move of moves) {
      const { data, error } = await context.supabaseClient
        .from('smart_stickers')
        .update({
          position_x: move.positionX,
          position_y: move.positionY,
          last_edited_by_user_id: userId,
          last_edited_at: new Date().toISOString(),
        })
        .eq('id', move.id)
        .select()
        .single();
      
      if (!error && data) {
        updatedStickers.push(transformStickerFromDb(data));
      }
    }
    
    return updatedStickers;
  },
  
  toggleStickerPin: async (_parent: any, { id }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    
    // First get current state
    const { data: current, error: fetchError } = await context.supabaseClient
      .from('smart_stickers')
      .select('is_pinned')
      .eq('id', id)
      .single();
    
    if (fetchError) throw new GraphQLError(`Failed to fetch sticker: ${fetchError.message}`);
    
    // Toggle the pin state
    const { data, error } = await context.supabaseClient
      .from('smart_stickers')
      .update({
        is_pinned: !current.is_pinned,
        last_edited_by_user_id: userId,
        last_edited_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new GraphQLError(`Failed to toggle pin: ${error.message}`);
    return transformStickerFromDb(data);
  },
  
  updateStickerTags: async (_parent: any, { id, tagsToAdd, tagsToRemove }: any, context: GraphQLContext) => {
    const { userId } = requireAuthentication(context);
    
    // First get current tags
    const { data: current, error: fetchError } = await context.supabaseClient
      .from('smart_stickers')
      .select('tags')
      .eq('id', id)
      .single();
    
    if (fetchError) throw new GraphQLError(`Failed to fetch sticker: ${fetchError.message}`);
    
    let currentTags = current.tags || [];
    
    // Add new tags
    if (tagsToAdd && tagsToAdd.length > 0) {
      currentTags = [...new Set([...currentTags, ...tagsToAdd])];
    }
    
    // Remove tags
    if (tagsToRemove && tagsToRemove.length > 0) {
      currentTags = currentTags.filter((tag: string) => !tagsToRemove.includes(tag));
    }
    
    const { data, error } = await context.supabaseClient
      .from('smart_stickers')
      .update({
        tags: currentTags,
        last_edited_by_user_id: userId,
        last_edited_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new GraphQLError(`Failed to update tags: ${error.message}`);
    return transformStickerFromDb(data);
  },
}; 