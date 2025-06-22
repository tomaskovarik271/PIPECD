import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Textarea,
  Button,
  Text,
  Badge,
  Switch,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  Tooltip,
  Collapse,
  Flex
} from '@chakra-ui/react';
import { ChevronRightIcon, TimeIcon } from '@chakra-ui/icons';
import { FiMessageSquare, FiClock } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useAgentV2 } from '../../../hooks/useAgentV2';
import type { AgentV2Conversation } from '../../../lib/graphql/agentV2Operations';
import ToolExecutionPanel from './ToolExecutionPanel';

export function AIAgentChatV2() {
  const colors = useThemeColors();
  const [inputValue, setInputValue] = useState('');
  const [useStreaming, setUseStreaming] = useState(true); // Enhanced multi-stage streaming now available
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  // V2 Agent hook
  const {
    currentConversation,
    conversations,
    isLoading,
    isSendingMessage,
    isStreaming,
    streamingContent,
    streamingStage,
    error,
    createConversation,
    sendMessage,
    sendMessageStream,
    setCurrentConversation,
    clearError,
    refetchConversations
  } = useAgentV2();

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSendingMessage || isStreaming) return;

    const content = inputValue.trim();
    setInputValue('');

    try {
      // Auto-create conversation if none exists
      if (!currentConversation) {
        await createConversation({
          initialContext: {}
        });
      }

      if (useStreaming) {
        await sendMessageStream({
          conversationId: currentConversation?.id,
          content
        });
      } else {
        await sendMessage({
          conversationId: currentConversation?.id,
          content
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Error is handled by the hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle history panel
  const toggleHistoryPanel = () => {
    setIsHistoryPanelOpen(prev => !prev);
    if (!isHistoryPanelOpen) {
      refetchConversations();
    }
  };

  // Handle conversation selection from history
  const handleSelectConversation = (conversation: AgentV2Conversation) => {
    setCurrentConversation(conversation);
    setIsHistoryPanelOpen(false);
  };

  // Get first few words of conversation for preview
  const getConversationPreview = (conversation: AgentV2Conversation): string => {
    const firstUserMessage = conversation.messages.find(msg => msg.role === 'user');
    if (!firstUserMessage) return 'New conversation';
    return firstUserMessage.content.length > 50 
      ? firstUserMessage.content.substring(0, 50) + '...'
      : firstUserMessage.content;
  };

  // Format relative time
  const formatRelativeTime = (date: Date | string): string => {
    const now = new Date();
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  return (
    <Flex height="100%" bg={colors.bg.app}>
      {/* Main Chat Area */}
      <VStack spacing={0} height="100%" align="stretch" flex="1" minW="0">

        {/* Header */}
        <Box
          bg={colors.bg.surface}
          borderBottom="1px solid"
          borderColor={colors.border.subtle}
          p={4}
        >
          <HStack justify="space-between" align="center">
            <VStack spacing={0} align="start">
              <Text fontSize="lg" fontWeight="600" color={colors.text.primary}>
                AI Agent V2
              </Text>
              <Text fontSize="sm" color={colors.text.secondary}>
                Claude Sonnet 4 with Advanced Thinking
              </Text>
            </VStack>
            
            <HStack spacing={2}>
              <Tooltip label={isHistoryPanelOpen ? "Hide Chat History" : "Show Chat History"}>
                <IconButton
                  icon={isHistoryPanelOpen ? <ChevronRightIcon /> : <TimeIcon />}
                  variant="ghost"
                  size="sm"
                  aria-label="Toggle History"
                  onClick={toggleHistoryPanel}
                />
              </Tooltip>
              <Tooltip label="Start New Chat">
                <Button
                  leftIcon={<FiMessageSquare size={16} />}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentConversation(null);
                    setInputValue('');
                  }}
                  isLoading={isLoading}
                  loadingText="Starting..."
                >
                  New Chat
                </Button>
              </Tooltip>
            </HStack>
          </HStack>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
            <Button
              size="sm"
              ml="auto"
              onClick={clearError}
              variant="ghost"
            >
              Dismiss
            </Button>
          </Alert>
        )}

        {/* Messages Area */}
        <Box
          flex="1"
          bg={colors.bg.content}
          overflowY="auto"
        >
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <VStack spacing={6} justify="center" minH="400px" px={6}>
              <VStack spacing={4}>
                <Box fontSize="32px">💭</Box>
                <Text fontSize="lg" fontWeight="500" color={colors.text.primary} textAlign="center">
                  How can I help you today?
                </Text>
                <Text color={colors.text.secondary} textAlign="center" maxW="500px" fontSize="sm">
                  I'm Claude Sonnet 4 with advanced thinking capabilities. Ask me anything about your business, CRM data, or strategy.
                </Text>
              </VStack>
            </VStack>
          ) : (
            <VStack spacing={0} align="stretch">
              {currentConversation.messages.map((message, index) => (
                <Box
                  key={index}
                  bg={message.role === 'user' ? colors.bg.surface : colors.bg.content}
                  borderTop={index > 0 ? "1px solid" : "none"}
                  borderColor={colors.border.subtle}
                >
                  <Box maxW="900px" mx="auto" px={6} py={6}>
                    <HStack spacing={4} alignItems="flex-start">
                      {/* Avatar */}
                      <Box
                        w={8}
                        h={8}
                        borderRadius="md"
                        bg={message.role === 'user' ? colors.interactive.default : colors.status.info}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Text color="white" fontSize="sm" fontWeight="600">
                          {message.role === 'user' ? 'U' : 'C'}
                        </Text>
                      </Box>
                      
                      <VStack spacing={3} align="stretch" flex="1" minW={0}>
                        {/* Message Content */}
                        <Box 
                          color={colors.text.primary}
                          lineHeight="1.7"
                          fontSize="sm"
                          sx={{
                            '& h1, & h2, & h3': { fontWeight: 'bold', marginBottom: 3, color: colors.text.primary },
                            '& h1': { fontSize: 'lg' },
                            '& h2': { fontSize: 'md' },
                            '& h3': { fontSize: 'sm' },
                            '& ul, & ol': { marginLeft: 6, marginBottom: 3 },
                            '& li': { marginBottom: 1 },
                            '& p': { marginBottom: 3 },
                            '& strong': { fontWeight: '600', color: colors.text.primary },
                            '& em': { fontStyle: 'italic' },
                            '& code': { 
                              backgroundColor: colors.bg.elevated, 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontSize: 'xs',
                              fontFamily: 'monospace',
                              color: colors.text.accent
                            },
                            '& pre': { 
                              backgroundColor: colors.bg.elevated, 
                              padding: 3, 
                              borderRadius: 'md',
                              overflowX: 'auto',
                              fontSize: 'xs',
                              border: '1px solid',
                              borderColor: colors.border.subtle
                            }
                          }}
                        >
                          {(() => {
                            // Check if this is the latest assistant message being streamed
                            const isLatestAssistantMessage = message.role === 'assistant' && 
                              index === currentConversation?.messages.length - 1;
                            const shouldShowStreamingContent = isStreaming && isLatestAssistantMessage && streamingContent;
                            
                            // Determine what content to show
                            const contentToShow = shouldShowStreamingContent ? streamingContent : message.content;
                            
                            // Show opening statement for messages with thinking
                            if (message.role === 'assistant' && message.thoughts && message.thoughts.length > 0 && 
                                message.thoughts.some((thought: any) => thought.metadata?.toolType === 'think')) {
                              return (
                                <ReactMarkdown>
                                  {contentToShow.split('\n').slice(0, 1).join('\n')}
                                </ReactMarkdown>
                              );
                            } else {
                              return <ReactMarkdown>{contentToShow}</ReactMarkdown>;
                            }
                          })()}
                          
                          {/* Show streaming indicator when actively streaming */}
                          {isStreaming && message.role === 'assistant' && 
                           index === currentConversation?.messages.length - 1 && (
                            <HStack spacing={2} mt={2}>
                              <Spinner size="xs" color={colors.interactive.default} />
                              <Text fontSize="xs" color={colors.text.muted}>
                                {streamingStage === 'initial' && 'Claude is responding...'}
                                {streamingStage === 'thinking' && 'Claude is thinking deeply...'}
                                {streamingStage === 'continuation' && 'Formulating response...'}
                              </Text>
                            </HStack>
                          )}
                        </Box>

                        {/* Thinking Process - Show BEFORE final analysis */}
                        {message.role === 'assistant' && message.thoughts && message.thoughts.length > 0 && 
                         message.thoughts.some((thought: any) => thought.metadata?.toolType === 'think' || 
                           (thought.metadata?.reasoning && thought.metadata.reasoning !== 'No reasoning provided')) && (
                          <Box mt={4}>
                            {/* Add a visual indicator above thinking */}
                            <Box mb={3} p={3} bg={colors.bg.elevated} borderRadius="md" border="1px solid" borderColor={colors.border.subtle}>
                              <HStack spacing={2} align="center">
                                <Box fontSize="lg">🧠</Box>
                                <Text fontSize="sm" color={colors.text.secondary} fontStyle="italic">
                                  Claude used structured thinking to analyze this question...
                                </Text>
                              </HStack>
                            </Box>
                            
                            <Box borderTop="2px solid" borderColor={colors.border.default} pt={3}>
                              <Text fontSize="sm" color={colors.text.secondary} mb={3} fontWeight="600">
                                💭 Thinking Process
                              </Text>
                              <VStack spacing={3} align="stretch">
                                {message.thoughts.map((thought: any, thoughtIndex: number) => (
                                  <Box
                                    key={thoughtIndex}
                                    bg={colors.bg.elevated}
                                    p={4}
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor={colors.border.subtle}
                                  >
                                    {thought.metadata?.toolType === 'think' ? (
                                      <VStack spacing={3} align="stretch">
                                        <HStack spacing={2} justify="space-between">
                                          <Text fontSize="sm" fontWeight="600" color={colors.text.primary}>
                                            🎯 Strategic Analysis
                                          </Text>
                                          <HStack spacing={2}>
                                            <Badge colorScheme="blue" size="sm">
                                              {thought.metadata.thinkingDepth}
                                            </Badge>
                                            <Badge colorScheme="green" size="sm">
                                              {Math.round((thought.metadata.confidenceLevel || 0) * 100)}% confidence
                                            </Badge>
                                          </HStack>
                                        </HStack>
                                        
                                        {thought.metadata.acknowledgment && (
                                          <Box>
                                            <Text fontSize="sm" fontWeight="600" color={colors.status.info} mb={2}>
                                              🎯 Question Analysis
                                            </Text>
                                            <Text fontSize="sm" color={colors.text.primary} lineHeight="1.5">
                                              {thought.metadata.acknowledgment}
                                            </Text>
                                          </Box>
                                        )}
                                        
                                        {thought.metadata.strategy && (
                                          <Box>
                                            <Text fontSize="sm" fontWeight="600" color={colors.status.info} mb={2}>
                                              📋 Strategy
                                            </Text>
                                            <Text fontSize="sm" color={colors.text.primary} lineHeight="1.5">
                                              {thought.metadata.strategy}
                                            </Text>
                                          </Box>
                                        )}
                                        
                                        {thought.metadata.concerns && (
                                          <Box>
                                            <Text fontSize="sm" fontWeight="600" color={colors.status.warning} mb={2}>
                                              ⚠️ Concerns
                                            </Text>
                                            <Text fontSize="sm" color={colors.text.primary} lineHeight="1.5">
                                              {thought.metadata.concerns}
                                            </Text>
                                          </Box>
                                        )}
                                        
                                        {thought.metadata.nextSteps && (
                                          <Box>
                                            <Text fontSize="sm" fontWeight="600" color={colors.status.success} mb={2}>
                                              ▶️ Next Steps
                                            </Text>
                                            <Text fontSize="sm" color={colors.text.primary} lineHeight="1.5">
                                              {thought.metadata.nextSteps}
                                            </Text>
                                          </Box>
                                        )}
                                      </VStack>
                                    ) : (
                                      <VStack spacing={2} align="stretch">
                                        <Text fontSize="sm" fontWeight="600" color={colors.text.primary}>
                                          {thought.type}: {thought.content}
                                        </Text>
                                        {thought.metadata && Object.keys(thought.metadata).length > 0 && (
                                          <Text fontSize="xs" color={colors.text.muted} fontFamily="monospace" bg={colors.bg.surface} p={2} borderRadius="md">
                                            {JSON.stringify(thought.metadata, null, 2)}
                                          </Text>
                                        )}
                                      </VStack>
                                    )}
                                  </Box>
                                ))}
                              </VStack>
                            </Box>
                          </Box>
                        )}

                        {/* Tool Executions - Show AFTER thinking process */}
                        {message.role === 'assistant' && (message as any).toolExecutions && (message as any).toolExecutions.length > 0 && (
                          <Box mt={4}>
                            <ToolExecutionPanel toolExecutions={(message as any).toolExecutions} />
                          </Box>
                        )}

                        {/* Final Analysis - Show AFTER thinking process */}
                        {message.role === 'assistant' && message.thoughts && message.thoughts.length > 0 && 
                         message.thoughts.some((thought: any) => thought.metadata?.toolType === 'think') && (() => {
                          const lines = message.content.split('\n');
                          const analysisStart = lines.findIndex(line => 
                            line.includes('Based on') || 
                            line.includes('Here are') ||
                            line.includes('analysis') ||
                            line.match(/^\d+\./) || // Numbered lists
                            line.includes('Pipeline') ||
                            line.includes('Audit') ||
                            line.includes('Implement') ||
                            line.includes('Strategy') ||
                            line.includes('Recommend')
                          );
                          
                          if (analysisStart > 0) {
                            return (
                              <Box mt={4} pt={3} borderTop="2px solid" borderColor={colors.border.default}>
                                <Text fontSize="sm" color={colors.text.secondary} mb={3} fontWeight="600">
                                  📋 Analysis & Recommendations
                                </Text>
                                <Box
                                  color={colors.text.primary}
                                  lineHeight="1.7"
                                  fontSize="sm"
                                  sx={{
                                    '& h1, & h2, & h3': { fontWeight: 'bold', marginBottom: 3, color: colors.text.primary },
                                    '& h1': { fontSize: 'lg' },
                                    '& h2': { fontSize: 'md' },
                                    '& h3': { fontSize: 'sm' },
                                    '& ul, & ol': { marginLeft: 6, marginBottom: 3 },
                                    '& li': { marginBottom: 1 },
                                    '& p': { marginBottom: 3 },
                                    '& strong': { fontWeight: '600', color: colors.text.primary },
                                    '& em': { fontStyle: 'italic' }
                                  }}
                                >
                                  <ReactMarkdown>
                                    {lines.slice(analysisStart).join('\n')}
                                  </ReactMarkdown>
                                </Box>
                              </Box>
                            );
                          }
                          return null;
                        })()}

                        {/* Timestamp */}
                        <Text fontSize="xs" color={colors.text.muted}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </Box>
              ))}
              

            </VStack>
          )}
        </Box>

        {/* Claude-style Input Area with Integrated Controls */}
        <Box
          borderTop="1px solid"
          borderColor={colors.border.subtle}
          bg={colors.bg.surface}
          p={4}
        >
          <Box maxW="900px" mx="auto">
            <VStack spacing={3}>
              {/* Controls Bar */}
              <HStack spacing={4} w="full" justify="space-between" fontSize="xs">
                <HStack spacing={3}>
                  <HStack spacing={2}>
                    <Switch
                      isChecked={useStreaming}
                      onChange={(e) => setUseStreaming(e.target.checked)}
                      colorScheme="green"
                      size="sm"
                    />
                    <Text color={useStreaming ? colors.text.secondary : colors.text.muted} fontSize="xs">
                      {useStreaming ? 'Multi-Stage Streaming' : 'Standard Response'}
                    </Text>
                  </HStack>
                  
                  {/* Start New Chat Button */}
                  {currentConversation && (
                    <Button
                      size="xs"
                      variant="ghost"
                      color={colors.text.secondary}
                      _hover={{ color: colors.text.primary }}
                      onClick={() => {
                        setCurrentConversation(null);
                        setInputValue('');
                      }}
                    >
                      Start New Chat
                    </Button>
                  )}
                </HStack>
                
                <Text color={colors.text.muted} fontSize="xs">
                  Claude Sonnet 4 with Think Tool
                </Text>
              </HStack>
              
              {/* Input Row */}
              <HStack spacing={3} w="full">
                <Textarea
                  value={inputValue}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message Claude..."
                  bg={colors.bg.input}
                  border="1px solid"
                  borderColor={colors.border.input}
                  color={colors.text.primary}
                  borderRadius="lg"
                  px={4}
                  py={3}
                  fontSize="sm"
                  resize="none"
                  minH="50px"
                  maxH="200px"
                  disabled={isSendingMessage || isStreaming}
                  flex="1"
                  _placeholder={{
                    color: colors.text.muted
                  }}
                  _focus={{
                    borderColor: colors.border.focus,
                    boxShadow: `0 0 0 1px ${colors.border.focus}`
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isSendingMessage || isStreaming}
                  bg={useStreaming ? colors.status.success : colors.interactive.default}
                  color="white"
                  _hover={{ bg: useStreaming ? colors.status.success : colors.interactive.hover, opacity: useStreaming ? 0.8 : 1 }}
                  _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
                  borderRadius="lg"
                  w="50px"
                  h="50px"
                  minW="50px"
                  isLoading={isSendingMessage || isStreaming}
                  title={useStreaming ? 'Send with Multi-Stage Streaming' : 'Send Standard Message'}
                >
                  {isSendingMessage || isStreaming ? (
                    <Spinner size="sm" />
                  ) : useStreaming ? (
                    '⚡'
                  ) : (
                    '↗'
                  )}
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      </VStack>

      {/* Collapsible Chat History Panel */}
      <Collapse in={isHistoryPanelOpen} animateOpacity>
        <Box
          w="350px"
          h="100vh"
          bg={colors.bg.surface}
          borderLeft="1px"
          borderColor={colors.border.subtle}
          display="flex"
          flexDirection="column"
        >
          {/* History Panel Header */}
          <Box
            px={4}
            py={3}
            borderBottom="1px"
            borderColor={colors.border.subtle}
          >
            <HStack justify="space-between">
              <HStack spacing={2}>
                <FiClock size={16} />
                <Text fontWeight="semibold" color={colors.text.primary}>Chat History</Text>
              </HStack>
              <IconButton
                icon={<ChevronRightIcon />}
                variant="ghost"
                size="sm"
                aria-label="Close History"
                onClick={toggleHistoryPanel}
              />
            </HStack>
          </Box>

          {/* History Panel Content */}
          <Box flex={1} overflow="auto" p={4}>
            {isLoading ? (
              <VStack spacing={4} py={8}>
                <Spinner size="lg" color={colors.interactive.default} />
                <Text color={colors.text.secondary} fontSize="sm">Loading conversations...</Text>
              </VStack>
            ) : conversations.filter(conv => conv.messages.length > 0).length === 0 ? (
              <VStack spacing={4} py={8} textAlign="center">
                <FiMessageSquare size={32} color={colors.text.muted} />
                <Text color={colors.text.secondary} fontSize="sm">No conversations yet</Text>
                <Text color={colors.text.muted} fontSize="xs">
                  Start a new conversation to see it appear here
                </Text>
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch">
                {conversations
                  .filter(conv => conv.messages.length > 0)
                  .map((conversation) => (
                    <Box
                      key={conversation.id}
                      bg={currentConversation?.id === conversation.id ? colors.bg.elevated : colors.bg.content}
                      border="1px solid"
                      borderColor={currentConversation?.id === conversation.id ? colors.interactive.default : colors.border.subtle}
                      borderRadius="lg"
                      p={3}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        bg: colors.bg.elevated,
                        borderColor: colors.interactive.hover,
                        transform: "translateY(-1px)"
                      }}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <VStack spacing={2} align="stretch">
                        {/* Conversation Preview */}
                        <Text 
                          fontSize="sm" 
                          color={colors.text.primary}
                          fontWeight={currentConversation?.id === conversation.id ? "600" : "normal"}
                          noOfLines={2}
                          lineHeight="1.4"
                        >
                          {getConversationPreview(conversation)}
                        </Text>
                        
                        {/* Message Count and Timestamp */}
                        <HStack justify="space-between" align="center">
                          <Badge 
                            colorScheme={currentConversation?.id === conversation.id ? "blue" : "gray"}
                            size="sm"
                            variant="subtle"
                          >
                            {conversation.messages.length} messages
                          </Badge>
                          <Text fontSize="xs" color={colors.text.muted}>
                            {formatRelativeTime(conversation.updatedAt)}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
              </VStack>
            )}
          </Box>
        </Box>
      </Collapse>
    </Flex>
  );
} 