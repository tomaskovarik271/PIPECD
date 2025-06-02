import React, { useEffect, useState } from 'react';
import { Box, Heading, Button, VStack, Spinner, Alert, AlertIcon, Text, SimpleGrid } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import PriceQuoteListItem from './PriceQuoteListItem';
import DealPricingTabContent from './DealPricingTabContent'; // To show form for selected/new quote
import { usePriceQuoteStore } from '../../stores/usePriceQuoteStore';

interface DealPricingSectionProps {
  dealId: string;
}

const DealPricingSection: React.FC<DealPricingSectionProps> = ({ dealId }) => {
  const {
    quotesForDealList,
    fetchPriceQuotesForDeal,
    selectQuoteToEdit,
    resetCurrentQuoteForm,
    selectedQuoteId,
    deletePriceQuote, // Added for delete functionality
    isLoadingList,
    errorList,
    isSubmitting, // For delete operation loading state
  } = usePriceQuoteStore();

  // State to control visibility of the form (DealPricingTabContent)
  // True if creating new or editing existing
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    if (dealId) {
      fetchPriceQuotesForDeal(dealId);
    }
  }, [dealId, fetchPriceQuotesForDeal]);

  useEffect(() => {
    // If a quote is selected in the store, ensure the form becomes visible
    // If no quote is selected (e.g., after creating one and resetting, or deselecting),
    // the form visibility might be controlled differently or reset here.
    if (selectedQuoteId) {
      setIsFormVisible(true);
    } else {
        // If selectedQuoteId is null (e.g. after creating one and resetting form),
        // we might want to hide the form unless explicitly creating new again.
        // For now, let's keep it simple: if no selectedQuoteId, form is not visible by default from selection.
        // isFormVisible state will primarily be driven by "Create New" or item selection.
    }
  }, [selectedQuoteId]);

  const handleCreateNewQuote = () => {
    resetCurrentQuoteForm(); // dealId is not part of PriceQuoteInputData, will be passed to create action separately
    selectQuoteToEdit(null); // Explicitly deselect any existing quote
    setIsFormVisible(true);
  };

  const handleSelectQuote = (quoteId: string) => {
    selectQuoteToEdit(quoteId); // This will fetch and set the quote in the store
    // The useEffect listening to selectedQuoteId will make the form visible
  };
  
  const handleDeleteQuote = async (quoteId: string) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      await deletePriceQuote(quoteId, dealId); 
      // If the deleted quote was the one selected for editing, reset the view
      if (selectedQuoteId === quoteId) {
        setIsFormVisible(false); // Hide form as the selected item is gone
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    selectQuoteToEdit(null); // Deselect quote in store
    resetCurrentQuoteForm(); // Clear any form inputs
  }

  if (isLoadingList) {
    return <Spinner />; 
  }

  if (errorList) {
    return <Alert status="error"><AlertIcon />{errorList}</Alert>;
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Price Quotes</Heading>
      
      {!isFormVisible && (
        <Button onClick={handleCreateNewQuote} leftIcon={<AddIcon />} colorScheme="teal" mb={4}>
          Create New Quote
        </Button>
      )}

      {isFormVisible && (
        <Box mb={6}>
            <DealPricingTabContent dealId={dealId} onFormClose={handleCloseForm} />
            <Button onClick={handleCloseForm} variant="outline" size="sm" mt={4}>
                Close Form / Cancel
            </Button>
        </Box>
      )}

      {!isFormVisible && quotesForDealList.length === 0 && (
        <Text>No price quotes created for this deal yet.</Text>
      )}

      {!isFormVisible && quotesForDealList.length > 0 && (
        <VStack spacing={3} align="stretch">
          {quotesForDealList.map(quote => (
            <PriceQuoteListItem 
              key={quote.id} 
              quote={quote} 
              onSelect={handleSelectQuote} 
              onDelete={handleDeleteQuote} // Pass delete handler
            />
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default DealPricingSection; 