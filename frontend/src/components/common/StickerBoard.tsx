import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Rnd } from 'react-rnd';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Badge,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  Checkbox,
  Collapse,
  Divider,
  Tooltip,
  SimpleGrid,
  useToast,
  Tag,
  Link,
} from '@chakra-ui/react';
import { 
  AddIcon,
  SearchIcon,
  ViewIcon,
  EditIcon,
  DeleteIcon,
} from '@chakra-ui/icons';
import { 
  FiFilter,
  FiGrid,
  FiList,
  FiMaximize2,
  FiMinimize2,
  FiPlus,
  FiMoreVertical,
  FiRefreshCw,
  FiTrash,
  FiCopy,
  FiMove,
  FiSettings,
  FiNavigation,
  FiEyeOff,
  FiAlertTriangle,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
} from 'react-icons/fi';
import { SmartSticker } from './SmartSticker';
import { StickerCreateModal } from './StickerCreateModal';
import { StickerFilters } from './StickerFilters';
import SortableTable, { ColumnDefinition } from './SortableTable';
import { useSmartStickers } from '../../hooks/useSmartStickers';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';

// Mock entity types for now
type EntityType = 'DEAL' | 'PERSON' | 'ORGANIZATION' | 'LEAD';
type StickerPriority = 'NORMAL' | 'HIGH' | 'URGENT';

interface StickerBoardProps {
  entityType: EntityType;
  entityId: string;
  className?: string;
  readonly?: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface StickerLayout {
  id: string;
  position: Position;
  size: { width: number; height: number };
}

interface StickerData {
  id: string;
  title: string;
  content?: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
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
  entityType: string;
  entityId: string;
}

// Debounce utility
const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

const iconMap = {
  star: FiStar,
  clock: FiClock,
  checkCircle: FiCheckCircle,
  warning: FiAlertTriangle,
  trendingUp: FiTrendingUp,
  users: FiUsers,
  settings: FiSettings,
  dollarSign: FiDollarSign,
};

export const StickerBoard: React.FC<StickerBoardProps> = ({
  entityType,
  entityId,
  className = '',
  readonly = false,
}) => {
  const { isOpen: isCreateModalOpen, onOpen: openCreateModal, onClose: closeCreateModal } = useDisclosure();
  const { isOpen: isFiltersOpen, onToggle: toggleFilters } = useDisclosure();
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedStickers, setSelectedStickers] = useState<Set<string>>(new Set());
  const [stickerLayouts, setStickerLayouts] = useState<Map<string, StickerLayout>>(new Map());
  
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState({ width: 1200, height: 800 });

  const colors = useThemeColors();
  const styles = useThemeStyles();

  const {
    stickers,
    loading,
    error,
    createSticker,
    updateSticker,
    deleteSticker,
    moveStickersBulk,
    togglePin,
    filters,
    setFilters,
    refetch,
    categories
  } = useSmartStickers(entityType, entityId);

