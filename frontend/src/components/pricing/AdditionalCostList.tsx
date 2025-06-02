import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Heading,
  HStack,
  Text
} from '@chakra-ui/react';
import AdditionalCostItem from './AdditionalCostItem.tsx';
import { usePriceQuoteStore, AdditionalCostInputData } from '../../stores/usePriceQuoteStore';

// Interface for items in the list, matching store structure
// type AdditionalCost = AdditionalCostInputData; // Can use type alias if preferred

const AdditionalCostList: React.FC = () => {
  const { currentQuoteInputs, updateCurrentQuoteInputValue } = usePriceQuoteStore();
  const additionalCosts = currentQuoteInputs.additional_costs || [];
  // const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([]); // Local state for PoC

  const [newCostDesc, setNewCostDesc] = useState('');
  const [newCostAmount, setNewCostAmount] = useState<number | string>('');
  const newCostDescId = React.useId();
  const newCostAmountId = React.useId();

  const handleAddCost = () => {
    if (newCostDesc && typeof newCostAmount === 'number' && newCostAmount > 0) {
      const newCost: AdditionalCostInputData = {
        description: newCostDesc,
        amount: newCostAmount,
      };
      const updatedCosts = [...additionalCosts, newCost];
      // setAdditionalCosts(updatedCosts);
      updateCurrentQuoteInputValue('additional_costs', updatedCosts);
      setNewCostDesc('');
      setNewCostAmount('');
    }
  };

  const handleRemoveCost = (indexToRemove: number) => {
    const updatedCosts = additionalCosts.filter((_, index) => index !== indexToRemove);
    // setAdditionalCosts(updatedCosts);
    updateCurrentQuoteInputValue('additional_costs', updatedCosts);
  };

  return (
    <Box>
      {/* <Heading size="sm" mb={3}>Additional Costs</Heading> */}
      {/* Heading moved to PriceQuoteForm */}
      <VStack spacing={3} align="stretch" mb={4}>
        {additionalCosts.length === 0 && <Text fontSize="sm" color="gray.600">No additional costs added.</Text>}
        {additionalCosts.map((cost, index) => (
          <AdditionalCostItem 
            key={index} // TODO: Use a more stable key if items get temp IDs client-side before save
            item={cost} 
            onRemove={() => handleRemoveCost(index)} 
          />
        ))}
      </VStack>

      <HStack spacing={2} mb={2}>
        <FormControl flex={3}>
          <FormLabel htmlFor={newCostDescId} fontSize="sm" mb={1}>Description</FormLabel>
          <Input 
            id={newCostDescId}
            placeholder="e.g., Travel Expenses"
            value={newCostDesc}
            onChange={(e) => setNewCostDesc(e.target.value)}
            size="sm"
          />
        </FormControl>
        <FormControl flex={1}>
          <FormLabel htmlFor={newCostAmountId} fontSize="sm" mb={1}>Amount</FormLabel>
          <NumberInput 
            id={newCostAmountId}
            value={typeof newCostAmount === 'number' ? newCostAmount : ''} 
            onChange={(valueString) => setNewCostAmount(valueString ? parseFloat(valueString) : '')} 
            min={0}
            precision={2}
            size="sm"
          >
            <NumberInputField placeholder="e.g., 100.00" />
          </NumberInput>
        </FormControl>
      </HStack>
      <Button onClick={handleAddCost} size="sm" colorScheme="teal" variant="outline">
        + Add Cost
      </Button>
    </Box>
  );
};

export default AdditionalCostList; 