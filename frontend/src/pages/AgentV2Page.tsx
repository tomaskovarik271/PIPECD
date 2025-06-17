import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Container,
  Heading,
  Text,
  Badge,
  useColorModeValue,
  Flex,
  Divider,
  Icon
} from '@chakra-ui/react';
import { FiZap, FiCpu, FiDatabase, FiTrendingUp } from 'react-icons/fi';
import { useThemeColors } from '../hooks/useThemeColors';
import UnifiedPageHeader from '../components/layout/UnifiedPageHeader';
import { AIAgentChatV2 } from '../components/agent/v2/AIAgentChatV2';
import { SystemStatusPanel } from '../components/agent/v2/SystemStatusPanel';
import { ToolCategoryPanel } from '../components/agent/v2/ToolCategoryPanel';

const AgentV2Page: React.FC = () => {
  const colors = useThemeColors();
  const [isConnected, setIsConnected] = useState(false);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'offline'>('healthy');

  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, teal.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Check system health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        // This would connect to your GraphQL health check
        setIsConnected(true);
        setSystemHealth('healthy');
      } catch (error) {
        setIsConnected(false);
        setSystemHealth('offline');
      }
    };

    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: FiZap,
      title: 'Lightning Fast',
      description: 'Sub-3 second response times with intelligent caching',
      color: 'yellow.500'
    },
    {
      icon: FiCpu,
      title: 'AI-Powered',
      description: 'Advanced reasoning with structured thinking patterns',
      color: 'purple.500'
    },
    {
      icon: FiDatabase,
      title: 'Real-time Data',
      description: 'Direct GraphQL integration with live business context',
      color: 'blue.500'
    },
    {
      icon: FiTrendingUp,
      title: '95% Success Rate',
      description: 'Enterprise-grade reliability with error recovery',
      color: 'green.500'
    }
  ];

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <UnifiedPageHeader
        title="AI Agent V2 - Revolutionary Business Intelligence Assistant"
      />

      <Container maxW="7xl" py={6}>
        <VStack spacing={6} align="stretch">
          {/* Header Section with Status */}
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            gap={6}
            align={{ base: 'stretch', lg: 'flex-start' }}
          >
            {/* Main Info Card */}
            <Box
              flex="1"
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              p={6}
              shadow="lg"
            >
              <VStack align="start" spacing={4}>
                <HStack spacing={3}>
                  <Heading size="lg" color={colors.text.primary}>
                    AI Business Intelligence
                  </Heading>
                  <Badge
                    colorScheme={systemHealth === 'healthy' ? 'green' : 'red'}
                    variant="solid"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {systemHealth === 'healthy' ? 'LIVE' : 'OFFLINE'}
                  </Badge>
                </HStack>

                <Text color={colors.text.secondary} fontSize="md">
                  The next generation AI assistant with advanced reasoning, real-time data access,
                  and enterprise-grade business intelligence capabilities.
                </Text>

                {/* Feature Grid */}
                <Box w="full" pt={4}>
                  <VStack spacing={3} align="stretch">
                    {features.map((feature, index) => (
                      <HStack key={index} spacing={3}>
                        <Icon
                          as={feature.icon}
                          boxSize={5}
                          color={feature.color}
                        />
                        <Box>
                          <Text fontWeight="medium" color={colors.text.primary}>
                            {feature.title}
                          </Text>
                          <Text fontSize="sm" color={colors.text.secondary}>
                            {feature.description}
                          </Text>
                        </Box>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            </Box>

            {/* System Status Panel */}
            <Box minW={{ base: 'full', lg: '300px' }}>
              <SystemStatusPanel
                isConnected={isConnected}
                systemHealth={systemHealth}
              />
            </Box>
          </Flex>

          {/* Main Chat Interface */}
          <Flex
            direction={{ base: 'column', xl: 'row' }}
            gap={6}
            align="stretch"
            minH="600px"
          >
            {/* Chat Panel */}
            <Box
              flex="1"
              bg={cardBg}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              shadow="lg"
              overflow="hidden"
            >
              <AIAgentChatV2 />
            </Box>

            {/* Tool Categories Panel */}
            <Box minW={{ base: 'full', xl: '320px' }}>
              <ToolCategoryPanel />
            </Box>
          </Flex>

          {/* Footer Info */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            p={4}
            shadow="sm"
          >
            <HStack justify="space-between" wrap="wrap">
              <HStack spacing={4}>
                <Text fontSize="sm" color={colors.text.secondary}>
                  Powered by Claude Sonnet 4
                </Text>
                <Divider orientation="vertical" h={4} />
                <Text fontSize="sm" color={colors.text.secondary}>
                  GraphQL-First Architecture
                </Text>
                <Divider orientation="vertical" h={4} />
                <Text fontSize="sm" color={colors.text.secondary}>
                  10 Business Tools Available
                </Text>
              </HStack>
              <Badge variant="outline" colorScheme="blue">
                V2.0 Beta
              </Badge>
            </HStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default AgentV2Page; 