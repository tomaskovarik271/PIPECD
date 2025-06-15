# 🏛️ PipeCD Enterprise Currency Architecture

**Universal Financial Infrastructure for Scalable Business Operations**

---

## 🎯 Current State Discovery

**CRITICAL FINDING**: PipeCD already has a **comprehensive currency GraphQL API designed** but **not implemented**! 

### **✅ What's Already Designed (GraphQL Schema)**
- Complete `Currency` type with code, name, symbol, decimalPlaces
- `CurrencyAmount` type with amountUsd and exchangeRateUsed fields
- `ExchangeRate` type with full conversion tracking
- `UserCurrencyPreferences` type for user settings
- Advanced queries: `currencies`, `currency`, `exchangeRate`, `dealsByCurrency`
- Comprehensive mutations: `createCurrency`, `updateCurrency`, `convertCurrency`
- Deal/Lead types already include: `currency`, `amountUsd`, `formattedAmount`, `exchangeRateUsed`

### **❌ What's Missing (Implementation)**
- **Database schema**: No currency tables or columns exist
- **GraphQL resolvers**: Currency types defined but no resolvers implemented
- **Service layer**: No currency services exist
- **Frontend**: Hard-coded USD throughout the application

### **🎯 Implementation Strategy**
This is **ideal** - we can implement a production-ready currency system that perfectly aligns with the existing GraphQL API design, ensuring seamless integration with the current architecture.

---

## 🏛️ Universal Currency Architecture

### **🏗️ Architectural Alignment with PipeCD Principles**

Following PipeCD's core architectural patterns:
- **🔄 Service-Oriented Architecture**: Dedicated currency services with clear boundaries
- **🎯 API-First Design**: GraphQL-native currency operations (already designed!)
- **🛡️ Security-by-Design**: Enterprise-grade financial data protection
- **🎨 UI-Service Separation**: Currency logic isolated from presentation
- **🔧 Infrastructure as Code**: Versioned currency schema and configurations

---

## 🗄️ Database Implementation (Phase 1)

### **1. 📊 Core Currency Infrastructure**

