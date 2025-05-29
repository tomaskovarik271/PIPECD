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
import { Deal } from '../../stores/useDealsStore';

interface DealHeaderProps {
  deal: Deal;
}

export const DealHeader: React.FC<DealHeaderProps> = ({ deal }) => {
  return (
    <Flex 
      direction={{base: "column", md: "row"}}
      justifyContent="space-between" 
      alignItems={{base: "flex-start", md: "center"}} 
      pb={4} 
      borderBottomWidth="1px" 
      borderColor="gray.700"
      mb={2}
      gap={2}
    >
      <VStack align="start" spacing={1}>
        <HStack spacing={1} color="gray.400" fontSize="sm">
          <Link as={RouterLink} to="/deals" color="blue.400" _hover={{textDecoration: 'underline'}}>
            Deals
          </Link>
          <Text>&gt;</Text>
          <Text 
            noOfLines={1} 
            maxW={{base: "200px", md: "300px"}} 
            title={deal.name} 
            color="gray.200"
          >
            {deal.name}
          </Text>
        </HStack>
        <Heading size="xl" color="white" noOfLines={1}>
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
            borderColor="purple.500" 
            color="purple.400"
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
            borderColor="orange.500" 
            color="orange.400"
          >
            Urgent
          </Tag>
        </HStack>
      </VStack>
      <HStack spacing={2} mt={{base: 3, md: 0}} flexShrink={0}>
        {/* Action buttons can be added here if needed */}
      </HStack>
    </Flex>
  );
}; 