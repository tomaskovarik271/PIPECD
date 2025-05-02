-- Rename the 'value' column to 'amount' in the 'deals' table
ALTER TABLE public.deals
RENAME COLUMN value TO amount;
