import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Badge,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
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
  Select,
  Textarea,
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
  FiMail,
  FiPaperclip,
  FiFileText,
} from 'react-icons/fi';
import DOMPurify from 'dompurify';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';
import { useSmartStickers } from '../../hooks/useSmartStickers';
import { useNoteAttachments } from '../../hooks/useNoteAttachments';
import { formatDistanceToNow, format } from 'date-fns';
import { RichTextEditor } from './RichTextEditor';
import { DocumentAttachmentModal } from './DocumentAttachmentModal';


interface EnhancedSimpleNotesProps {
  entityType: 'DEAL' | 'PERSON' | 'ORGANIZATION' | 'LEAD';
  entityId: string;
  dealId?: string; // Required for document attachment to deals
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
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: 'file' | 'email';
  }>;
}

interface NoteTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
}

const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'meeting',
    name: 'Meeting Notes',
    content: `<h3>Meeting Notes</h3>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Attendees:</strong> </p>
<p><strong>Agenda:</strong></p>
<ul>
  <li></li>
</ul>
<p><strong>Key Discussion Points:</strong></p>
<ul>
  <li></li>
</ul>
<p><strong>Action Items:</strong></p>
<ul>
  <li></li>
</ul>
<p><strong>Next Steps:</strong></p>
<ul>
  <li></li>
</ul>`,
    category: 'Meeting',
  },
  {
    id: 'call',
    name: 'Call Summary',
    content: `<h3>Call Summary</h3>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Duration:</strong> </p>
<p><strong>Participants:</strong> </p>
<p><strong>Purpose:</strong> </p>
<p><strong>Key Points Discussed:</strong></p>
<ul>
  <li></li>
</ul>
<p><strong>Outcomes:</strong></p>
<ul>
  <li></li>
</ul>
<p><strong>Follow-up Required:</strong></p>
<ul>
  <li></li>
</ul>`,
    category: 'Communication',
  },
  {
    id: 'proposal',
    name: 'Proposal Notes',
    content: `<h3>Proposal Discussion</h3>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Proposal Title:</strong> </p>
<p><strong>Client Requirements:</strong></p>
<ul>
  <li></li>
</ul>
<p><strong>Our Solution:</strong></p>
<ul>
  <li></li>
</ul>
<p><strong>Pricing Discussion:</strong></p>
<p><strong>Timeline:</strong></p>
<p><strong>Next Steps:</strong></p>
<ul>
  <li></li>
</ul>`,
    category: 'Sales',
  },
  {
    id: 'followup',
    name: 'Follow-up Notes',
    content: `<h3>Follow-up Notes</h3>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Previous Contact:</strong> </p>
<p><strong>Purpose of Follow-up:</strong> </p>
<p><strong>Client Response:</strong></p>
<p><strong>Current Status:</strong></p>
<p><strong>Concerns/Objections:</strong></p>
<p><strong>Next Actions:</strong></p>
<ul>
  <li></li>
</ul>
<p><strong>Follow-up Date:</strong> </p>`,
    category: 'Follow-up',
  },
];

// Secure HTML sanitization configuration
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'a', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    FORCE_BODY: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false
  });
};