```sql
-- Migration: 20250115143022_implement_currency_system.sql
-- Implementing the currency system to match existing GraphQL schema

BEGIN;

-- ================================
-- 1. Core Currency Tables
-- ================================

-- Universal currency definitions (ISO 4217 + extensions)
CREATE TABLE currencies (
  code VARCHAR(3) PRIMARY KEY,           -- ISO 4217 alpha code (USD, EUR, GBP)
  name TEXT NOT NULL,                    -- "US Dollar", "Euro", "British Pound"
  symbol VARCHAR(10) NOT NULL,           -- "$", "€", "£"
  decimal_places INTEGER NOT NULL DEFAULT 2, -- Matches GraphQL decimalPlaces field
  
  -- Currency properties
  is_active BOOLEAN DEFAULT true,
  
  -- Audit fields (matches GraphQL createdAt/updatedAt)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CHECK (decimal_places >= 0 AND decimal_places <= 4),
  CHECK (LENGTH(code) = 3),
  CHECK (LENGTH(name) > 0),
  CHECK (LENGTH(symbol) > 0)
);

-- Exchange rates with comprehensive tracking
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency VARCHAR(3) REFERENCES currencies(code) NOT NULL,
  to_currency VARCHAR(3) REFERENCES currencies(code) NOT NULL,
  
  -- Rate data (matches GraphQL ExchangeRate type)
  rate DECIMAL(20, 10) NOT NULL,        -- High precision rate
  
  -- Validity period (matches GraphQL effectiveDate)
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Source tracking (matches GraphQL source field)
  source TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'ecb', 'openexchange', etc.
  
  -- Audit fields (matches GraphQL createdAt/updatedAt)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(from_currency, to_currency, effective_date, source),
  CHECK (rate > 0),
  CHECK (from_currency != to_currency)
);

-- User currency preferences (matches GraphQL UserCurrencyPreferences)
CREATE TABLE user_currency_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_currency VARCHAR(3) REFERENCES currencies(code) DEFAULT 'USD',
  display_currency VARCHAR(3) REFERENCES currencies(code) DEFAULT 'USD',
  
  -- Audit fields (matches GraphQL createdAt/updatedAt)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- 2. Entity Currency Integration
-- ================================

-- Add currency fields to deals (matches existing GraphQL Deal type)
ALTER TABLE deals 
ADD COLUMN currency VARCHAR(3) REFERENCES currencies(code) DEFAULT 'USD',
ADD COLUMN amount_usd DECIMAL(20, 4),              -- Matches GraphQL amountUsd field
ADD COLUMN exchange_rate_used DECIMAL(20, 10),     -- Matches GraphQL exchangeRateUsed field
ADD COLUMN conversion_date TIMESTAMPTZ;

-- Add currency fields to leads (matches existing GraphQL Lead type)  
ALTER TABLE leads
ADD COLUMN currency VARCHAR(3) REFERENCES currencies(code) DEFAULT 'USD',
ADD COLUMN estimated_value_usd DECIMAL(20, 4),     -- Matches GraphQL estimatedValueUsd field
ADD COLUMN exchange_rate_used DECIMAL(20, 10),     -- Matches GraphQL exchangeRateUsed field
ADD COLUMN conversion_date TIMESTAMPTZ;

-- ================================
-- 3. Performance Indexes
-- ================================

-- Currency indexes
CREATE INDEX idx_currencies_active ON currencies(is_active) WHERE is_active = true;

-- Exchange rate indexes
CREATE INDEX idx_exchange_rates_from_to ON exchange_rates(from_currency, to_currency);
CREATE INDEX idx_exchange_rates_effective_date ON exchange_rates(effective_date DESC);
CREATE INDEX idx_exchange_rates_source ON exchange_rates(source);

-- Entity currency indexes
CREATE INDEX idx_deals_currency ON deals(currency);
CREATE INDEX idx_deals_amount_usd ON deals(amount_usd) WHERE amount_usd IS NOT NULL;
CREATE INDEX idx_leads_currency ON leads(currency);
CREATE INDEX idx_leads_estimated_value_usd ON leads(estimated_value_usd) WHERE estimated_value_usd IS NOT NULL;

-- ================================
-- 4. Seed Data - Major Currencies
-- ================================

INSERT INTO currencies (code, name, symbol, decimal_places, is_active) VALUES
-- Major world currencies
('USD', 'US Dollar', '$', 2, true),
('EUR', 'Euro', '€', 2, true),
('GBP', 'British Pound', '£', 2, true),
('JPY', 'Japanese Yen', '¥', 0, true),
('CAD', 'Canadian Dollar', 'C$', 2, true),
('AUD', 'Australian Dollar', 'A$', 2, true),
('CHF', 'Swiss Franc', 'CHF', 2, true),
('CNY', 'Chinese Yuan', '¥', 2, true),
('SEK', 'Swedish Krona', 'kr', 2, true),
('NOK', 'Norwegian Krone', 'kr', 2, true),
('DKK', 'Danish Krone', 'kr', 2, true),
('PLN', 'Polish Zloty', 'zł', 2, true),
('CZK', 'Czech Koruna', 'Kč', 2, true),
('HUF', 'Hungarian Forint', 'Ft', 0, true),
('RUB', 'Russian Ruble', '₽', 2, true),
('BRL', 'Brazilian Real', 'R$', 2, true),
('MXN', 'Mexican Peso', '$', 2, true),
('INR', 'Indian Rupee', '₹', 2, true),
('KRW', 'South Korean Won', '₩', 0, true),
('SGD', 'Singapore Dollar', 'S$', 2, true),
('HKD', 'Hong Kong Dollar', 'HK$', 2, true),
('NZD', 'New Zealand Dollar', 'NZ$', 2, true),
('ZAR', 'South African Rand', 'R', 2, true),
('TRY', 'Turkish Lira', '₺', 2, true),
('ILS', 'Israeli Shekel', '₪', 2, true),
('AED', 'UAE Dirham', 'د.إ', 2, true),
('SAR', 'Saudi Riyal', '﷼', 2, true),
('THB', 'Thai Baht', '฿', 2, true),
('MYR', 'Malaysian Ringgit', 'RM', 2, true),
('IDR', 'Indonesian Rupiah', 'Rp', 0, true),
('PHP', 'Philippine Peso', '₱', 2, true),
('VND', 'Vietnamese Dong', '₫', 0, true),
('EGP', 'Egyptian Pound', '£', 2, true),
('NGN', 'Nigerian Naira', '₦', 2, true),
('KES', 'Kenyan Shilling', 'KSh', 2, true),
('GHS', 'Ghanaian Cedi', '₵', 2, true),
('MAD', 'Moroccan Dirham', 'د.م.', 2, true),
('TND', 'Tunisian Dinar', 'د.ت', 3, true),
('JOD', 'Jordanian Dinar', 'د.ا', 3, true),
('KWD', 'Kuwaiti Dinar', 'د.ك', 3, true),
('BHD', 'Bahraini Dinar', '.د.ب', 3, true),
('OMR', 'Omani Rial', '﷼', 3, true)
ON CONFLICT (code) DO NOTHING;

-- ================================
-- 5. Row Level Security (RLS)
-- ================================

-- Enable RLS on currency tables
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_currency_preferences ENABLE ROW LEVEL SECURITY;

-- Currency policies (read-only for all authenticated users)
CREATE POLICY "currencies_read_all" ON currencies
  FOR SELECT USING (auth.role() = 'authenticated');

-- Exchange rates policies (read-only for all authenticated users)
CREATE POLICY "exchange_rates_read_all" ON exchange_rates
  FOR SELECT USING (auth.role() = 'authenticated');

-- User preferences policies (users own their preferences)
CREATE POLICY "user_currency_preferences_own" ON user_currency_preferences
  FOR ALL USING (user_id = auth.uid());

-- ================================
-- 6. Triggers for Updated At
-- ================================

-- Currency updated_at trigger
CREATE TRIGGER set_currencies_updated_at
  BEFORE UPDATE ON currencies
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- Exchange rates updated_at trigger  
CREATE TRIGGER set_exchange_rates_updated_at
  BEFORE UPDATE ON exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- User preferences updated_at trigger
CREATE TRIGGER set_user_currency_preferences_updated_at
  BEFORE UPDATE ON user_currency_preferences
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

COMMIT;
```

