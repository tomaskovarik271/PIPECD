import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  useDisclosure,
  Spinner,
  useToast,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Card,
  CardBody,
  Flex,
  Tooltip
} from '@chakra-ui/react';
import { FiBell, FiCheck, FiX, FiFilter, FiSettings, FiCheckCircle } from 'react-icons/fi';
import { gql } from 'graphql-request';
import { formatDistanceToNow } from 'date-fns';
import { useThemeColors } from '../../hooks/useThemeColors';
import { gqlClient } from '../../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../../lib/graphqlUtils';

// GraphQL Operations using gql template literals
const GET_NOTIFICATION_SUMMARY = gql`
  query GetNotificationSummary {
    notificationSummary {
      totalCount
      unreadCount
      businessRuleCount
      systemCount
      highPriorityCount
    }
  }
`;

const GET_UNIFIED_NOTIFICATIONS = gql`
  query GetUnifiedNotifications($first: Int, $filters: NotificationFilters) {
    unifiedNotifications(first: $first, filters: $filters) {
      nodes {
        source
        id
        title
        message
        notificationType
        priority
        entityType
        entityId
        actionUrl
        isRead
        readAt
        dismissedAt
        expiresAt
        createdAt
        updatedAt
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
`;

const MARK_SYSTEM_NOTIFICATION_AS_READ = gql`
  mutation MarkSystemNotificationAsRead($id: ID!) {
    markSystemNotificationAsRead(id: $id)
  }
`;

const MARK_ALL_SYSTEM_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllSystemNotificationsAsRead {
    markAllSystemNotificationsAsRead
  }
`;

const MARK_BUSINESS_RULE_NOTIFICATION_AS_READ = gql`
  mutation MarkBusinessRuleNotificationAsRead($id: ID!) {
    markBusinessRuleNotificationAsRead(id: $id)
  }
`;

const MARK_ALL_BUSINESS_RULE_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllBusinessRuleNotificationsAsRead {
    markAllBusinessRuleNotificationsAsRead
  }
`;

const DISMISS_SYSTEM_NOTIFICATION = gql`
  mutation DismissSystemNotification($id: ID!) {
    dismissSystemNotification(id: $id)
  }
`;

interface NotificationCenterProps {
  position?: 'header' | 'sidebar' | 'standalone';
  maxWidth?: string;
  showBadge?: boolean;
}

interface NotificationFilters {
  isRead?: boolean;
  source?: 'BUSINESS_RULE' | 'SYSTEM';
  priority?: number;
  entityType?: string;
}

interface NotificationSummary {
  totalCount: number;
  unreadCount: number;
  businessRuleCount: number;
  systemCount: number;
  highPriorityCount: number;
}

interface UnifiedNotification {
  source: string;
  id: string;
  title: string;
  message: string;
  notificationType: string;
  priority: number;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  dismissedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface UnifiedNotificationsResponse {
  nodes: UnifiedNotification[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  position = 'header',
  maxWidth = '400px',
  showBadge = true
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const toast = useToast();
  const colors = useThemeColors();

  // State for summary data
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // State for notifications data
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  // Fetch notification summary
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const response = await gqlClient.request<{ notificationSummary: NotificationSummary }>(
        GET_NOTIFICATION_SUMMARY
      );
      setSummary(response.notificationSummary);
    } catch (error) {
      console.error('Error fetching notification summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const variables = {
        first: 20,
        filters: showUnreadOnly ? { isRead: false, ...filters } : filters
      };
      
      const response = await gqlClient.request<{ unifiedNotifications: UnifiedNotificationsResponse }>(
        GET_UNIFIED_NOTIFICATIONS,
        variables
      );
      setNotifications(response.unifiedNotifications.nodes);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  }, [filters, showUnreadOnly]);

  // Initial data fetch and polling
  useEffect(() => {
    fetchSummary();
    fetchNotifications();
    
    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchSummary();
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchSummary, fetchNotifications]);

  const unreadCount = summary?.unreadCount || 0;

