import React from 'react';
import { Box, Heading, Grid, GridItem, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import PriceQuoteForm from './PriceQuoteForm';
import PriceQuoteSummaryDisplay from './PriceQuoteSummaryDisplay';
import InvoiceScheduleDisplay from './InvoiceScheduleDisplay';
import { usePriceQuoteStore } from '../../stores/usePriceQuoteStore';

interface DealPricingTabContentProps {
  dealId: string;
  onFormClose?: () => void;
  // selectedQuoteIdForEdit is no longer passed as prop; form visibility and data loading are managed via store and DealPricingSection
}

const DealPricingTabContent: React.FC<DealPricingTabContentProps> = ({ dealId, onFormClose }) => {
  const {
    // selectedQuoteId, // To know if we are editing or creating new
    // currentQuoteInputs, // The actual form data
    // currentQuotePreview, // The preview data
    isLoadingDetails, // Loading state when fetching a quote to edit or calculating preview
    errorDetails,     // Error state for the same
    // No need for fetch/reset actions here as they are called from DealPricingSection or PriceQuoteForm
  } = usePriceQuoteStore();

  // The parent DealPricingSection now controls the visibility of this component.
  // When visible, it means either a new quote is being created (form is reset by store action)
  // or an existing quote has been selected and its data loaded into currentQuoteInputs by store action.

  if (isLoadingDetails) {
    // This spinner will show if fetchPriceQuoteById or getQuotePreview is running
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
            <Spinner />
        </Box>
    );
  }

  if (errorDetails) {
    return <Alert status="error" mt={4}><AlertIcon />{errorDetails}</Alert>;
  }

  return (
    <Box>
      {/* Heading could be dynamic based on whether creating new or editing existing */}
      {/* e.g., selectedQuoteId ? `Edit Quote: ${currentQuoteInputs.name || selectedQuoteId}` : 'Create New Price Quote' */}
      <Heading size="lg" mb={4}>Manage Price Quote</Heading> 
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        <GridItem>
          {/* Pass dealId for context, especially if creating new and it needs to be associated */}
          <PriceQuoteForm dealId={dealId} onFormClose={onFormClose} /> 
        </GridItem>
        <GridItem>
          <PriceQuoteSummaryDisplay />
          <InvoiceScheduleDisplay />
        </GridItem>
      </Grid>
    </Box>
  );
};

export default DealPricingTabContent; 