---

## 🔧 Service Layer Implementation (Phase 2)

### **1. 🌍 Universal Currency Service**

```typescript
// lib/currencyService/index.ts - Universal Currency Engine
import { getAuthenticatedClient } from '../serviceUtils';
import type { Currency, ExchangeRate, UserCurrencyPreferences } from '../generated/graphql';
import Decimal from 'decimal.js';

export interface MonetaryAmount {
  amount: Decimal;
  currency: string;
}

export interface ConversionResult {
  originalAmount: MonetaryAmount;
  convertedAmount: MonetaryAmount;
  exchangeRate: number;
  conversionDate: Date;
}

export class CurrencyService {
  // ================================
  // Core Currency Operations
  // ================================
  
  static async getCurrency(code: string, accessToken: string): Promise<Currency | null> {
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();
    
    if (error || !data) return null;
    
    return {
      code: data.code,
      name: data.name,
      symbol: data.symbol,
      decimalPlaces: data.decimal_places,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
  
  static async getActiveCurrencies(accessToken: string): Promise<Currency[]> {
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('is_active', true)
      .order('code');
    
    if (error || !data) return [];
    
    return data.map(currency => ({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      decimalPlaces: currency.decimal_places,
      isActive: currency.is_active,
      createdAt: currency.created_at,
      updatedAt: currency.updated_at
    }));
  }
  
  // ================================
  // Exchange Rate Operations
  // ================================
  
  static async getExchangeRate(
    fromCurrency: string, 
    toCurrency: string, 
    accessToken: string,
    date: Date = new Date()
  ): Promise<ExchangeRate | null> {
    if (fromCurrency === toCurrency) {
      return {
        id: 'same-currency',
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        rate: 1.0,
        effectiveDate: date,
        source: 'SAME_CURRENCY',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('from_currency', fromCurrency.toUpperCase())
      .eq('to_currency', toCurrency.toUpperCase())
      .lte('effective_date', date.toISOString().split('T')[0])
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      fromCurrency: data.from_currency,
      toCurrency: data.to_currency,
      rate: data.rate,
      effectiveDate: new Date(data.effective_date),
      source: data.source,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
  
  // ================================
  // Currency Conversion Engine
  // ================================
  
  static async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    accessToken: string,
    date: Date = new Date()
  ): Promise<ConversionResult | null> {
    // Same currency - no conversion needed
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: { amount: new Decimal(amount), currency: fromCurrency },
        convertedAmount: { amount: new Decimal(amount), currency: toCurrency },
        exchangeRate: 1.0,
        conversionDate: date
      };
    }
    
    // Get exchange rate
    const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency, accessToken, date);
    if (!exchangeRate) return null;
    
    // Perform high-precision conversion
    const originalAmount = new Decimal(amount);
    const rate = new Decimal(exchangeRate.rate);
    const convertedAmount = originalAmount.mul(rate);
    
    return {
      originalAmount: { amount: originalAmount, currency: fromCurrency },
      convertedAmount: { amount: convertedAmount, currency: toCurrency },
      exchangeRate: exchangeRate.rate,
      conversionDate: date
    };
  }
  
  // ================================
  // User Preferences
  // ================================
  
  static async getUserCurrencyPreferences(
    userId: string, 
    accessToken: string
  ): Promise<UserCurrencyPreferences | null> {
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('user_currency_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      // Return default preferences if none exist
      return {
        userId: userId,
        defaultCurrency: 'USD',
        displayCurrency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    return {
      userId: data.user_id,
      defaultCurrency: data.default_currency,
      displayCurrency: data.display_currency,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
  
  static async updateUserCurrencyPreferences(
    userId: string,
    preferences: { defaultCurrency?: string; displayCurrency?: string },
    accessToken: string
  ): Promise<UserCurrencyPreferences> {
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('user_currency_preferences')
      .upsert({
        user_id: userId,
        default_currency: preferences.defaultCurrency,
        display_currency: preferences.displayCurrency,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update currency preferences: ${error.message}`);
    
    return {
      userId: data.user_id,
      defaultCurrency: data.default_currency,
      displayCurrency: data.display_currency,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
  
  // ================================
  // Entity Currency Updates
  // ================================
  
  static async updateDealCurrency(
    dealId: string,
    amount: number,
    currency: string,
    userId: string,
    accessToken: string
  ): Promise<void> {
    const supabase = getAuthenticatedClient(accessToken);
    
    // Convert to USD for reporting
    const conversion = await this.convertAmount(amount, currency, 'USD', accessToken);
    
    const updateData: any = {
      amount: amount,
      currency: currency.toUpperCase(),
      updated_at: new Date().toISOString()
    };
    
    if (conversion) {
      updateData.amount_usd = conversion.convertedAmount.amount.toNumber();
      updateData.exchange_rate_used = conversion.exchangeRate;
      updateData.conversion_date = conversion.conversionDate.toISOString();
    }
    
    const { error } = await supabase
      .from('deals')
      .update(updateData)
      .eq('id', dealId)
      .eq('user_id', userId);
    
    if (error) throw new Error(`Failed to update deal currency: ${error.message}`);
  }
  
  static async updateLeadCurrency(
    leadId: string,
    estimatedValue: number,
    currency: string,
    userId: string,
    accessToken: string
  ): Promise<void> {
    const supabase = getAuthenticatedClient(accessToken);
    
    // Convert to USD for reporting
    const conversion = await this.convertAmount(estimatedValue, currency, 'USD', accessToken);
    
    const updateData: any = {
      estimated_value: estimatedValue,
      currency: currency.toUpperCase(),
      updated_at: new Date().toISOString()
    };
    
    if (conversion) {
      updateData.estimated_value_usd = conversion.convertedAmount.amount.toNumber();
      updateData.exchange_rate_used = conversion.exchangeRate;
      updateData.conversion_date = conversion.conversionDate.toISOString();
    }
    
    const { error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', leadId)
      .eq('user_id', userId);
    
    if (error) throw new Error(`Failed to update lead currency: ${error.message}`);
  }
}
```

---

## 🎯 GraphQL Resolver Implementation (Phase 3)

### **1. 💰 Currency Resolvers**

```typescript
// netlify/functions/graphql/resolvers/currency.ts
import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken } from '../helpers';
import { CurrencyService } from '../../../../lib/currencyService';
import type {
  CurrencyResolvers,
  ExchangeRateResolvers,
  UserCurrencyPreferencesResolvers,
  QueryResolvers,
  MutationResolvers
} from '../../../../lib/generated/graphql';

