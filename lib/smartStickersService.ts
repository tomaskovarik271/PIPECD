import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils';

// Types and interfaces
export interface SmartSticker {
  id: string;
  entityType: string;
  entityId: string;
  title: string;
  content?: string;
  categoryId?: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  color: string;
  isPinned: boolean;
  isPrivate: boolean;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  mentions: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  lastEditedByUserId?: string;
  lastEditedAt?: string;
}

export interface CreateStickerInput {
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

export interface UpdateStickerInput {
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

export interface StickerFilters {
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

export interface StickerMoveInput {
  id: string;
  positionX: number;
  positionY: number;
}

export interface StickerSearchResult {
  nodes: SmartSticker[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StickerCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}

// Helper functions
const transformStickerFromDb = (dbSticker: any): SmartSticker => ({
  id: dbSticker.id,
  entityType: dbSticker.entity_type,
  entityId: dbSticker.entity_id,
  title: dbSticker.title,
  content: dbSticker.content,
  categoryId: dbSticker.category_id,
  positionX: dbSticker.position_x,
  positionY: dbSticker.position_y,
  width: dbSticker.width,
  height: dbSticker.height,
  color: dbSticker.color,
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

// --- Smart Stickers Service --- 
export const smartStickersService = {
  // Core CRUD operations
  async createSticker(userId: string, input: CreateStickerInput, accessToken: string): Promise<SmartSticker> {
    // console.log('[smartStickersService.createSticker] called for user:', userId, 'input:', input);
    try {
      const supabase = getAuthenticatedClient(accessToken);
      
      const { data, error } = await supabase
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

      handleSupabaseError(error, 'creating sticker');
      return transformStickerFromDb(data);
    } catch (error) {
      console.error('[smartStickersService] Error creating sticker:', error);
      throw error instanceof GraphQLError ? error : new GraphQLError(`Error creating sticker: ${error}`);
    }
  },

  async getStickerById(id: string, accessToken: string): Promise<SmartSticker | null> {
    // console.log('[smartStickersService.getStickerById] called for id:', id);
    try {
      const supabase = getAuthenticatedClient(accessToken);
      
      const { data, error } = await supabase
        .from('smart_stickers')
        .select('id, entity_type, entity_id, title, content, category_id, position_x, position_y, width, height, color, is_pinned, is_private, priority, mentions, tags, created_at, updated_at, created_by_user_id, last_edited_by_user_id, last_edited_at')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        handleSupabaseError(error, 'fetching sticker by ID');
      }
      
      return data ? transformStickerFromDb(data) : null;
    } catch (error) {
      console.error('[smartStickersService] Error fetching sticker:', error);
      throw error instanceof GraphQLError ? error : new GraphQLError(`Error fetching sticker: ${error}`);
    }
  },

  async updateSticker(id: string, userId: string, input: UpdateStickerInput, accessToken: string): Promise<SmartSticker> {
    // console.log('[smartStickersService.updateSticker] called for user:', userId, 'id:', id, 'input:', input);
    try {
      const supabase = getAuthenticatedClient(accessToken);
      
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

      const { data, error } = await supabase
        .from('smart_stickers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error && error.code === 'PGRST116') {
        throw new GraphQLError('Sticker not found', { extensions: { code: 'NOT_FOUND' } });
      }
      handleSupabaseError(error, 'updating sticker');
      
      return transformStickerFromDb(data);
    } catch (error) {
      console.error('[smartStickersService] Error updating sticker:', error);
      throw error instanceof GraphQLError ? error : new GraphQLError(`Error updating sticker: ${error}`);
    }
  },

  async deleteSticker(id: string, accessToken: string): Promise<boolean> {
    // console.log('[smartStickersService.deleteSticker] called for id:', id);
    try {
      const supabase = getAuthenticatedClient(accessToken);
      
      const { error } = await supabase
        .from('smart_stickers')
        .delete()
        .eq('id', id);

      if (error && error.code === 'PGRST116') {
        throw new GraphQLError('Sticker not found', { extensions: { code: 'NOT_FOUND' } });
      }
      handleSupabaseError(error, 'deleting sticker');
      
      return true;
    } catch (error) {
      console.error('[smartStickersService] Error deleting sticker:', error);
      throw error instanceof GraphQLError ? error : new GraphQLError(`Error deleting sticker: ${error}`);
    }
  },

  // Entity-specific queries
  async getEntityStickers(
    entityType: string, 
    entityId: string, 
    filters?: StickerFilters, 
    sortBy?: any, 
    first?: number, 
    after?: string,
    accessToken?: string
  ): Promise<StickerSearchResult> {
    // console.log('[smartStickersService.getEntityStickers] called for:', entityType, entityId);
    try {
      const supabase = getAuthenticatedClient(accessToken || '');
      
      let query = supabase
        .from('smart_stickers')
        .select('id, entity_type, entity_id, title, content, category_id, position_x, position_y, width, height, color, is_pinned, is_private, priority, mentions, tags, created_at, updated_at, created_by_user_id, last_edited_by_user_id, last_edited_at')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      query = buildStickerFilters(filters, query);

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

      const limit = Math.min(first || 20, 100);
      query = query.limit(limit);

      if (after) {
        const offset = parseInt(after, 10) || 0;
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error, count } = await query;
      handleSupabaseError(error, 'fetching entity stickers');

      const transformedStickers = (data || []).map(transformStickerFromDb);

      return {
        nodes: transformedStickers,
        totalCount: count || transformedStickers.length,
        hasNextPage: transformedStickers.length === limit,
        hasPreviousPage: Boolean(after && parseInt(after, 10) > 0),
      };
    } catch (error) {
      console.error('[smartStickersService] Error fetching entity stickers:', error);
      throw error instanceof GraphQLError ? error : new GraphQLError(`Error fetching entity stickers: ${error}`);
    }
  },

  async searchStickers(
    filters?: StickerFilters, 
    sortBy?: any, 
    first?: number, 
    after?: string,
    accessToken?: string
  ): Promise<StickerSearchResult> {
    // console.log('[smartStickersService.searchStickers] called');
    try {
      const supabase = getAuthenticatedClient(accessToken || '');
      
      let query = supabase
        .from('smart_stickers')
        .select('*');

      query = buildStickerFilters(filters, query);

      if (sortBy) {
        const field = sortBy.field.toLowerCase();
        const direction = sortBy.direction === 'ASC' ? 'asc' : 'desc';
        query = query.order(field, { ascending: direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const limit = Math.min(first || 20, 100);
      query = query.limit(limit);

      if (after) {
        const offset = parseInt(after, 10) || 0;
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error, count } = await query;
      handleSupabaseError(error, 'searching stickers');

      const transformedStickers = (data || []).map(transformStickerFromDb);

      return {
        nodes: transformedStickers,
        totalCount: count || transformedStickers.length,
        hasNextPage: transformedStickers.length === limit,
        hasPreviousPage: Boolean(after && parseInt(after, 10) > 0),
      };
    } catch (error) {
      console.error('[smartStickersService] Error searching stickers:', error);
      throw error instanceof GraphQLError ? error : new GraphQLError(`Error searching stickers: ${error}`);
    }
  },

  async getPinnedStickers(entityType?: string, first?: number, accessToken?: string): Promise<StickerSearchResult> {
    // console.log('[smartStickersService.getPinnedStickers] called');
    try {
      const supabase = getAuthenticatedClient(accessToken || '');
      
      let query = supabase
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
      handleSupabaseError(error, 'fetching pinned stickers');

      const transformedStickers = (data || []).map(transformStickerFromDb);

      return {
        nodes: transformedStickers,
        totalCount: transformedStickers.length,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    } catch (error) {
      console.error('[smartStickersService] Error fetching pinned stickers:', error);
      throw error instanceof GraphQLError ? error : new GraphQLError(`Error fetching pinned stickers: ${error}`);
    }
  },

  // Specialized operations
  async toggleStickerPin(id: string, userId: string, accessToken: string): Promise<SmartSticker> {
    // console.log('[smartStickersService.toggleStickerPin] called for:', id, userId);
    try {
      const supabase = getAuthenticatedClient(accessToken);
      
      const { data: current, error: fetchError } = await supabase
        .from('smart_stickers')
        .select('is_pinned')
        .eq('id', id)
        .single();

      if (fetchError) {
        handleSupabaseError(fetchError, 'fetching sticker for pin toggle');
      }

      if (!current) {
        throw new GraphQLError('Sticker not found', { extensions: { code: 'NOT_FOUND' } });
      }

      const { data, error } = await supabase
        .from('smart_stickers')
        .update({
          is_pinned: !current.is_pinned,
          last_edited_by_user_id: userId,
          last_edited_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      handleSupabaseError(error, 'toggling pin');
      return transformStickerFromDb(data);
    } catch (error) {
      console.error('[smartStickersService] Error toggling pin:', error);
      throw error instanceof GraphQLError ? error : new GraphQLError(`Error toggling pin: ${error}`);
    }
  },

  async moveStickersBulk(moves: StickerMoveInput[], userId: string, accessToken: string): Promise<SmartSticker[]> {
    // console.log('[smartStickersService.moveStickersBulk] called for user:', userId, 'moves:', moves.length);
    try {
      const supabase = getAuthenticatedClient(accessToken);
      const updatedStickers: SmartSticker[] = [];

      for (const move of moves) {
        const { data, error } = await supabase
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
    } catch (error) {
      console.error('[smartStickersService] Error moving stickers:', error);
      throw error instanceof GraphQLError ? error : new GraphQLError(`Error moving stickers: ${error}`);
    }
  },

  async updateStickerTags(
    id: string, 
    userId: string, 
    tagsToAdd?: string[], 
    tagsToRemove?: string[], 
    accessToken?: string
  ): Promise<SmartSticker> {
    // console.log('[smartStickersService.updateStickerTags] called for:', id, userId);
    try {
      const supabase = getAuthenticatedClient(accessToken || '');
      
      // First get current tags
      const { data: current, error: fetchError } = await supabase
        .from('smart_stickers')
        .select('tags')
        .eq('id', id)
        .single();

      if (fetchError) {
        handleSupabaseError(fetchError, 'fetching sticker for tag update');
      }

      if (!current) {
        throw new GraphQLError('Sticker not found', { extensions: { code: 'NOT_FOUND' } });
      }

      let currentTags = current.tags || [];

      // Add new tags
      if (tagsToAdd && tagsToAdd.length > 0) {
        currentTags = [...new Set([...currentTags, ...tagsToAdd])];
      }

      // Remove tags
      if (tagsToRemove && tagsToRemove.length > 0) {
        currentTags = currentTags.filter((tag: string) => !tagsToRemove.includes(tag));
      }

      const { data, error } = await supabase
        .from('smart_stickers')
        .update({
          tags: currentTags,
          last_edited_by_user_id: userId,
          last_edited_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      handleSupabaseError(error, 'updating tags');
      return transformStickerFromDb(data);
    } catch (error) {
      console.error('[smartStickersService] Error updating tags:', error);
      throw error instanceof GraphQLError ? error : new GraphQLError(`Error updating tags: ${error}`);
    }
  },

  // Category management
  async getStickerCategories(accessToken?: string): Promise<StickerCategory[]> {
    // console.log('[smartStickersService.getStickerCategories] called');
    try {
      const supabase = getAuthenticatedClient(accessToken || '');
      
      const { data, error } = await supabase
        .from('sticker_categories')
        .select('*')
        .order('display_order', { ascending: true });

      handleSupabaseError(error, 'fetching categories');

      return (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        isSystem: cat.is_system,
        displayOrder: cat.display_order,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at,
      }));
    } catch (error) {
      console.error('[smartStickersService] Error fetching categories:', error);
      throw error instanceof GraphQLError ? error : new GraphQLError(`Error fetching categories: ${error}`);
    }
  }
}; 