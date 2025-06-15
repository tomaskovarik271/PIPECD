import React from 'react';
import { Text, TextProps, Tooltip, HStack, Badge } from '@chakra-ui/react';
import { useCurrency } from '../../hooks/useCurrency';

// ================================
// Types
// ================================

interface CurrencyDisplayProps extends Omit<TextProps, 'children'> {
  amount: number;
  currency?: string;
  showCurrencyCode?: boolean;
  showTooltip?: boolean;
  convertTo?: string;
  precision?: number;
  variant?: 'default' | 'compact' | 'detailed';
  colorScheme?: 'default' | 'positive' | 'negative' | 'neutral';
}

// ================================
// Currency Display Component
// ================================

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency = 'USD',
  showCurrencyCode = false,
  showTooltip = false,
  convertTo,
  precision,
  variant = 'default',
  colorScheme = 'default',
  ...textProps
}) => {
  const { 
    formatAmount, 
    getCurrency, 
    getCurrencySymbol, 
    getCurrencyName,
    convertCurrency,
    converting 
  } = useCurrency();

  const [convertedAmount, setConvertedAmount] = React.useState<number | null>(null);
  const [conversionRate, setConversionRate] = React.useState<number | null>(null);

  // ================================
  // Currency Conversion Effect
  // ================================

  React.useEffect(() => {
    if (convertTo && convertTo !== currency) {
      convertCurrency(amount, currency, convertTo)
        .then(result => {
          if (result) {
            setConvertedAmount(result.convertedAmount);
            setConversionRate(result.exchangeRate);
          }
        })
        .catch(error => {
          console.error('Currency conversion failed:', error);
        });
    } else {
      setConvertedAmount(null);
      setConversionRate(null);
    }
  }, [amount, currency, convertTo, convertCurrency]);

  // ================================
  // Formatting Logic
  // ================================

  const displayAmount = convertedAmount !== null ? convertedAmount : amount;
  const displayCurrency = convertTo || currency;
  const currencyData = getCurrency(displayCurrency);

  // Apply custom precision if provided
  const finalAmount = precision !== undefined 
    ? Math.round(displayAmount * Math.pow(10, precision)) / Math.pow(10, precision)
    : displayAmount;

  const formattedAmount = formatAmount(finalAmount, displayCurrency);

  // ================================
  // Color Scheme Logic
  // ================================

  const getColorProps = () => {
    switch (colorScheme) {
      case 'positive':
        return { color: 'green.600' };
      case 'negative':
        return { color: 'red.600' };
      case 'neutral':
        return { color: 'gray.600' };
      default:
        return {};
    }
  };

  // ================================
  // Variant Rendering
  // ================================

  const renderContent = () => {
    switch (variant) {
      case 'compact':
        return (
          <Text {...textProps} {...getColorProps()}>
            {getCurrencySymbol(displayCurrency)}{finalAmount.toLocaleString()}
          </Text>
        );

      case 'detailed':
        return (
          <HStack spacing={2}>
            <Text {...textProps} {...getColorProps()}>
              {formattedAmount}
            </Text>
            {showCurrencyCode && (
              <Badge variant="subtle" colorScheme="gray" fontSize="xs">
                {displayCurrency}
              </Badge>
            )}
            {convertedAmount !== null && conversionRate && (
              <Badge variant="outline" colorScheme="blue" fontSize="xs">
                @{conversionRate.toFixed(4)}
              </Badge>
            )}
          </HStack>
        );

      default:
        return (
          <HStack spacing={1}>
            <Text {...textProps} {...getColorProps()}>
              {formattedAmount}
            </Text>
            {showCurrencyCode && (
              <Text fontSize="sm" color="gray.500">
                {displayCurrency}
              </Text>
            )}
          </HStack>
        );
    }
  };

  // ================================
  // Tooltip Content
  // ================================

  const tooltipContent = () => {
    const parts = [];
    
    if (convertedAmount !== null) {
      parts.push(`Original: ${formatAmount(amount, currency)}`);
      parts.push(`Converted: ${formattedAmount}`);
      if (conversionRate) {
        parts.push(`Rate: 1 ${currency} = ${conversionRate} ${displayCurrency}`);
      }
    } else {
      parts.push(`${getCurrencyName(displayCurrency)}`);
      if (currencyData) {
        parts.push(`Symbol: ${currencyData.symbol}`);
        parts.push(`Decimal places: ${currencyData.decimalPlaces}`);
      }
    }
    
    return parts.join('\n');
  };

  // ================================
  // Loading State
  // ================================

  if (converting && convertTo) {
    return (
      <Text {...textProps} color="gray.400">
        Converting...
      </Text>
    );
  }

  // ================================
  // Render with Optional Tooltip
  // ================================

  const content = renderContent();

  if (showTooltip) {
    return (
      <Tooltip 
        label={tooltipContent()} 
        placement="top"
        hasArrow
        bg="gray.700"
        color="white"
        fontSize="sm"
        whiteSpace="pre-line"
      >
        {content}
      </Tooltip>
    );
  }

  return content;
};

// ================================
// Specialized Currency Components
// ================================

export const CurrencyAmount: React.FC<Omit<CurrencyDisplayProps, 'variant'>> = (props) => (
  <CurrencyDisplay variant="default" {...props} />
);

export const CompactCurrency: React.FC<Omit<CurrencyDisplayProps, 'variant'>> = (props) => (
  <CurrencyDisplay variant="compact" {...props} />
);

export const DetailedCurrency: React.FC<Omit<CurrencyDisplayProps, 'variant'>> = (props) => (
  <CurrencyDisplay variant="detailed" showCurrencyCode showTooltip {...props} />
);

// ================================
// Deal/Lead Specific Components
// ================================

export const DealAmount: React.FC<{
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}> = ({ amount, currency = 'USD', size = 'md', showTooltip = false }) => {
  const sizeProps = {
    sm: { fontSize: 'sm' },
    md: { fontSize: 'md', fontWeight: 'semibold' },
    lg: { fontSize: 'lg', fontWeight: 'bold' },
  };

  return (
    <CurrencyDisplay
      amount={amount}
      currency={currency}
      showTooltip={showTooltip}
      colorScheme="positive"
      {...sizeProps[size]}
    />
  );
};

export const LeadValue: React.FC<{
  estimatedValue: number;
  currency?: string;
  showTooltip?: boolean;
}> = ({ estimatedValue, currency = 'USD', showTooltip = false }) => (
  <CurrencyDisplay
    amount={estimatedValue}
    currency={currency}
    showTooltip={showTooltip}
    colorScheme="neutral"
    fontSize="md"
    fontWeight="medium"
  />
);

// ================================
// Export Default
// ================================

export default CurrencyDisplay; 