// ================================
// Currency Type Resolvers
// ================================

export const Currency: CurrencyResolvers<GraphQLContext> = {
  code: (parent) => parent.code,
  name: (parent) => parent.name,
  symbol: (parent) => parent.symbol,
  decimalPlaces: (parent) => parent.decimalPlaces,
  isActive: (parent) => parent.isActive,
  createdAt: (parent) => parent.createdAt,
  updatedAt: (parent) => parent.updatedAt,
};

export const ExchangeRate: ExchangeRateResolvers<GraphQLContext> = {
  id: (parent) => parent.id,
  fromCurrency: (parent) => parent.fromCurrency,
  toCurrency: (parent) => parent.toCurrency,
  rate: (parent) => parent.rate,
  effectiveDate: (parent) => parent.effectiveDate,
  source: (parent) => parent.source,
  createdAt: (parent) => parent.createdAt,
  updatedAt: (parent) => parent.updatedAt,
};

export const UserCurrencyPreferences: UserCurrencyPreferencesResolvers<GraphQLContext> = {
  userId: (parent) => parent.userId,
  defaultCurrency: (parent) => parent.defaultCurrency,
  displayCurrency: (parent) => parent.displayCurrency,
  createdAt: (parent) => parent.createdAt,
  updatedAt: (parent) => parent.updatedAt,
};

