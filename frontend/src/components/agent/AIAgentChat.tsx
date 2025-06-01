/**
 * AI Agent Chat Component
 * Main chat interface for interacting with the autonomous AI agent
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Card,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  Divider,
  Badge,
  Tooltip,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react';
import { SettingsIcon, TimeIcon, DeleteIcon } from '@chakra-ui/icons';
import { FiSend, FiUser, FiCpu, FiActivity, FiMessageSquare, FiClock } from 'react-icons/fi';
import { useAgentStore } from '../../stores/useAgentStore';
import type { AgentMessage, AgentConversation } from '../../stores/useAgentStore';

export const AIAgentChat: React.FC = () => {
  const [messageInput, setMessageInput] = useState('');
  const [localCurrentConversation, setLocalCurrentConversation] = useState<AgentConversation | null>(null);
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [localIsSendingMessage, setLocalIsSendingMessage] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSendError, setLocalSendError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Modal for conversation history
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  
  // UI theme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const userMessageBg = useColorModeValue('blue.500', 'blue.600');
  const assistantMessageBg = useColorModeValue('gray.100', 'gray.700');
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localCurrentConversation?.messages?.length]);
  
  // Manual conversation creation
  const handleStartConversation = useCallback(async () => {
    setLocalIsLoading(true);
    setLocalError(null);
    
    try {
      const store = useAgentStore.getState();
      const newConversation = await store.createConversation();
      setLocalCurrentConversation(newConversation);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start conversation';
      setLocalError(errorMessage);
      console.error('Failed to start conversation:', error);
    } finally {
      setLocalIsLoading(false);
    }
  }, []);
  
  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || localIsSendingMessage) return;
    
    setLocalIsSendingMessage(true);
    setLocalSendError(null);
    
    const content = messageInput.trim();
    setMessageInput('');
    
    try {
      const store = useAgentStore.getState();
      
      // If no conversation exists, create one first
      let conversationId = localCurrentConversation?.id;
      let workingConversation = localCurrentConversation;
      
      if (!conversationId) {
        const newConversation = await store.createConversation();
        conversationId = newConversation.id;
        workingConversation = newConversation;
        setLocalCurrentConversation(newConversation);
      }
      
      await store.sendMessage({
        conversationId,
        content,
      });
      
      // Update local state with the updated conversation from store
      const updatedState = useAgentStore.getState();
      setLocalCurrentConversation(updatedState.currentConversation);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setLocalSendError(errorMessage);
      console.error('Failed to send message:', error);
    } finally {
      setLocalIsSendingMessage(false);
    }
  }, [messageInput, localIsSendingMessage, localCurrentConversation?.id]);
  
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  const formatTimestamp = useCallback((timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);
  
  const clearError = useCallback(() => {
    setLocalError(null);
    try {
      const store = useAgentStore.getState();
      store.clearError();
    } catch (error) {
      console.error('Failed to clear error:', error);
    }
  }, []);
  
  const clearSendError = useCallback(() => {
    setLocalSendError(null);
    try {
      const store = useAgentStore.getState();
      store.clearSendError();
    } catch (error) {
      console.error('Failed to clear send error:', error);
    }
  }, []);
  
  const toggleThinkingProcess = useCallback(() => {
    try {
      const store = useAgentStore.getState();
      store.toggleThinkingProcess();
    } catch (error) {
      console.error('Failed to toggle thinking process:', error);
    }
  }, []);
  
  // Load conversation history
  const loadConversationHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const store = useAgentStore.getState();
      await store.loadConversations();
      const updatedState = useAgentStore.getState();
      setConversations(updatedState.conversations);
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Handle conversation selection from history
  const handleSelectConversation = useCallback(async (conversation: AgentConversation) => {
    setLocalCurrentConversation(conversation);
    const store = useAgentStore.getState();
    store.setCurrentConversation(conversation);
    onHistoryClose();
  }, [onHistoryClose]);

  // Handle conversation deletion
  const handleDeleteConversation = useCallback(async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent conversation selection
    try {
      const store = useAgentStore.getState();
      await store.deleteConversation(conversationId);
      // Reload conversations after deletion
      await loadConversationHistory();
      // If we deleted the current conversation, clear it
      if (localCurrentConversation?.id === conversationId) {
        setLocalCurrentConversation(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }, [loadConversationHistory, localCurrentConversation?.id]);

  // Open history modal and load conversations
  const handleOpenHistory = useCallback(() => {
    onHistoryOpen();
    loadConversationHistory();
  }, [onHistoryOpen, loadConversationHistory]);
  
  const MessageComponent: React.FC<{ message: AgentMessage }> = React.memo(({ message }) => {
    const isUser = message.role === 'user';
    const Icon = isUser ? FiUser : FiCpu;
    
    return (
      <HStack
        align="start"
        spacing={3}
        justify={isUser ? 'flex-end' : 'flex-start'}
        mb={4}
      >
        {!isUser && (
          <Box
            p={2}
            borderRadius="full"
            bg="blue.500"
            color="white"
            minW="fit-content"
          >
            <Icon size={16} />
          </Box>
        )}
        
        <Card
          maxW="70%"
          bg={isUser ? userMessageBg : assistantMessageBg}
          color={isUser ? 'white' : undefined}
        >
          <CardBody py={3} px={4}>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" whiteSpace="pre-wrap">
                {message.content}
              </Text>
              
              {message.thoughts && message.thoughts.length > 0 && (
                <Box>
                  <Divider my={2} />
                  <HStack spacing={2}>
                    <FiActivity size={14} />
                    <Text fontSize="xs" opacity={0.8}>
                      {message.thoughts.length} thought{message.thoughts.length > 1 ? 's' : ''}
                    </Text>
                  </HStack>
                </Box>
              )}
              
              <Text fontSize="xs" opacity={0.7} alignSelf="flex-end">
                {formatTimestamp(message.timestamp)}
              </Text>
            </VStack>
          </CardBody>
        </Card>
        
        {isUser && (
          <Box
            p={2}
            borderRadius="full"
            bg="gray.500"
            color="white"
            minW="fit-content"
          >
            <Icon size={16} />
          </Box>
        )}
      </HStack>
    );
  });
  
  if (localError) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Error loading agent!</AlertTitle>
            <AlertDescription>{localError}</AlertDescription>
          </Box>
          <Button ml={4} size="sm" onClick={clearError}>
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box h="100vh" bg={bgColor} display="flex" flexDirection="column">
      {/* Header */}
      <Box
        bg={cardBg}
        borderBottom="1px"
        borderColor="gray.200"
        px={6}
        py={4}
      >
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Box p={2} borderRadius="full" bg="blue.500" color="white">
              <FiCpu size={20} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontWeight="semibold">AI Assistant</Text>
              <HStack spacing={2}>
                <Badge colorScheme="green" size="sm">
                  Active
                </Badge>
                {localIsSendingMessage && (
                  <HStack spacing={1}>
                    <Spinner size="xs" />
                    <Text fontSize="xs" color="gray.500">
                      Thinking...
                    </Text>
                  </HStack>
                )}
              </HStack>
            </VStack>
          </HStack>
          
          <HStack spacing={2}>
            <Tooltip label="Conversation History">
              <IconButton
                icon={<TimeIcon />}
                variant="ghost"
                size="sm"
                aria-label="History"
                onClick={handleOpenHistory}
              />
            </Tooltip>
            <Tooltip label="Toggle Thinking Process">
              <IconButton
                icon={<FiActivity size={16} />}
                variant="ghost"
                size="sm"
                aria-label="Thinking"
                onClick={toggleThinkingProcess}
              />
            </Tooltip>
            <Tooltip label="Agent Settings">
              <IconButton
                icon={<SettingsIcon />}
                variant="ghost"
                size="sm"
                aria-label="Settings"
              />
            </Tooltip>
          </HStack>
        </HStack>
      </Box>
      
      {/* Messages */}
      <Box flex={1} overflow="auto" p={6}>
        {localIsLoading ? (
          <VStack spacing={4} justify="center" h="100%">
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.500">Starting conversation...</Text>
          </VStack>
        ) : !localCurrentConversation ? (
          <VStack spacing={4} justify="center" h="100%">
            <Card bg={cardBg} maxW="md">
              <CardBody>
                <VStack spacing={4} textAlign="center">
                  <FiCpu size={48} color="gray" />
                  <Text fontWeight="semibold" color="gray.600" fontSize="lg">
                    Welcome to your AI Assistant
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    I'm here to help with your PipeCD workflows. I can assist with deals, 
                    contacts, activities, and much more. Ready to get started?
                  </Text>
                  <Button 
                    colorScheme="blue" 
                    size="lg"
                    onClick={handleStartConversation}
                    isLoading={localIsLoading}
                    loadingText="Starting..."
                  >
                    Start Conversation
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        ) : (
          <VStack spacing={0} align="stretch">
            {!localCurrentConversation?.messages?.length && (
              <Card bg={cardBg} mb={6}>
                <CardBody>
                  <VStack spacing={3} textAlign="center">
                    <FiCpu size={32} color="gray" />
                    <Text fontWeight="semibold" color="gray.600">
                      Conversation Started
                    </Text>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      What would you like to work on today?
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )}
            
            {localCurrentConversation?.messages?.map((message, index) => (
              <MessageComponent key={`${message.timestamp}-${index}`} message={message} />
            ))}
            
            {localSendError && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                <AlertDescription>{localSendError}</AlertDescription>
                <Button ml={4} size="sm" onClick={clearSendError}>
                  Dismiss
                </Button>
              </Alert>
            )}
            
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>
      
      {/* Message Input */}
      <Box
        bg={cardBg}
        borderTop="1px"
        borderColor="gray.200"
        p={6}
      >
        <HStack spacing={3}>
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              !localCurrentConversation 
                ? "Start a conversation to begin chatting..." 
                : "Type your message..."
            }
            disabled={localIsSendingMessage || localIsLoading || !localCurrentConversation}
            flex={1}
            bg="white"
            _dark={{ bg: 'gray.700' }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || localIsSendingMessage || localIsLoading || !localCurrentConversation}
            colorScheme="blue"
            size="md"
            leftIcon={<FiSend size={16} />}
            isLoading={localIsSendingMessage}
            loadingText="Sending"
          >
            Send
          </Button>
        </HStack>
      </Box>
      
      {/* Conversation History Modal */}
      <Modal isOpen={isHistoryOpen} onClose={onHistoryClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <FiClock size={20} />
              <Text>Conversation History</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoadingHistory ? (
              <VStack spacing={4} py={8}>
                <Spinner size="lg" color="blue.500" />
                <Text color="gray.500">Loading conversations...</Text>
              </VStack>
            ) : conversations.length === 0 ? (
              <VStack spacing={4} py={8} textAlign="center">
                <FiMessageSquare size={48} color="gray" />
                <Text color="gray.500" fontSize="lg">No conversations yet</Text>
                <Text color="gray.400" fontSize="sm">
                  Start a new conversation to see it appear here
                </Text>
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch">
                {conversations.map((conversation) => {
                  const lastMessage = conversation.messages[conversation.messages.length - 1];
                  const messageCount = conversation.messages.length;
                  const isCurrentConversation = localCurrentConversation?.id === conversation.id;
                  
                  return (
                    <Card
                      key={conversation.id}
                      cursor="pointer"
                      _hover={{ shadow: 'md' }}
                      onClick={() => handleSelectConversation(conversation)}
                      borderColor={isCurrentConversation ? 'blue.500' : 'gray.200'}
                      borderWidth={isCurrentConversation ? '2px' : '1px'}
                      bg={isCurrentConversation ? 'blue.50' : cardBg}
                      _dark={{ 
                        bg: isCurrentConversation ? 'blue.900' : 'gray.700',
                        borderColor: isCurrentConversation ? 'blue.400' : 'gray.600'
                      }}
                    >
                      <CardBody py={3}>
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={2} flex={1}>
                            <HStack spacing={2} wrap="wrap">
                              {isCurrentConversation && (
                                <Badge colorScheme="blue" size="sm">Current</Badge>
                              )}
                              <Badge variant="outline" size="sm">
                                {messageCount} message{messageCount !== 1 ? 's' : ''}
                              </Badge>
                            </HStack>
                            
                            {lastMessage && (
                              <Text
                                fontSize="sm"
                                color="gray.600"
                                _dark={{ color: 'gray.300' }}
                                noOfLines={2}
                              >
                                {lastMessage.role === 'user' ? '👤 ' : '🤖 '}
                                {lastMessage.content}
                              </Text>
                            )}
                            
                            <Text fontSize="xs" color="gray.500">
                              {new Date(conversation.updatedAt).toLocaleDateString()} at{' '}
                              {new Date(conversation.updatedAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </Text>
                          </VStack>
                          
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            aria-label="Delete conversation"
                            onClick={(e) => handleDeleteConversation(conversation.id, e)}
                            _hover={{ bg: 'red.100' }}
                            _dark={{ _hover: { bg: 'red.900' } }}
                          />
                        </HStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onHistoryClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 