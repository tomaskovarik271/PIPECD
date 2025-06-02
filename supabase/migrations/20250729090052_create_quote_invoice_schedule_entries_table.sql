CREATE TABLE IF NOT EXISTS quote_invoice_schedule_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_quote_id UUID NOT NULL REFERENCES price_quotes(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL, -- e.g., 'upfront', 'installment_1', 'milestone_fee'
    due_date DATE NOT NULL,
    amount_due DECIMAL NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN quote_invoice_schedule_entries.entry_type IS 'e.g., upfront, installment_1, milestone_fee';

-- RLS Policies
ALTER TABLE quote_invoice_schedule_entries ENABLE ROW LEVEL SECURITY;

-- Similar to quote_additional_costs, RLS is inherited from price_quotes.
CREATE POLICY "Users can manage invoice entries for quotes they have access to" 
ON quote_invoice_schedule_entries FOR ALL
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM price_quotes pq
    WHERE pq.id = price_quote_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM price_quotes pq
    WHERE pq.id = price_quote_id
  )
);

-- Trigger to update 'updated_at' timestamp
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON quote_invoice_schedule_entries 
  FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at(); 