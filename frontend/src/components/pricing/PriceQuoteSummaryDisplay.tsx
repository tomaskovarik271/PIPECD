import React from 'react';
import { Box, Heading, Text, VStack, Spinner, Alert, AlertIcon, HStack } from '@chakra-ui/react';

// Placeholder for store integration
import { usePriceQuoteStore } from '../../stores/usePriceQuoteStore';

// Placeholder type for currentQuotePreview - replace with actual type from store/GraphQL
// interface QuotePreview { // This can be removed if PriceQuoteGQL from store is used or if types match
//   calculated_total_direct_cost?: number | null;
//   calculated_target_price_tp?: number | null;
//   calculated_full_target_price_ftp?: number | null;
//   calculated_discounted_offer_price?: number | null;
//   calculated_effective_markup_fop_over_mp?: number | null;
//   escalation_status?: string | null;
//   escalation_details?: any | null;
//   base_minimum_price_mp?: number | null;
//   final_offer_price_fop?: number | null;
// }

const PriceQuoteSummaryDisplay: React.FC = () => {
  const { currentQuotePreview, isLoadingDetails, errorDetails } = usePriceQuoteStore();
  // Placeholder with a default structure to satisfy TypeScript
  // const currentQuotePreview: QuotePreview | null = {
  //   calculated_total_direct_cost: 0,
  //   calculated_target_price_tp: 0,
  //   calculated_full_target_price_ftp: 0,
  //   calculated_discounted_offer_price: 0,
  //   calculated_effective_markup_fop_over_mp: 0,
  //   escalation_status: 'ok',
  //   escalation_details: null,
  //   base_minimum_price_mp: 0,
  //   final_offer_price_fop: 0,
  // }; 
  // const isLoadingDetails = false; // Placeholder
  // const errorDetails = null; // Placeholder

  if (isLoadingDetails) {
    return <Spinner />;
  }

  if (errorDetails) {
    return <Alert status="error"><AlertIcon />Error loading quote preview: {errorDetails}</Alert>;
  }

  if (currentQuotePreview === null) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="md" mt={4}>
        <Heading size="md" mb={3}>Quote Summary (Preview)</Heading>
        <Text>No quote preview data available. Please input details and calculate.</Text>
      </Box>
    );
  }

  const formatCurrency = (value?: number | null) => {
    return value != null ? `$${value.toFixed(2)}` : 'N/A';
  };

  const formatPercentage = (value?: number | null) => {
    return value != null ? `${value.toFixed(2)}%` : 'N/A';
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" mt={4}>
      <Heading size="md" mb={3}>Quote Summary (Preview)</Heading>
      <VStack spacing={2} align="stretch">
        <HStack justifyContent="space-between">
          <Text fontWeight="semibold">Base Minimum Price (MP):</Text>
          <Text>{formatCurrency(currentQuotePreview.base_minimum_price_mp)}</Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontWeight="semibold">Total Direct Cost (MP + AC):</Text>
          <Text>{formatCurrency(currentQuotePreview.calculated_total_direct_cost)}</Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontWeight="semibold">Target Price (TP):</Text>
          <Text>{formatCurrency(currentQuotePreview.calculated_target_price_tp)}</Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontWeight="semibold">Full Target Price (FTP = TP + AC):</Text>
          <Text>{formatCurrency(currentQuotePreview.calculated_full_target_price_ftp)}</Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontWeight="semibold">Final Offer Price (FOP):</Text>
          <Text>{formatCurrency(currentQuotePreview.final_offer_price_fop)}</Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontWeight="semibold">Discounted Offer Price:</Text>
          <Text>{formatCurrency(currentQuotePreview.calculated_discounted_offer_price)}</Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontWeight="semibold">Effective Markup (FOP over MP):</Text>
          <Text>{formatPercentage(currentQuotePreview.calculated_effective_markup_fop_over_mp)}</Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text fontWeight="semibold">Escalation Status:</Text>
          <Text color={currentQuotePreview.escalation_status !== 'ok' ? 'red.500' : 'green.500'}>
            {currentQuotePreview.escalation_status || 'N/A'}
          </Text>
        </HStack>
        {currentQuotePreview.escalation_details && (
          <Box pl={4} pt={1} borderLeftWidth="2px" borderColor="gray.200">
            <Text fontSize="sm" color="gray.600">Details: {JSON.stringify(currentQuotePreview.escalation_details)}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default PriceQuoteSummaryDisplay; 