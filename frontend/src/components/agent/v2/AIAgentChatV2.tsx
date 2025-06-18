import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Badge,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useAgentV2 } from '../../../hooks/useAgentV2';
import type { AgentV2Message } from '../../../lib/graphql/agentV2Operations';

export function AIAgentChatV2() {
  const colors = useThemeColors();
  const [inputValue, setInputValue] = useState('');
  const [extendedThinking, setExtendedThinking] = useState(true);
  const [thinkingBudget, setThinkingBudget] = useState('THINK');
  const [useStreaming, setUseStreaming] = useState(true);

  // V2 Agent hook
  const {
    currentConversation,
    conversations,
    thoughts,
    isLoading,
    isSendingMessage,
    isStreaming,
    streamingContent,
    error,
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

    try {
      if (useStreaming) {
        await sendMessageStream({
          conversationId: currentConversation?.id,
          content,
          enableExtendedThinking: extendedThinking,
          thinkingBudget: thinkingBudget
        });
      } else {
        await sendMessage({
          conversationId: currentConversation?.id,
          content,
          enableExtendedThinking: extendedThinking,
          thinkingBudget: thinkingBudget
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

  return (
    <VStack spacing={4} height="100%" align="stretch">
      {/* V2 Configuration Panel */}
      <Box 
        bg={colors.bg.elevated} 
        p={4} 
        borderRadius="md" 
        border="1px solid" 
        borderColor={colors.border.subtle}
      >
        <HStack spacing={6} wrap="wrap">
          <FormControl display="flex" alignItems="center" width="auto">
            <FormLabel htmlFor="extended-thinking" mb="0" color={colors.text.secondary}>
              Extended Thinking:
            </FormLabel>
            <Switch
              id="extended-thinking"
              isChecked={extendedThinking}
              onChange={(e) => setExtendedThinking(e.target.checked)}
              colorScheme="blue"
            />
          </FormControl>

          <FormControl display="flex" alignItems="center" width="auto">
            <FormLabel htmlFor="streaming" mb="0" color={colors.text.secondary}>
              Streaming:
            </FormLabel>
            <Switch
              id="streaming"
              isChecked={useStreaming}
              onChange={(e) => setUseStreaming(e.target.checked)}
              colorScheme="green"
            />
          </FormControl>

          <FormControl width="200px">
            <FormLabel color={colors.text.secondary} fontSize="sm">
              Thinking Budget:
            </FormLabel>
            <Select
              value={thinkingBudget}
              onChange={(e) => setThinkingBudget(e.target.value)}
              size="sm"
              bg={colors.bg.input}
            >
              <option value="STANDARD">Standard</option>
              <option value="THINK">Think</option>
              <option value="THINK_HARD">Think Hard</option>
              <option value="THINK_HARDER">Think Harder</option>
              <option value="ULTRATHINK">Ultra Think</option>
            </Select>
          </FormControl>

          <Badge colorScheme={useStreaming ? "green" : "blue"} variant="subtle">
            {useStreaming ? "Streaming Enabled" : "V2 Standard"}
          </Badge>
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
        borderRadius="md"
        border="1px solid"
        borderColor={colors.border.subtle}
        p={4}
        overflowY="auto"
        maxHeight="400px"
      >
        {!currentConversation || currentConversation.messages.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text color={colors.text.muted} fontSize="lg">
              👋 Welcome to AI Agent V2
            </Text>
            <Text color={colors.text.muted} fontSize="sm" mt={2}>
              Start a conversation to experience extended thinking capabilities
            </Text>
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {currentConversation.messages.map((message, index) => (
              <Box
                key={index}
                alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
                maxW="80%"
                bg={message.role === 'user' ? colors.interactive.default : colors.bg.surface}
                color={message.role === 'user' ? 'white' : colors.text.primary}
                p={3}
                borderRadius="lg"
                border={message.role === 'assistant' ? '1px solid' : 'none'}
                borderColor={colors.border.subtle}
              >
                <Text fontSize="sm" whiteSpace="pre-wrap">
                  {message.content}
                </Text>
                <Text
                  fontSize="xs"
                  color={message.role === 'user' ? 'whiteAlpha.700' : colors.text.muted}
                  mt={2}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Text>
              </Box>
            ))}
            
            {/* Streaming content indicator */}
            {isStreaming && streamingContent && (
              <Box
                alignSelf="flex-start"
                maxW="80%"
                bg={colors.bg.surface}
                color={colors.text.primary}
                p={3}
                borderRadius="lg"
                border="1px solid"
                borderColor={colors.border.subtle}
                opacity={0.8}
              >
                <HStack spacing={2} mb={2}>
                  <Spinner size="xs" color={colors.interactive.default} />
                  <Text fontSize="xs" color={colors.text.muted}>
                    Streaming response...
                  </Text>
                </HStack>
                <Text fontSize="sm" whiteSpace="pre-wrap">
                  {streamingContent}
                  <Text as="span" animation="pulse 1s infinite" color={colors.interactive.default}>
                    ▋
                  </Text>
                </Text>
              </Box>
            )}
          </VStack>
        )}
      </Box>

      {/* Input Area */}
      <VStack spacing={3} align="stretch">
        {!currentConversation && (
          <Button
            onClick={() => createConversation({
              enableExtendedThinking: extendedThinking,
              thinkingBudget: thinkingBudget,
              initialContext: {}
            })}
            bg={colors.interactive.default}
            color="white"
            _hover={{ bg: colors.interactive.hover }}
            isLoading={isLoading}
            loadingText="Creating conversation..."
          >
            Start New Conversation
          </Button>
        )}
        
        <HStack spacing={3}>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your CRM data..."
            bg={colors.bg.input}
            border="1px solid"
            borderColor={colors.border.input}
            flex="1"
            disabled={isSendingMessage || isStreaming || !currentConversation}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isSendingMessage || isStreaming || !currentConversation}
            bg={colors.interactive.default}
            color="white"
            _hover={{ bg: colors.interactive.hover }}
            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
            minW="100px"
            isLoading={isSendingMessage || isStreaming}
            loadingText={isStreaming ? "Streaming..." : "Sending..."}
          >
          {isSendingMessage || isStreaming ? (
            <Spinner size="sm" />
          ) : useStreaming ? (
            'Stream'
          ) : (
            'Send'
          )}
          </Button>
        </HStack>
      </VStack>

      {/* Phase 2 Status */}
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Text fontSize="sm">
          V2 Streaming Ready: Real-time Claude Sonnet 4 responses with extended thinking capabilities.
        </Text>
      </Alert>
    </VStack>
  );
} 