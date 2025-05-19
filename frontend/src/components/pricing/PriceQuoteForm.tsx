import React, { useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, useToast } from '@chakra-ui/react';
import { usePriceQuoteStore, PriceQuoteInputData } from '../../stores/usePriceQuoteStore';
import AdditionalCostList from './AdditionalCostList'; // To be integrated later

interface PriceQuoteFormProps {
  dealId: string;
  onFormClose?: () => void;
}

const PriceQuoteForm: React.FC<PriceQuoteFormProps> = ({ dealId, onFormClose }) => {
  const { 
    currentQuoteInputs, 
    updateCurrentQuoteInputValue, 
    getQuotePreview,
    createPriceQuote,
    updatePriceQuote,
    selectedQuoteId,
    isSubmitting,
    isLoadingDetails, // Used for preview button loading state
  } = usePriceQuoteStore();
  const toast = useToast();

  // If a quote is selected for editing, its data is already in currentQuoteInputs via selectQuoteToEdit or fetchPriceQuoteById.
  // If creating new, currentQuoteInputs is reset by resetCurrentQuoteForm.

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedQuoteId) {
      await updatePriceQuote(selectedQuoteId, currentQuoteInputs);
      toast({ title: "Quote updated", status: "success", duration: 3000, isClosable: true });
      onFormClose?.();
    } else {
      const newQuote = await createPriceQuote(dealId, currentQuoteInputs);
      if (newQuote) {
        toast({ title: "Quote created successfully", description: `Quote '${newQuote.name || 'Unnamed'}' has been saved.`, status: "success", duration: 3000, isClosable: true });
        onFormClose?.();
      } else {
        toast({ title: "Error creating quote", description: "Could not save the quote. Please try again.", status: "error", duration: 3000, isClosable: true });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Chakra's NumberInput might not have a 'type' field directly on event.target for parsing
    // We will handle numeric conversion in handleNumberInputChange
    updateCurrentQuoteInputValue(name as keyof PriceQuoteInputData, value);
  };

  const handleNumberInputChange = (name: keyof PriceQuoteInputData, valueAsString: string, valueAsNumber: number) => {
    // If valueAsString is empty or just a sign, it might be an intermediate state of typing.
    // Rely on valueAsNumber for the actual numeric value, or handle empty string if it should clear the field.
    if (valueAsString === '' || valueAsString === '-' || valueAsString === '+') {
        updateCurrentQuoteInputValue(name, null); // Or undefined, or keep as string if backend/validation handles
    } else {
        updateCurrentQuoteInputValue(name, isNaN(valueAsNumber) ? null : valueAsNumber);
    }
  };
  
  const handlePreview = () => {
    getQuotePreview(currentQuoteInputs, dealId); // Pass dealId context for preview
  }

  // Helper to get number value or empty string for NumberInput
  const getNumericValue = (fieldValue: number | null | undefined): string | number => {
    return fieldValue == null ? '' : fieldValue;
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={4} borderWidth="1px" borderRadius="md">
      <VStack spacing={4} align="stretch">
        <Heading size="md">{selectedQuoteId ? `Edit Quote (ID: ${selectedQuoteId.substring(0,8)}...)` : 'Create New Price Quote'}</Heading>
        
        <FormControl id="name">
          <FormLabel>Quote Name</FormLabel>
          <Input 
            name="name" 
            value={currentQuoteInputs.name || ''} 
            onChange={handleInputChange} 
            placeholder="e.g., Initial Proposal, Option B"
          />
        </FormControl>

        <FormControl id="base_minimum_price_mp">
          <FormLabel>Base Minimum Price (MP)</FormLabel>
          <NumberInput 
            name="base_minimum_price_mp"
            value={getNumericValue(currentQuoteInputs.base_minimum_price_mp)}
            onChange={(valueString, valueNumber) => handleNumberInputChange('base_minimum_price_mp', valueString, valueNumber)}
            precision={2} min={0}
          >
            <NumberInputField placeholder="e.g., 5000.00" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl id="target_markup_percentage">
          <FormLabel>Target Markup Percentage (%)</FormLabel>
          <NumberInput 
            name="target_markup_percentage"
            value={getNumericValue(currentQuoteInputs.target_markup_percentage)}
            onChange={(valueString, valueNumber) => handleNumberInputChange('target_markup_percentage', valueString, valueNumber)}
            precision={2} min={0}
          >
            <NumberInputField placeholder="e.g., 20"/>
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl id="final_offer_price_fop">
          <FormLabel>Final Offer Price (FOP)</FormLabel>
          <NumberInput 
            name="final_offer_price_fop"
            value={getNumericValue(currentQuoteInputs.final_offer_price_fop)}
            onChange={(valueString, valueNumber) => handleNumberInputChange('final_offer_price_fop', valueString, valueNumber)}
            precision={2} min={0}
          >
            <NumberInputField placeholder="e.g., 6000.00" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl id="overall_discount_percentage">
          <FormLabel>Overall Discount Percentage (%)</FormLabel>
          <NumberInput 
            name="overall_discount_percentage"
            value={getNumericValue(currentQuoteInputs.overall_discount_percentage)}
            onChange={(valueString, valueNumber) => handleNumberInputChange('overall_discount_percentage', valueString, valueNumber)}
            precision={2} min={0} max={100}
          >
            <NumberInputField placeholder="e.g., 5"/>
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        
        <Heading size="sm" mt={4}>Invoice Schedule Parameters</Heading>

        <FormControl id="upfront_payment_percentage">
          <FormLabel>Upfront Payment Percentage (%)</FormLabel>
          <NumberInput 
            name="upfront_payment_percentage"
            value={getNumericValue(currentQuoteInputs.upfront_payment_percentage)}
            onChange={(valueString, valueNumber) => handleNumberInputChange('upfront_payment_percentage', valueString, valueNumber)}
            precision={2} min={0} max={100}
          >
            <NumberInputField placeholder="e.g., 50" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl id="upfront_payment_due_days">
          <FormLabel>Upfront Payment Due (Days from agreement)</FormLabel>
          <NumberInput 
            name="upfront_payment_due_days"
            value={getNumericValue(currentQuoteInputs.upfront_payment_due_days)}
            onChange={(valueString, valueNumber) => handleNumberInputChange('upfront_payment_due_days', valueString, valueNumber)}
            min={0} step={1}
          >
            <NumberInputField placeholder="e.g., 7" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl id="subsequent_installments_count">
          <FormLabel>Number of Subsequent Installments</FormLabel>
          <NumberInput 
            name="subsequent_installments_count"
            value={getNumericValue(currentQuoteInputs.subsequent_installments_count)}
            onChange={(valueString, valueNumber) => handleNumberInputChange('subsequent_installments_count', valueString, valueNumber)}
            min={0} step={1}
          >
            <NumberInputField placeholder="e.g., 2" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl id="subsequent_installments_interval_days">
          <FormLabel>Interval Between Subsequent Installments (Days)</FormLabel>
          <NumberInput 
            name="subsequent_installments_interval_days"
            value={getNumericValue(currentQuoteInputs.subsequent_installments_interval_days)}
            onChange={(valueString, valueNumber) => handleNumberInputChange('subsequent_installments_interval_days', valueString, valueNumber)}
             min={0} step={1} // Or min={1} if interval must be at least 1 day
          >
            <NumberInputField placeholder="e.g., 30" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        
        <Text mt={4} fontWeight="semibold">Additional Costs</Text>
        <AdditionalCostList />
        {/* <Text color="gray.500" fontSize="sm">Additional Costs management will be here.</Text> */}

        <Button 
          type="submit" 
          colorScheme="blue" 
          isLoading={isSubmitting}
          mt={4}
        >
          {selectedQuoteId ? 'Update Quote' : 'Save Quote'}
        </Button>
        <Button 
          variant="outline"
          onClick={handlePreview}
          isLoading={isLoadingDetails} 
        >
          Calculate Preview
        </Button>
      </VStack>
    </Box>
  );
};

export default PriceQuoteForm; 