import React from 'react';
import { Box, Text, HStack, Button, Tag } from '@chakra-ui/react';

// Example type - replace with generated GraphQL types
interface PriceQuoteSummary {
  id: string;
  name?: string | null;
  version_number: number;
  status: string;
  final_offer_price_fop?: number | null;
  updated_at: string; // or Date
}

interface PriceQuoteListItemProps {
  quote: PriceQuoteSummary;
  onSelect: (quoteId: string) => void;
  onDelete: (quoteId: string) => void; // Optional: if deletion is possible from list item
}

const PriceQuoteListItem: React.FC<PriceQuoteListItemProps> = ({ quote, onSelect, onDelete }) => {
  return (
    <Box p={3} borderWidth="1px" borderRadius="md" _hover={{ shadow: 'md', bg: 'gray.50' }} cursor="pointer">
      <HStack justifyContent="space-between">
        <Box onClick={() => onSelect(quote.id)} flexGrow={1}>
          <Text fontWeight="bold">{quote.name || 'Unnamed Quote'} (v{quote.version_number})</Text>
          <Text fontSize="sm">
            Status: <Tag size="sm" colorScheme={quote.status === 'proposed' ? 'green' : 'gray'}>{quote.status}</Tag> | 
            FOP: {quote.final_offer_price_fop ? `$${quote.final_offer_price_fop.toFixed(2)}` : 'N/A'} | 
            Last Updated: {new Date(quote.updated_at).toLocaleDateString()}
          </Text>
        </Box>
        <Button size="xs" colorScheme="red" variant="outline" onClick={(e) => { e.stopPropagation(); onDelete(quote.id); }}>
          Delete
        </Button>
      </HStack>
    </Box>
  );
};

export default PriceQuoteListItem; 