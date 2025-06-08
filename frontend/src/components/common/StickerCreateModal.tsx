import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Checkbox,
  IconButton,
  SimpleGrid,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  RadioGroup,
  Radio,
  Stack,
  Divider,
  useToast,
  FormHelperText,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { 
  FiStar,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiTrendingUp,
  FiUsers,
  FiSettings,
  FiDollarSign,
  FiEyeOff,
  FiNavigation,
} from 'react-icons/fi';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';

interface StickerCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface StickerFormData {
  title: string;
  content: string;
  categoryId: string;
  color: string;
  isPinned: boolean;
  isPrivate: boolean;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  tags: string[];
  mentions: string[];
  entityType: string;
  entityId: string;
}

interface StickerCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StickerFormData) => void;
  entityType: string;
  entityId: string;
  categories?: StickerCategory[];
}

const colorOptions = [
  { value: '#FFE066', name: 'Yellow', colorScheme: 'yellow' },
  { value: '#FFB3BA', name: 'Pink', colorScheme: 'pink' },
  { value: '#BAFFC9', name: 'Green', colorScheme: 'green' },
  { value: '#BAE1FF', name: 'Blue', colorScheme: 'blue' },
  { value: '#FFFFBA', name: 'Light Yellow', colorScheme: 'yellow' },
  { value: '#FFB3FF', name: 'Magenta', colorScheme: 'purple' },
  { value: '#C4C4C4', name: 'Gray', colorScheme: 'gray' },
  { value: '#FFDFBA', name: 'Orange', colorScheme: 'orange' },
];

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