export const EnhancedSimpleNotes: React.FC<EnhancedSimpleNotesProps> = ({
  entityType,
  entityId,
  dealId,
  readonly = false,
  onNoteCountChange,
  className = '',
}) => {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const toast = useToast();
  
  const { isOpen: isDeleteModalOpen, onOpen: openDeleteModal, onClose: closeDeleteModal } = useDisclosure();
  const { isOpen: isTemplateModalOpen, onOpen: openTemplateModal, onClose: closeTemplateModal } = useDisclosure();
  const { isOpen: isAttachModalOpen, onOpen: openAttachModal, onClose: closeAttachModal } = useDisclosure();
  
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [attachingToNoteId, setAttachingToNoteId] = useState<string | null>(null);

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

  // Get filtered stickers first
  const filteredStickers = (stickers || [])
    .filter(sticker => 
      // Only show stickers that are text-based (no category or "Notes" category)
      !sticker.category || sticker.category.name === 'Notes' || sticker.category.name === 'Meeting Notes'
    );

  // Fetch attachments for all notes
  const noteIds = filteredStickers.map(sticker => sticker.id);
  const { attachmentsData, loading: attachmentsLoading, error: attachmentsError, refetchAttachments } = useNoteAttachments(noteIds);

  // Transform stickers to notes with attachments
  const notes: Note[] = filteredStickers
    .map(sticker => {
      const noteAttachments = attachmentsData?.[sticker.id] || [];
      return {
        id: sticker.id,
        title: sticker.title,
        content: sticker.content || '',
        isPinned: sticker.isPinned,
        createdAt: sticker.createdAt,
        updatedAt: sticker.updatedAt,
        createdByUserId: sticker.createdByUserId,
        mentions: sticker.mentions,
        tags: sticker.tags,
        attachments: noteAttachments.map((attachment: any) => ({
          id: attachment.id,
          name: attachment.fileName,
          url: attachment.fileUrl,
          type: 'file' as const,
        })),
      };
    })
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

  const generateTitle = (content: string): string => {
    // Remove HTML tags and get first line
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    const firstLine = textContent.split('\n')[0];
    
    // If first line is short enough, use it as title
    if (firstLine.length <= 50) {
      return firstLine || 'Untitled Note';
    }
    
    // Otherwise, truncate at word boundary
    const words = firstLine.split(' ');
    let title = '';
    for (const word of words) {
      if ((title + ' ' + word).length > 47) break;
      title += (title ? ' ' : '') + word;
    }
    return (title || 'Untitled Note') + '...';
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    try {
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

  const handleTemplateSelect = () => {
    if (selectedTemplate) {
      setNewNoteContent(selectedTemplate);
      setSelectedTemplate('');
      closeTemplateModal();
      setIsAddingNote(true);
    }
  };

  const handleAttachFile = () => {
    if (!dealId) {
      toast({
        title: 'Document Attachment',
        description: 'Document attachment is only available for deal notes.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    openAttachModal();
  };

  const handleAttachFileToNote = (noteId: string) => {
    if (!dealId) {
      toast({
        title: 'Document Attachment',
        description: 'Document attachment is only available for deal notes.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setAttachingToNoteId(noteId);
    openAttachModal();
  };

  const handleMention = (query: string) => {
    toast({
      title: 'Team Mentions',
      description: 'Team member mentions coming soon!',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
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
            <VStack spacing={3}>
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
              
              <HStack spacing={3} mb={4}>
                <Button
                  leftIcon={<FiFileText />}
                  size="sm"
                  variant="ghost"
                  onClick={openTemplateModal}
                  flex={1}
                >
                  Use Template
                </Button>
              </HStack>
            </VStack>
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
              <RichTextEditor
                content={newNoteContent}
                onChange={setNewNoteContent}
                placeholder="Write your note here... Rich text formatting, links, and lists are supported!"
                onAttachFile={handleAttachFile}
                onMention={handleMention}
                minHeight="150px"
              />
              
              <HStack mt={4} justify="space-between" align="center">
                <Text fontSize="xs" color={colors.text.muted}>
                  💡 Use the toolbar for formatting, or press Cmd+Enter to save
                </Text>
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
                : "Add your first note with rich text formatting, templates, or convert emails to notes."
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
                  <RichTextEditor
                    content={editContent}
                    onChange={setEditContent}
                    placeholder="Edit your note..."
                    onAttachFile={handleAttachFile}
                    onMention={handleMention}
                    minHeight="100px"
                    attachments={note.attachments}
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
                  <Box
                    color={colors.text.primary}
                    fontSize="sm"
                    lineHeight="1.6"
                    mb={4}
                    fontWeight="400"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(note.content) }}
                    sx={{
                      'h1, h2, h3, h4, h5, h6': {
                        fontWeight: 'bold',
                        marginBottom: '8px',
                      },
                      'h3': {
                        fontSize: 'md',
                      },
                      'p': {
                        marginBottom: '8px',
                      },
                      'ul, ol': {
                        paddingLeft: '20px',
                        marginBottom: '8px',
                      },
                      'li': {
                        marginBottom: '4px',
                      },
                      'strong': {
                        fontWeight: 'bold',
                      },
                      'em': {
                        fontStyle: 'italic',
                      },
                      'a': {
                        color: colors.interactive.default,
                        textDecoration: 'underline',
                      },
                    }}
                  />

                  {/* Attachments */}
                  {note.attachments && note.attachments.length > 0 && (
                    <Box mb={4}>
                      <Text fontSize="xs" fontWeight="medium" color={colors.text.secondary} mb={2}>
                        Attachments:
                      </Text>
                      <HStack spacing={2} wrap="wrap">
                        {note.attachments.map((attachment) => (
                          <Badge
                            key={attachment.id}
                            variant="subtle"
                            colorScheme={attachment.type === 'email' ? 'blue' : 'green'}
                            px={2}
                            py={1}
                            borderRadius="md"
                            fontSize="xs"
                          >
                            <HStack spacing={1}>
                              {attachment.type === 'email' ? <FiMail size={10} /> : <FiPaperclip size={10} />}
                              <Text>{attachment.name}</Text>
                            </HStack>
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  )}

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

                    {/* Quick Actions */}
                    {!readonly && (
                      <HStack spacing={1}>
                        <Tooltip label="Edit note">
                          <IconButton
                            aria-label="Edit note"
                            icon={<FiEdit3 />}
                            size="sm"
                            variant="ghost"
                            color={colors.text.muted}
                            borderRadius="md"
                            _hover={{ 
                              color: colors.interactive.default,
                              bg: colors.bg.elevated,
                            }}
                            onClick={() => startEdit(note)}
                          />
                        </Tooltip>
                        
                        <Tooltip label={note.isPinned ? "Unpin note" : "Pin note"}>
                          <IconButton
                            aria-label={note.isPinned ? "Unpin note" : "Pin note"}
                            icon={<FiBookmark />}
                            size="sm"
                            variant="ghost"
                            color={note.isPinned ? "yellow.500" : colors.text.muted}
                            borderRadius="md"
                            _hover={{ 
                              color: note.isPinned ? "yellow.600" : "yellow.500",
                              bg: colors.bg.elevated,
                            }}
                            onClick={() => handlePinNote(note.id)}
                          />
                        </Tooltip>
                        
                        <Tooltip label="Attach file">
                          <IconButton
                            aria-label="Attach file"
                            icon={<FiPaperclip />}
                            size="sm"
                            variant="ghost"
                            color={colors.text.muted}
                            borderRadius="md"
                            _hover={{ 
                              color: colors.interactive.default,
                              bg: colors.bg.elevated,
                            }}
                            onClick={() => handleAttachFileToNote(note.id)}
                          />
                        </Tooltip>
                        
                        <Tooltip label="Delete note">
                          <IconButton
                            aria-label="Delete note"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            color={colors.text.muted}
                            borderRadius="md"
                            _hover={{ 
                              color: "red.500",
                              bg: colors.bg.elevated,
                            }}
                            onClick={() => confirmDelete(note.id)}
                          />
                        </Tooltip>
                      </HStack>
                    )}
                  </Flex>
                </Box>
              )}
            </Box>
          ))
        )}
      </VStack>

      {/* Template Selection Modal */}
      <Modal isOpen={isTemplateModalOpen} onClose={closeTemplateModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Choose Note Template</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <Text fontSize="sm" color={colors.text.secondary}>
                Select a template to get started with structured note-taking:
              </Text>
              <Select
                placeholder="Select a template..."
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                {NOTE_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.category}
                  </option>
                ))}
              </Select>
              {selectedTemplate && (
                <Box
                  p={3}
                  bg={colors.bg.surface}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={colors.border.default}
                >
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Preview:
                  </Text>
                  <Box
                    fontSize="xs"
                    color={colors.text.secondary}
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeHtml(NOTE_TEMPLATES.find(t => t.id === selectedTemplate)?.content || '')
                    }}
                    sx={{
                      'h3': { fontSize: 'sm', fontWeight: 'bold', mb: 1 },
                      'p': { mb: 1 },
                      'ul': { pl: 4, mb: 1 },
                    }}
                  />
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeTemplateModal}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleTemplateSelect}
              isDisabled={!selectedTemplate}
            >
              Use Template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Document Attachment Modal */}
      {dealId && attachingToNoteId && (
        <DocumentAttachmentModal
          isOpen={isAttachModalOpen}
          onClose={() => {
            closeAttachModal();
            setAttachingToNoteId(null);
          }}
          noteId={attachingToNoteId}
          dealId={dealId}
          onAttachmentAdded={() => {
            // Refresh notes and attachments to show new attachments
            refetch();
            refetchAttachments();
          }}
        />
      )}

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