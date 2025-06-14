import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Textarea,
  IconButton,
  Badge,
  Divider,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Flex,
  Avatar,
  Link,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiBookmark,
  FiMoreVertical,
  FiSend,
  FiX,
  FiNavigation,
  FiClock,
  FiUser,
  FiLink,
  FiImage,
} from 'react-icons/fi';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';
import { useSmartStickers } from '../../hooks/useSmartStickers';
import { formatDistanceToNow, format } from 'date-fns';

interface SimpleNotesProps {
  entityType: 'DEAL' | 'PERSON' | 'ORGANIZATION' | 'LEAD';
  entityId: string;
  readonly?: boolean;
  onNoteCountChange?: (count: number) => void;
  className?: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  mentions: string[];
  tags: string[];
}

export const SimpleNotes: React.FC<SimpleNotesProps> = ({
  entityType,
  entityId,
  readonly = false,
  onNoteCountChange,
  className = '',
}) => {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const toast = useToast();
  
  const { isOpen: isDeleteModalOpen, onOpen: openDeleteModal, onClose: closeDeleteModal } = useDisclosure();
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // Use Smart Stickers hook with notes-specific filtering
  const {
    stickers,
    loading,
    error,
    createSticker,
    updateSticker,
    deleteSticker,
    togglePin,
    refetch,
  } = useSmartStickers(entityType, entityId);

  // Transform stickers to notes (only show text-based stickers as notes)
  const notes: Note[] = (stickers || [])
    .filter(sticker => 
      // Only show stickers that are text-based (no category or "Notes" category)
      !sticker.category || sticker.category.name === 'Notes' || sticker.category.name === 'Meeting Notes'
    )
    .map(sticker => ({
      id: sticker.id,
      title: sticker.title,
      content: sticker.content || '',
      isPinned: sticker.isPinned,
      createdAt: sticker.createdAt,
      updatedAt: sticker.updatedAt,
      createdByUserId: sticker.createdByUserId,
      mentions: sticker.mentions,
      tags: sticker.tags,
    }))
    .sort((a, b) => {
      // Pinned notes first, then by creation date (newest first)
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Notify parent of note count changes
  useEffect(() => {
    if (onNoteCountChange) {
      onNoteCountChange(notes.length);
    }
  }, [notes.length, onNoteCountChange]);

  // Auto-focus textarea when adding note
  useEffect(() => {
    if (isAddingNote && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAddingNote]);

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    try {
      // Generate a smart title from the content
      const generateTitle = (content: string): string => {
        // Remove extra whitespace and get first line
        const firstLine = content.trim().split('\n')[0];
        
        // If first line is short enough, use it as title
        if (firstLine.length <= 50) {
          return firstLine;
        }
        
        // Otherwise, truncate at word boundary
        const words = firstLine.split(' ');
        let title = '';
        for (const word of words) {
          if ((title + ' ' + word).length > 47) break;
          title += (title ? ' ' : '') + word;
        }
        return title + '...';
      };

      await createSticker({
        entityType,
        entityId,
        title: generateTitle(newNoteContent),
        content: newNoteContent,
        categoryId: undefined, // No category for simple notes
        color: '#FFE066', // Default sticky note color
        priority: 'NORMAL',
        isPinned: false,
        isPrivate: false,
        positionX: 0,
        positionY: 0,
        width: 200,
        height: 150,
      });

      setNewNoteContent('');
      setIsAddingNote(false);
      
      toast({
        title: 'Note added',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to add note',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!editContent.trim()) return;

    try {
      // Generate a smart title from the content
      const generateTitle = (content: string): string => {
        // Remove extra whitespace and get first line
        const firstLine = content.trim().split('\n')[0];
        
        // If first line is short enough, use it as title
        if (firstLine.length <= 50) {
          return firstLine;
        }
        
        // Otherwise, truncate at word boundary
        const words = firstLine.split(' ');
        let title = '';
        for (const word of words) {
          if ((title + ' ' + word).length > 47) break;
          title += (title ? ' ' : '') + word;
        }
        return title + '...';
      };

      await updateSticker({
        id: noteId,
        title: generateTitle(editContent),
        content: editContent,
      });

      setEditingNoteId(null);
      setEditContent('');
      
      toast({
        title: 'Note updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to update note',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      await deleteSticker(noteToDelete);
      
      toast({
        title: 'Note deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to delete note',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setNoteToDelete(null);
      closeDeleteModal();
    }
  };

  const handlePinNote = async (noteId: string) => {
    try {
      await togglePin(noteId);
      
      toast({
        title: 'Note pin toggled',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to pin note',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const startEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  const confirmDelete = (noteId: string) => {
    setNoteToDelete(noteId);
    openDeleteModal();
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (action === 'add') {
        handleAddNote();
      } else if (editingNoteId) {
        handleEditNote(editingNoteId);
      }
    } else if (e.key === 'Escape') {
      if (action === 'add') {
        setIsAddingNote(false);
        setNewNoteContent('');
      } else {
        cancelEdit();
      }
    }
  };

  if (loading) {
    return (
      <Box className={className} p={4} textAlign="center">
        <Spinner size="md" color={colors.interactive.default} />
        <Text mt={2} color={colors.text.secondary} fontSize="sm">
          Loading notes...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={className} p={4}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          Failed to load notes. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className={className}>
      {/* Add Note Section */}
      {!readonly && (
        <Box mb={6}>
          {!isAddingNote ? (
            <Button
              leftIcon={<FiPlus />}
              variant="outline"
              size="md"
              onClick={() => setIsAddingNote(true)}
              w="full"
              justifyContent="flex-start"
              color={colors.text.secondary}
              borderColor={colors.border.default}
              borderStyle="dashed"
              borderWidth="2px"
              py={6}
              fontSize="md"
              fontWeight="medium"
              bg={colors.bg.surface}
              _hover={{
                borderColor: colors.interactive.default,
                color: colors.interactive.default,
                bg: colors.bg.elevated,
                transform: 'translateY(-1px)',
                boxShadow: 'md',
              }}
              transition="all 0.2s ease"
            >
              Add a note...
            </Button>
          ) : (
            <Box
              bg={colors.bg.surface}
              border="1px solid"
              borderColor={colors.interactive.default}
              borderRadius="xl"
              p={5}
              boxShadow="lg"
              position="relative"
            >
              <Textarea
                ref={textareaRef}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Write your note here... (Cmd+Enter to save, Esc to cancel)"
                resize="vertical"
                minH="120px"
                border="1px solid"
                borderColor={colors.border.default}
                borderRadius="lg"
                p={4}
                fontSize="sm"
                lineHeight="1.6"
                bg={colors.bg.app}
                _focus={{ 
                  boxShadow: `0 0 0 3px ${colors.interactive.default}20`,
                  borderColor: colors.interactive.default,
                  outline: 'none',
                }}
                _placeholder={{
                  color: colors.text.muted,
                  fontSize: 'sm',
                }}
                onKeyDown={(e) => handleKeyDown(e, 'add')}
              />
              <HStack mt={4} justify="space-between" align="center">
                <HStack spacing={1}>
                  <Tooltip label="Add link (Coming soon)" placement="top">
                    <IconButton
                      aria-label="Add link"
                      icon={<FiLink />}
                      size="sm"
                      variant="ghost"
                      color={colors.text.muted}
                      borderRadius="md"
                      isDisabled
                      _hover={{
                        bg: colors.bg.elevated,
                        color: colors.interactive.default,
                      }}
                    />
                  </Tooltip>
                  <Tooltip label="Add image (Coming soon)" placement="top">
                    <IconButton
                      aria-label="Add image"
                      icon={<FiImage />}
                      size="sm"
                      variant="ghost"
                      color={colors.text.muted}
                      borderRadius="md"
                      isDisabled
                      _hover={{
                        bg: colors.bg.elevated,
                        color: colors.interactive.default,
                      }}
                    />
                  </Tooltip>
                </HStack>
                <HStack spacing={3}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingNote(false);
                      setNewNoteContent('');
                    }}
                    borderRadius="lg"
                    px={4}
                    _hover={{
                      bg: colors.bg.elevated,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    leftIcon={<FiSend />}
                    onClick={handleAddNote}
                    isDisabled={!newNoteContent.trim()}
                    borderRadius="lg"
                    px={4}
                    fontWeight="medium"
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: 'md',
                    }}
                    transition="all 0.2s ease"
                  >
                    Save Note
                  </Button>
                </HStack>
              </HStack>
            </Box>
          )}
        </Box>
      )}

      {/* Notes List */}
      <VStack spacing={3} align="stretch">
        {notes.length === 0 ? (
          <Box
            textAlign="center"
            py={12}
            px={6}
            bg={colors.bg.surface}
            borderRadius="xl"
            border="1px solid"
            borderColor={colors.border.default}
            color={colors.text.secondary}
          >
            <Box
              bg={colors.bg.elevated}
              borderRadius="full"
              p={4}
              display="inline-flex"
              mb={4}
            >
              <FiEdit3 size={24} />
            </Box>
            <Text fontSize="lg" fontWeight="semibold" mb={2} color={colors.text.primary}>
              No notes yet
            </Text>
            <Text fontSize="sm" maxW="300px" mx="auto" lineHeight="1.5">
              {readonly 
                ? "No notes have been added to this record."
                : "Add your first note to keep track of important information and follow-ups."
              }
            </Text>
          </Box>
        ) : (
          notes.map((note) => (
            <Box
              key={note.id}
              bg={colors.bg.surface}
              border="1px solid"
              borderColor={colors.border.default}
              borderRadius="xl"
              p={5}
              position="relative"
              boxShadow="sm"
              _hover={{
                borderColor: colors.border.accent,
                boxShadow: 'md',
                transform: 'translateY(-1px)',
              }}
              transition="all 0.2s ease"
            >
              {/* Pin indicator */}
              {note.isPinned && (
                <Box
                  position="absolute"
                  top={3}
                  right={3}
                  bg="yellow.100"
                  color="yellow.600"
                  borderRadius="full"
                  p={1.5}
                  boxShadow="sm"
                >
                  <FiBookmark size={12} />
                </Box>
              )}

              {/* Note content */}
              {editingNoteId === note.id ? (
                <Box>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    resize="vertical"
                    minH="60px"
                    onKeyDown={(e) => handleKeyDown(e, 'edit')}
                  />
                  <HStack mt={3} justify="flex-end" spacing={2}>
                    <Button size="sm" variant="ghost" onClick={cancelEdit}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleEditNote(note.id)}
                      isDisabled={!editContent.trim()}
                    >
                      Save
                    </Button>
                  </HStack>
                </Box>
              ) : (
                <Box>
                  <Text
                    color={colors.text.primary}
                    fontSize="sm"
                    lineHeight="1.6"
                    whiteSpace="pre-wrap"
                    mb={4}
                    fontWeight="400"
                  >
                    {note.content}
                  </Text>

                  {/* Note metadata */}
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3} fontSize="xs" color={colors.text.muted}>
                      <HStack spacing={1.5}>
                        <FiClock size={12} />
                        <Text fontWeight="medium">
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </Text>
                      </HStack>
                      {note.updatedAt !== note.createdAt && (
                        <Badge 
                          variant="subtle" 
                          colorScheme="blue" 
                          fontSize="xs"
                          borderRadius="full"
                          px={2}
                        >
                          edited
                        </Badge>
                      )}
                    </HStack>

                    {/* Actions menu */}
                    {!readonly && (
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Note actions"
                          icon={<FiMoreVertical />}
                          size="sm"
                          variant="ghost"
                          color={colors.text.muted}
                          borderRadius="md"
                          _hover={{ 
                            color: colors.text.primary,
                            bg: colors.bg.elevated,
                          }}
                        />
                        <MenuList>
                          <MenuItem
                            icon={<FiEdit3 />}
                            onClick={() => startEdit(note)}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            icon={<FiBookmark />}
                            onClick={() => handlePinNote(note.id)}
                          >
                            {note.isPinned ? 'Unpin' : 'Pin'}
                          </MenuItem>
                          <Divider />
                          <MenuItem
                            icon={<FiTrash2 />}
                            color="red.500"
                            onClick={() => confirmDelete(note.id)}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    )}
                  </Flex>
                </Box>
              )}
            </Box>
          ))
        )}
      </VStack>

      {/* Delete confirmation modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Note</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this note? This action cannot be undone.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteNote}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};