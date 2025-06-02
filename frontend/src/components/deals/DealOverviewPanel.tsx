import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';

interface DealOverviewPanelProps {
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const DealOverviewPanel: React.FC<DealOverviewPanelProps> = ({
  description,
  createdAt,
  updatedAt,
}) => {
  return (
    <>
      <Heading size="sm" mb={4} color="white">Deal Overview</Heading>
      <VStack spacing={3} align="stretch">
        {description && (
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="gray.400">Description</Text>
            <Text mt={1} fontSize="sm" color="gray.200" whiteSpace="pre-wrap">
              {description}
            </Text>
          </Box>
        )}
        <Flex justifyContent="space-between">
          <Text fontSize="sm" color="gray.400">Created On</Text>
          <Text fontSize="sm" color="gray.200">
            {new Date(createdAt).toLocaleString()}
          </Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text fontSize="sm" color="gray.400">Last Updated</Text>
          <Text fontSize="sm" color="gray.200">
            {new Date(updatedAt).toLocaleString()}
          </Text>
        </Flex>
      </VStack>
    </>
  );
}; 