import { create } from 'zustand';
import { gqlClient } from '../lib/graphqlClient';
// Import generated GraphQL types as they become available, e.g.:
// import type { PriceQuote, PriceQuoteCreateInput, PriceQuoteUpdateInput, PriceQuoteCalculatedOutputs } from '../generated/graphql/graphql';

// Example types - replace with generated GraphQL types
interface PriceQuoteEntity { id: string; name: string; [key: string]: any; }
interface PriceQuoteCreateInputData { name?: string | null; [key: string]: any; }
interface PriceQuoteUpdateInputData { name?: string | null; [key: string]: any; }
interface PriceQuoteCalculatedOutputData { calculated_total_direct_cost?: number | null; [key: string]: any; }

interface GQLAdditionalCost {
  id: string;
  description: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

interface GQLInvoiceScheduleEntry {
  id: string;
  entry_type: string;
  due_date: string;
  amount_due: number;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceQuoteGQL {
  id: string;
  deal_id: string;
  user_id: string;
  version_number: number;
  name?: string | null;
  status: string;
  base_minimum_price_mp?: number | null;
  target_markup_percentage?: number | null;
  final_offer_price_fop?: number | null;
  overall_discount_percentage?: number | null;
  upfront_payment_percentage?: number | null;
  upfront_payment_due_days?: number | null;
  subsequent_installments_count?: number | null;
  subsequent_installments_interval_days?: number | null;
  created_at: string;
  updated_at: string;
  calculated_total_direct_cost?: number | null;
  calculated_target_price_tp?: number | null;
  calculated_full_target_price_ftp?: number | null;
  calculated_discounted_offer_price?: number | null;
  calculated_effective_markup_fop_over_mp?: number | null;
  escalation_status?: string | null;
  escalation_details?: Record<string, any> | null;
  additional_costs: GQLAdditionalCost[];
  invoice_schedule_entries: GQLInvoiceScheduleEntry[];
  // deal and user objects are not included here as they are resolved fields, 
  // but their IDs (deal_id, user_id) are present.
}

export interface AdditionalCostInputData {
    description: string;
    amount: number;
}

export interface PriceQuoteInputData { // Used for create/update and preview
  name?: string | null;
  status?: string | null;
  base_minimum_price_mp?: number | null;
  target_markup_percentage?: number | null;
  final_offer_price_fop?: number | null;
  overall_discount_percentage?: number | null;
  upfront_payment_percentage?: number | null;
  upfront_payment_due_days?: number | null;
  subsequent_installments_count?: number | null;
  subsequent_installments_interval_days?: number | null;
  additional_costs?: AdditionalCostInputData[];
}

// --- GraphQL Operations --- (Embed for now, ideally from .gql files or codegen)

const FRAGMENT_PRICE_QUOTE_FIELDS = `
  fragment PriceQuoteFields on PriceQuote {
    id
    deal_id
    user_id
    version_number
    name
    status
    base_minimum_price_mp
    target_markup_percentage
    final_offer_price_fop
    overall_discount_percentage
    upfront_payment_percentage
    upfront_payment_due_days
    subsequent_installments_count
    subsequent_installments_interval_days
    created_at
    updated_at
    calculated_total_direct_cost
    calculated_target_price_tp
    calculated_full_target_price_ftp
    calculated_discounted_offer_price
    calculated_effective_markup_fop_over_mp
    escalation_status
    escalation_details
    additional_costs {
      id
      description
      amount
      created_at
      updated_at
    }
    invoice_schedule_entries {
      id
      entry_type
      due_date
      amount_due
      description
      created_at
      updated_at
    }
  }
`;

const FETCH_PRICE_QUOTES_FOR_DEAL = `
  ${FRAGMENT_PRICE_QUOTE_FIELDS}
  query PriceQuotesForDeal($dealId: ID!) {
    priceQuotesForDeal(dealId: $dealId) {
      ...PriceQuoteFields
    }
  }
`;

const FETCH_PRICE_QUOTE_BY_ID = `
  ${FRAGMENT_PRICE_QUOTE_FIELDS}
  query PriceQuoteById($id: ID!) {
    priceQuote(id: $id) {
      ...PriceQuoteFields
    }
  }
`;

const CREATE_PRICE_QUOTE = `
  ${FRAGMENT_PRICE_QUOTE_FIELDS}
  mutation CreatePriceQuote($dealId: ID!, $input: PriceQuoteCreateInput!) {
    createPriceQuote(dealId: $dealId, input: $input) {
      ...PriceQuoteFields
    }
  }
`;

const UPDATE_PRICE_QUOTE = `
  ${FRAGMENT_PRICE_QUOTE_FIELDS}
  mutation UpdatePriceQuote($id: ID!, $input: PriceQuoteUpdateInput!) {
    updatePriceQuote(id: $id, input: $input) {
      ...PriceQuoteFields
    }
  }
`;

const DELETE_PRICE_QUOTE = `
  mutation DeletePriceQuote($id: ID!) {
    deletePriceQuote(id: $id)
  }
`;

const CALCULATE_PRICE_QUOTE_PREVIEW = `
  ${FRAGMENT_PRICE_QUOTE_FIELDS}
  mutation CalculatePriceQuotePreview($dealId: ID, $input: PriceQuoteUpdateInput!) {
    calculatePriceQuotePreview(dealId: $dealId, input: $input) {
      ...PriceQuoteFields
    }
  }
`;

// --- Zustand Store Definition ---

export interface PriceQuoteState {
  currentQuoteInputs: PriceQuoteInputData; // Form data for create/update
  currentQuotePreview: PriceQuoteGQL | null; // Result of calculation or full quote preview
  quotesForDealList: PriceQuoteGQL[];
  selectedQuoteId: string | null; // ID of the quote being edited/viewed in detail
  
