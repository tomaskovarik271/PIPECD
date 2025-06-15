-- Add unique constraint to exchange_rates table to prevent duplicates
-- This ensures we can safely use upsert operations for ECB API updates

BEGIN;

-- Add unique constraint for from_currency, to_currency, and effective_date
-- This prevents duplicate rates for the same currency pair on the same date
ALTER TABLE exchange_rates 
ADD CONSTRAINT unique_exchange_rate_per_date 
UNIQUE (from_currency, to_currency, effective_date);

-- Create index for better performance on ECB queries
CREATE INDEX IF NOT EXISTS idx_exchange_rates_source_date 
ON exchange_rates(source, effective_date DESC);

-- Create index for currency pair lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_pair 
ON exchange_rates(from_currency, to_currency, effective_date DESC);

COMMIT; 