-- 03_currencies.sql
-- CURRENCY SYSTEM SEEDING
-- ========================
-- Moved from 20250730000045_implement_currency_system.sql
-- Contains 42 world currencies and sample exchange rates

DO $$
BEGIN
    RAISE NOTICE 'Seeding currency system...';
    
    -- ================================
    -- 1. Major World Currencies (42 total)
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
    -- 2. Sample Exchange Rates (USD base)
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
    
    RAISE NOTICE 'Currency system seeding completed! Loaded % currencies and % exchange rates.',
        (SELECT COUNT(*) FROM currencies WHERE is_active = true),
        (SELECT COUNT(*) FROM exchange_rates);
END $$; 