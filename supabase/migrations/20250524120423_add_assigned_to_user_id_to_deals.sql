-- Add assigned_to_user_id column to public.deals table
ALTER TABLE public.deals
ADD COLUMN assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for assigned_to_user_id on public.deals table
CREATE INDEX idx_deals_assigned_to_user_id ON public.deals(assigned_to_user_id);

-- Add comments to the new column and index
COMMENT ON COLUMN public.deals.assigned_to_user_id IS 'Foreign key referencing the user this deal is assigned to.';
COMMENT ON INDEX public.idx_deals_assigned_to_user_id IS 'Index to improve query performance on the assigned_to_user_id column.';
