-- Fix Currency System RLS Policies
-- Allow public access to currencies and exchange rates (reference data)

BEGIN;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS currencies_read_all ON currencies;
DROP POLICY IF EXISTS exchange_rates_read_all ON exchange_rates;

-- Create public access policies for currencies (reference data)
CREATE POLICY currencies_read_all ON currencies 
  FOR SELECT TO public 
  USING (true);

-- Create public access policies for exchange rates (reference data)
CREATE POLICY exchange_rates_read_all ON exchange_rates 
  FOR SELECT TO public 
  USING (true);

-- User currency preferences should still require authentication
-- (This policy should already exist from the main migration)

COMMIT;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Currency RLS policies updated for public access';
END $$; 