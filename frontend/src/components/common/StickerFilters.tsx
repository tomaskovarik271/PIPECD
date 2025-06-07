import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Checkbox,
  RadioGroup,
  Radio,
  Stack,
  Badge,
  Button,
  Wrap,
  WrapItem,
  IconButton,
  Divider,
  SimpleGrid,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiTrendingUp,
  FiUsers,
  FiSettings,
  FiDollarSign,
  FiNavigation,
  FiEyeOff,
} from 'react-icons/fi';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';

interface StickerCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isSystem?: boolean;
  displayOrder?: number;
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

interface StickerFiltersProps {
  filters: StickerFilters;
  onFiltersChange: (filters: StickerFilters) => void;
  entityType: string;
  categories?: StickerCategory[];
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

export const StickerFilters: React.FC<StickerFiltersProps> = ({
  filters,
  onFiltersChange,
  entityType,
  categories = [],
}) => {
  const colors = useThemeColors();
  const styles = useThemeStyles();
  
  const { isOpen: isCategoriesOpen, onToggle: toggleCategories } = useDisclosure({ defaultIsOpen: true });
  const { isOpen: isStatusOpen, onToggle: toggleStatus } = useDisclosure({ defaultIsOpen: true });
  const { isOpen: isPriorityOpen, onToggle: togglePriority } = useDisclosure({ defaultIsOpen: true });

  const getCategoryIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || null;
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentIds = filters.categoryIds || [];
    const newIds = currentIds.includes(categoryId)
      ? currentIds.filter(id => id !== categoryId)
      : [...currentIds, categoryId];
    
    onFiltersChange({
      ...filters,
      categoryIds: newIds.length > 0 ? newIds : undefined,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = 
    filters.categoryIds?.length ||
    filters.isPinned !== undefined ||
    filters.isPrivate !== undefined ||
    filters.priority ||
    filters.tags?.length;

  const activeCategoryCount = filters.categoryIds?.length || 0;
  const activeStatusCount = (filters.isPinned !== undefined ? 1 : 0) + (filters.isPrivate !== undefined ? 1 : 0);
  const activePriorityCount = filters.priority ? 1 : 0;

  return (
    <Box 
      bg={colors.bg.surface} 
      borderRadius="xl" 
      border="1px solid" 
      borderColor={colors.border.default}
      overflow="hidden"
    >
      {/* Header */}
      <Box px={6} py={4} borderBottom="1px solid" borderColor={colors.border.default}>
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <FiFilter size={18} color={colors.text.primary} />
            <Text fontSize="md" fontWeight="semibold" color={colors.text.primary}>
              Filters
            </Text>
            {hasActiveFilters && (
              <Badge 
                colorScheme="blue" 
                variant="solid" 
                borderRadius="full" 
                px={2} 
                py={1}
                fontSize="xs"
              >
                {(activeCategoryCount + activeStatusCount + activePriorityCount)}
              </Badge>
            )}
          </HStack>
          
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="ghost"
              colorScheme="blue"
              onClick={clearAllFilters}
              leftIcon={<FiX size={14} />}
              fontSize="sm"
            >
              Clear all
            </Button>
          )}
        </HStack>
      </Box>

      {/* Filter Content */}
      <VStack spacing={0} align="stretch">
        {/* Categories Section */}
        {categories.length > 0 && (
          <Box>
            <Button
              w="full"
              justifyContent="space-between"
              variant="ghost"
              onClick={toggleCategories}
              px={6}
              py={4}
              borderRadius="none"
              _hover={{ bg: colors.bg.elevated }}
            >
              <HStack spacing={3}>
                <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                  Categories
                </Text>
                {activeCategoryCount > 0 && (
                  <Badge 
                    colorScheme="blue" 
                    variant="subtle" 
                    borderRadius="full"
                    fontSize="xs"
                  >
                    {activeCategoryCount}
                  </Badge>
                )}
              </HStack>
              <Box as={isCategoriesOpen ? FiChevronDown : FiChevronRight} color={colors.text.muted} />
            </Button>
            
            <Collapse in={isCategoriesOpen}>
              <Box px={6} pb={4}>
                <VStack spacing={3} align="stretch">
                  {categories.map(category => {
                    const IconComponent = getCategoryIcon(category.icon);
                    const isSelected = filters.categoryIds?.includes(category.id) || false;
                    
                    return (
                      <Checkbox
                        key={category.id}
                        isChecked={isSelected}
                        onChange={() => handleCategoryToggle(category.id)}
                        colorScheme="blue"
                        size="md"
                      >
                        <HStack spacing={2} ml={2}>
                          <Box
                            w={3}
                            h={3}
                            borderRadius="full"
                            bg={category.color}
                          />
                          {IconComponent && (
                            <Box as={IconComponent} size={16} color={colors.text.muted} />
                          )}
                          <Text fontSize="sm" color={colors.text.primary} fontWeight="medium">
                            {category.name}
                          </Text>
                        </HStack>
                      </Checkbox>
                    );
                  })}
                </VStack>
              </Box>
            </Collapse>
            
            <Divider borderColor={colors.border.default} />
          </Box>
        )}

        {/* Status Section */}
        <Box>
          <Button
            w="full"
            justifyContent="space-between"
            variant="ghost"
            onClick={toggleStatus}
            px={6}
            py={4}
            borderRadius="none"
            _hover={{ bg: colors.bg.elevated }}
          >
            <HStack spacing={3}>
              <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                Status
              </Text>
              {activeStatusCount > 0 && (
                <Badge 
                  colorScheme="blue" 
                  variant="subtle" 
                  borderRadius="full"
                  fontSize="xs"
                >
                  {activeStatusCount}
                </Badge>
              )}
            </HStack>
            <Box as={isStatusOpen ? FiChevronDown : FiChevronRight} color={colors.text.muted} />
          </Button>
          
          <Collapse in={isStatusOpen}>
            <Box px={6} pb={4}>
              <VStack spacing={3} align="stretch">
                <Checkbox
                  isChecked={filters.isPinned === true}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    isPinned: e.target.checked ? true : undefined,
                  })}
                  colorScheme="yellow"
                  size="md"
                >
                  <HStack spacing={2} ml={2}>
                    <FiNavigation size={16} color={colors.text.muted} />
                    <Text fontSize="sm" color={colors.text.primary} fontWeight="medium">
                      Pinned
                    </Text>
                  </HStack>
                </Checkbox>

                <Checkbox
                  isChecked={filters.isPrivate === true}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    isPrivate: e.target.checked ? true : undefined,
                  })}
                  colorScheme="purple"
                  size="md"
                >
                  <HStack spacing={2} ml={2}>
                    <FiEyeOff size={16} color={colors.text.muted} />
                    <Text fontSize="sm" color={colors.text.primary} fontWeight="medium">
                      Private
                    </Text>
                  </HStack>
                </Checkbox>
              </VStack>
            </Box>
          </Collapse>
          
          <Divider borderColor={colors.border.default} />
        </Box>

        {/* Priority Section */}
        <Box>
          <Button
            w="full"
            justifyContent="space-between"
            variant="ghost"
            onClick={togglePriority}
            px={6}
            py={4}
            borderRadius="none"
            _hover={{ bg: colors.bg.elevated }}
          >
            <HStack spacing={3}>
              <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                Priority
              </Text>
              {activePriorityCount > 0 && (
                <Badge 
                  colorScheme="blue" 
                  variant="subtle" 
                  borderRadius="full"
                  fontSize="xs"
                >
                  {activePriorityCount}
                </Badge>
              )}
            </HStack>
            <Box as={isPriorityOpen ? FiChevronDown : FiChevronRight} color={colors.text.muted} />
          </Button>
          
          <Collapse in={isPriorityOpen}>
            <Box px={6} pb={4}>
              <RadioGroup
                value={filters.priority || ''}
                onChange={(value: string) => onFiltersChange({
                  ...filters,
                  priority: value && ['NORMAL', 'HIGH', 'URGENT'].includes(value) 
                    ? value as 'NORMAL' | 'HIGH' | 'URGENT' 
                    : undefined,
                })}
              >
                <VStack spacing={3} align="stretch">
                  {(['NORMAL', 'HIGH', 'URGENT'] as const).map(priority => (
                    <Radio 
                      key={priority} 
                      value={priority}
                      colorScheme="blue"
                      size="md"
                    >
                      <HStack spacing={2} ml={2}>
                        {priority === 'URGENT' && <FiAlertTriangle size={16} color="#E53E3E" />}
                        {priority === 'HIGH' && <FiAlertTriangle size={16} color="#DD6B20" />}
                        <Text 
                          fontSize="sm" 
                          fontWeight="medium"
                          color={
                            priority === 'URGENT' ? '#E53E3E' :
                            priority === 'HIGH' ? '#DD6B20' :
                            colors.text.primary
                          }
                        >
                          {priority.charAt(0) + priority.slice(1).toLowerCase()}
                        </Text>
                      </HStack>
                    </Radio>
                  ))}
                </VStack>
              </RadioGroup>
            </Box>
          </Collapse>
        </Box>
      </VStack>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <Box px={6} py={4} borderTop="1px solid" borderColor={colors.border.default} bg={colors.bg.elevated}>
          <VStack spacing={3} align="stretch">
            <Text fontSize="xs" fontWeight="semibold" color={colors.text.muted} textTransform="uppercase" letterSpacing="wide">
              Active Filters
            </Text>
            <Wrap spacing={2}>
              {filters.categoryIds?.map(categoryId => {
                const category = categories.find(c => c.id === categoryId);
                if (!category) return null;
                
                return (
                  <WrapItem key={categoryId}>
                    <Badge
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg={category.color + '20'}
                      color={category.color}
                      border="1px solid"
                      borderColor={category.color + '40'}
                      fontSize="xs"
                      fontWeight="medium"
                    >
                      <HStack spacing={1}>
                        <Text>{category.name}</Text>
                        <IconButton
                          aria-label="Remove filter"
                          icon={<FiX />}
                          size="xs"
                          variant="ghost"
                          onClick={() => handleCategoryToggle(categoryId)}
                          minW="auto"
                          h="auto"
                          p={0}
                          color={category.color}
                          _hover={{ bg: 'transparent' }}
                        />
                      </HStack>
                    </Badge>
                  </WrapItem>
                );
              })}
              
              {filters.isPinned && (
                <WrapItem>
                  <Badge
                    variant="subtle"
                    colorScheme="yellow"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="medium"
                  >
                    <HStack spacing={1}>
                      <FiNavigation size={12} />
                      <Text>Pinned</Text>
                      <IconButton
                        aria-label="Remove filter"
                        icon={<FiX />}
                        size="xs"
                        variant="ghost"
                        onClick={() => onFiltersChange({ ...filters, isPinned: undefined })}
                        minW="auto"
                        h="auto"
                        p={0}
                        _hover={{ bg: 'transparent' }}
                      />
                    </HStack>
                  </Badge>
                </WrapItem>
              )}
              
              {filters.isPrivate && (
                <WrapItem>
                  <Badge
                    variant="subtle"
                    colorScheme="purple"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="medium"
                  >
                    <HStack spacing={1}>
                      <FiEyeOff size={12} />
                      <Text>Private</Text>
                      <IconButton
                        aria-label="Remove filter"
                        icon={<FiX />}
                        size="xs"
                        variant="ghost"
                        onClick={() => onFiltersChange({ ...filters, isPrivate: undefined })}
                        minW="auto"
                        h="auto"
                        p={0}
                        _hover={{ bg: 'transparent' }}
                      />
                    </HStack>
                  </Badge>
                </WrapItem>
              )}
              
              {filters.priority && (
                <WrapItem>
                  <Badge
                    variant="subtle"
                    colorScheme={
                      filters.priority === 'URGENT' ? 'red' :
                      filters.priority === 'HIGH' ? 'orange' : 'gray'
                    }
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="medium"
                  >
                    <HStack spacing={1}>
                      {filters.priority !== 'NORMAL' && <FiAlertTriangle size={12} />}
                      <Text>{filters.priority.charAt(0) + filters.priority.slice(1).toLowerCase()}</Text>
                      <IconButton
                        aria-label="Remove filter"
                        icon={<FiX />}
                        size="xs"
                        variant="ghost"
                        onClick={() => onFiltersChange({ ...filters, priority: undefined })}
                        minW="auto"
                        h="auto"
                        p={0}
                        _hover={{ bg: 'transparent' }}
                      />
                    </HStack>
                  </Badge>
                </WrapItem>
              )}
            </Wrap>
          </VStack>
        </Box>
      )}
    </Box>
  );
}; 