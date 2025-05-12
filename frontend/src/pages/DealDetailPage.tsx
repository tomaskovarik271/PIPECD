import { Box, Heading, Spinner, Text, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import DealHistoryList from '../components/deals/DealHistoryList';

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
      <Heading mb={1}>Deal: {currentDeal.name}</Heading>
      <Text fontSize="sm" color="gray.500" mb={4}>ID: {currentDeal.id}</Text>
      
      {/* TODO: Display more deal information here (amount, stage, person, org etc.) */}
      <Box mb={6} p={4} borderWidth="1px" borderRadius="lg" bg="white">
        <Heading size="sm" mb={2}>Details</Heading>
        <Text><strong>Amount:</strong> {currentDeal.amount ? `$${currentDeal.amount.toLocaleString()}` : 'N/A'}</Text>
        <Text><strong>Stage:</strong> {currentDeal.stage?.name || 'N/A'}</Text>
        <Text><strong>Expected Close Date:</strong> {currentDeal.expected_close_date ? new Date(currentDeal.expected_close_date).toLocaleDateString() : 'N/A'}</Text>
        <Text><strong>Person:</strong> {currentDeal.person ? `${currentDeal.person.first_name} ${currentDeal.person.last_name}` : 'N/A'}</Text>
        <Text><strong>Organization:</strong> {currentDeal.organization?.name || 'N/A'}</Text>
      </Box>

      <Box mt={6} p={4} borderWidth="1px" borderRadius="lg" bg="white">
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