export const StickerCreateModal: React.FC<StickerCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  entityType,
  entityId,
  categories = [],
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    color: '#FFE066',
    isPinned: false,
    isPrivate: false,
    priority: 'NORMAL' as 'NORMAL' | 'HIGH' | 'URGENT',
    tags: [] as string[],
    mentions: [] as string[],
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your sticker',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await onSubmit({
        ...formData,
        entityType,
        entityId,
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        categoryId: '',
        color: '#FFE066',
        isPinned: false,
        isPrivate: false,
        priority: 'NORMAL',
        tags: [],
        mentions: [],
      });
      setTagInput('');
      
      toast({
        title: 'Sticker created',
        description: 'Your smart sticker has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error creating sticker',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || null;
  };

  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
  const selectedColor = colorOptions.find(opt => opt.value === formData.color);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent bg={colors.component.modal.background} color={colors.text.primary} maxH="90vh">
        <ModalHeader borderBottom="1px solid" borderColor={colors.border.default}>
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="bold">Create Smart Sticker</Text>
            <Text fontSize="sm" color={colors.text.secondary} fontWeight="normal">
              Add a visual note to organize your thoughts and collaborate with your team
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {/* Title */}
              <FormControl isRequired>
                <FormLabel color={colors.text.primary} fontWeight="medium">
                  Title
                </FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter sticker title..."
                  {...styles.input}
                  size="lg"
                />
                <FormHelperText color={colors.text.muted}>
                  Give your sticker a clear, descriptive title
                </FormHelperText>
              </FormControl>

              {/* Content */}
              <FormControl>
                <FormLabel color={colors.text.primary} fontWeight="medium">
                  Content
                </FormLabel>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Add your notes, thoughts, or action items..."
                  {...styles.input}
                  rows={4}
                  resize="vertical"
                />
              </FormControl>

              <Divider />

              {/* Category and Color Row */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Category */}
                <FormControl>
                  <FormLabel color={colors.text.primary} fontWeight="medium">
                    Category
                  </FormLabel>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    placeholder="Select a category"
                    {...styles.input}
                  >
                    {categories.map(category => {
                      return (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      );
                    })}
                  </Select>
                  {selectedCategory && (
                    <Box mt={2}>
                      <Badge
                        colorScheme={selectedCategory.color as 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink'}
                        variant="subtle"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="sm"
                      >
                        <HStack spacing={1}>
                          {getCategoryIcon(selectedCategory.icon) && (
                            <Box as={getCategoryIcon(selectedCategory.icon)!} boxSize={3} />
                          )}
                          <Text>{selectedCategory.name}</Text>
                        </HStack>
                      </Badge>
                    </Box>
                  )}
                </FormControl>

                {/* Color */}
                <FormControl>
                  <FormLabel color={colors.text.primary} fontWeight="medium">
                    Color
                  </FormLabel>
                  <SimpleGrid columns={4} spacing={2}>
                    {colorOptions.map(colorOption => (
                      <Box
                        key={colorOption.value}
                        as="button"
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color: colorOption.value }))}
                        w={12}
                        h={10}
                        borderRadius="lg"
                        bg={colorOption.value}
                        border="3px solid"
                        borderColor={formData.color === colorOption.value ? colors.border.accent : 'transparent'}
                        _hover={{
                          transform: 'scale(1.05)',
                          borderColor: colors.border.accent,
                        }}
                        transition="all 0.2s"
                        position="relative"
                        cursor="pointer"
                      >
                        {formData.color === colorOption.value && (
                          <Box
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            w={4}
                            h={4}
                            borderRadius="full"
                            bg={colors.text.primary}
                          />
                        )}
                      </Box>
                    ))}
                  </SimpleGrid>
                  {selectedColor && (
                    <Text mt={2} fontSize="sm" color={colors.text.secondary}>
                      Selected: {selectedColor.name}
                    </Text>
                  )}
                </FormControl>
              </SimpleGrid>

              <Divider />

              {/* Priority */}
              <FormControl>
                <FormLabel color={colors.text.primary} fontWeight="medium">
                  Priority Level
                </FormLabel>
                <RadioGroup
                  value={formData.priority}
                  onChange={(value) => setFormData(prev => ({ ...prev, priority: value as 'NORMAL' | 'HIGH' | 'URGENT' }))}
                >
                  <HStack spacing={6}>
                    <Radio value="NORMAL" colorScheme="blue">
                      <Text fontSize="sm">Normal</Text>
                    </Radio>
                    <Radio value="HIGH" colorScheme="orange">
                      <HStack spacing={1}>
                        <Text fontSize="sm">High</Text>
                        <FiAlertTriangle size={14} />
                      </HStack>
                    </Radio>
                    <Radio value="URGENT" colorScheme="red">
                      <HStack spacing={1}>
                        <Text fontSize="sm">Urgent</Text>
                        <FiAlertTriangle size={14} />
                      </HStack>
                    </Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              {/* Tags */}
              <FormControl>
                <FormLabel color={colors.text.primary} fontWeight="medium">
                  Tags
                </FormLabel>
                <VStack align="stretch" spacing={3}>
                  {formData.tags.length > 0 && (
                    <Wrap>
                      {formData.tags.map(tag => (
                        <WrapItem key={tag}>
                          <Tag
                            size="md"
                            borderRadius="full"
                            variant="solid"
                            colorScheme="blue"
                          >
                            <TagLabel>#{tag}</TagLabel>
                            <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                  <HStack>
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Add a tag..."
                      {...styles.input}
                      flex={1}
                    />
                    <IconButton
                      aria-label="Add tag"
                      icon={<AddIcon />}
                      onClick={handleAddTag}
                      colorScheme="blue"
                      variant="outline"
                      isDisabled={!tagInput.trim()}
                    />
                  </HStack>
                </VStack>
                <FormHelperText color={colors.text.muted}>
                  Add tags to help organize and find your stickers later
                </FormHelperText>
              </FormControl>

              <Divider />

              {/* Options */}
              <VStack align="stretch" spacing={4}>
                <Text color={colors.text.primary} fontWeight="medium" fontSize="sm">
                  Options
                </Text>
                <Stack spacing={3}>
                  <Checkbox
                    isChecked={formData.isPinned}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                    colorScheme="yellow"
                  >
                    <HStack spacing={2}>
                      <FiNavigation size={16} />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">Pin this sticker</Text>
                        <Text fontSize="xs" color={colors.text.muted}>
                          Pinned stickers stay at the top of your board
                        </Text>
                      </Box>
                    </HStack>
                  </Checkbox>

                  <Checkbox
                    isChecked={formData.isPrivate}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    colorScheme="purple"
                  >
                    <HStack spacing={2}>
                      <FiEyeOff size={16} />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">Private sticker</Text>
                        <Text fontSize="xs" color={colors.text.muted}>
                          Only you can see this sticker
                        </Text>
                      </Box>
                    </HStack>
                  </Checkbox>
                </Stack>
              </VStack>
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor={colors.border.default}>
          <HStack spacing={3} w="full">
            <Button
              variant="outline"
              onClick={onClose}
              flex={1}
              size="lg"
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isLoading}
              loadingText="Creating..."
              flex={2}
              size="lg"
              type="submit"
            >
              Create Sticker
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 