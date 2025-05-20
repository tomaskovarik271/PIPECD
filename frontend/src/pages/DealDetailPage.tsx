import { Box, Heading, Spinner, Text, Alert, AlertIcon, AlertTitle, AlertDescription, Flex, IconButton, VStack, Link, Icon } from '@chakra-ui/react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import DealHistoryList from '../components/deals/DealHistoryList';
import DealPricingSection from '../components/pricing/DealPricingSection';
import { ArrowBackIcon, LinkIcon } from '@chakra-ui/icons';

interface LinkDisplayDetails {
  isUrl: boolean;
  displayText: string;
  fullUrl?: string;
  isKnownService?: boolean;
  icon?: React.ElementType;
}

const getLinkDisplayDetails = (str: string | null | undefined): LinkDisplayDetails => {
  if (!str) return { isUrl: false, displayText: '-' };

  try {
    const url = new URL(str);
    if (!(url.protocol === 'http:' || url.protocol === 'https:')) {
      return { isUrl: false, displayText: str };
    }

    if (url.hostname.includes('docs.google.com')) {
      if (url.pathname.includes('/spreadsheets/')) {
        return { isUrl: true, displayText: 'Google Sheet', fullUrl: str, isKnownService: true, icon: LinkIcon };
      }
      if (url.pathname.includes('/document/')) {
        return { isUrl: true, displayText: 'Google Doc', fullUrl: str, isKnownService: true, icon: LinkIcon };
      }
      if (url.pathname.includes('/presentation/') || url.pathname.includes('/drawings/')) {
        return { isUrl: true, displayText: 'Google Slides/Drawing', fullUrl: str, isKnownService: true, icon: LinkIcon };
      }
    }
    return { isUrl: true, displayText: str, fullUrl: str, isKnownService: false };

  } catch (_) {
    return { isUrl: false, displayText: str };
  }
};

const DealDetailPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const fetchDealById = useAppStore((state) => state.fetchDealById);
  const currentDeal = useAppStore((state) => state.currentDeal);
  const isLoading = useAppStore((state) => state.currentDealLoading);
  const error = useAppStore((state) => state.currentDealError);

  useEffect(() => {
    if (dealId) {
      fetchDealById(dealId);
    }
    // Clear currentDeal when component unmounts or dealId changes to avoid showing stale data
    return () => {
      // useAppStore.setState({ currentDeal: null, currentDealError: null }); // Optional: Reset on unmount
    };
  }, [dealId, fetchDealById]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle mr={2}>Error loading deal!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!currentDeal) {
    return <Text>Deal not found or no deal selected.</Text>;
  }

  return (
    <Box>
      <Flex alignItems="center" mb={4}>
        <IconButton
          as={RouterLink}
          to="/deals"
          aria-label="Back to Deals"
          icon={<ArrowBackIcon />}
          variant="outline"
          size="lg"
          mr={3}
        />
        <VStack alignItems="flex-start" spacing={0.5}>
          <Heading size="lg">Deal: {currentDeal.name}</Heading>
          <Text fontSize="sm" color={{ base: 'gray.500', _dark: 'gray.400' }}>
            ID: {currentDeal.id}
          </Text>
        </VStack>
      </Flex>
      
      <Box mb={6} p={4} borderWidth="1px" borderRadius="lg" bg={{ base: 'white', _dark: 'gray.700' }} borderColor={{ base: 'gray.200', _dark: 'gray.600' }}>
        <Heading size="sm" mb={2}>Details</Heading>
        <Text><strong>Amount:</strong> {currentDeal.amount ? `$${currentDeal.amount.toLocaleString()}` : 'N/A'}</Text>
        <Text><strong>Stage:</strong> {currentDeal.stage?.name || 'N/A'}</Text>
        <Text><strong>Expected Close Date:</strong> {currentDeal.expected_close_date ? new Date(currentDeal.expected_close_date).toLocaleDateString() : 'N/A'}</Text>
        <Text><strong>Person:</strong> {currentDeal.person ? `${currentDeal.person.first_name} ${currentDeal.person.last_name}` : 'N/A'}</Text>
        <Text><strong>Organization:</strong> {currentDeal.organization?.name || 'N/A'}</Text>
      </Box>

      {/* Custom Fields Display Section Added Below */}
      {currentDeal.customFieldValues && currentDeal.customFieldValues.length > 0 && (
        <Box mt={6} p={4} borderWidth="1px" borderRadius="lg" bg={{ base: 'white', _dark: 'gray.700' }} borderColor={{ base: 'gray.200', _dark: 'gray.600' }}>
          <Heading size="sm" mb={3}>Custom Information</Heading>
          {currentDeal.customFieldValues.map((cfValue) => {
            if (!cfValue.definition) return null; // Should not happen if query is correct

            let displayValue: string | JSX.Element = 'N/A';
            const { fieldType, dropdownOptions } = cfValue.definition;

            if (fieldType === 'TEXT' && cfValue.stringValue) {
              const linkDetails = getLinkDisplayDetails(cfValue.stringValue);
              if (linkDetails.isUrl && linkDetails.fullUrl) {
                displayValue = (
                  <Link 
                    href={linkDetails.fullUrl} 
                    isExternal 
                    color={{ base: 'blue.500', _dark: 'blue.300' }}
                    textDecoration="underline"
                    display="inline-flex"
                    alignItems="center"
                  >
                    {linkDetails.icon && <Icon as={linkDetails.icon} mr={1.5} />}
                    <Text
                      as="span"
                      style={!linkDetails.isKnownService ? {
                        display: 'inline-block',
                        maxWidth: '300px', // Adjust max width as needed for detail page
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      } : {}}
                    >
                      {linkDetails.displayText}
                    </Text>
                  </Link>
                );
              } else {
                displayValue = cfValue.stringValue;
              }
            } else if (fieldType === 'NUMBER' && cfValue.numberValue !== null && cfValue.numberValue !== undefined) {
              displayValue = cfValue.numberValue.toString();
            } else if (fieldType === 'BOOLEAN') {
              displayValue = cfValue.booleanValue ? 'Yes' : 'No';
            } else if (fieldType === 'DATE' && cfValue.dateValue) {
              displayValue = new Date(cfValue.dateValue).toLocaleDateString();
            } else if (fieldType === 'DROPDOWN' && cfValue.stringValue) {
              const selectedOption = dropdownOptions?.find(opt => opt.value === cfValue.stringValue);
              displayValue = selectedOption?.label || cfValue.stringValue;
            } else if (fieldType === 'MULTI_SELECT' && cfValue.selectedOptionValues && cfValue.selectedOptionValues.length > 0) {
              displayValue = (
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                  {cfValue.selectedOptionValues.map(value => {
                    const selectedOption = dropdownOptions?.find(opt => opt.value === value);
                    return <li key={value}>{selectedOption?.label || value}</li>;
                  })}
                </ul>
              );
            }

            // Only render if there's a non-N/A value to display or it is a boolean (which always has a representation)
            if (displayValue !== 'N/A' || fieldType === 'BOOLEAN') {
                return (
                    <Box key={cfValue.definition.id} mb={2}>
                        <Text><strong>{cfValue.definition.fieldLabel}:</strong> {displayValue}</Text>
                    </Box>
                );
            }
            return null;
          })}
        </Box>
      )}
      {/* End of Custom Fields Display Section */}

      {/* ADDED Pricing Section */}
      {dealId && (
        <Box mt={6} p={4} borderWidth="1px" borderRadius="lg" bg={{ base: 'white', _dark: 'gray.700' }} borderColor={{ base: 'gray.200', _dark: 'gray.600' }}>
          <Heading size="md" mb={3}>Pricing & Quotes</Heading>
          <DealPricingSection dealId={dealId} />
        </Box>
      )}
      {/* End of Pricing Section */}

      <Box mt={6} p={4} borderWidth="1px" borderRadius="lg" bg={{ base: 'white', _dark: 'gray.700' }} borderColor={{ base: 'gray.200', _dark: 'gray.600' }}>
        <Heading size="md" mb={3}>History / Audit Trail</Heading>
        {currentDeal.history ? (
          <DealHistoryList historyEntries={currentDeal.history} />
        ) : (
          <Text>No history available.</Text>
        )}
      </Box>
    </Box>
  );
};

export default DealDetailPage; 