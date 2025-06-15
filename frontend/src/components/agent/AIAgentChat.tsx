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
  Code,
} from '@chakra-ui/react';
import { SettingsIcon, TimeIcon, DeleteIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { FiSend, FiUser, FiCpu, FiActivity, FiMessageSquare, FiClock, FiTool, FiEye, FiZap, FiTarget } from 'react-icons/fi';

import { useNavigate } from 'react-router-dom';
import { useAgentStore } from '../../stores/useAgentStore';
import type { AgentMessage, AgentConversation, AgentThought } from '../../stores/useAgentStore';
import { gql } from '@apollo/client';
import { apolloClient } from '../../lib/apolloClient';
// Enhanced AI Agent Components
import { EnhancedResponse } from './enhanced';
import type { SuggestedAction } from './enhanced';

// GraphQL query for real-time thought polling
const GET_AGENT_THOUGHTS = gql`
  query GetAgentThoughts($conversationId: ID!, $limit: Int) {
    agentThoughts(conversationId: $conversationId, limit: $limit) {
      id
      conversationId
      type
      content
      metadata
      timestamp
    }
  }
`;

// Thought Details Component for showing complete autonomous behavior
const ThoughtDetailsComponent: React.FC<{ thoughts: AgentMessage['thoughts'] }> = React.memo(({ thoughts }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const thoughtBg = useColorModeValue('gray.50', 'gray.800');
  const tooltipBg = useColorModeValue('blue.500', 'blue.600');
  const reasoningBg = useColorModeValue('gray.50', 'gray.700');
  const reasoningColor = useColorModeValue('gray.800', 'gray.200');
  
  if (!thoughts || thoughts.length === 0) {
    return null;
  }

  const getThoughtIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'reasoning': return <FiZap size={12} />;
      case 'tool_call': return <FiTool size={12} />;
      case 'observation': return <FiEye size={12} />;
      case 'plan': return <FiTarget size={12} />;
      default: return <FiActivity size={12} />;
    }
  };

  const getThoughtColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'reasoning': return 'purple';
      case 'tool_call': return 'blue';
      case 'observation': return 'green';
      case 'plan': return 'orange';
      default: return 'gray';
    }
  };

  // Count different types of steps for better summary
  const stepCounts = thoughts.reduce((acc, thought) => {
    const type = thought.type.toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box mt={3}>
      <Divider my={2} />
      
      {/* Improved Thoughts Summary */}
      <HStack 
        spacing={2} 
        cursor="pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
        _hover={{ bg: thoughtBg }}
        p={2}
        borderRadius="md"
        transition="all 0.2s"
      >
        <FiActivity size={14} color="gray" />
        <VStack align="start" spacing={0} flex={1}>
          <Text fontSize="xs" opacity={0.8}>
            {thoughts.length} processing step{thoughts.length > 1 ? 's' : ''}
          </Text>
          <HStack spacing={1}>
            {Object.entries(stepCounts).map(([type, count]) => (
              <Badge 
                key={type} 
                size="xs" 
                colorScheme={getThoughtColor(type)}
                variant="subtle"
              >
                {count} {type}
              </Badge>
            ))}
          </HStack>
        </VStack>
        <Tooltip label={isExpanded ? "Hide technical details" : "Show technical details"} bg={tooltipBg}>
          <HStack spacing={1} fontSize="xs" color="gray.500">
            <Text>Technical details</Text>
            {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </HStack>
        </Tooltip>
      </HStack>

      {/* Expanded Thoughts Details - Only show when explicitly requested */}
      {isExpanded && (
        <VStack align="stretch" spacing={3} mt={3} pl={4} borderLeft="2px" borderColor="blue.200">
          {thoughts.map((thought, idx) => (
            <Card key={thought.id || idx} size="sm" bg={thoughtBg}>
              <CardBody p={3}>
                <VStack align="stretch" spacing={2}>
                  {/* Thought Header */}
                  <HStack spacing={2}>
                    <Badge 
                      colorScheme={getThoughtColor(thought.type)} 
                      size="sm"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      {getThoughtIcon(thought.type)}
                      {thought.type}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(thought.timestamp).toLocaleTimeString()}
                    </Text>
                  </HStack>

                  {/* Thought Content */}
                  <Text fontSize="xs" whiteSpace="pre-wrap">
                    {thought.content}
                  </Text>

                  {/* Only show raw metadata for debugging when expanded */}
                  {thought.metadata && Object.keys(thought.metadata).length > 0 && (
                    <Box>
                      <Text fontSize="xs" fontWeight="semibold" color="gray.600" mb={1}>
                        Technical Details:
                      </Text>
                      <SimpleGrid columns={1} spacing={1}>
                        {/* Tool Call Details */}
                        {thought.metadata.toolName && (
                          <HStack spacing={2} fontSize="xs">
                            <Text fontWeight="medium" color="blue.600">Tool:</Text>
                            <Code colorScheme="blue" fontSize="xs">{thought.metadata.toolName}</Code>
                          </HStack>
                        )}
                        
                        {/* Parameters - Collapsed by default */}
                        {thought.metadata.parameters && (
                          <VStack align="stretch" spacing={1}>
                            <Text fontWeight="medium" color="green.600" fontSize="xs">Parameters:</Text>
                            <Code p={2} fontSize="xs" maxH="80px" overflow="auto">
                              {JSON.stringify(thought.metadata.parameters, null, 2)}
                            </Code>
                          </VStack>
                        )}

                        {/* Tool Results - Show when technical details are expanded */}
                        {thought.metadata.result && (
                          <VStack align="stretch" spacing={1}>
                            <Text fontWeight="medium" color="purple.600" fontSize="xs">Formatted Result:</Text>
                            <Code p={2} fontSize="xs" maxH="80px" overflow="auto">
                              {typeof thought.metadata.result === 'string' 
                                ? thought.metadata.result 
                                : JSON.stringify(thought.metadata.result, null, 2)}
                            </Code>
                          </VStack>
                        )}

                        {/* Raw Data - Show the actual JSON data returned from tool */}
                        {thought.metadata.rawData && (
                          <VStack align="stretch" spacing={1}>
                            <Text fontWeight="medium" color="orange.600" fontSize="xs">Raw Data:</Text>
                            <Code p={2} fontSize="xs" maxH="120px" overflow="auto">
                              {JSON.stringify(thought.metadata.rawData, null, 2)}
                            </Code>
                          </VStack>
                        )}

                        {/* Confidence Score */}
                        {thought.metadata.confidence && (
                          <HStack spacing={2} fontSize="xs">
                            <Text fontWeight="medium" color="orange.600">Confidence:</Text>
                            <Badge colorScheme={
                              thought.metadata.confidence > 0.8 ? 'green' : 
                              thought.metadata.confidence > 0.6 ? 'yellow' : 'red'
                            }>
                              {Math.round(thought.metadata.confidence * 100)}%
                            </Badge>
                          </HStack>
                        )}

                        {/* Reasoning */}
                        {thought.metadata.reasoning && (
                          <VStack align="stretch" spacing={1}>
                            <Text fontWeight="medium" color="gray.600" fontSize="xs">Reasoning:</Text>
                            <Text 
                              fontSize="xs" 
                              p={2} 
                              bg={reasoningBg}
                              color={reasoningColor}
                              borderRadius="md" 
                              fontStyle="italic"
                            >
                              {thought.metadata.reasoning}
                            </Text>
                          </VStack>
                        )}

                        {/* Next Actions */}
                        {thought.metadata.nextActions && thought.metadata.nextActions.length > 0 && (
                          <VStack align="stretch" spacing={1}>
                            <Text fontWeight="medium" color="blue.600" fontSize="xs">Next Actions:</Text>
                            <VStack align="stretch" spacing={1} pl={2}>
                              {thought.metadata.nextActions.map((action: string, actionIdx: number) => (
                                <HStack key={actionIdx} spacing={2} fontSize="xs">
                                  <Text color="blue.500">•</Text>
                                  <Text>{action}</Text>
                                </HStack>
                              ))}
                            </VStack>
                          </VStack>
                        )}
                      </SimpleGrid>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
});

ThoughtDetailsComponent.displayName = 'ThoughtDetailsComponent';

export const AIAgentChat: React.FC = () => {
  const [messageInput, setMessageInput] = useState('');
  const [localCurrentConversation, setLocalCurrentConversation] = useState<AgentConversation | null>(null);
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [localIsSendingMessage, setLocalIsSendingMessage] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSendError, setLocalSendError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [realTimeThoughts, setRealTimeThoughts] = useState<AgentThought[]>([]);
  const [isPollingThoughts, setIsPollingThoughts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Navigation hook
  const navigate = useNavigate();
  
  // Modal for conversation history
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  
  // UI theme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const userMessageBg = useColorModeValue('blue.500', 'blue.600');
  const assistantMessageBg = useColorModeValue('gray.100', 'gray.700');
  const reasoningBg = useColorModeValue('gray.50', 'gray.700');
  const reasoningColor = useColorModeValue('gray.800', 'gray.200');
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localCurrentConversation?.messages?.length]);
  
  // Real-time thought polling during message sending
  const pollThoughts = useCallback(async (conversationId: string) => {
    try {
      const { data } = await apolloClient.query({
        query: GET_AGENT_THOUGHTS,
        variables: { conversationId, limit: 100 },
        fetchPolicy: 'network-only', // Always fetch fresh data
      });
      
      if (data?.agentThoughts) {
        setRealTimeThoughts(data.agentThoughts.map((thought: any) => ({
          ...thought,
          timestamp: new Date(thought.timestamp),
        })));
      }
    } catch (error) {
      console.warn('Failed to poll thoughts:', error);
    }
  }, []);

  // Start/stop polling when sending message
  useEffect(() => {
    if (localIsSendingMessage && localCurrentConversation?.id) {
      setIsPollingThoughts(true);
      setRealTimeThoughts([]); // Clear previous thoughts
      
      // Start polling every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        pollThoughts(localCurrentConversation.id);
      }, 2000);
      
      // Initial poll
      pollThoughts(localCurrentConversation.id);
    } else {
      // Stop polling
      setIsPollingThoughts(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setRealTimeThoughts([]); // Clear real-time thoughts when done
    }
    
    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [localIsSendingMessage, localCurrentConversation?.id, pollThoughts]);
  
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

  // Handle enhanced response actions
  const handleEnhancedAction = useCallback((action: SuggestedAction) => {
    switch (action.action) {
      case 'navigate':
        if (action.target) {
          navigate(action.target);
        }
        break;
      case 'copy':
        if (action.payload?.value) {
          navigator.clipboard.writeText(String(action.payload.value));
        }
        break;
      case 'create':
      case 'edit':
      case 'view':
        console.log('Action triggered:', action);
        // Implement additional action handling as needed
        break;
      default:
        console.log('Unknown action:', action);
    }
  }, [navigate]);

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
    
    // Move all theme-related hooks to component level
    const codeBlockBg = useColorModeValue('gray.100', 'gray.700');
    const blockquoteBg = useColorModeValue('blue.50', 'blue.900');
    const blockquoteBorder = useColorModeValue('blue.500', 'blue.400');
    const strongColor = useColorModeValue('gray.800', 'white');
    
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
              {isUser ? (
                <Text fontSize="sm" whiteSpace="pre-wrap">
                  {message.content}
                </Text>
              ) : (
                <EnhancedResponse
                  content={message.content}
                  thoughts={message.thoughts}
                  onAction={handleEnhancedAction}
                />
              )}
              
              {!isUser && <ThoughtDetailsComponent thoughts={message.thoughts} />}
              
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

  MessageComponent.displayName = 'MessageComponent';
  
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
                    {isPollingThoughts && realTimeThoughts.length > 0 ? (
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">
                          Working... ({realTimeThoughts.length} steps)
                        </Text>
                        {realTimeThoughts.length > 0 && (
                          <Text fontSize="xs" color="blue.600">
                            {realTimeThoughts[realTimeThoughts.length - 1]?.metadata?.toolName 
                              ? `🔧 ${realTimeThoughts[realTimeThoughts.length - 1].metadata.toolName}`
                              : realTimeThoughts[realTimeThoughts.length - 1]?.type.toLowerCase()
                            }
                          </Text>
                        )}
                      </VStack>
                    ) : (
                      <Text fontSize="xs" color="gray.500">
                        Thinking...
                      </Text>
                    )}
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
            <Tooltip label="Start New Chat">
              <Button
                leftIcon={<FiMessageSquare size={16} />}
                variant="ghost"
                size="sm"
                onClick={handleStartConversation}
                isLoading={localIsLoading}
                loadingText="Starting..."
              >
                New Chat
              </Button>
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
            
            {/* Real-time thought display during message sending */}
            {isPollingThoughts && realTimeThoughts.length > 0 && (
              <Card bg={cardBg} mb={4} borderColor="blue.200" borderWidth="2px">
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <HStack spacing={2}>
                      <Spinner size="sm" color="blue.500" />
                      <Text fontWeight="semibold" color="blue.600">
                        AI Assistant is working...
                      </Text>
                      <Badge colorScheme="blue" size="sm">
                        {realTimeThoughts.length} step{realTimeThoughts.length > 1 ? 's' : ''}
                      </Badge>
                    </HStack>
                    
                    <VStack align="stretch" spacing={2} pl={4} borderLeft="2px" borderColor="blue.200">
                      {realTimeThoughts.slice(-5).map((thought, idx) => (
                        <HStack key={thought.id || idx} spacing={3}>
                          <Box>
                            {thought.type === 'TOOL_CALL' ? (
                              <FiTool size={14} color="blue" />
                            ) : thought.type === 'REASONING' ? (
                              <FiZap size={14} color="purple" />
                            ) : thought.type === 'OBSERVATION' ? (
                              <FiEye size={14} color="green" />
                            ) : (
                              <FiActivity size={14} color="gray" />
                            )}
                          </Box>
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack spacing={2}>
                              <Badge 
                                colorScheme={
                                  thought.type === 'TOOL_CALL' ? 'blue' :
                                  thought.type === 'REASONING' ? 'purple' :
                                  thought.type === 'OBSERVATION' ? 'green' : 'gray'
                                }
                                size="xs"
                              >
                                {thought.type.toLowerCase()}
                              </Badge>
                              <Text fontSize="xs" color="gray.500">
                                {new Date(thought.timestamp).toLocaleTimeString()}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.700" _dark={{ color: 'gray.300' }}>
                              {thought.content}
                            </Text>
                            {thought.metadata?.toolName && (
                              <Text fontSize="xs" color="blue.600">
                                🔧 {thought.metadata.toolName}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      ))}
                      
                      {realTimeThoughts.length > 5 && (
                        <Text fontSize="xs" color="gray.500" fontStyle="italic" textAlign="center">
                          ... and {realTimeThoughts.length - 5} more steps
                        </Text>
                      )}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
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