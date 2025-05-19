import React from 'react';
import { Box, Text, HStack, IconButton } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

// Placeholder type, will come from GraphQL/Store
interface AdditionalCost {
  id?: string; // Optional: Temp ID for client-side list management before save or ID from backend
  description: string;
  amount: number;
}

interface AdditionalCostItemProps {
  item: AdditionalCost;
  onRemove: () => void;
  // currencySymbol?: string; // Optional: if multi-currency support is needed later
}

const AdditionalCostItem: React.FC<AdditionalCostItemProps> = ({ 
  item, 
  onRemove, 
  // currencySymbol = '$'
}) => {
  return (
    <HStack 
      spacing={3} 
      p={2} 
      borderWidth="1px" 
      borderRadius="md" 
      justifyContent="space-between"
      _hover={{ bg: 'gray.50' }}
    >
      <Box flexGrow={1}>
        <Text fontWeight="medium">{item.description}</Text>
      </Box>
      <Box>
        {/* <Text>{currencySymbol}{item.amount.toFixed(2)}</Text> */}
        <Text>${item.amount.toFixed(2)}</Text> {/* Defaulting to $ for now */}
      </Box>
      <IconButton 
        aria-label="Remove cost item"
        icon={<DeleteIcon />}
        size="sm"
        variant="ghost"
        colorScheme="red"
        onClick={onRemove}
      />
    </HStack>
  );
};

export default AdditionalCostItem; 
// small edit