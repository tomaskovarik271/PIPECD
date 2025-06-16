import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Badge,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  useDisclosure,
} from '@chakra-ui/react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useThemeColors } from '../hooks/useThemeColors';
import { useCurrency } from '../hooks/useCurrency';
import { useAppStore } from '../stores/useAppStore';
import UnifiedPageHeader from '../components/layout/UnifiedPageHeader';

// GraphQL Queries
const GET_EXCHANGE_RATES = gql`
  query GetExchangeRates {
    exchangeRates {
      id
      fromCurrency
      toCurrency
      rate
      effectiveDate
      source
      createdAt
      updatedAt
    }
  }
`;

const SET_EXCHANGE_RATE = gql`
  mutation SetExchangeRate($input: SetExchangeRateInput!) {
    setExchangeRate(input: $input) {
      id
      fromCurrency
      toCurrency
      rate
      effectiveDate
      source
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_RATES_FROM_ECB = gql`
  mutation UpdateRatesFromECB {
    updateRatesFromECB {
      success
      message
    }
  }
`;

interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

const ExchangeRatesPage: React.FC = () => {
  const colors = useThemeColors();
  const toast = useToast();
  const { currencies } = useCurrency();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const userPermissions = useAppStore((state) => state.userPermissions);
  
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [rate, setRate] = useState<number>(1.0);

  const { data, loading, error, refetch } = useQuery(GET_EXCHANGE_RATES);
  const [setExchangeRate, { loading: settingRate }] = useMutation(SET_EXCHANGE_RATE);
  const [updateFromECB, { loading: updatingFromECB }] = useMutation(UPDATE_RATES_FROM_ECB);

  const exchangeRates: ExchangeRate[] = data?.exchangeRates || [];

  const handleSetRate = async () => {
    try {
      await setExchangeRate({
        variables: {
          input: {
            fromCurrency,
            toCurrency,
            rate,
            source: 'manual'
          }
        }
      });
      
      toast({
        title: 'Exchange Rate Set',
        description: `Successfully set ${fromCurrency} to ${toCurrency} rate`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      refetch();
    } catch (error) {
      toast({
        title: 'Error Setting Rate',
        description: error instanceof Error ? error.message : 'Failed to set exchange rate',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateFromECB = async () => {
    try {
      const result = await updateFromECB();
      
      if (result.data?.updateRatesFromECB?.success) {
        toast({
          title: 'Rates Updated from ECB',
          description: result.data.updateRatesFromECB.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        refetch();
      } else {
        throw new Error(result.data?.updateRatesFromECB?.message || 'Failed to update rates');
      }
    } catch (error) {
      toast({
        title: 'ECB Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update rates from ECB',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'ecb': return 'green';
      case 'manual': return 'blue';
      case 'openexchange': return 'purple';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={8}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" m={4}>
        <AlertIcon />
        Error loading exchange rates: {error.message}
      </Alert>
    );
  }

  return (
    <>
      <UnifiedPageHeader
        title="Exchange Rates"
        primaryButtonLabel="Set Manual Rate"
        onPrimaryButtonClick={onOpen}
        requiredPermission="app_settings:manage"
        userPermissions={userPermissions || []}
      />

      <Box p={6} maxW="1200px" mx="auto">
        <VStack spacing={6} align="stretch">
          {/* ECB Integration Card */}
          <Card bg={colors.bg.elevated} borderColor={colors.border.default}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md" color={colors.text.primary}>
                  European Central Bank Integration
                </Heading>
                <Button
                  colorScheme="green"
                  onClick={handleUpdateFromECB}
                  isLoading={updatingFromECB}
                  loadingText="Updating..."
                >
                  Update from ECB
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <Text color={colors.text.muted}>
                Automatically fetch the latest exchange rates from the European Central Bank.
                This will update all EUR-based currency pairs with official rates.
              </Text>
            </CardBody>
          </Card>

          {/* Exchange Rates Table */}
          <Card bg={colors.bg.elevated} borderColor={colors.border.default}>
            <CardHeader>
              <Heading size="md" color={colors.text.primary}>
                Current Exchange Rates
              </Heading>
            </CardHeader>
            <CardBody>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>From</Th>
                    <Th>To</Th>
                    <Th isNumeric>Rate</Th>
                    <Th>Source</Th>
                    <Th>Effective Date</Th>
                    <Th>Last Updated</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {exchangeRates.map((rate) => (
                    <Tr key={rate.id}>
                      <Td fontWeight="semibold">{rate.fromCurrency}</Td>
                      <Td fontWeight="semibold">{rate.toCurrency}</Td>
                      <Td isNumeric fontFamily="mono">{rate.rate.toFixed(6)}</Td>
                      <Td>
                        <Badge colorScheme={getSourceBadgeColor(rate.source)}>
                          {rate.source.toUpperCase()}
                        </Badge>
                      </Td>
                      <Td>{new Date(rate.effectiveDate).toLocaleDateString()}</Td>
                      <Td>{new Date(rate.updatedAt).toLocaleDateString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              
              {exchangeRates.length === 0 && (
                <Text textAlign="center" py={8} color={colors.text.muted}>
                  No exchange rates found. Set your first rate manually or update from ECB.
                </Text>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Box>

      {/* Manual Rate Entry Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set Exchange Rate</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>From Currency</FormLabel>
                <Select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                  {currencies.map((currency: any) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>To Currency</FormLabel>
                <Select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                  {currencies.map((currency: any) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Exchange Rate</FormLabel>
                <NumberInput
                  value={rate}
                  onChange={(_, valueAsNumber) => setRate(valueAsNumber || 1.0)}
                  precision={6}
                  min={0.000001}
                  step={0.01}
                >
                  <NumberInputField />
                </NumberInput>
                <Text fontSize="sm" color={colors.text.muted} mt={1}>
                  1 {fromCurrency} = {rate} {toCurrency}
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSetRate}
              isLoading={settingRate}
              isDisabled={fromCurrency === toCurrency}
            >
              Set Rate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ExchangeRatesPage; 