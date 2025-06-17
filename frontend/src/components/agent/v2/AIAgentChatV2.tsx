import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Flex,
  Spinner,
  Badge,
  useColorModeValue,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  AlertIcon,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import {
  FiSend,
  FiMic,
  FiMicOff,
  FiRefreshCw,
  FiSettings,
  FiZap,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { MessageBubbleV2 } from './MessageBubbleV2';
import { ToolExecutionPanel } from './ToolExecutionPanel';
import { ConversationStarter } from './ConversationStarter';
import { useAgentV2, AgentV2Message } from '../../../hooks/useAgentV2';
import { useMutation } from '@apollo/client';
import { PROCESS_MESSAGE_V2 } from '../../../lib/graphql/agentV2Operations';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  toolCalls?: ToolCall[];
  reasoning?: ReasoningStep[];
  systemContext?: any;
}

interface ToolCall {
  id: string;
  tool: string;
  parameters: Record<string, any>;
  result?: any;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  executionTime?: number;
}

interface ReasoningStep {
  type: 'planning' | 'analysis' | 'decision' | 'validation' | 'synthesis';
  content: string;
  confidence: number;
  evidence?: string[];
}

export const AIAgentChatV2: React.FC = () => {
  const colors = useThemeColors();
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { isOpen: showAdvanced, onToggle: toggleAdvanced } = useDisclosure();
  
  // Use the real V2 agent service
  const { 
    messages, 
    isProcessing, 
    sendMessage, 
    clearMessages, 
    healthStatus,
    isHealthy
  } = useAgentV2();

  // Add direct GraphQL mutation for testing
  const [testMutation] = useMutation(PROCESS_MESSAGE_V2);

  const chatBg = useColorModeValue('gray.50', 'gray.900');
  const inputBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const messageContent = inputValue.trim();
    setInputValue('');

    try {
      // Use the real V2 agent service
      await sendMessage(messageContent, {
        useAdvancedReasoning: showAdvanced,
        maxToolCalls: 5,
        thinkingDepth: 'standard',
        responseStyle: 'professional'
      });
    } catch (error) {
      console.error('Error sending message to V2 agent:', error);
      // Error handling is done in the useAgentV2 hook
    }
  };

  // Add test function for direct GraphQL call
  const testDirectGraphQL = async () => {
    try {
      console.log('Testing direct GraphQL call...');
      const { data } = await testMutation({
        variables: {
          input: {
            message: "Test direct GraphQL call",
            conversationContext: {
              userId: "test-user",
              recentMessages: []
            },
            config: {
              useAdvancedReasoning: true,
              maxToolCalls: 5,
              thinkingDepth: "standard",
              responseStyle: "professional"
            }
          }
        }
      });
      
      console.log('Direct GraphQL response:', data);
      alert(`Direct GraphQL Success: ${data?.processMessageV2?.success}`);
    } catch (error) {
      console.error('Direct GraphQL error:', error);
      alert(`Direct GraphQL Error: ${error}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    clearMessages();
    inputRef.current?.focus();
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input implementation would go here
  };



  return (
    <VStack h="full" spacing={0}>
      {/* Chat Header */}
      <HStack
        w="full"
        p={4}
        borderBottom="1px"
        borderColor={borderColor}
        bg={inputBg}
        justify="space-between"
      >
        <HStack spacing={3}>
          <Box
            w={3}
            h={3}
            borderRadius="full"
            bg="green.500"
            shadow="0 0 8px green.500"
          />
          <Text fontWeight="medium" color={colors.text.primary}>
            AI Agent V2
          </Text>
          <Badge colorScheme="blue" variant="subtle">
            Claude Sonnet 4
          </Badge>
        </HStack>

        <HStack spacing={2}>
          <Tooltip label={showAdvanced ? "Hide Advanced" : "Show Advanced"}>
            <IconButton
              aria-label="Toggle advanced view"
              icon={showAdvanced ? <FiEyeOff /> : <FiEye />}
              size="sm"
              variant="ghost"
              onClick={toggleAdvanced}
            />
          </Tooltip>
          <Tooltip label="Clear conversation">
            <IconButton
              aria-label="Clear conversation"
              icon={<FiRefreshCw />}
              size="sm"
              variant="ghost"
              onClick={clearConversation}
            />
          </Tooltip>
          <Tooltip label="Settings">
            <IconButton
              aria-label="Settings"
              icon={<FiSettings />}
              size="sm"
              variant="ghost"
            />
          </Tooltip>
        </HStack>
      </HStack>

      {/* Advanced Panel */}
      <Collapse in={showAdvanced} animateOpacity>
        <Box w="full" bg={chatBg} borderBottom="1px" borderColor={borderColor}>
          <Alert status="info" variant="subtle">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="medium">
                Advanced Mode: You can see tool execution details and reasoning steps
              </Text>
              <Text fontSize="xs" color={colors.text.secondary}>
                This helps you understand how the AI agent processes your requests
              </Text>
            </VStack>
          </Alert>
        </Box>
      </Collapse>

      {/* Messages Area */}
      <Box
        flex="1"
        w="full"
        bg={chatBg}
        overflowY="auto"
        position="relative"
      >
        {messages.length === 0 ? (
          <ConversationStarter onSelectStarter={setInputValue} />
        ) : (
          <VStack spacing={4} p={4} align="stretch">
            {messages.map((message) => (
              <MessageBubbleV2
                key={message.id}
                message={message}
                showAdvanced={showAdvanced}
              />
            ))}
            
            {/* Loading indicator */}
            {isProcessing && (
              <HStack justify="center" py={4}>
                <Spinner size="sm" color="blue.500" />
                <Text fontSize="sm" color={colors.text.secondary}>
                  AI is thinking...
                </Text>
              </HStack>
            )}
            
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      {/* Input Area */}
      <VStack
        w="full"
        p={4}
        bg={inputBg}
        borderTop="1px"
        borderColor={borderColor}
        spacing={3}
      >
        {/* Tool Execution Panel (when tools are running) */}
        {isProcessing && (
          <ToolExecutionPanel
            currentTool="think"
            progress={0.7}
            estimatedTime="2s remaining"
          />
        )}

        <HStack w="full" spacing={3}>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your business data..."
            bg={chatBg}
            border="2px"
            borderColor={borderColor}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px blue.500'
            }}
            _hover={{
              borderColor: 'blue.300'
            }}
            size="lg"
            disabled={isProcessing}
            flex="1"
          />
          
          <Tooltip label={isListening ? "Stop listening" : "Voice input"}>
            <IconButton
              aria-label="Voice input"
              icon={isListening ? <FiMicOff /> : <FiMic />}
              size="lg"
              variant={isListening ? "solid" : "outline"}
              colorScheme={isListening ? "red" : "blue"}
              borderRadius="xl"
              onClick={toggleVoiceInput}
              disabled={isProcessing}
            />
          </Tooltip>
          
          <Button
            leftIcon={<FiSend />}
            onClick={handleSendMessage}
            isLoading={isProcessing}
            loadingText="Sending"
            colorScheme="blue"
            size="lg"
            borderRadius="xl"
            minW="100px"
            disabled={!inputValue.trim()}
            _hover={{
              transform: 'translateY(-1px)',
              shadow: 'lg'
            }}
            transition="all 0.2s"
          >
            Send
          </Button>
        </HStack>

        {/* Status indicators */}
        <HStack w="full" justify="space-between" fontSize="xs" color={colors.text.secondary}>
          <HStack spacing={4}>
            <HStack spacing={1}>
              <Box w={2} h={2} borderRadius="full" bg="green.500" />
              <Text>Connected</Text>
            </HStack>
            <HStack spacing={1}>
              <FiZap size={12} />
              <Text>Fast mode</Text>
            </HStack>
            <Text>10 tools available</Text>
          </HStack>
          
          <Text>
            Press Enter to send, Shift+Enter for new line
          </Text>
        </HStack>
      </VStack>
    </VStack>
  );
}; 