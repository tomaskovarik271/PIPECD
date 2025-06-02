import React from 'react';
import {
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Link,
  Tag,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import type { Deal } from '../../stores/useDealsStore';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';

interface DealHeaderProps {
  deal: Deal;
}

export const DealHeader: React.FC<DealHeaderProps> = ({ deal }) => {
  const colors = useThemeColors();
  const styles = useThemeStyles();

  return (
    <Flex 
      direction={{ base: "column", md: "row" }}
      justifyContent="space-between" 
      alignItems={{ base: "flex-start", md: "center" }} 
      pb={4} 
      borderBottomWidth="1px" 
      borderColor={colors.border.default}
      mb={2}
      gap={2}
    >
      <VStack align="start" spacing={1}>
        <HStack spacing={1} color={colors.text.muted} fontSize="sm">
          <Link 
            as={RouterLink} 
            to="/deals" 
            color={colors.text.link}
            _hover={{ textDecoration: 'underline' }}
          >
            Deals
          </Link>
          <Text>&gt;</Text>
          <Text 
            noOfLines={1} 
            maxW={{ base: "200px", md: "300px" }} 
            title={deal.name} 
            color={colors.text.secondary}
          >
            {deal.name}
          </Text>
        </HStack>
        <Heading 
          size="xl" 
          color={colors.text.primary}
          noOfLines={1}
        >
          {deal.name}
        </Heading>
        <HStack spacing={2} mt={1}>
          {deal.currentWfmStep?.status?.name && (
            <Tag 
              size="sm" 
              variant="subtle" 
              colorScheme={deal.currentWfmStep.status.color?.toLowerCase() || 'gray'} 
              borderRadius="full" 
              px={3} 
              py={1}
              bg={colors.component.kanban.card}
              color={colors.text.primary}
            >
              {deal.currentWfmStep.status.name}
            </Tag>
          )}
          <Tag 
            size="sm" 
            variant="outline" 
            colorScheme="purple" 
            borderRadius="full" 
            px={3} 
            py={1} 
            borderColor={colors.interactive.default}
            color={colors.interactive.default}
          >
            Enterprise
          </Tag>
          <Tag 
            size="sm" 
            variant="outline" 
            colorScheme="orange" 
            borderRadius="full" 
            px={3} 
            py={1} 
            borderColor={colors.status.warning}
            color={colors.status.warning}
          >
            Urgent
          </Tag>
        </HStack>
      </VStack>
    </Flex>
  );
}; 