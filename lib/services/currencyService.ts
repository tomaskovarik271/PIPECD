import { supabase } from '../supabaseClient';
import Decimal from 'decimal.js';

// ================================
// Types (matching GraphQL schema)
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

export interface CurrencyAmount {
  amount: number;
  currency: string;
  formattedAmount: string;
}

export interface UserCurrencyPreferences {
  userId: string;
  defaultCurrency: string;
  displayCurrency: string;
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

// ================================
// Currency Service Class
// ================================

export class CurrencyService {
  
  // ================================
  // Currency Management
  // ================================

  /**
   * Get all active currencies
   */
  static async getAllCurrencies(): Promise<Currency[]> {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('is_active', true)
      .order('code');

    if (error) {
      console.error('Error fetching currencies:', error);
      throw new Error(`Failed to fetch currencies: ${error.message}`);
    }

    return data.map(this.mapCurrencyFromDb);
  }

  /**
   * Get currency by code
   */
  static async getCurrency(code: string): Promise<Currency | null> {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching currency:', error);
      throw new Error(`Failed to fetch currency: ${error.message}`);
    }

    return this.mapCurrencyFromDb(data);
  }

  /**
   * Create new currency
   */
  static async createCurrency(input: {
    code: string;
    name: string;
    symbol: string;
    decimalPlaces?: number;
    isActive?: boolean;
  }): Promise<Currency> {
    const { data, error } = await supabase
      .from('currencies')
      .insert({
        code: input.code.toUpperCase(),
        name: input.name,
        symbol: input.symbol,
        decimal_places: input.decimalPlaces ?? 2,
        is_active: input.isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating currency:', error);
      throw new Error(`Failed to create currency: ${error.message}`);
    }

    return this.mapCurrencyFromDb(data);
  }

  /**
   * Update currency
   */
  static async updateCurrency(code: string, updates: {
    name?: string;
    symbol?: string;
    decimalPlaces?: number;
    isActive?: boolean;
  }): Promise<Currency> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.symbol !== undefined) updateData.symbol = updates.symbol;
    if (updates.decimalPlaces !== undefined) updateData.decimal_places = updates.decimalPlaces;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('currencies')
      .update(updateData)
      .eq('code', code.toUpperCase())
      .select()
      .single();

    if (error) {
      console.error('Error updating currency:', error);
      throw new Error(`Failed to update currency: ${error.message}`);
    }

