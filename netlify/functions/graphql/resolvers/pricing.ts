import { priceQuoteService } from '../../../../lib/priceQuoteService';
// import { priceCalculator } from '../../../../lib/priceCalculator'; // Not directly used if service handles calculations
import type { GraphQLContext } from '../helpers';
import type { PriceQuote as PriceQuoteType, AdditionalCost, InvoiceScheduleEntry } from '../../../../lib/pricingTypes'; // Using our TS types
import { dealService } from '../../../../lib/dealService'; 
import { getServiceLevelUserProfileData } from '../../../../lib/userProfileService';
import type { Deal } from '../../../../lib/generated/graphql'; // Assuming Deal type is available
import type { User } from '../../../../lib/generated/graphql'; // Assuming User type is available or define a suitable one
// TODO: Import DealService and UserService/UserProfileService types/functions when available for relational resolvers
// Example: import { dealService } from '../../../../lib/dealService'; 
// Example: import { userProfileService } from '../../../../lib/userProfileService';

export const Query = {
  priceQuote: async (_parent: any, args: { id: string }, context: GraphQLContext): Promise<PriceQuoteType | null> => {
    if (!context.currentUser || !context.token) throw new Error("Unauthorized");
    try {
      return await priceQuoteService.getPriceQuoteById(args.id, context.currentUser.id, context.token);
    } catch (error: any) { 
      console.error(`Error fetching priceQuote by ID ${args.id}:`, error);
      throw new Error(`Failed to fetch price quote: ${error.message}`);
    }
  },
  priceQuotesForDeal: async (_parent: any, args: { dealId: string }, context: GraphQLContext): Promise<PriceQuoteType[]> => {
    if (!context.currentUser || !context.token) throw new Error("Unauthorized");
    try {
      return await priceQuoteService.listPriceQuotesForDeal(args.dealId, context.currentUser.id, context.token);
    } catch (error: any) {
      console.error(`Error fetching priceQuotesForDeal ${args.dealId}:`, error);
      throw new Error(`Failed to fetch price quotes for deal: ${error.message}`);
    }
  },
};

// Field resolvers for the PriceQuote type
export const PriceQuoteResolver = { 
  deal: async (parent: PriceQuoteType, _args: any, context: GraphQLContext): Promise<Deal | null> => {
    if (!context.currentUser || !context.token) throw new Error("Unauthorized");
    if (!parent.deal_id) return null;
    try {
      // Assuming dealService.getDealById expects userId first, then dealId, then token
      return await dealService.getDealById(context.currentUser.id, parent.deal_id, context.token);
    } catch (error: any) {
      console.error(`Error resolving deal ${parent.deal_id} for quote ${parent.id}:`, error.message);
      // Decide if to throw, or return null to allow partial responses
      return null; 
    }
  },
  user: async (parent: PriceQuoteType, _args: any, context: GraphQLContext): Promise<User | null> => {
    // Note: context.currentUser might already have some user info. 
    // However, parent.user_id refers to the quote owner, which might not always be the currentUser making the request (e.g. admin access)
    if (!parent.user_id) return null;
    // getServiceLevelUserProfileData does not require a token as it uses the service client
    // Ensure it's safe to call without further auth checks if context.currentUser might differ from parent.user_id
    // For now, assume direct call is okay if parent.user_id is present.
    try {
      const userProfile = await getServiceLevelUserProfileData(parent.user_id);
      if (!userProfile) return null;
      
      // Adapt userProfile to the GraphQL User type
      // The User type in generated/graphql might have id, email, name, avatarUrl fields.
      // ServiceLevelUserProfile has user_id, email, display_name, avatar_url.
      return {
        id: userProfile.user_id, // Map user_id to id
        email: userProfile.email,
        name: userProfile.display_name, // Map display_name to name
        avatarUrl: userProfile.avatar_url, // Map avatar_url to avatarUrl
        // Add any other fields required by the GraphQL User type, possibly with null/default values
      } as User; // Cast to User, ensure all required fields of User are populated
    } catch (error: any) {
      console.error(`Error resolving user ${parent.user_id} for quote ${parent.id}:`, error.message);
      return null;
    }
  },
  
  // additional_costs and invoice_schedule_entries are assumed to be populated by the service methods 
  // (e.g., getPriceQuoteById, listPriceQuotesForDeal) directly onto the parent PriceQuote object.
  // If they were separate service calls, resolvers would look like this:
  /*
  additional_costs: async (parent: PriceQuoteType, _args: any, context: GraphQLContext): Promise<AdditionalCost[]> => {
    if (!context.currentUser || !context.token) throw new Error("Unauthorized");
    // Example: return await priceQuoteService.getAdditionalCostsForQuote(parent.id, context.currentUser.id, context.token);
    // For now, assume parent.additional_costs is populated by the primary service call that resolved the PriceQuote.
    if (parent.additional_costs) return parent.additional_costs;
    throw new Error ('Additional costs resolver not fully implemented or data not pre-fetched.');
  },
  invoice_schedule_entries: async (parent: PriceQuoteType, _args: any, context: GraphQLContext): Promise<InvoiceScheduleEntry[]> => {
    if (!context.currentUser || !context.token) throw new Error("Unauthorized");
    // Example: return await priceQuoteService.getInvoiceScheduleEntriesForQuote(parent.id, context.currentUser.id, context.token);
    if (parent.invoice_schedule_entries) return parent.invoice_schedule_entries;
    throw new Error ('Invoice schedule entries resolver not fully implemented or data not pre-fetched.');
  },
  */

  // Calculated fields are expected to be on the parent object, either from DB or calculated by priceQuoteService.
  // If a calculated field needed specific logic only possible at GraphQL resolver time (rare), it would go here.
  // Example: 
  // calculated_total_direct_cost: (parent: PriceQuoteType) => { 
  //   if (parent.calculated_total_direct_cost != null) return parent.calculated_total_direct_cost;
  //   // Fallback calculation if needed, though service should handle this.
  //   const mp = parent.base_minimum_price_mp || 0;
  //   const acItems = parent.additional_costs?.map(ac => ({ amount: ac.amount })) || [];
  //   return priceCalculator.calculateTotalDirectCost(mp, acItems);
  // },
};

// Resolvers for other types like AdditionalCost, MarkupFactor, InvoiceScheduleEntry if they have complex fields.
// Often, these are simple and don't need explicit field resolvers if data maps directly. 