import { priceQuoteService } from '../../../../../lib/priceQuoteService';
import * as priceCalculator from '../../../../../lib/priceCalculator';
import type { GraphQLContext } from '../../helpers';
// Import generated types and alias them to avoid name clashes if necessary
import type { 
    PriceQuote as GeneratedPriceQuote, 
    PriceQuoteCreateInput as GeneratedPriceQuoteCreateInput, 
    PriceQuoteUpdateInput as GeneratedPriceQuoteUpdateInput,
    AdditionalCostInput as GeneratedAdditionalCostInput,
    // Assuming InvoiceScheduleEntry will also come from generated types if it's part of a GraphQL mutation input/output
    // For now, keeping InvoiceScheduleEntryData from pricingTypes if it's purely an internal calculation type
} from '../../../../../lib/generated/graphql';
import type { InvoiceScheduleEntryData } from '../../../../../lib/pricingTypes'; // Keep if it's an internal type not in GraphQL schema for mutations

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
  createPriceQuote: async (_parent: any, args: { dealId: string, input: GeneratedPriceQuoteCreateInput }, context: GraphQLContext): Promise<GeneratedPriceQuote> => {
    if (!context.currentUser || !context.token) throw new Error("Unauthorized");
    
    const parseResult = PriceQuoteCreateInputSchema.safeParse(args.input);
    if (!parseResult.success) {
      const formattedErrors = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Invalid input: ${formattedErrors}`);
    }
    const validatedInput = parseResult.data as GeneratedPriceQuoteCreateInput;

    // Adapt validatedInput (GeneratedPriceQuoteCreateInput) to serviceInput (PricingTypes.PriceQuoteCreateInput)
    const serviceInputAdapter = {
      ...validatedInput,
      additional_costs: validatedInput.additional_costs ? validatedInput.additional_costs.map(ac => ({ ...ac })) : undefined,
    };

    try {
      const result = await priceQuoteService.createPriceQuote(context.currentUser.id, args.dealId, serviceInputAdapter, context.token);
      return result as unknown as GeneratedPriceQuote;
    } catch (error: any) {
      console.error(`Error creating price quote for deal ${args.dealId}:`, error);
      throw new Error(`Failed to create price quote: ${error.message}`);
    }
  },

  updatePriceQuote: async (_parent: any, args: { id: string, input: GeneratedPriceQuoteUpdateInput }, context: GraphQLContext): Promise<GeneratedPriceQuote> => {
    if (!context.currentUser || !context.currentUser.id || !context.token) {
      throw new Error("Unauthorized - User, User ID, or Token missing");
    }
    const userId: string = context.currentUser.id;

    const parseResult = PriceQuoteUpdateInputSchema.safeParse(args.input);
    if (!parseResult.success) {
      const formattedErrors = parseResult.error!.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Invalid input for update: ${formattedErrors}`);
    }
    const validatedInput = parseResult.data as GeneratedPriceQuoteUpdateInput;
    
    // Adapt validatedInput (GeneratedPriceQuoteUpdateInput) to serviceInput (PricingTypes.PriceQuoteUpdateInput)
    const serviceInputAdapter = {
        ...validatedInput,
        id: args.id,
        additional_costs: validatedInput.additional_costs ? validatedInput.additional_costs.map(ac => ({ ...ac })) : undefined,
    };

    try {
      const result = await priceQuoteService.updatePriceQuote(args.id, userId, serviceInputAdapter, context.token);
      return result as unknown as GeneratedPriceQuote;
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
    args: { dealId?: string | null, input: GeneratedPriceQuoteUpdateInput }, // Use generated type for input
    context: GraphQLContext
  ): Promise<GeneratedPriceQuote> => { // Return generated type
    if (!context.currentUser) throw new Error("Unauthorized");
    
    const parseResult = PriceQuoteUpdateInputSchema.safeParse(args.input);
    if (!parseResult.success) {
        const formattedErrors = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new Error(`Invalid input for preview: ${formattedErrors}`);
    }
    const validatedInput = parseResult.data as GeneratedPriceQuoteUpdateInput; // Cast to generated type

    console.log("[calculatePriceQuotePreview] Args input additional_costs:", JSON.stringify(args.input?.additional_costs));
    console.log("[calculatePriceQuotePreview] Validated additional_costs:", JSON.stringify(validatedInput?.additional_costs));

    const mp = validatedInput.base_minimum_price_mp ?? 0;
    const additionalCostsForCalc = (validatedInput.additional_costs ?? []).map((ac: GeneratedAdditionalCostInput) => ({ // Use generated type
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

    // Constructing the previewQuote to match GeneratedPriceQuote type
    const previewQuote: GeneratedPriceQuote = {
      __typename: 'PriceQuote',
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
      created_at: new Date(), // Assign Date object
      updated_at: new Date(), // Assign Date object
      
      calculated_total_direct_cost,
      calculated_target_price_tp,
      calculated_full_target_price_ftp,
      calculated_discounted_offer_price,
      calculated_effective_markup_fop_over_mp,
      escalation_status: escalation.status,
      escalation_details: escalation.details, // Assuming GraphQL schema type for escalation_details is JSON or compatible
      
      // Ensure additional_costs and invoice_schedule_entries match the GeneratedPriceQuote type structure
      additional_costs: (validatedInput.additional_costs ?? []).map((ac: GeneratedAdditionalCostInput, index: number) => ({ 
        __typename: 'AdditionalCost', // Assuming AdditionalCost is a GraphQL type
        description: ac.description,
        amount: ac.amount,
        id: `temp-ac-${index}`,
        price_quote_id: `preview-${Date.now()}`,
        created_at: new Date(), // Assign Date object
        updated_at: new Date(), // Assign Date object
        // Add/remove fields to match GeneratedAdditionalCost type in GraphQL schema
      })),
      invoice_schedule_entries: invoice_schedule_entries_data.map((entry: InvoiceScheduleEntryData, index: number) => ({
        __typename: 'InvoiceScheduleEntry', // Assuming InvoiceScheduleEntry is a GraphQL type
        ...entry,
        id: `temp-is-${index}`,
        price_quote_id: `preview-${Date.now()}`,
        created_at: new Date(), // Assign Date object
        updated_at: new Date(), // Assign Date object
        // Add/remove fields to match GeneratedInvoiceScheduleEntry type in GraphQL schema
      })),
      // Add any other fields required by GeneratedPriceQuote type, possibly with default/null values
    };

    return previewQuote;
  },
}; 