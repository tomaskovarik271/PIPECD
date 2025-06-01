/**
 * AI Agent Chat Component
 * Main chat interface for interacting with the autonomous AI agent
 */

import React, { useState, useEffect, useRef } from 'react';
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
} from '@chakra-ui/react';
import { ChatIcon, SettingsIcon, TimeIcon } from '@chakra-ui/icons';
import { FiSend, FiUser, FiCpu, FiActivity } from 'react-icons/fi';
import { useAgentStore, useCurrentConversation, useAgentLoading, useAgentErrors } from '../../stores/useAgentStore';
import type { AgentMessage } from '../../stores/useAgentStore';

export const AIAgentChat: React.FC = () => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Store state
  const currentConversation = useCurrentConversation();
  const { isSendingMessage, isLoading } = useAgentLoading();
  const { error, sendError } = useAgentErrors();
  
  // Store actions
  const { 
    sendMessage, 
    createConversation, 
    clearError, 
    clearSendError,
    toggleThinkingProcess,
  } = useAgentStore();
  
  // UI theme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const userMessageBg = useColorModeValue('blue.500', 'blue.600');
  const assistantMessageBg = useColorModeValue('gray.100', 'gray.700');
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);
  
  // Start a new conversation if none exists
  useEffect(() => {
    if (!currentConversation && !isLoading) {
      createConversation().catch(console.error);
    }
  }, [currentConversation, isLoading, createConversation]);
  
  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSendingMessage) return;
    
    const content = messageInput.trim();
    setMessageInput('');
    
    try {
      await sendMessage({
        conversationId: currentConversation?.id,
        content,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const formatTimestamp = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const MessageComponent: React.FC<{ message: AgentMessage }> = ({ message }) => {
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
  };
  
  if (error) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Error loading agent!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
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
                {isSendingMessage && (
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
        {isLoading ? (
          <VStack spacing={4} justify="center" h="100%">
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.500">Starting conversation...</Text>
          </VStack>
        ) : (
          <VStack spacing={0} align="stretch">
            {!currentConversation?.messages?.length && (
              <Card bg={cardBg} mb={6}>
                <CardBody>
                  <VStack spacing={3} textAlign="center">
                    <FiCpu size={32} color="gray" />
                    <Text fontWeight="semibold" color="gray.600">
                      Welcome to your AI Assistant
                    </Text>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      I'm here to help with your PipeCD workflows. I can assist with deals, 
                      contacts, activities, and much more. What would you like to work on?
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )}
            
            {currentConversation?.messages?.map((message, index) => (
              <MessageComponent key={index} message={message} />
            ))}
            
            {sendError && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                <AlertDescription>{sendError}</AlertDescription>
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
            placeholder="Type your message..."
            disabled={isSendingMessage || isLoading}
            flex={1}
            bg="white"
            _dark={{ bg: 'gray.700' }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSendingMessage || isLoading}
            colorScheme="blue"
            size="md"
            leftIcon={<FiSend size={16} />}
            isLoading={isSendingMessage}
            loadingText="Sending"
          >
            Send
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}; 