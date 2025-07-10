-- 20250730000090_cleanup_currency_seeding.sql
-- Clean up currency and exchange rate seeding from migrations
-- Data will be managed via seed files for better maintainability

BEGIN;

-- Remove all seeded currency data with proper cleanup
DO $$
DECLARE
    currency_count INTEGER := 0;
    exchange_rate_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Cleaning up currency system seeding from migrations...';
    
    -- Get current counts for logging
    SELECT COUNT(*) INTO currency_count FROM currencies;
    SELECT COUNT(*) INTO exchange_rate_count FROM exchange_rates;
    
    RAISE NOTICE 'Current database state: % currencies, % exchange rates', currency_count, exchange_rate_count;
    
    -- Remove all seeded exchange rates
    -- These were created in 20250730000045_implement_currency_system.sql
    DELETE FROM exchange_rates 
    WHERE source = 'manual' 
    AND from_currency IN ('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD')
    AND to_currency IN ('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NOK', 'DKK');
    
    -- Remove all seeded currencies
    -- Note: This will CASCADE and remove any related exchange rates due to foreign key constraints
    DELETE FROM currencies 
    WHERE code IN (
        'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NOK', 
        'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'BRL', 'MXN', 'INR', 'KRW', 'SGD',
        'HKD', 'NZD', 'ZAR', 'TRY', 'ILS', 'AED', 'SAR', 'THB', 'MYR', 'IDR',
        'PHP', 'VND', 'EGP', 'NGN', 'KES', 'GHS', 'MAD', 'TND', 'JOD', 'KWD',
        'BHD', 'OMR'
    );
    
    -- Clean up any deals/leads that had currency references
    -- Reset them to NULL so they can be properly set via application logic
    UPDATE deals 
    SET currency = NULL, amount_usd = NULL, exchange_rate_used = NULL, conversion_date = NULL
    WHERE currency IS NOT NULL;
    
    UPDATE leads 
    SET currency = NULL, estimated_value_usd = NULL, exchange_rate_used = NULL, conversion_date = NULL
    WHERE currency IS NOT NULL;
    
    -- Remove any user currency preferences
    DELETE FROM user_currency_preferences;
    
    -- Get final counts
    SELECT COUNT(*) INTO currency_count FROM currencies;
    SELECT COUNT(*) INTO exchange_rate_count FROM exchange_rates;
    
    RAISE NOTICE 'Currency system cleanup completed!';
    RAISE NOTICE 'Final database state: % currencies, % exchange rates', currency_count, exchange_rate_count;
    RAISE NOTICE 'All currency data will now be managed via seed files (03_currencies.sql)';
    RAISE NOTICE 'Deals and leads currency fields reset - will be set via application logic';
END $$;

COMMIT; 