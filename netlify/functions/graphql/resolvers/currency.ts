import { CurrencyService } from '../../../../lib/services/currencyService';
import { ECBService } from '../../../../lib/services/ecbService';
import { GraphQLError } from 'graphql';

// ================================
// Currency Resolvers
// ================================

export const currencyResolvers = {
  Query: {
    // Get all active currencies
    currencies: async () => {
      try {
        return await CurrencyService.getAllCurrencies();
      } catch (error) {
        console.error('Error fetching currencies:', error);
        throw new GraphQLError('Failed to fetch currencies', {
          extensions: { code: 'CURRENCY_FETCH_ERROR' }
        });
      }
    },

    // Get specific currency by code
    currency: async (_: any, { code }: { code: string }) => {
      try {
        const currency = await CurrencyService.getCurrency(code);
        if (!currency) {
          throw new GraphQLError(`Currency with code ${code} not found`, {
            extensions: { code: 'CURRENCY_NOT_FOUND' }
          });
        }
        return currency;
      } catch (error) {
        if (error instanceof GraphQLError) throw error;
        console.error('Error fetching currency:', error);
        throw new GraphQLError('Failed to fetch currency', {
          extensions: { code: 'CURRENCY_FETCH_ERROR' }
        });
      }
    },

    // Get all exchange rates
    exchangeRates: async () => {
      try {
        return await CurrencyService.getAllExchangeRates();
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        throw new GraphQLError('Failed to fetch exchange rates', {
          extensions: { code: 'EXCHANGE_RATES_FETCH_ERROR' }
        });
      }
    },

    // Get exchange rate between two currencies
    exchangeRate: async (_: any, { 
      fromCurrency, 
      toCurrency, 
      effectiveDate 
    }: { 
      fromCurrency: string; 
      toCurrency: string; 
      effectiveDate?: string; 
    }) => {
      try {
        const rate = await CurrencyService.getExchangeRate(fromCurrency, toCurrency, effectiveDate);
        if (!rate) {
          throw new GraphQLError(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`, {
            extensions: { code: 'EXCHANGE_RATE_NOT_FOUND' }
          });
        }
        return rate;
      } catch (error) {
        if (error instanceof GraphQLError) throw error;
        console.error('Error fetching exchange rate:', error);
        throw new GraphQLError('Failed to fetch exchange rate', {
          extensions: { code: 'EXCHANGE_RATE_FETCH_ERROR' }
        });
      }
    },

    // Get deals grouped by currency
    dealsByCurrency: async () => {
      try {
        return await CurrencyService.getDealsByCurrency();
      } catch (error) {
        console.error('Error fetching deals by currency:', error);
        throw new GraphQLError('Failed to fetch deals by currency', {
          extensions: { code: 'DEALS_BY_CURRENCY_ERROR' }
        });
      }
    },

    // Get user currency preferences
    userCurrencyPreferences: async (_: any, { userId }: { userId: string }) => {
      try {
        const preferences = await CurrencyService.getUserCurrencyPreferences(userId);
        if (!preferences) {
          // Return default preferences if none exist
          return {
            userId,
            defaultCurrency: 'USD',
            displayCurrency: 'USD',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return preferences;
      } catch (error) {
        console.error('Error fetching user currency preferences:', error);
        throw new GraphQLError('Failed to fetch user currency preferences', {
          extensions: { code: 'USER_PREFERENCES_FETCH_ERROR' }
        });
      }
    },
  },

  Mutation: {
    // Create new currency
    createCurrency: async (_: any, { input }: { input: any }) => {
      try {
        return await CurrencyService.createCurrency(input);
      } catch (error) {
        console.error('Error creating currency:', error);
        throw new GraphQLError('Failed to create currency', {
          extensions: { code: 'CURRENCY_CREATE_ERROR' }
        });
      }
    },

    // Update existing currency
    updateCurrency: async (_: any, { code, input }: { code: string; input: any }) => {
      try {
        return await CurrencyService.updateCurrency(code, input);
      } catch (error) {
        console.error('Error updating currency:', error);
        throw new GraphQLError('Failed to update currency', {
          extensions: { code: 'CURRENCY_UPDATE_ERROR' }
        });
      }
    },

    // Convert currency amount
    convertCurrency: async (_: any, { 
      amount, 
      fromCurrency, 
      toCurrency, 
      effectiveDate 
    }: { 
      amount: number; 
      fromCurrency: string; 
      toCurrency: string; 
      effectiveDate?: string; 
    }) => {
      try {
        return await CurrencyService.convertCurrency(amount, fromCurrency, toCurrency, effectiveDate);
      } catch (error) {
        console.error('Error converting currency:', error);
        throw new GraphQLError('Failed to convert currency', {
          extensions: { code: 'CURRENCY_CONVERSION_ERROR' }
        });
      }
    },

    // Update user currency preferences
    updateUserCurrencyPreferences: async (_: any, { 
      userId, 
      input 
    }: { 
      userId: string; 
      input: any; 
    }) => {
      try {
        return await CurrencyService.updateUserCurrencyPreferences(userId, input);
      } catch (error) {
        console.error('Error updating user currency preferences:', error);
        throw new GraphQLError('Failed to update user currency preferences', {
          extensions: { code: 'USER_PREFERENCES_UPDATE_ERROR' }
        });
      }
    },

    // Set exchange rate
    setExchangeRate: async (_: any, { input }: { input: any }) => {
      try {
        return await CurrencyService.setExchangeRate(input);
      } catch (error) {
        console.error('Error setting exchange rate:', error);
        throw new GraphQLError('Failed to set exchange rate', {
          extensions: { code: 'EXCHANGE_RATE_SET_ERROR' }
        });
      }
    },

    // Update rates from ECB API
    updateRatesFromECB: async () => {
      try {
        console.log('🌍 ECB rate update requested via GraphQL');
        const result = await ECBService.updateRatesFromECB();
        
        if (!result.success) {
          throw new GraphQLError(result.message, {
            extensions: { code: 'ECB_UPDATE_FAILED' }
          });
        }

        console.log(`✅ ECB update completed: ${result.message}`);
        return {
          success: result.success,
          message: result.message
        };
      } catch (error) {
        console.error('❌ ECB update error:', error);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to update rates from ECB', {
          extensions: { code: 'ECB_UPDATE_ERROR' }
        });
      }
    },

    // Update deal currency
    updateDealCurrency: async (_: any, { 
      dealId, 
      currency, 
      effectiveDate 
    }: { 
      dealId: string; 
      currency: string; 
      effectiveDate?: string; 
    }) => {
      try {
        await CurrencyService.updateDealCurrency(dealId, currency, effectiveDate);
        return { success: true, message: 'Deal currency updated successfully' };
      } catch (error) {
        console.error('Error updating deal currency:', error);
        throw new GraphQLError('Failed to update deal currency', {
          extensions: { code: 'DEAL_CURRENCY_UPDATE_ERROR' }
        });
      }
    },

    // Update lead currency
    updateLeadCurrency: async (_: any, { 
      leadId, 
      currency, 
      effectiveDate 
    }: { 
      leadId: string; 
      currency: string; 
      effectiveDate?: string; 
    }) => {
      try {
        await CurrencyService.updateLeadCurrency(leadId, currency, effectiveDate);
        return { success: true, message: 'Lead currency updated successfully' };
      } catch (error) {
        console.error('Error updating lead currency:', error);
        throw new GraphQLError('Failed to update lead currency', {
          extensions: { code: 'LEAD_CURRENCY_UPDATE_ERROR' }
        });
      }
    },
  },

  // ================================
  // Field Resolvers
  // ================================

  Deal: {
    // Enhanced deal currency fields
    currency: (parent: any) => parent.currency || 'USD',
    
    amountUsd: (parent: any) => parent.amount_usd || parent.amount,
    
    exchangeRateUsed: (parent: any) => parent.exchange_rate_used || 1.0,
    
    formattedAmount: async (parent: any) => {
      try {
        const currency = await CurrencyService.getCurrency(parent.currency || 'USD');
        return CurrencyService.formatAmount(parent.amount || 0, currency);
      } catch (error) {
        console.error('Error formatting deal amount:', error);
        return CurrencyService.formatAmount(parent.amount || 0, null);
      }
    },
  },

  Lead: {
    // Enhanced lead currency fields
    currency: (parent: any) => parent.currency || 'USD',
    
    estimatedValueUsd: (parent: any) => parent.estimated_value_usd || parent.estimated_value,
    
    exchangeRateUsed: (parent: any) => parent.exchange_rate_used || 1.0,
    
    formattedEstimatedValue: async (parent: any) => {
      try {
        const currency = await CurrencyService.getCurrency(parent.currency || 'USD');
        return CurrencyService.formatAmount(parent.estimated_value || 0, currency);
      } catch (error) {
        console.error('Error formatting lead estimated value:', error);
        return CurrencyService.formatAmount(parent.estimated_value || 0, null);
      }
    },
  },

  // ================================
  // Currency Amount Type Resolver
  // ================================

  CurrencyAmount: {
    formattedAmount: async (parent: any) => {
      try {
        const currency = await CurrencyService.getCurrency(parent.currency);
        return CurrencyService.formatAmount(parent.amount, currency);
      } catch (error) {
        console.error('Error formatting currency amount:', error);
        return CurrencyService.formatAmount(parent.amount, null);
      }
    },
  },
}; 