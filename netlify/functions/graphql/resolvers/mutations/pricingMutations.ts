import { priceQuoteService } from '../../../../../lib/priceQuoteService';
import * as priceCalculator from '../../../../../lib/priceCalculator';
import type { GraphQLContext } from '../../helpers';
import type { PriceQuote as PriceQuoteType, PriceQuoteCreateInput, PriceQuoteUpdateInput, AdditionalCostInput, InvoiceScheduleEntryData } from '../../../../../lib/pricingTypes';
// import { z } from 'zod'; // z is imported from validators now
import { PriceQuoteCreateInputSchema, PriceQuoteUpdateInputSchema } from '../../validators'; 
import { z } from 'zod';

// Placeholder Zod schemas - these should be moved to and imported from validators.ts
// const PriceQuoteCreateInputZodSchema = z.object({ // Renamed for clarity
//   name: z.string().optional().nullable(),
//   status: z.string().optional().nullable(),
//   base_minimum_price_mp: z.number().optional().nullable(),
//   target_markup_percentage: z.number().optional().nullable(),
//   final_offer_price_fop: z.number().optional().nullable(),
//   overall_discount_percentage: z.number().optional().nullable(),
//   upfront_payment_percentage: z.number().optional().nullable(),
//   upfront_payment_due_days: z.number().int().optional().nullable(),
//   subsequent_installments_count: z.number().int().optional().nullable(),
//   subsequent_installments_interval_days: z.number().int().optional().nullable(),
//   additional_costs: z.array(z.object({ description: z.string(), amount: z.number() })).optional().nullable(),
// });
// const PriceQuoteUpdateInputZodSchema = PriceQuoteCreateInputZodSchema.partial(); // Renamed for clarity