// ================================
// Query Resolvers
// ================================

export const currencyQueries: Partial<QueryResolvers<GraphQLContext>> = {
  currencies: async (_parent, args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context)!;
    
    return await CurrencyService.getActiveCurrencies(accessToken);
  },
  
  currency: async (_parent, args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context)!;
    
    return await CurrencyService.getCurrency(args.code, accessToken);
  },
  
  exchangeRate: async (_parent, args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context)!;
    
    return await CurrencyService.getExchangeRate(
      args.fromCurrency,
      args.toCurrency,
      accessToken
    );
  },
  
  userCurrencyPreferences: async (_parent, _args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context)!;
    const userId = context.currentUser!.id;
    
    return await CurrencyService.getUserCurrencyPreferences(userId, accessToken);
  },
  
  dealsByCurrency: async (_parent, _args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context)!;
    const userId = context.currentUser!.id;
    
    // Implementation for currency-grouped deal amounts
    // This would aggregate deal amounts by currency
    // Return type: CurrencyAmount[]
    return []; // TODO: Implement aggregation logic
  }
};

// ================================
// Mutation Resolvers
// ================================

export const currencyMutations: Partial<MutationResolvers<GraphQLContext>> = {
  updateUserCurrencyPreferences: async (_parent, args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context)!;
    const userId = context.currentUser!.id;
    
    return await CurrencyService.updateUserCurrencyPreferences(
      userId,
      args.input,
      accessToken
    );
  },
  
  convertCurrency: async (_parent, args, context) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context)!;
    
    const conversion = await CurrencyService.convertAmount(
      args.input.amount,
      args.input.fromCurrency,
      args.input.toCurrency,
      accessToken,
      args.input.date ? new Date(args.input.date) : new Date()
    );
    
    if (!conversion) {
      throw new GraphQLError('Currency conversion failed - exchange rate not available');
    }
    
    return {
      originalAmount: conversion.originalAmount.amount.toNumber(),
      convertedAmount: conversion.convertedAmount.amount.toNumber(),
      fromCurrency: conversion.originalAmount.currency,
      toCurrency: conversion.convertedAmount.currency,
      exchangeRate: conversion.exchangeRate,
      conversionDate: conversion.conversionDate
    };
  }
};
```

### **2. 🔄 Enhanced Deal/Lead Resolvers**

```typescript
// Add to netlify/functions/graphql/resolvers/deal.ts

// Add these resolvers to the existing Deal resolver object:

export const Deal: DealResolvers<GraphQLContext> = {
  // ... existing resolvers ...
  
  // ================================
  // Currency Field Resolvers
  // ================================
  
  currency: (parent) => parent.currency || 'USD',
  
  amountUsd: (parent) => parent.amount_usd || null,
  
  amount_usd: (parent) => parent.amount_usd || null,
  
  exchangeRateUsed: (parent) => parent.exchange_rate_used || null,
  
  exchange_rate_used: (parent) => parent.exchange_rate_used || null,
  
  formattedAmount: async (parent, _args, context) => {
    if (!parent.amount) return null;
    
    const currency = parent.currency || 'USD';
    
    try {
      const accessToken = getAccessToken(context);
      if (!accessToken) return `${parent.amount} ${currency}`;
      
      const currencyInfo = await CurrencyService.getCurrency(currency, accessToken);
      if (!currencyInfo) return `${parent.amount} ${currency}`;
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currencyInfo.decimalPlaces,
        maximumFractionDigits: currencyInfo.decimalPlaces
      }).format(parent.amount);
    } catch (error) {
      return `${parent.amount} ${currency}`;
    }
  },
  
  formattedAmountUsd: async (parent, _args, context) => {
    if (!parent.amount_usd) return null;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parent.amount_usd);
  }
};

// Add to netlify/functions/graphql/resolvers/lead.ts

export const Lead: LeadResolvers<GraphQLContext> = {
  // ... existing resolvers ...
  
  // ================================
  // Currency Field Resolvers
  // ================================
  
  currency: (parent) => parent.currency || 'USD',
  
  estimatedValueUsd: (parent) => parent.estimated_value_usd || null,
  
  estimated_value_usd: (parent) => parent.estimated_value_usd || null,
  
  exchangeRateUsed: (parent) => parent.exchange_rate_used || null,
  
  exchange_rate_used: (parent) => parent.exchange_rate_used || null,
  
  formattedEstimatedValue: async (parent, _args, context) => {
    if (!parent.estimated_value) return null;
    
    const currency = parent.currency || 'USD';
    
    try {
      const accessToken = getAccessToken(context);
      if (!accessToken) return `${parent.estimated_value} ${currency}`;
      
      const currencyInfo = await CurrencyService.getCurrency(currency, accessToken);
      if (!currencyInfo) return `${parent.estimated_value} ${currency}`;
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currencyInfo.decimalPlaces,
        maximumFractionDigits: currencyInfo.decimalPlaces
      }).format(parent.estimated_value);
    } catch (error) {
      return `${parent.estimated_value} ${currency}`;
    }
  },
  
  formattedEstimatedValueUsd: async (parent, _args, context) => {
    if (!parent.estimated_value_usd) return null;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parent.estimated_value_usd);
  }
};
```

---

## 🎨 Frontend Implementation (Phase 4)

### **1. 💰 Universal Currency Components**

```typescript
// frontend/src/components/currency/CurrencyDisplay.tsx
import React from 'react';
import { Text, HStack, VStack, Tooltip } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { useCurrency } from '../../hooks/useCurrency';

export interface CurrencyDisplayProps {
  amount: number | null;
  currency: string;
  displayCurrency?: string;        // Show converted amount
  showConversion?: boolean;        // Show both amounts
  showSymbol?: boolean;
  precision?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency,
  displayCurrency,
  showConversion = false,
  showSymbol = true,
  precision,
  size = 'md',
  color = 'inherit',
  className
}) => {
  const { formatCurrency, convertAmount } = useCurrency();
  const [convertedAmount, setConvertedAmount] = React.useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = React.useState<number | null>(null);
  
  // Auto-convert if display currency differs
  React.useEffect(() => {
    if (displayCurrency && currency !== displayCurrency && amount) {
      convertAmount(amount, currency, displayCurrency).then(result => {
        if (result) {
          setConvertedAmount(result.convertedAmount);
          setExchangeRate(result.exchangeRate);
        }
      });
    }
  }, [amount, currency, displayCurrency, convertAmount]);
  
  if (!amount) return <Text className={className} color={color}>-</Text>;
  
  const fontSize = {
    xs: 'xs',
    sm: 'sm', 
    md: 'md',
    lg: 'lg'
  }[size];
  
  return (
    <VStack spacing={1} align="flex-start" className={className}>
      <Text fontSize={fontSize} fontWeight="semibold" color={color}>
        {formatCurrency(amount, currency, { showSymbol, precision })}
      </Text>
      
      {showConversion && convertedAmount && displayCurrency !== currency && (
        <HStack spacing={2} fontSize="xs" color="gray.500">
          <Text>{formatCurrency(convertedAmount, displayCurrency, { showSymbol, precision })}</Text>
          {exchangeRate && (
            <Tooltip label={`Rate: 1 ${currency} = ${exchangeRate.toFixed(4)} ${displayCurrency}`}>
              <InfoIcon />
            </Tooltip>
          )}
        </HStack>
      )}
    </VStack>
  );
};
```

### **2. 🔄 Currency Input Component**

```typescript
// frontend/src/components/currency/CurrencyInput.tsx
import React from 'react';
import { 
  HStack, 
  VStack, 
  NumberInput, 
  NumberInputField, 
  Select,
  Text
} from '@chakra-ui/react';
import { useCurrency } from '../../hooks/useCurrency';
import { CurrencyDisplay } from './CurrencyDisplay';