  // Define table columns for stickers
  const stickerTableColumns = useMemo((): ColumnDefinition<StickerData>[] => {
    const getCategoryIcon = (iconName?: string) => {
      if (!iconName) return null;
      const IconComponent = iconMap[iconName as keyof typeof iconMap];
      return IconComponent || null;
    };

    return [
      {
        key: 'title',
        header: 'Title',
        renderCell: (sticker) => (
          <VStack align="start" spacing={1}>
            <Text fontWeight="medium" color={colors.text.primary} noOfLines={1}>
              {sticker.title}
            </Text>
            {sticker.content && (
              <Text fontSize="xs" color={colors.text.muted} noOfLines={2}>
                {sticker.content}
              </Text>
            )}
          </VStack>
        ),
        isSortable: true,
        sortAccessor: (sticker) => sticker.title.toLowerCase(),
      },
      {
        key: 'category',
        header: 'Category',
        renderCell: (sticker) => {
          if (!sticker.category) return <Text color={colors.text.muted}>-</Text>;
          const IconComponent = getCategoryIcon(sticker.category.icon);
          return (
            <Badge
              variant="subtle"
              px={3}
              py={1}
              borderRadius="full"
              bg={sticker.category.color + '20'}
              color={sticker.category.color}
              border="1px solid"
              borderColor={sticker.category.color + '40'}
              fontSize="xs"
              fontWeight="medium"
            >
              <HStack spacing={1}>
                {IconComponent && <Box as={IconComponent} size={12} />}
                <Text>{sticker.category.name}</Text>
              </HStack>
            </Badge>
          );
        },
        isSortable: true,
        sortAccessor: (sticker) => sticker.category?.name.toLowerCase() || '',
      },
      {
        key: 'priority',
        header: 'Priority',
        renderCell: (sticker) => (
          <Badge
            colorScheme={
              sticker.priority === 'URGENT' ? 'red' :
              sticker.priority === 'HIGH' ? 'orange' : 'gray'
            }
            variant="subtle"
            px={2}
            py={1}
            borderRadius="md"
            fontSize="xs"
          >
            <HStack spacing={1}>
              {sticker.priority !== 'NORMAL' && <FiAlertTriangle size={12} />}
              <Text>{sticker.priority.charAt(0) + sticker.priority.slice(1).toLowerCase()}</Text>
            </HStack>
          </Badge>
        ),
        isSortable: true,
        sortAccessor: (sticker) => {
          const priorityOrder = { 'URGENT': 3, 'HIGH': 2, 'NORMAL': 1 };
          return priorityOrder[sticker.priority] || 0;
        },
      },
      {
        key: 'status',
        header: 'Status',
        renderCell: (sticker) => (
          <HStack spacing={2}>
            {sticker.isPinned && (
              <Tag size="sm" colorScheme="yellow" variant="subtle">
                <HStack spacing={1}>
                  <FiNavigation size={10} />
                  <Text fontSize="xs">Pinned</Text>
                </HStack>
              </Tag>
            )}
            {sticker.isPrivate && (
              <Tag size="sm" colorScheme="purple" variant="subtle">
                <HStack spacing={1}>
                  <FiEyeOff size={10} />
                  <Text fontSize="xs">Private</Text>
                </HStack>
              </Tag>
            )}
            {!sticker.isPinned && !sticker.isPrivate && (
              <Text color={colors.text.muted} fontSize="sm">-</Text>
            )}
          </HStack>
        ),
        isSortable: true,
        sortAccessor: (sticker) => `${sticker.isPinned ? '1' : '0'}${sticker.isPrivate ? '1' : '0'}`,
      },
      {
        key: 'tags',
        header: 'Tags',
        renderCell: (sticker) => {
          if (!sticker.tags || sticker.tags.length === 0) {
            return <Text color={colors.text.muted} fontSize="sm">-</Text>;
          }
          return (
            <HStack spacing={1} maxW="200px" overflow="hidden">
              {sticker.tags.slice(0, 3).map(tag => (
                <Tag key={tag} size="sm" variant="subtle" colorScheme="blue">
                  <Text fontSize="xs">#{tag}</Text>
                </Tag>
              ))}
              {sticker.tags.length > 3 && (
                <Text fontSize="xs" color={colors.text.muted}>
                  +{sticker.tags.length - 3}
                </Text>
              )}
            </HStack>
          );
        },
        isSortable: true,
        sortAccessor: (sticker) => sticker.tags.join(',').toLowerCase(),
      },
      {
        key: 'createdAt',
        header: 'Created',
        renderCell: (sticker) => (
          <Text fontSize="sm" color={colors.text.secondary}>
            {new Date(sticker.createdAt).toLocaleDateString()}
          </Text>
        ),
        isSortable: true,
        sortAccessor: (sticker) => new Date(sticker.createdAt).getTime(),
      },
      {
        key: 'actions',
        header: 'Actions',
        renderCell: (sticker) => (
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit sticker"
              icon={<EditIcon />}
              size="sm"
              variant="ghost"
              onClick={() => {
                // Handle edit - you can implement this based on your needs
              }}
              isDisabled={readonly}
            />
            <IconButton
              aria-label="Delete sticker"
              icon={<DeleteIcon />}
              colorScheme="red"
              size="sm"
              variant="ghost"
              onClick={() => deleteSticker(sticker.id)}
              isDisabled={readonly}
            />
            <IconButton
              aria-label="Toggle pin"
              icon={<FiNavigation />}
              colorScheme={sticker.isPinned ? "yellow" : "gray"}
              size="sm"
              variant="ghost"
              onClick={() => togglePin(sticker.id)}
              isDisabled={readonly}
            />
          </HStack>
        ),
        isSortable: false,
      },
    ];
  }, [colors, deleteSticker, togglePin, readonly]);

