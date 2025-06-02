import React from 'react';
import {
  Box,
  Center,
  Flex,
  Heading,
  Icon,
  Text,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import DealHistoryList, { DealHistoryEntryDisplayItem } from './DealHistoryList';

interface DealHistoryPanelProps {
  historyEntries?: DealHistoryEntryDisplayItem[] | null;
}

export const DealHistoryPanel: React.FC<DealHistoryPanelProps> = ({
  historyEntries,
}) => {
  const hasHistory = historyEntries && historyEntries.length > 0;

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="sm" color="white">Deal History</Heading>
      </Flex>
      
      {hasHistory ? (
        <Box bg="gray.750" p={4} borderRadius="lg" borderWidth="1px" borderColor="gray.600">
          <DealHistoryList historyEntries={historyEntries} />
        </Box>
      ) : (
        <Center minH="100px" flexDirection="column" bg="gray.750" borderRadius="md" p={4}>
          <Icon as={InfoIcon} w={6} h={6} color="gray.500" mb={3} />
          <Text color="gray.400" fontSize="sm">No history found for this deal.</Text>
        </Center>
      )}
    </>
  );
}; 