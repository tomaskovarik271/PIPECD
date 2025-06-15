-- 20250730000045_implement_currency_system.sql
-- PipeCD Currency System: Complete Implementation
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
-- 5. Sample Exchange Rates (USD base)
-- ================================

INSERT INTO exchange_rates (from_currency, to_currency, rate, effective_date, source) VALUES
-- Major currency pairs (sample rates - should be updated with real data)
('USD', 'EUR', 0.85, CURRENT_DATE, 'manual'),
('USD', 'GBP', 0.75, CURRENT_DATE, 'manual'),
('USD', 'JPY', 110.0, CURRENT_DATE, 'manual'),
('USD', 'CAD', 1.25, CURRENT_DATE, 'manual'),
('USD', 'AUD', 1.35, CURRENT_DATE, 'manual'),
('USD', 'CHF', 0.92, CURRENT_DATE, 'manual'),
('USD', 'CNY', 6.45, CURRENT_DATE, 'manual'),
('USD', 'SEK', 8.5, CURRENT_DATE, 'manual'),
('USD', 'NOK', 8.8, CURRENT_DATE, 'manual'),
('USD', 'DKK', 6.3, CURRENT_DATE, 'manual'),
-- Reverse rates for common conversions
('EUR', 'USD', 1.18, CURRENT_DATE, 'manual'),
('GBP', 'USD', 1.33, CURRENT_DATE, 'manual'),
('JPY', 'USD', 0.0091, CURRENT_DATE, 'manual'),
('CAD', 'USD', 0.80, CURRENT_DATE, 'manual'),
('AUD', 'USD', 0.74, CURRENT_DATE, 'manual')
ON CONFLICT (from_currency, to_currency, effective_date, source) DO NOTHING;

-- ================================
-- 6. Row Level Security (RLS)
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
-- 7. Triggers for Updated At
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

-- ================================
-- 8. Update existing deals/leads with USD defaults
-- ================================

-- Set existing deals to USD with USD amounts
UPDATE deals 
SET 
  currency = 'USD',
  amount_usd = amount,
  exchange_rate_used = 1.0,
  conversion_date = NOW()
WHERE currency IS NULL AND amount IS NOT NULL;

-- Set existing leads to USD with USD amounts
UPDATE leads 
SET 
  currency = 'USD',
  estimated_value_usd = estimated_value,
  exchange_rate_used = 1.0,
  conversion_date = NOW()
WHERE currency IS NULL AND estimated_value IS NOT NULL;

COMMIT;

-- ================================
-- 9. Verification Queries
-- ================================

-- Verify currency setup
DO $$
BEGIN
  RAISE NOTICE 'Currency System Implementation Complete!';
  RAISE NOTICE 'Currencies loaded: %', (SELECT COUNT(*) FROM currencies WHERE is_active = true);
  RAISE NOTICE 'Exchange rates loaded: %', (SELECT COUNT(*) FROM exchange_rates);
  RAISE NOTICE 'Deals with currency: %', (SELECT COUNT(*) FROM deals WHERE currency IS NOT NULL);
  RAISE NOTICE 'Leads with currency: %', (SELECT COUNT(*) FROM leads WHERE currency IS NOT NULL);
END $$; 