  // Handle board resizing
  useEffect(() => {
    const updateBoardSize = () => {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        setBoardSize({ width: rect.width, height: rect.height });
      }
    };

    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, [isFullscreen]);

  // Initialize sticker layouts
  useEffect(() => {
    const layouts = new Map<string, StickerLayout>();
    stickers.forEach(sticker => {
      layouts.set(sticker.id, {
        id: sticker.id,
        position: { x: sticker.positionX, y: sticker.positionY },
        size: { width: sticker.width, height: sticker.height }
      });
    });
    setStickerLayouts(layouts);
  }, [stickers]);

  // Debounced server updates to prevent excessive calls during drag operations
  const debouncedUpdatePosition = useDebounce((stickerId: string, position: Position) => {
    updateSticker({
      id: stickerId,
      positionX: position.x,
      positionY: position.y,
    });
  }, 500);

  const debouncedUpdateSize = useDebounce((stickerId: string, size: { width: number; height: number }) => {
    updateSticker({
      id: stickerId,
      width: size.width,
      height: size.height,
    });
  }, 500);

  // Handle sticker position updates
  const handleStickerMove = useCallback((stickerId: string, position: Position) => {
    // Update local state immediately for responsive UI
    setStickerLayouts(prev => {
      const updated = new Map(prev);
      const current = updated.get(stickerId);
      if (current) {
        updated.set(stickerId, { ...current, position });
      }
      return updated;
    });
    
    // Debounced update to server
    debouncedUpdatePosition(stickerId, position);
  }, [debouncedUpdatePosition]);

  // Handle sticker resize
  const handleStickerResize = useCallback((stickerId: string, size: { width: number; height: number }) => {
    // Update local state immediately for responsive UI
    setStickerLayouts(prev => {
      const updated = new Map(prev);
      const current = updated.get(stickerId);
      if (current) {
        updated.set(stickerId, { ...current, size });
      }
      return updated;
    });
    
    // Debounced update to server
    debouncedUpdateSize(stickerId, size);
  }, [debouncedUpdateSize]);

  // Find empty space on the board
  const findEmptySpace = useCallback((): Position => {
    const occupiedAreas = Array.from(stickerLayouts.values()).map(layout => ({
      x: layout.position.x,
      y: layout.position.y,
      width: layout.size.width,
      height: layout.size.height,
    }));

    // Simple algorithm to find empty space
    const defaultWidth = 200;
    const defaultHeight = 150;
    const margin = 20;

    for (let y = margin; y < boardSize.height - defaultHeight; y += defaultHeight + margin) {
      for (let x = margin; x < boardSize.width - defaultWidth; x += defaultWidth + margin) {
        const overlaps = occupiedAreas.some(area => 
          x < area.x + area.width + margin &&
          x + defaultWidth + margin > area.x &&
          y < area.y + area.height + margin &&
          y + defaultHeight + margin > area.y
        );
        
        if (!overlaps) {
          return { x, y };
        }
      }
    }

    // If no empty space found, place at origin
    return { x: margin, y: margin };
  }, [boardSize.width, boardSize.height]);

