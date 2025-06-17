import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  Collapse,
  IconButton,
  Button,
  Tooltip,
  Divider,
  Progress,
  Code,
  useDisclosure
} from '@chakra-ui/react';
import {
  FiUser,
  FiCpu,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiTool
} from 'react-icons/fi';
import { useThemeColors } from '../../../hooks/useThemeColors';

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

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  toolCalls?: ToolCall[];
  reasoning?: ReasoningStep[];
  systemContext?: any;
}

interface Props {
  message: Message;
  showAdvanced: boolean;
}

export const MessageBubbleV2: React.FC<Props> = ({ message, showAdvanced }) => {
  const colors = useThemeColors();
  const { isOpen: showDetails, onToggle: toggleDetails } = useDisclosure();

  const userBg = useColorModeValue('blue.500', 'blue.600');
  const assistantBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const isUser = message.sender === 'user';

  const getToolStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle color="green" />;
      case 'failed':
        return <FiAlertCircle color="red" />;
      case 'executing':
        return <FiClock color="orange" />;
      default:
        return <FiTool color="gray" />;
    }
  };

  const getReasoningTypeColor = (type: string) => {
    switch (type) {
      case 'planning':
        return 'blue';
      case 'analysis':
        return 'purple';
      case 'decision':
        return 'green';
      case 'validation':
        return 'orange';
      case 'synthesis':
        return 'cyan';
      default:
        return 'gray';
    }
  };

  return (
    <HStack
      align="flex-start"
      justify={isUser ? 'flex-end' : 'flex-start'}
      w="full"
      spacing={3}
    >
      {/* Avatar */}
      {!isUser && (
        <Box
          w={8}
          h={8}
          borderRadius="full"
          bg="blue.500"
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <FiCpu size={16} />
        </Box>
      )}

      {/* Message Content */}
      <VStack
        align={isUser ? 'flex-end' : 'flex-start'}
        spacing={2}
        maxW="80%"
      >
        {/* Main Message Bubble */}
        <Box
          bg={isUser ? userBg : assistantBg}
          color={isUser ? 'white' : colors.text.primary}
          px={4}
          py={3}
          borderRadius="2xl"
          border={!isUser ? '1px' : 'none'}
          borderColor={borderColor}
          shadow={!isUser ? 'sm' : 'none'}
          position="relative"
        >
          <Text fontSize="sm" lineHeight="1.5" whiteSpace="pre-wrap">
            {message.content}
          </Text>
        </Box>

        {/* Metadata */}
        <HStack spacing={2} fontSize="xs" color={colors.text.secondary}>
          <Text>
            {message.timestamp.toLocaleTimeString()}
          </Text>
          
          {message.toolCalls && message.toolCalls.length > 0 && (
            <>
              <Text>•</Text>
              <Text>{message.toolCalls.length} tools used</Text>
            </>
          )}
          
          {message.reasoning && message.reasoning.length > 0 && (
            <>
              <Text>•</Text>
              <Text>{message.reasoning.length} reasoning steps</Text>
            </>
          )}
        </HStack>

        {/* Advanced Details */}
        {showAdvanced && !isUser && (message.toolCalls || message.reasoning) && (
          <VStack align="flex-start" w="full" spacing={3}>
                         {/* Toggle Details Button */}
             <Button
               leftIcon={showDetails ? <FiChevronUp /> : <FiChevronDown />}
               size="xs"
               variant="ghost"
               onClick={toggleDetails}
             >
               <Text fontSize="xs">
                 {showDetails ? 'Hide details' : 'Show details'}
               </Text>
             </Button>

            {/* Details Panel */}
            <Collapse in={showDetails} animateOpacity>
              <VStack
                align="flex-start"
                spacing={4}
                p={4}
                bg={assistantBg}
                border="1px"
                borderColor={borderColor}
                borderRadius="xl"
                w="full"
                maxW="500px"
              >
                {/* Reasoning Steps */}
                {message.reasoning && message.reasoning.length > 0 && (
                  <VStack align="flex-start" spacing={3} w="full">
                    <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                      🧠 Reasoning Process
                    </Text>
                    
                    {message.reasoning.map((step, index) => (
                      <Box key={index} w="full">
                        <HStack spacing={2} mb={2}>
                          <Badge
                            colorScheme={getReasoningTypeColor(step.type)}
                            variant="subtle"
                            fontSize="xs"
                          >
                            {step.type}
                          </Badge>
                          <Text fontSize="xs" color={colors.text.secondary}>
                            Confidence: {Math.round(step.confidence * 100)}%
                          </Text>
                        </HStack>
                        
                        <Text fontSize="sm" color={colors.text.primary} mb={2}>
                          {step.content}
                        </Text>
                        
                        {step.evidence && step.evidence.length > 0 && (
                          <VStack align="flex-start" spacing={1} ml={4}>
                            <Text fontSize="xs" color={colors.text.secondary} fontWeight="medium">
                              Evidence:
                            </Text>
                            {step.evidence.map((evidence, evidenceIndex) => (
                              <Text key={evidenceIndex} fontSize="xs" color={colors.text.secondary}>
                                • {evidence}
                              </Text>
                            ))}
                          </VStack>
                        )}
                        
                        {index < message.reasoning!.length - 1 && <Divider my={2} />}
                      </Box>
                    ))}
                  </VStack>
                )}

                {/* Tool Calls */}
                {message.toolCalls && message.toolCalls.length > 0 && (
                  <VStack align="flex-start" spacing={3} w="full">
                    <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                      🛠️ Tool Executions
                    </Text>
                    
                    {message.toolCalls.map((toolCall, index) => (
                      <Box key={toolCall.id} w="full">
                        <HStack spacing={2} mb={2}>
                          {getToolStatusIcon(toolCall.status)}
                          <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                            {toolCall.tool}
                          </Text>
                          <Badge
                            colorScheme={
                              toolCall.status === 'completed' ? 'green' :
                              toolCall.status === 'failed' ? 'red' :
                              toolCall.status === 'executing' ? 'orange' : 'gray'
                            }
                            variant="subtle"
                            fontSize="xs"
                          >
                            {toolCall.status}
                          </Badge>
                          {toolCall.executionTime && (
                            <Text fontSize="xs" color={colors.text.secondary}>
                              {toolCall.executionTime}ms
                            </Text>
                          )}
                        </HStack>

                        {/* Parameters */}
                        <Box mb={2}>
                          <Text fontSize="xs" color={colors.text.secondary} mb={1}>
                            Parameters:
                          </Text>
                          <Code fontSize="xs" p={2} borderRadius="md" w="full" display="block">
                            {JSON.stringify(toolCall.parameters, null, 2)}
                          </Code>
                        </Box>

                        {/* Results */}
                        {toolCall.result && (
                          <Box mb={2}>
                            <Text fontSize="xs" color={colors.text.secondary} mb={1}>
                              Result:
                            </Text>
                            <Code fontSize="xs" p={2} borderRadius="md" w="full" display="block">
                              {typeof toolCall.result === 'string' 
                                ? toolCall.result 
                                : JSON.stringify(toolCall.result, null, 2)
                              }
                            </Code>
                          </Box>
                        )}
                        
                        {index < message.toolCalls!.length - 1 && <Divider my={2} />}
                      </Box>
                    ))}
                  </VStack>
                )}
              </VStack>
            </Collapse>
          </VStack>
        )}
      </VStack>

      {/* User Avatar */}
      {isUser && (
        <Box
          w={8}
          h={8}
          borderRadius="full"
          bg="gray.400"
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <FiUser size={16} />
        </Box>
      )}
    </HStack>
  );
}; 