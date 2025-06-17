import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tooltip
} from '@chakra-ui/react';
import {
  FiCpu,
  FiHome,
  FiUsers,
  FiDollarSign,
  FiSettings,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash,
  FiDatabase
} from 'react-icons/fi';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface Tool {
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
}

interface ToolCategory {
  name: string;
  color: string;
  icon: any;
  tools: Tool[];
}

export const ToolCategoryPanel: React.FC = () => {
  const colors = useThemeColors();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const toolCategories: ToolCategory[] = [
    {
      name: 'Reasoning',
      color: 'purple',
      icon: FiCpu,
      tools: [
        {
          name: 'Think',
          description: 'Advanced structured reasoning with confidence scoring',
          icon: FiCpu,
          enabled: true
        }
      ]
    },
    {
      name: 'Organizations',
      color: 'blue',
      icon: FiHome,
      tools: [
        {
          name: 'Search Organizations',
          description: 'Find companies with fuzzy matching',
          icon: FiSearch,
          enabled: true
        },
        {
          name: 'Create Organization',
          description: 'Add new companies with duplicate checking',
          icon: FiPlus,
          enabled: true
        }
      ]
    },
    {
      name: 'Contacts',
      color: 'green',
      icon: FiUsers,
      tools: [
        {
          name: 'Search Contacts',
          description: 'Find people by name, email, or organization',
          icon: FiSearch,
          enabled: true
        },
        {
          name: 'Create Contact',
          description: 'Add new contacts with validation',
          icon: FiPlus,
          enabled: true
        }
      ]
    },
    {
      name: 'Deals',
      color: 'orange',
      icon: FiDollarSign,
      tools: [
        {
          name: 'Search Deals',
          description: 'Filter deals by multiple criteria',
          icon: FiSearch,
          enabled: true
        },
        {
          name: 'Create Deal',
          description: 'Create new deals with comprehensive validation',
          icon: FiPlus,
          enabled: true
        }
      ]
    },
    {
      name: 'System',
      color: 'gray',
      icon: FiSettings,
      tools: [
        {
          name: 'Get Dropdown Data',
          description: 'Fetch system metadata and options',
          icon: FiDatabase,
          enabled: true
        },
        {
          name: 'Get Details',
          description: 'Unified detail retrieval for any entity',
          icon: FiSearch,
          enabled: true
        }
      ]
    }
  ];

  return (
    <Box
      bg={cardBg}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      shadow="lg"
      overflow="hidden"
      h="fit-content"
    >
      <Box p={4} borderBottom="1px" borderColor={borderColor}>
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="medium" color={colors.text.primary}>
            Available Tools
          </Text>
          <Badge colorScheme="blue" variant="solid">
            10 Tools
          </Badge>
        </HStack>
      </Box>

      <Accordion allowMultiple defaultIndex={[0, 1, 2]}>
        {toolCategories.map((category, categoryIndex) => (
          <AccordionItem key={categoryIndex} border="none">
            <AccordionButton
              p={4}
              _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
            >
              <HStack flex="1" spacing={3}>
                <Box
                  p={2}
                  borderRadius="lg"
                  bg={`${category.color}.50`}
                  color={`${category.color}.500`}
                >
                  <Icon as={category.icon} size={16} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                    {category.name}
                  </Text>
                  <Text fontSize="xs" color={colors.text.secondary}>
                    {category.tools.length} tools
                  </Text>
                </VStack>
              </HStack>
              <AccordionIcon />
            </AccordionButton>

            <AccordionPanel pb={4} px={4}>
              <VStack spacing={3} align="stretch">
                {category.tools.map((tool, toolIndex) => (
                  <Tooltip
                    key={toolIndex}
                    label={tool.description}
                    placement="left"
                    hasArrow
                  >
                    <Box
                      p={3}
                      borderRadius="lg"
                      border="1px"
                      borderColor={borderColor}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        borderColor: `${category.color}.300`,
                        bg: useColorModeValue(`${category.color}.50`, `${category.color}.900`)
                      }}
                    >
                      <HStack spacing={3}>
                        <Icon
                          as={tool.icon}
                          color={tool.enabled ? `${category.color}.500` : 'gray.400'}
                          size={16}
                        />
                        <VStack align="start" spacing={0} flex="1">
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color={tool.enabled ? colors.text.primary : colors.text.secondary}
                          >
                            {tool.name}
                          </Text>
                          <Text
                            fontSize="xs"
                            color={colors.text.secondary}
                            noOfLines={2}
                          >
                            {tool.description}
                          </Text>
                        </VStack>
                        <Badge
                          colorScheme={tool.enabled ? 'green' : 'gray'}
                          variant="subtle"
                          fontSize="xs"
                        >
                          {tool.enabled ? 'Ready' : 'Disabled'}
                        </Badge>
                      </HStack>
                    </Box>
                  </Tooltip>
                ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Footer */}
      <Box p={4} borderTop="1px" borderColor={borderColor}>
        <VStack spacing={2}>
          <Text fontSize="xs" color={colors.text.secondary} textAlign="center">
            All tools use GraphQL-first architecture with advanced error recovery
          </Text>
          <HStack spacing={2}>
            <Badge variant="outline" colorScheme="green" fontSize="xs">
              95% Success Rate
            </Badge>
            <Badge variant="outline" colorScheme="blue" fontSize="xs">
              &lt;3s Response
            </Badge>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}; 