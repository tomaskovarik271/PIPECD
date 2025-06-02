// lib/priceQuoteService.ts
import { supabase } from './supabaseClient'; // Assuming usage of a shared Supabase client
import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils';
import type {
  PriceQuote,
  PriceQuoteCreateInput,
  PriceQuoteUpdateInput,
  AdditionalCostInput,
  AdditionalCost,
  InvoiceScheduleEntry,
  PriceQuoteInputData,
  PriceQuoteCalculatedOutputs,
  InvoiceScheduleEntryData
} from './pricingTypes';
import * as priceCalculator from './priceCalculator';
// Import generated GraphQL types once available, e.g.:
// import type { PriceQuote, PriceQuoteCreateInput, PriceQuoteUpdateInput, User } from './generated/graphql';
// Import other necessary types or services

// Internal helper to calculate and prepare snapshot data
// TODO: Implement fully - this is a placeholder
async function calculateAndSnapshotQuoteOutputs(
  quoteInputData: PriceQuoteInputData,
  additionalCostsInput: AdditionalCostInput[] = []
): Promise<PriceQuoteCalculatedOutputs> {
  const mp = quoteInputData.base_minimum_price_mp || 0;
  const acItemsForCalc = additionalCostsInput.map(ac => ({ amount: ac.amount }));
  const fop = quoteInputData.final_offer_price_fop || 0;

  const calculated_total_direct_cost = priceCalculator.calculateTotalDirectCost(mp, acItemsForCalc);
  const calculated_target_price_tp = priceCalculator.calculateTargetPrice(mp, quoteInputData.target_markup_percentage || 0);
  const calculated_full_target_price_ftp = priceCalculator.calculateFullTargetPrice(calculated_target_price_tp, acItemsForCalc);
  // Assuming final_offer_price_fop is the basis for discounted price if overall_discount_percentage is applied to it.
  // Or, if FOP is *after* discount, then this calculation might differ based on business logic.
  // For now, let's assume FOP is pre-discount and discount is applied to it.
  const discountedOfferPriceBase = fop; 
  const calculated_discounted_offer_price = priceCalculator.calculateDiscountedOfferPrice(discountedOfferPriceBase, quoteInputData.overall_discount_percentage || 0);
  const calculated_effective_markup_fop_over_mp = priceCalculator.calculateEffectiveMarkupFopOverMp(fop, mp);
  const escalation = priceCalculator.determineEscalationStatus(fop, mp, calculated_total_direct_cost);

  return {
    calculated_total_direct_cost,
    calculated_target_price_tp,
    calculated_full_target_price_ftp,
    calculated_discounted_offer_price,
    calculated_effective_markup_fop_over_mp,
    escalation_status: escalation.status,
    escalation_details: escalation.details,
  };
}

// Internal helper to generate invoice schedule
// TODO: Implement fully - this is a placeholder
async function generateInvoiceScheduleForQuote(
  quoteData: PriceQuoteInputData, 
  calculatedOfferPrice: number
): Promise<InvoiceScheduleEntryData[]> {
  return priceCalculator.generateBasicInvoiceSchedule(
    calculatedOfferPrice,
    quoteData.upfront_payment_percentage,
    quoteData.upfront_payment_due_days,
    quoteData.subsequent_installments_count,
    quoteData.subsequent_installments_interval_days
  );
}

