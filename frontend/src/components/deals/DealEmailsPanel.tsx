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
  Avatar,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
} from '@chakra-ui/react';
import {
  SearchIcon,
  EmailIcon,
  AttachmentIcon,
  StarIcon,
  ChevronDownIcon,
  AddIcon,
  ExternalLinkIcon,
  CalendarIcon,
  CheckIcon,
} from '@chakra-ui/icons';
import { FaReply, FaForward, FaArchive, FaTasks } from 'react-icons/fa';
import { FiFileText } from 'react-icons/fi';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useThemeColors } from '../../hooks/useThemeColors';
import { EmailContactFilter } from './EmailContactFilter';

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

const CREATE_TASK_FROM_EMAIL = gql`
  mutation CreateTaskFromEmail($input: CreateTaskFromEmailInput!) {
    createTaskFromEmail(input: $input) {
      id
      subject
      notes
      due_date
    }
  }
`;

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

interface DealEmailsPanelProps {
  dealId: string;
  primaryContactEmail?: string;
  dealName: string;
}

interface EmailFilter {
  search: string;
  isUnread: boolean | null;
  hasAttachments: boolean | null;
  dateRange: string;
}

const DealEmailsPanel: React.FC<DealEmailsPanelProps> = ({
  dealId,
  primaryContactEmail,
  dealName,
}) => {
  const colors = useThemeColors();
  const toast = useToast();

  // State
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [filter, setFilter] = useState<EmailFilter>({
    search: '',
    isUnread: null,
    hasAttachments: null,
    dateRange: 'all',
  });
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedEmailForTask, setSelectedEmailForTask] = useState<string | null>(null);
  const [isConvertToNoteModalOpen, setIsConvertToNoteModalOpen] = useState(false);
  const [selectedEmailForNote, setSelectedEmailForNote] = useState<any>(null);

  // Enhanced Email Filter State
  const [emailFilterScope, setEmailFilterScope] = useState<'PRIMARY' | 'ALL' | 'CUSTOM' | 'SELECTED_ROLES'>('PRIMARY');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<('PRIMARY' | 'DECISION_MAKER' | 'INFLUENCER' | 'TECHNICAL' | 'LEGAL' | 'OTHER')[]>([]);
  const [includeNewParticipants, setIncludeNewParticipants] = useState(true);

  // GraphQL Hooks
  const { data: threadsData, loading: threadsLoading, error: threadsError, refetch: refetchThreads } = useQuery(GET_EMAIL_THREADS, {
    variables: {
      filter: {
        dealId,
        contactEmail: primaryContactEmail,
        keywords: filter.search ? [filter.search] : undefined,
        isUnread: filter.isUnread,
        hasAttachments: filter.hasAttachments,
        limit: 50,
      },
    },
    skip: !primaryContactEmail,
  });

  const { data: threadData, loading: threadLoading } = useQuery(GET_EMAIL_THREAD, {
    variables: { threadId: selectedThreadId },
    skip: !selectedThreadId,
  });

  const { data: analyticsData } = useQuery(GET_EMAIL_ANALYTICS, {
    variables: { dealId },
  });

  const [composeEmail] = useMutation(COMPOSE_EMAIL, {
    onCompleted: () => {
      toast({
        title: 'Email sent successfully',
        status: 'success',
        duration: 3000,
      });
      setIsComposeModalOpen(false);
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

  const [createTaskFromEmail] = useMutation(CREATE_TASK_FROM_EMAIL, {
    onCompleted: () => {
      toast({
        title: 'Task created successfully',
        status: 'success',
        duration: 3000,
      });
      setIsTaskModalOpen(false);
      setSelectedEmailForTask(null);
    },
    onError: (error) => {
      toast({
        title: 'Failed to create task',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const [markAsRead] = useMutation(MARK_THREAD_AS_READ);

  // Handlers
  const handleThreadSelect = (threadId: string) => {
    setSelectedThreadId(threadId);
    // Mark as read when opened
    markAsRead({ variables: { threadId } });
  };

  const handleComposeEmail = (emailData: any) => {
    composeEmail({
      variables: {
        input: {
          to: [primaryContactEmail],
          subject: `Re: ${dealName}`,
          body: emailData.body,
          dealId,
          ...emailData,
        },
      },
    });
  };

  const handleCreateTask = (taskData: any) => {
    if (!selectedEmailForTask) return;
    
    createTaskFromEmail({
      variables: {
        input: {
          emailId: selectedEmailForTask,
          subject: taskData.subject,
          description: taskData.description,
          dueDate: taskData.dueDate,
          dealId,
        },
      },
    });
  };

  const handleConvertToNote = (emailMessage: any) => {
    setSelectedEmailForNote(emailMessage);
    setIsConvertToNoteModalOpen(true);
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

  if (!primaryContactEmail) {
    return (
      <Box p={6} textAlign="center">
        <Text color={colors.text.secondary}>
          No primary contact email found for this deal.
        </Text>
        <Text fontSize="sm" color={colors.text.muted} mt={2}>
          Add a primary contact with an email address to view email conversations.
        </Text>
      </Box>
    );
  }

  return (
    <Box h="600px" bg={colors.bg.surface} borderRadius="lg" overflow="hidden">
      <Grid templateColumns="1fr 2fr" h="full">
        {/* Left Panel - Thread List */}
        <GridItem 
          borderRightWidth="1px" 
          borderColor={colors.border.default} 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          {/* Header with Analytics */}
          <Box 
            p={4} 
            borderBottomWidth="1px" 
            borderColor={colors.border.default} 
            w="full"
            sx={{ flexShrink: 0 }}
          >
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="bold" color={colors.text.primary}>
                  Email Conversations
                </Text>
                <Button
                  size="sm"
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={() => setIsComposeModalOpen(true)}
                >
                  Compose
                </Button>
              </HStack>
              
              {analyticsData && (
                <HStack spacing={4}>
                  <Badge colorScheme="blue">
                    {analyticsData.getEmailAnalytics.totalThreads} threads
                  </Badge>
                  <Badge colorScheme="orange">
                    {analyticsData.getEmailAnalytics.unreadCount} unread
                  </Badge>
                  <Badge colorScheme="green">
                    {analyticsData.getEmailAnalytics.avgResponseTime} avg response
                  </Badge>
                </HStack>
              )}
            </VStack>
          </Box>

          {/* Search and Filters */}
          <Box 
            p={3} 
            borderBottomWidth="1px" 
            borderColor={colors.border.default} 
            w="full"
            sx={{ flexShrink: 0 }}
          >
            <VStack spacing={2}>
              <InputGroup size="sm">
                <InputLeftElement>
                  <SearchIcon color={colors.text.secondary} />
                </InputLeftElement>
                <Input
                  placeholder="Search emails..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                />
              </InputGroup>
              
              <HStack spacing={2} w="full">
                <Select
                  size="sm"
                  value={filter.isUnread === null ? 'all' : filter.isUnread ? 'unread' : 'read'}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilter({
                      ...filter,
                      isUnread: value === 'all' ? null : value === 'unread',
                    });
                  }}
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </Select>
                
                <Select
                  size="sm"
                  value={filter.hasAttachments === null ? 'all' : filter.hasAttachments ? 'with' : 'without'}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilter({
                      ...filter,
                      hasAttachments: value === 'all' ? null : value === 'with',
                    });
                  }}
                >
                  <option value="all">All</option>
                  <option value="with">With attachments</option>
                  <option value="without">No attachments</option>
                </Select>
              </HStack>

              {/* Enhanced Email Contact Filter */}
              <Box w="full" pt={2}>
                <EmailContactFilter
                  dealId={dealId}
                  currentScope={emailFilterScope}
                  selectedContacts={selectedContacts}
                  selectedRoles={selectedRoles}
                  includeNewParticipants={includeNewParticipants}
                  onScopeChange={setEmailFilterScope}
                  onContactsChange={setSelectedContacts}
                  onRolesChange={setSelectedRoles}
                  onNewParticipantsChange={setIncludeNewParticipants}
                />
              </Box>
            </VStack>
          </Box>

          {/* Thread List */}
          <div 
            style={{
              width: '100%',
              height: '400px',
              overflowY: 'auto',
              flex: '1 1 0',
              minHeight: 0
            }}
          >
              {threadsLoading ? (
                <Box p={4} textAlign="center">
                  <Spinner size="md" color={colors.interactive.default} />
                </Box>
              ) : threadsError ? (
                <Alert status="warning" m={4}>
                  <AlertIcon />
                  <VStack spacing={2} align="start">
                    <Text fontWeight="bold">Gmail Connection Required</Text>
                    <Text fontSize="sm">
                      {threadsError.message.includes('authentication') || threadsError.message.includes('integration') 
                        ? 'Your Gmail connection has expired or is invalid. Please reconnect your Google account to view emails.'
                        : 'Failed to load emails. Please try again or check your Gmail integration.'}
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      leftIcon={<ExternalLinkIcon />}
                      onClick={() => {
                        // Navigate to Google integration settings
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
                </Box>
              ) : (
threadsData?.getEmailThreads.threads.map((thread: any) => (
                    <Box
                      key={thread.id}
                      p={3}
                      borderBottomWidth="1px"
                      borderColor={colors.border.default}
                      cursor="pointer"
                      bg={selectedThreadId === thread.id ? colors.bg.elevated : 'transparent'}
                      _hover={{ bg: colors.bg.elevated }}
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
                            {formatTimestamp(thread.lastActivity)}
                          </Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="xs" color={colors.text.secondary} noOfLines={1}>
                            {thread.latestMessage?.from}
                          </Text>
                          <HStack spacing={1}>
                            {thread.isUnread && (
                              <Badge size="sm" colorScheme="blue">
                                New
                              </Badge>
                            )}
                            {thread.latestMessage?.hasAttachments && (
                              <AttachmentIcon w={3} h={3} color={colors.text.secondary} />
                            )}
                            <Badge size="sm" variant="outline">
                              {thread.messageCount}
                            </Badge>
                          </HStack>
                        </HStack>
                        
                        <Text fontSize="xs" color={colors.text.muted} noOfLines={2}>
                          {thread.latestMessage?.body}
                        </Text>
                      </VStack>
                    </Box>
                ))
              )}
            </div>
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
                  borderColor={colors.border.default} 
                  w="full" 
                  bg={colors.bg.surface}
                  position="sticky"
                  top={0}
                  zIndex={10}
                  flexShrink={0}
                >
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between" align="center">
                      <Text fontWeight="bold" color={colors.text.primary} noOfLines={2} flex="1" fontSize="md">
                        {threadData.getEmailThread.subject}
                      </Text>
                      <HStack spacing={2} flexShrink={0}>
                        <Tooltip label="Reply to email">
                          <IconButton
                            aria-label="Reply"
                            icon={<FaReply />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => setIsComposeModalOpen(true)}
                          />
                        </Tooltip>
                        <Tooltip label="Forward email">
                          <IconButton
                            aria-label="Forward"
                            icon={<FaForward />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                          />
                        </Tooltip>
                        <Tooltip label="Create task from email">
                          <IconButton
                            aria-label="Create Task"
                            icon={<FaTasks />}
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => {
                              setSelectedEmailForTask(threadData.getEmailThread.latestMessage?.id);
                              setIsTaskModalOpen(true);
                            }}
                          />
                        </Tooltip>
                        <Tooltip label="Convert email to note" placement="bottom">
                          <Box position="relative">
                            <IconButton
                              aria-label="Convert to Note"
                              icon={<FiFileText />}
                              size="md"
                              variant="solid"
                              colorScheme="purple"
                              onClick={() => handleConvertToNote(threadData.getEmailThread.latestMessage)}
                              _hover={{ transform: 'scale(1.05)' }}
                            />
                            <Badge
                              position="absolute"
                              top="-2px"
                              right="-2px"
                              colorScheme="purple"
                              variant="solid"
                              fontSize="xs"
                              borderRadius="full"
                              px={1}
                            >
                              NEW
                            </Badge>
                          </Box>
                        </Tooltip>
                        <Tooltip label="Archive email">
                          <IconButton
                            aria-label="Archive"
                            icon={<FaArchive />}
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
                            {threadData.getEmailThread.latestMessage.attachments.map((attachment: any) => (
                              <HStack key={attachment.id} spacing={2}>
                                <AttachmentIcon w={4} h={4} color={colors.text.secondary} />
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
              <EmailIcon w={12} h={12} color={colors.text.muted} mb={4} />
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

      {/* Compose Email Modal */}
      <ComposeEmailModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        onSend={handleComposeEmail}
        defaultTo={primaryContactEmail}
        defaultSubject={`Re: ${dealName}`}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedEmailForTask(null);
        }}
        onCreateTask={handleCreateTask}
      />

      {/* Convert to Note Modal */}
      <EmailToNoteModal
        isOpen={isConvertToNoteModalOpen}
        onClose={() => {
          setIsConvertToNoteModalOpen(false);
          setSelectedEmailForNote(null);
        }}
        emailMessage={selectedEmailForNote}
        dealId={dealId}
      />
    </Box>
  );
};

// Compose Email Modal Component
const ComposeEmailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: any) => void;
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

// Create Task Modal Component
const CreateTaskModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (data: any) => void;
}> = ({ isOpen, onClose, onCreateTask }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    dueDate: '',
  });

  const handleCreate = () => {
    onCreateTask(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Task from Email</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Task Subject</FormLabel>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Follow up on email discussion"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task description..."
                rows={4}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Due Date</FormLabel>
              <Box 
                borderWidth="1px" 
                borderRadius="md" 
                borderColor="inherit"
                bg="inherit"
                _hover={{ borderColor: "gray.300" }}
                _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                transition="all 0.2s"
              >
                <HStack spacing={0} divider={<Box w="1px" h="6" bg="gray.200" />}>
                  <Box flex={1}>
                    <Input
                      type="date"
                      border="none"
                      _focus={{ boxShadow: "none" }}
                      placeholder="Select date"
                      value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
                      onChange={(e) => {
                        const timeValue = formData.dueDate && formData.dueDate.includes('T') ? formData.dueDate.split('T')[1] : '09:00';
                        const newDateTime = e.target.value ? `${e.target.value}T${timeValue}` : '';
                        setFormData({ ...formData, dueDate: newDateTime });
                      }}
                    />
                  </Box>
                  <Box flex={0} minW="120px">
                    <Select
                      placeholder="Time"
                      border="none"
                      _focus={{ boxShadow: "none" }}
                      value={formData.dueDate && formData.dueDate.includes('T') ? formData.dueDate.split('T')[1]?.substring(0, 5) : ''}
                      onChange={(e) => {
                        const dateValue = formData.dueDate && formData.dueDate.includes('T') ? formData.dueDate.split('T')[0] : new Date().toISOString().split('T')[0];
                        const newDateTime = dateValue && e.target.value ? `${dateValue}T${e.target.value}` : '';
                        setFormData({ ...formData, dueDate: newDateTime });
                      }}
                    >
                      {/* Generate 15-minute interval options */}
                      {Array.from({ length: 96 }, (_, i) => {
                        const hours = Math.floor(i / 4);
                        const minutes = (i % 4) * 15;
                        const timeValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        const displayValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        return (
                          <option key={timeValue} value={timeValue}>
                            {displayValue}
                          </option>
                        );
                      })}
                    </Select>
                  </Box>
                </HStack>
              </Box>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleCreate}>
            Create Task
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Email to Note Modal Component
const EmailToNoteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  emailMessage: any;
  dealId: string;
}> = ({ isOpen, onClose, emailMessage, dealId }) => {
  const colors = useThemeColors();
  const toast = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  // GraphQL mutation for creating notes
  const [createSticker] = useMutation(CREATE_STICKER, {
    onCompleted: () => {
      toast({
        title: 'Email Converted to Note',
        description: 'The email has been successfully converted to a note.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error converting email to note:', error);
      toast({
        title: 'Conversion Failed',
        description: 'Failed to convert email to note. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Note templates
  const templates = [
    {
      id: 'email_summary',
      name: 'Email Summary',
      description: 'Structured summary of email content',
      content: `# 📧 Email Summary: {subject}

**From:** {from}
**To:** {to}
**Date:** {date}
**Thread:** [View in Gmail]({emailLink})

---

## Email Content
{body}

{attachments}

## Context
- **Deal:** {dealName}
- **Original Email:** [Gmail Link]({emailLink})

---
*Converted from Gmail on {conversionDate}*`
    },
    {
      id: 'meeting_notes',
      name: 'Meeting Notes',
      description: 'Convert email to meeting notes format',
      content: `# 📅 Meeting Notes: {subject}

**Date:** {date}
**Attendees:** {participants}
**Email Reference:** [View Original]({emailLink})

## Discussion Points
{body}

## Action Items
- [ ] Follow up on email discussion
- [ ] 

## Next Steps
- 

{attachments}

---
*Based on email from {from} on {date}*`
    },
    {
      id: 'follow_up',
      name: 'Follow-up Notes',
      description: 'Track follow-up actions from email',
      content: `# 🔄 Follow-up Notes: {subject}

**Original Email:** {date} from {from}
**Email Link:** [View in Gmail]({emailLink})

## Previous Contact
{body}

## Client Response/Status
- 

## Follow-up Actions Required
- [ ] 
- [ ] 

## Next Contact Date
- 

{attachments}

---
*Email converted on {conversionDate}*`
    }
  ];

  useEffect(() => {
    if (emailMessage && isOpen) {
      // Auto-select email summary template
      setSelectedTemplate('email_summary');
      generateNoteContent('email_summary');
    }
  }, [emailMessage, isOpen]);

  const generateNoteContent = (templateId: string) => {
    if (!emailMessage || !templateId) return;

    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const formatDate = (timestamp: string) => {
      return new Date(timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const attachmentsSection = emailMessage.attachments?.length > 0 
      ? `\n## Attachments\n${emailMessage.attachments.map((att: any) => 
          `- 📎 ${att.filename} (${Math.round(att.size / 1024)} KB)`
        ).join('\n')}\n`
      : '';

    const participants = [emailMessage.from, ...(emailMessage.to || []), ...(emailMessage.cc || [])]
      .filter(Boolean)
      .join(', ');

    let content = template.content
      .replace(/{subject}/g, emailMessage.subject || 'Email')
      .replace(/{from}/g, emailMessage.from || 'Unknown')
      .replace(/{to}/g, (emailMessage.to || []).join(', '))
      .replace(/{date}/g, formatDate(emailMessage.timestamp))
      .replace(/{body}/g, emailMessage.body || '')
      .replace(/{attachments}/g, attachmentsSection)
      .replace(/{emailLink}/g, '#') // Would be actual Gmail link
      .replace(/{dealName}/g, 'Current Deal') // Would be actual deal name
      .replace(/{conversionDate}/g, new Date().toLocaleDateString())
      .replace(/{participants}/g, participants);

    setNoteContent(content);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    generateNoteContent(templateId);
  };

  const generateTitle = (content: string): string => {
    // Extract title from content - look for first heading or use subject
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return trimmed.substring(2).trim();
      }
    }
    
    // Fallback to email subject
    return `Email: ${emailMessage.subject || 'Converted Email'}`;
  };

  const handleConvertToNote = async () => {
    if (!noteContent.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please add content to the note before converting.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsConverting(true);
    try {
      const title = generateTitle(noteContent);
      
      await createSticker({
        variables: {
          input: {
            entityType: 'DEAL',
            entityId: dealId,
            title: title,
            content: noteContent,
            positionX: Math.floor(Math.random() * 300), // Random position
            positionY: Math.floor(Math.random() * 300),
            width: 300,
            height: 200,
            color: '#E3F2FD', // Light blue for email notes
            isPinned: false,
            isPrivate: false,
            priority: 'NORMAL',
            mentions: [],
            tags: ['email-converted', selectedTemplate],
          }
        }
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    } finally {
      setIsConverting(false);
    }
  };

  if (!emailMessage) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <HStack spacing={3}>
            <FiFileText />
            <Text>Convert Email to Note</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns="1fr 2fr" gap={6} h="70vh">
            {/* Left Panel - Email Preview */}
            <GridItem>
              <VStack spacing={4} align="stretch" h="full">
                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb={2}>
                    Email Preview
                  </Text>
                  <Card>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                            Subject:
                          </Text>
                          <Text fontSize="sm" color={colors.text.secondary}>
                            {emailMessage.subject}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                            From:
                          </Text>
                          <Text fontSize="sm" color={colors.text.secondary}>
                            {emailMessage.from}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                            Date:
                          </Text>
                          <Text fontSize="sm" color={colors.text.secondary}>
                            {new Date(emailMessage.timestamp).toLocaleString()}
                          </Text>
                        </Box>
                        
                        <Divider />
                        
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" color={colors.text.primary} mb={2}>
                            Content:
                          </Text>
                          <Box 
                            maxH="200px" 
                            overflowY="auto" 
                            p={3} 
                            bg={colors.bg.surface} 
                            borderRadius="md"
                          >
                            <Text fontSize="sm" whiteSpace="pre-wrap">
                              {emailMessage.body}
                            </Text>
                          </Box>
                        </Box>
                        
                        {emailMessage.attachments?.length > 0 && (
                          <Box>
                            <Text fontSize="sm" fontWeight="medium" color={colors.text.primary} mb={2}>
                              Attachments:
                            </Text>
                            <VStack spacing={1} align="stretch">
                              {emailMessage.attachments.map((attachment: any) => (
                                <HStack key={attachment.id} spacing={2}>
                                  <AttachmentIcon w={3} h={3} />
                                  <Text fontSize="xs">{attachment.filename}</Text>
                                </HStack>
                              ))}
                            </VStack>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>

                {/* Template Selection */}
                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb={3}>
                    Note Template
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        cursor="pointer"
                        onClick={() => handleTemplateChange(template.id)}
                        bg={selectedTemplate === template.id ? colors.bg.elevated : colors.bg.surface}
                        borderColor={selectedTemplate === template.id ? colors.interactive.default : colors.border.default}
                        borderWidth="2px"
                        _hover={{ borderColor: colors.interactive.default }}
                      >
                        <CardBody p={3}>
                          <VStack spacing={1} align="start">
                            <Text fontSize="sm" fontWeight="medium">
                              {template.name}
                            </Text>
                            <Text fontSize="xs" color={colors.text.muted}>
                              {template.description}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            </GridItem>

            {/* Right Panel - Note Editor */}
            <GridItem>
              <VStack spacing={4} align="stretch" h="full">
                <Text fontSize="lg" fontWeight="bold">
                  Note Content
                </Text>
                <Box flex="1">
                  <Textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Note content will appear here..."
                    h="full"
                    resize="none"
                    fontFamily="mono"
                    fontSize="sm"
                  />
                </Box>
              </VStack>
            </GridItem>
          </Grid>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleConvertToNote}
            isLoading={isConverting}
            loadingText="Converting..."
            leftIcon={<FiFileText />}
          >
            Convert to Note
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DealEmailsPanel; 