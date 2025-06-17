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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { isOpen: showAdvanced, onToggle: toggleAdvanced } = useDisclosure();

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
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // This will integrate with your V2 agent service
      const response = await sendToAgentV2(userMessage.content);
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: response.message,
        sender: 'assistant',
        timestamp: new Date(),
        toolCalls: response.toolCalls,
        reasoning: response.reasoning,
        systemContext: response.systemContext
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    inputRef.current?.focus();
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input implementation would go here
  };

  // Mock function - replace with actual V2 agent integration
  const sendToAgentV2 = async (message: string): Promise<{
    message: string;
    toolCalls?: ToolCall[];
    reasoning?: ReasoningStep[];
    systemContext?: any;
  }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      message: `V2 Response to: "${message}"\n\nThis is a mock response from the V2 AI Agent. The actual implementation will use the ToolRegistryV2 and real GraphQL integration we just built.`,
      toolCalls: [
        {
          id: 'tool-1',
          tool: 'think',
          parameters: { reasoning_type: 'analysis', thought: 'Analyzing user request' },
          result: { confidence: 0.95, insights: ['User wants information', 'Should search data'] },
          status: 'completed',
          executionTime: 234
        }
      ],
      reasoning: [
        {
          type: 'planning',
          content: 'I need to understand what the user is asking for and plan my response.',
          confidence: 0.9,
          evidence: ['User message content', 'Previous conversation context']
        }
      ]
    };
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
            {isLoading && (
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
        {isLoading && (
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
            borderRadius="xl"
            disabled={isLoading}
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
              disabled={isLoading}
            />
          </Tooltip>
          
          <Button
            leftIcon={<FiSend />}
            onClick={handleSendMessage}
            isLoading={isLoading}
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