export const pricingMutationResolvers = {
  createPriceQuote: async (_parent: any, args: { dealId: string, input: PriceQuoteCreateInput }, context: GraphQLContext): Promise<PriceQuoteType> => {
    if (!context.currentUser || !context.token) throw new Error("Unauthorized");
    
    const parseResult = PriceQuoteCreateInputSchema.safeParse(args.input);
    if (!parseResult.success) {
      const formattedErrors = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Invalid input: ${formattedErrors}`);
    }
    const validatedInput = parseResult.data;

    console.log("[createPriceQuote] Args input additional_costs:", JSON.stringify(args.input?.additional_costs));
    console.log("[createPriceQuote] Validated additional_costs:", JSON.stringify(validatedInput?.additional_costs));

    const serviceInput: PriceQuoteCreateInput = {
      ...validatedInput,
      additional_costs: validatedInput.additional_costs ?? undefined, // Ensure undefined if null
    };

    try {
      return await priceQuoteService.createPriceQuote(context.currentUser.id, args.dealId, serviceInput, context.token);
    } catch (error: any) {
      console.error(`Error creating price quote for deal ${args.dealId}:`, error);
      throw new Error(`Failed to create price quote: ${error.message}`);
    }
  },

  updatePriceQuote: async (_parent: any, args: { id: string, input: PriceQuoteUpdateInput }, context: GraphQLContext): Promise<PriceQuoteType> => {
    // TEMPORARY DEBUG THROW: Test if resolver is reached at all
    // throw new Error("[updatePriceQuote] Resolver entry point reached!");

    // Check for user authentication and essential ID
    if (!context.currentUser || !context.currentUser.id || !context.token) {
      throw new Error("Unauthorized - User, User ID, or Token missing");
    }
    // Explicitly type userId as string after the guard
    const userId: string = context.currentUser.id;

    const parseResult = PriceQuoteUpdateInputSchema.safeParse(args.input);
    if (!parseResult.success) {
      // Assuming parseResult.error is defined when success is false, as per Zod
      const formattedErrors = parseResult.error!.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Invalid input for update: ${formattedErrors}`);
    }
    const validatedInput = parseResult.data;
    
    const serviceInput: PriceQuoteUpdateInput = {
        ...validatedInput,
        id: args.id, 
        additional_costs: validatedInput.additional_costs ?? undefined,
    };

    try {
      // Use the non-nullable userId variable here
      return await priceQuoteService.updatePriceQuote(args.id, userId, serviceInput, context.token);
    } catch (error: any) {
      console.error(`Error updating price quote ${args.id}:`, error);
      throw new Error(`Failed to update price quote: ${error.message}`);
    }
  },

  deletePriceQuote: async (_parent: any, args: { id: string }, context: GraphQLContext): Promise<boolean> => {
    if (!context.currentUser || !context.token) throw new Error("Unauthorized");
    try {
      return await priceQuoteService.deletePriceQuote(args.id, context.currentUser.id, context.token);
    } catch (error: any) {
      console.error(`Error deleting price quote ${args.id}:`, error);
      throw new Error(`Failed to delete price quote: ${error.message}`);
    }
  },

  calculatePriceQuotePreview: async (
    _parent: any, 
    args: { dealId?: string | null, input: PriceQuoteUpdateInput }, 
    context: GraphQLContext
  ): Promise<PriceQuoteType> => {
    if (!context.currentUser) throw new Error("Unauthorized");
    
    // TEMPORARY: Use a looser schema for additional_costs for debugging this specific preview function
    // const LooseAdditionalCostSchema = z.object({
    //   description: z.string().optional().nullable(),
    //   amount: z.number().optional().nullable()
    // }).passthrough(); // Allow other fields

    // const LoosePriceQuoteUpdateInputSchemaForPreview = PriceQuoteUpdateInputSchema.extend({
    //     additional_costs: z.array(LooseAdditionalCostSchema).optional().nullable()
    // });

    // For preview, we also use PriceQuoteUpdateInputSchema as it allows partial data
    const parseResult = PriceQuoteUpdateInputSchema.safeParse(args.input);
    // const parseResult = LoosePriceQuoteUpdateInputSchemaForPreview.safeParse(args.input);

    if (!parseResult.success) {
        const formattedErrors = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new Error(`Invalid input for preview: ${formattedErrors}`);
    }
    const validatedInput = parseResult.data;

    console.log("[calculatePriceQuotePreview] Args input additional_costs:", JSON.stringify(args.input?.additional_costs));
    console.log("[calculatePriceQuotePreview] Validated additional_costs:", JSON.stringify(validatedInput?.additional_costs));

    const mp = validatedInput.base_minimum_price_mp ?? 0;
    // Ensure additional_costs is an array for the calculator, defaulting to empty if null/undefined
    const additionalCostsForCalc = (validatedInput.additional_costs ?? []).map((ac: AdditionalCostInput) => ({ 
      amount: ac.amount ?? 0 
    }));
    const fop = validatedInput.final_offer_price_fop ?? 0;

    const calculated_total_direct_cost = priceCalculator.calculateTotalDirectCost(mp, additionalCostsForCalc);
    const calculated_target_price_tp = priceCalculator.calculateTargetPrice(mp, validatedInput.target_markup_percentage ?? 0);
    const calculated_full_target_price_ftp = priceCalculator.calculateFullTargetPrice(calculated_target_price_tp, additionalCostsForCalc);
    const discountedOfferPriceBase = fop; 
    const calculated_discounted_offer_price = priceCalculator.calculateDiscountedOfferPrice(discountedOfferPriceBase, validatedInput.overall_discount_percentage ?? 0);
    const calculated_effective_markup_fop_over_mp = priceCalculator.calculateEffectiveMarkupFopOverMp(fop, mp);
    const escalation = priceCalculator.determineEscalationStatus(fop, mp, calculated_total_direct_cost);
    
    const invoice_schedule_entries_data = priceCalculator.generateBasicInvoiceSchedule(
      calculated_discounted_offer_price, 
      validatedInput.upfront_payment_percentage,
      validatedInput.upfront_payment_due_days, 
      validatedInput.subsequent_installments_count, 
      validatedInput.subsequent_installments_interval_days
    );

    const previewQuote: PriceQuoteType = {
      id: `preview-${Date.now()}`,
      deal_id: args.dealId || 'temp-deal-id', 
      user_id: context.currentUser.id,
      version_number: 0, 
      name: validatedInput.name ?? "Preview Quote",
      status: validatedInput.status ?? 'draft',
      base_minimum_price_mp: mp,
      target_markup_percentage: validatedInput.target_markup_percentage ?? null,
      final_offer_price_fop: fop,
      overall_discount_percentage: validatedInput.overall_discount_percentage ?? null,
      upfront_payment_percentage: validatedInput.upfront_payment_percentage ?? null,
      upfront_payment_due_days: validatedInput.upfront_payment_due_days ?? null,
      subsequent_installments_count: validatedInput.subsequent_installments_count ?? null,
      subsequent_installments_interval_days: validatedInput.subsequent_installments_interval_days ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      calculated_total_direct_cost,
      calculated_target_price_tp,
      calculated_full_target_price_ftp,
      calculated_discounted_offer_price,
      calculated_effective_markup_fop_over_mp,
      escalation_status: escalation.status,
      escalation_details: escalation.details,
      
      additional_costs: (validatedInput.additional_costs ?? []).map((ac: AdditionalCostInput, index: number) => ({ 
        description: ac.description,
        amount: ac.amount,
        id: `temp-ac-${index}`,
        price_quote_id: `preview-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
      invoice_schedule_entries: invoice_schedule_entries_data.map((entry: InvoiceScheduleEntryData, index: number) => ({
        ...entry,
        id: `temp-is-${index}`,
        price_quote_id: `preview-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
    };

    return previewQuote;
  },
}; 