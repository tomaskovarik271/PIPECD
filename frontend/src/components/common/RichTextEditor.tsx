import React, { useCallback, useRef } from 'react';
import {
  Box,
  HStack,
  IconButton,
  Tooltip,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Text,
  Badge,
  Link as ChakraLink,
} from '@chakra-ui/react';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiLink,
  FiAtSign,
  FiPaperclip,
  FiMail,
  FiMoreHorizontal,
  FiType,
  FiAlignLeft,
} from 'react-icons/fi';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import TipTapLink from '@tiptap/extension-link';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import { useThemeColors } from '../../hooks/useThemeColors';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readonly?: boolean;
  onEmailToNote?: () => void;
  onAttachFile?: () => void;
  onMention?: (query: string) => void;
  className?: string;
  minHeight?: string;
  showToolbar?: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: 'file' | 'email';
  }>;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start typing...",
  readonly = false,
  onEmailToNote,
  onAttachFile,
  onMention,
  className = '',
  minHeight = '120px',
  showToolbar = true,
  attachments = [],
}) => {
  const colors = useThemeColors();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      TipTapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'rich-text-link',
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'rich-text-bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'rich-text-ordered-list',
        },
      }),
      ListItem,
      Mention.configure({
        HTMLAttributes: {
          class: 'rich-text-mention',
        },
        suggestion: {
          items: ({ query }) => {
            // This would be connected to your team members API
            const teamMembers = [
              { id: '1', name: 'John Doe', email: 'john@company.com' },
              { id: '2', name: 'Jane Smith', email: 'jane@company.com' },
              { id: '3', name: 'Mike Johnson', email: 'mike@company.com' },
            ];
            
            return teamMembers
              .filter(member => 
                member.name.toLowerCase().includes(query.toLowerCase()) ||
                member.email.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5);
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !readonly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor-content',
        style: `min-height: ${minHeight}; padding: 12px; border-radius: 8px; border: 1px solid ${colors.border.default}; background: ${colors.bg.app}; color: ${colors.text.primary}; outline: none;`,
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addMention = useCallback(() => {
    if (!editor) return;
    
    // Trigger mention suggestion
    editor.chain().focus().insertContent('@').run();
    
    if (onMention) {
      onMention('');
    }
  }, [editor, onMention]);

  const handleEmailToNote = useCallback(() => {
    if (onEmailToNote) {
      onEmailToNote();
    } else {
      toast({
        title: 'Email to Note',
        description: 'This feature will convert selected emails into notes.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [onEmailToNote, toast]);

  const handleAttachFile = useCallback(() => {
    if (onAttachFile) {
      onAttachFile();
    } else {
      fileInputRef.current?.click();
    }
  }, [onAttachFile]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      toast({
        title: 'File Attachment',
        description: `Selected ${files.length} file(s). Integration with Google Drive coming soon.`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  if (!editor) {
    return null;
  }

  return (
    <Box className={className}>
      {/* Toolbar */}
      {showToolbar && !readonly && (
        <Box
          bg={colors.bg.surface}
          border="1px solid"
          borderColor={colors.border.default}
          borderRadius="lg"
          p={2}
          mb={2}
        >
          <HStack spacing={1} wrap="wrap">
            {/* Text Formatting */}
            <HStack spacing={1}>
              <Tooltip label="Bold (Cmd+B)">
                <IconButton
                  aria-label="Bold"
                  icon={<FiBold />}
                  size="sm"
                  variant={editor.isActive('bold') ? 'solid' : 'ghost'}
                  colorScheme={editor.isActive('bold') ? 'blue' : 'gray'}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                />
              </Tooltip>
              
              <Tooltip label="Italic (Cmd+I)">
                <IconButton
                  aria-label="Italic"
                  icon={<FiItalic />}
                  size="sm"
                  variant={editor.isActive('italic') ? 'solid' : 'ghost'}
                  colorScheme={editor.isActive('italic') ? 'blue' : 'gray'}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                />
              </Tooltip>
              
              <Tooltip label="Underline (Cmd+U)">
                <IconButton
                  aria-label="Underline"
                  icon={<FiUnderline />}
                  size="sm"
                  variant={editor.isActive('underline') ? 'solid' : 'ghost'}
                  colorScheme={editor.isActive('underline') ? 'blue' : 'gray'}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                />
              </Tooltip>
            </HStack>

            <Divider orientation="vertical" height="24px" />

            {/* Lists */}
            <HStack spacing={1}>
              <Tooltip label="Bullet List">
                <IconButton
                  aria-label="Bullet List"
                  icon={<FiList />}
                  size="sm"
                  variant={editor.isActive('bulletList') ? 'solid' : 'ghost'}
                  colorScheme={editor.isActive('bulletList') ? 'blue' : 'gray'}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                />
              </Tooltip>
              
              <Tooltip label="Numbered List">
                <IconButton
                  aria-label="Numbered List"
                  icon={<FiAlignLeft />}
                  size="sm"
                  variant={editor.isActive('orderedList') ? 'solid' : 'ghost'}
                  colorScheme={editor.isActive('orderedList') ? 'blue' : 'gray'}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                />
              </Tooltip>
            </HStack>

            <Divider orientation="vertical" height="24px" />

            {/* Links and Mentions */}
            <HStack spacing={1}>
              <Tooltip label="Add Link">
                <IconButton
                  aria-label="Add Link"
                  icon={<FiLink />}
                  size="sm"
                  variant={editor.isActive('link') ? 'solid' : 'ghost'}
                  colorScheme={editor.isActive('link') ? 'blue' : 'gray'}
                  onClick={setLink}
                />
              </Tooltip>
              
              <Tooltip label="Mention Team Member">
                <IconButton
                  aria-label="Mention"
                  icon={<FiAtSign />}
                  size="sm"
                  variant="ghost"
                  onClick={addMention}
                />
              </Tooltip>
            </HStack>

            <Divider orientation="vertical" height="24px" />

            {/* Advanced Features */}
            <HStack spacing={1}>
              <Tooltip label="Convert Email to Note">
                <IconButton
                  aria-label="Email to Note"
                  icon={<FiMail />}
                  size="sm"
                  variant="ghost"
                  colorScheme="green"
                  onClick={handleEmailToNote}
                />
              </Tooltip>
              
              <Tooltip label="Attach File from Google Drive">
                <IconButton
                  aria-label="Attach File"
                  icon={<FiPaperclip />}
                  size="sm"
                  variant="ghost"
                  colorScheme="orange"
                  onClick={handleAttachFile}
                />
              </Tooltip>
            </HStack>

            {/* More Options */}
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="More options"
                icon={<FiMoreHorizontal />}
                size="sm"
                variant="ghost"
              />
              <MenuList>
                <MenuItem icon={<FiType />} onClick={() => editor.chain().focus().clearNodes().run()}>
                  Clear Formatting
                </MenuItem>
                <MenuItem 
                  icon={<FiMail />} 
                  onClick={handleEmailToNote}
                  isDisabled={!onEmailToNote}
                >
                  Convert Email to Note
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Box>
      )}

      {/* Attachments Display */}
      {attachments.length > 0 && (
        <Box mb={3}>
          <Text fontSize="sm" fontWeight="medium" color={colors.text.secondary} mb={2}>
            Attachments:
          </Text>
          <HStack spacing={2} wrap="wrap">
            {attachments.map((attachment) => (
              <Badge
                key={attachment.id}
                variant="subtle"
                colorScheme={attachment.type === 'email' ? 'blue' : 'green'}
                px={2}
                py={1}
                borderRadius="md"
              >
                <HStack spacing={1}>
                  {attachment.type === 'email' ? <FiMail size={12} /> : <FiPaperclip size={12} />}
                  <ChakraLink href={attachment.url} isExternal fontSize="xs">
                    {attachment.name}
                  </ChakraLink>
                </HStack>
              </Badge>
            ))}
          </HStack>
        </Box>
      )}

      {/* Editor Content */}
      <Box
        className="rich-text-editor-wrapper"
        sx={{
          '.rich-text-editor-content': {
            '&:focus': {
              borderColor: colors.interactive.default,
              boxShadow: `0 0 0 3px ${colors.interactive.default}20`,
            },
          },
          '.rich-text-link': {
            color: colors.interactive.default,
            textDecoration: 'underline',
            cursor: 'pointer',
            '&:hover': {
              color: colors.interactive.hover,
            },
          },
          '.rich-text-mention': {
            backgroundColor: colors.interactive.default + '20',
            color: colors.interactive.default,
            borderRadius: '4px',
            padding: '2px 4px',
            fontWeight: 'medium',
          },
          '.rich-text-bullet-list, .rich-text-ordered-list': {
            paddingLeft: '20px',
            margin: '8px 0',
          },
          'p': {
            margin: '4px 0',
            lineHeight: '1.6',
          },
          'ul, ol': {
            margin: '8px 0',
            paddingLeft: '20px',
          },
          'li': {
            margin: '2px 0',
          },
          '.ProseMirror-focused': {
            outline: 'none',
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Hidden file input for fallback file selection */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
      />
    </Box>
  );
}; 