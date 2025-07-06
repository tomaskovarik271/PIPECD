import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  Grid,
  GridItem,
  Card,
  CardBody,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  Tooltip,
  Collapse,
  RadioGroup,
  Radio,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiFilter, 
  FiMail, 
  FiMoreVertical, 
  FiArchive, 
  FiStar, 
  FiPaperclip, 
  FiClock, 
  FiUser, 
  FiPhone, 
  FiCalendar, 
  FiFileText, 
  FiPlus, 
  FiX, 
  FiChevronDown, 
  FiChevronUp,
  FiZap,
  FiEdit,
  FiExternalLink
} from 'react-icons/fi';
import { FaTasks, FaUserPlus, FaMapPin } from 'react-icons/fa';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useThemeStore } from '../../stores/useThemeStore';
import EmailContactFilter from './EmailContactFilter';
import CreateContactFromEmailModal from './CreateContactFromEmailModal';
import { SmartEmailButton } from '../common/SmartEmailComposer';
// Task creation modal removed with activities system

// GraphQL Queries and Mutations
const GET_EMAIL_THREADS = gql`
  query GetEmailThreads($filter: EmailThreadsFilterInput!) {
    getEmailThreads(filter: $filter) {
      threads {
        id
        subject
        participants
        messageCount
        isUnread
        lastActivity
        latestMessage {
          id
          from
          body
          timestamp
          hasAttachments
        }
      }
      totalCount
      hasNextPage
      nextPageToken
    }
  }
`;

const GET_EMAIL_THREAD = gql`
  query GetEmailThread($threadId: String!) {
    getEmailThread(threadId: $threadId) {
      id
      subject
      participants
      messageCount
      isUnread
      lastActivity
      latestMessage {
        id
        threadId
        subject
        from
        to
        cc
        bcc
        body
        htmlBody
        timestamp
        isUnread
        hasAttachments
        attachments {
          id
          filename
          mimeType
          size
        }
        importance
      }
    }
  }
`;

const GET_EMAIL_ANALYTICS = gql`
  query GetEmailAnalytics($dealId: String!) {
    getEmailAnalytics(dealId: $dealId) {
      totalThreads
      unreadCount
      avgResponseTime
      lastContactTime
      emailSentiment
      responseRate
    }
  }
`;

const COMPOSE_EMAIL = gql`
  mutation ComposeEmail($input: ComposeEmailInput!) {
    composeEmail(input: $input) {
      id
      subject
      from
      to
      timestamp
    }
  }
`;

// Task creation functionality removed with activities system
// Using Google Calendar integration instead

const MARK_THREAD_AS_READ = gql`
  mutation MarkThreadAsRead($threadId: String!) {
    markThreadAsRead(threadId: $threadId)
  }
`;

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

const PIN_EMAIL = gql`
  mutation PinEmail($input: PinEmailInput!) {
    pinEmail(input: $input) {
      id
      emailId
      threadId
      subject
      fromEmail
      pinnedAt
      notes
    }
  }
`;

const GET_PINNED_EMAILS = gql`
  query GetPinnedEmailsForDeal($dealId: ID!) {
    getPinnedEmails(dealId: $dealId) {
      id
      emailId
      threadId
      subject
      fromEmail
      pinnedAt
      notes
    }
  }
`;

interface DealEmailsPanelProps {
  dealId: string;
  primaryContactEmail?: string;
  dealName: string;
  refreshTrigger?: number; // Increment this to trigger a refresh
}

interface EmailFilter {
  search: string;
  isUnread: boolean | null;
  hasAttachments: boolean | null;
  dateRange: string;
  selectedContacts: string[];
  contactScope: 'PRIMARY' | 'ALL' | 'CUSTOM' | 'SELECTED_ROLES';
  includeAllParticipants: boolean;
  showPinnedOnly: boolean;
}

interface EmailMessage {
  id: string;
  subject: string;
  body: string;
  from: string;
  to: string[];
  cc?: string[];
  timestamp: string;
  isRead: boolean;
  threadId: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    size: number;
    mimeType: string;
    downloadUrl?: string;
  }>;
}

interface EmailComposeData {
  to: string[];
  cc: string[];
  subject: string;
  body: string;
}

interface EmailTaskData {
  subject: string;
  description: string;
  dueDate: string;
  assigneeId?: string;
  threadId?: string | null;
  useWholeThread?: boolean;
}