    return this.mapCurrencyFromDb(data);
  }

  // ================================
  // Exchange Rate Management
  // ================================

  /**
   * Get all exchange rates
   */
  static async getAllExchangeRates(): Promise<ExchangeRate[]> {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .order('effective_date', { ascending: false })
      .order('from_currency')
      .order('to_currency');

    if (error) {
      console.error('Error fetching exchange rates:', error);
      throw new Error(`Failed to fetch exchange rates: ${error.message}`);
    }

    return data.map(this.mapExchangeRateFromDb);
  }

  /**
   * Get exchange rate between two currencies
   */
  static async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    effectiveDate?: string
  ): Promise<ExchangeRate | null> {
    const date = effectiveDate || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('from_currency', fromCurrency.toUpperCase())
      .eq('to_currency', toCurrency.toUpperCase())
      .lte('effective_date', date)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching exchange rate:', error);
      throw new Error(`Failed to fetch exchange rate: ${error.message}`);
    }

    return this.mapExchangeRateFromDb(data);
  }

  /**
   * Create or update exchange rate
   */
  static async setExchangeRate(input: {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    effectiveDate?: string;
    source?: string;
  }): Promise<ExchangeRate> {
    const { data, error } = await supabase
      .from('exchange_rates')
      .upsert({
        from_currency: input.fromCurrency.toUpperCase(),
        to_currency: input.toCurrency.toUpperCase(),
        rate: input.rate,
        effective_date: input.effectiveDate || new Date().toISOString().split('T')[0],
        source: input.source || 'manual',
      }, {
        onConflict: 'from_currency,to_currency,effective_date,source'
      })
      .select()
      .single();

    if (error) {
      console.error('Error setting exchange rate:', error);
      throw new Error(`Failed to set exchange rate: ${error.message}`);
    }

    return this.mapExchangeRateFromDb(data);
  }

  // ================================
  // Currency Conversion
  // ================================

  /**
   * Convert amount between currencies
   */
  static async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    effectiveDate?: string
  ): Promise<ConversionResult> {
    // Same currency - no conversion needed
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      const currency = await this.getCurrency(fromCurrency);
      const formatted = this.formatAmount(amount, currency);
      
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency.toUpperCase(),
        convertedAmount: amount,
        convertedCurrency: toCurrency.toUpperCase(),
        exchangeRate: 1.0,
        effectiveDate: effectiveDate ?? new Date().toISOString().split('T')[0],
        formattedOriginal: formatted,
        formattedConverted: formatted,
      };
    }

    // Get exchange rate
    const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency, effectiveDate);
    
    if (!exchangeRate) {
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }

    // High-precision conversion using Decimal.js
    const originalDecimal = new Decimal(amount);
    const rateDecimal = new Decimal(exchangeRate.rate);
    const convertedDecimal = originalDecimal.mul(rateDecimal);
    
    const convertedAmount = convertedDecimal.toNumber();

    // Get currencies for formatting
    const [fromCurrencyData, toCurrencyData] = await Promise.all([
      this.getCurrency(fromCurrency),
      this.getCurrency(toCurrency)
    ]);

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency.toUpperCase(),
      convertedAmount,
      convertedCurrency: toCurrency.toUpperCase(),
      exchangeRate: exchangeRate.rate,
      effectiveDate: exchangeRate.effectiveDate,
      formattedOriginal: this.formatAmount(amount, fromCurrencyData),
      formattedConverted: this.formatAmount(convertedAmount, toCurrencyData),
    };
  }

  // ================================
  // User Preferences
  // ================================

  /**
   * Get user currency preferences
   */
  static async getUserCurrencyPreferences(userId: string): Promise<UserCurrencyPreferences | null> {
    const { data, error } = await supabase
      .from('user_currency_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching user currency preferences:', error);
      throw new Error(`Failed to fetch user currency preferences: ${error.message}`);
    }

    return this.mapUserPreferencesFromDb(data);
  }

  /**
   * Update user currency preferences
   */
  static async updateUserCurrencyPreferences(
    userId: string,
    preferences: {
      defaultCurrency?: string;
      displayCurrency?: string;
    }
  ): Promise<UserCurrencyPreferences> {
    const updateData: any = {};
    if (preferences.defaultCurrency) updateData.default_currency = preferences.defaultCurrency.toUpperCase();
    if (preferences.displayCurrency) updateData.display_currency = preferences.displayCurrency.toUpperCase();

    const { data, error } = await supabase
      .from('user_currency_preferences')
      .upsert({
        user_id: userId,
        ...updateData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating user currency preferences:', error);
      throw new Error(`Failed to update user currency preferences: ${error.message}`);
    }

    return this.mapUserPreferencesFromDb(data);
  }

  // ================================
  // Entity Currency Operations
  // ================================

  /**
   * Update deal currency and convert amounts
   */
  static async updateDealCurrency(
    dealId: string,
    newCurrency: string,
    effectiveDate?: string
  ): Promise<void> {
    // Get current deal data
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('amount, currency')
      .eq('id', dealId)
      .single();

    if (dealError) {
      throw new Error(`Failed to fetch deal: ${dealError.message}`);
    }

    if (!deal.amount || !deal.currency) {
      throw new Error('Deal must have amount and currency to convert');
    }

    // Convert to USD for storage
    const conversion = await this.convertCurrency(
      deal.amount,
      newCurrency,
      'USD',
      effectiveDate
    );

    // Update deal with new currency data
    const { error: updateError } = await supabase
      .from('deals')
      .update({
        currency: newCurrency.toUpperCase(),
        amount_usd: conversion.convertedAmount,
        exchange_rate_used: conversion.exchangeRate,
        conversion_date: new Date().toISOString(),
      })
      .eq('id', dealId);

    if (updateError) {
      throw new Error(`Failed to update deal currency: ${updateError.message}`);
    }
  }

  /**
   * Update lead currency and convert amounts
   */
  static async updateLeadCurrency(
    leadId: string,
    newCurrency: string,
    effectiveDate?: string
  ): Promise<void> {
    // Get current lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('estimated_value, currency')
      .eq('id', leadId)
      .single();

    if (leadError) {
      throw new Error(`Failed to fetch lead: ${leadError.message}`);
    }

    if (!lead.estimated_value || !lead.currency) {
      throw new Error('Lead must have estimated_value and currency to convert');
    }

    // Convert to USD for storage
    const conversion = await this.convertCurrency(
      lead.estimated_value,
      newCurrency,
      'USD',
      effectiveDate
    );

    // Update lead with new currency data
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        currency: newCurrency.toUpperCase(),
        estimated_value_usd: conversion.convertedAmount,
        exchange_rate_used: conversion.exchangeRate,
        conversion_date: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (updateError) {
      throw new Error(`Failed to update lead currency: ${updateError.message}`);
    }
  }

  // ================================
  // Formatting Utilities
  // ================================

  /**
   * Format amount with currency
   */
  static formatAmount(amount: number, currency: Currency | null): string {
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
  }

  /**
   * Create CurrencyAmount object
   */
  static async createCurrencyAmount(amount: number, currencyCode: string): Promise<CurrencyAmount> {
    const currency = await this.getCurrency(currencyCode);
    
    return {
      amount,
      currency: currencyCode.toUpperCase(),
      formattedAmount: this.formatAmount(amount, currency),
    };
  }

  // ================================
  // Reporting & Analytics
  // ================================

  /**
   * Get deals grouped by currency
   */
  static async getDealsByCurrency(): Promise<Array<{
    currency: string;
    count: number;
    totalAmount: number;
    totalAmountUsd: number;
    formattedTotal: string;
  }>> {
    const { data, error } = await supabase
      .from('deals')
      .select('currency, amount, amount_usd')
      .not('currency', 'is', null)
      .not('amount', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch deals by currency: ${error.message}`);
    }

    // Group by currency
    const grouped = data.reduce((acc: Record<string, any>, deal: any) => {
      const currency = deal.currency;
      if (!acc[currency]) {
        acc[currency] = {
          currency,
          count: 0,
          totalAmount: 0,
          totalAmountUsd: 0,
        };
      }
      
      acc[currency].count++;
      acc[currency].totalAmount += deal.amount || 0;
      acc[currency].totalAmountUsd += deal.amount_usd || 0;
      
      return acc;
    }, {} as Record<string, any>);

    // Format results
    const results = await Promise.all(
      Object.values(grouped).map(async (group: any) => {
        const currency = await this.getCurrency(group.currency);
        return {
          ...group,
          formattedTotal: this.formatAmount(group.totalAmount, currency),
        };
      })
    );

    return results.sort((a, b) => b.totalAmountUsd - a.totalAmountUsd);
  }

  // ================================
  // Private Mapping Methods
  // ================================

  private static mapCurrencyFromDb(data: any): Currency {
    return {
      code: data.code,
      name: data.name,
      symbol: data.symbol,
      decimalPlaces: data.decimal_places,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private static mapExchangeRateFromDb(data: any): ExchangeRate {
    return {
      id: data.id,
      fromCurrency: data.from_currency,
      toCurrency: data.to_currency,
      rate: data.rate,
      effectiveDate: data.effective_date,
      source: data.source,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private static mapUserPreferencesFromDb(data: any): UserCurrencyPreferences {
    return {
      userId: data.user_id,
      defaultCurrency: data.default_currency,
      displayCurrency: data.display_currency,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

// ================================
// Export default instance
// ================================

export const currencyService = CurrencyService; 