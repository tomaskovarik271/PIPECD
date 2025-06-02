// lib/pricingTypes.ts

// Corresponds to the 'price_quotes' table and GraphQL PriceQuote type
export interface PriceQuote {
  id: string; // UUID
  deal_id: string; // UUID
  user_id: string; // UUID
  version_number: number;
  name?: string | null;
  status: string; // e.g., 'draft', 'proposed', 'archived'
  base_minimum_price_mp?: number | null;
  target_markup_percentage?: number | null;
  final_offer_price_fop?: number | null;
  overall_discount_percentage?: number | null;
  upfront_payment_percentage?: number | null;
  upfront_payment_due_days?: number | null;
  subsequent_installments_count?: number | null;
  subsequent_installments_interval_days?: number | null;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ

  // Calculated Output Fields
  calculated_total_direct_cost?: number | null;
  calculated_target_price_tp?: number | null;
  calculated_full_target_price_ftp?: number | null;
  calculated_discounted_offer_price?: number | null;
  calculated_effective_markup_fop_over_mp?: number | null;
  escalation_status?: string | null;
  escalation_details?: Record<string, any> | null; // JSONB

  // Relations (will be populated by service/resolver)
  additional_costs?: AdditionalCost[];
  invoice_schedule_entries?: InvoiceScheduleEntry[];
}

// Corresponds to the 'quote_additional_costs' table
export interface AdditionalCost {
  id: string; // UUID
  price_quote_id: string; // UUID
  description: string;
  amount: number;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

// Corresponds to the 'quote_invoice_schedule_entries' table
export interface InvoiceScheduleEntry {
  id: string; // UUID
  price_quote_id: string; // UUID
  entry_type: string; // e.g., 'upfront', 'installment_1', 'milestone_fee'
  due_date: string; // DATE
  amount_due: number;
  description?: string | null;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

// --- Input Types for Service Methods ---

export interface AdditionalCostInput { // For creating/updating additional costs
  description: string;
  amount: number;
}

export interface PriceQuoteCreateInput {
  name?: string | null;
  // status is typically handled by default or specific service logic, not direct input
  base_minimum_price_mp?: number | null;
  target_markup_percentage?: number | null;
  final_offer_price_fop?: number | null;
  overall_discount_percentage?: number | null;
  upfront_payment_percentage?: number | null;
  upfront_payment_due_days?: number | null;
  subsequent_installments_count?: number | null;
  subsequent_installments_interval_days?: number | null;
  additional_costs?: AdditionalCostInput[];
}

// PriceQuoteUpdateInput can be a partial of PriceQuoteCreateInput, 
// but also might need to handle existing sub-entity IDs for updates/deletes.
// For Stage 1, we'll keep it similar to Create for simplicity in the service layer.
export type PriceQuoteUpdateInput = Partial<PriceQuoteCreateInput> & {
  id: string; // Required for updates
  name?: string | null;
  status?: string | null;
  // Potentially add logic for updating/removing existing additional_costs or invoice_schedule_entries
};

// Data structure passed to calculation functions
export interface PriceQuoteInputData extends Omit<PriceQuote, 'id' | 'deal_id' | 'user_id' | 'created_at' | 'updated_at' | 'additional_costs' | 'invoice_schedule_entries'> {
  additional_costs_data?: { amount: number }[]; // Simplified for calculation functions
}

// Expected output from the main calculation snapshotting function
export interface PriceQuoteCalculatedOutputs {
  calculated_total_direct_cost: number;
  calculated_target_price_tp: number;
  calculated_full_target_price_ftp: number;
  calculated_discounted_offer_price: number;
  calculated_effective_markup_fop_over_mp: number;
  escalation_status: string;
  escalation_details: Record<string, any> | null;
}

export interface InvoiceScheduleEntryData { // For generating invoice schedules
  entry_type: string;
  due_date: string; // YYYY-MM-DD
  amount_due: number;
  description?: string | null;
} 