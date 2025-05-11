ALTER TABLE public.deals
ADD COLUMN deal_specific_probability REAL CHECK (deal_specific_probability IS NULL OR (deal_specific_probability >= 0.0 AND deal_specific_probability <= 1.0));

COMMENT ON COLUMN public.deals.deal_specific_probability IS 'Deal-specific probability (0.0 to 1.0), overrides stage probability if set.';