export interface CurrencyInputProps {
  value?: number;
  currency?: string;
  onValueChange: (amount: number | null, currency: string) => void;
  allowedCurrencies?: string[];
  showConversion?: boolean;
  displayCurrency?: string;
  disabled?: boolean;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  isRequired?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  currency = 'USD',
  onValueChange,
  allowedCurrencies,
  showConversion = false,
  displayCurrency,
  disabled = false,
  placeholder = 'Enter amount',
  size = 'md',
  isRequired = false
}) => {
  const { currencies, userPreferences } = useCurrency();
  const [localValue, setLocalValue] = React.useState<string>(value?.toString() || '');
  
  const availableCurrencies = React.useMemo(() => {
    if (allowedCurrencies) {
      return currencies.filter(c => allowedCurrencies.includes(c.code));
    }
    return currencies.filter(c => c.isActive);
  }, [currencies, allowedCurrencies]);
  
  const handleAmountChange = (valueString: string) => {
    setLocalValue(valueString);
    const numericValue = parseFloat(valueString);
    onValueChange(isNaN(numericValue) ? null : numericValue, currency);
  };
  
  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = event.target.value;
    onValueChange(value || null, newCurrency);
  };
  
  return (
    <VStack spacing={2} align="stretch">
      <HStack spacing={2}>
        <NumberInput
          value={localValue}
          onChange={handleAmountChange}
          placeholder={placeholder}
          isDisabled={disabled}
          size={size}
          flex={1}
          precision={2}
          min={0}
          isRequired={isRequired}
        >
          <NumberInputField />
        </NumberInput>
        
        <Select
          value={currency}
          onChange={handleCurrencyChange}
          isDisabled={disabled}
          size={size}
          minW="120px"
        >
          {availableCurrencies.map(curr => (
            <option key={curr.code} value={curr.code}>
              {curr.symbol} {curr.code}
            </option>
          ))}
        </Select>
      </HStack>
      
      {showConversion && displayCurrency && currency !== displayCurrency && value && (
        <Text fontSize="sm" color="gray.600">
          ≈ <CurrencyDisplay
            amount={value}
            currency={currency}
            displayCurrency={displayCurrency}
            showConversion={false}
            size="sm"
          />
        </Text>
      )}
    </VStack>
  );
};
```

### **3. 🎯 Currency Hook**

```typescript
// frontend/src/hooks/useCurrency.ts
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import type { Currency, UserCurrencyPreferences } from '../generated/graphql/graphql';

const GET_CURRENCIES = gql`
  query GetCurrencies($isActive: Boolean!) {
    currencies(isActive: $isActive) {
      code
      name
      symbol
      decimalPlaces
      isActive
    }
  }
`;

const GET_USER_CURRENCY_PREFERENCES = gql`
  query GetUserCurrencyPreferences {
    userCurrencyPreferences {
      userId
      defaultCurrency
      displayCurrency
    }
  }
`;

const UPDATE_USER_CURRENCY_PREFERENCES = gql`
  mutation UpdateUserCurrencyPreferences($input: UpdateUserCurrencyPreferencesInput!) {
    updateUserCurrencyPreferences(input: $input) {
      userId
      defaultCurrency
      displayCurrency
    }
  }
`;

const CONVERT_CURRENCY = gql`
  mutation ConvertCurrency($input: CurrencyConversionInput!) {
    convertCurrency(input: $input) {
      originalAmount
      convertedAmount
      fromCurrency
      toCurrency
      exchangeRate
      conversionDate
    }
  }
`;

export interface CurrencyFormatOptions {
  showSymbol?: boolean;
  precision?: number;
  locale?: string;
}

