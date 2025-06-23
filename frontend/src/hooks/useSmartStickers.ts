import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

// UUID validation helper
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// GraphQL Queries
const GET_ENTITY_STICKERS = gql`
  query GetEntityStickers($entityType: EntityType!, $entityId: ID!, $filters: StickerFilters) {
    getEntityStickers(entityType: $entityType, entityId: $entityId, filters: $filters) {
      nodes {
        id
        title
        content
        entityType
        entityId
        positionX
        positionY
        width
        height
        color
        isPinned
        isPrivate
        priority
        mentions
        tags
        createdAt
        updatedAt
        createdByUserId
        category {
          id
          name
          color
          icon
        }
      }
      totalCount
    }
  }
`;

const GET_STICKER_CATEGORIES = gql`
  query GetStickerCategories {
    getStickerCategories {
      id
      name
      color
      icon
      isSystem
      displayOrder
    }
  }
`;

// GraphQL Mutations
const CREATE_STICKER = gql`
  mutation CreateSticker($input: CreateStickerInput!) {
    createSticker(input: $input) {
      id
      title
      content
      entityType
      entityId
      positionX
      positionY
      width
      height
      color
      isPinned
      isPrivate
      priority
      mentions
      tags
      createdAt
      updatedAt
      createdByUserId
      category {
        id
        name
        color
        icon
      }
    }
  }
`;

const UPDATE_STICKER = gql`
  mutation UpdateSticker($input: UpdateStickerInput!) {
    updateSticker(input: $input) {
      id
      title
      content
      entityType
      entityId
      positionX
      positionY
      width
      height
      color
      isPinned
      isPrivate
      priority
      mentions
      tags
      createdAt
      updatedAt
      createdByUserId
      category {
        id
        name
        color
        icon
      }
    }
  }
`;

const DELETE_STICKER = gql`
  mutation DeleteSticker($id: ID!) {
    deleteSticker(id: $id)
  }
`;

const TOGGLE_STICKER_PIN = gql`
  mutation ToggleStickerPin($id: ID!) {
    toggleStickerPin(id: $id) {
      id
      isPinned
      updatedAt
    }
  }
`;

const MOVE_STICKERS_BULK = gql`
  mutation MoveStickersBulk($moves: [StickerMoveInput!]!) {
    moveStickersBulk(moves: $moves) {
      id
      positionX
      positionY
      updatedAt
    }
  }
`;

// Types
interface StickerCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean;
  displayOrder: number;
}

interface StickerFilters {
  search?: string;
  categoryIds?: string[];
  isPinned?: boolean;
  isPrivate?: boolean;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  tags?: string[];
  createdByUserId?: string;
}

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
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
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
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  mentions?: string[];
  tags?: string[];
}

export const useSmartStickers = (entityType: string, entityId: string) => {
  const [filters, setFilters] = useState<StickerFilters>({});

  // Validate entity ID format
  const isValidEntityId = useMemo(() => isValidUUID(entityId), [entityId]);

  // Memoize variables to prevent unnecessary re-queries
  const queryVariables = useMemo(() => ({
    entityType: entityType.toUpperCase(), 
    entityId, 
    filters 
  }), [entityType, entityId, filters]);

  // Queries
  const { 
    data: stickersData, 
    loading, 
    error, 
    refetch 
  } = useQuery(GET_ENTITY_STICKERS, {
    variables: queryVariables,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    skip: !isValidEntityId, // Skip query if entity ID is not a valid UUID
    onError: (error) => {
      // Log GraphQL errors but don't crash the app
      console.warn('GraphQL query error (handled gracefully):', error.message);
    }
  });

  const { data: categoriesData } = useQuery(GET_STICKER_CATEGORIES, {
    errorPolicy: 'all',
    onError: (error) => {
      console.warn('Failed to load sticker categories:', error.message);
    }
  });

  // Mutations
  const [createStickerMutation] = useMutation(CREATE_STICKER, {
    refetchQueries: [GET_ENTITY_STICKERS],
    errorPolicy: 'all'
  });

  const [updateStickerMutation] = useMutation(UPDATE_STICKER, {
    errorPolicy: 'all'
  });

  const [deleteStickerMutation] = useMutation(DELETE_STICKER, {
    refetchQueries: [GET_ENTITY_STICKERS],
    errorPolicy: 'all'
  });

  const [togglePinMutation] = useMutation(TOGGLE_STICKER_PIN, {
    errorPolicy: 'all'
  });

  const [moveBulkMutation] = useMutation(MOVE_STICKERS_BULK, {
    errorPolicy: 'all'
  });

  // Extract data
  const stickers = stickersData?.getEntityStickers?.nodes || [];
  const categories = categoriesData?.getStickerCategories || [];

  // Filter stickers based on current filters
  const filteredStickers = useMemo(() => {
    let filtered = [...stickers];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(sticker => 
        sticker.title.toLowerCase().includes(searchLower) ||
        sticker.content?.toLowerCase().includes(searchLower) ||
        sticker.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      filtered = filtered.filter(sticker => 
        sticker.category && filters.categoryIds!.includes(sticker.category.id)
      );
    }

    if (filters.isPinned !== undefined) {
      filtered = filtered.filter(sticker => sticker.isPinned === filters.isPinned);
    }

    if (filters.priority) {
      filtered = filtered.filter(sticker => sticker.priority === filters.priority);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(sticker =>
        filters.tags!.some(tag => sticker.tags.includes(tag))
      );
    }

    return filtered;
  }, [stickers, filters]);

  // Create sticker
  const createSticker = useCallback(async (input: CreateStickerInput) => {
    try {
      const { data } = await createStickerMutation({
        variables: { input }
      });
      return data?.createSticker;
    } catch (err) {
      console.error('Failed to create sticker:', err);
      throw err;
    }
  }, [createStickerMutation]);

  // Update sticker
  const updateSticker = useCallback(async (input: UpdateStickerInput) => {
    try {
      const { data } = await updateStickerMutation({
        variables: { input }
      });
      return data?.updateSticker;
    } catch (err) {
      console.error('Failed to update sticker:', err);
      throw err;
    }
  }, [updateStickerMutation]);

  // Delete sticker
  const deleteSticker = useCallback(async (id: string) => {
    try {
      await deleteStickerMutation({
        variables: { id }
      });
    } catch (err) {
      console.error('Failed to delete sticker:', err);
      throw err;
    }
  }, [deleteStickerMutation]);

  // Toggle pin
  const togglePin = useCallback(async (id: string) => {
    try {
      await togglePinMutation({
        variables: { id }
      });
    } catch (err) {
      console.error('Failed to toggle pin:', err);
      throw err;
    }
  }, [togglePinMutation]);

  // Bulk move stickers
  const moveStickersBulk = useCallback(async (moves: Array<{id: string, positionX: number, positionY: number}>) => {
    try {
      await moveBulkMutation({
        variables: { moves }
      });
    } catch (err) {
      console.error('Failed to move stickers:', err);
      throw err;
    }
  }, [moveBulkMutation]);

  return {
    stickers: filteredStickers,
    allStickers: stickers,
    loading,
    error: error ? error.message : null,
    createSticker,
    updateSticker,
    deleteSticker,
    togglePin,
    moveStickersBulk,
    filters,
    setFilters,
    refetch,
    categories,
  };
}; 