import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  Input,
  Textarea,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  FiNavigation,
  FiMoreVertical,
  FiEdit3,
  FiTrash2,
  FiCopy,
  FiTag,
  FiUser,
  FiCalendar,
  FiAlertTriangle,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiUsers,
  FiSettings,
  FiDollarSign,
} from 'react-icons/fi';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';

// Mock types for now - these should come from generated GraphQL
interface StickerCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface SmartStickerData {
  id: string;
  title: string;
  content?: string;
  category?: StickerCategory;
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
}

interface SmartStickerProps {
  sticker: SmartStickerData;
  onUpdate: (updates: any) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onSelect: (selected: boolean) => void;
  isSelected: boolean;
  readonly?: boolean;
  layout?: 'board' | 'list';
}

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

export const SmartSticker: React.FC<SmartStickerProps> = ({
  sticker,
  onUpdate,
  onDelete,
  onTogglePin,
  onSelect,
  isSelected,
  readonly = false,
  layout = 'board',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(sticker.title);
  const [editContent, setEditContent] = useState(sticker.content || '');
  
  const editRef = useRef<HTMLTextAreaElement>(null);
  const colors = useThemeColors();
  const styles = useThemeStyles();

  // Auto-focus edit field
  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editTitle.trim() !== sticker.title || editContent !== sticker.content) {
      onUpdate({
        id: sticker.id,
        title: editTitle.trim(),
        content: editContent,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(sticker.title);
    setEditContent(sticker.content || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': 
        return 'orange';
      case 'URGENT': 
        return 'red';
      default: 
        return 'gray';
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || null;
  };

  if (layout === 'list') {
    return (
      <Box
        {...styles.card}
        p={5}
        transition="all 0.2s"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
          borderColor: colors.border.accent,
        }}
        borderColor={isSelected ? colors.border.accent : colors.border.default}
        borderWidth="2px"
        cursor="pointer"
        onClick={() => onSelect(!isSelected)}
        role="group"
      >
        <Flex justify="space-between" align="start">
          <Box flex={1}>
            {/* Header with category and priority */}
            <HStack spacing={2} mb={3}>
              {sticker.category && (
                <Badge
                  colorScheme={sticker.category.color as any}
                  variant="subtle"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                >
                  <HStack spacing={1}>
                    {(() => {
                      const IconComponent = getCategoryIcon(sticker.category.icon);
                      return IconComponent ? <Box as={IconComponent} boxSize={3} /> : null;
                    })()}
                    <Text>{sticker.category.name}</Text>
                  </HStack>
                </Badge>
              )}
              {sticker.isPinned && (
                <Box
                  as={FiNavigation}
                  boxSize={4}
                  color="yellow.500"
                  p={1}
                  bg="yellow.100"
                  borderRadius="full"
                />
              )}
              {sticker.priority !== 'NORMAL' && (
                <Badge
                  colorScheme={getPriorityColor(sticker.priority)}
                  variant="solid"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                >
                  {sticker.priority}
                </Badge>
              )}
            </HStack>

            {/* Content */}
            <Text fontSize="md" fontWeight="semibold" color={colors.text.primary} mb={2}>
              {sticker.title}
            </Text>
            {sticker.content && (
              <Text fontSize="sm" color={colors.text.secondary} mb={3} lineHeight="1.5">
                {sticker.content}
              </Text>
            )}
            
            {/* Tags */}
            {sticker.tags.length > 0 && (
              <HStack spacing={1} flexWrap="wrap">
                {sticker.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    colorScheme="gray"
                    px={2}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                  >
                    #{tag}
                  </Badge>
                ))}
              </HStack>
            )}
          </Box>
          
          {!readonly && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
                aria-label="Options"
                opacity={0}
                _groupHover={{ opacity: 1 }}
              />
              <MenuList>
                <MenuItem icon={<FiEdit3 />} onClick={() => setIsEditing(true)}>
                  Edit
                </MenuItem>
                <MenuItem 
                  icon={<FiNavigation />} 
                  onClick={() => onTogglePin(sticker.id)}
                >
                  {sticker.isPinned ? 'Unpin' : 'Pin'}
                </MenuItem>
                <MenuItem 
                  icon={<FiTrash2 />} 
                  onClick={() => onDelete(sticker.id)}
                  color="red.500"
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Box>
    );
  }

  // Board view - Miro-style sticky note
  return (
    <Box
      bg={sticker.color}
      borderRadius="xl"
      boxShadow="lg"
      _hover={{
        boxShadow: 'xl',
        transform: 'translateY(-2px) rotate(1deg)',
      }}
      transition="all 0.2s ease-out"
      cursor="move"
      userSelect="none"
      minH="120px"
      w="full"
      h="full"
      position="relative"
      border={isSelected ? '3px solid' : 'none'}
      borderColor={isSelected ? colors.border.accent : 'transparent'}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(!isSelected);
      }}
      role="group"
    >
      {/* Priority indicator */}
      {sticker.priority !== 'NORMAL' && (
        <Box
          position="absolute"
          top={-1}
          right={-1}
          w={6}
          h={6}
          borderRadius="full"
          bg={`${getPriorityColor(sticker.priority)}.500`}
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="md"
        >
          <FiAlertTriangle size={12} />
        </Box>
      )}

      {/* Pin indicator */}
      {sticker.isPinned && (
        <Box position="absolute" top={2} right={2}>
          <Box
            bg="yellow.400"
            p={1}
            borderRadius="full"
            boxShadow="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FiNavigation size={12} color="white" />
          </Box>
        </Box>
      )}

      {/* Content */}
      <Box p={4} h="full" display="flex" flexDirection="column" position="relative" zIndex={1}>
        {/* Category badge */}
        {sticker.category && (
          <Box mb={2}>
            <Badge
              bg="whiteAlpha.900"
              color={sticker.category.color}
              px={2}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="medium"
              backdropFilter="blur(4px)"
            >
              <HStack spacing={1}>
                {(() => {
                  const IconComponent = getCategoryIcon(sticker.category.icon);
                  return IconComponent ? <Box as={IconComponent} boxSize={3} /> : null;
                })()}
                <Text>{sticker.category.name}</Text>
              </HStack>
            </Badge>
          </Box>
        )}

        {/* Title and content */}
        {isEditing ? (
          <VStack spacing={2} flex={1}>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              bg="whiteAlpha.900"
              backdropFilter="blur(4px)"
              border="2px solid"
              borderColor="blue.300"
              borderRadius="lg"
              fontSize="sm"
              fontWeight="semibold"
              placeholder="Sticker title..."
            />
            <Textarea
              ref={editRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              bg="whiteAlpha.900"
              backdropFilter="blur(4px)"
              border="2px solid"
              borderColor="blue.300"
              borderRadius="lg"
              fontSize="sm"
              resize="none"
              placeholder="Add content..."
              rows={3}
              flex={1}
            />
            <HStack spacing={2}>
              <Button
                size="xs"
                colorScheme="blue"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </HStack>
          </VStack>
        ) : (
          <VStack align="start" spacing={2} flex={1}>
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="gray.900"
              lineHeight="tight"
            >
              {sticker.title}
            </Text>
            {sticker.content && (
              <Text
                fontSize="xs"
                color="gray.700"
                lineHeight="relaxed"
                flex={1}
              >
                {sticker.content}
              </Text>
            )}
            
            {/* Tags */}
            {sticker.tags.length > 0 && (
              <HStack spacing={1} flexWrap="wrap" mt="auto">
                {sticker.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    bg="whiteAlpha.700"
                    backdropFilter="blur(4px)"
                    color="gray.700"
                    fontSize="xs"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    border="1px solid"
                    borderColor="whiteAlpha.500"
                  >
                    #{tag}
                  </Badge>
                ))}
                {sticker.tags.length > 3 && (
                  <Badge
                    bg="whiteAlpha.700"
                    backdropFilter="blur(4px)"
                    color="gray.500"
                    fontSize="xs"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                  >
                    +{sticker.tags.length - 3}
                  </Badge>
                )}
              </HStack>
            )}
          </VStack>
        )}

        {/* Menu button */}
        {!readonly && !isEditing && (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiMoreVertical />}
              position="absolute"
              top={2}
              left={2}
              size="xs"
              variant="ghost"
              bg="whiteAlpha.500"
              backdropFilter="blur(4px)"
              opacity={0}
              _groupHover={{ opacity: 1 }}
              _hover={{ bg: "whiteAlpha.700" }}
              onClick={(e) => e.stopPropagation()}
            />
            <MenuList>
              <MenuItem 
                icon={<FiEdit3 />} 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                Edit
              </MenuItem>
              <MenuItem 
                icon={<FiNavigation />} 
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(sticker.id);
                }}
              >
                {sticker.isPinned ? 'Unpin' : 'Pin'}
              </MenuItem>
              <MenuItem 
                icon={<FiTrash2 />} 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(sticker.id);
                }}
                color="red.500"
              >
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Box>
    </Box>
  );
}; 