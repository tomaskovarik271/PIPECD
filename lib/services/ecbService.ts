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
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      // Using exchangerate-api.com as it provides ECB data in JSON format
      const response = await fetch(ECB_API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PipeCD-CRM/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`ECB API request failed: ${response.status} ${response.statusText}`);
      }

      const data: ECBApiResponse = await response.json();
      
      if (!data.rates || typeof data.rates !== 'object') {
        throw new Error('Invalid ECB API response format');
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('ECB API request timed out after 8 seconds');
      }
      console.error('ECB API fetch error:', error);
      throw new Error(`Failed to fetch ECB rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update exchange rates in database from ECB data
   */
  static async updateRatesFromECB(): Promise<{ success: boolean; message: string; updatedCount: number }> {
    try {
      console.log('🔄 Starting ECB exchange rate update');
      
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
      console.log(`💰 Found ${supportedCurrencies.size} supported currencies in database`);

      // Prepare rate updates for batch operation
      const rateUpdates: any[] = [];
      const effectiveDate = ecbData.date || new Date().toISOString().split('T')[0];
      const currentTimestamp = new Date().toISOString();

      // EUR to other currencies (direct from ECB)
      Object.entries(ecbData.rates).forEach(([toCurrency, rate]) => {
        if (supportedCurrencies.has(toCurrency) && typeof rate === 'number' && rate > 0) {
          rateUpdates.push({
            from_currency: 'EUR',
            to_currency: toCurrency,
            rate,
            effective_date: effectiveDate,
            source: 'ecb',
            updated_at: currentTimestamp
          });
        }
      });

      // Other currencies to EUR (inverse rates)
      Object.entries(ecbData.rates).forEach(([fromCurrency, rate]) => {
        if (supportedCurrencies.has(fromCurrency) && typeof rate === 'number' && rate > 0) {
          rateUpdates.push({
            from_currency: fromCurrency,
            to_currency: 'EUR',
            rate: 1 / rate, // Inverse rate
            effective_date: effectiveDate,
            source: 'ecb',
            updated_at: currentTimestamp
          });
        }
      });

      console.log(`🔄 Prepared ${rateUpdates.length} rate updates for batch operation`);

      if (rateUpdates.length === 0) {
        return {
          success: true,
          message: 'No rates to update - no supported currencies found in ECB data',
          updatedCount: 0
        };
      }

      // OPTIMIZATION: Use batch upsert instead of individual operations
      // Process in smaller chunks to avoid memory issues
      const BATCH_SIZE = 50;
      let totalUpdatedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < rateUpdates.length; i += BATCH_SIZE) {
        const batch = rateUpdates.slice(i, i + BATCH_SIZE);
        
        try {
          const { data, error } = await this.supabase
            .from('exchange_rates')
            .upsert(batch, {
              onConflict: 'from_currency,to_currency,effective_date',
              ignoreDuplicates: false
            })
            .select('from_currency, to_currency');

          if (error) {
            errors.push(`Batch ${Math.floor(i/BATCH_SIZE) + 1}: ${error.message}`);
          } else {
            totalUpdatedCount += batch.length;
            console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}: ${batch.length} rates`);
          }
        } catch (error) {
          const errorMsg = `Batch ${Math.floor(i/BATCH_SIZE) + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error('❌ Batch update error:', errorMsg);
        }
      }

      console.log(`🎉 Successfully updated ${totalUpdatedCount} exchange rates`);
      
      if (errors.length > 0) {
        console.warn(`⚠️ ${errors.length} batch errors during update:`, errors);
      }

      return {
        success: true,
        message: `Successfully updated ${totalUpdatedCount} exchange rates from ECB${errors.length > 0 ? ` (${errors.length} batch errors)` : ''}`,
        updatedCount: totalUpdatedCount
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