  // Handle create new sticker
  const handleCreateSticker = useCallback((data: any) => {
    // Calculate empty space at call time instead of relying on callback
    const occupiedAreas = Array.from(stickerLayouts.values()).map(layout => ({
      x: layout.position.x,
      y: layout.position.y,
      width: layout.size.width,
      height: layout.size.height,
    }));

    // Simple algorithm to find empty space
    const defaultWidth = 200;
    const defaultHeight = 150;
    const margin = 20;
    let newPosition = { x: margin, y: margin };

    for (let y = margin; y < boardSize.height - defaultHeight; y += defaultHeight + margin) {
      for (let x = margin; x < boardSize.width - defaultWidth; x += defaultWidth + margin) {
        const overlaps = occupiedAreas.some(area => 
          x < area.x + area.width + margin &&
          x + defaultWidth + margin > area.x &&
          y < area.y + area.height + margin &&
          y + defaultHeight + margin > area.y
        );
        
        if (!overlaps) {
          newPosition = { x, y };
          break;
        }
      }
      if (newPosition.x !== margin || newPosition.y !== margin) break;
    }
    
    createSticker({
      ...data,
      entityType,
      entityId,
      positionX: newPosition.x,
      positionY: newPosition.y,
    });
    
    closeCreateModal();
  }, [createSticker, entityType, entityId, closeCreateModal, stickerLayouts, boardSize]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openCreateModal();
      }
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleFilters();
      }
      if (e.key === 'Escape') {
        setSelectedStickers(new Set());
        if (isFiltersOpen) toggleFilters();
        if (isCreateModalOpen) closeCreateModal();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFiltersOpen, isCreateModalOpen, openCreateModal, closeCreateModal, toggleFilters]);

  if (loading) {
    return (
      <Box 
        className={className} 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        bg={colors.bg.elevated} 
        borderRadius="xl" 
        border="1px solid" 
        borderColor={colors.border.default} 
        minH="400px"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color={colors.interactive.default} thickness="4px" />
          <Text color={colors.text.secondary} fontWeight="medium">Loading stickers...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        className={className} 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        bg={colors.bg.elevated} 
        borderRadius="xl" 
        border="1px solid" 
        borderColor={colors.border.error} 
        minH="400px"
      >
        <VStack spacing={4}>
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            Error loading stickers
          </Alert>
          <Button colorScheme="red" onClick={refetch}>
            Try Again
          </Button>
        </VStack>
      </Box>
    );
  }

  const filteredStickers = stickers; // Filters applied in hook

  return (
    <Box 
      className={className}
      position={isFullscreen ? 'fixed' : 'relative'}
      inset={isFullscreen ? 0 : undefined}
      zIndex={isFullscreen ? 50 : undefined}
      bg={isFullscreen ? colors.bg.app : 'transparent'}
    >
      {/* Modern Header */}
      <Box 
        bg={colors.bg.surface} 
        borderBottom="1px solid" 
        borderColor={colors.border.default} 
        px={6} 
        py={4}
      >
        <Flex justify="space-between" align="center">
          {/* Left Section */}
          <HStack spacing={4}>
            <HStack spacing={2}>
              <Box w={2} h={2} bg={colors.interactive.default} borderRadius="full" />
              <Text fontSize="lg" fontWeight="semibold" color={colors.text.primary}>
                Smart Stickers
              </Text>
            </HStack>
            <Badge 
              colorScheme="gray" 
              variant="subtle" 
              px={3} 
              py={1} 
              borderRadius="full"
              bg={colors.bg.elevated}
            >
              <HStack spacing={1}>
                <Text fontSize="sm" fontWeight="medium">{filteredStickers.length}</Text>
                <Text fontSize="sm">stickers</Text>
              </HStack>
            </Badge>
          </HStack>

          {/* Center Section - Search */}
          <Box flex={1} maxW="md" mx={6}>
            <InputGroup>
              <InputLeftElement>
                <SearchIcon color={colors.text.muted} />
              </InputLeftElement>
              <Input
                placeholder="Search stickers..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                {...styles.input}
                borderRadius="xl"
              />
            </InputGroup>
          </Box>

          {/* Right Section */}
          <HStack spacing={2}>
            {/* View Toggle */}
            <HStack spacing={0} bg={colors.bg.elevated} borderRadius="lg" p={1}>
              <IconButton
                aria-label="Board view"
                icon={<FiGrid />}
                size="sm"
                variant={viewMode === 'board' ? 'solid' : 'ghost'}
                colorScheme={viewMode === 'board' ? 'blue' : undefined}
                onClick={() => setViewMode('board')}
              />
              <IconButton
                aria-label="List view"
                icon={<FiList />}
                size="sm"
                variant={viewMode === 'list' ? 'solid' : 'ghost'}
                colorScheme={viewMode === 'list' ? 'blue' : undefined}
                onClick={() => setViewMode('list')}
              />
            </HStack>

            {/* Filter Toggle */}
            <IconButton
              aria-label="Toggle filters"
              icon={<FiFilter />}
              colorScheme={isFiltersOpen ? 'blue' : 'gray'}
              variant={isFiltersOpen ? 'solid' : 'outline'}
              onClick={toggleFilters}
            />

            {/* Fullscreen Toggle */}
            <IconButton
              aria-label="Toggle fullscreen"
              icon={isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
              variant="outline"
              onClick={() => setIsFullscreen(!isFullscreen)}
            />

            {/* Add Button */}
            {!readonly && (
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={openCreateModal}
                size="md"
              >
                Add Sticker
              </Button>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* Filters Panel */}
      {isFiltersOpen && (
        <Box 
          bg={colors.bg.elevated} 
          borderBottom="1px solid" 
          borderColor={colors.border.default} 
          px={6} 
          py={4}
        >
          <StickerFilters
            filters={filters}
            onFiltersChange={setFilters}
            entityType={entityType}
            categories={categories}
          />
        </Box>
      )}

      {/* Content Area */}
      <Box 
        ref={boardRef}
        position="relative"
        overflow="hidden"
        minH={isFullscreen ? '100vh' : '500px'}
        h="full"
        bg={viewMode === 'board' ? colors.bg.kanbanColumn : colors.bg.elevated}
      >
        {viewMode === 'board' && (
          <>
            {/* Grid Pattern */}
            <Box 
              position="absolute"
              inset={0}
              opacity={0.3}
              backgroundImage={`
                linear-gradient(${colors.border.subtle} 1px, transparent 1px),
                linear-gradient(90deg, ${colors.border.subtle} 1px, transparent 1px)
              `}
              backgroundSize="20px 20px"
            />
          </>
        )}

        {/* Stickers Container */}
        {viewMode === 'board' ? (
          <Box position="relative" w="full" h="full" p={6}>
            {filteredStickers.map((sticker) => {
              const layout = stickerLayouts.get(sticker.id);
              if (!layout) return null;

              return (
                <Rnd
                  key={sticker.id}
                  position={layout.position}
                  size={layout.size}
                  onDragStop={(e, data) => {
                    handleStickerMove(sticker.id, { x: data.x, y: data.y });
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    handleStickerResize(sticker.id, {
                      width: parseInt(ref.style.width),
                      height: parseInt(ref.style.height),
                    });
                  }}
                  minWidth={150}
                  minHeight={100}
                  maxWidth={600}
                  maxHeight={400}
                  enableResizing={!readonly}
                  disableDragging={readonly}
                >
                  <SmartSticker
                    sticker={sticker}
                    onUpdate={updateSticker}
                    onDelete={deleteSticker}
                    onTogglePin={togglePin}
                    onSelect={(selected) => {
                      setSelectedStickers(prev => {
                        const updated = new Set(prev);
                        if (selected) {
                          updated.add(sticker.id);
                        } else {
                          updated.delete(sticker.id);
                        }
                        return updated;
                      });
                    }}
                    isSelected={selectedStickers.has(sticker.id)}
                    readonly={readonly}
                    layout="board"
                  />
                </Rnd>
              );
            })}
          </Box>
        ) : (
          <Box p={6}>
            <SortableTable<StickerData>
              data={filteredStickers.map(sticker => ({
                ...sticker,
                category: sticker.category ? {
                  id: sticker.category.id,
                  name: sticker.category.name,
                  color: sticker.category.color,
                  icon: sticker.category.icon,
                } : undefined,
              }))}
              columns={stickerTableColumns}
              initialSortKey="createdAt"
              initialSortDirection="descending"
            />
          </Box>
        )}

        {/* Empty State */}
        {filteredStickers.length === 0 && (
          <Box 
            position="absolute"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <VStack spacing={4} textAlign="center" maxW="md" mx="auto" p={8}>
              <Box 
                w={16} 
                h={16} 
                bg={colors.bg.elevated} 
                borderRadius="full" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                border="2px solid"
                borderColor={colors.border.default}
              >
                <FiPlus size={32} color={colors.interactive.default} />
              </Box>
              <Text fontSize="lg" fontWeight="semibold" color={colors.text.primary}>
                No stickers yet
              </Text>
              <Text color={colors.text.secondary}>
                Create your first sticker to start organizing your thoughts visually
              </Text>
              {!readonly && (
                <Button
                  colorScheme="blue"
                  onClick={openCreateModal}
                >
                  Create First Sticker
                </Button>
              )}
            </VStack>
          </Box>
        )}
      </Box>

      {/* Modals */}
      <StickerCreateModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateSticker}
        entityType={entityType}
        entityId={entityId}
        categories={categories}
      />
    </Box>
  );
}; 