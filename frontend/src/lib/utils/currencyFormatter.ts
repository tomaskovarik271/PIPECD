export interface CurrencyFormatOptions {
  precision?: number;
  compact?: boolean;
  showSymbol?: boolean;
  locale?: string;
}

/**
 * Centralized currency formatter utility
 * Replaces 16+ duplicate formatting functions across the codebase
 */
export class CurrencyFormatter {
  private static formatters = new Map<string, Intl.NumberFormat>();

  /**
   * Format currency amount with caching for performance
   */
  static format(
    amount: number | null | undefined, 
    currency: string = 'USD',
    options: CurrencyFormatOptions = {}
  ): string {
    if (amount === null || amount === undefined) return '-';
    if (isNaN(amount)) return '-';

    const {
      precision = 0,
      compact = false,
      showSymbol = true,
      locale = 'en-US'
    } = options;

    const key = `${currency}-${locale}-${precision}-${compact}-${showSymbol}`;
    
    if (!this.formatters.has(key)) {
      const formatOptions: Intl.NumberFormatOptions = {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
        notation: compact ? 'compact' : 'standard'
      };

      if (showSymbol) {
        formatOptions.style = 'currency';
        formatOptions.currency = currency;
      }

      this.formatters.set(key, new Intl.NumberFormat(locale, formatOptions));
    }

    return this.formatters.get(key)!.format(amount);
  }

  /**
   * Format deal amount with smart compact notation for large values
   */
  static formatDealAmount(
    amount: number | null | undefined,
    currency: string = 'USD'
  ): string {
    if (!amount) return '-';
    
    const shouldUseCompact = amount >= 1000000;
    return this.format(amount, currency, { 
      precision: 0, 
      compact: shouldUseCompact 
    });
  }

  /**
   * Format mixed currency totals for statistics
   */
  static formatMixedCurrencyTotal(
    deals: Array<{ amount?: number | null; currency?: string | null }>,
    fallbackCurrency: string = 'USD'
  ): string {
    const currencyGroups: Record<string, number> = {};
    
    deals.forEach(deal => {
      const currency = deal.currency || fallbackCurrency;
      const amount = deal.amount || 0;
      currencyGroups[currency] = (currencyGroups[currency] || 0) + amount;
    });

    const currencies = Object.keys(currencyGroups);
    
    if (currencies.length === 0) return this.format(0, fallbackCurrency);
    if (currencies.length === 1) {
      const currency = currencies[0]!;
      return this.format(currencyGroups[currency]!, currency);
    }
    
    // Multiple currencies - show primary + count
    const sortedCurrencies = currencies.sort((a, b) => (currencyGroups[b] || 0) - (currencyGroups[a] || 0));
    const primaryCurrency = sortedCurrencies[0]!;
    const primaryAmount = currencyGroups[primaryCurrency]!;
    const formattedPrimary = this.format(primaryAmount, primaryCurrency);
    
    return `${formattedPrimary} +${currencies.length - 1}`;
  }

  /**
   * Format currency for kanban column totals
   */
  static formatColumnTotal(
    deals: Array<{ 
      weighted_amount?: number | null; 
      amount?: number | null;
      currency?: string | null 
    }>,
    displayMode: 'mixed' | 'converted' = 'mixed',
    baseCurrency: string = 'USD'
  ): string {
    if (displayMode === 'converted') {
      // For conversion mode, we'd need conversion rates
      // This is a simplified version - in real implementation,
      // you'd use the currency service to convert amounts
      const totalAmount = deals.reduce((sum, deal) => {
        return sum + (deal.weighted_amount || deal.amount || 0);
      }, 0);
      
      return this.format(totalAmount, baseCurrency);
    } else {
      // Mixed currency display
      return this.formatMixedCurrencyTotal(
        deals.map(deal => ({
          amount: deal.weighted_amount || deal.amount,
          currency: deal.currency
        })),
        baseCurrency
      );
    }
  }

  /**
   * Clear the formatter cache (useful for testing or memory management)
   */
  static clearCache(): void {
    this.formatters.clear();
  }
} 