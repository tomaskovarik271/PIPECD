import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useColorModeValue,
  Icon,
  SimpleGrid,
  Card,
  CardBody
} from '@chakra-ui/react';
import {
  FiSearch,
  FiPlus,
  FiBarChart,
  FiTrendingUp,
  FiUsers,
  FiHome
} from 'react-icons/fi';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface Props {
  onSelectStarter: (prompt: string) => void;
}

interface StarterPrompt {
  icon: any;
  title: string;
  description: string;
  prompt: string;
  category: 'search' | 'create' | 'analyze';
  color: string;
}

export const ConversationStarter: React.FC<Props> = ({ onSelectStarter }) => {
  const colors = useThemeColors();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const starters: StarterPrompt[] = [
    {
      icon: FiSearch,
      title: "Find High-Value Deals",
      description: "Search for deals over $50k in the pipeline",
      prompt: "Show me all deals worth more than $50,000",
      category: 'search',
      color: 'blue.500'
    },
    {
      icon: FiPlus,
      title: "Create New Deal",
      description: "Set up a new deal with contacts and organization",
      prompt: "Help me create a new deal for Microsoft Office 365 renewal worth $75,000",
      category: 'create',
      color: 'green.500'
    },
    {
      icon: FiBarChart,
      title: "Pipeline Analysis",
      description: "Get insights about current pipeline performance",
      prompt: "Analyze my current sales pipeline and show key metrics",
      category: 'analyze',
      color: 'purple.500'
    },
    {
      icon: FiTrendingUp,
      title: "Find Closing Deals",
      description: "See deals closing this month",
      prompt: "What deals are scheduled to close this month?",
      category: 'search',
      color: 'orange.500'
    },
    {
      icon: FiUsers,
      title: "Contact Management",
      description: "Find or create contacts for organizations",
      prompt: "Find all contacts at Google and show their associated deals",
      category: 'search',
      color: 'cyan.500'
    },
    {
      icon: FiHome,
      title: "Organization Insights",
      description: "Get detailed information about companies",
      prompt: "Tell me everything about Salesforce including all deals and contacts",
      category: 'analyze',
      color: 'teal.500'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'search':
        return 'blue';
      case 'create':
        return 'green';
      case 'analyze':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <VStack spacing={6} p={6} h="full" justify="center">
      {/* Header */}
      <VStack spacing={2} textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" color={colors.text.primary}>
          Welcome to AI Agent V2
        </Text>
        <Text fontSize="md" color={colors.text.secondary} maxW="500px">
          I'm your intelligent business assistant with advanced reasoning and real-time data access. 
          Choose a starter below or ask me anything about your business.
        </Text>
      </VStack>

      {/* Starter Prompts Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} w="full" maxW="800px">
        {starters.map((starter, index) => (
          <Card
            key={index}
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            shadow="sm"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              shadow: 'md',
              transform: 'translateY(-2px)',
              borderColor: starter.color
            }}
            onClick={() => onSelectStarter(starter.prompt)}
          >
            <CardBody p={4}>
              <VStack spacing={3} align="start">
                <HStack spacing={3}>
                  <Box
                    p={2}
                    borderRadius="lg"
                    bg={`${getCategoryColor(starter.category)}.50`}
                    color={starter.color}
                  >
                    <Icon as={starter.icon} size={20} />
                  </Box>
                  <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                    {starter.title}
                  </Text>
                </HStack>

                <Text fontSize="xs" color={colors.text.secondary} lineHeight="1.4">
                  {starter.description}
                </Text>

                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme={getCategoryColor(starter.category)}
                  fontSize="xs"
                  h={6}
                  w="full"
                  justifyContent="flex-start"
                >
                  Try this prompt →
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Quick Examples */}
      <Box
        bg={cardBg}
        border="1px"
        borderColor={borderColor}
        borderRadius="xl"
        p={4}
        w="full"
        maxW="600px"
      >
        <VStack spacing={3}>
          <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
            💡 Quick Examples
          </Text>
          
          <VStack spacing={2} w="full">
            {[
              "Show me deals assigned to John Smith",
              "Create a contact for jane.doe@acme.com at Acme Corp",
              "What's the total value of deals in the software industry?"
            ].map((example, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                w="full"
                justifyContent="flex-start"
                fontSize="xs"
                color={colors.text.secondary}
                _hover={{
                  color: colors.text.primary,
                  bg: useColorModeValue('gray.50', 'gray.700')
                }}
                onClick={() => onSelectStarter(example)}
              >
                "{example}"
              </Button>
            ))}
          </VStack>
        </VStack>
      </Box>
    </VStack>
  );
}; 