import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Heading, Text, VStack } from '@chakra-ui/react';
import { AIAgentChatV2 } from '../components/agent/v2/AIAgentChatV2';
import { useThemeColors } from '../hooks/useThemeColors';

export function AgentV2Page() {
  const colors = useThemeColors();

  return (
    <Box bg={colors.bg.app} minH="100vh" p={6}>
      <VStack spacing={6} align="stretch" maxW="1200px" mx="auto">
        {/* Navigation Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/deals" color={colors.text.muted}>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color={colors.text.primary}>
              AI Agent V2
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Page Header */}
        <VStack spacing={3} align="start">
          <Heading size="lg" color={colors.text.primary}>
            AI Agent V2 - Extended Thinking
          </Heading>
          <Text color={colors.text.muted} fontSize="md">
            Claude Sonnet 4 with Think Tool for structured reasoning, strategic analysis, and business intelligence.
          </Text>
        </VStack>

        {/* V2 Agent Chat Interface */}
        <Box 
          bg={colors.bg.surface} 
          borderRadius="lg" 
          border="1px solid" 
          borderColor={colors.border.default} 
          minH="600px"
          p={4}
        >
          <AIAgentChatV2 />
        </Box>
      </VStack>
    </Box>
  );
} 