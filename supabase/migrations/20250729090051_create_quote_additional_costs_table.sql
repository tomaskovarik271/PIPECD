CREATE TABLE IF NOT EXISTS quote_additional_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_quote_id UUID NOT NULL REFERENCES price_quotes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE quote_additional_costs ENABLE ROW LEVEL SECURITY;

-- Inherit RLS from parent price_quotes: Users who can access a price_quote can manage its additional costs.
-- This is a common pattern. More specific checks can be added if needed.

CREATE POLICY "Users can manage additional costs for quotes they have access to" 
ON quote_additional_costs FOR ALL
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM price_quotes pq
    WHERE pq.id = price_quote_id
    -- This relies on RLS of price_quotes table to filter pq appropriately for the current user.
    -- For INSERT/UPDATE, the SELECT permission on price_quotes is implicitly checked.
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM price_quotes pq
    WHERE pq.id = price_quote_id
    -- Ensure the user has update permission on the parent quote for creating/modifying additional costs
    -- This check might be more restrictive depending on how granular you want the WITH CHECK to be for INSERT/UPDATE
    -- For now, we assume if they can view it and it's their quote (or they have deal access for it),
    -- they can manage its sub-items. The `price_quotes` RLS for UPDATE should cover this more directly.
  )
);

-- Trigger to update 'updated_at' timestamp
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON quote_additional_costs 
  FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at(); 