import { Box, Text, VStack, HStack, Avatar, UnorderedList, ListItem, chakra } from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { DealHistoryEntryDisplayItem } from './DealHistoryList'; // Import the type

interface DealHistoryItemProps {
  entry: DealHistoryEntryDisplayItem;
}

const fieldDisplayNames: Record<string, string> = {
  name: 'Name',
  stage_id: 'Stage',
  amount: 'Amount',
  expected_close_date: 'Expected Close Date',
  person_id: 'Person',
  organization_id: 'Organization',
  deal_specific_probability: 'Deal Specific Probability',
};

const formatFieldValue = (field: string, value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  switch (field) {
    case 'amount':
      return `$${Number(value).toLocaleString()}`;
    case 'deal_specific_probability':
      return `${Number(value) * 100}%`;
    case 'expected_close_date':
      try {
        return format(parseISO(value), 'MMM d, yyyy'); // Assuming ISO string
      } catch (e) {
        return String(value); // Fallback if not a valid date string
      }
    case 'stage_id':
    case 'person_id':
    case 'organization_id':
      return `${value}`; // Display ID, add (ID) for clarity if needed, or resolve name later
    default:
      return String(value);
  }
};

// Helper function to render changes
const renderChanges = (eventType: string, changes: any): JSX.Element | string => {
  if (eventType === 'DEAL_DELETED') {
    return 'This deal was deleted.';
  }
  if (!changes || Object.keys(changes).length === 0) {
    return 'No specific changes logged.';
  }

  if (eventType === 'DEAL_CREATED') {
    return (
      <UnorderedList spacing={1} styleType="none" ml={0}>
        {Object.entries(changes).map(([key, value]) => (
          <ListItem key={key}>
            <Text as="span" fontWeight="medium">{fieldDisplayNames[key] || key}:</Text> {formatFieldValue(key, value)}
          </ListItem>
        ))}
      </UnorderedList>
    );
  }

  if (eventType === 'DEAL_UPDATED') {
    return (
      <UnorderedList spacing={1} styleType="none" ml={0}>
        {Object.entries(changes).map(([key, value]: [string, any]) => (
          <ListItem key={key}>
            <Text as="span" fontWeight="medium">{fieldDisplayNames[key] || key}:</Text> 
            changed from "{formatFieldValue(key, value.oldValue)}" to "{formatFieldValue(key, value.newValue)}"
          </ListItem>
        ))}
      </UnorderedList>
    );
  }
  // Fallback for other event types or if structure is unexpected
  return <chakra.pre fontSize="xs" fontFamily="mono">{JSON.stringify(changes, null, 2)}</chakra.pre>;
};

const DealHistoryItem: React.FC<DealHistoryItemProps> = ({ entry }) => {
  const userName = entry.user?.display_name || 'System Action';
  // Placeholder for avatar, replace with actual avatar URL if available
  const userAvatarSrc = entry.user?.display_name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.user.display_name)}&background=random&color=fff` : undefined;

  let eventDescription = 'made changes to this deal.';
  if (entry.eventType === 'DEAL_CREATED') eventDescription = 'created this deal.';
  if (entry.eventType === 'DEAL_UPDATED') eventDescription = 'updated this deal.';
  if (entry.eventType === 'DEAL_DELETED') eventDescription = 'deleted this deal.';

  return (
    <Box borderWidth="1px" borderRadius="md" p={4} bg="white" shadow="sm">
      <HStack spacing={3} align="start">
        <Avatar size="sm" name={userName} src={userAvatarSrc} mt={1} />
        <VStack align="start" spacing={1} flex={1}>
          <HStack justifyContent="space-between" w="full">
            <Text fontWeight="bold" fontSize="sm">{userName}</Text>
            <Text fontSize="xs" color="gray.500">
              {format(parseISO(entry.createdAt), 'MMM d, yyyy, h:mm a')} 
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.700">
            {eventDescription}
          </Text>
          {entry.changes && (
            <Box pt={1} fontSize="sm">
              {renderChanges(entry.eventType, entry.changes)}
            </Box>
          )}
        </VStack>
      </HStack>
    </Box>
  );
};

export default DealHistoryItem; 