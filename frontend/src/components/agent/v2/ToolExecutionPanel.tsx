import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Collapse,
  IconButton,
  Card,
  CardBody,
  Code,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FiSettings, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface ToolExecution {
  id: string;
  name: string;
  input: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  executionTime: number;
  timestamp: string;
  status: 'SUCCESS' | 'ERROR';
}

interface ToolExecutionPanelProps {
  toolExecutions: ToolExecution[];
}

const ToolExecutionPanel: React.FC<ToolExecutionPanelProps> = ({ toolExecutions }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  // Move all color mode hooks to top level - REQUIRED by React hooks rules
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const successColor = useColorModeValue('green.500', 'green.400');
  const errorColor = useColorModeValue('red.500', 'red.400');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');
  const toolBg = useColorModeValue('white', 'gray.800');
  const detailsBg = useColorModeValue('gray.50', 'gray.900');
  const codeBg = useColorModeValue('white', 'gray.800');
  const settingsColor = useColorModeValue('blue.500', 'blue.400');

  // Debug logging
  console.log('ToolExecutionPanel - toolExecutions:', toolExecutions);
  toolExecutions.forEach((tool, index) => {
    console.log(`Tool ${index}:`, {
      id: tool.id,
      name: tool.name,
      status: tool.status,
      hasResult: !!tool.result,
      resultType: typeof tool.result,
      result: tool.result,
      hasError: !!tool.error,
      error: tool.error
    });
  });

  const toggleToolExpansion = (toolId: string) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId);
    } else {
      newExpanded.add(toolId);
    }
    setExpandedTools(newExpanded);
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!toolExecutions || toolExecutions.length === 0) {
    return null;
  }

  return (
    <Card bg={bgColor} border="1px" borderColor={borderColor} mb={4}>
      <CardBody p={3}>
        <HStack 
          cursor="pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
          justify="space-between"
          _hover={{ bg: hoverBg }}
          p={2}
          borderRadius="md"
        >
          <HStack spacing={3}>
            <IconButton
              aria-label="Toggle tool executions"
              icon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
              variant="ghost"
              size="sm"
              minW="auto"
              h="auto"
            />
            <FiSettings size={20} color={settingsColor} />
            <Text fontWeight="medium" fontSize="sm">
              Tool Executions ({toolExecutions.length})
            </Text>
            <HStack spacing={1}>
              {toolExecutions.map((tool) => (
                <Badge 
                  key={tool.id}
                  colorScheme={tool.status === 'SUCCESS' ? 'green' : 'red'}
                  variant="subtle"
                  fontSize="xs"
                >
                  {tool.name}
                </Badge>
              ))}
            </HStack>
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme="blue" variant="outline" fontSize="xs">
              {formatExecutionTime(toolExecutions.reduce((total, tool) => total + tool.executionTime, 0))} total
            </Badge>
          </HStack>
        </HStack>

        <Collapse in={isExpanded} animateOpacity>
          <VStack spacing={3} mt={3} align="stretch">
            {toolExecutions.map((tool, index) => (
              <Box key={tool.id}>
                <HStack 
                  justify="space-between" 
                  p={3} 
                  bg={toolBg}
                  borderRadius="md"
                  border="1px"
                  borderColor={borderColor}
                >
                  <HStack spacing={3}>
                    <IconButton
                      aria-label={`Toggle ${tool.name} details`}
                      icon={expandedTools.has(tool.id) ? <ChevronDownIcon /> : <ChevronRightIcon />}
                      variant="ghost"
                      size="xs"
                      onClick={() => toggleToolExpansion(tool.id)}
                    />
                    {tool.status === 'SUCCESS' ? (
                      <FiCheckCircle size={20} color={successColor} />
                    ) : (
                      <FiXCircle size={20} color={errorColor} />
                    )}
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="semibold" fontSize="sm">
                        {tool.name}
                      </Text>
                      <HStack spacing={2} fontSize="xs" color="gray.500">
                        <HStack spacing={1}>
                          <FiClock />
                          <Text>{formatExecutionTime(tool.executionTime)}</Text>
                        </HStack>
                        <Text>•</Text>
                        <Text>{formatTimestamp(tool.timestamp)}</Text>
                      </HStack>
                    </VStack>
                  </HStack>
                  <Badge 
                    colorScheme={tool.status === 'SUCCESS' ? 'green' : 'red'}
                    variant="solid"
                    fontSize="xs"
                  >
                    {tool.status.toUpperCase()}
                  </Badge>
                </HStack>

                <Collapse in={expandedTools.has(tool.id)} animateOpacity>
                  <Box 
                    mt={2} 
                    p={3} 
                    bg={detailsBg}
                    borderRadius="md"
                    border="1px"
                    borderColor={borderColor}
                  >
                    <VStack align="stretch" spacing={3}>
                      {/* Input Parameters */}
                      <Box>
                        <Text fontWeight="medium" fontSize="sm" mb={2}>
                          Input Parameters:
                        </Text>
                        <Code 
                          display="block" 
                          whiteSpace="pre-wrap" 
                          p={2} 
                          fontSize="xs"
                          bg={codeBg}
                        >
                          {JSON.stringify(tool.input, null, 2)}
                        </Code>
                      </Box>

                      <Divider />

                      {/* Result or Error */}
                      <Box>
                        <Text fontWeight="medium" fontSize="sm" mb={2}>
                          {tool.status === 'SUCCESS' ? 'Result:' : 'Error:'}
                        </Text>
                        <Code 
                          display="block" 
                          whiteSpace="pre-wrap" 
                          p={2} 
                          fontSize="xs"
                          bg={codeBg}
                          color={tool.status === 'ERROR' ? errorColor : undefined}
                        >
                          {tool.status === 'SUCCESS' 
                            ? (typeof tool.result === 'string' 
                                ? tool.result 
                                : JSON.stringify(tool.result, null, 2))
                            : tool.error
                          }
                        </Code>
                      </Box>
                    </VStack>
                  </Box>
                </Collapse>

                {index < toolExecutions.length - 1 && <Divider mt={3} />}
              </Box>
            ))}
          </VStack>
        </Collapse>
      </CardBody>
    </Card>
  );
};

export default ToolExecutionPanel; 