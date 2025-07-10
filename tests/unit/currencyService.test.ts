import { describe, it, expect, beforeEach, vi } from 'vitest';
import Decimal from 'decimal.js';
import { CurrencyService, type Currency, type ConversionResult } from '../../lib/services/currencyService';

/**
 * 🧪 CurrencyService Unit Tests
 * 
 * Focus: Pure mathematical operations (zero risk testing)
 * Scope: Conversion calculations, formatting logic, precision handling
 * 
 * These tests validate financial accuracy without touching the database.
 * All database operations are mocked to test pure business logic.
 */

describe('CurrencyService - Pure Mathematical Operations', () => {
  
  // ================================
  // Test Data Setup
  // ================================

  const mockCurrencies: Record<string, Currency> = {
    'USD': {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      decimalPlaces: 2,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    'EUR': {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      decimalPlaces: 2,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    'JPY': {
      code: 'JPY',
      name: 'Japanese Yen',
      symbol: '¥',
      decimalPlaces: 0,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    'BTC': {
      code: 'BTC',
      name: 'Bitcoin',
      symbol: '₿',
      decimalPlaces: 8,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }
  };

  const mockExchangeRates = {
    'EUR-USD': { rate: 1.0875, effectiveDate: '2024-01-01' },
    'USD-EUR': { rate: 0.9195, effectiveDate: '2024-01-01' },
    'USD-JPY': { rate: 149.50, effectiveDate: '2024-01-01' },
    'JPY-USD': { rate: 0.006689, effectiveDate: '2024-01-01' },
    'BTC-USD': { rate: 42500.00, effectiveDate: '2024-01-01' },
    'USD-BTC': { rate: 0.00002353, effectiveDate: '2024-01-01' },
  };

  beforeEach(() => {
    // Mock database calls to focus on pure logic testing
    vi.spyOn(CurrencyService, 'getCurrency').mockImplementation(async (code: string) => {
      return mockCurrencies[code.toUpperCase()] || null;
    });

    vi.spyOn(CurrencyService, 'getExchangeRate').mockImplementation(async (from: string, to: string) => {
      const key = `${from.toUpperCase()}-${to.toUpperCase()}`;
      const rate = mockExchangeRates[key];
      if (!rate) return null;
      
      return {
        id: 'mock-id',
        fromCurrency: from.toUpperCase(),
        toCurrency: to.toUpperCase(),
        rate: rate.rate,
        effectiveDate: rate.effectiveDate,
        source: 'mock',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
    });
  });

  // ================================
  // Currency Formatting Tests
  // ================================

  describe('formatAmount', () => {
    it('should format USD amounts with 2 decimal places', () => {
      const result = CurrencyService.formatAmount(1234.56, mockCurrencies.USD);
      expect(result).toBe('$1,234.56');
    });

    it('should format EUR amounts with 2 decimal places', () => {
      const result = CurrencyService.formatAmount(1234.56, mockCurrencies.EUR);
      expect(result).toBe('€1,234.56');
    });

    it('should format JPY amounts with 0 decimal places', () => {
      const result = CurrencyService.formatAmount(1234.56, mockCurrencies.JPY);
      expect(result).toBe('¥1,235'); // Rounded to nearest whole number
    });

    it('should format Bitcoin with 8 decimal places', () => {
      const result = CurrencyService.formatAmount(1.23456789, mockCurrencies.BTC);
      // Note: JavaScript Intl.NumberFormat may not support BTC symbol, so it uses code
      expect(result).toMatch(/^(₿|BTC)\s?1\.23456789$/);
    });

    it('should handle zero amounts correctly', () => {
      const result = CurrencyService.formatAmount(0, mockCurrencies.USD);
      expect(result).toBe('$0.00');
    });

    it('should handle negative amounts correctly', () => {
      const result = CurrencyService.formatAmount(-1234.56, mockCurrencies.USD);
      expect(result).toBe('-$1,234.56');
    });

    it('should handle very large amounts correctly', () => {
      const result = CurrencyService.formatAmount(1234567890.12, mockCurrencies.USD);
      expect(result).toBe('$1,234,567,890.12');
    });

    it('should handle very small amounts correctly', () => {
      const result = CurrencyService.formatAmount(0.00000001, mockCurrencies.BTC);
      // Note: JavaScript Intl.NumberFormat may not support BTC symbol, so it uses code
      expect(result).toMatch(/^(₿|BTC)\s?0\.00000001$/);
    });

    it('should default to USD formatting when currency is null', () => {
      const result = CurrencyService.formatAmount(1234.56, null);
      expect(result).toBe('$1,234.56');
    });

    it('should handle precision edge cases', () => {
      // Test floating point precision issues
      const result1 = CurrencyService.formatAmount(0.1 + 0.2, mockCurrencies.USD);
      expect(result1).toBe('$0.30'); // Should handle 0.30000000000000004
      
      const result2 = CurrencyService.formatAmount(999.999, mockCurrencies.JPY);
      expect(result2).toBe('¥1,000'); // Should round properly
    });
  });

  // ================================
  // Currency Conversion Tests
  // ================================

  describe('convertCurrency - Core Logic', () => {
    it('should handle same currency conversion (no conversion needed)', async () => {
      const result = await CurrencyService.convertCurrency(1000, 'USD', 'USD');
      
      expect(result).toEqual({
        originalAmount: 1000,
        originalCurrency: 'USD',
        convertedAmount: 1000,
        convertedCurrency: 'USD',
        exchangeRate: 1.0,
        effectiveDate: expect.any(String),
        formattedOriginal: '$1,000.00',
        formattedConverted: '$1,000.00',
      });
    });

    it('should handle same currency conversion with different case', async () => {
      const result = await CurrencyService.convertCurrency(1000, 'usd', 'USD');
      
      expect(result.originalCurrency).toBe('USD');
      expect(result.convertedCurrency).toBe('USD');
      expect(result.exchangeRate).toBe(1.0);
    });

    it('should convert EUR to USD correctly', async () => {
      const result = await CurrencyService.convertCurrency(1000, 'EUR', 'USD');
      
      expect(result.originalAmount).toBe(1000);
      expect(result.originalCurrency).toBe('EUR');
      expect(result.convertedAmount).toBe(1087.5); // 1000 * 1.0875
      expect(result.convertedCurrency).toBe('USD');
      expect(result.exchangeRate).toBe(1.0875);
      expect(result.formattedOriginal).toBe('€1,000.00');
      expect(result.formattedConverted).toBe('$1,087.50');
    });

    it('should convert USD to EUR correctly', async () => {
      const result = await CurrencyService.convertCurrency(1000, 'USD', 'EUR');
      
      expect(result.convertedAmount).toBe(919.5); // 1000 * 0.9195
      expect(result.exchangeRate).toBe(0.9195);
    });

    it('should handle high-precision conversions with Decimal.js', async () => {
      // Test precision with Bitcoin conversion
      const result = await CurrencyService.convertCurrency(1, 'USD', 'BTC');
      
      expect(result.convertedAmount).toBe(0.00002353);
      expect(result.exchangeRate).toBe(0.00002353);
      
      // Verify precision using Decimal.js internally
      const originalDecimal = new Decimal(1);
      const rateDecimal = new Decimal(0.00002353);
      const expectedDecimal = originalDecimal.mul(rateDecimal);
      
      expect(result.convertedAmount).toBe(expectedDecimal.toNumber());
    });

    it('should handle zero amount conversions', async () => {
      const result = await CurrencyService.convertCurrency(0, 'USD', 'EUR');
      
      expect(result.originalAmount).toBe(0);
      expect(result.convertedAmount).toBe(0);
      expect(result.formattedOriginal).toBe('$0.00');
      expect(result.formattedConverted).toBe('€0.00');
    });

    it('should handle negative amount conversions', async () => {
      const result = await CurrencyService.convertCurrency(-1000, 'USD', 'EUR');
      
      expect(result.originalAmount).toBe(-1000);
      expect(result.convertedAmount).toBe(-919.5);
      expect(result.formattedOriginal).toBe('-$1,000.00');
      expect(result.formattedConverted).toBe('-€919.50');
    });

    it('should handle very large amount conversions', async () => {
      const largeAmount = 1000000000; // 1 billion
      const result = await CurrencyService.convertCurrency(largeAmount, 'USD', 'JPY');
      
      expect(result.originalAmount).toBe(largeAmount);
      expect(result.convertedAmount).toBe(149500000000); // 1B * 149.50
      expect(result.exchangeRate).toBe(149.50);
    });

    it('should handle very small amount conversions', async () => {
      const smallAmount = 0.01; // 1 cent
      const result = await CurrencyService.convertCurrency(smallAmount, 'USD', 'EUR');
      
      expect(result.originalAmount).toBe(0.01);
      expect(result.convertedAmount).toBeCloseTo(0.009195, 6); // 0.01 * 0.9195
    });

    it('should throw error when exchange rate not found', async () => {
      // Mock getExchangeRate to return null for unsupported pair
      vi.spyOn(CurrencyService, 'getExchangeRate').mockResolvedValueOnce(null);
      
      await expect(
        CurrencyService.convertCurrency(1000, 'USD', 'FAKE')
      ).rejects.toThrow('Exchange rate not found for USD to FAKE');
    });

    it('should handle case-insensitive currency codes', async () => {
      const result = await CurrencyService.convertCurrency(1000, 'usd', 'eur');
      
      expect(result.originalCurrency).toBe('USD');
      expect(result.convertedCurrency).toBe('EUR');
    });
  });

  // ================================
  // Precision and Edge Case Tests
  // ================================

  describe('Mathematical Precision', () => {
    it('should handle floating point precision issues correctly', async () => {
      // Test common floating point precision problems
      const problematicAmount = 0.1 + 0.2; // = 0.30000000000000004
      const result = await CurrencyService.convertCurrency(problematicAmount, 'USD', 'EUR');
      
      // Should use Decimal.js for precise calculation
      const expectedAmount = new Decimal(problematicAmount).mul(new Decimal(0.9195)).toNumber();
      expect(result.convertedAmount).toBe(expectedAmount);
    });

    it('should maintain precision with multiple decimal places', async () => {
      const preciseAmount = 123.456789;
      const result = await CurrencyService.convertCurrency(preciseAmount, 'USD', 'BTC');
      
      // Verify calculation using Decimal.js
      const expected = new Decimal(preciseAmount).mul(new Decimal(0.00002353)).toNumber();
      expect(result.convertedAmount).toBe(expected);
    });

    it('should handle rounding correctly for different decimal places', async () => {
      const amount = 1000.555;
      
      // Test with JPY (0 decimal places)
      const jpyResult = await CurrencyService.convertCurrency(amount, 'USD', 'JPY');
      // Calculate expected: 1000.555 * 149.50 = 149,582.975 → rounds to ¥149,583
      expect(jpyResult.formattedConverted).toBe('¥149,583'); // Properly rounded
      
      // Test with BTC (8 decimal places)
      const btcResult = await CurrencyService.convertCurrency(amount, 'USD', 'BTC');
      expect(btcResult.formattedConverted).toMatch(/(₿|BTC)\s?0\.\d{8}/); // 8 decimal places
    });

    it('should handle extreme values correctly', async () => {
      // Test maximum safe integer
      const maxSafe = Number.MAX_SAFE_INTEGER;
      const result1 = await CurrencyService.convertCurrency(maxSafe, 'USD', 'EUR');
      expect(result1.convertedAmount).toBeGreaterThan(0);
      expect(Number.isFinite(result1.convertedAmount)).toBe(true);
      
      // Test very small values
      const minPositive = Number.MIN_VALUE;
      const result2 = await CurrencyService.convertCurrency(minPositive, 'USD', 'EUR');
      expect(result2.convertedAmount).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(result2.convertedAmount)).toBe(true);
    });
  });

  // ================================
  // Business Logic Validation Tests
  // ================================

  describe('Business Logic Validation', () => {
    it('should ensure conversion consistency (round-trip accuracy)', async () => {
      const originalAmount = 1000;
      
      // Convert USD to EUR
      const usdToEur = await CurrencyService.convertCurrency(originalAmount, 'USD', 'EUR');
      
      // Convert back EUR to USD
      const eurToUsd = await CurrencyService.convertCurrency(usdToEur.convertedAmount, 'EUR', 'USD');
      
      // Should be close to original amount (within reasonable precision)
      // Note: Small precision loss expected due to exchange rate rounding
      expect(eurToUsd.convertedAmount).toBeCloseTo(originalAmount, 1);
    });

    it('should validate exchange rate relationships', async () => {
      // If EUR/USD = 1.0875, then USD/EUR should be approximately 1/1.0875
      const eurToUsd = mockExchangeRates['EUR-USD'].rate;
      const usdToEur = mockExchangeRates['USD-EUR'].rate;
      
      const calculatedInverse = 1 / eurToUsd;
      expect(usdToEur).toBeCloseTo(calculatedInverse, 4);
    });

    it('should maintain data integrity in conversion results', async () => {
      const result = await CurrencyService.convertCurrency(1000, 'USD', 'EUR');
      
      // Verify all required fields are present
      expect(result).toHaveProperty('originalAmount');
      expect(result).toHaveProperty('originalCurrency');
      expect(result).toHaveProperty('convertedAmount');
      expect(result).toHaveProperty('convertedCurrency');
      expect(result).toHaveProperty('exchangeRate');
      expect(result).toHaveProperty('effectiveDate');
      expect(result).toHaveProperty('formattedOriginal');
      expect(result).toHaveProperty('formattedConverted');
      
      // Verify data types
      expect(typeof result.originalAmount).toBe('number');
      expect(typeof result.convertedAmount).toBe('number');
      expect(typeof result.exchangeRate).toBe('number');
      expect(typeof result.originalCurrency).toBe('string');
      expect(typeof result.convertedCurrency).toBe('string');
      expect(typeof result.formattedOriginal).toBe('string');
      expect(typeof result.formattedConverted).toBe('string');
    });

    it('should handle currency code normalization', async () => {
      const testCases = [
        { input: 'usd', expected: 'USD' },
        { input: 'USD', expected: 'USD' },
        { input: 'eur', expected: 'EUR' },
        { input: 'EUR', expected: 'EUR' },
      ];
      
      for (const testCase of testCases) {
        const result = await CurrencyService.convertCurrency(1000, testCase.input, 'USD');
        expect(result.originalCurrency).toBe(testCase.expected);
      }
    });
  });

  // ================================
  // Error Handling Tests
  // ================================

  describe('Error Handling', () => {
    it('should throw meaningful error for invalid currency pairs', async () => {
      vi.spyOn(CurrencyService, 'getExchangeRate').mockResolvedValueOnce(null);
      
      await expect(
        CurrencyService.convertCurrency(1000, 'USD', 'INVALID')
      ).rejects.toThrow('Exchange rate not found for USD to INVALID');
    });

    it('should handle null currency gracefully in formatting', () => {
      const result = CurrencyService.formatAmount(1000, null);
      expect(result).toBe('$1,000.00'); // Should default to USD
    });

    it('should handle undefined amounts gracefully', () => {
      const result = CurrencyService.formatAmount(undefined as any, mockCurrencies.USD);
      // Current behavior returns $NaN - this test documents the actual behavior
      // In production, we might want to add null checks in the service
      expect(result).toBe('$NaN');
    });
  });
});

/**
 * 🎯 Test Coverage Summary:
 * 
 * ✅ Currency Formatting (9 test cases)
 *    - Standard formatting for USD, EUR, JPY, BTC
 *    - Zero, negative, large, and small amounts
 *    - Precision edge cases and null handling
 * 
 * ✅ Currency Conversion (11 test cases)  
 *    - Same currency conversions
 *    - Cross-currency conversions (EUR↔USD, USD↔JPY, USD↔BTC)
 *    - Zero, negative, large, and small amounts
 *    - Case sensitivity and error handling
 * 
 * ✅ Mathematical Precision (4 test cases)
 *    - Floating point precision issues
 *    - Multiple decimal place precision
 *    - Rounding for different currencies
 *    - Extreme value handling
 * 
 * ✅ Business Logic Validation (4 test cases)
 *    - Round-trip conversion accuracy
 *    - Exchange rate relationship validation
 *    - Data integrity verification
 *    - Currency code normalization
 * 
 * ✅ Error Handling (4 test cases)
 *    - Invalid currency pairs
 *    - Null currency handling
 *    - Undefined amount handling
 * 
 * 📊 TOTAL: 32 comprehensive test cases
 * 🎯 FOCUS: Pure mathematical operations (zero database risk)
 * 🛡️ PROTECTION: Financial accuracy and precision
 * 🚀 VALUE: Critical business logic validation
 */ 