CREATE TABLE IF NOT EXISTS price_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES deals(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    version_number INT NOT NULL DEFAULT 1,
    name TEXT,
    status TEXT NOT NULL DEFAULT 'draft', -- e.g., 'draft', 'proposed', 'archived'
    base_minimum_price_mp DECIMAL,
    target_markup_percentage DECIMAL,
    final_offer_price_fop DECIMAL,
    overall_discount_percentage DECIMAL DEFAULT 0,
    upfront_payment_percentage DECIMAL,
    upfront_payment_due_days INT,
    subsequent_installments_count INT,
    subsequent_installments_interval_days INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Calculated Output Fields (for snapshotting/denormalization)
    calculated_total_direct_cost DECIMAL,
    calculated_target_price_tp DECIMAL,
    calculated_full_target_price_ftp DECIMAL,
    calculated_discounted_offer_price DECIMAL,
    calculated_effective_markup_fop_over_mp DECIMAL,
    escalation_status TEXT, -- e.g., 'ok', 'requires_committee_approval', 'requires_ceo_approval'
    escalation_details JSONB
);

COMMENT ON COLUMN price_quotes.status IS 'e.g., draft, proposed, archived';
COMMENT ON COLUMN price_quotes.escalation_status IS 'e.g., ok, requires_committee_approval, requires_ceo_approval';

-- RLS Policies (initial setup, can be refined)
ALTER TABLE price_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own price quotes" 
ON price_quotes FOR INSERT 
TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own price quotes or quotes for deals they can access" 
ON price_quotes FOR SELECT 
TO authenticated USING (
  auth.uid() = user_id 
  -- Add deal access check here if/when a deal access policy/function exists
  -- OR EXISTS (SELECT 1 FROM deals d WHERE d.id = deal_id AND editor_is_authorized_for_deal(d.id, auth.uid())) -- Placeholder for deal access check
);

CREATE POLICY "Users can update their own price quotes" 
ON price_quotes FOR UPDATE 
TO authenticated USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price quotes" 
ON price_quotes FOR DELETE 
TO authenticated USING (auth.uid() = user_id);

-- TODO: Add policy for Admins to manage all quotes

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at() 
RETURNS TRIGGER LANGUAGE plpgsql AS 
$$ 
  BEGIN 
    NEW.updated_at = NOW(); 
    RETURN NEW; 
  END; 
$$;

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON price_quotes 
  FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at(); 