export const useCurrency = () => {
  const { data: currenciesData, loading: currenciesLoading } = useQuery(GET_CURRENCIES, {
    variables: { isActive: true }
  });
  
  const { data: preferencesData, loading: preferencesLoading } = useQuery(GET_USER_CURRENCY_PREFERENCES);
  
  const [updatePreferences] = useMutation(UPDATE_USER_CURRENCY_PREFERENCES);
  const [convertCurrencyMutation] = useMutation(CONVERT_CURRENCY);
  
  const currencies: Currency[] = currenciesData?.currencies || [];
  const userPreferences: UserCurrencyPreferences | null = preferencesData?.userCurrencyPreferences || null;
  
  const formatCurrency = (
    amount: number,
    currencyCode: string,
    options: CurrencyFormatOptions = {}
  ): string => {
    const {
      showSymbol = true,
      precision,
      locale = 'en-US'
    } = options;
    
    const currency = currencies.find(c => c.code === currencyCode);
    const decimalPlaces = precision ?? currency?.decimalPlaces ?? 2;
    
    if (!showSymbol) {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      }).format(amount);
    }
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(amount);
  };
  
  const convertAmount = async (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date?: Date
  ) => {
    try {
      const { data } = await convertCurrencyMutation({
        variables: {
          input: {
            amount,
            fromCurrency,
            toCurrency,
            date: date?.toISOString()
          }
        }
      });
      
      return data?.convertCurrency || null;
    } catch (error) {
      console.error('Currency conversion failed:', error);
      return null;
    }
  };
  
  const updateUserPreferences = async (preferences: {
    defaultCurrency?: string;
    displayCurrency?: string;
  }) => {
    try {
      await updatePreferences({
        variables: { input: preferences }
      });
    } catch (error) {
      console.error('Failed to update currency preferences:', error);
      throw error;
    }
  };
  
  return {
    currencies,
    userPreferences,
    loading: currenciesLoading || preferencesLoading,
    formatCurrency,
    convertAmount,
    updateUserPreferences
  };
};
```

---

## 🚀 Implementation Roadmap

### **Phase 1: Database Foundation (Week 1)**
- ✅ Create currency migration with all tables
- ✅ Seed major world currencies
- ✅ Add currency columns to deals/leads
- ✅ Set up RLS policies and indexes

### **Phase 2: Service Layer (Week 2)**
- ✅ Implement CurrencyService with all operations
- ✅ Add currency conversion engine
- ✅ Integrate with existing deal/lead services
- ✅ Add user preferences management

### **Phase 3: GraphQL Integration (Week 3)**
- ✅ Create currency resolvers
- ✅ Enhance deal/lead resolvers with currency fields
- ✅ Add currency queries and mutations
- ✅ Update existing mutations to handle currency

### **Phase 4: Frontend Implementation (Week 4)**
- ✅ Create universal currency components
- ✅ Implement currency hook
- ✅ Update deal/lead forms with currency selection
- ✅ Enhance Kanban with multi-currency display

### **Phase 5: Advanced Features (Week 5-6)**
- 🔮 Exchange rate management UI
- 🔮 Multi-currency reporting
- 🔮 Currency preferences page
- 🔮 Automated exchange rate updates

---

## 🔮 Future-Proof Extensions

### **1. 💳 Payment System Ready**
```typescript
// Future payment integration
interface PaymentAmount extends MonetaryAmount {
  paymentCurrency: string;
  settlementCurrency: string;
  paymentProviderRate?: number;
}
```

### **2. 🏢 ERP Integration Ready**
```typescript
// Future ERP sync
interface ERPCurrencyMapping {
  pipecd_currency: string;
  erp_currency_code: string;
  sync_rate_source: 'pipecd' | 'erp' | 'external';
}
```

### **3. 📊 Advanced Reporting Ready**
```sql
-- Future reporting views
CREATE MATERIALIZED VIEW mv_revenue_by_currency_month AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  currency,
  COUNT(*) as deal_count,
  SUM(amount) as total_original_currency,
  SUM(amount_usd) as total_usd,
  AVG(exchange_rate_used) as avg_exchange_rate
FROM deals 
WHERE amount IS NOT NULL
GROUP BY DATE_TRUNC('month', created_at), currency;
```

---

**This enterprise-grade currency architecture transforms PipeCD into a truly global business platform, perfectly aligned with the existing GraphQL API design and ready to support any future financial module while maintaining the highest standards of accuracy, security, and performance.** 