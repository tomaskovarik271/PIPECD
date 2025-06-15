import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

// ================================
// GraphQL Queries & Mutations
// ================================

const GET_CURRENCIES = gql`
  query GetCurrencies {
    currencies {
      code
      name
      symbol
      decimalPlaces
      isActive
      createdAt
      updatedAt
    }
  }
`;

const GET_CURRENCY = gql`
  query GetCurrency($code: String!) {
    currency(code: $code) {
      code
      name
      symbol
      decimalPlaces
      isActive
      createdAt
      updatedAt
    }
  }
`;

const GET_EXCHANGE_RATE = gql`
  query GetExchangeRate($fromCurrency: String!, $toCurrency: String!, $effectiveDate: String) {
    exchangeRate(fromCurrency: $fromCurrency, toCurrency: $toCurrency, effectiveDate: $effectiveDate) {
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

const CONVERT_CURRENCY = gql`
  mutation ConvertCurrency($amount: Float!, $fromCurrency: String!, $toCurrency: String!, $effectiveDate: String) {
    convertCurrency(amount: $amount, fromCurrency: $fromCurrency, toCurrency: $toCurrency, effectiveDate: $effectiveDate) {
      originalAmount
      originalCurrency
      convertedAmount
      convertedCurrency
      exchangeRate
      effectiveDate
      formattedOriginal
      formattedConverted
    }
  }
