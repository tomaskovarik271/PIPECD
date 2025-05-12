import { VStack, Text } from '@chakra-ui/react';
import { DealWithHistory } from '../../stores/useAppStore'; // Assuming DealWithHistory exports the history entry structure
import DealHistoryItem from './DealHistoryItem';

// We need the specific type for a single history entry from DealWithHistory
// This can be DealWithHistory['history'][number] if DealWithHistory is correctly typed
// Or we can import the generated GraphQLDealHistoryEntry type and build upon it.
// For now, let's use the structure from DealWithHistory['history'][number]

export type DealHistoryEntryDisplayItem = DealWithHistory['history'][number];

interface DealHistoryListProps {
  historyEntries: DealHistoryEntryDisplayItem[];
}

const DealHistoryList: React.FC<DealHistoryListProps> = ({ historyEntries }) => {
  if (!historyEntries || historyEntries.length === 0) {
    return <Text>No history available for this deal.</Text>;
  }

  return (
    <VStack spacing={4} align="stretch">
      {historyEntries.map((entry) => (
        <DealHistoryItem key={entry.id} entry={entry} />
      ))}
    </VStack>
  );
};

export default DealHistoryList; 