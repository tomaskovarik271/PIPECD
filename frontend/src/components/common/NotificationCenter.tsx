import React, { useState, useEffect } from 'react';
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
  Alert,
  AlertIcon,
  Divider,
  Link,
  useToast,
} from '@chakra-ui/react';
import { BellIcon, CheckIcon, DeleteIcon } from '@chakra-ui/icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { formatDistanceToNow } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';
import { gql } from 'graphql-request';
import { gqlClient } from '../../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../../lib/graphqlUtils';

// GraphQL queries and mutations
const GET_NOTIFICATIONS = gql`
  query GetMyNotifications($limit: Int, $offset: Int) {
    myNotifications(limit: $limit, offset: $offset) {
      notifications {
        id
        userId
        title
        message
        notificationType
        isRead
        readAt
        entityType
        entityId
        actionUrl
        metadata
        priority
        expiresAt
        createdAt
        updatedAt
      }
      totalCount
      unreadCount
    }
  }
`;

const GET_UNREAD_COUNT = gql`
  query GetUnreadNotificationCount {
    unreadNotificationCount
  }
`;

const MARK_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      isRead
      readAt
    }
  }
`;

const MARK_ALL_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;

// GraphQL response types
interface NotificationData {
  id: string;
  userId: string;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  readAt?: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  metadata: Record<string, any>;
  priority: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface GetNotificationsResponse {
  myNotifications: {
    notifications: NotificationData[];
    totalCount: number;
    unreadCount: number;
  };
}

interface GetUnreadCountResponse {
  unreadNotificationCount: number;
}

interface MarkAsReadResponse {
  markNotificationAsRead: {
    id: string;
    isRead: boolean;
    readAt?: string;
  };
}

interface MarkAllAsReadResponse {
  markAllNotificationsAsRead: number;
}

interface DeleteNotificationResponse {
  deleteNotification: boolean;
}

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const colors = useThemeColors();
  const toast = useToast();

  // Load notifications from GraphQL API
  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await gqlClient.request<GetNotificationsResponse>(GET_NOTIFICATIONS, {
        limit: 50,
        offset: 0
      });
      
      if (response.myNotifications) {
        setNotifications(response.myNotifications.notifications);
        setUnreadCount(response.myNotifications.unreadCount);
      }
    } catch (err: any) {
      console.error('[NotificationCenter] Error loading notifications:', err);
      let errorMessage = 'Failed to load notifications.';
      
      if (isGraphQLErrorWithMessage(err)) {
        errorMessage = err.response?.errors?.[0]?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load unread count (for when popover is closed)
  const loadUnreadCount = async () => {
    try {
      const response = await gqlClient.request<GetUnreadCountResponse>(GET_UNREAD_COUNT);
      setUnreadCount(response.unreadNotificationCount);
    } catch (err: any) {
      console.error('[NotificationCenter] Error loading unread count:', err);
    }
  };

  useEffect(() => {
    // Load unread count immediately
    loadUnreadCount();
    
    // Set up polling for unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Load full notifications when popover opens
  const handlePopoverOpen = () => {
    onOpen();
    loadNotifications();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await gqlClient.request<MarkAsReadResponse>(MARK_AS_READ, {
        id: notificationId
      });
      
      if (response.markNotificationAsRead) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, isRead: true, readAt: response.markNotificationAsRead.readAt }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        toast({
          title: 'Notification marked as read',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      console.error('[NotificationCenter] Error marking notification as read:', err);
      let errorMessage = 'Failed to mark notification as read';
      
      if (isGraphQLErrorWithMessage(err)) {
        errorMessage = err.response?.errors?.[0]?.message || errorMessage;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await gqlClient.request<MarkAllAsReadResponse>(MARK_ALL_AS_READ);
      
      if (typeof response.markAllNotificationsAsRead === 'number') {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
        
        toast({
          title: 'All notifications marked as read',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      console.error('[NotificationCenter] Error marking all notifications as read:', err);
      let errorMessage = 'Failed to mark all notifications as read';
      
      if (isGraphQLErrorWithMessage(err)) {
        errorMessage = err.response?.errors?.[0]?.message || errorMessage;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await gqlClient.request<DeleteNotificationResponse>(DELETE_NOTIFICATION, {
        id: notificationId
      });
      
      if (response.deleteNotification) {
        const notification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        toast({
          title: 'Notification deleted',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      console.error('[NotificationCenter] Error deleting notification:', err);
      let errorMessage = 'Failed to delete notification';
      
      if (isGraphQLErrorWithMessage(err)) {
        errorMessage = err.response?.errors?.[0]?.message || errorMessage;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return 'red';
      case 'NORMAL':
        return 'blue';
      case 'LOW':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'ACTIVITY_REMINDER':
        return 'Reminder';
      case 'ACTIVITY_OVERDUE':
        return 'Overdue';
      case 'DEAL_ASSIGNED':
        return 'Deal';
      case 'LEAD_ASSIGNED':
        return 'Lead';
      case 'SYSTEM_ANNOUNCEMENT':
        return 'System';
      default:
        return 'Notification';
    }
  };

  return (
    <Box className={className}>
      <Popover isOpen={isOpen} onOpen={handlePopoverOpen} onClose={onClose} placement="bottom-end">
        <PopoverTrigger>
          <Box position="relative" display="inline-block">
            <IconButton
              aria-label="Notifications"
              icon={<BellIcon />}
              variant="ghost"
              size="md"
              onClick={handlePopoverOpen}
            />
            {unreadCount > 0 && (
              <Badge
                position="absolute"
                top="-1"
                right="-1"
                colorScheme="red"
                borderRadius="full"
                fontSize="xs"
                minW="20px"
                h="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Box>
        </PopoverTrigger>
        
        <PopoverContent w="400px" maxH="500px" overflowY="auto">
          <PopoverHeader>
            <HStack justify="space-between" align="center">
              <Text fontWeight="bold">Notifications</Text>
              {unreadCount > 0 && (
                <Button size="sm" variant="ghost" onClick={handleMarkAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </HStack>
          </PopoverHeader>
          <PopoverCloseButton />
          
          <PopoverBody p={0}>
            {loading ? (
              <Box p={4} textAlign="center">
                <Spinner size="md" />
                <Text mt={2} fontSize="sm" color={colors.text.secondary}>
                  Loading notifications...
                </Text>
              </Box>
            ) : error ? (
              <Alert status="error" m={4}>
                <AlertIcon />
                <Text fontSize="sm">{error}</Text>
              </Alert>
            ) : notifications.length === 0 ? (
              <Box p={4} textAlign="center">
                <Text fontSize="sm" color={colors.text.secondary}>
                  No notifications
                </Text>
              </Box>
            ) : (
              <VStack spacing={0} align="stretch">
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <Box
                      p={3}
                      bg={notification.isRead ? 'transparent' : colors.bg.surface}
                      _hover={{ bg: colors.bg.elevated }}
                      transition="background-color 0.2s"
                    >
                      <HStack align="start" spacing={3}>
                        <VStack spacing={1} align="start" flex={1} minW={0}>
                          <HStack spacing={2} w="full">
                            <Badge
                              colorScheme={getPriorityColor(notification.priority)}
                              size="sm"
                            >
                              {getNotificationTypeLabel(notification.notificationType)}
                            </Badge>
                            {!notification.isRead && (
                              <Box
                                w={2}
                                h={2}
                                borderRadius="full"
                                bg="blue.500"
                                flexShrink={0}
                              />
                            )}
                          </HStack>
                          
                          <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                            {notification.title}
                          </Text>
                          
                          <Text fontSize="xs" color={colors.text.secondary} noOfLines={2}>
                            {notification.message}
                          </Text>
                          
                          <HStack spacing={2} w="full">
                            <Text fontSize="xs" color={colors.text.secondary}>
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </Text>
                            
                            {notification.actionUrl && (
                              <Link
                                as={RouterLink}
                                to={notification.actionUrl}
                                fontSize="xs"
                                color="blue.500"
                                onClick={onClose}
                              >
                                View
                              </Link>
                            )}
                          </HStack>
                        </VStack>
                        
                        <VStack spacing={1}>
                          {!notification.isRead && (
                            <IconButton
                              aria-label="Mark as read"
                              icon={<CheckIcon />}
                              size="xs"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification.id)}
                            />
                          )}
                          
                          <IconButton
                            aria-label="Delete notification"
                            icon={<DeleteIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDeleteNotification(notification.id)}
                          />
                        </VStack>
                      </HStack>
                    </Box>
                    
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </VStack>
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
}; 