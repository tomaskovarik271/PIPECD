import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Textarea,
  Button,
  Text,
  Badge,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  Avatar
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useAgentV2 } from '../../../hooks/useAgentV2';
import type { AgentV2Message } from '../../../lib/graphql/agentV2Operations';

export function AIAgentChatV2() {
  const colors = useThemeColors();
  const [inputValue, setInputValue] = useState('');
  const [extendedThinking, setExtendedThinking] = useState(true);
  const [thinkingBudget, setThinkingBudget] = useState('THINK');
  const [useStreaming, setUseStreaming] = useState(true); // Enhanced multi-stage streaming now available
  const [error, setError] = useState<string | null>(null);

  // V2 Agent hook
  const {
    currentConversation,
    conversations,
    thoughts,
    isLoading,
    isSendingMessage,
    isStreaming,
    streamingContent,
    streamingThoughts,
    streamingStage,
    error: agentError,
    createConversation,
    sendMessage,
    sendMessageStream,
    setCurrentConversation,
    clearError
  } = useAgentV2();

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSendingMessage || isStreaming) return;

    const content = inputValue.trim();
    setInputValue('');
    setError(null);

    try {
      // Auto-create conversation if none exists
      if (!currentConversation) {
        await createConversation({
          enableExtendedThinking: extendedThinking,
          thinkingBudget: thinkingBudget,
          initialContext: {}
        });
      }

      if (useStreaming) {
        await sendMessageStream(
          content,
          currentConversation?.id,
          extendedThinking,
          thinkingBudget as 'MINIMAL' | 'STANDARD' | 'COMPREHENSIVE' | 'DEEP'
        );
      } else {
        await sendMessage({
          conversationId: currentConversation?.id,
          content,
          enableExtendedThinking: extendedThinking,
          thinkingBudget: thinkingBudget as 'MINIMAL' | 'STANDARD' | 'COMPREHENSIVE' | 'DEEP'
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render streaming message for current response
  const renderStreamingMessage = () => {
    if (!isStreaming) return null;

    return (
      <Box key="streaming-message" mb={4}>
        <HStack mb={2}>
          <Avatar size="sm" name="Claude V2" bg="purple.500" color="white" />
          <Text fontWeight="medium" color={colors.text.primary}>Claude Sonnet 4</Text>
          <Badge 
            colorScheme={
              streamingStage === 'initial' ? 'blue' : 
              streamingStage === 'thinking' ? 'orange' : 
              streamingStage === 'continuation' ? 'green' : 'gray'
            }
            size="sm"
          >
            {streamingStage === 'initial' && '📝 Responding'}
            {streamingStage === 'thinking' && '🧠 Deep Thinking'}
            {streamingStage === 'continuation' && '💭 Synthesizing'}
          </Badge>
        </HStack>
        
        <Box 
          bg={colors.bg.content} 
          p={4} 
          rounded="lg" 
          border="1px solid" 
          borderColor={colors.border.subtle}
        >
          {/* Stream the actual response content */}
          {streamingContent && (
            <Box mb={streamingThoughts.length > 0 ? 4 : 0}>
              <Text whiteSpace="pre-wrap">{streamingContent}</Text>
              <Text as="span" opacity={0.7} animation="blink 1s infinite">|</Text>
            </Box>
          )}
          
          {/* Stream thinking results as they come */}
          {streamingThoughts.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" color={colors.text.primary} mb={2}>
                🎯 Extended Thinking Process
              </Text>
              <VStack spacing={2} align="stretch">
                {streamingThoughts.map((thought, index) => (
                  <Box
                    key={index}
                    p={3}
                    bg={colors.bg.elevated}
                    border="1px solid"
                    borderColor={colors.border.subtle}
                    rounded="md"
                  >
                    <HStack justify="space-between" mb={2}>
                      <Badge size="sm" colorScheme="purple">
                        {thought.type?.toUpperCase() || 'REASONING'}
                      </Badge>
                      <Text fontSize="xs" opacity={0.7}>
                        Stage: {streamingStage}
                      </Text>
                    </HStack>
                    
                    {thought.metadata?.acknowledgment && (
                      <Text fontSize="sm" mb={2} fontStyle="italic" color={colors.text.secondary}>
                        🎯 {thought.metadata.acknowledgment}
                      </Text>
                    )}
                    
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      {thought.content}
                    </Text>
                    
                    {thought.strategy && (
                      <Text fontSize="sm" mt={2} p={2} bg={colors.bg.elevated} rounded="sm">
                        <strong>Strategy:</strong> {thought.strategy}
                      </Text>
                    )}
                    
                    {thought.concerns && (
                      <Text fontSize="sm" mt={2} p={2} bg={colors.bg.surface} rounded="sm">
                        <strong>Concerns:</strong> {thought.concerns}
                      </Text>
                    )}
                    
                    {thought.nextSteps && (
                      <Text fontSize="sm" mt={2} p={2} bg={colors.bg.elevated} rounded="sm">
                        <strong>Next Steps:</strong> {thought.nextSteps}
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <VStack spacing={0} height="100%" align="stretch" bg={colors.bg.app}>

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
            
            {renderStreamingMessage()}
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
                  <Text color={colors.text.secondary}>Thinking:</Text>
                  <Select
                    value={thinkingBudget}
                    onChange={(e) => setThinkingBudget(e.target.value)}
                    size="xs"
                    bg={colors.bg.input}
                    borderColor={colors.border.input}
                    color={colors.text.primary}
                    fontSize="xs"
                    width="100px"
                    variant="filled"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="THINK">Think</option>
                    <option value="THINK_HARD">Think Hard</option>
                    <option value="THINK_HARDER">Think Harder</option>
                    <option value="ULTRATHINK">Ultra Think</option>
                  </Select>
                </HStack>
                
                <HStack spacing={2}>
                  <Switch
                    isChecked={extendedThinking}
                    onChange={(e) => setExtendedThinking(e.target.checked)}
                    colorScheme="blue"
                    size="sm"
                  />
                  <Text color={colors.text.secondary}>Extended</Text>
                </HStack>
                
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
  );
} 