`;

const GET_USER_CURRENCY_PREFERENCES = gql`
  query GetUserCurrencyPreferences($userId: ID!) {
    userCurrencyPreferences(userId: $userId) {
      userId
      defaultCurrency
      displayCurrency
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_USER_CURRENCY_PREFERENCES = gql`
  mutation UpdateUserCurrencyPreferences($userId: ID!, $input: UpdateUserCurrencyPreferencesInput!) {
    updateUserCurrencyPreferences(userId: $userId, input: $input) {
      userId
      defaultCurrency
      displayCurrency
      createdAt
      updatedAt
    }
  }
`;

// ================================
// Types
// ================================

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  effectiveDate: string;
  formattedOriginal: string;
  formattedConverted: string;
}

export interface UserCurrencyPreferences {
  userId: string;
  defaultCurrency: string;
  displayCurrency: string;
  createdAt: string;
  updatedAt: string;
}

// ================================
// Currency Hook
// ================================

export const useCurrency = (userId?: string) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [conversionCache, setConversionCache] = useState<Map<string, ConversionResult>>(new Map());

  // Fetch all currencies
  const { 
    data: currenciesData, 
    loading: currenciesLoading, 
    error: currenciesError,
    refetch: refetchCurrencies 
  } = useQuery(GET_CURRENCIES);

  // Fetch user preferences
  const { 
    data: preferencesData, 
    loading: preferencesLoading,
    error: preferencesError 
  } = useQuery(GET_USER_CURRENCY_PREFERENCES, {
    variables: { userId },
    skip: !userId,
  });

  // Update user preferences mutation
  const [updatePreferences, { loading: updatingPreferences }] = useMutation(UPDATE_USER_CURRENCY_PREFERENCES);

  // Convert currency mutation
  const [convertCurrencyMutation, { loading: converting }] = useMutation(CONVERT_CURRENCY);

  // ================================
  // Computed Values
  // ================================

  const currencies = useMemo(() => {
    return currenciesData?.currencies || [];
  }, [currenciesData]);

  const activeCurrencies = useMemo(() => {
    return currencies.filter((currency: Currency) => currency.isActive);
  }, [currencies]);

  const userPreferences = useMemo(() => {
    return preferencesData?.userCurrencyPreferences;
  }, [preferencesData]);

  const defaultCurrency = useMemo(() => {
    return userPreferences?.defaultCurrency || 'USD';
  }, [userPreferences]);

  const displayCurrency = useMemo(() => {
    return userPreferences?.displayCurrency || selectedCurrency || 'USD';
  }, [userPreferences, selectedCurrency]);

  // ================================
  // Currency Operations
  // ================================

  const getCurrency = useCallback((code: string): Currency | undefined => {
    return currencies.find((currency: Currency) => currency.code === code);
  }, [currencies]);

  const formatAmount = useCallback((amount: number, currencyCode?: string): string => {
    const currency = getCurrency(currencyCode || displayCurrency);
    
    if (!currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    }).format(amount);
  }, [getCurrency, displayCurrency]);

  const convertCurrency = useCallback(async (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    effectiveDate?: string
  ): Promise<ConversionResult | null> => {
    const cacheKey = `${amount}-${fromCurrency}-${toCurrency}-${effectiveDate || 'today'}`;
    
    // Check cache first
    if (conversionCache.has(cacheKey)) {
      return conversionCache.get(cacheKey)!;
    }

    try {
      const { data } = await convertCurrencyMutation({
        variables: {
          amount,
          fromCurrency,
          toCurrency,
          effectiveDate,
        },
      });

      const result = data?.convertCurrency;
      if (result) {
        // Cache the result
        setConversionCache(prev => new Map(prev).set(cacheKey, result));
        return result;
      }
      return null;
    } catch (error) {
      console.error('Currency conversion failed:', error);
      return null;
    }
  }, [convertCurrencyMutation, conversionCache]);

  const updateUserPreferences = useCallback(async (preferences: {
    defaultCurrency?: string;
    displayCurrency?: string;
  }) => {
    if (!userId) return;

    try {
      await updatePreferences({
        variables: {
          userId,
          input: preferences,
        },
      });
    } catch (error) {
      console.error('Failed to update user currency preferences:', error);
      throw error;
    }
  }, [userId, updatePreferences]);

  // ================================
  // Utility Functions
  // ================================

  const getCurrencyOptions = useCallback(() => {
    return activeCurrencies.map((currency: Currency) => ({
      value: currency.code,
      label: `${currency.code} - ${currency.name}`,
      symbol: currency.symbol,
      decimalPlaces: currency.decimalPlaces,
    }));
  }, [activeCurrencies]);

  const getCurrencySymbol = useCallback((currencyCode: string): string => {
    const currency = getCurrency(currencyCode);
    return currency?.symbol || '$';
  }, [getCurrency]);

  const getCurrencyName = useCallback((currencyCode: string): string => {
    const currency = getCurrency(currencyCode);
    return currency?.name || 'Unknown Currency';
  }, [getCurrency]);

  const getDecimalPlaces = useCallback((currencyCode: string): number => {
    const currency = getCurrency(currencyCode);
    return currency?.decimalPlaces || 2;
  }, [getCurrency]);

  // ================================
  // Effects
  // ================================

  // Set selected currency from user preferences
  useEffect(() => {
    if (userPreferences?.displayCurrency) {
      setSelectedCurrency(userPreferences.displayCurrency);
    }
  }, [userPreferences]);

  // ================================
  // Return Hook Interface
  // ================================

  return {
    // Data
    currencies,
    activeCurrencies,
    userPreferences,
    selectedCurrency,
    defaultCurrency,
    displayCurrency,

    // Loading states
    loading: currenciesLoading || preferencesLoading,
    currenciesLoading,
    preferencesLoading,
    converting,
    updatingPreferences,

    // Errors
    error: currenciesError || preferencesError,
    currenciesError,
    preferencesError,

    // Actions
    setSelectedCurrency,
    convertCurrency,
    updateUserPreferences,
    refetchCurrencies,

    // Utilities
    getCurrency,
    formatAmount,
    getCurrencyOptions,
    getCurrencySymbol,
    getCurrencyName,
    getDecimalPlaces,
  };
};

// ================================
// Specialized Hooks
// ================================

export const useCurrencyFormatter = (currencyCode?: string) => {
  const { formatAmount, getCurrency } = useCurrency();

  return useCallback((amount: number) => {
    return formatAmount(amount, currencyCode);
  }, [formatAmount, currencyCode]);
};

export const useCurrencyConverter = () => {
  const { convertCurrency, converting } = useCurrency();

  return {
    convertCurrency,
    converting,
  };
};

export const useCurrencyPreferences = (userId?: string) => {
  const { 
    userPreferences, 
    updateUserPreferences, 
    preferencesLoading, 
    updatingPreferences,
    preferencesError 
  } = useCurrency(userId);

  return {
    preferences: userPreferences,
    updatePreferences: updateUserPreferences,
    loading: preferencesLoading,
    updating: updatingPreferences,
    error: preferencesError,
  };
}; 