export const priceQuoteService = {
  async createPriceQuote(userId: string, dealId: string, input: PriceQuoteCreateInput, accessToken: string): Promise<PriceQuote> {
    const client = getAuthenticatedClient(accessToken);

    const calculatedOutputs = await calculateAndSnapshotQuoteOutputs(
      input as PriceQuoteInputData, // Cast needed as PriceQuoteCreateInput is subset of PriceQuoteInputData
      input.additional_costs
    );

    const { data: quoteData, error: quoteError } = await client
      .from('price_quotes')
      .insert({
        deal_id: dealId,
        user_id: userId,
        name: input.name,
        base_minimum_price_mp: input.base_minimum_price_mp,
        target_markup_percentage: input.target_markup_percentage,
        final_offer_price_fop: input.final_offer_price_fop,
        overall_discount_percentage: input.overall_discount_percentage,
        upfront_payment_percentage: input.upfront_payment_percentage,
        upfront_payment_due_days: input.upfront_payment_due_days,
        subsequent_installments_count: input.subsequent_installments_count,
        subsequent_installments_interval_days: input.subsequent_installments_interval_days,
        ...calculatedOutputs,
        // version_number and status have defaults in DB
      })
      .select()
      .single();

    if (quoteError) handleSupabaseError(quoteError, 'creating price quote');
    if (!quoteData) throw new Error('Failed to create price quote, no data returned.');

    let createdAdditionalCosts: AdditionalCost[] = [];
    if (input.additional_costs && input.additional_costs.length > 0) {
      const costsToInsert = input.additional_costs.map(ac => ({ ...ac, price_quote_id: quoteData.id }));
      const { data: acData, error: acError } = await client
        .from('quote_additional_costs')
        .insert(costsToInsert)
        .select();
      if (acError) handleSupabaseError(acError, 'creating additional costs');
      createdAdditionalCosts = acData || [];
    }

    const invoiceScheduleToGenerate = await generateInvoiceScheduleForQuote(
      input as PriceQuoteInputData, // Similar cast
      calculatedOutputs.calculated_discounted_offer_price // Use the final calculated offer price
    );
    
    let createdInvoiceEntries: InvoiceScheduleEntry[] = [];
    if (invoiceScheduleToGenerate.length > 0) {
      const entriesToInsert = invoiceScheduleToGenerate.map(entry => ({ ...entry, price_quote_id: quoteData.id }));
      const { data: entryData, error: entryError } = await client
        .from('quote_invoice_schedule_entries')
        .insert(entriesToInsert)
        .select();
      if (entryError) handleSupabaseError(entryError, 'creating invoice schedule entries');
      createdInvoiceEntries = entryData || [];
    }
    
    return {
        ...quoteData,
        additional_costs: createdAdditionalCosts,
        invoice_schedule_entries: createdInvoiceEntries,
    } as PriceQuote; // Cast to ensure all relational fields are at least optionally present
  },

  async getPriceQuoteById(quoteId: string, userId: string, accessToken: string): Promise<PriceQuote | null> {
    const client = getAuthenticatedClient(accessToken);
    // userId is implicitly used by RLS through the authenticated client
    console.log('Fetching quote by id:', quoteId, 'userId for RLS:', userId);

    const { data, error } = await client
      .from('price_quotes')
      .select(`
        *,
        additional_costs:quote_additional_costs(*),
        invoice_schedule_entries:quote_invoice_schedule_entries(*)
      `)
      .eq('id', quoteId)
      .single(); // Expect a single record or null

    if (error && error.code !== 'PGRST116') { // PGRST116: "Searched for a single row, but 0 rows were found"
      handleSupabaseError(error, 'getting price quote by ID');
    }
    
    if (!data) return null;

    return {
      ...data,
      additional_costs: data.additional_costs || [],
      invoice_schedule_entries: data.invoice_schedule_entries || [],
    } as PriceQuote;
  },

  async updatePriceQuote(quoteId: string, userId: string, input: PriceQuoteUpdateInput, accessToken: string): Promise<PriceQuote> {
    const client = getAuthenticatedClient(accessToken);
    console.log('Updating quote:', quoteId, 'by userId:', userId);

    // 1. Fetch the existing quote to get all current fields like version_number
    const { data: existingQuote, error: fetchError } = await client
      .from('price_quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (fetchError) handleSupabaseError(fetchError, 'fetching existing quote for update');
    if (!existingQuote) throw new Error('Quote to update not found.');

    // 2. Construct the full input data for calculation functions
    // Overlaying input changes onto the existing quote data
    const quoteDataForCalculations: PriceQuoteInputData = {
      // Start with existing data, then override with input fields
      // Ensure all fields required by PriceQuoteInputData are present
      version_number: existingQuote.version_number, // from existing
      name: input.name !== undefined ? input.name : existingQuote.name,
      status: input.status !== undefined ? input.status : existingQuote.status, 
      base_minimum_price_mp: input.base_minimum_price_mp !== undefined ? input.base_minimum_price_mp : existingQuote.base_minimum_price_mp,
      target_markup_percentage: input.target_markup_percentage !== undefined ? input.target_markup_percentage : existingQuote.target_markup_percentage,
      final_offer_price_fop: input.final_offer_price_fop !== undefined ? input.final_offer_price_fop : existingQuote.final_offer_price_fop,
      overall_discount_percentage: input.overall_discount_percentage !== undefined ? input.overall_discount_percentage : existingQuote.overall_discount_percentage,
      upfront_payment_percentage: input.upfront_payment_percentage !== undefined ? input.upfront_payment_percentage : existingQuote.upfront_payment_percentage,
      upfront_payment_due_days: input.upfront_payment_due_days !== undefined ? input.upfront_payment_due_days : existingQuote.upfront_payment_due_days,
      subsequent_installments_count: input.subsequent_installments_count !== undefined ? input.subsequent_installments_count : existingQuote.subsequent_installments_count,
      subsequent_installments_interval_days: input.subsequent_installments_interval_days !== undefined ? input.subsequent_installments_interval_days : existingQuote.subsequent_installments_interval_days,
      // calculated fields will be replaced by new calculation
      calculated_total_direct_cost: existingQuote.calculated_total_direct_cost, // placeholder, will be overwritten
      calculated_target_price_tp: existingQuote.calculated_target_price_tp, // placeholder
      calculated_full_target_price_ftp: existingQuote.calculated_full_target_price_ftp, // placeholder
      calculated_discounted_offer_price: existingQuote.calculated_discounted_offer_price, // placeholder
      calculated_effective_markup_fop_over_mp: existingQuote.calculated_effective_markup_fop_over_mp, // placeholder
      escalation_status: existingQuote.escalation_status, // placeholder
      escalation_details: existingQuote.escalation_details, // placeholder
      // additional_costs_data for calculation function if needed, or pass full additional_costs from input
    };

    // 3. Recalculate outputs
    const calculatedOutputs = await calculateAndSnapshotQuoteOutputs(
      quoteDataForCalculations, // Use the merged data
      input.additional_costs // Pass new additional_costs from input for calculation
    );

    // 4. Update the main price_quote record
    const { data: updatedQuoteData, error: updateError } = await client
      .from('price_quotes')
      .update({
        name: quoteDataForCalculations.name,
        status: quoteDataForCalculations.status,
        base_minimum_price_mp: quoteDataForCalculations.base_minimum_price_mp,
        target_markup_percentage: quoteDataForCalculations.target_markup_percentage,
        final_offer_price_fop: quoteDataForCalculations.final_offer_price_fop,
        overall_discount_percentage: quoteDataForCalculations.overall_discount_percentage,
        upfront_payment_percentage: quoteDataForCalculations.upfront_payment_percentage,
        upfront_payment_due_days: quoteDataForCalculations.upfront_payment_due_days,
        subsequent_installments_count: quoteDataForCalculations.subsequent_installments_count,
        subsequent_installments_interval_days: quoteDataForCalculations.subsequent_installments_interval_days,
        ...calculatedOutputs,
        updated_at: new Date().toISOString(), // Explicitly set updated_at
      })
      .eq('id', quoteId)
      // .eq('user_id', userId) // RLS should handle ownership check for updates
      .select()
      .single();

    if (updateError) handleSupabaseError(updateError, 'updating price quote');
    if (!updatedQuoteData) throw new Error('Failed to update price quote or quote not found.');

    // 5. Handle additional_costs: Delete existing and insert new ones
    const { error: deleteAcError } = await client
      .from('quote_additional_costs')
      .delete()
      .eq('price_quote_id', quoteId);

    if (deleteAcError) handleSupabaseError(deleteAcError, 'deleting old additional costs');

    let newAdditionalCosts: AdditionalCost[] = [];
    if (input.additional_costs && input.additional_costs.length > 0) {
      const costsToInsert = input.additional_costs.map(ac => ({ ...ac, price_quote_id: quoteId }));
      const { data: insertedAcData, error: insertAcError } = await client
        .from('quote_additional_costs')
        .insert(costsToInsert)
        .select();
      if (insertAcError) handleSupabaseError(insertAcError, 'inserting new additional costs');
      newAdditionalCosts = insertedAcData || [];
    }

    // 6. Handle invoice_schedule_entries: Regenerate, delete existing, and insert new ones
    const invoiceScheduleToGenerate = await generateInvoiceScheduleForQuote(
      quoteDataForCalculations, // Use the merged data for context
      calculatedOutputs.calculated_discounted_offer_price // Use the new final calculated offer price
    );

    const { error: deleteIsError } = await client
      .from('quote_invoice_schedule_entries')
      .delete()
      .eq('price_quote_id', quoteId);

    if (deleteIsError) handleSupabaseError(deleteIsError, 'deleting old invoice schedule entries');

    let newInvoiceEntries: InvoiceScheduleEntry[] = [];
    if (invoiceScheduleToGenerate.length > 0) {
      const entriesToInsert = invoiceScheduleToGenerate.map(entry => ({ ...entry, price_quote_id: quoteId }));
      const { data: insertedIsData, error: insertIsError } = await client
        .from('quote_invoice_schedule_entries')
        .insert(entriesToInsert)
        .select();
      if (insertIsError) handleSupabaseError(insertIsError, 'inserting new invoice schedule entries');
      newInvoiceEntries = insertedIsData || [];
    }

    // Return the updated quote with its new relations
    // It might be cleaner to re-fetch using getPriceQuoteById to ensure consistency
    // For now, construct it from parts, assuming updatedQuoteData has the main fields
    return {
      ...updatedQuoteData,
      additional_costs: newAdditionalCosts,
      invoice_schedule_entries: newInvoiceEntries,
    } as PriceQuote;
  },

  async deletePriceQuote(quoteId: string, userId: string, accessToken: string): Promise<boolean> {
    const client = getAuthenticatedClient(accessToken);
    // userId is implicitly used by RLS through the authenticated client for permission checks
    console.log('Attempting to delete quote:', quoteId, 'by userId for RLS:', userId);

    const { error } = await client
      .from('price_quotes')
      .delete()
      .eq('id', quoteId);

    if (error) {
      // Log the error but don't necessarily throw if RLS simply prevents deletion (which might not be an error in some flows)
      // However, for a direct delete attempt, an error usually means something went wrong or access denied.
      console.error('Error deleting price quote:', error.message);
      handleSupabaseError(error, 'deleting price quote'); // This will throw if it's a significant DB error
      return false; // If handleSupabaseError doesn't throw, or if we want to return false on any error
    }
    
    // If no error, the delete command was accepted. 
    // This doesn't guarantee a row was deleted (e.g. if ID didn't exist or RLS prevented without erroring explicitly in a certain way).
    // For more certainty, one could use .delete({ count: 'exact' }) and check if count === 1, 
    // but that might error if RLS silently prevents deletion of a non-owned existing record.
    return true; 
  },

  async listPriceQuotesForDeal(dealId: string, userId: string, accessToken: string): Promise<PriceQuote[]> {
    const client = getAuthenticatedClient(accessToken);
    // userId is implicitly used by RLS through the authenticated client
    console.log('Fetching quotes for dealId:', dealId, 'userId for RLS:', userId); 

    const { data, error } = await client
      .from('price_quotes')
      .select(`
        *,
        additional_costs:quote_additional_costs(*),
        invoice_schedule_entries:quote_invoice_schedule_entries(*)
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error, 'listing price quotes for deal');
    if (!data) return [];

    // Transform data if necessary to match PriceQuote type, 
    // especially if DB column names differ or if relations need restructuring.
    // For now, assume direct mapping is mostly fine but ensure relations are correctly named.
    return data.map(quote => ({
      ...quote,
      additional_costs: quote.additional_costs || [],
      invoice_schedule_entries: quote.invoice_schedule_entries || [],
    })) as PriceQuote[];
  },

  // Potentially expose helper functions for managing sub-entities if needed by resolvers directly
  // e.g., getAdditionalCostsForQuote, getInvoiceScheduleForQuote
};

// Internal helper functions (example)
// function calculateAndSnapshotQuoteOutputs(quoteData: any): any {
//   // ... calculation logic
//   return {};
// }

// function generateInvoiceScheduleForQuote(quoteData: any, calculatedOfferPrice: number): any[] {
//   // ... schedule generation
//   return [];
// } 