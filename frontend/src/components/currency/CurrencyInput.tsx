import React, { useState, useCallback, useEffect } from 'react';
import {
  HStack,
  Input,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  Text,
  Box,
  Flex,
  Badge,
  Tooltip,
  IconButton,
} from '@chakra-ui/react';
import { InfoIcon, RepeatIcon } from '@chakra-ui/icons';
import { useCurrency } from '../../hooks/useCurrency';

// ================================
// Types
// ================================

interface CurrencyOption {
  value: string;
  label: string;
  symbol: string;
}

interface CurrencyInputProps {
  value?: number;
  currency?: string;
  onValueChange?: (amount: number) => void;
  onCurrencyChange?: (currency: string) => void;
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  showCurrencySelector?: boolean;
  showConversion?: boolean;
  convertTo?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'flushed' | 'unstyled';
  precision?: number;
  min?: number;
  max?: number;
  allowedCurrencies?: string[];
}

// ================================
// Currency Input Component
// ================================

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value = 0,
  currency = 'USD',
  onValueChange,
  onCurrencyChange,
  label,
  placeholder,
  isRequired = false,
  isDisabled = false,
  isInvalid = false,
  errorMessage,
  showCurrencySelector = true,
  showConversion = false,
  convertTo,
  size = 'md',
  variant = 'outline',
  precision = 2,
  min = 0,
  max,
  allowedCurrencies,
}) => {
  const {
    getCurrencyOptions,
    getCurrencySymbol,
    formatAmount,
    convertCurrency,
    converting,
  } = useCurrency();

  const [inputValue, setInputValue] = useState<string>(value.toString());
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [conversionRate, setConversionRate] = useState<number | null>(null);

  // ================================
  // Currency Options
  // ================================

  const allCurrencyOptions = getCurrencyOptions();
  const currencyOptions = allowedCurrencies 
    ? allCurrencyOptions.filter((option: CurrencyOption) => allowedCurrencies.includes(option.value))
    : allCurrencyOptions;
  const currentSymbol = getCurrencySymbol(currency);

  // ================================
  // Input Handling
  // ================================

  const handleAmountChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);

    // Parse and validate the input
    const numericValue = parseFloat(newValue);
    if (!isNaN(numericValue) && numericValue >= (min || 0) && (!max || numericValue <= max)) {
      onValueChange?.(numericValue);
    }
  }, [onValueChange, min, max]);

  const handleCurrencyChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = event.target.value;
    onCurrencyChange?.(newCurrency);
  }, [onCurrencyChange]);

  // ================================
  // Format Input on Blur
  // ================================

  const handleBlur = useCallback(() => {
    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue)) {
      const formattedValue = numericValue.toFixed(precision);
      setInputValue(formattedValue);
    }
  }, [inputValue, precision]);

  // ================================
  // Currency Conversion Effect
  // ================================

  useEffect(() => {
    if (showConversion && convertTo && convertTo !== currency && value > 0) {
      convertCurrency(value, currency, convertTo)
        .then(result => {
          if (result) {
            setConvertedAmount(result.convertedAmount);
            setConversionRate(result.exchangeRate);
          }
        })
        .catch(error => {
          console.error('Currency conversion failed:', error);
          setConvertedAmount(null);
          setConversionRate(null);
        });
    } else {
      setConvertedAmount(null);
      setConversionRate(null);
    }
  }, [value, currency, convertTo, showConversion, convertCurrency]);

  // ================================
  // Sync External Value Changes
  // ================================

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  // ================================
  // Validation
  // ================================

  const isValueInvalid = isInvalid || (value < (min || 0)) || (max !== undefined && value > max);

  // ================================
  // Render Currency Selector
  // ================================

  const renderCurrencySelector = () => {
    if (!showCurrencySelector) return null;

    return (
      <Select
        value={currency}
        onChange={handleCurrencyChange}
        size={size}
        variant={variant}
        isDisabled={isDisabled}
        width="120px"
        flexShrink={0}
      >
        {currencyOptions.map((option: CurrencyOption) => (
          <option key={option.value} value={option.value}>
            {option.value}
          </option>
        ))}
      </Select>
    );
  };

  // ================================
  // Render Conversion Info
  // ================================

  const renderConversionInfo = () => {
    if (!showConversion || !convertTo || convertTo === currency) return null;

    return (
      <Box mt={2} p={2} bg="gray.50" borderRadius="md" fontSize="sm">
        <Flex justify="space-between" align="center">
          <Text color="gray.600">
            Converted to {convertTo}:
          </Text>
          {converting ? (
            <Text color="gray.400">Converting...</Text>
          ) : convertedAmount !== null ? (
            <HStack spacing={2}>
              <Text fontWeight="semibold">
                {formatAmount(convertedAmount, convertTo)}
              </Text>
              {conversionRate && (
                <Tooltip label={`1 ${currency} = ${conversionRate.toFixed(4)} ${convertTo}`}>
                  <Badge variant="outline" colorScheme="blue" fontSize="xs">
                    @{conversionRate.toFixed(4)}
                  </Badge>
                </Tooltip>
              )}
            </HStack>
          ) : (
            <Text color="red.500" fontSize="xs">
              Conversion failed
            </Text>
          )}
        </Flex>
      </Box>
    );
  };

  // ================================
  // Main Render
  // ================================

  return (
    <FormControl isRequired={isRequired} isInvalid={isValueInvalid} isDisabled={isDisabled}>
      {label && (
        <FormLabel>
          <HStack spacing={2}>
            <Text>{label}</Text>
            {showConversion && convertTo && (
              <Tooltip label="Amount will be automatically converted">
                <InfoIcon boxSize={3} color="gray.400" />
              </Tooltip>
            )}
          </HStack>
        </FormLabel>
      )}

      <HStack spacing={2}>
        {/* Amount Input */}
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none">
            <Text color="gray.500" fontSize={size === 'sm' ? 'sm' : 'md'}>
              {currentSymbol}
            </Text>
          </InputLeftElement>
          <Input
            type="number"
            value={inputValue}
            onChange={handleAmountChange}
            onBlur={handleBlur}
            placeholder={placeholder || '0.00'}
            size={size}
            variant={variant}
            isDisabled={isDisabled}
            min={min}
            max={max}
            step={1 / Math.pow(10, precision)}
          />
        </InputGroup>

        {/* Currency Selector */}
        {renderCurrencySelector()}

        {/* Refresh Conversion Button */}
        {showConversion && convertTo && (
          <IconButton
            aria-label="Refresh conversion"
            icon={<RepeatIcon />}
            size={size}
            variant="ghost"
            isLoading={converting}
            onClick={() => {
              if (value > 0) {
                convertCurrency(value, currency, convertTo);
              }
            }}
          />
        )}
      </HStack>

      {/* Conversion Info */}
      {renderConversionInfo()}

      {/* Error Message */}
      {isValueInvalid && errorMessage && (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      )}
    </FormControl>
  );
};

