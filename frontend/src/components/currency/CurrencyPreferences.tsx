import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
  Switch,
  FormControl,
  FormLabel,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Divider,
} from '@chakra-ui/react';
import { useCurrencyPreferences, useCurrency } from '../../hooks/useCurrency';
import { useThemeColors } from '../../hooks/useThemeColors';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const CurrencyPreferences: React.FC = () => {
  const colors = useThemeColors();
  const toast = useToast();
  
  const { currencies, loading: currenciesLoading } = useCurrency();
  const { 
    preferences, 
    loading: preferencesLoading, 
    updatePreferences 
  } = useCurrencyPreferences();

  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [autoConvert, setAutoConvert] = useState(true);
  const [showConversionTooltips, setShowConversionTooltips] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize form with current preferences
  useEffect(() => {
    if (preferences) {
      setDefaultCurrency(preferences.defaultCurrency || 'USD');
      setDisplayCurrency(preferences.displayCurrency || 'USD');
      setAutoConvert(preferences.autoConvert ?? true);
      setShowConversionTooltips(preferences.showConversionTooltips ?? true);
    }
  }, [preferences]);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updatePreferences({
        defaultCurrency,
        displayCurrency,
      });
      
      toast({
        title: 'Currency Preferences Updated',
        description: 'Your currency preferences have been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error Updating Preferences',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = preferences && (
    preferences.defaultCurrency !== defaultCurrency ||
    preferences.displayCurrency !== displayCurrency ||
    preferences.autoConvert !== autoConvert ||
    preferences.showConversionTooltips !== showConversionTooltips
  );

  if (currenciesLoading || preferencesLoading) {
    return (
      <Box display="flex" justifyContent="center" p={8}>
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Card bg={colors.bg.elevated} borderColor={colors.border.default}>
      <CardHeader>
        <Heading size="md" color={colors.text.primary}>
          Currency Preferences
        </Heading>
        <Text fontSize="sm" color={colors.text.muted} mt={2}>
          Configure your default currency settings and display preferences.
        </Text>
      </CardHeader>
      
      <CardBody>
        <VStack spacing={6} align="stretch">
          <FormControl>
            <FormLabel color={colors.text.primary}>Default Currency</FormLabel>
            <Text fontSize="sm" color={colors.text.muted} mb={2}>
              Currency used when creating new deals and leads
            </Text>
            <Select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              bg={colors.bg.input}
              borderColor={colors.border.default}
              _hover={{ borderColor: colors.border.default }}
              _focus={{ borderColor: colors.interactive.default }}
            >
              {currencies.map((currency: Currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name} ({currency.symbol})
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel color={colors.text.primary}>Display Currency</FormLabel>
            <Text fontSize="sm" color={colors.text.muted} mb={2}>
              Currency used for displaying amounts throughout the application
            </Text>
            <Select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value)}
              bg={colors.bg.input}
              borderColor={colors.border.default}
              _hover={{ borderColor: colors.border.default }}
              _focus={{ borderColor: colors.interactive.default }}
            >
              {currencies.map((currency: Currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name} ({currency.symbol})
                </option>
              ))}
            </Select>
          </FormControl>

          <Divider borderColor={colors.border.default} />

          <VStack spacing={4} align="stretch">
            <Text fontWeight="semibold" color={colors.text.primary}>
              Display Options
            </Text>

            <FormControl display="flex" alignItems="center">
              <Box flex="1">
                <FormLabel mb="0" color={colors.text.primary}>
                  Auto-convert amounts
                </FormLabel>
                <Text fontSize="sm" color={colors.text.muted}>
                  Automatically convert amounts to your display currency
                </Text>
              </Box>
              <Switch
                isChecked={autoConvert}
                onChange={(e) => setAutoConvert(e.target.checked)}
                colorScheme="blue"
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <Box flex="1">
                <FormLabel mb="0" color={colors.text.primary}>
                  Show conversion tooltips
                </FormLabel>
                <Text fontSize="sm" color={colors.text.muted}>
                  Display original amounts and exchange rates in tooltips
                </Text>
              </Box>
              <Switch
                isChecked={showConversionTooltips}
                onChange={(e) => setShowConversionTooltips(e.target.checked)}
                colorScheme="blue"
              />
            </FormControl>
          </VStack>

          <Divider borderColor={colors.border.default} />

          <HStack justify="flex-end">
            <Button
              colorScheme="blue"
              onClick={handleSave}
              isLoading={isUpdating}
              isDisabled={!hasChanges}
              loadingText="Saving..."
            >
              Save Preferences
            </Button>
          </HStack>

          {!hasChanges && preferences && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                Your preferences are up to date. Make changes above to save new settings.
              </Text>
            </Alert>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}; 