  const handleMarkAsRead = async (notificationId: string, source: string) => {
    try {
      if (source === 'SYSTEM') {
        await gqlClient.request(MARK_SYSTEM_NOTIFICATION_AS_READ, { id: notificationId });
      } else if (source === 'BUSINESS_RULE') {
        await gqlClient.request(MARK_BUSINESS_RULE_NOTIFICATION_AS_READ, { id: notificationId });
      }
      
      fetchNotifications();
      fetchSummary();
      toast({
        title: 'Notification marked as read',
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      let errorMessage = 'Failed to mark notification as read';
      if (isGraphQLErrorWithMessage(error)) {
        errorMessage = error.response?.errors[0]?.message || errorMessage;
      }
      toast({
        title: 'Error marking notification as read',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleDismiss = async (notificationId: string, source: string) => {
    if (source === 'SYSTEM') {
      try {
        await gqlClient.request(DISMISS_SYSTEM_NOTIFICATION, { id: notificationId });
        fetchNotifications();
        fetchSummary();
        toast({
          title: 'Notification dismissed',
          status: 'success',
          duration: 2000,
          isClosable: true
        });
      } catch (error) {
        console.error('Error dismissing notification:', error);
        let errorMessage = 'Failed to dismiss notification';
        if (isGraphQLErrorWithMessage(error)) {
          errorMessage = error.response?.errors[0]?.message || errorMessage;
        }
        toast({
          title: 'Error dismissing notification',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const [systemResponse, businessRuleResponse] = await Promise.all([
        gqlClient.request<{ markAllSystemNotificationsAsRead: number }>(MARK_ALL_SYSTEM_NOTIFICATIONS_AS_READ),
        gqlClient.request<{ markAllBusinessRuleNotificationsAsRead: number }>(MARK_ALL_BUSINESS_RULE_NOTIFICATIONS_AS_READ)
      ]);
      
      const totalMarked = systemResponse.markAllSystemNotificationsAsRead + businessRuleResponse.markAllBusinessRuleNotificationsAsRead;
      
      fetchNotifications();
      fetchSummary();
      toast({
        title: `Marked ${totalMarked} notifications as read`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      let errorMessage = 'Failed to mark all notifications as read';
      if (isGraphQLErrorWithMessage(error)) {
        errorMessage = error.response?.errors[0]?.message || errorMessage;
      }
      toast({
        title: 'Error marking all notifications as read',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 4: return 'red';
      case 3: return 'orange';
      case 2: return 'blue';
      case 1: return 'gray';
      default: return 'blue';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 4: return 'URGENT';
      case 3: return 'HIGH';
      case 2: return 'NORMAL';
      case 1: return 'LOW';
      default: return 'NORMAL';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_due_today':
      case 'task_overdue':
        return '📅';
      case 'task_assigned':
        return '✅';
      case 'deal_close_date_approaching':
        return '💰';
      case 'user_assigned':
      case 'user_mentioned':
        return '👤';
      case 'file_shared':
        return '📎';
      case 'system_announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  const renderNotificationItem = (notification: UnifiedNotification) => (
    <Card key={notification.id} size="sm" mb={2} bg={notification.isRead ? colors.bg.surface : colors.bg.elevated}>
      <CardBody p={3}>
        <HStack align="flex-start" spacing={3}>
          <Box fontSize="lg" mt={1}>
            {getNotificationIcon(notification.notificationType)}
          </Box>
          
          <VStack align="flex-start" spacing={1} flex={1} minW={0}>
            <HStack spacing={2} w="full">
              <Text fontWeight="medium" fontSize="sm" noOfLines={1} flex={1}>
                {notification.title}
              </Text>
              <Badge 
                size="xs" 
                colorScheme={getPriorityColor(notification.priority)}
                variant="subtle"
              >
                {getPriorityLabel(notification.priority)}
              </Badge>
            </HStack>
            
            <Text fontSize="xs" color={colors.text.muted} noOfLines={2}>
              {notification.message}
            </Text>
            
            <HStack spacing={2} w="full" justify="space-between">
              <HStack spacing={2}>
                <Badge size="xs" variant="outline" colorScheme="gray">
                  {notification.source}
                </Badge>
                {notification.entityType && (
                  <Badge size="xs" variant="outline" colorScheme="blue">
                    {notification.entityType}
                  </Badge>
                )}
              </HStack>
              
              <Text fontSize="xs" color={colors.text.muted}>
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </Text>
            </HStack>
          </VStack>
          
          <VStack spacing={1}>
            {!notification.isRead && (
              <Tooltip label="Mark as read">
                <IconButton
                  icon={<FiCheck />}
                  size="xs"
                  variant="ghost"
                  colorScheme="green"
                  onClick={() => handleMarkAsRead(notification.id, notification.source)}
                  aria-label="Mark notification as read"
                />
              </Tooltip>
            )}
            
            {notification.source === 'SYSTEM' && (
              <Tooltip label="Dismiss">
                <IconButton
                  icon={<FiX />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => handleDismiss(notification.id, notification.source)}
                  aria-label="Dismiss notification"
                />
              </Tooltip>
            )}
          </VStack>
        </HStack>
        
        {notification.actionUrl && (
          <Button
            size="xs"
            variant="outline"
            mt={2}
            onClick={() => window.open(notification.actionUrl, '_blank')}
          >
            View Details
          </Button>
        )}
      </CardBody>
    </Card>
  );

  const NotificationTrigger = () => (
    <Box position="relative">
      <IconButton
        icon={<FiBell />}
        variant="ghost"
        onClick={onOpen}
        aria-label="Open notifications"
        size={position === 'header' ? 'sm' : 'md'}
      />
      {showBadge && unreadCount > 0 && (
        <Badge
          position="absolute"
          top="-1"
          right="-1"
          colorScheme="red"
          borderRadius="full"
          fontSize="xs"
          minW={5}
          h={5}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Box>
  );

  const NotificationContent = () => (
    <Box maxW={maxWidth} w="full">
      {/* Header with space for close button */}
      <HStack justify="space-between" mb={3} pr={8}>
        <Text fontWeight="semibold" fontSize="md">
          Notifications
        </Text>
        <HStack spacing={1}>
          <Menu>
            <MenuButton 
              as={IconButton} 
              icon={<FiFilter />} 
              size="xs" 
              variant="ghost" 
              aria-label="Filter notifications"
            />
            <MenuList>
              <MenuItem onClick={() => setShowUnreadOnly(!showUnreadOnly)}>
                <HStack>
                  <FiCheckCircle />
                  <Text>{showUnreadOnly ? 'Show All' : 'Unread Only'}</Text>
                </HStack>
              </MenuItem>
              <MenuItem onClick={() => setFilters({ source: 'SYSTEM' })}>
                System Notifications
              </MenuItem>
              <MenuItem onClick={() => setFilters({ source: 'BUSINESS_RULE' })}>
                Business Rules
              </MenuItem>
              <MenuItem onClick={() => setFilters({})}>
                Clear Filters
              </MenuItem>
            </MenuList>
          </Menu>
          
          {unreadCount > 0 && (
            <Tooltip label="Mark all as read">
              <IconButton
                icon={<FiCheckCircle />}
                size="xs"
                variant="ghost"
                colorScheme="green"
                onClick={handleMarkAllAsRead}
                aria-label="Mark all notifications as read"
              />
            </Tooltip>
          )}
        </HStack>
      </HStack>

      {/* Summary Stats */}
      {summary && (
        <HStack spacing={4} mb={3} p={2} bg={colors.bg.card} borderRadius="md">
          <VStack spacing={0} align="center">
            <Text fontSize="lg" fontWeight="bold" color={colors.text.primary}>
              {summary.totalCount}
            </Text>
            <Text fontSize="xs" color={colors.text.muted}>Total</Text>
          </VStack>
          <VStack spacing={0} align="center">
            <Text fontSize="lg" fontWeight="bold" color="blue.500">
              {summary.unreadCount}
            </Text>
            <Text fontSize="xs" color={colors.text.muted}>Unread</Text>
          </VStack>
          <VStack spacing={0} align="center">
            <Text fontSize="lg" fontWeight="bold" color="orange.500">
              {summary.highPriorityCount}
            </Text>
            <Text fontSize="xs" color={colors.text.muted}>High Priority</Text>
          </VStack>
        </HStack>
      )}

      <Divider mb={3} />

      {/* Notifications List */}
      <Box maxH="400px" overflowY="auto">
        {notificationsLoading || summaryLoading ? (
          <Flex justify="center" p={4}>
            <Spinner size="md" />
          </Flex>
        ) : notifications.length === 0 ? (
          <Text textAlign="center" color={colors.text.muted} p={4}>
            {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
          </Text>
        ) : (
          notifications.map(renderNotificationItem)
        )}
      </Box>
    </Box>
  );

  if (position === 'standalone') {
    return (
      <Card>
        <CardBody>
          <NotificationContent />
        </CardBody>
      </Card>
    );
  }

  return (
    <Popover isOpen={isOpen} onClose={onClose} placement="bottom-end">
      <PopoverTrigger>
        <NotificationTrigger />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverCloseButton />
        <PopoverBody p={4}>
          <NotificationContent />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter; 