// ================================
// Specialized Currency Input Components
// ================================

export const DealAmountInput: React.FC<{
  amount: number;
  currency: string;
  onAmountChange: (amount: number) => void;
  onCurrencyChange: (currency: string) => void;
  isDisabled?: boolean;
  showConversion?: boolean;
  convertTo?: string;
}> = ({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  isDisabled = false,
  showConversion = false,
  convertTo,
}) => {
  // Limit to specific currencies as requested
  const allowedCurrencies = ['EUR', 'USD', 'CHF', 'GBP'];
  
  return (
    <CurrencyInput
      value={amount}
      currency={currency}
      onValueChange={onAmountChange}
      onCurrencyChange={onCurrencyChange}
      label="Deal Amount"
      placeholder="Enter deal amount"
      isRequired
      isDisabled={isDisabled}
      showConversion={showConversion}
      convertTo={convertTo}
      min={0}
      size="md"
      allowedCurrencies={allowedCurrencies}
    />
  );
};

export const LeadValueInput: React.FC<{
  estimatedValue: number;
  currency: string;
  onValueChange: (value: number) => void;
  onCurrencyChange: (currency: string) => void;
  isDisabled?: boolean;
}> = ({
  estimatedValue,
  currency,
  onValueChange,
  onCurrencyChange,
  isDisabled = false,
}) => (
  <CurrencyInput
    value={estimatedValue}
    currency={currency}
    onValueChange={onValueChange}
    onCurrencyChange={onCurrencyChange}
    label="Estimated Value"
    placeholder="Enter estimated value"
    isDisabled={isDisabled}
    min={0}
    size="md"
  />
);

export const CompactCurrencyInput: React.FC<Omit<CurrencyInputProps, 'size' | 'showCurrencySelector'>> = (props) => (
  <CurrencyInput
    size="sm"
    showCurrencySelector={false}
    {...props}
  />
);

// ================================
// Export Default
// ================================

export default CurrencyInput; 