interface EmailThread {
  id: string;
  subject: string;
  participants: string[];
  messageCount: number;
  lastMessageDate: string;
  isUnread: boolean;
  hasAttachments: boolean;
  latestMessage: EmailMessage;
}

interface EmailPin {
  id: string;
  emailId: string;
  threadId: string;
  userId: string;
  createdAt: string;
}

interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

// Compose Email Modal Component
const ComposeEmailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: EmailComposeData) => void;
  defaultTo?: string;
  defaultSubject?: string;
}> = ({ isOpen, onClose, onSend, defaultTo, defaultSubject }) => {
  const [formData, setFormData] = useState({
    to: defaultTo || '',
    cc: '',
    subject: defaultSubject || '',
    body: '',
  });

  const handleSend = () => {
    onSend({
      to: formData.to.split(',').map(email => email.trim()),
      cc: formData.cc ? formData.cc.split(',').map(email => email.trim()) : [],
      subject: formData.subject,
      body: formData.body,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Compose Email</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>To</FormLabel>
              <Input
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                placeholder="recipient@example.com"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>CC</FormLabel>
              <Input
                value={formData.cc}
                onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                placeholder="cc@example.com (optional)"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Subject</FormLabel>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Email subject"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Message</FormLabel>
              <Textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Type your message here..."
                rows={8}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSend}>
            Send Email
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Convert to Note Modal Component
const EmailToNoteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  emailMessage: EmailMessage;
  dealId: string;
}> = ({ isOpen, onClose, emailMessage, dealId }) => {
  const [noteContent, setNoteContent] = useState('');

  const handleConvert = () => {
    // Logic to convert email to note
    setNoteContent(emailMessage.body);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Convert Email to Note</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Note Content</FormLabel>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Type your note content here..."
                rows={8}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleConvert}>
            Convert to Note
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const DealEmailsPanel: React.FC<DealEmailsPanelProps> = ({
  dealId,
  primaryContactEmail,
  dealName,
  refreshTrigger,
}) => {
  const colors = useThemeColors();
  const currentThemeName = useThemeStore((state) => state.currentTheme);
  const toast = useToast();

  // Helper function for theme-specific accent colors
  const getAccentColor = () => {
    switch (currentThemeName) {
      case 'industrialMetal':
        return 'rgba(255, 170, 0, 0.6)'; // Hazard yellow for industrial only
      case 'lightModern':
        return '#6366f1'; // Indigo for light modern
      default:
        return '#667eea'; // Blue for modern dark
    }
  };

  // Helper function for stronger accent colors
  const getStrongAccentColor = () => {
    switch (currentThemeName) {
      case 'industrialMetal':
        return 'rgba(255, 170, 0, 0.8)'; // Stronger hazard yellow for industrial only
      case 'lightModern':
        return 'rgba(99, 102, 241, 0.8)'; // Stronger indigo for light modern
      default:
        return 'rgba(102, 126, 234, 0.8)'; // Stronger blue for modern dark
    }
  };

  // State
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filter, setFilter] = useState<EmailFilter>({
    search: '',
    isUnread: null,
    hasAttachments: null,
    dateRange: 'all',
    selectedContacts: primaryContactEmail ? [primaryContactEmail] : [],
    contactScope: 'ALL',
    includeAllParticipants: false,
    showPinnedOnly: false,
  });
  // Compose modal state removed - now using unified SmartEmailComposer
  // Task modal state removed with activities system
  // const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  // const [selectedEmailForTask, setSelectedEmailForTask] = useState<string | null>(null);
  const [isConvertToNoteModalOpen, setIsConvertToNoteModalOpen] = useState(false);
  const [selectedEmailForNote, setSelectedEmailForNote] = useState<EmailMessage | null>(null);
  const [isCreateContactModalOpen, setIsCreateContactModalOpen] = useState(false);
  const [selectedEmailForContact, setSelectedEmailForContact] = useState<EmailMessage | null>(null);
  const [emailData, setEmailData] = useState<EmailMessage | null>(null);
  const [selectedContactsForFilter, setSelectedContactsForFilter] = useState<string[]>([]);
  const [emailScopeFilter, setEmailScopeFilter] = useState<'PRIMARY' | 'ALL' | 'CUSTOM' | 'SELECTED_ROLES'>('PRIMARY');

  // Update filter when primaryContactEmail changes
  useEffect(() => {
    if (primaryContactEmail && filter.contactScope === 'PRIMARY') {
      setFilter(prev => ({
        ...prev,
        selectedContacts: [primaryContactEmail],
      }));
    }
  }, [primaryContactEmail, filter.contactScope]);

  // Build enhanced filter for GraphQL query
  const buildEmailThreadsFilter = () => {
    const baseFilter = {
      dealId,
      keywords: filter.search ? [filter.search] : undefined,
      isUnread: filter.isUnread,
      hasAttachments: filter.hasAttachments,
      limit: 50,
    };

    // Enhanced multi-contact filtering
    switch (filter.contactScope) {
      case 'PRIMARY':
        return {
          ...baseFilter,
          contactEmail: primaryContactEmail,
        };
      case 'ALL':
        return {
          ...baseFilter,
          includeAllParticipants: true,
        };
      case 'CUSTOM':
      case 'SELECTED_ROLES':
        return {
          ...baseFilter,
          selectedContacts: filter.selectedContacts,
        };
      default:
        return {
          ...baseFilter,
          contactEmail: primaryContactEmail,
        };
    }
  };

  // GraphQL Hooks
  const { data: threadsData, loading: threadsLoading, error: threadsError, refetch: refetchThreads } = useQuery(GET_EMAIL_THREADS, {
    variables: { filter: buildEmailThreadsFilter() },
    skip: filter.contactScope === 'PRIMARY' && !primaryContactEmail, // Only skip for PRIMARY scope without contact
    fetchPolicy: 'cache-and-network',
  });

  const { data: threadData, loading: threadLoading } = useQuery(GET_EMAIL_THREAD, {
    variables: { threadId: selectedThreadId },
    skip: !selectedThreadId,
    fetchPolicy: 'cache-and-network',
  });

  const { data: analyticsData } = useQuery(GET_EMAIL_ANALYTICS, {
    variables: { dealId },
    fetchPolicy: 'cache-and-network',
  });

  const { data: pinnedEmailsData, refetch: refetchPinnedEmails } = useQuery(GET_PINNED_EMAILS, {
    variables: { dealId },
    fetchPolicy: 'cache-and-network',
  });

  const [composeEmail] = useMutation(COMPOSE_EMAIL, {
    onCompleted: () => {
      toast({
        title: 'Email sent successfully',
        status: 'success',
        duration: 3000,
      });
      refetchThreads();
    },
    onError: (error) => {
      toast({
        title: 'Failed to send email',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Task creation removed with activities system
  // Using Google Calendar integration instead

  const [markThreadAsRead] = useMutation(MARK_THREAD_AS_READ);

  const [pinEmail] = useMutation(PIN_EMAIL, {
    onCompleted: () => {
      toast({
        title: 'Email Pinned',
        description: 'Email has been pinned to this deal.',
        status: 'success',
        duration: 3000,
      });
      refetchPinnedEmails(); // Refresh pinned emails to update UI
    },
    onError: (error) => {
      toast({
        title: 'Failed to Pin Email',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const [unpinEmail] = useMutation(gql`
    mutation UnpinEmail($id: ID!) {
      unpinEmail(id: $id)
    }
  `, {
    onCompleted: () => {
      toast({
        title: 'Email Unpinned',
        description: 'Email has been removed from pinned emails.',
        status: 'success',
        duration: 3000,
      });
      refetchPinnedEmails(); // Refresh pinned emails to update UI
    },
    onError: (error) => {
      toast({
        title: 'Failed to Unpin Email',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Refresh email data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      refetchThreads();
    }
  }, [refreshTrigger, refetchThreads]);

  // Handlers
  const handleThreadSelect = (threadId: string) => {
    setSelectedThreadId(threadId);
    // Mark as read when opened
    markThreadAsRead({ variables: { threadId } });
  };

  const handleComposeEmail = (emailData: EmailComposeData) => {
    composeEmail({
      variables: {
        input: {
          to: emailData.to,
          cc: emailData.cc,
          subject: emailData.subject,
          body: emailData.body,
          dealId,
        },
      },
    });
  };

  // Task creation removed with activities system
  // Using Google Calendar integration instead
  const handleCreateTask = (taskData: EmailTaskData) => {
    // Task creation functionality removed
    toast({
      title: 'Task Creation Disabled',
      description: 'Task creation has been replaced with Google Calendar integration.',
      status: 'info',
      duration: 3000,
    });
  };

  const handleConvertToNote = (emailMessage: EmailMessage) => {
    setSelectedEmailForNote(emailMessage);
    setIsConvertToNoteModalOpen(true);
  };

  const handleCreateContact = (emailMessage: EmailMessage) => {
    setSelectedEmailForContact(emailMessage);
    setIsCreateContactModalOpen(true);
  };

  const handlePinEmail = (emailMessage: EmailMessage) => {
    pinEmail({
      variables: {
        input: {
          dealId: dealId,
          emailId: emailMessage.id,
          threadId: emailMessage.threadId,
          subject: emailMessage.subject,
          fromEmail: emailMessage.from,
          notes: `Pinned from deal: ${dealName}`,
        },
      },
    });
  };

  const handleUnpinEmail = (emailId: string) => {
    unpinEmail({
      variables: {
        id: emailId,
      },
    });
  };

  // Helper function to get pin ID for unpinning
  const getPinId = (emailId: string, threadId: string) => {
    if (!pinnedEmailsData?.getPinnedEmails) return null;
    const pin = pinnedEmailsData.getPinnedEmails.find((pin: EmailPin) => 
      pin.emailId === emailId || pin.threadId === threadId
    );
    return pin?.id || null;
  };

  const handlePinToggle = (emailMessage: EmailMessage) => {
    const isPinned = isEmailPinned(emailMessage.id, emailMessage.threadId);
    
    if (isPinned) {
      // Unpin the email
      const pinId = getPinId(emailMessage.id, emailMessage.threadId);
      if (pinId) {
        unpinEmail({
          variables: { id: pinId },
        });
      }
    } else {
      // Pin the email
      pinEmail({
        variables: {
          input: {
            dealId: dealId,
            emailId: emailMessage.id,
            threadId: emailMessage.threadId,
            subject: emailMessage.subject,
            fromEmail: emailMessage.from,
            notes: `Pinned from deal: ${dealName}`,
          },
        },
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Enhanced handlers for contact filtering
  const handleContactsChange = (contacts: string[]) => {
    setFilter(prev => ({
      ...prev,
      selectedContacts: contacts,
    }));
  };

  const handleScopeChange = (scope: 'PRIMARY' | 'ALL' | 'CUSTOM' | 'SELECTED_ROLES') => {
    setFilter(prev => ({ ...prev, contactScope: scope }));
  };

  // Helper function to check if an email/thread is pinned
  const isEmailPinned = (emailId: string, threadId: string) => {
    if (!pinnedEmailsData?.getPinnedEmails) return false;
    return pinnedEmailsData.getPinnedEmails.some((pin: EmailPin) => 
      pin.emailId === emailId || pin.threadId === threadId
    );
  };

  // Show enhanced filtering UI if not using primary contact only
  const shouldShowContactFilter = filter.contactScope !== 'PRIMARY' || !primaryContactEmail;

  // Don't block access when no primary contact - just show a helpful alert
  const showNoPrimaryContactMessage = !primaryContactEmail && filter.contactScope === 'PRIMARY';

  // Auto-open filters when there's no primary contact to guide user
  useEffect(() => {
    if (!primaryContactEmail && !showAdvancedFilters) {
      setShowAdvancedFilters(true);
    }
  }, [primaryContactEmail, showAdvancedFilters]);

  return (
    <Box 
      h="600px" 
      bg={colors.component.kanban.column} 
      borderRadius="xl" 
      overflow="hidden"
      borderWidth="1px"
      borderColor={colors.component.kanban.cardBorder}
      boxShadow="steelPlate"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: currentThemeName === 'industrialMetal' 
          ? `linear-gradient(90deg, transparent 0%, ${currentThemeName === 'industrialMetal' ? 'rgba(255, 170, 0, 0.8)' : 'transparent'} 50%, transparent 100%)`
          : 'transparent', // No accent for modern themes
        pointerEvents: 'none',
      }}
    >
      <Grid templateColumns="1fr 2fr" h="full">
        {/* Left Panel - Thread List */}
        <GridItem 
          borderRightWidth="1px" 
          borderColor={colors.border.default} 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0 // Important for flex children to shrink
          }}
        >
          {/* Header with Analytics */}
          <Box 
            p={4} 
            borderBottomWidth="1px" 
            borderColor={colors.component.kanban.cardBorder} 
            w="full"
            sx={{ flexShrink: 0 }}
            maxH="400px" // Prevent header from taking too much space
            overflowY="auto" // Allow header to scroll if needed
            bg={colors.component.kanban.card}
            position="relative"
            _after={{
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '0',
              right: '0',
              height: '1px',
              background: `linear-gradient(90deg, transparent 0%, ${currentThemeName === 'industrialMetal' ? 'rgba(255, 170, 0, 0.8)' : 'transparent'} 50%, transparent 100%)`,
            }}
          >
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="bold" color={colors.text.primary}>
                  Email Conversations
                </Text>
                <HStack spacing={2}>
                  <IconButton
                    size="sm"
                    icon={<FiFilter />}
                    aria-label="Advanced filters"
                    variant="ghost"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    bg={showAdvancedFilters ? colors.interactive.active : 'transparent'}
                    color={showAdvancedFilters ? colors.text.onAccent : colors.text.secondary}
                  />
                  <SmartEmailButton
                    to={primaryContactEmail || ''}
                    size="sm"
                    variant="solid"
                    context={{
                      dealId,
                      dealName,
                      personId: undefined, // Will be auto-filled from primaryContactEmail
                      personName: undefined,
                      organizationId: undefined,
                      organizationName: undefined,
                    }}
                  >
                    Compose
                  </SmartEmailButton>
                </HStack>
              </HStack>

              {/* No Primary Contact Alert */}
              {showNoPrimaryContactMessage && (
                <Alert status="info" size="sm" borderRadius="md">
                  <AlertIcon />
                  <VStack spacing={1} align="start" flex={1}>
                    <Text fontSize="sm">
                      No primary contact email found for this deal.
                    </Text>
                    <HStack spacing={2}>
                      <Text fontSize="xs" color={colors.text.muted}>
                        Switch to "All Participants" below to view all emails.
                      </Text>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="link"
                        onClick={() => handleScopeChange('ALL')}
                      >
                        Switch to All
                      </Button>
                    </HStack>
                  </VStack>
                </Alert>
              )}
              
              {/* Enhanced Contact Filter - Now respects showAdvancedFilters toggle */}
              <Collapse in={showAdvancedFilters}>
                <Box 
                  p={3} 
                  bg={colors.bg.elevated} 
                  borderRadius="md" 
                  borderWidth="1px" 
                  borderColor={colors.border.default}
                >
                  <EmailContactFilter
                    dealId={dealId}
                    primaryContactEmail={primaryContactEmail}
                    selectedContacts={filter.selectedContacts}
                    contactScope={filter.contactScope}
                    onContactsChange={handleContactsChange}
                    onScopeChange={handleScopeChange}
                    isLoading={threadsLoading}
                  />
                </Box>
              </Collapse>

              {/* Analytics Summary */}
              {analyticsData && (
                <HStack spacing={4} fontSize="sm">
                  <VStack spacing={0}>
                    <Text fontWeight="bold" color={colors.text.primary}>
                      {analyticsData.getEmailAnalytics.totalThreads}
                    </Text>
                    <Text color={colors.text.secondary}>Threads</Text>
                  </VStack>
                  <VStack spacing={0}>
                    <Text fontWeight="bold" color={colors.text.primary}>
                      {analyticsData.getEmailAnalytics.unreadCount}
                    </Text>
                    <Text color={colors.text.secondary}>Unread</Text>
                  </VStack>
                  <VStack spacing={0}>
                    <Text fontWeight="bold" color={colors.text.primary}>
                      {analyticsData.getEmailAnalytics.responseRate}%
                    </Text>
                    <Text color={colors.text.secondary}>Response</Text>
                  </VStack>
                </HStack>
              )}

              {/* Search and Basic Filters */}
              <VStack spacing={2} align="stretch">
                <InputGroup size="sm">
                  <InputLeftElement>
                    <FiSearch color={colors.text.secondary} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search emails..."
                    value={filter.search}
                    onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                    bg={colors.bg.input}
                    borderColor={colors.border.input}
                  />
                </InputGroup>

                <HStack spacing={2}>
                  <Select
                    size="sm"
                    value={filter.isUnread === null ? 'all' : filter.isUnread ? 'unread' : 'read'}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilter(prev => ({
                        ...prev,
                        isUnread: value === 'all' ? null : value === 'unread'
                      }));
                    }}
                    bg={colors.bg.input}
                    borderColor={colors.border.input}
                  >
                    <option value="all">All emails</option>
                    <option value="unread">Unread only</option>
                    <option value="read">Read only</option>
                  </Select>

                  <Select
                    size="sm"
                    value={filter.hasAttachments === null ? 'all' : filter.hasAttachments ? 'with' : 'without'}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilter(prev => ({
                        ...prev,
                        hasAttachments: value === 'all' ? null : value === 'with'
                      }));
                    }}
                    bg={colors.bg.input}
                    borderColor={colors.border.input}
                  >
                    <option value="all">All</option>
                    <option value="with">With attachments</option>
                    <option value="without">No attachments</option>
                  </Select>

                  <Select
                    size="sm"
                    value={filter.showPinnedOnly ? 'pinned' : 'all'}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilter(prev => ({
                        ...prev,
                        showPinnedOnly: value === 'pinned'
                      }));
                    }}
                    bg={colors.bg.input}
                    borderColor={colors.border.input}
                  >
                    <option value="all">All emails</option>
                    <option value="pinned">⭐ Pinned only</option>
                  </Select>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Thread List */}
          <Box 
            flex={1} 
            overflowY="auto"
            minH={0} // Important for flex children to shrink
            sx={{
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(28, 28, 28, 0.3)',
                borderRadius: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'linear-gradient(180deg, #4A4A4A 0%, #3E3E3E 100%)',
                borderRadius: '8px',
                border: '1px solid rgba(58, 58, 58, 0.5)',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'linear-gradient(180deg, #5F5F5F 0%, #4A4A4A 100%)',
              },
            }}
          >
            {threadsLoading ? (
              <VStack spacing={4} align="center" pt={20}>
                <Spinner size="lg" color={colors.interactive.default} />
                <Text color={colors.text.secondary}>Loading email conversations...</Text>
              </VStack>
            ) : threadsError ? (
              <Alert status="error" m={4}>
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Failed to load emails</Text>
                  <Text fontSize="sm">
                    {threadsError.message.includes('authentication') || threadsError.message.includes('integration') 
                      ? 'Your Gmail connection has expired or is invalid. Please reconnect your Google account to view emails.'
                      : 'Failed to load emails. Please try again or check your Gmail integration.'}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    leftIcon={<FiExternalLink />}
                    onClick={() => {
                      window.open('/google-integration', '_blank');
                    }}
                  >
                    Reconnect Gmail
                  </Button>
                </VStack>
              </Alert>
            ) : threadsData?.getEmailThreads.threads.length === 0 ? (
              <Box p={4} textAlign="center">
                <Text color={colors.text.secondary}>No email conversations found</Text>
                {filter.contactScope !== 'PRIMARY' && (
                  <Text fontSize="sm" color={colors.text.muted} mt={2}>
                    Try adjusting your contact filter or search terms
                  </Text>
                )}
              </Box>
            ) : (
              threadsData?.getEmailThreads.threads
                .filter((thread: EmailThread) => {
                  // Apply pinned filter if active
                  if (filter.showPinnedOnly) {
                    return isEmailPinned(thread.latestMessage?.id, thread.id);
                  }
                  return true;
                })
                .map((thread: EmailThread) => (
                  <Box
                    key={thread.id}
                    p={3}
                    m={2}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={colors.component.kanban.cardBorder}
                    cursor="pointer"
                    bg={selectedThreadId === thread.id ? colors.component.kanban.cardHover : colors.component.kanban.card}
                    boxShadow={selectedThreadId === thread.id ? 'industrial3d' : 'metallic'}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    position="relative"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '3px',
                      height: '100%',
                      background: selectedThreadId === thread.id 
                        ? 'linear-gradient(180deg, rgba(255, 170, 0, 0.8) 0%, rgba(255, 170, 0, 1) 50%, rgba(255, 170, 0, 0.8) 100%)'
                        : 'transparent',
                      borderRadius: '0 0 0 lg',
                      transition: 'all 0.3s ease',
                    }}
                    _hover={{ 
                      bg: colors.component.kanban.cardHover,
                      transform: 'translateX(4px) translateY(-1px)',
                      boxShadow: 'industrial3d',
                      borderColor: colors.component.kanban.cardBorder,
                      _before: {
                        background: currentThemeName === 'industrialMetal' ? 'linear-gradient(180deg, rgba(255, 170, 0, 0.6) 0%, rgba(255, 170, 0, 0.8) 50%, rgba(255, 170, 0, 0.6) 100%)' : 'transparent',
                      },
                    }}
                    onClick={() => handleThreadSelect(thread.id)}
                  >
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text
                          fontSize="sm"
                          fontWeight={thread.isUnread ? 'bold' : 'normal'}
                          color={colors.text.primary}
                          noOfLines={1}
                        >
                          {thread.subject}
                        </Text>
                        <Text fontSize="xs" color={colors.text.secondary}>
                          {formatTimestamp(thread.lastMessageDate)}
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="xs" color={colors.text.secondary} noOfLines={1}>
                          {thread.participants.join(', ')}
                        </Text>
                        <HStack spacing={1}>
                          {isEmailPinned(thread.latestMessage?.id, thread.id) && (
                            <Icon as={FiStar} boxSize={3} color="yellow.500" />
                          )}
                          {thread.isUnread && (
                            <Badge size="sm" colorScheme="blue" variant="solid">
                              New
                            </Badge>
                          )}
                          {(thread.latestMessage?.attachments?.length || 0) > 0 && (
                            <Icon as={FiPaperclip} boxSize={3} color={colors.text.secondary} />
                          )}
                          <Badge size="sm" variant="outline">
                            {thread.messageCount}
                          </Badge>
                        </HStack>
                      </HStack>
                    </VStack>
                  </Box>
                ))
            )}
          </Box>
        </GridItem>

        {/* Right Panel - Message View */}
        <GridItem>
          {selectedThreadId ? (
            threadLoading ? (
              <Box p={6} textAlign="center">
                <Spinner size="lg" color={colors.interactive.default} />
              </Box>
            ) : threadData?.getEmailThread ? (
              <VStack spacing={0} h="full" maxH="100vh">
                {/* Message Header - Fixed at top */}
                <Box 
                  p={4} 
                  borderBottomWidth="1px" 
                  borderColor={colors.component.kanban.cardBorder} 
                  w="full" 
                  bg={colors.component.kanban.card}
                  position="sticky"
                  top={0}
                  zIndex={10}
                  flexShrink={0}
                  boxShadow="metallic"
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '0',
                    right: '0',
                    height: '1px',
                    background: `linear-gradient(90deg, transparent 0%, ${currentThemeName === 'industrialMetal' ? 'rgba(255, 170, 0, 0.8)' : 'transparent'} 50%, transparent 100%)`,
                  }}
                >
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between" align="center">
                      <Text fontWeight="bold" color={colors.text.primary} noOfLines={2} flex="1" fontSize="md">
                        {threadData.getEmailThread.subject}
                      </Text>
                      <HStack spacing={2} flexShrink={0}>
                        <SmartEmailButton
                          to={threadData.getEmailThread.latestMessage?.from || ''}
                          size="sm"
                          variant="ghost"
                          isIconButton={true}
                          icon="edit"
                          tooltip="Reply to email"
                          context={{
                            dealId,
                            dealName,
                            threadId: selectedThreadId || undefined,
                          }}
                        />
                        <Tooltip label="Forward email">
                          <IconButton
                            aria-label="Forward"
                            icon={<FiExternalLink />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                          />
                        </Tooltip>
                        <Tooltip label="Task creation disabled - using Google Calendar integration">
                          <Box position="relative">
                            <IconButton
                              aria-label="Create Task (Disabled)"
                              icon={<FiZap />}
                              size="sm"
                              variant="ghost"
                              colorScheme="gray"
                              isDisabled={true}
                              onClick={() => {
                                // Task creation disabled - using Google Calendar integration
                              }}
                            />
                          </Box>
                        </Tooltip>
                        <Tooltip label="Convert email to note" placement="bottom">
                          <Box position="relative">
                            <IconButton
                              aria-label="Convert to Note"
                              icon={<FiFileText />}
                              size="sm"
                              variant="ghost"
                              colorScheme="purple"
                              onClick={() => handleConvertToNote(threadData.getEmailThread.latestMessage)}
                            />
                          </Box>
                        </Tooltip>
                        <Tooltip label={
                          isEmailPinned(threadData.getEmailThread.latestMessage?.id, selectedThreadId) 
                            ? "Unpin email from deal" 
                            : "Pin email to deal"
                        } placement="bottom">
                          <Box position="relative">
                            <IconButton
                              aria-label="Pin Email"
                              icon={<FiStar />}
                              size="sm"
                              variant={
                                isEmailPinned(threadData.getEmailThread.latestMessage?.id, selectedThreadId)
                                  ? "solid"
                                  : "ghost"
                              }
                              colorScheme="yellow"
                              onClick={() => handlePinToggle(threadData.getEmailThread.latestMessage)}
                            />
                          </Box>
                        </Tooltip>
                        <Tooltip label="Create contact from email" placement="bottom">
                          <Box position="relative">
                            <IconButton
                              aria-label="Create Contact"
                              icon={<FiUser />}
                              size="sm"
                              variant="ghost"
                              colorScheme="teal"
                              onClick={() => handleCreateContact(threadData.getEmailThread.latestMessage)}
                            />
                          </Box>
                        </Tooltip>
                        <Tooltip label="Archive email">
                          <IconButton
                            aria-label="Archive"
                            icon={<FiArchive />}
                            size="sm"
                            variant="ghost"
                            colorScheme="gray"
                          />
                        </Tooltip>
                      </HStack>
                    </HStack>
                    
                    <HStack spacing={2} flexWrap="wrap">
                      <Text fontSize="sm" color={colors.text.secondary}>
                        From: {threadData.getEmailThread.latestMessage?.from}
                      </Text>
                      <Text fontSize="sm" color={colors.text.secondary}>
                        {formatTimestamp(threadData.getEmailThread.latestMessage?.timestamp)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Message Content - Scrollable */}
                <Box flex={1} overflowY="auto" w="full" p={4}>
                  <Card>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        {/* Message Details */}
                        <VStack spacing={2} align="stretch">
                          <HStack flexWrap="wrap">
                            <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                              To:
                            </Text>
                            <Text fontSize="sm" color={colors.text.secondary} wordBreak="break-word">
                              {threadData.getEmailThread.latestMessage?.to.join(', ')}
                            </Text>
                          </HStack>
                          
                          {threadData.getEmailThread.latestMessage?.cc?.length > 0 && (
                            <HStack flexWrap="wrap">
                              <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                                CC:
                              </Text>
                              <Text fontSize="sm" color={colors.text.secondary} wordBreak="break-word">
                                {threadData.getEmailThread.latestMessage.cc.join(', ')}
                              </Text>
                            </HStack>
                          )}
                        </VStack>

                        <Divider />

                        {/* Message Body */}
                        <Box>
                          <Text
                            fontSize="sm"
                            color={colors.text.primary}
                            whiteSpace="pre-wrap"
                            lineHeight="1.6"
                            wordBreak="break-word"
                          >
                            {threadData.getEmailThread.latestMessage?.body}
                          </Text>
                        </Box>

                        {/* Attachments */}
                        {threadData.getEmailThread.latestMessage?.attachments?.length > 0 && (
                          <VStack spacing={2} align="stretch">
                            <Divider />
                            <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                              Attachments:
                            </Text>
                            {threadData.getEmailThread.latestMessage.attachments.map((attachment: EmailAttachment) => (
                              <HStack key={attachment.id} spacing={2}>
                                <Icon as={FiPaperclip} w={4} h={4} color={colors.text.secondary} />
                                <Text fontSize="sm" color={colors.text.secondary}>
                                  {attachment.filename}
                                </Text>
                                <Text fontSize="xs" color={colors.text.muted}>
                                  ({Math.round(attachment.size / 1024)} KB)
                                </Text>
                              </HStack>
                            ))}
                          </VStack>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>
              </VStack>
            ) : (
              <Box p={6} textAlign="center">
                <Text color={colors.text.secondary}>Failed to load email thread</Text>
              </Box>
            )
          ) : (
            <Box p={6} textAlign="center">
              <Icon as={FiMail} w={12} h={12} color={colors.text.muted} mb={4} />
              <Text color={colors.text.secondary} fontSize="lg" mb={2}>
                Select an email conversation
              </Text>
              <Text color={colors.text.muted} fontSize="sm">
                Choose a thread from the left to view the full conversation
              </Text>
            </Box>
          )}
        </GridItem>
      </Grid>

      {/* Old Compose Email Modal removed - now using unified SmartEmailComposer */}

      {/* Create Task Modal - Removed with activities system */}
      {/* Task creation functionality replaced with Google Calendar integration */}

      {/* Convert to Note Modal */}
      {selectedEmailForNote && (
        <EmailToNoteModal
          isOpen={isConvertToNoteModalOpen}
          onClose={() => setIsConvertToNoteModalOpen(false)}
          emailMessage={selectedEmailForNote}
          dealId={dealId}
        />
      )}

      {/* Create Contact Modal */}
      {selectedEmailForContact && (
        <CreateContactFromEmailModal
          isOpen={isCreateContactModalOpen}
          onClose={() => setIsCreateContactModalOpen(false)}
          emailMessage={selectedEmailForContact}
          dealId={dealId}
        />
      )}
    </Box>
  );
};

export default DealEmailsPanel;