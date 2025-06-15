import { createClient } from '@supabase/supabase-js';

// ECB API endpoint for daily exchange rates
const ECB_API_URL = 'https://api.exchangerate-api.com/v4/latest/EUR';
const ECB_OFFICIAL_URL = 'https://api.fixer.io/latest?access_key=YOUR_API_KEY&base=EUR';

// Alternative: ECB's official XML endpoint (free but requires XML parsing)
const ECB_XML_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';

interface ECBApiResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

interface ECBRateUpdate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string;
  source: string;
}

export class ECBService {
  private static supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  /**
   * Fetch latest exchange rates from ECB API
   */
  static async fetchECBRates(): Promise<ECBApiResponse> {
    try {
      // Using exchangerate-api.com as it provides ECB data in JSON format
      const response = await fetch(ECB_API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PipeCD-CRM/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`ECB API request failed: ${response.status} ${response.statusText}`);
      }

      const data: ECBApiResponse = await response.json();
      
      if (!data.rates || typeof data.rates !== 'object') {
        throw new Error('Invalid ECB API response format');
      }

      return data;
    } catch (error) {
      console.error('ECB API fetch error:', error);
      throw new Error(`Failed to fetch ECB rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update exchange rates in database from ECB data
   */
  static async updateRatesFromECB(): Promise<{ success: boolean; message: string; updatedCount: number }> {
    try {
      console.log('🌍 Starting ECB exchange rate update...');
      
      // Fetch latest rates from ECB
      const ecbData = await this.fetchECBRates();
      console.log(`📊 Fetched ECB rates for ${Object.keys(ecbData.rates).length} currencies`);

      // Get list of supported currencies from our database
      const { data: currencies, error: currenciesError } = await this.supabase
        .from('currencies')
        .select('code')
        .eq('is_active', true);

      if (currenciesError) {
        throw new Error(`Failed to fetch currencies: ${currenciesError.message}`);
      }

      const supportedCurrencies = new Set(currencies?.map(c => c.code) || []);
      console.log(`💱 Found ${supportedCurrencies.size} supported currencies in database`);

      // Prepare rate updates
      const rateUpdates: ECBRateUpdate[] = [];
      const effectiveDate = ecbData.date || new Date().toISOString().split('T')[0];

      // EUR to other currencies (direct from ECB)
      Object.entries(ecbData.rates).forEach(([toCurrency, rate]) => {
        if (supportedCurrencies.has(toCurrency) && typeof rate === 'number' && rate > 0) {
          rateUpdates.push({
            fromCurrency: 'EUR',
            toCurrency,
            rate,
            effectiveDate,
            source: 'ecb'
          });
        }
      });

      // Other currencies to EUR (inverse rates)
      Object.entries(ecbData.rates).forEach(([fromCurrency, rate]) => {
        if (supportedCurrencies.has(fromCurrency) && typeof rate === 'number' && rate > 0) {
          rateUpdates.push({
            fromCurrency,
            toCurrency: 'EUR',
            rate: 1 / rate, // Inverse rate
            effectiveDate,
            source: 'ecb'
          });
        }
      });

      console.log(`🔄 Prepared ${rateUpdates.length} rate updates`);

      if (rateUpdates.length === 0) {
        return {
          success: true,
          message: 'No rates to update - no supported currencies found in ECB data',
          updatedCount: 0
        };
      }

      // Update rates in database (upsert to handle existing rates)
      let updatedCount = 0;
      const errors: string[] = [];

      for (const update of rateUpdates) {
        try {
          const { error } = await this.supabase
            .from('exchange_rates')
            .upsert({
              from_currency: update.fromCurrency,
              to_currency: update.toCurrency,
              rate: update.rate,
              effective_date: update.effectiveDate,
              source: update.source,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'from_currency,to_currency,effective_date',
              ignoreDuplicates: false
            });

          if (error) {
            errors.push(`${update.fromCurrency}->${update.toCurrency}: ${error.message}`);
          } else {
            updatedCount++;
          }
        } catch (error) {
          errors.push(`${update.fromCurrency}->${update.toCurrency}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`✅ Successfully updated ${updatedCount} exchange rates`);
      
      if (errors.length > 0) {
        console.warn(`⚠️ ${errors.length} errors during update:`, errors);
      }

      return {
        success: true,
        message: `Successfully updated ${updatedCount} exchange rates from ECB${errors.length > 0 ? ` (${errors.length} errors)` : ''}`,
        updatedCount
      };

    } catch (error) {
      console.error('❌ ECB rate update failed:', error);
      return {
        success: false,
        message: `ECB rate update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        updatedCount: 0
      };
    }
  }

  /**
   * Get ECB rate update status and last update time
   */
  static async getECBUpdateStatus(): Promise<{
    lastUpdate: string | null;
    totalECBRates: number;
    supportedCurrencies: string[];
  }> {
    try {
      // Get last ECB update
      const { data: lastRate } = await this.supabase
        .from('exchange_rates')
        .select('updated_at')
        .eq('source', 'ecb')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      // Get count of ECB rates
      const { count: totalECBRates } = await this.supabase
        .from('exchange_rates')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'ecb');

      // Get supported currencies
      const { data: currencies } = await this.supabase
        .from('currencies')
        .select('code')
        .eq('is_active', true)
        .order('code');

      return {
        lastUpdate: lastRate?.updated_at || null,
        totalECBRates: totalECBRates || 0,
        supportedCurrencies: currencies?.map(c => c.code) || []
      };
    } catch (error) {
      console.error('Error getting ECB status:', error);
      return {
        lastUpdate: null,
        totalECBRates: 0,
        supportedCurrencies: []
      };
    }
  }

  /**
   * Validate ECB API connectivity
   */
  static async testECBConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const data = await this.fetchECBRates();
      const rateCount = Object.keys(data.rates).length;
      
      return {
        success: true,
        message: `ECB API connection successful. Retrieved ${rateCount} exchange rates for ${data.date}`
      };
    } catch (error) {
      return {
        success: false,
        message: `ECB API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
} 