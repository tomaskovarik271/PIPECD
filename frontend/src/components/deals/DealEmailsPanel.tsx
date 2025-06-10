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
import { useQuery, useMutation, gql } from '@apollo/client';
import { useThemeColors } from '../../hooks/useThemeColors';

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
              <VStack spacing={0} h="full">
                {/* Message Header */}
                <Box p={4} borderBottomWidth="1px" borderColor={colors.border.default} w="full">
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="bold" color={colors.text.primary} noOfLines={1}>
                        {threadData.getEmailThread.subject}
                      </Text>
                      <HStack spacing={1}>
                        <IconButton
                          aria-label="Reply"
                          icon={<FaReply />}
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsComposeModalOpen(true)}
                        />
                        <IconButton
                          aria-label="Forward"
                          icon={<FaForward />}
                          size="sm"
                          variant="ghost"
                        />
                        <IconButton
                          aria-label="Create Task"
                          icon={<FaTasks />}
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedEmailForTask(threadData.getEmailThread.latestMessage?.id);
                            setIsTaskModalOpen(true);
                          }}
                        />
                        <IconButton
                          aria-label="Archive"
                          icon={<FaArchive />}
                          size="sm"
                          variant="ghost"
                        />
                      </HStack>
                    </HStack>
                    
                    <HStack spacing={2}>
                      <Text fontSize="sm" color={colors.text.secondary}>
                        From: {threadData.getEmailThread.latestMessage?.from}
                      </Text>
                      <Text fontSize="sm" color={colors.text.secondary}>
                        {formatTimestamp(threadData.getEmailThread.latestMessage?.timestamp)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Message Content */}
                <Box flex={1} p={4} overflowY="auto" w="full">
                  <Card>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        {/* Message Details */}
                        <VStack spacing={2} align="stretch">
                          <HStack>
                            <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                              To:
                            </Text>
                            <Text fontSize="sm" color={colors.text.secondary}>
                              {threadData.getEmailThread.latestMessage?.to.join(', ')}
                            </Text>
                          </HStack>
                          
                          {threadData.getEmailThread.latestMessage?.cc?.length > 0 && (
                            <HStack>
                              <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                                CC:
                              </Text>
                              <Text fontSize="sm" color={colors.text.secondary}>
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

export default DealEmailsPanel; 