  isLoadingList: boolean;
  isLoadingDetails: boolean; // For fetching a single quote or preview
  isSubmitting: boolean; // For create/update/delete operations
  
  errorList: string | null;
  errorDetails: string | null;
  errorSubmitting: string | null;

  fetchPriceQuotesForDeal: (dealId: string) => Promise<void>;
  fetchPriceQuoteById: (quoteId: string) => Promise<void>; 
  createPriceQuote: (dealId: string, data: PriceQuoteInputData) => Promise<PriceQuoteGQL | null>;
  updatePriceQuote: (quoteId: string, data: PriceQuoteInputData) => Promise<PriceQuoteGQL | null>;
  deletePriceQuote: (quoteId: string, dealIdToRefresh?: string) => Promise<boolean>;
  
  updateCurrentQuoteInputValue: (field: keyof PriceQuoteInputData, value: any) => void;
  getQuotePreview: (inputs: PriceQuoteInputData, dealId?: string | null) => Promise<void>;
  
  selectQuoteToEdit: (quoteId: string | null) => void; 
  resetCurrentQuoteForm: (initialInputs?: Partial<PriceQuoteInputData>) => void;
}

export const usePriceQuoteStore = create<PriceQuoteState>((set, get) => ({
  currentQuoteInputs: {},
  currentQuotePreview: null,
  quotesForDealList: [],
  selectedQuoteId: null,
  isLoadingList: false,
  isLoadingDetails: false,
  isSubmitting: false,
  errorList: null,
  errorDetails: null,
  errorSubmitting: null,

  fetchPriceQuotesForDeal: async (dealId) => {
    set({ isLoadingList: true, errorList: null });
    try {
      const response = await gqlClient.request<{ priceQuotesForDeal: PriceQuoteGQL[] }>(FETCH_PRICE_QUOTES_FOR_DEAL, { dealId });
      set({ quotesForDealList: response.priceQuotesForDeal, isLoadingList: false });
    } catch (error: any) {
      console.error('fetchPriceQuotesForDeal error:', error);
      set({ errorList: error.message || 'Failed to fetch quotes for deal', isLoadingList: false });
    }
  },

  fetchPriceQuoteById: async (quoteId) => {
    set({ isLoadingDetails: true, errorDetails: null, selectedQuoteId: quoteId });
    try {
      const response = await gqlClient.request<{ priceQuote: PriceQuoteGQL }>(FETCH_PRICE_QUOTE_BY_ID, { id: quoteId });
      const quote = response.priceQuote;

      // Construct a clean input object for the form from the fetched quote
      const formInputs: PriceQuoteInputData = {
        name: quote.name,
        status: quote.status,
        base_minimum_price_mp: quote.base_minimum_price_mp,
        target_markup_percentage: quote.target_markup_percentage,
        final_offer_price_fop: quote.final_offer_price_fop,
        overall_discount_percentage: quote.overall_discount_percentage,
        upfront_payment_percentage: quote.upfront_payment_percentage,
        upfront_payment_due_days: quote.upfront_payment_due_days,
        subsequent_installments_count: quote.subsequent_installments_count,
        subsequent_installments_interval_days: quote.subsequent_installments_interval_days,
        additional_costs: quote.additional_costs ? quote.additional_costs.map(ac => ({ description: ac.description, amount: ac.amount })) : [],
      };

      set({ 
        currentQuoteInputs: formInputs, // Populate form with *only* editable fields
        currentQuotePreview: quote,    // Set preview to the full fetched quote
        isLoadingDetails: false 
      });
    } catch (error: any) {
      console.error('fetchPriceQuoteById error:', error);
      set({ errorDetails: error.message || 'Failed to fetch quote details', isLoadingDetails: false });
    }
  },

  createPriceQuote: async (dealId, data) => {
    set({ isSubmitting: true, errorSubmitting: null });
    try {
      const response = await gqlClient.request<{ createPriceQuote: PriceQuoteGQL }>(CREATE_PRICE_QUOTE, { dealId, input: data });
      set({ isSubmitting: false });
      get().fetchPriceQuotesForDeal(dealId); // Refresh list
      // Optionally, reset form or select the new quote for editing
      get().resetCurrentQuoteForm();
      return response.createPriceQuote;
    } catch (error: any) {
      console.error('createPriceQuote error:', error);
      set({ errorSubmitting: error.message || 'Failed to create quote', isSubmitting: false });
      return null;
    }
  },

  updatePriceQuote: async (quoteId, data) => {
    set({ isSubmitting: true, errorSubmitting: null });
    try {
      // Sanitize the input to match PriceQuoteUpdateInput and AdditionalCostInput
      const sanitizedInput: PriceQuoteInputData = {
        name: data.name,
        status: data.status,
        base_minimum_price_mp: data.base_minimum_price_mp,
        target_markup_percentage: data.target_markup_percentage,
        final_offer_price_fop: data.final_offer_price_fop,
        overall_discount_percentage: data.overall_discount_percentage,
        upfront_payment_percentage: data.upfront_payment_percentage,
        upfront_payment_due_days: data.upfront_payment_due_days,
        subsequent_installments_count: data.subsequent_installments_count,
        subsequent_installments_interval_days: data.subsequent_installments_interval_days,
        // Ensure additional_costs only contain description and amount
        additional_costs: data.additional_costs?.map(ac => ({
          description: ac.description,
          amount: ac.amount,
          // Do NOT include id, created_at, updated_at from existing ac object
        })) || undefined, // Send undefined if no additional costs, matching schema expectations
      };

      // Remove keys with undefined values, as GraphQL might not like explicit nulls if undefined is expected
      // Or, ensure your backend/Zod handles nulls appropriately if you prefer sending them.
      // For now, let's filter out undefined top-level keys.
      const cleanInput = Object.fromEntries(
        Object.entries(sanitizedInput).filter(([_, v]) => v !== undefined)
      );
      if (sanitizedInput.additional_costs === undefined) {
        delete cleanInput.additional_costs; // Ensure it's not sent if undefined
      }


      const response = await gqlClient.request<{ updatePriceQuote: PriceQuoteGQL }>(UPDATE_PRICE_QUOTE, { 
        id: quoteId, 
        input: cleanInput // Use the sanitized and cleaned input
      });
      
      const updatedQuote = response.updatePriceQuote;
      set(state => ({
        quotesForDealList: state.quotesForDealList.map(q => q.id === quoteId ? updatedQuote : q),
        // If the updated quote is the one currently in form, update preview/inputs too
        currentQuotePreview: state.selectedQuoteId === quoteId ? updatedQuote : state.currentQuotePreview,
        currentQuoteInputs: state.selectedQuoteId === quoteId ? {
          name: updatedQuote.name,
          status: updatedQuote.status,
          base_minimum_price_mp: updatedQuote.base_minimum_price_mp,
          target_markup_percentage: updatedQuote.target_markup_percentage,
          final_offer_price_fop: updatedQuote.final_offer_price_fop,
          overall_discount_percentage: updatedQuote.overall_discount_percentage,
          upfront_payment_percentage: updatedQuote.upfront_payment_percentage,
          upfront_payment_due_days: updatedQuote.upfront_payment_due_days,
          subsequent_installments_count: updatedQuote.subsequent_installments_count,
          subsequent_installments_interval_days: updatedQuote.subsequent_installments_interval_days,
          additional_costs: updatedQuote.additional_costs?.map(ac => ({ description: ac.description, amount: ac.amount })),
        } : state.currentQuoteInputs,
        isSubmitting: false
      }));
      return updatedQuote;
    } catch (error: any) {
      console.error('updatePriceQuote error:', error);
      set({ errorSubmitting: error.message || 'Failed to update quote', isSubmitting: false });
      return null;
    }
  },

  deletePriceQuote: async (quoteId, dealIdToRefresh) => {
    set({ isSubmitting: true, errorSubmitting: null });
    try {
      await gqlClient.request<{ deletePriceQuote: boolean }>(DELETE_PRICE_QUOTE, { id: quoteId });
      set({ isSubmitting: false });
      if (get().selectedQuoteId === quoteId) { // If deleted quote was selected
        get().resetCurrentQuoteForm();
      }
      if (dealIdToRefresh) { // Refresh list if dealId is known
         get().fetchPriceQuotesForDeal(dealIdToRefresh);
      } else {
        // Fallback: remove from list locally if dealIdToRefresh is not provided (less ideal)
        set(state => ({ 
            quotesForDealList: state.quotesForDealList.filter(q => q.id !== quoteId)
        }));
      }
      return true;
    } catch (error: any) {
      console.error('deletePriceQuote error:', error);
      set({ errorSubmitting: error.message || 'Failed to delete quote', isSubmitting: false });
      return false;
    }
  },

  updateCurrentQuoteInputValue: (field, value) => {
    set(state => ({
      currentQuoteInputs: { ...state.currentQuoteInputs, [field]: value },
      currentQuotePreview: null, // Invalidate preview when inputs change directly
    }));
    // Consider if getQuotePreview should be called automatically here, perhaps debounced.
  },

  getQuotePreview: async (inputs, dealId) => {
    set({ isLoadingDetails: true, errorDetails: null });
    try {
      const state = get();
      const sourceInputs: PriceQuoteInputData | PriceQuoteGQL = inputs || state.currentQuoteInputs;

      // Construct a new object with only the fields allowed in PriceQuoteUpdateInput
      const validPayload: PriceQuoteInputData = {
        name: sourceInputs.name,
        status: sourceInputs.status,
        base_minimum_price_mp: sourceInputs.base_minimum_price_mp,
        target_markup_percentage: sourceInputs.target_markup_percentage,
        final_offer_price_fop: sourceInputs.final_offer_price_fop,
        overall_discount_percentage: sourceInputs.overall_discount_percentage,
        upfront_payment_percentage: sourceInputs.upfront_payment_percentage,
        upfront_payment_due_days: sourceInputs.upfront_payment_due_days,
        subsequent_installments_count: sourceInputs.subsequent_installments_count,
        subsequent_installments_interval_days: sourceInputs.subsequent_installments_interval_days,
        // Ensure additional_costs are correctly formatted if present
        additional_costs: sourceInputs.additional_costs ? sourceInputs.additional_costs.map(ac => ({ description: ac.description, amount: ac.amount })) : undefined,
      };
      
      const currentDealId = dealId || state.currentQuotePreview?.deal_id;

      const response = await gqlClient.request<{ calculatePriceQuotePreview: PriceQuoteGQL }>(CALCULATE_PRICE_QUOTE_PREVIEW, { 
        dealId: currentDealId,
        input: validPayload 
      });
      set({ currentQuotePreview: response.calculatePriceQuotePreview, isLoadingDetails: false });
    } catch (error: any) {
      console.error('getQuotePreview error:', error);
      const gqlError = error.response?.errors?.[0]?.message || error.message || 'Failed to calculate preview';
      set({ errorDetails: gqlError, isLoadingDetails: false });
    }
  },
  
  selectQuoteToEdit: (quoteId) => {
    if (quoteId) {
      const quoteToEdit = get().quotesForDealList.find(q => q.id === quoteId);
      if (quoteToEdit) {
        set({
          currentQuoteInputs: quoteToEdit, 
          currentQuotePreview: quoteToEdit, 
          selectedQuoteId: quoteId,
          errorDetails: null,
        });
      } else {
        // Quote not in list, fetch it (or handle error)
        get().fetchPriceQuoteById(quoteId);
      }
    } else {
      get().resetCurrentQuoteForm();
    }
  },

  resetCurrentQuoteForm: (initialInputs = {}) => {
    set({
      currentQuoteInputs: initialInputs,
      currentQuotePreview: null,
      selectedQuoteId: null,
      errorDetails: null,
      errorSubmitting: null,
    });
  },
})); 